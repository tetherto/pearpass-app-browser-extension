# pearpass-app-browser-extension

PearPass browser extension (Chrome MV3). React + TypeScript. Four build targets: action popup ([src/action/](src/action/)), content scripts ([src/content/](src/content/)) + in-page popups ([src/contentPopups/](src/contentPopups/)), injected page script ([src/inject/](src/inject/)), background service worker ([src/background/](src/background/)).

## UI: always use `@tetherto/pearpass-lib-ui-kit`

UI is built on `@tetherto/pearpass-lib-ui-kit`. All new UI — v2 redesigns of existing screens and net-new features — **must** use components from this kit. Do not roll custom buttons, inputs, modals, typography, or icons.

**Full guide:** the component catalog, props, styling conventions, and reference patterns live in [AGENTS.md](AGENTS.md) (canonical contributor doc, also loaded by Codex/Cursor). Claude Code's skill trigger loads the same content via [.claude/skills/use-ui-kit/SKILL.md](.claude/skills/use-ui-kit/SKILL.md) whenever you're editing `.tsx`/`.jsx` files.

**Hard rules:**
- If a component exists in the kit, use it. If it does not, raise it with the team before creating a local alternative.
- Do **not** add new files under [src/shared/components/](src/shared/components/) — that tree is legacy (v1) and should not grow.
- Style with `useTheme()` + `rawTokens` from the kit. No hardcoded hex colors or design-system spacing.
- Import icons from `@tetherto/pearpass-lib-ui-kit/icons` (133 available). Do not add new SVGs under `src/`.

**Migration state:** the extension is being migrated onto the kit. Today, only the `ThemeProvider` from the kit is wired (in [src/action/index.jsx](src/action/index.jsx)); every other UI component in the app still comes from the legacy tree at [src/shared/components/](src/shared/components/). Use the kit for all new UI; leave the v1 tree alone except as part of scoped migration work. Unlike the sibling desktop repo, this extension does **not** gate v1 vs v2 behind a `DESIGN_VERSION` / `isV2()` runtime flag.

**`V2` suffix is for coexistence only.** If a v1 file already exists for the component you're creating, add the `V2` suffix (e.g. `CreateVaultModalContentV2` alongside legacy `CreateVaultModalContent`). If the component is net-new with no v1 sibling, use its natural name — **no suffix**.
