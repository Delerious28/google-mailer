import json
import os
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import EmailTemplate, TemplateAttachment
from ..auth_google import current_user, load_credentials
from ..gmail_client import GmailClient

UPLOAD_ROOT = os.environ.get("UPLOAD_ROOT", "uploads")
IMAGE_DIR = os.path.join(UPLOAD_ROOT, "images")
ATTACH_DIR = os.path.join(UPLOAD_ROOT, "attachments")

os.makedirs(IMAGE_DIR, exist_ok=True)
os.makedirs(ATTACH_DIR, exist_ok=True)

router = APIRouter(prefix="/templates", tags=["templates"])


def _blocks_have_unsubscribe(blocks: List[dict]) -> bool:
    for block in blocks:
        if block.get("type") == "signature":
            content = json.dumps(block.get("props", {}))
            if "unsubscribe_url" in content:
                return True
        if block.get("type") == "text":
            content = json.dumps(block.get("props", {}))
            if "unsubscribe_url" in content:
                return True
    return False


def _render_block_html(block: dict) -> str:
    btype = block.get("type")
    props = block.get("props", {})
    padding = props.get("padding", 12)
    align = props.get("align", "left")
    if btype == "text":
        color = props.get("color", "#111827")
        size = props.get("size", 16)
        body = props.get("text", "")
        return f"""
        <tr>
          <td style="padding:{padding}px; text-align:{align}; color:{color}; font-size:{size}px; line-height:1.5; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            {body}
          </td>
        </tr>
        """
    if btype == "image":
        src = props.get("src", "")
        alt = props.get("alt", "")
        width = props.get("width", 560)
        return f"""
        <tr>
          <td style="padding:{padding}px; text-align:{align};">
            <img src="{src}" alt="{alt}" width="{width}" style="max-width:100%; height:auto; display:block; margin:0 auto;" />
          </td>
        </tr>
        """
    if btype == "button":
        label = props.get("text", "Action")
        url = props.get("url", "#")
        style = props.get("style", "primary")
        bg = "#6366F1" if style == "primary" else ("#111827" if style == "outline" else "#374151")
        color = "#ffffff" if style != "outline" else "#e5e7eb"
        border = "1px solid #6366F1" if style == "outline" else "none"
        return f"""
        <tr>
          <td style="padding:{padding}px; text-align:{align};">
            <a href="{url}" style="background:{bg}; color:{color}; text-decoration:none; padding:12px 20px; border-radius:8px; border:{border}; display:inline-block; font-weight:600; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              {label}
            </a>
          </td>
        </tr>
        """
    if btype == "divider":
        return f"""
        <tr>
          <td style="padding:{padding}px;">
            <div style="border-bottom:1px solid #e5e7eb; width:100%;"></div>
          </td>
        </tr>
        """
    if btype == "spacer":
        height = props.get("height", 24)
        return f"""
        <tr><td style="padding:{padding}px 0; height:{height}px;"></td></tr>
        """
    if btype == "signature":
        text = props.get("text", "You are receiving this email because you opted in. If you'd like to stop, click {{unsubscribe_url}}.")
        color = props.get("color", "#6B7280")
        return f"""
        <tr>
          <td style="padding:{padding}px; font-size:13px; color:{color}; text-align:{align}; line-height:1.6; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            {text}
          </td>
        </tr>
        """
    return ""


def _render_email(blocks: List[dict], global_styles: Optional[dict] = None) -> str:
    global_styles = global_styles or {}
    bg = global_styles.get("background", "#f7f8fa")
    font = global_styles.get("font", "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif")
    padding = global_styles.get("padding", 24)
    rendered_blocks = "".join(_render_block_html(b) for b in blocks)
    return f"""
    <html>
      <body style="margin:0; padding:0; background:{bg}; font-family:{font};">
        <table role='presentation' cellspacing='0' cellpadding='0' border='0' width='100%'>
          <tr>
            <td align='center' style="padding:{padding}px 0;">
              <table role='presentation' cellspacing='0' cellpadding='0' border='0' width='600' style="background:#ffffff; border:1px solid #e5e7eb; border-radius:12px;">
                {rendered_blocks}
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """


