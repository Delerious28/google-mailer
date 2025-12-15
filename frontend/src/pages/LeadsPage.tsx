import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CloudArrowUpIcon, CheckBadgeIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import SurfaceCard from '../components/SurfaceCard';
import { apiGet, apiPost, apiUpload } from '../api/client';

type Lead = {
  id: number;
  email: string;
  consent: boolean;
  unsubscribed: boolean;
  first_name?: string;
};

const inputPill = (active: boolean) =>
  `inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${
    active ? 'border-[#22c55e] text-[#22c55e] bg-[#111827]' : 'border-[#1f2937] text-[#e5e7eb] bg-[#0b0f14]'
  }`;

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
    <div className="space-y-4">
      <SurfaceCard
        title="Leads"
        subtitle="Only consented contacts are eligible for delivery—unsubscribed are suppressed automatically."
        actions={
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#6366f1] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4f54d8]">
            <CloudArrowUpIcon className="h-4 w-4" /> Upload CSV
            <input type="file" accept=".csv" className="hidden" onChange={onUpload} />
          </label>
        }
      >
        <div className="overflow-hidden rounded-xl border border-[#1f2937] bg-[#0b0f14]">
          <table className="min-w-full text-sm text-[#e5e7eb]">
            <thead className="bg-[#111827] text-left text-[#9ca3af]">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4">Consent</th>
                <th className="px-4">Unsubscribed</th>
                <th className="px-4">First name</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, idx) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-t border-[#1f2937]"
                >
                  <td className="px-4 py-3 font-semibold text-white">{lead.email}</td>
                  <td className="px-4">
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => toggleConsent(lead)} className={inputPill(lead.consent)}>
                      <CheckBadgeIcon className="h-4 w-4" />
                      {lead.consent ? 'Consent: yes' : 'No consent'}
                    </motion.button>
                  </td>
                  <td className="px-4 text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">
                    {lead.unsubscribed ? 'Unsubscribed' : 'Active'}
                  </td>
                  <td className="px-4 text-[#9ca3af]">{lead.first_name || '—'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[#9ca3af]">
          Consent is required to send; suppression is automatic via unsubscribe tokens embedded in every email footer.
        </p>
      </SurfaceCard>

      <SurfaceCard title="CSV format reminder" subtitle="Columns: email, consent; optional: first_name" actions={<EnvelopeIcon className="h-5 w-5 text-[#6366f1]" />}>
        <div className="grid gap-3 text-xs text-[#e5e7eb] sm:grid-cols-3">
          <div className="rounded-lg border border-[#1f2937] bg-[#0b0f14] p-3">Unsubscribed contacts will always be skipped.</div>
          <div className="rounded-lg border border-[#1f2937] bg-[#0b0f14] p-3">Consent must be explicitly true per lead.</div>
          <div className="rounded-lg border border-[#1f2937] bg-[#0b0f14] p-3">Mail 2 only goes out when no reply is detected.</div>
        </div>
      </SurfaceCard>
    </div>
  );
}
