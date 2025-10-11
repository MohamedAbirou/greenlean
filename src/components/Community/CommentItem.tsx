import { Heart } from "lucide-react";
import React from "react";
import { Comment } from "../../types/community";
import { formatNumber } from "../../utils/formatters";
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
        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
          <div>
            <p className="font-medium text-xs text-gray-800 dark:text-white">
              {comment.user.username}
            </p>
            <p className="text-gray-600 text-sm dark:text-gray-300">
              {comment.content}
            </p>
          </div>
          <button
            onClick={onLike}
            className="flex items-center text-black dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
          >
            <Heart
              className={`h-4 w-4 ${
                comment.liked_by_user ? "fill-red-500 text-red-500" : ""
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
            className="text-xs ml-2 text-gray-500 dark:text-gray-400"
          >
            Reply • {comment.replies_count || 0}
          </button>
        )}
      </div>
    </div>
  );
};
