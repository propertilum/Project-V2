import { useState } from 'react';
import Cardhub from './components/Cardhub';
import ErrorBoundary from './components/ui/ErrorBoundary';
import SplashScreen from './components/SplashScreen';

const App = () => {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <ErrorBoundary>
      {splashDone
        ? <Cardhub />
        : <SplashScreen onComplete={() => setSplashDone(true)} />
      }
    </ErrorBoundary>
  );
};

export default App;
