import React, { useState, useEffect, useRef } from 'react';
import { Users, TrendingUp, Award, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Chart from 'chart.js/auto';

interface DashboardStats {
  totalParticipants: number;
  activeUsers: number;
  completionRate: number;
  averageStreak: number;
  pointsAwarded: number;
  badgesEarned: number;
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
      const { count: totalParticipants } = await supabase
        .from('challenge_participants')
        .select('*', { count: 'exact' });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const { count: activeUsers } = await supabase
        .from('challenge_participants')
        .select('*', { count: 'exact' })
        .gte('created_at', sevenDaysAgo.toISOString());

      const { count: completedChallenges } = await supabase
        .from('challenge_participants')
        .select('*', { count: 'exact' })
        .eq('completed', true);

      const completionRate = totalParticipants 
        ? ((completedChallenges! / totalParticipants) * 100)
        : 0;

      const { data: streaks } = await supabase
        .from('challenge_participants')
        .select('streak_count');

      const averageStreak = streaks?.reduce((acc, curr) => acc + curr.streak_count, 0) || 0;

      const { data: rewards } = await supabase
        .from('user_rewards')
        .select('points, badges');

      const pointsAwarded = rewards?.reduce((acc, curr) => acc + curr.points, 0) || 0;

      const badgesEarned = rewards?.reduce((acc, curr) => {
        const badges = Array.isArray(curr.badges) ? curr.badges : [];
        return acc + badges.length;
      }, 0) || 0;

      setStats({
        totalParticipants: totalParticipants || 0,
        activeUsers: activeUsers || 0,
        completionRate,
        averageStreak: averageStreak / (streaks?.length || 1),
        pointsAwarded,
        badgesEarned
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

        // Create new charts
        new Chart(participationCtx, {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Daily Active Users',
              data: [65, 59, 80, 81, 56, 55, 40],
              borderColor: '#10B981',
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        });

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
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        });
      }
    }
  }, [stats]);

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Participants</p>
              <p className="text-2xl font-bold dark:text-white">{stats.totalParticipants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold dark:text-white">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4">
            <Award className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Points Awarded</p>
              <p className="text-2xl font-bold dark:text-white">{stats.pointsAwarded}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4">
            <Star className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Badges Earned</p>
              <p className="text-2xl font-bold dark:text-white">{stats.badgesEarned}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">User Activity</h3>
          <canvas ref={participationChartRef}></canvas>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Challenge Completion</h3>
          <canvas ref={completionChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;