import { usePlatform } from "@/contexts/PlatformContext";
import { useColorTheme } from "@/utils/colorUtils";
import { Leaf } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  const platform = usePlatform();
  const colorTheme = useColorTheme(platform.settings?.theme_color);

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              {platform.settings?.logo_url ? (
                <img
                  src={platform.settings.logo_url}
                  alt="Logo"
                  className="w-8 h-8 object-contain"
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
            <p className="text-secondary-foreground mb-4">
              Your personalized health and fitness journey starts here. Get
              customized diet plans, exercise routines, and track your progress
              with our comprehensive platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className={`text-secondary-foreground hover:${colorTheme.primaryText} dark:hover:${colorTheme.primaryText} transition-colors`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/quiz"
                  className={`text-secondary-foreground hover:${colorTheme.primaryText} dark:hover:${colorTheme.primaryText} transition-colors`}
                >
                  Take Quiz
                </Link>
              </li>
              <li>
                <Link
                  to="/diet-plans"
                  className={`text-secondary-foreground hover:${colorTheme.primaryText} dark:hover:${colorTheme.primaryText} transition-colors`}
                >
                  Diet Plans
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className={`text-secondary-foreground hover:${colorTheme.primaryText} dark:hover:${colorTheme.primaryText} transition-colors`}
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className={`text-secondary-foreground hover:${colorTheme.primaryText} dark:hover:${colorTheme.primaryText} transition-colors`}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className={`text-secondary-foreground hover:${colorTheme.primaryText} dark:hover:${colorTheme.primaryText} transition-colors`}
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className={`text-secondary-foreground hover:${colorTheme.primaryText} dark:hover:${colorTheme.primaryText} transition-colors`}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className={`text-secondary-foreground hover:${colorTheme.primaryText} dark:hover:${colorTheme.primaryText} transition-colors`}
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-secondary-foreground">
            © 2024 {platform.settings?.platform_name || "GreenLean"}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
