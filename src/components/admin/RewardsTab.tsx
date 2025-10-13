import { Edit, Loader, Search, Star } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Reward, useRewardsQuery } from "../../hooks/Queries/useRewards";
import { ColorTheme } from "../../utils/colorUtils";
import RewardForm from "./RewardForm";

interface RewardsTabProps {
  colorTheme: ColorTheme;
}

const RewardsTab: React.FC<RewardsTabProps> = ({ colorTheme }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [showForm, setShowForm] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const { data: rewards = [], isLoading } = useRewardsQuery();

  const handleEditReward = (reward: Reward) => {
    setSelectedReward(reward);
    setShowForm(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredRewards = useMemo(() => {
    const s = debouncedSearch.toLowerCase();
    return rewards.filter(
      (reward) =>
        reward.user?.username?.toLowerCase().includes(s) ||
        reward.user?.full_name?.toLowerCase().includes(s) ||
        reward.user?.email.toLowerCase().includes(s)
    );
  }, [rewards, debouncedSearch]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className={`h-8 w-8 animate-spin ${colorTheme.primaryText}`} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">
          Rewards Management
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map((reward) => (
          <div
            key={reward.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                  {reward.user?.username?.[0]?.toUpperCase() ||
                    reward.user.email[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium dark:text-white">
                    {reward.user?.username}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300">
                    {reward.user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleEditReward(reward)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Edit className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Star className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-700 dark:text-green-300">
                  {reward.points} Points
                </span>
              </div>

              {reward.badges && reward.badges.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Badges Earned
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {reward.badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-full"
                      >
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                          {badge.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && selectedReward && (
        <RewardForm
          userId={selectedReward.user_id}
          reward={selectedReward}
          onClose={() => {
            setShowForm(false);
            setSelectedReward(null);
          }}
        />
      )}
    </div>
  );
};

export default RewardsTab;
