import { useAdminStatus } from "@/features/admin/hooks/useAdminStatus";
import { useSettings } from "@/features/admin/hooks/useSettings";
import { useAuth } from "@/features/auth";
import MaintenancePage from "@/pages/MaintenancePage";

export const MaintenanceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminStatus(user?.id);
  const { settings, isLoading: settingsLoading } = useSettings();

  // Show loading spinner while checking
  if (authLoading || settingsLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show maintenance page to non-admins when enabled
  if (settings?.maintenance_mode && !isAdmin) {
    return <MaintenancePage />;
  }

  // Allow access
  return <>{children}</>;
};
