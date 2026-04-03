# Safe Macro Generator V4

> Authorized-use only. This project is restricted to benign keyboard macro demos in environments where you have explicit permission.

## Safety boundaries

Blocked by design:
- hidden/stealth execution
- download-and-execute
- credential capture
- persistence
- remote shells
- disabling security tools
- obfuscation/phishing/bypass behavior

Outputs are plain-text Flipper/Ducky style macro files only.

## Install

```bash
npm install
```

## Quickstart (works as written)

```bash
npm run quickstart
```

This runs:
1. validation
2. template listing
3. preview generation
4. prompt generation
5. project generation
6. project pack export

## Common commands

```bash
npm run validate
npm run list
npm run search
npm run preview
npm run prompt
npm run batch
npm run project
npm run pack
npm run web
```

## Template coverage (benign examples)

- **Windows**
  - open run dialog + notepad
  - open PowerShell + `Get-Date`
- **Linux**
  - open terminal + `echo hello`
  - open terminal + `gedit`
- **macOS**
  - spotlight + Notes
  - spotlight + TextEdit

## Web UI

```bash
npm run web
```

Open `http://localhost:4173`.
The UI uses backend API routes that call the same generator logic as the CLI.

## Project packs

`npm run pack` creates:
- `exports/<project>-pack/payloads/<format>/...`
- `exports/<project>-pack/export-manifest.json` with metadata and SHA-256 checksums.

## V4 feature checklist

- stable template engine with `extends` / `compose` and circular guards
- template manifests with tags + requiredVars + benign risk level
- template search/filter by text, OS, and tags
- strict validation command for templates/manifests/profiles/projects
- benign fail-closed prompt parser
- project presets + project pack export flow
- export manifest metadata + artifact checksums
- Flipper and Ducky plugin renderers
- tests for parser/renderer/loader/validation/project-pack/search
- lightweight web UI backed by the same server-side generator logic as CLI

## Release verification

```bash
npm run release:verify
```
