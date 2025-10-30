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
import { Download, Loader, Moon, Search, Settings, Sun } from "lucide-react";
import React, { useState } from "react";

// Import the new professional dashboard tabs
import { AnalyticsTab } from "@/features/admin/components/AnalyticsTab";
import OverviewTab from "@/features/admin/components/OverviewTab";
import { PlanQuizTab } from "@/features/admin/components/PlanQuizTab";
import { SystemHealthTab } from "@/features/admin/components/SystemHealthTab";
import NotificationsDropdown from "@/shared/components/NotificationsDropdown";
import { Button } from "@/shared/components/ui/button";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { useThemeStore } from "@/store/themeStore";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const { isDarkMode, toggleTheme } = useThemeStore();

  // const [dateRange, setDateRange] = useState("30d");

  const { user } = useAuth();
  const { isAdmin, isLoading: adminLoading } = useAdminStatus(user?.id);

  // Fetch dashboard data
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics(dateRange);
  const { data: recentActivity } = useRecentActivity(10);
  const { data: topUsers } = useTopUsers(10);
  const { data: funnelData, isLoading: funnelLoading } = useConversionFunnel(dateRange);
  const { data: systemHealth, isLoading: healthLoading } = useSystemHealth();

  // Loading state
  if (adminLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
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
            funnelData={funnelData || []}
            metrics={metrics}
            // dateRange={dateRange}
            isLoading={funnelLoading}
          />
        );
      case "plans":
        return <PlanQuizTab metrics={metrics} />;
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
      default:
        return null;
    }
  };

  return (
    <AdminSidebarLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* Top Bar */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users, challenges, or data..."
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as "7d" | "30d" | "90d" | "1y")}
              className="px-3 py-2 bg-background border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            {/* <button className="relative p-2 hover:bg-accent rounded-sm transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
            </button> */}
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
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-sm font-medium hover:bg-primary/90 text-sm flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">{renderTabContent()}</div>
    </AdminSidebarLayout>
  );
};

export default AdminDashboard;
