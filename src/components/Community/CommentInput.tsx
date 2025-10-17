
import type { Profile } from "@/types/community";
import React, { useRef } from "react";
import { UserAvatar } from "../ui/UserAvatar";
import { MentionDropdown } from "./MentionDropdown";

interface CommentInputProps {
  value: string;
  onChange: (value: string, cursorPos: number) => void;
  onSubmit: () => void;
  placeholder: string;
  userAvatar: string | null;
  showMentions: boolean;
  mentionResults: Profile[];
  onMentionSelect: (username: string) => void;
  inputId: string;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  userAvatar,
  showMentions,
  mentionResults,
  onMentionSelect,
  inputId,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value, e.target.selectionStart);
  };

  return (
    <div className="flex items-start space-x-3">
      <UserAvatar avatarUrl={userAvatar} username="You" size="md" />
      <div key={inputId} className="flex-grow relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="w-full px-2 py-1 bg-background text-foreground rounded-sm resize-none focus:outline-none focus:ring-2 text-sm focus:ring-primary"
          rows={1}
        />
        {showMentions && (
          <MentionDropdown
            profiles={mentionResults}
            onSelect={onMentionSelect}
          />
        )}
      </div>
    </div>
  );
};
