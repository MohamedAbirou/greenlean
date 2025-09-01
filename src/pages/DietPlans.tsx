import { motion } from "framer-motion";
import { ArrowRight, Filter, Search } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { usePlatform } from "../contexts/PlatformContext";
import { useColorTheme } from "../utils/colorUtils";

interface DietPlan {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  duration: string;
}

const dietPlans: DietPlan[] = [
  {
    id: 1,
    title: "Mediterranean Diet",
    description:
      "Rich in fruits, vegetables, whole grains, and healthy fats. Perfect for heart health and weight management.",
    image:
      "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Weight Loss",
    difficulty: "Medium",
    duration: "12 weeks",
  },
  {
    id: 2,
    title: "Keto Diet Plan",
    description:
      "High fat, low carb approach to trigger ketosis for rapid weight loss and increased energy.",
    image:
      "https://images.pexels.com/photos/1640771/pexels-photo-1640771.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Weight Loss",
    difficulty: "Hard",
    duration: "8 weeks",
  },
  {
    id: 3,
    title: "Plant-Based Diet",
    description:
      "Focus on plant foods for improved health, weight management, and reduced environmental impact.",
    image:
      "https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Health",
    difficulty: "Medium",
    duration: "12 weeks",
  },
  {
    id: 4,
    title: "Intermittent Fasting",
    description:
      "Alternate eating and fasting periods to improve metabolism and support weight loss.",
    image:
      "https://images.pexels.com/photos/5638732/pexels-photo-5638732.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Weight Loss",
    difficulty: "Medium",
    duration: "10 weeks",
  },
  {
    id: 5,
    title: "DASH Diet",
    description:
      "Designed to lower blood pressure through balanced nutrition and reduced sodium intake.",
    image:
      "https://images.pexels.com/photos/4033636/pexels-photo-4033636.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Health",
    difficulty: "Easy",
    duration: "16 weeks",
  },
  {
    id: 6,
    title: "Paleo Diet",
    description:
      "Based on foods similar to what our ancestors ate during the Paleolithic era, focusing on whole foods.",
    image:
      "https://images.pexels.com/photos/6546021/pexels-photo-6546021.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Weight Loss",
    difficulty: "Hard",
    duration: "12 weeks",
  },
  {
    id: 7,
    title: "Flexitarian Diet",
    description:
      "A flexible approach to vegetarianism that emphasizes plant-based foods with occasional meat.",
    image:
      "https://images.pexels.com/photos/1660027/pexels-photo-1660027.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Health",
    difficulty: "Easy",
    duration: "10 weeks",
  },
  {
    id: 8,
    title: "Low-Carb Diet",
    description:
      "Reduce carbohydrate intake while focusing on protein and healthy fats for effective weight loss.",
    image:
      "https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Weight Loss",
    difficulty: "Medium",
    duration: "8 weeks",
  },
  {
    id: 9,
    title: "Anti-Inflammatory Diet",
    description:
      "Combat inflammation through nutrient-rich foods and balanced nutrition.",
    image:
      "https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Health",
    difficulty: "Medium",
    duration: "12 weeks",
  },
  {
    id: 10,
    title: "High-Protein Diet",
    description:
      "Build and maintain muscle mass while supporting weight loss through increased protein intake.",
    image:
      "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Weight Loss",
    difficulty: "Medium",
    duration: "10 weeks",
  },
  {
    id: 11,
    title: "Mediterranean-DASH Diet",
    description:
      "Combine the best of Mediterranean and DASH diets for heart health and weight management.",
    image:
      "https://images.pexels.com/photos/5638609/pexels-photo-5638609.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Health",
    difficulty: "Medium",
    duration: "14 weeks",
  },
  {
    id: 12,
    title: "Whole30 Diet",
    description:
      "Reset your nutrition with 30 days of whole foods and elimination of processed ingredients.",
    image:
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Weight Loss",
    difficulty: "Hard",
    duration: "4 weeks",
  },
];

const DietPlans: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const platform = usePlatform();
  const colorTheme = useColorTheme(platform.settings?.theme_color);

  const categories = ["All", "Weight Loss", "Health"];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const filteredPlans = dietPlans.filter((plan) => {
    const matchesSearch =
      plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || plan.category === categoryFilter;
    const matchesDifficulty =
      difficultyFilter === "All" || plan.difficulty === difficultyFilter;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Explore Diet Plans
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Browse our collection of diet plans designed to help you achieve
            your health and fitness goals.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search diet plans..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  className="pl-10 pr-8 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  className="pl-10 pr-8 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                >
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diet Plans */}
        {filteredPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="h-48 relative">
                  <img
                    src={plan.image}
                    alt={plan.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 py-1 px-3 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                    {plan.category}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      {plan.title}
                    </h3>
                    <span
                      className={`text-sm font-medium py-1 px-3 rounded-full ${
                        plan.difficulty === "Easy"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : plan.difficulty === "Medium"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {plan.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {plan.duration}
                    </span>
                    <Link
                      to={`/diet-plans/${plan.id}`}
                      className={`inline-flex items-center ${colorTheme.primaryText} hover:${colorTheme.primaryText} font-medium`}
                    >
                      View Plan <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              No diet plans found matching your criteria.
            </p>
            <button
              className="mt-4 text-green-500 hover:text-green-600 font-medium"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("All");
                setDifficultyFilter("All");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietPlans;
