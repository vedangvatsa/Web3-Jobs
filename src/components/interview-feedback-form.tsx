'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Mic, User, Briefcase, ArrowRight, Rss } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Slider } from './ui/slider';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const feedbackSchema = z.object({
  candidateName: z.string().min(1),
  position: z.string().min(1),
  interviewerName: z.string().min(1),
  interviewDate: z.string().min(1),
  technicalSkills: z.number().min(1).max(5),
  problemSolving: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  cultureFit: z.number().min(1).max(5),
  overallRecommendation: z.enum(["Strong Hire", "Hire", "No Hire", "Strong No Hire"]),
  strengths: z.string().min(1),
  weaknesses: z.string().min(1),
  notes: z.string().optional(),
});

type FeedbackData = z.infer<typeof feedbackSchema>;

export function InterviewFeedbackForm() {
  const { toast } = useToast();
  const form = useForm<FeedbackData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      candidateName: "",
      position: "",
      interviewerName: "",
      interviewDate: "",
      technicalSkills: 3,
      problemSolving: 3,
      communication: 3,
      cultureFit: 3,
      overallRecommendation: "Hire",
      strengths: "• Strong grasp of Solidity fundamentals.\n• Excellent written communication skills.",
      weaknesses: "• Lacks deep experience in DeFi security.\n• Could be more proactive in leading discussions.",
      notes: "Candidate showed great passion for the space and a strong desire to learn.",
    },
  });

  React.useEffect(() => {
    form.reset({
        ...form.getValues(),
        interviewDate: new Date().toISOString().split('T')[0],
    })
  }, [form]);

  const handleDownload = form.handleSubmit((data) => {
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const margin = 50;
      let y = margin;
      const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;
      
      doc.setFontSize(18).setFont('helvetica', 'bold').setTextColor('#111827');
      doc.text('Interview Feedback Form', margin, y);
      y += 30;

      const addShortField = (label: string) => {
          doc.setFontSize(11).setFont('helvetica', 'normal').setTextColor('#374151');
          doc.text(label, margin, y);
          doc.setDrawColor(209, 213, 219);
          doc.line(margin + doc.getTextWidth(label) + 10, y, contentWidth + margin, y);
          y += 25;
      }

      addShortField('Candidate Name:');
      addShortField('Position:');
      addShortField('Interviewer:');
      addShortField('Interview Date:');
      y+= 15;
      
      const addRatingQuestion = (title: string, subtext: string) => {
        if (y > doc.internal.pageSize.getHeight() - 70) { doc.addPage(); y = margin; }
        doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#374151');
        doc.text(title, margin, y);
        y += 14;
        doc.setFontSize(9).setFont('helvetica', 'italic').setTextColor('#6b7280');
        const subtextLines = doc.splitTextToSize(subtext, contentWidth);
        doc.text(subtextLines, margin, y);
        y += subtextLines.length * 10 + 8;
        
        doc.setFontSize(10).setFont('helvetica', 'normal');
        let radioX = margin;
        for (let i = 1; i <= 5; i++) {
          doc.circle(radioX, y, 6);
          doc.text(String(i), radioX - 2, y + 18);
          radioX += 60;
        }
        y += 35;
      }

      const addOpenEndedQuestion = (title: string, lines: number) => {
         if (y > doc.internal.pageSize.getHeight() - (lines * 20 + 40)) { doc.addPage(); y = margin; }
         doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#374151');
         doc.text(title, margin, y);
         y += 20;
         doc.setDrawColor(209, 213, 219);
         for(let i=0; i<lines; i++){
            doc.line(margin, y, contentWidth + margin, y);
            y += 20;
         }
         y += 15;
      }
      
      doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor('#111827');
      doc.text('Candidate Ratings', margin, y); y+=20;
      doc.setFontSize(9).setTextColor('#6b7280').text('1 = Poor, 3 = Average, 5 = Excellent', margin, y); y+=25;
      
      addRatingQuestion('Technical Skills', 'How would you rate the candidate\'s technical proficiency for this role?');
      addRatingQuestion('Problem-Solving Ability', 'Assess the candidate\'s ability to analyze problems and formulate solutions.');
      addRatingQuestion('Communication Skills', 'Evaluate clarity of thought, listening skills, and articulation.');
      addRatingQuestion('Culture Fit / Alignment', 'Does the candidate align with the company\'s values, mission, and work style?');
      
      doc.addPage();
      y = margin;

      addOpenEndedQuestion('Key Strengths: (List 2-3 specific strengths with examples)', 5);
      addOpenEndedQuestion('Key Weaknesses/Areas for Growth: (List 1-2 specific areas with examples)', 5);
      addOpenEndedQuestion('Additional Notes: (Any other observations or comments)', 4);
      
      doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#374151');
      doc.text('Overall Recommendation:', margin, y);
      y += 25;
      doc.setFontSize(10).setFont('helvetica', 'normal');
      let checkboxX = margin;
      const options = ["Strong Hire", "Hire", "No Hire", "Strong No Hire"];
      options.forEach(option => {
          doc.rect(checkboxX, y-8, 12, 12); doc.text(option, checkboxX + 20, y);
          checkboxX += 120;
      });

      doc.save('Interview_Feedback_Template.pdf');
      toast({ title: "Success!", description: "Feedback form template downloaded as PDF." });
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
                  <Mic className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl">Interview Feedback Template</CardTitle>
                <CardDescription>Standardize your hiring process and make better decisions.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input placeholder="Candidate Name" {...form.register('candidateName')} />
                        <Input placeholder="Position" {...form.register('position')} />
                        <Input placeholder="Interviewer Name" {...form.register('interviewerName')} />
                        <Input type="date" {...form.register('interviewDate')} />
                    </div>
                     <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Ratings (1 = Poor, 5 = Excellent)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <Label>Technical Skills: {form.watch('technicalSkills')}</Label>
                                <Slider defaultValue={[3]} max={5} min={1} step={1} onValueChange={(v) => form.setValue('technicalSkills', v[0])}/>
                            </div>
                            <div className="space-y-2">
                                <Label>Problem-Solving: {form.watch('problemSolving')}</Label>
                                <Slider defaultValue={[3]} max={5} min={1} step={1} onValueChange={(v) => form.setValue('problemSolving', v[0])}/>
                            </div>
                             <div className="space-y-2">
                                <Label>Communication: {form.watch('communication')}</Label>
                                <Slider defaultValue={[3]} max={5} min={1} step={1} onValueChange={(v) => form.setValue('communication', v[0])}/>
                            </div>
                             <div className="space-y-2">
                                <Label>Culture Fit / Alignment: {form.watch('cultureFit')}</Label>
                                <Slider defaultValue={[3]} max={5} min={1} step={1} onValueChange={(v) => form.setValue('cultureFit', v[0])}/>
                            </div>
                        </CardContent>
                    </Card>
                    <Textarea placeholder="Candidate's key strengths..." {...form.register('strengths')} rows={4}/>
                    <Textarea placeholder="Candidate's areas for improvement..." {...form.register('weaknesses')} rows={4}/>
                    <Textarea placeholder="Any other notes or observations..." {...form.register('notes')} rows={4}/>
                     <div>
                        <Label className="mb-2 block font-semibold">Overall Recommendation</Label>
                        <RadioGroup onValueChange={(val: "Strong Hire" | "Hire" | "No Hire" | "Strong No Hire") => form.setValue('overallRecommendation', val)} defaultValue={form.getValues('overallRecommendation')} className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Strong Hire" id="r1" /><Label htmlFor="r1">Strong Hire</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Hire" id="r2" /><Label htmlFor="r2">Hire</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="No Hire" id="r3" /><Label htmlFor="r3">No Hire</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Strong No Hire" id="r4" /><Label htmlFor="r4">Strong No Hire</Label></div>
                        </RadioGroup>
                    </div>
                </form>
            </CardContent>
        </Card>
        <div className="flex justify-center mt-8">
            <Button size="lg" onClick={handleDownload}><Download className="mr-2 h-4 w-4"/> Download as PDF</Button>
        </div>
         <Card className="mt-12 max-w-4xl mx-auto bg-primary/5 border-primary/20">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full hidden md:block">
                    <Rss className="h-8 w-8 text-primary"/>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-primary mb-1">Looking for Top Talent?</h3>
                    <p className="text-muted-foreground">Post your job on the #1 Web3 job board to reach over 100,000 qualified professionals.</p>
                </div>
                <a href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mt-4 md:mt-0">
                    <Button size="lg">
                        Join Job Feed <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                </a>
            </CardContent>
        </Card>
    </div>
  );
}
    