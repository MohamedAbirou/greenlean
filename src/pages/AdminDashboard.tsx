import { useAdminStatus } from '@/features/admin';
import AdminNav from '@/features/admin/components/AdminNav';
import BadgesTab from '@/features/admin/components/BadgesTabs';
import ChallengesTab from '@/features/admin/components/ChallengesTab';
import OverviewTab from '@/features/admin/components/OverviewTab';
import RewardsTab from '@/features/admin/components/RewardsTab';
import UsersTab from '@/features/admin/components/UsersTab';
import { useAuth } from "@/features/auth";
import { Loader, Settings } from 'lucide-react';
import React, { useState } from 'react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const { isAdmin, isLoading: loading } = useAdminStatus(user?.id);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className={`h-8 w-8 animate-spin text-primary`} />
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
        return <OverviewTab />;
      case 'challenges':
        return <ChallengesTab userId={user?.id} />;
      case 'badges':
        return <BadgesTab />;
      case 'users':
        return <UsersTab />;
      case 'rewards':
        return <RewardsTab />;
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
              <Settings className={`h-8 w-8 text-primary mr-3`} />
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
        <AdminNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        <div className="mb-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;