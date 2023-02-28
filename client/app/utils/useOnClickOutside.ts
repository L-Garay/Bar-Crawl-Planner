import { useEffect } from 'react';

/**
 * @desc This hook will detect if a user clicks outside of a given referenced element and then run a callback function.
 * @param ref the reference to the HTML element, generated from the useRef hook.
 * @param handler a setter function that will set the state of some variable when the user clicks outside of the referenced element.
 */
export const useOnClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: React.Dispatch<React.SetStateAction<boolean>>
) => {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler]);
};
