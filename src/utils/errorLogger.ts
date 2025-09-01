import { supabase } from "../lib/supabase";

export interface LogLevel {
  error: 'error';
  warning: 'warning';
  info: 'info';
  debug: 'debug';
}

export interface LogSource {
  frontend: 'frontend';
  backend: 'backend';
}

export const logError = async (
  level: keyof LogLevel,
  source: keyof LogSource,
  message: string,
  stackTrace?: string,
  metadata?: Record<string, string>,
  userId?: string
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('log_admin_error', {
      p_level: level,
      p_source: source,
      p_message: message,
      p_stack_trace: stackTrace || null,
      p_metadata: metadata || {},
      p_user_id: userId || null
    });
    
    if (error) {
      console.error('Failed to log error to admin_logs:', error);
    }
  } catch (err) {
    console.error('Error logging to admin_logs:', err);
  }
};

// Convenience functions for different log levels
export const logInfo = async (
  source: keyof LogSource,
  message: string,
  metadata?: Record<string, string>,
  userId?: string
): Promise<void> => {
  await logError('info', source, message, undefined, metadata, userId);
};

export const logWarning = async (
  source: keyof LogSource,
  message: string,
  stackTrace?: string,
  metadata?: Record<string, string>,
  userId?: string
): Promise<void> => {
  await logError('warning', source, message, stackTrace, metadata, userId);
};

export const logDebug = async (
  source: keyof LogSource,
  message: string,
  metadata?: Record<string, string>,
  userId?: string
): Promise<void> => {
  await logError('debug', source, message, undefined, metadata, userId);
};

// Function to log frontend errors
export const logFrontendError = async (
  message: string,
  error?: Error | string,
  metadata?: Record<string, string>,
  userId?: string
): Promise<void> => {
  const stackTrace = error instanceof Error ? error.stack : error;
  await logError('error', 'frontend', message, stackTrace, metadata, userId);
};

// Function to log backend errors
export const logBackendError = async (
  message: string,
  error?: Error | string,
  metadata?: Record<string, string>,
  userId?: string
): Promise<void> => {
  const stackTrace = error instanceof Error ? error.stack : error;
  await logError('error', 'backend', message, stackTrace, metadata, userId);
};
