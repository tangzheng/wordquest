import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconButton } from '@/components/ui/IconButton';
import { ALPHABET_DATA, getRandomLetters, type AlphabetLetter } from '@/data/alphabet';

interface AnswerResult {
  letterId: string;
  correct: boolean;
  timeMs: number;
}

const TOTAL_ROUNDS = 10;

export function AlphabetPlayScreen() {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [letters, setLetters] = useState<AlphabetLetter[]>([]);
  const [options, setOptions] = useState<AlphabetLetter[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [correctId, setCorrectId] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set());
  const [isRevealing, setIsRevealing] = useState(false);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationKey, setCelebrationKey] = useState(0);
  const startTimeRef = useRef(Date.now());
  const debounceRef = useRef(false);

  const isRecognizeMode = mode === 'recognize';
  const isSoundMode = mode === 'sound';
  const currentLetter = letters[currentIndex];
  const isLastRound = currentIndex >= TOTAL_ROUNDS - 1;

  // Initialize letters
  useEffect(() => {
    const shuffled = [...ALPHABET_DATA].sort(() => Math.random() - 0.5);
    setLetters(shuffled.slice(0, TOTAL_ROUNDS));
  }, []);

  // Generate options when letter changes
  useEffect(() => {
    if (!currentLetter) return;
    const distractors = getRandomLetters(3, currentLetter.id);
    const opts = [currentLetter, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(opts);
    setSelectedId(null);
    setCorrectId(null);
    setWrongIds(new Set());
    setIsRevealing(false);
    setAttempts(0);
    startTimeRef.current = Date.now();
    debounceRef.current = false;
  }, [currentIndex, currentLetter]);

  // Auto-play sound in sound mode
  useEffect(() => {
    if (isSoundMode && currentLetter && !isRevealing) {
      const utterance = new SpeechSynthesisUtterance(currentLetter.letter);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  }, [currentLetter, isSoundMode, isRevealing]);

  const speakLetter = useCallback((letter: AlphabetLetter) => {
    const utterance = new SpeechSynthesisUtterance(letter.letter);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  }, []);

  const handleSelect = useCallback(
    (option: AlphabetLetter) => {
      if (debounceRef.current || isRevealing || wrongIds.has(option.id)) return;
      debounceRef.current = true;
      setTimeout(() => { debounceRef.current = false; }, 300);

      const isCorrect = option.id === currentLetter.id;
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (isCorrect) {
        setSelectedId(option.id);
        setCorrectId(option.id);
        speakLetter(currentLetter);

        const answer: AnswerResult = {
          letterId: currentLetter.id,
          correct: true,
          timeMs: Date.now() - startTimeRef.current,
        };
        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);

        setShowCelebration(true);
        setCelebrationKey((k) => k + 1);

        setTimeout(() => {
          if (isLastRound) {
            // Navigate to results
            const correctCount = newAnswers.filter((a) => a.correct).length;
            navigate('/results', {
              state: {
                answers: newAnswers,
                stars: Math.round((correctCount / TOTAL_ROUNDS) * 3),
                accuracy: (correctCount / TOTAL_ROUNDS) * 100,
                mode: isRecognizeMode ? 'alphabet-recognize' : 'alphabet-sound',
                isAlphabet: true,
              },
              replace: true,
            });
          } else {
            setCurrentIndex((i) => i + 1);
          }
        }, 1000);
      } else {
        setWrongIds((prev) => new Set(prev).add(option.id));

        // After 1 wrong attempt, reveal correct answer
        if (newAttempts >= 1) {
          setIsRevealing(true);
          setCorrectId(currentLetter.id);
          speakLetter(currentLetter);

          const answer: AnswerResult = {
            letterId: currentLetter.id,
            correct: false,
            timeMs: Date.now() - startTimeRef.current,
          };
          const newAnswers = [...answers, answer];
          setAnswers(newAnswers);

          setTimeout(() => {
            if (isLastRound) {
              const correctCount = newAnswers.filter((a) => a.correct).length;
              navigate('/results', {
                state: {
                  answers: newAnswers,
                  stars: Math.round((correctCount / TOTAL_ROUNDS) * 3),
                  accuracy: (correctCount / TOTAL_ROUNDS) * 100,
                  mode: isRecognizeMode ? 'alphabet-recognize' : 'alphabet-sound',
                  isAlphabet: true,
                },
                replace: true,
              });
            } else {
              setCurrentIndex((i) => i + 1);
            }
          }, 2000);
        }
      }
    },
    [currentLetter, attempts, answers, isLastRound, wrongIds, isRevealing, speakLetter, navigate, isRecognizeMode]
  );

  if (!currentLetter || letters.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: 'var(--space-md) var(--space-lg)',
            borderBottom: '2px solid var(--color-border)',
          }}
        >
          <IconButton onClick={() => navigate('/alphabet')}>←</IconButton>
          <h2
            style={{
              flex: 1,
              textAlign: 'center',
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--font-size-xl)',
            }}
          >
            准备中...
          </h2>
          <div style={{ width: '40px' }} />
        </div>
      </div>
    );
  }

  const modeTitle = isRecognizeMode ? '🖼️ 认字母' : '🔊 听音辨字母';

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-background)',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: 'var(--space-md) var(--space-lg)',
          borderBottom: '2px solid var(--color-border)',
        }}
      >
        <IconButton onClick={() => navigate('/alphabet')}>←</IconButton>
        <h2
          style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--font-size-xl)',
            color: 'var(--color-primary)',
          }}
        >
          {modeTitle}
        </h2>
        <div style={{ width: '40px' }} />
      </div>

      {/* Progress */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 'var(--space-xs)',
          padding: 'var(--space-md)',
          fontSize: 'var(--font-size-md)',
          color: 'var(--color-text-light)',
        }}
      >
        {letters.slice(0, TOTAL_ROUNDS).map((_, i) => (
          <div
            key={i}
            style={{
              width: '10px',
              height: '10px',
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
            marginLeft: 'var(--space-sm)',
            fontSize: 'var(--font-size-sm)',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {currentIndex + 1} / {TOTAL_ROUNDS}
        </span>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-xl)',
          padding: 'var(--space-lg)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLetter.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-md)',
            }}
          >
            {/* Big Letter or Sound Prompt */}
            <div
              style={{
                backgroundColor: currentLetter.color,
                borderRadius: '24px',
                padding: '32px 48px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}
            >
              {isRecognizeMode ? (
                <div
                  style={{
                    fontSize: '120px',
                    fontWeight: 'bold',
                    color: 'white',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                    lineHeight: 1,
                  }}
                >
                  {currentLetter.letter}
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                  }}
                >
                  <div style={{ fontSize: '64px' }}>🔊</div>
                  <div
                    style={{
                      fontSize: 'var(--font-size-lg)',
                      color: 'white',
                      fontFamily: 'var(--font-heading)',
                    }}
                  >
                    点击播放听发音
                  </div>
                </div>
              )}
            </div>

            {/* Sound button for recognize mode, or auto-played letter display */}
            {isRecognizeMode && (
              <button
                onClick={() => speakLetter(currentLetter)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)',
                  padding: 'var(--space-md) var(--space-lg)',
                  backgroundColor: 'var(--color-card)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: 'var(--font-size-lg)',
                  cursor: 'pointer',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.1)',
                }}
              >
                <span style={{ fontSize: '24px' }}>🔊</span>
                <span>听发音</span>
              </button>
            )}

            {/* Keyword display */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                fontSize: 'var(--font-size-lg)',
                color: 'var(--color-text-light)',
              }}
            >
              <span>{currentLetter.emoji}</span>
              <span>{currentLetter.keyword}</span>
              <span>({currentLetter.keywordChinese})</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Options Grid */}
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
            const isSelected = option.id === selectedId;

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
                  minHeight: '80px',
                  padding: 'var(--space-md)',
                  borderRadius: '16px',
                  border: isCorrectOption
                    ? '4px solid var(--color-success)'
                    : isWrong
                    ? '4px solid var(--color-error)'
                    : '3px solid transparent',
                  backgroundColor: isCorrectOption
                    ? 'rgba(81, 207, 102, 0.2)'
                    : isWrong
                    ? 'rgba(255, 135, 135, 0.2)'
                    : option.color + '20',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: isRecognizeMode ? '48px' : '36px',
                  fontWeight: 'bold',
                  cursor: isWrong || isRevealing ? 'default' : 'pointer',
                  opacity: isWrong ? 0.5 : 1,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  transition: 'transform 0.1s ease, background-color 0.2s ease',
                }}
                onMouseDown={(e) => {
                  if (!isWrong && !isRevealing) e.currentTarget.style.transform = 'scale(0.95)';
                }}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {isRecognizeMode ? option.emoji : option.letter}
                {isSelected && ' ✓'}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            key={celebrationKey}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onAnimationComplete={() => setShowCelebration(false)}
            style={{
              position: 'absolute',
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '80px',
              pointerEvents: 'none',
              zIndex: 100,
            }}
          >
            ⭐
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
