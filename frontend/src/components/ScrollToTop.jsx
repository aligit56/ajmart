import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Ensures that whenever a user navigates to any new page, category, product,
 * or section, the viewport is immediately scrolled back to the top of the page,
 * or accurately aligned to the target section with sticky header offset.
 */
const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // If navigating to an in-page section hash (e.g., #categories, #deals)
    if (hash) {
      const timer = setTimeout(() => {
        const targetId = hash.replace('#', '');
        const element = document.getElementById(targetId) || document.querySelector(hash);
        if (element) {
          const headerOffset = 90; // Height allowance for sticky navbar
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: Math.max(0, offsetPosition),
            behavior: 'smooth'
          });
        }
      }, 60);

      return () => clearTimeout(timer);
    }

    // Standard page navigation: reset scroll to very top (0, 0)
    // Using instant reset so the user immediately sees the top header and heading
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    // Double-fallback for older browsers and cross-browser consistency
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
