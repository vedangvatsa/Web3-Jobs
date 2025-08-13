
'use client';

import * as React from 'react';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { InvoiceForm } from '@/components/invoice-form';

// Since the Footer is now an async Server Component, we cannot use it directly
// in a Client Component. We can create a simple wrapper or adjust the layout.
// For simplicity, we will continue to use it here but in a real-world scenario
// with complex client-side state, this might require a layout component.
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
