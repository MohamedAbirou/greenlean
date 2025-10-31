// src/pages/admin-dashboard/AdminDashboard.tsx
import { useAdminStatus } from "@/features/admin";
import AdminSidebarLayout from "@/features/admin/components/AdminSidebarLayout";
import BadgesTab from "@/features/admin/components/BadgesTabs";
import ChallengesTab from "@/features/admin/components/ChallengesTab";
import RewardsTab from "@/features/admin/components/RewardsTab";
import UsersTab from "@/features/admin/components/UsersTab";
import {
  useConversionFunnel,
  useDashboardMetrics,
  useRecentActivity,
  useSystemHealth,
  useTopUsers,
} from "@/features/admin/hooks/useAnalytics";
import { useAuth } from "@/features/auth";
import { Moon, Settings, Sun, UserCircle } from "lucide-react";
import React, { useState } from "react";

// Import the new professional dashboard tabs
import { AnalyticsTab } from "@/features/admin/components/AnalyticsTab";
import OverviewTab from "@/features/admin/components/OverviewTab";
import { PlanQuizTab } from "@/features/admin/components/PlanQuizTab";
import SubscriptionsTab from "@/features/admin/components/SubscriptionsTab";
import { SystemHealthTab } from "@/features/admin/components/SystemHealthTab";
import { useProfile } from "@/features/profile";
import NotificationsDropdown from "@/shared/components/NotificationsDropdown";
import { Button } from "@/shared/components/ui/button";
import { UserMenu } from "@/shared/components/UserMenu";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { useThemeStore } from "@/store/themeStore";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const { user, signOut } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminStatus(user?.id);
  const { profile } = useProfile(user?.id);

  // Fetch dashboard data
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics(dateRange);
  const { data: recentActivity } = useRecentActivity(10);
  const { data: topUsers } = useTopUsers(10);
  const { data: funnelData, isLoading: funnelLoading } = useConversionFunnel(dateRange);
  const { data: systemHealth, isLoading: healthLoading } = useSystemHealth();

  // Loading state
  if (adminLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Admin Access Required</h2>
          <p className="text-secondary-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewTab
            data={metrics}
            recentActivity={recentActivity || []}
            topUsers={topUsers || []}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            isLoading={metricsLoading}
          />
        );
      case "analytics":
        return (
          <AnalyticsTab
            funnelData={funnelData!}
            metrics={metrics as any}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            isLoading={funnelLoading}
          />
        );
      case "plans":
        return <PlanQuizTab metrics={metrics} isLoading={metricsLoading} />;
      case "system":
        return <SystemHealthTab health={systemHealth} isLoading={healthLoading} />;
      case "challenges":
        return <ChallengesTab userId={user?.id} />;
      case "badges":
        return <BadgesTab />;
      case "users":
        return <UsersTab />;
      case "rewards":
        return <RewardsTab />;
      case "subscriptions":
        return <SubscriptionsTab currentUserId={user?.id || ""} />;
      default:
        return null;
    }
  };

  const renderAvatar = () => {
    if (profile?.avatar_url) {
      return (
        <img src={profile.avatar_url} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
      );
    }

    return <UserCircle size={32} className="text-primary " />;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const renderUserMenu = () => (
    <>
      <div className="flex items-center justify-between gap-2 overflow-hidden">
        <p className="text-sm font-medium text-foreground">
          {profile?.full_name || user?.email?.split("@")[0]}
        </p>
        {/* Show role if admin or super admin as Super Admin instead of super_admin */}
        {profile?.admin_users?.role && (
          <span
            className={`badge-${
              profile?.admin_users?.role === "super_admin" ? "purple" : "green"
            } px-2 py-1 rounded-full text-xs`}
          >
            {profile?.admin_users?.role === "super_admin"
              ? "Super Admin"
              : profile?.admin_users?.role}
          </span>
        )}
      </div>
      <p className="text-xs text-foreground/70 truncate">{user?.email}</p>
    </>
  );

  return (
    <AdminSidebarLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* Top Bar */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-6 py-[7px] flex items-center justify-end gap-3">
          <NotificationsDropdown
            notifications={notifications.slice(0, 15)}
            onNotificationClick={(n) => {
              markAsRead(n.id);
            }}
            markAllAsRead={markAllAsRead}
            clearAll={clearAll}
            unreadCount={unreadCount}
          />

          <Button
            variant="secondary"
            onClick={toggleTheme}
            className={`rounded-full ${isDarkMode && "text-yellow-500"}`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          <UserMenu
            isAdmin={isAdmin}
            renderAvatar={renderAvatar}
            renderUserMenu={renderUserMenu}
            handleSignOut={handleSignOut}
          />
        </div>
      </header>

      <div className="p-6">{renderTabContent()}</div>
    </AdminSidebarLayout>
  );
};

export default AdminDashboard;
