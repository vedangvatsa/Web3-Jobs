/**
 * PNG Metadata Injector
 * Embeds SEO metadata directly into PNG file headers (tEXt chunks).
 * 
 * What it adds:
 * - Title, Description, Author, Copyright, URL, Keywords
 * - This metadata is read by Google Image Search indexer
 * - Survives most image hosting re-compression
 * 
 * Usage: npx tsx scripts/social/inject-png-metadata.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const BULK_DIR = path.join(__dirname, 'output/bulk');
const CONTENT_FILE = path.join(__dirname, 'bulk-content.json');

interface PostMeta {
 type: string;
 tag: string;
 headline: string;
 seoTitle: string;
 seoTags: string[];
}

// PNG tEXt chunk creator
// PNG spec: http://www.libpng.org/pub/png/spec/1.2/PNG-Chunks.html
function createTextChunk(keyword: string, text: string): Buffer {
 const keywordBuf = Buffer.from(keyword, 'latin1');
 const textBuf = Buffer.from(text, 'latin1');
 const nullSep = Buffer.from([0]);
 const data = Buffer.concat([keywordBuf, nullSep, textBuf]);

 // Chunk: length(4) + type(4) + data + crc(4)
 const type = Buffer.from('tEXt', 'ascii');
 const length = Buffer.alloc(4);
 length.writeUInt32BE(data.length, 0);

 // CRC32 over type + data
 const crc = crc32(Buffer.concat([type, data]));
 const crcBuf = Buffer.alloc(4);
 crcBuf.writeUInt32BE(crc, 0);

 return Buffer.concat([length, type, data, crcBuf]);
}

// CRC32 implementation for PNG
function crc32(buf: Buffer): number {
 let crc = 0xFFFFFFFF;
 const table = getCrc32Table();
 for (let i = 0; i < buf.length; i++) {
 crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
 }
 return (crc ^ 0xFFFFFFFF) >>> 0;
}

let crc32Table: Uint32Array | null = null;
function getCrc32Table(): Uint32Array {
 if (crc32Table) return crc32Table;
 crc32Table = new Uint32Array(256);
 for (let n = 0; n < 256; n++) {
 let c = n;
 for (let k = 0; k < 8; k++) {
 c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
 }
 crc32Table[n] = c;
 }
 return crc32Table;
}

function injectMetadata(pngPath: string, meta: {
 title: string;
 description: string;
 author: string;
 copyright: string;
 url: string;
 keywords: string;
 software: string;
 comment: string;
}): void {
 const png = fs.readFileSync(pngPath);

 // Verify PNG signature (first 8 bytes)
 const sig = png.subarray(0, 8);
 if (sig.toString('hex') !== '89504e470d0a1a0a') {
 console.log(`  ⚠ Not a valid PNG: ${pngPath}`);
 return;
 }

 // Find IHDR chunk end (it's always the first chunk after signature)
 // signature(8) + length(4) + type(4) + data(13 for IHDR) + crc(4) = 33
 const ihdrEnd = 8 + 4 + 4 + 13 + 4; // = 33

 // Create metadata chunks
 const chunks: Buffer[] = [];
 if (meta.title) chunks.push(createTextChunk('Title', meta.title));
 if (meta.description) chunks.push(createTextChunk('Description', meta.description));
 if (meta.author) chunks.push(createTextChunk('Author', meta.author));
 if (meta.copyright) chunks.push(createTextChunk('Copyright', meta.copyright));
 if (meta.url) chunks.push(createTextChunk('URL', meta.url));
 if (meta.keywords) chunks.push(createTextChunk('Keywords', meta.keywords));
 if (meta.software) chunks.push(createTextChunk('Software', meta.software));
 if (meta.comment) chunks.push(createTextChunk('Comment', meta.comment));

 // Insert metadata chunks right after IHDR
 const before = png.subarray(0, ihdrEnd);
 const after = png.subarray(ihdrEnd);
 const result = Buffer.concat([before,...chunks, after]);

 fs.writeFileSync(pngPath, result);
}

async function main() {
 if (!fs.existsSync(CONTENT_FILE)) {
 console.error('❌ No bulk-content.json found.');
 process.exit(1);
 }
 const posts: PostMeta[] = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));

 const images = fs.readdirSync(BULK_DIR).filter(f => f.endsWith('.png')).sort();
 console.log(`📝 Injecting SEO metadata into ${images.length} PNG files...\n`);

 let count = 0;
 for (let i = 0; i < images.length; i++) {
 const filename = images[i];
 const filepath = path.join(BULK_DIR, filename);
 const post = posts[i] || { headline: 'Web3 Jobs', seoTitle: 'Web3 Jobs', seoTags: ['web3'] };

 injectMetadata(filepath, {
 title: `${post.seoTitle || post.headline} | Web3 Jobs`,
 description: `${post.headline}. Find Web3 jobs, blockchain developer careers, and crypto employment at HashtagWeb3.com`,
 author: 'HashtagWeb3.com - Web3 Job Board',
 copyright: `© 2026 HashtagWeb3.com. All rights reserved. https://hashtagweb3.com`,
 url: 'https://hashtagweb3.com',
 keywords: [...(post.seoTags || []), 'web3 jobs', 'blockchain careers', 'crypto jobs', 'hashtagweb3', 'defi', 'ethereum', 'solidity'].join(', '),
 software: 'HashtagWeb3.com Content Engine',
 comment: `Web3 job insights by HashtagWeb3.com. Browse 668+ open positions: https://hashtagweb3.com`,
 });

 count++;
 if (count % 100 === 0) console.log(`  [${count}/${images.length}] processed`);
 }

 console.log(`\n✅ Done! Injected metadata into ${count} images.`);
 console.log(`\nMetadata fields: Title, Description, Author, Copyright, URL, Keywords, Software, Comment`);
 console.log(`Each image now embeds:
 - Brand name (HashtagWeb3.com)
 - Direct URL (hashtagweb3.com/jobs)
 - Copyright notice
 - Keyword-rich description
 - Author attribution
Google Image Search reads these PNG tEXt chunks for indexing.`);
}

main().catch(err => { console.error(err); process.exit(1); });
