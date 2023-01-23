import { useRef, useState } from 'react';
import { useCheckEnvironmentAndSetMap } from '~/utils/checkEnvironment';

interface BasicMapProps extends google.maps.MapOptions {
  style: { [key: string]: string };
}

export default function BasicMap({ style }: BasicMapProps) {
  const mapsRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();

  useCheckEnvironmentAndSetMap(mapsRef, setMap, map);

  return (
    <>
      <h3>should be map here</h3>
      <div ref={mapsRef} style={style}></div>
    </>
  );
}
