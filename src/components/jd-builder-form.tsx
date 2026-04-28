
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
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select';
import { Download, Trash2, Plus, Briefcase, Target, CheckSquare, Sparkles, Bot, ArrowRight, ClipboardEdit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';


const jobDescriptionSchema = z.object({
 jobTitle: z.string().min(1, 'Job title is required'),
 companyName: z.string().min(1, 'Company name is required'),
 location: z.string().min(1, 'Location is required'),
 jobType: z.string().min(1, 'Job type is required'),
 salaryRange: z.string().optional(),
 aboutCompany: z.string().min(1, 'Company description is required'),
 aboutRole: z.string().min(1, 'Role description is required'),
 responsibilities: z.array(z.object({ value: z.string().min(1) })),
 qualifications: z.array(z.object({ value: z.string().min(1) })),
 preferredQualifications: z.array(z.object({ value: z.string().optional() })),
});

type JobDescriptionData = z.infer<typeof jobDescriptionSchema>;

const JDPreview = ({ data }: { data: JobDescriptionData }) => {
  return (
    <Card className="shadow-sm h-full">
      <CardContent className="p-8 font-sans text-gray-800 bg-white min-h-[1200px]">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{data.jobTitle || "Job Title"}</h2>
        <p className="font-semibold text-gray-700">{data.companyName || "Your Company"}</p>
        <p className="text-sm text-gray-500">{data.location || "Location"} &bull; {data.jobType || "Job Type"}</p>
        {data.salaryRange && <p className="text-sm text-gray-500 mt-1">Salary: {data.salaryRange}</p>}

        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2 border-b pb-1">About {data.companyName || "the Company"}</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.aboutCompany || "Tell us about your company..."}</p>
        </div>
        
        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2 border-b pb-1">About the Role</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.aboutRole || "Describe the role..."}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2 border-b pb-1">Responsibilities</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            {data.responsibilities.map((r, i) => r.value && <li key={i}>{r.value}</li>)}
          </ul>
        </div>
        
        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2 border-b pb-1">Qualifications</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            {data.qualifications.map((q, i) => q.value && <li key={i}>{q.value}</li>)}
          </ul>
        </div>
        
        {data.preferredQualifications && data.preferredQualifications.some(q => q.value) && (
           <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2 border-b pb-1">Preferred Qualifications</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
              {data.preferredQualifications.map((q, i) => q.value && <li key={i}>{q.value}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function JDBuilderForm() {
 const { toast } = useToast();
 const form = useForm<JobDescriptionData>({
  resolver: zodResolver(jobDescriptionSchema),
  defaultValues: {
   jobTitle: 'Senior Solidity Developer',
   companyName: 'ACME DeFi',
   location: 'Remote (Global)',
   jobType: 'Full-time',
   salaryRange: '$150,000 - $200,000 USD + Tokens',
   aboutCompany: 'ACME DeFi is a leading decentralized exchange protocol on Ethereum, focused on providing deep liquidity and a world-class trading experience.',
   aboutRole: 'We are seeking an experienced Solidity developer to join our core engineering team. You will be responsible for designing, building, and maintaining the smart contracts that power our protocol.',
   responsibilities: [
    { value: 'Design, develop, and test secure and gas-efficient Solidity smart contracts.' },
    { value: 'Collaborate with frontend engineers to integrate contracts with our dApp.' },
    { value: 'Participate in security audits and implement remediation for findings.' },
    { value: 'Contribute to protocol upgrade planning and execution.' },
   ],
   qualifications: [
    { value: '3+ years of experience in Solidity development.' },
    { value: 'Deep understanding of the EVM and DeFi security best practices.' },
    { value: 'Proven experience with Foundry or Hardhat.' },
    { value: 'Strong CS fundamentals (data structures, algorithms).' },
   ],
   preferredQualifications: [
    { value: 'Experience with gas optimization techniques.' },
    { value: 'Contributions to open-source Web3 projects.' },
    { value: 'Familiarity with Layer 2 scaling solutions.' },
   ],
  },
 });

 const { fields: respFields, append: appendResp, remove: removeResp } = useFieldArray({ control: form.control, name: 'responsibilities' });
 const { fields: qualFields, append: appendQual, remove: removeQual } = useFieldArray({ control: form.control, name: 'qualifications' });
 const { fields: prefQualFields, append: appendPrefQual, remove: removePrefQual } = useFieldArray({ control: form.control, name: 'preferredQualifications' });

 const watchedForm = useWatch({ control: form.control });

 const handleDownload = form.handleSubmit(async (data) => {
  try {
    const { default: jsPDF } = await import('jspdf');
   const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 40;
    const docWidth = doc.internal.pageSize.getWidth();
    const contentWidth = docWidth - margin * 2;
    let y = margin;

    const addSection = (title: string, items: { value?: string }[]) => {
      if (items.some(item => item.value)) {
        y += 10;
        doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor(29, 40, 58);
        doc.text(title, margin, y, { maxWidth: contentWidth });
        y += 6;
        doc.setDrawColor(229, 231, 235);
        doc.line(margin, y, docWidth - margin, y);
        y += 15;
        doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(55, 65, 81);
        items.forEach(item => {
          if (item.value) {
            const lines = doc.splitTextToSize(`• ${item.value}`, contentWidth - 10);
            if (y + (lines.length * 12) > doc.internal.pageSize.getHeight() - margin) {
              doc.addPage();
              y = margin;
            }
            doc.text(lines, margin + 10, y);
            y += (lines.length * 12) + 4;
          }
        });
        y += 10;
      }
    };

    // Title
    doc.setFontSize(22).setFont('helvetica', 'bold').setTextColor(29, 40, 58);
    const titleLines = doc.splitTextToSize(data.jobTitle, contentWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 22;

    // Sub-header
    doc.setFontSize(11).setFont('helvetica', 'normal').setTextColor(75, 85, 99);
    const subHeader = `${data.companyName} | ${data.location} | ${data.jobType}`;
    doc.text(subHeader, margin, y);
    y += 15;
    if(data.salaryRange) {
      doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(75, 85, 99);
      doc.text(`Salary: ${data.salaryRange}`, margin, y);
      y += 15;
    }
    y += 15;
    
    // About Company
    doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor(29, 40, 58);
    doc.text(`About ${data.companyName}`, margin, y);
    y += 6;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, docWidth - margin, y);
    y += 15;
    doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(55, 65, 81);
    const aboutCompanyLines = doc.splitTextToSize(data.aboutCompany, contentWidth);
    doc.text(aboutCompanyLines, margin, y);
    y += aboutCompanyLines.length * 12 + 10;
    
    // About Role
    doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor(29, 40, 58);
    doc.text('About the Role', margin, y);
    y += 6;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, docWidth - margin, y);
    y += 15;
    doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(55, 65, 81);
    const aboutRoleLines = doc.splitTextToSize(data.aboutRole, contentWidth);
    doc.text(aboutRoleLines, margin, y);
    y += aboutRoleLines.length * 12 + 10;
    
    // Sections
    addSection('Responsibilities', data.responsibilities);
    addSection('Qualifications', data.qualifications);
    addSection('Preferred Qualifications', data.preferredQualifications);

    doc.save(`${data.jobTitle.replace(/ /g, '-')}-JD.pdf`);
    
    toast({ title: "Success!", description: "Job description downloaded as PDF." });
  } catch (error) {
    console.error(error);
    toast({ variant: 'destructive', title: "Error", description: "Failed to generate file." });
  }
 });
 
  const FieldArrayInput = ({ fields, remove, append, placeholder, label }: any) => (
  <div className="space-y-2">
   {fields.map((field: any, index: number) => (
    <div key={field.id} className="flex items-center gap-2">
     <Input {...form.register(`${label}.${index}.value` as any)} placeholder={placeholder} />
     <Button variant="ghost" size="icon" onClick={() => remove(index)}>
      <Trash2 className="h-4 w-4 text-destructive" />
     </Button>
    </div>
   ))}
   <Button type="button" variant="outline" onClick={() => append({ value: '' })}>
    <Plus className="mr-2 h-4 w-4" /> Add
   </Button>
  </div>
 );

 return (
  <>
   <div className="bg-primary text-primary-foreground py-8 text-center">
    <h1 className="text-3xl font-bold">Web3 Job Description Builder</h1>
    <p className="opacity-80 mt-1">Attract top talent with a perfectly crafted job description.</p>
    <Button size="lg" className="mt-4 bg-white text-primary hover:bg-white/90" onClick={handleDownload}>
     <Download className="mr-2 h-4 w-4" /> Download as PDF
    </Button>
   </div>

   <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
     {/* Form Column */}
     <div className="space-y-6">
      <Card>
       <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="text-primary"/> Basic Information</CardTitle></CardHeader>
       <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input placeholder="Job Title" {...form.register('jobTitle')} />
        <Input placeholder="Company Name" {...form.register('companyName')} />
        <Input placeholder="Location (e.g. Remote, NYC)" {...form.register('location')} />
        <Select onValueChange={(val) => form.setValue('jobType', val)} defaultValue={form.getValues('jobType')}>
         <SelectTrigger><SelectValue placeholder="Job Type" /></SelectTrigger>
         <SelectContent>
          <SelectItem value="Full-time">Full-time</SelectItem>
          <SelectItem value="Part-time">Part-time</SelectItem>
          <SelectItem value="Contract">Contract</SelectItem>
          <SelectItem value="Internship">Internship</SelectItem>
         </SelectContent>
        </Select>
        <div className="sm:col-span-2">
          <Input placeholder="Salary Range (e.g. $150k - $200k)" {...form.register('salaryRange')} />
        </div>
       </CardContent>
      </Card>

      <Card>
       <CardHeader><CardTitle className="flex items-center gap-2"><Target className="text-primary"/> About the Company & Role</CardTitle></CardHeader>
       <CardContent className="space-y-4">
        <Textarea placeholder="Tell us about your company's mission and culture..." {...form.register('aboutCompany')} rows={5} />
        <Textarea placeholder="Describe the role, its impact, and what success looks like..." {...form.register('aboutRole')} rows={5} />
       </CardContent>
      </Card>
      
      <Card>
       <CardHeader><CardTitle className="flex items-center gap-2"><CheckSquare className="text-primary"/> Responsibilities</CardTitle></CardHeader>
       <CardContent>
         <FieldArrayInput fields={respFields} remove={removeResp} append={appendResp} placeholder="e.g. Design and build smart contracts..." label="responsibilities" />
       </CardContent>
      </Card>
      
      <Card>
       <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="text-primary"/> Qualifications</CardTitle></CardHeader>
       <CardContent>
        <FieldArrayInput fields={qualFields} remove={removeQual} append={appendQual} placeholder="e.g. 3+ years of Solidity experience..." label="qualifications" />
       </CardContent>
      </Card>

      <Card>
       <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="text-primary"/> Preferred Qualifications</CardTitle></CardHeader>
       <CardContent>
        <FieldArrayInput fields={prefQualFields} remove={removePrefQual} append={appendPrefQual} placeholder="e.g. Experience with L2s..." label="preferredQualifications" />
       </CardContent>
      </Card>

       <Card className="col-span-full bg-muted/30 border shadow-none">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">Ready to Hire?</h3>
            <p className="text-muted-foreground">Post your job on the #1 Web3 job board to reach over 100,000 qualified professionals.</p>
          </div>
          <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mt-4 md:mt-0">
            <Button size="lg">
              Post a Job <ArrowRight className="ml-2 h-4 w-4"/>
            </Button>
          </a>
        </CardContent>
      </Card>

     </div>

     {/* Preview Column */}
     <div>
      <div className="sticky top-8">
       <JDPreview data={watchedForm as any} />
      </div>
     </div>
    </div>
   </div>
  </>
 );
}
