import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  EnvelopeOpenIcon,
  Cog6ToothIcon,
  QueueListIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';

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
    <div className="min-h-screen bg-[#0b0f14] text-[#e5e7eb]">
      <header className="border-b border-[#1f2937] bg-[#0b0f14]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9ca3af]">Permission-based mailer</p>
            <h1 className="text-2xl font-semibold text-white">Mailer Automation Studio</h1>
            <p className="text-sm text-[#9ca3af]">Send responsibly from Gmail with clear consent, pacing, and compliance.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#1f2937] bg-[#111827] px-3 py-2 text-xs font-semibold text-[#e5e7eb]">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#22c55e]" aria-hidden />
            Gmail API connected
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 pb-4 text-sm font-medium text-[#9ca3af]">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6366f1] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f14] rounded-full"
              >
                <div
                  className={`flex items-center gap-2 rounded-full px-4 py-2 border transition-colors ${
                    active
                      ? 'border-[#2f3b56] bg-[#161e2e] text-white shadow-sm'
                      : 'border-[#1f2937] bg-[#111827] text-[#e5e7eb] hover:border-[#2f3b56]'
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
