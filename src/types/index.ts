export interface Job {
  id: string;
  title: string;
  company: string;
  link: string;
  date: string; // ISO string for serialization
  source: string;
}
