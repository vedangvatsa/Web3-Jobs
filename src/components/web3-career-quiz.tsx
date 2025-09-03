
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { quizData, getResult } from '@/lib/quiz';
import type { QuizResult } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Lightbulb, BarChart, Users, Zap, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const icons: { [key: string]: React.ElementType } = {
  builder: Zap,
  strategist: Lightbulb,
  analyst: BarChart,
  weaver: Users,
};

export function Web3CareerQuiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, 'a' | 'b'>>({});
  const [result, setResult] = React.useState<QuizResult | null>(null);
  const [showResult, setShowResult] = React.useState(false);

  const totalQuestions = quizData.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswer = (questionId: number, answer: 'a' | 'b') => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const finalResult = getResult(newAnswers);
      setResult(finalResult);
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setShowResult(false);
  };
  
  if (showResult && result) {
    const ResultIcon = icons[result.archetype.toLowerCase()] || BrainCircuit;
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 md:py-16 max-w-3xl"
      >
        <Card className="text-center shadow-2xl border-primary/20">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <ResultIcon className="h-10 w-10 text-primary" />
            </div>
            <CardDescription>Your Web3 Archetype is:</CardDescription>
            <CardTitle className="text-4xl font-bold text-primary">{result.archetype}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p className="text-lg italic">{result.description}</p>
            <div className="text-left py-4">
                <h4 className="font-semibold text-foreground mb-2">Key Traits:</h4>
                <ul className="space-y-1 list-disc pl-5">
                    {result.traits.map((trait, i) => <li key={i}>{trait}</li>)}
                </ul>
            </div>
            <div className="text-left">
                <h4 className="font-semibold text-foreground mb-2">Your Recommended Web3 Career Paths:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {result.roles.map(role => (
                        <Card key={role.title} className="bg-secondary/50">
                            <CardContent className="p-4">
                                <h5 className="font-bold">{role.title}</h5>
                                <p className="text-xs text-muted-foreground">{role.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button onClick={handleRestart} size="lg">Take the Quiz Again</Button>
            <p className="text-xs text-muted-foreground pt-4">This is a fun guide, not definitive career advice. Explore all roles to find your true passion!</p>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  const currentQuestion = quizData[currentQuestionIndex];

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-2xl">
      <Card className="shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-2"><BrainCircuit className="text-primary"/> Web3 Career Quiz</CardTitle>
            <span className="text-sm font-medium text-muted-foreground">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>
          <CardDescription>A short quiz to discover your Web3 personality archetype and the roles that match.</CardDescription>
          <Progress value={progress} className="w-full pt-2" />
        </CardHeader>
        <CardContent>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                >
                    <h3 className="text-xl md:text-2xl font-semibold text-center h-24 flex items-center justify-center">
                        {currentQuestion.question}
                    </h3>
                    <div className="mt-8 grid grid-cols-1 gap-4">
                        <Button
                            variant="outline"
                            className="text-base h-auto py-4 flex items-start justify-start text-left whitespace-normal"
                            onClick={() => handleAnswer(currentQuestion.id, 'a')}
                        >
                            <span className="font-bold mr-3">A)</span> {currentQuestion.options.a}
                        </Button>
                        <Button
                            variant="outline"
                            className="text-base h-auto py-4 flex items-start justify-start text-left whitespace-normal"
                            onClick={() => handleAnswer(currentQuestion.id, 'b')}
                        >
                            <span className="font-bold mr-3">B)</span> {currentQuestion.options.b}
                        </Button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
