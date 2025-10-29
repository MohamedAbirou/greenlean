import { useAuth } from "@/features/auth";
import {
  canUpdateProgress,
  ChallengeCard,
  ChallengeFilters,
  ChallengeHeader,
  useChallengesQuery,
  useJoinChallenge,
  useQuitChallenge,
  useUpdateChallengeProgress,
  useUserRewards,
} from "@/features/challenges";
import type { Challenge } from "@/shared/types/challenge";
import confetti from "canvas-confetti";
import { AnimatePresence, domAnimation, LazyMotion } from "framer-motion";
import { Loader } from "lucide-react";
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";

const Challenges: React.FC = () => {
  const { user } = useAuth();
  // UI filter state
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  // In-progress UI
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [quittingId, setQuittingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Data hooks
  const { data: challenges, isLoading } = useChallengesQuery(user?.id);
  const { data: userRewards } = useUserRewards(user?.id);
  const joinChallenge = useJoinChallenge(user?.id, () => toast.success("Joined challenge!"));
  const quitChallenge = useQuitChallenge(user?.id, () => toast("Challenge removed"));
  const updateProgress = useUpdateChallengeProgress(user?.id, ({ isCompleting }) => {
    if (isCompleting) {
      toast.success("🎉 Challenge completed!");
      triggerConfetti();
    } else {
      toast.success("Progress logged");
    }
  });

  function triggerConfetti() {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => {
      confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } });
    }, 200);
  }

  // Handlers for cards
  const handleJoin = (challenge: Challenge) => {
    setJoiningId(challenge.id);
    joinChallenge.mutate(challenge, {
      onSettled: () => setJoiningId(null),
      onError: (e: any) => toast.error("Error joining: " + (e?.message || e)),
    });
  };
  const handleQuit = (challenge: Challenge) => {
    setQuittingId(challenge.id);
    quitChallenge.mutate(challenge.id, {
      onSettled: () => setQuittingId(null),
      onError: (e: any) => toast.error("Error quitting: " + (e?.message || e)),
    });
  };
  const handleUpdateProgress = (challenge: Challenge, newProgress: number) => {
    setUpdatingId(challenge.id);
    const lastProgress = (challenge.user_progress as any)?.last_progress_date;
    if (lastProgress !== undefined && !canUpdateProgress(challenge.type, lastProgress)) {
      setUpdatingId(null);
      toast.error("🚫 You already logged progress for this period!");
      return;
    }
    updateProgress.mutate(
      { challenge, newProgress },
      {
        onSettled: () => setUpdatingId(null),
        onError: (e: any) => toast.error("Error updating: " + (e?.message || e)),
      }
    );
  };

  // Filtering (stable)
  const filteredChallenges = useMemo(() => {
    return (challenges || [])
      .filter((challenge: Challenge) => {
        const matchesType = activeFilter === "all" || challenge.type === activeFilter;
        const matchesDifficulty =
          difficultyFilter === "all" || challenge.difficulty === difficultyFilter;
        const participant = challenge.participants?.find((p: any) => p.user_id === user?.id);
        const isCompleted = participant?.completed;
        const isJoined = !!participant;
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "completed" && isCompleted) ||
          (statusFilter === "in_progress" && isJoined && !isCompleted) ||
          (statusFilter === "not_joined" && !isJoined);
        return matchesType && matchesDifficulty && matchesStatus;
      })
      .sort((a: Challenge, b: Challenge) => {
        switch (sortBy) {
          case "newest":
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case "oldest":
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
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
  }, [activeFilter, challenges, difficultyFilter, sortBy, statusFilter, user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-page-purple-blue pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <ChallengeHeader userRewards={userRewards} />
          <ChallengeFilters
            activeFilter={activeFilter}
            difficultyFilter={difficultyFilter}
            statusFilter={statusFilter}
            sortBy={sortBy}
            setActiveFilter={setActiveFilter}
            setDifficultyFilter={setDifficultyFilter}
            setStatusFilter={setStatusFilter}
            setSortBy={setSortBy}
          />
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredChallenges.map((challenge: Challenge, index: number) => (
                <ChallengeCard
                  key={challenge.id}
                  index={index}
                  challenge={challenge}
                  isJoining={joiningId === challenge.id}
                  isQuitting={quittingId === challenge.id}
                  updatingProgress={updatingId === challenge.id}
                  updateProgress={(_id: string, newProgress: number) =>
                    handleUpdateProgress(challenge, newProgress)
                  }
                  quitChallenge={() => handleQuit(challenge)}
                  joinChallenge={() => handleJoin(challenge)}
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
