import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Info, ChevronLeft, ChevronRight, LogIn } from 'lucide-react';
import OGAdsLocker from '../components/OGAdsLocker';
import { useOGAdsStore } from '../store/ogAdsStore';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/auth/AuthModal';

interface Question {
  id: number;
  question: string;
  type: 'select' | 'number' | 'radio';
  options?: string[];
  unit?: string;
  min?: number;
  max?: number;
  required?: boolean;
  info?: string;
}

const questions: Question[] = [
  {
    id: 1,
    question: 'What is your age?',
    type: 'number',
    min: 12,
    max: 100,
    required: true
  },
  {
    id: 2,
    question: 'What is your gender?',
    type: 'select',
    options: ['Male', 'Female'],
    required: true
  },
  {
    id: 3,
    question: 'What is your current weight?',
    type: 'number',
    unit: 'kg',
    min: 30,
    max: 300,
    required: true
  },
  {
    id: 4,
    question: 'What is your height?',
    type: 'number',
    unit: 'cm',
    min: 100,
    max: 250,
    required: true
  },
  {
    id: 5,
    question: 'What is your target weight?',
    type: 'number',
    unit: 'kg',
    min: 30,
    max: 300,
    required: true
  },
  {
    id: 6,
    question: 'How would you describe your activity level?',
    type: 'radio',
    options: [
      'Sedentary (little or no exercise)',
      'Lightly active (light exercise/sports 1-3 days/week)',
      'Moderately active (moderate exercise/sports 3-5 days/week)',
      'Very active (hard exercise/sports 6-7 days/week)',
      'Extra active (very hard exercise/sports & physical job)'
    ],
    required: true,
    info: 'Your activity level helps us determine your daily caloric needs'
  },
  {
    id: 7,
    question: 'Do you have any dietary restrictions?',
    type: 'select',
    options: [
      'None',
      'Vegetarian',
      'Vegan',
      'Gluten-free',
      'Lactose intolerant',
      'Keto',
      'Other'
    ],
    required: true
  },
  {
    id: 8,
    question: 'What is your primary goal?',
    type: 'radio',
    options: [
      'Lose weight',
      'Build muscle',
      'Maintain weight',
      'Improve overall health',
      'Increase energy levels'
    ],
    required: true
  },
  {
    id: 9,
    question: 'How many meals do you prefer per day?',
    type: 'select',
    options: ['3 meals', '4 meals', '5 meals', '6 meals'],
    required: true
  },
  {
    id: 10,
    question: 'Do you have any health conditions?',
    type: 'select',
    options: [
      'None',
      'Diabetes',
      'High blood pressure',
      'Heart disease',
      'Thyroid issues',
      'Other'
    ],
    required: true,
    info: 'This helps us customize your plan safely'
  },
  {
    id: 11,
    question: 'How much time can you dedicate to exercise per day?',
    type: 'select',
    options: [
      'Less than 30 minutes',
      '30-45 minutes',
      '45-60 minutes',
      'More than 60 minutes'
    ],
    required: true
  },
  {
    id: 12,
    question: 'What type of exercises do you prefer?',
    type: 'radio',
    options: [
      'Cardio (running, cycling, swimming)',
      'Strength training',
      'High-Intensity Interval Training (HIIT)',
      'Low-impact exercises (yoga, pilates)',
      'Mix of different exercises'
    ],
    required: true
  }
];

