
import type { Profile } from "@/types/community";
import React from "react";
import { UserAvatar } from "../ui/UserAvatar";

interface MentionDropdownProps {
  profiles: Profile[];
  onSelect: (username: string) => void;
}

export const MentionDropdown: React.FC<MentionDropdownProps> = ({
  profiles,
  onSelect,
}) => {
  if (profiles.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 w-full bg-background rounded-lg shadow-lg mb-1 max-h-48 overflow-y-auto z-10">
      {profiles.map((profile) => (
        <button
          key={profile.id}
          onClick={() => onSelect(profile.username)}
          className="w-full px-2 py-2 text-left hover:bg-card flex items-center cursor-pointer space-x-2"
        >
          <UserAvatar
            avatarUrl={profile.avatar_url}
            username={profile.username}
            size="sm"
          />
          <span className="text-xs text-foreground font-medium">
            {profile.username}
          </span>
          <span className="text-foreground/80 text-sm truncate">
            {profile.full_name}
          </span>
        </button>
      ))}
    </div>
  );
};
