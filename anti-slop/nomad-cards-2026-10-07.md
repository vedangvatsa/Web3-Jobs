# Compact Nomad cards

Mode: during-work review, as previously requested.

Design read: a ranked destination directory within Hashtag Web3's existing
listing system. ENERGY 1 / RHYTHM 1 / MOTION 1. Equal card sizing supports
comparison; city photos distinguish destinations without dominating each row.

## Shared implementation

`ListingCard`, `ListingCardHeader` and `ListingCardTitle` are shared by city,
Event, News and Article cards. They retain the existing border, background,
16px title and 16px horizontal padding. City photos remain full width, with
128px mobile and 144px larger-screen heights. Prices use the same 16px text
scale. Compare uses the existing small Button variant with a 44px minimum
height, reducing horizontal padding without reducing the touch target.

## Measured result

| Viewport | Previous city-card height | Updated height |
| --- | ---: | ---: |
| 320px | 320.75px | 260px |
| 390px | 364.5px | 260px |
| 640px | 320.75px | 276px |
| 768px | 360.75px | 276px |
| 1024px | 337.41px | 276px |
| 1440px | 364.08px | 276px |

The desktop card is about 24% shorter. At 390px it is about 29% shorter.
Widths and the existing one/two/three-column grid remain responsive.

## Delivery gate

- PASS, R-03/R-32/R-34: six widths in light and explicitly applied dark styles;
  no horizontal overflow, and keyboard selection/deselection works.
- PASS, R-25: title contrast 17.87:1 light and 16.11:1 dark; country text
  contrast 4.83:1 light and 6.56:1 dark. Measurements wait for colour transitions.
- PASS, R-26/R-35: 102 canonical Nomad routes and 123 legacy redirects pass the
  browser suite, including filters, map controls, comparison, printing and
  mobile navigation. All Compare targets remain 44px high.
- PASS, R-31/C-1/C-3: shared listing primitives prevent separate typography
  and spacing rules; shorter photos improve scanning while preserving their
  destination-identification role. No new decorative elements or copy.
- PASS, R-33/C-4: changes are in React components; production compilation,
  type validation, Nomad/policy tests and feed/asset gates pass.
- PASS, C-5: sizing claims above come from browser measurements saved under
  `.cache/nomads/city-card-sizing-before.json` and `city-card-sizing-after.json`.

Passport factual verification is a separate unfinished audit documented in
`docs/PASSPORT_DATA_AUDIT.md`; the software checks do not certify unreviewed
immigration rules.
