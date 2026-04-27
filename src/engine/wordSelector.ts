import type { Word, Level, WordMastery } from '@/types';
import { isDue, isMastered } from './spacedRepetition';
import { shuffle } from '@/utils/shuffle';

const LEVEL_ORDER: Record<Level, number> = {
  starters: 1,
  movers: 2,
  flyers: 3,
  ket: 4,
};

interface SelectionConfig {
  total?: number;     // Total words for session (default 8)
  maxNew?: number;    // Max new words per session (default 3)
  topic?: string;     // Filter by topic
  level: Level;       // Current level
}

/**
 * Select words for a game session
 * Prioritizes review words, fills remaining with new words
 */
export function selectSessionWords(
  allWords: Word[],
  masteryMap: Record<string, WordMastery>,
  config: SelectionConfig
): Word[] {
  const { total = 8, maxNew = 3, topic, level } = config;

  // Filter by topic and level
  const pool = allWords.filter((w) => {
    if (topic && w.topic !== topic) return false;
    return LEVEL_ORDER[w.level] <= LEVEL_ORDER[level];
  });

  if (pool.length === 0) return [];

  // Separate into: due for review, new (never seen), mastered
  const dueWords = pool.filter((w) => {
    const m = masteryMap[w.id];
    return m && isDue(m) && !isMastered(m);
  });

  const newWords = pool.filter((w) => !masteryMap[w.id]);

  // Prioritize: due words first, fill with new words
  const reviewPick = shuffle(dueWords).slice(0, total);
  const newSlots = Math.min(maxNew, total - reviewPick.length);
  const newPick = shuffle(newWords).slice(0, newSlots);

  let selected = [...reviewPick, ...newPick];

  // If still not enough, add some already-seen but not due words
  if (selected.length < total) {
    const remaining = pool.filter(
      (w) => !selected.some((s) => s.id === w.id) && !isMastered(masteryMap[w.id])
    );
    const fill = shuffle(remaining).slice(0, total - selected.length);
    selected = [...selected, ...fill];
  }

  // If STILL not enough (small topic), just use what we have
  return shuffle(selected).slice(0, total);
}
