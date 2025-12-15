import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import GlassCard from '../components/GlassCard';
import { apiGet } from '../api/client';

type Log = {
  id: number;
  lead_id: number;
  campaign_id: number;
  step: string;
  status: string;
  sent_at?: string;
  scheduled_at?: string;
  error?: string;
};

const statusColor: Record<string, string> = {
  sent: 'bg-emerald-400/15 text-emerald-100 border border-emerald-300/30',
  queued: 'bg-indigo-400/15 text-indigo-100 border border-indigo-300/30',
  skipped_no_consent: 'bg-amber-300/15 text-amber-100 border border-amber-200/30',
  skipped_unsubscribed: 'bg-amber-300/15 text-amber-100 border border-amber-200/30',
  skipped_replied: 'bg-sky-400/15 text-sky-100 border border-sky-300/30',
  error: 'bg-red-500/20 text-red-100 border border-red-300/30',
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    apiGet('/logs').then(setLogs);
  }, []);

  return (
    <GlassCard
      title="Logs"
      subtitle="Complete trail of queued/sent/skipped/error events. Reply-aware and consent-aware."
      actions={<ClipboardDocumentCheckIcon className="h-5 w-5 text-emerald-300" />}
    >
      <div className="space-y-3">
        {logs.length === 0 && <p className="text-sm text-slate-300">No activity logged yet.</p>}
        <div className="space-y-2">
          {logs.map((log, idx) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="rounded-xl border border-white/10 bg-slate-900/60 p-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[180px]">
                  <p className="text-sm font-semibold text-white">Lead #{log.lead_id}</p>
                  <p className="text-xs text-slate-300">Campaign #{log.campaign_id}</p>
                </div>
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusColor[log.status] || 'bg-white/10 text-white'}`}>
                  {log.status}
                </span>
                <span className="rounded-full bg-indigo-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-100">
                  {log.step}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-3">
                <div className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                  Scheduled
                  <div className="text-sm font-semibold text-white">
                    {log.scheduled_at ? new Date(log.scheduled_at).toLocaleString() : '—'}
                  </div>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                  Sent
                  <div className="text-sm font-semibold text-white">{log.sent_at ? new Date(log.sent_at).toLocaleString() : '—'}</div>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                  Error
                  <div className="text-sm font-semibold text-rose-100">{log.error || 'None'}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
