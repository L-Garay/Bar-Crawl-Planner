import React, { useRef, useState } from 'react';
import type {
  CitySelectOptions,
  MapProps,
  PlaceResult,
} from '~/types/sharedTypes';
import {
  useCheckEnvironmentAndSetMap,
  useSetMapEventListeners,
  useSetMapOptions,
} from '~/utils/maps';
import { cityCoordinates } from '~/constants/mapConstants';

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
  const [selectedCity, setSelectedCity] = useState<CitySelectOptions>('boise');

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
      location: {
        lat: cityCoordinates[selectedCity].lat,
        lng: cityCoordinates[selectedCity].lng,
      }, // downtown of each city according to google
      radius: 8045, // 5 miles
    };
    // TODO we know this works, the request is formatted properly and the user inputs are valid
    // the callback properly handles the result of the search
    // so the next step is to make a call to our server from here, which will handle returning the location cache or making the call to google from the server
    // we'll need to make sure that we return all the data we need to still render the map (obviously logan)
    PlaceService.textSearch(request, textSearchCallback);
  };

  return (
    <>
      <h3>should be map here</h3>
      <div className="map-search-container">
        <label htmlFor="cities">Select City:</label>
        <select
          name="cities"
          id="cities"
          onChange={(e) => {
            const city = e.target.value as CitySelectOptions;
            setSelectedCity(city);
            map?.setCenter(cityCoordinates[city]);
          }}
        >
          <option value="boise">Boise</option>
          <option value="slc">Salt Lake City</option>
          <option value="seattle">Seattle</option>
          <option value="denver">Denver</option>
          <option value="portland">Portland</option>
        </select>
        <label htmlFor="locationSearch">Search:</label>
        <input type="text" name="locationSearch" ref={textSearchRef} />
        <button type="button" onClick={() => executeSearch()}>
          Submit
        </button>
      </div>
      <br />
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
