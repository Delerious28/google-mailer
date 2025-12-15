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
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="glass-panel gradient-border p-[1px] rounded-2xl"
    >
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        {(title || subtitle || actions) && (
          <div className="flex items-start justify-between gap-3">
            <div>
              {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
              {subtitle && <p className="text-sm text-slate-300/80">{subtitle}</p>}
            </div>
            {actions}
          </div>
        )}
        {children}
      </div>
    </motion.div>
  );
}
