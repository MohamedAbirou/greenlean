import { usePlatform } from "@/contexts/PlatformContext";
import { useAuth } from "@/contexts/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/lib/supabase";
import { useThemeStore } from "@/store/themeStore";
import { useColorTheme } from "@/utils/colorUtils";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf, Menu, Moon, Sun, UserCircle, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthModal from "../auth/AuthModal";
import NotificationsDropdown from "../NotificationsDropdown";
import { Button } from "../ui/button";
import { UserMenu } from "../UserMenu";

interface NavbarProps {
  scrolled: boolean;
  isSticky?: boolean;
}

interface Profile {
  avatar_url: string | null;
  full_name: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ scrolled, isSticky = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { user, signOut } = useAuth();
  const platform = usePlatform();
  const colorTheme = useColorTheme(platform.settings?.theme_color);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotifications();

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
  };

  const handleSignOut = async () => {
    try {
      await signOut();
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
    if (!user) return <UserCircle size={32} className="text-primary" />;

    if (profile?.avatar_url) {
      return (
        <img
          src={profile.avatar_url}
          alt="Profile"
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }

    return <UserCircle size={32} className="text-primary " />;
  };

  const renderUserMenu = () => (
    <>
      <p className="text-sm font-medium text-foreground">
        {profile?.full_name || user?.email?.split("@")[0]}
      </p>
      <p className="text-xs text-foreground/70 truncate">{user?.email}</p>
    </>
  );

  return (
    <>
      <header
        className={`${
          isSticky ? "sticky" : "fixed"
        } w-full z-50 transition-all duration-300 ${
          scrolled || isSticky ? "bg-background shadow-md" : "bg-transparent"
        }`}
      >
        <div className="container py-1 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
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
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <NotificationsDropdown
                notifications={notifications.slice(0, 15)}
                onNotificationClick={(n) => {
                  markAsRead(n.id);
                }}
                markAllAsRead={markAllAsRead}
                clearAll={clearAll}
                unreadCount={unreadCount}
              />

              <Button
                variant="secondary"
                onClick={toggleTheme}
                className={`rounded-full ${isDarkMode && "text-yellow-500"}`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </Button>

              {user ? (
                <UserMenu
                  handleSignOut={handleSignOut}
                  isAdmin={isAdmin}
                  renderAvatar={renderAvatar}
                  renderUserMenu={renderUserMenu}
                />
              ) : (
                <AuthModal colorTheme={colorTheme} />
              )}
            </div>

            {/* Mobile Menu Buttons */}
            <div className="md:hidden flex items-center space-x-2">
              <NotificationsDropdown
                notifications={notifications.slice(0, 15)}
                onNotificationClick={(n) => {
                  markAsRead(n.id);
                }}
                markAllAsRead={markAllAsRead}
                clearAll={clearAll}
                unreadCount={unreadCount}
              />

              <Button
                variant="secondary"
                onClick={toggleTheme}
                className={`rounded-full ${isDarkMode && "text-yellow-500"}`}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </Button>

              {user && (
                <UserMenu
                  handleSignOut={handleSignOut}
                  isAdmin={isAdmin}
                  renderAvatar={renderAvatar}
                  renderUserMenu={renderUserMenu}
                />
              )}

              <Button variant="ghost" onClick={toggleMenu} className="w-9">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
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
              className="bg-background"
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
                          : "text-foreground"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  {!user && (
                    <AuthModal colorTheme={colorTheme} classNames="w-full" />
                  )}
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

export default Navbar;
