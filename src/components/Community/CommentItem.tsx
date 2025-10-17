
import type { Comment } from "@/types/community";
import { formatNumber } from "@/utils/formatters";
import { Heart } from "lucide-react";
import React from "react";
import { UserAvatar } from "../ui/UserAvatar";

interface CommentItemProps {
  comment: Comment;
  onLike: () => void;
  onReplyClick: () => void;
  isReply?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onLike,
  onReplyClick,
  isReply = false,
}) => {
  return (
    <div className={`flex items-start space-x-3 ${isReply ? "" : ""}`}>
      <UserAvatar
        avatarUrl={comment.user.avatar_url}
        username={comment.user.username}
        size="md"
      />
      <div className="flex-grow">
        <div className="flex items-center justify-between bg-background rounded-sm px-2 py-1">
          <div>
            <p className="font-medium text-xs text-foreground">
              {comment.user.username}
            </p>
            <p className="text-foreground/90 text-sm">
              {comment.content}
            </p>
          </div>
          <button
            onClick={onLike}
            className="flex items-center text-foreground hover:text-destructive cursor-pointer"
          >
            <Heart
              className={`h-4 w-4 ${
                comment.liked_by_user ? "fill-destructive text-destructive" : ""
              }`}
            />
            <span className="ml-1 text-xs font-semibold">
              {formatNumber(comment.likes)}
            </span>
          </button>
        </div>
        {!isReply && (
          <button
            onClick={onReplyClick}
            className="text-xs ml-2 text-foreground/80 cursor-pointer"
          >
            Reply • {comment.replies_count || 0}
          </button>
        )}
      </div>
    </div>
  );
};
