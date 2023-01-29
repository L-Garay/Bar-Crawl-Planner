import React, { useRef, useState } from 'react';
import type { MapProps, PlaceResult } from '~/types/sharedTypes';
import {
  useCheckEnvironmentAndSetMap,
  useSetMapEventListeners,
  useSetMapOptions,
} from '~/utils/maps';

export default function BasicMap({
  style,
  setClicks,
  children,
  onClick,
  onIdle,
  mapOptions,
}: MapProps) {
  const mapsRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const textSearchRef = useRef<HTMLInputElement | null>(null);

  useCheckEnvironmentAndSetMap(mapsRef, setMap, map);
  useSetMapOptions(map, mapOptions);
  useSetMapEventListeners(map, onClick, onIdle);

  const PlaceService = new google.maps.places.PlacesService(map!);

  const textSearchCallback = (
    results: PlaceResult[] | null,
    status: google.maps.places.PlacesServiceStatus
  ) => {
    setClicks([]); // clear on every new search
    // TODO handle errors
    if (
      status === google.maps.places.PlacesServiceStatus.OK &&
      results?.length
    ) {
      for (let i = 0; i < results.length; i++) {
        const place = results[i];
        console.log(place);
        setClicks?.((prev) => [...prev, place.geometry?.location!]);
      }
    }
  };

  const executeSearch = () => {
    const request = {
      query: textSearchRef.current?.value,
      location: { lat: 43.6141397, lng: -116.2155451 }, // downtown Boise
      radius: 8045, // 5 miles
    };
    PlaceService.textSearch(request, textSearchCallback);
  };

  return (
    <>
      <h3>should be map here</h3>
      <div className="map-search-container">
        <label htmlFor="locationSearch">Search:</label>
        <input type="text" name="locationSearch" ref={textSearchRef} />
        <button type="button" onClick={() => executeSearch()}>
          Submit
        </button>
      </div>
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
