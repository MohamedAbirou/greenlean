import React from "react";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
                <img
                  src="/leaf.svg"
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                />
              <span
                className="text-xl font-bold text-primary"
              >
                GreenLean
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
                  className="text-secondary-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/quiz"
                  className="text-secondary-foreground hover:text-primary transition-colors"
                >
                  Take Quiz
                </Link>
              </li>
              <li>
                <Link
                  to="/diet-plans"
                  className="text-secondary-foreground hover:text-primary transition-colors"
                >
                  Diet Plans
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-secondary-foreground hover:text-primary transition-colors"
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
                  className="text-secondary-foreground hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-secondary-foreground hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-secondary-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-secondary-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-secondary-foreground">
            © 2024 GreenLean. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
