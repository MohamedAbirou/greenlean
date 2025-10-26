/**
 * Environment Configuration
 * Centralized environment variable access with validation
 */

interface Environment {
  supabase: {
    url: string;
    anonKey: string;
  };
  mlService: {
    url: string;
  };
  isDevelopment: boolean;
  isProduction: boolean;
}

function validateEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env: Environment = {
  supabase: {
    url: validateEnvVar("VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL),
    anonKey: validateEnvVar("VITE_SUPABASE_ANON_KEY", import.meta.env.VITE_SUPABASE_ANON_KEY),
  },
  mlService: {
    url: import.meta.env.VITE_ML_SERVICE_URL || "",
  },
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};
