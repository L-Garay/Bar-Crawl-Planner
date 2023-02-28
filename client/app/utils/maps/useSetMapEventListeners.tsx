import { useEffect } from 'react';

const useSetMapEventListeners = (
  map?: google.maps.Map,
  onClick?: (event: google.maps.MapMouseEvent) => void,
  onIdle?: (map: google.maps.Map) => void
) => {
  useEffect(() => {
    if (map) {
      ['click', 'idle'].forEach((eventName) =>
        google.maps.event.clearListeners(map, eventName)
      );

      if (onClick) {
        map.addListener('click', onClick);
      }

      if (onIdle) {
        map.addListener('idle', () => onIdle(map));
      }
    }
  }, [map, onClick, onIdle]);
};

export default useSetMapEventListeners;
