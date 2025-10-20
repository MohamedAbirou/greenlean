import { usePlatform } from '@/contexts/PlatformContext';
import { dietPlans } from '@/data/dietPlans';
import { useColorTheme } from '@/utils/colorUtils';
import { Award, BarChart3, Clock, Leaf } from 'lucide-react';
import React from 'react';
import { useParams } from 'react-router-dom';

const DietPlanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const plan = id ? dietPlans.find((p) => p.id === Number(id)) : null;

  const platform = usePlatform();
    const colorTheme = useColorTheme(platform.settings?.theme_color);

  if (!plan) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Diet Plan Not Found</h2>
            <p className="mt-4 text-lg text-secondary-foreground">The requested diet plan could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  const calculateMealTotals = (meals: typeof plan.mealPlan.breakfast) => {
    return meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fats: acc.fats + meal.fats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  };

  return (
    <div className="min-h-screen pt-24 bg-background pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-background rounded-lg shadow-xl overflow-hidden">
          {/* Hero Section */}
          <div className="relative h-96">
            <img
              src={plan.image}
              alt={plan.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <h1 className="text-4xl font-bold text-white text-center">{plan.name}</h1>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 bg-card">
            <p className="text-xl text-foreground/80 mb-8">{plan.description}</p>
            
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="flex items-center space-x-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-foreground/70">Duration</p>
                  <p className="font-semibold text-foreground">{plan.duration}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm text-foreground/70">Daily Calories</p>
                  <p className="font-semibold text-foreground">{plan.calories}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Award className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-sm text-foreground/70">Difficulty</p>
                  <p className="font-semibold text-foreground">{plan.difficulty}</p>
                </div>
              </div>
            </div>

            {/* Meal Plan Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">Detailed Meal Plan</h2>
              <div className="space-y-8">
                {Object.entries(plan.mealPlan).map(([mealTime, meals]) => {
                  const totals = calculateMealTotals(meals);
                  return (
                    <div key={mealTime} className="bg-background rounded-lg p-3">
                      <h3 className="text-xl font-semibold text-foreground mb-4 capitalize">
                        {mealTime} - {totals.calories} calories
                      </h3>
                      <div className="space-y-4">
                        {meals.map((meal, index) => (
                          <div key={index} className="bg-background rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-foreground">{meal.item}</h4>
                              <span className="text-sm text-foreground/70">{meal.calories} cal</span>
                            </div>
                            <p className="text-sm text-secondary-foreground mb-2">Portion: {meal.portion}</p>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-green-500 font-medium">{meal.protein}g</span>
                                <span className="text-foreground/70 ml-1">protein</span>
                              </div>
                              <div>
                                <span className="text-blue-500 font-medium">{meal.carbs}g</span>
                                <span className="text-foreground/70 ml-1">carbs</span>
                              </div>
                              <div>
                                <span className="text-yellow-500 font-medium">{meal.fats}g</span>
                                <span className="text-foreground/70 ml-1">fats</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between flex-wrap text-sm">
                          <div>
                            <span className="text-foreground/70">Total:</span>
                            <span className="font-medium text-foreground ml-2">{totals.calories} cal</span>
                          </div>
                          <div>
                            <span className="text-green-500 font-medium">{totals.protein}g</span>
                            <span className="text-foreground/70 ml-1">protein</span>
                          </div>
                          <div>
                            <span className="text-blue-500 font-medium">{totals.carbs}g</span>
                            <span className="text-foreground/70 ml-1">carbs</span>
                          </div>
                          <div>
                            <span className="text-yellow-500 font-medium">{totals.fats}g</span>
                            <span className="text-foreground/70 ml-1">fats</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guidelines Section */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Guidelines</h2>
              <div className="bg-background p-3 rounded-lg">
                <ul className="space-y-4">
                  {plan.guidelines.map((guideline, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Leaf className={`w-5 h-5 ${colorTheme.primaryText} flex-shrink-0`} />
                      <span className="text-secondary-foreground">{guideline}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietPlanDetails;