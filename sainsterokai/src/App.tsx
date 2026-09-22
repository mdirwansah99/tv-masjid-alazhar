// =============================================
// SainsTerokai — Main App (Screen Router)
// =============================================

import { useGameStore } from './store/gameStore';
import SplashScreen from './components/SplashScreen';
import CharacterSelect from './components/CharacterSelect';
import WorldMap from './components/WorldMap';
import TopicSelect from './components/TopicSelect';
import ResultScreen from './components/ResultScreen';
import ProfileScreen from './components/ProfileScreen';
import QuizGame from './games/QuizGame';
import DragDropGame from './games/DragDropGame';
import LabExperiment from './games/LabExperiment';

function App() {
  const screen = useGameStore((s) => s.screen);
  const gameType = useGameStore((s) => s.currentGameType);

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return <SplashScreen />;
      case 'character-select':
        return <CharacterSelect />;
      case 'world-map':
        return <WorldMap />;
      case 'topic-select':
        return <TopicSelect />;
      case 'game':
        switch (gameType) {
          case 'quiz':
            return <QuizGame />;
          case 'drag-drop':
            return <DragDropGame />;
          case 'lab-experiment':
            return <LabExperiment />;
          default:
            return <WorldMap />;
        }
      case 'result':
        return <ResultScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <SplashScreen />;
    }
  };

  return <>{renderScreen()}</>;
}

export default App;
