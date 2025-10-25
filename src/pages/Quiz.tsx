import AuthModal from "@/components/auth/AuthModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { usePlatform } from "@/contexts/PlatformContext";
import { useAuth } from "@/contexts/useAuth";
import { supabase } from "@/lib/supabase";
import { mlService } from "@/services/mlService";
import { useColorTheme } from "@/utils/colorUtils";
import { logFrontendError, logInfo } from "@/utils/errorLogger";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  LogIn,
  Target,
  User,
  Utensils,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Poland",
  "Czech Republic",
  "Austria",
  "Switzerland",
  "Portugal",
  "Greece",
  "Ireland",
  "New Zealand",
  "Japan",
  "South Korea",
  "Singapore",
  "Malaysia",
  "Thailand",
  "India",
  "United Arab Emirates",
  "Saudi Arabia",
  "Egypt",
  "South Africa",
  "Morocco",
  "Brazil",
  "Argentina",
  "Chile",
  "Mexico",
  "Colombia",
].sort();

const QUIZ_PHASES = [
  {
    id: 1,
    name: "Basic Info",
    description: "Tell us about yourself so we can personalize your plan",
    icon: User,
    questions: [
      {
        id: "age",
        label: "Age",
        type: "number",
        required: true,
        min: 12,
        max: 100,
        placeholder: "25",
      },
      {
        id: "gender",
        label: "Gender",
        type: "radio",
        required: true,
        options: ["Male", "Female", "Non-binary", "Prefer not to say"],
      },
      {
        id: "country",
        label: "Country/Region",
        type: "select",
        required: true,
        options: COUNTRIES,
        searchable: true,
      },
      {
        id: "height",
        label: "Height",
        type: "height",
        required: true,
        units: ["cm", "ft/inch"],
        min: 100,
        max: 250,
      },
      {
        id: "currentWeight",
        label: "Current Weight",
        type: "weight",
        required: true,
        units: ["kg", "lbs"],
        min: 30,
        max: 250,
      },
      {
        id: "targetWeight",
        label: "Target Weight",
        type: "weight",
        required: true,
        units: ["kg", "lbs"],
        min: 30,
        max: 250,
      },
      {
        id: "bodyType",
        label: "Body Type",
        type: "radio",
        required: false,
        options: ["Ectomorph", "Mesomorph", "Endomorph", "Not sure"],
        skippable: false,
      },
      {
        id: "bodyFat",
        label: "Body Fat %",
        type: "slider",
        required: false,
        min: 5,
        max: 50,
        step: 1,
        skippable: true,
      },
      {
        id: "neck",
        label: "Neck circumference",
        description:
          "Please provide these measurements if you want to know your approximate body fat percentage",
        type: "height",
        required: false,
        units: ["cm", "ft/inch"],
        placeholder: "40",
        skippable: true,
      },
      {
        id: "waist",
        label: "Waist circumference",
        description:
          "Please provide these measurements if you want to know your approximate body fat percentage",
        type: "height",
        required: false,
        units: ["cm", "ft/inch"],
        placeholder: "80",
        skippable: true,
      },
      {
        id: "hip",
        label: "Hip circumference (women only)",
        description:
          "Please provide these measurements if you want to know your approximate body fat percentage",
        type: "height",
        required: false,
        units: ["cm", "ft/inch"],
        placeholder: "95",
        skippable: true,
      },
    ],
  },
  {
    id: 2,
    name: "Lifestyle & Activity",
    description: "Help us understand your daily routine and exercise habits",
    icon: Activity,
    questions: [
      {
        id: "occupation_activity",
        label: "What best describes your daily activity level?",
        type: "select",
        required: false,
        options: [
          "Sedentary (desk job or minimal movement)",
          "Lightly active (some walking or movement during the day)",
          "Moderately active (on feet often, e.g., retail, teaching)",
          "Very active (physical or outdoor job)",
          "Student",
          "Self-employed / Freelancer",
          "Retired",
          "Currently not working",
        ],
        skippable: true,
      },
      {
        id: "exerciseFrequency",
        label: "How often do you exercise?",
        type: "radio",
        required: true,
        options: [
          "Never",
          "1-2 times/week",
          "3-4 times/week",
          "5-6 times/week",
          "Daily",
        ],
      },
      {
        id: "preferredExercise",
        label: "Preferred Exercise Types",
        type: "multiSelect",
        required: true,
        options: [
          "Cardio",
          "Strength training",
          "HIIT",
          "Yoga",
          "Pilates",
          "Swimming",
          "Cycling",
          "Running",
          "Sports",
          "Dance",
          "Other",
        ],
      },
      {
        id: "trainingEnvironment",
        label: "Training Environment",
        type: "multiSelect",
        required: true,
        options: ["Gym", "Home", "Outdoor"],
      },
      {
        id: "equipment",
        label: "Available Equipment",
        type: "multiSelect",
        required: false,
        options: [
          "None",
          "Dumbbells",
          "Barbell",
          "Resistance bands",
          "Kettlebells",
          "Pull-up bar",
          "Bench",
          "Cardio machine",
          "Full gym access",
        ],
        skippable: true,
      },
      {
        id: "injuries",
        label: "Injuries or Limitations",
        type: "textarea",
        required: false,
        placeholder: "e.g., Lower back pain, knee injury, shoulder issues...",
        skippable: true,
      },
    ],
  },
  {
    id: 3,
    name: "Nutrition Habits",
    description: "Customize your meal plan to match your lifestyle",
    icon: Utensils,
    questions: [
      {
        id: "dietaryStyle",
        label: "Dietary Style",
        type: "select",
        required: true,
        options: [
          "No restrictions",
          "Vegetarian",
          "Vegan",
          "Pescatarian",
          "Keto",
          "Paleo",
          "Mediterranean",
          "Intermittent fasting",
          "Other",
        ],
      },
      {
        id: "foodAllergies",
        label: "Food Allergies",
        type: "textarea",
        required: false,
        placeholder: "e.g., peanuts, shellfish, dairy...",
        skippable: true,
      },
      {
        id: "dislikedFoods",
        label: "Foods You Dislike",
        type: "textarea",
        required: false,
        placeholder: "e.g., mushrooms, cilantro, seafood...",
        skippable: true,
      },
      {
        id: "mealsPerDay",
        label: "Meals Per Day",
        type: "radio",
        required: true,
        options: [
          "2 (intermittent fasting)",
          "3 (standard)",
          "4-5 (smaller meals)",
          "6+ (frequent eating)",
        ],
      },
      {
        id: "cookingSkill",
        label: "Cooking Skill Level",
        type: "radio",
        required: true,
        options: ["Beginner", "Intermediate", "Advanced", "Expert"],
      },
      {
        id: "cookingTime",
        label: "Time Available Per Meal",
        type: "radio",
        required: true,
        options: ["< 15 min", "15-30 min", "30-60 min", "> 1 hour"],
      },
      {
        id: "groceryBudget",
        label: "Grocery Budget",
        type: "radio",
        required: true,
        options: [
          "Low (budget-friendly)",
          "Medium (moderate)",
          "High (premium)",
        ],
      },
    ],
  },
  {
    id: 4,
    name: "Goals & Preferences",
    description: "Define what success looks like for you",
    icon: Target,
    questions: [
      {
        id: "mainGoal",
        label: "Main Goal",
        type: "select",
        required: true,
        options: [
          "Weight loss",
          "Build muscle",
          "Body recomposition",
          "Maintain weight",
          "Mild weight loss",
          "Extreme weight loss",
          "Improve strength",
          "Improve endurance",
          "Improve flexibility",
          "General health",
        ],
      },
      {
        id: "secondaryGoals",
        label: "Secondary Goals",
        type: "multiSelect",
        required: false,
        options: [
          "Improve mobility",
          "Reduce stress",
          "Better sleep",
          "More energy",
          "Athletic performance",
          "Injury prevention",
          "Look better",
        ],
        skippable: true,
      },
      {
        id: "timeFrame",
        label: "Target Timeframe",
        type: "radio",
        required: true,
        options: ["No rush", "1 month", "3 months", "6 months", "1 year+"],
      },
      {
        id: "motivationLevel",
        label: "Current Motivation Level",
        type: "slider",
        required: true,
        min: 1,
        max: 10,
        step: 1,
        showValue: true,
      },
      {
        id: "challenges",
        label: "Main Challenges",
        type: "multiSelect",
        required: false,
        options: [
          "Lack of time",
          "Low motivation",
          "Diet consistency",
          "Injury/pain",
          "Lack of knowledge",
          "Stress",
          "Travel frequently",
          "Social situations",
        ],
        skippable: true,
      },
    ],
  },
  {
    id: 5,
    name: "Health & Medical",
    description: "Ensure your plan is safe and effective",
    icon: Heart,
    questions: [
      {
        id: "healthConditions",
        label: "Health Conditions",
        type: "multiSelect",
        required: false,
        options: [
          "None",
          "Diabetes",
          "High blood pressure",
          "Heart disease",
          "Thyroid issues",
          "PCOS",
          "Asthma",
          "Arthritis",
          "Other",
        ],
        skippable: true,
      },
      {
        id: "medications",
        label: "Current Medications",
        type: "textarea",
        required: false,
        placeholder: "List any medications you take regularly...",
        skippable: true,
      },
      {
        id: "sleepQuality",
        label: "Sleep Quality",
        type: "radio",
        required: true,
        options: [
          "Poor (< 5 hours)",
          "Fair (5-6 hours)",
          "Good (6-7 hours)",
          "Excellent (7-9 hours)",
        ],
      },
      {
        id: "stressLevel",
        label: "Stress Level",
        type: "slider",
        required: true,
        min: 1,
        max: 10,
        step: 1,
        showValue: true,
      },
      {
        id: "lifestyle",
        label: "Lifestyle Habits",
        type: "radio",
        required: true,
        options: [
          "No smoking/drinking",
          "Occasional drinking",
          "Regular drinking",
          "Smoker",
          "Both",
        ],
      },
    ],
  },
];

