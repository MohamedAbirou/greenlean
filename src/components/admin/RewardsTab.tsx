import { useRewardsQuery, type Reward } from "@/hooks/Queries/useRewards";
import type { ColorTheme } from "@/utils/colorUtils";
import { Edit, Loader, Search, Star } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Input } from "../ui/input";
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
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">
          Rewards Management
        </h2>
        <div className="relative w-full sm:w-fit">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/80" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border border-border rounded-lg bg-card text-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map((reward) => (
          <div key={reward.id} className="bg-card rounded-xl shadow-md p-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                  {reward.user?.username?.[0]?.toUpperCase() ||
                    reward.user.email[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    {reward.user?.username}
                  </h3>
                  <p className="text-sm text-foreground/80">
                    {reward.user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleEditReward(reward)}
                className="p-2 hover:bg-background rounded-lg cursor-pointer"
              >
                <Edit className="h-5 w-5 text-foreground/80" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-primary/30 rounded-lg">
                <Star className="h-5 w-5 text-primary" />
                <span className="font-medium text-primary">
                  {reward.points} Points
                </span>
              </div>

              {reward.badges && reward.badges.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">
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

      <RewardForm
        userId={selectedReward?.user_id}
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
        }}
        reward={selectedReward}
      />
    </div>
  );
};

export default RewardsTab;
