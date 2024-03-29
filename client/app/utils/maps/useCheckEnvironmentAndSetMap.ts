import type { Dispatch, RefObject } from 'react';
import { useEffect } from 'react';

const useCheckEnvironmentAndSetMap = (
  ref: RefObject<HTMLElement>,
  setMap: Dispatch<React.SetStateAction<google.maps.Map | undefined>>,
  map?: google.maps.Map
) => {
  useEffect(() => {
    const validWindow =
      window && typeof window !== 'undefined' && window.google;
    if (validWindow && ref.current && !map) {
      setMap(
        new window.google.maps.Map(ref.current, {
          center: { lat: 43.6141397, lng: -116.2155451 }, // TODO centered on Boise, will need to update to center on user's location (or default to Boise)
          zoom: 13,
          backgroundColor: 'lightpink',
        })
      );
    }
  }, [ref, setMap, map]);
};

export default useCheckEnvironmentAndSetMap;
