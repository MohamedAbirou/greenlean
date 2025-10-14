/**
 * Meal Feedback Component
 * 
 * Allows users to provide feedback on their meals including:
 * - Overall rating (1-5 stars)
 * - Like/dislike
 * - Satiety score
 * - Goal progress score
 * - Text feedback
 * - Consumption tracking
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/useAuth';
import { useMealFeedback } from '../hooks/useMealPlanV2';
import { MealFeedback as MealFeedbackType } from '../types/mealGeneration';

interface MealFeedbackProps {
  mealId: string;
  mealName: string;
  templateName?: string;
  onFeedbackSubmitted?: () => void;
  onClose?: () => void;
}

const MealFeedback: React.FC<MealFeedbackProps> = ({
  mealId,
  mealName,
  templateName,
  onFeedbackSubmitted,
  onClose
}) => {
  const { user } = useAuth();
  const { submitFeedback, submitting, error } = useMealFeedback();
  const [rating, setRating] = useState<number | null>(null);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [satietyScore, setSatietyScore] = useState<number | null>(null);
  const [goalProgressScore, setGoalProgressScore] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [consumed, setConsumed] = useState(false);
  const [consumedDate, setConsumedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating && liked === null && satietyScore === null && goalProgressScore === null) {
      alert('Please provide at least one type of feedback');
      return;
    }

    if (!user) {
      alert('Please sign in to submit feedback');
      return;
    }

    const feedback: MealFeedbackType = {
      userId: user.id,
      mealId,
      mealName,
      templateName,
      rating: rating || undefined,
      liked: liked || undefined,
      satietyScore: satietyScore || undefined,
      goalProgressScore: goalProgressScore || undefined,
      feedbackText: feedbackText.trim() || undefined,
      consumed,
      consumedDate: consumed ? consumedDate : undefined
    };

    try {
      await submitFeedback(feedback);
      onFeedbackSubmitted?.();
      onClose?.();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const StarRating: React.FC<{ value: number; onChange: (value: number) => void }> = ({ value, onChange }) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl ${
            star <= value ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400 transition-colors`}
        >
          ★
        </button>
      ))}
    </div>
  );

  const ScoreSlider: React.FC<{
    value: number | null;
    onChange: (value: number) => void;
    label: string;
    min: number;
    max: number;
  }> = ({ value, onChange, label, min, max }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}: {value || 'Not rated'}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value || min}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Rate Your Meal</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-800">{mealName}</h3>
          {templateName && (
            <p className="text-sm text-gray-600">Template: {templateName}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating
            </label>
            <StarRating value={rating || 0} onChange={setRating} />
          </div>

          {/* Like/Dislike */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Did you like this meal?
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setLiked(true)}
                className={`px-4 py-2 rounded-lg border ${
                  liked === true
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                👍 Yes
              </button>
              <button
                type="button"
                onClick={() => setLiked(false)}
                className={`px-4 py-2 rounded-lg border ${
                  liked === false
                    ? 'bg-red-100 border-red-500 text-red-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                👎 No
              </button>
            </div>
          </div>

          {/* Satiety Score */}
          <ScoreSlider
            value={satietyScore}
            onChange={setSatietyScore}
            label="How satisfied were you after eating?"
            min={1}
            max={5}
          />

          {/* Goal Progress Score */}
          <ScoreSlider
            value={goalProgressScore}
            onChange={setGoalProgressScore}
            label="How well does this meal support your goals?"
            min={1}
            max={5}
          />

          {/* Consumption Tracking */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={consumed}
                onChange={(e) => setConsumed(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                I consumed this meal
              </span>
            </label>
            {consumed && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date consumed:
                </label>
                <input
                  type="date"
                  value={consumedDate}
                  onChange={(e) => setConsumedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Text Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share any additional thoughts about this meal..."
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealFeedback;
