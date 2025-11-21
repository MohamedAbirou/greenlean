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

import { useEffect, useRef } from 'react';
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
  events = ['*'],
  enabled = true,
  onDataChange,
  onError,
}: UseSupabaseRealtimeOptions) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Create unique channel name
    const channelName = `realtime:${table}${filter ? `:${filter}` : ''}`;

    // Unsubscribe from previous channel if it exists
    if (channelRef.current) {
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
          if (onDataChange) {
            onDataChange(payload);
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Subscription status for ${table}:`, status);

        if (status === 'SUBSCRIPTION_ERROR') {
          const error = new Error(`Realtime subscription error for table: ${table}`);
          console.error(error);
          if (onError) {
            onError(error);
          }
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table, filter, enabled, queryClient, queryKey, onDataChange, onError]);
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
