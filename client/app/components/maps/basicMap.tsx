import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useLazyQuery } from '@apollo/client';
import martiniImg from '~/assets/martini32px.png';
import beerImg from '~/assets/beerIcon32px.png';
import coconutImg from '~/assets/coconut32px.svg';
import LocationListItem from './locationListItem';
import OutingListItem from './outingListItem';
import { Form } from '@remix-run/react';
import moment from 'moment';
import { CITY_SEARCH } from '~/constants/graphqlConstants';

export default function BasicMap({ style, mapOptions }: MapProps) {
  // Map variables
  const [map, setMap] = useState<google.maps.Map>();
  const mapsRef = useRef<HTMLDivElement>(null);
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);
  const [currentMapMarkers, setCurrentMapMarkers] = useState<
    google.maps.Marker[]
  >([]);
  const [selectedMapMarker, setSelectedMapMarker] =
    useState<google.maps.Marker>();
  const [hasClosedInfoWindow, setHasClosedInfoWindow] = useState<boolean>();

  // Map setup
  // TODO fetch user's current location and set as default in map (either pass down here or in useCheckEnvironmentAndSetMap itself)
  // use navigator.geolocation.getCurrentPosition() to get user's current location
  useCheckEnvironmentAndSetMap(mapsRef, setMap, map);
  useSetMapOptions(map, mapOptions);
  useSetMapEventListeners(map);

  // create Info Window for pop ups on markers
  const infoWindow = useMemo(() => {
    const window = new google.maps.InfoWindow();
    window.addListener('closeclick', () => {
      setHasClosedInfoWindow(true);
    });
    return window;
  }, []);

  // Search variables
  const [selectedCity, setSelectedCity] = useState<CitySelectOptions>('Boise');
  const [selectedType, setSelectedType] =
    useState<LocationSelectOptions>('bars');
  const [locations, setLocations] = useState<LocationDetails[]>([]);
  // Search query
  // TODO when you change cities, we need to ensure that we clear/reset all of the different map markers and locations that are saved in one state array or another
  const [searchCity, { data: cityData }] = useLazyQuery(CITY_SEARCH, {
    fetchPolicy: 'no-cache', // testing purposes only
  });

  // create outing variables
  const [selectedOutings, setSelectedOutings] = useState<LocationDetails[]>([]);
  const [outingMapMarkers, setOutingMapMarkers] = useState<
    google.maps.Marker[]
  >([]);
  const [noName, setNoName] = useState<boolean>(true);
  const [noTime, setNoTime] = useState<boolean>(true);
  const shouldDisableCreateOuting = useMemo(
    () => selectedOutings.length === 0 || noName || noTime,
    [selectedOutings, noName, noTime]
  );
  const selectedOutingPlaceIds = selectedOutings.map(
    (outing) => outing.place_id
  );
  const outingPlaceIdString = selectedOutingPlaceIds.join(',');
  const currentDay = new Date();
  const currentDayInputValue = moment(currentDay).format('YYYY-MM-DDTHH:mm');
  const maxDate = currentDay.setFullYear(currentDay.getFullYear() + 1);
  const maxDateValue = moment(maxDate).format('YYYY-MM-DDTHH:mm');

  // Outing functions
  const addLocationToOutings = (location: LocationDetails) => {
    if (selectedOutings.length < MAX_SELECTED_OUTINGS) {
      setSelectedOutings([...selectedOutings, location]);
      const locationIndex = locations.findIndex(
        (targetLocation) => location.id === targetLocation.id
      );
      const marker = mapMarkers[locationIndex];
      marker.setIcon(beerImg);
      marker.setZIndex(990);
      setOutingMapMarkers([...outingMapMarkers, marker]);
    }
  };
  const removeLocationFromOutings = (locationId: number) => {
    const filteredOutings = selectedOutings.filter(
      (outing) => outing.id !== locationId
    );
    setSelectedOutings(filteredOutings);
    const locationIndex = locations.findIndex(
      (location) => location.id === locationId
    );
    const marker = mapMarkers[locationIndex];
    marker.setIcon(martiniImg);
    marker.setZIndex(0);
    setOutingMapMarkers(
      outingMapMarkers.filter((targetMarker) => targetMarker !== marker)
    );
  };

  // Search results pagination
  const [currentPaginationResults, setCurrentPaginationResults] = useState<
    any[]
  >([]);
  const paginationPage = useRef<number>(1);
  const paginationIndexRange = useRef<number[]>([0, 10]);
  const maxIndex = useRef<number>(0);
  const PAGINATION_LIMIT = 10;
  const MAX_SELECTED_OUTINGS = 5;

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

  // Effects
  // Store all location data
  useEffect(() => {
    if (cityData) {
      setLocations(cityData.searchCity);
      maxIndex.current = cityData.searchCity.length - 1;
    }
  }, [cityData]);

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

  // set the current markers on the map
  currentMapMarkers.forEach((marker) => marker.setMap(map!));
  // set the current outing markers on the map
  outingMapMarkers.forEach((marker) => marker.setMap(map!));

  // basic google info window to display location details
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

  const infoWindowActions = (
    marker: google.maps.Marker,
    location: LocationDetails
  ) => {
    const infoWindowContent = getInfoWindowContent(undefined, location);
    infoWindow.setContent(infoWindowContent);
    infoWindow.open({
      anchor: marker,
      map,
    });
    setHasClosedInfoWindow(false);
    setSelectedMapMarker(marker);
  };

  // dynamically generate the content, set it, and then open the window
  const openInfoWindow = (index: number, location: LocationDetails) => {
    const marker = currentMapMarkers[index];
    infoWindowActions(marker, location);
  };

  const openOutingInfoWindow = (location: LocationDetails) => {
    const locationIndex = selectedOutings.findIndex(
      (desiredLocation) => desiredLocation.place_id === location.place_id
    );
    const marker = outingMapMarkers[locationIndex];
    infoWindowActions(marker, location);
  };

  // this effect is soley responsible for just setting the currently selected marker styles
  useEffect(() => {
    if (selectedMapMarker) {
      selectedMapMarker.setIcon(coconutImg);
      selectedMapMarker.setZIndex(1000);
    }
  }, [selectedMapMarker]);

  // this hook will run after the new selected marker is set
  // it then sets the styles for all other markers back to what they were before
  useEffect(() => {
    if (selectedMapMarker) {
      currentMapMarkers.forEach((marker: google.maps.Marker) => {
        if (
          marker !== selectedMapMarker &&
          outingMapMarkers.indexOf(marker) === -1
        ) {
          marker.setIcon(martiniImg);
          marker.setZIndex(0);
        }
        if (
          marker !== selectedMapMarker &&
          outingMapMarkers.indexOf(marker) !== -1
        ) {
          marker.setIcon(beerImg);
          marker.setZIndex(990);
        }
      });
    }
  }, [selectedMapMarker, outingMapMarkers, currentMapMarkers]);

  // this hook should only run right after the info window is closed
  // it runs the same check as before, but this is bound to the 'closeclick' info window event
  useEffect(() => {
    if (hasClosedInfoWindow && selectedMapMarker) {
      currentMapMarkers.forEach((marker: google.maps.Marker) => {
        console.log(
          marker !== selectedMapMarker,
          outingMapMarkers.indexOf(marker)
        );

        if (
          marker === selectedMapMarker &&
          outingMapMarkers.indexOf(marker) === -1
        ) {
          marker.setIcon(martiniImg);
          marker.setZIndex(0);
          setSelectedMapMarker(undefined);
        }
        if (
          marker === selectedMapMarker &&
          outingMapMarkers.indexOf(marker) !== -1
        ) {
          marker.setIcon(beerImg);
          marker.setZIndex(990);
          setSelectedMapMarker(undefined);
        }
      });
    }
  }, [
    currentMapMarkers,
    hasClosedInfoWindow,
    outingMapMarkers,
    selectedMapMarker,
  ]);

  // add click listener to each marker to open info window
  // need to set that the window is open
  useEffect(() => {
    mapMarkers.forEach((marker, index) => {
      const infoWindowContent = getInfoWindowContent(index);
      marker.addListener('click', () => {
        infoWindow.setContent(infoWindowContent);
        infoWindow.open({
          anchor: marker,
          map,
        });
        setHasClosedInfoWindow(false);
        setSelectedMapMarker(marker);
      });
    });
  }, [mapMarkers, map, infoWindow, getInfoWindowContent]);

  return (
    <>
      <div className="map-search-container">
        <div className="search-container">
          <div className="city-container">
            <label htmlFor="cities">Select City: </label>
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
          </div>
          <div className="types-container">
            <label htmlFor="locations">Search: </label>
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
          </div>
          <div className="city-search-button-container">
            <button
              type="button"
              className="city-search-button"
              onClick={() =>
                searchCity({
                  variables: { city: selectedCity, locationType: selectedType },
                })
              }
            >
              Submit
            </button>
          </div>
        </div>
        <div className="map-key-container">
          <div className="key" style={{ textAlign: 'center', marginRight: 10 }}>
            <small style={{ display: 'block' }}>Unsaved location</small>
            <img src={martiniImg} alt="martini glass" />
          </div>
          <div className="key" style={{ textAlign: 'center' }}>
            <small style={{ display: 'block' }}>Current location</small>
            <img src={coconutImg} alt="beer mug" />
          </div>
          <div className="key" style={{ textAlign: 'center' }}>
            <small style={{ display: 'block' }}>Saved location</small>
            <img src={beerImg} alt="beer mug" />
          </div>
        </div>
      </div>
      <br />

      <div className="locations-map-results">
        {/* MAP */}
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
                    addLocationToOutings={addLocationToOutings}
                    selectedOutings={selectedOutings}
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
      <br />
      <div className="potential-outing-container">
        <div className="potential-outing-header">
          <h3>Your currently planned outing</h3>
          <p>
            Selected {selectedOutings.length} / {MAX_SELECTED_OUTINGS}
          </p>
          <div>
            <Form method="post" action="/outings/create">
              <label htmlFor="outing-name">Name of outing: </label>
              <input
                type="text"
                name="outing-name"
                id="outing-name"
                placeholder={`ex: Tom's Bachelor Party`}
                size={30}
                onChange={(e) => setNoName(e.target.value === '')}
              />
              <label htmlFor="outing-time">Choose date and time: </label>
              <input
                type="datetime-local"
                name="outing-time"
                id="outing-time"
                min={currentDayInputValue}
                max={maxDateValue}
                onChange={(e) => setNoTime(e.target.value === '')}
              />
              <input
                type="hidden"
                name="place-ids"
                value={outingPlaceIdString}
              />
              <button type="submit" disabled={shouldDisableCreateOuting}>
                Create Outing
              </button>
            </Form>
          </div>
        </div>
        <div className="potential-outing-body">
          <div className="potential-outing-locations">
            {selectedOutings.length ? (
              <ol>
                {selectedOutings.map((location, index) => {
                  return (
                    <OutingListItem
                      key={location.place_id}
                      location={location}
                      index={index}
                      openOutingInfoWindow={openOutingInfoWindow}
                      removeLocationFromOutings={removeLocationFromOutings}
                    />
                  );
                })}
              </ol>
            ) : (
              <p>Nothing yet!</p>
            )}
          </div>
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
          <a
            href="https://www.flaticon.com/free-icons/food-and-restaurant"
            title="food and restaurant icons"
          >
            Food and restaurant icons created by Freepik - Flaticon
          </a>
        </small>
      </div>
    </>
  );
}
