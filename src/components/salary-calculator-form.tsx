
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
import { Calculator, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const salarySchema = z.object({
  role: z.string().min(1, 'Please select a role'),
  experience: z.number().min(0).max(20),
  location: z.enum(['north_america', 'europe', 'asia', 'other'], {
    required_error: 'Please select your location',
  }),
  companyType: z.enum(['pre_seed', 'seed', 'series_a', 'growth', 'public'], {
      required_error: "Please select a company type"
  }),
  companySize: z.enum(['1_10', '11_50', '51_200', '201_plus'], {
      required_error: "Please select a company size"
  }),
});

type SalaryFormData = z.infer<typeof salarySchema>;

const calculateSalary = (data: SalaryFormData): number => {
  const baseSalaries: Record<string, number> = {
    'smart-contract-dev': 105000,
    'frontend-dev': 90000,
    'protocol-engineer': 125000,
    'security-auditor': 135000,
    'product-manager': 100000,
    'ux-ui-designer': 80000,
    'technical-writer': 75000,
    'marketing-manager': 70000,
    'community-manager': 65000,
    'data-analyst': 80000,
    'devrel': 95000,
  };

  const experienceMultiplier = 1 + data.experience * 0.07;

  const locationMultiplier: Record<string, number> = {
    north_america: 1.15,
    europe: 1.0,
    asia: 0.8,
    other: 0.7,
  };

  const companyTypeMultiplier: Record<string, number> = {
      pre_seed: 0.85,
      seed: 0.9,
      series_a: 1.0,
      growth: 1.1,
      public: 1.2,
  }

  const companySizeMultiplier: Record<string, number> = {
      '1_10': 0.9,
      '11_50': 1.0,
      '51_200': 1.05,
      '201_plus': 1.1,
  }

  const base = baseSalaries[data.role] || 75000;
  let estimatedSalary =
    base *
    experienceMultiplier *
    locationMultiplier[data.location] *
    companyTypeMultiplier[data.companyType] *
    companySizeMultiplier[data.companySize];

  return Math.round(estimatedSalary / 1000) * 1000;
};

export function SalaryCalculatorForm() {
  const [estimatedSalary, setEstimatedSalary] = useState<number | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);

  const form = useForm<SalaryFormData>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      experience: 2,
      location: 'north_america',
      companyType: 'series_a',
      companySize: '11_50',
    },
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
        if (form.formState.isValid) {
             const salary = calculateSalary(value as SalaryFormData);
             setEstimatedSalary(salary);
             if (!isCalculated) setIsCalculated(true);
        }
    });
    return () => subscription.unsubscribe();
  }, [form, isCalculated]);


  const onSubmit: SubmitHandler<SalaryFormData> = (data) => {
    const salary = calculateSalary(data);
    setEstimatedSalary(salary);
    setIsCalculated(true);
  };

  return (
        <div className="container mx-auto px-4 py-8 md:py-16">
          <section className="text-center mb-12 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
              Web3 Salary Calculator
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Estimate your potential earnings in the Web3 industry based on
              your role, experience, and other key factors.
            </p>
          </section>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-6 w-6" />
                    <span>Your Details</span>
                  </CardTitle>
                   <CardDescription>
                    Adjust the sliders and fields to see a real-time salary estimate.
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
                                <FormLabel>Primary Role</FormLabel>
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
                                        <SelectItem value="ux-ui-designer">
                                            UX/UI Designer
                                        </SelectItem>
                                        <SelectItem value="technical-writer">
                                            Technical Writer
                                        </SelectItem>
                                        <SelectItem value="marketing-manager">
                                            Marketing Manager
                                        </SelectItem>
                                        <SelectItem value="community-manager">
                                            Community Manager
                                        </SelectItem>
                                        <SelectItem value="data-analyst">
                                            Data Analyst
                                        </SelectItem>
                                        <SelectItem value="devrel">
                                            Developer Relations (DevRel)
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

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                        <FormField
                            control={form.control}
                            name="companyType"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Company Type</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select company type..." />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="pre_seed">Pre-Seed / Seed Startup</SelectItem>
                                    <SelectItem value="series_a">Series A/B Startup</SelectItem>
                                    <SelectItem value="growth">Growth Stage / Protocol</SelectItem>
                                    <SelectItem value="public">Large / Public Company</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                         />
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="companySize"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Company Size</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select company size..." />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        <SelectItem value="1_10">1-10 Employees</SelectItem>
                                        <SelectItem value="11_50">11-50 Employees</SelectItem>
                                        <SelectItem value="51_200">51-200 Employees</SelectItem>
                                        <SelectItem value="201_plus">201+ Employees</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
                <div className="sticky top-24">
                {isCalculated && estimatedSalary !== null ? (
                <Card className="bg-primary/5 border-primary/20 transition-all duration-300 animate-in fade-in">
                    <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                            <Sparkles className="h-8 w-8 text-primary" />
                        </div>
                    <CardTitle className="text-2xl">
                        Your Estimated Salary
                    </CardTitle>
                    <CardDescription>
                        This is an approximate annual salary based on your inputs.
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                    <p className="text-5xl font-bold text-primary tracking-tight">
                        ${estimatedSalary.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground mt-2">per year (USD)</p>
                    <p className="text-xs text-muted-foreground mt-6">
                        Disclaimer: This is an estimate for informational purposes only. Actual salaries may vary based on specific skills, company, and market conditions. Token incentives and equity can significantly impact total compensation.
                    </p>
                    </CardContent>
                </Card>
                ) : (
                    <Card className="bg-secondary/40 border-dashed h-full flex flex-col justify-center items-center text-center p-8">
                        <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg">Your Estimate Will Appear Here</h3>
                        <p className="text-muted-foreground text-sm mt-2">Fill out the form to see your potential Web3 salary.</p>
                    </Card>
                )}
                </div>
            </div>
          </div>
        </div>
    );
}
