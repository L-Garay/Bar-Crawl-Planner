import React, { useRef, useState } from 'react';
import {
  useCheckEnvironmentAndSetMap,
  useSetMapEventListeners,
  useSetMapOptions,
} from '~/utils/maps';

interface MapProps extends google.maps.MapOptions {
  style: { [key: string]: string };
  children?: React.ReactNode;
  onClick?: (event: google.maps.MapMouseEvent) => void;
  onIdle?: (map: google.maps.Map) => void;
  mapOptions?: google.maps.MapOptions;
}

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
