import { useEffect, useState } from 'react';
import { ShieldCheckIcon, ArrowLongRightIcon, ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import GlassCard from '../components/GlassCard';
import { apiGet, apiPost } from '../api/client';

const steps = [
  { title: 'Connect Gmail', desc: 'Authorize with Google (offline access) to send via Gmail API.', accent: 'bg-indigo-50 text-indigo-800 border border-indigo-100' },
  { title: 'Import consented leads', desc: 'Upload CSV with consent=true for each recipient.', accent: 'bg-emerald-50 text-emerald-800 border border-emerald-100' },
  { title: 'Send with pacing & replies', desc: 'Mail 2 waits X days and only sends if no reply is found.', accent: 'bg-slate-100 text-slate-800 border border-slate-200' },
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
      <GlassCard
        title="Connect Gmail"
        subtitle="OAuth keeps credentials safe; tokens stay encrypted and refresh automatically."
        actions={
          email ? (
            <button
              onClick={disconnect}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Disconnect
            </button>
          ) : (
            <a
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              href={authUrl}
            >
              <ShieldCheckIcon className="h-4 w-4" />
              Connect with Google
            </a>
          )
        }
      >
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          {email ? (
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Linked account</p>
                <p className="text-lg font-semibold text-slate-900">{email}</p>
                <p className="text-sm text-slate-600">Gmail API ready · reply detection enabled</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-semibold">API</div>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-slate-700">
              <p className="leading-relaxed">
                Authenticate with Google to send via the official Gmail API. Tokens remain encrypted at rest and never logged.
              </p>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <ShieldCheckIcon className="h-4 w-4" /> Consent-only sends with audited logging
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">
          <InformationCircleIcon className="h-4 w-4" />
          We never send to leads without consent. Every message includes unsubscribe + provenance footer.
        </div>
      </GlassCard>

      <GlassCard title="Flow" subtitle="Clear, paced sending steps for permission-based outreach.">
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div key={step.title} className={`rounded-xl ${step.accent} px-4 py-3 flex items-start gap-3`}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-semibold text-slate-900 shadow-inner border border-slate-200">
                {idx + 1}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                <p className="text-xs text-slate-600">{step.desc}</p>
              </div>
              <ArrowLongRightIcon className="ml-auto h-5 w-5 text-slate-500" />
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
