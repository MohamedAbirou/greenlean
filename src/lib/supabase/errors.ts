/**
 * Supabase Error Handling Utilities
 * Centralized error handling and user-friendly messages
 */

import { PostgrestError } from "@supabase/supabase-js";

export interface ApiError {
  message: string;
  code?: string;
  details?: string;
}

export function handleSupabaseError(error: PostgrestError | Error | null): ApiError {
  if (!error) {
    return {
      message: "An unknown error occurred",
    };
  }

  if ("code" in error && "details" in error) {
    const postgrestError = error as PostgrestError;

    switch (postgrestError.code) {
      case "PGRST116":
        return {
          message: "No data found",
          code: postgrestError.code,
          details: postgrestError.details,
        };
      case "23505":
        return {
          message: "This record already exists",
          code: postgrestError.code,
          details: postgrestError.details,
        };
      case "23503":
        return {
          message: "Related record not found",
          code: postgrestError.code,
          details: postgrestError.details,
        };
      case "42501":
        return {
          message: "You don't have permission to perform this action",
          code: postgrestError.code,
          details: postgrestError.details,
        };
      default:
        return {
          message: postgrestError.message || "Database error occurred",
          code: postgrestError.code,
          details: postgrestError.details,
        };
    }
  }

  return {
    message: error.message || "An error occurred",
  };
}

export function isAuthError(error: ApiError): boolean {
  return error.code === "42501" || error.message.includes("permission");
}
