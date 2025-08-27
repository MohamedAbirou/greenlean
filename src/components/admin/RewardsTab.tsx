import React, { useState, useEffect } from "react";
import { Star, Edit, Search } from "lucide-react";
import { supabase } from "../../lib/supabase";
import RewardForm from "./RewardForm";

interface Reward {
  id: string;
  user_id: string;
  points: number;
  badges: {
    id: string;
    name: string;
    icon: string;
    earned_at: string;
  }[];
  user: {
    username?: string;
    full_name: string;
    email: string;
  };
}

const RewardsTab: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const { data, error } = await supabase.from("user_rewards").select(`
          *,
          user:profiles(username, full_name, email)
        `);

      if (error) throw error;
      setRewards(data);
    } catch (error) {
      console.error("Error fetching rewards:", error);
    }
  };

  const handleEditReward = (reward: Reward) => {
    setSelectedReward(reward);
    setShowForm(true);
  };

  const filteredRewards = rewards.filter((reward) => {
    const searchString = searchTerm.toLowerCase();
    return (
      reward.user?.username?.toLowerCase().includes(searchString) ||
      reward.user?.full_name?.toLowerCase().includes(searchString) ||
      reward.user?.email.toLowerCase().includes(searchString)
    );
  });

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
          onSubmit={fetchRewards}
        />
      )}
    </div>
  );
};

export default RewardsTab;
