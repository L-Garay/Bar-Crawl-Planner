import { useEffect } from 'react';

const useSetMapOptions = (
  map?: google.maps.Map,
  options?: google.maps.MapOptions
) => {
  useEffect(() => {
    if (map && options) {
      map.setOptions(options);
    }
  }, [map, options]);
};

export default useSetMapOptions;
