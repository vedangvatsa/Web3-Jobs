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
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from './ui/slider';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { CtaBanner } from '@/components/cta-banner';
import {
  createPdfInstance,
  addPdfHeading,
  addPdfShortField,
  addPdfRatingScale,
  addPdfLineSection,
} from '@/lib/pdf-utils';

const feedbackSchema = z.object({
  candidateName: z.string().min(1),
  position: z.string().min(1),
  interviewerName: z.string().min(1),
  interviewDate: z.string().min(1),
  technicalSkills: z.number().min(1).max(5),
  problemSolving: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  cultureFit: z.number().min(1).max(5),
  overallRecommendation: z.enum(['Strong Hire', 'Hire', 'No Hire', 'Strong No Hire']),
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
      candidateName: '',
      position: '',
      interviewerName: '',
      interviewDate: '',
      technicalSkills: 3,
      problemSolving: 3,
      communication: 3,
      cultureFit: 3,
      overallRecommendation: 'Hire',
      strengths: '- Strong grasp of Solidity fundamentals.\n- Excellent written communication skills.',
      weaknesses: '- Lacks deep experience in DeFi security.\n- Could be more proactive in leading discussions.',
      notes: 'Candidate showed great passion for the space and a strong desire to learn.',
    },
  });

  React.useEffect(() => {
    form.reset({
      ...form.getValues(),
      interviewDate: new Date().toISOString().split('T')[0],
    });
  }, [form]);

  const handleDownload = form.handleSubmit(async () => {
    try {
      const { doc, margin, contentWidth, pageHeight } = await createPdfInstance();
      let y = margin;

      y = addPdfHeading(doc, 'Interview Feedback Form', margin, y, 18);

      y = addPdfShortField(doc, 'Candidate Name:', '', margin, contentWidth, y, true);
      y = addPdfShortField(doc, 'Position:', '', margin, contentWidth, y, true);
      y = addPdfShortField(doc, 'Interviewer:', '', margin, contentWidth, y, true);
      y = addPdfShortField(doc, 'Interview Date:', '', margin, contentWidth, y, true);
      y += 10;

      doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor('#111827');
      doc.text('Candidate Ratings', margin, y);
      y += 15;
      doc.setFontSize(9).setTextColor('#6b7280').text('1 = Poor, 3 = Average, 5 = Excellent', margin, y);
      y += 20;

      y = addPdfRatingScale(doc, 'Technical Skills', 5, margin, contentWidth, y, pageHeight, "How would you rate the candidate's technical proficiency for this role?");
      y = addPdfRatingScale(doc, 'Problem-Solving Ability', 5, margin, contentWidth, y, pageHeight, "Assess the candidate's ability to analyze problems and formulate solutions.");
      y = addPdfRatingScale(doc, 'Communication Skills', 5, margin, contentWidth, y, pageHeight, 'Evaluate clarity of thought, listening skills, and articulation.');
      y = addPdfRatingScale(doc, 'Culture Fit / Alignment', 5, margin, contentWidth, y, pageHeight, "Does the candidate align with the company's values, mission, and work style?");

      doc.addPage();
      y = margin;

      y = addPdfLineSection(doc, 'Key Strengths: (List 2-3 specific strengths with examples)', 5, margin, contentWidth, y, pageHeight);
      y = addPdfLineSection(doc, 'Key Weaknesses/Areas for Growth: (List 1-2 specific areas with examples)', 5, margin, contentWidth, y, pageHeight);
      y = addPdfLineSection(doc, 'Additional Notes: (Any other observations or comments)', 4, margin, contentWidth, y, pageHeight);

      doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#374151');
      doc.text('Overall Recommendation:', margin, y);
      y += 25;
      doc.setFontSize(10).setFont('helvetica', 'normal');
      let checkboxX = margin;
      const options = ['Strong Hire', 'Hire', 'No Hire', 'Strong No Hire'];
      options.forEach((option) => {
        doc.rect(checkboxX, y - 8, 12, 12);
        doc.text(option, checkboxX + 20, y);
        checkboxX += 120;
      });

      doc.save('Interview_Feedback_Template.pdf');
      toast({ title: 'Success!', description: 'Feedback form template downloaded as PDF.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate PDF.' });
    }
  });

  return (
    <div className="container mx-auto py-12">
      <Card className="site-container">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Interview Feedback Template</CardTitle>
          <CardDescription className="site-container">
            A structured feedback form is essential for a fair and effective hiring process. It helps
            reduce bias by ensuring all candidates are evaluated against the same criteria and provides
            clear, actionable data for debrief sessions.
          </CardDescription>
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
                <CardTitle className="text-lg">Ratings</CardTitle>
                <CardDescription>
                  Rate the candidate on a scale of 1 (Poor) to 5 (Excellent) for each category.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label>Technical Skills: {form.watch('technicalSkills')}</Label>
                  <Slider
                    defaultValue={[3]}
                    max={5}
                    min={1}
                    step={1}
                    onValueChange={(v) => form.setValue('technicalSkills', v[0])}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Problem-Solving: {form.watch('problemSolving')}</Label>
                  <Slider
                    defaultValue={[3]}
                    max={5}
                    min={1}
                    step={1}
                    onValueChange={(v) => form.setValue('problemSolving', v[0])}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Communication: {form.watch('communication')}</Label>
                  <Slider
                    defaultValue={[3]}
                    max={5}
                    min={1}
                    step={1}
                    onValueChange={(v) => form.setValue('communication', v[0])}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Culture Fit / Alignment: {form.watch('cultureFit')}</Label>
                  <Slider
                    defaultValue={[3]}
                    max={5}
                    min={1}
                    step={1}
                    onValueChange={(v) => form.setValue('cultureFit', v[0])}
                  />
                </div>
              </CardContent>
            </Card>
            <Textarea
              placeholder="Candidate's key strengths (provide specific examples)..."
              {...form.register('strengths')}
              rows={4}
            />
            <Textarea
              placeholder="Candidate's areas for improvement or weaknesses (provide examples)..."
              {...form.register('weaknesses')}
              rows={4}
            />
            <Textarea
              placeholder="Any other notes, observations, or red flags..."
              {...form.register('notes')}
              rows={4}
            />
            <div>
              <Label className="mb-2 block font-semibold">Overall Recommendation</Label>
              <RadioGroup
                onValueChange={(val: 'Strong Hire' | 'Hire' | 'No Hire' | 'Strong No Hire') =>
                  form.setValue('overallRecommendation', val)
                }
                defaultValue={form.getValues('overallRecommendation')}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Strong Hire" id="r1" />
                  <Label htmlFor="r1">Strong Hire</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Hire" id="r2" />
                  <Label htmlFor="r2">Hire</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No Hire" id="r3" />
                  <Label htmlFor="r3">No Hire</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Strong No Hire" id="r4" />
                  <Label htmlFor="r4">Strong No Hire</Label>
                </div>
              </RadioGroup>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="flex justify-center mt-8">
        <Button size="lg" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" /> Download as PDF
        </Button>
      </div>
      <CtaBanner
        variant="hire"
        title="Looking for Top Talent?"
        buttonText="Join Job Feed"
      />
    </div>
  );
}