# Approved resource thread

The user approved the seven images and text, then requested publication to X and Threads with bare `hashtagweb3.com/<resource>/x` links in the post text. The same `/x` suffix is intentional on both platforms. Image artwork retains its approved canonical URLs.

## Publishing

Use the manually dispatched `publish-nomad-resource-thread.yml` workflow. It defaults to read-only `preflight`; `publish` is explicit. The workflow is restricted to this manifest and to X `@hashtag_web3` and Threads `@hashtagweb3`.

- X uses Buffer's native thread array, including the root and one image per item.
- Threads creates image posts in order, each replying to the preceding verified post.
- All images have alt text. Uploaded bytes are checked against the committed JPEGs, hosted at an immutable GitHub commit URL.
- The three jobs visible in image 05 require the existing original-date and fresh employer-application guard immediately before sending.
- Claims and provider IDs are persisted to `scripts/social/nomad-thread-receipts.json` before subsequent mutations. The workflow also uploads a journal and receipt artifact.
- A lost creation or publication response stops execution. A rerun may verify saved IDs but will not recreate an ambiguous post.

Run locally without publishing:

```sh
node --import tsx --test scripts/social/publish-nomad-thread.test.mjs
node --import tsx scripts/social/publish-nomad-thread.mjs --mode=validate
```

## Image sources

Images 01, 02, 03, 05 and 06 contain live Hashtag Web3 screenshots captured on 16 October 2026. Image 04 uses community gallery images already included on Hashtag Web3, with source credits printed in the artwork:

- https://xyz.city/network-states/edge-city
- https://xyz.city/network-states/crecimiento
- https://xyz.city/network-states/4seas

Image 07 is a resource-link index. The displayed city costs are estimates. Visa and citizenship screenshots demonstrate the comparison tools; official sources remain linked from the site.
