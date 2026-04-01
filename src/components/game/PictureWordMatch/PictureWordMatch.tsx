import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Word, AnswerResult } from '@/types';
import { WordImage } from '@/components/ui/WordImage';
import { generateDistractors } from '@/engine/distractorGenerator';
import { allWords } from '@/data/words';
import { useTTS } from '@/hooks/useTTS';
import { useSound } from '@/hooks/useSound';
import { shuffle } from '@/utils/shuffle';

interface PictureWordMatchProps {
  words: Word[];
  onComplete: (answers: AnswerResult[]) => void;
}

export function PictureWordMatch({ words, onComplete }: PictureWordMatchProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [options, setOptions] = useState<Word[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [correctId, setCorrectId] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set());
  const [isRevealing, setIsRevealing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const startTimeRef = useRef(Date.now());
  const debounceRef = useRef(false);
  const { speak } = useTTS();
  const { play } = useSound();

  const currentWord = words[currentIndex];
  const isLastWord = currentIndex >= words.length - 1;

  // Generate options when word changes
  useEffect(() => {
    if (!currentWord) return;
    const distractors = generateDistractors(currentWord, allWords, 3);
    const opts = shuffle([currentWord, ...distractors]);
    setOptions(opts);
    setSelectedId(null);
    setCorrectId(null);
    setWrongIds(new Set());
    setIsRevealing(false);
    setAttempts(0);
    startTimeRef.current = Date.now();
    debounceRef.current = false;
  }, [currentIndex, currentWord]);

  const goToNext = useCallback(() => {
    if (isLastWord) {
      onComplete(answers);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [isLastWord, answers, onComplete]);

  const handleSelect = useCallback(
    (option: Word) => {
      if (debounceRef.current || isRevealing || wrongIds.has(option.id)) return;
      debounceRef.current = true;
      setTimeout(() => { debounceRef.current = false; }, 300);

      const isCorrect = option.id === currentWord.id;
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (isCorrect) {
        setSelectedId(option.id);
        setCorrectId(option.id);
        play('correct');
        speak(currentWord.english);

        const answer: AnswerResult = {
          wordId: currentWord.id,
          correct: true,
          timeMs: Date.now() - startTimeRef.current,
          attempts: newAttempts,
        };
        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);

        // Move to next after delay
        setTimeout(() => {
          if (isLastWord) {
            onComplete(newAnswers);
          } else {
            setCurrentIndex((i) => i + 1);
          }
        }, 1200);
      } else {
        setWrongIds((prev) => new Set(prev).add(option.id));
        play('wrong');

        // After 1 wrong attempt, reveal correct answer
        if (newAttempts >= 1) {
          setIsRevealing(true);
          setCorrectId(currentWord.id);
          speak(currentWord.english);

          const answer: AnswerResult = {
            wordId: currentWord.id,
            correct: false,
            timeMs: Date.now() - startTimeRef.current,
            attempts: newAttempts,
          };
          const newAnswers = [...answers, answer];
          setAnswers(newAnswers);

          // Move to next after revealing
          setTimeout(() => {
            if (isLastWord) {
              onComplete(newAnswers);
            } else {
              setCurrentIndex((i) => i + 1);
            }
          }, 2500);
        }
      }
    },
    [currentWord, attempts, answers, isLastWord, wrongIds, isRevealing, play, speak, onComplete]
  );

  if (!currentWord) return null;

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-lg)',
        padding: 'var(--space-md)',
      }}
    >
      {/* Progress */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-sm)',
          fontSize: 'var(--font-size-md)',
          color: 'var(--color-text-light)',
        }}
      >
        {words.map((_, i) => (
          <div
            key={i}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor:
                i < currentIndex
                  ? answers[i]?.correct
                    ? 'var(--color-success)'
                    : 'var(--color-error)'
                  : i === currentIndex
                  ? 'var(--color-primary)'
                  : 'rgba(0,0,0,0.1)',
              transition: 'background-color 0.3s',
            }}
          />
        ))}
      </div>

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-sm)',
          }}
        >
          <WordImage emoji={currentWord.emoji} word={currentWord.english} size={160} />
          {isRevealing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--font-size-xl)',
                color: 'var(--color-success)',
              }}
            >
              {currentWord.english} = {currentWord.chinese}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Options 2x2 grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'var(--space-md)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        {options.map((option, i) => {
          const isCorrectOption = option.id === correctId;
          const isWrong = wrongIds.has(option.id);

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isWrong ? [1, 0.95, 1.05, 0.95, 1] : 1,
              }}
              transition={{ delay: i * 0.08 }}
              onClick={() => handleSelect(option)}
              disabled={isWrong || isRevealing}
              style={{
                minHeight: 'var(--touch-target)',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                border: isCorrectOption
                  ? '3px solid var(--color-success)'
                  : isWrong
                  ? '3px solid var(--color-error)'
                  : '3px solid transparent',
                backgroundColor: isCorrectOption
                  ? 'rgba(81, 207, 102, 0.15)'
                  : isWrong
                  ? 'rgba(255, 135, 135, 0.15)'
                  : 'var(--color-card)',
                color: isWrong ? 'var(--color-text-light)' : 'var(--color-text)',
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--font-size-option)',
                cursor: isWrong || isRevealing ? 'default' : 'pointer',
                opacity: isWrong ? 0.5 : 1,
                boxShadow: 'var(--shadow-sm)',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
              }}
            >
              {option.english}
              {isCorrectOption && ' ✓'}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
