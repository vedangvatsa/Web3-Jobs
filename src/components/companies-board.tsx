'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CompanyLogo } from '@/components/company-logo';
import type { Company } from '@/types';
import type { CompanyLogoMap } from '@/lib/job-listing';

interface CompaniesBoardProps {
  initialCompanies: Company[];
  companyLogos?: CompanyLogoMap;
}

export function CompaniesBoard({ initialCompanies, companyLogos = {} }: CompaniesBoardProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return initialCompanies;
    const q = searchQuery.toLowerCase().trim();
    return initialCompanies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description?.toLowerCase() || '').includes(q) ||
        c.slug.toLowerCase().includes(q)
    );
  }, [initialCompanies, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Shared filter bar — same pattern as JobBoard / EventsBoard */}
      <div className="p-4 sm:p-5 rounded-2xl border bg-card/60 backdrop-blur-sm shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search companies"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl text-sm bg-background border-border/80 w-full"
            aria-label="Search companies"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
          <span>
            Showing <strong className="text-foreground font-semibold">{filtered.length}</strong> companies
          </span>
          <span className="hidden sm:inline">Browse all {initialCompanies.length} hiring now</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((company) => {
          const logo = companyLogos[company.slug];
          const logoSrc = logo?.logo ?? null;
          const faviconUrl = logo?.favicon ?? null;
          return (
            <Link key={company.slug} href={`/${company.slug}`}>
              <Card className="group hover:border-primary transition-all h-full bg-muted/20">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 flex items-center justify-center p-1 bg-background rounded-lg border shrink-0 overflow-hidden">
                        <CompanyLogo logoSrc={logoSrc} faviconUrl={faviconUrl} name={company.name} size="h-5 max-w-5" />
                      </div>
                      <h3 className="font-semibold group-hover:text-foreground transition-colors line-clamp-1">
                        {company.name}
                      </h3>
                    </div>
                    <Badge variant="default" className="shrink-0 text-xs">
                      {company.jobCount} jobs
                    </Badge>
                  </div>
                  {company.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {company.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 px-4 border-2 border-dashed border-border/80 rounded-2xl max-w-lg mx-auto">
          <p className="text-sm text-muted-foreground">No companies found for “{searchQuery}”.</p>
        </div>
      )}
    </div>
  );
}