def _blocks_to_text(blocks: List[dict]) -> str:
    parts: List[str] = []
    for b in blocks:
        props = b.get("props", {})
        if b.get("type") in {"text", "signature"}:
            parts.append(props.get("text", ""))
        if b.get("type") == "button":
            parts.append(f"{props.get('text', 'Action')} -> {props.get('url', '#')}")
    return "\n\n".join([p for p in parts if p])


@router.get("")
def list_templates(db: Session = Depends(get_db)):
    templates = db.query(EmailTemplate).order_by(EmailTemplate.updated_at.desc()).all()
    return [
        {"id": t.id, "name": t.name, "updated_at": t.updated_at.isoformat()} for t in templates
    ]


@router.get("/{template_id}")
def get_template(template_id: int, db: Session = Depends(get_db)):
    template = db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return {
        "id": template.id,
        "name": template.name,
        "blocks": json.loads(template.blocks_json),
        "html": template.html_body,
        "text": template.text_body,
        "attachments": [
            {"id": a.id, "filename": a.filename, "url": a.url, "size": a.size}
            for a in template.attachments
        ],
    }


@router.post("")
def save_template(payload: dict, db: Session = Depends(get_db)):
    name = payload.get("name")
    blocks = payload.get("blocks") or []
    global_styles = payload.get("global", {})
    attachments_payload = payload.get("attachments", [])

    if not name:
        raise HTTPException(status_code=400, detail="Name is required")
    if not blocks:
        raise HTTPException(status_code=400, detail="At least one block is required")
    if not _blocks_have_unsubscribe(blocks):
        raise HTTPException(status_code=400, detail="Unsubscribe footer with {{unsubscribe_url}} is required")

    html = _render_email(blocks, global_styles)
    text_version = _blocks_to_text(blocks)

    template_id = payload.get("id")
    if template_id:
        template = db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        template.name = name
        template.blocks_json = json.dumps(blocks)
        template.html_body = html
        template.text_body = text_version
        template.attachments.clear()
    else:
        template = EmailTemplate(
            name=name,
            blocks_json=json.dumps(blocks),
            html_body=html,
            text_body=text_version,
        )
        db.add(template)
        db.flush()

    for att in attachments_payload:
        template.attachments.append(
            TemplateAttachment(
                filename=att.get("filename"),
                url=att.get("url"),
                size=att.get("size", 0),
            )
        )

    db.commit()
    db.refresh(template)
    return {"id": template.id, "html": html, "text": text_version}


@router.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1]
    safe_name = f"img-{uuid.uuid4().hex}{ext}"
    path = os.path.join(IMAGE_DIR, safe_name)
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (5MB max)")
    with open(path, "wb") as f:
        f.write(content)
    url = f"/uploads/images/{safe_name}"
    return {"url": url, "filename": file.filename, "size": len(content)}


@router.post("/upload/attachment")
async def upload_attachment(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1]
    safe_name = f"att-{uuid.uuid4().hex}{ext}"
    path = os.path.join(ATTACH_DIR, safe_name)
    content = await file.read()
    if len(content) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Attachment exceeds 25MB")
    with open(path, "wb") as f:
        f.write(content)
    url = f"/uploads/attachments/{safe_name}"
    return {"url": url, "filename": file.filename, "size": len(content)}


@router.post("/{template_id}/send-test")
def send_test_email(template_id: int, payload: dict, db: Session = Depends(get_db)):
    template = db.query(EmailTemplate).filter(EmailTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    user = current_user(db)
    if not user:
        raise HTTPException(status_code=400, detail="Connect Gmail first")
    creds = load_credentials(user)
    client = GmailClient(creds)
    to_email = payload.get("to") or user.email
    attach_payload = []
    for att in template.attachments:
        local_path = att.url.replace("/uploads/", "", 1)
        attach_payload.append(
            {
                "filename": att.filename,
                "path": os.path.join(UPLOAD_ROOT, local_path),
            }
        )
    client.send_message(
        sender=user.email,
        to=to_email,
        subject=f"Test: {template.name}",
        body_html=template.html_body,
        body_text=template.text_body,
        attachments=attach_payload,
    )
    return {"status": "sent", "to": to_email}
