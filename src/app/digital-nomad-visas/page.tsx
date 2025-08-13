
'use client';

import * as React from 'react';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Globe, Briefcase, ArrowRight } from 'lucide-react';
import type { DigitalNomadVisa } from '@/types';
import { visaData } from '@/lib/visas';

function VisaCard({ visa }: { visa: DigitalNomadVisa }) {
    return (
        <Card className="flex flex-col h-full transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">{getFlagEmoji(visa.country)}</span>
                    <CardTitle className="text-xl font-bold">{visa.country}</CardTitle>
                </div>
                <Badge variant="outline">{visa.continent}</Badge>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
                <div>
                    <p className="text-muted-foreground mb-4 text-sm">{visa.description}</p>
                    <div className="space-y-3">
                        <div>
                            <h4 className="font-semibold text-sm mb-1 text-primary">Minimum Income</h4>
                            <p className="text-sm">Approx. <strong>${visa.minIncome.toLocaleString()} USD</strong> / month</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-1 text-primary">Visa Length</h4>
                            <p className="text-sm">{visa.visaLength}</p>
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


export default function DigitalNomadVisasPage() {
    const [visas, setVisas] = React.useState<DigitalNomadVisa[]>([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    
    React.useEffect(() => {
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

                    <div className="max-w-7xl mx-auto">
                        <div className="relative mb-8 max-w-lg mx-auto">
                            <Input
                                placeholder="Search by country or continent..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full text-base pl-10 h-11 rounded-full shadow-sm"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {visas.map(visa => <VisaCard key={visa.country} visa={visa} />)}
                            
                            <Card className="flex flex-col items-center justify-center text-center p-6 bg-primary/5 border-primary/20 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300">
                                <div className="p-3 bg-primary/10 rounded-full mb-4">
                                    <Briefcase className="h-8 w-8 text-primary"/>
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-2">Ready to Make the Move?</h3>
                                <p className="text-muted-foreground mb-4 text-sm">Now that you know where you can go, find the perfect remote Web3 job to take with you.</p>
                                <a href="/">
                                    <Button>
                                        Find a Remote Web3 Job <ArrowRight className="ml-2 h-4 w-4"/>
                                    </Button>
                                </a>
                            </Card>
                        </div>
                        
                        {visas.length === 0 && (
                            <div className="text-center py-16 text-muted-foreground bg-secondary/30 rounded-lg mt-8">
                                <p className="font-medium text-lg">No countries found for your search.</p>
                                <p className="text-sm mt-2">Try searching for "Europe" or "Spain".</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
