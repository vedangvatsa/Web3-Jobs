"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashtagWeb3Client = void 0;
class HashtagWeb3Client {
    baseUrl;
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || 'https://hashtagweb3.com/api/v1';
    }
    async getJobs(options = {}) {
        const params = new URLSearchParams();
        if (options.search)
            params.set('search', options.search);
        if (options.tag)
            params.set('tag', options.tag);
        if (options.company)
            params.set('company', options.company);
        if (options.limit)
            params.set('limit', String(options.limit));
        if (options.offset)
            params.set('offset', String(options.offset));
        const res = await fetch(`${this.baseUrl}/jobs?${params.toString()}`);
        if (!res.ok) {
            throw new Error(`HashtagWeb3 API error: HTTP ${res.status}`);
        }
        const data = await res.json();
        return data.jobs || data;
    }
    async getNews(limit = 10) {
        const res = await fetch(`${this.baseUrl}/news?limit=${limit}`);
        if (!res.ok)
            throw new Error(`HashtagWeb3 API error: HTTP ${res.status}`);
        const data = await res.json();
        return data.news || data;
    }
    async getEvents(limit = 10) {
        const res = await fetch(`${this.baseUrl}/events?limit=${limit}`);
        if (!res.ok)
            throw new Error(`HashtagWeb3 API error: HTTP ${res.status}`);
        const data = await res.json();
        return data.events || data;
    }
    async getGlossaryTerm(term) {
        const res = await fetch(`${this.baseUrl}/glossary?search=${encodeURIComponent(term)}`);
        if (!res.ok)
            throw new Error(`HashtagWeb3 API error: HTTP ${res.status}`);
        const data = await res.json();
        const list = data.terms || data;
        return Array.isArray(list) && list.length > 0 ? list[0] : null;
    }
}
exports.HashtagWeb3Client = HashtagWeb3Client;
