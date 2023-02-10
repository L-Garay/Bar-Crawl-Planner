import { useState } from 'react';
import type { LocationDetails } from '~/types/sharedTypes';
import MinusCircle from '../svgs/minusCircle';

export type OutingListItemProps = {
  location: LocationDetails;
  index: number;
  openInfoWindow: (index: number, location: LocationDetails) => void;
  removeLocationFromOutings: (locationId: number) => void;
};

export const OutingListItem = ({
  location,
  index,
  openInfoWindow,
  removeLocationFromOutings,
}: OutingListItemProps) => {
  const [isHoveringPlus, setIsHoveringPlus] = useState<boolean>(false);

  return (
    <li key={location.id} className="results-list-items">
      <span
        className="results-list-name"
        onClick={() => openInfoWindow(index, location)}
      >
        {location.name}
        {' --- '}
        {location.formatted_address}
        {' --- '}
        {location.rating}
      </span>
      <span
        className="plus-icon-wrapper"
        onMouseEnter={() => setIsHoveringPlus(true)}
        onMouseLeave={() => setIsHoveringPlus(false)}
        onClick={() => removeLocationFromOutings(location.id)}
      >
        <MinusCircle
          pathId={location.place_id!}
          stroke={isHoveringPlus ? '#20b2aa' : 'lightcoral'}
        />
      </span>
    </li>
  );
};

export default OutingListItem;
