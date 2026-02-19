
'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Globe, Briefcase, ArrowRight, Wallet, CalendarDays, FileCheck2, Rss } from 'lucide-react';
import type { DigitalNomadVisa } from '@/types';
import { visaData } from '@/lib/visas';
import { TransitioningHeadline } from '@/components/transitioning-headline';

function VisaCard({ visa }: { visa: DigitalNomadVisa }) {
    return (
        <Card className="flex flex-col h-full transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 bg-card">
            <CardHeader className="flex flex-row items-start justify-between pb-4">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">{getFlagEmoji(visa.country)}</span>
                    <div>
                        <CardTitle className="text-xl font-bold">{visa.country}</CardTitle>
                        <Badge variant="outline" className="mt-1">{visa.continent}</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
                <div>
                    <p className="text-muted-foreground mb-4 text-sm">{visa.description}</p>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Wallet className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div>
                                <h4 className="font-semibold text-sm text-primary">Minimum Income</h4>
                                <p className="text-sm">Approx. <strong>${visa.minIncome.toLocaleString()} USD</strong> / month</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                            <CalendarDays className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div>
                                <h4 className="font-semibold text-sm text-primary">Visa Length</h4>
                                <p className="text-sm">{visa.visaLength}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <FileCheck2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                            <div>
                                <h4 className="font-semibold text-sm text-primary">Key Requirements</h4>
                                <ul className="list-disc pl-4 mt-1 space-y-1 text-xs">
                                    {visa.requirements.map((req, i) => <li key={i}>{req}</li>)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function getFlagEmoji(countryName: string): string {
    const countryCode = Object.keys(countryMap).find(code => countryMap[code] === countryName);
    if (!countryCode) return '🌐';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}

const countryMap: Record<string, string> = {
    "AL": "Albania", "AG": "Antigua and Barbuda", "AR": "Argentina", "AM": "Armenia", 
    "AW": "Aruba", "BS": "Bahamas", "BB": "Barbados", "BZ": "Belize", "BM": "Bermuda", 
    "BR": "Brazil", "BG": "Bulgaria", "KH": "Cambodia", "CV": "Cabo Verde", "KY": "Cayman Islands", 
    "CO": "Colombia", "CR": "Costa Rica", "HR": "Croatia", "CW": "Curacao", "CY": "Cyprus", 
    "CZ": "Czech Republic", "DM": "Dominica", "EC": "Ecuador", "SV": "El Salvador", "EE": "Estonia", 
    "FR": "France", "GE": "Georgia", "DE": "Germany", "GR": "Greece", "GD": "Grenada", "HU": "Hungary", 
    "IS": "Iceland", "ID": "Indonesia", "IE": "Ireland", "IT": "Italy", "JP": "Japan", 
    "LV": "Latvia", "MY": "Malaysia", "MT": "Malta", "MU": "Mauritius", "MX": "Mexico", 
    "ME": "Montenegro", "MS": "Montserrat", "MA": "Morocco", "NA": "Namibia", "NL": "Netherlands", 
    "MK": "North Macedonia", "NO": "Norway", "PA": "Panama", "PY": "Paraguay", "PE": "Peru", 
    "PH": "Philippines", "PL": "Poland", "PT": "Portugal", "PR": "Puerto Rico", "RO": "Romania",
    "LC": "Saint Lucia", "RS": "Serbia", "SC": "Seychelles", "ZA": "South Africa", "KR": "South Korea", 
    "ES": "Spain", "LK": "Sri Lanka", "TW": "Taiwan", "TH": "Thailand", "TR": "Turkey", 
    "AE": "UAE (Dubai)", "UY": "Uruguay", "VN": "Vietnam"
};

function DigitalNomadVisasContent() {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedContinent, setSelectedContinent] = React.useState('All');
    
    const continents = ['All', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'];

    const filteredVisas = React.useMemo(() => {
        return visaData.filter(visa => {
            const matchesContinent = selectedContinent === 'All' || visa.continent === selectedContinent;
            const matchesSearch = searchTerm === '' || 
                visa.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                visa.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                visa.requirements.join(' ').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesContinent && matchesSearch;
        }).sort((a, b) => a.country.localeCompare(b.country));
    }, [searchTerm, selectedContinent]);

    const headlines = [
        "Work From Anywhere Visa List",
        "Your Guide to Global Web3",
        "Digital Nomad Visa Database",
        "Live and Work Globally"
    ];

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
                <div className="container mx-auto px-4 py-8 md:py-16">
                    <section className="text-center mb-12 max-w-4xl mx-auto">
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                            <Globe className="h-10 w-10 text-primary" />
                        </div>
                        <TransitioningHeadline phrases={headlines} />
                    </section>

                    <div className="max-w-7xl mx-auto">
                            <Card className="p-4 mb-8 sticky top-20 z-10 shadow-lg backdrop-blur-sm bg-background/80">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-grow">
                                    <Input
                                        placeholder="Search by country, requirements, etc..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full text-base pl-10 h-11"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                        {continents.map(continent => (
                                        <Button 
                                            key={continent} 
                                            variant={selectedContinent === continent ? 'default' : 'outline'}
                                            onClick={() => setSelectedContinent(continent)}
                                            className="rounded-full"
                                        >
                                            {continent}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </Card>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredVisas.map(visa => <VisaCard key={visa.country} visa={visa} />)}
                        </div>

                        {filteredVisas.length > 0 && (
                            <Card className="mt-12 col-span-full bg-primary/5 border-primary/20">
                                <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-full hidden md:block">
                                        <Rss className="h-8 w-8 text-primary"/>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-primary mb-1">Looking for a Web3 Job?</h3>
                                        <p className="text-muted-foreground">Join our Telegram channel with over 60,000 subscribers to get the latest job postings.</p>
                                    </div>
                                    <a href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 mt-4 md:mt-0">
                                        <Button size="lg">
                                            Join Job Feed <ArrowRight className="ml-2 h-4 w-4"/>
                                        </Button>
                                    </a>
                                </CardContent>
                            </Card>
                        )}
                        
                        {filteredVisas.length === 0 && (
                            <div className="text-center py-16 text-muted-foreground bg-card rounded-lg mt-8">
                                <p className="font-medium text-lg">No countries found for your search.</p>
                                <p className="text-sm mt-2">Try adjusting your search filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function DigitalNomadVisasPage() {
    return (
        <Suspense fallback={<div className="flex flex-col min-h-screen"><Header /><main className="flex-1"><div className="container mx-auto px-4 py-16 text-center">Loading...</div></main></div>}>
            <DigitalNomadVisasContent />
        </Suspense>
    );
}
