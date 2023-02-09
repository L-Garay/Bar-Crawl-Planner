import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  CitySelectOptions,
  LocationDetails,
  LocationSelectOptions,
  MapProps,
} from '~/types/sharedTypes';
import {
  useCheckEnvironmentAndSetMap,
  useSetMapEventListeners,
  useSetMapOptions,
} from '~/utils/maps';
import { CITY_COORDINATES } from '~/constants/mapConstants';
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
  children,
  onIdle,
  mapOptions,
}: MapProps) {
  const mapsRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [selectedCity, setSelectedCity] = useState<CitySelectOptions>('Boise');
  const [selectedType, setSelectedType] =
    useState<LocationSelectOptions>('bars');
  const [searchCity, { loading, error, data }] = useLazyQuery(CITY_SEARCH, {
    fetchPolicy: 'no-cache', // testing purposes only
  });
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);

  useCheckEnvironmentAndSetMap(mapsRef, setMap, map);
  useSetMapOptions(map, mapOptions);
  useSetMapEventListeners(map, undefined, onIdle);

  console.log(data);

  useEffect(() => {
    if (data) {
      const { searchCity } = data;
      const locationCoordinates = searchCity.map(
        (location: LocationDetails) => {
          return {
            lat: location.lat,
            lng: location.lng,
          };
        }
      );
      console.log(locationCoordinates);
      const mapMarkers = locationCoordinates.map(
        (coord: google.maps.LatLngLiteral) => {
          return new google.maps.Marker({
            position: coord,
          });
        }
      );
      console.log(mapMarkers.length);
      setMapMarkers(mapMarkers);
    }
  }, [data, map]);

  const currentMarkers = useMemo(() => mapMarkers.slice(0, 10), [mapMarkers]);
  console.log(currentMarkers.length);

  currentMarkers.forEach((marker) => marker.setMap(map!));

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
          <option value="Boise">Boise</option>
          <option value="Slc">Salt Lake City</option>
          <option value="Seattle">Seattle</option>
          <option value="Denver">Denver</option>
          <option value="Portland">Portland</option>
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
    </>
  );
}
