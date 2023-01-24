import { useState, useEffect } from 'react';

export default function MapMarker(markerOptions: google.maps.MarkerOptions) {
  const [marker, setMarker] = useState<google.maps.Marker>();

  useEffect(() => {
    if (!marker) {
      setMarker(new google.maps.Marker());
    }

    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [marker]);

  useEffect(() => {
    if (marker) {
      marker.setOptions(markerOptions);
    }
  }, [marker, markerOptions]);

  return null;
}
