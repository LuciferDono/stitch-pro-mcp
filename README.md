<p align="center">
  <h1 align="center">stitch-pro-mcp</h1>
  <p align="center">
    The intelligent MCP server for Google Stitch.<br/>
    Design systems. Accessibility. Responsive. React/Vue/Svelte. Auto-orchestration.<br/>
    <strong>18 tools. One prompt.</strong>
  </p>
  <p align="center">
    <a href="https://www.npmjs.com/package/stitch-pro-mcp"><img src="https://img.shields.io/npm/v/stitch-pro-mcp?style=flat-square&color=blue&label=npm" alt="npm version"></a>
    <a href="https://www.npmjs.com/package/stitch-pro-mcp"><img src="https://img.shields.io/npm/dm/stitch-pro-mcp?style=flat-square&color=blue" alt="npm downloads"></a>
    <a href="https://github.com/LuciferDono/stitch-pro-mcp/blob/master/LICENSE"><img src="https://img.shields.io/github/license/LuciferDono/stitch-pro-mcp?style=flat-square" alt="license"></a>
    <a href="https://github.com/LuciferDono/stitch-pro-mcp"><img src="https://img.shields.io/github/stars/LuciferDono/stitch-pro-mcp?style=flat-square" alt="stars"></a>
    <a href="https://github.com/LuciferDono/stitch-pro-mcp/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/LuciferDono/stitch-pro-mcp/ci.yml?style=flat-square&label=CI" alt="CI"></a>
    <a href="https://stitch.withgoogle.com"><img src="https://img.shields.io/badge/Google-Stitch-4285F4?style=flat-square&logo=google" alt="Google Stitch"></a>
    <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-compatible-green?style=flat-square" alt="MCP"></a>
    <a href="https://luciferdono.github.io/stitch-pro-mcp"><img src="https://img.shields.io/badge/docs-website-purple?style=flat-square" alt="docs"></a>
  </p>
  <p align="center">
    <a href="#quick-start">Quick Start</a> ·
    <a href="#tools">Tools</a> ·
    <a href="#examples">Examples</a> ·
    <a href="#architecture">Architecture</a>
  </p>
</p>

---

## The Problem

