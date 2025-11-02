/**
 * Protected Route Component
 * Redirects to home if user is not authenticated
 */

import { useAdminStatus, useSettings } from "@/features/admin";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { FullPageLoader } from "../../../shared/components/feedback";
import { useAuth } from "../hooks";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { isAdmin } = useAdminStatus(user?.id);
  const { settings } = useSettings();

  if (loading) {
    return <FullPageLoader text="Verifying authentication..." />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Include quiz in the maintenance mode check
  if (settings?.maintenance_mode && !isAdmin) {
    return <Navigate to="/maintenance" replace />;
  }

  return <>{children}</>;
}
