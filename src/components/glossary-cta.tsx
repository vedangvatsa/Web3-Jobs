'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Briefcase, BookOpen } from 'lucide-react';

interface GlossaryCTAProps {
  termName: string;
}

export function GlossaryCTA({ termName }: GlossaryCTAProps) {
  return (
    <div className="mt-12 grid md:grid-cols-2 gap-4">
      <Card className="border-2 border-primary/20 hover:border-primary transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Find {termName} Jobs</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Explore positions at companies working with {termName} technology
              </p>
              <Link 
                href="/jobs" 
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                Browse open roles
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-muted">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Learn More</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Read in-depth articles and guides about Web3 careers and technology
              </p>
              <Link 
                href="/blog" 
                className="inline-flex items-center text-sm font-medium hover:underline"
              >
                Explore the blog
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
