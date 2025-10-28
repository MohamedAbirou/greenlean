/**
 * Main Application Component
 * Clean, minimal entry point with lazy-loaded routes
 */

import { AnimatePresence } from "framer-motion";
import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import { AppProviders } from "./core/providers";
import { routes, suspenseFallback } from "./core/router/routes";

function AppRoutes() {
  const element = useRoutes(routes);

  return (
    <Suspense fallback={suspenseFallback}>
      <AnimatePresence mode="wait">{element}</AnimatePresence>
    </Suspense>
  );
}

function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;
