import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({
  progress,
  color = 'var(--color-secondary)',
  height = 12,
  showLabel = false,
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: 'rgba(0,0,0,0.08)',
          borderRadius: `${height / 2}px`,
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            height: '100%',
            backgroundColor: color,
            borderRadius: `${height / 2}px`,
          }}
        />
      </div>
      {showLabel && (
        <div
          style={{
            textAlign: 'right',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-light)',
            marginTop: '4px',
          }}
        >
          {Math.round(clampedProgress)}%
        </div>
      )}
    </div>
  );
}
