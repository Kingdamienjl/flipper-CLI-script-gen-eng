# flipper-CLI-script-gen-eng V4

> **Authorized-use only**: restricted to benign keyboard automation demos for approved internal labs, classrooms, and test environments where you have explicit permission.

## Safety boundaries (non-negotiable)

This project **blocks** and does not support:
- stealth/hidden execution
- download-and-execute
- credential capture
- persistence
- remote shells
- security-tool disablement
- obfuscation/bypass/phishing

Outputs are plain text keyboard macros only (Flipper-style or Ducky-style) for harmless demos.

## Install

```bash
npm install
```

## Quickstart

```bash
npm run validate
npm run list
npm run preview
npm run prompt
npm run project
npm run pack
```

## CLI examples

```bash
node cli/index.js --list-templates
node cli/index.js --search os:windows
node cli/index.js --search tag:benign
node cli/index.js --preview windows-open-run-notepad --format flipper --os windows
node cli/index.js --prompt "windows powershell get-date" --format ducky --os windows
node cli/index.js --batch projects/demo-batch.json
node cli/index.js --project demo-windows-project
node cli/index.js --validate
node cli/index.js --pack demo-windows-project
```

## Project packs

`--pack` generates:
- payload files under `exports/<project>-pack/`
- `export-manifest.json` containing `authorizedUseOnly`, `riskLevel=benign`, and SHA-256 checksums

## Web UI (thin backend reuse)

Run:

```bash
npm run web
```

Open `http://localhost:4173`.

UI includes:
- template browser + search
- prompt input
- vars JSON input
- format selector
- preview pane
- validation error area
- download/export actions

## V4 layout

- `cli/` command-line interface
- `lib/` core engine (loading, validation, parsing, generation, rendering)
- `templates/` benign macro templates
- `manifests/` template/export manifests
- `profiles/` profile defaults
- `projects/` project presets and batch files
- `payloads/generated/` generated outputs
- `exports/` packed project exports
- `web/` thin UI + API server
- `test/` automated tests

## Authorized use statement

By using this tool, you confirm legal authorization and benign lab/demo intent.
