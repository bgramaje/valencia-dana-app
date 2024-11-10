import { useState, useEffect } from 'react';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const updateMatches = () => setMatches(mediaQueryList.matches);

    // Check initial state
    updateMatches();

    // Listen for changes in media query
    mediaQueryList.addEventListener('change', updateMatches);

    // Cleanup on unmount
    return () => {
      mediaQueryList.removeEventListener('change', updateMatches);
    };
  }, [query]);

  return matches;
}

export default useMediaQuery;
