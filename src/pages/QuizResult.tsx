import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, Calendar, Flame, Loader, Scale } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

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

const QuizResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizResult = async () => {
      try {
        if (!user || !id) return;

        const { data, error } = await supabase
          .from("quiz_results")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;

        setResult(data);
      } catch (error) {
        console.error("Error fetching quiz result:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizResult();
  }, [user, id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Quiz Result Not Found</h1>
            <Link
              to="/quiz-history"
              className="text-primary hover:text-primary/80 inline-flex items-center"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Quiz History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate weight status based on BMI
  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { status: "Underweight", color: "text-blue-500" };
    if (bmi < 25) return { status: "Normal", color: "text-primary" };
    if (bmi < 30) return { status: "Overweight", color: "text-yellow-500" };
    return { status: "Obese", color: "text-red-500" };
  };

  const bmiStatus = getBMIStatus(result.calculations.bmi);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link
              to="/quiz-history"
              className="inline-flex items-center text-primary hover:text-primary/90"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Quiz History
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-foreground">Quiz Result Details</h1>
                <div className="flex items-center text-foreground/70">
                  <Calendar className="h-5 w-5 mr-2" />
                  {new Date(result.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-background rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Scale className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-foreground/80">BMI</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {result.calculations.bmi?.toFixed(1)}
                  </div>
                  <div className={`text-sm ${bmiStatus.color}`}>{bmiStatus.status}</div>
                </div>

                <div className="bg-background rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Activity className="h-5 w-5 text-primary mr-2" />
                    <span className="text-foreground/80">BMR</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {Math.round(result.calculations.bmr)}
                  </div>
                  <div className="text-sm text-foreground/70">calories/day</div>
                </div>

                <div className="bg-background rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Flame className="h-5 w-5 text-orange-500 mr-2" />
                    <span className="text-foreground/80">TDEE</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {Math.round(result.calculations.tdee)}
                  </div>
                  <div className="text-sm text-foreground/70">calories/day</div>
                </div>

                <div className="bg-background rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Activity className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="text-foreground/80">Activity Level</span>
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {result.answers[6] as string}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-background rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Your Goals</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-foreground/70">Primary Goal</div>
                      <div className="text-foreground">{result.answers[8] as string}</div>
                    </div>
                    <div>
                      <div className="text-sm text-foreground/70">Target Weight</div>
                      <div className="text-foreground">{result.answers[5]} kg</div>
                    </div>
                    <div>
                      <div className="text-sm text-foreground/70">Exercise Preference</div>
                      <div className="text-foreground">{result.answers[12] as string}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-background rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">
                    Dietary Preferences
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-foreground/70">Dietary Restrictions</div>
                      <div className="text-foreground">{result.answers[7] as string}</div>
                    </div>
                    <div>
                      <div className="text-sm text-foreground/70">Meals per Day</div>
                      <div className="text-foreground">{result.answers[9] as string}</div>
                    </div>
                    <div>
                      <div className="text-sm text-foreground/70">Health Conditions</div>
                      <div className="text-foreground">{result.answers[10] as string}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
