import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, ArrowLongRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import GlassCard from '../components/GlassCard';
import { apiGet, apiPost } from '../api/client';

const steps = [
  { title: 'Connect Gmail', desc: 'OAuth with offline access to send + read replies.', color: 'from-cyan-400/40 to-indigo-500/40' },
  { title: 'Import consented leads', desc: 'Upload CSV with consent=true per lead.', color: 'from-emerald-400/40 to-cyan-400/40' },
  { title: 'Launch permission-based drips', desc: 'Mail 2 waits for replies, auto-skips when answered.', color: 'from-fuchsia-400/40 to-indigo-400/40' },
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
        subtitle="OAuth keeps credentials safe; tokens are encrypted at rest."
        actions={
          email ? (
            <button
              onClick={disconnect}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-900/40 transition hover:bg-red-500/80"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Disconnect
            </button>
          ) : (
            <a
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-xl shadow-indigo-900/40 transition hover:scale-[1.01]"
              href={authUrl}
            >
              <ShieldCheckIcon className="h-4 w-4" />
              Connect with Google
            </a>
          )
        }
      >
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
          {email ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">Linked account</p>
                <p className="text-lg font-semibold text-white">{email}</p>
                <p className="text-sm text-slate-300/80">Gmail API ready · reply detection enabled</p>
              </div>
              <motion.div
                className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-emerald-200/30 floating"
                animate={{ rotate: [0, 4, -2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          ) : (
            <div className="space-y-3 text-sm text-slate-300/80">
              <p className="leading-relaxed">
                Authenticate with Google to send via the official Gmail API. We never store raw tokens; they stay encrypted and
                refresh automatically.
              </p>
              <div className="flex items-center gap-2 text-emerald-300/80">
                <ShieldCheckIcon className="h-5 w-5" />
                <span>Consent-only sends with audited logging.</span>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard title="Flow" subtitle="Everything animates around compliance-first sending.">
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              whileHover={{ scale: 1.01, y: -2 }}
              className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-20`} />
              <div className="relative flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/60 border border-white/10 text-sm font-semibold">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="text-xs text-slate-300/80">{step.desc}</p>
                </div>
                <ArrowLongRightIcon className="ml-auto h-5 w-5 text-white/50" />
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