[Google Stitch](https://stitch.withgoogle.com) generates beautiful UI from text prompts. But it outputs **raw HTML** — no design system, no accessibility, no responsive breakpoints, no framework components.

Every existing Stitch MCP is a thin wrapper. Generate screen, get HTML, done.

**stitch-pro-mcp fills the gap between generation and production.**

| | Existing MCPs | stitch-pro-mcp |
|---|:---:|:---:|
| Generate screens | :white_check_mark: | :white_check_mark: |
| Design system enforcement | :x: | :white_check_mark: |
| WCAG 2.1 AA accessibility | :x: | :white_check_mark: |
| Responsive breakpoints | :x: | :white_check_mark: |
| React / Next.js output | :x: | :white_check_mark: |
| Vue 3 output | :x: | :white_check_mark: |
| SvelteKit output | :x: | :white_check_mark: |
| shadcn/radix/MUI mapping | :x: | :white_check_mark: |
| Multi-screen flows | :x: | :white_check_mark: |
| Auto-orchestration | :x: | :white_check_mark: |

## Quick Start

### 1. Get a Stitch API Key

Visit [stitch.withgoogle.com](https://stitch.withgoogle.com) and create an API key.

### 2. Install

```bash
# Run directly (no install)
npx stitch-pro-mcp

# Or install globally
npm install -g stitch-pro-mcp
```

### 3. Configure Your Editor

<details>
<summary><b>Claude Code</b></summary>

**Recommended (CLI):**

```bash
# Install globally first
npm install -g stitch-pro-mcp

# Add to Claude Code with API key
claude mcp add -e STITCH_API_KEY=your-api-key --transport stdio stitch-pro -- node $(npm root -g)/stitch-pro-mcp/dist/bin/cli.js
```

**Windows users:** Use the full path to the installed CLI:
```bash
claude mcp add -e STITCH_API_KEY=your-api-key --transport stdio stitch-pro -- node "C:/Users/YOUR_USER/AppData/Roaming/npm/node_modules/stitch-pro-mcp/dist/bin/cli.js"
```

> **Note:** MCP servers in Claude Code are configured in `~/.claude.json` (local scope), NOT in `~/.claude/settings.json`. Use `claude mcp add` to configure — it handles the correct file automatically.

</details>

<details>
<summary><b>Cursor</b></summary>

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "stitch-pro": {
      "command": "npx",
      "args": ["-y", "stitch-pro-mcp"],
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
      "args": ["-y", "stitch-pro-mcp"],
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
      "args": ["-y", "stitch-pro-mcp"],
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
      "args": ["-y", "stitch-pro-mcp"],
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
      "args": ["-y", "stitch-pro-mcp"],
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
      "args": ["-y", "stitch-pro-mcp"],
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
      "args": ["-y", "stitch-pro-mcp"],
      "env": { "STITCH_API_KEY": "your-api-key" }
    }
  }
}
```

</details>

> **Tip:** Set `STITCH_API_KEY` as a system environment variable and omit the `env` block entirely.

### Troubleshooting

<details>
<summary><b>Windows: "Connection closed" or server not connecting</b></summary>

On Windows, `npx` doesn't work directly as an MCP command. Use one of these approaches:

**Option A: Install globally + use `node` with full path (recommended)**
```bash
npm install -g stitch-pro-mcp
# Then configure with absolute path to the CLI:
# node C:/Users/YOUR_USER/AppData/Roaming/npm/node_modules/stitch-pro-mcp/dist/bin/cli.js
```

**Option B: Wrap `npx` with `cmd /c`**
```json
{
  "command": "cmd",
  "args": ["/c", "npx", "-y", "stitch-pro-mcp"]
}
```

</details>

<details>
<summary><b>Claude Code: MCP server not showing tools</b></summary>

1. MCP servers are configured in `~/.claude.json`, **not** `~/.claude/settings.json` or `~/.claude/.mcp.json`
2. Use `claude mcp add` CLI command to configure — it writes to the correct file
3. After adding, **restart Claude Code** for tools to appear
4. Verify with: `claude mcp list` — should show `stitch-pro: ✓ Connected`

</details>

<details>
<summary><b>Server starts but tools don't respond</b></summary>

Check for double-start: if you see `"Starting stitch-pro"` logged twice, you're on v0.1.0 which had a bug where the server started twice. Update to v0.1.2+:
```bash
npm install -g stitch-pro-mcp@latest
```

</details>

---

## Tools

### Smart (Auto-Orchestration)

| Tool | What It Does |
|------|-------------|
| **`sp_auto`** | The god tool. Describe what you want in plain English — auto-detects framework, library, theme, device type, and chains everything: design system → generation → a11y → responsive → conversion. One call. |
| **`sp_analyze`** | Feed it any HTML. Returns accessibility issues, responsiveness gaps, component mapping potential, and a prioritized tool chain recommendation. |
| **`sp_smart_convert`** | Like `sp_to_react`/`sp_to_vue`/`sp_to_svelte`, but auto-runs a11y fixes and responsive injection first. No manual chaining. |

### Generation

| Tool | What It Does |
|------|-------------|
| `sp_generate` | Generate a UI page with full pipeline — design system, a11y, responsive, framework conversion |
| `sp_flow` | Generate multi-screen flows (login → dashboard → settings) in one call |

### Design System

| Tool | What It Does |
|------|-------------|
| `sp_design_create` | Generate a complete design system from a brand description — colors, typography, spacing, rules |
| `sp_design_apply` | Apply a design system to existing HTML — CSS variable injection, font/color enforcement |

### Quality

| Tool | What It Does |
|------|-------------|
| `sp_a11y` | WCAG 2.1 AA audit with auto-fix — contrast, ARIA, semantics, touch targets, lang attr |
| `sp_responsive` | Inject Tailwind responsive breakpoints for mobile, tablet, desktop |

### Framework Conversion

| Tool | What It Does |
|------|-------------|
| `sp_to_react` | HTML → Next.js/React .tsx with `useState`, event handlers, component extraction |
| `sp_to_vue` | HTML → Vue 3 SFCs with `<script setup>`, `ref()`, `@event` bindings |
| `sp_to_svelte` | HTML → SvelteKit components with Svelte 5 `$state` runes |
| `sp_extract` | Map HTML elements to shadcn/radix/MUI components with confidence scoring |

### Project Management

| Tool | What It Does |
|------|-------------|
| `sp_create_project` | Create a new Stitch project. Returns the project ID needed for generation tools. |

### Listing

| Tool | What It Does |
|------|-------------|
| `sp_projects` | List all Stitch projects |
| `sp_screens` | List screens in a project |
| `sp_screen` | Get a screen's HTML source and image URL |

---

## Examples

### One prompt, full output

```
sp_auto("Dark SaaS pricing page in React with shadcn")

  Auto-detects: react, shadcn, dark theme, SaaS
  Auto-chains:
    1. Create dark design system
    2. Enrich prompt with brand tokens
    3. Generate page via Stitch API
    4. WCAG 2.1 AA audit + auto-fix
    5. Responsive breakpoint injection
    6. Convert to Next.js .tsx with shadcn

  → Returns: files[], dependencies{}, a11y report, timings
