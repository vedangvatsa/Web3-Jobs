# Job and event search audit — October 19, 2026

## Observed production responses

Requests to `/mgr48`, `/int15`, `/dc`, `/devcon`, and `/ibw` used browser, Googlebot, and Google-InspectionTool user agents. The first two returned full job pages, self-referencing canonical URLs, `index, follow`, and one JobPosting each. `/dc` incorrectly returned a homepage preview; the job-root collision fix is included in the release.

Devcon and IBW returned full, crawlable pages and correct canonical URLs, but no Event JSON-LD. Neither response had a noindex directive. The site's robots.txt allows Googlebot. The live sitemap contained 3,494 URLs, including these five pages and `/ripple-swell-2026`.

These HTTP checks do not show Google's indexed state, manual actions, selected canonical, or Search Console validation history. The owner still needs to inspect those reports after deployment and recrawling.

## Job markup

See [the detailed job audit](JOB_POSTING_SCHEMA_AUDIT.md). Verified defects included missing country evidence, `International` being interpreted as `INTERN`, `Smart Contract` being interpreted as `CONTRACTOR`, and unconditional direct-application claims. The release fixes those defects and preserves the original-date eligibility rule.

## Event markup

Before the patch, 19 of 205 live event records passed the schema gate. Exclusions overlapped:

| Reason | Before | Patched catalog |
| --- | ---: | ---: |
| Missing detailed address | 163 | 156 |
| Restricted registration | 113 | 113 |
| Hidden address | 66 | 66 |
| Online-only | 3 | 2 |
| Missing location | 2 | 2 |
| Eligible events | 19 | 25 |

Fixes:

- Devcon's student-ticket sentence about “online-only programs” incorrectly classified the physical conference as online-only. Classification now checks event-related language and respects an explicit physical attendance mode. A location explicitly marked online still blocks physical-event markup.
- Added the organizer-published Jio World Centre address for Devcon. Added Fairmont Mumbai's official address for IBW, whose organizer confirms that venue and sells general admission.
- Address recognition supports lettered blocks, airport addresses, and named points. It still rejects bare venue names, cities, hidden addresses, and incomplete block labels.
- The page displays the event date range and the same public venue/address information used in structured data. Omission reasons are available in `data-event-schema-reasons` for diagnostics.
- Googlebot, Google-InspectionTool, and Google-PageRenderer explicitly bypass metadata-only social preview shells. Social aliases redirect them to the full detail page. Ordinary social preview crawlers retain their existing shells.

Source evidence: [`content/events/schema-location-evidence.json`](../content/events/schema-location-evidence.json). No private venue was exposed, no approval flag was cleared, and no ticket price, availability, or performer was invented.

Google's [Event requirements](https://developers.google.com/search/docs/appearance/structured-data/event) exclude invitation/membership-only and wholly virtual events. Missing evidence cannot be repaired by adding guessed fields. Google also limits the Event search experience by region and language.

## Verification and release

- Event schema/address regressions pass.
- Google crawler routing regressions pass.
- Job schema/address, age/cache, and social routing regressions pass; the routing matrix covered 20,340 requests.
- TypeScript typecheck passes.
- Regenerated the 205-event runtime catalog and the event schema audit. The normal retention step removed four source records that ended more than 30 days ago and retained their URL tombstones.

After deployment, check representative eligible URLs in [Rich Results Test](https://search.google.com/test/rich-results) and the site's Search Console URL Inspection tool. Request validation/recrawling for fixed pages. Valid markup makes a page eligible; it does not guarantee inclusion in Google's job or event search results.

## Live verification

Firebase build `manual-1792427001` reached READY and rollout `rollout-manual-1792428147` succeeded on October 19 at 16:42 UTC, deploying revision `4a81734f6290ddcddeef4c09249d5fee49ddc964` (which contains the schema fixes). Firebase API confirmation was used because GitHub Actions status reporting was degraded.

Subsequent Google-InspectionTool requests confirmed HTTP 200, self-referencing canonicals, and the updated markup on `/mgr48`, `/int15`, `/eng45`, `/dc`, `/devcon`, and `/ibw`. `/eng621` retains its visible job page but omits JobPosting with `remote-country-missing`. Devcon and IBW now include Event JSON-LD with the verified addresses above. The invalid employment/direct-application defaults are absent.

The unauthenticated Rich Results Test session returned “Something went wrong — Log in and try again.” No Google validation or indexing success is claimed from that attempt; owner-authenticated Search Console validation remains the next external check.
