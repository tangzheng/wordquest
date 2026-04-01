import type { Word, GameMode, Level, GameResult, AnswerResult } from '@/types';
import { selectSessionWords } from './wordSelector';
import { calculateStars, calculateAccuracy } from './scoring';
import type { WordMastery } from '@/types';

/**
 * Create a game session configuration
 */
export function createSessionConfig(
  allWords: Word[],
  masteryMap: Record<string, WordMastery>,
  topicId: string,
  level: Level,
  mode: GameMode
) {
  const wordCount = mode === 'word-matching' ? 6 : 8; // Matching needs pairs, fewer words

  const words = selectSessionWords(allWords, masteryMap, {
    total: wordCount,
    maxNew: 3,
    topic: topicId,
    level,
  });

  return {
    mode,
    topic: topicId,
    level,
    words,
  };
}

/**
 * Calculate final game result from answers
 */
export function calculateGameResult(
  sessionId: string,
  mode: GameMode,
  topic: string,
  words: Word[],
  answers: AnswerResult[],
  startedAt: number
): GameResult {
  const accuracy = calculateAccuracy(answers);
  const stars = calculateStars(accuracy);
  const correctCount = answers.filter((a) => a.correct).length;

  return {
    sessionId,
    mode,
    topic,
    totalWords: words.length,
    correctCount,
    accuracy,
    stars,
    newBadges: [], // Populated by badge system later
    timeMs: Date.now() - startedAt,
  };
}

/**
 * For comprehensive mode: assign a game mode to each word
 * Rotates through the 3 base modes
 */
export function assignComprehensiveModes(
  wordCount: number
): GameMode[] {
  const baseModes: GameMode[] = ['picture-word', 'listen-spell', 'word-matching'];
  return Array.from({ length: wordCount }, (_, i) => baseModes[i % 3]);
}
