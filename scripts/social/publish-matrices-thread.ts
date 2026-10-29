import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(ROOT, '.env.local') });

const X_CHANNEL = '6ab62682ea19ca0bdee284bd';
const IMAGES_DIR = path.join(ROOT, 'public/images/social');

export interface ThreadPost {
  number: number;
  text: string;
  imageFilename: string;
  alt: string;
}

export const THREAD_POSTS: ThreadPost[] = [
  {
    number: 1,
    text: `10 2x2 matrix charts every digital nomad should bookmark:

A breakdown of 100+ cities, 71 nomad visas, citizenship routes, and Web3 hubs by cost, speed, safety, and taxes.

🧵👇`,
    imageFilename: 'thread-cover-matrices.png',
    alt: '10 Decision Matrices for Digital Nomads - Overview 2x2 alignment chart comparing cities, visas, and tech hubs'
  },
  {
    number: 2,
    text: `1/ Where to work: Cost vs Internet Speed

• Sweet spot: Chiang Mai (336 Mbps, $900/mo), Bangkok (368 Mbps, $1.1k), Bucharest (339 Mbps, $1.3k)
• High speed, high burn: SF (372 Mbps, $3.5k), London ($3.2k)
• Fast fiber, mid-tier: Lisbon (361 Mbps, $2k), Barcelona ($2.2k)`,
    imageFilename: 'where-to-work-cost-vs-speed.png',
    alt: 'Where to Work: Living Cost vs Internet Speed - 2x2 comparison matrix of 18 global remote work hubs'
  },
  {
    number: 3,
    text: `2/ Where to live safely: Rent vs Safety

• Safe + cheap: Taipei (Safety 9.0/10, $700 rent), Prague (8.3/10, $750), Chiang Mai (8.0/10, $350)
• Safe + pricey: Tokyo (9.2/10, $1.2k), Singapore (9.1/10, $1.4k), Dubai (8.5/10, $1.1k)
• US hubs lag on safety vs rent.`,
    imageFilename: 'where-to-live-safely-cost-vs-safety.png',
    alt: 'Where to Live Safely: 1-bed city center rent vs Numbeo safety index comparison chart'
  },
  {
    number: 4,
    text: `3/ Walkable cities: Car-free living vs Cost

• Car-free + affordable: Prague (Walk 8.8, $1.8k/mo), Taipei (8.0, $1.8k), Buenos Aires (7.5, $1.3k)
• Best transit, expensive: Vienna (9.2), Tokyo (9.2), Barcelona (9.0)
• Car/scooter reliant: Bali (4.0), Dubai (4.0)`,
    imageFilename: 'city-walkability-vs-cost.png',
    alt: 'Walkable Cities: WalkScore and transit access vs monthly cost of living'
  },
  {
    number: 5,
    text: `4/ Nomad Value Index: Overall Score vs Cost

Composite score across speed, cost, community, safety & weather:

1. Chiang Mai: 97/100 ($900/mo)
2. Da Nang: 93/100 ($850/mo)
3. Bali: 88/100 ($1.1k/mo)
4. Bangkok: 86/100 ($1.1k/mo)
5. Taipei: 87/100 ($1.8k/mo)`,
    imageFilename: 'the-nomad-value-index.png',
    alt: 'The Nomad Value Index: Composite lifestyle score vs monthly living expenses'
  },
  {
    number: 6,
    text: `5/ Where to live: Quality vs Monthly Burn

• Sub-$1.5k runway: Chiang Mai ($900), Da Nang ($850), Bali ($1.25k), Medellín ($1.15k)
• Balanced mid-tier: Lisbon ($2.5k), Tokyo ($2.2k), Tallinn ($1.95k)
• High burn: London ($4.3k), SF ($5.4k), NYC ($6.1k)`,
    imageFilename: 'where-to-live-digital-nomad.png',
    alt: 'Where to Live as a Digital Nomad: Quality and infrastructure score vs monthly budget'
  },
  {
    number: 7,
    text: `6/ Passports: Mobility vs Cost

• Tier 1, high capital: Singapore (195 visa-free, closed), Spain (€500k), Malta (€750k CBI)
• Caribbean sweet spots: St. Kitts (157 destinations, $250k), Dominica ($200k), Antigua ($230k)
• Fastest entry: Vanuatu (117 destinations, $130k)`,
    imageFilename: 'global-passports-mobility-vs-cost.png',
    alt: 'Global Passports: Visa-free travel destinations vs CBI / Golden Visa acquisition cost'
  },
  {
    number: 8,
    text: `7/ Nomad Visas: Foreign Tax vs Income Bar

• 0% foreign tax + low bar: Thailand DTV (5 yrs), Albania (5 yrs, ~$820/mo), Georgia (1%)
• 0% tax + higher bar: Dubai ($3.5k/mo), Costa Rica ($3k/mo)
• Tax residency traps: Portugal D8 (progressive), Colombia & Brazil (tax after 183d)`,
    imageFilename: 'digital-nomad-visas-tax-vs-income.png',
    alt: 'Digital Nomad Visas: Foreign income tax treatment vs monthly qualifying income requirement'
  },
  {
    number: 9,
    text: `8/ Nomad Visas: Stay Duration vs Income Bar

• Long stay: Thailand DTV (5 yrs, $28k proof), Albania (5 yrs, ~$820/mo), Spain (3-5 yrs, ~$2.8k/mo)
• 1-2 yrs: Colombia (2 yrs, $1.4k/mo), Costa Rica ($3k/mo)
• Short & strict: Japan (6 mos, $5.5k/mo), Iceland (6 mos, $7.5k/mo)`,
    imageFilename: 'digital-nomad-visas-income-vs-duration.png',
    alt: 'Digital Nomad Visas: Maximum visa stay duration vs required monthly income'
  },
  {
    number: 10,
    text: `9/ Citizenship: Capital vs Speed to Passport

• Fast CBI (2-6 mos): Vanuatu ($130k), Dominica ($200k), Antigua ($230k), St. Lucia ($240k)
• EU CBI: Malta (€750k, 12-36 mos)
• Golden Visas / Naturalization (5-10 yrs): Spain (€500k), Portugal (€500k), Greece (€400k)`,
    imageFilename: 'citizenship-by-investment-capital-vs-speed.png',
    alt: 'Global Citizenship: Processing speed to passport vs capital requirement'
  },
  {
    number: 11,
    text: `10/ Where to build Web3: Tax vs Dev Density

• 0% CGT + top hubs: Dubai (VARA), Singapore (MAS), Zurich/Zug (Crypto Valley)
• 0% tax after 1 year: Lisbon, Berlin
• Emerging runways: Bangkok (DTV wave), Bali
• High tax bar: US (~50% combined), UK (20% CGT), Tokyo (up to 55%)`,
    imageFilename: 'where-to-build-web3.png',
    alt: 'Where to Build Web3: Crypto tax treatment vs Web3 developer ecosystem density'
  },
  {
    number: 12,
    text: `All 10 comparison tools and directories are live:

• Cities: hashtagweb3.com/nomads
• Visas: hashtagweb3.com/visas
• Passports: hashtagweb3.com/citizenship
• Remote Web3 Jobs: hashtagweb3.com/jobs`,
    imageFilename: 'thread-outro-resources.png',
    alt: 'Explore All Free Nomad & Web3 Tools Online - Directory outro card'
  }
];

