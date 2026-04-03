import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Word, AnswerResult } from '@/types';
import { useTTS } from '@/hooks/useTTS';
import { useSound } from '@/hooks/useSound';
import { useHaptics } from '@/hooks/useHaptics';
import { generateDistractorLetters } from '@/engine/distractorGenerator';
import { shuffle } from '@/utils/shuffle';
import { Button } from '@/components/ui/Button';

interface LetterTile {
  id: string;
  letter: string;
  used: boolean;
}

interface ListenAndSpellProps {
  words: Word[];
  onComplete: (answers: AnswerResult[]) => void;
}

export function ListenAndSpell({ words, onComplete }: ListenAndSpellProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [slots, setSlots] = useState<(string | null)[]>([]);
  const [tray, setTray] = useState<LetterTile[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const [showHintIndicator, setShowHintIndicator] = useState(false);
  const startTimeRef = useRef(Date.now());
  const debounceRef = useRef(false);
  const hintTimer1 = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hintTimer2 = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { speak, speakTwice } = useTTS();
  const { play } = useSound();
  const { triggerSuccess } = useHaptics();

  const currentWord = words[currentIndex];
  const isLastWord = currentIndex >= words.length - 1;
  const allSlotsFilled = slots.every((s) => s !== null);

  // Setup new word
  useEffect(() => {
    if (!currentWord) return;

    const wordLetters = currentWord.english.toLowerCase().split('');
    const distractors = generateDistractorLetters(currentWord.english, 2);
    const allLetters = shuffle([...wordLetters, ...distractors]);

    setSlots(new Array(wordLetters.length).fill(null));
    setTray(
      allLetters.map((letter, i) => ({
        id: `tile-${i}-${letter}`,
        letter,
        used: false,
      }))
    );
    setIsChecking(false);
    setIsCorrect(null);
    setIsRevealing(false);
    setAttempts(0);
    setHintCount(0);
    startTimeRef.current = Date.now();
    debounceRef.current = false;

    // Auto-speak the word twice (normal then slow) for learning
    const timer = setTimeout(() => speakTwice(currentWord.english), 300);

    // Hint timers
    hintTimer1.current = setTimeout(() => {
      setHintCount((c) => Math.max(c, 1));
      setShowHintIndicator(true);
      setTimeout(() => setShowHintIndicator(false), 1500);
    }, 10000);
    hintTimer2.current = setTimeout(() => {
      setHintCount((c) => Math.max(c, 2));
      setShowHintIndicator(true);
      setTimeout(() => setShowHintIndicator(false), 1500);
    }, 20000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hintTimer1.current);
      clearTimeout(hintTimer2.current);
    };
  }, [currentIndex, currentWord, speak]);

  // Apply hints
  useEffect(() => {
    if (!currentWord || hintCount === 0 || isRevealing || isCorrect) return;

    const wordLetters = currentWord.english.toLowerCase().split('');

    setSlots((prevSlots) => {
      const newSlots = [...prevSlots];
      for (let i = 0; i < hintCount && i < wordLetters.length; i++) {
        if (newSlots[i] === null) {
          newSlots[i] = wordLetters[i];
        }
      }
      return newSlots;
    });

    // Mark hinted letters as used in tray
    setTray((prevTray) => {
      const newTray = [...prevTray];
      const wordLetters2 = currentWord.english.toLowerCase().split('');
      for (let i = 0; i < hintCount && i < wordLetters2.length; i++) {
        const tileIdx = newTray.findIndex(
          (t) => !t.used && t.letter === wordLetters2[i]
        );
        if (tileIdx !== -1) {
          newTray[tileIdx] = { ...newTray[tileIdx], used: true };
        }
      }
      return newTray;
    });
  }, [hintCount, currentWord, isRevealing, isCorrect]);

  const handleTrayTap = useCallback(
    (tile: LetterTile) => {
      if (debounceRef.current || tile.used || isChecking || isRevealing) return;
      debounceRef.current = true;
      setTimeout(() => {
        debounceRef.current = false;
      }, 200);

      play('click');

      // Find first empty slot
      const emptyIndex = slots.findIndex((s) => s === null);
      if (emptyIndex === -1) return;

      setSlots((prev) => {
        const newSlots = [...prev];
        newSlots[emptyIndex] = tile.letter;
        return newSlots;
      });
      setTray((prev) =>
        prev.map((t) => (t.id === tile.id ? { ...t, used: true } : t))
      );
    },
    [slots, isChecking, isRevealing, play]
  );

  const handleSlotTap = useCallback(
    (index: number) => {
      if (debounceRef.current || isChecking || isRevealing) return;
      if (slots[index] === null) return;
      // Don't allow removing hinted letters
      if (index < hintCount) return;

      debounceRef.current = true;
      setTimeout(() => {
        debounceRef.current = false;
      }, 200);

      play('click');

      const letter = slots[index]!;
      setSlots((prev) => {
        const newSlots = [...prev];
        newSlots[index] = null;
        return newSlots;
      });

      // Return letter to tray - find matching used tile
      setTray((prev) => {
        const tileIdx = prev.findIndex((t) => t.used && t.letter === letter);
        if (tileIdx === -1) return prev;
        return prev.map((t, i) => (i === tileIdx ? { ...t, used: false } : t));
      });
    },
    [slots, isChecking, isRevealing, hintCount, play]
  );

  const handleCheck = useCallback(() => {
    if (!allSlotsFilled || isChecking || !currentWord) return;
    setIsChecking(true);

    const assembled = slots.join('').toLowerCase();
    const correct = assembled === currentWord.english.toLowerCase();
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (correct) {
      setIsCorrect(true);
      play('correct');
      triggerSuccess();
      speak(currentWord.english);

      const answer: AnswerResult = {
        wordId: currentWord.id,
        correct: true,
        timeMs: Date.now() - startTimeRef.current,
        attempts: newAttempts,
      };
      const newAnswers = [...answers, answer];
      setAnswers(newAnswers);

      setTimeout(() => {
        if (isLastWord) {
          onComplete(newAnswers);
        } else {
          setCurrentIndex((i) => i + 1);
        }
      }, 1500);
    } else {
      setIsCorrect(false);
      play('wrong');

      if (newAttempts >= 2) {
        // Reveal the answer
        setIsRevealing(true);
        const wordLetters = currentWord.english.toLowerCase().split('');
        setSlots(wordLetters);
        speak(currentWord.english);

        const answer: AnswerResult = {
          wordId: currentWord.id,
          correct: false,
          timeMs: Date.now() - startTimeRef.current,
          attempts: newAttempts,
        };
        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);

        setTimeout(() => {
          if (isLastWord) {
            onComplete(newAnswers);
          } else {
            setCurrentIndex((i) => i + 1);
          }
        }, 2500);
      } else {
        // Clear and let them try again
        setTimeout(() => {
          // Reset slots (keep hints)
          const wordLetters = currentWord.english.toLowerCase().split('');
          setSlots((prev) =>
            prev.map((_s, i) => (i < hintCount ? wordLetters[i] : null))
          );
          setTray((prev) =>
            prev.map((t) => {
              // Keep hinted tiles used, reset others
              const wordLetters2 = currentWord.english
                .toLowerCase()
                .split('');
              const isHintLetter =
                hintCount > 0 &&
                wordLetters2.slice(0, hintCount).includes(t.letter);
              if (isHintLetter) return t;
              return { ...t, used: false };
            })
          );
          setIsChecking(false);
          setIsCorrect(null);
        }, 800);
      }
    }
  }, [
    allSlotsFilled,
    isChecking,
    currentWord,
    slots,
    attempts,
    answers,
    isLastWord,
    play,
    speak,
    onComplete,
    hintCount,
  ]);

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
      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
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
            }}
          />
        ))}
      </div>

      {/* Speaker button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => speakTwice(currentWord.english)}
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))',
          fontSize: '48px',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
      >
        🔊
      </motion.button>

      <p
        style={{
          fontSize: 'var(--font-size-md)',
          color: 'var(--color-text-light)',
        }}
      >
        听发音，拼出单词！
      </p>

      {/* Answer slots */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {slots.map((letter, i) => (
          <motion.div
            key={i}
            animate={
              isCorrect === false && !isRevealing
                ? { x: [0, -5, 5, -5, 5, 0] }
                : {}
            }
            onClick={() => handleSlotTap(i)}
            style={{
              width: '48px',
              height: '56px',
              borderRadius: 'var(--radius-sm)',
              border: `3px solid ${
                isCorrect === true
                  ? 'var(--color-success)'
                  : isCorrect === false
                  ? 'var(--color-error)'
                  : letter
                  ? 'var(--color-primary)'
                  : 'rgba(0,0,0,0.15)'
              }`,
              backgroundColor:
                isCorrect === true
                  ? 'rgba(81, 207, 102, 0.15)'
                  : isRevealing
                  ? 'rgba(81, 207, 102, 0.1)'
                  : letter
                  ? 'var(--color-card)'
                  : 'rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--font-size-xl)',
              color: 'var(--color-text)',
              cursor:
                letter && !isChecking && !isRevealing && i >= hintCount
                  ? 'pointer'
                  : 'default',
              userSelect: 'none',
              textTransform: 'lowercase',
            }}
          >
            {letter}
          </motion.div>
        ))}
      </div>

      {/* Reveal info */}
      {isRevealing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-success)',
          }}
        >
          {currentWord.english} = {currentWord.chinese}
        </motion.div>
      )}

      {/* Hint indicator */}
      <AnimatePresence>
        {showHintIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              fontSize: 'var(--font-size-lg)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-xs)',
              color: 'var(--color-accent)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            <span style={{ fontSize: '28px' }}>💡</span>
            提示来啦！
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letter tray */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-sm)',
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: 'var(--space-md)',
          backgroundColor: 'rgba(0,0,0,0.03)',
          borderRadius: 'var(--radius-lg)',
          minHeight: '72px',
        }}
      >
        {tray.map((tile) => (
          <motion.button
            key={tile.id}
            whileTap={!tile.used ? { scale: 0.9 } : undefined}
            onClick={() => handleTrayTap(tile)}
            disabled={tile.used}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: tile.used
                ? 'rgba(0,0,0,0.05)'
                : 'var(--color-card)',
              color: tile.used ? 'transparent' : 'var(--color-text)',
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--font-size-lg)',
              cursor: tile.used ? 'default' : 'pointer',
              boxShadow: tile.used ? 'none' : 'var(--shadow-sm)',
              opacity: tile.used ? 0.3 : 1,
              userSelect: 'none',
              textTransform: 'lowercase',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {tile.letter}
          </motion.button>
        ))}
      </div>

      {/* Check button */}
      {allSlotsFilled && !isChecking && !isRevealing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button onClick={handleCheck}>
            检查 ✓
          </Button>
        </motion.div>
      )}
    </div>
  );
}
