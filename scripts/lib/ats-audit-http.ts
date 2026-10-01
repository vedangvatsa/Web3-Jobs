import http from 'node:http';
import https from 'node:https';

export function getAuditPage(url: string, redirects = 0): Promise<{ status: number; body: string; url: string }> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const request = client.get(url, { family: 4, headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json,text/html' } }, response => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location && redirects < 4) {
        response.resume();
        getAuditPage(new URL(response.headers.location, url).toString(), redirects + 1).then(resolve, reject);
        return;
      }
      const chunks: Buffer[] = [];
      let size = 0;
      response.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > 12 * 1024 * 1024) request.destroy(new Error('Response too large'));
        else chunks.push(chunk);
      });
      response.on('end', () => resolve({ status: response.statusCode || 0, body: Buffer.concat(chunks).toString('utf8'), url }));
      response.on('error', reject);
    });
    request.setTimeout(20_000, () => request.destroy(new Error('Timed out')));
    request.on('error', reject);
  });
}
