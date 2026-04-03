import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Word, AnswerResult } from '@/types';
import { WordImage } from '@/components/ui/WordImage';
import { generateDistractors } from '@/engine/distractorGenerator';
import { allWords } from '@/data/words';
import { useTTS } from '@/hooks/useTTS';
import { useSound } from '@/hooks/useSound';
import { useHaptics } from '@/hooks/useHaptics';
import { shuffle } from '@/utils/shuffle';

const ENCOURAGING_MESSAGES = ['再试试！', '加油！', '你可以的！', '动动脑筋！', '别急，慢慢来！'];

interface PictureWordMatchProps {
  words: Word[];
  onComplete: (answers: AnswerResult[]) => void;
}

export function PictureWordMatch({ words, onComplete }: PictureWordMatchProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [options, setOptions] = useState<Word[]>([]);
  const [_selectedId, setSelectedId] = useState<string | null>(null);
  const [correctId, setCorrectId] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set());
  const [isRevealing, setIsRevealing] = useState(false);
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [plusOneKey, setPlusOneKey] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [milestoneMessage, setMilestoneMessage] = useState<string | null>(null);
  const lastMilestoneRef = useRef<number>(0);
  const startTimeRef = useRef(Date.now());
  const debounceRef = useRef(false);
  const { speak } = useTTS();
  const { play } = useSound();
  const { triggerSuccess } = useHaptics();

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
    setEncouragement(null);
    setShowCelebrate(false);
    setMilestoneMessage(null);
    startTimeRef.current = Date.now();
    debounceRef.current = false;
  }, [currentIndex, currentWord]);

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
        setShowPlusOne(true);
        setPlusOneKey((k) => k + 1);
        setShowCelebrate(true);
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

        // Check for milestone
        const newIndex = currentIndex + 1;
        const progress = newIndex / words.length;
        const milestones = [
          { threshold: 0.25, message: '25%！加油！' },
          { threshold: 0.5, message: '50%！继续！' },
          { threshold: 0.75, message: '75%！快完成了！' },
          { threshold: 1, message: '100%！太棒了！🎉' },
        ];
        for (const m of milestones) {
          if (progress >= m.threshold && lastMilestoneRef.current < m.threshold) {
            lastMilestoneRef.current = m.threshold;
            setMilestoneMessage(m.message);
            break;
          }
        }

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

        // Show encouraging message before revealing
        const msg = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
        setEncouragement(msg);

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
      className={showCelebrate ? 'animate-celebrate' : undefined}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-lg)',
        padding: 'var(--space-md)',
        position: 'relative',
      }}
    >
      {/* Progress */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
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
        <span
          style={{
            marginLeft: 'var(--space-xs)',
            fontSize: 'var(--font-size-sm)',
            fontFamily: 'var(--font-heading)',
            color: 'var(--color-text-light)',
          }}
        >
          {currentIndex + 1} / {words.length}
        </span>
      </div>

      {/* Milestone celebration */}
      <AnimatePresence>
        {milestoneMessage && (
          <motion.div
            key={milestoneMessage}
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--font-size-xl)',
              color: 'var(--color-primary)',
              textAlign: 'center',
            }}
          >
            {milestoneMessage}
          </motion.div>
        )}
      </AnimatePresence>

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
          <div
            style={{
              backgroundColor: 'rgba(0,0,0,0.03)',
              borderRadius: '50%',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WordImage emoji={currentWord.emoji} word={currentWord.english} size={160} />
          </div>
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

        {/* Encouraging message */}
        <AnimatePresence>
          {encouragement && !isRevealing && (
            <motion.div
              key={encouragement}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--font-size-xl)',
                color: 'var(--color-warning)',
                marginTop: 'var(--space-sm)',
              }}
            >
              {encouragement}
            </motion.div>
          )}
        </AnimatePresence>
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
                boxShadow: '0 3px 0 rgba(0,0,0,0.1)',
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

      {/* Floating +1 animation */}
      <AnimatePresence>
        {showPlusOne && (
          <motion.div
            key={plusOneKey}
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.8 }}
            onAnimationComplete={() => setShowPlusOne(false)}
            style={{
              position: 'absolute',
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--font-size-xl)',
              color: 'var(--color-success)',
              fontWeight: 'bold',
              pointerEvents: 'none',
            }}
          >
            +1
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
