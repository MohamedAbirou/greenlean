import AuthModal from "@/components/auth/AuthModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlatform } from "@/contexts/PlatformContext";
import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase";
import { useColorTheme } from "@/utils/colorUtils";
import { logFrontendError, logInfo } from "@/utils/errorLogger";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  LogIn,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import { convertQuizAnswersToUserProfile, calculateMacroTargets, MealGeneratorV2 } from "@/utils/mealGenerationV2";

interface Question {
  id: number;
  question: string;
  type: "select" | "number" | "radio";
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
    question: "How old are you?",
    type: "number",
    min: 12,
    max: 100,
    required: true,
  },
  {
    id: 2,
    question: "What is your gender?",
    type: "select",
    options: ["Male", "Female"],
    required: true,
  },
  {
    id: 3,
    question: "What is your current weight?",
    type: "number",
    unit: "kg",
    min: 30,
    max: 300,
    required: true,
  },
  {
    id: 4,
    question: "What is your height?",
    type: "number",
    unit: "cm",
    min: 100,
    max: 250,
    required: true,
  },
  {
    id: 5,
    question: "What is your target weight?",
    type: "number",
    unit: "kg",
    min: 30,
    max: 300,
    required: true,
  },
  {
    id: 6,
    question: "How active are you on a typical day?",
    type: "radio",
    options: [
      "Sedentary (little or no exercise)",
      "Lightly active (1–3 days/week of light exercise)",
      "Moderately active (3–5 days/week of moderate exercise)",
      "Very active (6–7 days/week of intense exercise)",
      "Extremely active (physical job + daily training)",
    ],
    required: true,
    info: "Your activity level helps us estimate your calorie needs",
  },
  {
    id: 7,
    question: "Do you follow a specific diet or have restrictions?",
    type: "select",
    options: [
      "None",
      "Vegetarian",
      "Vegan",
      "Pescatarian",
      "Keto",
      "Gluten-free",
      "Lactose intolerant",
      "omnivore",
      "Other",
    ],
    required: true,
  },
  {
    id: 8,
    question: "What is your main goal?",
    type: "radio",
    options: [
      "Lose fat",
      "Build muscle",
      "Maintain weight",
      "Improve health & wellbeing",
    ],
    required: true,
  },
  {
    id: 9,
    question: "How many meals do you prefer each day?",
    type: "select",
    options: [
      "2 (intermittent fasting)",
      "3 (standard)",
      "4 meals",
      "5 meals",
      "6 small meals",
    ],
    required: true,
  },
  {
    id: 13,
    question: "What is your favorite cuisine?",
    type: "select",
    options: [
      "Moroccan cuisine",
      "Chinese cuisine",
      "French cuisine",
      "Greek cuisine",
      "Italian cuisine",
      "Japanese cuisine",
      "Indian cuisine",
      "Mexican cuisine",
      "Turkish cuisine",
      "Thai cuisine",
      "Korean cuisine",
      "Middle Eastern cuisine",
      "Spanish cuisine",
      "other",
    ],
    required: true,
  },
  {
    id: 10,
    question: "Do you have any health conditions we should consider?",
    type: "select",
    options: [
      "None",
      "Diabetes",
      "High blood pressure",
      "Heart disease",
      "Thyroid issues",
      "Other",
    ],
    required: true,
    info: "This ensures your plan is safe and effective",
  },
  {
    id: 11,
    question: "How much time can you usually dedicate to exercise per day?",
    type: "select",
    options: ["Less than 30 minutes", "30–60 minutes", "More than 1 hour"],
    required: true,
  },
  {
    id: 12,
    question: "What type of exercise do you enjoy the most?",
    type: "radio",
    options: [
      "Cardio (running, cycling, swimming)",
      "Strength training",
      "High-Intensity Interval Training (HIIT)",
      "Low-impact (yoga, pilates)",
      "A mix (variety of workouts)",
    ],
    required: true,
  },
];

