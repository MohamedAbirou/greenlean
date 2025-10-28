import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { motion } from "framer-motion";
import { Camera, Loader, Mail, User } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const {
    profile,
    isLoading: loading,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
    isUpdating: updating,
    isUploadingAvatar: uploadingAvatar,
  } = useProfile(user?.id);

  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
  }, [profile]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      setMessage(null);
      await uploadAvatar(file);
      setMessage({
        type: "success",
        text: "Profile picture updated successfully!",
      });
    } catch (error) {
      const err = error as Error;
      setMessage({
        type: "error",
        text: err.message || "Failed to update profile picture. Please try again.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      await updateProfile({ full_name: fullName });
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user || !profile?.avatar_url) return;

    setMessage(null);

    try {
      await deleteAvatar(profile.avatar_url);
      setMessage({
        type: "success",
        text: "Profile picture removed successfully!",
      });
    } catch (error) {
      console.error("Error deleting avatar:", error);
      setMessage({
        type: "error",
        text: "Failed to delete profile picture. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
              </div>

              {message && (
                <div
                  className={`mb-6 p-4 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                      : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Picture */}
                <div>
                  <Label>Profile Picture</Label>
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-24 h-24 rounded-full bg-background flex items-center justify-center overflow-hidden relative group cursor-pointer p-0"
                        onClick={handleAvatarClick}
                      >
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-foreground/70" />
                        )}

                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {uploadingAvatar ? (
                            <Loader className="h-6 w-6 animate-spin text-white" />
                          ) : (
                            <Camera className="h-6 w-6 text-white" />
                          )}
                        </div>
                      </Button>

                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-foreground/70">
                        Click to upload a new profile picture.
                        <br />
                        Recommended: Square image, at least 400x400 pixels.
                        <br />
                        Maximum size: 5MB
                      </p>
                      {profile?.avatar_url && (
                        <Button
                          variant="link"
                          type="button"
                          className="text-destructive hover:underline p-0"
                          onClick={handleDeleteAvatar}
                        >
                          Delete profile picture
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <Label>Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/70" />
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="pl-10 bg-background"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/70" />
                    <Input
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="pl-10 bg-background/80 text-foreground/70 cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-2 text-sm text-foreground/70">
                    Email cannot be changed. Contact support if you need to update your email.
                  </p>
                </div>

                {/* Submit */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-white flex items-center"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Updating...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
