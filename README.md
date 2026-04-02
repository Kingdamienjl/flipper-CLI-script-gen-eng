# flipper-CLI-script-gen-eng V4

> **Authorized-use only**: This repository is intentionally restricted to benign keyboard automation demos for approved labs, classrooms, and testing environments where you have explicit permission.

## Safety policy

This project **does not** support and will actively block:
- stealth/hidden execution
- download-and-execute patterns
- credential collection
- persistence mechanisms
- remote shells/remote execution
- security tool disablement
- obfuscation/bypass/phishing behavior

All generated output is plain text keyboard macro content intended for harmless demos such as opening local apps and typing benign commands.

## V4 structure

- `cli/` command-line entrypoint and command handlers
- `lib/` parser, validation, safety, template loader, renderers, packing
- `templates/` benign keyboard automation templates
- `manifests/` template manifests and export manifests
- `profiles/` optional variable/profile defaults
- `projects/` saved project presets
- `payloads/generated/` generated macro text outputs
- `exports/` packed exports with checksum manifests
- `web/` lightweight browser UI assets
- `test/` parser, renderer, inheritance, and validation tests

## CLI usage

```bash
npm run list
node cli/index.js --search windows
node cli/index.js --preview windows-open-run-notepad
node cli/index.js --prompt "open calculator and type hello"
node cli/index.js --batch projects/demo-windows-project.json
node cli/index.js --project demo-windows-project
node cli/index.js --validate
node cli/index.js --pack demo-windows-project
```

### Supported options

- `--list-templates`
- `--search <text|os:windows|tag:demo>`
- `--preview <templateId>`
- `--prompt <benign request>`
- `--batch <projectFile>`
- `--project <projectPresetName>`
- `--validate`
- `--pack <projectPresetName>`

## Web UI

Open `web/index.html` in a browser for:
- template browser
- benign prompt box
- preview pane
- download/export buttons

## Development

```bash
npm test
npm run validate
```

## Authorized use statement

By using this tool, you confirm you are authorized to automate the target system and that your use is limited to legal, ethical, benign demonstrations.
