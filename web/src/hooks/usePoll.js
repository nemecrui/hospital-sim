import { useEffect, useRef } from 'react';

// Chama `callback` de imediato e depois a cada `interval` ms.
export function usePoll(callback, interval = 2000) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    let active = true;
    const tick = () => {
      if (active) savedCallback.current();
    };
    tick();
    const id = setInterval(tick, interval);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [interval]);
}
