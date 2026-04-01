import { motion } from 'framer-motion';
import type { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  color?: string;
  padding?: string;
  style?: CSSProperties;
  animate?: boolean;
}

export function Card({
  children,
  onClick,
  color = 'var(--color-card)',
  padding = 'var(--space-lg)',
  style,
  animate = true,
}: CardProps) {
  return (
    <motion.div
      onClick={onClick}
      initial={animate ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      whileHover={onClick ? { y: -2, boxShadow: '0 6px 20px rgba(0,0,0,0.12)' } : undefined}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor: color,
        borderRadius: 'var(--radius-lg)',
        padding,
        boxShadow: 'var(--shadow-md)',
        border: '1px solid rgba(0,0,0,0.06)',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
