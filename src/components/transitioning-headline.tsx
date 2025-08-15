
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TransitioningHeadlineProps {
  phrases: string[];
  className?: string;
}

export const TransitioningHeadline: React.FC<TransitioningHeadlineProps> = ({ phrases, className }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % phrases.length);
    }, 2500); // Change text every 2.5 seconds

    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <div className={`relative h-12 md:h-14 flex items-center justify-center ${className}`}>
      <AnimatePresence mode="wait">
        <motion.h1
          key={phrases[index]}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
          className="text-4xl md:text-5xl font-bold tracking-tight text-primary text-center"
        >
          {phrases[index]}
        </motion.h1>
      </AnimatePresence>
    </div>
  );
};
