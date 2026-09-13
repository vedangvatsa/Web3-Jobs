import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

type Speaker = { name: string; title?: string; organization?: string };
type EventRecord = { id: string; speakers?: string[]; speakerDetails?: Speaker[] };

const sourceUrl = 'https://token2049.com/singapore/speakers';
const curatedPath = path.join(process.cwd(), 'content', 'curated-events.json');

async function main() {
  const response = await fetch(sourceUrl, { headers: { 'User-Agent': 'HashtagWeb3 event directory' } });
  if (!response.ok) throw new Error(`Could not fetch speaker directory: ${response.status}`);

  const $ = cheerio.load(await response.text());
  const eventJson = $('script[type="application/ld+json"]')
    .toArray()
    .map((element) => JSON.parse($(element).text()))
    .find((value) => value?.['@type'] === 'Event' && Array.isArray(value.performer));
  if (!eventJson) throw new Error('Official speaker roster was not found in structured data');

  const speakers: Speaker[] = eventJson.performer
    .filter((person: { ['@type']?: string; name?: string }) => person?.['@type'] === 'Person' && person.name)
    .map((person: { name: string; jobTitle?: string; worksFor?: { name?: string }; affiliation?: { name?: string } }) => ({
      name: person.name.trim(),
      ...(person.jobTitle ? { title: person.jobTitle.trim() } : {}),
      ...((person.worksFor?.name || person.affiliation?.name) ? { organization: (person.worksFor?.name || person.affiliation?.name).trim() } : {}),
    }));
  if (speakers.length === 0) throw new Error('Official speaker roster is empty');

  const events: EventRecord[] = JSON.parse(fs.readFileSync(curatedPath, 'utf8'));
  const event = events.find((item) => item.id === 'premier-token2049-singapore-2026');
  if (!event) throw new Error('TOKEN2049 Singapore event record was not found');

  event.speakers = speakers.map((speaker) => speaker.name);
  event.speakerDetails = speakers;
  fs.writeFileSync(curatedPath, `${JSON.stringify(events, null, 2)}\n`);
  console.log(`Imported ${speakers.length} official TOKEN2049 speakers.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
