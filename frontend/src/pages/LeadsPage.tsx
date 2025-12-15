import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiUpload } from '../api/client';

type Lead = {
  id: number;
  email: string;
  consent: boolean;
  unsubscribed: boolean;
  first_name?: string;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  const load = () => apiGet('/leads').then(setLeads);

  useEffect(() => {
    load();
  }, []);

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await apiUpload('/leads/upload', file);
    load();
  };

  const toggleConsent = async (lead: Lead) => {
    await apiPost(`/leads/${lead.id}/consent?consent=${!lead.consent}`);
    load();
  };

  return (
    <div className="space-y-4 bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Leads</h2>
        <label className="text-sm bg-blue-50 px-3 py-2 rounded cursor-pointer">
          Upload CSV (email, consent)
          <input type="file" accept=".csv" className="hidden" onChange={onUpload} />
        </label>
      </div>
      <table className="min-w-full text-sm">
        <thead className="text-left text-gray-600">
          <tr>
            <th className="py-2">Email</th>
            <th>Consent</th>
            <th>Unsubscribed</th>
            <th>First name</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-t">
              <td className="py-2">{lead.email}</td>
              <td>
                <button
                  className={`px-2 py-1 rounded text-xs ${lead.consent ? 'bg-green-100 text-green-800' : 'bg-gray-200'}`}
                  onClick={() => toggleConsent(lead)}
                >
                  {lead.consent ? 'Yes' : 'No'}
                </button>
              </td>
              <td>{lead.unsubscribed ? 'Yes' : 'No'}</td>
              <td>{lead.first_name || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-500">Consent is required to send.</p>
    </div>
  );
}
