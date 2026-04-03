import type { ReactNode, CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    color?: string;
  };
  style?: CSSProperties;
  children?: ReactNode;
}

export function EmptyState({
  emoji = '📭',
  title,
  description,
  action,
  style,
  children,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-xl)',
        gap: 'var(--space-md)',
        textAlign: 'center',
        ...style,
      }}
    >
      {/* Large emoji */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: '64px', lineHeight: 1 }}
      >
        {emoji}
      </motion.div>

      {/* Title */}
      <h3
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--font-size-xl)',
          color: 'var(--color-text)',
          margin: 0,
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: 'var(--font-size-md)',
          color: 'var(--color-text-light)',
          maxWidth: '280px',
          margin: 0,
        }}
      >
        {description}
      </p>

      {/* Custom content */}
      {children}

      {/* Action button */}
      {action && (
        <Button onClick={action.onClick} color={action.color ?? 'var(--color-primary)'} size="large">
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}
