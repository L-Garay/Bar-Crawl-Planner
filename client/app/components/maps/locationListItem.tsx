import { useMemo, useState } from 'react';
import type { LocationDetails } from '~/types/sharedTypes';
import PlusCircle from '../svgs/plusCircle';

export type LocationListItemProps = {
  location: LocationDetails;
  index: number;
  openInfoWindow: (index: number, location: LocationDetails) => void;
  addLocationToOutings: (location: LocationDetails) => void;
  selectedOutings: LocationDetails[];
};

export const LocationListItem = ({
  location,
  index,
  openInfoWindow,
  addLocationToOutings,
  selectedOutings,
}: LocationListItemProps) => {
  const [isHoveringPlus, setIsHoveringPlus] = useState<boolean>(false);

  const hidePlusCircle = useMemo(() => {
    const isSelected = selectedOutings.some((selectedOuting) => {
      return selectedOuting.id === location.id;
    });
    const hasMaxSelections = selectedOutings.length >= 5;

    if (isSelected || hasMaxSelections) {
      return true;
    } else if (!isSelected && !hasMaxSelections) {
      return false;
    }
  }, [selectedOutings, location.id]);

  return (
    <li className="results-list-items" key={location.name}>
      <span
        className="results-list-name"
        onClick={() => openInfoWindow(index, location)}
      >
        {location.name}
      </span>
      {hidePlusCircle ? null : (
        <span
          className="plus-icon-wrapper"
          onMouseEnter={() => setIsHoveringPlus(true)}
          onMouseLeave={() => setIsHoveringPlus(false)}
          onClick={() => {
            addLocationToOutings(location);
          }}
        >
          <PlusCircle
            pathId={location.place_id!}
            stroke={isHoveringPlus ? 'lightcoral' : undefined}
          />
        </span>
      )}
    </li>
  );
};

export default LocationListItem;
