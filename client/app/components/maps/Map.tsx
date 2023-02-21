import type { Status } from '@googlemaps/react-wrapper';
import { Wrapper } from '@googlemaps/react-wrapper';
import type { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import getConfig from '~/utils/config.server';
import { useIsDomLoaded } from '~/utils/useIsDomLoaded';
import { Dynamic } from '../animated/loadingSpinners';
import BasicMap from './basicMap';

export const loader: LoaderFunction = async ({ request }) => {
  return getConfig();
};

const mapsRenderComponent = (status: Status) => {
  return (
    <>
      <h1>{status}</h1>
      <Dynamic />
    </>
  );
};

export default function Map() {
  const loaderData = useLoaderData();
  const isDomLoaded = useIsDomLoaded();
  const mapsApiKey = loaderData.GOOGLE.API_KEY;
  const [clicks, setClicks] = useState<google.maps.LatLng[]>([]);
  const [zoom, setZoom] = useState(3); // initial zoom
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({
    lat: 0,
    lng: 0,
  });

  const onIdle = (m: google.maps.Map) => {
    console.log('onIdle');
    setZoom(m.getZoom()!);
    setCenter(m.getCenter()!.toJSON());
  };

  const basicMapStyle = {
    height: '500px',
    width: '500px',
  };
  return (
    <>
      {isDomLoaded ? (
        <Wrapper
          apiKey={mapsApiKey}
          render={mapsRenderComponent}
          libraries={['places', 'marker', 'localContext']}
          version="weekly"
        >
          {/* NOTE I have a feeling that we'll either greatly extend and just use this one map OR we will have multiple different maps with different configs that we'll then need to conditionally render here */}
          <BasicMap style={basicMapStyle} onIdle={onIdle} />
        </Wrapper>
      ) : null}
    </>
  );
}
