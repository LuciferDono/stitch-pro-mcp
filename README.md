# stitch-pro

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
npm install -g stitch-pro
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
      "args": ["-y", "stitch-pro"],
      "env": { "STITCH_API_KEY": "your-api-key" }
    }
  }
}
```

</details>

<details>
<summary><b>Cursor</b></summary>

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "stitch-pro": {
      "command": "npx",
      "args": ["-y", "stitch-pro"],
      "env": { "STITCH_API_KEY": "your-api-key" }
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
      "args": ["-y", "stitch-pro"],
      "env": { "STITCH_API_KEY": "your-api-key" }
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
      "args": ["-y", "stitch-pro"],
      "env": { "STITCH_API_KEY": "your-api-key" }
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
      "args": ["-y", "stitch-pro"],
      "env": { "STITCH_API_KEY": "your-api-key" }
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
      "args": ["-y", "stitch-pro"],
      "env": { "STITCH_API_KEY": "your-api-key" }
    }
  }
}
```

</details>

<details>
<summary><b>Antigravity</b></summary>

```json
{
  "mcpServers": {
    "stitch-pro": {
      "command": "npx",
      "args": ["-y", "stitch-pro"],
      "env": { "STITCH_API_KEY": "your-api-key" }
    }
  }
}
```

</details>

<details>
<summary><b>OpenCode</b></summary>

```json
{
  "mcpServers": {
    "stitch-pro": {
      "command": "npx",
      "args": ["-y", "stitch-pro"],
      "env": { "STITCH_API_KEY": "your-api-key" }
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
| `sp_generate` | Generate a UI page — design system, a11y, responsive, framework conversion |
| `sp_flow` | Generate multi-screen flows (login → dashboard → settings) in one call |

### Design System

| Tool | Description |
|------|-------------|
| `sp_design_create` | Generate a design system from a brand description — colors, typography, spacing |
| `sp_design_apply` | Apply a design system to HTML — CSS variable injection, font/color enforcement |

### Quality

| Tool | Description |
|------|-------------|
| `sp_a11y` | WCAG 2.1 AA audit with auto-fix — contrast, ARIA, semantics, touch targets |
| `sp_responsive` | Inject Tailwind responsive breakpoints for mobile/tablet/desktop |

### Framework Conversion

| Tool | Description |
|------|-------------|
| `sp_to_react` | HTML → Next.js/React .tsx with useState, handlers, component extraction |
| `sp_to_vue` | HTML → Vue 3 SFCs with `<script setup>`, `ref()`, `@event` bindings |
| `sp_to_svelte` | HTML → SvelteKit with Svelte 5 `$state` runes |
| `sp_extract` | Map HTML → shadcn/radix/MUI components with confidence scoring |

### Listing

| Tool | Description |
|------|-------------|
| `sp_projects` | List all Stitch projects |
| `sp_screens` | List screens in a project |
| `sp_screen` | Get a screen's HTML and image |

## Architecture

```
User prompt
    │
    ▼
┌──────────────────────────────────────────┐
│              stitch-pro                  │
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

## Examples

### Generate a page with design system + React output

```
→ sp_design_create (brand: "Acme", personality: ["modern", "clean"])
→ sp_generate (framework: "react", componentLibrary: "shadcn", designSystemId: "...")
→ Returns: Next.js .tsx with shadcn components, useState, responsive, WCAG compliant
```

### Convert existing HTML to Vue

```
→ sp_to_vue (html: "<div class='...'>...</div>", componentLibrary: "radix")
→ Returns: Vue 3 SFC with <script setup>, ref() state, @event bindings
```

### Audit accessibility on any HTML

```
→ sp_a11y (html: "...", autoFix: true)
→ Returns: fixed HTML + violation report
```

## Development

```bash
git clone https://github.com/LuciferDono/stitch-pro-mcp-server.git
cd stitch-pro-mcp-server
npm install
npm run typecheck
npm run build
npm run dev
npm test
```

## Tech Stack

- **TypeScript** — 28 source files, full type safety
- **@modelcontextprotocol/sdk** — MCP server (stdio transport)
- **@google/stitch-sdk** — Stitch API client
- **parse5** — HTML → AST (no browser needed)
- **axe-core + jsdom** — WCAG accessibility auditing
- **Zod** — runtime validation for all 14 tools
- **color** — color math for design system generation

## Roadmap

- [ ] `sp_batch` — full app frontend in one call (layout + nav + pages + routing)
- [ ] Screenshot-to-code pipeline
- [ ] Figma import via Stitch bridge
- [ ] LLM-powered design system generation
- [ ] Streamable HTTP transport for remote deployment

## License

MIT
