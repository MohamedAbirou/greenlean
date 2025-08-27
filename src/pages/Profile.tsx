import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Camera, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Profile {
  full_name: string;
  email: string;
  avatar_url: string | null;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user) return;

        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, email, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        setProfile(data);
        setFullName(data.full_name || '');
        setAvatarUrl(data.avatar_url);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please upload an image file.' });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should be less than 5MB.' });
        return;
      }

      setUploadingAvatar(true);
      setMessage(null);

      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({ type: 'error', text: 'Failed to update profile picture. Please try again.' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setProfile(prev => prev ? { ...prev, full_name: fullName } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAvatar = async () => {
      if (!user || !avatarUrl) return;
    
      setUploadingAvatar(true);
      setMessage(null);
    
      try {
        // Extract path from public URL
        const path = avatarUrl.split('/').slice(-2).join('/'); // e.g., avatars/filename.jpg
    
        // Delete file from Supabase storage
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([path]);
    
        if (deleteError) throw deleteError;
    
        // Update profile to remove avatar URL
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: null })
          .eq('id', user.id);
    
        if (updateError) throw updateError;
    
        setAvatarUrl(null);
        setMessage({ type: 'success', text: 'Profile picture removed successfully!' });
      } catch (error) {
        console.error('Error deleting avatar:', error);
        setMessage({ type: 'error', text: 'Failed to delete profile picture. Please try again.' });
      } finally {
        setUploadingAvatar(false);
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
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profile Settings</h1>
              </div>

              {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={handleAvatarClick}
                        className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden relative group cursor-pointer"
                      >
                        {avatarUrl ? (
                          <img 
                            src={avatarUrl} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-gray-400" />
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {uploadingAvatar ? (
                            <Loader className="h-6 w-6 animate-spin text-white" />
                          ) : (
                            <Camera className="h-6 w-6 text-white" />
                          )}
                        </div>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                  
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Click to upload a new profile picture.<br />
                        Recommended: Square image, at least 400x400 pixels.<br />
                        Maximum size: 5MB
                      </p>
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={handleDeleteAvatar}
                          className="text-sm text-red-500 hover:underline"
                        >
                          Delete profile picture
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Email cannot be changed. Contact support if you need to update your email.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {updating ? (
                      <>
                        <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Updating...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;