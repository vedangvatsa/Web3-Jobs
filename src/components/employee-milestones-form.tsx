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
import { Download, Milestone, ArrowRight, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';

const milestonePeriodSchema = z.object({
  focus: z.string().min(1),
  goals: z.string().min(1),
  metrics: z.string().min(1),
});

const milestonesSchema = z.object({
  employeeName: z.string().min(1),
  role: z.string().min(1),
  manager: z.string().min(1),
  startDate: z.date(),
  period30: milestonePeriodSchema,
  period60: milestonePeriodSchema,
  period90: milestonePeriodSchema,
});

type MilestonesData = z.infer<typeof milestonesSchema>;

export function EmployeeMilestonesForm() {
  const { toast } = useToast();
  const form = useForm<MilestonesData>({
    resolver: zodResolver(milestonesSchema),
    defaultValues: {
      employeeName: "",
      role: "",
      manager: "",
      startDate: new Date(),
      period30: {
        focus: "Learning & Immersion",
        goals: "• Complete all company onboarding modules.\n• Meet with key team members across 3 departments.\n• Understand the core protocol architecture and value proposition.\n• Ship first small, non-critical pull request.",
        metrics: "• Onboarding checklist 100% complete.\n• PR merged."
      },
      period60: {
        focus: "Contribution & Execution",
        goals: "• Take ownership of a medium-sized feature.\n• Contribute to product planning for the next sprint.\n• Write one piece of internal documentation.",
        metrics: "• Feature shipped to staging.\n• Documentation page published in Notion."
      },
      period90: {
        focus: "Ownership & Initiative",
        goals: "• Independently lead the design and implementation of a new feature.\n• Propose a process improvement for the team.\n• Mentor one new team member or community contributor.",
        metrics: "• Feature successfully launched to production.\n• Process improvement adopted by the team."
      },
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
      const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;
      let y = margin;

      doc.setFontSize(22).setFont('helvetica', 'bold').setTextColor('#111827');
      doc.text('30-60-90 Day Plan', margin, y);
      y += 30;
      
      const addShortField = (label: string, value: string) => {
          doc.setFontSize(11).setFont('helvetica', 'normal').setTextColor('#374151');
          doc.text(label, margin, y);
          doc.setFont('helvetica', 'bold');
          doc.text(value, margin + doc.getTextWidth(label) + 5, y);
          y += 20;
      }

      addShortField('Employee:', data.employeeName || '____________________');
      addShortField('Role:', data.role || '____________________');
      addShortField('Manager:', data.manager || '____________________');
      addShortField('Start Date:', data.startDate ? format(data.startDate, 'PPP') : '____________________');
      y += 15;

      const addSection = (title: string, focus: string, goals: string, metrics: string) => {
          if (y > doc.internal.pageSize.getHeight() - 150) { doc.addPage(); y = margin; }
          doc.setFontSize(16).setFont('helvetica', 'bold').setTextColor(41, 106, 187);
          doc.text(title, margin, y);
          y += 25;
          
          doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#111827');
          doc.text('Focus Area:', margin, y);
          doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor('#374151');
          const focusLines = doc.splitTextToSize(focus, contentWidth);
          doc.text(focusLines, margin, y += 15);
          y += focusLines.length * 12 + 10;

          doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#111827');
          doc.text('Key Goals:', margin, y);
          doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor('#374151');
          const goalsLines = doc.splitTextToSize(goals, contentWidth);
          doc.text(goalsLines, margin, y += 15);
          y += goalsLines.length * 12 + 10;

          doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#111827');
          doc.text('Success Metrics:', margin, y);
          doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor('#374151');
          const metricsLines = doc.splitTextToSize(metrics, contentWidth);
          doc.text(metricsLines, margin, y += 15);
          y += metricsLines.length * 12 + 25;
      }
      
      addSection('First 30 Days', data.period30.focus, data.period30.goals, data.period30.metrics);
      addSection('Days 31-60', data.period60.focus, data.period60.goals, data.period60.metrics);
      addSection('Days 61-90', data.period90.focus, data.period90.goals, data.period90.metrics);


      doc.save('30-60-90-Day-Plan.pdf');
      toast({ title: "Success!", description: "Milestones plan downloaded as PDF." });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: "Error", description: "Failed to generate PDF." });
    }
  });

  const watchedForm = useWatch({ control: form.control });

  const MilestonePeriodForm = ({ period, title }: { period: 'period30' | 'period60' | 'period90', title: string}) => (
      <Card>
          <CardHeader>
              <CardTitle className="text-xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label>Focus Area</Label>
                  <Input placeholder="e.g. Learning & Immersion" {...form.register(`${period}.focus`)} />
              </div>
              <div className="space-y-2">
                  <Label>Key Goals</Label>
                  <Textarea placeholder="• Bulleted list of primary objectives..." {...form.register(`${period}.goals`)} rows={5} />
              </div>
              <div className="space-y-2">
                  <Label>Success Metrics</Label>
                  <Textarea placeholder="• How will success for the above goals be measured?" {...form.register(`${period}.metrics`)} rows={3} />
              </div>
          </CardContent>
      </Card>
  );

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
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input placeholder="Employee Name" {...form.register('employeeName')} />
                            <Input placeholder="Role" {...form.register('role')} />
                            <Input placeholder="Manager's Name" {...form.register('manager')} />
                            <Popover>
                                <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start font-normal">{watchedForm.startDate ? format(watchedForm.startDate, 'PPP') : <span>Pick a start date</span>}</Button></PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={watchedForm.startDate} onSelect={(d) => d && form.setValue('startDate', d)} initialFocus /></PopoverContent>
                            </Popover>
                        </CardContent>
                    </Card>
                    
                    <MilestonePeriodForm period="period30" title="First 30 Days" />
                    <MilestonePeriodForm period="period60" title="Days 31-60" />
                    <MilestonePeriodForm period="period90" title="Days 61-90" />
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
                    <h3 className="text-xl font-bold text-primary mb-1">Looking to Hire?</h3>
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
