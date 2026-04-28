
'use client';

import * as React from 'react';
import { Header } from '@/components/header';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import {
 Accordion,
 AccordionContent,
 AccordionItem,
 AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
 Briefcase,
 GitBranch,
 Search,
 Lock,
 Heart,
 FileText,
 Users,
 BarChart,
 Layers,
 Puzzle,
 Network,
 Palette,
 Scale,
 Shield,
 Lightbulb,
 Link as LinkIcon,
 BookOpen,
 Rss,
 ArrowRight
} from 'lucide-react';
import { interviewData, Role } from '@/lib/interview-questions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TransitioningHeadline } from '@/components/transitioning-headline';
import { Button } from '@/components/ui/button';

const difficultyColors: { [key: string]: string } = {
 Foundation: 'bg-green-500/10 text-green-700 border-green-400/50',
 Intermediate: 'bg-blue-500/10 text-blue-700 border-blue-400/50',
 Advanced: 'bg-orange-500/10 text-orange-700 border-orange-400/50',
 Expert: 'bg-red-500/10 text-red-700 border-red-400/50',
};

const categoryColors: { [key: string]: string } = {
  Knowledge: 'bg-gray-100 text-gray-800',
  Practical: 'bg-indigo-100 text-indigo-800',
  Debugging: 'bg-pink-100 text-pink-800',
  Design: 'bg-purple-100 text-purple-800',
  Architecture: 'bg-yellow-100 text-yellow-800',
  Risk: 'bg-red-100 text-red-800',
  Strategy: 'bg-green-100 text-green-800',
  Communication: 'bg-sky-100 text-sky-800',
};

const roleIcons: { [key: string]: React.ElementType } = {
 'Solidity / Smart Contract Developer (EVM)': GitBranch,
 'Smart Contract Auditor': Search,
 'DeFi Protocol Engineer': Layers,
 'Backend Web3 Engineer': Network,
 'Frontend dApp Engineer': Palette,
 'Zero-Knowledge Engineer': Puzzle,
 'Cryptography Engineer': Lock,
 'L2 / Rollups Engineer': Layers,
 'Token Economist / Tokenomics Designer': Lightbulb,
 'On-chain Data Analyst': BarChart,
 'Product Manager, Web3': Briefcase,
 'Community Lead / Community Manager': Users,
 'DAO Operations / Governance': Users,
 'Security / DevSecOps for Web3': Shield,
 'NFT / GameFi Product Manager': Palette,
 'Legal / Compliance Associate, Web3': Scale,
};


const QuestionItem = ({ question }: { question: any }) => (
 <div className="border-b py-4">
  <div className="flex flex-wrap items-center gap-2 mb-2">
   <Badge variant="outline" className="font-mono text-xs">{question.id}</Badge>
   <Badge className={cn('text-xs', difficultyColors[question.difficulty])}>{question.difficulty}</Badge>
   <Badge className={cn('text-xs', categoryColors[question.category] || categoryColors['Knowledge'])}>{question.category}</Badge>
  </div>
  <p className="font-semibold text-primary">{question.question}</p>
  
  <div className="mt-3 space-y-3 text-sm text-muted-foreground">
   <div>
    <h4 className="font-semibold text-foreground mb-1">Ideal Answer</h4>
    <p className="italic">{question.idealAnswer.coreIdea}</p>
    <ul className="list-disc pl-5 mt-1 space-y-1">
     {question.idealAnswer.keyPoints.map((p: string, i: number) => <li key={i}>{p}</li>)}
    </ul>
    {question.idealAnswer.example && (
     <Card className="my-2 bg-card">
      <CardContent className="p-3">
       <pre className="text-xs whitespace-pre-wrap font-code bg-transparent p-0"><code>{question.idealAnswer.example}</code></pre>
      </CardContent>
     </Card>
    )}
   </div>

   <div>
    <h4 className="font-semibold text-foreground mb-1">Why this matters:</h4>
    <ul className="list-disc pl-5 space-y-1">
      {question.whyThisMatters.map((p: string, i: number) => <li key={i}>{p}</li>)}
    </ul>
   </div>

    <div>
    <h4 className="font-semibold text-foreground mb-1">Follow-ups:</h4>
    <ul className="list-disc pl-5 space-y-1">
      {question.followUps.map((p: string, i: number) => <li key={i}>{p}</li>)}
    </ul>
   </div>

   <div>
    <h4 className="font-semibold text-foreground mb-1 text-destructive/80">Red Flags:</h4>
    <ul className="list-disc pl-5 space-y-1 text-destructive/80">
      {question.redFlags.map((p: string, i: number) => <li key={i}>{p}</li>)}
    </ul>
   </div>
  </div>
 </div>
);

const RoleSection = ({ roleData }: { roleData: Role }) => {
 const Icon = roleIcons[roleData.role] || Briefcase;
 return (
  <div id={roleData.id} className="pt-8">
   <div className="flex items-center gap-3 mb-4">
    <Icon className="h-8 w-8 text-primary" />
    <div>
     <h2 className="text-2xl font-bold">{roleData.role}</h2>
     <p className="text-sm text-muted-foreground">{roleData.snapshot}</p>
    </div>
   </div>
   <Accordion type="single" collapsible className="w-full">
    {Object.entries(roleData.questions).map(([difficulty, questions]) => (
     <AccordionItem value={difficulty} key={difficulty}>
      <AccordionTrigger className="text-lg font-medium">{difficulty} Questions</AccordionTrigger>
      <AccordionContent>
       {questions.map((q, i) => <QuestionItem key={i} question={q} />)}
      </AccordionContent>
     </AccordionItem>
    ))}
   </Accordion>
  </div>
 );
};


