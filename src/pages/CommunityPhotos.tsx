import { User } from "@supabase/supabase-js";
import { Camera, Loader, Users } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Virtuoso } from "react-virtuoso";
import { PhotoCard } from "../components/Community/PhotoCard";
import { PhotoCardSkeleton } from "../components/ui/Skeletons";
import { usePlatform } from "../contexts/PlatformContext";
import { useAuth } from "../contexts/useAuth";
import { useCommunityPhotos } from "../hooks/useCommunityPhotos";
import { useColorTheme } from "../utils/colorUtils";

const CommunityPhotos: React.FC = () => {
  const { user, profile } = useAuth();
  const { photos, setPhotos, loading, loadingMore, hasMore, loadMore } =
    useCommunityPhotos(user?.id);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const photoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const platform = usePlatform();
  const colorTheme = useColorTheme(platform.settings?.theme_color);

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

  const handleToggleComments = (photoId: string) => {
    setExpandedComments((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  if (loading) {
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
            <div className="space-y-8">
              {[...Array(3)].map((_, i) => (
                <PhotoCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
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
            <Virtuoso
              useWindowScroll
              data={photos}
              endReached={() => {
                if (hasMore && !loadingMore) {
                  loadMore();
                }
              }}
              itemContent={(index, photo) => (
                <div className="mb-8">
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    userId={user?.id}
                    user={user as unknown as User}
                    userAvatar={profile?.avatar_url || null}
                    isCommentsExpanded={expandedComments.includes(photo.id)}
                    onToggleComments={handleToggleComments}
                    onPhotosUpdate={setPhotos}
                    photoRef={(el) => {
                      photoRefs.current[photo.id] = el;
                    }}
                  />
                </div>
              )}
              components={{
                Footer: () => {
                  if (!loadingMore) return null;
                  return (
                    <div className="py-8 flex justify-center">
                      <Loader
                        className={`h-8 w-8 animate-spin ${colorTheme.primaryText}`}
                      />
                    </div>
                  );
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPhotos;
