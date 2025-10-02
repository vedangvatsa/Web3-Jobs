
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Scale, Briefcase, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Slider } from './ui/slider';

const wlbSurveySchema = z.object({
  workload: z.number().min(1).max(5),
  hours: z.number().min(1).max(5),
  flexibility: z.number().min(1).max(5),
  stress: z.number().min(1).max(5),
  support: z.number().min(1).max(5),
  improvement: z.string().optional(),
});

type WlbSurveyData = z.infer<typeof wlbSurveySchema>;

export function WorkLifeBalanceSurveyForm() {
  const { toast } = useToast();
  const form = useForm<WlbSurveyData>({
    resolver: zodResolver(wlbSurveySchema),
    defaultValues: {
      workload: 4,
      hours: 3,
      flexibility: 5,
      stress: 2,
      support: 4,
      improvement: "More clearly defined project scopes would help in managing workload expectations.",
    },
  });

  const handleDownload = form.handleSubmit((data) => {
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const margin = 50;
      const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;
      let y = margin;
      
      const ratings = {
        1: 'Strongly Disagree',
        2: 'Disagree',
        3: 'Neutral',
        4: 'Agree',
        5: 'Strongly Agree',
      };

      doc.setFontSize(18).setFont('helvetica', 'bold').setTextColor('#111827');
      doc.text('Work-Life Balance Survey', margin, y);
      y += 40;

      const addSection = (title: string, content: string | number, isRating = false) => {
          doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor('#111827');
          doc.text(title, margin, y);
          y += 18;
          doc.setFontSize(11).setFont('helvetica', 'normal').setTextColor('#374151');
          let displayContent = isRating && typeof content === 'number' ? `${content}/5 - ${ratings[content as keyof typeof ratings]}` : String(content);
          const lines = doc.splitTextToSize(displayContent, contentWidth);
          doc.text(lines, margin, y);
          y += lines.length * 15 + 20;
      }

      addSection("My current workload is manageable.", data.workload, true);
      addSection("I am able to complete my work within my scheduled hours.", data.hours, true);
      addSection("I have the flexibility I need to balance my work and personal life.", data.flexibility, true);
      addSection("My work-related stress levels are acceptable.", data.stress, true);
      addSection("I feel supported by my manager in maintaining a healthy work-life balance.", data.support, true);
      if (data.improvement) addSection("What one change could improve your work-life balance?", data.improvement);

      doc.save('Work-Life-Balance-Survey.pdf');
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
                  <Scale className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl">Work-Life Balance Survey Builder</CardTitle>
                <CardDescription>Generate a quick survey to assess and improve your team's work-life balance.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-8">
                    <p className="text-sm text-muted-foreground text-center">Rate the following statements on a scale of 1 (Strongly Disagree) to 5 (Strongly Agree).</p>
                    <div className="space-y-2">
                        <Label>1. My current workload is manageable. ({form.watch('workload')})</Label>
                        <Slider defaultValue={[4]} max={5} min={1} step={1} onValueChange={(v) => form.setValue('workload', v[0])}/>
                    </div>
                    <div className="space-y-2">
                        <Label>2. I am able to complete my work within my scheduled hours. ({form.watch('hours')})</Label>
                        <Slider defaultValue={[3]} max={5} min={1} step={1} onValueChange={(v) => form.setValue('hours', v[0])}/>
                    </div>
                    <div className="space-y-2">
                        <Label>3. I have the flexibility I need to balance my work and personal life. ({form.watch('flexibility')})</Label>
                        <Slider defaultValue={[5]} max={5} min={1} step={1} onValueChange={(v) => form.setValue('flexibility', v[0])}/>
                    </div>
                    <div className="space-y-2">
                        <Label>4. My work-related stress levels are acceptable. ({form.watch('stress')})</Label>
                        <Slider defaultValue={[2]} max={5} min={1} step={1} onValueChange={(v) => form.setValue('stress', v[0])}/>
                    </div>
                    <div className="space-y-2">
                        <Label>5. I feel supported by my manager in maintaining a healthy work-life balance. ({form.watch('support')})</Label>
                        <Slider defaultValue={[4]} max={5} min={1} step={1} onValueChange={(v) => form.setValue('support', v[0])}/>
                    </div>
                    <Textarea placeholder="What is the one thing that could be done to improve your work-life balance?" {...form.register('improvement')} rows={4} />
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
                    <h3 className="text-xl font-bold text-primary mb-1">Looking for Top Talent?</h3>
                    <p className="text-muted-foreground">Find talent that aligns with your company culture by posting on the #1 Web3 job board.</p>
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
