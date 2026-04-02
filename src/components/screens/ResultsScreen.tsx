import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { AnswerResult, Word, GameMode } from '@/types';
import { getWordById } from '@/data/words';
import { ALPHABET_DATA } from '@/data/alphabet';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StarRating } from '@/components/ui/StarRating';
import { TopBar } from '@/components/layout/TopBar';
import { BadgeUnlockModal } from '@/components/ui/BadgeUnlockModal';

interface ResultsState {
  answers: AnswerResult[];
  stars: 1 | 2 | 3;
  accuracy: number;
  topic: string;
  mode: GameMode;
  words: Word[];
  newBadges?: string[];
  isAlphabet?: boolean;
}

export function ResultsScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultsState | undefined;

  // Badge unlock queue
  const [badgeQueue, setBadgeQueue] = useState<string[]>([]);
  const [currentBadge, setCurrentBadge] = useState<string | null>(null);

  useEffect(() => {
    const newBadges = state?.newBadges;
    if (newBadges && newBadges.length > 0) {
      setBadgeQueue(newBadges.slice(1));
      setCurrentBadge(newBadges[0]);
    }
  }, []); // Only on mount

  // Confetti burst for 2+ stars (bigger for 3 stars, smaller for 2)
  useEffect(() => {
    if (state?.stars === 3) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.3 },
          colors: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#51CF66', '#A78BFA'],
        });
      }, 600);
      return () => clearTimeout(timer);
    } else if (state?.stars === 2) {
      const timer = setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.35 },
          colors: ['#FFE66D', '#51CF66', '#4ECDC4'],
        });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [state?.stars]);

  const handleBadgeClose = () => {
    if (badgeQueue.length > 0) {
      setCurrentBadge(badgeQueue[0]);
      setBadgeQueue(badgeQueue.slice(1));
    } else {
      setCurrentBadge(null);
    }
  };

  if (!state) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        <p>没有游戏结果</p>
        <Button onClick={() => navigate('/')}>回到首页</Button>
      </div>
    );
  }

  const { answers, stars, accuracy, topic, mode, isAlphabet } = state;
  const correctCount = answers.filter((a) => a.correct).length;

  const messages = [
    { min: 0.9, text: '太棒了！完美！🎉', color: 'var(--color-success)' },
    { min: 0.7, text: '做得好！继续加油！👏', color: 'var(--color-secondary)' },
    { min: 0, text: '不错的尝试！再练练就更好了 💪', color: 'var(--color-primary)' },
  ];
  const message = messages.find((m) => accuracy >= m.min)!;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="游戏结果" showBack={false} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-lg)',
          padding: 'var(--space-lg)',
        }}
      >
        {/* Stars */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <StarRating stars={stars} size={48} />
        </motion.div>

        {/* Message */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--font-size-xl)',
            color: message.color,
            textAlign: 'center',
          }}
        >
          {message.text}
        </motion.h2>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Card style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', gap: 'var(--space-xl)', justifyContent: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(81,207,102,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-2xl)',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {correctCount}/{answers.length}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                  正确
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(78,205,196,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-2xl)',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {Math.round(accuracy * 100)}%
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                  正确率
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,215,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-2xl)',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  +{stars}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                  星星
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Word/Letter review */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <h3 style={{ marginBottom: 'var(--space-sm)', fontSize: 'var(--font-size-md)' }}>
            {isAlphabet ? '字母回顾' : '单词回顾'}
          </h3>
          {answers.map((answer, i) => {
            if (isAlphabet) {
              // Alphabet mode: answer has letterId
              const letterId = (answer as any).letterId;
              const letter = ALPHABET_DATA.find((l) => l.id === letterId);
              if (!letter) return null;
              return (
                <div
                  key={letterId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    padding: 'var(--space-sm)',
                    marginBottom: i < answers.length - 1 ? '4px' : '0',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: answer.correct
                      ? 'rgba(81,207,102,0.08)'
                      : 'rgba(255,135,135,0.08)',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>
                    {answer.correct ? '✅' : '❌'}
                  </span>
                  <span style={{ fontSize: '28px', fontWeight: 'bold', color: letter.color }}>
                    {letter.letter}
                  </span>
                  <span style={{ fontSize: '20px' }}>{letter.emoji}</span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-md)', flex: 1 }}>
                    {letter.keyword}
                  </span>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                    {letter.keywordChinese}
                  </span>
                </div>
              );
            } else {
              // Word mode
              const word = getWordById(answer.wordId);
              if (!word) return null;
              return (
                <div
                  key={answer.wordId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    padding: 'var(--space-sm)',
                    marginBottom: i < answers.length - 1 ? '4px' : '0',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: answer.correct
                      ? 'rgba(81,207,102,0.08)'
                      : 'rgba(255,135,135,0.08)',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>
                    {answer.correct ? '✅' : '❌'}
                  </span>
                  <span style={{ fontSize: '20px' }}>{word.emoji}</span>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-md)', flex: 1 }}>
                    {word.english}
                  </span>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                    {word.chinese}
                  </span>
                </div>
              );
            }
          })}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-md)',
            width: '100%',
            maxWidth: '300px',
          }}
        >
          {isAlphabet ? (
            <>
              <Button
                onClick={() => navigate(`/alphabet/${mode}`, { replace: true })}
                color="var(--color-primary)"
                fullWidth
                size="large"
              >
                再玩一次 🔄
              </Button>
              <Button
                onClick={() => navigate('/alphabet', { replace: true })}
                color="var(--color-secondary)"
                fullWidth
              >
                换个模式
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => navigate(`/play/${topic}/${mode}`, { replace: true })}
                color="var(--color-primary)"
                fullWidth
                size="large"
              >
                再玩一次 🔄
              </Button>
              <Button
                onClick={() => navigate(`/mode/${topic}`, { replace: true })}
                color="var(--color-secondary)"
                fullWidth
              >
                换个模式
              </Button>
            </>
          )}
          <Button
            onClick={() => navigate('/', { replace: true })}
            color="transparent"
            textColor="var(--color-text-light)"
            fullWidth
            style={{
              boxShadow: 'none',
              border: '1.5px solid rgba(0,0,0,0.12)',
              backgroundColor: 'rgba(0,0,0,0.02)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            回到首页
          </Button>
        </motion.div>
      </div>

      <BadgeUnlockModal badgeId={currentBadge} onClose={handleBadgeClose} />
    </div>
  );
}
