export default function ChallengeFilters({
  activeFilter,
  setActiveFilter,
  difficultyFilter,
  setDifficultyFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
}: {
  activeFilter: string;
  setActiveFilter: (v: string) => void;
  difficultyFilter: string;
  setDifficultyFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
}) {
  return (
    <div className="bg-background rounded-lg shadow-xl border border-border p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-w-[140px]"
          >
            <option value="all">All Types</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="goal">Goal</option>
            <option value="streak">Streak</option>
          </select>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-w-[160px]"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
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
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer duration-200 ${
                statusFilter === status.value
                  ? "bg-primary text-white shadow-lg scale-105"
                  : "bg-card hover:bg-card/80 text-foreground"
              }`}
            >
              <span className="hidden sm:inline">{status.icon} </span>
              {status.label}
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary lg:min-w-[180px]"
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
  );
}
