import { useEffect, useState } from 'react';
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
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Campaigns</h2>
        <table className="min-w-full text-sm">
          <thead className="text-left text-gray-600">
            <tr>
              <th className="py-2">Name</th>
              <th>Paused</th>
              <th>Delay days</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="py-2">{c.name}</td>
                <td>
                  <button className="text-blue-600" onClick={() => pause(c)}>
                    {c.paused ? 'Resume' : 'Pause'}
                  </button>
                </td>
                <td>{c.delay_days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white p-6 rounded shadow space-y-3">
        <h3 className="text-lg font-semibold">New campaign</h3>
        <input
          className="w-full border rounded px-2 py-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full border rounded px-2 py-2"
          placeholder="Mail 1 subject"
          value={form.mail1_subject}
          onChange={(e) => setForm({ ...form, mail1_subject: e.target.value })}
        />
        <textarea
          className="w-full border rounded px-2 py-2"
          placeholder="Mail 1 body"
          value={form.mail1_body}
          onChange={(e) => setForm({ ...form, mail1_body: e.target.value })}
        />
        <input
          className="w-full border rounded px-2 py-2"
          placeholder="Mail 2 subject"
          value={form.mail2_subject}
          onChange={(e) => setForm({ ...form, mail2_subject: e.target.value })}
        />
        <textarea
          className="w-full border rounded px-2 py-2"
          placeholder="Mail 2 body"
          value={form.mail2_body}
          onChange={(e) => setForm({ ...form, mail2_body: e.target.value })}
        />
        <label className="text-sm space-y-1">
          <span>Delay (days)</span>
          <input
            type="number"
            className="w-full border rounded px-2 py-2"
            value={form.delay_days}
            onChange={(e) => setForm({ ...form, delay_days: parseInt(e.target.value, 10) })}
          />
        </label>
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={submit}>
          Create &amp; Queue
        </button>
      </div>
    </div>
  );
}
