import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Only scroll to top when entering sub-pages like Detail, Watch, Shop, etc.
    // Do NOT scroll to top when returning to HomePage so scroll position is preserved.
    if (pathname.startsWith('/anime/') || pathname.startsWith('/watch/') || pathname === '/shop' || pathname === '/profile' || pathname === '/admin') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return null;
}
