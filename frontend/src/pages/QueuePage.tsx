import { useEffect, useState } from 'react';
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
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Upcoming sends</h2>
      <table className="min-w-full text-sm">
        <thead className="text-left text-gray-600">
          <tr>
            <th className="py-2">Lead</th>
            <th>Campaign</th>
            <th>Step</th>
            <th>Scheduled</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} className="border-t">
              <td className="py-2">{i.lead_id}</td>
              <td>{i.campaign_id}</td>
              <td>{i.step}</td>
              <td>{new Date(i.scheduled_at).toLocaleString()}</td>
              <td>{i.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
