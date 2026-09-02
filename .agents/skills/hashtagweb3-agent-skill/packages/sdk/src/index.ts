export interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  url: string;
  tags?: string[];
  postedAt?: string;
}

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source?: string;
}

export interface EventItem {
  name: string;
  location?: string;
  city?: string;
  startDate: string;
  url?: string;
  type?: string;
}

export interface GlossaryTerm {
  term: string;
  slug: string;
  description: string;
  category?: string;
}

export interface SearchJobsOptions {
  search?: string;
  tag?: string;
  company?: string;
  limit?: number;
  offset?: number;
}

export class HashtagWeb3Client {
  private baseUrl: string;

  constructor(options: { baseUrl?: string } = {}) {
    this.baseUrl = options.baseUrl || 'https://hashtagweb3.com/api/v1';
  }

  async getJobs(options: SearchJobsOptions = {}): Promise<Job[]> {
    const params = new URLSearchParams();
    if (options.search) params.set('search', options.search);
    if (options.tag) params.set('tag', options.tag);
    if (options.company) params.set('company', options.company);
    if (options.limit) params.set('limit', String(options.limit));
    if (options.offset) params.set('offset', String(options.offset));

    const res = await fetch(`${this.baseUrl}/jobs?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`HashtagWeb3 API error: HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.jobs || data;
  }

  async getNews(limit = 10): Promise<NewsItem[]> {
    const res = await fetch(`${this.baseUrl}/news?limit=${limit}`);
    if (!res.ok) throw new Error(`HashtagWeb3 API error: HTTP ${res.status}`);
    const data = await res.json();
    return data.news || data;
  }

  async getEvents(limit = 10): Promise<EventItem[]> {
    const res = await fetch(`${this.baseUrl}/events?limit=${limit}`);
    if (!res.ok) throw new Error(`HashtagWeb3 API error: HTTP ${res.status}`);
    const data = await res.json();
    return data.events || data;
  }

  async getGlossaryTerm(term: string): Promise<GlossaryTerm | null> {
    const res = await fetch(`${this.baseUrl}/glossary?search=${encodeURIComponent(term)}`);
    if (!res.ok) throw new Error(`HashtagWeb3 API error: HTTP ${res.status}`);
    const data = await res.json();
    const list = data.terms || data;
    return Array.isArray(list) && list.length > 0 ? list[0] : null;
  }
}
