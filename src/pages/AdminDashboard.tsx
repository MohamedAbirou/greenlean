import AdminNav from '@/components/admin/AdminNav';
import ChallengesTab from '@/components/admin/ChallengesTab';
import OverviewTab from '@/components/admin/OverviewTab';
import RewardsTab from '@/components/admin/RewardsTab';
import SettingsTab from '@/components/admin/SettingsTab';
import UsersTab from '@/components/admin/UsersTab';
import { usePlatform } from '@/contexts/PlatformContext';
import { useAuth } from "@/contexts/useAuth";
import { supabase } from '@/lib/supabase';
import { useColorTheme } from '@/utils/colorUtils';
import { Loader, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const platform = usePlatform();
  const colorTheme = useColorTheme(platform.settings?.theme_color);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className={`h-8 w-8 animate-spin ${colorTheme.primaryText}`} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Admin Access Required
          </h2>
          <p className="text-secondary-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab colorTheme={colorTheme} />;
      case 'challenges':
        return <ChallengesTab colorTheme={colorTheme} userId={user?.id} />;
      case 'users':
        return <UsersTab colorTheme={colorTheme} />;
      case 'rewards':
        return <RewardsTab colorTheme={colorTheme} />;
      case 'settings':
        return <SettingsTab colorTheme={colorTheme} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <div className="bg-card rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className={`h-8 w-8 ${colorTheme.primaryText} mr-3`} />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Admin Dashboard
                </h1>
                <p className="text-foreground/80">
                  Manage your platform
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <AdminNav activeTab={activeTab} setActiveTab={setActiveTab} colorTheme={colorTheme} />

        {/* Tab Content */}
        <div className="mb-8">
          {renderTabContent()}
        </div>
        {/* <section className="mt-10">
          <NotificationsMonitor />
        </section> */}
      </div>
    </div>
  );
};

export default AdminDashboard;