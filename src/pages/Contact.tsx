import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Phone, MapPin, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSubmitStatus('loading');
      
      setTimeout(() => {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h1 
            className="text-3xl font-bold text-gray-800 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Contact Us
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Have questions or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Email</h3>
                    <a href="mailto:support@greenlean.com" className="text-sm text-gray-600 hover:text-green-500">
                      support@greenlean.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Address</h3>
                    <a 
                      href="https://maps.google.com/?q=229+West+28th+Street+New+York+NY+10001"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-green-500"
                    >
                      229 West 28th Street<br />
                      New York, NY 10001<br />
                      United States
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">Support Hours</h3>
                    <p className="text-sm text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                      Saturday: 10:00 AM - 4:00 PM EST<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm text-green-800">
                  For immediate assistance, please check our <Link to="/faq" className="text-green-600 font-medium hover:text-green-700">FAQ page</Link> or send us an email.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Send us a Message</h2>
              
              {submitStatus === 'success' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-700 mb-2">Message Sent Successfully!</h3>
                  <p className="text-green-600 mb-4">
                    Thank you for contacting us. We've received your message and will get back to you within 24-48 hours.
                  </p>
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    onClick={() => setSubmitStatus('idle')}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors ${
                          errors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Your name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors ${
                        errors.subject ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Diet Plan Question">Diet Plan Question</option>
                      <option value="Exercise Routine Question">Exercise Routine Question</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Partnership Inquiry">Partnership Inquiry</option>
                      <option value="Media Inquiry">Media Inquiry</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors ${
                        errors.message ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="How can we help you?"
                    ></textarea>
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      className={`w-full py-3 px-6 flex justify-center items-center rounded-lg text-white font-medium ${
                        submitStatus === 'loading' 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-green-500 hover:bg-green-600'
                      } transition-colors`}
                      disabled={submitStatus === 'loading'}
                    >
                      {submitStatus === 'loading' ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;