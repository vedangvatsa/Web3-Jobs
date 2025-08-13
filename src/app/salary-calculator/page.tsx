
'use client';

import * as React from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { Calculator, DollarSign, Sparkles } from 'lucide-react';
import { useState } from 'react';

const salarySchema = z.object({
  role: z.string().min(1, 'Please select a role'),
  experience: z.number().min(0).max(20),
  expertise: z.enum(['beginner', 'intermediate', 'advanced'], {
    required_error: 'Please select your expertise level',
  }),
  location: z.enum(['north_america', 'europe', 'asia', 'other'], {
    required_error: 'Please select your location',
  }),
});

type SalaryFormData = z.infer<typeof salarySchema>;

// Simplified salary calculation logic
const calculateSalary = (data: SalaryFormData): number => {
  const baseSalaries: Record<string, number> = {
    'smart-contract-dev': 110000,
    'frontend-dev': 95000,
    'protocol-engineer': 130000,
    'security-auditor': 140000,
    'product-manager': 105000,
    'community-manager': 70000,
    'data-analyst': 85000,
  };

  const experienceMultiplier: Record<number, number> = {};
  for (let i = 0; i <= 20; i++) {
    experienceMultiplier[i] = 1 + i * 0.08;
  }

  const expertiseMultiplier: Record<string, number> = {
    beginner: 0.9,
    intermediate: 1.1,
    advanced: 1.3,
  };

  const locationMultiplier: Record<string, number> = {
    north_america: 1.2,
    europe: 1.0,
    asia: 0.85,
    other: 0.75,
  };

  const base = baseSalaries[data.role] || 80000;
  let estimatedSalary =
    base *
    experienceMultiplier[data.experience] *
    expertiseMultiplier[data.expertise] *
    locationMultiplier[data.location];

  return Math.round(estimatedSalary / 1000) * 1000; // Round to nearest thousand
};

export default function SalaryCalculatorPage() {
  const [estimatedSalary, setEstimatedSalary] = useState<number | null>(null);

  const form = useForm<SalaryFormData>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      experience: 2,
      expertise: 'intermediate',
      location: 'north_america',
    },
  });

  const onSubmit: SubmitHandler<SalaryFormData> = (data) => {
    const salary = calculateSalary(data);
    setEstimatedSalary(salary);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <section className="text-center mb-12 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
              Web3 Salary Calculator
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Estimate your potential earnings in the Web3 industry based on
              your role, experience, and location.
            </p>
          </section>

          <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-1 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-6 w-6" />
                  <span>Enter Your Details</span>
                </CardTitle>
                <CardDescription>
                  Fill out the form below to get your personalized salary
                  estimate.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Role</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="smart-contract-dev">
                                Smart Contract Developer
                              </SelectItem>
                              <SelectItem value="frontend-dev">
                                Frontend / Full-Stack Developer
                              </SelectItem>
                              <SelectItem value="protocol-engineer">
                                Protocol Engineer
                              </SelectItem>
                              <SelectItem value="security-auditor">
                                Security Auditor
                              </SelectItem>
                              <SelectItem value="product-manager">
                                Product Manager
                              </SelectItem>
                              <SelectItem value="community-manager">
                                Community Manager
                              </SelectItem>
                              <SelectItem value="data-analyst">
                                Data Analyst
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Years of Experience: {field.value} years
                          </FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={20}
                              step={1}
                              value={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expertise"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expertise Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select expertise level..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">
                                Intermediate
                              </SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your location..." />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="north_america">
                                North America
                              </SelectItem>
                              <SelectItem value="europe">Europe</SelectItem>
                              <SelectItem value="asia">Asia</SelectItem>
                              <SelectItem value="other">
                                Other (LatAm, Africa, etc.)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" size="lg" className="w-full">
                      Calculate Salary
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {estimatedSalary !== null && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="text-center">
                   <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                        <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                  <CardTitle className="text-2xl">
                    Your Estimated Salary
                  </CardTitle>
                  <CardDescription>
                    Based on the provided details, here is your approximate annual salary.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-5xl font-bold text-primary tracking-tight">
                    ${estimatedSalary.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground mt-2">per year (USD)</p>
                  <p className="text-xs text-muted-foreground mt-6">
                    Disclaimer: This is an estimate for informational purposes only. Actual salaries may vary based on specific skills, company, and market conditions.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
