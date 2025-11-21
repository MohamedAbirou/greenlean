/**
 * Admin Alert Service (Slack Webhooks)
 * Send critical alerts to Slack for monitoring
 */

// Slack webhook URL from environment
const SLACK_WEBHOOK_URL = import.meta.env.VITE_SLACK_WEBHOOK_URL || '';

// Alert severity levels
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Alert colors for Slack attachments
const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  [AlertSeverity.INFO]: '#36a64f', // Green
  [AlertSeverity.WARNING]: '#ff9900', // Orange
  [AlertSeverity.ERROR]: '#ff0000', // Red
  [AlertSeverity.CRITICAL]: '#8b0000', // Dark red
};

// Alert emojis
const SEVERITY_EMOJIS: Record<AlertSeverity, string> = {
  [AlertSeverity.INFO]: ':information_source:',
  [AlertSeverity.WARNING]: ':warning:',
  [AlertSeverity.ERROR]: ':x:',
  [AlertSeverity.CRITICAL]: ':rotating_light:',
};

interface AlertOptions {
  title: string;
  message: string;
  severity?: AlertSeverity;
  details?: Record<string, any>;
  userId?: string;
  context?: string;
}

interface SlackAttachment {
  color: string;
  title: string;
  text: string;
  fields?: Array<{
    title: string;
    value: string;
    short: boolean;
  }>;
  footer?: string;
  ts?: number;
}

class AlertService {
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = !!SLACK_WEBHOOK_URL;

    if (!this.isEnabled && import.meta.env.PROD) {
      console.warn('Slack webhook not configured. Admin alerts disabled.');
    }
  }

  /**
   * Send alert to Slack
   */
  async sendAlert(options: AlertOptions): Promise<boolean> {
    if (!this.isEnabled) {
      // In development, just log
      if (import.meta.env.DEV) {
        console.log(`[Alert ${options.severity}] ${options.title}: ${options.message}`);
      }
      return false;
    }

    const severity = options.severity || AlertSeverity.INFO;

    try {
      const attachment: SlackAttachment = {
        color: SEVERITY_COLORS[severity],
        title: options.title,
        text: options.message,
        footer: 'GreenLean Alerts',
        ts: Math.floor(Date.now() / 1000),
      };

      // Add details as fields
      if (options.details) {
        attachment.fields = Object.entries(options.details).map(([key, value]) => ({
          title: this.formatFieldName(key),
          value: String(value),
          short: true,
        }));
      }

      // Add user ID if provided
      if (options.userId) {
        attachment.fields = attachment.fields || [];
        attachment.fields.push({
          title: 'User ID',
          value: options.userId,
          short: true,
        });
      }

      // Add context if provided
      if (options.context) {
        attachment.fields = attachment.fields || [];
        attachment.fields.push({
          title: 'Context',
          value: options.context,
          short: false,
        });
      }

      const payload = {
        text: `${SEVERITY_EMOJIS[severity]} *${severity.toUpperCase()}*`,
        attachments: [attachment],
      };

      const response = await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error('Failed to send Slack alert:', response.statusText);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending Slack alert:', error);
      return false;
    }
  }

  /**
   * Format field name for display
   */
  private formatFieldName(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  /**
   * Send info alert
   */
  async info(title: string, message: string, details?: Record<string, any>) {
    return this.sendAlert({
      title,
      message,
      severity: AlertSeverity.INFO,
      details,
    });
  }

  /**
   * Send warning alert
   */
  async warning(title: string, message: string, details?: Record<string, any>) {
    return this.sendAlert({
      title,
      message,
      severity: AlertSeverity.WARNING,
      details,
    });
  }

  /**
   * Send error alert
   */
  async error(title: string, message: string, details?: Record<string, any>) {
    return this.sendAlert({
      title,
      message,
      severity: AlertSeverity.ERROR,
      details,
    });
  }

  /**
   * Send critical alert
   */
  async critical(title: string, message: string, details?: Record<string, any>) {
    return this.sendAlert({
      title,
      message,
      severity: AlertSeverity.CRITICAL,
      details,
    });
  }
}

// Export singleton instance
export const alertService = new AlertService();

// Convenience functions for common alerts

/**
 * Alert when plan generation fails
 */
