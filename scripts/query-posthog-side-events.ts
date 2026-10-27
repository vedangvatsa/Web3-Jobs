import fs from 'node:fs';
import path from 'node:path';

// Load local environment if available (.env.local or process.env)
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of content.split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const PH_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const PH_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
let currentHost = process.env.POSTHOG_API_HOST || 'https://us.posthog.com';

if (!PH_API_KEY || !PH_PROJECT_ID) {
  console.error('[query-posthog] Error: POSTHOG_PERSONAL_API_KEY or POSTHOG_PROJECT_ID is missing.');
  console.error('[query-posthog] Available env keys:', Object.keys(process.env).filter(k => k.includes('POSTHOG')));
  process.exit(1);
}

async function runHogQL(title: string, query: string): Promise<any> {
  console.log(`\n======================================================`);
  console.log(`[query-posthog] ${title}`);
  console.log(`======================================================`);

  const url = `${currentHost.replace(/\/$/, '')}/api/projects/${PH_PROJECT_ID}/query/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PH_API_KEY}`,
    },
    body: JSON.stringify({
      query: { kind: 'HogQLQuery', query }
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`HTTP ${res.status}:`, text);
    return null;
  }

  const data = await res.json();
  return data;
}

async function testAuth(host: string, key: string): Promise<any> {
  try {
    const res = await fetch(`${host.replace(/\/$/, '')}/api/users/@me/`, {
      headers: { Authorization: `Bearer ${key}` }
    });
    if (!res.ok) {
      const err = await res.text();
      return { ok: false, status: res.status, err };
    }
    const data = await res.json();
    return { ok: true, email: data.email, org: data.organization?.name, team: data.team?.id };
  } catch (e: any) {
    return { ok: false, err: e.message };
  }
}

