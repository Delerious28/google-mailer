import { useMemo, useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PaperClipIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import SurfaceCard from '../components/SurfaceCard';
import { apiPost, apiUpload } from '../api/client';

type BlockType = 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'signature';

type Block = {
  id: string;
  type: BlockType;
  locked?: boolean;
  props: Record<string, any>;
};

type Attachment = { filename: string; url: string; size: number };

const defaultBlocks: Block[] = [
  {
    id: crypto.randomUUID(),
    type: 'text',
    props: {
      text: '<p style="margin:0 0 8px 0; font-weight:600; color:#111827;">Hi {{first_name | default:"there"}},</p><p style="margin:0; color:#111827;">Thanks for being a subscriber. Here&#39;s a quick update from the team.</p>',
      size: 16,
      color: '#111827',
      align: 'left',
      padding: 18,
    },
  },
  {
    id: crypto.randomUUID(),
    type: 'button',
    props: { text: 'Open dashboard', url: 'https://example.com', style: 'primary', align: 'left', padding: 18 },
  },
  { id: crypto.randomUUID(), type: 'divider', props: { padding: 12 } },
  {
    id: crypto.randomUUID(),
    type: 'signature',
    locked: true,
    props: {
      text:
        "<p style='margin:0 0 6px 0;'>You are receiving this because you opted in to updates.</p><p style='margin:0;'>Unsubscribe: {{unsubscribe_url}}</p>",
      color: '#6B7280',
      padding: 16,
      align: 'left',
    },
  },
];

function SortableBlock({ block, onSelect, selected }: { block: Block; onSelect: () => void; selected: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={clsx(
        'rounded-lg border border-[#e5e7eb] bg-white text-[#111827] shadow-sm',
        selected ? 'ring-2 ring-[#6366f1]' : 'ring-0',
        isDragging && 'opacity-80'
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-2 text-xs font-medium text-[#6b7280]">
        <span className="capitalize">{block.type}</span>
        <span className="text-[10px] uppercase tracking-wide">Drag to reorder</span>
      </div>
      <div className="px-4 py-3 text-sm" dangerouslySetInnerHTML={{ __html: renderBlockPreview(block) }} />
    </div>
  );
}

const blockMenu: { label: string; type: BlockType; description: string }[] = [
  { label: 'Text', type: 'text', description: 'Paragraph or headline with personalization' },
  { label: 'Image', type: 'image', description: 'Upload and display an inline image' },
  { label: 'Button', type: 'button', description: 'High-contrast call-to-action' },
  { label: 'Divider', type: 'divider', description: 'Thin rule to separate sections' },
  { label: 'Spacer', type: 'spacer', description: 'Add breathing room' },
  { label: 'Signature', type: 'signature', description: 'Compliance footer with unsubscribe' },
];

const personalizationVars = ['{{first_name}}', '{{first_name | default:"there"}}', '{{email}}', '{{unsubscribe_url}}'];

function renderBlockPreview(block: Block) {
  switch (block.type) {
    case 'text':
      return block.props.text || '<p>Start typing...</p>';
    case 'image':
      return `<div style="text-align:${block.props.align || 'left'}"><img src="${block.props.src || ''}" alt="" style="max-width:100%; height:auto;" /></div>`;
    case 'button':
      return `<div style="text-align:${block.props.align || 'left'}"><button style="background:#111827; color:white; padding:10px 16px; border-radius:8px; border:none;">${block.props.text || 'Button'}</button></div>`;
    case 'divider':
      return '<div style="border-bottom:1px solid #e5e7eb;" />';
    case 'spacer':
      return `<div style="height:${block.props.height || 20}px;"></div>`;
    case 'signature':
      return block.props.text || 'Unsubscribe footer';
    default:
      return '';
  }
}

function BlockProperties({ block, onChange }: { block: Block; onChange: (props: Record<string, any>) => void }) {
  if (!block) return null;
  const update = (key: string, value: any) => onChange({ ...block.props, [key]: value });

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-[#e5e7eb]">Settings</p>
        <p className="text-xs text-[#9ca3af]">Adjust typography, padding, and alignment.</p>
      </div>
      {(block.type === 'text' || block.type === 'signature') && (
        <div className="space-y-3">
          <label className="text-xs text-[#9ca3af]">HTML content</label>
          <div
            className="min-h-[120px] rounded-lg border border-[#1f2937] bg-[#0b0f14] p-3 text-sm text-[#e5e7eb]"
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => update('text', (e.target as HTMLElement).innerHTML)}
            dangerouslySetInnerHTML={{ __html: block.props.text || '' }}
          />
          <div className="grid grid-cols-2 gap-3 text-xs text-[#9ca3af]">
            <label className="space-y-1">
              <span>Font size</span>
              <input
                type="number"
                className="w-full rounded-lg border border-[#1f2937] bg-[#111827] px-2 py-1 text-[#e5e7eb]"
                value={block.props.size || 16}
                onChange={(e) => update('size', Number(e.target.value))}
              />
            </label>
            <label className="space-y-1">
              <span>Text color</span>
              <input
                type="color"
                className="h-10 w-full rounded-lg border border-[#1f2937] bg-[#111827]"
                value={block.props.color || '#111827'}
                onChange={(e) => update('color', e.target.value)}
              />
            </label>
          </div>
        </div>
      )}
      {block.type === 'image' && (
        <div className="space-y-3">
          <label className="text-xs text-[#9ca3af]">Upload image</label>
          <input
            type="file"
            accept="image/*"
            className="w-full text-sm text-[#e5e7eb]"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const uploaded = await apiUpload('/templates/upload/image', file);
              update('src', uploaded.url);
            }}
          />
          <label className="text-xs text-[#9ca3af]">Alt text</label>
          <input
            className="w-full rounded-lg border border-[#1f2937] bg-[#111827] px-2 py-1 text-sm text-[#e5e7eb]"
            value={block.props.alt || ''}
            onChange={(e) => update('alt', e.target.value)}
          />
        </div>
      )}
      {block.type === 'button' && (
        <div className="space-y-3">
          <label className="text-xs text-[#9ca3af]">Label</label>
          <input
            className="w-full rounded-lg border border-[#1f2937] bg-[#111827] px-2 py-1 text-sm text-[#e5e7eb]"
            value={block.props.text}
            onChange={(e) => update('text', e.target.value)}
          />
          <label className="text-xs text-[#9ca3af]">URL</label>
          <input
            className="w-full rounded-lg border border-[#1f2937] bg-[#111827] px-2 py-1 text-sm text-[#e5e7eb]"
            value={block.props.url}
            onChange={(e) => update('url', e.target.value)}
          />
          <div className="grid grid-cols-3 gap-2 text-xs text-[#9ca3af]">
            {['primary', 'secondary', 'outline'].map((style) => (
              <button
                key={style}
                onClick={() => update('style', style)}
                className={clsx(
                  'rounded-lg border border-[#1f2937] px-2 py-1 text-sm capitalize',
                  block.props.style === style ? 'bg-[#111827] text-[#e5e7eb]' : 'bg-transparent text-[#9ca3af]'
                )}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      )}
      {(block.type === 'text' || block.type === 'button' || block.type === 'signature' || block.type === 'image') && (
        <div className="grid grid-cols-2 gap-3 text-xs text-[#9ca3af]">
          <label className="space-y-1">
            <span>Align</span>
            <select
              value={block.props.align || 'left'}
              onChange={(e) => update('align', e.target.value)}
              className="w-full rounded-lg border border-[#1f2937] bg-[#111827] px-2 py-1 text-sm text-[#e5e7eb]"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
          <label className="space-y-1">
            <span>Padding</span>
            <input
              type="number"
              className="w-full rounded-lg border border-[#1f2937] bg-[#111827] px-2 py-1 text-sm text-[#e5e7eb]"
              value={block.props.padding || 12}
              onChange={(e) => update('padding', Number(e.target.value))}
            />
          </label>
        </div>
      )}
      {block.type === 'image' && (
        <label className="space-y-1 text-xs text-[#9ca3af]">
          <span>Width (px)</span>
          <input
            type="number"
            className="w-full rounded-lg border border-[#1f2937] bg-[#111827] px-2 py-1 text-sm text-[#e5e7eb]"
            value={block.props.width || 560}
            onChange={(e) => update('width', Number(e.target.value))}
          />
        </label>
      )}
      {block.type === 'spacer' && (
        <label className="space-y-1 text-xs text-[#9ca3af]">
          <span>Height (px)</span>
          <input
            type="number"
            className="w-full rounded-lg border border-[#1f2937] bg-[#111827] px-2 py-1 text-sm text-[#e5e7eb]"
            value={block.props.height || 24}
            onChange={(e) => update('height', Number(e.target.value))}
          />
        </label>
      )}
    </div>
  );
}

export default function TemplatesPage() {
  const sensors = useSensors(useSensor(PointerSensor));
  const [name, setName] = useState('New template');
  const [blocks, setBlocks] = useState<Block[]>(defaultBlocks);
  const [selectedId, setSelectedId] = useState<string | null>(blocks[0].id);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'text'>('desktop');
  const [globalStyles, setGlobalStyles] = useState({ background: '#f7f7f7', font: 'Inter', padding: 24 });
  const selectedBlock = blocks.find((b) => b.id === selectedId) || null;

  const plainTextPreview = useMemo(() => {
    const texts = blocks
      .filter((b) => b.type === 'text' || b.type === 'signature')
      .map((b) => b.props.text?.replace(/<[^>]*>?/gm, '') || '');
    return texts.join('\n\n');
  }, [blocks]);

  const warnings = useMemo(() => {
    const msgs: string[] = [];
    const hasUnsub = blocks.some((b) => b.type === 'signature' && (b.props.text || '').includes('{{unsubscribe_url}}'));
    if (!hasUnsub) msgs.push('Unsubscribe footer with {{unsubscribe_url}} is required.');
    const hasText = blocks.some((b) => b.type === 'text');
    if (!hasText) msgs.push('Include at least one text block to avoid image-only emails.');
    const brokenLink = blocks.some((b) => b.type === 'button' && !(b.props.url || '').startsWith('http'));
    if (brokenLink) msgs.push('Buttons should use full URLs (https://).');
    return msgs;
  }, [blocks]);

  const addBlock = (type: BlockType) => {
    const id = crypto.randomUUID();
    const defaults: Record<BlockType, any> = {
      text: { text: '<p>New text</p>', size: 16, color: '#111827', align: 'left', padding: 16 },
      image: { src: '', alt: '', align: 'center', width: 520, padding: 16 },
      button: { text: 'Call to action', url: 'https://', style: 'primary', align: 'left', padding: 16 },
      divider: { padding: 12 },
      spacer: { height: 20, padding: 0 },
      signature: {
        text: "<p style='margin:0 0 6px 0;'>You are receiving this because you opted in to updates.</p><p style='margin:0;'>Unsubscribe: {{unsubscribe_url}}</p>",
        color: '#6B7280',
        align: 'left',
        padding: 16,
      },
    };
    setBlocks([...blocks, { id, type, props: defaults[type], locked: type === 'signature' }]);
    setSelectedId(id);
  };

  const removeBlock = (block: Block) => {
    if (block.locked) return;
    setBlocks(blocks.filter((b) => b.id !== block.id));
    setSelectedId(null);
  };

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    setBlocks(arrayMove(blocks, oldIndex, newIndex));
  };

  const saveTemplate = async () => {
    setSaving(true);
    try {
      const payload = { name, blocks, attachments, global: globalStyles };
      const res = await apiPost('/templates', payload);
      alert('Template saved. HTML ready.');
      return res;
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    const saveRes = await saveTemplate();
    if (!saveRes?.id) return;
    const to = prompt('Send test to:', 'me@example.com') || '';
    await apiPost(`/templates/${saveRes.id}/send-test`, { to });
    alert('Test email triggered');
  };

  const uploadAttachment = async (file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      alert('Attachment exceeds 25MB limit');
      return;
    }
    const uploaded = await apiUpload('/templates/upload/attachment', file);
    setAttachments([...attachments, uploaded]);
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3 space-y-4">
        <SurfaceCard title="Blocks" subtitle="Drag blocks into the canvas for a Gmail-safe layout.">
          <div className="space-y-3">
            {blockMenu.map((item) => (
              <button
                key={item.type}
                onClick={() => addBlock(item.type)}
                className="flex w-full items-start gap-3 rounded-lg border border-[#1f2937] bg-[#0f131c] px-3 py-3 text-left transition hover:border-[#6366f1]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#111827] text-sm font-semibold text-[#e5e7eb]">
                  {item.label[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#e5e7eb]">{item.label}</p>
                  <p className="text-xs text-[#9ca3af]">{item.description}</p>
                </div>
              </button>
            ))}
          </div>
        </SurfaceCard>
        <SurfaceCard title="Personalization" subtitle="Insert lead variables into text blocks.">
          <div className="flex flex-wrap gap-2">
            {personalizationVars.map((v) => (
              <button
                key={v}
                onClick={() => {
                  if (!selectedBlock || !['text', 'signature'].includes(selectedBlock.type)) return;
                  const updated = blocks.map((b) =>
                    b.id === selectedBlock.id ? { ...b, props: { ...b.props, text: `${b.props.text || ''} ${v}` } } : b
                  );
                  setBlocks(updated);
                }}
                className="rounded-full border border-[#1f2937] bg-[#0f131c] px-3 py-1 text-xs text-[#e5e7eb] hover:border-[#6366f1]"
              >
                {v}
              </button>
            ))}
          </div>
        </SurfaceCard>
        <SurfaceCard title="Attachments" subtitle="Attach documents to send with the template.">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#1f2937] bg-[#0f131c] px-3 py-2 text-sm text-[#e5e7eb] hover:border-[#6366f1]">
            <PaperClipIcon className="h-4 w-4" /> Upload attachment
            <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAttachment(e.target.files[0])} />
          </label>
          <div className="space-y-2 text-xs text-[#9ca3af]">
            {attachments.length === 0 && <p>No attachments added.</p>}
            {attachments.map((att) => (
              <div key={att.url} className="flex items-center justify-between rounded-md border border-[#1f2937] bg-[#0f131c] px-2 py-2 text-[#e5e7eb]">
                <span>{att.filename}</span>
                <span className="text-xs text-[#9ca3af]">{(att.size / 1024).toFixed(1)} KB</span>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>

      <div className="col-span-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[#9ca3af]">Template</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[#1f2937] bg-[#0f131c] px-3 py-2 text-lg font-semibold text-[#e5e7eb]"
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={clsx('rounded-lg px-3 py-2', previewMode === 'desktop' ? 'bg-[#111827] text-white' : 'text-[#9ca3af]')}
            >
              Desktop
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={clsx('rounded-lg px-3 py-2', previewMode === 'mobile' ? 'bg-[#111827] text-white' : 'text-[#9ca3af]')}
            >
              Mobile
            </button>
            <button
              onClick={() => setPreviewMode('text')}
              className={clsx('rounded-lg px-3 py-2', previewMode === 'text' ? 'bg-[#111827] text-white' : 'text-[#9ca3af]')}
            >
              Plain text
            </button>
          </div>
        </div>

        <SurfaceCard title="Canvas" subtitle="600px email-safe artboard with live editing.">
          <div className="flex justify-center bg-[#0b0f14] py-4">
            <div className="rounded-xl border border-[#1f2937] bg-white p-0" style={{ width: previewMode === 'mobile' ? 360 : 640 }}>
              {previewMode === 'text' ? (
                <pre className="whitespace-pre-wrap p-4 text-sm text-[#111827]">{plainTextPreview}</pre>
              ) : (
                <div className="p-4" style={{ width: 600 }}>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3">
                        {blocks.map((block) => (
                          <div key={block.id} className="group relative">
                            <SortableBlock block={block} onSelect={() => setSelectedId(block.id)} selected={selectedId === block.id} />
                            {!block.locked && (
                              <button
                                onClick={() => removeBlock(block)}
                                className="absolute -right-2 -top-2 hidden rounded-full bg-[#ef4444] px-2 py-1 text-xs text-white shadow-sm group-hover:block"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>
          </div>
        </SurfaceCard>
      </div>

      <div className="col-span-3 space-y-4">
        <SurfaceCard title="Properties" subtitle={selectedBlock ? 'Edit the selected block.' : 'Select a block to edit.'}>
          {selectedBlock ? <BlockProperties block={selectedBlock} onChange={(props) => setBlocks(blocks.map((b) => (b.id === selectedBlock.id ? { ...b, props } : b)))} /> : <p className="text-sm text-[#9ca3af]">Pick a block on the canvas.</p>}
        </SurfaceCard>
        <SurfaceCard title="Global" subtitle="Apply defaults across the template.">
          <div className="space-y-3 text-xs text-[#9ca3af]">
            <label className="space-y-1">
              <span>Background color</span>
              <input
                type="color"
                value={globalStyles.background}
                onChange={(e) => setGlobalStyles({ ...globalStyles, background: e.target.value })}
                className="h-10 w-full rounded-lg border border-[#1f2937] bg-[#111827]"
              />
            </label>
            <label className="space-y-1">
              <span>Font family</span>
              <input
                value={globalStyles.font}
                onChange={(e) => setGlobalStyles({ ...globalStyles, font: e.target.value })}
                className="w-full rounded-lg border border-[#1f2937] bg-[#111827] px-2 py-1 text-sm text-[#e5e7eb]"
              />
            </label>
            <label className="space-y-1">
              <span>Content padding</span>
              <input
                type="number"
                value={globalStyles.padding}
                onChange={(e) => setGlobalStyles({ ...globalStyles, padding: Number(e.target.value) })}
                className="w-full rounded-lg border border-[#1f2937] bg-[#111827] px-2 py-1 text-sm text-[#e5e7eb]"
              />
            </label>
          </div>
        </SurfaceCard>
        <SurfaceCard title="Quality checks" subtitle="Must-pass compliance checks before sending.">
          <ul className="space-y-2 text-sm">
            {warnings.length === 0 && <li className="text-[#22c55e]">All checks passed</li>}
            {warnings.map((w) => (
              <li key={w} className="text-[#f59e0b]">{w}</li>
            ))}
          </ul>
        </SurfaceCard>
        <div className="flex gap-2">
          <button
            onClick={saveTemplate}
            disabled={saving}
            className="flex-1 rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4f52d9] disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save template'}
          </button>
          <button
            onClick={sendTest}
            className="rounded-lg border border-[#1f2937] bg-[#0f131c] px-4 py-2 text-sm font-semibold text-[#e5e7eb] hover:border-[#6366f1]"
          >
            Send test
          </button>
        </div>
      </div>
    </div>
  );
}
