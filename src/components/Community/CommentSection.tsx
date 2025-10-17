import { fetchReplies } from "@/hooks/useCommunityPhotos";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/services/notificationService";
import type { Photo, Profile } from "@/types/community";
import { extractMentions } from "@/utils/formatters";
import React, { useCallback, useState } from "react";
import { CommentSkeleton, ReplySkeleton } from "../ui/Skeletons";
import { CommentInput } from "./CommentInput";
import { CommentItem } from "./CommentItem";

interface CommentSectionProps {
  photo: Photo;
  isExpanded: boolean;
  userId: string | undefined;
  username: string;
  userAvatar: string | null;
  onPhotosUpdate: (updater: (photos: Photo[]) => Photo[]) => void;
  commentsLoading: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  photo,
  isExpanded,
  userId,
  username,
  userAvatar,
  onPhotosUpdate,
  commentsLoading,
}) => {
  const [repliesLoading, setRepliesLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const [expandedReplies, setExpandedReplies] = useState<string[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [mentionResults, setMentionResults] = useState<Profile[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleMentionSearch = useCallback(
    async (text: string, inputId: string) => {
      setActiveInputId(inputId);

      const lastMention = text.match(/@(\w*)$/);
      if (lastMention) {
        const searchTerm = lastMention[1].toLowerCase();
        setShowMentions(true);

        try {
          const { data } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .ilike("username", `${searchTerm}%`)
            .limit(5);

          setMentionResults(data || []);
        } catch (error) {
          console.error("Error searching mentions:", error);
        }
      } else {
        setShowMentions(false);
      }
    },
    []
  );

  const insertMention = useCallback(
    (username: string, parentId: string | null = null) => {
      const text = parentId ? replyText[parentId] : commentText;
      const beforeCursor = text.slice(0, cursorPosition);
      const afterCursor = text.slice(cursorPosition);
      const lastMentionIndex = beforeCursor.lastIndexOf("@");
      const newText =
        beforeCursor.slice(0, lastMentionIndex) + `@${username} ` + afterCursor;

      if (parentId) {
        setReplyText((prev) => ({ ...prev, [parentId]: newText }));
      } else {
        setCommentText(newText);
      }

      setShowMentions(false);
    },
    [commentText, replyText, cursorPosition]
  );

  const handleCommentSubmit = useCallback(
    async (parentId: string | null = null) => {
      try {
        const text = parentId ? replyText[parentId] : commentText;
        if (!text?.trim()) return;

        const mentions = extractMentions(text);

        const { data: mentionedUsers } = await supabase
          .from("profiles")
          .select("id")
          .in("username", mentions);

        const mentionedUserIds = mentionedUsers?.map((user) => user.id) || [];

        const { data: comment, error } = await supabase
          .from("photo_comments")
          .insert({
            photo_id: photo.id,
            user_id: userId,
            content: text,
            parent_id: parentId,
            mentions: mentionedUserIds,
          })
          .select(
            `
          *,
          user:profiles!photo_comments_user_id_fkey(
            id,
            username,
            full_name,
            avatar_url
          )
        `
          )
          .maybeSingle();

        if (error) throw error;

        onPhotosUpdate((photos) =>
          photos.map((p) => {
            if (p.id !== photo.id) return p;

            if (parentId) {
              return {
                ...p,
                comments: p.comments.map((c) => {
                  if (c.id === parentId) {
                    return {
                      ...c,
                      replies: [
                        ...(c.replies || []),
                        { ...comment, likes: 0, liked_by_user: false },
                      ],
                      replies_count: c.replies_count + 1,
                    };
                  }
                  return c;
                }),
                comments_count: p.comments_count + 1,
              };
            }

            return {
              ...p,
              comments: [
                ...p.comments,
                {
                  ...comment,
                  likes: 0,
                  liked_by_user: false,
                  replies: [],
                  replies_count: 0,
                  replies_fetched: true,
                },
              ],
              comments_count: p.comments_count + 1,
            };
          })
        );

        if (parentId) {
          setReplyText((prev) => ({ ...prev, [parentId]: "" }));
        } else {
          setCommentText("");
        }
        // Notification logic
        if (!parentId && photo.user_id && userId && photo.user_id !== userId) {
          // Notify photo owner of new comment
          await createNotification({
            recipient_id: photo.user_id,
            sender_id: userId,
            type: "comment",
            entity_id: photo.id,
            entity_type: "post",
            message: `${comment.user?.username || "Someone"} commented on your photo.`
          });
        }
        if (parentId) {
          // Find parent comment
          const parentC = photo.comments.find((c) => c.id === parentId);
          if (parentC && parentC.user_id !== userId) {
            // Notify original commenter
            await createNotification({
              recipient_id: parentC.user_id,
              sender_id: userId ?? "",
              type: "reply",
              entity_id: parentId,
              entity_type: "comment",
              message: `${comment.user?.username || "Someone"} replied to your comment.`
            });
          }
        }
        for (const mId of mentionedUserIds) {
          if (mId !== userId) {
            await createNotification({
              recipient_id: mId,
              sender_id: userId ?? "",
              type: "mention",
              entity_id: comment?.id,
              entity_type: parentId ? "comment" : "post",
              message: `${comment.user?.username || "Someone"} mentioned you in a comment.`
            });
          }
        }
      } catch (error) {
        console.error("Error posting comment:", error);
      }
    },
    [commentText, replyText, photo.id, userId, onPhotosUpdate, photo.user_id, photo.comments]
  );

  const handleExpandReplies = useCallback(
    async (commentId: string) => {
      const isExpanded = expandedReplies.includes(commentId);

      if (isExpanded) {
        setExpandedReplies((prev) => prev.filter((id) => id !== commentId));
        return;
      }

      setExpandedReplies((prev) => [...prev, commentId]);

      const comment = photo.comments.find((c) => c.id === commentId);
      if (!comment) return;

      if (
        comment.replies_fetched &&
        comment.replies &&
        comment.replies.length > 0
      ) {
        return;
      }

      setRepliesLoading((prev) => ({ ...prev, [commentId]: true }));

      try {
        const replies = await fetchReplies(commentId, userId);

        onPhotosUpdate((photos) =>
          photos.map((p) =>
            p.id === photo.id
              ? {
                  ...p,
                  comments: p.comments.map((c) =>
                    c.id === commentId
                      ? { ...c, replies, replies_fetched: true }
                      : c
                  ),
                }
              : p
          )
        );
      } catch (err) {
        console.error("Failed to load replies:", err);
      } finally {
        setRepliesLoading((prev) => ({ ...prev, [commentId]: false }));
      }
    },
    [expandedReplies, photo.comments, photo.id, userId, onPhotosUpdate]
  );

  const toggleCommentLike = useCallback(
    async (commentId: string, isReply = false) => {
      try {
        const comment = isReply
          ? photo.comments
              .flatMap((c) => c.replies || [])
              .find((r) => r.id === commentId)
          : photo.comments.find((c) => c.id === commentId);

        if (!comment) return;

        if (comment.liked_by_user) {
          await supabase
            .from("comment_likes")
            .delete()
            .eq("comment_id", commentId)
            .eq("user_id", userId);

          onPhotosUpdate((photos) =>
            photos.map((p) => {
              if (p.id !== photo.id) return p;
              return {
                ...p,
                comments: p.comments.map((c) => {
                  if (isReply) {
                    return {
                      ...c,
                      replies: (c.replies || []).map((r) =>
                        r.id === commentId
                          ? { ...r, likes: r.likes - 1, liked_by_user: false }
                          : r
                      ),
                    };
                  }
                  return c.id === commentId
                    ? { ...c, likes: c.likes - 1, liked_by_user: false }
                    : c;
                }),
              };
            })
          );
        } else {
          await supabase
            .from("comment_likes")
            .insert({ comment_id: commentId, user_id: userId });

          onPhotosUpdate((photos) =>
            photos.map((p) => {
              if (p.id !== photo.id) return p;
              return {
                ...p,
                comments: p.comments.map((c) => {
                  if (isReply) {
                    return {
                      ...c,
                      replies: (c.replies || []).map((r) =>
                        r.id === commentId
                          ? { ...r, likes: r.likes + 1, liked_by_user: true }
                          : r
                      ),
                    };
                  }
                  return c.id === commentId
                    ? { ...c, likes: c.likes + 1, liked_by_user: true }
                    : c;
                }),
              };
            })
          );
          // Notification logic
          if (comment.user_id !== userId) {
            await createNotification({
              recipient_id: comment.user_id,
              sender_id: userId ?? "",
              type: "like",
              entity_id: commentId,
              entity_type: "comment",
              message: `${username} liked your comment.`
            });
          }
        }
      } catch (error) {
        console.error("Error toggling comment like:", error);
      }
    },
    [photo.comments, photo.id, userId, onPhotosUpdate, username]
  );

  if (!isExpanded) return null;

  if (commentsLoading) {
    return (
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <CommentSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {photo.comments.map((comment) => (
        <div key={comment.id} className="space-y-2">
          <CommentItem
            comment={comment}
            onLike={() => toggleCommentLike(comment.id)}
            onReplyClick={() => handleExpandReplies(comment.id)}
          />

          {expandedReplies.includes(comment.id) && (
            <div className="ml-11 space-y-2">
              {repliesLoading[comment.id] ? (
                <>
                  <ReplySkeleton />
                </>
              ) : (
                <>
                  {comment.replies?.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      onLike={() => toggleCommentLike(reply.id, true)}
                      onReplyClick={() => {}}
                      isReply
                    />
                  ))}

                  <CommentInput
                    value={replyText[comment.id] || ""}
                    onChange={(value, cursorPos) => {
                      setReplyText((prev) => ({
                        ...prev,
                        [comment.id]: value,
                      }));
                      handleMentionSearch(value, comment.id);
                      setCursorPosition(cursorPos);
                    }}
                    onSubmit={() => handleCommentSubmit(comment.id)}
                    placeholder="Reply to comment..."
                    userAvatar={userAvatar}
                    showMentions={showMentions && activeInputId === comment.id}
                    mentionResults={mentionResults}
                    onMentionSelect={(username) =>
                      insertMention(username, comment.id)
                    }
                    inputId={comment.id}
                  />
                </>
              )}
            </div>
          )}
        </div>
      ))}

      <CommentInput
        value={commentText}
        onChange={(value, cursorPos) => {
          setCommentText(value);
          handleMentionSearch(value, photo.id);
          setCursorPosition(cursorPos);
        }}
        onSubmit={() => handleCommentSubmit()}
        placeholder="Add a comment..."
        userAvatar={userAvatar}
        showMentions={showMentions && activeInputId === photo.id}
        mentionResults={mentionResults}
        onMentionSelect={(username) => insertMention(username)}
        inputId={photo.id}
      />
    </div>
  );
};