const Quiz: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string | number }>({});
  const [errors, setErrors] = useState<{ [key: number]: string }>({});
  const [completed, setCompleted] = useState(false);
  const [showLocker, setShowLocker] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  const { isLocked, setLocked } = useOGAdsStore();
  const { user } = useAuth();

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = value === '' ? '' : Number(value);
    
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: numValue }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[currentQuestion.id];
      return newErrors;
    });
  };

  const validateAnswer = (questionId: number, value: string | number): string | null => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return null;

    if (question.required && (value === '' || value === null || value === undefined)) {
      return 'This field is required';
    }

    if (question.type === 'number' && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue)) return 'Please enter a valid number';
      if (question.min !== undefined && numValue < question.min) return `Value must be at least ${question.min}`;
      if (question.max !== undefined && numValue > question.max) return `Value cannot exceed ${question.max}`;
    }

    return null;
  };

  const handleAnswer = (value: string | number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[currentQuestion.id];
      return newErrors;
    });
  };

  const handleNext = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const error = validateAnswer(currentQuestion.id, answers[currentQuestion.id] || '');
    if (error) {
      setErrors(prev => ({ ...prev, [currentQuestion.id]: error }));
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCompleted(true);
      if (isLocked) {
        setShowLocker(true);
      } else {
        calculateAndNavigate();
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateAndNavigate = () => {
    const weight = Number(answers[3]);
    const height = Number(answers[4]) / 100;
    const bmi = weight / (height * height);
    
    const age = Number(answers[1]);
    const gender = answers[2] as string;
    const activityLevel = answers[6] as string;
    
    let bmr;
    if (gender === 'Male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height * 100) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height * 100) - (4.330 * age);
    }

    let activityMultiplier;
    switch (activityLevel) {
      case 'Sedentary': activityMultiplier = 1.2; break;
      case 'Lightly active': activityMultiplier = 1.375; break;
      case 'Moderately active': activityMultiplier = 1.55; break;
      case 'Very active': activityMultiplier = 1.725; break;
      case 'Extra active': activityMultiplier = 1.9; break;
      default: activityMultiplier = 1.2;
    }

    const tdee = bmr * activityMultiplier;

    localStorage.setItem('healthProfile', JSON.stringify({
      answers,
      calculations: {
        bmi,
        bmr,
        tdee
      }
    }));

    setLocked(false);
    navigate('/dashboard');
  };

  const handleLockerComplete = () => {
    setShowLocker(false);
    calculateAndNavigate();
  };

  const renderQuestion = () => {
    const error = errors[currentQuestion.id];

    return (
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
      >
        <div className="flex items-start justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {currentQuestion.question}
          </h2>
          {currentQuestion.info && (
            <div className="group relative">
              <Info className="h-5 w-5 text-gray-400 cursor-help" />
              <div className="absolute right-0 w-64 p-3 bg-gray-800 text-white text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {currentQuestion.info}
              </div>
            </div>
          )}
        </div>

        {currentQuestion.type === 'select' && (
          <div className="space-y-3">
            <select
              className={`w-full p-4 text-lg border rounded-xl bg-white dark:bg-gray-700 dark:text-gray-200 ${
                error 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              value={answers[currentQuestion.id] as string || ''}
              onChange={(e) => handleAnswer(e.target.value)}
            >
              <option value="">Select an option</option>
              {currentQuestion.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {currentQuestion.type === 'number' && (
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className={`w-full p-4 text-lg text-center font-semibold border rounded-xl bg-white dark:bg-gray-700 dark:text-gray-200 ${
                error 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              value={answers[currentQuestion.id] || ''}
              onChange={handleNumberInput}
              placeholder="Enter a number"
            />
            {currentQuestion.unit && (
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                {currentQuestion.unit}
              </span>
            )}
            <div className="mt-2 flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Min: {currentQuestion.min}</span>
              <span>Max: {currentQuestion.max}</span>
            </div>
          </div>
        )}

        {currentQuestion.type === 'radio' && (
          <div className="space-y-3">
            {currentQuestion.options?.map((option) => (
              <button
                key={option}
                className={`w-full p-4 text-left rounded-xl border transition-all duration-300 ${
                  answers[currentQuestion.id] === option
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => handleAnswer(option)}
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 ${
                    answers[currentQuestion.id] === option 
                      ? 'border-green-500 bg-green-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } flex items-center justify-center mr-3`}>
                    {answers[currentQuestion.id] === option && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <span className="text-lg">{option}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-500 dark:text-red-400">{error}</p>
        )}
      </motion.div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center"
            >
              <LogIn className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Sign In to Take the Quiz
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                To get your personalized diet and exercise plan, please sign in or create an account. It's completely free!
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-colors inline-flex items-center"
              >
                Sign In to Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </motion.div>
          </div>
        </div>
        <AnimatePresence>
          {showAuthModal && (
            <AuthModal
              isOpen={showAuthModal}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {showLocker && (
              <OGAdsLocker onComplete={handleLockerComplete} />
            )}
            
            {!completed ? (
              <>
                <div className="mb-8 text-center">
                  <motion.h1 
                    className="text-4xl font-bold text-gray-800 dark:text-white mb-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    Create Your Personalized Plan
                  </motion.h1>
                  <motion.p 
                    className="text-lg text-gray-600 dark:text-gray-300"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </motion.p>
                </div>

                <motion.div 
                  className="mb-8 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div 
                    className="h-full bg-green-500"
                    initial={{ width: `${progress}%` }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>

                {renderQuestion()}

                <div className="flex justify-between mt-8">
                  <button
                    onClick={handlePrevious}
                    className={`flex items-center px-6 py-3 rounded-xl transition-colors ${
                      currentQuestionIndex === 0
                        ? 'opacity-0 cursor-default'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Previous
                  </button>

                  <button
                    onClick={handleNext}
                    className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-colors ${
                      answers[currentQuestion.id] === undefined || answers[currentQuestion.id] === ''
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                    disabled={answers[currentQuestion.id] === undefined || answers[currentQuestion.id] === ''}
                  >
                    {currentQuestionIndex < questions.length - 1 ? (
                      <>
                        Next
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </>
                    ) : (
                      <>
                        Get Your Plan
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : !showLocker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  Creating Your Personalized Plan
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  We're analyzing your responses to create a customized diet and exercise plan that fits your goals and lifestyle.
                </p>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Quiz;