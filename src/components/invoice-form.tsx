'use client';

import * as React from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Trash2, Plus, ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

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
 issueDate: z.date().optional(),
 dueDate: z.date().optional(),
 
 lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required.'),
 
 tax: z.number().min(0).optional(),
 discount: z.number().min(0).optional(),
 
 currency: z.string(),
 customCurrency: z.string().optional(),
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
 { value: 'CUSTOM', label: 'Custom' },
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
  const currencySymbol = data.currency === 'CUSTOM' ? data.customCurrency || '' : currencySymbols[data.currency] || '$';
  const subtotal = data.lineItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.rate || 0), 0);
  const taxAmount = subtotal * ((data.tax || 0) / 100);
  const discountAmount = data.discount || 0;
  const total = subtotal + taxAmount - discountAmount;

  return (
    <Card className="p-8 shadow-sm h-full">
      <div className="flex justify-between items-start mb-8">
        <div>
          {data.logo ? (
             <img src={data.logo} alt="Company Logo" className="h-16 w-auto object-contain" />
          ) : (
            <h2 className="text-2xl font-bold text-foreground">{data.fromName ||"Your Company"}</h2>
          )}
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold uppercase text-gray-800 tracking-wider">INVOICE</h2>
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
          <p className="font-medium">{data.issueDate ? data.issueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'}</p>
        </div>
         <div className="text-right">
          <p className="text-sm text-gray-500">Due Date</p>
          <p className="font-medium">{data.dueDate ? data.dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'}</p>
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
              <td className="p-2 text-right">{currencySymbol}{((item.quantity || 0) * (item.rate || 0)).toFixed(2)}</td>
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
           {(data.tax ?? 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Tax ({data.tax}%):</span>
              <span>{currencySymbol}{taxAmount.toFixed(2)}</span>
            </div>
          )}
          {(data.discount ?? 0) > 0 && (
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

export function InvoiceForm() {
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
   lineItems: [{ description: 'Web Development Services', quantity: 10, rate: 100 }],
   tax: 5,
   discount: 50,
   currency: 'USD',
   customCurrency: '',
   paymentMethod: 'Cryptocurrency (USDC)',
   walletAddress: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
   notes: 'Thank you for your business! Please send funds on the Ethereum network.'
  },
 });

 React.useEffect(() => {
  form.reset({
   ...form.getValues(),
   issueDate: new Date(),
   dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
  });
 }, []);

 const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'lineItems',
 });

 const watchedForm = useWatch({ control: form.control });

 const currencySymbol = watchedForm.currency === 'CUSTOM' ? watchedForm.customCurrency || '' : currencySymbols[watchedForm.currency ?? 'USD'] || '$';

 const subtotal = React.useMemo(() =>
  (watchedForm.lineItems ?? []).reduce(
    (acc, item) => acc + (item?.quantity || 0) * (item?.rate || 0),
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

 const handleDownload = form.handleSubmit(async (data) => {
  try {
   const { default: jsPDF } = await import('jspdf');
   const doc = new jsPDF('p', 'pt', 'a4');
   const margin = 40;
   const docWidth = doc.internal.pageSize.getWidth();
   const contentWidth = docWidth - margin * 2;
   let y = margin;

   // Header
   if (data.logo) {
    const img = new Image();
    img.src = data.logo;
    const MAX_WIDTH = 120;
    const MAX_HEIGHT = 50;
    let width = img.width;
    let height = img.height;
    
    if (width > height) {
      if (width > MAX_WIDTH) {
        height = height * (MAX_WIDTH / width);
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width = width * (MAX_HEIGHT / height);
        height = MAX_HEIGHT;
      }
    }
    doc.addImage(img, 'PNG', margin, y, width, height);
   } else {
    doc.setFontSize(20).setFont('helvetica', 'bold').setTextColor(41, 106, 187); // Primary color
    doc.text(data.fromName, margin, y + 15);
   }
   
   doc.setFontSize(26).setFont('helvetica', 'bold').setTextColor(29, 40, 58); // Gray-800
   doc.text('INVOICE', docWidth - margin, y + 10, { align: 'right'});
   doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(100, 116, 139); // Muted-foreground
   doc.text(`#${data.invoiceNumber}`, docWidth - margin, y + 30, { align: 'right'});
   y += 70;

   // From & To
   const infoY = y;
   doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor(100, 116, 139);
   doc.text('From:', margin, y);
   doc.setFont('helvetica', 'normal').setTextColor(0,0,0);
   doc.setFont('helvetica', 'bold');
   doc.text(data.fromName, margin, y+=15);
   doc.setFont('helvetica', 'normal');
   const fromAddressLines = doc.splitTextToSize(data.fromAddress, (docWidth/2) - margin - 20 );
   fromAddressLines.forEach((line: string) => { doc.text(line, margin, y+=12); });
   doc.text(data.fromEmail || '', margin, y+=12);
   doc.text(data.fromPhone || '', margin, y+=12);
   
   let fromYEnd = y;
   y = infoY;
   doc.setFont('helvetica', 'bold').setTextColor(100, 116, 139);
   doc.text('Bill To:', docWidth - margin, y, { align: 'right'});
   doc.setFont('helvetica', 'normal').setTextColor(0,0,0);
   doc.setFont('helvetica', 'bold');
   doc.text(data.toName, docWidth - margin, y+=15, { align: 'right'});
   doc.setFont('helvetica', 'normal');
   const toAddressLines = doc.splitTextToSize(data.toAddress, (docWidth/2) - margin - 20);
   toAddressLines.forEach((line: string) => { doc.text(line, docWidth - margin, y+=12, { align: 'right'}); });
   doc.text(data.toEmail || '', docWidth - margin, y+=12, { align: 'right'});
   doc.text(data.toPhone || '', docWidth - margin, y+=12, { align: 'right'});

   y = Math.max(y, fromYEnd) + 40;
   
   // Dates
   const dateY = y;
   doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(100, 116, 139);
   doc.text('Issue Date', margin, y);
   doc.setFont('helvetica', 'medium').setFontSize(10).setTextColor(0,0,0);
   doc.text(data.issueDate ? data.issueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '', margin, y += 15);

   y = dateY;
   doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(100, 116, 139);
   doc.text('Due Date', docWidth - margin, y, { align: 'right'});
   doc.setFont('helvetica', 'medium').setFontSize(10).setTextColor(0,0,0);
   doc.text(data.dueDate ? data.dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '', docWidth - margin, y+=15, { align: 'right'});
   y += 30;

   // Table Header
   doc.setFillColor(243, 244, 246);
   doc.rect(margin, y, contentWidth, 25, 'F');
   y += 18;
   doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor(51, 65, 85);
   doc.text('Description', margin + 10, y);
   doc.text('Qty', docWidth - margin - 150, y, { align: 'center'});
   doc.text('Rate', docWidth - margin - 90, y, { align: 'right'});
   doc.text('Total', docWidth - margin - 10, y, { align: 'right'});
   y += 7;
   
   // Table Body
   const localCurrencySymbol = data.currency === 'CUSTOM' ? data.customCurrency || '' : currencySymbols[data.currency] || '$';
   doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(0,0,0);
   data.lineItems.forEach(item => {
     y+=5;
     doc.setDrawColor(229, 231, 235);
     doc.line(margin, y, docWidth - margin, y);
     y+=15;
     const descLines = doc.splitTextToSize(item.description, contentWidth / 2);
     doc.text(descLines, margin + 10, y);
     doc.text((item.quantity || 0).toString(), docWidth - margin - 150, y, { align: 'center'});
     doc.text(`${localCurrencySymbol}${(item.rate || 0).toFixed(2)}`, docWidth - margin - 90, y, { align: 'right'});
     doc.text(`${localCurrencySymbol}${((item.quantity || 0) * (item.rate || 0)).toFixed(2)}`, docWidth - margin - 10, y, { align: 'right'});
     y += (descLines.length - 1) * 12 + 10;
   });
    doc.line(margin, y, docWidth - margin, y);
    y += 20;

   // Totals
   const totalsX = docWidth - margin - 200;
   const addTotalLine = (label: string, value: string) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label, totalsX, y, { align: 'left'});
    doc.text(value, docWidth - margin, y, { align: 'right'});
    y += 18;
   }
   
   const localSubtotal = (data.lineItems || []).reduce((acc, i) => acc + (i.quantity || 0) * (i.rate || 0), 0);
   const localTaxAmount = localSubtotal * ((data.tax || 0) / 100);
   const localDiscountAmount = data.discount || 0;
   const localTotal = localSubtotal + localTaxAmount - localDiscountAmount;

   doc.setFontSize(10);
   addTotalLine('Subtotal:', `${localCurrencySymbol}${localSubtotal.toFixed(2)}`);
   if(data.tax) addTotalLine(`Tax (${data.tax}%):`, `${localCurrencySymbol}${localTaxAmount.toFixed(2)}`);
   if(data.discount) addTotalLine('Discount:', `-${localCurrencySymbol}${localDiscountAmount.toFixed(2)}`);
   
   y += 5;
   doc.setDrawColor(29, 40, 58);
   doc.line(totalsX - 10, y, docWidth - margin, y);
   y += 10;
   
   doc.setFontSize(12);
   doc.setFont('helvetica', 'bold');
   doc.text('Total:', totalsX, y, { align: 'left' });
   doc.text(`${localCurrencySymbol}${localTotal.toFixed(2)}`, docWidth - margin, y, { align: 'right' });
   y += 30;

   // Notes & Payment Details
   let bottomY = doc.internal.pageSize.getHeight() - margin - 20;

   if (data.notes) {
     doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(0,0,0);
     doc.text('Notes:', margin, y);
     doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(100, 116, 139);
     const notesLines = doc.splitTextToSize(data.notes, contentWidth);
     doc.text(notesLines, margin, y+=15);
   }
   
   if (data.paymentMethod) {
     doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(0,0,0);
     doc.text('Payment Method:', margin, y+=30);
     doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(0,0,0);
     doc.text(data.paymentMethod, margin, y+=15);
     if (data.walletAddress) {
       doc.setTextColor(100, 116, 139);
       const addressLines = doc.splitTextToSize(data.walletAddress, contentWidth);
       doc.text(addressLines, margin, y+=12);
     }
   }

   doc.setFontSize(8).setTextColor(156, 163, 175);
   doc.text('Generated with Hashtag Web3\'s Free Invoice Generator', docWidth / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center'});

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
  <>
    <section className="text-center mb-12 pt-8">
      <PageHeader title="Invoice Generator" />
      <p className="mt-2 text-muted-foreground">
        Create professional invoices with crypto or fiat payment options and download them as print-ready PDFs.
      </p>
      <Badge variant="secondary" className="mt-4">
        Free PDF Export
      </Badge>
    </section>

    <div className="container mx-auto px-4 pb-8">
     <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Form Column */}
      <div className="lg:col-span-3 space-y-6">
        
        <Card>
          <CardHeader>
            <CardTitle>From</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-start pt-2">
              <label
                htmlFor="logo-upload"
                className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <ImageIcon className="h-5 w-5" />
                <span>{form.watch('logo') ? 'Change Logo' : 'Add Your Logo'}</span>
              </label>
              <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Name" {...form.register('fromName')} />
              <Input placeholder="Email" type="email" {...form.register('fromEmail')} />
              <Input placeholder="Phone" {...form.register('fromPhone')} />
            </div>
            <Textarea placeholder="Address" {...form.register('fromAddress')} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>To</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Input placeholder="Client Name" {...form.register('toName')} />
             <Input placeholder="Client Email" type="email" {...form.register('toEmail')} />
             <Input placeholder="Client Phone" {...form.register('toPhone')} />
           </div>
           <Textarea placeholder="Client Address" {...form.register('toAddress')} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Invoice #</Label>
              <Input {...form.register('invoiceNumber')} />
            </div>
            <div className="space-y-1">
              <Label>Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start font-normal">{watchedForm.issueDate ? watchedForm.issueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : (<span>Pick a date</span>)}</Button></PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={watchedForm.issueDate} onSelect={(d) => d && form.setValue('issueDate', d)} initialFocus /></PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start font-normal">{watchedForm.dueDate ? watchedForm.dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : (<span>Pick a date</span>)}</Button></PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={watchedForm.dueDate} onSelect={(d) => d && form.setValue('dueDate', d)} /></PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
        
         <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {fields.map((item, index) => (
               <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-12 sm:col-span-6 space-y-1">
                  {index === 0 && <Label>Description</Label>}
                  <Input {...form.register(`lineItems.${index}.description`)} placeholder="Service..." />
                </div>
                <div className="col-span-4 sm:col-span-2 space-y-1">
                  {index === 0 && <Label>Quantity</Label>}
                  <Input type="number" {...form.register(`lineItems.${index}.quantity`, { valueAsNumber: true })} />
                </div>
                <div className="col-span-4 sm:col-span-2 space-y-1">
                  {index === 0 && <Label>Rate</Label>}
                  <Input type="number" {...form.register(`lineItems.${index}.rate`, { valueAsNumber: true })} />
                </div>
                <div className="col-span-3 sm:col-span-1 text-right">
                   {index === 0 && <Label className="text-transparent sm:block hidden">Total</Label>}
                   <p className="font-medium h-10 flex items-center justify-end">{currencySymbol}{(((watchedForm.lineItems ?? [])[index]?.quantity || 0) * ((watchedForm.lineItems ?? [])[index]?.rate || 0)).toFixed(2)}</p>
                </div>
                <div className="col-span-1 flex justify-end">
                  {index > 0 && 
                    <Button variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  }
                </div>
               </div>
              ))}
            </div>
            <Button type="button" variant="outline" className="bg-green-500/10 text-green-700 border-green-300 hover:bg-green-500/20" onClick={() => append({ description: '', quantity: 1, rate: 0 })}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
            <div className="flex justify-end pt-4">
              <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between items-center"><Label>Subtotal</Label><span>{currencySymbol}{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between items-center"><Label>Tax (%)</Label><Input type="number" {...form.register('tax', { valueAsNumber: true })} className="w-24 h-8"/></div>
                <div className="flex justify-between items-center"><Label>Discount (flat)</Label><Input type="number" {...form.register('discount', { valueAsNumber: true })} className="w-24 h-8"/></div>
                <div className="flex justify-between items-center font-bold text-lg border-t pt-2 mt-2"><Label>Total</Label><span>{currencySymbol}{total.toFixed(2)}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
         <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
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
               {watchedForm.currency === 'CUSTOM' && (
                <div className="space-y-1">
                  <Label>Custom Currency Symbol</Label>
                  <Input placeholder="e.g. ¥ or SOL" {...form.register('customCurrency')} />
                </div>
               )}
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
      </div>

      {/* Preview Column */}
      <div className="lg:col-span-2">
       <div className="sticky top-[72px] space-y-4">
         <InvoicePreview data={watchedForm as any} />
         <Button size="lg" className="w-full" onClick={handleDownload}>
           <Download className="mr-2 h-4 w-4"/> Download PDF
         </Button>
       </div>
      </div>
     </div>
    </div>
  </>
 );
}
