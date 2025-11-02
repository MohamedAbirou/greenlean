import { AlertCircle, Clock, RefreshCw, Wrench } from "lucide-react";
import React, { useEffect, useState } from "react";

const MaintenancePage: React.FC = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Animated Header Bar */}
          <div className="h-2 bg-gradient-to-r from-primary via-primary/60 to-primary animate-pulse" />

          <div className="p-8 md:p-12 text-center">
            {/* Icon with Animation */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="relative bg-primary/10 p-6 rounded-full">
                <Wrench className="h-16 w-16 md:h-20 md:w-20 text-primary animate-bounce" />
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              We're Under Maintenance
            </h1>

            {/* Subheading with animated dots */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Our team is working hard to improve your experience{dots}
            </p>

            {/* Info Cards Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div className="bg-background/50 border border-border rounded-lg p-4 flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <h3 className="font-semibold text-foreground mb-1">Expected Duration</h3>
                  <p className="text-sm text-muted-foreground">
                    We'll be back shortly. Usually takes 15-30 minutes.
                  </p>
                </div>
              </div>

              <div className="bg-background/50 border border-border rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <h3 className="font-semibold text-foreground mb-1">What's Happening?</h3>
                  <p className="text-sm text-muted-foreground">
                    System upgrades and performance improvements.
                  </p>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="h-5 w-5" />
              Check Status
            </button>

            {/* Footer Message */}
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Need urgent help?{" "}
                <a
                  href="/contact"
                  className="text-primary hover:underline font-medium"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Follow us for updates:{" "}
            <a href="/contact#" className="text-primary hover:underline">
              Twitter
            </a>
            {" • "}
            <a href="/contact" className="text-primary hover:underline">
              Discord
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
