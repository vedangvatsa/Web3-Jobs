# IBW event description review, October 15, 2026

Reviewed all 54 event pages linked from the live `/ibw` directory against their
organizer sources. The detail pages were displaying their stored descriptions
in full; earlier editorial summaries had omitted available program information.

## Changes

- Revised 45 existing descriptions. Added substantive agendas, technical topics,
  speakers, participation rules and admission conditions where sources supplied
  them. Nine descriptions remain unchanged because they were already complete
  for the available facts or their event-specific sources were unavailable.
- Restored the DeFi Security Summit's published talk directory, the current
  Cypherpunk Congress roster, ETHGlobal's project/submission rules and partner
  award conditions, and Unchained Summit's two-day program and Pitch Challenge.
- Corrected Sidequest Happy Hour to November 4, 19:30 to 23:30 IST, and NEAR x
  Quantus Happy Hour to November 5, 18:00 to 21:00 IST. Corrected the roundtable's
  event-specific seventh-floor directions and the DeFi Security Summit's Mumbai
  location. Private venues remain private.
- Added Zcash Presents: FREE SOCIETY HACKATHON at `/free-society-hackathon`, with
  its verified November 4 to 5 schedule, original local cover, team rules,
  approval-required free registration and both award tracks. The description
  distinguishes USD 4,800 in competition awards from USD 200 in conditional
  milestone bonuses.
- Replaced `/ibt-mumbai` with `/india-blockchain-ai-tour-mumbai` and
  `/tbe-devcon26` with `/afterdark-devcon`. Old URLs remain permanent aliases.
  `/freesocietyhackathon` aliases the new hackathon's hyphenated URL.

## Source limits

Four direct event sources remain unavailable: Sidequest Chai at Dawn, Kulfi Ice
Cream Hour, Explore Mumbai, and Quantstamp Mumbai Lounge. Their existing
descriptions and original successful verification dates are preserved. A failed
refresh was not treated as cancellation or fresh content verification.

EIP Hub's published hours disagree between its Luma body, structured metadata
and official site. Its description states those differences. The Unchained
Pitch Challenge's October 25/30 application cutoff disagreement also remains
visible. No guessed schedule or application deadline was substituted.

`ibw-description-audit.json` records each decision, before/after word counts and
hashes, source receipts, restored facts and conflicts. Publication normalization
changed only typographic quotes in the reviewed drafts; the stored description
digests match the actual runtime copy. Raw responses stay in the local evidence
cache rather than the public catalog.

## Verification

- Normal Node 24 production build, root type validation and event gates passed.
- All 55 IBW-linked pages passed HTTP checks for complete rendered text,
  canonical metadata and directory links.
- All 214 current event slugs passed uniqueness, root-syntax and opaque-code
  checks; 183 aliases returned permanent redirects to their owning event.
- Representative detailed event pages passed at 320, 390 and 1440 pixels in
  light and dark themes, with no horizontal overflow, React errors or failed
  local resources.
- Speaker sections avoid a second automatic copy of the same roster. Prose with
  multiple time ranges remains a paragraph; real agendas retain their layout.

The combined release check, `scripts/test-ibw-release.ts`, also checks the
`/jio-perpetuals` article, its two embedded posts and `/news` listing, and the
`Popups` link in the Nomads controls. These counts describe the October 15 local
production snapshot; normal expiry filtering continues independently.
