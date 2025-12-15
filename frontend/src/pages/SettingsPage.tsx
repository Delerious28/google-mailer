import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, AdjustmentsHorizontalIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import GlassCard from '../components/GlassCard';
import { apiGet, apiPost } from '../api/client';

type Settings = {
  start_time: string;
  end_time: string;
  interval_min: number;
  interval_max: number;
  daily_cap: number;
  timezone: string;
};

const inputClass =
  'w-full rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/40 transition';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiGet('/settings').then(setSettings);
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    const updated = await apiPost('/settings', settings);
    setSettings(updated);
    setSaving(false);
  };

  const updateField = (key: keyof Settings, value: any) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  if (!settings) return <p className="text-sm text-slate-300">Loading...</p>;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <GlassCard
        title="Send window"
        subtitle="Respect local hours. Outside the window rolls to next start."
        actions={<ClockIcon className="h-5 w-5 text-cyan-300" />}
      >
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="space-y-1">
            <span className="text-slate-200">Start time</span>
            <input className={inputClass} value={settings.start_time} onChange={(e) => updateField('start_time', e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-slate-200">End time</span>
            <input className={inputClass} value={settings.end_time} onChange={(e) => updateField('end_time', e.target.value)} />
          </label>
          <div className="col-span-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-xs text-slate-300/80">
            Sends outside the window are delayed to the next eligible slot automatically.
          </div>
        </div>
      </GlassCard>

      <GlassCard
        title="Cadence + caps"
        subtitle="Randomized pacing between every single send—no bursts or BCC."
        actions={<AdjustmentsHorizontalIcon className="h-5 w-5 text-emerald-300" />}
      >
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="space-y-1">
            <span className="text-slate-200">Interval min (minutes)</span>
            <input
              type="number"
              className={inputClass}
              value={settings.interval_min}
              onChange={(e) => updateField('interval_min', parseInt(e.target.value, 10))}
            />
          </label>
          <label className="space-y-1">
            <span className="text-slate-200">Interval max (minutes)</span>
            <input
              type="number"
              className={inputClass}
              value={settings.interval_max}
              onChange={(e) => updateField('interval_max', parseInt(e.target.value, 10))}
            />
          </label>
          <label className="space-y-1">
            <span className="text-slate-200">Daily cap</span>
            <input
              type="number"
              className={inputClass}
              value={settings.daily_cap}
              onChange={(e) => updateField('daily_cap', parseInt(e.target.value, 10))}
            />
          </label>
          <div className="flex flex-col justify-center rounded-lg border border-amber-200/30 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
            We stop scheduling once the cap is reached for the day.
          </div>
        </div>
      </GlassCard>

      <GlassCard
        title="Timezone"
        subtitle="Align delivery with your recipients and compliance region."
        actions={<GlobeAltIcon className="h-5 w-5 text-fuchsia-300" />}
      >
        <div className="space-y-3 text-sm">
          <input className={inputClass} value={settings.timezone} onChange={(e) => updateField('timezone', e.target.value)} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={save}
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-indigo-900/40"
          >
            {saving ? 'Saving…' : 'Save pacing + limits'}
          </motion.button>
          <p className="text-xs text-slate-300/80">Randomized delay is applied between every email to mimic human sending.</p>
        </div>
      </GlassCard>
    </div>
  );
}
