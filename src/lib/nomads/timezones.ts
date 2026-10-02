export const CITY_TIMEZONES: Record<string, string> = {
  'chiang-mai': 'Asia/Bangkok', 'bangkok': 'Asia/Bangkok', 'phuket': 'Asia/Bangkok', 'koh-phangan': 'Asia/Bangkok',
  'bali': 'Asia/Makassar', 'singapore': 'Asia/Singapore', 'kuala-lumpur': 'Asia/Kuala_Lumpur', 'penang': 'Asia/Kuala_Lumpur', 'johor': 'Asia/Kuala_Lumpur',
  'manila': 'Asia/Manila', 'cebu': 'Asia/Manila', 'siargao': 'Asia/Manila',
  'da-nang': 'Asia/Ho_Chi_Minh', 'hanoi': 'Asia/Ho_Chi_Minh', 'hoi-an': 'Asia/Ho_Chi_Minh', 'ho-chi-minh-city': 'Asia/Ho_Chi_Minh',
  'phnom-penh': 'Asia/Phnom_Penh', 'siem-reap': 'Asia/Phnom_Penh',
  'taipei': 'Asia/Taipei', 'tokyo': 'Asia/Tokyo', 'osaka': 'Asia/Tokyo', 'komoro': 'Asia/Tokyo', 'seoul': 'Asia/Seoul', 'shanghai': 'Asia/Shanghai',
  'bangalore': 'Asia/Kolkata', 'delhi': 'Asia/Kolkata', 'goa': 'Asia/Kolkata', 'mumbai': 'Asia/Kolkata', 'kathmandu': 'Asia/Kathmandu', 'colombo': 'Asia/Colombo',
  'dubai': 'Asia/Dubai', 'istanbul': 'Europe/Istanbul', 'antalya': 'Europe/Istanbul', 'kas': 'Europe/Istanbul', 'tel-aviv': 'Asia/Jerusalem',
  'dahab': 'Africa/Cairo', 'zanzibar': 'Africa/Dar_es_Salaam', 'cape-town': 'Africa/Johannesburg', 'accra': 'Africa/Accra', 'nairobi': 'Africa/Nairobi', 'kilifi': 'Africa/Nairobi', 'lagos': 'Africa/Lagos', 'marrakech': 'Africa/Casablanca',
  'lisbon': 'Europe/Lisbon', 'porto': 'Europe/Lisbon', 'ericeira': 'Europe/Lisbon', 'madeira-funchal': 'Atlantic/Madeira',
  'barcelona': 'Europe/Madrid', 'madrid': 'Europe/Madrid', 'malaga': 'Europe/Madrid', 'valencia': 'Europe/Madrid', 'tenerife': 'Atlantic/Canary', 'las-palmas': 'Atlantic/Canary',
  'berlin': 'Europe/Berlin', 'prague': 'Europe/Prague', 'budapest': 'Europe/Budapest', 'athens': 'Europe/Athens', 'thessaloniki': 'Europe/Athens',
  'tbilisi': 'Asia/Tbilisi', 'batumi': 'Asia/Tbilisi', 'amsterdam': 'Europe/Amsterdam', 'london': 'Europe/London', 'dublin': 'Europe/Dublin', 'paris': 'Europe/Paris',
  'tallinn': 'Europe/Tallinn', 'sofia': 'Europe/Sofia', 'bansko': 'Europe/Sofia', 'warsaw': 'Europe/Warsaw', 'krakow': 'Europe/Warsaw',
  'bucharest': 'Europe/Bucharest', 'belgrade': 'Europe/Belgrade', 'vilnius': 'Europe/Vilnius', 'riga': 'Europe/Riga',
  'split': 'Europe/Zagreb', 'dubrovnik': 'Europe/Zagreb', 'palermo': 'Europe/Rome', 'tirana': 'Europe/Tirane',
  'playa-del-carmen': 'America/Cancun', 'tulum': 'America/Cancun', 'mexico-city': 'America/Mexico_City', 'oaxaca': 'America/Mexico_City', 'guadalajara': 'America/Mexico_City', 'merida': 'America/Merida',
  'medellin': 'America/Bogota', 'cartagena': 'America/Bogota', 'bogota': 'America/Bogota', 'santa-marta': 'America/Bogota',
  'buenos-aires': 'America/Argentina/Buenos_Aires', 'rio-de-janeiro': 'America/Sao_Paulo', 'sao-paulo': 'America/Sao_Paulo', 'florianopolis': 'America/Sao_Paulo',
  'lima': 'America/Lima', 'cusco': 'America/Lima', 'santiago': 'America/Santiago', 'valparaiso': 'America/Santiago', 'montevideo': 'America/Montevideo',
  'antigua': 'America/Guatemala', 'roatan': 'America/Tegucigalpa', 'san-francisco': 'America/Los_Angeles', 'toronto': 'America/Toronto', 'melbourne': 'Australia/Melbourne',
};

const formatters = new Map<string, Intl.DateTimeFormat>();
export function timezoneOffsetMinutes(timeZone: string, date: Date): number {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-GB', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    formatters.set(timeZone, formatter);
  }
  const values = Object.fromEntries(formatter.formatToParts(date).filter(part => part.type !== 'literal').map(part => [part.type, Number(part.value)]));
  return Math.round((Date.UTC(values.year, values.month - 1, values.day, values.hour, values.minute, values.second) - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

export function formatOffset(minutes: number): string {
  return `UTC${minutes < 0 ? '−' : '+'}${Math.floor(Math.abs(minutes) / 60)}${Math.abs(minutes) % 60 ? `:${String(Math.abs(minutes) % 60).padStart(2, '0')}` : ''}`;
}

export function overlapSlots(zones: string[], day: string, start = 9 * 60, end = 18 * 60): boolean[][] {
  return zones.map(zone => Array.from({ length: 96 }, (_, slot) => {
    const instant = new Date(`${day}T00:00:00Z`);
    instant.setUTCMinutes(slot * 15);
    const local = ((slot * 15 + timezoneOffsetMinutes(zone, instant)) % 1440 + 1440) % 1440;
    return start <= end ? local >= start && local < end : local >= start || local < end;
  }));
}
