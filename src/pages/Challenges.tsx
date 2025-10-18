import { usePlatform } from "@/contexts/PlatformContext";
import { useAuth } from "@/contexts/useAuth";
import { useChallengesQuery } from "@/hooks/Queries/useChallenges";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/services/notificationService";
import type { Challenge } from "@/types/challenge";
import { useColorTheme } from "@/utils/colorUtils";
import confetti from "canvas-confetti";
import { AnimatePresence, domAnimation, LazyMotion, m } from "framer-motion";
import * as LucideIcons from "lucide-react";
import {
  Award,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader,
  Trophy,
  Users,
} from "lucide-react";
import React, {
  memo,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import toast from "react-hot-toast";

interface ChallengeCardProps {
  challenge: Challenge;
  index: number;
  expandedChallenge: string | null;
  setExpandedChallenge: Dispatch<SetStateAction<string | null>>;
  updateProgress: (challengeId: string, newProgress: number) => void;
  quitChallenge: (challengeId: string) => void;
  joinChallenge: (challengeId: string) => void;
}

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

type ChallengeType = "all" | "daily" | "weekly" | "streak" | "goal";
type Difficulty = "beginner" | "intermediate" | "advanced";

const ChallengeCard = memo(
  ({
    challenge,
    index,
    expandedChallenge,
    setExpandedChallenge,
    updateProgress,
    quitChallenge,
    joinChallenge,
  }: ChallengeCardProps) => {
    const getChallengeIcon = (type: ChallengeType) => {
      const icons = {
        daily: LucideIcons.Calendar,
        weekly: LucideIcons.CalendarDays,
        streak: LucideIcons.Flame,
        goal: LucideIcons.Target,
      };
      return type === "all" ? LucideIcons.Award : icons[type];
    };

    const getDifficultyColor = (difficulty: Difficulty | string) => {
      const colors: Record<Difficulty, string> = {
        beginner: "from-green-400 to-emerald-500",
        intermediate: "from-blue-400 to-cyan-500",
        advanced: "from-purple-500 to-pink-500",
      };
      return colors[difficulty as Difficulty] ?? "from-gray-400 to-gray-500";
    };

    const getDifficultyBadge = (difficulty: Difficulty | string) => {
      const badges: Record<Difficulty, string> = {
        beginner:
          "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-400 dark:border-green-600",
        intermediate:
          "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-400 dark:border-blue-600",
        advanced:
          "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-400 dark:border-purple-600",
      };
      return (
        badges[difficulty as Difficulty] ??
        "bg-gray-50 dark:bg-gray-900/30 text-foreground/90 border-gray-400 dark:border-gray-600"
      );
    };

    const IconComponent = getChallengeIcon(challenge.type as ChallengeType);
    const progress = challenge.user_progress
      ? (challenge.user_progress.progress.current /
          challenge.requirements.target) *
        100
      : 0;

    return (
      <m.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, delay: index * 0.03 }}
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-border hover:border-purple-400/50 dark:hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
        style={{ willChange: "transform" }}
      >
        {/* Gradient Header */}
        <div
          className={`h-2 bg-gradient-to-r ${getDifficultyColor(
            challenge.difficulty
          )}`}
        />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`relative p-3 rounded-xl bg-gradient-to-br ${getDifficultyColor(
                  challenge.difficulty
                )} shadow-lg`}
              >
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {challenge.title}
                </h3>
                <span
                  className={`inline-block text-xs font-bold px-3 py-1 rounded-full border-2 ${getDifficultyBadge(
                    challenge.difficulty
                  )}`}
                >
                  {challenge.difficulty}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/40 px-3 py-1.5 rounded-full border-2 border-yellow-400/50 dark:border-yellow-500/50">
              <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="font-black text-yellow-700 dark:text-yellow-300 text-sm">
                {challenge.points}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-foreground/80 text-sm mb-4">
            {challenge.description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Users className="h-4 w-4" />
              <span className="font-semibold">
                {challenge.participants_count}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <Clock className="h-4 w-4" />
              <span className="font-semibold">
                {new Date(challenge.end_date).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Progress or Join Button */}
          {challenge.user_progress ? (
            <div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-foreground/90">
                    Progress
                  </span>
                  <span className="font-black text-foreground">
                    {challenge.user_progress.progress.current} /{" "}
                    {challenge.requirements.target}
                  </span>
                </div>
                <div className="relative w-full bg-background rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getDifficultyColor(
                      challenge.difficulty
                    )} rounded-full transition-all duration-700 ease-out`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              {!challenge.user_progress.completed ? (
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      updateProgress(
                        challenge.id,
                        challenge.user_progress.progress.current + 1
                      )
                    }
                    className={`flex-1 px-4 py-3 bg-gradient-to-r ${getDifficultyColor(
                      challenge.difficulty
                    )} text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2`}
                  >
                    <LucideIcons.Zap className="h-5 w-5" />
                    Log Progress
                  </button>

                  <button
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to quit this challenge?")
                      ) {
                        quitChallenge(challenge.id);
                      }
                    }}
                    className="px-4 py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    Quit
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center p-4 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl font-bold shadow-lg">
                  <LucideIcons.CheckCircle2 className="h-6 w-6 mr-2" />
                  Challenge Completed!
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => joinChallenge(challenge.id)}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Trophy className="h-5 w-5" />
              Join Challenge
            </button>
          )}

          {/* Expand Button */}
          <button
            onClick={() =>
              setExpandedChallenge(
                expandedChallenge === challenge.id ? null : challenge.id
              )
            }
            className="w-full mt-4 flex items-center justify-center text-foreground/90 hover:text-foreground transition-colors duration-200 hover:scale-105 active:scale-95"
          >
            {expandedChallenge === challenge.id ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>

          {/* Expanded Details */}
          <AnimatePresence>
            {expandedChallenge === challenge.id && (
              <m.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-border overflow-hidden"
              >
                <h4 className="font-bold text-foreground mb-3">
                  Challenge Details
                </h4>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li>
                    <strong>Type:</strong> {challenge.type}
                  </li>
                  <li>
                    <strong>Target:</strong> {challenge.requirements.target}{" "}
                    {challenge.requirements.metric}
                  </li>
                  <li>
                    <strong>End Date:</strong>{" "}
                    {new Date(challenge.end_date).toLocaleDateString()}
                  </li>
                </ul>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </m.div>
    );
  }
);

ChallengeCard.displayName = "ChallengeCard";

const Challenges: React.FC = () => {
  const { user } = useAuth();
  const [userRewards, setUserRewards] = useState<UserRewards | null>(null);
  const [activeFilter, setActiveFilter] = useState<ChallengeType | string>(
    "all"
  );
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | string>(
    "all"
  );
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(
    null
  );
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null);
  const platform = usePlatform();
  const colorTheme = useColorTheme(platform.settings?.theme_color);
  const { fetchNotifications } = useNotifications();

  const {
    data: challengesData,
    isLoading,
    refetch: refetchChallenges,
  } = useChallengesQuery(user?.id);

  useEffect(() => {
    fetchUserRewards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserRewards = async () => {
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
  };

  const joinChallenge = async (challengeId: string) => {
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
    }
  };

  const quitChallenge = async (challengeId: string) => {
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
    }
  };

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

  const updateProgress = async (challengeId: string, newProgress: number) => {
    try {
      if (updatingProgress) return;
      setUpdatingProgress(challengeId);

      const challenge = (challengesData || []).find(
        (c) => c.id === challengeId
      );
      if (!challenge) return;

      const isCompleting = newProgress >= challenge.requirements.target;

      // Update progress first
      const { error: updateError } = await supabase
        .from("challenge_participants")
        .update({
          progress: { current: newProgress },
          completed: isCompleting,
          completion_date: isCompleting ? new Date().toISOString() : null,
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
      await Promise.all([
        refetchChallenges(),
        fetchUserRewards(),
        fetchNotifications(),
      ]);
    } catch (error) {
      console.error("Error updating progress:", error);
    } finally {
      setUpdatingProgress(null);
    }
  };

  const filteredChallenges = (challengesData || []).filter((challenge) => {
    const matchesType =
      activeFilter === "all" || challenge.type === activeFilter;
    const matchesDifficulty =
      difficultyFilter === "all" || challenge.difficulty === difficultyFilter;
    return matchesType && matchesDifficulty;
  });

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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative bg-gradient-to-br from-white via-purple-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-purple-900/50 dark:to-blue-900/50 rounded-3xl shadow-2xl border border-purple-200/50 dark:border-purple-700/50 p-8 mb-8 overflow-hidden"
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
                  <div className="relative bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl p-4 shadow-xl">
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
                  <div className="relative bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/40 dark:to-amber-900/40 border-2 border-yellow-400/50 dark:border-yellow-500/50 rounded-2xl px-6 py-4 shadow-xl">
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
                  <div className="relative bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/40 dark:to-blue-900/40 border-2 border-purple-400/50 dark:border-purple-500/50 rounded-2xl px-6 py-4 shadow-xl min-w-[240px]">
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider mb-2">
                      Badges Earned
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {userRewards?.badges.map((badge) => {
                        const IconMap: Record<
                          string,
                          React.ComponentType<LucideIcons.LucideProps>
                        > = {
                          star: LucideIcons.Star,
                          trophy: Trophy,
                          flame: LucideIcons.Flame,
                        };

                        const IconComponent =
                          IconMap[badge.icon] || LucideIcons.Star;
                        return (
                          <div
                            key={badge.id}
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
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-border p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                  Challenge Type
                </p>
                <div className="flex flex-wrap gap-2">
                  {["all", "daily", "weekly", "streak", "goal"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveFilter(type)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-200 shadow-md hover:scale-105 active:scale-95 ${
                        activeFilter === type
                          ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50"
                          : "bg-gray-100 dark:bg-gray-800 text-foreground/90 hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground/80 mb-3 uppercase tracking-wide">
                  Difficulty
                </p>
                <div className="flex flex-wrap gap-2">
                  {["all", "beginner", "intermediate", "advanced"].map(
                    (difficulty) => (
                      <button
                        key={difficulty}
                        onClick={() => setDifficultyFilter(difficulty)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-200 shadow-md hover:scale-105 active:scale-95 ${
                          difficultyFilter === difficulty
                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50"
                            : "bg-gray-100 dark:bg-gray-800 text-foreground/90 hover:bg-gray-200 dark:hover:bg-gray-700"
                        }`}
                      >
                        {difficulty}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          </m.div>

          {/* Enhanced Challenges Grid */}
          <AnimatePresence mode="popLayout">
            <m.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredChallenges.map((challenge, index) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  index={index}
                  expandedChallenge={expandedChallenge}
                  setExpandedChallenge={setExpandedChallenge}
                  updateProgress={updateProgress}
                  quitChallenge={quitChallenge}
                  joinChallenge={joinChallenge}
                />
              ))}
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </LazyMotion>
  );
};

export default Challenges;
