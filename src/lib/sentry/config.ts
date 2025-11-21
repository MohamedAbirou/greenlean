/**
 * Sentry Configuration
 * Production-grade error tracking and performance monitoring
 */

import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";

/**
 * Initialize Sentry error tracking
 * Call this once at app startup
 */
export function initSentry() {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE || "development";

  // Only initialize if DSN is provided
  if (!sentryDsn) {
    console.warn("Sentry DSN not configured. Error tracking is disabled.");
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: environment === "production" ? 0.1 : 1.0,

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysSessionSampleRate: environment === "production" ? 0.1 : 0,
    replaysOnErrorSampleRate: 1.0,

    // React Router integration
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Filter out non-error events in development
    beforeSend(event) {
      // Don't send events in development unless they're errors
      if (environment === "development" && event.level !== "error") {
        return null;
      }
      return event;
    },

    // Ignore common non-critical errors
    ignoreErrors: [
      // Network errors that are expected
      "NetworkError",
      "Network request failed",
      "Failed to fetch",

      // Browser extension errors
      "top.GLOBALS",
      "atomicFindClose",

      // Random plugins/extensions
      "Can't find variable: ZiteReader",
      "jigsaw is not defined",
      "ComboSearch is not defined",

      // Facebook errors
      "fb_xd_fragment",

      // Supabase session errors (user logged out)
      "Session from session storage is missing",
      "Auth session missing",
    ],

    // Don't send PII (personally identifiable information)
    beforeBreadcrumb(breadcrumb) {
      // Filter out breadcrumbs with sensitive data
      if (breadcrumb.category === "console") {
        return null;
      }
      return breadcrumb;
    },
  });
}

/**
 * Capture an exception manually
 */
export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture a message (for non-error events you want to track)
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context for better error tracking
 */
export function setUserContext(user: { id: string; email?: string; username?: string }) {
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
  Sentry.setUser(null);
}

/**
 * Add custom context to errors
 */
export function setContext(name: string, context: Record<string, any>) {
  Sentry.setContext(name, context);
}

/**
 * Wrap ErrorBoundary with Sentry
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

/**
 * Create Sentry-wrapped React Router
 */
export const sentryCreateBrowserRouter = Sentry.wrapCreateBrowserRouterV6;
