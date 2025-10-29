import type { UserRewards } from "@/shared/types/challenge";
import { m } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { IconMap } from "../utils/progress";

export default function ChallengeHeader({ userRewards }: { userRewards: UserRewards }) {
  return (
    <m.div
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      viewport={{ once: true }}
      className="relative bg-challenges-base rounded-lg shadow-2xl border border-purple-200/50 dark:border-purple-700/50 p-8 overflow-hidden"
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
             <LucideIcons.Trophy className="h-10 w-10 text-white" />
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
              {userRewards?.badges.length === 0 && <p className="text-foreground">.....</p>}
              <div className="flex flex-wrap gap-2">
                {userRewards?.badges.map((badge, index) => {
                  const IconComponent = IconMap[badge.icon] || LucideIcons.Star;

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
                      <span className="max-w-[90px] truncate">{badge.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </m.div>
  );
}
