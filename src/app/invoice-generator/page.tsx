
'use client';

import * as React from 'react';
import { Header } from '@/components/header';
import { InvoiceForm } from '@/components/invoice-form';
import { Footer } from '@/components/footer';

export default function InvoiceGeneratorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        <InvoiceForm />
      </main>
      <Footer />
    </div>
  );
}
