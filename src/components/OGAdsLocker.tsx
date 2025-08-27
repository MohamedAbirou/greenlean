import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface OGAdsLockerProps {
  onComplete: () => void;
}

const OGAdsLocker: React.FC<OGAdsLockerProps> = ({ onComplete }) => {
  const lockerUrl = import.meta.env.VITE_OGADS_LOCKER_URL;
  
  const handleUnlock = () => {
    // Open in new tab
    window.open(lockerUrl, '_blank');

    // Listen for completion message from OGAds
    window.addEventListener('message', function handleMessage(event) {
      // Verify the message origin matches your OGAds domain
      if (event.origin === new URL(lockerUrl).origin) {
        try {
          const data = JSON.parse(event.data);
          if (data.status === 'completed') {
            window.removeEventListener('message', handleMessage);
            onComplete();
          }
        } catch (e) {
          console.error('Invalid message format:', e);
        }
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-2xl w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Unlock Your Personalized Plan
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Complete a quick verification to access your customized diet and workout plan.
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={handleUnlock}
            className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition-colors"
          >
            Complete Verification
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OGAdsLocker;