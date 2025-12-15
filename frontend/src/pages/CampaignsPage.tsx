import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PlayPauseIcon, SparklesIcon } from '@heroicons/react/24/outline';
import GlassCard from '../components/GlassCard';
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
  'w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-indigo-300/60 focus:outline-none focus:ring-2 focus:ring-indigo-300/40 transition';

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
      <GlassCard
        title="Campaigns"
        subtitle="Mail 1 then Mail 2 after replies are checked. Everything stays permission-based."
        actions={<SparklesIcon className="h-5 w-5 text-indigo-300" />}
      >
        <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/60">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-left text-slate-300">
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
                  className="border-t border-white/10 text-slate-200"
                >
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                        c.paused
                          ? 'border border-amber-200/40 bg-amber-300/10 text-amber-100'
                          : 'border border-emerald-200/40 bg-emerald-400/10 text-emerald-50'
                      }`}
                      onClick={() => pause(c)}
                    >
                      <PlayPauseIcon className="h-4 w-4" />
                      {c.paused ? 'Paused' : 'Live'}
                    </motion.button>
                  </td>
                  <td className="px-4 text-slate-300">{c.delay_days} days</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard title="New campaign" subtitle="Define mail 1 + mail 2 templates with smart reply-aware follow-ups.">
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
          <label className="space-y-1">
            <span className="text-slate-200">Delay (days)</span>
            <input
              type="number"
              className={inputClass}
              value={form.delay_days}
              onChange={(e) => setForm({ ...form, delay_days: parseInt(e.target.value, 10) })}
            />
          </label>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-900/30"
            onClick={submit}
          >
            Create &amp; queue
          </motion.button>
          <p className="text-xs text-slate-300">Mail 2 only sends when no reply is detected in the thread after Mail 1.</p>
        </div>
      </GlassCard>
    </div>
  );
}
