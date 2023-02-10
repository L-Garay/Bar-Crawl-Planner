import { useState } from 'react';
import type { LocationDetails } from '~/types/sharedTypes';
import PlusCircle from '../svgs/plusCircle';

export type LocationListItemProps = {
  location: LocationDetails;
  index: number;
  openInfoWindow: (index: number, location: LocationDetails) => void;
  addLocationToOutings: (location: LocationDetails) => void;
  removeLocationFromOutings: (locationId: number) => void;
};

export const LocationListItem = ({
  location,
  index,
  openInfoWindow,
  addLocationToOutings,
  removeLocationFromOutings,
}: LocationListItemProps) => {
  const [isHoveringPlus, setIsHoveringPlus] = useState<boolean>(false);
  const [hasBeenAdded, setHasBeenAdded] = useState<boolean>(false);

  return (
    <li className="results-list-items" key={location.name}>
      <span
        className="results-list-name"
        onClick={() => openInfoWindow(index, location)}
      >
        {location.name}
      </span>
      <span
        className="plus-icon-wrapper"
        onMouseEnter={() => setIsHoveringPlus(true)}
        onMouseLeave={() => setIsHoveringPlus(false)}
        onClick={() => {
          if (!hasBeenAdded) {
            console.log('adding location');

            addLocationToOutings(location);
            setHasBeenAdded(true);
          } else {
            console.log('removing location');
            removeLocationFromOutings(location.id);
            setHasBeenAdded(false);
          }
        }}
      >
        <PlusCircle
          pathId={location.place_id!}
          stroke={isHoveringPlus ? 'lightcoral' : undefined}
        />
      </span>
    </li>
  );
};

export default LocationListItem;
