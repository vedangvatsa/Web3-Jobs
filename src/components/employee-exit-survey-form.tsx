
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
import { Download, UserMinus, Briefcase, ArrowRight, Rss } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';

const surveySchema = z.object({
  employeeName: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  lastDay: z.date(),
  reasonForLeaving: z.string().optional(),
  likes: z.string().optional(),
  dislikes: z.string().optional(),
  recommend: z.enum(["Yes", "No", "Maybe"]).optional(),
  feedback: z.string().optional(),
});

type SurveyData = z.infer<typeof surveySchema>;

export function EmployeeExitSurveyForm() {
  const { toast } = useToast();
  const form = useForm<SurveyData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
        lastDay: new Date(),
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

  const handleDownload = form.handleSubmit((data) => {
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const margin = 50;
      const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;
      let y = margin;

      const addSection = (title: string, lines: number) => {
          doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#111827');
          doc.text(title, margin, y);
          y += 20;
          doc.setDrawColor(209, 213, 219); // gray-300
          for(let i=0; i<lines; i++){
              doc.line(margin, y, contentWidth + margin, y);
              y += 20;
          }
          y+=15;
      }
      
      const addShortField = (label: string) => {
          doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#374151');
          doc.text(label, margin, y);
          doc.setDrawColor(209, 213, 219);
          doc.line(margin + doc.getTextWidth(label) + 10, y, contentWidth + margin, y);
          y += 25;
      }

      doc.setFontSize(18).setFont('helvetica', 'bold').setTextColor('#111827');
      doc.text('Employee Exit Survey', margin, y);
      y += 30;
      
      addShortField('Employee Name:');
      addShortField('Job Title:');
      addShortField('Department:');
      addShortField('Last Day of Employment:');
      y += 15;
      
      addSection('Primary reason for leaving:', 3);
      addSection('What did you like most about working here?', 4);
      addSection('What did you like least about working here?', 4);

      doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#374151');
      doc.text('Would you recommend working here to a friend?', margin, y);
      y += 20;
      doc.setFontSize(10).setFont('helvetica', 'normal');
      doc.circle(margin + 10, y, 5); doc.text('Yes', margin + 20, y+4);
      doc.circle(margin + 70, y, 5); doc.text('No', margin + 80, y+4);
      doc.circle(margin + 120, y, 5); doc.text('Maybe', margin + 130, y+4);
      y += 30;

      addSection('Any additional feedback or suggestions for improvement?', 5);

      doc.save('Employee_Exit_Survey_Template.pdf');
      toast({ title: "Success!", description: "Survey template downloaded as PDF." });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: "Error", description: "Failed to generate PDF." });
    }
  });

  const watchedForm = useWatch({ control: form.control });

  return (
    <div className="container mx-auto py-12">
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
                 <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                  <UserMinus className="h-10 w-10 text-primary" />
                </div>
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
                            <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start font-normal">{watchedForm.lastDay ? format(watchedForm.lastDay, 'PPP') : (<span>Pick a date</span>)}</Button></PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={watchedForm.lastDay} onSelect={(d) => d && form.setValue('lastDay', d)} initialFocus /></PopoverContent>
                        </Popover>
                    </div>
                    <Textarea placeholder="What is your primary reason for leaving?" {...form.register('reasonForLeaving')} />
                    <Textarea placeholder="What did you like most about your role and the company?" {...form.register('likes')} />
                    <Textarea placeholder="What aspects of your role or the company could be improved?" {...form.register('dislikes')} />
                     <div>
                        <Label className="mb-2 block">Would you recommend working here to a friend?</Label>
                        <RadioGroup onValueChange={(val: "Yes" | "No" | "Maybe") => form.setValue('recommend', val)} defaultValue={form.getValues('recommend')} className="flex gap-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id="r1" /><Label htmlFor="r1">Yes</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="No" id="r2" /><Label htmlFor="r2">No</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="Maybe" id="r3" /><Label htmlFor="r3">Maybe</Label></div>
                        </RadioGroup>
                    </div>
                    <Textarea placeholder="Do you have any other feedback or suggestions?" {...form.register('feedback')} rows={5} />
                </form>
            </CardContent>
        </Card>
         <div className="flex justify-center mt-8">
            <Button size="lg" onClick={handleDownload}><Download className="mr-2 h-4 w-4"/> Download PDF</Button>
        </div>
         <Card className="mt-12 max-w-4xl mx-auto bg-primary/5 border-primary/20">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full hidden md:block">
                    <Rss className="h-8 w-8 text-primary"/>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-primary mb-1">Looking to Hire?</h3>
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
    
