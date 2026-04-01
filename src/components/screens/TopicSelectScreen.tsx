import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TOPICS } from '@/data/topics';
import { useGameStore } from '@/store/useGameStore';
import { getWordsByTopic } from '@/data/words';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { TopBar } from '@/components/layout/TopBar';

const TOPICS_PER_PAGE = 6;

export function TopicSelectScreen() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const wordMastery = useGameStore((s) => s.wordMastery);

  // Filter topics that have words for current level
  const availableTopics = TOPICS.filter((t) => {
    const words = getWordsByTopic(t.id);
    return words.length > 0;
  });

  const totalPages = Math.ceil(availableTopics.length / TOPICS_PER_PAGE);
  const pageTopics = availableTopics.slice(
    page * TOPICS_PER_PAGE,
    (page + 1) * TOPICS_PER_PAGE
  );

  const getTopicProgress = (topicId: string) => {
    const words = getWordsByTopic(topicId);
    if (words.length === 0) return 0;
    const learned = words.filter((w) => wordMastery[w.id]).length;
    return Math.round((learned / words.length) * 100);
  };

  const getTopicWordCount = (topicId: string) => {
    return getWordsByTopic(topicId).length;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="选择主题" />

      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'var(--space-md)',
          padding: 'var(--space-md)',
          alignContent: 'start',
        }}
      >
        {pageTopics.map((topic, i) => {
          const progress = getTopicProgress(topic.id);
          const wordCount = getTopicWordCount(topic.id);

          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                onClick={() => navigate(`/mode/${topic.id}`)}
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-md)',
                  borderLeft: `4px solid ${topic.color}`,
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: 'var(--space-xs)' }}>
                  {topic.icon}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--font-size-md)',
                    marginBottom: '2px',
                  }}
                >
                  {topic.nameCn}
                </div>
                <div
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-light)',
                    marginBottom: 'var(--space-sm)',
                  }}
                >
                  {wordCount} 个单词
                </div>
                <ProgressBar progress={progress} color={topic.color} height={8} />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'var(--space-lg)',
            padding: 'var(--space-md)',
          }}
        >
          <Button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            color="var(--color-secondary)"
          >
            ◀
          </Button>
          <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>
            {page + 1} / {totalPages}
          </span>
          <Button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            color="var(--color-secondary)"
          >
            ▶
          </Button>
        </div>
      )}
    </div>
  );
}
