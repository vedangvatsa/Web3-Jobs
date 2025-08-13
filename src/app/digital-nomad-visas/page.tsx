
'use client';

import * as React from 'react';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LinkIcon, CheckCircle, CircleDollarSign, Search, Globe, LandPlot, MapPin } from 'lucide-react';
import type { DigitalNomadVisa } from '@/types';
import { visaData } from '@/lib/visas';

function VisaCard({ visa }: { visa: DigitalNomadVisa }) {
    return (
        <AccordionItem value={visa.country}>
            <AccordionTrigger className="text-lg font-medium hover:no-underline px-6">
                <div className="flex items-center gap-4">
                    <span className="text-2xl">{getFlagEmoji(visa.country)}</span>
                    <div className="text-left">
                        {visa.country}
                        <Badge variant="outline" className="ml-2 font-normal">{visa.continent}</Badge>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 px-6">
                <p className="text-muted-foreground mb-4">{visa.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-primary"><CheckCircle className="h-5 w-5"/>Key Requirements</h4>
                        <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
                            {visa.requirements.map((req, i) => <li key={i}>{req}</li>)}
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <div>
                             <h4 className="font-semibold mb-2 flex items-center gap-2 text-primary"><CircleDollarSign className="h-5 w-5"/>Minimum Income</h4>
                             <p className="text-sm text-muted-foreground">Approx. <strong>${visa.minIncome.toLocaleString()} USD</strong> per month required.</p>
                        </div>
                    </div>
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}

// Helper to get flag emoji from country name
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
    "AL": "Albania", "AD": "Andorra", "AR": "Argentina", "AM": "Armenia", "AU": "Australia",
    "AG": "Antigua and Barbuda", "AW": "Aruba", "BS": "Bahamas", "BB": "Barbados", "BZ": "Belize",
    "BM": "Bermuda", "BR": "Brazil", "BG": "Bulgaria", "KH": "Cambodia", "CV": "Cabo Verde",
    "KY": "Cayman Islands", "CO": "Colombia", "CR": "Costa Rica", "HR": "Croatia", "CW": "Curacao",
    "CY": "Cyprus", "CZ": "Czech Republic", "DM": "Dominica", "EC": "Ecuador", "EG": "Egypt",
    "SV": "El Salvador", "EE": "Estonia", "FR": "France", "GE": "Georgia", "DE": "Germany",
    "GR": "Greece", "GD": "Grenada", "HU": "Hungary", "IS": "Iceland", "IN": "India",
    "ID": "Indonesia", "IE": "Ireland", "IT": "Italy", "JP": "Japan", "LV": "Latvia", "MY": "Malaysia",
    "MT": "Malta", "MU": "Mauritius", "MX": "Mexico", "ME": "Montenegro", "MS": "Montserrat", "MA": "Morocco",
    "NA": "Namibia", "NL": "Netherlands", "NZ": "New Zealand", "MK": "North Macedonia", "NO": "Norway",
    "PA": "Panama", "PY": "Paraguay", "PE": "Peru", "PH": "Philippines", "PL": "Poland", "PT": "Portugal",
    "PR": "Puerto Rico", "RO": "Romania", "LC": "Saint Lucia", "RS": "Serbia", "SC": "Seychelles",
    "ZA": "South Africa", "KR": "South Korea", "ES": "Spain", "LK": "Sri Lanka", "TW": "Taiwan",
    "TH": "Thailand", "TR": "Turkey", "AE": "UAE (Dubai)", "UY": "Uruguay", "VN": "Vietnam"
};


export default function DigitalNomadVisasPage() {
    const [visas, setVisas] = React.useState<DigitalNomadVisa[]>([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    
    React.useEffect(() => {
        // Since visaData is static, we can just filter it on the client
        const sortedVisas = visaData.sort((a, b) => a.country.localeCompare(b.country));
        const filtered = sortedVisas.filter(visa => 
            visa.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
            visa.continent.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setVisas(filtered);
    }, [searchTerm]);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />
            <main className="flex-1">
                <div className="container mx-auto px-4 py-8 md:py-16">
                    <section className="text-center mb-12 max-w-4xl mx-auto">
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                            <Globe className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
                            Work from Anywhere Visa List
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground">
                            A detailed reference of countries offering digital nomad visas. Your guide to becoming a global Web3 professional.
                        </p>
                    </section>

                    <div className="max-w-4xl mx-auto">
                        <div className="relative mb-8">
                            <Input
                                placeholder="Search by country or continent..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full text-base pl-10 h-11"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                        </div>
                        
                        <Card>
                            <CardContent className="p-0">
                                <Accordion type="single" collapsible className="w-full">
                                    {visas.map(visa => <VisaCard key={visa.country} visa={visa} />)}
                                </Accordion>
                            </CardContent>
                        </Card>
                        
                        {visas.length === 0 && (
                            <div className="text-center py-16 text-muted-foreground bg-secondary/30 rounded-lg mt-8">
                                <p className="font-medium">No countries found for your search.</p>
                                <p className="text-sm">Try searching for "Europe" or "Spain".</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
