import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import React, { useState } from "react";

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
    title: "Progress, Points & Gamification",
    questions: [
      {
        question: "How does the points and badges system work?",
        answer: "You earn points for completing daily and weekly challenges, workouts, and meeting nutrition goals. Badges are granted for major achievements (like streaks or milestones) and can be viewed in the challenges page."
      },
      {
        question: "What are streaks and how do they help me?",
        answer: "Streaks track your consistency in logging meals or workouts. Maintaining streaks helps keep you motivated. You'll receive warnings and encouraging notifications when a streak is about to expire."
      },
      {
        question: "What happens if I complete a challenge?",
        answer: "You'll earn bonus points, badges, and occasionally fun confetti animations! All progress goes toward your achievements and profile collections."
      }
    ],
  },
  {
    title: "Tracking & Logging Features",
    questions: [
      {
        question: "Can I log meals or workouts in the app?",
        answer: "Yes, you can log your daily meals and workouts for calorie, macro, and adherence tracking. All your logs appear in the dashboard for review."
      },
      {
        question: "Is there a water intake tracker?",
        answer: "Yes, track your daily water intake with adjustable goals. See your hydration streak and progress on your dashboard."
      }
    ],
  },
  {
    title: "Plans, Shopping & Customization",
    questions: [
      {
        question: "How is my shopping list generated?",
        answer: "When you receive a meal plan, a shopping list is auto-generated, organized by food category and matched to your required portions. You can print or view it anytime."
      },
      {
        question: "Can I adapt meal plans for my budget or grocery store?",
        answer: "Yes! You can set a budget preference, and swap ingredients based on your available groceries. The app also suggests alternatives and highlights cost-effective options."
      },
      {
        question: "Do you support different diets (vegan, keto, etc.)?",
        answer: "Absolutely. Our plans are adaptable for vegetarian, vegan, pescatarian, keto, paleo, intermittent fasting, and many dietary restrictions—all handled in your initial quiz and profile settings."
      }
    ],
  },
  {
    title: "Registration, Account & Security",
    questions: [
      {
        question: "How do I register and onboard?",
        answer: "The registration process involves a multi-step flow: enter your info, confirm details, and complete a personalized quiz. It's designed to be quick yet comprehensive for accurate recommendations."
      },
      {
        question: "Can I reset my password?",
        answer: "Yes, use the 'Reset Password' link on the profile page. You'll get a secure reset email."
      },
      {
        question: "Is my account protected?",
        answer: "We employ industry-standard security measures: all user data is encrypted, login is handled securely, and you can manage your privacy and notification preferences in account settings."
      },
      {
        question: "How do I delete my account?",
        answer: "There is an option to permanently delete your account from settings—this wipes your data from our servers."
      }
    ],
  },
  {
    title: "Devices, Notifications & Admin",
    questions: [
      {
        question: "Does GreenLean work on mobile and desktop?",
        answer: "Yes! The entire app is fully responsive and works seamlessly across mobile phones, tablets, and desktop browsers. Progress is synced when you're logged in."
      },
      {
        question: "What notifications will I receive?",
        answer: "You'll get email notifications for important milestones, password resets, and streak warnings. In-app toast notifications also inform you about achievements, reminders, and errors in real time."
      },
      {
        question: "Who can access the admin dashboard?",
        answer: "Only authorized admin users can access advanced platform management features—these include analytics, user management, challenge creation, and review of activity metrics. End users do not see admin options."
      },
      {
        question: "Is there Dark Mode?",
        answer: "Yes, you can enable Dark Mode from your profile or via a toggle. Your preference is saved for future logins."
      }
    ]
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
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h1
            className="text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            className="text-lg text-secondary-foreground max-w-2xl mx-auto"
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
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-green-500 bg-background text-foreground"
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
              className="bg-background rounded-xl shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            >
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left bg-card/50"
                onClick={() => toggleCategory(category.title)}
              >
                <h2 className="text-xl font-semibold text-foreground">
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
                        <h3 className="text-lg font-medium text-foreground">
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
                          className="mt-3 text-secondary-foreground"
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
          <p className="text-secondary-foreground mb-4">
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
