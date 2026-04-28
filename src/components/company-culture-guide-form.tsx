'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Download, Users, Plus, Trash2, ArrowRight, Briefcase, MessageSquare, CheckCircle, Target, Zap, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const cultureGuideSchema = z.object({
 companyName: z.string().min(1, "Company Name is required"),
 mission: z.string().min(1, "Mission is required"),
 vision: z.string().min(1, "Vision is required"),
 values: z.array(z.object({ name: z.string().min(1), description: z.string().min(1) })).min(1),
 communication: z.string().min(1, "Communication style is required"),
 decisionMaking: z.string().optional(),
 feedbackCulture: z.string().optional(),
 hiringPhilosophy: z.string().optional(),
 meetingPhilosophy: z.string().optional(),
 tools: z.string().optional(),
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
   decisionMaking: 'Decisions are made through a consensus-seeking process, with major protocol changes ratified by a community vote.',
   feedbackCulture: 'We practice radical candor and provide continuous, constructive feedback. We have bi-weekly 1-on-1s and quarterly performance reviews.',
   hiringPhilosophy: 'We hire for passion, initiative, and a "proof of work" portfolio over traditional credentials. We value T-shaped individuals with deep expertise and broad curiosity.',
   meetingPhilosophy: 'Meetings are rare, have a clear agenda, a designated facilitator, and always end with clear action items. Cameras are on to foster connection.',
   tools: 'Our core stack: Discord for communication, Notion for documentation, Figma for design, GitHub for code, and Asana for project management.',
   rituals: 'Weekly all-hands call on Mondays. Bi-weekly sprint demos. Quarterly in-person team offsites.',
  },
 });

 const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "values",
 });

 const handleDownload = form.handleSubmit(async (data) => {
  try {
   const { default: jsPDF } = await import('jspdf');
   const doc = new jsPDF('p', 'pt', 'a4');
   const margin = 50;
   const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;
   let y = margin;

   doc.setFontSize(24).setFont('helvetica', 'bold').setTextColor('#111827');
   doc.text(`${data.companyName} Culture Guide`, margin, y);
   y += 40;

   const addSection = (title: string, text: string | undefined) => {
    if (!text) return;
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
   addSection('How We Make Decisions', data.decisionMaking);
   addSection('How We Give Feedback', data.feedbackCulture);
   addSection('Our Hiring Philosophy', data.hiringPhilosophy);
   addSection('Our Meeting Philosophy', data.meetingPhilosophy);
   addSection('Tools We Use', data.tools);
   addSection('Our Team Rituals', data.rituals);
   
   doc.save(`${data.companyName.replace(/ /g, '-')}-Culture-Guide.pdf`);
   toast({ title: "Success!", description: "Culture guide downloaded as PDF." });
  } catch (error) {
   console.error(error);
   toast({ variant: 'destructive', title: "Error", description: "Failed to generate PDF." });
  }
 });

 const SectionCard = ({ title, icon: Icon, description, children }: { title: string, icon: React.ElementType, description: string, children: React.ReactNode }) => (
   <Card>
    <CardHeader>
     <CardTitle className="flex items-center gap-2"><Icon className="text-primary"/> {title}</CardTitle>
     <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
     {children}
    </CardContent>
   </Card>
 )

 return (
  <div className="container mx-auto py-12">
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
         
        <CardTitle className="text-3xl">Company Culture Guide Builder</CardTitle>
        <CardDescription className="max-w-2xl mx-auto">
          A strong, well-defined culture is the foundation of any successful company, especially in a remote-first Web3 environment. This tool helps you articulate and document your company's core principles, creating a guide to align your team and attract the right talent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <Input placeholder="Company Name" {...form.register('companyName')} />
          
          <SectionCard title="Mission & Vision" icon={Target} description="Define your company's ultimate purpose and long-term aspiration.">
           <Textarea placeholder="What is your company's core purpose? What problem are you solving?" {...form.register('mission')} rows={3}/>
           <Textarea placeholder="What is the future you are trying to build? What does success look like in 5-10 years?" {...form.register('vision')} rows={3}/>
          </SectionCard>
          
          <SectionCard title="Core Values" icon={CheckCircle} description="List the fundamental beliefs and principles that guide your team's behavior.">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-2 relative bg-secondary/30">
                <Input placeholder="Value Name (e.g., Transparency)" {...form.register(`values.${index}.name`)} />
                <Textarea placeholder="Describe what this value looks like in practice at your company." {...form.register(`values.${index}.description`)} />
                 <Button variant="ghost" size="icon" className="absolute top-1 right-1" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => append({ name: '', description: '' })}><Plus className="mr-2 h-4 w-4"/> Add Value</Button>
          </SectionCard>
          
          <SectionCard title="Ways of Working" icon={Zap} description="Detail the practical philosophies that define your day-to-day operations.">
            <Textarea placeholder="Describe your communication style (e.g., async-first, tools used, expectations for response times)..." {...form.register('communication')} rows={4} />
            <Textarea placeholder="How are decisions made? (e.g. consensus-driven, top-down, responsible individuals)..." {...form.register('decisionMaking')} rows={4} />
            <Textarea placeholder="How do you handle feedback? (e.g. radical candor, 360 reviews, continuous feedback)..." {...form.register('feedbackCulture')} rows={4} />
            <Textarea placeholder="Describe your philosophy on meetings (e.g., when they are necessary, format, length)..." {...form.register('meetingPhilosophy')} rows={4} />
            <Textarea placeholder="What are your team's recurring rituals? (e.g., daily stand-ups, weekly all-hands, offsites)..." {...form.register('rituals')} rows={4} />
          </SectionCard>

          <SectionCard title="People & Tools" icon={Settings} description="Outline your approach to hiring and the tools that power your team.">
           <Textarea placeholder="What do you look for in new team members? What qualities define a successful hire?" {...form.register('hiringPhilosophy')} rows={4} />
           <Textarea placeholder="What are the main tools you use for communication, project management, and design?" {...form.register('tools')} rows={4} />
          </SectionCard>
        </form>
      </CardContent>
    </Card>
     <div className="flex justify-center mt-8">
      <Button size="lg" onClick={handleDownload}><Download className="mr-2 h-4 w-4"/> Download as PDF</Button>
    </div>
     <Card className="mt-12 max-w-4xl mx-auto bg-muted/30 border shadow-none">
      <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        
        <div>
          <h3 className="text-xl font-bold text-foreground mb-1">Looking to Hire?</h3>
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
  