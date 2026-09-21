---
name: lookup_glossary
description: Retrieve comprehensive definitions and technical explanations for 200+ blockchain, consensus, and cryptography concepts.
---

# Lookup Glossary Terms

## Data source

```
GET https://hashtagweb3.com/data/glossary-runtime.json
```

Download the glossary snapshot, then filter client-side by term name, slug, or description. No authentication.

## Example

```bash
npx hashtagweb3 glossary --search staking --limit 5
```

```bash
curl -sS https://hashtagweb3.com/data/glossary-runtime.json | head -c 2000
```

OpenAPI: https://hashtagweb3.com/openapi.json
