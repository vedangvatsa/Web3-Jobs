# Agent Marketplace & Registry Submissions Guide — Hashtag Web3

This document lists the submission manifests, endpoints, and exact steps to submit **Hashtag Web3 (`Web3-Jobs`)** across all 18+ major agent marketplaces, registries, and platforms.

---

## 1. Canonical Registries (The "npm" Layer for AI)

### A. Official MCP Registry (`registry.modelcontextprotocol.io`)
- **Submission Manifest**: `public/.well-known/mcp-registry-submission.json`
- **Target Repository**: [`modelcontextprotocol/registry`](https://github.com/modelcontextprotocol/registry)
- **PR Steps**:
  1. Fork `https://github.com/modelcontextprotocol/registry`
  2. Add `com.hashtagweb3.mcp.json` under `servers/` containing the content of `public/.well-known/mcp-registry-submission.json`.
  3. Submit PR titled `feat: add Hashtag Web3 MCP server`.

### B. Agent Skills Standard (`agentskills.io` / `SKILL.md`)
- **Manifest**: Root `SKILL.md`
- **Verification**: Conforms to frontmatter specification (`name`, `description`, `version`, `license`).
- **Publishing**: `npx agentskills publish` or register on [`agentskills.io`](https://agentskills.io).

### C. Vercel Skills Leaderboard (`skills.sh`)
- **Command**:
  ```bash
  npx skills add vedangvatsa/Web3-Jobs
  ```
- **CLI Registration**: Automatically resolves `SKILL.md` at repo root.

### D. ClawHub / OpenClaw (`clawhub.ai`)
- **Manifest**: `public/.well-known/clawhub.json`
- **Command**:
  ```bash
  npx clawhub publish
  ```
- **Web Registry**: Direct import via [`clawhub.ai`](https://clawhub.ai).

### E. Docker MCP Catalog (`hub.docker.com/mcp`)
- **Build Tag**: `hashtagweb3/mcp-server:latest`
- **Labeling**: `org.opencontainers.image.title="hashtagweb3-mcp"`
- **Publish**: `docker push hashtagweb3/mcp-server:latest` and register on Docker Hub MCP catalog.

---

## 2. First-Party Agent Stores & Marketplaces

### A. OpenAI / ChatGPT Apps & Custom GPT
- **AI Plugin Manifest**: `https://hashtagweb3.com/.well-known/ai-plugin.json`
- **OpenAPI Spec**: `https://hashtagweb3.com/openapi.json`
- **Action**: Add custom GPT at [`chatgpt.com/gpts`](https://chatgpt.com/gpts) with Action pointing to `https://hashtagweb3.com/openapi.json`.

### B. Anthropic / Claude Marketplace & Community Plugins
- **Skill File**: `SKILL.md`
- **Target Repositories**:
  - [`anthropics/claude-plugins-community`](https://github.com/anthropics/claude-plugins-community)
  - [`anthropics/skills`](https://github.com/anthropics/skills)
- **PR Steps**: Submit PR adding `hashtagweb3` plugin package pointing to `/.well-known/agent-plugin.json` and `SKILL.md`.

### C. Cursor & Cline MCP Marketplace
- **Server Card**: `https://hashtagweb3.com/.well-known/mcp/server-card.json`
- **Target Repo**: [`cline/marketplace`](https://github.com/cline/marketplace)
- **Configuration snippet for `.cursor/mcp.json` / `cline_mcp_settings.json`**:
  ```json
  {
    "mcpServers": {
      "hashtagweb3": {
        "url": "https://hashtagweb3.com/api/mcp",
        "transport": "streamable-http"
      }
    }
  }
  ```

### D. Grok (xAI) Plugin Marketplace & Agensi
- **Manifest**: `public/.well-known/grok-plugin.json`
- **Target Repositories**:
  - [`xai-org/plugin-marketplace`](https://github.com/xai-org/plugin-marketplace)
  - [`ZeroPointRepo/awesome-grok-bot`](https://github.com/ZeroPointRepo/awesome-grok-bot)
  - [`agensi.io/grok-marketplace`](https://agensi.io/grok-marketplace)

### E. Google Antigravity & Gemini CLI Extensions
- **Manifest**: `plugin.json` and `SKILL.md`
- **Docs**: `https://hashtagweb3.com/AGENTS.md`
- **Registration**: Add to Gemini CLI extension registry via `geminicli.com/docs/extensions`.

---

## 3. Automated Verification

Run local audit to verify all files before submitting:
```bash
node scripts/verify-agent-readiness.js
```
