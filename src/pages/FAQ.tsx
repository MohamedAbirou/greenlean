import React from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface FAQCategory {
  title: string;
  questions: {
    question: string;
    answer: string;
  }[];
}

const faqData: FAQCategory[] = [
  {
    title: "Diet Plans",
    questions: [
      {
        question: "Are the diet plans really free?",
        answer:
          "Yes! All our diet plans are completely free. We believe everyone should have access to personalized nutrition guidance regardless of their budget. Our mission is to make healthy living accessible to all.",
      },
      {
        question: "How often should I follow the meal plan?",
        answer:
          "For best results, follow your meal plan consistently every day. However, you can have one flexible day per week where you eat moderately outside the plan. This helps with long-term adherence while maintaining progress.",
      },
      {
        question: "Can I modify the meal plans?",
        answer:
          "Absolutely! While our plans are designed to be nutritionally balanced, you can substitute items with similar foods from the same food group. Just maintain the approximate calorie and macro ratios for optimal results.",
      },
      {
        question: "What if I have food allergies?",
        answer:
          "Our quiz takes into account dietary restrictions and allergies. When you receive your plan, it will exclude any problematic foods. You can also manually substitute any ingredients with suitable alternatives.",
      },
    ],
  },
  {
    title: "Exercise & Workouts",
    questions: [
      {
        question: "Are the workouts suitable for beginners?",
        answer:
          "Yes, our workout programs cater to all fitness levels. Beginners will receive modified versions of exercises, with detailed instructions and proper progression paths. Always start at your comfort level and gradually increase intensity.",
      },
      {
        question: "How often should I exercise?",
        answer:
          "We recommend 3-5 workout sessions per week, with rest days in between for recovery. The specific frequency will depend on your goals, current fitness level, and schedule, which we account for in your personalized plan.",
      },
      {
        question: "Do I need special equipment?",
        answer:
          "Many of our workouts can be done with minimal or no equipment. When equipment is needed, we provide alternatives or modifications. Your personalized plan will consider the equipment you have access to.",
      },
      {
        question: "What if I miss a workout?",
        answer:
          'Don\'t worry about missed workouts - simply resume your schedule when you can. Consistency over time matters more than perfect adherence. Avoid doubling up on workouts to "make up" for missed sessions.',
      },
    ],
  },
  {
    title: "Progress & Results",
    questions: [
      {
        question: "How quickly will I see results?",
        answer:
          "Results vary by individual, but most people notice initial changes within 2-4 weeks of consistent effort. Sustainable weight loss typically ranges from 0.5-1 kg per week. Focus on non-scale victories too, like increased energy and better sleep.",
      },
      {
        question: "How do I track my progress?",
        answer:
          "Use our dashboard to log your weight, measurements, and photos. We recommend tracking weekly rather than daily. Also note energy levels, sleep quality, and how clothes fit - these are important indicators of progress.",
      },
      {
        question: "What if I plateau?",
        answer:
          "Plateaus are normal! When progress stalls, we recommend reviewing your food portions, increasing exercise intensity slightly, or taking new photos to see visual changes. Sometimes progress continues even when the scale doesn't move.",
      },
      {
        question: "Can I maintain my results long-term?",
        answer:
          "Yes! Our programs focus on sustainable lifestyle changes rather than quick fixes. We teach habits that you can maintain long-term, and provide guidance on transitioning to maintenance once you reach your goals.",
      },
    ],
  },
  {
    title: "Account & Technical",
    questions: [
      {
        question: "How do I update my profile?",
        answer:
          "Access your profile settings through the dashboard menu. Here you can update your weight, goals, dietary preferences, and other personal information. Your plan will automatically adjust based on your updates.",
      },
      {
        question: "Can I change my plan after starting?",
        answer:
          "Yes! You can retake the quiz anytime to get a new plan, or manually select from our library of diet and exercise plans. Your dashboard will update automatically with your new selection.",
      },
      {
        question: "Is my information secure?",
        answer:
          "We take data security seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent. Read our privacy policy for more details.",
      },
      {
        question: "What devices can I use?",
        answer:
          "GreenLean is fully responsive and works on all modern devices - smartphones, tablets, and computers. Your progress syncs across devices when you're logged in to your account.",
      },
    ],
  },
];

const FAQ: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "Diet Plans",
  ]);
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleQuestion = (question: string) => {
    setExpandedQuestions((prev) =>
      prev.includes(question)
        ? prev.filter((q) => q !== question)
        : [...prev, question]
    );
  };

  const filteredFAQ = faqData
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h1
            className="text-4xl font-bold text-gray-800 dark:text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Find answers to common questions about our diet plans, workouts, and
            more.
          </motion.p>
        </div>

        {/* Search Bar */}
        <motion.div
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQ..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>

        {/* FAQ Categories */}
        <div className="max-w-3xl mx-auto space-y-6">
          {filteredFAQ.map((category, categoryIndex) => (
            <motion.div
              key={category.title}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            >
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left bg-gray-50 dark:bg-gray-700/50"
                onClick={() => toggleCategory(category.title)}
              >
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {category.title}
                </h2>
                {expandedCategories.includes(category.title) ? (
                  <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>

              {expandedCategories.includes(category.title) && (
                <div className="p-6 space-y-4">
                  {category.questions.map((item, questionIndex) => (
                    <motion.div
                      key={item.question}
                      className="border-b border-gray-100 dark:border-gray-700 last:border-0 pb-4 last:pb-0"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: questionIndex * 0.1 }}
                    >
                      <button
                        className="w-full flex items-center justify-between text-left"
                        onClick={() => toggleQuestion(item.question)}
                      >
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                          {item.question}
                        </h3>
                        {expandedQuestions.includes(item.question) ? (
                          <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 ml-4" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0 ml-4" />
                        )}
                      </button>

                      {expandedQuestions.includes(item.question) && (
                        <motion.p
                          className="mt-3 text-gray-600 dark:text-gray-300"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          {item.answer}
                        </motion.p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          className="max-w-3xl mx-auto mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Can't find what you're looking for?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
