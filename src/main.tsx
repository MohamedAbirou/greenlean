import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "./shared/components/feedback/ErrorBoundary";
import { initSentry } from "./lib/sentry/config";
import "./index.css";

// Initialize Sentry if available (gracefully degrades if not installed)
try {
  initSentry();
} catch (error) {
  console.log("Sentry initialization skipped (package not installed)");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
