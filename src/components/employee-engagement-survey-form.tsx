'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { CtaBanner } from '@/components/cta-banner';
import {
  createPdfInstance,
  addPdfHeading,
  addPdfRatingScale,
  addPdfLineSection,
} from '@/lib/pdf-utils';

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
      proudOf: '',
      improvement: '',
      finalThoughts: '',
    },
  });

  const handleDownload = form.handleSubmit(async () => {
    try {
      const { doc, margin, contentWidth, pageHeight } = await createPdfInstance();
      let y = margin;

      y = addPdfHeading(doc, 'Employee Engagement Pulse Survey', margin, y, 18);

      y = addPdfRatingScale(doc, 'On a scale of 1-10, how satisfied are you with your role?', 10, margin, contentWidth, y, pageHeight);
      y = addPdfRatingScale(doc, 'On a scale of 1-10, how likely are you to recommend working here to a friend?', 10, margin, contentWidth, y, pageHeight);
      y = addPdfRatingScale(doc, "On a scale of 1-10, how well do you feel your work aligns with the company's goals?", 10, margin, contentWidth, y, pageHeight);
      y = addPdfRatingScale(doc, 'On a scale of 1-10, how well do you feel recognized for your contributions?', 10, margin, contentWidth, y, pageHeight);
      y = addPdfRatingScale(doc, 'On a scale of 1-10, how satisfied are you with the feedback you receive?', 10, margin, contentWidth, y, pageHeight);
      y = addPdfRatingScale(doc, 'On a scale of 1-10, how satisfied are you with your opportunities for growth?', 10, margin, contentWidth, y, pageHeight);

      doc.addPage();
      y = margin;

      y = addPdfLineSection(doc, "What is something you're proud of from the last quarter?", 3, margin, contentWidth, y, pageHeight);
      y = addPdfLineSection(doc, 'What is one thing that could be improved?', 3, margin, contentWidth, y, pageHeight);
      y = addPdfLineSection(doc, 'Any final thoughts or comments?', 4, margin, contentWidth, y, pageHeight);

      doc.save('Employee_Engagement_Survey_Template.pdf');
      toast({ title: 'Success!', description: 'Survey template downloaded as PDF.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate PDF.' });
    }
  });

  return (
    <div className="container mx-auto py-12">
      <Card className="site-container">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Employee Engagement Pulse Survey</CardTitle>
          <CardDescription className="site-container">
            Quickly gauge team morale, satisfaction, and overall engagement with this pulse survey.
            Regular feedback is key to building a thriving culture and identifying potential issues
            before they become major problems.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8">
            <div className="space-y-2">
              <Label>
                On a scale of 1-10, how satisfied are you with your current role? ({form.watch('satisfaction')})
              </Label>
              <Slider
                defaultValue={[8]}
                max={10}
                min={1}
                step={1}
                onValueChange={(v) => form.setValue('satisfaction', v[0])}
              />
            </div>
            <div className="space-y-2">
              <Label>
                On a scale of 1-10, how likely are you to recommend working here? ({form.watch('recommend')})
              </Label>
              <Slider
                defaultValue={[9]}
                max={10}
                min={1}
                step={1}
                onValueChange={(v) => form.setValue('recommend', v[0])}
              />
            </div>
            <div className="space-y-2">
              <Label>
                On a scale of 1-10, how well does your work align with the company&apos;s goals? ({form.watch('alignment')})
              </Label>
              <Slider
                defaultValue={[7]}
                max={10}
                min={1}
                step={1}
                onValueChange={(v) => form.setValue('alignment', v[0])}
              />
            </div>
            <div className="space-y-2">
              <Label>
                On a scale of 1-10, how well are you recognized for your contributions? ({form.watch('recognition')})
              </Label>
              <Slider
                defaultValue={[6]}
                max={10}
                min={1}
                step={1}
                onValueChange={(v) => form.setValue('recognition', v[0])}
              />
            </div>
            <div className="space-y-2">
              <Label>
                On a scale of 1-10, how satisfied are you with the feedback you receive? ({form.watch('feedback')})
              </Label>
              <Slider
                defaultValue={[7]}
                max={10}
                min={1}
                step={1}
                onValueChange={(v) => form.setValue('feedback', v[0])}
              />
            </div>
            <div className="space-y-2">
              <Label>
                On a scale of 1-10, how satisfied are you with your opportunities for professional growth? ({form.watch('growth')})
              </Label>
              <Slider
                defaultValue={[8]}
                max={10}
                min={1}
                step={1}
                onValueChange={(v) => form.setValue('growth', v[0])}
              />
            </div>
            <Separator />
            <Textarea
              placeholder="What is something you're proud of accomplishing in the last quarter?"
              {...form.register('proudOf')}
              rows={3}
            />
            <Textarea
              placeholder="What is one thing we could do to improve your experience here?"
              {...form.register('improvement')}
              rows={3}
            />
            <Textarea
              placeholder="Any other thoughts or comments?"
              {...form.register('finalThoughts')}
              rows={3}
            />
          </form>
        </CardContent>
      </Card>
      <div className="flex justify-center mt-8">
        <Button size="lg" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" /> Download Survey as PDF
        </Button>
      </div>
      <CtaBanner
        variant="hire"
        title="Looking to Hire?"
        description="Find candidates who are passionate and engaged by posting on the #1 Web3 job board."
        buttonText="Post a Job"
      />
    </div>
  );
}