const Quiz: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string | number }>(
    {}
  );
  const [errors, setErrors] = useState<{ [key: number]: string }>({});
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const platform = usePlatform();
  const colorTheme = useColorTheme(platform.settings?.theme_color);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = value === "" ? "" : Number(value);

    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: numValue }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[currentQuestion.id];
      return newErrors;
    });
  };

  const validateAnswer = (
    questionId: number,
    value: string | number
  ): string | null => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return null;

    if (
      question.required &&
      (value === "" || value === null || value === undefined)
    ) {
      return "This field is required";
    }

    if (question.type === "number" && value !== "") {
      const numValue = Number(value);
      if (isNaN(numValue)) return "Please enter a valid number";
      if (question.min !== undefined && numValue < question.min)
        return `Value must be at least ${question.min}`;
      if (question.max !== undefined && numValue > question.max)
        return `Value cannot exceed ${question.max}`;
    }

    return null;
  };

  const handleAnswer = (value: string | number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[currentQuestion.id];
      return newErrors;
    });
  };

  const handleNext = () => {
    if (!user) {
      return;
    }

    const error = validateAnswer(
      currentQuestion.id,
      answers[currentQuestion.id] || ""
    );
    if (error) {
      setErrors((prev) => ({ ...prev, [currentQuestion.id]: error }));
      return;
    }

    // If not the last question, go to the next one
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Last question: show "Creating your plan..." UI
      setCompleted(true);

      // Optional: show the animation for 1.5-2 seconds before navigating
      setTimeout(() => {
        calculateAndNavigate();
      }, 3000); // 1.8 seconds
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateAndNavigate = async () => {
    const age = parseInt(answers[1] as string);
    const gender = answers[2] as string;
    const weight = parseFloat(answers[3] as string); // current weight in kg
    const height = parseFloat(answers[4] as string); // height in cm
    const goalWeight = parseFloat(answers[5] as string); // target weight in kg
    const activityLevel = answers[6] as string;
    const goal = answers[8] as string; // "Lose fat", "Build muscle", "Maintain weight", etc.

    // --- BMI ---
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    // --- BMR ---
    let bmr;
    if (gender === "Male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // --- TDEE ---
    let tdee;
    if (activityLevel.includes("Sedentary")) {
      tdee = bmr * 1.2;
    } else if (activityLevel.includes("Lightly active")) {
      tdee = bmr * 1.375;
    } else if (activityLevel.includes("Moderately active")) {
      tdee = bmr * 1.55;
    } else if (activityLevel.includes("Very active")) {
      tdee = bmr * 1.725;
    } else if (activityLevel.includes("Extremely active")) {
      tdee = bmr * 1.9;
    } else {
      tdee = bmr * 1.2; // Default to sedentary
    }

    // --- Goal Calories with Safety Limits ---
    let goalCalories = tdee;

    // Calculate safe minimum calories (never below BMR * 1.1 for safety)
    const safeMinimumCalories = Math.max(
      bmr * 1.1,
      gender === "Male" ? 1500 : 1200
    );
    const safeMaximumCalories = tdee + 500; // Maximum safe surplus

    if (goal === "Lose fat") {
      // Safe deficit: 15-25% below TDEE, but never below minimum
      const deficit = Math.min(500, tdee * 0.25);
      goalCalories = Math.max(tdee - deficit, safeMinimumCalories);
    } else if (goal === "Build muscle") {
      // Moderate surplus: 10-15% above TDEE for muscle building
      goalCalories = Math.min(tdee + 300, safeMaximumCalories);
    } else if (goal === "Maintain weight") {
      goalCalories = tdee; // No change
    } else if (goal === "Improve health & wellbeing") {
      // Slight deficit: 5-10% below TDEE
      const deficit = Math.min(200, tdee * 0.1);
      goalCalories = Math.max(tdee - deficit, safeMinimumCalories);
    }

    // Final safety check
    goalCalories = Math.max(
      safeMinimumCalories,
      Math.min(goalCalories, safeMaximumCalories)
    );
    goalCalories = Math.round(goalCalories);

    // --- Estimate Time to Reach Goal ---
    const weightDiff = goalWeight - weight; // negative if losing
    const caloriesPerKg = 7700; // ~7700 kcal = 1kg fat
    const weeklyChange = (goalCalories - tdee) * 7; // kcal/week
    let estimatedWeeks: number | null = null;

    if (weeklyChange !== 0) {
      estimatedWeeks = Math.abs((weightDiff * caloriesPerKg) / weeklyChange);
    }

    const calculations = {
      bmi: Math.round(bmi * 10) / 10,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      goalCalories: Math.round(goalCalories),
      goalWeight,
      estimatedWeeks: estimatedWeeks ? Math.round(estimatedWeeks) : null,
    };

    // Save to localStorage
    const healthProfile = { answers, calculations };
    localStorage.setItem("healthProfile", JSON.stringify(healthProfile));

    // Save to database
    if (user) {
      try {
        const { error } = await supabase.from("quiz_results").insert([
          {
            user_id: user.id,
            answers,
            calculations,
          },
        ]);

        if (error) {
          console.error("Error saving quiz result:", error);
          await logFrontendError("Failed to save quiz result", error.message, {
            userId: user.id,
          });
        } else {
          await logInfo("frontend", "Quiz result saved successfully", {
            userId: user.id,
          });
        }

        // Generate meal plan immediately after saving quiz results
        // try {
        //   const userProfile = convertQuizAnswersToUserProfile(answers, user.id);
        //   const macroTargets = calculateMacroTargets(userProfile, calculations.dailyCalorieTarget);

        //   const generator = new MealGeneratorV2({
        //     enableMLPredictions: false, // Disable ML for initial generation
        //     maxTemplatesToConsider: 10,
        //     minTemplateScore: 0.2,
        //     macroTolerance: 0.15,
        //     healthConditionWeight: 0.3,
        //     varietyWeight: 0.2,
        //     userPreferenceWeight: 0.25,
        //     macroAlignmentWeight: 0.25
        //   });

        //   const meals = await generator.generateMealPlan(userProfile, macroTargets);

        //   // Store the generated meal plan in localStorage for immediate access
        //   localStorage.setItem("generatedMealPlan", JSON.stringify({
        //     meals,
        //     userProfile,
        //     macroTargets,
        //     generatedAt: new Date().toISOString()
        //   }));

        //   await logInfo("frontend", "Meal plan generated successfully during quiz completion", {
        //     userId: user.id,
        //     mealCount: String(meals.length)
        //   });

        // } catch (mealError) {
        //   console.error("Error generating meal plan during quiz completion:", mealError);
        //   await logFrontendError(
        //     "Failed to generate meal plan during quiz completion",
        //     mealError instanceof Error ? mealError.message : String(mealError),
        //     { userId: user.id }
        //   );
        //   // Don't block navigation if meal generation fails
        // }
      } catch (err) {
        console.error("Error saving quiz result:", err);
        await logFrontendError(
          "Exception while saving quiz result",
          err instanceof Error ? err : String(err),
          { userId: user.id }
        );
      }
    }

    // Navigate to dashboard
    navigate("/dashboard");
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
        className="bg-background rounded-2xl shadow-lg p-8"
      >
        <div className="flex items-start justify-between mb-8">
          <h2 className="text-2xl font-bold text-foreground">
            {currentQuestion.question}
          </h2>
          {currentQuestion.info && (
            <div className="group relative">
              <Info className="h-5 w-5 text-foreground cursor-help" />
              <div className="absolute right-0 w-64 p-3 bg-background text-foreground text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                {currentQuestion.info}
              </div>
            </div>
          )}
        </div>

        {currentQuestion.type === "select" && (
          <div className="space-y-3">
            <Select
              value={(answers[currentQuestion.id] as string) || ""}
              onValueChange={(val) => handleAnswer(val)}
            >
              <SelectTrigger
                className={`w-full ${
                  error ? "border-red-500 dark:border-red-400" : "border-border"
                }`}
              >
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {currentQuestion.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}

        {currentQuestion.type === "number" && (
          <div className="relative">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className={`w-full text-center md:text-lg font-semibold ${
                error ? "border-red-500 dark:border-red-400" : "border-border"
              }`}
              value={answers[currentQuestion.id] || ""}
              onChange={handleNumberInput}
              placeholder="Enter a number"
            />
            {currentQuestion.unit && (
              <span className="absolute right-4 top-4 transform -translate-y-1/2 text-foreground/70">
                {currentQuestion.unit}
              </span>
            )}
            <div className="mt-2 flex justify-between text-sm text-foreground/70">
              <span>Min: {currentQuestion.min}</span>
              <span>Max: {currentQuestion.max}</span>
            </div>
          </div>
        )}

        {currentQuestion.type === "radio" && (
          <RadioGroup
            value={answers[currentQuestion.id] as string}
            onValueChange={(val) => handleAnswer(val)}
          >
            {currentQuestion.options?.map((option) => (
              <label
                key={option}
                className={`flex items-center w-full p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                  answers[currentQuestion.id] === option
                    ? `${colorTheme.primaryBorder} ${colorTheme.primaryBg} dark:${colorTheme.primaryDark}/20 dark:${colorTheme.primaryText} shadow-md`
                    : "border-border hover:border-border"
                }`}
              >
                <RadioGroupItem
                  value={option}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mr-3 ${
                    answers[currentQuestion.id] === option
                      ? `${colorTheme.primaryBorder} bg-primary`
                      : "border-border bg-background"
                  }`}
                />
                <span>{option}</span>
              </label>
            ))}
          </RadioGroup>
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
        <div className="container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-2xl shadow-lg p-8 text-center"
          >
            <LogIn
              className={`h-16 w-16 ${colorTheme.primaryText} mx-auto mb-6`}
            />
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Sign In to Take the Quiz
            </h2>
            <p className="text-foreground mb-8">
              To get your personalized diet and exercise plan, please sign in or
              create an account. It's completely free!
            </p>
            <AuthModal
              colorTheme={colorTheme}
              classNames="w-full"
              size="lg"
              btnContent="Sign In to Continue"
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {!completed ? (
              <>
                <div className="mb-8 text-center">
                  <motion.h1
                    className="text-4xl font-bold text-foreground mb-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    Create Your Personalized Plan
                  </motion.h1>
                  <motion.p
                    className="text-lg text-foreground"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </motion.p>
                </div>

                <motion.div
                  className="mb-8 bg-card rounded-full h-2 overflow-hidden"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className={`h-full ${colorTheme.primaryBg}`}
                    initial={{ width: `${progress}%` }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>

                {renderQuestion()}

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className={`flex items-center ${
                      currentQuestionIndex === 0 ? "opacity-0" : ""
                    }`}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Previous
                  </Button>

                  <Button
                    onClick={handleNext}
                    className={`flex items-center ${
                      answers[currentQuestion.id] === undefined ||
                      answers[currentQuestion.id] === ""
                        ? "bg-button disabled:bg-button/30 text-foreground cursor-not-allowed"
                        : `${colorTheme.primaryBg} ${colorTheme.primaryHover} text-white cursor-pointer`
                    }`}
                    disabled={
                      answers[currentQuestion.id] === undefined ||
                      answers[currentQuestion.id] === ""
                    }
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
                  </Button>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-background rounded-2xl shadow-lg p-8 text-center"
              >
                <div
                  className={`w-16 h-16 ${colorTheme.primaryBg}/20 dark:bg-${colorTheme.primaryDark}/20 rounded-full flex items-center justify-center mx-auto mb-6`}
                >
                  <Check className={`h-8 w-8 ${colorTheme.primaryText}`} />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Creating Your Personalized Plan
                </h2>
                <p className="text-foreground mb-6">
                  We're analyzing your responses to create a customized diet and
                  exercise plan that fits your goals and lifestyle.
                </p>
                <div className="flex justify-center">
                  <div
                    className={`w-8 h-8 border-4 ${colorTheme.primaryBorder} border-t-transparent rounded-full animate-spin`}
                  ></div>
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
