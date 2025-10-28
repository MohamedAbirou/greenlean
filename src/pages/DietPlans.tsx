import { dietPlans } from "@/data/dietPlans";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { motion } from "framer-motion";
import { ArrowRight, Filter, Search } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const DietPlans: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const categories = ["All", "Weight Loss", "Health"];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const filteredPlans = dietPlans.filter((plan) => {
    const matchesSearch =
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || plan.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === "All" || plan.difficulty === difficultyFilter;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Explore Diet Plans</h1>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Browse our collection of diet plans designed to help you achieve your health and fitness
            goals.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-xl shadow-md p-3 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/70" />
              <Input
                type="text"
                placeholder="Search diet plans..."
                className="pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/70" />
                <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val)}>
                  <SelectTrigger className="pl-10 pr-8 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-green-500">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/70" />
                <Select value={difficultyFilter} onValueChange={(val) => setDifficultyFilter(val)}>
                  <SelectTrigger className="pl-10 pr-8 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-green-500">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                className="bg-card rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="h-48 relative">
                  <img src={plan.image} alt={plan.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-background py-1 px-3 rounded-full text-sm font-medium text-foreground/80">
                    {plan.category}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
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
                  <p className="text-secondary-foreground mb-4">{plan.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-foreground/70">
                      {plan.duration}
                    </span>
                    <Link
                      to={`/diet-plans/${plan.id}`}
                      className="inline-flex items-center text-primary hover:text-primary/90 font-medium"
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
            <p className="text-secondary-foreground text-lg">
              No diet plans found matching your criteria.
            </p>
            <button
              className="mt-4 text-primary font-medium"
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
