---
name: get_events
description: Search upcoming global crypto conferences, hackathons, and developer summits by type and country.
---

# Discover Web3 Events & Conferences

Search upcoming global crypto conferences, hackathons, and developer summits by type and country.

## Endpoint

```
GET https://hashtagweb3.com/api/v1/events?type={type}&country={country}
```

## Authentication

None required. All Hashtag Web3 public API endpoints are unauthenticated and CORS-enabled.

## Example

```bash
curl -s "https://hashtagweb3.com/api/v1/events?type=conference&country&limit=5"
```
