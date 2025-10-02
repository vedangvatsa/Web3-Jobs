
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
import jsPDF from 'jspdf';
import { Slider } from './ui/slider';

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
      proudOf: "Launching our latest feature on time and seeing the positive community reaction.",
      improvement: "Cross-team communication on major project dependencies could be more streamlined.",
      finalThoughts: "Overall, I'm really happy with the team's direction and the challenges we're working on.",
    },
  });

  const handleDownload = form.handleSubmit((data) => {
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const margin = 50;
      const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;
      let y = margin;

      doc.setFontSize(18).setFont('helvetica', 'bold').setTextColor('#111827');
      doc.text('Employee Engagement Pulse Survey', margin, y);
      y += 40;

      const addSection = (title: string, content: string | number) => {
          doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor('#111827');
          doc.text(title, margin, y);
          y += 18;
          doc.setFontSize(11).setFont('helvetica', 'normal').setTextColor('#374151');
          const lines = doc.splitTextToSize(String(content), contentWidth);
          doc.text(lines, margin, y);
          y += lines.length * 15 + 20;
      }

      addSection("On a scale of 1-10, how satisfied are you with your role?", `${data.satisfaction}/10`);
      addSection("On a scale of 1-10, how likely are you to recommend working here to a friend?", `${data.recommend}/10`);
      addSection("On a scale of 1-10, how well do you feel your work aligns with the company's goals?", `${data.alignment}/10`);
      addSection("On a scale of 1-10, how well do you feel recognized for your contributions?", `${data.recognition}/10`);
      addSection("On a scale of 1-10, how satisfied are you with the feedback you receive?", `${data.feedback}/10`);
      addSection("On a scale of 1-10, how satisfied are you with your opportunities for growth?", `${data.growth}/10`);
      if (data.proudOf) addSection("What is something you're proud of from the last quarter?", data.proudOf);
      if (data.improvement) addSection("What is one thing that could be improved?", data.improvement);
      if (data.finalThoughts) addSection("Any final thoughts or comments?", data.finalThoughts);

      doc.save('Employee_Engagement_Survey.pdf');
      toast({ title: "Success!", description: "Survey downloaded as PDF." });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: "Error", description: "Failed to generate PDF." });
    }
  });

  return (
    <div className="container mx-auto py-12">
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
                 <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                  <Smile className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl">Employee Engagement Pulse Survey</CardTitle>
                <CardDescription>Quickly gauge team morale and identify areas for improvement.</CardDescription>
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
                <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full hidden md:block">
                    <Briefcase className="h-8 w-8 text-primary"/>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-primary mb-1">Looking to Hire?</h3
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

