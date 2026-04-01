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
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--font-size-3xl)',
            color: 'var(--color-primary)',
            marginBottom: 'var(--space-xs)',
          }}
        >
          WordQuest
        </h1>
        <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-light)' }}>
          英语单词大冒险 🎮
        </p>
      </motion.div>

      {/* Stats */}
      {(totalStars > 0 || streak > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', gap: 'var(--space-xl)', fontSize: 'var(--font-size-xl)' }}
        >
          {totalStars > 0 && <span>⭐ {totalStars}</span>}
          {streak > 0 && <span>🔥 {streak}天</span>}
        </motion.div>
      )}

      {/* Level Selection */}
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <p
          style={{
            fontSize: 'var(--font-size-md)',
            color: 'var(--color-text-light)',
            marginBottom: 'var(--space-md)',
          }}
        >
          选择级别
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          {LEVELS.map((level, i) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              style={{ flex: 1 }}
            >
              <Card
                onClick={() => setLevel(level.id)}
                style={{
                  textAlign: 'center',
                  border: currentLevel === level.id ? `3px solid ${level.color}` : '3px solid transparent',
                  backgroundColor: currentLevel === level.id ? `${level.color}15` : 'var(--color-card)',
                  padding: 'var(--space-md)',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '4px' }}>{level.emoji}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-sm)' }}>
                  {level.nameCn}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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
        style={{ display: 'flex', gap: 'var(--space-xl)' }}
      >
        <Button
          onClick={() => navigate('/progress')}
          color="transparent"
          textColor="var(--color-text-light)"
          style={{ boxShadow: 'none', fontSize: 'var(--font-size-md)' }}
        >
          📊 进度
        </Button>
        <Button
          onClick={() => navigate('/settings')}
          color="transparent"
          textColor="var(--color-text-light)"
          style={{ boxShadow: 'none', fontSize: 'var(--font-size-md)' }}
        >
          ⚙️ 设置
        </Button>
      </motion.div>
    </div>
  );
}
