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
export declare class HashtagWeb3Client {
    private baseUrl;
    constructor(options?: {
        baseUrl?: string;
    });
    getJobs(options?: SearchJobsOptions): Promise<Job[]>;
    getNews(limit?: number): Promise<NewsItem[]>;
    getEvents(limit?: number): Promise<EventItem[]>;
    getGlossaryTerm(term: string): Promise<GlossaryTerm | null>;
}
