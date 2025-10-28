import { Users } from "lucide-react";
import React from "react";

interface UserAvatarProps {
  avatarUrl: string | null;
  username: string;
  size?: "sm" | "md" | "lg";
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  username,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-8 h-8",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-button overflow-hidden flex-shrink-0`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={username}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-background text-foreground/80">
          <Users className={iconSizes[size]} />
        </div>
      )}
    </div>
  );
};
