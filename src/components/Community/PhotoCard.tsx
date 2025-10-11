import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Send } from "lucide-react";
import React, { useCallback } from "react";
import { fetchComments } from "../../hooks/useCommunityPhotos";
import { supabase } from "../../lib/supabase";
import { Photo } from "../../types/community";
import { formatNumber } from "../../utils/formatters";
import { UserAvatar } from "../ui/UserAvatar";
import { CommentSection } from "./CommentSection";

interface PhotoCardProps {
  photo: Photo;
  userId: string | undefined;
  userAvatar: string | null;
  isCommentsExpanded: boolean;
  onToggleComments: (photoId: string) => void;
  onPhotosUpdate: (updater: (photos: Photo[]) => Photo[]) => void;
  photoRef?: (el: HTMLDivElement | null) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  userId,
  userAvatar,
  isCommentsExpanded,
  onToggleComments,
  onPhotosUpdate,
  photoRef,
}) => {
  const [commentsLoading, setCommentsLoading] = React.useState(false);

  const toggleLike = useCallback(async () => {
    try {
      if (photo.liked_by_user) {
        await supabase
          .from("photo_likes")
          .delete()
          .eq("photo_id", photo.id)
          .eq("user_id", userId);

        onPhotosUpdate((photos) =>
          photos.map((p) =>
            p.id === photo.id
              ? { ...p, likes: p.likes - 1, liked_by_user: false }
              : p
          )
        );
      } else {
        await supabase
          .from("photo_likes")
          .insert({ photo_id: photo.id, user_id: userId });

        onPhotosUpdate((photos) =>
          photos.map((p) =>
            p.id === photo.id
              ? { ...p, likes: p.likes + 1, liked_by_user: true }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  }, [photo.id, photo.liked_by_user, userId, onPhotosUpdate]);

  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/community?photoId=${photo.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this post on GreenLean!",
          text: photo.caption || "Fitness inspiration from the community",
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Could not copy link: ", err);
      }
    }
  }, [photo.id, photo.caption]);

  const handleExpandComments = useCallback(async () => {
    const isExpanded = isCommentsExpanded;

    if (isExpanded) {
      onToggleComments(photo.id);
      return;
    }

    onToggleComments(photo.id);

    if (photo.comments_fetched && photo.comments.length > 0) {
      return;
    }

    setCommentsLoading(true);

    try {
      const comments = await fetchComments(photo.id, userId);

      onPhotosUpdate((photos) =>
        photos.map((p) =>
          p.id === photo.id ? { ...p, comments, comments_fetched: true } : p
        )
      );
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  }, [
    isCommentsExpanded,
    photo.id,
    photo.comments_fetched,
    photo.comments.length,
    userId,
    onToggleComments,
    onPhotosUpdate,
  ]);

  return (
    <motion.div
      layout
      ref={photoRef}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden w-full max-w-sm mx-auto"
    >
      <div className="p-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <UserAvatar
            avatarUrl={photo.user?.avatar_url}
            username={photo.user?.username}
            size="lg"
          />
          <p className="flex flex-col font-medium text-gray-800 dark:text-white">
            {photo.user?.username}
            <span className="text-xs text-zinc-400 dark:text-gray-400">
              {formatDistanceToNow(photo.created_at)}
            </span>
          </p>
        </div>
      </div>

      <img
        src={photo.photo_url}
        alt={`Week ${photo.week_number}`}
        className="w-full aspect-square object-contain"
      />

      <div className="p-2 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleLike}
              className="flex items-center text-black dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            >
              <Heart
                className={`h-5 w-5 ${
                  photo.liked_by_user ? "fill-red-500 text-red-500" : ""
                }`}
              />
              <span className="ml-1 text-xs font-semibold">
                {formatNumber(photo.likes)}
              </span>
            </button>
            <button
              onClick={handleExpandComments}
              className="flex items-center text-black dark:text-gray-400"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="ml-1 text-xs font-semibold">
                {formatNumber(photo.comments_count)}
              </span>
            </button>
            <button
              onClick={handleShare}
              className="text-black dark:text-gray-400"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>

        {photo.caption && (
          <>
            <p className="text-sm text-gray-800 dark:text-white mb-2">
              <span className="font-medium mr-2">{photo.user?.username}</span>
              {photo.caption}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-200">
              {formatDistanceToNow(new Date(photo.created_at), {
                addSuffix: true,
              })}
            </p>
          </>
        )}
      </div>

      <div className="p-2">
        <CommentSection
          photo={photo}
          isExpanded={isCommentsExpanded}
          userId={userId}
          userAvatar={userAvatar}
          onPhotosUpdate={onPhotosUpdate}
          commentsLoading={commentsLoading}
        />
      </div>
    </motion.div>
  );
};
