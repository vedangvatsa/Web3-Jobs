const THIRD_PARTY_HOST_LABELS: Array<{ test: (host: string) => boolean; label: string }> = [
  { test: (h) => h.includes('greenhouse.io'), label: 'Greenhouse' },
  { test: (h) => h.includes('ashbyhq.com'), label: 'Ashby' },
  { test: (h) => h.includes('lever.co'), label: 'Lever' },
  { test: (h) => h.includes('workable.com'), label: 'Workable' },
  { test: (h) => h.includes('myworkdayjobs.com') || h.includes('wd1.myworkday'), label: 'Workday' },
  { test: (h) => h.includes('smartrecruiters.com'), label: 'SmartRecruiters' },
  { test: (h) => h.includes('breezy.hr'), label: 'Breezy HR' },
  { test: (h) => h.includes('recruitee.com'), label: 'Recruitee' },
  { test: (h) => h.includes('teamtailor.com'), label: 'Teamtailor' },
  { test: (h) => h.includes('jobs.personio'), label: 'Personio' },
  { test: (h) => h.includes('jobvite.com'), label: 'Jobvite' },
  { test: (h) => h.includes('icims.com'), label: 'iCIMS' },
  { test: (h) => h.includes('lu.ma') || h === 'luma.com', label: 'Luma' },
  { test: (h) => h.includes('eventbrite.'), label: 'Eventbrite' },
  { test: (h) => h.includes('meetup.com'), label: 'Meetup' },
  { test: (h) => h.includes('partiful.com'), label: 'Partiful' },
  { test: (h) => h.includes('hopin.com'), label: 'Hopin' },
];

export type ThirdPartyHostDisclosure = {
  hostname: string;
  platformLabel: string | null;
};

/** Host and platform label for outbound job/event links (Google third-party transparency). */
export function getThirdPartyHostDisclosure(outboundUrl: string): ThirdPartyHostDisclosure | null {
  try {
    const url = new URL(applyUrl);
    const hostname = url.hostname.replace(/^www\./, '');
    const platformLabel = THIRD_PARTY_HOST_LABELS.find(({ test }) => test(hostname))?.label ?? null;
    return { hostname, platformLabel };
  } catch {
    return null;
  }
}