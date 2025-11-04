/**
 * ScrollToTop Component
 * Automatically scrolls to top on route changes
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Use instant to avoid animation conflicts with page transitions
    });
  }, [pathname]);

  return null;
}
