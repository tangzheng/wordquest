import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { GameMode, AnswerResult, Word } from '@/types';
import type { WordMastery } from '@/types/store';
import { allWords } from '@/data/words';
import { getTopicById } from '@/data/topics';
import { useGameStore } from '@/store/useGameStore';
import { createSessionConfig } from '@/engine/sessionManager';
import { calculateStars, calculateAccuracy } from '@/engine/scoring';
import { checkNewBadges } from '@/engine/badges';
import { TopBar } from '@/components/layout/TopBar';
import { PictureWordMatch } from '@/components/game/PictureWordMatch/PictureWordMatch';
import { ListenAndSpell } from '@/components/game/ListenAndSpell/ListenAndSpell';
import { WordMatching } from '@/components/game/WordMatching/WordMatching';
import { ComprehensiveMode } from '@/components/game/ComprehensiveMode/ComprehensiveMode';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function GamePlayScreen() {
  const { topicId, mode } = useParams<{ topicId: string; mode: string }>();
  const navigate = useNavigate();
  const currentLevel = useGameStore((s) => s.currentLevel);
  const wordMastery = useGameStore((s) => s.wordMastery);
  const updateMastery = useGameStore((s) => s.updateMastery);
  const addStars = useGameStore((s) => s.addStars);
  const badges = useGameStore((s) => s.badges);
  const addBadge = useGameStore((s) => s.addBadge);
  const totalStars = useGameStore((s) => s.totalStars);
  const dailyStreak = useGameStore((s) => s.dailyStreak);
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [isReady, setIsReady] = useState(false);

  const topic = topicId ? getTopicById(topicId) : undefined;
  const gameMode = mode as GameMode;

  // Create session
  useEffect(() => {
    if (!topicId || !mode) return;

    const config = createSessionConfig(
      allWords,
      wordMastery,
      topicId,
      currentLevel,
      gameMode
    );

    if (config.words.length === 0) {
      // No words available, go back
      navigate(-1);
      return;
    }

    setSessionWords(config.words);
    setIsReady(true);
  }, []); // Only run once on mount

  const handleComplete = useCallback(
    (answers: AnswerResult[]) => {
      // Update mastery for each answered word
      answers.forEach((answer) => {
        updateMastery(answer.wordId, answer.correct);
      });

      // Calculate and add stars
      const accuracy = calculateAccuracy(answers);
      const stars = calculateStars(accuracy);
      addStars(stars);

      type PreviewMastery = Record<string, WordMastery & { wordId: string; box: number }>;
      // (store updates are batched, so wordMastery may not reflect updates yet)
      const previewMastery: PreviewMastery = { ...wordMastery };
      answers.forEach((answer) => {
        const existing = previewMastery[answer.wordId];
        if (!existing) {
          previewMastery[answer.wordId] = {
            wordId: answer.wordId,
            box: answer.correct ? 2 : 1,
            lastReviewDate: new Date().toISOString().split('T')[0],
            nextReviewDate: new Date().toISOString().split('T')[0],
            correctStreak: answer.correct ? 1 : 0,
            totalAttempts: 1,
            totalCorrect: answer.correct ? 1 : 0,
          };
        } else {
          previewMastery[answer.wordId] = {
            ...existing,
            box: answer.correct ? Math.min(existing.box + 1, 5) as 1|2|3|4|5 : 1,
            correctStreak: answer.correct ? existing.correctStreak + 1 : 0,
            totalAttempts: existing.totalAttempts + 1,
            totalCorrect: existing.totalCorrect + (answer.correct ? 1 : 0),
          };
        }
      });

      const newBadges = checkNewBadges(
        previewMastery,
        badges,
        totalStars + stars,
        dailyStreak.current,
        stars
      );
      newBadges.forEach((id) => addBadge(id));

      // Navigate to results
      navigate('/results', {
        state: {
          answers,
          stars,
          accuracy,
          topic: topicId,
          mode: gameMode,
          words: sessionWords,
          newBadges,
        },
        replace: true,
      });
    },
    [updateMastery, addStars, navigate, topicId, gameMode, sessionWords, wordMastery, badges, totalStars, dailyStreak, addBadge]
  );

  if (!isReady || sessionWords.length === 0) {
    return <LoadingSpinner message="准备中..." />;
  }

  const modeNames: Record<string, string> = {
    'picture-word': '🖼️ 看图选词',
    'listen-spell': '🔊 听音拼写',
    'word-matching': '🔗 单词配对',
    'comprehensive': '🌟 综合挑战',
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title={`${topic?.icon ?? ''} ${modeNames[gameMode] ?? '游戏'}`} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {gameMode === 'picture-word' && (
          <PictureWordMatch words={sessionWords} onComplete={handleComplete} />
        )}
        {gameMode === 'listen-spell' && (
          <ListenAndSpell words={sessionWords} onComplete={handleComplete} />
        )}
        {gameMode === 'word-matching' && (
          <WordMatching words={sessionWords} onComplete={handleComplete} />
        )}
        {gameMode === 'comprehensive' && (
          <ComprehensiveMode words={sessionWords} onComplete={handleComplete} />
        )}
      </div>
    </div>
  );
}
