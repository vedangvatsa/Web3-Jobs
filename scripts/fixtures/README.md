# Public source adapter fixtures

`country-local/captures.json` contains the Change and Safello public careers,
HTML index, RSS, and original JobPosting evidence used by the recurring source
tests. `web3-expansion/captures.json` contains public Greenhouse and Ashby
snapshots and an exact-job Greenhouse application page.

HTML excerpts retain the links, headings, structured data, and application
markup needed by the adapter being tested. API excerpts omit descriptions that
are irrelevant to snapshot identity and original-date validation. Each excerpt
records both its own `bodySha256` and the captured source's
`originalBodySha256`. Tests verify the excerpt hash before use. Capture
timestamps remain historical; tests explicitly use them where freshness is
part of the check.

These are public job-source responses, without submitted applications or
applicant data. Tests use no authentication or external network requests and
do not depend on ignored research caches.
