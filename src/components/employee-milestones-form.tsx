'use client';

import * as React from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Milestone, ArrowRight, Briefcase, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';

const milestoneItemSchema = z.object({
 description: z.string().min(1, 'Milestone description is required'),
 metric: z.string().min(1, 'Success metric is required'),
});

const objectiveSchema = z.object({
 title: z.string().min(1, 'Objective title is required'),
 milestones: z.array(milestoneItemSchema).min(1, 'At least one milestone is required'),
});

const milestonesSchema = z.object({
 employeeName: z.string().min(1),
 role: z.string().min(1),
 manager: z.string().min(1),
 period: z.string().min(1, 'Tracking period is required'),
 objectives: z.array(objectiveSchema).min(1, 'At least one objective is required'),
});

type MilestonesData = z.infer<typeof milestonesSchema>;

export function EmployeeMilestonesForm() {
 const { toast } = useToast();
 const form = useForm<MilestonesData>({
  resolver: zodResolver(milestonesSchema),
  defaultValues: {
   employeeName: "Jane Doe",
   role: "Senior Engineer",
   manager: "John Smith",
   period: `Q3 ${new Date().getFullYear()}`,
   objectives: [
    {
     title: "Launch New Feature 'X'",
     milestones: [
      { description: 'Finalize technical specification document.', metric: 'Spec approved by lead engineer.' },
      { description: 'Complete backend development for core APIs.', metric: 'All API endpoints deployed to staging.' },
      { description: 'Ship feature to 100% of production users.', metric: 'Feature flag fully rolled out.' },
     ]
    },
    {
     title: "Improve Protocol Gas Efficiency",
     milestones: [
      { description: 'Identify top 3 most gas-intensive functions.', metric: 'Gas usage report published.' },
      { description: 'Implement optimizations for identified functions.', metric: 'PRs merged for all 3 functions.' },
      { description: 'Achieve a 15% average reduction in gas costs.', metric: 'Confirmed via on-chain analysis.' },
     ]
    }
   ],
  },
 });
 
 const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "objectives"
 });

 const handleDownload = form.handleSubmit(async (data) => {
  try {
   const { default: jsPDF } = await import('jspdf');
   const doc = new jsPDF('p', 'pt', 'a4');
   const margin = 50;
   const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;
   let y = margin;

   doc.setFontSize(22).setFont('helvetica', 'bold').setTextColor('#111827');
   doc.text('Employee Performance Milestones', margin, y);
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
   addShortField('Period:', data.period || '____________________');
   y += 20;

   data.objectives.forEach((objective, index) => {
     if (y > doc.internal.pageSize.getHeight() - 150) { doc.addPage(); y = margin; }
     doc.setFontSize(14).setFont('helvetica', 'bold').setTextColor(41, 106, 187);
     doc.text(`Key Objective ${index + 1}: ${objective.title}`, margin, y);
     y += 25;
     
     objective.milestones.forEach((milestone, mIndex) => {
       if (y > doc.internal.pageSize.getHeight() - 60) { doc.addPage(); y = margin; }
       doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#111827');
       doc.text(`- Milestone ${mIndex + 1}:`, margin, y);
       
       doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor('#374151');
       const descLines = doc.splitTextToSize(milestone.description, contentWidth - 10);
       doc.text(descLines, margin + 10, y += 15);
       y += descLines.length * 12 + 5;
       
       doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor('#374151');
       doc.text('Success Metric:', margin + 10, y);
       doc.setFontSize(10).setFont('helvetica', 'italic').setTextColor('#374151');
       const metricLines = doc.splitTextToSize(milestone.metric, contentWidth - 100);
       doc.text(metricLines, margin + 100, y);
       y += metricLines.length * 12 + 15;
     });
     y += 10;
   });


   doc.save('Employee-Milestones.pdf');
   toast({ title: "Success!", description: "Milestones plan downloaded as PDF." });
  } catch (error) {
   console.error(error);
   toast({ variant: 'destructive', title: "Error", description: "Failed to generate PDF." });
  }
 });

 const ObjectiveForm = ({ objectiveIndex }: { objectiveIndex: number }) => {
  const { fields: milestoneFields, append: appendMilestone, remove: removeMilestone } = useFieldArray({
   control: form.control,
   name: `objectives.${objectiveIndex}.milestones`
  });

  return (
    <Card className="bg-secondary/30 p-4">
      <div className="flex justify-between items-center mb-4">
         <Input placeholder="Key Objective Title" {...form.register(`objectives.${objectiveIndex}.title`)} className="text-lg font-semibold"/>
         <Button variant="ghost" size="icon" onClick={() => remove(objectiveIndex)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
      </div>
      <div className="space-y-3 pl-4">
       {milestoneFields.map((field, mIndex) => (
        <div key={field.id} className="p-3 border-l-2 border-primary/50 bg-background rounded-r-lg space-y-2 relative">
          <Textarea placeholder="Specific milestone or task..." {...form.register(`objectives.${objectiveIndex}.milestones.${mIndex}.description`)} rows={2} />
          <Input placeholder="Success Metric..." {...form.register(`objectives.${objectiveIndex}.milestones.${mIndex}.metric`)} />
          <Button variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => removeMilestone(mIndex)}><Trash2 className="h-4 w-4 text-destructive/70"/></Button>
        </div>
       ))}
       <Button type="button" variant="outline" size="sm" onClick={() => appendMilestone({ description: '', metric: '' })}>
        <Plus className="mr-2 h-4 w-4"/> Add Milestone
       </Button>
      </div>
    </Card>
  );
 };

 return (
  <div className="container mx-auto py-12">
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
         
        <CardTitle className="text-3xl">Employee Milestones Tracker</CardTitle>
        <CardDescription className="max-w-2xl mx-auto">
         A structured 30-60-90 day plan is crucial for aligning new hires with company goals and ensuring their success. This tool helps managers and employees collaboratively define key objectives and measurable milestones for the initial period of employment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Start by filling in the essential details for this milestone plan.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input placeholder="Employee Name" {...form.register('employeeName')} />
              <Input placeholder="Role" {...form.register('role')} />
              <Input placeholder="Manager's Name" {...form.register('manager')} />
              <Input placeholder="Tracking Period (e.g. Q3 2026)" {...form.register('period')} />
            </CardContent>
          </Card>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <ObjectiveForm key={field.id} objectiveIndex={index} />
            ))}
          </div>

          <Button type="button" variant="secondary" className="w-full" onClick={() => append({ title: '', milestones: [{description: '', metric: ''}] })}>
            <Plus className="mr-2 h-4 w-4"/> Add New Key Objective
          </Button>
          
        </form>
      </CardContent>
    </Card>
    <div className="flex justify-center mt-8">
      <Button size="lg" onClick={handleDownload}><Download className="mr-2 h-4 w-4"/> Download as PDF</Button>
    </div>
     <Card className="mt-12 max-w-4xl mx-auto bg-primary/5 border-primary/20">
      <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        
        <div>
          <h3 className="text-xl font-bold text-primary mb-1">Looking to Hire Top Talent?</h3>
          <p className="text-muted-foreground">Find the right candidate to achieve these milestones by posting on the #1 Web3 job board and reaching over 100,000 professionals.</p>
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
