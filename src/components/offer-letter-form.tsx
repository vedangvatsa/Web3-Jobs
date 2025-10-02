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
import { Download, FileSignature, Briefcase, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';

const offerLetterSchema = z.object({
  companyName: z.string().min(1, "Company Name is required"),
  companyAddress: z.string().min(1, "Company Address is required"),
  candidateName: z.string().min(1, "Candidate Name is required"),
  candidateAddress: z.string().min(1, "Candidate Address is required"),
  date: z.date(),
  jobTitle: z.string().min(1, "Job Title is required"),
  startDate: z.date(),
  salary: z.string().min(1, "Salary is required"),
  vestingDetails: z.string().optional(),
  reportingTo: z.string().optional(),
  offerExpiryDate: z.date(),
  senderName: z.string().min(1, "Sender Name is required"),
  senderTitle: z.string().min(1, "Sender Title is required"),
});

type OfferLetterData = z.infer<typeof offerLetterSchema>;

export function OfferLetterForm() {
  const { toast } = useToast();
  const form = useForm<OfferLetterData>({
    resolver: zodResolver(offerLetterSchema),
    defaultValues: {
      companyName: "Your Web3 Company",
      companyAddress: "123 Blockchain Ave, Decentraland",
      candidateName: "Jane Doe",
      candidateAddress: "456 Crypto Street, Ether City",
      date: new Date(),
      jobTitle: "Senior Solidity Developer",
      startDate: new Date(new Date().setDate(new Date().getDate() + 14)),
      salary: "$150,000 USD per year + 0.1% token allocation",
      vestingDetails: "Tokens vest over 4 years with a 1-year cliff.",
      reportingTo: "Head of Engineering",
      offerExpiryDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      senderName: "John Smith",
      senderTitle: "CEO",
    },
  });

  const watchedForm = useWatch({ control: form.control });

  const handleDownload = form.handleSubmit((data) => {
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const margin = 50;
      const contentWidth = doc.internal.pageSize.getWidth() - margin * 2;
      let y = margin;

      doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor('#4B5563');
      doc.text(format(data.date, 'MMMM d, yyyy'), margin, y);
      y += 40;

      doc.setFontSize(11).setFont('helvetica', 'bold');
      doc.text(data.candidateName, margin, y);
      y += 15;
      doc.setFont('helvetica', 'normal');
      const addressLines = doc.splitTextToSize(data.candidateAddress, contentWidth);
      doc.text(addressLines, margin, y);
      y += addressLines.length * 15 + 25;
      
      doc.setFontSize(11).setFont('helvetica', 'bold');
      doc.text(`Dear ${data.candidateName},`, margin, y);
      y += 25;
      
      const bodyText1 = `On behalf of ${data.companyName}, I am delighted to offer you the position of ${data.jobTitle}. We were incredibly impressed with your skills and experience and believe you will be a valuable asset to our team.`;
      const bodyText2 = `This letter outlines the terms and conditions of your employment.
      
Position: ${data.jobTitle}
Start Date: ${format(data.startDate, 'MMMM d, yyyy')}
${data.reportingTo ? `Reporting To: ${data.reportingTo}` : ''}

Compensation: Your starting salary will be ${data.salary}. ${data.vestingDetails || ''}

We are excited about the prospect of you joining our team and contributing to the future of the decentralized web.

This offer is open until ${format(data.offerExpiryDate, 'MMMM d, yyyy')}. Please sign and return a copy of this letter to confirm your acceptance.`;

      doc.setFontSize(11).setFont('helvetica', 'normal');
      const lines1 = doc.splitTextToSize(bodyText1, contentWidth);
      doc.text(lines1, margin, y);
      y += lines1.length * 15 + 15;
      
      const lines2 = doc.splitTextToSize(bodyText2, contentWidth);
      doc.text(lines2, margin, y);
      y += lines2.length * 15 + 40;

      doc.text('Sincerely,', margin, y);
      y += 40;

      doc.setFont('helvetica', 'bold');
      doc.text(data.senderName, margin, y);
      y += 15;
      doc.setFont('helvetica', 'normal');
      doc.text(data.senderTitle, margin, y);
      y += 15;
      doc.text(data.companyName, margin, y);


      doc.save('Offer_Letter.pdf');
      toast({ title: "Success!", description: "Offer Letter downloaded as PDF." });
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
                  <FileSignature className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl">Web3 Offer Letter Customizer</CardTitle>
                <CardDescription>Fill in the details to generate a professional offer letter.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle className="text-lg">Company Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Input placeholder="Company Name" {...form.register('companyName')} />
                            <Textarea placeholder="Company Address" {...form.register('companyAddress')} />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="text-lg">Candidate Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Input placeholder="Candidate Name" {...form.register('candidateName')} />
                            <Textarea placeholder="Candidate Address" {...form.register('candidateAddress')} />
                        </CardContent>
                    </Card>
                     <Card className="md:col-span-2">
                        <CardHeader><CardTitle className="text-lg">Offer Details</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input placeholder="Job Title" {...form.register('jobTitle')} />
                            <Input placeholder="Reporting To" {...form.register('reportingTo')} />
                            <Textarea className="sm:col-span-2" placeholder="Salary & Token Details" {...form.register('salary')} />
                            <Textarea className="sm:col-span-2" placeholder="Vesting Details" {...form.register('vestingDetails')} />
                             <div className="space-y-1">
                                <Label>Offer Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start font-normal">{format(form.watch('date'), 'PPP')}</Button></PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={form.watch('date')} onSelect={(d) => d && form.setValue('date', d)} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-1">
                                <Label>Start Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start font-normal">{format(form.watch('startDate'), 'PPP')}</Button></PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={form.watch('startDate')} onSelect={(d) => d && form.setValue('startDate', d)} /></PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-1">
                                <Label>Offer Expiry Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start font-normal">{format(form.watch('offerExpiryDate'), 'PPP')}</Button></PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={form.watch('offerExpiryDate')} onSelect={(d) => d && form.setValue('offerExpiryDate', d)} /></PopoverContent>
                                </Popover>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle className="text-lg">Sender Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Input placeholder="Your Name" {...form.register('senderName')} />
                            <Input placeholder="Your Title" {...form.register('senderTitle')} />
                        </CardContent>
                    </Card>
                </form>
            </CardContent>
        </Card>
        <div className="flex justify-center mt-8">
            <Button size="lg" onClick={handleDownload}><Download className="mr-2 h-4 w-4"/> Download PDF</Button>
        </div>
        
         <Card className="mt-12 max-w-4xl mx-auto bg-primary/5 border-primary/20">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full hidden md:block">
                    <Briefcase className="h-8 w-8 text-primary"/>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-primary mb-1">Ready to Hire?</h3>
                    <p className="text-muted-foreground">Now that your offer letter is ready, post your job to reach over 100,000 Web3 professionals.</p>
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
