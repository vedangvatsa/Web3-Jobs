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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CtaBanner } from '@/components/cta-banner';
import { createPdfInstance, addPdfHeading, addPdfShortField } from '@/lib/pdf-utils';

const offerLetterSchema = z.object({
  companyName: z.string().min(1, 'Company Name is required'),
  companyAddress: z.string().min(1, 'Company Address is required'),
  candidateName: z.string().min(1, 'Candidate Name is required'),
  candidateAddress: z.string().min(1, 'Candidate Address is required'),
  date: z.date(),
  jobTitle: z.string().min(1, 'Job Title is required'),
  startDate: z.date(),
  salary: z.string().min(1, 'Salary is required'),
  vestingDetails: z.string().optional(),
  reportingTo: z.string().optional(),
  offerExpiryDate: z.date(),
  senderName: z.string().min(1, 'Sender Name is required'),
  senderTitle: z.string().min(1, 'Sender Title is required'),
});

type OfferLetterData = z.infer<typeof offerLetterSchema>;

export function OfferLetterForm() {
  const { toast } = useToast();
  const form = useForm<OfferLetterData>({
    resolver: zodResolver(offerLetterSchema),
    defaultValues: {
      companyName: 'Your Web3 Company',
      companyAddress: '123 Blockchain Ave, Decentraland',
      candidateName: '',
      candidateAddress: '',
      jobTitle: 'Senior Solidity Developer',
      salary: '$150,000 USD per year + 0.1% token allocation',
      vestingDetails: 'Tokens vest over 4 years with a 1-year cliff.',
      reportingTo: 'Head of Engineering',
      senderName: 'John Smith',
      senderTitle: 'CEO',
    },
  });

  React.useEffect(() => {
    const today = new Date();
    form.reset({
      ...form.getValues(),
      date: today,
      startDate: new Date(new Date().setDate(today.getDate() + 14)),
      offerExpiryDate: new Date(new Date().setDate(today.getDate() + 7)),
    });
  }, [form]);

  const watchedForm = useWatch({ control: form.control });

  const handleDownload = form.handleSubmit(async (data) => {
    try {
      const { doc, margin, contentWidth, pageHeight } = await createPdfInstance();
      let y = margin;

      y = addPdfHeading(doc, data.companyName, margin, y, 20);

      doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor('#6b7280');
      doc.text(data.companyAddress, margin, y);
      y += 25;

      doc.setTextColor('#111827');
      doc.text(data.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), margin, y);
      y += 25;

      doc.setFont('helvetica', 'bold');
      doc.text(data.candidateName, margin, y);
      y += 15;
      doc.setFont('helvetica', 'normal').setTextColor('#6b7280');
      doc.text(data.candidateAddress, margin, y);
      y += 25;

      doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor('#111827');
      doc.text(`Dear ${data.candidateName},`, margin, y);
      y += 20;

      const p1 = `We are pleased to offer you the position of ${data.jobTitle} at ${data.companyName}. We were very impressed with your skills and experience, and we believe you will make a valuable contribution to our team.`;
      doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor('#374151');
      let lines = doc.splitTextToSize(p1, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 14 + 15;

      y = addPdfShortField(doc, 'Start Date:', data.startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), margin, contentWidth, y);
      y = addPdfShortField(doc, 'Compensation:', data.salary, margin, contentWidth, y);

      if (data.vestingDetails) {
        y = addPdfShortField(doc, 'Equity/Token Details:', data.vestingDetails, margin, contentWidth, y);
      }

      if (data.reportingTo) {
        y = addPdfShortField(doc, 'Reporting To:', data.reportingTo, margin, contentWidth, y);
      }
      y += 10;

      const p2 = `This offer is contingent upon the successful completion of standard background checks. To accept this offer, please sign and return this letter by ${data.offerExpiryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`;
      lines = doc.splitTextToSize(p2, contentWidth);
      doc.text(lines, margin, y);
      y += lines.length * 14 + 20;

      doc.text('Sincerely,', margin, y);
      y += 35;
      doc.setFont('helvetica', 'bold');
      doc.text(data.senderName, margin, y);
      y += 15;
      doc.setFont('helvetica', 'normal').setTextColor('#6b7280');
      doc.text(data.senderTitle, margin, y);
      y += 40;

      if (y > pageHeight - 100) {
        doc.addPage();
        y = margin;
      }
      doc.setDrawColor(209, 213, 219);
      doc.line(margin, y, margin + 200, y);
      doc.line(margin + 250, y, contentWidth + margin, y);
      y += 15;
      doc.setFontSize(9).setTextColor('#6b7280');
      doc.text('Signature', margin, y);
      doc.text('Date', margin + 250, y);

      doc.save(`Offer-Letter-${data.candidateName.replace(/ /g, '-')}.pdf`);
      toast({ title: 'Success!', description: 'Offer letter downloaded as PDF.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to generate PDF.' });
    }
  });

  return (
    <div className="container mx-auto py-12">
      <Card className="site-container">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Web3 Offer Letter Customizer</CardTitle>
          <CardDescription>
            Create professional, customizable offer letters tailored for Web3 roles, including token
            vesting and crypto compensation terms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Company Name" {...form.register('companyName')} />
                <Input placeholder="Company Address" {...form.register('companyAddress')} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Candidate Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Candidate Name" {...form.register('candidateName')} />
                <Input placeholder="Candidate Address" {...form.register('candidateAddress')} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Offer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Job Title" {...form.register('jobTitle')} />
                <Input
                  placeholder="Compensation (e.g., $120,000 USD + 0.1% tokens)"
                  {...form.register('salary')}
                />
                <Textarea
                  placeholder="Token/Equity Vesting Schedule (e.g., 4-year vesting with a 1-year cliff)"
                  {...form.register('vestingDetails')}
                />
                <Input
                  placeholder="Reporting To (e.g., VP of Engineering)"
                  {...form.register('reportingTo')}
                />
                <div className="space-y-1">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start font-normal">
                        {watchedForm.startDate ? (
                          watchedForm.startDate.toLocaleDateString('en-US', {
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
                        selected={watchedForm.startDate}
                        onSelect={(d) => d && form.setValue('startDate', d)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1">
                  <Label>Offer Expiry Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start font-normal">
                        {watchedForm.offerExpiryDate ? (
                          watchedForm.offerExpiryDate.toLocaleDateString('en-US', {
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
                        selected={watchedForm.offerExpiryDate}
                        onSelect={(d) => d && form.setValue('offerExpiryDate', d)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sender Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input placeholder="Your Name" {...form.register('senderName')} />
                <Input placeholder="Your Title" {...form.register('senderTitle')} />
              </CardContent>
            </Card>
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
        title="Ready to Hire?"
        description="Now that your offer letter is ready, post your job to reach over 100,000 Web3 professionals."
        buttonText="Post a Job"
      />
    </div>
  );
}
