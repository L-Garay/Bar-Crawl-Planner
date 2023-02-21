import { useEffect, useState } from 'react';

export const useIsDomLoaded = () => {
  const [isDomLoaded, setIsDomLoaded] = useState(false);
  useEffect(() => {
    setIsDomLoaded(true);
  }, []);
  return isDomLoaded;
};
