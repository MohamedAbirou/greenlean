/**
 * Quiz Loading Component
 * Shown while generating personalized plan
 */

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useState } from "react";
import { LOADING_MESSAGES } from "../data/quizPhases";

export function QuizLoading() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-2xl shadow-lg p-8 text-center border"
    >
      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="h-8 w-8 text-primary" />
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-4">
        Creating Your Personalized Plan
      </h2>

      <p className="text-muted-foreground mb-6 transition-opacity duration-500 ease-in-out min-h-[24px]">
        {LOADING_MESSAGES[messageIndex]}
      </p>

      <div className="flex justify-center max-w-xs mx-auto">
        <DotLottieReact
          src="https://lottie.host/1affa7b2-7053-45b0-840a-11afc08c1746/9gcho1H4gZ.lottie"
          loop
          autoplay
        />
      </div>
    </motion.div>
  );
}
