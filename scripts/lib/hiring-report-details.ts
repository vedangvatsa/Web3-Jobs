export type ExperienceEvidence = {
  excerpt: string;
  phrase: string;
  lowerYears: number;
  upperYears: number | null;
  scope: 'general' | 'role' | 'specific skill' | 'unclassified';
  request: 'required' | 'preferred' | 'unclear';
  conditional: boolean;
};

const numberWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen'];
const numberToken = `(?:\\d{1,2}|${numberWords.join('|')})`;
const numericYears = new RegExp(`\\b(${numberToken})\\s*(?:\\+|[-–—]\\s*(${numberToken})|to\\s+(${numberToken}))?\\s*years?['’]?\\s+(?:of\\s+)?([^\\n.;:]{0,100}?)\\bexperience\\b`, 'gi');
const asNumber = (value: string) => /^\d+$/.test(value) ? Number(value) : numberWords.indexOf(value.toLowerCase());
const roleWords = /\b(engineering|development|developer|sales|account management|customer success|customer[- ]facing|design(?:er)?|product management|program manag(?:er|ement)|project management|marketing|compliance|legal|paralegal|finance|financial|treasury|operations|logistics|supply chain|recruiting|recruitment|human resources|HRIS|security engineering|management consulting|leadership|management|relevant role|similar role)\b/i;
const toolWords = /\b(python|sql|rust|solidity|java|javascript|typescript|react|aws|azure|gcp|kubernetes|docker|linux|salesforce|hubspot|golang|excel|tableau|power bi|github actions|ci\/cd)\b|C\+\+/i;

function experienceScope(prefix: string, suffix: string): ExperienceEvidence['scope'] {
  if (toolWords.test(prefix)) return 'specific skill';
  if (roleWords.test(prefix)) return 'role';
  const firstClause = suffix.split(/[,;.]|\bincluding\b/i)[0];
  if (toolWords.test(firstClause)) return 'specific skill';
  if (/^\s*(?:in|with|using|as)\b/i.test(firstClause)) {
    if (roleWords.test(firstClause)) return 'role';
    return 'unclassified';
  }
  if (!prefix.trim() || /^(?:(?:professional|work|working|industry|relevant|overall|total|commercial|practical|hands-on|proven|progressive)\s*)+$/i.test(prefix.trim())) return 'general';
  return 'unclassified';
}

