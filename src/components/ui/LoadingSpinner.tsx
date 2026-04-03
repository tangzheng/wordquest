import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  style?: CSSProperties;
}

export function LoadingSpinner({
  message = '准备中...',
  size = 48,
  style,
}: LoadingSpinnerProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-lg)',
        ...style,
      }}
    >
      {/* Animated spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `${size / 8}px solid rgba(255, 107, 107, 0.2)`,
          borderTopColor: 'var(--color-primary)',
          borderRightColor: 'var(--color-secondary)',
          boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
        }}
      />

      {/* Pulsing message */}
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{
          fontSize: 'var(--font-size-lg)',
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-text-light)',
        }}
      >
        {message}
      </motion.p>

      {/* Decorative dots */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
            }}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: i === 1 ? 'var(--color-primary)' : 'var(--color-secondary)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
