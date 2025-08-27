import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Utensils, Dumbbell, Award } from "lucide-react";

// Components
import TestimonialCard from "../components/ui/TestimonialCard";

const Home: React.FC = () => {
  const benefits = [
    {
      icon: <Heart className="h-8 w-8 text-pink-500" />,
      title: "Personalized Plans",
      description:
        "Get diet and exercise plans tailored to your unique needs, goals, and preferences.",
    },
    {
      icon: <Utensils className="h-8 w-8 text-blue-500" />,
      title: "Nutritional Guidance",
      description:
        "Learn about balanced nutrition and how to make healthier food choices every day.",
    },
    {
      icon: <Dumbbell className="h-8 w-8 text-green-500" />,
      title: "Effective Workouts",
      description:
        "Access workout routines designed to maximize results while fitting into your schedule.",
    },
    {
      icon: <Award className="h-8 w-8 text-purple-500" />,
      title: "Expert Support",
      description:
        "Receive guidance from nutrition and fitness experts committed to your success.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      image:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600",
      role: "Lost 25 lbs",
      testimonial:
        "GreenLean transformed my approach to weight loss. The personalized plan made all the difference!",
    },
    {
      name: "Michael Chen",
      image:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600",
      role: "Lost 30 lbs",
      testimonial:
        "The quiz matched me with the perfect diet plan. I've never felt better or had more energy!",
    },
    {
      name: "Alicia Rodriguez",
      image:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600",
      role: "Lost 15 lbs",
      testimonial:
        "Finally found a healthy eating plan I can stick to. The recipes are delicious and easy to make.",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Healthy lifestyle"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Your Journey to a{" "}
              <span className="text-green-400">Healthier You</span> Starts Here
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Discover personalized diet plans and weight loss strategies
              tailored just for you. All completely free, no subscriptions
              required.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Link
                to="/quiz"
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition-colors duration-300 flex items-center justify-center"
              >
                Take the Quiz <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/diet-plans"
                className="px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold rounded-full transition-colors duration-300 flex items-center justify-center"
              >
                Explore Diet Plans
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-300 mb-4">
              Why Choose GreenLean?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-200 max-w-2xl mx-auto">
              We're committed to helping you achieve your health goals through
              personalized guidance and support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="rounded-full bg-gray-100 dark:bg-gray-600 w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-300 mb-2 text-center">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-300 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-200 max-w-2xl mx-auto">
              Three simple steps to your personalized health journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Take the Quiz",
                description:
                  "Answer a few questions about your lifestyle, preferences, and goals.",
              },
              {
                number: "02",
                title: "Get Your Plan",
                description:
                  "Receive a customized diet and exercise plan tailored to your unique needs.",
              },
              {
                number: "03",
                title: "Start Your Journey",
                description:
                  "Follow your plan and track your progress as you work toward your goals.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-5xl font-bold text-green-200 dark:text-green-400 absolute top-0 left-0">
                  {step.number}
                </div>
                <div className="relative z-10 mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-300 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/quiz"
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full transition-colors duration-300 inline-flex items-center"
            >
              Start Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-300 mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-200 max-w-2xl mx-auto">
              Real people, real results. Here's what our community has to say.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-500">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Life?
            </h2>
            <p className="text-lg mb-8">
              Start your journey to a healthier you today. Take our quick quiz
              to get your personalized plan.
            </p>
            <Link
              to="/quiz"
              className="px-8 py-4 bg-white text-green-500 font-bold rounded-full hover:bg-gray-100 transition-colors duration-300 inline-flex items-center"
            >
              Take the Quiz <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
