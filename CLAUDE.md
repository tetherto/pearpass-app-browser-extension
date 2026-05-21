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

**Migration state:** the extension is fully on `@tetherto/pearpass-lib-ui-kit`. All screens and components use kit primitives. There is no `EXTENSION_DESIGN_VERSION` / `isV2()` runtime flag. A small number of legacy components remain in [src/shared/components/](src/shared/components/) (e.g. `Switch`, `SwitchWithLabel`, `TimerBar`) — do not grow that tree.

**Never use the `V2` suffix.** The suffix was a coexistence marker during the v1/v2 migration, which is now complete. All new files use their natural name.
