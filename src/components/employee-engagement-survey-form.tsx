'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Smile, Briefcase, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { Slider } from './ui/slider';
import { Separator } from './ui/separator';

const engagementSurveySchema = z.object({
 satisfaction: z.number().min(1).max(10),
 recommend: z.number().min(1).max(10),
 alignment: z.number().min(1).max(10),
 recognition: z.number().min(1).max(10),
 feedback: z.number().min(1).max(10),
 growth: z.number().min(1).max(10),
 proudOf: z.string().optional(),
 improvement: z.string().optional(),
 finalThoughts: z.string().optional(),
});

type EngagementSurveyData = z.infer<typeof engagementSurveySchema>;

export function EmployeeEngagementSurveyForm() {
 const { toast } = useToast();
 const form = useForm<EngagementSurveyData>({
  resolver: zodResolver(engagementSurveySchema),
  defaultValues: {
   satisfaction: 8,
   recommend: 9,
   alignment: 7,
   recognition: 6,
   feedback: 7,
   growth: 8,
   proudOf: "",
   improvement: "",
   finalThoughts: "",
  },
 });

 const handleDownload = form.handleSubmit(async (data) => {
  try {
   const { default: jsPDF } = await import('jspdf');
   const doc = new jsPDF('p', 'pt', 'a4');
   const margin = 50;
   const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;
   let y = margin;

   doc.setFontSize(18).setFont('helvetica', 'bold').setTextColor('#111827');
   doc.text('Employee Engagement Pulse Survey', margin, y);
   y += 40;

   const addRatingQuestion = (title: string) => {
    doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#374151');
    const titleLines = doc.splitTextToSize(title, contentWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 12 + 8;
    
    doc.setFontSize(10).setFont('helvetica', 'normal');
    let radioX = margin;
    for (let i = 1; i <= 10; i++) {
     doc.circle(radioX, y, 5);
     doc.text(String(i), radioX - 2, y + 15);
     radioX += 30;
    }
    y += 35;
   }
   
   const addOpenEndedQuestion = (title: string, lines: number) => {
     doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#374151');
     const titleLines = doc.splitTextToSize(title, contentWidth);
     doc.text(titleLines, margin, y);
     y += titleLines.length * 12 + 15;
     doc.setDrawColor(229, 231, 235);
     for(let i=0; i<lines; i++){
      doc.line(margin, y, contentWidth + margin, y);
      y += 20;
     }
     y += 10;
   }

   addRatingQuestion("On a scale of 1-10, how satisfied are you with your role?");
   addRatingQuestion("On a scale of 1-10, how likely are you to recommend working here to a friend?");
   addRatingQuestion("On a scale of 1-10, how well do you feel your work aligns with the company's goals?");
   addRatingQuestion("On a scale of 1-10, how well do you feel recognized for your contributions?");
   addRatingQuestion("On a scale of 1-10, how satisfied are you with the feedback you receive?");
   addRatingQuestion("On a scale of 1-10, how satisfied are you with your opportunities for growth?");
   
   doc.addPage();
   y = margin;

   addOpenEndedQuestion("What is something you're proud of from the last quarter?", 3);
   addOpenEndedQuestion("What is one thing that could be improved?", 3);
   addOpenEndedQuestion("Any final thoughts or comments?", 4);

   doc.save('Employee_Engagement_Survey_Template.pdf');
   toast({ title: "Success!", description: "Survey template downloaded as PDF." });
  } catch (error) {
   console.error(error);
   toast({ variant: 'destructive', title: "Error", description: "Failed to generate PDF." });
  }
 });

 return (
  <div className="container mx-auto py-12">
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
         
        <CardTitle className="text-3xl">Employee Engagement Pulse Survey</CardTitle>
        <CardDescription className="max-w-2xl mx-auto">
          Quickly gauge team morale, satisfaction, and overall engagement with this pulse survey. Regular feedback is key to building a thriving culture and identifying potential issues before they become major problems.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8">
           <div className="space-y-2">
            <Label>On a scale of 1-10, how satisfied are you with your current role? ({form.watch('satisfaction')})</Label>
            <Slider defaultValue={[8]} max={10} min={1} step={1} onValueChange={(v) => form.setValue('satisfaction', v[0])}/>
          </div>
           <div className="space-y-2">
            <Label>On a scale of 1-10, how likely are you to recommend working here? ({form.watch('recommend')})</Label>
            <Slider defaultValue={[9]} max={10} min={1} step={1} onValueChange={(v) => form.setValue('recommend', v[0])}/>
          </div>
           <div className="space-y-2">
            <Label>On a scale of 1-10, how well does your work align with the company's goals? ({form.watch('alignment')})</Label>
            <Slider defaultValue={[7]} max={10} min={1} step={1} onValueChange={(v) => form.setValue('alignment', v[0])}/>
          </div>
          <div className="space-y-2">
            <Label>On a scale of 1-10, how well are you recognized for your contributions? ({form.watch('recognition')})</Label>
            <Slider defaultValue={[6]} max={10} min={1} step={1} onValueChange={(v) => form.setValue('recognition', v[0])}/>
          </div>
           <div className="space-y-2">
            <Label>On a scale of 1-10, how satisfied are you with the feedback you receive? ({form.watch('feedback')})</Label>
            <Slider defaultValue={[7]} max={10} min={1} step={1} onValueChange={(v) => form.setValue('feedback', v[0])}/>
          </div>
           <div className="space-y-2">
            <Label>On a scale of 1-10, how satisfied are you with your opportunities for professional growth? ({form.watch('growth')})</Label>
            <Slider defaultValue={[8]} max={10} min={1} step={1} onValueChange={(v) => form.setValue('growth', v[0])}/>
          </div>
           <Separator />
          <Textarea placeholder="What is something you're proud of accomplishing in the last quarter?" {...form.register('proudOf')} rows={3} />
          <Textarea placeholder="What is one thing we could do to improve your experience here?" {...form.register('improvement')} rows={3} />
          <Textarea placeholder="Any other thoughts or comments?" {...form.register('finalThoughts')} rows={3} />
        </form>
      </CardContent>
    </Card>
    <div className="flex justify-center mt-8">
      <Button size="lg" onClick={handleDownload}><Download className="mr-2 h-4 w-4"/> Download Survey as PDF</Button>
    </div>
    <Card className="mt-12 max-w-4xl mx-auto bg-primary/5 border-primary/20">
      <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        
        <div>
          <h3 className="text-xl font-bold text-primary mb-1">Looking to Hire?</h3>
          <p className="text-muted-foreground">Find candidates who are passionate and engaged by posting on the #1 Web3 job board.</p>
        </div>
        <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mt-4 md:mt-0">
          <Button size="lg">
            Post a Job <ArrowRight className="ml-2 h-4 w-4"/>
          </Button>
        </a>
      </CardContent>
    </Card>
  </div>
 );
}
  