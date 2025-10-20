import ChallengeCard from "@/components/ChallengeCard";
import { usePlatform } from "@/contexts/PlatformContext";
import { useAuth } from "@/contexts/useAuth";
import { canUpdateProgress, IconMap } from "@/helpers/challengeHelper";
import { useChallengesQuery } from "@/hooks/Queries/useChallenges";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/services/notificationService";
import { useColorTheme } from "@/utils/colorUtils";
import confetti from "canvas-confetti";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { Loader, Trophy } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

interface UserRewards {
  points: number;
  badges: {
    id: string;
    name: string;
    icon: string;
    color: string;
    earned_at: string;
  }[];
}

function getNextExpiration(type: string) {
  const now = new Date();
  if (type === "daily") return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (type === "weekly") return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return null;
}

const Challenges: React.FC = () => {
  const { user } = useAuth();

  const [userRewards, setUserRewards] = useState<UserRewards | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [quittingId, setQuittingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const platform = usePlatform();
  const colorTheme = useColorTheme(platform.settings?.theme_color);

  const {
    data: challengesData,
    isLoading,
    refetch: refetchChallenges,
  } = useChallengesQuery(user?.id);

  useEffect(() => {
    fetchUserRewards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserRewards = useCallback(async () => {
    try {
      if (!user) return;

      // First try to get existing rewards
      const { data: existingRewards, error: fetchError } = await supabase
        .from("user_rewards")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

      if (existingRewards) {
        setUserRewards(existingRewards);
      } else {
        // If no rewards exist, create a new record
        const { data: newRewards, error: insertError } = await supabase
          .from("user_rewards")
          .insert({ user_id: user.id, points: 0, badges: [] })
          .select()
          .maybeSingle();

        if (insertError) throw insertError;
        setUserRewards(newRewards);
      }
    } catch (error) {
      console.error("Error fetching user rewards:", error);
      setUserRewards({ points: 0, badges: [] });
    }
  }, [user]);

  const joinChallenge = useCallback(
    async (challengeId: string) => {
      setJoiningId(challengeId);
      try {
        const { error } = await supabase.from("challenge_participants").insert({
          challenge_id: challengeId,
          user_id: user?.id,
          progress: { current: 0 },
        });

        if (error) throw error;
        await refetchChallenges();
      } catch (error) {
        console.error("Error joining challenge:", error);
      } finally {
        setJoiningId(null);
      }
    },
    [refetchChallenges, user?.id]
  );

  const quitChallenge = useCallback(
    async (challengeId: string) => {
      setQuittingId(challengeId);
      try {
        const { error } = await supabase
          .from("challenge_participants")
          .delete()
          .eq("challenge_id", challengeId)
          .eq("user_id", user?.id);

        if (error) throw error;
        await refetchChallenges();
      } catch (error) {
        console.error("Error quitting challenge:", error);
      } finally {
        setQuittingId(null);
      }
    },
    [refetchChallenges, user?.id]
  );

  const triggerConfetti = () => {
    // First burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Second burst after a small delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 200);
  };

  const updateProgress = useCallback(
    async (challengeId: string, newProgress: number) => {
      setUpdatingId(challengeId);
      try {
        const challenge = (challengesData || []).find(
          (c) => c.id === challengeId
        );
        if (!challenge) return;

        const { data: participant } = await supabase
          .from("challenge_participants")
          .select("*")
          .eq("challenge_id", challengeId)
          .eq("user_id", user?.id)
          .maybeSingle();

        if (!participant) return;

        // check if user can update
        if (
          !canUpdateProgress(challenge.type, participant.last_progress_date)
        ) {
          toast.error("🚫 You already logged progress for this period!");
          return;
        }

        const isCompleting = newProgress >= challenge.requirements.target;

        // Update progress first
        const { error: updateError } = await supabase
          .from("challenge_participants")
          .update({
            progress: { current: newProgress },
            completed: isCompleting,
            completion_date: isCompleting ? new Date().toISOString() : null,
            streak_count: newProgress,
            last_progress_date: new Date().toISOString(),
            streak_expires_at: getNextExpiration(challenge.type),
            streak_warning_sent: false
          })
          .eq("challenge_id", challengeId)
          .eq("user_id", user?.id);

        if (updateError) throw updateError;

        // If completing the challenge, update rewards and trigger confetti
        if (isCompleting) {
          const { data: currentRewards } = await supabase
            .from("user_rewards")
            .select("points, badges")
            .eq("user_id", user?.id)
            .maybeSingle();

          if (currentRewards) {
            const updateBadges = [...(currentRewards.badges || [])];

            if (
              challenge.badge &&
              !updateBadges.find((b) => b.id === challenge.badge!.id)
            ) {
              updateBadges.push({
                id: challenge.badge.id,
                name: challenge.badge.name,
                icon: challenge.badge.icon,
                color: challenge.badge.color,
                earned_at: new Date().toISOString(),
              });
            }

            const { error: rewardError } = await supabase
              .from("user_rewards")
              .update({
                points: currentRewards.points + challenge.points,
                badges: updateBadges,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", user?.id);

            if (rewardError) throw rewardError;

            //* Notify user
            if (challenge.badge) {
              toast.success(`🏆 You earned the ${challenge.badge.name} badge`);
              await createNotification({
                recipient_id: user?.id || "",
                sender_id: null,
                type: "reward",
                entity_id: challenge.id,
                entity_type: "reward",
                message: `🏆 You earned the ${challenge.badge.name} badge`,
              });
            }

            if (challenge.points) {
              toast.success(`🎉 +${challenge.points} points`);
              await createNotification({
                recipient_id: "",
                sender_id: "",
                type: "reward",
                entity_id: challenge.id,
                entity_type: "reward",
                message: `🎉 +${challenge.points} points`,
              });
            }

            // Trigger confetti animation
            triggerConfetti();
          }
        }

        // Refresh data
        await Promise.all([refetchChallenges(), fetchUserRewards()]);
      } catch (error) {
        console.error("Error updating progress:", error);
      } finally {
        setUpdatingId(null);
      }
    },
    [challengesData, fetchUserRewards, refetchChallenges, user?.id]
  );

  const filteredChallenges = useMemo(() => {
    return (challengesData || [])
      .filter((challenge) => {
        const matchesType =
          activeFilter === "all" || challenge.type === activeFilter;
        const matchesDifficulty =
          difficultyFilter === "all" ||
          challenge.difficulty === difficultyFilter;

        // Find participant status for this user
        const participant = challenge.participants?.find(
          (p) => p.user_id === user?.id
        );

        const isCompleted = participant?.completed;
        const isJoined = !!participant;

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "completed" && isCompleted) ||
          (statusFilter === "in_progress" && isJoined && !isCompleted) ||
          (statusFilter === "not_joined" && !isJoined);

        return matchesType && matchesDifficulty && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          case "oldest":
            return (
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
            );
          case "points_high":
            return b.points - a.points;
          case "points_low":
            return a.points - b.points;
          case "easy_first":
            return (
              ["beginner", "intermediate", "advanced"].indexOf(a.difficulty) -
              ["beginner", "intermediate", "advanced"].indexOf(b.difficulty)
            );
          case "hard_first":
            return (
              ["beginner", "intermediate", "advanced"].indexOf(b.difficulty) -
              ["beginner", "intermediate", "advanced"].indexOf(a.difficulty)
            );
          default:
            return 0;
        }
      });
  }, [
    activeFilter,
    challengesData,
    difficultyFilter,
    sortBy,
    statusFilter,
    user?.id,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className={`h-8 w-8 animate-spin ${colorTheme.primaryText}`} />
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:bg-gradient-to-br dark:from-gray-950 dark:via-purple-950 dark:to-blue-950 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {/* Enhanced Header */}
          <m.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-white via-purple-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900/50 dark:to-blue-900/50 rounded-lg shadow-2xl border border-purple-200/50 dark:border-purple-700/50 p-8 overflow-hidden"
          >
            {/* Static Background Blobs - Only one animated */}
            <div
              className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-300/30 to-purple-300/30 dark:from-yellow-400/20 dark:to-purple-400/20 rounded-full blur-3xl animate-pulse"
              style={{ transform: "translateZ(0)", willChange: "opacity" }}
            />
            <div
              className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-blue-300/30 to-pink-300/30 dark:from-blue-400/20 dark:to-pink-400/20 rounded-full blur-3xl"
              style={{ transform: "translateZ(0)" }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Title Section */}
              <div className="flex items-center gap-5">
                <m.div
                  className="relative group"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl blur-lg opacity-60" />
                  <div className="relative bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg p-4 shadow-xl">
                    <Trophy className="h-10 w-10 text-white" />
                  </div>
                </m.div>

                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 dark:from-purple-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent pb-3">
                    Workout Challenges
                  </h1>
                  <p className="text-foreground/90 flex items-center gap-2">
                    <LucideIcons.Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
                    Complete challenges, earn points, unlock epic rewards
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Points */}
                <div className="relative group cursor-pointer transition-transform duration-200 hover:scale-105 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/40 dark:to-amber-900/40 border-2 border-yellow-400/50 dark:border-yellow-500/50 rounded-lg px-6 py-4 shadow-xl">
                    <p className="text-xs font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-wider mb-1">
                      Total Points
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-black bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400 bg-clip-text text-transparent">
                        {userRewards?.points.toLocaleString()}
                      </p>
                      <LucideIcons.Sparkles className="h-5 w-5 text-yellow-500 mb-1 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="relative group cursor-pointer transition-transform duration-200 hover:scale-105 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                  <div className="relative bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/40 dark:to-blue-900/40 border-2 border-purple-400/50 dark:border-purple-500/50 rounded-lg px-6 py-4 shadow-xl min-w-[240px]">
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider mb-2">
                      Badges Earned
                    </p>
                    {userRewards?.badges.length === 0 && (
                      <p className="text-foreground">.....</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {userRewards?.badges.map((badge, index) => {
                        const IconComponent =
                          IconMap[badge.icon] || LucideIcons.Star;

                        return (
                          <div
                            key={index}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-transform duration-200 hover:scale-110 hover:rotate-3 border-2 shadow-md"
                            style={{
                              backgroundColor: `${badge.color}20`,
                              borderColor: badge.color,
                              color: badge.color,
                            }}
                          >
                            <IconComponent className="w-4 h-4" />
                            <span className="max-w-[90px] truncate">
                              {badge.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </m.div>

          {/* Enhanced Filters */}
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left Side: Type & Difficulty Filters */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                {/* Type Filter */}
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium hover:border-purple-400 dark:hover:border-purple-500 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[140px]"
                >
                  <option value="all">All Types</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="goal">Goal</option>
                  <option value="streak">Streak</option>
                </select>

                {/* Difficulty Filter */}
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium hover:border-purple-400 dark:hover:border-purple-500 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[160px]"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* Middle: Status Toggle Buttons */}
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "All", icon: "🎯" },
                  { value: "not_joined", label: "Available", icon: "✨" },
                  { value: "in_progress", label: "Active", icon: "🔥" },
                  { value: "completed", label: "Done", icon: "✅" },
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() => setStatusFilter(status.value)}
                    className={`
                    px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200
                    ${
                      statusFilter === status.value
                        ? "bg-purple-500 text-white shadow-lg scale-105"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }
                  `}
                  >
                    <span className="hidden sm:inline">{status.icon} </span>
                    {status.label}
                  </button>
                ))}
              </div>

              {/* Right: Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-medium hover:border-purple-400 dark:hover:border-purple-500 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 lg:min-w-[180px]"
              >
                <option value="newest">🕒 Newest</option>
                <option value="oldest">⏳ Oldest</option>
                <option value="points_high">💎 Highest Points</option>
                <option value="points_low">🪶 Lowest Points</option>
                <option value="easy_first">🌱 Easiest First</option>
                <option value="hard_first">🔥 Hardest First</option>
              </select>
            </div>
          </div>

          {/* Enhanced Challenges Grid */}
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredChallenges.map((challenge, index) => (
                <ChallengeCard
                  key={challenge.id}
                  index={index}
                  challenge={challenge}
                  isJoining={joiningId === challenge.id}
                  isQuitting={quittingId === challenge.id}
                  updatingProgress={updatingId === challenge.id}
                  updateProgress={updateProgress}
                  quitChallenge={quitChallenge}
                  joinChallenge={joinChallenge}
                />
              ))}
            </div>
          </AnimatePresence>
        </div>
      </div>
    </LazyMotion>
  );
};

export default Challenges;
