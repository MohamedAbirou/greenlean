/**
 * Supabase Realtime Hook
 *
 * Generic hook for subscribing to real-time database changes.
 * Automatically invalidates React Query cache when data changes.
 *
 * Usage:
 * ```ts
 * useSupabaseRealtime({
 *   table: 'challenges',
 *   queryKey: ['challenges'],
 *   enabled: true
 * });
 * ```
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface UseSupabaseRealtimeOptions {
  /** The table to subscribe to */
  table: string;

  /** React Query key to invalidate on changes */
  queryKey: string | readonly unknown[];

  /** Optional filter (e.g., "user_id=eq.123") */
  filter?: string;

  /** Events to listen to (default: all) */
  events?: ('INSERT' | 'UPDATE' | 'DELETE' | '*')[];

  /** Enable/disable subscription */
  enabled?: boolean;

  /** Optional callback when data changes */
  onDataChange?: (payload: RealtimePostgresChangesPayload<any>) => void;

  /** Optional callback for errors */
  onError?: (error: Error) => void;
}

export function useSupabaseRealtime({
  table,
  queryKey,
  filter,
  enabled = true,
  onDataChange,
  onError,
}: UseSupabaseRealtimeOptions) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Store callbacks in refs to prevent re-subscription loops
  const onDataChangeRef = useRef(onDataChange);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
    onErrorRef.current = onError;
  }, [onDataChange, onError]);

  useEffect(() => {
    if (!enabled) {
      // Clean up if disabled
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Create unique channel name
    const channelName = `realtime:${table}${filter ? `:${filter}` : ''}`;

    // Don't recreate if same channel already exists
    if (channelRef.current) {
      // If the channel name hasn't changed, don't recreate
      const currentChannelTopic = channelRef.current.topic;
      if (currentChannelTopic === channelName) {
        return;
      }

      // Different channel needed, unsubscribe from old one
      supabase.removeChannel(channelRef.current);
    }

    // Create new channel
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          ...(filter && { filter }),
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log(`[Realtime] ${payload.eventType} on ${table}:`, payload);

          // Invalidate query to trigger refetch
          queryClient.invalidateQueries({ queryKey: Array.isArray(queryKey) ? queryKey : [queryKey] });

          // Call custom callback if provided
          if (onDataChangeRef.current) {
            onDataChangeRef.current(payload);
          }
        }
      )
      .subscribe((status, err) => {
        console.log(`[Realtime] Subscription status for ${table}:`, status);

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          const error = new Error(`Realtime subscription error for table: ${table}. Status: ${status}`);
          console.error(error);
          if (onErrorRef.current) {
            onErrorRef.current(error);
          }
        }

        if (err) {
          console.error(`[Realtime] Subscription error for ${table}:`, err);
          if (onErrorRef.current) {
            onErrorRef.current(err instanceof Error ? err : new Error(String(err)));
          }
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount or when dependencies change
    return () => {
      if (channelRef.current) {
        console.log(`[Realtime] Cleaning up subscription for ${table}`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, filter, enabled, queryClient, queryKey]);
}

/**
 * Hook for real-time challenges with automatic invalidation
 */
export function useChallengesRealtime(userId?: string, enabled: boolean = true) {
  useSupabaseRealtime({
    table: 'challenges',
    queryKey: ['challenges', userId],
    enabled,
  });

  useSupabaseRealtime({
    table: 'challenge_participants',
    queryKey: ['challenges', userId],
    enabled,
  });
}

/**
 * Hook for real-time user rewards with automatic invalidation
 */
export function useRewardsRealtime(enabled: boolean = true) {
  useSupabaseRealtime({
    table: 'user_rewards',
    queryKey: ['rewards'],
    enabled,
  });
}

/**
 * Hook for real-time meal plans with automatic invalidation
 */
export function useMealPlanRealtime(userId?: string, enabled: boolean = true) {
  useSupabaseRealtime({
    table: 'diet_plan',
    queryKey: ['diet-plan', userId],
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: enabled && !!userId,
  });

  useSupabaseRealtime({
    table: 'nutrition_logs',
    queryKey: ['nutrition-logs', userId],
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: enabled && !!userId,
  });
}

/**
 * Hook for real-time workout plans with automatic invalidation
 */
export function useWorkoutPlanRealtime(userId?: string, enabled: boolean = true) {
  useSupabaseRealtime({
    table: 'workout_plan',
    queryKey: ['workout-plan', userId],
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: enabled && !!userId,
  });

  useSupabaseRealtime({
    table: 'workout_logs',
    queryKey: ['workout-logs', userId],
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: enabled && !!userId,
  });
}

/**
 * Hook for real-time quiz results and plan status
 */
export function usePlanStatusRealtime(userId?: string, enabled: boolean = true) {
  useSupabaseRealtime({
    table: 'quiz_results',
    queryKey: ['quiz-results', userId],
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: enabled && !!userId,
  });

  useSupabaseRealtime({
    table: 'plan_generation_status',
    queryKey: ['plan-status', userId],
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: enabled && !!userId,
  });
}

/**
 * Hook for real-time profile updates
 */
export function useProfileRealtime(userId?: string, enabled: boolean = true) {
  useSupabaseRealtime({
    table: 'profiles',
    queryKey: ['profile', userId],
    filter: userId ? `id=eq.${userId}` : undefined,
    enabled: enabled && !!userId,
  });
}

/**
 * Hook for real-time dashboard data (aggregates multiple tables)
 */
export function useDashboardRealtime(userId?: string, enabled: boolean = true) {
  // Subscribe to profiles for overview data
  useSupabaseRealtime({
    table: 'profiles',
    queryKey: ['dashboard', userId],
    filter: userId ? `id=eq.${userId}` : undefined,
    enabled: enabled && !!userId,
  });

  // Subscribe to quiz_results for calculations
  useSupabaseRealtime({
    table: 'quiz_results',
    queryKey: ['dashboard', userId],
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: enabled && !!userId,
  });

  // Subscribe to ai_meal_plans for diet plan data
  useSupabaseRealtime({
    table: 'ai_meal_plans',
    queryKey: ['dashboard', userId],
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: enabled && !!userId,
  });

  // Subscribe to ai_workout_plans for workout plan data
  useSupabaseRealtime({
    table: 'ai_workout_plans',
    queryKey: ['dashboard', userId],
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: enabled && !!userId,
  });
}
