import animalsData from './animals.json';
import colorsData from './colors.json';
import foodAndDrinkData from './food-and-drink.json';
import bodyAndFaceData from './body-and-face.json';
import clothesData from './clothes.json';
import familyAndFriendsData from './family-and-friends.json';
import homeData from './home.json';
import numbersData from './numbers.json';
import toysData from './toys.json';
import transportData from './transport.json';
import weatherData from './weather.json';
import schoolData from './school.json';
import sportsAndLeisureData from './sports-and-leisure.json';
import timeData from './time.json';
import placesData from './places.json';
import workData from './work.json';
import type { Word } from '@/types';

interface WordDataFile {
  topic: string;
  words: Omit<Word, 'topic'>[];
}

function loadTopic(data: WordDataFile): Word[] {
  return data.words.map(w => ({ ...w, topic: data.topic }));
}

export const allWords: Word[] = [
  ...loadTopic(animalsData as WordDataFile),
  ...loadTopic(colorsData as WordDataFile),
  ...loadTopic(foodAndDrinkData as WordDataFile),
  ...loadTopic(bodyAndFaceData as WordDataFile),
  ...loadTopic(clothesData as WordDataFile),
  ...loadTopic(familyAndFriendsData as WordDataFile),
  ...loadTopic(homeData as WordDataFile),
  ...loadTopic(numbersData as WordDataFile),
  ...loadTopic(toysData as WordDataFile),
  ...loadTopic(transportData as WordDataFile),
  ...loadTopic(weatherData as WordDataFile),
  ...loadTopic(schoolData as WordDataFile),
  ...loadTopic(sportsAndLeisureData as WordDataFile),
  ...loadTopic(timeData as WordDataFile),
  ...loadTopic(placesData as WordDataFile),
  ...loadTopic(workData as WordDataFile),
];

export function getWordsByTopic(topicId: string): Word[] {
  return allWords.filter(w => w.topic === topicId);
}

export function getWordsByLevel(level: string): Word[] {
  return allWords.filter(w => w.level === level);
}

export function getWordById(id: string): Word | undefined {
  return allWords.find(w => w.id === id);
}
