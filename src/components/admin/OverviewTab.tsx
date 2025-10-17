
import { useDashboardQuery } from "@/hooks/Queries/useDashboard";
import type { ColorTheme } from "@/utils/colorUtils";
import Chart from "chart.js/auto";
import { Award, Loader, Star, TrendingUp, Users } from "lucide-react";
import React, { useEffect, useRef } from "react";
import ChartCard from "../helpers/ChartCard";
import StatCard from "../helpers/StatCard";

interface OverviewTabProps {
  colorTheme: ColorTheme;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ colorTheme }) => {
  const participationChartRef = useRef<HTMLCanvasElement>(null);
  const completionChartRef = useRef<HTMLCanvasElement>(null);

  const { data: stats, isLoading } = useDashboardQuery();

  useEffect(() => {
    if (!stats) return;
    if (stats && participationChartRef.current && completionChartRef.current) {
      const participationCtx = participationChartRef.current.getContext("2d");
      const completionCtx = completionChartRef.current.getContext("2d");

      if (participationCtx && completionCtx) {
        // Destroy existing charts if they exist
        Chart.getChart(participationChartRef.current)?.destroy();
        Chart.getChart(completionChartRef.current)?.destroy();

        // User Activity Line Chart
        new Chart(participationCtx, {
          type: "line",
          data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [
              {
                label: "Daily Active Users",
                data: stats.dailyActiveUsers,
                borderColor: "#10B981",
                tension: 0.4,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: { legend: { position: "bottom" } },
          },
        });

        // Challenge Completion Doughnut Chart
        new Chart(completionCtx, {
          type: "doughnut",
          data: {
            labels: ["Completed", "In Progress"],
            datasets: [
              {
                data: [stats.completionRate, 100 - stats.completionRate],
                backgroundColor: ["#10B981", "#E5E7EB"],
              },
            ],
          },
          options: {
            responsive: true,
            plugins: { legend: { position: "bottom" } },
          },
        });
      }
    }
  }, [stats]);

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className={`h-8 w-8 animate-spin ${colorTheme.primaryText}`} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="h-8 w-8 text-green-500" />}
          label="Total Participants"
          value={stats.totalParticipants}
        />
        <StatCard
          icon={<TrendingUp className="h-8 w-8 text-blue-500" />}
          label="Active Users"
          value={stats.activeUsers}
        />
        <StatCard
          icon={<Award className="h-8 w-8 text-purple-500" />}
          label="Points Awarded"
          value={stats.pointsAwarded}
        />
        <StatCard
          icon={<Star className="h-8 w-8 text-yellow-500" />}
          label="Badges Earned"
          value={stats.badgesEarned}
        />
      </div>

      {/* Charts */}
      <div className="flex items-start justify-around rounded-xl shadow-md bg-card gap-4">
        <ChartCard
          title="User Activity"
          canvasRef={participationChartRef}
          className="w-full sm:w-1/2"
        />
        <ChartCard
          title="Challenge Completion"
          canvasRef={completionChartRef}
          className="w-full sm:w-1/4"
        />
      </div>
    </div>
  );
};

export default OverviewTab;
