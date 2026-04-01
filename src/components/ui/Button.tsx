import { motion } from 'framer-motion';
import type { ReactNode, CSSProperties } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
  color?: string;
  textColor?: string;
  size?: 'normal' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  style?: CSSProperties;
}

export function Button({
  children,
  onClick,
  color = 'var(--color-primary)',
  textColor = 'var(--color-text-white)',
  size = 'normal',
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const isLarge = size === 'large';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.93, y: 2 }}
      whileHover={{ scale: 1.03 }}
      style={{
        minHeight: isLarge ? '80px' : 'var(--touch-target)',
        minWidth: isLarge ? '200px' : 'var(--touch-target)',
        width: fullWidth ? '100%' : 'auto',
        padding: isLarge ? '20px 40px' : '14px 28px',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        backgroundColor: disabled ? '#ccc' : color,
        color: textColor,
        fontFamily: 'var(--font-heading)',
        fontSize: isLarge ? 'var(--font-size-xl)' : 'var(--font-size-lg)',
        cursor: disabled ? 'default' : 'pointer',
        boxShadow: disabled ? 'none' : `0 4px 0 rgba(0,0,0,0.2)`,
        opacity: disabled ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        ...style,
      }}
    >
      {children}
    </motion.button>
  );
}
