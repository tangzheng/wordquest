import { motion } from 'framer-motion';

interface StarRatingProps {
  stars: number; // 0-3
  maxStars?: number;
  size?: number;
  animate?: boolean;
}

export function StarRating({
  stars,
  maxStars = 3,
  size = 32,
  animate = true,
}: StarRatingProps) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {Array.from({ length: maxStars }).map((_, i) => (
        <motion.span
          key={i}
          initial={animate ? { scale: 0, rotate: -180 } : false}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: animate ? i * 0.2 : 0,
            type: 'spring',
            stiffness: 340,
            damping: 18,
          }}
          style={{
            fontSize: `${size}px`,
            filter: i < stars
              ? 'drop-shadow(0 0 6px rgba(255,215,0,0.5))'
              : 'grayscale(1) opacity(0.3)',
            display: 'inline-block',
          }}
        >
          ⭐
        </motion.span>
      ))}
    </div>
  );
}
