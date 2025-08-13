
'use client'

import { Header } from '@/components/header';
import { SalaryCalculatorForm } from '@/components/salary-calculator-form';
import { Footer } from '@/components/footer';

export default function SalaryCalculatorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <SalaryCalculatorForm />
      </main>
      <Footer />
    </div>
  );
}
