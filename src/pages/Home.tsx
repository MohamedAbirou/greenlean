import { motion } from "framer-motion";
import { ArrowRight, Award, Dumbbell, Heart, Quote, Utensils } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
// Components
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";

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
      description: "Receive guidance from nutrition and fitness experts committed to your success.",
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
            src="./images/main.jpeg"
            alt="Healthy lifestyle"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Your Journey to a <span className="text-primary">Healthier You</span> Starts Here
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Discover personalized diet plans and weight loss strategies tailored just for you. All
              completely free, no subscriptions required.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button asChild size="xl" className="bg-primary hover:bg-primary/90">
                <Link to="/quiz">
                  Take the Quiz <ArrowRight className="mt-1" />
                </Link>
              </Button>
              <Button asChild size="xl" className="bg-primary hover:bg-primary/90">
                <Link to="/diet-plans">
                  View Plans <ArrowRight className="mt-1" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose GreenLean?</h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              We're committed to helping you achieve your health goals through personalized guidance
              and support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="rounded-full bg-background w-16 h-16 flex items-center justify-center mb-4 mx-auto">
                      {benefit.icon}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xl font-semibold text-foreground mb-2 text-center">
                    {benefit.title}
                  </CardContent>
                  <CardFooter className="text-foreground/80 text-center">
                    {benefit.description}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Three simple steps to your personalized health journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Take the Quiz",
                description: "Answer a few questions about your lifestyle, preferences, and goals.",
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
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-5xl font-bold text-primary absolute top-0 left-0">
                      {step.number}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </CardContent>
                  <CardFooter className="text-foreground/80">{step.description}</CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="xl" className="bg-primary hover:bg-primary/90 rounded-full">
              <Link to="/quiz">
                Start Your Journey <ArrowRight className="mt-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Success Stories</h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Real people, real results. Here's what our community has to say.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="overflow-hidden">
                      <Quote className={`h-8 w-8 text-primary mb-4`} />
                      <p className="text-foreground/80 mb-6 italic line-clamp-2">
                        "{testimonial.testimonial}"
                      </p>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className={`text-primary text-sm`}>{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Life?</h2>
            <p className="text-lg mb-8">
              Start your journey to a healthier you today. Take our quick quiz to get your
              personalized plan.
            </p>
            <Button asChild size="xl" className="rounded-full">
              <Link to="/quiz">
                Take the Quiz <ArrowRight className="mt-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
