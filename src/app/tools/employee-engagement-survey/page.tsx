
'use client';

import { Header } from '@/components/header';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function EmployeeEngagementSurveyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-16 text-center">
            <CardTitle className="text-4xl font-bold mb-4">Coming Soon!</CardTitle>
            <CardDescription className="text-xl text-muted-foreground mb-8">This tool is currently under construction.</CardDescription>
             <Card className="mt-12 max-w-2xl mx-auto bg-primary/5 border-primary/20">
                <CardContent className="p-8 flex flex-col items-center justify-between gap-6 text-center">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full">
                        <Briefcase className="h-8 w-8 text-primary"/>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-primary mb-1">Looking for Top Web3 Talent?</h3>
                        <p className="text-muted-foreground">While this tool is being built, find your next great hire by posting on the #1 Web3 job board.</p>
                    </div>
                    <Link href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mt-4">
                        <Button size="lg">
                            Post a Job <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
