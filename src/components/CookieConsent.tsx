import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Cookies from 'js-cookie';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = Cookies.get('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    Cookies.set('cookie-consent', 'accepted', { expires: 365 });
    setShowBanner(false);
    window.location.reload();
  };

  const handleDecline = () => {
    Cookies.set('cookie-consent', 'declined', { expires: 365 });
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              We value your privacy
            </h3>
            <p className="text-sm text-gray-600">
              We use cookies and similar technologies to improve your experience, analyze site traffic,
              and personalize content. By clicking "Accept All", you consent to our use of cookies for
              analytics purposes through Vercel Analytics.{' '}
              <a
                href="/about"
                className="text-green-600 hover:text-green-700 underline"
              >
                Learn more
              </a>
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleDecline}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
