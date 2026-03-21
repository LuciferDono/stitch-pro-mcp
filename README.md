# stitch-pro-mcp-server

An intelligent MCP server for [Google Stitch](https://stitch.withgoogle.com) that turns raw AI-generated UI into production-ready frontend code.

**Stitch generates beautiful screens. We handle everything after that.**

Design system enforcement. WCAG accessibility. Responsive breakpoints. React/Vue/Svelte conversion. Component library mapping. All through a single MCP interface.

## Why

Every existing Stitch MCP is a thin wrapper — generate screen, get HTML, done. Nobody handles the gap between generation and production:

| Feature | Existing MCPs | stitch-pro |
|---------|--------------|------------|
| Generate screens | Yes | Yes |
| Design system enforcement | No | Yes — create brand tokens, enforce across all screens |
| Accessibility | No | Yes — WCAG 2.1 AA audit + auto-fix |
| Responsive | No | Yes — Tailwind breakpoint injection |
| React/Next.js output | No | Yes — .tsx with hooks, state, component extraction |
| Vue 3 output | No | Yes — SFCs with Composition API |
| SvelteKit output | No | Yes — Svelte 5 $state runes |
| Component mapping | No | Yes — shadcn/radix/MUI with confidence scoring |
| Multi-screen flows | No | Yes — generate entire app flows in one call |

## Quick Start

### 1. Get a Stitch API Key

Visit [stitch.withgoogle.com](https://stitch.withgoogle.com) and grab your API key.

### 2. Install

```bash
npm install -g stitch-pro-mcp-server
```

### 3. Configure Your Editor

<details>
<summary><b>Claude Code</b></summary>

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "stitch-pro": {
      "command": "npx",
      "args": ["-y", "stitch-pro-mcp-server"],
      "env": {
        "STITCH_API_KEY": "your-api-key"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Cursor</b></summary>

Add to `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "stitch-pro": {
      "command": "npx",
      "args": ["-y", "stitch-pro-mcp-server"],
      "env": {
        "STITCH_API_KEY": "your-api-key"
      }
    }
  }
}
```

</details>

<details>
<summary><b>VS Code (Copilot)</b></summary>

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "stitch-pro": {
      "command": "npx",
      "args": ["-y", "stitch-pro-mcp-server"],
      "env": {
        "STITCH_API_KEY": "your-api-key"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Windsurf</b></summary>

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "stitch-pro": {
      "command": "npx",
      "args": ["-y", "stitch-pro-mcp-server"],
      "env": {
        "STITCH_API_KEY": "your-api-key"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Gemini CLI</b></summary>

Add to `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "stitch-pro": {
      "command": "npx",
      "args": ["-y", "stitch-pro-mcp-server"],
      "env": {
        "STITCH_API_KEY": "your-api-key"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Codex (OpenAI)</b></summary>

Add to `~/.codex/config.json`:

```json
{
  "mcpServers": {
    "stitch-pro": {
      "command": "npx",
      "args": ["-y", "stitch-pro-mcp-server"],
      "env": {
        "STITCH_API_KEY": "your-api-key"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Antigravity</b></summary>

Add to your Antigravity MCP configuration:

```json
{
  "mcpServers": {
    "stitch-pro": {
      "command": "npx",
      "args": ["-y", "stitch-pro-mcp-server"],
      "env": {
        "STITCH_API_KEY": "your-api-key"
      }
    }
  }
}
```

</details>

<details>
<summary><b>OpenCode</b></summary>

Add to your OpenCode MCP config:

```json
{
  "mcpServers": {
    "stitch-pro": {
      "command": "npx",
      "args": ["-y", "stitch-pro-mcp-server"],
      "env": {
        "STITCH_API_KEY": "your-api-key"
      }
    }
  }
}
```

</details>

Or set `STITCH_API_KEY` as a system environment variable and omit the `env` block.

## Tools

### Generation

| Tool | Description |
|------|-------------|
| `stitch_pro_generate_page` | Generate a UI page with full pipeline — design system, a11y, responsive, framework conversion |
| `stitch_pro_generate_flow` | Generate multi-screen flows (login → dashboard → settings) in one call |

### Design System

| Tool | Description |
|------|-------------|
| `stitch_pro_design_system_create` | Generate a complete design system from a brand description — colors, typography, spacing, rules |
| `stitch_pro_apply_design_system` | Apply a design system to existing HTML — CSS variable injection, font/color enforcement |

### Quality

| Tool | Description |
|------|-------------|
| `stitch_pro_accessibility_audit` | WCAG 2.1 AA audit with auto-fix — contrast, ARIA, semantics, touch targets, lang attr |
| `stitch_pro_responsive_adapt` | Inject Tailwind responsive breakpoints for mobile/tablet/desktop |

### Framework Conversion

| Tool | Description |
|------|-------------|
| `stitch_pro_to_react` | HTML/Tailwind → Next.js/React components with useState, event handlers, component extraction |
| `stitch_pro_to_vue` | HTML/Tailwind → Vue 3 SFCs with `<script setup>`, `ref()`, `@event` bindings |
| `stitch_pro_to_svelte` | HTML/Tailwind → SvelteKit components with Svelte 5 `$state` runes |
| `stitch_pro_extract_components` | Map HTML elements to shadcn/radix/MUI components with confidence scoring |

### Listing

| Tool | Description |
|------|-------------|
| `stitch_pro_list_projects` | List all Stitch projects |
| `stitch_pro_list_screens` | List screens in a project |
| `stitch_pro_get_screen` | Get a screen's HTML source and image URL |

## Architecture

```
User prompt
    │
    ▼
┌──────────────────────────────────────────┐
│          stitch-pro-mcp-server           │
│                                          │
│  Pre-Generate                            │
│  └─ Design System Enrichment             │
│                                          │
│  Stitch API Call                         │
│  └─ project.generate() → raw HTML       │
│                                          │
│  Post-Generate                           │
│  ├─ Design System Enforcement (CSS vars) │
│  ├─ Accessibility Audit + Auto-Fix       │
│  └─ Responsive Breakpoint Injection      │
│                                          │
│  Convert (if framework !== html)         │
│  ├─ HTML → ComponentTree (AST-based)     │
│  ├─ Component Library Mapping            │
│  └─ Framework Emitter (React/Vue/Svelte) │
│                                          │
│  Output: production-ready components     │
└──────────────────────────────────────────┘
```

The pipeline is linear, processors are stateless, and the Stitch API call is injected — making the entire system testable without hitting the API.

## Examples

### Generate a page with design system + React output

```
"Generate a SaaS pricing page with three tiers"

→ stitch_pro_design_system_create (brand: "Acme", personality: ["modern", "clean"])
→ stitch_pro_generate_page (framework: "react", componentLibrary: "shadcn", designSystemId: "...")
→ Returns: Next.js .tsx files with shadcn Card, Button, Badge components, useState hooks, responsive layout, WCAG compliant
```

### Convert existing HTML to Vue

```
→ stitch_pro_to_vue (html: "<div class='...'>...</div>", componentLibrary: "radix")
→ Returns: Vue 3 SFC with <script setup>, ref() state, @event bindings
```

### Audit accessibility on any HTML

```
→ stitch_pro_accessibility_audit (html: "...", autoFix: true)
→ Returns: fixed HTML + violation report (what was found, what was fixed, what needs manual review)
```

## Development

```bash
git clone https://github.com/LuciferDono/stitch-pro-mcp-server.git
cd stitch-pro-mcp-server
npm install
npm run typecheck    # Type checking
npm run build        # Build to dist/
npm run dev          # Run in dev mode
npm test             # Run tests
```

## Tech Stack

- **TypeScript** — full type safety across 28 source files
- **@modelcontextprotocol/sdk** — MCP server framework (stdio transport)
- **@google/stitch-sdk** — Stitch API client
- **parse5** — HTML parsing to AST (no browser required)
- **axe-core + jsdom** — WCAG accessibility auditing
- **Zod** — runtime input validation for all 14 tools
- **color** — color space math for design system generation

## Roadmap

- [ ] `stitch_pro_batch_generate` — full app frontend in one call (layout + nav + pages + routing)
- [ ] Screenshot-to-code pipeline (feed a screenshot → Stitch → framework output)
- [ ] Figma import via Stitch's paste-to-Figma bridge
- [ ] LLM-powered design system generation (Claude API for brand → tokens)
- [ ] Plugin marketplace distribution (Claude Code, Cursor)
- [ ] Streamable HTTP transport for remote deployment

## License

MIT