export const alertPlanGenerationFailed = async (
  userId: string,
  planType: 'meal' | 'workout' | 'both',
  error: string
) => {
  return alertService.sendAlert({
    title: 'Plan Generation Failed',
    message: `Failed to generate ${planType} plan for user`,
    severity: AlertSeverity.ERROR,
    userId,
    details: {
      plan_type: planType,
      error_message: error,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Alert when payment fails
 */
export const alertPaymentFailed = async (
  userId: string,
  amount: number,
  plan: string,
  error: string
) => {
  return alertService.sendAlert({
    title: 'Payment Failed',
    message: `Payment of $${amount} failed for ${plan} plan`,
    severity: AlertSeverity.CRITICAL,
    userId,
    details: {
      amount: `$${amount}`,
      plan,
      error_message: error,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Alert when subscription is cancelled
 */
export const alertSubscriptionCancelled = async (
  userId: string,
  plan: string,
  reason?: string
) => {
  return alertService.sendAlert({
    title: 'Subscription Cancelled',
    message: `User cancelled their ${plan} subscription`,
    severity: AlertSeverity.WARNING,
    userId,
    details: {
      plan,
      reason: reason || 'Not provided',
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Alert when error rate is high
 */
export const alertHighErrorRate = async (
  errorCount: number,
  timeWindow: string,
  errorType?: string
) => {
  return alertService.sendAlert({
    title: 'High Error Rate Detected',
    message: `${errorCount} errors in ${timeWindow}`,
    severity: AlertSeverity.CRITICAL,
    details: {
      error_count: errorCount,
      time_window: timeWindow,
      error_type: errorType || 'Various',
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Alert when ML service is down
 */
export const alertMLServiceDown = async (lastSuccessfulCall?: Date) => {
  return alertService.sendAlert({
    title: 'ML Service Down',
    message: 'Python ML service is not responding',
    severity: AlertSeverity.CRITICAL,
    details: {
      last_successful: lastSuccessfulCall?.toISOString() || 'Unknown',
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Alert when database connection fails
 */
export const alertDatabaseError = async (error: string, query?: string) => {
  return alertService.sendAlert({
    title: 'Database Error',
    message: 'Failed to connect to or query database',
    severity: AlertSeverity.CRITICAL,
    details: {
      error_message: error,
      query: query || 'Not provided',
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Alert when new user signs up (info)
 */
export const alertNewUserSignup = async (
  userId: string,
  email: string,
  method: string
) => {
  return alertService.sendAlert({
    title: 'New User Signup',
    message: `New user signed up via ${method}`,
    severity: AlertSeverity.INFO,
    userId,
    details: {
      email,
      signup_method: method,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Alert when user completes first workout
 */
export const alertFirstWorkoutCompleted = async (
  userId: string,
  workoutName: string
) => {
  return alertService.sendAlert({
    title: 'First Workout Completed',
    message: 'User completed their first workout!',
    severity: AlertSeverity.INFO,
    userId,
    details: {
      workout_name: workoutName,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Alert when API rate limit is hit
 */
export const alertRateLimitExceeded = async (
  userId: string,
  endpoint: string,
  requestCount: number
) => {
  return alertService.sendAlert({
    title: 'Rate Limit Exceeded',
    message: `User hit rate limit for ${endpoint}`,
    severity: AlertSeverity.WARNING,
    userId,
    details: {
      endpoint,
      request_count: requestCount,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Alert when suspicious activity detected
 */
export const alertSuspiciousActivity = async (
  userId: string,
  activityType: string,
  details: Record<string, any>
) => {
  return alertService.sendAlert({
    title: 'Suspicious Activity Detected',
    message: `Potential ${activityType} detected`,
    severity: AlertSeverity.WARNING,
    userId,
    details: {
      activity_type: activityType,
      ...details,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Alert when cache hit rate is low
 */
export const alertLowCacheHitRate = async (
  hitRate: number,
  totalRequests: number
) => {
  return alertService.sendAlert({
    title: 'Low Cache Hit Rate',
    message: `Cache hit rate is only ${hitRate}%`,
    severity: AlertSeverity.WARNING,
    details: {
      hit_rate: `${hitRate}%`,
      total_requests: totalRequests,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Alert when server resources are low
 */
export const alertLowServerResources = async (
  resourceType: 'cpu' | 'memory' | 'disk',
  usage: number
) => {
  return alertService.sendAlert({
    title: 'Low Server Resources',
    message: `${resourceType.toUpperCase()} usage at ${usage}%`,
    severity: usage > 95 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
    details: {
      resource_type: resourceType,
      usage: `${usage}%`,
      threshold: usage > 95 ? 'Critical (>95%)' : 'Warning (>80%)',
      timestamp: new Date().toISOString(),
    },
  });
};

export default alertService;
