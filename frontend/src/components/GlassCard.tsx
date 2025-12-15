import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({
  title,
  subtitle,
  actions,
  children,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="surface-card rounded-2xl p-6"
    >
      {(title || subtitle || actions) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
            {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="space-y-4 text-slate-800">{children}</div>
    </motion.div>
  );
}
