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
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { CtaBanner } from '@/components/cta-banner';
import { createPdfInstance, addPdfHeading, addPdfLineSection } from '@/lib/pdf-utils';

const wlbSurveySchema = z.object({
  workloadManageable: z.number().min(1).max(5),
  workWithinHours: z.number().min(1).max(5),
  pressureToWorkLate: z.number().min(1).max(5),
  flexibility: z.number().min(1).max(5),
  autonomy: z.number().min(1).max(5),
  stressLevels: z.number().min(1).max(5),
  managerSupport: z.number().min(1).max(5),
  comfortableTakingTimeOff: z.number().min(1).max(5),
  wellbeingResources: z.number().min(1).max(5),
  improvementSuggestion: z.string().optional(),
  negativeImpacts: z.string().optional(),
  finalComments: z.string().optional(),
});

type WlbSurveyData = z.infer<typeof wlbSurveySchema>;

export function WorkLifeBalanceSurveyForm() {
  const { toast } = useToast();
  const form = useForm<WlbSurveyData>({
    resolver: zodResolver(wlbSurveySchema),
    defaultValues: {
      workloadManageable: 4,
      workWithinHours: 3,
      pressureToWorkLate: 2,
      flexibility: 5,
      autonomy: 4,
      stressLevels: 4,
      managerSupport: 5,
      comfortableTakingTimeOff: 5,
      wellbeingResources: 3,
      improvementSuggestion: '',
      negativeImpacts: '',
      finalComments: '',
    },
  });

  const handleDownload = form.handleSubmit(async () => {
    try {
      const { doc, margin, contentWidth, pageHeight } = await createPdfInstance();
      let y = margin;

      y = addPdfHeading(doc, 'Work-Life Balance Survey', margin, y, 18);

      const addSectionTitle = (title: string) => {
        if (y > pageHeight - 100) {
          doc.addPage();
          y = margin;
        }
        doc.setFontSize(14).setFont('helvetica', 'bold').setTextColor('#111827');
        doc.text(title, margin, y);
        y += 25;
      };

      const addRatingQuestion = (title: string) => {
        if (y > pageHeight - 60) {
          doc.addPage();
          y = margin;
        }
        doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#374151');
        const titleLines = doc.splitTextToSize(title, contentWidth);
        doc.text(titleLines, margin, y);
        y += titleLines.length * 12 + 8;

        doc.setFontSize(10).setFont('helvetica', 'normal');
        let radioX = margin;
        doc.text('Strongly Disagree', radioX, y);
        doc.text('Strongly Agree', contentWidth + margin, y, { align: 'right' });
        y += 15;
        radioX = margin + 80;
        for (let i = 1; i <= 5; i++) {
          doc.circle(radioX, y, 6);
          doc.text(String(i), radioX - 2, y + 18);
          radioX += 50;
        }
        y += 35;
      };

      addSectionTitle('Workload & Hours');
      addRatingQuestion('1. My current workload is manageable.');
      addRatingQuestion('2. I am able to complete my work within my scheduled working hours.');
      addRatingQuestion('3. I feel pressure to work long hours or on weekends.');

      addSectionTitle('Flexibility & Autonomy');
      addRatingQuestion('4. I have the flexibility I need to balance my work and personal life.');
      addRatingQuestion('5. I have sufficient autonomy over how I schedule my work day.');

      doc.addPage();
      y = margin;

      addSectionTitle('Well-being & Support');
      addRatingQuestion('6. My work-related stress levels are acceptable.');
      addRatingQuestion('7. I feel supported by my manager in maintaining a healthy work-life balance.');
      addRatingQuestion('8. I feel comfortable taking time off when I need it without feeling guilty.');
      addRatingQuestion('9. The company provides adequate resources and support for my well-being.');

      addSectionTitle('Qualitative Feedback');
      y = addPdfLineSection(doc, 'What is the one thing that could be done to improve your work-life balance?', 4, margin, contentWidth, y, pageHeight);
      y = addPdfLineSection(doc, 'Are there any company policies or cultural norms that negatively impact your work-life balance?', 4, margin, contentWidth, y, pageHeight);
      y = addPdfLineSection(doc, 'Please share any other comments or suggestions regarding work-life balance.', 4, margin, contentWidth, y, pageHeight);

      doc.save('Work-Life-Balance-Survey-Template.pdf');
      toast({ title: 'Success!', description: 'Survey template downloaded as PDF.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate PDF.' });
    }
  });

  const RatingQuestion = ({
    name,
    label,
    defaultValue,
  }: {
    name: keyof WlbSurveyData;
    label: string;
    defaultValue: number;
  }) => (
    <div className="space-y-2">
      <Label>
        {label} ({form.watch(name)})
      </Label>
      <Slider
        defaultValue={[defaultValue]}
        max={5}
        min={1}
        step={1}
        onValueChange={(v) => form.setValue(name, v[0])}
      />
    </div>
  );

  return (
    <div className="container mx-auto py-12">
      <Card className="site-container">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Work-Life Balance Survey Builder</CardTitle>
          <CardDescription className="site-container">
            Use this anonymous survey to get an honest assessment of your team&apos;s work-life
            balance. Understanding workload, stress levels, and support systems is key to
            preventing burnout and building a sustainable, high-performing team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8">
            <p className="text-sm text-muted-foreground text-center">
              Rate the following statements on a scale of 1 (Strongly Disagree) to 5 (Strongly
              Agree).
            </p>

            <div>
              <h3 className="text-lg font-semibold mb-4">Workload & Hours</h3>
              <div className="space-y-6">
                <RatingQuestion
                  name="workloadManageable"
                  label="1. My current workload is manageable."
                  defaultValue={4}
                />
                <RatingQuestion
                  name="workWithinHours"
                  label="2. I am able to complete my work within my scheduled hours."
                  defaultValue={3}
                />
                <RatingQuestion
                  name="pressureToWorkLate"
                  label="3. I feel pressure to work long hours or on weekends."
                  defaultValue={2}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Flexibility & Autonomy</h3>
              <div className="space-y-6">
                <RatingQuestion
                  name="flexibility"
                  label="4. I have the flexibility I need to balance my work and personal life."
                  defaultValue={5}
                />
                <RatingQuestion
                  name="autonomy"
                  label="5. I have sufficient autonomy over how I schedule my work day."
                  defaultValue={4}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Well-being & Support</h3>
              <div className="space-y-6">
                <RatingQuestion
                  name="stressLevels"
                  label="6. My work-related stress levels are acceptable."
                  defaultValue={4}
                />
                <RatingQuestion
                  name="managerSupport"
                  label="7. I feel supported by my manager in maintaining a healthy work-life balance."
                  defaultValue={5}
                />
                <RatingQuestion
                  name="comfortableTakingTimeOff"
                  label="8. I feel comfortable taking time off when I need it."
                  defaultValue={5}
                />
                <RatingQuestion
                  name="wellbeingResources"
                  label="9. The company provides adequate resources to support my well-being."
                  defaultValue={3}
                />
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Open-Ended Feedback</h3>
              <div className="space-y-6">
                <Textarea
                  placeholder="What is the one thing that could be done to improve your work-life balance?"
                  {...form.register('improvementSuggestion')}
                  rows={3}
                />
                <Textarea
                  placeholder="Are there any company policies or cultural norms that negatively impact your work-life balance?"
                  {...form.register('negativeImpacts')}
                  rows={3}
                />
                <Textarea
                  placeholder="Please share any other comments or suggestions regarding work-life balance."
                  {...form.register('finalComments')}
                  rows={3}
                />
              </div>
            </div>
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
        title="Looking for Top Talent?"
        description="Find talent that aligns with your company culture by posting on the #1 Web3 job board."
        buttonText="Post a Job"
      />
    </div>
  );
}