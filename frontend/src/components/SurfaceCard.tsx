import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export default function SurfaceCard({
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="surface-card rounded-2xl p-6"
    >
      {(title || subtitle || actions) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="space-y-1">
            {title && <h2 className="text-lg font-semibold text-[#e5e7eb]">{title}</h2>}
            {subtitle && <p className="text-sm text-[#9ca3af]">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="space-y-4 text-[#e5e7eb]">{children}</div>
    </motion.div>
  );
}
