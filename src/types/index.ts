

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
  minIncome: number; // Monthly income in USD
  description: string;
  visaLength: string;
  requirements: string[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: {
    a: string;
    b: string;
  };
  weights: {
    a: { [key: string]: number };
    b: { [key: string]: number };
  };
}

export interface Web3RoleProfile {
    title: string;
    description: string;
    link: string;
}

export interface QuizResult {
    archetype: string;
    description: string;
    traits: string[];
    roles: Web3RoleProfile[];
}

export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone?: string;
  website?: string;
  github?: string;
  twitter?: string;
  ens?: string;
  summary: string;
  contributions: {
    project: string;
    role: string;
    description: string;
    link?: string;
  }[];
  experience: {
    company: string;
    role: string;
    date: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    date: string;
  }[];
  web3Skills: string;
  generalSkills: string;
}

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  creator: string;
  contentSnippet: string;
  source: string;
}
