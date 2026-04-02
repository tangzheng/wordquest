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
import plantsData from './plants.json';
import verbsData from './verbs.json';
import adjectivesData from './adjectives.json';
import fruitsData from './fruits.json';
import vegetablesData from './vegetables.json';
import natureData from './nature.json';
import feelingsData from './feelings.json';
import shapesData from './shapes.json';
import spaceData from './space.json';
import schoolsuppliesData from './schoolsupplies.json';
import classroomData from './classroom.json';
import dailyData from './daily.json';
import oppositesData from './opposites.json';
import communityData from './community.json';
import technologyData from './technology.json';
import jobsData from './jobs.json';
import beachData from './beach.json';
import campingData from './camping.json';
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
  ...loadTopic(plantsData as WordDataFile),
  ...loadTopic(verbsData as WordDataFile),
  ...loadTopic(adjectivesData as WordDataFile),
  ...loadTopic(fruitsData as WordDataFile),
  ...loadTopic(vegetablesData as WordDataFile),
  ...loadTopic(natureData as WordDataFile),
  ...loadTopic(feelingsData as WordDataFile),
  ...loadTopic(shapesData as WordDataFile),
  ...loadTopic(spaceData as WordDataFile),
  ...loadTopic(schoolsuppliesData as WordDataFile),
  ...loadTopic(classroomData as WordDataFile),
  ...loadTopic(dailyData as WordDataFile),
  ...loadTopic(oppositesData as WordDataFile),
  ...loadTopic(communityData as WordDataFile),
  ...loadTopic(technologyData as WordDataFile),
  ...loadTopic(jobsData as WordDataFile),
  ...loadTopic(beachData as WordDataFile),
  ...loadTopic(campingData as WordDataFile),
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
