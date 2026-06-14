
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
import {
 Download,
 Trash2,
 Plus,
 User,
 Briefcase,
 GraduationCap,
 Sparkles,
 BrainCircuit,
 Code,
 Rss,
 ArrowRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ResumePreview } from './resume-preview';
import type { ResumeData } from '@/types';

const contributionSchema = z.object({
 project: z.string().min(1, 'Project name is required'),
 role: z.string().min(1, 'Your role is required'),
 description: z.string().min(1, 'Description is required'),
 link: z.string().url().optional().or(z.literal('')),
});

const experienceSchema = z.object({
 company: z.string().min(1, 'Company is required'),
 role: z.string().min(1, 'Role is required'),
 date: z.string().min(1, 'Date range is required'),
 description: z.string().min(1, 'Description is required'),
});

const educationSchema = z.object({
 institution: z.string().min(1, 'Institution is required'),
 degree: z.string().min(1, 'Degree is required'),
 date: z.string().min(1, 'Date is required'),
});

const resumeSchema = z.object({
 name: z.string().min(1, 'Name is required'),
 title: z.string().min(1, 'Title is required'),
 email: z.string().email('Invalid email address'),
 phone: z.string().optional(),
 website: z.string().url().optional().or(z.literal('')),
 github: z.string().url().optional().or(z.literal('')),
 twitter: z.string().url().optional().or(z.literal('')),
 handle: z.string().optional(),
 summary: z.string().min(1, 'A summary is required'),
 contributions: z.array(contributionSchema),
 experience: z.array(experienceSchema),
 education: z.array(educationSchema),
 technicalSkills: z.string().min(1, 'Please list some skills'),
 generalSkills: z.string().min(1, 'Please list some skills'),
});

