import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTopicById } from '@/data/topics';
import { Card } from '@/components/ui/Card';
import { TopBar } from '@/components/layout/TopBar';
import type { GameMode } from '@/types';

interface ModeOption {
  mode: GameMode;
  emoji: string;
  nameCn: string;
  nameEn: string;
  description: string;
  color: string;
}

const MODES: ModeOption[] = [
  {
    mode: 'picture-word',
    emoji: '🖼️',
    nameCn: '看图选词',
    nameEn: 'Picture Match',
    description: '看图片，选出正确的英文单词',
    color: '#4ECDC4',
  },
  {
    mode: 'listen-spell',
    emoji: '🔊',
    nameCn: '听音拼写',
    nameEn: 'Listen & Spell',
    description: '听发音，拼出正确的单词',
    color: '#FF6B6B',
  },
  {
    mode: 'word-matching',
    emoji: '🔗',
    nameCn: '单词配对',
    nameEn: 'Word Match',
    description: '翻卡片，找到英文和中文的配对',
    color: '#A78BFA',
  },
  {
    mode: 'comprehensive',
    emoji: '🌟',
    nameCn: '综合挑战',
    nameEn: 'Challenge',
    description: '三种模式混合，全面挑战！',
    color: '#FFB800',
  },
];

export function GameModeSelectScreen() {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const topic = topicId ? getTopicById(topicId) : undefined;

  const handleSelectMode = (mode: GameMode) => {
    navigate(`/play/${topicId}/${mode}`);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title={topic ? `${topic.icon} ${topic.nameCn}` : '选择模式'} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
          padding: 'var(--space-md)',
          justifyContent: 'center',
        }}
      >
        <h3
          style={{
            textAlign: 'center',
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-text-light)',
            marginBottom: 'var(--space-sm)',
          }}
        >
          选择游戏模式
        </h3>

        {MODES.map((modeOption, i) => (
          <motion.div
            key={modeOption.mode}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card
              onClick={() => handleSelectMode(modeOption.mode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                borderLeft: `4px solid ${modeOption.color}`,
                padding: 'var(--space-md) var(--space-lg)',
              }}
            >
              <span style={{ fontSize: '40px' }}>{modeOption.emoji}</span>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--font-size-lg)',
                    color: 'var(--color-text)',
                  }}
                >
                  {modeOption.nameCn}
                </div>
                <div
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-light)',
                  }}
                >
                  {modeOption.description}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
