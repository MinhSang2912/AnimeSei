import { useState, useEffect, useLayoutEffect } from 'react';

export interface HomeSessionData {
  q: string;
  page: number;
  format: string;
  country: string;
  scrollY: number;
}

const DEFAULT_STATE: HomeSessionData = {
  q: '',
  page: 1,
  format: 'TV',
  country: 'JP',
  scrollY: 0,
};

let isClientSpa = false;

/**
 * Custom hook to manage Home Page filter/page/search state & scroll restoration via sessionStorage
 */
export function useHomeSessionState() {
  const [sessionState, setSessionState] = useState<HomeSessionData>(() => {
    // Initial browser load / F5 reload
    if (!isClientSpa) {
      isClientSpa = true;
      sessionStorage.removeItem('home_session_state');
      return DEFAULT_STATE;
    }

    // Returning via SPA client-side navigation (e.g., clicking Back button from Anime Detail page)
    const saved = sessionStorage.getItem('home_session_state');
    if (saved) {
      try {
        return { ...DEFAULT_STATE, ...JSON.parse(saved) };
      } catch {
        // Fallback
      }
    }
    return DEFAULT_STATE;
  });

  // Helper to update individual or multiple fields
  const updateSessionState = (patch: Partial<HomeSessionData>) => {
    setSessionState((prev) => {
      const next = { ...prev, ...patch };
      sessionStorage.setItem('home_session_state', JSON.stringify(next));
      return next;
    });
  };

  // Save current scroll Y position during user scroll
  useEffect(() => {
    const handleScroll = () => {
      const saved = sessionStorage.getItem('home_session_state');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          parsed.scrollY = window.scrollY;
          sessionStorage.setItem('home_session_state', JSON.stringify(parsed));
        } catch {
          // Ignore
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    sessionState,
    updateSessionState,
  };
}

/**
 * Custom hook to restore scroll position after data loading completes
 */
export function useScrollRestoration(hasContent: boolean, targetY: number) {
  useLayoutEffect(() => {
    if (hasContent && targetY > 0) {
      const timer = setTimeout(() => {
        window.scrollTo(0, targetY);
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [hasContent, targetY]);
}
