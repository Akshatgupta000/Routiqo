import React, { useEffect } from 'react';
import Landing from './pages/Landing';

function App() {
  useEffect(() => {
    // Force scroll to top on refresh
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <Landing />
  );
}

export default App;
