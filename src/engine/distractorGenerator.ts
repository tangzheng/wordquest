import type { Word } from '@/types';
import { shuffle } from '@/utils/shuffle';

/**
 * Generate distractor words (wrong answers) for a target word
 * Prefers same topic and similar word length for better learning
 */
export function generateDistractors(
  target: Word,
  wordPool: Word[],
  count: number = 3
): Word[] {
  const candidates = wordPool
    .filter((w) => w.id !== target.id)
    .sort((a, b) => {
      // Prefer same topic (more challenging)
      const aTopicMatch = a.topic === target.topic ? 0 : 1;
      const bTopicMatch = b.topic === target.topic ? 0 : 1;
      if (aTopicMatch !== bTopicMatch) return aTopicMatch - bTopicMatch;

      // Then prefer similar word length
      const aDiff = Math.abs(a.letterCount - target.letterCount);
      const bDiff = Math.abs(b.letterCount - target.letterCount);
      return aDiff - bDiff;
    });

  // Take top candidates then shuffle for randomness
  return shuffle(candidates.slice(0, count * 3)).slice(0, count);
}

/**
 * Generate distractor letters for Listen & Spell mode
 * Returns extra letters not in the target word
 */
export function generateDistractorLetters(
  word: string,
  count: number = 2
): string[] {
  const wordLetters = new Set(word.toLowerCase().split(''));
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const available = alphabet.split('').filter((l) => !wordLetters.has(l));

  // Prefer common consonants and vowels for plausibility
  const common = available.filter((l) => 'aeioustrnlc'.includes(l));
  const source = common.length >= count ? common : available;

  return shuffle(source).slice(0, count);
}
