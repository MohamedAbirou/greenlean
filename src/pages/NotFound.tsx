import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-3xl font-semibold text-foreground mb-6">Page Not Found</h2>
            <p className="text-lg text-foreground/80 mb-8 max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
            
            <Link to="/" className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-green-600 transition-colors">
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;