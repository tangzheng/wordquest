import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Level } from '@/types';

const LEVELS: { id: Level; nameEn: string; nameCn: string; emoji: string; color: string }[] = [
  { id: 'starters', nameEn: 'Starters', nameCn: '入门级', emoji: '🌱', color: 'var(--color-starters)' },
  { id: 'movers', nameEn: 'Movers', nameCn: '提高级', emoji: '🚀', color: 'var(--color-movers)' },
  { id: 'flyers', nameEn: 'Flyers', nameCn: '飞跃级', emoji: '✈️', color: 'var(--color-flyers)' },
  { id: 'ket', nameEn: 'KET', nameCn: 'KET备考', emoji: '📝', color: 'var(--color-ket)' },
];

const FLOATING_DECORATIONS = [
  { emoji: '⭐', top: '8%', left: '10%', delay: 0, duration: 3.5 },
  { emoji: '📖', top: '15%', right: '8%', delay: 0.5, duration: 4 },
  { emoji: '✏️', bottom: '18%', left: '6%', delay: 1, duration: 3.2 },
  { emoji: '🌟', bottom: '12%', right: '12%', delay: 1.5, duration: 3.8 },
  { emoji: '📚', top: '45%', left: '3%', delay: 0.8, duration: 4.2 },
];

export function HomeScreen() {
  const navigate = useNavigate();
  const currentLevel = useGameStore((s) => s.currentLevel);
  const setLevel = useGameStore((s) => s.setLevel);
  const totalStars = useGameStore((s) => s.totalStars);
  const streak = useGameStore((s) => s.dailyStreak.current);
  const updateStreak = useGameStore((s) => s.updateStreak);

  const handleStart = () => {
    updateStreak();
    navigate('/topics');
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-xl)',
        padding: 'var(--space-lg)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating decorative emoji elements */}
      {FLOATING_DECORATIONS.map((dec, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            y: [0, -15, 0],
          }}
          transition={{
            delay: dec.delay,
            duration: dec.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: dec.top,
            left: dec.left,
            right: dec.right,
            bottom: dec.bottom,
            fontSize: '24px',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          {dec.emoji}
        </motion.div>
      ))}

      {/* Logo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{ zIndex: 1 }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--font-size-3xl)',
            background: 'linear-gradient(135deg, #FF6B6B, #FF8E53, #FFE66D)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(2px 2px 4px rgba(255, 107, 107, 0.3))',
            marginBottom: 'var(--space-xs)',
          }}
        >
          WordQuest
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-light)',
            letterSpacing: '2px',
          }}
        >
          🌟 英语单词大冒险 🌟
        </p>
      </motion.div>

      {/* Stats */}
      {(totalStars > 0 || streak > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex',
            gap: 'var(--space-xl)',
            fontSize: 'var(--font-size-xl)',
            zIndex: 1,
          }}
        >
          {totalStars > 0 && <span>⭐ {totalStars}</span>}
          {streak > 0 && <span>🔥 {streak}天</span>}
        </motion.div>
      )}

      {/* Level Selection */}
      <div style={{ width: '100%', maxWidth: '380px', zIndex: 1 }}>
        <p
          style={{
            fontSize: 'var(--font-size-md)',
            color: 'var(--color-text-light)',
            marginBottom: 'var(--space-md)',
          }}
        >
          选择级别
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-sm)' }}>
          {LEVELS.map((level, i) => {
            const isSelected = currentLevel === level.id;
            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Card
                  onClick={() => setLevel(level.id)}
                  style={{
                    textAlign: 'center',
                    border: isSelected ? `3px solid ${level.color}` : '3px solid transparent',
                    backgroundColor: isSelected ? `${level.color}15` : 'var(--color-card)',
                    padding: 'var(--space-md)',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isSelected
                      ? `0 0 16px ${level.color}40, var(--shadow-md)`
                      : 'var(--shadow-md)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '4px' }}>{level.emoji}</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-sm)' }}>
                    {level.nameCn}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Alphabet Learning Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        style={{ zIndex: 1 }}
      >
        <Button onClick={() => navigate('/alphabet')} size="large" color="#9B59B6">
          🔤 字母学习
        </Button>
      </motion.div>

      {/* Start Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ zIndex: 1 }}
      >
        <Button onClick={handleStart} size="large" color="var(--color-primary)">
          开始学习 🎯
        </Button>
      </motion.div>

      {/* Bottom links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{ display: 'flex', gap: 'var(--space-xl)', zIndex: 1 }}
      >
        <Button
          onClick={() => navigate('/progress')}
          color="transparent"
          textColor="var(--color-text-light)"
          style={{
            boxShadow: 'none',
            fontSize: 'var(--font-size-md)',
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: '20px',
            padding: '8px 20px',
          }}
        >
          📊 进度
        </Button>
        <Button
          onClick={() => navigate('/settings')}
          color="transparent"
          textColor="var(--color-text-light)"
          style={{
            boxShadow: 'none',
            fontSize: 'var(--font-size-md)',
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: '20px',
            padding: '8px 20px',
          }}
        >
          ⚙️ 设置
        </Button>
      </motion.div>
    </div>
  );
}
