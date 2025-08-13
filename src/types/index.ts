

export interface Job {
  id: string;
  title: string;
  company: string;
  link: string;
  date: string; // ISO string for serialization
  source: string;
}

export interface Article {
  slug: string;
  title: string;
  image: string;
  description: string;
  content: string;
  category: string;
}

export interface DigitalNomadVisa {
  country: string;
  continent: 'Europe' | 'Asia' | 'North America' | 'South America' | 'Africa' | 'Oceania';
  minIncome: number; // Annual income in USD
  description: string;
  visaLength: string;
  requirements: string[];
}
