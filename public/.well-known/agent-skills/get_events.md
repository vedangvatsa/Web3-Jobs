---
name: get_events
description: Search upcoming global crypto conferences, hackathons, and developer summits by type and country.
---

# Get Web3 Events

## Data source

```
GET https://hashtagweb3.com/data/events-runtime.json
```

Download the events snapshot, then filter client-side by `type`, country, or search text. No authentication.

## Example

```bash
npx hashtagweb3 events --type conference --limit 5
```

```bash
curl -sS https://hashtagweb3.com/data/events-runtime.json | head -c 2000
```

OpenAPI: https://hashtagweb3.com/openapi.json
