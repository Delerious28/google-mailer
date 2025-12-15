import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClockIcon } from '@heroicons/react/24/outline';
import GlassCard from '../components/GlassCard';
import { apiGet } from '../api/client';

type QueueItem = {
  id: number;
  lead_id: number;
  campaign_id: number;
  step: string;
  scheduled_at: string;
  status: string;
};

export default function QueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);

  useEffect(() => {
    apiGet('/queue').then(setItems);
  }, []);

  return (
    <GlassCard
      title="Upcoming sends"
      subtitle="Randomized intervals are applied between every send to respect pacing + daily caps."
      actions={<ClockIcon className="h-5 w-5 text-indigo-500" />}
    >
      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-slate-600">No queued deliveries yet.</p>}
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((i, idx) => (
            <motion.div
              key={i.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Lead #{i.lead_id}</p>
                  <p className="text-xs text-slate-600">Campaign #{i.campaign_id}</p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700 border border-indigo-100">
                  {i.step}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  Scheduled
                  <div className="text-sm font-semibold text-slate-900">{new Date(i.scheduled_at).toLocaleString()}</div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  Status
                  <div className="text-sm font-semibold text-emerald-700">{i.status}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
