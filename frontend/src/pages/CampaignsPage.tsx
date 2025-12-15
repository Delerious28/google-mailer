import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PlayPauseIcon, SparklesIcon } from '@heroicons/react/24/outline';
import SurfaceCard from '../components/SurfaceCard';
import { apiGet, apiPost } from '../api/client';

type Campaign = {
  id: number;
  name: string;
  mail1_subject: string;
  mail1_body: string;
  mail2_subject: string;
  mail2_body: string;
  delay_days: number;
  paused: boolean;
};

const emptyCampaign = {
  name: '',
  mail1_subject: '',
  mail1_body: '',
  mail2_subject: '',
  mail2_body: '',
  delay_days: 3,
};

const inputClass =
  'w-full rounded-lg border border-[#1f2937] bg-[#0b0f14] px-3 py-2 text-sm text-[#e5e7eb] placeholder:text-[#6b7280] focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#2f3b56] transition';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [form, setForm] = useState<any>(emptyCampaign);

  const load = () => apiGet('/campaigns').then(setCampaigns);

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    await apiPost('/campaigns', form);
    setForm(emptyCampaign);
    load();
  };

  const pause = async (campaign: Campaign) => {
    await apiPost(`/campaigns/${campaign.id}/pause?pause=${!campaign.paused}`);
    load();
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <SurfaceCard
        title="Campaigns"
        subtitle="Mail 1 then Mail 2 after replies are checked. Everything stays permission-based."
        actions={<SparklesIcon className="h-5 w-5 text-[#6366f1]" />}
      >
        <div className="overflow-hidden rounded-xl border border-[#1f2937] bg-[#0b0f14]">
          <table className="min-w-full text-sm text-[#e5e7eb]">
            <thead className="bg-[#111827] text-left text-[#9ca3af]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4">Paused</th>
                <th className="px-4">Delay days</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c, idx) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-t border-[#1f2937]"
                >
                  <td className="px-4 py-3 font-semibold text-white">{c.name}</td>
                  <td className="px-4">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${
                        c.paused
                          ? 'border-[#1f2937] bg-[#161e2e] text-[#f59e0b]'
                          : 'border-[#1f2937] bg-[#161e2e] text-[#22c55e]'
                      }`}
                      onClick={() => pause(c)}
                    >
                      <PlayPauseIcon className="h-4 w-4" />
                      {c.paused ? 'Paused' : 'Live'}
                    </motion.button>
                  </td>
                  <td className="px-4 text-[#9ca3af]">{c.delay_days} days</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      <SurfaceCard title="New campaign" subtitle="Define Mail 1 + Mail 2 templates with reply-aware follow-ups.">
        <div className="space-y-3 text-sm">
          <input
            className={inputClass}
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Mail 1 subject"
            value={form.mail1_subject}
            onChange={(e) => setForm({ ...form, mail1_subject: e.target.value })}
          />
          <textarea
            className={inputClass + ' min-h-[80px]'}
            placeholder="Mail 1 body"
            value={form.mail1_body}
            onChange={(e) => setForm({ ...form, mail1_body: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="Mail 2 subject"
            value={form.mail2_subject}
            onChange={(e) => setForm({ ...form, mail2_subject: e.target.value })}
          />
          <textarea
            className={inputClass + ' min-h-[80px]'}
            placeholder="Mail 2 body"
            value={form.mail2_body}
            onChange={(e) => setForm({ ...form, mail2_body: e.target.value })}
          />
          <label className="space-y-1 text-[#e5e7eb]">
            <span className="text-sm font-medium text-white">Delay (days)</span>
            <input
              type="number"
              className={inputClass}
              value={form.delay_days}
              onChange={(e) => setForm({ ...form, delay_days: parseInt(e.target.value, 10) })}
            />
          </label>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="inline-flex items-center justify-center rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4f54d8]"
            onClick={submit}
          >
            Create &amp; queue
          </motion.button>
          <p className="text-xs text-[#9ca3af]">Mail 2 only sends when no reply is detected in the thread after Mail 1.</p>
        </div>
      </SurfaceCard>
    </div>
  );
}
