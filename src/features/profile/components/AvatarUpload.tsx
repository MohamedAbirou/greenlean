import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { UseMutateAsyncFunction } from "@tanstack/react-query";
import { Camera, Loader, Trash2, User } from "lucide-react";
import React, { useRef } from "react";
import toast from "react-hot-toast";

interface AvatarUploadProps {
  avatarUrl: string | null;
  onUpload: UseMutateAsyncFunction<string, Error, File, unknown>;
  onDelete: () => Promise<void>;
  isUploading: boolean;
  isDeleting: boolean;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  avatarUrl,
  onUpload,
  onDelete,
  isUploading,
  isDeleting,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("File must be an image");
        return;
      }

      await onUpload(file);
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to update profile picture. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete();
      toast.success("Profile picture removed successfully!");
    } catch (error) {
      console.error("Error deleting avatar:", error);
      toast.error("Failed to delete profile picture. Please try again.");
    }
  };

  return (
    <div>
      <Label>Profile Picture</Label>
      <div className="flex items-center space-x-6">
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden relative group cursor-pointer p-0 border-2 border-border"
            onClick={handleAvatarClick}
            disabled={isUploading || isDeleting}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-muted-foreground" />
            )}

            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {isUploading || isDeleting ? (
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
            disabled={isUploading || isDeleting}
          />
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-sm text-muted-foreground">
            Click to upload a new profile picture.
            <br />
            Recommended: Square image, at least 400x400 pixels.
            <br />
            Maximum size: 5MB
          </p>
          {avatarUrl && (
            <Button
              variant="outline"
              type="button"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleDelete}
              disabled={isUploading || isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete picture
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
