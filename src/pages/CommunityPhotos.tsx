import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  Camera,
  Heart,
  Loader,
  MessageCircle,
  Send,
  Users,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { usePlatform } from "../contexts/PlatformContext";
import { useAuth } from "../contexts/useAuth";
import { supabase } from "../lib/supabase";
import { useColorTheme } from "../utils/colorUtils";

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  mentions: string[];
  user: Profile;
  likes: number;
  liked_by_user: boolean;
  replies?: Comment[];
}

interface Photo {
  id: string;
  photo_url: string;
  caption: string;
  week_number: number;
  created_at: string;
  user_id: string;
  user: Profile;
  profile: Profile;
  likes: number;
  liked_by_user: boolean;
  comments: Comment[];
  comments_count: number;
}

const CommunityPhotos: React.FC = () => {
  const { user, profile } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [expandedReplies, setExpandedReplies] = useState<string[]>([]);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [mentionResults, setMentionResults] = useState<Profile[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const commentInputRefs = useRef<{ [key: string]: HTMLTextAreaElement }>({});
  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const photoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const platform = usePlatform();
  const colorTheme = useColorTheme(platform.settings?.theme_color);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        if (!user) return;

        const { data: photosData, error: photosError } = await supabase
          .from("progress_photos")
          .select(
            `
            *,
            user:profiles!progress_photos_user_id_fkey(
              id,
              username,
              full_name,
              avatar_url
            )
          `
          )
          .eq("community_visible", true)
          .eq("is_private", false)
          .order("created_at", { ascending: false });

        if (photosError) throw photosError;

        console.log(photosData);

        // Get likes for each photo
        const photosWithLikes = await Promise.all(
          photosData.map(async (photo) => {
            const { count: likesCount } = await supabase
              .from("photo_likes")
              .select("id", { count: "exact" })
              .eq("photo_id", photo.id);

            const { data: userLike } = await supabase
              .from("photo_likes")
              .select("id")
              .eq("photo_id", photo.id)
              .eq("user_id", user.id)
              .limit(1)
              .maybeSingle();

            // Get comments for the photo
            const { data: comments } = await supabase
              .from("photo_comments")
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
              .eq("photo_id", photo.id)
              .is("parent_id", null)
              .order("created_at", { ascending: true });

            if (!comments) return null;

            // Get comment likes and replies
            const commentsWithDetails = await Promise.all(
              comments.map(async (comment) => {
                const { count: commentLikes } = await supabase
                  .from("comment_likes")
                  .select("id", { count: "exact" })
                  .eq("comment_id", comment.id);

                const { data: userCommentLike } = await supabase
                  .from("comment_likes")
                  .select("id")
                  .eq("comment_id", comment.id)
                  .eq("user_id", user.id)
                  .limit(1)
                  .maybeSingle();

                // Get replies for this comment
                const { data: replies } = await supabase
                  .from("photo_comments")
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
                  .eq("parent_id", comment.id)
                  .order("created_at", { ascending: true });

                if (!replies) return null;

                // Get likes for each reply
                const repliesWithLikes = await Promise.all(
                  replies.map(async (reply) => {
                    const { count: replyLikes } = await supabase
                      .from("comment_likes")
                      .select("id", { count: "exact" })
                      .eq("comment_id", reply.id);

                    const { data: userReplyLike } = await supabase
                      .from("comment_likes")
                      .select("id")
                      .eq("comment_id", reply.id)
                      .eq("user_id", user.id)
                      .limit(1)
                      .maybeSingle();

                    return {
                      ...reply,
                      likes: replyLikes,
                      liked_by_user: !!userReplyLike,
                    };
                  })
                );

                return {
                  ...comment,
                  likes: commentLikes,
                  liked_by_user: !!userCommentLike,
                  replies: repliesWithLikes,
                };
              })
            );

            return {
              ...photo,
              likes: likesCount,
              liked_by_user: !!userLike,
              comments: commentsWithDetails,
              comments_count: commentsWithDetails.reduce(
                (acc, comment) => acc + 1 + (comment.replies?.length || 0),
                0
              ),
            };
          })
        );

        setPhotos(photosWithLikes);
      } catch (error) {
        console.error("Error fetching photos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const photoId = params.get("photoId");
    if (photoId && photoRefs.current[photoId]) {
      photoRefs.current[photoId]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [photos]);

  const toggleLike = async (photoId: string) => {
    try {
      const photo = photos.find((p) => p.id === photoId);
      if (!photo) return;

      if (photo.liked_by_user) {
        await supabase
          .from("photo_likes")
          .delete()
          .eq("photo_id", photoId)
          .eq("user_id", user?.id);

        setPhotos(
          photos.map((p) =>
            p.id === photoId
              ? { ...p, likes: p.likes - 1, liked_by_user: false }
              : p
          )
        );
      } else {
        await supabase
          .from("photo_likes")
          .insert({ photo_id: photoId, user_id: user?.id });

        setPhotos(
          photos.map((p) =>
            p.id === photoId
              ? { ...p, likes: p.likes + 1, liked_by_user: true }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const toggleCommentLike = async (
    commentId: string,
    photoId: string,
    isReply = false
  ) => {
    try {
      const photo = photos.find((p) => p.id === photoId);
      if (!photo) return;

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
          .eq("user_id", user?.id);

        setPhotos(
          photos.map((p) => {
            if (p.id !== photoId) return p;
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
          .insert({ comment_id: commentId, user_id: user?.id });

        setPhotos(
          photos.map((p) => {
            if (p.id !== photoId) return p;
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
      }
    } catch (error) {
      console.error("Error toggling comment like:", error);
    }
  };

  const handleCommentSubmit = async (
    photoId: string,
    parentId: string | null = null
  ) => {
    try {
      const text = parentId ? replyText[parentId] : commentText[photoId];
      if (!text?.trim()) return;

      // Extract mentions from text
      const mentionRegex = /@(\w+)/g;
      const mentions = [...text.matchAll(mentionRegex)].map(
        (match) => match[1]
      );

      // Get user IDs for mentioned usernames
      const { data: mentionedUsers } = await supabase
        .from("profiles")
        .select("id")
        .in("username", mentions);

      const mentionedUserIds = mentionedUsers?.map((user) => user.id) || [];

      const { data: comment, error } = await supabase
        .from("photo_comments")
        .insert({
          photo_id: photoId,
          user_id: user?.id,
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

      setPhotos(
        photos.map((p) => {
          if (p.id !== photoId) return p;

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
              { ...comment, likes: 0, liked_by_user: false, replies: [] },
            ],
            comments_count: p.comments_count + 1,
          };
        })
      );

      if (parentId) {
        setReplyText({ ...replyText, [parentId]: "" });
      } else {
        setCommentText({ ...commentText, [photoId]: "" });
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleMentionSearch = async (text: string, inputId: string) => {
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
  };

  const insertMention = (
    username: string,
    photoId: string,
    parentId: string | null = null
  ) => {
    const inputRef = commentInputRefs.current[parentId || photoId];
    if (!inputRef) return;

    const text = parentId ? replyText[parentId] : commentText[photoId];
    const beforeCursor = text.slice(0, cursorPosition);
    const afterCursor = text.slice(cursorPosition);
    const lastMentionIndex = beforeCursor.lastIndexOf("@");
    const newText =
      beforeCursor.slice(0, lastMentionIndex) + `@${username} ` + afterCursor;

    if (parentId) {
      setReplyText({ ...replyText, [parentId]: newText });
    } else {
      setCommentText({ ...commentText, [photoId]: newText });
    }

    setShowMentions(false);

    // Focus back on input and set cursor position
    const newCursorPos = newText.length;
    setTimeout(() => {
      inputRef.focus();
      inputRef.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleShare = async (photo: Photo) => {
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
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className={`h-8 w-8 animate-spin ${colorTheme.primaryText}`} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Community Photos
            </h1>
            <Link
              to="/progress-photos"
              className={`px-4 py-2 ${colorTheme.primaryBg} text-white rounded-lg hover:${colorTheme.primaryBg} transition-colors flex items-center`}
            >
              <Camera className="h-5 w-5 mr-2" />
              My Photos
            </Link>
          </div>

          {photos.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                No Community Photos Yet
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Be the first to share your progress with the community!
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  ref={(el) => {
                    photoRefs.current[photo.id] = el;
                  }}
                  layout
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden w-full max-w-sm mx-auto"
                >
                  {/* Photo Header */}
                  <div className="p-2 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        {photo.user?.avatar_url ? (
                          <img
                            src={photo.user?.avatar_url}
                            alt={photo.user?.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                            <Users className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <p className="flex flex-col font-medium text-gray-800 dark:text-white">
                        {photo.user?.username}
                        <span className="text-xs text-zinc-400 dark:text-gray-400">
                          {formatDistanceToNow(photo.created_at)}
                        </span>
                      </p>
                    </div>
                    {/* <button className="text-gray-500 dark:text-gray-400">
                      <MoreVertical className="h-4 w-4" />
                    </button> */}
                  </div>

                  {/* Photo */}
                  <img
                    src={photo.photo_url}
                    alt={`Week ${photo.week_number}`}
                    className="w-full aspect-square object-cover"
                  />

                  {/* Actions */}
                  <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleLike(photo.id)}
                          className="flex items-center text-black dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              photo.liked_by_user
                                ? "fill-red-500 text-red-500"
                                : ""
                            }`}
                          />
                          <span className="ml-1 text-xs font-semibold">
                            {formatNumber(photo.likes)}
                          </span>
                        </button>
                        <button
                          onClick={() =>
                            setExpandedComments(
                              expandedComments.includes(photo.id)
                                ? expandedComments.filter(
                                    (id) => id !== photo.id
                                  )
                                : [...expandedComments, photo.id]
                            )
                          }
                          className="flex items-center text-black dark:text-gray-400"
                        >
                          <MessageCircle className="h-5 w-5" />
                          <span className="ml-1 text-xs font-semibold">
                            {formatNumber(photo.comments_count)}
                          </span>
                        </button>
                        <button className="text-black dark:text-gray-400">
                          <Send
                            className="h-5 w-5"
                            onClick={() => handleShare(photo)}
                          />
                        </button>
                      </div>
                    </div>

                    {photo.caption && (
                      <>
                        <p className="text-sm text-gray-800 dark:text-white mb-2">
                          <span className="font-medium mr-2">
                            {photo.user?.username}
                          </span>
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

                  {/* Comments */}
                  <div className="p-2">
                    {expandedComments.includes(photo.id) && (
                      <div className="space-y-2">
                        {photo.comments.map((comment) => (
                          <div key={comment.id} className="space-y-2">
                            {/* Comment */}
                            <div className="flex items-start space-x-3">
                              <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                {comment.user.avatar_url ? (
                                  <img
                                    src={comment.user.avatar_url}
                                    alt={comment.user.username}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                    <Users className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
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
                                    onClick={() =>
                                      toggleCommentLike(comment.id, photo.id)
                                    }
                                    className="flex items-center text-black dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                  >
                                    <Heart
                                      className={`h-4 w-4 ${
                                        comment.liked_by_user
                                          ? "fill-red-500 text-red-500"
                                          : ""
                                      }`}
                                    />
                                    <span className="ml-1 text-xs font-semibold">
                                      {formatNumber(comment.likes)}
                                    </span>
                                  </button>
                                </div>
                                <button
                                  onClick={() =>
                                    setExpandedReplies(
                                      expandedReplies.includes(comment.id)
                                        ? expandedReplies.filter(
                                            (id) => id !== comment.id
                                          )
                                        : [...expandedReplies, comment.id]
                                    )
                                  }
                                  className="text-xs ml-2 text-gray-500 dark:text-gray-400"
                                >
                                  Reply • {comment.replies?.length || 0}
                                </button>
                              </div>
                            </div>

                            {/* Replies */}
                            {expandedReplies.includes(comment.id) && (
                              <div className="ml-11 space-y-2">
                                {comment.replies?.map((reply) => (
                                  <div
                                    key={reply.id}
                                    className="flex items-start space-x-3"
                                  >
                                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                      {reply.user.avatar_url ? (
                                        <img
                                          src={reply.user.avatar_url}
                                          alt={reply.user.username}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                          <Users className="h-4 w-4" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-grow">
                                      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg px-2 py-1">
                                        <div>
                                          <p className="text-xs font-medium text-gray-800 dark:text-white">
                                            {reply.user.username}
                                          </p>
                                          <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {reply.content}
                                          </p>
                                        </div>
                                        <button
                                          onClick={() =>
                                            toggleCommentLike(
                                              reply.id,
                                              photo.id,
                                              true
                                            )
                                          }
                                          className="flex items-center text-black dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                        >
                                          <Heart
                                            className={`h-4 w-4 ${
                                              reply.liked_by_user
                                                ? "fill-red-500 text-red-500"
                                                : ""
                                            }`}
                                          />
                                          <span className="ml-1 text-xs font-semibold">
                                            {formatNumber(reply.likes)}
                                          </span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                {/* Reply Input */}
                                <div className="flex items-start space-x-3">
                                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                                    {profile?.avatar_url ? (
                                      <img
                                        src={profile?.avatar_url}
                                        alt="Your avatar"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                        <Users className="h-4 w-4" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-grow relative">
                                    <textarea
                                      ref={(el) => {
                                        if (el)
                                          commentInputRefs.current[comment.id] =
                                            el;
                                      }}
                                      value={replyText[comment.id] || ""}
                                      onChange={(e) => {
                                        setReplyText({
                                          ...replyText,
                                          [comment.id]: e.target.value,
                                        });
                                        handleMentionSearch(
                                          e.target.value,
                                          comment.id
                                        );
                                        setCursorPosition(
                                          e.target.selectionStart
                                        );
                                      }}
                                      onKeyPress={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault();
                                          handleCommentSubmit(
                                            photo.id,
                                            comment.id
                                          );
                                        }
                                      }}
                                      placeholder="Reply to comment..."
                                      className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                                      rows={1}
                                    />

                                    {/* Mentions Dropdown */}
                                    {showMentions &&
                                      activeInputId === comment.id &&
                                      mentionResults.length > 0 && (
                                        <div className="absolute bottom-full left-0 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-1 max-h-48 overflow-y-auto">
                                          {mentionResults.map((profile) => (
                                            <button
                                              key={profile.id}
                                              onClick={() =>
                                                insertMention(
                                                  profile.username,
                                                  photo.id,
                                                  comment.id
                                                )
                                              }
                                              className="w-full px-2 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                                            >
                                              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                                {profile.avatar_url ? (
                                                  <img
                                                    src={profile.avatar_url}
                                                    alt={profile.username}
                                                    className="w-full h-full object-cover"
                                                  />
                                                ) : (
                                                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                                    <Users className="h-3 w-3" />
                                                  </div>
                                                )}
                                              </div>
                                              <span className="text-xs font-medium">
                                                {profile.username}
                                              </span>
                                              <span className="text-gray-500 dark:text-gray-400 text-sm">
                                                {profile.full_name}
                                              </span>
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Comment Input */}
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                            {profile?.avatar_url ? (
                              <img
                                src={profile?.avatar_url}
                                alt="Your avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                <Users className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="flex-grow relative">
                            <textarea
                              ref={(el) => {
                                if (el) commentInputRefs.current[photo.id] = el;
                              }}
                              value={commentText[photo.id] || ""}
                              onChange={(e) => {
                                setCommentText({
                                  ...commentText,
                                  [photo.id]: e.target.value,
                                });
                                handleMentionSearch(e.target.value, photo.id);
                                setCursorPosition(e.target.selectionStart);
                              }}
                              onKeyPress={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleCommentSubmit(photo.id);
                                }
                              }}
                              placeholder="Add a comment..."
                              className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-700 dark:text-gray-100 rounded-lg resize-none focus:outline-none focus:ring-2 text-sm focus:ring-green-500"
                              rows={1}
                            />

                            {/* Mentions Dropdown */}
                            {showMentions &&
                              activeInputId === photo.id &&
                              mentionResults.length > 0 && (
                                <div className="absolute bottom-full left-0 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-1 max-h-48 overflow-y-auto">
                                  {mentionResults.map((profile) => (
                                    <button
                                      key={profile.id}
                                      onClick={() =>
                                        insertMention(
                                          profile.username,
                                          photo.id
                                        )
                                      }
                                      className="w-full px-2 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                                    >
                                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                        {profile.avatar_url ? (
                                          <img
                                            src={profile.avatar_url}
                                            alt={profile.username}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                                            <Users className="h-3 w-3" />
                                          </div>
                                        )}
                                      </div>
                                      <span className="text-xs dark:text-gray-200 font-medium">
                                        {profile.username}
                                      </span>
                                      <span className="text-gray-500 dark:text-gray-200 text-sm">
                                        {profile.full_name}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPhotos;
