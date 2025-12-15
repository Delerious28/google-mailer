import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import SurfaceCard from '../components/SurfaceCard';
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
  sent: 'border-[#1f2937] bg-[#161e2e] text-[#22c55e]',
  queued: 'border-[#1f2937] bg-[#161e2e] text-[#6366f1]',
  skipped_no_consent: 'border-[#1f2937] bg-[#161e2e] text-[#f59e0b]',
  skipped_unsubscribed: 'border-[#1f2937] bg-[#161e2e] text-[#f59e0b]',
  skipped_replied: 'border-[#1f2937] bg-[#161e2e] text-[#9ca3af]',
  error: 'border-[#1f2937] bg-[#161e2e] text-[#ef4444]',
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    apiGet('/logs').then(setLogs);
  }, []);

  return (
    <SurfaceCard
      title="Logs"
      subtitle="Complete trail of queued/sent/skipped/error events. Reply-aware and consent-aware."
      actions={<ClipboardDocumentCheckIcon className="h-5 w-5 text-[#22c55e]" />}
    >
      <div className="space-y-3">
        {logs.length === 0 && <p className="text-sm text-[#9ca3af]">No activity logged yet.</p>}
        <div className="space-y-2">
          {logs.map((log, idx) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="rounded-xl border border-[#1f2937] bg-[#111827] p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-[180px] flex-1">
                  <p className="text-sm font-semibold text-white">Lead #{log.lead_id}</p>
                  <p className="text-xs text-[#9ca3af]">Campaign #{log.campaign_id}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide border ${
                    statusColor[log.status] || 'border-[#1f2937] bg-[#161e2e] text-[#e5e7eb]'
                  }`}
                >
                  {log.status}
                </span>
                <span className="rounded-full border border-[#1f2937] bg-[#161e2e] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#e5e7eb]">
                  {log.step}
                </span>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-[#9ca3af] sm:grid-cols-3">
                <div className="rounded-lg border border-[#1f2937] bg-[#0b0f14] px-3 py-2">
                  Scheduled
                  <div className="text-sm font-semibold text-white">
                    {log.scheduled_at ? new Date(log.scheduled_at).toLocaleString() : '—'}
                  </div>
                </div>
                <div className="rounded-lg border border-[#1f2937] bg-[#0b0f14] px-3 py-2">
                  Sent
                  <div className="text-sm font-semibold text-white">{log.sent_at ? new Date(log.sent_at).toLocaleString() : '—'}</div>
                </div>
                <div className="rounded-lg border border-[#1f2937] bg-[#0b0f14] px-3 py-2">
                  Error
                  <div className="text-sm font-semibold text-[#ef4444]">{log.error || 'None'}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SurfaceCard>
  );
}
