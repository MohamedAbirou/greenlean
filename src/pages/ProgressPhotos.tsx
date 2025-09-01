import { motion } from 'framer-motion';
import { Calendar, Camera, Eye, EyeOff, Loader, Plus, Trash2, Users } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlatform } from '../contexts/PlatformContext';
import { supabase } from '../lib/supabase';
import { useColorTheme } from '../utils/colorUtils';

interface ProgressPhoto {
  id: string;
  photo_url: string;
  caption: string;
  week_number: number;
  created_at: string;
  is_private: boolean;
  community_visible: boolean;
}

const ProgressPhotos: React.FC = () => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [caption, setCaption] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<ProgressPhoto[]>([]);
  const platform = usePlatform();
  const colorTheme = useColorTheme(platform.settings?.theme_color);

  useEffect(() => {
    fetchPhotos();
  }, [user]);

  const getSignedUrl = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('progress-photos')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  };

  const fetchPhotos = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('week_number', { ascending: true });

      if (error) throw error;

      // Get signed URLs for all photos
      const urlPromises = data?.map(async (photo) => {
        const urlParts = photo.photo_url.split('/');
        const filePath = `${user.id}/${photo.week_number}/${urlParts[urlParts.length - 1]}`;
        const signedUrl = await getSignedUrl(filePath);
        return { ...photo, photo_url: signedUrl || photo.photo_url };
      }) || [];

      const photosWithSignedUrls = await Promise.all(urlPromises);
      setPhotos(photosWithSignedUrls);
      
      // Set initial selected week
      if (data && data.length > 0) {
        const latestWeek = Math.max(...data.map(p => p.week_number));
        setSelectedWeek(latestWeek);
      } else {
        setSelectedWeek(1);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user || !selectedWeek) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file.');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image size should be less than 10MB.');
      }

      setUploading(true);

      // Upload photo to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${selectedWeek}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get signed URL
      const signedUrl = await getSignedUrl(fileName);
      if (!signedUrl) throw new Error('Failed to get signed URL');

      // Save photo record in database
      const { error: dbError } = await supabase
        .from('progress_photos')
        .insert({
          user_id: user.id,
          photo_url: signedUrl,
          caption,
          week_number: selectedWeek,
          is_private: isPrivate
        });

      if (dbError) throw dbError;

      // Refresh photos
      await fetchPhotos();
      setCaption('');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert(error instanceof Error ? error.message : 'Error uploading photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photo: ProgressPhoto) => {
    try {
      if (!user) return;

      // Extract file path from URL
      const urlParts = photo.photo_url.split('/');
      const fileName = `${user.id}/${photo.week_number}/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('progress-photos')
        .remove([fileName]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;

      // Refresh photos
      await fetchPhotos();
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Error deleting photo');
    }
  };

  const togglePhotoPrivacy = async (photo: ProgressPhoto) => {
    try {
      const { error } = await supabase
        .from('progress_photos')
        .update({ 
          is_private: !photo.is_private,
          // If making public, also remove from community
          community_visible: photo.is_private ? false : photo.community_visible 
        })
        .eq('id', photo.id);

      if (error) throw error;

      await fetchPhotos();
    } catch (error) {
      console.error('Error updating photo privacy:', error);
      alert('Error updating photo privacy');
    }
  };

  const toggleCommunityVisibility = async (photo: ProgressPhoto) => {
    try {
      // Can't share private photos to community
      if (photo.is_private) {
        alert('Make the photo public before sharing with the community');
        return;
      }

      const { error } = await supabase
        .from('progress_photos')
        .update({ community_visible: !photo.community_visible })
        .eq('id', photo.id);

      if (error) throw error;

      await fetchPhotos();
    } catch (error) {
      console.error('Error updating community visibility:', error);
      alert('Error updating community visibility');
    }
  };

  const handleCompareSelect = (photo: ProgressPhoto) => {
    if (selectedPhotos.includes(photo)) {
      setSelectedPhotos(selectedPhotos.filter(p => p.id !== photo.id));
    } else if (selectedPhotos.length < 2) {
      setSelectedPhotos([...selectedPhotos, photo]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Progress Photos</h1>
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-4 py-2 rounded-lg font-medium ${
                compareMode
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {compareMode ? 'Exit Compare' : 'Compare Photos'}
            </button>
          </div>

          {!compareMode && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Upload New Photo</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Week Number
                  </label>
                  <select
                    value={selectedWeek || ''}
                    onChange={(e) => setSelectedWeek(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    {[...Array(52)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>Week {i + 1}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Caption
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    placeholder="Add a caption (optional)"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded border-gray-300 text-green-500 focus:ring-green-500"
                  />
                  <label htmlFor="isPrivate" className="text-sm text-gray-700 dark:text-gray-300">
                    Keep this photo private
                  </label>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className={`w-full px-4 py-2 ${colorTheme.primaryBg} text-white rounded-lg hover:${colorTheme.primaryBg} transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                  >
                    {uploading ? (
                      <>
                        <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="h-5 w-5 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {compareMode ? (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                {selectedPhotos.map((photo) => (
                  <div key={photo.id} className="relative">
                    <img
                      src={photo.photo_url}
                      alt={`Week ${photo.week_number}`}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Week {photo.week_number}
                      </div>
                      {photo.caption && (
                        <p className="text-sm mt-1">{photo.caption}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => handleCompareSelect(photo)}
                    className={`relative aspect-square rounded-lg overflow-hidden ${
                      selectedPhotos.includes(photo)
                        ? 'ring-4 ring-green-500'
                        : selectedPhotos.length >= 2
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    disabled={selectedPhotos.length >= 2 && !selectedPhotos.includes(photo)}
                  >
                    <img
                      src={photo.photo_url}
                      alt={`Week ${photo.week_number}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium">Week {photo.week_number}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  layout
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={photo.photo_url}
                      alt={`Week ${photo.week_number}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button
                        onClick={() => togglePhotoPrivacy(photo)}
                        className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-opacity"
                        title={photo.is_private ? 'Make Public' : 'Make Private'}
                      >
                        {photo.is_private ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      {!photo.is_private && (
                        <button
                          onClick={() => toggleCommunityVisibility(photo)}
                          className={`p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-opacity ${
                            photo.community_visible ? 'text-green-400' : ''
                          }`}
                          title={photo.community_visible ? 'Remove from Community' : 'Share with Community'}
                        >
                          <Users className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePhoto(photo)}
                        className="p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      Week {photo.week_number}
                    </div>
                    {photo.caption && (
                      <p className="text-gray-600 dark:text-gray-300">{photo.caption}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {photos.length === 0 && (
            <div className="text-center py-12">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                No Progress Photos Yet
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Start tracking your fitness journey by uploading your first progress photo.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Upload First Photo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressPhotos;