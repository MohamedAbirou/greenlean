import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Mail, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from "../../contexts/useAuth";
import { supabase } from "../../lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup' | 'reset';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();

  const checkUsername = async (username: string) => {
    if (!username) {
      setUsernameAvailable(null);
      return;
    }

    // Username validation
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setUsernameAvailable(false);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .maybeSingle();

      setUsernameAvailable(!data);
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setUsername(value);
    checkUsername(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        onClose();
      } else if (mode === 'signup') {
        if (!usernameAvailable) {
          setError('Please choose a different username');
          return;
        }

        const { error: signUpError } = await signUp(email, password, fullName, username);
        if (signUpError) {
          setError(signUpError);
          return;
        }
        setSuccess('Account created successfully! Please check your email to confirm your account before signing in.');
        setMode('signin');
      } else if (mode === 'reset') {
        await resetPassword(email);
        setSuccess('Password reset instructions have been sent to your email');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setMode('signin');
    setError(null);
    setSuccess(null);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              {mode !== 'signin' && (
                <button
                  onClick={handleBack}
                  className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={handleUsernameChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white ${
                        username && (
                          usernameAvailable === true
                            ? 'border-green-500 dark:border-green-500'
                            : usernameAvailable === false
                              ? 'border-red-500 dark:border-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                        )
                      }`}
                      placeholder="Choose a username"
                      pattern="[a-zA-Z0-9_]{3,20}"
                      title="Username must be 3-20 characters long and can only contain letters, numbers, and underscores"
                      required
                    />
                    {username && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {checkingUsername ? (
                          <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full" />
                        ) : usernameAvailable === true ? (
                          <span className="text-green-500">✓</span>
                        ) : usernameAvailable === false ? (
                          <span className="text-red-500">✗</span>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    3-20 characters, letters, numbers, and underscores only
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            {success && (
              <p className="text-green-500 text-sm">{success}</p>
            )}

            <button
              type="submit"
              disabled={loading || (mode === 'signup' && !usernameAvailable)}
              className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </button>

            {mode === 'signin' && (
              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-green-500 hover:text-green-600 text-sm font-medium"
                >
                  Don't have an account? Sign up
                </button>
                <div>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-gray-500 hover:text-gray-600 text-sm"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;