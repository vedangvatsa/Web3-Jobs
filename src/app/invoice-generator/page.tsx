
'use client';

import * as React from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import {
  Download,
  Trash2,
  Plus,
  ImageIcon,
  FileText,
  User,
  Building,
  CalendarIcon,
  Wallet,
  Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  quantity: z.number().min(0, 'Quantity must be positive.'),
  rate: z.number().min(0, 'Rate must be positive.'),
});

const invoiceSchema = z.object({
  logo: z.string().optional(),
  
  fromName: z.string().min(1, 'This field is required.'),
  fromEmail: z.string().email().optional().or(z.literal('')),
  fromPhone: z.string().optional(),
  fromAddress: z.string().min(1, 'This field is required.'),

  toName: z.string().min(1, 'This field is required.'),
  toEmail: z.string().email().optional().or(z.literal('')),
  toPhone: z.string().optional(),
  toAddress: z.string().min(1, 'This field is required.'),

  invoiceNumber: z.string().min(1, 'Invoice number is required.'),
  issueDate: z.date(),
  dueDate: z.date(),
  
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required.'),
  
  tax: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  
  currency: z.string(),
  paymentMethod: z.string().optional(),
  walletAddress: z.string().optional(),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const currencyOptions = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'BTC', label: 'BTC (₿)' },
  { value: 'ETH', label: 'ETH (Ξ)' },
  { value: 'USDC', label: 'USDC ($)' },
  { value: 'USDT', label: 'USDT (₮)' },
];

const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    BTC: '₿',
    ETH: 'Ξ',
    USDC: '$',
    USDT: '₮'
};

