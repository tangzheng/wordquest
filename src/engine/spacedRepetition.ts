import type { WordMastery } from '@/types';
import { todayStr, addDays } from '@/utils/date';

const LEITNER_INTERVALS = [0, 0, 1, 3, 7, 14]; // box 0 unused, boxes 1-5

/**
 * Process an answer and return updated mastery
 */
export function processAnswer(
  mastery: WordMastery | undefined,
  wordId: string,
  correct: boolean
): WordMastery {
  const today = todayStr();

  if (!mastery) {
    // First encounter
    const newBox = correct ? 2 : 1;
    return {
      wordId,
      box: newBox as WordMastery['box'],
      lastReviewDate: today,
      nextReviewDate: addDays(today, LEITNER_INTERVALS[newBox]),
      correctStreak: correct ? 1 : 0,
      totalAttempts: 1,
      totalCorrect: correct ? 1 : 0,
    };
  }

  if (correct) {
    const newBox = Math.min(mastery.box + 1, 5) as WordMastery['box'];
    return {
      ...mastery,
      box: newBox,
      lastReviewDate: today,
      nextReviewDate: addDays(today, LEITNER_INTERVALS[newBox]),
      correctStreak: mastery.correctStreak + 1,
      totalAttempts: mastery.totalAttempts + 1,
      totalCorrect: mastery.totalCorrect + 1,
    };
  } else {
    return {
      ...mastery,
      box: 1,
      lastReviewDate: today,
      nextReviewDate: today,
      correctStreak: 0,
      totalAttempts: mastery.totalAttempts + 1,
      totalCorrect: mastery.totalCorrect,
    };
  }
}

/**
 * Check if a word is due for review
 */
export function isDue(mastery: WordMastery): boolean {
  return mastery.nextReviewDate <= todayStr();
}

/**
 * Check if a word is considered mastered (box 5 with enough consecutive correct answers)
 */
export function isMastered(mastery: WordMastery | undefined): boolean {
  if (!mastery) return false;
  return mastery.box === 5 && mastery.correctStreak >= 3;
}
