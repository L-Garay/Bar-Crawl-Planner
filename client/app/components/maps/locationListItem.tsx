import { useState } from 'react';
import type { LocationDetails } from '~/types/sharedTypes';
import PlusCircle from '../svgs/plusCircle';

export type LocationListItemProps = {
  location: LocationDetails;
  index: number;
  openInfoWindow: (index: number, location: LocationDetails) => void;
};

export const LocationListItem = ({
  location,
  index,
  openInfoWindow,
}: LocationListItemProps) => {
  const [isHoveringPlus, setIsHoveringPlus] = useState<boolean>(false);

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