export function experienceRequirements(text: string) {
  let section: 'required' | 'preferred' | 'unknown' = 'unknown';
  const evidence: ExperienceEvidence[] = [];
  for (const paragraph of text.split(/\n+/)) {
    const line = paragraph.trim();
    if (/^(?:(?:minimum|basic|required) qualifications|qualifications|requirements|about you|who you are|your (?:profile|experience|background)|what (?:you(?:'|’)ll|you will) (?:need|bring)|what we(?:'|’)re looking for)\s*[:!?]?$/i.test(line)) section = 'required';
    else if (/^(?:preferred qualifications|desired qualifications|nice[- ]to[- ]haves?|bonus points|it(?:'|’)s a plus if)\s*[:!?]?$/i.test(line)) section = 'preferred';
    else if (/^(?:about us|about the company|benefits|compensation|responsibilities|what you will do|what we offer)\s*[:!?]?$/i.test(line)) section = 'unknown';
    for (const match of line.matchAll(numericYears)) {
      const lowerYears = asNumber(match[1]);
      const upperYears = match[2] || match[3] ? asNumber(match[2] || match[3]) : null;
      if (upperYears !== null && upperYears < lowerYears) continue;
      const before = line.slice(0, match.index);
      const suffix = line.slice(match.index + match[0].length, match.index + match[0].length + 180);
      const preferred = section === 'preferred' || /\b(preferred|preferably|ideally|nice to have|bonus points|desired|a plus|not required)\b/i.test(line);
      const directRequest = /^\s*(?:[-•*]\s*)?(?:(?:at least|a minimum of|minimum|experience:)\s*)?$/i.test(before)
        || /\b(?:you (?:have|bring)|must have|we (?:require|expect)|required|minimum|at least)\b/i.test(before);
      const qualified = section === 'required' || directRequest;
      const degreeAlternative = /\b(degree|bachelor|master|ph\.?d)\b/i.test(line) && /\b(or|alternatively|equivalent combination)\b/i.test(line);
      const comparison = /\b(?:up to|less than|more than|over|at most)\s*$/i.test(before);
      evidence.push({
        excerpt: line,
        phrase: match[0], lowerYears, upperYears,
        scope: experienceScope(match[4], suffix),
        request: preferred ? 'preferred' : qualified ? 'required' : 'unclear',
        conditional: degreeAlternative || comparison,
      });
    }
  }
  const relevant = evidence.filter(item => item.request === 'required' && (item.scope === 'general' || item.scope === 'role'));
  const unique = new Set(relevant.map(item => `${item.lowerYears}:${item.upperYears}`));
  const ambiguous = relevant.some(item => item.conditional) || unique.size > 1;
  const selected = !ambiguous && relevant.length ? relevant[0] : null;
  const lower = selected?.lowerYears ?? null;
  const label = ambiguous ? 'Multiple or conditional requirements'
    : lower === null ? 'No matched general / role requirement'
    : lower < 3 ? '0–2 years' : lower < 6 ? '3–5 years' : lower < 10 ? '6–9 years' : '10+ years';
  return { label, lowerYears: lower, evidence };
}

export type RemoteLabel = 'Worldwide remote wording' | 'Remote with location / time-zone conditions' | 'Hybrid / scheduled office attendance' | 'On-site wording' | 'Conditional or conflicting arrangements' | 'No clear arrangement matched';
type RemoteEvidence = { kind: 'worldwide' | 'restricted' | 'hybrid' | 'on-site' | 'conditional'; excerpt: string; geographic?: boolean };
const geographicName = /\b(?:united states|united kingdom|canada|europe|european union|asia|americas|north america|latin america|south america|australia|new zealand|singapore|hong kong|india|japan|germany|france|spain|portugal|switzerland|ireland|netherlands|poland|dubai|brazil|argentina|mexico|new york|california|san francisco|london|toronto|vancouver)\b/i;
const geographicCode = /\b(?:US|USA|UK|EU|EMEA|APAC|LATAM|UAE|CAN)\b|\bU\.S\./;
const timeZone = /\b(?:UTC|GMT)(?:\s*[+-]\s*\d{1,2})?\b|\b(?:PST|PDT|EST|EDT|CET|CEST|BST|IST|JST)\b|\b(?:US|U\.S\.|Eastern|Pacific|Central|European|North American) (?:Standard |Daylight )?time(?: zones?)?\b/;

function startsWithPlace(text: string) {
  const prefix = text.replace(/^(?:the\s+|[\s(:,-])+/i, '');
  return [prefix.match(geographicName), prefix.match(geographicCode)].some(match => match?.index === 0);
}

export function remoteArrangement(text: string): { label: RemoteLabel; evidence: RemoteEvidence[] } {
  const evidence: RemoteEvidence[] = [];
  const hasRemote = /\bremote(?:ly)?\b|work from anywhere/i.test(text);
  for (const paragraph of text.split(/\n+/)) {
    const line = paragraph.trim();
    const add = (kind: RemoteEvidence['kind'], geographic = false) => evidence.push({ kind, excerpt: line, ...(kind === 'restricted' ? { geographic } : {}) });
    const negated = /\b(not|isn['’]t|is not|cannot|can['’]t|never)\b.{0,55}\b(?:remote|anywhere|worldwide)\b/i.test(line);
    const temporary = /\b(?:\d+|two|three|four|five|six)\s+(?:days?|weeks?|months?)\b|\bper year\b|\bup to\b/i.test(line);
    const worldwide = /\bwork(?:ing)? (?:remotely )?from anywhere in (?:the )?world\b|\bremote\s*[,(:–—-]\s*worldwide\b|\bworldwide remote (?:role|position)\b|\bglobal and (?:fully )?remote (?:role|position)\b|\bremote (?:role|position).{0,60}\b(?:candidates|applicants) worldwide\b/i.test(line);
    if (worldwide && !negated && !temporary) add('worldwide');
    const restrictions = [
      /\bremot(?:e|ely)\s*[,(:–—-]\s*(.{2,100})/i,
      /\bremot(?:e|ely)(?: work| working| option| role| position)?(?: is| available| allowed| only| based| exclusively| restricted| permitted| offered){0,3}\s+(?:in|within|from|across|to)\s+(.{2,100})/i,
      /\b(?:must|need to|required to|have to|can only|only)\s+(?:be\s+)?(?:based|reside|located|live|work)\s+(?:in|within|from)\s+(.{2,100})/i,
      /\bwork(?:ing)?\s+from\s+anywhere\s+(?:in|within|across)\s+(.{2,100})/i,
      /\bremote.{0,100}\b(?:candidates|applicants|residents)\s+(?:who are\s+)?(?:based|located|living|residing)?\s*(?:in|within)\s+(.{2,100})/i,
    ];
    const conditionalPayDisclosure = /^(?:for|if)\s+(?:employees|candidates|applicants|hires)\b/i.test(line) && /\b(salary|compensation|pay range)\b/i.test(line);
    const geographicRestriction = hasRemote && !conditionalPayDisclosure && restrictions.some(pattern => {
      const match = line.match(pattern);
      return match && startsWithPlace(match[1]) && !/\b(preferred|preferably|ideally)\b/i.test(match[1].split(/[,;)]/)[0]);
    });
    const namedRemoteLocation = /^location:\s*(.+?)\s+remote\b/i.exec(line);
    const locationHeading = namedRemoteLocation && startsWithPlace(namedRemoteLocation[1]);
    const hoursRestriction = hasRemote && timeZone.test(line)
      && (/\b(must|required|need to|expected|aligned|willing to work|work on|maintains? at least)\b/i.test(line)
        || /\b(?:schedule|hours) (?:is |are )?based on\b/i.test(line)
        || /\bremote.{0,100}\b(?:GMT|UTC).{0,100}\bsufficient overlap\b/.test(line))
      && !/\b(preferred|preferably|try to|ideally|optional)\b/i.test(line);
    if (!negated && (geographicRestriction || locationHeading || hoursRestriction)) add('restricted', Boolean(geographicRestriction || locationHeading));
    const hybrid = /\bhybrid (?:work(?:ing)?|office)[- ](?:model|schedule|arrangement|policy|environment|approach)\b|\bhybrid working\b|\b(?:role|position) is hybrid\b|\b(?:\d|one|two|three|four|five)(?:\s*[-–]\s*\d)?\s+days?(?:\s+(?:a|per|each)\s+week|\/week)?\s+(?:in[- ]office|in (?:our|the|an?) .{0,30}office|from (?:our|the) office)\b/i.test(line);
    if (hybrid && !/\b(?:future of|hybrid trading|hybrid role combining)\b/i.test(line)) add('hybrid');
    if (/\b(?:role|position) is (?:fully |100% )?on[- ]site\b|\b(?:on[- ]site|in[- ]office) (?:role|position)\b|\b(?:expected|required) to work on[- ]site\b|\bnot (?:a )?remote (?:role|position)\b/i.test(line)) add('on-site');
    if (/\b(?:expectations|arrangements?|polic(?:y|ies)).{0,50}\bvary by (?:location|role)\b|\bexceptions.{0,50}\bhybrid\b|\bhybrid.{0,60}\bwork fully remotely\b|\bhybrid.{0,150}\bwhile remote\b|\b(?:remote or hybrid|hybrid or remote)\b/i.test(line)) add('conditional');
  }
  const kinds = new Set(evidence.map(item => item.kind));
  const worldwideHasGeographicRestriction = kinds.has('worldwide') && evidence.some(item => item.kind === 'restricted' && item.geographic);
  const conflict = kinds.has('conditional') || worldwideHasGeographicRestriction
    || ((kinds.has('worldwide') || kinds.has('restricted')) && (kinds.has('hybrid') || kinds.has('on-site')))
    || (kinds.has('hybrid') && kinds.has('on-site'));
  const label: RemoteLabel = conflict ? 'Conditional or conflicting arrangements'
    : kinds.has('restricted') ? 'Remote with location / time-zone conditions'
    : kinds.has('worldwide') ? 'Worldwide remote wording'
    : kinds.has('hybrid') ? 'Hybrid / scheduled office attendance'
    : kinds.has('on-site') ? 'On-site wording'
    : 'No clear arrangement matched';
  return { label, evidence };
}
