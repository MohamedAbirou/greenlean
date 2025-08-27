import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
}

interface RewardFormProps {
  userId: string;
  reward?: Reward;
  onClose: () => void;
  onSubmit: () => void;
}

const RewardForm: React.FC<RewardFormProps> = ({ userId, reward, onClose, onSubmit }) => {
  const [points, setPoints] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (reward) {
      setPoints(reward.points);
    }
  }, [reward]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('user_rewards')
        .update({ points })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error updating rewards:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold dark:text-white">Edit Rewards</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Points
            </label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value))}
              min="0"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RewardForm;