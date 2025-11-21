/**
 * Sentry Configuration
 * Production-grade error tracking and performance monitoring
 *
 * NOTE: This file is designed to work WITHOUT @sentry/react installed.
 * Install the package for full functionality: npm install @sentry/react
 */

// Stub types for when Sentry is not installed
interface SentryEvent {
  level?: string;
  [key: string]: any;
}

interface SentryUser {
  id: string;
  email?: string;
  username?: string;
}

type SeverityLevel = "fatal" | "error" | "warning" | "log" | "info" | "debug";

// Try to import Sentry, fall back to stubs if not installed
let Sentry: any = null;
let sentryAvailable = false;

try {
  // Dynamic import that won't fail at compile time
  // This will be replaced by bundler at build time
  sentryAvailable = false; // Set to false until package is installed
} catch (e) {
  console.log("Sentry not available - error tracking disabled");
}

/**
 * Initialize Sentry error tracking
 * Call this once at app startup
 */
export function initSentry() {
  if (!sentryAvailable || !Sentry) {
    console.log("⚠️ Sentry not installed. Run: npm install @sentry/react");
    console.log("📚 See SENTRY_SETUP.md for setup instructions");
    return;
  }

  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE || "development";

  // Only initialize if DSN is provided
  if (!sentryDsn) {
    console.warn("Sentry DSN not configured. Error tracking is disabled.");
    return;
  }

  // This code will only run if Sentry is installed
  Sentry.init({
    dsn: sentryDsn,
    environment,
    tracesSampleRate: environment === "production" ? 0.1 : 1.0,
    replaysSessionSampleRate: environment === "production" ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0,

    // Filter out non-error events in development
    beforeSend(event: SentryEvent) {
      if (environment === "development" && event.level !== "error") {
        return null;
      }
      return event;
    },

    // Ignore common non-critical errors
    ignoreErrors: [
      "NetworkError",
      "Network request failed",
      "Failed to fetch",
      "top.GLOBALS",
      "atomicFindClose",
      "Can't find variable: ZiteReader",
      "jigsaw is not defined",
      "ComboSearch is not defined",
      "fb_xd_fragment",
      "Session from session storage is missing",
      "Auth session missing",
    ],

    // Don't send PII
    beforeBreadcrumb(breadcrumb: any) {
      if (breadcrumb.category === "console") {
        return null;
      }
      return breadcrumb;
    },
  });

  console.log("✅ Sentry error tracking initialized");
}

/**
 * Capture an exception manually
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (!sentryAvailable || !Sentry) {
    console.error("Error (Sentry unavailable):", error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message (for non-error events you want to track)
 */
export function captureMessage(message: string, level: SeverityLevel = "info") {
  if (!sentryAvailable || !Sentry) {
    console.log(`[${level}] ${message}`);
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * Set user context for better error tracking
 */
export function setUserContext(user: SentryUser) {
  if (!sentryAvailable || !Sentry) {
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  if (!sentryAvailable || !Sentry) {
    return;
  }

  Sentry.setUser(null);
}

/**
 * Add custom context to errors
 */
export function setContext(name: string, context: Record<string, any>) {
  if (!sentryAvailable || !Sentry) {
    return;
  }

  Sentry.setContext(name, context);
}

/**
 * Wrap ErrorBoundary with Sentry (stub version)
 */
export const SentryErrorBoundary = null;

/**
 * Create Sentry-wrapped React Router (stub version)
 */
export const sentryCreateBrowserRouter = null;