```

### Analyze before acting

```
sp_analyze(html)

  → sp_a11y (HIGH): missing lang, no <main>
  → sp_responsive (HIGH): fixed widths
  → sp_extract (MEDIUM): buttons + cards → shadcn
  → Suggested chain: [sp_a11y, sp_responsive, sp_extract, sp_to_react]
```

### Smart convert

```
sp_smart_convert(html, "vue", "radix")

  Auto-runs: a11y → responsive → extract → Vue 3 emit
  → Returns: .vue SFCs, WCAG compliant, responsive
```

### Manual tools

```
sp_to_react(html, { componentLibrary: "shadcn" })
sp_a11y(html, { autoFix: true })
sp_design_create({ name: "Acme", primaryColor: "#6366F1" })
```

---

## Architecture

```
User prompt
    │
    ▼
┌──────────────────────────────────────────┐
│            stitch-pro-mcp                │
│                                          │
│  ┌─ sp_auto (intent parser) ───────────┐ │
│  │  Detects: framework, library, theme │ │
│  │  device type, dark mode, industry   │ │
│  └─────────────────────────────────────┘ │
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

Pipeline is linear, processors are stateless, Stitch API call is injected — fully testable without hitting the API.

---

## Supported Platforms

| Platform | Status |
|----------|--------|
| [Claude Code](https://claude.com/claude-code) | :white_check_mark: |
| [Cursor](https://cursor.com) | :white_check_mark: |
| [VS Code (Copilot)](https://code.visualstudio.com) | :white_check_mark: |
| [Windsurf](https://codeium.com/windsurf) | :white_check_mark: |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | :white_check_mark: |
| [Codex (OpenAI)](https://openai.com/codex) | :white_check_mark: |
| [Antigravity](https://antigravity.dev) | :white_check_mark: |
| [OpenCode](https://github.com/opencode-ai/opencode) | :white_check_mark: |
| Any MCP-compatible client | :white_check_mark: |

---

## Development

```bash
git clone https://github.com/LuciferDono/stitch-pro-mcp.git
cd stitch-pro-mcp
npm install
npm run typecheck    # Type checking
npm run build        # Build to dist/
npm run dev          # Run in dev mode
npm test             # Run tests
```

## Tech Stack

| Dependency | Purpose |
|-----------|---------|
| `@modelcontextprotocol/sdk` | MCP server framework (stdio) |
| `@google/stitch-sdk` | Stitch API client |
| `parse5` | HTML → AST (no browser) |
| `axe-core` + `jsdom` | WCAG accessibility auditing |
| `zod` | Runtime input validation (all 18 tools) |
| `color` | Color math for design systems |
| `vitest` | 81 tests across 11 test suites |
| TypeScript | Full type safety, 29 source files, 4,700+ lines |

## Stats

- **18** MCP tools
- **7** pipeline processors
- **3** framework emitters (React, Vue, Svelte)
- **81** tests passing
- **104 KB** package size (compressed)
- **8** supported platforms

## Roadmap

- [x] ~~npm publish for `npx stitch-pro-mcp`~~
- [x] ~~CI/CD with GitHub Actions~~
- [x] ~~GitHub Pages docs site~~
- [ ] `sp_batch` — full app frontend in one call (layout + nav + pages + routing)
- [ ] Screenshot-to-code pipeline (screenshot → Stitch → framework output)
- [ ] Figma import via Stitch paste bridge
- [ ] LLM-powered design system generation (Claude API)
- [ ] Streamable HTTP transport for remote deployment

## Contributing

PRs welcome. Open an issue first for major changes.

## License

MIT
