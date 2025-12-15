import { useEffect, useState } from 'react';
import { ShieldCheckIcon, ArrowLongRightIcon, ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import SurfaceCard from '../components/SurfaceCard';
import { apiGet, apiPost } from '../api/client';

const steps = [
  { title: 'Connect Gmail', desc: 'OAuth with offline access to send via Gmail API and read replies.' },
  { title: 'Import consented leads', desc: 'Upload CSV with consent=true; unsubscribed contacts are suppressed.' },
  { title: 'Launch campaigns', desc: 'Follow-ups skip when replies are detected after Mail 1.' },
];

export default function ConnectPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string>('');

  useEffect(() => {
    apiGet('/auth/me').then((data) => setEmail(data.email || null));
    apiGet('/auth/url').then((data) => setAuthUrl(data.url));
  }, []);

  const disconnect = async () => {
    await apiPost('/auth/disconnect');
    setEmail(null);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SurfaceCard
        title="Connect Gmail"
        subtitle="Tokens stay encrypted at rest. Sending is strictly permission-based with unsubscribe enforcement."
        actions={
          email ? (
            <button
              onClick={disconnect}
              className="inline-flex items-center gap-2 rounded-lg border border-[#334155] bg-[#111827] px-4 py-2 text-sm font-semibold text-[#e5e7eb] transition hover:border-[#475569]"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Disconnect
            </button>
          ) : (
            <a
              className="inline-flex items-center gap-2 rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4f54d8]"
              href={authUrl}
            >
              <ShieldCheckIcon className="h-4 w-4" />
              Connect with Google
            </a>
          )
        }
      >
        <div className="rounded-xl border border-[#1f2937] bg-[#0b0f14] p-4">
          {email ? (
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9ca3af]">Connected account</p>
                <p className="text-lg font-semibold text-white">{email}</p>
                <p className="text-sm text-[#9ca3af]">Gmail API ready · reply detection enabled</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#161e2e] text-sm font-semibold text-[#e5e7eb] border border-[#1f2937]">
                API
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-[#9ca3af]">
              <p className="leading-relaxed text-[#e5e7eb]">
                Authenticate with Google to send via the official Gmail API. Tokens remain encrypted and refreshed automatically.
              </p>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1f2937] bg-[#161e2e] px-3 py-1 text-xs font-semibold text-[#22c55e]">
                <ShieldCheckIcon className="h-4 w-4" /> Consent-only sends with audited logging
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[#1f2937] bg-[#161e2e] px-3 py-2 text-xs font-semibold text-[#e5e7eb]">
          <InformationCircleIcon className="h-4 w-4 text-[#9ca3af]" />
          Every email includes unsubscribe + provenance footer. Leads without consent are skipped automatically.
        </div>
      </SurfaceCard>

      <SurfaceCard title="Flow" subtitle="Readability-first steps for responsible Gmail campaigns.">
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const active = idx === 0;
            return (
              <div
                key={step.title}
                className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                  active ? 'border-[#6366f1] bg-[#161e2e]' : 'border-[#1f2937] bg-[#111827]'
                }`}
              >
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#0b0f14] text-sm font-semibold text-white border border-[#1f2937]">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="text-sm text-[#9ca3af]">{step.desc}</p>
                </div>
                <ArrowLongRightIcon className="ml-auto h-5 w-5 text-[#6b7280]" />
              </div>
            );
          })}
        </div>
      </SurfaceCard>
    </div>
  );
}
