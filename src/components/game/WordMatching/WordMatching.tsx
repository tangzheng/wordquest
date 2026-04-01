import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Word, AnswerResult } from '@/types';
import { useTTS } from '@/hooks/useTTS';
import { useSound } from '@/hooks/useSound';
import { shuffle } from '@/utils/shuffle';

interface MatchCard {
  id: string;
  wordId: string;
  type: 'english' | 'chinese';
  content: string;
  emoji?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface WordMatchingProps {
  words: Word[];
  onComplete: (answers: AnswerResult[]) => void;
}

export function WordMatching({ words, onComplete }: WordMatchingProps) {
  const gameWords = words.slice(0, 6); // Max 6 pairs
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [totalFlips, setTotalFlips] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const startTimeRef = useRef(Date.now());
  const pairStartTimeRef = useRef(Date.now());
  const { speak } = useTTS();
  const { play } = useSound();

  // Initialize cards
  useEffect(() => {
    const cardPairs: MatchCard[] = [];
    gameWords.forEach((word) => {
      cardPairs.push({
        id: `en-${word.id}`,
        wordId: word.id,
        type: 'english',
        content: word.english,
        isFlipped: false,
        isMatched: false,
      });
      cardPairs.push({
        id: `cn-${word.id}`,
        wordId: word.id,
        type: 'chinese',
        content: word.chinese,
        emoji: word.emoji,
        isFlipped: false,
        isMatched: false,
      });
    });
    setCards(shuffle(cardPairs));
    startTimeRef.current = Date.now();
    pairStartTimeRef.current = Date.now();
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  const handleCardTap = useCallback(
    (cardId: string) => {
      if (isProcessing) return;

      const card = cards.find((c) => c.id === cardId);
      if (!card || card.isFlipped || card.isMatched) return;
      if (selectedCards.length >= 2) return;

      play('flip');
      setTotalFlips((f) => f + 1);

      // Flip the card
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
      );

      const newSelected = [...selectedCards, cardId];
      setSelectedCards(newSelected);

      if (newSelected.length === 2) {
        setIsProcessing(true);
        const card1 = cards.find((c) => c.id === newSelected[0])!;
        const card2 = cards.find((c) => c.id === cardId)!;

        if (card1.wordId === card2.wordId && card1.type !== card2.type) {
          // Match!
          setTimeout(() => {
            play('match');
            const englishCard = card1.type === 'english' ? card1 : card2;
            speak(englishCard.content);

            setCards((prev) =>
              prev.map((c) =>
                c.id === card1.id || c.id === card2.id
                  ? { ...c, isMatched: true }
                  : c
              )
            );

            const newMatchedPairs = new Set(matchedPairs).add(card1.wordId);
            setMatchedPairs(newMatchedPairs);

            // Record answer
            const answer: AnswerResult = {
              wordId: card1.wordId,
              correct: true,
              timeMs: Date.now() - pairStartTimeRef.current,
              attempts: 1,
            };
            const newAnswers = [...answers, answer];
            setAnswers(newAnswers);

            setSelectedCards([]);
            setIsProcessing(false);
            pairStartTimeRef.current = Date.now();

            // Check if all pairs matched
            if (newMatchedPairs.size === gameWords.length) {
              setTimeout(() => {
                onComplete(newAnswers);
              }, 1000);
            }
          }, 300);
        } else {
          // No match
          setTimeout(() => {
            play('wrong');
            setCards((prev) =>
              prev.map((c) =>
                newSelected.includes(c.id) ? { ...c, isFlipped: false } : c
              )
            );
            setSelectedCards([]);
            setIsProcessing(false);
          }, 1200);
        }
      }
    },
    [cards, selectedCards, isProcessing, matchedPairs, answers, gameWords.length, play, speak, onComplete]
  );

  const pairs = gameWords.length;
  const cols = pairs <= 4 ? 2 : 3;

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-md)',
        padding: 'var(--space-md)',
      }}
    >
      {/* Progress */}
      <div style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-light)' }}>
        已配对 {matchedPairs.size} / {pairs} 组 · 翻转 {totalFlips} 次
      </div>

      {/* Card Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 'var(--space-sm)',
          width: '100%',
          maxWidth: '420px',
        }}
      >
        {cards.map((card) => (
          <motion.div
            key={card.id}
            whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : undefined}
            onClick={() => handleCardTap(card.id)}
            style={{
              perspective: '1000px',
              cursor: card.isFlipped || card.isMatched ? 'default' : 'pointer',
            }}
          >
            <motion.div
              animate={{ rotateY: card.isFlipped || card.isMatched ? 0 : 180 }}
              transition={{ duration: 0.4 }}
              style={{
                transformStyle: 'preserve-3d',
                position: 'relative',
                minHeight: '80px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {/* Front (content) */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: card.isMatched
                    ? 'rgba(81, 207, 102, 0.15)'
                    : 'var(--color-card)',
                  border: card.isMatched
                    ? '3px solid var(--color-success)'
                    : '3px solid rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--space-sm)',
                  gap: '4px',
                }}
              >
                {card.type === 'chinese' && card.emoji && (
                  <span style={{ fontSize: '24px' }}>{card.emoji}</span>
                )}
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: card.type === 'english' ? 'var(--font-size-md)' : 'var(--font-size-lg)',
                    color: 'var(--color-text)',
                    textAlign: 'center',
                    wordBreak: 'break-word',
                  }}
                >
                  {card.content}
                </span>
                {card.type === 'english' && (
                  <span style={{ fontSize: '12px', color: 'var(--color-text-light)' }}>
                    English
                  </span>
                )}
              </div>

              {/* Back (hidden) */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  color: 'white',
                  userSelect: 'none',
                }}
              >
                ❓
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
