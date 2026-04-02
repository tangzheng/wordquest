export interface AlphabetLetter {
  id: string;
  letter: string;
  lowerCase: string;
  sound: string;
  keyword: string;
  keywordChinese: string;
  emoji: string;
  color: string;
}

export const ALPHABET_DATA: AlphabetLetter[] = [
  { id: 'letter_a', letter: 'A', lowerCase: 'a', sound: '/eɪ/', keyword: 'Apple', keywordChinese: '苹果', emoji: '🍎', color: '#FF6B6B' },
  { id: 'letter_b', letter: 'B', lowerCase: 'b', sound: '/biː/', keyword: 'Ball', keywordChinese: '球', emoji: '⚽', color: '#4ECDC4' },
  { id: 'letter_c', letter: 'C', lowerCase: 'c', sound: '/siː/', keyword: 'Cat', keywordChinese: '猫', emoji: '🐱', color: '#9B59B6' },
  { id: 'letter_d', letter: 'D', lowerCase: 'd', sound: '/diː/', keyword: 'Dog', keywordChinese: '狗', emoji: '🐕', color: '#F39C12' },
  { id: 'letter_e', letter: 'E', lowerCase: 'e', sound: '/iː/', keyword: 'Egg', keywordChinese: '鸡蛋', emoji: '🥚', color: '#1ABC9C' },
  { id: 'letter_f', letter: 'F', lowerCase: 'f', sound: '/ɛf/', keyword: 'Fish', keywordChinese: '鱼', emoji: '🐟', color: '#3498DB' },
  { id: 'letter_g', letter: 'G', lowerCase: 'g', sound: '/dʒiː/', keyword: 'Grape', keywordChinese: '葡萄', emoji: '🍇', color: '#E74C3C' },
  { id: 'letter_h', letter: 'H', lowerCase: 'h', sound: '/eɪtʃ/', keyword: 'House', keywordChinese: '房子', emoji: '🏠', color: '#2ECC71' },
  { id: 'letter_i', letter: 'I', lowerCase: 'i', sound: '/aɪ/', keyword: 'Ice cream', keywordChinese: '冰淇淋', emoji: '🍦', color: '#E91E63' },
  { id: 'letter_j', letter: 'J', lowerCase: 'j', sound: '/dʒeɪ/', keyword: 'Juice', keywordChinese: '果汁', emoji: '🧃', color: '#FF9800' },
  { id: 'letter_k', letter: 'K', lowerCase: 'k', sound: '/keɪ/', keyword: 'Kite', keywordChinese: '风筝', emoji: '🪁', color: '#00BCD4' },
  { id: 'letter_l', letter: 'L', lowerCase: 'l', sound: '/ɛl/', keyword: 'Lion', keywordChinese: '狮子', emoji: '🦁', color: '#FFEB3B' },
  { id: 'letter_m', letter: 'M', lowerCase: 'm', sound: '/ɛm/', keyword: 'Moon', keywordChinese: '月亮', emoji: '🌙', color: '#8BC34A' },
  { id: 'letter_n', letter: 'N', lowerCase: 'n', sound: '/ɛn/', keyword: 'Nest', keywordChinese: '鸟窝', emoji: '🪺', color: '#FF5722' },
  { id: 'letter_o', letter: 'O', lowerCase: 'o', sound: '/oʊ/', keyword: 'Orange', keywordChinese: '橙子', emoji: '🍊', color: '#795548' },
  { id: 'letter_p', letter: 'P', lowerCase: 'p', sound: '/piː/', keyword: 'Pig', keywordChinese: '猪', emoji: '🐷', color: '#9C27B0' },
  { id: 'letter_q', letter: 'Q', lowerCase: 'q', sound: '/kjuː/', keyword: 'Queen', keywordChinese: '女王', emoji: '👑', color: '#673AB7' },
  { id: 'letter_r', letter: 'R', lowerCase: 'r', sound: '/ɑːr/', keyword: 'Rainbow', keywordChinese: '彩虹', emoji: '🌈', color: '#F44336' },
  { id: 'letter_s', letter: 'S', lowerCase: 's', sound: '/ɛs/', keyword: 'Sun', keywordChinese: '太阳', emoji: '☀️', color: '#FF9800' },
  { id: 'letter_t', letter: 'T', lowerCase: 't', sound: '/tiː/', keyword: 'Tree', keywordChinese: '树', emoji: '🌳', color: '#4CAF50' },
  { id: 'letter_u', letter: 'U', lowerCase: 'u', sound: '/juː/', keyword: 'Umbrella', keywordChinese: '雨伞', emoji: '☂️', color: '#2196F3' },
  { id: 'letter_v', letter: 'V', lowerCase: 'v', sound: '/viː/', keyword: 'Violin', keywordChinese: '小提琴', emoji: '🎻', color: '#9C27B0' },
  { id: 'letter_w', letter: 'W', lowerCase: 'w', sound: '/ˈdʌbəljuː/', keyword: 'Water', keywordChinese: '水', emoji: '💧', color: '#03A9F4' },
  { id: 'letter_x', letter: 'X', lowerCase: 'x', sound: '/ɛks/', keyword: 'Box', keywordChinese: '盒子', emoji: '📦', color: '#607D8B' },
  { id: 'letter_y', letter: 'Y', lowerCase: 'y', sound: '/waɪ/', keyword: 'Yellow', keywordChinese: '黄色', emoji: '🌻', color: '#FFEB3B' },
  { id: 'letter_z', letter: 'Z', lowerCase: 'z', sound: '/ziː/', keyword: 'Zoo', keywordChinese: '动物园', emoji: '🦓', color: '#8D6E63' },
];

export const getLetterById = (id: string): AlphabetLetter | undefined => {
  return ALPHABET_DATA.find(l => l.id === id);
};

export const getRandomLetters = (count: number, excludeId?: string): AlphabetLetter[] => {
  const filtered = excludeId ? ALPHABET_DATA.filter(l => l.id !== excludeId) : ALPHABET_DATA;
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
