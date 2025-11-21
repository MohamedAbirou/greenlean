/**
 * Sentry-Enhanced Error Boundary
 * Automatically reports errors to Sentry while providing graceful UI fallback
 */

import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Bug } from "lucide-react";
import { captureException } from "./config";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showReportDialog?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  eventId?: string;
}

export class SentryErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Report to Sentry
    try {
      captureException(error, {
        errorInfo: errorInfo,
        componentStack: errorInfo.componentStack,
      });
    } catch (sentryError) {
      console.error("Failed to report error to Sentry:", sentryError);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    // Reload the page to ensure clean state
    window.location.reload();
  };

  private handleReportFeedback = () => {
    // User can report additional context via email or form
    const subject = encodeURIComponent("GreenLean App Error Report");
    const body = encodeURIComponent(
      `I encountered an error in the app:\n\nError: ${this.state.error?.message || "Unknown error"}\n\nSteps to reproduce:\n1. \n2. \n3. \n\nAdditional context:\n`
    );
    window.open(`mailto:support@greenlean.app?subject=${subject}&body=${body}`, "_blank");
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card rounded-xl shadow-lg border border-border p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">
              Something went wrong
            </h2>

            <p className="text-muted-foreground mb-6">
              We've been notified of this error and will investigate. Please try
              refreshing the page.
            </p>

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground mb-2">
                  Error details
                </summary>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-32 text-left">
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>

              {this.props.showReportDialog && (
                <button
                  onClick={this.handleReportFeedback}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  <Bug className="w-4 h-4" />
                  Report Feedback
                </button>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-6">
              Error ID: {this.state.eventId || "N/A"}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SentryErrorBoundary;
