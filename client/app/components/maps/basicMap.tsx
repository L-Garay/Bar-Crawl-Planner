import React, { useRef, useState } from 'react';
import type {
  CitySelectOptions,
  LocationSelectOptions,
  MapProps,
  PlaceResult,
} from '~/types/sharedTypes';
import {
  useCheckEnvironmentAndSetMap,
  useSetMapEventListeners,
  useSetMapOptions,
} from '~/utils/maps';
import { CITY_COORDINATES, LOCATION_TYPES } from '~/constants/mapConstants';
import { gql, useLazyQuery } from '@apollo/client';

// TODO figure out a better way to handle this
// maybe have multiple small queries that fetch certain properties only when they are needed?
const CITY_SEARCH = gql`
  query searchCity($city: String!, $locationType: String!) {
    searchCity(city: $city, locationType: $locationType) {
      business_status
      formatted_address
      city
      state
      lat
      lng
      html_attributions
      icon
      icon_mask_base_uri
      icon_background_color
      name
      place_id
      rating
      user_ratings_total
      types
      main_type
      vicinity
      formatted_phone_number
      plus_compound_code
      plus_global_code
      open_periods
      weekday_text
      photos_references
      reviews
      url
      website
      utc_offset_minutes
      price_level
      expiration_date
    }
  }
`;

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
  const [selectedType, setSelectedType] =
    useState<LocationSelectOptions>('bars');
  const [searchCity, { loading, error, data }] = useLazyQuery(CITY_SEARCH);

  useCheckEnvironmentAndSetMap(mapsRef, setMap, map);
  useSetMapOptions(map, mapOptions);
  useSetMapEventListeners(map, onClick, onIdle);

  const PlaceService = new google.maps.places.PlacesService(map!);

  console.log(data);

  // const textSearchCallback = (
  //   results: PlaceResult[] | null,
  //   status: google.maps.places.PlacesServiceStatus
  // ) => {
  //   setClicks([]); // clear on every new search
  //   // TODO handle errors
  //   if (
  //     status === google.maps.places.PlacesServiceStatus.OK &&
  //     results?.length
  //   ) {
  //     for (let i = 0; i < results.length; i++) {
  //       const place = results[i];
  //       console.log(place);
  //       setClicks?.((prev) => [...prev, place.geometry?.location!]);
  //     }
  //   }
  // };

  // const executeSearch = () => {
  //   const request = {
  //     query: LOCATION_TYPES[selectedType],
  //     location: {
  //       lat: CITY_COORDINATES[selectedCity].lat,
  //       lng: CITY_COORDINATES[selectedCity].lng,
  //     }, // downtown of each city according to google
  //     radius: 8045, // 5 miles
  //   };
  //   // TODO we know this works, the request is formatted properly and the user inputs are valid
  //   // the callback properly handles the result of the search
  //   // so the next step is to make a call to our server from here, which will handle returning the location cache or making the call to google from the server
  //   // we'll need to make sure that we return all the data we need to still render the map (obviously logan)
  //   // we'll need to pass in the selected type and the selected city
  //   PlaceService.textSearch(request, textSearchCallback);
  // };

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
            map?.setCenter(CITY_COORDINATES[city]);
          }}
        >
          <option value="boise">Boise</option>
          <option value="slc">Salt Lake City</option>
          <option value="seattle">Seattle</option>
          <option value="denver">Denver</option>
          <option value="portland">Portland</option>
        </select>
        <label htmlFor="locations">Search:</label>
        <select
          name="locations"
          id="locations"
          onChange={(e) => {
            const type = e.target.value as LocationSelectOptions;
            setSelectedType(type);
          }}
        >
          <option value="bars">Bars</option>
          <option value="taverns">Taverns</option>
          <option value="breweries">Breweries</option>
          <option value="wineries">Wineries</option>
          <option value="pubs">Pubs</option>
          <option value="restaurants">Restaurants</option>
          <option value="hotels">Hotels</option>
        </select>
        <button
          type="button"
          onClick={() =>
            searchCity({
              variables: { city: selectedCity, locationType: selectedType },
            })
          }
        >
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
