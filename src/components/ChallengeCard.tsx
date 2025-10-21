import { IconMap } from "@/helpers/challengeHelper";
import type { Challenge } from "@/types/challenge";
import { m } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { Clock, Trophy, Users } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import Countdown from "./Countdown";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface ChallengeCardProps {
  challenge: Challenge;
  isJoining: boolean;
  updatingProgress: boolean;
  isQuitting: boolean;
  index: number;
  updateProgress: (challengeId: string, newProgress: number) => void;
  quitChallenge: (challengeId: string) => void;
  joinChallenge: (challengeId: string) => void;
}

const difficultyColors = {
  beginner: "from-green-400 to-emerald-500",
  intermediate: "from-blue-400 to-cyan-500",
  advanced: "from-purple-500 to-pink-500",
};

const difficultyBadges = {
  beginner:
    "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-400 dark:border-green-600",
  intermediate:
    "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-400 dark:border-blue-600",
  advanced:
    "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-400 dark:border-purple-600",
};

const challengeIcons = {
  daily: LucideIcons.Calendar,
  weekly: LucideIcons.CalendarDays,
  streak: LucideIcons.Flame,
  goal: LucideIcons.Target,
  all: LucideIcons.Award,
};

const ChallengeCard = memo(
  ({
    challenge,
    isJoining,
    isQuitting,
    index,
    updatingProgress,
    updateProgress,
    quitChallenge,
    joinChallenge,
  }: ChallengeCardProps) => {
    const IconComponent = useMemo(
      () => challengeIcons[challenge.type] || LucideIcons.Award,
      [challenge.type]
    );

    const BadgeIconComponent = useMemo(
      () => IconMap[challenge.badge?.icon ?? "star"] || LucideIcons.Star,
      [challenge.badge?.icon]
    );

    const difficultyColor = useMemo(
      () =>
        difficultyColors[challenge.difficulty] || "from-gray-400 to-gray-500",
      [challenge.difficulty]
    );

    const difficultyBadge = useMemo(
      () =>
        difficultyBadges[challenge.difficulty] ||
        "bg-gray-50 dark:bg-gray-900/30 text-foreground/90 border-gray-400 dark:border-gray-600",
      [challenge.difficulty]
    );

    const progress = useMemo(
      () =>
        challenge.user_progress
          ? (challenge.user_progress.progress.current /
              challenge.requirements.target) *
            100
          : 0,
      [challenge.user_progress, challenge.requirements.target]
    );

    // OPTIMIZED: useCallback for event handlers
    const handleUpdateProgress = useCallback(() => {
      updateProgress(
        challenge.id,
        challenge.user_progress?.progress.current + 1
      );
    }, [challenge.id, challenge.user_progress?.progress, updateProgress]);

    const handleQuitChallenge = useCallback(() => {
      if (confirm("Are you sure you want to quit this challenge?")) {
        quitChallenge(challenge.id);
      }
    }, [challenge.id, quitChallenge]);

    const handleJoinChallenge = useCallback(() => {
      joinChallenge(challenge.id);
    }, [challenge.id, joinChallenge]);

    return (
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="relative bg-white dark:bg-gray-900 rounded-md shadow-xl overflow-hidden border border-border transition-all duration-300 hover:border-purple-400/50 dark:hover:border-purple-500/50 hover:shadow-2xl group"
        style={{ transform: "translateZ(0)" }}
      >
        {/* Gradient Header */}
        <div className={`h-1 bg-gradient-to-r ${difficultyColor}`} />

        <div className="p-3 flex flex-col h-full">
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 items-center justify-between">
              <div className="flex items-center gap-3 w-full">
                <div
                  className={`relative p-3 rounded-xl bg-gradient-to-br ${difficultyColor} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  style={{ transform: "translateZ(0)" }}
                >
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col md:flex-row items-start w-full md:block">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground mb-1 truncate">
                      {challenge.title}
                    </h3>
                    {challenge.user_progress?.streak_expires_at && (
                      <Countdown
                        expiry={challenge.user_progress?.streak_expires_at}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border-2 ${difficultyBadge}`}
                    >
                      {challenge.difficulty}
                    </span>

                    {challenge.user_progress &&
                      !challenge.user_progress.completed &&
                      challenge.user_progress.streak_count > 0 && (
                        <span className="flex items-center font-bold text-xs px-2 py-0.5 rounded-full border-2 border-red-800/50 dark:border-red-500/50 text-red-700 dark:text-red-500 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/40 dark:to-red-900/40">
                          <LucideIcons.Flame size={17} />
                          {challenge.user_progress.streak_count}
                        </span>
                      )}

                    <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/40 px-2 py-0.5 rounded-full border-2 border-yellow-400/50 dark:border-yellow-500/50">
                      <LucideIcons.Sparkles className="h-3 w-3 text-yellow-500 animate-pulse" />
                      <span className="font-black text-yellow-700 dark:text-yellow-300 text-xs">
                        {challenge.points}
                      </span>
                    </div>

                    {challenge.badge && (
                      <div
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold cursor-pointer border-2 shadow-md"
                        style={{
                          backgroundColor: `${challenge.badge.color}20`,
                          borderColor: challenge.badge.color,
                          color: challenge.badge.color,
                          transform: "translateZ(0)",
                        }}
                      >
                        <BadgeIconComponent className="w-4 h-4" />
                        <span>{challenge.badge.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-foreground/80 text-sm truncate">
              {challenge.description}
            </p>
          </div>

          {/* Stats */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between ">
              <div className="flex items-center space-x-1 text-sm text-foreground/80">
                <Clock className="h-4 w-4" />
                <span className="font-semibold">
                  {new Date(challenge.end_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-foreground/80">
                <Users className="h-4 w-4" />
                <span className="font-semibold">
                  {challenge.participants_count}
                </span>
              </div>
              <div className="text-sm text-primary">
                <Tooltip>
                  <TooltipTrigger className="flex items-center space-x-1">
                    <LucideIcons.Info className="h-4 w-4" />
                    <span className="font-semibold">More details</span>
                  </TooltipTrigger>
                  <TooltipContent className="bg-background p-2">
                    <div className="mb-3">
                      <h4 className="font-bold text-foreground">
                        Challenge Details
                      </h4>
                      <hr className="my-1" />
                      <ul className="space-y-1 text-foreground/80">
                        <li>
                          <strong>Type:</strong> {challenge.type}
                        </li>
                        <li>
                          <strong>Target:</strong>{" "}
                          {challenge.requirements.target}{" "}
                          {challenge.requirements.metric}
                        </li>
                        <li>
                          <strong>End Date:</strong>{" "}
                          {new Date(challenge.end_date).toLocaleDateString()}
                        </li>
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <hr />

            {/* Progress or Join Button */}
            {challenge.user_progress ? (
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-foreground/90">
                      Progress
                    </span>
                    <span className="font-black text-foreground">
                      {challenge.user_progress.progress.current} /{" "}
                      {challenge.requirements.target}
                    </span>
                  </div>
                  <div className="relative w-full bg-background rounded-full h-2 overflow-hidden">
                    <div
                      className={`absolute inset-0 origin-left bg-gradient-to-r ${difficultyColor} rounded-full transition-transform duration-500 ease-out`}
                      style={{
                        transform: `scaleX(${Math.min(progress, 100) / 100})`,
                        willChange: "transform",
                      }}
                    />
                  </div>
                </div>

                {!challenge.user_progress.completed ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateProgress}
                      className={`w-3/5 py-2 bg-gradient-to-r ${difficultyColor} text-white rounded-md font-bold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer`}
                      style={{ transform: "translateZ(0)" }}
                    >
                      {updatingProgress ? (
                        <LucideIcons.Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <LucideIcons.Zap className="h-5 w-5" />
                      )}
                      {updatingProgress ? "Logging..." : "Log Progress"}
                    </button>

                    <button
                      onClick={handleQuitChallenge}
                      className="w-2/5 py-2 bg-destructive text-white rounded-md font-bold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      style={{ transform: "translateZ(0)" }}
                    >
                      {isQuitting ? (
                        <LucideIcons.Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <LucideIcons.LogOut className="h-5 w-5" />
                      )}
                      {isQuitting ? "Quitting..." : "Quit"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-md font-bold shadow-lg">
                    <LucideIcons.CheckCircle2 className="h-5 w-5 mr-2" />
                    Challenge Completed!
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleJoinChallenge}
                className="w-full py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md font-bold shadow-lg transition-all duration-200 hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                style={{ transform: "translateZ(0)" }}
              >
                {isJoining ? (
                  <LucideIcons.Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Trophy className="h-5 w-5" />
                )}
                {isJoining ? "Joining..." : "Join Challenge"}
              </button>
            )}
          </div>
        </div>
      </m.div>
    );
  },
  // CRITICAL: Custom comparison function for memo
  (prevProps, nextProps) => {
    return (
      prevProps.challenge.id === nextProps.challenge.id &&
      prevProps.challenge.user_progress?.progress.current ===
        nextProps.challenge.user_progress?.progress.current &&
      prevProps.challenge.user_progress?.completed ===
        nextProps.challenge.user_progress?.completed
    );
  }
);

ChallengeCard.displayName = "ChallengeCard";

export default ChallengeCard;
