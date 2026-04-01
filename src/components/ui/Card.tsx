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
      whileHover={onClick ? { scale: 1.02 } : undefined}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor: color,
        borderRadius: 'var(--radius-lg)',
        padding,
        boxShadow: 'var(--shadow-md)',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}
