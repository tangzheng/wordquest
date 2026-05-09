/**
 * User game state database service
 * Handles sync between local state and Supabase backend
 */

import { supabase } from './supabase';
import type { Level } from '@/types/word';
import type { WordMastery, DailyStreak, UserSettings } from '@/types/store';

// Types matching database schema
export interface DbGameState {
  id: string;
  current_level: Level;
  total_stars: number;
  daily_streak: number;
  last_play_date: string | null;
  grace_days_used: number;
  settings: UserSettings;
}

export interface DbWordMastery {
  id: string;
  user_id: string;
  word_id: string;
  box: number;
  last_review_date: string;
  next_review_date: string;
  correct_streak: number;
  total_attempts: number;
  total_correct: number;
}

export interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

/**
 * Get current authenticated user ID
 */
export async function getUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Sign in with email/password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

/**
 * Sign up new user
 */
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (userId: string | null) => void) {
  return supabase.auth.onAuthStateChange((_, session) => {
    callback(session?.user?.id ?? null);
  });
}

/**
 * Get user's game state
 */
export async function getGameState(userId: string): Promise<DbGameState | null> {
  const { data, error } = await supabase
    .from('game_states')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching game state:', error);
    return null;
  }
  return data;
}

/**
 * Update user's game state
 */
export async function updateGameState(
  userId: string,
  updates: Partial<{
    current_level: Level;
    total_stars: number;
    daily_streak: number;
    last_play_date: string;
    grace_days_used: number;
    settings: UserSettings;
  }>
): Promise<DbGameState | null> {
  const { data, error } = await supabase
    .from('game_states')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating game state:', error);
    return null;
  }
  return data;
}

/**
 * Get all word mastery for a user
 */
export async function getWordMastery(userId: string): Promise<Record<string, WordMastery>> {
  const { data, error } = await supabase
    .from('word_mastery')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching word mastery:', error);
    return {};
  }

  const mastery: Record<string, WordMastery> = {};
  data?.forEach((row) => {
    mastery[row.word_id] = {
      wordId: row.word_id,
      box: row.box as 1 | 2 | 3 | 4 | 5,
      lastReviewDate: row.last_review_date,
      nextReviewDate: row.next_review_date,
      correctStreak: row.correct_streak,
      totalAttempts: row.total_attempts,
      totalCorrect: row.total_correct,
    };
  });
  return mastery;
}

/**
 * Upsert word mastery (for both new words and updates)
 */
export async function upsertWordMastery(
  userId: string,
  wordId: string,
  box: number,
  correct: boolean,
  lastReviewDate: string
): Promise<void> {
  const { error } = await supabase.rpc('upsert_word_mastery', {
    p_user_id: userId,
    p_word_id: wordId,
    p_box: box,
    p_correct: correct,
    p_last_review: lastReviewDate,
  });

  if (error) {
    console.error('Error upserting word mastery:', error);
  }
}

/**
 * Batch upsert word mastery
 */
export async function batchUpsertWordMastery(
  userId: string,
  updates: Array<{
    wordId: string;
    box: number;
    correct: boolean;
    lastReviewDate: string;
  }>
): Promise<void> {
  // Process sequentially to avoid overwhelming the database
  for (const update of updates) {
    await upsertWordMastery(userId, update.wordId, update.box, update.correct, update.lastReviewDate);
  }
}

/**
 * Get user's badges
 */
export async function getUserBadges(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching badges:', error);
    return [];
  }

  return data?.map((row) => row.badge_id) ?? [];
}

/**
 * Add badge for user
 */
export async function addBadge(userId: string, badgeId: string): Promise<void> {
  const { error } = await supabase
    .from('user_badges')
    .upsert({ user_id: userId, badge_id: badgeId });

  if (error) {
    console.error('Error adding badge:', error);
  }
}

/**
 * Update daily streak
 */
export async function updateDailyStreak(userId: string): Promise<DailyStreak | null> {
  const state = await getGameState(userId);
  if (!state) return null;

  const today = new Date().toISOString().split('T')[0];
  const lastPlay = state.last_play_date;

  let newStreak = state.daily_streak;
  let graceDaysUsed = state.grace_days_used;

  if (lastPlay === today) {
    // Already played today
    return { current: newStreak, lastPlayDate: today, graceDaysUsed };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastPlay === yesterdayStr) {
    // Consecutive day
    newStreak += 1;
    graceDaysUsed = 0;
  } else if (lastPlay) {
    const lastDate = new Date(lastPlay);
    const daysDiff = Math.floor((yesterday.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff === 2 && graceDaysUsed < 1) {
      // Grace period used
      newStreak += 1;
      graceDaysUsed = 1;
    } else {
      // Streak broken
      newStreak = 1;
      graceDaysUsed = 0;
    }
  } else {
    // First time playing
    newStreak = 1;
  }

  await updateGameState(userId, {
    daily_streak: newStreak,
    last_play_date: today,
    grace_days_used: graceDaysUsed,
  });

  return { current: newStreak, lastPlayDate: today, graceDaysUsed };
}

/**
 * Sync local state to remote
 * Call this when user completes a game or makes significant progress
 */
export async function syncToRemote(userId: string, localState: {
  currentLevel: Level;
  wordMastery: Record<string, WordMastery>;
  totalStars: number;
  badges: string[];
  dailyStreak: DailyStreak;
  settings: UserSettings;
}): Promise<void> {
  // Update game state
  await updateGameState(userId, {
    current_level: localState.currentLevel,
    total_stars: localState.totalStars,
    daily_streak: localState.dailyStreak.current,
    last_play_date: localState.dailyStreak.lastPlayDate || undefined,
    grace_days_used: localState.dailyStreak.graceDaysUsed,
    settings: localState.settings,
  });

  // Sync word mastery
  const masteryUpdates = Object.entries(localState.wordMastery).map(([wordId, mastery]) => ({
    wordId,
    box: mastery.box,
    correct: true, // Not used in upsert
    lastReviewDate: mastery.lastReviewDate,
  }));
  await batchUpsertWordMastery(userId, masteryUpdates);

  // Sync badges
  for (const badgeId of localState.badges) {
    await addBadge(userId, badgeId);
  }
}

/**
 * Load user state from remote
 */
export async function loadFromRemote(userId: string): Promise<{
  currentLevel: Level;
  wordMastery: Record<string, WordMastery>;
  totalStars: number;
  badges: string[];
  dailyStreak: DailyStreak;
  settings: UserSettings;
} | null> {
  const gameState = await getGameState(userId);
  if (!gameState) return null;

  const mastery = await getWordMastery(userId);
  const badges = await getUserBadges(userId);

  return {
    currentLevel: gameState.current_level,
    wordMastery: mastery,
    totalStars: gameState.total_stars,
    badges,
    dailyStreak: {
      current: gameState.daily_streak,
      lastPlayDate: gameState.last_play_date || '',
      graceDaysUsed: gameState.grace_days_used,
    },
    settings: gameState.settings,
  };
}