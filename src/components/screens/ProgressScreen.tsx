import { useGameStore } from '@/store/useGameStore';
import { TOPICS } from '@/data/topics';
import { getWordsByTopic, allWords } from '@/data/words';
import { ALL_BADGES } from '@/engine/badges';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function ProgressScreen() {
  const wordMastery = useGameStore((s) => s.wordMastery);
  const totalStars = useGameStore((s) => s.totalStars);
  const badges = useGameStore((s) => s.badges);
  const streak = useGameStore((s) => s.dailyStreak.current);

  const totalLearned = Object.keys(wordMastery).length;
  const totalWords = allWords.length;
  const overallProgress = totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="📊 我的进度" />

      <div
        style={{
          padding: 'var(--space-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
        }}
      >
        {/* Overall stats */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontFamily: 'var(--font-heading)' }}>
                ⭐ {totalStars}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                总星星
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontFamily: 'var(--font-heading)' }}>
                🔥 {streak}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                连续天数
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontFamily: 'var(--font-heading)' }}>
                🏆 {badges.length}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                徽章
              </div>
            </div>
          </div>
        </Card>

        {/* Word progress */}
        <Card>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>
            单词进度：{totalLearned} / {totalWords}
          </h3>
          <ProgressBar progress={overallProgress} showLabel />
        </Card>

        {/* Badges section */}
        <h3 style={{ marginTop: 'var(--space-sm)' }}>我的徽章</h3>
        {(['topic', 'streak', 'milestone'] as const).map((category) => {
          const categoryNames = { topic: '主题徽章', streak: '连续学习', milestone: '里程碑' };
          const categoryBadges = ALL_BADGES.filter((b) => b.category === category);
          if (categoryBadges.length === 0) return null;
          return (
            <Card key={category} padding="var(--space-md)">
              <h4
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-light)',
                  marginBottom: 'var(--space-sm)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {categoryNames[category]}
              </h4>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-sm)',
                }}
              >
                {categoryBadges.map((badge) => {
                  const isEarned = badges.includes(badge.id);
                  return (
                    <div
                      key={badge.id}
                      title={isEarned ? badge.nameCn : badge.descriptionCn}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        width: '72px',
                        padding: 'var(--space-xs)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isEarned ? 'rgba(255, 215, 0, 0.1)' : 'rgba(0, 0, 0, 0.03)',
                        opacity: isEarned ? 1 : 0.5,
                      }}
                    >
                      <span style={{ fontSize: '28px', filter: isEarned ? 'none' : 'grayscale(100%)' }}>
                        {isEarned ? badge.icon : '🔒'}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          textAlign: 'center',
                          lineHeight: 1.2,
                          color: isEarned ? 'var(--color-text)' : 'var(--color-text-light)',
                          fontFamily: 'var(--font-heading)',
                        }}
                      >
                        {badge.nameCn}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}

        {/* Topic breakdown */}
        <h3 style={{ marginTop: 'var(--space-sm)' }}>各主题进度</h3>
        {TOPICS.map((topic) => {
          const words = getWordsByTopic(topic.id);
          if (words.length === 0) return null;
          const learned = words.filter((w) => wordMastery[w.id]).length;
          const progress = Math.round((learned / words.length) * 100);

          return (
            <Card key={topic.id} padding="var(--space-md)">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                <span style={{ fontSize: '24px' }}>{topic.icon}</span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-md)', flex: 1 }}>
                  {topic.nameCn}
                </span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                  {learned}/{words.length}
                </span>
              </div>
              <ProgressBar progress={progress} color={topic.color} height={8} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
