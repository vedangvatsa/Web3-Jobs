import fs from 'fs';
import path from 'path';

export interface Web3Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  city?: string;
  country?: string;
  location: string;
  month?: string;
  url: string;
  website?: string | null;
  coverImage: string | null;
  twitter?: string | null;
  source?: string;
}

export async function getEvents(): Promise<Web3Event[]> {
  try {
    const filePath = path.join(process.cwd(), 'content', 'events-cache.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const events: Web3Event[] = JSON.parse(fileContents);
    
    // Sort events by date (upcoming first)
    return events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  } catch (error) {
    console.error('Error reading events cache:', error);
    return [];
  }
}
