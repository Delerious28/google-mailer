import { useEffect, useState } from 'react';
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

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    apiGet('/logs').then(setLogs);
  }, []);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Logs</h2>
      <table className="min-w-full text-sm">
        <thead className="text-left text-gray-600">
          <tr>
            <th className="py-2">Lead</th>
            <th>Campaign</th>
            <th>Step</th>
            <th>Status</th>
            <th>Sent</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-t">
              <td className="py-2">{log.lead_id}</td>
              <td>{log.campaign_id}</td>
              <td>{log.step}</td>
              <td>{log.status}</td>
              <td>{log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-500 mt-2">Includes queued/sent/skipped/error events.</p>
    </div>
  );
}
