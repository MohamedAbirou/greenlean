import { exercises } from "@/data/exercises";
import { motion } from "framer-motion";
import { ArrowRight, BarChart, Clock, Tag } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const WeightLoss: React.FC = () => {
  const [activeTab, setActiveTab] = useState("exercises");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredExercises =
    activeCategory === "All" ? exercises : exercises.filter((ex) => ex.category === activeCategory);

  const categories = ["All", "Cardio", "Strength", "Flexibility"];

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Weight Loss Programs</h1>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Discover effective workout routines and weight loss strategies to help you reach your
            fitness goals.
          </p>
        </div>

        {/* Hero Banner */}
        <div className="relative rounded-xl overflow-hidden mb-12">
          <img
            src="https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Weight loss journey"
            className="w-full h-64 sm:h-96 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex items-center">
            <div className="px-6 sm:px-12 max-w-lg">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Start Your Weight Loss Journey Today
              </h2>
              <p className="text-white text-sm sm:text-base mb-6">
                Our personalized approach combines effective workouts with balanced nutrition to
                help you achieve sustainable results.
              </p>
              <Link
                to="/quiz"
                className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-full transition-colors duration-300"
              >
                Take the Quiz <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border mb-8">
          <button
            className={`py-3 px-6 font-medium border-b-2 ${
              activeTab === "exercises"
                ? "border-primary text-primary"
                : "border-transparent text-foreground hover:text-primary cursor-pointer"
            }`}
            onClick={() => setActiveTab("exercises")}
          >
            Exercise Routines
          </button>
          <button
            className={`py-3 px-6 font-medium border-b-2 ${
              activeTab === "tips"
                ? "border-primary text-primary"
                : "border-transparent text-foreground hover:text-primary cursor-pointer"
            }`}
            onClick={() => setActiveTab("tips")}
          >
            Weight Loss Tips
          </button>
        </div>

        {/* Exercise Routines */}
        {activeTab === "exercises" && (
          <>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full cursor-pointer text-sm font-medium transition-colors ${
                    activeCategory === category
                      ? "bg-primary text-white"
                      : "bg-card text-foreground/90 hover:bg-primary"
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Exercise Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredExercises.map((exercise, index) => (
                <motion.div
                  key={exercise.id}
                  className="bg-card rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="h-48 relative">
                    <img
                      src={exercise.image}
                      alt={exercise.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex space-x-2">
                        <span className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                          <Clock className="h-3 w-3 mr-1" /> {exercise.duration}
                        </span>
                        <span
                          className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${
                            exercise.intensity === "Low"
                              ? "bg-green-500/90 text-white"
                              : exercise.intensity === "Medium"
                              ? "bg-yellow-500/90 text-white"
                              : "bg-red-500/90 text-white"
                          }`}
                        >
                          <BarChart className="h-3 w-3 mr-1" /> {exercise.intensity}
                        </span>
                        <span className="inline-flex items-center bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full">
                          <Tag className="h-3 w-3 mr-1" /> {exercise.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-2">{exercise.title}</h3>
                    <p className="text-foreground/80 mb-4">{exercise.description}</p>
                    <Link
                      to={`/weight-loss/${exercise.id}`}
                      className="inline-flex items-center text-primary font-medium"
                    >
                      View Details <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Weight Loss Tips */}
        {activeTab === "tips" && (
          <div className="bg-card rounded-xl shadow-md p-3">
            <h2 className="text-2xl font-bold text-foreground mb-6">Essential Weight Loss Tips</h2>

            <div className="space-y-8">
              {[
                {
                  title: "Create a Calorie Deficit",
                  description:
                    "Consume fewer calories than you burn. Track your food intake and be mindful of portion sizes.",
                  icon: "🍽️",
                },
                {
                  title: "Focus on Protein",
                  description:
                    "Protein helps preserve muscle mass during weight loss and keeps you feeling full longer.",
                  icon: "🥩",
                },
                {
                  title: "Stay Hydrated",
                  description:
                    "Drinking water before meals can reduce hunger and increase weight loss. Aim for 8 glasses daily.",
                  icon: "💧",
                },
                {
                  title: "Get Adequate Sleep",
                  description:
                    "Poor sleep is associated with weight gain. Aim for 7-9 hours of quality sleep per night.",
                  icon: "😴",
                },
                {
                  title: "Manage Stress",
                  description:
                    "High stress levels can trigger emotional eating. Practice stress-reduction techniques.",
                  icon: "🧘",
                },
                {
                  title: "Be Consistent",
                  description:
                    "Weight loss is a journey, not a sprint. Sustainable changes lead to lasting results.",
                  icon: "📈",
                },
              ].map((tip, index) => (
                <motion.div
                  key={index}
                  className="flex"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 h-12 w-12 bg-primary rounded-full flex items-center justify-center text-2xl mr-4">
                    {tip.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{tip.title}</h3>
                    <p className="text-foreground/80">{tip.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                to="/quiz"
                className="px-6 py-3 bg-primary text-white font-medium rounded-full transition-colors duration-300 inline-flex items-center"
              >
                Get Your Personalized Plan <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeightLoss;
