export interface Job {
  id: string;
  title: string;
  company: string;
  link: string;
  date: string; // ISO string for serialization
  source: string;
}

export type ArticleContent = {
  type: 'p' | 'h2' | 'h3' | 'ul';
  children: (
    | { type: 'text'; value: string }
    | { type: 'link'; href: string; value: string }
    | { type: 'li'; children: ({ type: 'text'; value: string } | { type: 'link'; href: string; value: string })[] }
  )[];
}[];

export interface Article {
  slug: string;
  title: string;
  image: string;
  description: string;
  content: ArticleContent;
}
