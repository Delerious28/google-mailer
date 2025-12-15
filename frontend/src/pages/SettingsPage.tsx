import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../api/client';

type Settings = {
  start_time: string;
  end_time: string;
  interval_min: number;
  interval_max: number;
  daily_cap: number;
  timezone: string;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    apiGet('/settings').then(setSettings);
  }, []);

  const save = async () => {
    if (!settings) return;
    const updated = await apiPost('/settings', settings);
    setSettings(updated);
  };

  const updateField = (key: keyof Settings, value: any) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  if (!settings) return <p>Loading...</p>;

  return (
    <div className="bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-xl font-semibold">Send Window &amp; Limits</h2>
      <div className="grid grid-cols-2 gap-4">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Start time</span>
          <input
            className="w-full border rounded px-2 py-2"
            value={settings.start_time}
            onChange={(e) => updateField('start_time', e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">End time</span>
          <input
            className="w-full border rounded px-2 py-2"
            value={settings.end_time}
            onChange={(e) => updateField('end_time', e.target.value)}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Interval min (minutes)</span>
          <input
            type="number"
            className="w-full border rounded px-2 py-2"
            value={settings.interval_min}
            onChange={(e) => updateField('interval_min', parseInt(e.target.value, 10))}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Interval max (minutes)</span>
          <input
            type="number"
            className="w-full border rounded px-2 py-2"
            value={settings.interval_max}
            onChange={(e) => updateField('interval_max', parseInt(e.target.value, 10))}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Daily cap</span>
          <input
            type="number"
            className="w-full border rounded px-2 py-2"
            value={settings.daily_cap}
            onChange={(e) => updateField('daily_cap', parseInt(e.target.value, 10))}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Timezone</span>
          <input
            className="w-full border rounded px-2 py-2"
            value={settings.timezone}
            onChange={(e) => updateField('timezone', e.target.value)}
          />
        </label>
      </div>
      <button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded">
        Save
      </button>
    </div>
  );
}