export function ResumeForm() {
 const { toast } = useToast();
 const form = useForm<ResumeData>({
  resolver: zodResolver(resumeSchema),
  defaultValues: {
   name: 'Jane Doe',
   title: 'Software Developer',
   email: 'jane.doe@email.com',
   phone: '+1 123 456 7890',
   website: 'https://janedoe.dev',
   github: 'https://github.com/janedoe',
   twitter: 'https://twitter.com/janedoe',
   handle: 'janedoe',
   summary:"Transitioned from a 5-year career in traditional finance after becoming fascinated by the potential of decentralized technology to create more open financial systems. For the past year, I have been an active contributor to open source projects, authoring 15+ analyses on protocol strategies, and building a public dashboard to track key metrics.",
   contributions: [
    {
     project: 'Decentralized Staking App',
     role: 'Personal Project',
     description:
      'Designed and deployed a gas-efficient smart contract using Foundry, achieving 99% test coverage. Built a React frontend with modern tools.',
     link: 'https://github.com/janedoe/staking-app',
    },
   ],
   experience: [
    {
     company: 'Acme Corp',
     role: 'Software Engineer',
     date: '2020-Present',
     description:
      'Led a cross-functional, remote-first squad of 5 engineers in an agile environment, shipping 3 major product features that increased user engagement by 15%.',
    },
   ],
   education: [
    {
     institution: 'University of Example',
     degree: 'B.S. in Computer Science',
     date: '2016-2020',
    },
   ],
   technicalSkills:
    'Solidity, Foundry, Ethers.js, The Graph, EIP-712, Tokenomics, DAO Governance, Dune Analytics',
   generalSkills:
    'JavaScript, React, Next.js, Python, SQL, Figma, Project Management',
  },
 });

 const {
  fields: contributionFields,
  append: appendContribution,
  remove: removeContribution,
 } = useFieldArray({ control: form.control, name: 'contributions' });
 const {
  fields: experienceFields,
  append: appendExperience,
  remove: removeExperience,
 } = useFieldArray({ control: form.control, name: 'experience' });
 const {
  fields: educationFields,
  append: appendEducation,
  remove: removeEducation,
 } = useFieldArray({ control: form.control, name: 'education' });

 const watchedForm = useWatch({ control: form.control });

 const handleDownload = form.handleSubmit(async data => {
  try {
   const { default: jsPDF } = await import('jspdf');
   const doc = new jsPDF('p', 'pt', 'a4');
   const margin = 40;
   const docWidth = doc.internal.pageSize.getWidth();
   let y = margin;

   doc.setFontSize(28).setFont('helvetica', 'bold').setTextColor('#111827');
   doc.text(data.name, docWidth / 2, y, { align: 'center' });
   y += 20;

   doc
    .setFontSize(14)
    .setFont('helvetica', 'normal')
    .setTextColor('#4B5563');
   doc.text(data.title.toUpperCase(), docWidth / 2, y, {
    align: 'center',
    charSpace: 2,
   });
   y += 25;

   const contactInfo = [
    data.email,
    data.phone,
    data.website,
    data.github,
    data.twitter,
    data.handle,
   ]
    .filter(Boolean)
    .join(' | ');
   doc.setFontSize(9).setTextColor('#4B5563');
   doc.text(contactInfo, docWidth / 2, y, { align: 'center' });
   y += 35;

   doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor('#111827');
   doc.text('Summary', margin, y);
   y += 15;
   doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor('#374151');
   const summaryLines = doc.splitTextToSize(
    data.summary,
    docWidth - margin * 2
   );
   doc.text(summaryLines, margin, y);
   y += summaryLines.length * 12 + 20;

   doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor('#111827');
   doc.text('Key Projects & Portfolio', margin, y);
   y += 15;
   data.contributions.forEach(c => {
    doc.setFontSize(10).setFont('helvetica', 'bold');
    doc.text(c.project, margin, y);
    doc.setFontSize(10).setFont('helvetica', 'italic').setTextColor('#4B5563');
    doc.text(c.role, margin + doc.getTextWidth(c.project) + 5, y);
    y += 15;
    doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor('#374151');
    const descLines = doc.splitTextToSize(
     c.description,
     docWidth - margin * 2
    );
    doc.text(descLines, margin, y);
    y += descLines.length * 12 + 5;
    if (c.link) {
     doc.setTextColor('#2563EB');
     doc.textWithLink(c.link, margin, y, { url: c.link });
     y += 12;
    }
    y += 10;
   });
   y += 10;

   doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor('#111827');
   doc.text('Professional Experience', margin, y);
   y += 15;
   data.experience.forEach(e => {
    doc.setFontSize(10).setFont('helvetica', 'bold');
    const roleWidth = doc.getTextWidth(e.role);
    doc.text(e.role, margin, y);
    doc.setFont('helvetica', 'normal').setTextColor('#4B5563');
    doc.text(e.company, margin + roleWidth + 5, y);
    doc.text(e.date, docWidth - margin, y, { align: 'right' });
    y += 15;
    doc.setFontSize(10).setTextColor('#374151');
    const descLines = doc.splitTextToSize(
     e.description,
     docWidth - margin * 2
    );
    doc.text(descLines, margin, y);
    y += descLines.length * 12 + 15;
   });

   doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor('#111827');
   doc.text('Education', margin, y);
   y += 15;
   data.education.forEach(ed => {
    doc.setFontSize(10).setFont('helvetica', 'bold');
    doc.text(ed.degree, margin, y);
    doc.setFont('helvetica', 'normal').setTextColor('#4B5563');
    doc.text(ed.date, docWidth - margin, y, { align: 'right' });
    y += 15;
    doc.setFont('helvetica', 'italic').setTextColor('#374151');
    doc.text(ed.institution, margin, y);
    y += 20;
   });

   doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor('#111827');
   doc.text('Skills', margin, y);
   y += 15;

   const addSkillsSection = (label: string, skills: string) => {
    if (y > doc.internal.pageSize.getHeight() - 50) {
     doc.addPage();
     y = margin;
    }
    doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor('#4B5563');
    doc.text(label, margin, y, { align: 'right' });
    doc.setFont('helvetica', 'normal').setTextColor('#374151');
    const skillLines = doc.splitTextToSize(
     skills,
     docWidth - margin - (margin + 100)
    );
    doc.text(skillLines, margin + 105, y);
    y += skillLines.length * 12 + 10;
   };

   addSkillsSection('Technical:', data.technicalSkills);
   addSkillsSection('General:', data.generalSkills);

   doc.save(`${data.name.replace(' ', '-')}-Resume.pdf`);
   toast({
    title: 'Success!',
    description: 'Your resume has been downloaded.',
   });
  } catch (error) {
   console.error(error);
   toast({
    variant: 'destructive',
    title: 'Error',
    description: 'Failed to generate PDF.',
   });
  }
 });

 return (
  <>
   <div className="bg-primary text-primary-foreground py-8 text-center">
    <h1 className="text-3xl font-bold">Professional Resume Builder</h1>
    <p className="opacity-80 mt-1">
     Craft a resume that gets noticed by recruiters.
    </p>
    <Button
     size="lg"
     className="mt-4 bg-white text-primary hover:bg-white/90"
     onClick={handleDownload}
    >
     <Download className="mr-2 h-4 w-4" /> Download as PDF
    </Button>
   </div>

   <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
     {/* Form Column */}
     <div className="space-y-6">
      <Card>
       <CardHeader>
        <CardTitle className="flex items-center gap-2">
         <User className="text-primary" /> Personal Details
        </CardTitle>
       </CardHeader>
       <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input placeholder="Name" {...form.register('name')} />
        <Input
         placeholder="Title (e.g. Software Developer)"
         {...form.register('title')}
        />
        <Input
         placeholder="Email"
         type="email"
         {...form.register('email')}
        />
        <Input placeholder="Phone" {...form.register('phone')} />
        <Input
         placeholder="Website/Portfolio URL"
         {...form.register('website')}
        />
        <Input placeholder="GitHub URL" {...form.register('github')} />
        <Input
         placeholder="Twitter URL"
         {...form.register('twitter')}
        />
        <Input
         placeholder="Professional Handle (e.g. username)"
         {...form.register('handle')}
        />
       </CardContent>
      </Card>

      <Card>
       <CardHeader>
        <CardTitle className="flex items-center gap-2">
         <BrainCircuit className="text-primary" /> Professional Summary
        </CardTitle>
       </CardHeader>
       <CardContent>
        <Textarea
         placeholder="Your 'elevator pitch' and professional passion..."
         {...form.register('summary')}
         rows={4}
        />
       </CardContent>
      </Card>

      <Card>
       <CardHeader>
        <CardTitle className="flex items-center gap-2">
         <Sparkles className="text-primary" /> Key Projects &
         Portfolio
        </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
        {contributionFields.map((item, index) => (
         <div
          key={item.id}
          className="p-4 border rounded-lg space-y-2 relative"
         >
          <Input
           placeholder="Project Name"
           {...form.register(`contributions.${index}.project`)}
          />
          <Input
           placeholder="Your Role (e.g. Personal Project, Contributor)"
           {...form.register(`contributions.${index}.role`)}
          />
          <Textarea
           placeholder="Description of your contribution..."
           {...form.register(`contributions.${index}.description`)}
          />
          <Input
           placeholder="Link to project/contribution"
           {...form.register(`contributions.${index}.link`)}
          />
          <Button
           variant="ghost"
           size="icon"
           className="absolute top-1 right-1"
           onClick={() => removeContribution(index)}
          >
           <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
         </div>
        ))}
        <Button
         type="button"
         variant="outline"
         onClick={() =>
          appendContribution({
           project: '',
           role: '',
           description: '',
          })
         }
        >
         <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
       </CardContent>
      </Card>

      <Card>
       <CardHeader>
        <CardTitle className="flex items-center gap-2">
         <Briefcase className="text-primary" /> Professional Experience
        </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
        {experienceFields.map((item, index) => (
         <div
          key={item.id}
          className="p-4 border rounded-lg space-y-2 relative"
         >
          <Input
           placeholder="Company Name"
           {...form.register(`experience.${index}.company`)}
          />
          <Input
           placeholder="Your Role"
           {...form.register(`experience.${index}.role`)}
          />
          <Input
           placeholder="Date Range (e.g. 2020-Present)"
           {...form.register(`experience.${index}.date`)}
          />
          <Textarea
           placeholder="Description of your responsibilities and achievements..."
           {...form.register(`experience.${index}.description`)}
          />
          <Button
           variant="ghost"
           size="icon"
           className="absolute top-1 right-1"
           onClick={() => removeExperience(index)}
          >
           <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
         </div>
        ))}
        <Button
         type="button"
         variant="outline"
         onClick={() =>
          appendExperience({
           company: '',
           role: '',
           date: '',
           description: '',
          })
         }
        >
         <Plus className="mr-2 h-4 w-4" /> Add Experience
        </Button>
       </CardContent>
      </Card>

      <Card>
       <CardHeader>
        <CardTitle className="flex items-center gap-2">
         <GraduationCap className="text-primary" /> Education
        </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
        {educationFields.map((item, index) => (
         <div
          key={item.id}
          className="p-4 border rounded-lg space-y-2 relative"
         >
          <Input
           placeholder="Institution"
           {...form.register(`education.${index}.institution`)}
          />
          <Input
           placeholder="Degree / Certificate"
           {...form.register(`education.${index}.degree`)}
          />
          <Input
           placeholder="Date (e.g. 2016-2020)"
           {...form.register(`education.${index}.date`)}
          />
          <Button
           variant="ghost"
           size="icon"
           className="absolute top-1 right-1"
           onClick={() => removeEducation(index)}
          >
           <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
         </div>
        ))}
        <Button
         type="button"
         variant="outline"
         onClick={() =>
          appendEducation({ institution: '', degree: '', date: '' })
         }
        >
         <Plus className="mr-2 h-4 w-4" /> Add Education
        </Button>
       </CardContent>
      </Card>

      <Card>
       <CardHeader>
        <CardTitle className="flex items-center gap-2">
         <Code className="text-primary" /> Skills
        </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
        <div>
         <Label>Technical Skills</Label>
         <Textarea
          placeholder="e.g. Solidity, Foundry, Ethers.js, The Graph, Tokenomics..."
          {...form.register('technicalSkills')}
         />
        </div>
        <div>
         <Label>General Skills</Label>
         <Textarea
          placeholder="e.g. JavaScript, React, Next.js, Python, SQL, Figma..."
          {...form.register('generalSkills')}
         />
        </div>
       </CardContent>
      </Card>

      <Card className="col-span-full bg-muted/30 border shadow-none">
       <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        
        <div>
         <h3 className="text-xl font-bold text-foreground mb-1">
          Ready to Apply?
         </h3>
         <p className="text-muted-foreground">
          Now that your resume is ready, find the perfect job on our
          Telegram channel with over 60,000 subscribers.
         </p>
        </div>
        <a
         href="https://t.me/web3hiring"
         target="_blank"
         rel="noopener noreferrer"
         className="flex-shrink-0 mt-4 md:mt-0"
        >
         <Button size="lg">
          Join Job Feed <ArrowRight className="ml-2 h-4 w-4" />
         </Button>
        </a>
       </CardContent>
      </Card>
     </div>
     {/* Preview Column */}
     <div>
      <div className="sticky top-[72px]">
       <ResumePreview data={watchedForm as any} />
      </div>
     </div>
    </div>
   </div>
  </>
 );
}
