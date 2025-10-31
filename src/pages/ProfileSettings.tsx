// src/pages/ProfileSettings.tsx

import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlan } from "@/core/providers/AppProviders";
import { useAuth } from "@/features/auth";
import { AvatarUpload } from "@/features/profile/components/AvatarUpload";
import { InvoicesList } from "@/features/profile/components/InvoicesList";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { SubscriptionCard } from "@/features/profile/components/SubscriptionCard";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useSubscription } from "@/features/profile/hooks/useSubscription";
import { UpgradeModal } from "@/shared/components/feedback/UpgradeModal";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Tabs } from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { CreditCard, FileText, Loader, Settings } from "lucide-react";
import React, { useState } from "react";

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const {
    profile,
    isLoading: loadingProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    isUpdating,
    isUploadingAvatar,
    isDeletingAvatar,
    calculateAge,
    calculateDOB,
  } = useProfile(user?.id);

  const { planName, aiGenQuizCount, allowed, renewal, refresh } = usePlan();

  const {
    subscription,
    isLoadingSubscription,
    invoices,
    isLoadingInvoices,
    cancelSubscription,
    isCancelling,
  } = useSubscription(profile?.stripe_customer_id);

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleUpgrade = () => {
    setShowUpgradeModal(true);
    // TODO: Implement Stripe checkout
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    const success = await cancelSubscription(subscriptionId);
    if (success) {
      await refresh();
    }
    return success;
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">General</span>
                </TabsTrigger>
                <TabsTrigger value="subscription" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Subscription</span>
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Billing</span>
                </TabsTrigger>
              </TabsList>

              {/* General Tab */}
              <TabsContent value="general" className="space-y-6">
                <Card className="p-0">
                  <CardContent className="py-6 space-y-6">
                    <AvatarUpload
                      avatarUrl={profile.avatar_url}
                      onUpload={uploadAvatar}
                      onDelete={() => deleteAvatar(profile.avatar_url!)}
                      isUploading={isUploadingAvatar}
                      isDeleting={isDeletingAvatar}
                    />

                    <hr className="border-border" />

                    <ProfileForm
                      profile={profile}
                      onUpdate={updateProfile}
                      isUpdating={isUpdating}
                      calculateAge={calculateAge}
                      calculateDOB={calculateDOB}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Subscription Tab */}
              <TabsContent value="subscription">
                <SubscriptionCard
                  subscription={subscription}
                  isLoading={isLoadingSubscription}
                  planName={planName}
                  aiGenQuizCount={aiGenQuizCount}
                  allowed={allowed}
                  renewal={renewal}
                  onCancel={handleCancelSubscription}
                  isCancelling={isCancelling}
                  onUpgrade={planName.toLowerCase() === "free" ? handleUpgrade : undefined}
                />
              </TabsContent>

              {/* Billing Tab */}
              <TabsContent value="billing">
                <InvoicesList invoices={invoices} isLoading={isLoadingInvoices} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        showUpgradeModal={showUpgradeModal}
        setShowUpgradeModal={setShowUpgradeModal}
        userId={user?.id!}
      />
    </div>
  );
};

export default ProfileSettings;
