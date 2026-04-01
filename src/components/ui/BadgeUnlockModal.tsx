import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getBadgeById } from '@/engine/badges';
import { Button } from './Button';

interface BadgeUnlockModalProps {
  badgeId: string | null;
  onClose: () => void;
}

export function BadgeUnlockModal({ badgeId, onClose }: BadgeUnlockModalProps) {
  const badge = badgeId ? getBadgeById(badgeId) : null;

  useEffect(() => {
    if (badge) {
      // Fire confetti!
      const duration = 2000;
      const end = Date.now() + duration;
      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }
        confetti({
          particleCount: 30,
          startVelocity: 25,
          spread: 360,
          origin: { x: Math.random(), y: Math.random() * 0.4 },
          colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#51CF66', '#A78BFA'],
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [badge]);

  return (
    <AnimatePresence>
      {badge && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: 'var(--space-lg)',
          }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            style={{
              backgroundColor: 'var(--color-card)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-2xl) var(--space-xl)',
              maxWidth: '350px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
              style={{ fontSize: '72px', marginBottom: 'var(--space-md)' }}
            >
              {badge.icon}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--font-size-xl)',
                  color: 'var(--color-primary)',
                  marginBottom: 'var(--space-xs)',
                }}
              >
                🎉 新徽章！
              </h2>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--font-size-lg)',
                  marginBottom: 'var(--space-sm)',
                }}
              >
                {badge.nameCn}
              </h3>
              <p
                style={{
                  fontSize: 'var(--font-size-md)',
                  color: 'var(--color-text-light)',
                  marginBottom: 'var(--space-xl)',
                }}
              >
                {badge.descriptionCn}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <Button onClick={onClose} color="var(--color-primary)" size="large">
                太棒了！ 🎊
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
