import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="min-h-screen relative overflow-hidden text-slate-50">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-10 -left-20 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute top-10 right-0 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute bottom-0 left-20 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 space-y-6">
        <header className="glass-panel gradient-border p-[1px] rounded-2xl">
          <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/80">Permission-based mailer</p>
                <h1 className="text-3xl font-semibold tracking-tight">Mailer Automation Studio</h1>
                <p className="text-sm text-slate-300/80 max-w-2xl">
                  Connect Gmail, enforce consent, and orchestrate respectful follow-ups with animated clarity.
                </p>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 shadow-lg"
                >
                  <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_20px] shadow-emerald-400" />
                  <div className="text-sm leading-tight">
                    <p className="text-slate-200 font-medium">Realtime status</p>
                    <p className="text-slate-400">Gmail API live · Compliance on</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <nav className="flex flex-wrap gap-2 text-sm">
              {navItems.map((item) => {
                const active = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link key={item.name} to={item.href} className="relative">
                    <motion.div
                      whileHover={{ y: -1, scale: 1.01 }}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 transition-colors ${
                        active ? 'text-white' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                      {active && (
                        <motion.span
                          layoutId="nav-glow"
                          className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-cyan-400/30 via-indigo-500/30 to-emerald-400/30 shadow-lg shadow-indigo-900/40"
                          transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                        />
                      )}
                      <span className="absolute inset-x-0 -bottom-px mx-2 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    </motion.div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