async function uploadToUguu(localPath: string): Promise<string> {
  const bytes = fs.readFileSync(localPath);
  const filename = path.basename(localPath);
  const form = new FormData();
  form.append('files[]', new Blob([bytes], { type: 'image/png' }), filename);

  const res = await fetch('https://uguu.se/upload', {
    method: 'POST',
    body: form
  });

  const data = await res.json() as any;
  if (!data?.success || !data?.files?.[0]?.url) {
    throw new Error(`Uguu upload failed for ${filename}: ${JSON.stringify(data)}`);
  }
  return data.files[0].url;
}

export async function publishMatricesThread(dryRun = false) {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  if (!token) throw new Error('BUFFER_ACCESS_TOKEN is missing in environment/.env.local');

  console.log(`[publish-matrices-thread] Starting thread preparation (${THREAD_POSTS.length} tweets)...`);

  // 1. Validate character counts
  for (const p of THREAD_POSTS) {
    if (p.text.length > 280) {
      throw new Error(`Post #${p.number} exceeds 280 chars: ${p.text.length}`);
    }
  }
  console.log('✓ All 12 tweets validated under 280 characters.');

  // 2. Upload images
  console.log('Uploading 12 images to public CDN for Buffer...');
  const uploadedUrls: string[] = [];
  for (const p of THREAD_POSTS) {
    const filePath = path.join(IMAGES_DIR, p.imageFilename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Image not found: ${filePath}`);
    }
    const publicUrl = await uploadToUguu(filePath);
    uploadedUrls.push(publicUrl);
    console.log(`✓ Post #${p.number} image uploaded: ${publicUrl}`);
  }

  // 3. Build Buffer thread payload
  const threadItems = THREAD_POSTS.map((p, idx) => ({
    text: p.text,
    assets: [
      {
        image: {
          url: uploadedUrls[idx],
          metadata: { altText: p.alt }
        }
      }
    ]
  }));

  const input = {
    channelId: X_CHANNEL,
    text: threadItems[0].text,
    assets: threadItems[0].assets,
    metadata: {
      twitter: {
        thread: threadItems
      }
    },
    schedulingType: 'automatic',
    mode: 'shareNow',
    needsApproval: false
  };

  if (dryRun) {
    console.log('[publish-matrices-thread] DRY RUN complete. Payload prepared successfully.');
    return { success: true, dryRun: true, threadItemsCount: threadItems.length };
  }

  console.log('Sending thread to Buffer API for immediate publishing on X (@hashtag_web3)...');
  const mutation = `mutation ($input: CreatePostInput!) {
    createPost(input: $input) {
      ... on PostActionSuccess {
        post {
          id
        }
      }
      ... on MutationError {
        message
      }
    }
  }`;

  const response = await fetch('https://api.buffer.com', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: mutation,
      variables: { input }
    })
  });

  const resJson = await response.json() as any;
  const postResult = resJson?.data?.createPost;

  if (postResult?.post?.id) {
    console.log(` Successfully published thread to X via Buffer! Post ID: ${postResult.post.id}`);
    return { success: true, postId: postResult.post.id };
  } else {
    throw new Error(`Buffer publication failed: ${postResult?.message || JSON.stringify(resJson)}`);
  }
}

// If run directly:
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const isDryRun = process.argv.includes('--dry-run');
  publishMatricesThread(isDryRun)
    .then(res => console.log('Done:', res))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
