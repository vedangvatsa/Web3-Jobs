

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
}
