# AGENTS.md — Smart Theme Switcher

## Project Overview

A VS Code extension that automatically changes the editor theme based on four modes: workspace (per-project), time of day (with sunrise/sunset support), favorites (manual or auto-rotation), and file language. Modes can be combined.

- **Name:** `themelab-switcher` (publisher: `AnthonyAndino`)
- **Stack:** TypeScript, VS Code Extension API (`vscode` module)
- **Entry:** `src/extension.ts` → `out/extension.js`
- **Activation:** `onStartupFinished`

## Folder Structure

```
├── src/
│   ├── extension.ts          # Main extension logic (all commands + modes)
│   └── test/
│       └── extension.test.ts # Mocha tests
├── assets/                   # Demo GIFs (workspace_mode.gif, language_mode.gif)
├── out/                      # Compiled JS output (gitignored)
├── node_modules/             # Dependencies (gitignored)
├── .vscode/
│   └── settings.json         # Local workspace settings
├── package.json              # Manifest, config, commands, scripts, deps
├── tsconfig.json             # TypeScript config (Node16, ES2022, strict)
├── eslint.config.mjs         # ESLint flat config
├── .gitignore                # node_modules, out, .vscode-test, *.vsix
└── .vscodeignore             # Files excluded from VSIX package
```

## Essential Commands

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile              # tsc -p ./

# Watch mode (auto-compile on changes)
npm run watch                # tsc -watch -p ./

# Run lint
npm run lint                 # eslint src

# Run tests (compiles + lints first)
npm test                     # vscode-test

# Pre-publish (compiles before vsix packaging)
npm run vscode:prepublish    # npm run compile

# Package VSIX (manual, not in scripts)
npx @vscode/vsce package
```

## Code Conventions

- **Naming:** `camelCase` for variables, functions, properties; `PascalCase` for types/interfaces
- **Indentation:** tabs
- **Semicolons:** required (`semi: warn` in ESLint)
- **Quotes:** single quotes preferred (default TypeScript)
- **Formatting:** ESLint enforced — `curly`, `eqeqeq`, `no-throw-literal`
- **Async:** `async/await` pattern throughout (no raw promises)
- **Error handling:** try/catch with silent fallback; no thrown exceptions in production paths
- **Configuration access:** always use `vscode.workspace.getConfiguration("smartTheme")` via `getSettings()` helper
- **State persistence:** `context.globalState` for runtime state (e.g., `favoriteIndex`)
- **Commands:** each command registered via `vscode.commands.registerCommand` with `smartTheme.` prefix
- **File boundaries:** all code in `src/extension.ts` (single-file extension, no submodules yet)

## Workflow

### Branch naming
- `feat/<description>` — new features
- `fix/<description>` — bug fixes
- `chore/<description>` — maintenance, version bumps
- `release/v<version>` — release branches

### Commit format
[Conventional Commits](https://www.conventionalcommits.org/):
```
feat: add random favorites rotation order and minutes interval unit
fix: resolve Doki Theme compatibility with UUID-based theme IDs
chore: bump version to 0.0.10 and update changelog
```

### VSIX releases
- Bump version in `package.json`
- Update `CHANGELOG.md` with release notes (English + Spanish)
- Package with `vsce package`
- Commit with `chore: bump version to X.Y.Z and update changelog`

## Things the Agent Should NOT Do

- **Do NOT touch** `.vscodeignore` without explicit request (controls what goes into VSIX)
- **Do NOT modify** `package.json` `engines.vscode` version without asking
- **Do NOT add new npm dependencies** without asking — this is a lightweight extension
- **Do NOT split `src/extension.ts`** into multiple files without design discussion first
- **Do NOT change** the `smartTheme.*` configuration property names — they are user-facing settings
- **Do NOT remove** the `150ms verification delay` in `setThemeDirect` — it's essential for Doki Theme compatibility
- **Do NOT add** external API calls beyond `api.sunrise-sunset.org` (for time mode) and `ip-api.com` (for location detection)
- **Do NOT use** `setTimeout` for anything beyond the 150ms theme verification delay and the 5s preview timer

## Domain Context

### Glossary
- **Mode:** one of `workspace`, `time`, `favorites`, `language` — controls which logic determines the theme
- **Rotation:** how favorites cycle — `manual` (by command) or `auto` (on interval)
- **Order:** `sequential` (cycle in list order) or `random` (pick different random)
- **Workspace theme:** a theme mapped to a specific folder/project name
- **Language theme:** a theme mapped to a VS Code language ID (e.g., `javascript`, `python`)

### Configuration properties (all under `smartTheme.*`)
| Property | Type | Purpose |
|---|---|---|
| `enabled` | boolean | Master toggle |
| `enabledModes` | string[] | Active modes |
| `favorites` | string[] | Favorite theme list |
| `favoritesRotation` | "manual"\|"auto" | Rotation mode |
| `favoritesOrder` | "sequential"\|"random" | Rotation order |
| `favoritesIntervalUnit` | string | Time unit for auto |
| `favoritesIntervalValue` | number | Interval magnitude |
| `workspaceThemes` | object | folder → theme map |
| `languageThemes` | object | langId → theme map |
| `morningTheme` | string | Time mode morning |
| `afternoonTheme` | string | Time mode afternoon |
| `nightTheme` | string | Time mode night |
| `enableNotification` | boolean | Toast on theme change |
| `latitude` | number\|null | For sunrise calc |
| `longitude` | number\|null | For sunset calc |

### Business rules
- Theme application follows mode priority in `applyTheme()`: disabled check → forced theme → favorites → workspace → time → language
- `enabledModes` with `["disabled"]` means the extension does nothing
- Sunrise/sunset API is called only when both `latitude` and `longitude` are set; otherwise falls back to fixed hours (6-12, 12-18, 18-6)
- Favorites auto-rotation uses `globalState` to track `favoriteIndex` and `favoriteLastChange` — ensures interval persists across sessions
- `resolveThemeId` prioritizes internal theme `id` over `label` (critical for Doki Theme compatibility)
- QuickPick theme preview: hover previews instantly, eye button triggers 5s timed preview with revert

## Environment

No external `.env` file or environment variables needed. The extension is self-contained.

### External services (read-only, no auth)
- `https://api.sunrise-sunset.org/json` — sunrise/sunset times (time mode)
- `http://ip-api.com/json/` — geo-location detection (time mode setup)
