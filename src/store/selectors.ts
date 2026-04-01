import { useGameStore } from './useGameStore';
import { getWordsByTopic } from '@/data/words';
import { todayStr } from '@/utils/date';

/**
 * Calculate progress for a specific topic (0-100%)
 */
export function useTopicProgress(topicId: string): number {
  const wordMastery = useGameStore((s) => s.wordMastery);
  const topicWords = getWordsByTopic(topicId);
  if (topicWords.length === 0) return 0;

  const mastered = topicWords.filter((w) => {
    const m = wordMastery[w.id];
    return m && m.box >= 4;
  }).length;

  return Math.round((mastered / topicWords.length) * 100);
}

/**
 * Count words due for review in a topic
 */
export function useDueWordCount(topicId: string): number {
  const wordMastery = useGameStore((s) => s.wordMastery);
  const today = todayStr();
  const topicWords = getWordsByTopic(topicId);

  return topicWords.filter((w) => {
    const m = wordMastery[w.id];
    return m && m.nextReviewDate <= today && m.box < 5;
  }).length;
}

/**
 * Count total mastered words across all topics
 */
export function useTotalMasteredWords(): number {
  const wordMastery = useGameStore((s) => s.wordMastery);
  return Object.values(wordMastery).filter(
    (m) => m.box >= 5 && m.correctStreak >= 3
  ).length;
}

/**
 * Count learned words (any mastery level) for a topic
 */
export function useTopicLearnedCount(topicId: string): number {
  const wordMastery = useGameStore((s) => s.wordMastery);
  const topicWords = getWordsByTopic(topicId);

  return topicWords.filter((w) => wordMastery[w.id]).length;
}
