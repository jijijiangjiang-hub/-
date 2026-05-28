import LoadingPage from './components/LoadingPage';
import EyeTransition from './components/EyeTransition';
import MainInterface from './components/MainInterface';
import CustomCursor from './components/CustomCursor';

function App() {
  return (
    <main className="app-shell">
      <LoadingPage />
      <EyeTransition />
      <MainInterface />
      <CustomCursor />
    </main>
  );
}

export default App;