const faqSchema = {
 '@context': 'https://schema.org',
 '@type': 'FAQPage',
 mainEntity: interviewData.roles.flatMap(role =>
  Object.values(role.questions).flat().slice(0, 2).map((q: any) => ({
   '@type': 'Question',
   name: q.question,
   acceptedAnswer: {
    '@type': 'Answer',
    text: [q.idealAnswer.coreIdea, ...(q.idealAnswer.keyPoints || []).slice(0, 2)].join(' '),
   },
  }))
 ).slice(0, 40),
};

export default function InterviewQuestionBankPage() {
  const headlines = [
   "Web3 Interview Question Bank",
   "Ace Your Next Interview",
   "200+ Role-Specific Questions",
   "Land Your Dream Web3 Job"
  ];

 return (
  <div className="flex flex-col min-h-screen">
   <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
   />
   <ToolUsageTracker toolName="Interview Questions" />
   <Header />
   <main className="flex-grow">
     <div className="container mx-auto px-4 py-8 md:py-16">
      <section className="text-center mb-12 max-w-4xl mx-auto">
        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
         <BookOpen className="h-10 w-10 text-primary" />
       </div>
       <h1 className="sr-only">Web3 Interview Questions and Preparation Guide</h1>
       <TransitioningHeadline phrases={headlines} />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
       <aside className="md:col-span-3 md:sticky top-24 self-start">
        <Card className="bg-card">
         <CardHeader>
           <CardTitle>Quick Navigation</CardTitle>
         </CardHeader>
         <CardContent>
           <ul className="space-y-2 text-sm">
             {interviewData.roles.map(role => (
               <li key={role.id}>
                 <a href={`#${role.id}`} className="text-muted-foreground hover:text-primary transition-colors">{role.role}</a>
               </li>
             ))}
             <li>
               <a href="#appendix-a" className="text-muted-foreground hover:text-primary transition-colors">Appendix A: Behavioral</a>
             </li>
              <li>
               <a href="#appendix-b" className="text-muted-foreground hover:text-primary transition-colors">Appendix B: Scoring Guide</a>
             </li>
           </ul>
         </CardContent>
        </Card>
       </aside>

       <div className="md:col-span-9">
        <Card className="mb-8 bg-card">
         <CardHeader>
           <CardTitle>How to use this bank</CardTitle>
         </CardHeader>
         <CardContent className="space-y-2 text-muted-foreground">
           <p>This question bank is a reference for both hiring managers and candidates.</p>
           <ul className="list-disc pl-5 space-y-1">
             <li>Use difficulty tags to tailor questions to the role's seniority.</li>
             <li>Use "Follow-ups" to probe for depth and differentiate between good and great candidates.</li>
             <li>"Red Flags" and "Common Pitfalls" highlight frequent misconceptions or unsafe patterns.</li>
             <li>The scoring rubric provides a framework for consistent evaluation across interviews.</li>
           </ul>
         </CardContent>
        </Card>

        {interviewData.roles.map(role => (
         <RoleSection key={role.id} roleData={role} />
        ))}

        <div id="appendix-a" className="pt-8">
         <h2 className="text-2xl font-bold mb-4">Appendix A: Universal Behavioral Questions</h2>
         <Card className="bg-card">
           <CardContent className="pt-6">
             <ul className="list-decimal pl-5 space-y-3 text-muted-foreground">
               {interviewData.appendixA.map((item, i) => (
                 <li key={i}>
                   <p className="font-semibold text-foreground">{item.question}</p>
                   <p className="text-sm italic">{item.pattern}</p>
                 </li>
               ))}
             </ul>
           </CardContent>
         </Card>
        </div>

         <div id="appendix-b" className="pt-8">
         <h2 className="text-2xl font-bold mb-4">Appendix B: Scoring Guide</h2>
          <Card className="bg-card">
           <CardContent className="pt-6 space-y-2 text-muted-foreground">
             <p>{interviewData.appendixB.description}</p>
             <ul className="list-disc pl-5 space-y-1">
               {interviewData.appendixB.guide.map((item, i) => (
                 <li key={i}><strong className="text-foreground">{item.score}:</strong> {item.meaning}</li>
               ))}
             </ul>
           </CardContent>
         </Card>
        </div>
        
         <Card className="mt-12 col-span-full bg-primary/5 border-primary/20">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full hidden md:block">
              <Rss className="h-8 w-8 text-primary"/>
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary mb-1">Looking for a Web3 Job?</h3>
              <p className="text-muted-foreground">Join our Telegram channel with over 60,000 subscribers to get the latest job postings.</p>
            </div>
            <a href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mt-4 md:mt-0">
              <Button size="lg">
                Join Job Feed <ArrowRight className="ml-2 h-4 w-4"/>
              </Button>
            </a>
          </CardContent>
        </Card>

         <div className="pt-8">
         <p className="text-xs text-center text-muted-foreground">{interviewData.disclaimer}</p>
        </div>

       </div>
      </div>
     </div>
   </main>
  </div>
 );
}
