import type { TopicMeta } from '@/types';
import { TOPICS } from '@/data/topics';
import { getWordsByTopic } from '@/data/words';
import { isMastered } from './spacedRepetition';
import type { WordMastery } from '@/types';

export interface BadgeDefinition {
  id: string;
  name: string;
  nameCn: string;
  icon: string;
  description: string;
  descriptionCn: string;
  category: 'topic' | 'streak' | 'milestone';
}

// Generate topic badges from TOPICS metadata
const topicBadges: BadgeDefinition[] = TOPICS.map((topic) => ({
  id: `master-${topic.id}`,
  name: topic.badge.name,
  nameCn: topic.badge.nameCn,
  icon: topic.badge.icon,
  description: `Master ${topic.badge.requirement.masteredWords} ${topic.nameEn} words`,
  descriptionCn: `掌握 ${topic.badge.requirement.masteredWords} 个${topic.nameCn}单词`,
  category: 'topic' as const,
}));

// Streak badges
const streakBadges: BadgeDefinition[] = [
  {
    id: 'streak-3',
    name: 'Hot Starter',
    nameCn: '三天小火苗',
    icon: '🔥',
    description: 'Maintain a 3-day streak',
    descriptionCn: '连续学习3天',
    category: 'streak',
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    nameCn: '一周勇士',
    icon: '⚡',
    description: 'Maintain a 7-day streak',
    descriptionCn: '连续学习7天',
    category: 'streak',
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    nameCn: '月度冠军',
    icon: '👑',
    description: 'Maintain a 30-day streak',
    descriptionCn: '连续学习30天',
    category: 'streak',
  },
];

// Milestone badges
const milestoneBadges: BadgeDefinition[] = [
  {
    id: 'first-game',
    name: 'First Step',
    nameCn: '第一步',
    icon: '👣',
    description: 'Complete your first game',
    descriptionCn: '完成第一次游戏',
    category: 'milestone',
  },
  {
    id: 'first-perfect',
    name: 'Perfect Round',
    nameCn: '满分时刻',
    icon: '💯',
    description: 'Get 3 stars in a round',
    descriptionCn: '在一轮游戏中获得3颗星',
    category: 'milestone',
  },
  {
    id: 'words-50',
    name: 'Word Explorer',
    nameCn: '单词探索者',
    icon: '🗺️',
    description: 'Learn 50 words',
    descriptionCn: '学习50个单词',
    category: 'milestone',
  },
  {
    id: 'words-100',
    name: 'Word Collector',
    nameCn: '单词收藏家',
    icon: '📚',
    description: 'Learn 100 words',
    descriptionCn: '学习100个单词',
    category: 'milestone',
  },
  {
    id: 'words-200',
    name: 'Word Champion',
    nameCn: '单词冠军',
    icon: '🏆',
    description: 'Learn 200 words',
    descriptionCn: '学习200个单词',
    category: 'milestone',
  },
  {
    id: 'stars-10',
    name: 'Star Collector',
    nameCn: '星星收集者',
    icon: '🌟',
    description: 'Earn 10 stars',
    descriptionCn: '获得10颗星星',
    category: 'milestone',
  },
  {
    id: 'stars-50',
    name: 'Star Master',
    nameCn: '星星大师',
    icon: '✨',
    description: 'Earn 50 stars',
    descriptionCn: '获得50颗星星',
    category: 'milestone',
  },
];

export const ALL_BADGES: BadgeDefinition[] = [
  ...topicBadges,
  ...streakBadges,
  ...milestoneBadges,
];

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return ALL_BADGES.find((b) => b.id === id);
}

/**
 * Check which new badges the player has earned
 * Returns badge IDs that are newly earned (not already in earnedBadges)
 */
export function checkNewBadges(
  wordMastery: Record<string, WordMastery>,
  earnedBadges: string[],
  totalStars: number,
  streakDays: number,
  latestStars?: number
): string[] {
  const newBadges: string[] = [];
  const totalLearned = Object.keys(wordMastery).length;

  for (const badge of ALL_BADGES) {
    if (earnedBadges.includes(badge.id)) continue;

    let earned = false;

    // Topic mastery badges
    if (badge.id.startsWith('master-')) {
      const topicId = badge.id.replace('master-', '');
      const topic = TOPICS.find((t) => t.id === topicId);
      if (topic) {
        const topicWords = getWordsByTopic(topicId);
        const masteredCount = topicWords.filter((w) => {
          const m = wordMastery[w.id];
          return m && isMastered(m);
        }).length;
        earned = masteredCount >= topic.badge.requirement.masteredWords;
      }
    }

    // Streak badges
    if (badge.id === 'streak-3') earned = streakDays >= 3;
    if (badge.id === 'streak-7') earned = streakDays >= 7;
    if (badge.id === 'streak-30') earned = streakDays >= 30;

    // Milestone badges
    if (badge.id === 'first-game') earned = totalLearned > 0;
    if (badge.id === 'first-perfect') earned = latestStars === 3;
    if (badge.id === 'words-50') earned = totalLearned >= 50;
    if (badge.id === 'words-100') earned = totalLearned >= 100;
    if (badge.id === 'words-200') earned = totalLearned >= 200;
    if (badge.id === 'stars-10') earned = totalStars >= 10;
    if (badge.id === 'stars-50') earned = totalStars >= 50;

    if (earned) {
      newBadges.push(badge.id);
    }
  }

  return newBadges;
}
