/**
 * Supabase Library Exports
 * Central export point for all Supabase-related utilities
 */

export { supabase, getSupabaseClient } from "./client";
export { handleSupabaseError, isAuthError } from "./errors";
export type { ApiError } from "./errors";
