import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Loader } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePlatform } from '../contexts/PlatformContext';
import { supabase } from '../lib/supabase';
import { useColorTheme } from '../utils/colorUtils';

interface QuizResult {
  id: string;
  created_at: string;
  answers: {
    [key: number]: string | number;
  };
  calculations: {
    bmi: number;
    bmr: number;
    tdee: number;
  };
}

const QuizHistory: React.FC = () => {
  const { user } = useAuth();
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const platform = usePlatform();
  const colorTheme = useColorTheme(platform.settings?.theme_color);

  useEffect(() => {
    const fetchQuizResults = async () => {
      try {
        if (!user) return;

        const { data, error } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setQuizResults(data || []);
      } catch (error) {
        console.error('Error fetching quiz results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizResults();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Quiz History</h1>
            <Link
              to="/quiz"
              className={`inline-flex items-center px-4 py-2 ${colorTheme.primaryBg} text-white rounded-lg hover:${colorTheme.primaryBg} transition-colors`}
            >
              Take New Quiz
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {quizResults.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center"
            >
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                No Quiz Results Yet
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Take your first quiz to get personalized diet and exercise recommendations.
              </p>
              <Link
                to="/quiz"
                className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Start Quiz
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {quizResults.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(result.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">BMI</div>
                        <div className="text-xl font-semibold text-gray-800 dark:text-white">
                          {result.calculations.bmi?.toFixed(1)}
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">BMR</div>
                        <div className="text-xl font-semibold text-gray-800 dark:text-white">
                          {Math.round(result.calculations.bmr)} kcal
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">TDEE</div>
                        <div className="text-xl font-semibold text-gray-800 dark:text-white">
                          {Math.round(result.calculations.tdee)} kcal
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Link
                        to={`/quiz-result/${result.id}`}
                        className={`inline-flex items-center ${colorTheme.primaryText} hover:${colorTheme.primaryText}`}
                      >
                        View Details
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizHistory;