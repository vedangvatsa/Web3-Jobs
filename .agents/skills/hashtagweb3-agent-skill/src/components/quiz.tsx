'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Trophy } from 'lucide-react';

export interface QuizQuestion {
 question: string;
 options: string[];
 correct: number; // 0-indexed
 explanation: string;
}

interface QuizProps {
 title?: string;
 questions: QuizQuestion[];
}

export function Quiz({ title ="Check your understanding", questions }: QuizProps) {
 const [currentQ, setCurrentQ] = useState(0);
 const [selected, setSelected] = useState<number | null>(null);
 const [answered, setAnswered] = useState(false);
 const [score, setScore] = useState(0);
 const [finished, setFinished] = useState(false);
 const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));

 const q = questions[currentQ];

 const handleSelect = (idx: number) => {
  if (answered) return;
  setSelected(idx);
 };

 const handleSubmit = () => {
  if (selected === null) return;
  setAnswered(true);
  const newAnswers = [...answers];
  newAnswers[currentQ] = selected;
  setAnswers(newAnswers);
  if (selected === q.correct) {
   setScore(s => s + 1);
  }
 };

 const handleNext = () => {
  if (currentQ < questions.length - 1) {
   setCurrentQ(c => c + 1);
   setSelected(null);
   setAnswered(false);
  } else {
   setFinished(true);
  }
 };

 const handleRetry = () => {
  setCurrentQ(0);
  setSelected(null);
  setAnswered(false);
  setScore(0);
  setFinished(false);
  setAnswers(new Array(questions.length).fill(null));
 };

 if (finished) {
  const pct = Math.round((score / questions.length) * 100);
  return (
   <div className="my-8 border rounded-lg p-6 bg-background">
    <div className="text-center">
     <Trophy className={`h-12 w-12 mx-auto mb-3 ${pct >= 70 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
     <h3 className="text-xl font-semibold mb-1">
      {pct >= 70 ? 'Great job!' : 'Keep learning!'}
     </h3>
     <p className="text-3xl font-bold mb-1">{score}/{questions.length}</p>
     <p className="text-sm text-muted-foreground mb-4">{pct}% correct</p>
     
     <div className="flex justify-center gap-1.5 mb-6">
      {questions.map((_, i) => (
       <div
        key={i}
        className={`w-3 h-3 rounded-full ${
         answers[i] === questions[i].correct
          ? 'bg-green-500'
          : 'bg-red-400'
        }`}
       />
      ))}
     </div>

     <button
      onClick={handleRetry}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border hover:bg-muted transition-colors"
     >
      <RotateCcw className="h-4 w-4" />
      Try again
     </button>
    </div>
   </div>
  );
 }

 return (
  <div className="my-8 border rounded-lg overflow-hidden bg-background">
   {/* Header */}
   <div className="px-6 py-4 border-b bg-muted/30">
    <div className="flex items-center justify-between">
     <h3 className="font-semibold text-sm">{title}</h3>
     <span className="text-xs text-muted-foreground font-mono">
      {currentQ + 1} / {questions.length}
     </span>
    </div>
    {/* Progress bar */}
    <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
     <div
      className="h-full bg-primary rounded-full transition-all duration-300"
      style={{ width: `${((currentQ + (answered ? 1 : 0)) / questions.length) * 100}%` }}
     />
    </div>
   </div>

   {/* Question */}
   <div className="p-6">
    <p className="font-medium text-base mb-4">{q.question}</p>

    <div className="space-y-2">
     {q.options.map((opt, idx) => {
      let classes = 'border rounded-lg px-4 py-3 text-sm cursor-pointer transition-all text-left w-full';
      
      if (answered) {
       if (idx === q.correct) {
        classes += ' border-green-500 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-200';
       } else if (idx === selected && idx !== q.correct) {
        classes += ' border-red-400 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-200';
       } else {
        classes += ' border-muted text-muted-foreground opacity-50';
       }
      } else if (idx === selected) {
       classes += ' border-primary bg-primary/5 ring-1 ring-primary';
      } else {
       classes += ' border-muted hover:border-foreground/30 hover:bg-muted/30';
      }

      return (
       <button
        key={idx}
        onClick={() => handleSelect(idx)}
        className={classes}
        disabled={answered}
       >
        <span className="flex items-center gap-3">
         <span className="shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono">
          {String.fromCharCode(65 + idx)}
         </span>
         <span>{opt}</span>
         {answered && idx === q.correct && <CheckCircle2 className="h-4 w-4 ml-auto shrink-0 text-green-600" />}
         {answered && idx === selected && idx !== q.correct && <XCircle className="h-4 w-4 ml-auto shrink-0 text-red-500" />}
        </span>
       </button>
      );
     })}
    </div>

    {/* Explanation */}
    {answered && (
     <div className={`mt-4 p-4 rounded-lg text-sm ${
      selected === q.correct
       ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900'
       : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900'
     }`}>
      <p className="font-medium mb-1">
       {selected === q.correct ? 'Correct!' : 'Not quite.'}
      </p>
      <p className="text-muted-foreground">{q.explanation}</p>
     </div>
    )}

    {/* Action buttons */}
    <div className="flex justify-end mt-4">
     {!answered ? (
      <button
       onClick={handleSubmit}
       disabled={selected === null}
       className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
       Check answer
      </button>
     ) : (
      <button
       onClick={handleNext}
       className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
       {currentQ < questions.length - 1 ? 'Next question' : 'See results'}
       <ChevronRight className="h-4 w-4" />
      </button>
     )}
    </div>
   </div>
  </div>
 );
}
