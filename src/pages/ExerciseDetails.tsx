import { ArrowLeft, BarChart, Check, Clock, Tag } from 'lucide-react';
import React from 'react';
import { Link, useParams } from 'react-router-dom';

interface Exercise {
  id: number;
  title: string;
  description: string;
  image: string;
  duration: string;
  intensity: 'Low' | 'Medium' | 'High';
  category: 'Cardio' | 'Strength' | 'Flexibility';
  videoId: string;
  benefits: string[];
  instructions: string[];
  tips: string[];
  equipment: string[];
  calories: string;
}

const exercisesData: { [key: number]: Exercise } = {
  1: {
    id: 1,
    title: 'HIIT Cardio Workout',
    description: 'High-intensity interval training to maximize calorie burn in a short amount of time.',
    image: 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    duration: '30 min',
    intensity: 'High',
    category: 'Cardio',
    videoId: 'ml6cT4AZdqI',
    benefits: [
      'Increases metabolism for hours after workout',
      'Improves cardiovascular endurance',
      'Burns maximum calories in minimum time',
      'Enhances fat burning',
      'Builds lean muscle'
    ],
    instructions: [
      'Warm up for 5 minutes with light cardio',
      'Perform 30 seconds of high-intensity exercise',
      'Rest or perform low-intensity exercise for 30 seconds',
      'Repeat for 20 minutes',
      'Cool down for 5 minutes'
    ],
    tips: [
      'Start slowly and build up intensity',
      'Listen to your body and take breaks when needed',
      'Stay hydrated throughout the workout',
      'Focus on form over speed',
      'Breathe steadily and consistently'
    ],
    equipment: [
      'None required (bodyweight exercises)',
      'Optional: jump rope',
      'Optional: exercise mat',
      'Water bottle'
    ],
    calories: '300-400'
  },
  2: {
    id: 2,
    title: 'Full Body Strength Training',
    description: 'Build muscle and increase metabolism with this comprehensive strength workout.',
    image: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    duration: '45 min',
    intensity: 'Medium',
    category: 'Strength',
    videoId: 'UBMk30rjy0o',
    benefits: [
      'Builds lean muscle mass',
      'Increases resting metabolic rate',
      'Improves bone density',
      'Enhances functional strength',
      'Reduces risk of injury'
    ],
    instructions: [
      'Start with a 5-minute dynamic warm-up',
      'Perform exercises in circuit format',
      'Complete 3 sets of each exercise',
      'Rest 60 seconds between sets',
      'End with stretching'
    ],
    tips: [
      'Focus on proper form',
      'Breathe steadily throughout exercises',
      'Increase weights gradually',
      'Stay hydrated',
      'Get adequate rest between workouts'
    ],
    equipment: [
      'Dumbbells',
      'Exercise mat',
      'Resistance bands',
      'Water bottle'
    ],
    calories: '400-500'
  },
  3: {
    id: 3,
    title: 'Yoga for Weight Loss',
    description: 'A flowing yoga sequence designed to burn calories while improving flexibility and mindfulness.',
    image: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    duration: '40 min',
    intensity: 'Low',
    category: 'Flexibility',
    videoId: '7HXD24WkWhs',
    benefits: [
      'Improves flexibility and balance',
      'Reduces stress and anxiety',
      'Builds lean muscle mass',
      'Enhances mindfulness',
      'Promotes better sleep'
    ],
    instructions: [
      'Start with sun salutations to warm up',
      'Flow through standing poses',
      'Include balance poses',
      'Add strength-building poses',
      'End with relaxation'
    ],
    tips: [
      'Focus on breath coordination',
      'Move mindfully between poses',
      'Listen to your body',
      'Stay hydrated',
      'Practice regularly for best results'
    ],
    equipment: [
      'Yoga mat',
      'Optional blocks',
      'Optional strap',
      'Comfortable clothing'
    ],
    calories: '200-300'
  },
  4: {
    id: 4,
    title: 'Fat-Burning Running Plan',
    description: 'Interval running workout designed to maximize fat burning and cardiovascular health.',
    image: 'https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    duration: '35 min',
    intensity: 'High',
    category: 'Cardio',
    videoId: 'oBNTQGRCuRw',
    benefits: [
      'Maximizes calorie burn',
      'Improves cardiovascular endurance',
      'Boosts metabolism',
      'Strengthens legs and core',
      'Enhances mental toughness'
    ],
    instructions: [
      'Warm up with 5 minutes of light jogging',
      'Run at high intensity for 1 minute',
      'Recover with 2 minutes of light jogging',
      'Repeat intervals 8-10 times',
      'Cool down with 5 minutes of walking'
    ],
    tips: [
      'Start gradually and build up intensity',
      'Wear proper running shoes',
      'Stay hydrated throughout',
      'Focus on form over speed',
      'Listen to your body'
    ],
    equipment: [
      'Running shoes',
      'Comfortable clothing',
      'Water bottle',
      'Optional: fitness tracker'
    ],
    calories: '400-500'
  },
  5: {
    id: 5,
    title: 'Core and Abs Workout',
    description: 'Strengthen your core muscles to improve posture, stability, and create a toned midsection.',
    image: 'https://images.pexels.com/photos/3289711/pexels-photo-3289711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    duration: '25 min',
    intensity: 'Medium',
    category: 'Strength',
    videoId: '8PwoytUU06g',
    benefits: [
      'Strengthens core muscles',
      'Improves posture',
      'Reduces back pain',
      'Enhances stability',
      'Tones abdominal area'
    ],
    instructions: [
      'Begin with a 5-minute warm-up',
      'Perform each exercise for 45 seconds',
      'Rest for 15 seconds between exercises',
      'Complete 3 rounds',
      'End with stretching'
    ],
    tips: [
      'Keep your core engaged throughout',
      'Focus on quality over quantity',
      'Breathe steadily',
      'Maintain proper form',
      'Progress gradually'
    ],
    equipment: [
      'Exercise mat',
      'Optional: resistance band',
      'Optional: light weights',
      'Water bottle'
    ],
    calories: '150-200'
  },
  6: {
    id: 6,
    title: 'Low-Impact Full Body Workout',
    description: 'Joint-friendly exercises that provide a full body workout without high-impact movements.',
    image: 'https://images.pexels.com/photos/6922148/pexels-photo-6922148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    duration: '30 min',
    intensity: 'Low',
    category: 'Strength',
    videoId: 'GJ35av5X-eo',
    benefits: [
      'Joint-friendly exercises',
      'Full body muscle engagement',
      'Improves strength and endurance',
      'Suitable for beginners',
      'Low risk of injury'
    ],
    instructions: [
      'Start with gentle mobility exercises',
      'Perform each exercise for 40 seconds',
      'Rest for 20 seconds between exercises',
      'Complete 3 rounds',
      'Cool down with light stretching'
    ],
    tips: [
      'Focus on controlled movements',
      'Maintain proper alignment',
      'Breathe steadily',
      'Progress at your own pace',
      'Stay consistent with practice'
    ],
    equipment: [
      'Exercise mat',
      'Light dumbbells',
      'Resistance bands',
      'Water bottle'
    ],
    calories: '200-300'
  },
  7: {
    id: 7,
    title: 'Pilates for Core Strength',
    description: 'Focus on core strength and flexibility with controlled, precise movements.',
    image: 'https://images.pexels.com/photos/4662438/pexels-photo-4662438.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    duration: '35 min',
    intensity: 'Medium',
    category: 'Flexibility',
    videoId: 'K56Z12XNQ5c',
    benefits: [
      'Strengthens core muscles',
      'Improves posture',
      'Increases flexibility',
      'Enhances body awareness',
      'Reduces back pain'
    ],
    instructions: [
      'Begin with breathing exercises',
      'Focus on core engagement',
      'Perform controlled movements',
      'Maintain proper alignment',
      'End with stretching'
    ],
    tips: [
      'Quality over quantity',
      'Focus on precise movements',
      'Maintain steady breathing',
      'Keep core engaged',
      'Progress gradually'
    ],
    equipment: [
      'Exercise mat',
      'Optional: Pilates ring',
      'Optional: small ball',
      'Comfortable clothing'
    ],
    calories: '150-250'
  },
  8: {
    id: 8,
    title: 'Bodyweight Circuit Training',
    description: 'Effective full-body workout using only your body weight for resistance.',
    image: 'https://images.pexels.com/photos/4162485/pexels-photo-4162485.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    duration: '30 min',
    intensity: 'High',
    category: 'Strength',
    videoId: 'oAPCPjnU1wA',
    benefits: [
      'No equipment needed',
      'Can be done anywhere',
      'Improves functional strength',
      'Builds endurance',
      'Burns calories efficiently'
    ],
    instructions: [
      'Warm up with dynamic stretches',
      'Perform exercises in circuit format',
      'Work for 45 seconds',
      'Rest for 15 seconds',
      'Complete 3-4 rounds'
    ],
    tips: [
      'Maintain proper form',
      'Modify exercises as needed',
      'Stay hydrated',
      'Keep moving between exercises',
      'Listen to your body'
    ],
    equipment: [
      'No equipment required',
      'Exercise mat (optional)',
      'Water bottle',
      'Timer'
    ],
    calories: '300-400'
  },
  9: {
    id: 9,
    title: 'Power Walking Routine',
    description: 'Brisk walking workout with intervals to boost calorie burn and endurance.',
    image: 'https://images.pexels.com/photos/4720236/pexels-photo-4720236.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    duration: '40 min',
    intensity: 'Low',
    category: 'Cardio',
    videoId: 'njeZ29umqVE',
    benefits: [
      'Low-impact cardio',
      'Improves heart health',
      'Burns calories',
      'Strengthens legs',
      'Suitable for all fitness levels'
    ],
    instructions: [
      'Start with regular pace warm-up',
      'Increase to brisk walking',
      'Add arm movements',
      'Include uphill sections if possible',
      'Cool down with slower pace'
    ],
    tips: [
      'Maintain good posture',
      'Swing arms naturally',
      'Take quick, short steps',
      'Breathe rhythmically',
      'Stay consistent'
    ],
    equipment: [
      'Comfortable walking shoes',
      'Weather-appropriate clothing',
      'Water bottle',
      'Optional: fitness tracker'
    ],
    calories: '200-300'
  },
  10: {
    id: 10,
    title: 'Resistance Band Workout',
    description: 'Full-body strength training using resistance bands for progressive overload.',
    image: 'https://images.pexels.com/photos/6453396/pexels-photo-6453396.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    duration: '35 min',
    intensity: 'Medium',
    category: 'Strength',
    videoId: '2_egnNlrDj0',
    benefits: [
      'Portable equipment',
      'Adaptable resistance',
      'Improves strength',
      'Enhances muscle tone',
      'Low impact on joints'
    ],
    instructions: [
      'Warm up with light exercises',
      'Check band condition',
      'Perform controlled movements',
      'Complete 3 sets per exercise',
      'Cool down and stretch'
    ],
    tips: [
      'Control the resistance',
      'Keep proper form',
      'Anchor bands securely',
      'Progress gradually',
      'Store bands properly'
    ],
    equipment: [
      'Resistance bands',
      'Exercise mat',
      'Water bottle',
      'Timer'
    ],
    calories: '250-350'
  },
  11: {
    id: 11,
    title: 'Dynamic Stretching Routine',
    description: 'Improve flexibility and mobility with dynamic stretching exercises.',
    image: 'https://images.pexels.com/photos/4662344/pexels-photo-4662344.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    duration: '25 min',
    intensity: 'Low',
    category: 'Flexibility',
    videoId: 'nPHfEnZD1Wk',
    benefits: [
      'Improves flexibility',
      'Enhances mobility',
      'Reduces injury risk',
      'Prepares body for exercise',
      'Improves circulation'
    ],
    instructions: [
      'Start with light movement',
      'Progress through all major muscle groups',
      'Maintain fluid movements',
      'Hold stretches briefly',
      'Increase range gradually'
    ],
    tips: [
      'Don\'t bounce',
      'Stay within comfortable range',
      'Breathe steadily',
      'Move smoothly',
      'Listen to your body'
    ],
    equipment: [
      'Exercise mat',
      'Comfortable clothing',
      'Water bottle',
      'Optional: yoga strap'
    ],
    calories: '100-150'
  },
  12: {
    id: 12,
    title: 'Tabata Training',
    description: 'High-intensity interval training with 20 seconds work and 10 seconds rest.',
    image: 'https://images.pexels.com/photos/6456301/pexels-photo-6456301.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    duration: '20 min',
    intensity: 'High',
    category: 'Cardio',
    videoId: 'XIeCMhNWFQQ',
    benefits: [
      'Maximum calorie burn',
      'Improves endurance',
      'Increases metabolism',
      'Time-efficient workout',
      'Builds mental toughness'
    ],
    instructions: [
      'Warm up thoroughly',
      'Work hard for 20 seconds',
      'Rest for 10 seconds',
      'Repeat 8 times',
      'Complete 4-8 rounds'
    ],
    tips: [
      'Give maximum effort',
      'Keep proper form',
      'Use interval timer',
      'Stay hydrated',
      'Scale as needed'
    ],
    equipment: [
      'Timer',
      'Exercise mat',
      'Water bottle',
      'Optional: weights'
    ],
    calories: '250-400'
  }
};

const ExerciseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const exercise = id ? exercisesData[parseInt(id)] : null;

  if (!exercise) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Exercise Not Found</h1>
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
              <h1 className="text-3xl font-bold text-foreground mb-4">{exercise.title}</h1>
              <p className="text-secondary-foreground mb-6">{exercise.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-secondary-foreground">{exercise.duration}</span>
                </div>
                <div className="flex items-center">
                  <BarChart className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-secondary-foreground">{exercise.intensity} Intensity</span>
                </div>
                <div className="flex items-center">
                  <Tag className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-secondary-foreground">{exercise.category}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-secondary-foreground">{exercise.calories} calories</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Section */}
        <div className="bg-card rounded-xl shadow-md p-3 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">Video Demonstration</h2>
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
            <h2 className="text-xl font-bold text-foreground mb-4">Instructions</h2>
            <ol className="space-y-3">
              {exercise.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-500 mr-3">
                    {index + 1}
                  </span>
                  <span className="text-secondary-foreground">{instruction}</span>
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
            <h2 className="text-xl font-bold text-foreground mb-4">Equipment Needed</h2>
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