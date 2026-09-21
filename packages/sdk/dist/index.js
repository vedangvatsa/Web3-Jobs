"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashtagWeb3Client = void 0;
const DEFAULT_ORIGIN = 'https://hashtagweb3.com';
function paginate(items, limit = 50, offset = 0) {
    const take = Math.min(200, Math.max(1, limit));
    const skip = Math.max(0, offset);
    return items.slice(skip, skip + take);
}
class HashtagWeb3Client {
    origin;
    constructor(options = {}) {
        this.origin = (options.baseUrl || DEFAULT_ORIGIN).replace(/\/+$/, '');
    }
    async fetchCatalog(path) {
        const res = await fetch(`${this.origin}${path}`, {
            headers: { Accept: 'application/json' },
        });
        if (!res.ok) {
            throw new Error(`HashtagWeb3 catalog error: GET ${path} HTTP ${res.status}`);
        }
        return res.json();
    }
    async getJobs(options = {}) {
        const raw = await this.fetchCatalog('/data/jobs-runtime.json');
        const all = Array.isArray(raw) ? raw : raw.jobs || [];
        let filtered = all.filter((j) => j.active !== false);
        const search = options.search?.toLowerCase().trim();
        const tag = options.tag?.toLowerCase().trim();
        const company = options.company?.toLowerCase().trim();
        if (search) {
            filtered = filtered.filter((j) => j.title?.toLowerCase().includes(search) ||
                j.company?.toLowerCase().includes(search) ||
                j.location?.toLowerCase().includes(search));
        }
        if (tag) {
            filtered = filtered.filter((j) => (j.tags || []).some((t) => String(t).toLowerCase().includes(tag)));
        }
        if (company) {
            filtered = filtered.filter((j) => j.company?.toLowerCase().includes(company));
        }
        return paginate(filtered, options.limit, options.offset);
    }
    async getNews(limit = 10) {
        const raw = await this.fetchCatalog('/data/news-cache.json');
        const items = Array.isArray(raw) ? raw : raw.items || [];
        return paginate(items, limit);
    }
    async getEvents(limit = 10) {
        const raw = await this.fetchCatalog('/data/events-runtime.json');
        const items = Array.isArray(raw) ? raw : raw.events || [];
        return paginate(items, limit);
    }
    async getGlossaryTerm(term) {
        const raw = await this.fetchCatalog('/data/glossary-runtime.json');
        const list = Array.isArray(raw) ? raw : raw.terms || [];
        const needle = term.toLowerCase().trim();
        const match = list.find((t) => t.term?.toLowerCase().includes(needle) ||
            t.slug?.toLowerCase().includes(needle) ||
            t.description?.toLowerCase().includes(needle));
        return match ?? null;
    }
}
exports.HashtagWeb3Client = HashtagWeb3Client;
