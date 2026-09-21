# Agent marketplace submissions — Hashtag Web3

Production discovery for integrators: **`/openapi.json`** and **`/.well-known/api-catalog.linkset.json`**. Data lives in **`/data/*.json`** (filter client-side). No hosted MCP, catalog REST, or OAuth on hashtagweb3.com.

## Canonical URLs

| Asset | URL |
|-------|-----|
| OpenAPI 3.1 | `https://hashtagweb3.com/openapi.json` |
| RFC 9727 linkset | `https://hashtagweb3.com/.well-known/api-catalog.linkset.json` |
| Agent manifest | `https://hashtagweb3.com/.well-known/agents.json` |
| Agent skills index | `https://hashtagweb3.com/.well-known/agent-skills/index.json` |
| LLM index | `https://hashtagweb3.com/llms.txt` |
| Developer portal | `https://hashtagweb3.com/developers` |
| CLI | `npx hashtagweb3 jobs --search solidity` |

## Where to publish (static-data friendly)

- **Agent Skills** — root `SKILL.md` / `skills/hashtagweb3/SKILL.md`; [`agentskills.io`](https://agentskills.io) or `npx agentskills publish`.
- **skills.sh** — `npx skills add vedangvatsa/Web3-Jobs`
- **ClawHub** — `public/.well-known/clawhub.json` (`status: not_hosted`; update listing when republishing)
- **ChatGPT Actions** — OpenAPI URL above (GET `/data/*` only)
- **Community plugin PRs** — `public/.well-known/plugin.json` + `SKILL.md`

Do **not** submit MCP registry PRs, Docker MCP images, or remote MCP URLs for this site — there is no JSON-RPC server on production.

## NLWeb schemamap (optional)

`https://hashtagweb3.com/schemamap.xml` — feed map pointing at `/data/*` snapshots and job RSS/XML feeds.

## Verification

```bash
npx tsx scripts/verify-agent-readiness.ts
npx tsx scripts/test-agent-readiness.ts
```
