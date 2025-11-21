/**
 * Main Application Component
 * Clean, minimal entry point with lazy-loaded routes
 */

import { AnimatePresence } from "framer-motion";
import { Suspense, Component, type ReactNode } from "react";
import { useRoutes } from "react-router-dom";
import { AppProviders } from "./core/providers";
import { routes, suspenseFallback } from "./core/router/routes";

// Error boundary for lazy loading failures
class LazyLoadErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Check if it's a chunk load error
    if (
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed') ||
      error.message.includes('error loading dynamically imported module')
    ) {
      console.log('Lazy load error detected, reloading page...');
      // Reload the page to fetch the new chunks
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center max-w-md px-4">
            <h2 className="text-2xl font-bold mb-2">Loading Error</h2>
            <p className="text-muted-foreground mb-4">
              Failed to load this page. Please refresh your browser.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppRoutes() {
  const element = useRoutes(routes);

  return (
    <LazyLoadErrorBoundary>
      <Suspense fallback={suspenseFallback}>
        <AnimatePresence mode="wait">{element}</AnimatePresence>
      </Suspense>
    </LazyLoadErrorBoundary>
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
