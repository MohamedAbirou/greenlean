import { fetchComments } from "@/hooks/useCommunityPhotos";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/services/notificationService";
import type { Photo } from "@/types/community";
import { formatNumber } from "@/utils/formatters";
import type { User } from "@supabase/supabase-js";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Send } from "lucide-react";
import React, { useCallback } from "react";
import { UserAvatar } from "../ui/UserAvatar";
import { CommentSection } from "./CommentSection";

interface PhotoCardProps {
  photo: Photo;
  userId: string | undefined;
  user: User;
  userAvatar: string | null;
  isCommentsExpanded: boolean;
  onToggleComments: (photoId: string) => void;
  onPhotosUpdate: (updater: (photos: Photo[]) => Photo[]) => void;
  photoRef?: (el: HTMLDivElement | null) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  userId,
  user,
  userAvatar,
  isCommentsExpanded,
  onToggleComments,
  onPhotosUpdate,
  photoRef,
}) => {
  const [commentsLoading, setCommentsLoading] = React.useState(false);

  const username = user?.identities?.[0]?.identity_data?.username;

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

        // Notification logic (only if not liking own post)
        if (photo.user_id && userId && photo.user_id !== userId) {
          console.log("Username: ", username);
          await createNotification({
            recipient_id: photo.user_id,
            sender_id: userId,
            type: "like",
            entity_id: photo.id,
            entity_type: "post",
            message: `${username || "Someone"} liked your photo.`,
          });
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  }, [photo.liked_by_user, photo.id, photo.user_id, userId, onPhotosUpdate, username]);

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
      className="bg-card/50 border border-border rounded-md shadow-lg overflow-hidden w-full max-w-sm mx-auto"
    >
      <div className="p-2 flex items-center justify-between border-b border-border">
        <div className="flex items-center space-x-2">
          <UserAvatar
            avatarUrl={photo.user?.avatar_url}
            username={photo.user?.username}
            size="md"
          />
          <p className="font-medium text-sm text-foreground">
            {photo.user?.username}
            <span className="text-xs ml-1 text-foreground/60">
              •{" "}
              {formatDistanceToNow(new Date(photo.created_at), {
                addSuffix: true,
              })}
            </span>
          </p>
        </div>
      </div>

      <img
        src={photo.photo_url}
        alt={`Week ${photo.week_number}`}
        className="w-full rounded-sm aspect-square object-contain"
      />

      <div className="p-2 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleLike}
              className="flex items-center text-foreground hover:text-destructive cursor-pointer"
            >
              <Heart
                className={`h-5 w-5 ${
                  photo.liked_by_user ? "fill-destructive text-destructive" : ""
                }`}
              />
              <span className="ml-1 text-xs font-semibold">
                {formatNumber(photo.likes)}
              </span>
            </button>
            <button
              onClick={handleExpandComments}
              className="flex items-center text-foreground cursor-pointer"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="ml-1 text-xs font-semibold">
                {formatNumber(photo.comments_count)}
              </span>
            </button>
            <button
              onClick={handleShare}
              className="text-foreground cursor-pointer"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>

        {photo.caption && (
          <p className="text-sm text-foreground mt-2">
            <span className="font-medium mr-2">{photo.user?.username}</span>
            {photo.caption}
          </p>
        )}
      </div>

      <div className={`${isCommentsExpanded ? "p-2" : ""}`}>
        <CommentSection
          photo={photo}
          isExpanded={isCommentsExpanded}
          userId={userId}
          username={username}
          userAvatar={userAvatar}
          onPhotosUpdate={onPhotosUpdate}
          commentsLoading={commentsLoading}
        />
      </div>
    </motion.div>
  );
};
