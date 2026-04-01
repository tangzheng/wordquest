import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Word, AnswerResult } from '@/types';
import { PictureWordMatch } from '@/components/game/PictureWordMatch/PictureWordMatch';
import { ListenAndSpell } from '@/components/game/ListenAndSpell/ListenAndSpell';
import { WordMatching } from '@/components/game/WordMatching/WordMatching';

interface ComprehensiveModeProps {
  words: Word[];
  onComplete: (answers: AnswerResult[]) => void;
}

interface Phase {
  mode: 'picture-word' | 'listen-spell' | 'word-matching';
  words: Word[];
  label: string;
  icon: string;
}

/**
 * Comprehensive mode — cycles through all 3 game modes in one session.
 *
 * Splits words into 3 phases:
 * - Phase 1: PictureWordMatch (first ~1/3 of words)
 * - Phase 2: ListenAndSpell (next ~1/3 of words)
 * - Phase 3: WordMatching (remaining words, min 4 for pairs)
 */
export function ComprehensiveMode({ words, onComplete }: ComprehensiveModeProps) {
  const phases = buildPhases(words);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [allAnswers, setAllAnswers] = useState<AnswerResult[]>([]);
  const [transitioning, setTransitioning] = useState(false);

  const phase = phases[currentPhase];

  const handlePhaseComplete = useCallback(
    (answers: AnswerResult[]) => {
      const combined = [...allAnswers, ...answers];

      if (currentPhase >= phases.length - 1) {
        // All phases done
        onComplete(combined);
      } else {
        // Show transition, then next phase
        setAllAnswers(combined);
        setTransitioning(true);
        setTimeout(() => {
          setCurrentPhase((i) => i + 1);
          setTransitioning(false);
        }, 1800);
      }
    },
    [allAnswers, currentPhase, phases.length, onComplete]
  );

  // Phase transition screen
  if (transitioning) {
    const next = phases[currentPhase + 1];
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-lg)',
          padding: 'var(--space-xl)',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          style={{ fontSize: '64px' }}
        >
          {next?.icon}
        </motion.div>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--font-size-xl)',
            color: 'var(--color-text)',
            textAlign: 'center',
          }}
        >
          下一关：{next?.label}
        </motion.p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '60%' }}
          transition={{ duration: 1.2, delay: 0.4 }}
          style={{
            height: '6px',
            borderRadius: '3px',
            backgroundColor: 'var(--color-primary)',
          }}
        />
      </motion.div>
    );
  }

  if (!phase) return null;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Phase indicator */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--space-sm)',
          padding: 'var(--space-sm)',
        }}
      >
        {phases.map((p, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor:
                i < currentPhase
                  ? 'var(--color-success)'
                  : i === currentPhase
                  ? 'var(--color-primary)'
                  : 'rgba(0,0,0,0.08)',
              color: i <= currentPhase ? 'white' : 'var(--color-text-light)',
              fontSize: 'var(--font-size-sm)',
              fontFamily: 'var(--font-heading)',
              transition: 'all 0.3s',
            }}
          >
            <span>{p.icon}</span>
            <span>{i < currentPhase ? '✓' : i + 1}</span>
          </div>
        ))}
      </div>

      {/* Game component for current phase */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhase}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          {phase.mode === 'picture-word' && (
            <PictureWordMatch words={phase.words} onComplete={handlePhaseComplete} />
          )}
          {phase.mode === 'listen-spell' && (
            <ListenAndSpell words={phase.words} onComplete={handlePhaseComplete} />
          )}
          {phase.mode === 'word-matching' && (
            <WordMatching words={phase.words} onComplete={handlePhaseComplete} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * Split words into 3 phases for comprehensive mode.
 * Ensures WordMatching gets at least 4 words (needs pairs).
 */
function buildPhases(words: Word[]): Phase[] {
  const total = words.length;

  if (total < 6) {
    // Too few words — just use 2 phases (skip matching)
    const mid = Math.ceil(total / 2);
    return [
      { mode: 'picture-word', words: words.slice(0, mid), label: '看图选词', icon: '🖼️' },
      { mode: 'listen-spell', words: words.slice(mid), label: '听音拼写', icon: '🔊' },
    ];
  }

  // Standard split: ~3 + ~3 + rest(≥4)
  const matchCount = Math.max(4, Math.floor(total / 3));
  const remaining = total - matchCount;
  const pictureCount = Math.ceil(remaining / 2);
  const spellCount = remaining - pictureCount;

  return [
    { mode: 'picture-word', words: words.slice(0, pictureCount), label: '看图选词', icon: '🖼️' },
    { mode: 'listen-spell', words: words.slice(pictureCount, pictureCount + spellCount), label: '听音拼写', icon: '🔊' },
    { mode: 'word-matching', words: words.slice(pictureCount + spellCount), label: '单词配对', icon: '🔗' },
  ];
}