const InvoicePreview = ({ data }: { data: InvoiceFormData }) => {
    const currencySymbol = currencySymbols[data.currency] || '$';
    const subtotal = data.lineItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.rate || 0), 0);
    const taxAmount = subtotal * ((data.tax || 0) / 100);
    const discountAmount = data.discount || 0;
    const total = subtotal + taxAmount - discountAmount;

    return (
        <Card className="p-8 shadow-lg h-full">
            <div className="flex justify-between items-start mb-8">
                <div>
                    {data.logo ? (
                         <img src={data.logo} alt="logo" className="h-16 w-auto object-contain" />
                    ) : (
                        <h2 className="text-2xl font-bold text-primary">Your Company</h2>
                    )}
                </div>
                <div className="text-right">
                    <h1 className="text-3xl font-bold uppercase text-gray-800 tracking-wider">INVOICE</h1>
                    <p className="text-muted-foreground mt-1">#{data.invoiceNumber || 'INV-001'}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                    <h3 className="font-semibold text-gray-500 mb-2">From:</h3>
                    <p className="font-bold">{data.fromName || 'Your Name'}</p>
                    <p>{data.fromAddress || 'Your Address'}</p>
                    <p>{data.fromEmail || 'your@email.com'}</p>
                    <p>{data.fromPhone}</p>
                </div>
                <div className="text-right">
                     <h3 className="font-semibold text-gray-500 mb-2">Bill To:</h3>
                    <p className="font-bold">{data.toName || 'Client Name'}</p>
                    <p>{data.toAddress || 'Client Address'}</p>
                    <p>{data.toEmail || 'client@email.com'}</p>
                    <p>{data.toPhone}</p>
                </div>
            </div>
            
             <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="text-left">
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p className="font-medium">{format(data.issueDate, 'PPP')}</p>
                </div>
                 <div className="text-right">
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-medium">{format(data.dueDate, 'PPP')}</p>
                </div>
             </div>


            <table className="w-full mb-8">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left font-semibold text-gray-600">Description</th>
                        <th className="p-2 text-center font-semibold text-gray-600">Qty</th>
                        <th className="p-2 text-right font-semibold text-gray-600">Rate</th>
                        <th className="p-2 text-right font-semibold text-gray-600">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {data.lineItems.map((item, i) => (
                        <tr key={i} className="border-b">
                            <td className="p-2">{item.description || 'Service description'}</td>
                            <td className="p-2 text-center">{item.quantity}</td>
                            <td className="p-2 text-right">{currencySymbol}{(item.rate || 0).toFixed(2)}</td>
                            <td className="p-2 text-right">{currencySymbol}{(item.quantity * item.rate).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex justify-end mb-8">
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal:</span>
                        <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                    </div>
                     {data.tax > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Tax ({data.tax}%):</span>
                            <span>{currencySymbol}{taxAmount.toFixed(2)}</span>
                        </div>
                    )}
                    {data.discount > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-500">Discount:</span>
                            <span>-{currencySymbol}{discountAmount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total:</span>
                        <span className="text-primary">{currencySymbol}{total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            {(data.paymentMethod || data.notes) && (
                <div className="mt-8 border-t pt-4">
                    {data.paymentMethod && (
                        <div>
                            <h3 className="font-semibold mb-1">Payment Method:</h3>
                            <p className="text-sm">{data.paymentMethod}</p>
                            {data.walletAddress && <p className="text-sm text-muted-foreground break-all">{data.walletAddress}</p>}
                        </div>
                    )}
                     {data.notes && (
                        <div className="mt-4">
                            <h3 className="font-semibold mb-1">Notes:</h3>
                            <p className="text-sm text-muted-foreground">{data.notes}</p>
                        </div>
                    )}
                </div>
            )}
            
            <div className="text-center text-xs text-gray-400 mt-12">
                Generated with Hashtag Web3's Free Invoice Generator
            </div>
        </Card>
    );
}


export default function InvoiceGeneratorPage() {
  const { toast } = useToast();
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      fromName: 'Your Company',
      fromEmail: 'your@email.com',
      fromAddress: '123 Main St, Anytown, USA',
      fromPhone: '+1 (555) 123-4567',
      toName: 'Client Name',
      toEmail: 'client@email.com',
      toAddress: '456 Client Ave, Othertown, USA',
      toPhone: '+1 (555) 987-6543',
      invoiceNumber: 'INV-001',
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      lineItems: [{ description: 'Service description', quantity: 1, rate: 0 }],
      tax: 0,
      discount: 0,
      currency: 'USD',
      paymentMethod: 'Cryptocurrency',
      walletAddress: '0x1234...abcd',
      notes: 'Thank you for your business!'
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });

  const watchedForm = useWatch({ control: form.control });

  const currencySymbol = currencySymbols[watchedForm.currency] || '$';

  const subtotal = React.useMemo(() =>
    watchedForm.lineItems.reduce(
        (acc, item) => acc + (item.quantity || 0) * (item.rate || 0),
        0
    ), [watchedForm.lineItems]);

  const total = React.useMemo(() => {
    const taxAmount = subtotal * ((watchedForm.tax || 0) / 100);
    const discountAmount = watchedForm.discount || 0;
    return subtotal + taxAmount - discountAmount;
  }, [subtotal, watchedForm.tax, watchedForm.discount]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('logo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

 const handleDownload = form.handleSubmit((data) => {
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      const margin = 40;
      const docWidth = doc.internal.pageSize.getWidth();
      
      let y = margin;

      const addText = (text: string, x: number, yPos: number, options: any = {}) => {
        doc.text(text, x, y, options);
      };
      
      const drawLine = (yPos: number) => {
          doc.setDrawColor(229, 231, 235);
          doc.line(margin, yPos, docWidth - margin, yPos);
      }
      
      // Header
      if (data.logo) {
         const img = new Image();
         img.src = data.logo;
         const MAX_WIDTH = 120;
         const MAX_HEIGHT = 50;
         let width = img.width;
         let height = img.height;
         if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
            width *= ratio;
            height *= ratio;
         }
         doc.addImage(img, 'PNG', margin, y, width, height);
      } else {
        doc.setFontSize(20).setFont('helvetica', 'bold').setTextColor(37, 99, 235);
        addText(data.fromName, margin, y + 15);
        doc.setTextColor(0,0,0);
      }
      
      doc.setFontSize(26).setFont('helvetica', 'bold');
      addText('INVOICE', docWidth - margin, y + 10, { align: 'right'});
      doc.setFontSize(10).setFont('helvetica', 'normal');
      addText(`#${data.invoiceNumber}`, docWidth - margin, y + 30, { align: 'right'});
      y += 60;
      
      // From & To
      const infoY = y;
      doc.setFontSize(10).setFont('helvetica', 'bold');
      addText('From:', margin, y);
      doc.setFont('helvetica', 'normal');
      addText(data.fromName, margin, y+=15);
      data.fromAddress.split('\n').forEach(line => addText(line, margin, y+=12));
      addText(data.fromEmail, margin, y+=12);
      addText(data.fromPhone || '', margin, y+=12);
      
      y = infoY;
      doc.setFont('helvetica', 'bold');
      addText('Bill To:', docWidth / 2, y);
      doc.setFont('helvetica', 'normal');
      addText(data.toName, docWidth / 2, y+=15);
      data.toAddress.split('\n').forEach(line => addText(line, docWidth / 2, y+=12));
      addText(data.toEmail, docWidth / 2, y+=12);
      addText(data.toPhone || '', docWidth / 2, y+=12);

      y = Math.max(y, infoY + 80);

      // Dates
      const dateY = y;
      doc.setFont('helvetica', 'bold');
      addText('Issue Date:', margin, y);
      doc.setFont('helvetica', 'normal');
      addText(format(data.issueDate, 'PPP'), margin, y += 15);

      y = dateY;
      doc.setFont('helvetica', 'bold');
      addText('Due Date:', docWidth - margin, y, { align: 'right'});
      doc.setFont('helvetica', 'normal');
      addText(format(data.dueDate, 'PPP'), docWidth - margin, y+=15, { align: 'right'});
      y += 30;

      // Table Header
      doc.setFillColor(243, 244, 246);
      doc.rect(margin, y, docWidth - (margin*2), 25, 'F');
      y += 18;
      doc.setFontSize(10).setFont('helvetica', 'bold');
      addText('Description', margin + 10, y);
      addText('Qty', docWidth - margin - 150, y, { align: 'center'});
      addText('Rate', docWidth - margin - 90, y, { align: 'right'});
      addText('Total', docWidth - margin - 10, y, { align: 'right'});
      y += 12;

      // Table Body
      doc.setFontSize(10).setFont('helvetica', 'normal');
      data.lineItems.forEach(item => {
          drawLine(y-5);
          const descLines = doc.splitTextToSize(item.description, docWidth / 2.5);
          addText(descLines[0], margin + 10, y);
          addText(item.quantity.toString(), docWidth - margin - 150, y, { align: 'center'});
          addText(`${currencySymbol}${(item.rate || 0).toFixed(2)}`, docWidth - margin - 90, y, { align: 'right'});
          addText(`${currencySymbol}${(item.quantity * item.rate).toFixed(2)}`, docWidth - margin - 10, y, { align: 'right'});
          y += (descLines.length - 1) * 12 + 15;
      });
      drawLine(y-5);
      y+=5;
      
      // Totals
      const addTotalLine = (label: string, value: string) => {
        doc.setFont('helvetica', 'normal');
        addText(label, docWidth - margin - 100, y);
        addText(value, docWidth - margin - 10, y, { align: 'right'});
        y += 15;
      }
      
      const localSubtotal = data.lineItems.reduce((acc, i) => acc + i.quantity * i.rate, 0);
      const localTaxAmount = localSubtotal * ((data.tax || 0) / 100);
      const localDiscountAmount = data.discount || 0;
      const localTotal = localSubtotal + localTaxAmount - localDiscountAmount;

      addTotalLine('Subtotal:', `${currencySymbol}${localSubtotal.toFixed(2)}`);
      if(data.tax) addTotalLine(`Tax (${data.tax}%):`, `${currencySymbol}${localTaxAmount.toFixed(2)}`);
      if(data.discount) addTotalLine('Discount:', `-${currencySymbol}${localDiscountAmount.toFixed(2)}`);
      y+=5;
      drawLine(y-5);
      doc.setFont('helvetica', 'bold');
      addText('Total:', docWidth - margin - 100, y);
      addText(`${currencySymbol}${localTotal.toFixed(2)}`, docWidth - margin - 10, y, { align: 'right'});
      y+=30

      // Payment Details
      if (data.paymentMethod) {
          doc.setFont('helvetica', 'bold');
          addText('Payment Method:', margin, y);
          doc.setFont('helvetica', 'normal');
          addText(data.paymentMethod, margin, y+=15);
          if (data.walletAddress) {
            addText(data.walletAddress, margin, y+=12, { maxWidth: docWidth/2 });
          }
      }
      
      // Notes
      if (data.notes) {
          y = Math.max(y, 200) + 40;
          doc.setFont('helvetica', 'bold');
          addText('Notes:', margin, y);
          doc.setFont('helvetica', 'normal');
          const notesLines = doc.splitTextToSize(data.notes, docWidth - margin*2);
          addText(notesLines, margin, y+=15);
      }
      
      doc.save(`invoice-${data.invoiceNumber}.pdf`);
      toast({ title: 'Success', description: 'Invoice downloaded successfully.' });
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
      });
    }
  });


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="bg-primary text-primary-foreground py-8 text-center">
            <h1 className="text-3xl font-bold">Free Invoice Generator</h1>
            <p className="opacity-80 mt-1">No registration required.</p>
            <Button size="lg" className="mt-4 bg-white text-primary hover:bg-white/90" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4"/> Download PDF
            </Button>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-3 space-y-6">
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Building className="text-primary"/> From</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Name" {...form.register('fromName')} />
                        <Input placeholder="Email" {...form.register('fromEmail')} />
                        <Input placeholder="Phone" {...form.register('fromPhone')} />
                        <Textarea placeholder="Address" {...form.register('fromAddress')} className="md:col-span-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User className="text-primary"/> To</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Client Name" {...form.register('toName')} />
                        <Input placeholder="Client Email" {...form.register('toEmail')} />
                        <Input placeholder="Client Phone" {...form.register('toPhone')} />
                        <Textarea placeholder="Client Address" {...form.register('toAddress')} className="md:col-span-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText className="text-primary"/> Invoice Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <Label>Invoice #</Label>
                            <Input {...form.register('invoiceNumber')} />
                        </div>
                        <div className="space-y-1">
                            <Label>Issue Date</Label>
                            <Popover>
                                <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start font-normal">{format(form.watch('issueDate'), 'PPP')}</Button></PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={form.watch('issueDate')} onSelect={(d) => d && form.setValue('issueDate', d)} initialFocus /></PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-1">
                            <Label>Due Date</Label>
                            <Popover>
                                <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start font-normal">{format(form.watch('dueDate'), 'PPP')}</Button></PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={form.watch('dueDate')} onSelect={(d) => d && form.setValue('dueDate', d)} /></PopoverContent>
                            </Popover>
                        </div>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Wallet className="text-primary"/> Items</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            {fields.map((item, index) => (
                              <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-12 sm:col-span-6 space-y-1">
                                    <Label>Description</Label>
                                    <Input {...form.register(`lineItems.${index}.description`)} placeholder="Service..." />
                                </div>
                                <div className="col-span-4 sm:col-span-2 space-y-1">
                                    <Label>Quantity</Label>
                                    <Input type="number" {...form.register(`lineItems.${index}.quantity`, { valueAsNumber: true })} />
                                </div>
                                <div className="col-span-4 sm:col-span-2 space-y-1">
                                    <Label>Rate</Label>
                                    <Input type="number" {...form.register(`lineItems.${index}.rate`, { valueAsNumber: true })} />
                                </div>
                                <div className="col-span-3 sm:col-span-1 text-right">
                                     <p className="font-medium">{currencySymbol}{(watchedForm.lineItems[index].quantity * watchedForm.lineItems[index].rate || 0).toFixed(2)}</p>
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    <Button variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                              </div>
                            ))}
                        </div>
                        <Button type="button" variant="outline" className="bg-green-500 text-white hover:bg-green-600" onClick={() => append({ description: '', quantity: 1, rate: 0 })}>
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                        <div className="flex justify-end pt-4">
                            <div className="w-full max-w-sm space-y-2">
                                <div className="flex justify-between items-center"><Label>Subtotal</Label><span>{currencySymbol}{subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between items-center"><Label>Tax (%)</Label><Input type="number" {...form.register('tax', { valueAsNumber: true })} className="w-24 h-8"/></div>
                                <div className="flex justify-between items-center"><Label>Discount ({currencySymbol})</Label><Input type="number" {...form.register('discount', { valueAsNumber: true })} className="w-24 h-8"/></div>
                                <div className="flex justify-between items-center font-bold text-lg border-t pt-2 mt-2"><Label>Total</Label><span>{currencySymbol}{total.toFixed(2)}</span></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Hash className="text-primary"/> Payment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label>Currency</Label>
                                <Select value={form.watch('currency')} onValueChange={(value) => form.setValue('currency', value)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{currencyOptions.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-1">
                                <Label>Payment Method</Label>
                                <Input placeholder="e.g. Cryptocurrency" {...form.register('paymentMethod')} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Wallet Address (if applicable)</Label>
                            <Input placeholder="e.g. 0x1234..." {...form.register('walletAddress')} />
                        </div>
                         <div className="space-y-1">
                            <Label>Notes</Label>
                            <Textarea placeholder="Any additional information..." {...form.register('notes')} />
                        </div>
                    </CardContent>
                </Card>
                 <div className="flex items-center justify-center p-4">
                    <label
                        htmlFor="logo-upload"
                        className="cursor-pointer flex flex-col items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                    >
                        <ImageIcon className="h-6 w-6" />
                        <span>{form.watch('logo') ? 'Change Logo' : 'Add Your Logo'}</span>
                    </label>
                    <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </div>
            </div>

            {/* Preview Column */}
            <div className="lg:col-span-2">
              <div className="sticky top-8">
                  <InvoicePreview data={watchedForm} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
