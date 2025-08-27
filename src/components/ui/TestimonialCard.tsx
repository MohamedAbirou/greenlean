import React from 'react';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';

interface TestimonialProps {
  testimonial: {
    name: string;
    image: string;
    role: string;
    testimonial: string;
  };
}

const TestimonialCard: React.FC<TestimonialProps> = ({ testimonial }) => {
  return (
    <motion.div 
      className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl hover:shadow-lg transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Quote className="h-8 w-8 text-green-500 mb-4" />
      <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{testimonial.testimonial}"</p>
      <div className="flex items-center">
        <img 
          src={testimonial.image} 
          alt={testimonial.name} 
          className="w-12 h-12 rounded-full object-cover mr-4"
        />
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200">{testimonial.name}</h4>
          <p className="text-green-500 text-sm">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;