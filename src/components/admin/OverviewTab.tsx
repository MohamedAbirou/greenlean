import Chart from 'chart.js/auto';
import { Award, Star, TrendingUp, Users } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { StatCard, ChartCard } from "../helpers"

interface DashboardStats {
  totalParticipants: number;
  activeUsers: number;
  completionRate: number;
  averageStreak: number;
  pointsAwarded: number;
  badgesEarned: number;
  dailyActiveUsers: number[];
}

const OverviewTab: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const participationChartRef = useRef<HTMLCanvasElement>(null);
  const completionChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, [timeRange]);

  const fetchDashboardStats = async () => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // last 7 days

      // Fetch all data in parallel
      const [
        totalParticipantsResp,
        activeUsersResp,
        completedChallengesResp,
        streaksResp,
        rewardsResp,
        participantsData
      ] = await Promise.all([
        supabase.from('challenge_participants').select('*', { count: 'exact' }),
        supabase.from('challenge_participants').select('*', { count: 'exact' }).gte('created_at', sevenDaysAgo.toISOString()),
        supabase.from('challenge_participants').select('*', { count: 'exact' }).eq('completed', true),
        supabase.from('challenge_participants').select('streak_count'),
        supabase.from('user_rewards').select('points, badges'),
        supabase.from('challenge_participants').select('created_at')
      ]);

      const totalParticipants = totalParticipantsResp.count || 0;
      const activeUsers = activeUsersResp.count || 0;
      const completedChallenges = completedChallengesResp.count || 0;
      const streaks = streaksResp.data || [];
      const rewards = rewardsResp.data || [];
      const participants = participantsData.data || [];

      // Calculate other stats
      const completionRate = totalParticipants ? (completedChallenges / totalParticipants) * 100 : 0;
      const averageStreak = streaks.reduce((acc, curr) => acc + curr.streak_count, 0) / (streaks.length || 1);
      const pointsAwarded = rewards.reduce((acc, curr) => acc + curr.points, 0);
      const badgesEarned = rewards.reduce((acc, curr) => {
        const badges = Array.isArray(curr.badges) ? curr.badges : [];
        return acc + badges.length;
      }, 0);

      // Calculate daily active users for the chart
      const counts: Record<string, number> = {};
      participants.forEach((row) => {
        const day = new Date(row.created_at).toLocaleDateString('en-US', { weekday: 'short' });
        counts[day] = (counts[day] || 0) + 1;
      });
      const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      const dailyActiveUsers = days.map((day) => counts[day] || 0);

      setStats({
        totalParticipants,
        activeUsers,
        completionRate,
        averageStreak,
        pointsAwarded,
        badgesEarned,
        dailyActiveUsers
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    if (stats && participationChartRef.current && completionChartRef.current) {
      const participationCtx = participationChartRef.current.getContext('2d');
      const completionCtx = completionChartRef.current.getContext('2d');

      if (participationCtx && completionCtx) {
        // Destroy existing charts if they exist
        Chart.getChart(participationChartRef.current)?.destroy();
        Chart.getChart(completionChartRef.current)?.destroy();

        // User Activity Line Chart
        new Chart(participationCtx, {
          type: 'line',
          data: {
            labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
            datasets: [{
              label: 'Daily Active Users',
              data: stats.dailyActiveUsers,
              borderColor: '#10B981',
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
          }
        });

        // Challenge Completion Doughnut Chart
        new Chart(completionCtx, {
          type: 'doughnut',
          data: {
            labels: ['Completed', 'In Progress'],
            datasets: [{
              data: [stats.completionRate, 100 - stats.completionRate],
              backgroundColor: ['#10B981', '#E5E7EB']
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
          }
        });
      }
    }
  }, [stats]);

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Users className="h-8 w-8 text-green-500" />} label="Total Participants" value={stats.totalParticipants} />
        <StatCard icon={<TrendingUp className="h-8 w-8 text-blue-500" />} label="Active Users" value={stats.activeUsers} />
        <StatCard icon={<Award className="h-8 w-8 text-purple-500" />} label="Points Awarded" value={stats.pointsAwarded} />
        <StatCard icon={<Star className="h-8 w-8 text-yellow-500" />} label="Badges Earned" value={stats.badgesEarned} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="User Activity" canvasRef={participationChartRef} />
        <ChartCard title="Challenge Completion" canvasRef={completionChartRef} />
      </div>
    </div>
  );
};

export default OverviewTab;
