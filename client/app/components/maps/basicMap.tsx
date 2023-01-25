import React, { useRef, useState } from 'react';
import type { MapProps } from '~/types/sharedTypes';
import {
  useCheckEnvironmentAndSetMap,
  useSetMapEventListeners,
  useSetMapOptions,
} from '~/utils/maps';

export default function BasicMap({
  style,
  children,
  onClick,
  onIdle,
  mapOptions,
}: MapProps) {
  const mapsRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();

  useCheckEnvironmentAndSetMap(mapsRef, setMap, map);
  useSetMapOptions(map, mapOptions);
  useSetMapEventListeners(map, onClick, onIdle);

  return (
    <>
      <h3>should be map here</h3>
      <div ref={mapsRef} style={style}></div>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // This ignore comes straight from the google docs
          // https://developers.google.com/maps/documentation/javascript/react-map#typescript_4
          // @ts-ignore
          return React.cloneElement(child, { map });
        }
      })}
    </>
  );
}
