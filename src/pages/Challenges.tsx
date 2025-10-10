import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import {
    Award,
    Calendar,
    ChevronDown,
    ChevronUp,
    Clock,
    Dumbbell,
    Flame,
    Loader,
    Target,
    Trophy,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { usePlatform } from '../contexts/PlatformContext';
import { useAuth } from "../contexts/useAuth";
import { supabase } from '../lib/supabase';
import { useColorTheme } from '../utils/colorUtils';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'streak' | 'goal';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  requirements: {
    target: number;
    metric: string;
    timeframe?: string;
  };
  start_date: string;
  end_date: string;
  is_active: boolean;
  participants_count: number;
  user_progress?: {
    progress: {
      current: number;
    };
    completed: boolean;
    streak_count: number;
  };
}

interface UserRewards {
  points: number;
  badges: {
    id: string;
    name: string;
    icon: string;
    earned_at: string;
  }[];
}

const Challenges: React.FC = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userRewards, setUserRewards] = useState<UserRewards | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'daily' | 'weekly' | 'streak' | 'goal'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null);
  const platform = usePlatform();
  const colorTheme = useColorTheme(platform.settings?.theme_color);

  useEffect(() => {
    fetchChallenges();
    fetchUserRewards();
  }, [user]);

  const fetchChallenges = async () => {
    try {
      if (!user) return;

      // Get all active challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true }); // Add stable ordering

      if (challengesError) throw challengesError;

      // Get participant counts and user progress in parallel
      const challengesWithDetails = await Promise.all(
        challengesData.map(async (challenge) => {
          const [{ count }, { data: userProgress }] = await Promise.all([
            supabase
              .from('challenge_participants')
              .select('*', { count: 'exact' })
              .eq('challenge_id', challenge.id),
            supabase
              .from('challenge_participants')
              .select('progress, completed, streak_count')
              .eq('challenge_id', challenge.id)
              .eq('user_id', user.id)
              .maybeSingle()
          ]);

          return {
            ...challenge,
            participants_count: count || 0,
            user_progress: userProgress || null
          };
        })
      );

      setChallenges(challengesWithDetails);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRewards = async () => {
    try {
      if (!user) return;

      // First try to get existing rewards
      const { data: existingRewards, error: fetchError } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingRewards) {
        setUserRewards(existingRewards);
      } else {
        // If no rewards exist, create a new record
        const { data: newRewards, error: insertError } = await supabase
          .from('user_rewards')
          .insert({ user_id: user.id, points: 0, badges: [] })
          .select()
          .maybeSingle();

        if (insertError) throw insertError;
        setUserRewards(newRewards);
      }
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      setUserRewards({ points: 0, badges: [] });
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user?.id,
          progress: { current: 0 }
        });

      if (error) throw error;
      await fetchChallenges();
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  const quitChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', user?.id);

      if (error) throw error;
      await fetchChallenges();
    } catch (error) {
      console.error('Error quitting challenge:', error);
    }
  };

  const triggerConfetti = () => {
    // First burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Second burst after a small delay
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 200);
  };

  const updateProgress = async (challengeId: string, newProgress: number) => {
    try {
      if (updatingProgress) return;
      setUpdatingProgress(challengeId);

      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return;

      const isCompleting = newProgress >= challenge.requirements.target;

      // Update progress first
      const { error: updateError } = await supabase
        .from('challenge_participants')
        .update({
          progress: { current: newProgress },
          completed: isCompleting,
          completion_date: isCompleting ? new Date().toISOString() : null
        })
        .eq('challenge_id', challengeId)
        .eq('user_id', user?.id);

      if (updateError) throw updateError;

      // If completing the challenge, update rewards and trigger confetti
      if (isCompleting) {
        const { data: currentRewards } = await supabase
          .from('user_rewards')
          .select('points, badges')
          .eq('user_id', user?.id)
          .maybeSingle();

        if (currentRewards) {
          const { error: rewardError } = await supabase
            .from('user_rewards')
            .update({
              points: currentRewards.points + challenge.points,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user?.id);

          if (rewardError) throw rewardError;
        }

        // Trigger confetti animation
        triggerConfetti();
      }

      // Refresh data
      await Promise.all([
        fetchChallenges(),
        fetchUserRewards()
      ]);
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setUpdatingProgress(null);
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesType = activeFilter === 'all' || challenge.type === activeFilter;
    const matchesDifficulty = difficultyFilter === 'all' || challenge.difficulty === difficultyFilter;
    return matchesType && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-500 bg-green-100 dark:bg-green-900/20';
      case 'intermediate':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      case 'advanced':
        return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <Calendar className="h-6 w-6" />;
      case 'weekly':
        return <Target className="h-6 w-6" />;
      case 'streak':
        return <Flame className="h-6 w-6" />;
      case 'goal':
        return <Trophy className="h-6 w-6" />;
      default:
        return <Dumbbell className="h-6 w-6" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className={`h-8 w-8 animate-spin ${colorTheme.primaryText}`} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Rewards Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Workout Challenges
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Complete challenges, earn points, unlock rewards
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Points</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {userRewards?.points || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Badges</p>
                <p className="text-2xl font-bold text-purple-500">
                  {userRewards?.badges?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-wrap gap-2">
              {['all', 'daily', 'weekly', 'streak', 'goal'].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type as any)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                    activeFilter === type
                      ? `${colorTheme.primaryBg} text-white`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setDifficultyFilter(difficulty as any)}
                  className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                    difficultyFilter === difficulty
                      ? `${colorTheme.primaryBg} text-white`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <motion.div
              key={challenge.id}
              layout="position"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getDifficultyColor(challenge.difficulty)}`}>
                      {getChallengeIcon(challenge.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {challenge.title}
                      </h3>
                      <span className={`text-sm font-medium px-3 py-0.5 rounded-full capitalize ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-yellow-500 mr-1" />
                    <span className="font-medium dark:text-gray-200">{challenge.points}</span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {challenge.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Users className="h-4 w-4 mr-1" />
                    {challenge.participants_count} participants
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(challenge.end_date).toLocaleDateString()}
                  </div>
                </div>

                {challenge.user_progress ? (
                  <div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-300">Progress</span>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {challenge.user_progress.progress.current} / {challenge.requirements.target} {challenge.requirements.metric}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (challenge.user_progress.progress.current / challenge.requirements.target) * 100,
                              100
                            )}%`
                          }}
                        />
                      </div>
                    </div>

                    {!challenge.user_progress.completed && (
                      <div className="flex items-center gap-x-2">
                        <button
                          onClick={() =>
                            updateProgress(
                              challenge.id,
                              challenge.user_progress!.progress.current + 1
                            )
                          }
                          disabled={updatingProgress === challenge.id}
                          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {updatingProgress === challenge.id ? (
                            <>
                              <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                              Updating...
                            </>
                          ) : (
                            'Log Progress'
                          )}
                        </button>

                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to quit this challenge?")) {
                              quitChallenge(challenge.id);
                            }
                          }}
                          disabled={updatingProgress === challenge.id}
                          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Quit Challenge
                        </button>
                      </div>
                    )}

                    {challenge.user_progress.completed && (
                      <div className="flex items-center justify-center p-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
                        <Trophy className="h-5 w-5 mr-2" />
                        Challenge Completed!
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => joinChallenge(challenge.id)}
                    className={`w-full px-4 py-2 ${colorTheme.primaryBg} text-white rounded-lg hover:${colorTheme.primaryBg} transition-colors`}
                  >
                    Join Challenge
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setExpandedChallenge(
                      expandedChallenge === challenge.id ? null : challenge.id
                    );
                  }}
                  className="w-full mt-4 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {expandedChallenge === challenge.id ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>

                {expandedChallenge === challenge.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 overflow-hidden">
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                        Challenge Details
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <li>
                          <strong>Type:</strong> {challenge.type}
                        </li>
                        <li>
                          <strong>Target:</strong> {challenge.requirements.target} {challenge.requirements.metric}
                        </li>
                        {challenge.requirements.timeframe && (
                          <li>
                            <strong>Timeframe:</strong> {challenge.requirements.timeframe}
                          </li>
                        )}
                        <li>
                          <strong>Start Date:</strong> {new Date(challenge.start_date).toLocaleDateString()}
                        </li>
                        <li>
                          <strong>End Date:</strong> {new Date(challenge.end_date).toLocaleDateString()}
                        </li>
                      </ul>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No Challenges Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your filters or check back later for new challenges.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenges;