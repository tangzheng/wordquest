export type Level = 'starters' | 'movers' | 'flyers';

export interface Word {
  id: string;
  english: string;
  chinese: string;
  emoji: string;
  emojiAlt: string[];
  level: Level;
  phonetic: string;
  tags: string[];
  letterCount: number;
  frequency: number;
  topic: string;
}

export interface TopicMeta {
  id: string;
  nameEn: string;
  nameCn: string;
  icon: string;
  color: string;
  levels: Level[];
  badge: {
    name: string;
    nameCn: string;
    icon: string;
    requirement: { masteredWords: number; minStars: number };
  };
}
