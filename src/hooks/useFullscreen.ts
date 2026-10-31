import { useCallback, useEffect, useState } from 'react';

export function useFullscreen() {
  const supported = typeof document !== 'undefined' && !!document.documentElement.requestFullscreen;
  const [isFullscreen, setIsFullscreen] = useState(() => !!document.fullscreenElement);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  return { supported, isFullscreen, toggle };
}
