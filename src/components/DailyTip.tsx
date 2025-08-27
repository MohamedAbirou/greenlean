import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lightbulb, BookmarkPlus, BookmarkCheck, Share2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

interface Tip {
  id: number;
  category: "workout" | "nutrition" | "motivation";
  content: string;
  title: string;
}

const tips: Tip[] = [
  {
    id: 1,
    category: "workout",
    title: "Perfect Your Form",
    content:
      "Focus on proper form during exercises. Quality reps are better than rushed ones. This reduces injury risk and maximizes results.",
  },
  {
    id: 2,
    category: "nutrition",
    title: "Protein Timing",
    content:
      "Consume protein within 30 minutes after your workout to support muscle recovery and growth.",
  },
  {
    id: 3,
    category: "motivation",
    title: "Progress Over Perfection",
    content:
      "Remember that small improvements add up. Celebrate your daily wins, no matter how small they seem.",
  },
  {
    id: 4,
    category: "workout",
    title: "Active Recovery",
    content:
      "On rest days, try light activities like walking or stretching to promote recovery and maintain mobility.",
  },
  {
    id: 5,
    category: "nutrition",
    title: "Hydration Reminder",
    content:
      "Drink water throughout the day. A good rule is to consume half your body weight (in pounds) in ounces of water daily.",
  },
];

const DailyTip: React.FC = () => {
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadTip = async () => {
      if (!user) return;

      try {
        // Get today's date as string for consistent comparison
        const today = new Date().toDateString();

        // Get the tip of the day based on the date
        const tipIndex = Math.floor(
          (new Date(today).getTime() / (1000 * 60 * 60 * 24)) % tips.length
        );

        const todaysTip = tips[tipIndex];
        setCurrentTip(todaysTip);

        // Check if user has any saved tips
        const { data: savedTip } = await supabase
          .from("saved_tips")
          .select("tip_id")
          .eq("user_id", user.id)
          .eq("tip_id", todaysTip.id)
          .limit(1);

        // Check if current tip is bookmarked
        setIsBookmarked(savedTip?.length > 0);
      } catch (error) {
        console.error("Error loading tip:", error);
      }
    };

    loadTip();
  }, [user]);

  const handleBookmark = async () => {
    if (!user || !currentTip) return;

    try {
      if (isBookmarked) {
        // Remove bookmark
        await supabase
          .from("saved_tips")
          .delete()
          .eq("user_id", user.id)
          .eq("tip_id", currentTip.id);
      } else {
        // Add bookmark
        await supabase.from("saved_tips").insert([
          {
            user_id: user.id,
            tip_id: currentTip.id,
            tip_content: currentTip.content,
            tip_title: currentTip.title,
            tip_category: currentTip.category,
          },
        ]);
      }

      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };

  const handleShare = async () => {
    if (!currentTip) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Daily Fitness Tip from GreenLean",
          text: `${currentTip.title}: ${currentTip.content}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  if (!currentTip) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-2 h-full bg-green-500" />

      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <Lightbulb className="h-6 w-6 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Tip of the Day
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleBookmark}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={isBookmarked ? "Remove from saved tips" : "Save tip"}
          >
            {isBookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-green-500" />
            ) : (
              <BookmarkPlus className="h-5 w-5 text-gray-400 hover:text-green-500" />
            )}
          </button>

          <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Share tip"
          >
            <Share2 className="h-5 w-5 text-gray-400 hover:text-green-500" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          {currentTip.title}
        </h4>
        <p className="text-gray-600 dark:text-gray-300">{currentTip.content}</p>
      </div>

      {showShareMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg py-1 z-10"
        >
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `${currentTip.title}: ${currentTip.content}`
              );
              setShowShareMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Copy to clipboard
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DailyTip;
