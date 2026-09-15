import { getEvents } from '../src/lib/events-server';
import { listUnmappedMapEvents } from '../src/lib/event-map-locations';

async function main() {
  const events = await getEvents();
  const { missingCoordinates, missingCountry } = listUnmappedMapEvents(events);

  if (!missingCoordinates.length && !missingCountry.length) {
    console.log('✅ All mappable events have map coordinates and country codes.');
    return;
  }

  console.error('❌ Events map coverage gaps (events hidden from map):\n');

  if (missingCountry.length) {
    console.error('Missing country code mapping:');
    for (const row of missingCountry) {
      console.error(`  ${row.count}× country="${row.country}" city="${row.city}"`);
    }
    console.error('');
  }

  if (missingCoordinates.length) {
    console.error('Missing city coordinates (add to EVENT_MAP_CITY_COORDINATES or EVENT_MAP_CITY_ALIASES):');
    for (const row of missingCoordinates) {
      console.error(
        `  ${row.count}× ${row.key} (raw: ${row.rawCities.join(' | ')}) — e.g. ${row.sample.slice(0, 60)}`,
      );
    }
  }

  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
