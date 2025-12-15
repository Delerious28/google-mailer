import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CloudArrowUpIcon, CheckBadgeIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import GlassCard from '../components/GlassCard';
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
    <div className="space-y-4">
      <GlassCard
        title="Leads"
        subtitle="Only consented contacts are eligible for delivery—unsubscribed are suppressed automatically."
        actions={
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-900/40 transition hover:scale-[1.01]">
            <CloudArrowUpIcon className="h-4 w-4" /> Upload CSV
            <input type="file" accept=".csv" className="hidden" onChange={onUpload} />
          </label>
        }
      >
        <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/60">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 text-left text-slate-300">
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
                  className="border-t border-white/10 bg-white/5 text-slate-200"
                >
                  <td className="px-4 py-3 font-medium">{lead.email}</td>
                  <td className="px-4">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toggleConsent(lead)}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                        lead.consent
                          ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-300/40'
                          : 'bg-slate-800 text-slate-200 border border-white/5'
                      }`}
                    >
                      <CheckBadgeIcon className="h-4 w-4" />
                      {lead.consent ? 'Consent: yes' : 'No consent'}
                    </motion.button>
                  </td>
                  <td className="px-4 text-xs uppercase tracking-wide text-slate-300">
                    {lead.unsubscribed ? 'Unsubscribed' : 'Active'}
                  </td>
                  <td className="px-4 text-slate-200">{lead.first_name || '—'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400">
          Consent is required to send; suppression is automatic via unsubscribe tokens embedded in every email footer.
        </p>
      </GlassCard>

      <GlassCard title="CSV format reminder" subtitle="Columns: email, consent; optional: first_name" actions={<EnvelopeIcon className="h-5 w-5 text-cyan-300" />}>
        <div className="grid gap-3 text-xs text-slate-300 sm:grid-cols-3">
          <div className="rounded-lg border border-white/5 bg-white/5 p-3">Unsubscribed contacts will always be skipped.</div>
          <div className="rounded-lg border border-white/5 bg-white/5 p-3">Consent must be explicitly true per lead.</div>
          <div className="rounded-lg border border-white/5 bg-white/5 p-3">Mail 2 only goes out when no reply is detected.</div>
        </div>
      </GlassCard>
    </div>
  );
}
