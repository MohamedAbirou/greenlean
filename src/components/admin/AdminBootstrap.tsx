import { motion } from 'framer-motion';
import { AlertCircle, Check, Loader, Shield, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from "../../contexts/useAuth";
import { checkAdminStatus, createFirstAdmin } from '../../utils/adminBootstrap';

const AdminBootstrap: React.FC = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkCurrentAdminStatus();
  }, [user]);

  const checkCurrentAdminStatus = async () => {
    try {
      const adminStatus = await checkAdminStatus();
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!user?.email) {
      setMessage({ type: 'error', text: 'No user email found' });
      return;
    }

    setCreating(true);
    setMessage(null);

    try {
      const result = await createFirstAdmin(user.email);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Admin access granted successfully!' });
        setIsAdmin(true);
        // Refresh the page to update admin status throughout the app
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to create admin' 
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Admin Access Active
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You have admin privileges. You can now access the admin dashboard.
              </p>
              <a
                href="/admin"
                className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Shield className="h-5 w-5 mr-2" />
                Go to Admin Dashboard
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center"
          >
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Admin Bootstrap
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Grant yourself admin access to manage the platform. This should only be done once for the initial setup.
            </p>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              }`}>
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <Check className="h-5 w-5 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2" />
                  )}
                  {message.text}
                </div>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <User className="h-4 w-4 mr-2" />
                <span>Current user: {user?.email}</span>
              </div>
            </div>

            <button
              onClick={handleCreateAdmin}
              disabled={creating}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {creating ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Creating Admin Access...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Grant Admin Access
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              This will grant super admin privileges to your current account.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminBootstrap;