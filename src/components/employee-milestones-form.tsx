
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
import { Download, Milestone, ArrowRight, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';

const milestonesSchema = z.object({
  employeeName: z.string().min(1),
  role: z.string().min(1),
  manager: z.string().min(1),
  startDate: z.date(),
  goals30: z.string().min(1),
  goals60: z.string().min(1),
  goals90: z.string().min(1),
});

type MilestonesData = z.infer<typeof milestonesSchema>;

export function EmployeeMilestonesForm() {
  const { toast } = useToast();
  const form = useForm<MilestonesData>({
    resolver: zodResolver(milestonesSchema),
    defaultValues: {
      employeeName: "Satoshi Nakamoto",
      role: "Protocol Engineer",
      manager: "John Smith",
      startDate: new Date(),
      goals30: "• Complete onboarding and security training.\n• Successfully ship first small feature.\n• Understand the core protocol architecture.",
      goals60: "• Take ownership of a medium-sized feature.\n• Make a significant contribution to a core part of the codebase.\n• Present a feature demo to the team.",
      goals90: "• Independently lead the design and implementation of a new feature.\n• Actively participate in governance discussions.\n• Mentor one junior engineer.",
    },
  });
  
  React.useEffect(() => {
    form.reset({
        ...form.getValues(),
        startDate: new Date(),
    })
  }, [form]);


  const handleDownload = form.handleSubmit((data) => {
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const margin = 50;
      let y = margin;
      
      const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;

      doc.setFontSize(22).setFont('helvetica', 'bold').setTextColor('#111827');
      doc.text('30-60-90 Day Plan', margin, y);
      y += 30;
      
      doc.setFontSize(11).setFont('helvetica', 'normal').setTextColor('#374151');
      doc.text(`Employee: ${data.employeeName}`, margin, y);
      y += 15;
      doc.text(`Role: ${data.role}`, margin, y);
      y += 15;
      doc.text(`Manager: ${data.manager}`, margin, y);
      y += 15;
      doc.text(`Start Date: ${format(data.startDate, 'MMMM d, yyyy')}`, margin, y);
      y += 30;

      const addSection = (title: string, content: string) => {
          doc.setFontSize(14).setFont('helvetica', 'bold').setTextColor('#111827');
          doc.text(title, margin, y);
          y += 20;
          doc.setFontSize(11).setFont('helvetica', 'normal').setTextColor('#374151');
          const lines = doc.splitTextToSize(content, contentWidth);
          doc.text(lines, margin, y);
          y += lines.length * 15 + 25;
      }
      
      addSection('First 30 Days: Learning & Foundational Contributions', data.goals30);
      addSection('Days 31-60: Increased Ownership & Impact', data.goals60);
      addSection('Days 61-90: Leadership & Autonomy', data.goals90);

      doc.save('30-60-90-Day-Plan.pdf');
      toast({ title: "Success!", description: "Milestones plan downloaded as PDF." });
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
                  <Milestone className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl">Employee Milestones Tracker</CardTitle>
                <CardDescription>Create a structured 30-60-90 day plan for new hires.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input placeholder="Employee Name" {...form.register('employeeName')} />
                        <Input placeholder="Role" {...form.register('role')} />
                        <Input placeholder="Manager's Name" {...form.register('manager')} />
                        <Popover>
                            <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start font-normal">{watchedForm.startDate ? format(watchedForm.startDate, 'PPP') : <span>Pick a start date</span>}</Button></PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={watchedForm.startDate} onSelect={(d) => d && form.setValue('startDate', d)} initialFocus /></PopoverContent>
                        </Popover>
                    </div>
                    <Textarea placeholder="Goals for the first 30 days..." {...form.register('goals30')} rows={5} />
                    <Textarea placeholder="Goals for days 31-60..." {...form.register('goals60')} rows={5} />
                    <Textarea placeholder="Goals for days 61-90..." {...form.register('goals90')} rows={5} />
                </form>
            </CardContent>
        </Card>
        <div className="flex justify-center mt-8">
            <Button size="lg" onClick={handleDownload}><Download className="mr-2 h-4 w-4"/> Download as PDF</Button>
        </div>
         <Card className="mt-12 max-w-4xl mx-auto bg-primary/5 border-primary/20">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full hidden md:block">
                    <Briefcase className="h-8 w-8 text-primary"/>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-primary mb-1">Looking to Hire?</h3
                    <p className="text-muted-foreground">Find the right candidate to achieve these milestones by posting on the #1 Web3 job board.</p>
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
