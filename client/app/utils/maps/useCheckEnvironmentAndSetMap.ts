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
          center: { lat: 43.590112, lng: -116.3527013 },
          zoom: 13,
          backgroundColor: 'lightpink',
        })
      );
    }
  }, [ref, setMap, map]);
};

export default useCheckEnvironmentAndSetMap;
