import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Leaf } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Leaf size={32} className="text-green-400" />
              <span className="text-xl font-bold">GreenLean</span>
            </Link>
            <p className="text-gray-300 mb-4">
              Your companion on the journey to a healthier, happier you. Free
              personalized diet and weight loss plans.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-300 hover:text-green-400 transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-green-400 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-green-400 transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-green-400 transition-colors"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/quiz"
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  Take Quiz
                </Link>
              </li>
              <li>
                <Link
                  to="/diet-plans"
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  Diet Plans
                </Link>
              </li>
              <li>
                <Link
                  to="/weight-loss"
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  Weight Loss
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href="/faq"
                  className="text-gray-300 hover:text-green-400 transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-4">
              Subscribe to our newsletter for tips and updates.
            </p>
            <form className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-green-500 text-white font-medium hover:bg-green-600 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} GreenLean. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
