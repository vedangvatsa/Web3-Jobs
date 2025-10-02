'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Download, Users, Plus, Trash2, ArrowRight, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

const cultureGuideSchema = z.object({
  companyName: z.string().min(1, "Company Name is required"),
  mission: z.string().min(1, "Mission is required"),
  vision: z.string().min(1, "Vision is required"),
  values: z.array(z.object({ name: z.string().min(1), description: z.string().min(1) })).min(1),
  communication: z.string().min(1, "Communication style is required"),
  rituals: z.string().min(1, "Team rituals are required"),
});

type CultureGuideData = z.infer<typeof cultureGuideSchema>;

export function CompanyCultureGuideForm() {
  const { toast } = useToast();
  const form = useForm<CultureGuideData>({
    resolver: zodResolver(cultureGuideSchema),
    defaultValues: {
      companyName: 'ACME Web3',
      mission: 'To build a more open and decentralized internet for everyone.',
      vision: 'To be the leading platform for decentralized applications, empowering users with full control over their digital identity and assets.',
      values: [
        { name: 'Transparency', description: 'We operate in public by default. Decisions are made openly through our governance process.' },
        { name: 'Ownership', description: 'Every team member is an owner. We take initiative and responsibility for our work.' },
        { name: 'Community-First', description: 'We build with and for our community. Their success is our success.' },
      ],
      communication: 'We are an async-first team. We prioritize clear, written communication in Notion and Discord over meetings. Meetings are for high-bandwidth discussions, not status updates.',
      rituals: 'Weekly all-hands call on Mondays. Bi-weekly sprint demos. Quarterly in-person team offsites.',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "values",
  });

  const handleDownload = form.handleSubmit((data) => {
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const margin = 50;
      const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;
      let y = margin;

      doc.setFontSize(24).setFont('helvetica', 'bold').setTextColor('#111827');
      doc.text(`${data.companyName} Culture Guide`, margin, y);
      y += 40;

      const addSection = (title: string, text: string) => {
        if (y > doc.internal.pageSize.getHeight() - 100) { doc.addPage(); y = margin; }
        doc.setFontSize(14).setFont('helvetica', 'bold').setTextColor('#111827');
        doc.text(title, margin, y);
        y += 20;
        doc.setFontSize(11).setFont('helvetica', 'normal').setTextColor('#374151');
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 15 + 20;
      }
      
      addSection('Our Mission', data.mission);
      addSection('Our Vision', data.vision);

      if (y > doc.internal.pageSize.getHeight() - 100) { doc.addPage(); y = margin; }
      doc.setFontSize(14).setFont('helvetica', 'bold').setTextColor('#111827');
      doc.text('Our Core Values', margin, y);
      y += 20;
      data.values.forEach(value => {
        if (y > doc.internal.pageSize.getHeight() - 50) { doc.addPage(); y = margin; }
        doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor('#374151');
        doc.text(value.name, margin, y);
        y += 15;
        doc.setFontSize(11).setFont('helvetica', 'normal').setTextColor('#374151');
        const descLines = doc.splitTextToSize(value.description, contentWidth);
        doc.text(descLines, margin, y);
        y += descLines.length * 15 + 10;
      });
      y+= 10;

      addSection('How We Communicate', data.communication);
      addSection('Our Team Rituals', data.rituals);
      
      doc.save(`${data.companyName.replace(/ /g, '-')}-Culture-Guide.pdf`);
      toast({ title: "Success!", description: "Culture guide downloaded as PDF." });
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
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl">Company Culture Guide Builder</CardTitle>
                <CardDescription>Define and document your company's values and ways of working.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="space-y-6">
                    <Input placeholder="Company Name" {...form.register('companyName')} />
                    <Textarea placeholder="Company Mission" {...form.register('mission')} rows={3}/>
                    <Textarea placeholder="Company Vision" {...form.register('vision')} rows={3}/>
                    
                    <Card>
                        <CardHeader><CardTitle className="text-lg">Core Values</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg space-y-2 relative">
                                    <Input placeholder="Value Name (e.g., Transparency)" {...form.register(`values.${index}.name`)} />
                                    <Textarea placeholder="Value Description" {...form.register(`values.${index}.description`)} />
                                     <Button variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => append({ name: '', description: '' })}><Plus className="mr-2 h-4 w-4"/> Add Value</Button>
                        </CardContent>
                    </Card>

                    <Textarea placeholder="Describe your communication style (e.g., async-first, tools used)..." {...form.register('communication')} rows={4} />
                    <Textarea placeholder="Describe your team rituals (e.g., daily stand-ups, weekly all-hands)..." {...form.register('rituals')} rows={4} />
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
                    <p className="text-muted-foreground">Now that your culture is defined, find candidates who are a perfect fit by posting on the #1 Web3 job board.</p>
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
