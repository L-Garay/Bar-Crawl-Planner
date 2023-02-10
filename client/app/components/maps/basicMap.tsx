import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import martiniImg from '~/assets/martini32px.png';
import plusSign from '~/assets/plus-circle.svg';
import PlusCircle from '../svgs/plusCircle';
import LocationListItem from './locationListItem';

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

  const [isHoveringPlus, setIsHoveringPlus] = useState<boolean>(false);

  const [locations, setLocations] = useState<LocationDetails[]>([]);
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);
  const [currentMapMarkers, setCurrentMapMarkers] = useState<
    google.maps.Marker[]
  >([]);
  const [currentPaginationResults, setCurrentPaginationResults] = useState<
    any[]
  >([]);

  const paginationPage = useRef<number>(1);
  const PAGINATION_LIMIT = 10;
  const paginationIndexRange = useRef<number[]>([0, 10]);
  const maxIndex = useRef<number>(0);

  // create Info Window for pop ups on markers
  const infoWindow = useMemo(() => new google.maps.InfoWindow(), []);

  useCheckEnvironmentAndSetMap(mapsRef, setMap, map);
  useSetMapOptions(map, mapOptions);
  useSetMapEventListeners(map, undefined, onIdle);

  // Store all location data
  useEffect(() => {
    if (data) {
      setLocations(data.searchCity);
      maxIndex.current = data.searchCity.length - 1;
    }
  }, [data]);

  // create and store all map markers
  useEffect(() => {
    const mapMarkers = locations.map((location: LocationDetails) => {
      const lat = location.lat ? location.lat : 0;
      const lng = location.lng ? location.lng : 0;
      // TODO make markers accessible
      // https://developers.google.com/maps/documentation/javascript/markers#accessible
      return new google.maps.Marker({
        position: { lat, lng },
        optimized: false,
        icon: martiniImg,
      });
    });
    setMapMarkers(mapMarkers);
  }, [locations]);

  // set first 10 current locations and markers
  useEffect(() => {
    const firstTenLocations = locations.slice(
      paginationIndexRange.current[0],
      paginationPage.current * PAGINATION_LIMIT
    );
    setCurrentPaginationResults(firstTenLocations);

    const firstTenMarkers = mapMarkers.slice(
      paginationIndexRange.current[0],
      paginationPage.current * PAGINATION_LIMIT
    );
    setCurrentMapMarkers(firstTenMarkers);
  }, [locations, mapMarkers]);

  const getInfoWindowContent = useCallback(
    (index?: number, location?: LocationDetails): string => {
      const locationData = index ? locations[index] : location;
      return `<div className="info-window-content-container">
          <div className="info-window-content-header">
            <h3>${locationData?.name}</h3>
            <h3>${locationData?.name}</h3>
          </div>
          <div className="info-window-content-body">
            <p>${locationData?.formatted_address}</p>
            <p>${locationData?.formatted_phone_number}</p>
            <p>${locationData?.website}</p>
            <p>${locationData?.rating}</p>
          </div>
        </div>`;
    },
    [locations]
  );

  useEffect(() => {
    mapMarkers.forEach((marker, index) => {
      const infoWindowContent = getInfoWindowContent(index);
      marker.addListener('click', () => {
        infoWindow.setContent(infoWindowContent);
        infoWindow.open({
          anchor: marker,
          map,
        });
      });
    });
  }, [mapMarkers, map, infoWindow, getInfoWindowContent]);

  const disableNext =
    paginationPage.current * PAGINATION_LIMIT >= maxIndex.current;
  const disablePrevious = paginationPage.current === 1;

  const handleNextPagination = () => {
    if (paginationPage.current * PAGINATION_LIMIT < maxIndex.current) {
      paginationPage.current += 1;
      paginationIndexRange.current[0] += PAGINATION_LIMIT;
      paginationIndexRange.current[1] += PAGINATION_LIMIT;
      const nextTenLocations = locations.slice(
        paginationIndexRange.current[0],
        paginationIndexRange.current[1]
      );
      setCurrentPaginationResults(nextTenLocations);

      currentMapMarkers.forEach((marker) => marker.setMap(null));
      const nextTenMarkers = mapMarkers.slice(
        paginationIndexRange.current[0],
        paginationIndexRange.current[1]
      );
      setCurrentMapMarkers(nextTenMarkers);
    }
  };

  const handlePreviousPagination = () => {
    if (paginationPage.current > 1) {
      paginationPage.current -= 1;
      paginationIndexRange.current[0] -= PAGINATION_LIMIT;
      paginationIndexRange.current[1] -= PAGINATION_LIMIT;
      const previousTenLocations = locations.slice(
        paginationIndexRange.current[0],
        paginationIndexRange.current[1]
      );
      setCurrentPaginationResults(previousTenLocations);

      currentMapMarkers.forEach((marker) => marker.setMap(null));
      const previousTenMarkers = mapMarkers.slice(
        paginationIndexRange.current[0],
        paginationIndexRange.current[1]
      );
      setCurrentMapMarkers(previousTenMarkers);
    }
  };

  // set the current markers on the map
  currentMapMarkers.forEach((marker) => marker.setMap(map!));

  const openInfoWindow = (index: number, location: LocationDetails) => {
    const marker = currentMapMarkers[index];
    const infoWindowContent = getInfoWindowContent(undefined, location);
    infoWindow.setContent(infoWindowContent);
    infoWindow.open({
      anchor: marker,
      map,
    });
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
      <div className="locations-map-results">
        <div className="map" ref={mapsRef} style={style}></div>
        <div className="results">
          Current Locations: <br />
          {currentPaginationResults.length ? (
            <ul>
              {currentPaginationResults.map(
                (location: LocationDetails, index: number) => (
                  <LocationListItem
                    key={location.place_id}
                    location={location}
                    index={index}
                    openInfoWindow={openInfoWindow}
                  />
                )
              )}
            </ul>
          ) : (
            'Execute a search to see results!'
          )}
          <div className="pagination-controls">
            <button
              disabled={disablePrevious}
              onClick={handlePreviousPagination}
            >
              Previous
            </button>
            <button disabled={disableNext} onClick={handleNextPagination}>
              Next
            </button>
          </div>
          {currentPaginationResults.length ? (
            <div className="results-counter">
              <p>
                Showing {paginationIndexRange.current[0] + 1} -{' '}
                {paginationIndexRange.current[1] < locations.length
                  ? paginationIndexRange.current[1]
                  : locations.length}{' '}
                out of {locations.length}
              </p>
            </div>
          ) : null}
        </div>
      </div>
      <div className="attributions-section">
        <small>
          Attributions include:
          <br />
          <div>
            {' '}
            <a href="https://www.freepik.com" title="Freepik">
              {' '}
              Freepik{' '}
            </a>{' '}
            from{' '}
            <a href="https://www.flaticon.com/" title="Flaticon">
              www.flaticon.com'
            </a>
          </div>{' '}
          <br />
          <a
            href="https://www.flaticon.com/free-icons/martini"
            title="martini icons"
          >
            Martini icons created by Freepik - Flaticon
          </a>
        </small>
      </div>
    </>
  );
}