const messages = [
  "Analyzing your answers 🔍",
  "Balancing your macros 🧮",
  "Selecting delicious meals 🍝",
  "Customizing workouts 💪",
  "Almost there… adding final touches ✨",
];

const Quiz: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [heightUnit, setHeightUnit] = useState("cm");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [showSummary, setShowSummary] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const platform = usePlatform();
  const colorTheme = useColorTheme(platform.settings?.theme_color);

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const phase = QUIZ_PHASES[currentPhase];
  const question = phase.questions[currentQuestion];
  const totalQuestions = QUIZ_PHASES.reduce(
    (sum, p) => sum + p.questions.length,
    0
  );
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  // Height unit switch
  const handleHeightUnitChange = (unit: "cm" | "ft/inch") => {
    setHeightUnit(unit);
    handleAnswer(
      question.id,
      unit === "cm" ? { cm: "" } : { ft: "", inch: "" }
    );
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[question.id];
      return newErrors;
    });
  };

  // Weight unit switch
  const handleWeightUnitChange = (unit: "kg" | "lbs") => {
    setWeightUnit(unit);

    // Clear previous value
    handleAnswer(question.id, {
      [unit]: "",
      ...(unit === "kg" ? {} : { kg: undefined }),
      ...(unit === "lbs" ? {} : { lbs: undefined }),
    });
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[question.id];
      return newErrors;
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validateAnswer = (questionId: string, value: any): string | null => {
    const question = phase.questions.find((q) => q.id === questionId);
    if (!question) return null;

    if (question.required) {
      // special check for height/weight objects
      if (typeof value === "object") {
        const hasValue = Object.values(value).some(
          (v) => v !== "" && v !== null && v !== undefined
        );
        if (!hasValue) return "This field is required";
      } else if (value === "" || value === null || value === undefined) {
        return "This field is required";
      }
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAnswer = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      return newErrors;
    });
  };

  const toggleMultiSelect = (questionId: string, option: string) => {
    const current = answers[questionId] || [];
    const newValue = current.includes(option)
      ? current.filter((item: string) => item !== option)
      : [...current, option];
    handleAnswer(questionId, newValue);
  };

  const canProceed = () => {
    if (question.required) {
      const answer = answers[question.id];
      if (
        answer === undefined ||
        answer === "" ||
        (Array.isArray(answer) && answer.length === 0)
      ) {
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!user) {
      return;
    }

    if (!canProceed()) return;

    const error = validateAnswer(question.id, answers[question.id] || "");
    if (error) {
      setErrors((prev) => ({ ...prev, [question.id]: error }));
      return;
    }

    if (currentQuestion < phase.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentPhase < QUIZ_PHASES.length - 1) {
      setCurrentPhase(currentPhase + 1);
      setCurrentQuestion(0);
    } else {
      setShowSummary(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentPhase > 0) {
      setCurrentPhase(currentPhase - 1);
      setCurrentQuestion(QUIZ_PHASES[currentPhase - 1].questions.length - 1);
    }
  };

  const handleSkip = () => {
    const error = validateAnswer(question.id, answers[question.id] || "");
    if (error) {
      setErrors((prev) => ({ ...prev, [question.id]: error }));
      return;
    }

    if (question.skippable) handleNext();
  };

  const calculateAndNavigate = async () => {
    // Save to localStorage
    const healthProfile = { answers };
    localStorage.setItem("healthProfile", JSON.stringify(healthProfile));

    // Continue with your existing save + ML generation flow
    if (user) {
      try {
        const { data: quizData, error } = await supabase
          .from("quiz_results")
          .insert([
            {
              user_id: user.id,
              answers,
            },
          ])
          .select()
          .single();

        if (error) {
          console.error("Error saving quiz result:", error);
          await logFrontendError("Failed to save quiz result", error.message, {
            userId: user.id,
          });
        } else {
          await logInfo("frontend", "Quiz result saved successfully", {
            userId: user.id,
          });

          try {
            console.log("Generating AI-powered meal and workout plans...");

            const completePlan = await mlService.generateCompletePlan(
              user.id,
              quizData.id,
              answers,
              "openai",
              "gpt-4o-mini"
            );

            localStorage.setItem(
              "aiGeneratedPlans",
              JSON.stringify({
                mealPlan: completePlan.mealPlan,
                workoutPlan: completePlan.workoutPlan,
                macros: completePlan.macros,
                generatedAt: new Date().toISOString(),
              })
            );

            await logInfo("frontend", "AI plans generated successfully", {
              userId: user.id,
              mealCount: String(completePlan.mealPlan.meals.length),
              workoutDays: String(completePlan.workoutPlan.weekly_plan.length),
            });
          } catch (mlError) {
            console.error("Error generating AI plans:", mlError);
            await logFrontendError(
              "Failed to generate AI plans",
              mlError instanceof Error ? mlError.message : String(mlError),
              { userId: user.id }
            );
          }
        }
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
    const error = errors[question.id];
    const answer = answers[question.id];
    const selected = answer || [];

    switch (question.type) {
      case "number":
        return (
          <>
            <Input
              type="number"
              value={answer || ""}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              placeholder={question.placeholder}
              min={question.min}
              max={question.max}
              step={question.step || 1}
              className={`bg-background text-lg ${
                error && "border-red-500 dark:border-red-400 m-0"
              }`}
            />
            {error && (
              <p className="mt-2 text-destructive/90 bg-destructive/20 rounded-md px-2 py-0.5">
                {error}
              </p>
            )}
          </>
        );

      case "height":
        return (
          <div className="space-y-4">
            <div className="flex gap-2 justify-center mb-4">
              {"units" in question &&
                question.units?.map((unit: string) => (
                  <Button
                    key={unit}
                    variant={heightUnit === unit ? "default" : "outline"}
                    onClick={() =>
                      handleHeightUnitChange(unit === "cm" ? "cm" : "ft/inch")
                    }
                    size="sm"
                  >
                    {unit}
                  </Button>
                ))}
            </div>
            {heightUnit === "cm" ? (
              <Input
                type="number"
                value={answer?.cm || ""}
                onChange={(e) =>
                  handleAnswer(question.id, { cm: e.target.value })
                }
                className={`bg-background text-lg ${
                  error && "border-red-500 dark:border-red-400"
                }`}
                placeholder="170"
                required
              />
            ) : (
              <div className="flex gap-2 justify-center">
                <Input
                  type="number"
                  value={answer?.ft || ""}
                  onChange={(e) =>
                    handleAnswer(question.id, { ...answer, ft: e.target.value })
                  }
                  placeholder="5"
                  className={`w-16 bg-background text-lg ${
                    error && "border-red-500 dark:border-red-400"
                  }`}
                  required
                />
                <span className="self-center">ft</span>
                <Input
                  type="number"
                  value={answer?.inch || ""}
                  onChange={(e) =>
                    handleAnswer(question.id, {
                      ...answer,
                      inch: e.target.value,
                    })
                  }
                  placeholder="11"
                  className={`w-16 bg-background text-lg ${
                    error && "border-red-500 dark:border-red-400"
                  }`}
                  required
                />
                <span className="self-center">in</span>
              </div>
            )}
            {error && (
              <p className="mt-2 text-destructive/90 bg-destructive/20 rounded-md px-2 py-0.5">
                {error}
              </p>
            )}
            <p className="text-sm text-foreground/80 text-center">
              {heightUnit === "cm"
                ? "Range: 100-250 cm"
                : "Range: 3'3\" - 8'2\""}
            </p>
          </div>
        );

      case "weight":
        return (
          <div className="space-y-4">
            <div className="flex gap-2 justify-center mb-4">
              {"units" in question &&
                question.units?.map((unit: string) => (
                  <Button
                    key={unit}
                    variant={weightUnit === unit ? "default" : "outline"}
                    onClick={() =>
                      handleWeightUnitChange(unit === "kg" ? "kg" : "lbs")
                    }
                    size="sm"
                  >
                    {unit}
                  </Button>
                ))}
            </div>
            <Input
              type="number"
              value={answer?.[weightUnit] || ""}
              onChange={(e) =>
                handleAnswer(question.id, {
                  ...answer,
                  [weightUnit]: e.target.value,
                })
              }
              placeholder={weightUnit === "kg" ? "70" : "154"}
              className={`bg-background text-lg ${
                error && "border-red-500 dark:border-red-400"
              }`}
            />
            {error && (
              <p className="mt-2 text-destructive/90 bg-destructive/20 rounded-md px-2 py-0.5">
                {error}
              </p>
            )}
            <p className="text-sm text-foreground/80 text-center">
              {weightUnit === "kg" ? "Range: 30-250 kg" : "Range: 66-550 lbs"}
            </p>
          </div>
        );

      case "radio":
        return (
          <RadioGroup
            value={answer}
            onValueChange={(val) => handleAnswer(question.id, val)}
          >
            <div className="space-y-3">
              {question.options?.map((option) => (
                <Label
                  key={option}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answer === option
                      ? "border-primary bg-primary/5"
                      : "border-background hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem
                    value={option}
                    className="mr-3 bg-background dark:bg-black/40"
                  />
                  <span className="flex-1">{option}</span>
                </Label>
              ))}
            </div>
          </RadioGroup>
        );

      case "select":
        return (
          <>
            <Select
              value={answer}
              onValueChange={(val) => handleAnswer(question.id, val)}
            >
              <SelectTrigger
                className={`bg-background w-full ${
                  error && "border-red-500 dark:border-red-400"
                }`}
              >
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <p className="mt-2 text-destructive/90 bg-destructive/20 rounded-md px-2 py-0.5">
                {error}
              </p>
            )}
          </>
        );

      case "multiSelect":
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <Label
                key={option}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selected.includes(option)
                    ? "border-primary bg-primary/5"
                    : "border-background hover:border-primary/50"
                }`}
                onClick={() => toggleMultiSelect(question.id, option)}
              >
                <div
                  className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center ${
                    selected.includes(option)
                      ? "bg-primary border-primary"
                      : "border-background"
                  }`}
                >
                  {selected.includes(option) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="flex-1">{option}</span>
              </Label>
            ))}
            {/* Show input if 'Other' is selected */}
            {(answers[question.id] || []).includes("Other") && (
              <div className="mt-3">
                <Input
                  type="text"
                  placeholder="Please specify your health condition"
                  value={answers[`${question.id}_other`] || ""}
                  onChange={(e) =>
                    handleAnswer(`${question.id}_other`, e.target.value)
                  }
                  className="bg-background text-lg"
                />
              </div>
            )}
            <p className="text-sm text-foreground/80">Select all that apply</p>
          </div>
        );

      case "slider":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-4xl font-bold text-primary">
                {answer || question.min}
              </span>
              {question.id === "bodyFat" && (
                <span className="text-2xl text-foreground/80">%</span>
              )}
            </div>
            <Slider
              value={[answer || question.min]}
              onValueChange={(val) => handleAnswer(question.id, val[0])}
              min={question.min}
              max={question.max}
              step={question.step || 1}
              className="w-full bg-background"
            />
            <div className="flex justify-between text-sm text-foreground/80">
              <span>{question.min}</span>
              <span>{question.max}</span>
            </div>
          </div>
        );

      case "textarea":
        return (
          <Textarea
            value={answer || ""}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className="resize-y"
          />
        );

      default:
        return null;
    }
  };

  const PhaseIcon = phase.icon;

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
          <div className="bg-yellow-100 border-b border-yellow-300 text-yellow-900 text-sm text-center rounded-lg my-2 py-2">
            ⚠️ This quiz is in <span className="font-bold">BETA</span> mode —
            results may not be final.
          </div>

          <AnimatePresence mode="wait">
            {showSummary ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="bg-background rounded-2xl shadow-lg p-6 text-center"
              >
                <h2 className="text-xl font-bold text-foreground mb-3">
                  Almost ready!
                </h2>

                <p className="text-foreground mb-4">
                  Got it — you want to{" "}
                  <span className="font-semibold">{answers.mainGoal}</span>, eat{" "}
                  <span className="font-semibold">
                    {answers.mealsPerDay}{" "}
                    {answers.dietaryStyle && answers.dietaryStyle !== "other"
                      ? `of ${answers.dietaryStyle}`
                      : ""}
                  </span>
                  , and train{" "}
                  <span className="font-semibold">
                    {answers.exerciseFrequency}
                  </span>
                  .
                </p>
                {/* 
                <p className="text-foreground mb-4">
                  Your current stats:{" "}
                  <span className="font-semibold">
                    {parseHeight(answers.height)[1]} /{" "}
                    {parseWeight(answers.currentWeight)[1]}
                  </span>
                </p>

                {answers.targetWeight && (
                  <p className="text-foreground mb-4">
                    Target:{" "}
                    <span className="font-semibold">
                      {parseWeight(answers.targetWeight)[1]} in{" "}
                      {answers.timeFrame}
                    </span>
                  </p>
                )} */}

                {answers.healthConditions &&
                  answers.healthConditions.length > 0 && (
                    <p className="text-foreground mb-4">
                      Health conditions:{" "}
                      <span className="font-semibold">
                        {answers.healthConditions.includes("Other") &&
                        answers.healthConditions_other
                          ? answers.healthConditions_other
                          : answers.healthConditions.join(", ")}
                      </span>
                    </p>
                  )}

                <p className="text-foreground/70 mb-6">
                  Does this look correct?
                </p>

                <div className="flex justify-center gap-4">
                  <Button
                    className={`${colorTheme.primaryBg} ${colorTheme.primaryHover} text-white`}
                    onClick={() => {
                      setShowSummary(false);
                      setCompleted(true); // now show spinner
                      setTimeout(() => calculateAndNavigate(), 500); // give framer-motion a small delay
                    }}
                  >
                    Yes, generate my plan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSummary(false)}
                  >
                    Edit my answers
                  </Button>
                </div>
              </motion.div>
            ) : !completed ? (
              <>
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      Phase {currentPhase + 1} of {QUIZ_PHASES.length}
                    </span>
                    <span className="text-sm text-foreground/80">
                      {Math.round(progress)}% Complete
                    </span>
                  </div>
                  <div className="h-2 bg-card rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Phase Header */}
                <Card className="mb-6 ">
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <PhaseIcon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          {phase.name}
                        </h2>
                        <p className="text-foreground/80">
                          {phase.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Question Card */}
                <Card>
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="space-y-6">
                      <Label className="text-xl font-semibold">
                        {question.label}
                        {!question.required && (
                          <Badge variant="secondary" className="ml-2">
                            Optional
                          </Badge>
                        )}
                      </Label>

                      {"description" in question && question.description && (
                        <p className="italic text-sm text-foreground/70">
                          {question.description}
                        </p>
                      )}

                      {renderQuestion()}

                      {/* Navigation */}
                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={handlePrevious}
                          disabled={currentPhase === 0 && currentQuestion === 0}
                        >
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          Previous
                        </Button>

                        <div className="flex gap-2">
                          {question.skippable && (
                            <Button variant="ghost" onClick={handleSkip}>
                              Skip
                            </Button>
                          )}
                          <Button onClick={handleNext} disabled={!canProceed()}>
                            {currentPhase === QUIZ_PHASES.length - 1 &&
                            currentQuestion === phase.questions.length - 1 ? (
                              <>
                                Complete
                                <Check className="w-4 h-4 ml-2" />
                              </>
                            ) : (
                              <>
                                Next
                                <ChevronRight className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                </Card>

                {/* Phase Navigation Dots */}
                <div className="flex justify-center gap-2 mt-6">
                  {QUIZ_PHASES.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentPhase
                          ? "w-8 bg-primary"
                          : idx < currentPhase
                          ? "w-2 bg-primary/50"
                          : "w-2 bg-muted"
                      }`}
                    />
                  ))}
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

                <p className="text-foreground mb-6 transition-opacity duration-500 ease-in-out">
                  {messages[messageIndex]}
                </p>

                <div className="flex justify-center">
                  <DotLottieReact
                    src="https://lottie.host/1affa7b2-7053-45b0-840a-11afc08c1746/9gcho1H4gZ.lottie"
                    loop
                    autoplay
                  />
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
