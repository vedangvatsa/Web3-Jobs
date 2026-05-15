import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fetchLumaEvents() {
  console.log('Fetching Web3 events from Luma...');
  try {
    // We use a realistic User-Agent to avoid basic blocks
    const res = await fetch('https://lu.ma/crypto', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Luma: ${res.statusText}`);
    }

    const html = await res.text();
    
    // Extract __NEXT_DATA__
    const match = html.match(/id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (!match) {
      throw new Error('Could not find __NEXT_DATA__ in Luma HTML');
    }

    const data = JSON.parse(match[1]);
    const eventsData = data.props?.pageProps?.initialData?.data;
    
    if (!eventsData || !eventsData.timeline_calendars) {
      throw new Error('Unexpected JSON structure in Luma data');
    }

    const rawEvents = eventsData.timeline_calendars;
    
    const events = rawEvents.map(item => {
      const cal = item.calendar;
      if (!cal) return null;
      
      const locationParts = [];
      if (cal.geo_city) locationParts.push(cal.geo_city);
      if (cal.geo_country) locationParts.push(cal.geo_country);
      const locationString = locationParts.length > 0 ? locationParts.join(', ') : 'Virtual / TBA';

      return {
        id: cal.api_id,
        name: cal.name,
        description: cal.description_short || '',
        startDate: item.start_at,
        endDate: item.end_at,
        location: locationString,
        url: `https://lu.ma/${cal.slug}`,
        website: cal.website || null,
        coverImage: cal.cover_image_url || cal.social_image_url || null,
        twitter: cal.twitter_handle || null,
      };
    }).filter(Boolean);

    console.log(`Found ${events.length} Web3 events.`);

    // Save to content/events-cache.json
    const cachePath = path.join(__dirname, '../content/events-cache.json');
    fs.writeFileSync(cachePath, JSON.stringify(events, null, 2));
    console.log(`Successfully saved events to ${cachePath}`);

  } catch (error) {
    console.error('Error fetching Web3 events:', error);
    process.exit(1);
  }
}

fetchLumaEvents();
