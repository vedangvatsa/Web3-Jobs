
'use client';

import * as React from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  Image as ImageIcon,
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
  from: z.string().min(1, 'This field is required.'),
  billTo: z.string().min(1, 'This field is required.'),
  shipTo: z.string().optional(),
  invoiceNumber: z.string().min(1, 'Invoice number is required.'),
  date: z.date(),
  paymentTerms: z.string().optional(),
  dueDate: z.date().optional(),
  poNumber: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required.'),
  tax: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  shipping: z.number().min(0).optional(),
  amountPaid: z.number().min(0).optional(),
  currency: z.string(),
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


export default function InvoiceGeneratorPage() {
  const { toast } = useToast();
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      from: '',
      billTo: '',
      shipTo: '',
      invoiceNumber: '1',
      date: new Date(),
      paymentTerms: '',
      poNumber: '',
      notes: '',
      terms: '',
      lineItems: [{ description: '', quantity: 1, rate: 0 }],
      tax: 0,
      discount: 0,
      shipping: 0,
      amountPaid: 0,
      currency: 'USD',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });

  const watchedLineItems = useWatch({
    control: form.control,
    name: 'lineItems',
  });
  const watchedTax = useWatch({ control: form.control, name: 'tax' });
  const watchedDiscount = useWatch({
    control: form.control,
    name: 'discount',
  });
  const watchedShipping = useWatch({
    control: form.control,
    name: 'shipping',
  });
  const watchedAmountPaid = useWatch({
    control: form.control,
    name: 'amountPaid',
  });
   const watchedCurrency = useWatch({
    control: form.control,
    name: 'currency',
  });
  const currencySymbol = currencySymbols[watchedCurrency] || '$';


  const subtotal = React.useMemo(
    () =>
      watchedLineItems.reduce(
        (acc, item) => acc + (item.quantity || 0) * (item.rate || 0),
        0
      ),
    [watchedLineItems]
  );

  const total = React.useMemo(() => {
    const taxAmount = subtotal * ((watchedTax || 0) / 100);
    const discountAmount = watchedDiscount || 0;
    const shippingAmount = watchedShipping || 0;
    return subtotal + taxAmount - discountAmount + shippingAmount;
  }, [subtotal, watchedTax, watchedDiscount, watchedShipping]);

  const balanceDue = React.useMemo(
    () => total - (watchedAmountPaid || 0),
    [total, watchedAmountPaid]
  );

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
      const doc = new jsPDF();
      
      const setHeaderStyle = () => doc.setFont('helvetica', 'bold').setFontSize(22);
      const setLabelStyle = () => doc.setFont('helvetica', 'bold').setFontSize(10);
      const setNormalStyle = () => doc.setFont('helvetica', 'normal').setFontSize(10);
      
      if (data.logo) {
        const img = new Image();
        img.src = data.logo;
        img.onload = () => {
            const MAX_WIDTH = 40;
            const MAX_HEIGHT = 40;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            doc.addImage(img, 'PNG', 14, 15, width, height);
            generatePdfContent(doc, data);
        }
      } else {
        generatePdfContent(doc, data);
      }
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'Failed to generate PDF. Please try again.',
      });
    }
  });

  const generatePdfContent = (doc: jsPDF, data: InvoiceFormData) => {
    const setHeaderStyle = () => doc.setFont('helvetica', 'bold').setFontSize(22);
    const setLabelStyle = () => doc.setFont('helvetica', 'bold').setFontSize(10);
    const setNormalStyle = () => doc.setFont('helvetica', 'normal').setFontSize(10);

    setHeaderStyle();
    doc.text('INVOICE', 196, 22, { align: 'right' });
    setNormalStyle();
    doc.text(`# ${data.invoiceNumber}`, 196, 28, { align: 'right' });
    
    setLabelStyle();
    doc.text('FROM:', 14, 70);
    setNormalStyle();
    doc.text(data.from, 14, 76, { maxWidth: 80 });

    setLabelStyle();
    doc.text('BILL TO:', 105, 70);
    setNormalStyle();
    doc.text(data.billTo, 105, 76, { maxWidth: 80 });

    if (data.shipTo) {
      setLabelStyle();
      doc.text('SHIP TO:', 105, 95);
      setNormalStyle();
      doc.text(data.shipTo, 105, 101, { maxWidth: 80 });
    }

    const detailsX = 196;
    let detailsY = 45;
    const addDetail = (label: string, value: string | undefined) => {
      if(value) {
          setLabelStyle();
          doc.text(label, detailsX, detailsY, { align: 'right' });
          detailsY += 6;
          setNormalStyle();
          doc.text(value, detailsX, detailsY, { align: 'right' });
          detailsY += 8;
      }
    }

    addDetail('Date', format(data.date, 'PPP'));
    addDetail('Payment Terms', data.paymentTerms);
    if(data.dueDate) addDetail('Due Date', format(data.dueDate, 'PPP'));
    addDetail('PO Number', data.poNumber);

    const tableStartY = 130;
    doc.setFillColor(34, 43, 54);
    doc.rect(14, tableStartY, 182, 10, 'F');
    setLabelStyle();
    doc.setTextColor(255, 255, 255);
    doc.text('ITEM', 20, tableStartY + 7);
    doc.text('QTY', 125, tableStartY + 7);
    doc.text('RATE', 145, tableStartY + 7);
    doc.text('AMOUNT', 180, tableStartY + 7, { align: 'right' });
    
    setNormalStyle();
    doc.setTextColor(0,0,0);
    let currentY = tableStartY + 16;
    data.lineItems.forEach(item => {
        doc.text(item.description, 20, currentY, { maxWidth: 100 });
        doc.text(item.quantity.toString(), 125, currentY);
        doc.text(item.rate.toFixed(2), 145, currentY);
        doc.text((item.quantity * item.rate).toFixed(2), 180, currentY, { align: 'right' });
        currentY += 8;
    });

    currentY = Math.max(currentY, 180);
    const totalsX = 196;
    const addTotalLine = (label: string, value: string) => {
        setLabelStyle();
        doc.text(label, totalsX - 30, currentY, { align: 'right' });
        setNormalStyle();
        doc.text(value, totalsX, currentY, { align: 'right' });
        currentY += 7;
    }
    
    const localSubtotal = data.lineItems.reduce((acc, i) => acc + i.quantity * i.rate, 0);
    const localTaxAmount = localSubtotal * ((data.tax || 0) / 100);
    const localTotal = localSubtotal + localTaxAmount - (data.discount || 0) + (data.shipping || 0);
    const localBalanceDue = localTotal - (data.amountPaid || 0);
    
    addTotalLine('Subtotal', `${localSubtotal.toFixed(2)}`);
    if (data.tax) addTotalLine(`Tax (${data.tax}%)`, `${localTaxAmount.toFixed(2)}`);
    if (data.discount) addTotalLine('Discount', `-${data.discount.toFixed(2)}`);
    if (data.shipping) addTotalLine('Shipping', `${data.shipping.toFixed(2)}`);
    
    doc.setDrawColor(221, 221, 221);
    doc.line(150, currentY, 196, currentY);
    currentY += 7;

    setLabelStyle();
    addTotalLine('Total', `${data.currency} ${localTotal.toFixed(2)}`);
    
    if(data.amountPaid) {
      addTotalLine('Amount Paid', `-${data.amountPaid.toFixed(2)}`);
      currentY += 3;
      doc.setFillColor(245, 245, 245);
      doc.rect(150, currentY - 7, 46, 10, 'F');
      setLabelStyle();
      doc.text('Balance Due', totalsX - 30, currentY, { align: 'right' });
      doc.text(`${data.currency} ${localBalanceDue.toFixed(2)}`, totalsX, currentY, { align: 'right' });
    }
    
    let bottomY = currentY + 20;
    if (data.notes) {
        setLabelStyle();
        doc.text('Notes', 14, bottomY);
        setNormalStyle();
        doc.text(data.notes, 14, bottomY + 6, { maxWidth: 182 });
        bottomY += 20;
    }
    if (data.terms) {
        setLabelStyle();
        doc.text('Terms', 14, bottomY);
        setNormalStyle();
        doc.text(data.terms, 14, bottomY + 6, { maxWidth: 182 });
    }

    doc.save(`invoice-${data.invoiceNumber}.pdf`);
    toast({ title: 'Success', description: 'Invoice downloaded successfully.' });
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary/40">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-6 md:p-8 shadow-lg">
                <form>
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex flex-col gap-4">
                      <label
                        htmlFor="logo-upload"
                        className="cursor-pointer"
                      >
                        <div className="w-40 h-40 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
                          {form.watch('logo') ? (
                            <img
                              src={form.watch('logo')}
                              alt="logo"
                              className="object-contain w-full h-full p-2"
                            />
                          ) : (
                            <div className="text-center">
                              <ImageIcon className="mx-auto h-8 w-8" />
                              <span className="mt-2 block text-sm">
                                Add Your Logo
                              </span>
                            </div>
                          )}
                        </div>
                      </label>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </div>
                    <div className="text-right">
                      <h1 className="text-4xl font-bold uppercase text-primary tracking-widest">
                        Invoice
                      </h1>
                      <div className="flex items-center gap-2 mt-4">
                        <Label htmlFor="invoiceNumber" className="text-lg">
                          #
                        </Label>
                        <Input
                          id="invoiceNumber"
                          {...form.register('invoiceNumber')}
                          className="w-24 text-right"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <Label htmlFor="from">Who is this from?</Label>
                      <Textarea
                        id="from"
                        {...form.register('from')}
                        placeholder="Your Company Name, Address..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="billTo">Bill To</Label>
                      <Textarea
                        id="billTo"
                        {...form.register('billTo')}
                        placeholder="Client's Company Name, Address..."
                        className="mt-1"
                      />
                      <Label htmlFor="shipTo" className="mt-4 block">
                        Ship To (optional)
                      </Label>
                      <Textarea
                        id="shipTo"
                        {...form.register('shipTo')}
                        placeholder="Shipping Address..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div>
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start font-normal mt-1">
                            {format(form.watch('date'), 'PPP')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={form.watch('date')}
                            onSelect={(date) => date && form.setValue('date', date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                        <Label>Payment Terms</Label>
                        <Input {...form.register('paymentTerms')} className="mt-1" />
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start font-normal mt-1">
                            {form.watch('dueDate') ? format(form.watch('dueDate')!, 'PPP') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={form.watch('dueDate')}
                            onSelect={(date) => date && form.setValue('dueDate', date)}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                        <Label>PO Number</Label>
                        <Input {...form.register('poNumber')} className="mt-1" />
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="bg-gray-800 text-white p-3 rounded-t-lg">
                      <div className="grid grid-cols-12 gap-4 items-center font-bold">
                        <div className="col-span-6">Item</div>
                        <div className="col-span-2 text-center">Quantity</div>
                        <div className="col-span-2 text-right">Rate</div>
                        <div className="col-span-2 text-right">Amount</div>
                      </div>
                    </div>
                    <div className="border border-t-0 rounded-b-lg p-2 space-y-2">
                    {fields.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-6">
                            <Input
                            {...form.register(`lineItems.${index}.description`)}
                            placeholder="Description of item/service..."
                            />
                        </div>
                        <div className="col-span-2">
                             <Input
                            type="number"
                            {...form.register(`lineItems.${index}.quantity`, { valueAsNumber: true })}
                            className="text-center"
                            />
                        </div>
                        <div className="col-span-2">
                             <Input
                            type="number"
                            {...form.register(`lineItems.${index}.rate`, { valueAsNumber: true })}
                            className="text-right"
                            />
                        </div>
                         <div className="col-span-1 text-right">
                             <p className="font-medium">
                                {(watchedLineItems[index].quantity * watchedLineItems[index].rate).toFixed(2)}
                            </p>
                        </div>
                        <div className="col-span-1 flex justify-end">
                            <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => append({ description: '', quantity: 1, rate: 0 })}>
                        <Plus className="mr-2 h-4 w-4" /> Add Line Item
                    </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea id="notes" {...form.register('notes')} placeholder="Any relevant information not already covered" className="mt-1"/>
                      <Label htmlFor="terms" className="mt-4 block">Terms</Label>
                      <Textarea id="terms" {...form.register('terms')} placeholder="Terms and conditions - late fees, payment methods, delivery schedule" className="mt-1"/>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>Subtotal</Label>
                            <p>{currencySymbol}{subtotal.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <Label>Tax (%)</Label>
                            <Input type="number" {...form.register('tax', { valueAsNumber: true })} className="w-24"/>
                        </div>
                        <div className="flex justify-between items-center">
                            <Label>Discount</Label>
                            <Input type="number" {...form.register('discount', { valueAsNumber: true })} className="w-24"/>
                        </div>
                        <div className="flex justify-between items-center">
                            <Label>Shipping</Label>
                            <Input type="number" {...form.register('shipping', { valueAsNumber: true })} className="w-24"/>
                        </div>
                        <hr />
                        <div className="flex justify-between items-center font-bold text-lg">
                            <Label>Total</Label>
                            <p>{currencySymbol}{total.toFixed(2)}</p>
                        </div>
                         <div className="flex justify-between items-center">
                            <Label>Amount Paid</Label>
                            <Input type="number" {...form.register('amountPaid', { valueAsNumber: true })} className="w-24"/>
                        </div>
                         <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                            <Label className="font-bold text-lg">Balance Due</Label>
                            <p className="font-bold text-lg">{currencySymbol}{balanceDue.toFixed(2)}</p>
                        </div>
                    </div>
                  </div>
                </form>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24 shadow-lg">
                <Button onClick={handleDownload} className="w-full mb-4" size="lg">
                  <Download className="mr-2 h-5 w-5" /> Download PDF
                </Button>
                <div>
                  <Label>Currency</Label>
                   <Select
                        value={form.watch('currency')}
                        onValueChange={(value) => form.setValue('currency', value)}
                    >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

    