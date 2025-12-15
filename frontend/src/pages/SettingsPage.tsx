import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, AdjustmentsHorizontalIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import SurfaceCard from '../components/SurfaceCard';
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
  'w-full rounded-lg border border-[#1f2937] bg-[#0b0f14] px-3 py-2 text-sm text-[#e5e7eb] placeholder:text-[#6b7280] focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#2f3b56] transition';

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

  if (!settings) return <p className="text-sm text-[#9ca3af]">Loading...</p>;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <SurfaceCard
        title="Send window"
        subtitle="Respect local hours. Outside the window rolls to next start."
        actions={<ClockIcon className="h-5 w-5 text-[#6366f1]" />}
      >
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="space-y-1 text-[#e5e7eb]">
            <span className="text-sm font-medium text-white">Start time</span>
            <input className={inputClass} value={settings.start_time} onChange={(e) => updateField('start_time', e.target.value)} />
          </label>
          <label className="space-y-1 text-[#e5e7eb]">
            <span className="text-sm font-medium text-white">End time</span>
            <input className={inputClass} value={settings.end_time} onChange={(e) => updateField('end_time', e.target.value)} />
          </label>
          <div className="col-span-2 rounded-lg border border-[#1f2937] bg-[#161e2e] px-3 py-2 text-xs text-[#9ca3af]">
            Sends outside the window are delayed to the next eligible slot automatically.
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard
        title="Cadence + caps"
        subtitle="Randomized pacing between every single send—no bursts or BCC."
        actions={<AdjustmentsHorizontalIcon className="h-5 w-5 text-[#22c55e]" />}
      >
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="space-y-1 text-[#e5e7eb]">
            <span className="text-sm font-medium text-white">Interval min (minutes)</span>
            <input
              type="number"
              className={inputClass}
              value={settings.interval_min}
              onChange={(e) => updateField('interval_min', parseInt(e.target.value, 10))}
            />
          </label>
          <label className="space-y-1 text-[#e5e7eb]">
            <span className="text-sm font-medium text-white">Interval max (minutes)</span>
            <input
              type="number"
              className={inputClass}
              value={settings.interval_max}
              onChange={(e) => updateField('interval_max', parseInt(e.target.value, 10))}
            />
          </label>
          <label className="space-y-1 text-[#e5e7eb]">
            <span className="text-sm font-medium text-white">Daily cap</span>
            <input
              type="number"
              className={inputClass}
              value={settings.daily_cap}
              onChange={(e) => updateField('daily_cap', parseInt(e.target.value, 10))}
            />
          </label>
          <div className="flex flex-col justify-center rounded-lg border border-[#1f2937] bg-[#161e2e] px-3 py-2 text-xs text-[#f59e0b]">
            We stop scheduling once the cap is reached for the day.
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard
        title="Timezone"
        subtitle="Align delivery with your recipients and compliance region."
        actions={<GlobeAltIcon className="h-5 w-5 text-[#9ca3af]" />}
      >
        <div className="space-y-3 text-sm text-[#e5e7eb]">
          <input className={inputClass} value={settings.timezone} onChange={(e) => updateField('timezone', e.target.value)} />
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={save}
            className="inline-flex items-center justify-center rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4f54d8]"
          >
            {saving ? 'Saving…' : 'Save pacing + limits'}
          </motion.button>
          <p className="text-xs text-[#9ca3af]">Randomized delay is applied between every email to mimic human sending.</p>
        </div>
      </SurfaceCard>
    </div>
  );
}
