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

const DEFAULT_ORIGIN = 'https://hashtagweb3.com';

function paginate<T>(items: T[], limit = 50, offset = 0): T[] {
  const take = Math.min(200, Math.max(1, limit));
  const skip = Math.max(0, offset);
  return items.slice(skip, skip + take);
}

export class HashtagWeb3Client {
  private origin: string;

  constructor(options: { baseUrl?: string } = {}) {
    this.origin = (options.baseUrl || DEFAULT_ORIGIN).replace(/\/+$/, '');
  }

  private async fetchCatalog<T>(path: string): Promise<T> {
    const res = await fetch(`${this.origin}${path}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`HashtagWeb3 catalog error: GET ${path} HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  async getJobs(options: SearchJobsOptions = {}): Promise<Job[]> {
    const raw = await this.fetchCatalog<{ jobs?: Job[] } | Job[]>('/data/jobs-runtime.json');
    const all = Array.isArray(raw) ? raw : raw.jobs || [];
    let filtered = all.filter((j) => (j as Job & { active?: boolean }).active !== false);

    const search = options.search?.toLowerCase().trim();
    const tag = options.tag?.toLowerCase().trim();
    const company = options.company?.toLowerCase().trim();

    if (search) {
      filtered = filtered.filter(
        (j) =>
          j.title?.toLowerCase().includes(search) ||
          j.company?.toLowerCase().includes(search) ||
          j.location?.toLowerCase().includes(search),
      );
    }
    if (tag) {
      filtered = filtered.filter((j) =>
        (j.tags || []).some((t) => String(t).toLowerCase().includes(tag)),
      );
    }
    if (company) {
      filtered = filtered.filter((j) => j.company?.toLowerCase().includes(company));
    }

    return paginate(filtered, options.limit, options.offset);
  }

  async getNews(limit = 10): Promise<NewsItem[]> {
    const raw = await this.fetchCatalog<{ items?: NewsItem[] } | NewsItem[]>('/data/news-cache.json');
    const items = Array.isArray(raw) ? raw : raw.items || [];
    return paginate(items, limit);
  }

  async getEvents(limit = 10): Promise<EventItem[]> {
    const raw = await this.fetchCatalog<{ events?: EventItem[] } | EventItem[]>(
      '/data/events-runtime.json',
    );
    const items = Array.isArray(raw) ? raw : raw.events || [];
    return paginate(items, limit);
  }

  async getGlossaryTerm(term: string): Promise<GlossaryTerm | null> {
    const raw = await this.fetchCatalog<{ terms?: GlossaryTerm[] } | GlossaryTerm[]>(
      '/data/glossary-runtime.json',
    );
    const list = Array.isArray(raw) ? raw : raw.terms || [];
    const needle = term.toLowerCase().trim();
    const match = list.find(
      (t) =>
        t.term?.toLowerCase().includes(needle) ||
        t.slug?.toLowerCase().includes(needle) ||
        t.description?.toLowerCase().includes(needle),
    );
    return match ?? null;
  }
}
