import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import React from 'react';
import { ColorTheme } from '../../utils/colorUtils';

interface TestimonialProps {
  testimonial: {
    name: string;
    image: string;
    role: string;
    testimonial: string;
  };
  colorTheme: ColorTheme;
}

const TestimonialCard: React.FC<TestimonialProps> = ({ testimonial, colorTheme }) => {
  return (
    <motion.div 
      className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl hover:shadow-lg transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Quote className={`h-8 w-8 ${colorTheme.primaryText} mb-4`} />
      <p className="text-gray-600 dark:text-gray-300 mb-6 italic">"{testimonial.testimonial}"</p>
      <div className="flex items-center">
        <img 
          src={testimonial.image} 
          alt={testimonial.name} 
          className="w-12 h-12 rounded-full object-cover mr-4"
        />
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200">{testimonial.name}</h4>
          <p className={`${colorTheme.primaryText} text-sm`}>{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;