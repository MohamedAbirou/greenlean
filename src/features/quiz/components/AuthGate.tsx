// src/features/quiz/components/AuthGate.tsx

import { AuthModal } from "@/features/auth";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import React from "react";

export const AuthGate: React.FC = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-global">
      <div className="container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background rounded-2xl shadow-lg p-8 text-center"
        >
          <LogIn className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-foreground mb-4">Sign In to Take the Quiz</h2>
          <p className="text-foreground mb-8">
            To get your personalized diet and exercise plan, please sign in or create an account.
            It's completely free!
          </p>
          <AuthModal />
        </motion.div>
      </div>
    </div>
  );
};
