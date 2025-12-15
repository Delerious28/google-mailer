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
  sent: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  queued: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
  skipped_no_consent: 'bg-amber-50 text-amber-800 border border-amber-200',
  skipped_unsubscribed: 'bg-amber-50 text-amber-800 border border-amber-200',
  skipped_replied: 'bg-sky-50 text-sky-800 border border-sky-200',
  error: 'bg-red-50 text-red-800 border border-red-200',
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
      actions={<ClipboardDocumentCheckIcon className="h-5 w-5 text-emerald-600" />}
    >
      <div className="space-y-3">
        {logs.length === 0 && <p className="text-sm text-slate-600">No activity logged yet.</p>}
        <div className="space-y-2">
          {logs.map((log, idx) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-[180px] flex-1">
                  <p className="text-sm font-semibold text-slate-900">Lead #{log.lead_id}</p>
                  <p className="text-xs text-slate-600">Campaign #{log.campaign_id}</p>
                </div>
                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusColor[log.status] || 'bg-slate-100 text-slate-800 border border-slate-200'}`}>
                  {log.status}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-800 border border-slate-200">
                  {log.step}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-700 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  Scheduled
                  <div className="text-sm font-semibold text-slate-900">
                    {log.scheduled_at ? new Date(log.scheduled_at).toLocaleString() : '—'}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  Sent
                  <div className="text-sm font-semibold text-slate-900">{log.sent_at ? new Date(log.sent_at).toLocaleString() : '—'}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  Error
                  <div className="text-sm font-semibold text-rose-700">{log.error || 'None'}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
