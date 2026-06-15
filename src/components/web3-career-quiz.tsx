'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { quizData, getResult } from '@/lib/quiz';
import type { QuizResult } from '@/types';

import { BrainCircuit, Lightbulb, BarChart, Users, Zap, ArrowRight, Rss, Twitter } from 'lucide-react';
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
  const shareText = encodeURIComponent(`I took the Web3 Archetype Assessment and my result is: ${result.archetype}! Find out your Web3 personality:`);
  const shareUrl = encodeURIComponent('https://hashtagweb3.com/web3-career-quiz');
  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}&via=hashtag_web3`;

  return (
   <div className="container mx-auto px-4 py-8 md:py-16 max-w-6xl quiz-result-enter">
    <Card className="text-center shadow-sm border-primary/20">
     <CardHeader>
      
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
            <Card key={role.title} className="bg-secondary/50 text-left">
              <CardContent className="p-4 h-full flex flex-col">
                <h5 className="font-bold text-foreground">{role.title}</h5>
                <p className="text-xs text-muted-foreground flex-grow">{role.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
     </CardContent>
     <CardFooter className="flex-col gap-4 !pt-6">
      <div className="flex items-center gap-4">
       <Button onClick={() => window.open(twitterUrl, '_blank')} variant="outline">
         <Twitter className="h-4 w-4 mr-2" /> Share on X
       </Button>
      </div>
      <Card className="mt-6 w-full bg-muted/30 border shadow-none">
       <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
         
         <div>
           <h3 className="text-lg font-bold text-foreground mb-1">Find Your Role</h3>
           <p className="text-sm text-muted-foreground">Now that you know your archetype, find the perfect job on our Telegram channel with over 60,000 subscribers.</p>
         </div>
         <a href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mt-4 md:mt-0">
           <Button>
             Join Job Feed <ArrowRight className="ml-2 h-4 w-4"/>
           </Button>
         </a>
       </CardContent>
      </Card>
      <Button onClick={handleRestart} variant="outline" className="mt-4">Take Assessment Again</Button>
      <p className="text-xs text-muted-foreground pt-4">This is a fun guide, not definitive career advice. Explore all roles to find your true passion!</p>
     </CardFooter>
    </Card>
   </div>
  );
 }

 const currentQuestion = quizData[currentQuestionIndex];

 return (
  <div className="container mx-auto px-4 py-8 md:py-16 max-w-6xl">
   <Card className="shadow-sm">
    <CardHeader>
     <div className="flex items-center justify-between mb-2">
      <CardTitle className="text-2xl font-bold flex items-center gap-2"><BrainCircuit className="text-primary"/> Archetype Assessment</CardTitle>
      <span className="text-sm font-medium text-muted-foreground">
       {currentQuestionIndex + 1} / {totalQuestions}
      </span>
     </div>
     <CardDescription>Discover your Web3 personality archetype and the roles that match.</CardDescription>
     <Progress value={progress} className="w-full pt-2" />
    </CardHeader>
    <CardContent>
        <div
          key={currentQuestionIndex}
          className="quiz-question-enter"
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
        </div>
    </CardContent>
   </Card>
  </div>
 );
}
