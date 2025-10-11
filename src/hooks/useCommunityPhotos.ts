import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Comment, Photo } from "../types/community";

export const useCommunityPhotos = (userId: string | undefined) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        if (!userId) return;

        const { data, error } = await supabase
          .from("progress_photos")
          .select(
            `
              id,
              caption,
              photo_url,
              created_at,
              week_number,
              user:profiles!progress_photos_user_id_fkey (
                id,
                username,
                full_name,
                avatar_url
              ),
              photo_likes (
                user_id
              ),
              photo_comments!photo_comments_photo_id_fkey (
                id,
                parent_id
              )
            `
          )
          .eq("community_visible", true)
          .eq("is_private", false)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const photosWithData: Photo[] = data.map((photo: any) => {
          const userObj = Array.isArray(photo.user)
            ? photo.user[0]
            : photo.user;
          return {
            id: photo.id,
            photo_url: photo.photo_url,
            caption: photo.caption,
            week_number: photo.week_number,
            created_at: photo.created_at,
            user_id: userObj.id,
            user: userObj,
            profile: userObj,
            likes: photo.photo_likes?.length || 0,
            liked_by_user: photo.photo_likes?.some(
              (l: any) => l.user_id === userId
            ),
            comments: [],
            comments_count: photo.photo_comments?.filter((c: Comment) => c.parent_id === null).length,
            comments_fetched: false,
          } as Photo;
        });

        setPhotos(photosWithData);
      } catch (error) {
        console.error("Error fetching photos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [userId]);

  return { photos, setPhotos, loading };
};

export const fetchComments = async (
  photoId: string,
  userId: string | undefined
): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from("photo_comments")
    .select(
      `
        id,
        content,
        created_at,
        parent_id,
        mentions,
        user:profiles!photo_comments_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        ),
        comment_likes ( user_id ),
        replies:photo_comments ( id )
      `
    )
    .eq("photo_id", photoId)
    .is("parent_id", null)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data || []).map((c: any) => {
    const userObj = Array.isArray(c.user) ? c.user[0] : c.user;
    return {
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      parent_id: c.parent_id,
      mentions: c.mentions || [],
      user_id: userObj.id,
      user: userObj,
      likes: c.comment_likes?.length || 0,
      liked_by_user: c.comment_likes?.some((l: any) => l.user_id === userId),
      replies_count: c.replies?.length || 0,
      replies: [],
      replies_fetched: false,
    } as Comment;
  });
};

export const fetchReplies = async (
  commentId: string,
  userId: string | undefined
): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from("photo_comments")
    .select(
      `
        id,
        content,
        created_at,
        parent_id,
        mentions,
        user:profiles!photo_comments_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        ),
        comment_likes ( user_id )
      `
    )
    .eq("parent_id", commentId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data || []).map((r: any) => {
    const userObj = Array.isArray(r.user) ? r.user[0] : r.user;
    return {
      id: r.id,
      content: r.content,
      created_at: r.created_at,
      parent_id: r.parent_id,
      mentions: r.mentions || [],
      user_id: userObj.id,
      user: userObj,
      likes: r.comment_likes?.length || 0,
      liked_by_user: r.comment_likes?.some((l: any) => l.user_id === userId),
      replies: [],
      replies_count: 0,
      replies_fetched: true,
    } as Comment;
  });
};
