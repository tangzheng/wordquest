import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { TopicSelectScreen } from '@/components/screens/TopicSelectScreen';
import { GameModeSelectScreen } from '@/components/screens/GameModeSelectScreen';
import { GamePlayScreen } from '@/components/screens/GamePlayScreen';
import { ResultsScreen } from '@/components/screens/ResultsScreen';
import { ProgressScreen } from '@/components/screens/ProgressScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';

function App() {
  return (
    <BrowserRouter basename="/wordquest">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/topics" element={<TopicSelectScreen />} />
        <Route path="/mode/:topicId" element={<GameModeSelectScreen />} />
        <Route path="/play/:topicId/:mode" element={<GamePlayScreen />} />
        <Route path="/results" element={<ResultsScreen />} />
        <Route path="/progress" element={<ProgressScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