async function main() {
  console.log(`[query-posthog] Key length: ${PH_API_KEY.length}, prefix: ${PH_API_KEY.slice(0, 4)}***`);
  console.log(`[query-posthog] Configured Host: ${PH_HOST}`);
  console.log(`[query-posthog] Configured Project ID: ${PH_PROJECT_ID}`);

  // Test auth on US and EU
  const usTest = await testAuth('https://us.posthog.com', PH_API_KEY);
  console.log('[query-posthog] US host auth test:', JSON.stringify(usTest));

  const euTest = await testAuth('https://eu.posthog.com', PH_API_KEY);
  console.log('[query-posthog] EU host auth test:', JSON.stringify(euTest));

  let activeHost = PH_HOST;
  if (!usTest.ok && euTest.ok) {
    activeHost = 'https://eu.posthog.com';
    console.log('[query-posthog] Switching to EU host based on successful auth!');
  } else if (usTest.ok) {
    activeHost = 'https://us.posthog.com';
  }
  currentHost = activeHost;

  // 1. Pageviews on /ibw and /devcon hub pages
  const hubPageviews = await runHogQL('1. Pageviews on /ibw and /devcon Hub Pages', `
    SELECT
      properties.$pathname AS pathname,
      count() AS total_pageviews,
      countDistinct(distinct_id) AS unique_visitors,
      min(timestamp) AS first_view,
      max(timestamp) AS last_view
    FROM events
    WHERE event = '$pageview'
      AND (
        properties.$pathname = '/ibw'
        OR properties.$pathname = '/devcon'
        OR properties.$current_url LIKE '%/ibw%'
        OR properties.$current_url LIKE '%/devcon%'
      )
    GROUP BY pathname
    ORDER BY total_pageviews DESC
  `);

  if (hubPageviews?.results) {
    console.table(hubPageviews.results.map((r: any[]) => ({
      Pathname: r[0],
      TotalViews: r[1],
      UniqueVisitors: r[2],
      FirstView: r[3],
      LastView: r[4],
    })));
  }

  // 2. Autocapture click events on /ibw and /devcon (Internal card / link clicks)
  const hubClicks = await runHogQL('2. Autocapture Clicks on /ibw and /devcon Pages', `
    SELECT
      properties.$pathname AS page,
      properties.href AS clicked_href,
      properties.$el_text AS element_text,
      count() AS click_count,
      countDistinct(distinct_id) AS unique_clickers
    FROM events
    WHERE event = '$autocapture'
      AND (
        properties.$pathname = '/ibw'
        OR properties.$pathname = '/devcon'
        OR properties.$current_url LIKE '%/ibw%'
        OR properties.$current_url LIKE '%/devcon%'
      )
      AND properties.href != ''
    GROUP BY page, clicked_href, element_text
    ORDER BY click_count DESC
    LIMIT 100
  `);

  if (hubClicks?.results) {
    console.table(hubClicks.results.slice(0, 50).map((r: any[]) => ({
      Page: r[0],
      ClickedHref: (r[1] || '').slice(0, 40),
      ElementText: (r[2] || '').trim().replace(/\s+/g, ' ').slice(0, 30),
      Clicks: r[3],
      UniqueUsers: r[4],
    })));
  }

  // 3. Referrals: Pageviews where referrer came from /ibw or /devcon
  const referralTraffic = await runHogQL('3. Side Event Pageviews Referred Directly from /ibw or /devcon', `
    SELECT
      multiIf(
        properties.$referrer LIKE '%/ibw%', 'Referred from /ibw',
        properties.$referrer LIKE '%/devcon%', 'Referred from /devcon',
        'Other'
      ) AS source_hub,
      properties.$pathname AS side_event_slug,
      count() AS referred_views,
      countDistinct(distinct_id) AS unique_visitors
    FROM events
    WHERE event = '$pageview'
      AND (
        properties.$referrer LIKE '%/ibw%'
        OR properties.$referrer LIKE '%/devcon%'
      )
      AND properties.$pathname != '/ibw'
      AND properties.$pathname != '/devcon'
    GROUP BY source_hub, side_event_slug
    ORDER BY referred_views DESC
    LIMIT 100
  `);

  if (referralTraffic?.results) {
    console.table(referralTraffic.results.map((r: any[]) => ({
      SourceHub: r[0],
      SideEventSlug: r[1],
      ReferredViews: r[2],
      UniqueVisitors: r[3],
    })));
  }

  // 4. Outbound registration / ticket clicks on side event pages
  const outboundClicks = await runHogQL('4. Outbound Registration Clicks on Side Event Pages', `
    SELECT
      properties.$pathname AS event_page,
      properties.href AS registration_url,
      properties.$el_text AS button_text,
      count() AS outbound_clicks,
      countDistinct(distinct_id) AS unique_users
    FROM events
    WHERE event = '$autocapture'
      AND (
        properties.href LIKE '%lu.ma%'
        OR properties.href LIKE '%luma%'
        OR properties.href LIKE '%eventbrite%'
        OR properties.href LIKE '%ticket%'
        OR properties.href LIKE '%register%'
        OR properties.$el_text LIKE '%Register%'
        OR properties.$el_text LIKE '%Official Event%'
      )
      AND properties.$pathname != '/'
      AND properties.$pathname != '/jobs'
    GROUP BY event_page, registration_url, button_text
    ORDER BY outbound_clicks DESC
    LIMIT 100
  `);

  if (outboundClicks?.results) {
    console.table(outboundClicks.results.slice(0, 50).map((r: any[]) => ({
      EventPage: r[0],
      RegistrationUrl: (r[1] || '').slice(0, 45),
      ButtonText: (r[2] || '').trim().replace(/\s+/g, ' ').slice(0, 25),
      OutboundClicks: r[3],
      UniqueUsers: r[4],
    })));
  }

  // 5. Total pageviews across all known IBW & Devcon side event slugs
  const eventsRuntime = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content/events-runtime.json'), 'utf8'));
  const ibwSlugs = new Set<string>();
  const devconSlugs = new Set<string>();

  for (const e of eventsRuntime) {
    const slug = e.slug || e.id;
    if (e.sideEventFor?.includes('ibw')) ibwSlugs.add(slug);
    if (e.sideEventFor?.includes('devcon')) devconSlugs.add(slug);
  }

  const allSlugsList = Array.from(new Set([...ibwSlugs, ...devconSlugs])).map(s => `'/${s}'`).join(', ');

  const sideEventPageviews = await runHogQL('5. Total Traffic to All IBW & Devcon Side Event Slugs', `
    SELECT
      properties.$pathname AS slug,
      count() AS total_views,
      countDistinct(distinct_id) AS unique_visitors,
      min(timestamp) AS first_view,
      max(timestamp) AS last_view
    FROM events
    WHERE event = '$pageview'
      AND properties.$pathname IN (${allSlugsList})
    GROUP BY slug
    ORDER BY total_views DESC
    LIMIT 100
  `);

  if (sideEventPageviews?.results) {
    console.table(sideEventPageviews.results.map((r: any[]) => ({
      SideEvent: r[0],
      IsIBW: ibwSlugs.has(r[0].replace('/', '')),
      IsDevcon: devconSlugs.has(r[0].replace('/', '')),
      TotalViews: r[1],
      UniqueVisitors: r[2],
      FirstSeen: r[3],
      LastSeen: r[4],
    })));
  }

  console.log('\n[query-posthog] All PostHog analytics queries completed successfully!');
}

main().catch(err => {
  console.error('[query-posthog] Fatal error:', err);
  process.exit(1);
});
