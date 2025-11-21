import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize Sentry error tracking (if configured)
// NOTE: Install @sentry/react package and configure VITE_SENTRY_DSN env var
// See SENTRY_SETUP.md for complete setup instructions
let SentryErrorBoundary: any;
try {
  const { initSentry, SentryErrorBoundary: SentryEB } = await import("./lib/sentry/SentryErrorBoundary");
  const { initSentry: initSentryConfig } = await import("./lib/sentry/config");
  initSentryConfig();
  SentryErrorBoundary = SentryEB;
  console.log("✅ Sentry error tracking initialized");
} catch (error) {
  // Fallback to basic ErrorBoundary if Sentry not installed
  const { ErrorBoundary } = await import("./shared/components/feedback/ErrorBoundary");
  SentryErrorBoundary = ErrorBoundary;
  console.log("⚠️ Sentry not configured, using basic ErrorBoundary");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SentryErrorBoundary showReportDialog={true}>
      <App />
    </SentryErrorBoundary>
  </StrictMode>
);
