import { useEffect } from 'react';

const useSetMapEventListeners = (
  map?: google.maps.Map,
  onClick?: (event: google.maps.MapMouseEvent) => void,
  onIdle?: (map: google.maps.Map) => void,
  events?: { [key: string]: any }
) => {
  // useEffect(() => {
  //   if (map && events) {
  //     // clear all listeners
  //     Object.keys(events).forEach((key) => {
  //       google.maps.event.clearListeners(map, key);
  //     });
  //     // add new listeners
  //     Object.keys(events).forEach((key) => {
  //       map.addListener(key, events[key]);
  //     });
  //   }
  // }, [map, events]);

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
