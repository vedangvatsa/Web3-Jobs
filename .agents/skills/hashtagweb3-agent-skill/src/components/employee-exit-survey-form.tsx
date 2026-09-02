'use client';

import * as React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CtaBanner } from '@/components/cta-banner';
import {
  createPdfInstance,
  addPdfHeading,
  addPdfShortField,
  addPdfLineSection,
} from '@/lib/pdf-utils';

const surveySchema = z.object({
  employeeName: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  lastDay: z.date().optional(),
  reasonForLeaving: z.string().optional(),
  likes: z.string().optional(),
  dislikes: z.string().optional(),
  recommend: z.enum(['Yes', 'No', 'Maybe']).optional(),
  feedback: z.string().optional(),
});

type SurveyData = z.infer<typeof surveySchema>;

export function EmployeeExitSurveyForm() {
  const { toast } = useToast();
  const form = useForm<SurveyData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      recommend: 'Yes',
      employeeName: '',
      jobTitle: '',
      department: '',
      reasonForLeaving: '',
      likes: '',
      dislikes: '',
      feedback: '',
    },
  });

  React.useEffect(() => {
    form.setValue('lastDay', new Date());
  }, [form]);

  const handleDownload = form.handleSubmit(async () => {
    try {
      const { doc, margin, contentWidth, pageHeight } = await createPdfInstance();
      let y = margin;

      y = addPdfHeading(doc, 'Employee Exit Survey', margin, y, 18);

      y = addPdfShortField(doc, 'Employee Name:', '', margin, contentWidth, y, true);
      y = addPdfShortField(doc, 'Job Title:', '', margin, contentWidth, y, true);
      y = addPdfShortField(doc, 'Department:', '', margin, contentWidth, y, true);
      y = addPdfShortField(doc, 'Last Day of Employment:', '', margin, contentWidth, y, true);
      y += 10;

      y = addPdfLineSection(doc, 'Primary reason for leaving:', 3, margin, contentWidth, y, pageHeight);
      y = addPdfLineSection(doc, 'What did you like most about working here?', 4, margin, contentWidth, y, pageHeight);
      y = addPdfLineSection(doc, 'What did you like least about working here?', 4, margin, contentWidth, y, pageHeight);

      if (y > pageHeight - 80) {
        doc.addPage();
        y = margin;
      }
      doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#374151');
      doc.text('Would you recommend working here to a friend?', margin, y);
      y += 20;
      doc.setFontSize(10).setFont('helvetica', 'normal');
      doc.circle(margin + 10, y, 5);
      doc.text('Yes', margin + 20, y + 4);
      doc.circle(margin + 70, y, 5);
      doc.text('No', margin + 80, y + 4);
      doc.circle(margin + 120, y, 5);
      doc.text('Maybe', margin + 130, y + 4);
      y += 30;

      y = addPdfLineSection(doc, 'Any additional feedback or suggestions for improvement?', 5, margin, contentWidth, y, pageHeight);

      doc.save('Employee_Exit_Survey_Template.pdf');
      toast({ title: 'Success!', description: 'Survey template downloaded as PDF.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate PDF.' });
    }
  });

  const watchedForm = useWatch({ control: form.control });

  return (
    <div className="container mx-auto py-12">
      <Card className="site-container">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Employee Exit Survey Tool</CardTitle>
          <CardDescription>Gather valuable feedback from departing employees.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input placeholder="Employee Name" {...form.register('employeeName')} />
              <Input placeholder="Job Title" {...form.register('jobTitle')} />
              <Input placeholder="Department" {...form.register('department')} />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start font-normal">
                    {watchedForm.lastDay ? (
                      watchedForm.lastDay.toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watchedForm.lastDay}
                    onSelect={(d) => d && form.setValue('lastDay', d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Textarea placeholder="What is your primary reason for leaving?" {...form.register('reasonForLeaving')} />
            <Textarea placeholder="What did you like most about your role and the company?" {...form.register('likes')} />
            <Textarea placeholder="What aspects of your role or the company could be improved?" {...form.register('dislikes')} />
            <div>
              <Label className="mb-2 block">Would you recommend working here to a friend?</Label>
              <RadioGroup
                onValueChange={(val: 'Yes' | 'No' | 'Maybe') => form.setValue('recommend', val)}
                defaultValue={form.getValues('recommend')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="r1" />
                  <Label htmlFor="r1">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="r2" />
                  <Label htmlFor="r2">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Maybe" id="r3" />
                  <Label htmlFor="r3">Maybe</Label>
                </div>
              </RadioGroup>
            </div>
            <Textarea placeholder="Do you have any other feedback or suggestions?" {...form.register('feedback')} rows={5} />
          </form>
        </CardContent>
      </Card>
      <div className="flex justify-center mt-8">
        <Button size="lg" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" /> Download PDF
        </Button>
      </div>
      <CtaBanner
        variant="hire"
        title="Looking to Hire?"
        buttonText="Join Job Feed"
      />
    </div>
  );
}