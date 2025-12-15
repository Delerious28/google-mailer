import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { EnvelopeOpenIcon, Cog6ToothIcon, QueueListIcon, UserGroupIcon, ClipboardDocumentCheckIcon, Bars3BottomLeftIcon } from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Connect', href: '/', icon: EnvelopeOpenIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  { name: 'Leads', href: '/leads', icon: UserGroupIcon },
  { name: 'Campaigns', href: '/campaigns', icon: Bars3BottomLeftIcon },
  { name: 'Queue', href: '/queue', icon: QueueListIcon },
  { name: 'Logs', href: '/logs', icon: ClipboardDocumentCheckIcon },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Permission-based mailer</p>
            <h1 className="text-2xl font-semibold text-slate-900">Mailer Automation Studio</h1>
            <p className="text-sm text-slate-600">Send responsibly from Gmail with clear consent, pacing, and compliance.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 border border-indigo-100">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            Gmail API secured
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 pb-4 text-sm font-medium text-slate-700">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} to={item.href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-full">
                <div
                  className={`flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
                    active ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">{children}</main>
    </div>
  );
}
