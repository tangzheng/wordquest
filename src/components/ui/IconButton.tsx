import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface IconButtonProps {
  children: ReactNode;
  onClick: () => void;
  size?: number;
  color?: string;
  label?: string;
}

export function IconButton({
  children,
  onClick,
  size = 48,
  color = 'rgba(0,0,0,0.06)',
  label,
}: IconButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
      aria-label={label}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        border: 'none',
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: `${size * 0.5}px`,
        padding: 0,
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </motion.button>
  );
}
