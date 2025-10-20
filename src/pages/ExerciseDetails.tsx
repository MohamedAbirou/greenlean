import { exercises } from "@/data/exercises";
import { ArrowLeft, BarChart, Check, Clock, Tag } from "lucide-react";
import React from "react";
import { Link, useParams } from "react-router-dom";

const ExerciseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const exercise = id ? exercises.find((p) => p.id === Number(id)) : null;

  if (!exercise) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Exercise Not Found
            </h1>
            <Link
              to="/weight-loss"
              className="text-green-500 hover:text-green-600 inline-flex items-center"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Exercises
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/weight-loss"
          className="inline-flex items-center text-green-500 hover:text-green-600 mb-6"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Exercises
        </Link>

        {/* Hero Section */}
        <div className="bg-card rounded-xl shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src={exercise.image}
                alt={exercise.title}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="p-6 md:w-1/2">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                {exercise.title}
              </h1>
              <p className="text-secondary-foreground mb-6">
                {exercise.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-secondary-foreground">
                    {exercise.duration}
                  </span>
                </div>
                <div className="flex items-center">
                  <BarChart className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-secondary-foreground">
                    {exercise.intensity} Intensity
                  </span>
                </div>
                <div className="flex items-center">
                  <Tag className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-secondary-foreground">
                    {exercise.category}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-secondary-foreground">
                    {exercise.calories} calories
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Section */}
        <div className="bg-card rounded-xl shadow-md p-3 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Video Demonstration
          </h2>
          <div className="relative pb-[56.25%] h-0">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${exercise.videoId}`}
              title={`${exercise.title} demonstration`}
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Instructions and Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-card rounded-xl shadow-md p-3">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Instructions
            </h2>
            <ol className="space-y-3">
              {exercise.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-500 mr-3">
                    {index + 1}
                  </span>
                  <span className="text-secondary-foreground">
                    {instruction}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-card rounded-xl shadow-md p-3">
            <h2 className="text-xl font-bold text-foreground mb-4">Tips</h2>
            <ul className="space-y-3">
              {exercise.tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-secondary-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Benefits and Equipment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card rounded-xl shadow-md p-3">
            <h2 className="text-xl font-bold text-foreground mb-4">Benefits</h2>
            <ul className="space-y-3">
              {exercise.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-secondary-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card rounded-xl shadow-md p-3">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Equipment Needed
            </h2>
            <ul className="space-y-3">
              {exercise.equipment.map((item, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-secondary-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetails;
