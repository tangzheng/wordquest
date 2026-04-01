import type { AnswerResult } from '@/types';

/**
 * Calculate star rating based on accuracy
 * 90%+ = 3 stars, 70-89% = 2 stars, <70% = 1 star
 */
export function calculateStars(accuracy: number): 1 | 2 | 3 {
  if (accuracy >= 0.9) return 3;
  if (accuracy >= 0.7) return 2;
  return 1;
}

/**
 * Calculate accuracy from answers
 */
export function calculateAccuracy(answers: AnswerResult[]): number {
  if (answers.length === 0) return 0;
  const correct = answers.filter((a) => a.correct).length;
  return correct / answers.length;
}

/**
 * Calculate session score summary
 */
export function calculateSessionScore(answers: AnswerResult[]) {
  const accuracy = calculateAccuracy(answers);
  const stars = calculateStars(accuracy);
  const correctCount = answers.filter((a) => a.correct).length;
  const totalTime = answers.reduce((sum, a) => sum + a.timeMs, 0);
  const avgTime = answers.length > 0 ? totalTime / answers.length : 0;

  return {
    accuracy,
    stars,
    correctCount,
    totalWords: answers.length,
    totalTime,
    avgTime,
  };
}
