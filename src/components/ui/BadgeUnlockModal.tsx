import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getBadgeById } from '@/engine/badges';
import { Button } from './Button';

interface BadgeUnlockModalProps {
  badgeId: string | null;
  onClose: () => void;
}

// Badge colors for gradient backgrounds
const BADGE_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
  topic: { primary: '#FF6B6B', secondary: '#FF8E53', glow: 'rgba(255, 107, 107, 0.4)' },
  streak: { primary: '#FF9500', secondary: '#FF5E3A', glow: 'rgba(255, 149, 0, 0.4)' },
  milestone: { primary: '#A78BFA', secondary: '#7C3AED', glow: 'rgba(167, 139, 250, 0.4)' },
};

const getBadgeColors = (category: string) => {
  return BADGE_COLORS[category] || BADGE_COLORS.milestone;
};

export function BadgeUnlockModal({ badgeId, onClose }: BadgeUnlockModalProps) {
  const badge = badgeId ? getBadgeById(badgeId) : null;
  const colors = badge ? getBadgeColors(badge.category) : getBadgeColors('milestone');

  useEffect(() => {
    if (badge) {
      // Fire confetti!
      const duration = 2500;
      const end = Date.now() + duration;
      const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#51CF66', '#A78BFA', '#FF8E53'];
      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }
        confetti({
          particleCount: 40,
          startVelocity: 30,
          spread: 360,
          origin: { x: Math.random(), y: Math.random() * 0.3 },
          colors,
        });
      }, 150);
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
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: 'var(--space-lg)',
          }}
        >
          {/* Glow effect behind modal */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />

          <motion.div
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 50 }}
            transition={{ type: 'spring', damping: 12, stiffness: 180 }}
            style={{
              background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
              borderRadius: '24px',
              padding: 'var(--space-2xl)',
              maxWidth: '360px',
              width: '100%',
              textAlign: 'center',
              boxShadow: `0 25px 80px rgba(0,0,0,0.5), 0 0 60px ${colors.glow}`,
              border: `2px solid ${colors.primary}30`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ delay: 0.5, duration: 1 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                pointerEvents: 'none',
              }}
            />

            {/* Badge icon with glow */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 250, damping: 15 }}
              style={{
                marginBottom: 'var(--space-lg)',
                position: 'relative',
              }}
            >
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute',
                  inset: '-8px',
                  borderRadius: '50%',
                  border: `3px dashed ${colors.primary}60`,
                }}
              />
              {/* Badge circle */}
              <div
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  boxShadow: `0 8px 32px ${colors.glow}, inset 0 2px 0 rgba(255,255,255,0.3)`,
                  position: 'relative',
                }}
              >
                {/* Inner circle */}
                <div
                  style={{
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    background: 'linear-gradient(145deg, #1a1a2e 0%, #0f0f1a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.5)',
                  }}
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                    style={{
                      fontSize: '64px',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    }}
                  >
                    {badge.icon}
                  </motion.span>
                </div>
              </div>
            </motion.div>

            {/* Badge info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {/* Category tag */}
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 16px',
                  borderRadius: '20px',
                  background: `${colors.primary}20`,
                  border: `1px solid ${colors.primary}40`,
                  fontSize: '12px',
                  color: colors.primary,
                  marginBottom: 'var(--space-sm)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {badge.category === 'topic' ? '主题徽章' : badge.category === 'streak' ? '连续徽章' : '里程碑'}
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '28px',
                  background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: 'var(--space-xs)',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                }}
              >
                {badge.nameCn}
              </h2>

              <p
                style={{
                  fontSize: 'var(--font-size-md)',
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: 'var(--space-lg)',
                  lineHeight: 1.5,
                }}
              >
                {badge.descriptionCn}
              </p>
            </motion.div>

            {/* Sparkles decoration */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                fontSize: '24px',
                opacity: 0.6,
              }}
            >
              ✨
            </motion.div>
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
              style={{
                position: 'absolute',
                bottom: '80px',
                left: '20px',
                fontSize: '20px',
                opacity: 0.5,
              }}
            >
              ⭐
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={onClose}
                size="large"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                  border: 'none',
                  boxShadow: `0 4px 20px ${colors.glow}`,
                  fontSize: '18px',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                🎉 太棒了！
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
