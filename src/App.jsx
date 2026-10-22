import Cardhub from './components/Cardhub';
import ErrorBoundary from './components/ui/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <Cardhub />
    </ErrorBoundary>
  );
};

export default App;