import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  History,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  Moon,
  Settings,
  Shield,
  Sun,
  Trophy,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePlatform } from "../../contexts/PlatformContext";
import { useAuth } from "../../contexts/useAuth";
import { supabase } from "../../lib/supabase";
import { useThemeStore } from "../../store/themeStore";
import { useColorTheme } from "../../utils/colorUtils";
import AuthModal from "../auth/AuthModal";

interface NavbarProps {
  scrolled: boolean;
}

interface Profile {
  avatar_url: string | null;
  full_name: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ scrolled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileUserMenu, setShowMobileUserMenu] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { user, signOut } = useAuth();
  const platform = usePlatform();
  const colorTheme = useColorTheme(platform.settings?.theme_color);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("avatar_url, full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Check if user is admin
        const { data: adminData, error: adminError } = await supabase
          .from("admin_users")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (adminError) throw adminError;
        setIsAdmin(!!adminData);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setShowMobileUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setIsOpen(false);
  };

  const toggleMobileUserMenu = () => {
    setShowMobileUserMenu(!showMobileUserMenu);
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
      setShowMobileUserMenu(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/quiz", label: "Take Quiz" },
    { path: "/diet-plans", label: "Diet Plans" },
    { path: "/weight-loss", label: "Weight Loss" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  const renderAvatar = () => {
    if (!user) return <UserCircle size={32} className="text-green-500" />;

    if (profile?.avatar_url) {
      return (
        <img
          src={profile.avatar_url}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }

    return <UserCircle size={32} className="text-green-500" />;
  };

  const renderUserMenu = () => (
    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-900 dark:text-white">
        {profile?.full_name || user?.email?.split("@")[0]}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
        {user?.email}
      </p>
    </div>
  );

  return (
    <>
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? isDarkMode
              ? "bg-gray-800 shadow-md"
              : "bg-white shadow-md"
            : isDarkMode
            ? "bg-transparent"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              {platform.settings?.logo_url ? (
                <img
                  src={platform.settings.logo_url}
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                  style={{ filter: isDarkMode ? "invert(1)" : undefined }}
                />
              ) : (
                <Leaf size={32} className={colorTheme.primaryText} />
              )}
              <span
                className="text-xl font-bold"
                style={{ color: platform.settings?.theme_color || undefined }}
              >
                {platform.settings?.platform_name || "GreenLean"}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-base font-medium transition-colors ${
                    location.pathname === item.path
                      ? colorTheme.primaryText
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${
                  isDarkMode
                    ? "bg-gray-700 text-yellow-500"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {renderAvatar()}
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 border border-gray-200 dark:border-gray-700"
                      >
                        {renderUserMenu()}
                        <Link
                          to="/dashboard"
                          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <LayoutDashboard size={18} className="mr-2" />
                          Dashboard
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Shield size={18} className="mr-2" />
                            Admin Dashboard
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings size={18} className="mr-2" />
                          Profile Settings
                        </Link>
                        <Link
                          to="/quiz-history"
                          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <History size={18} className="mr-2" />
                          Quiz History
                        </Link>
                        <Link
                          to="/progress-photos"
                          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Camera size={18} className="mr-2" />
                          Progress Photos
                        </Link>
                        <Link
                          to="/community"
                          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Users size={18} className="mr-2" />
                          Community
                        </Link>
                        <Link
                          to="/challenges"
                          className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Trophy size={18} className="mr-2" />
                          Challenges
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <LogOut size={18} className="mr-2" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className={`flex items-center px-4 py-2 rounded-full ${colorTheme.primaryBg} text-white hover:${colorTheme.primaryHover} transition-colors duration-300`}
                >
                  <UserCircle size={18} className="mr-2" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Buttons */}
            <div className="md:hidden flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${
                  isDarkMode
                    ? "bg-gray-700 text-yellow-500"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {user && (
                <button
                  onClick={toggleMobileUserMenu}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {renderAvatar()}
                </button>
              )}

              <button
                className={isDarkMode ? "text-white" : "text-gray-800"}
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={
                isDarkMode
                  ? "md:hidden bg-gray-800 shadow-lg"
                  : "md:hidden bg-white shadow-lg"
              }
            >
              <div className="container mx-auto px-4 py-4">
                <nav className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`text-base font-medium py-2 transition-colors ${
                        location.pathname === item.path
                          ? colorTheme.primaryText
                          : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {!user && (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setShowAuthModal(true);
                      }}
                      className="flex items-center justify-center px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors duration-300"
                    >
                      <UserCircle size={18} className="mr-2" />
                      <span>Sign In</span>
                    </button>
                  )}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile User Menu */}
        <AnimatePresence>
          {showMobileUserMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`md:hidden ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } shadow-lg`}
            >
              <div className="container mx-auto px-4 py-4">
                {renderUserMenu()}
                <nav className="flex flex-col space-y-4 mt-4">
                  <Link
                    to="/dashboard"
                    className="flex items-center py-2 text-gray-700 dark:text-gray-300"
                    onClick={() => setShowMobileUserMenu(false)}
                  >
                    <LayoutDashboard size={18} className="mr-2" />
                    Dashboard
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center py-2 text-gray-700 dark:text-gray-300"
                      onClick={() => setShowMobileUserMenu(false)}
                    >
                      <Shield size={18} className="mr-2" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="flex items-center py-2 text-gray-700 dark:text-gray-300"
                    onClick={() => setShowMobileUserMenu(false)}
                  >
                    <Settings size={18} className="mr-2" />
                    Profile Settings
                  </Link>
                  <Link
                    to="/quiz-history"
                    className="flex items-center py-2 text-gray-700 dark:text-gray-300"
                    onClick={() => setShowMobileUserMenu(false)}
                  >
                    <History size={18} className="mr-2" />
                    Quiz History
                  </Link>
                  <Link
                    to="/progress-photos"
                    className="flex items-center py-2 text-gray-700 dark:text-gray-300"
                    onClick={() => setShowMobileUserMenu(false)}
                  >
                    <Camera size={18} className="mr-2" />
                    Progress Photos
                  </Link>
                  <Link
                    to="/community"
                    className="flex items-center py-2 text-gray-700 dark:text-gray-300"
                    onClick={() => setShowMobileUserMenu(false)}
                  >
                    <Users size={18} className="mr-2" />
                    Community
                  </Link>
                  <Link
                    to="/challenges"
                    className="flex items-center py-2 text-gray-700 dark:text-gray-300"
                    onClick={() => setShowMobileUserMenu(false)}
                  >
                    <Trophy size={18} className="mr-2" />
                    Challenges
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center py-2 text-gray-700 dark:text-gray-300"
                  >
                    <LogOut size={18} className="mr-2" />
                    Sign Out
                  </button>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {showAuthModal && (
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
