
'use client';

import { useState, useEffect } from 'react';

interface TransitioningHeadlineProps {
  phrases: string[];
  className?: string;
}

export const TransitioningHeadline: React.FC<TransitioningHeadlineProps> = ({ phrases, className }) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % phrases.length);
        setVisible(true);
      }, 400);
    }, 2500);
    return () => clearInterval(interval);
  }, [phrases.length]);

  return (
    <div className={`relative h-12 md:h-14 flex items-center justify-center ${className}`}>
      <h1
        className="text-4xl md:text-5xl font-bold tracking-tight text-primary text-center transition-opacity duration-400"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {phrases[index]}
      </h1>
    </div>
  );
};
