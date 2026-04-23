# UI conventions for pearpass-app-browser-extension

This is the browser extension (Chrome MV3) for PearPass. It's written in React + TypeScript. The extension has four build targets — the action popup ([src/action/](src/action/)), content scripts ([src/content/](src/content/)) and their in-page popups ([src/contentPopups/](src/contentPopups/)), an injected page script ([src/inject/](src/inject/)), and the background service worker ([src/background/](src/background/)). UI is built on the shared component library `@tetherto/pearpass-lib-ui-kit`.

This document is for **anyone contributing UI** to the repo — new hires, current engineers, and AI coding assistants (Claude Code, Cursor, Codex, etc.). It captures the component catalog, styling conventions, file-naming rules, and patterns we use when building UI in this extension. Read it once before your first UI change; keep it open when you're in doubt.

## Migration state — v2 is the target

UI is being migrated onto `@tetherto/pearpass-lib-ui-kit`. For **new UI work** — v2 redesigns of existing screens and net-new features — use the kit. Today the only kit wiring in this repo is the `ThemeProvider` in [src/action/index.jsx](src/action/index.jsx); every actual component rendered in the UI still comes from the legacy tree at [src/shared/components/](src/shared/components/). That tree keeps working while the migration is in progress — do not delete anything from it as part of v2 work.

Note: unlike the sibling desktop repo, this extension does **not** currently gate v1 vs v2 behind a `EXTENSION_DESIGN_VERSION` / `isV2()` runtime flag. Kit-based components render directly at their call sites. If a flag is added later, this doc will describe it.

## File naming: when to use the `V2` suffix

The `V2` suffix is a **coexistence marker**, not a design marker. Use it only when a v1 sibling already exists:

- **A v1 file already exists** for this component/screen → create a new file with the `V2` suffix next to it (e.g. v1 `CreateVaultModalContent.jsx` → new `CreateVaultModalContentV2.tsx`). Both live in the tree during migration; the branching happens at the call site.
- **No v1 equivalent exists** (net-new feature, net-new component) → create the file with its natural name, **no `V2` suffix**. The suffix would just be noise.

Before creating a file, glob the directory for the base name without the suffix. If nothing comes up, skip the suffix.

## Where UI lives in this repo

- [src/action/pages/](src/action/pages/) — top-level screens for the action popup (WelcomePage, Settings, RecordDetails, RecordList, CreatePasskey, SelectPasskey, AuthenticatorView, AddDevice, NonSecureWarning).
- [src/action/containers/](src/action/containers/) — stateful composed UI used by those pages.
- [src/contentPopups/views/](src/contentPopups/views/) — in-page popups rendered by the content script (Autofill, LoginDetect, PasswordGenerator, PasswordSuggestion, Logo).
- [src/shared/components/](src/shared/components/) — **legacy v1 custom components** (do not grow; see rules below).
- [src/shared/containers/](src/shared/containers/) — shared stateful UI (Sidebar, PassPhrase, CreateVaultModalContent, etc.).

## Golden rules

1. **Check the catalog below before creating any component.** If it exists in the kit, use it — never wrap or reimplement.
2. **All new UI goes through the kit.** Any new `.tsx`/`.jsx` file — suffixed or not — must import from `@tetherto/pearpass-lib-ui-kit`, not from [src/shared/components/](src/shared/components/).
3. **Never add variants under [src/shared/components/](src/shared/components/)** (`ButtonPrimary`, `ButtonSecondary`, `ButtonRoundIcon`, `ButtonFilter`, `ButtonFolder`, `ButtonCreate`, `ButtonLittle`, `ButtonSingleInput`, `ButtonPlusCreateNew`, `InputPearPass`, `InputPasswordPearPass`, `InputField`, `InputFieldPassword`, `InputSearch`, etc.). That tree is legacy; the kit's `Button` takes variants.
4. **Style with Tailwind utilities mapped to kit tokens** — `bg-surface-primary`, `text-text-primary`, `border-border-primary`, etc. Use `useTheme()` / `rawTokens` only when a value is needed in JS. No hardcoded hex colors or px spacing for design-system values.
5. **Icons come from the kit.** `@tetherto/pearpass-lib-ui-kit/icons` has 133 icons. Do not add new SVGs under `src/`.
6. **If the kit lacks something you need, stop and ask the user.** Don't silently roll a custom component.

## Component catalog (33 components)

Import pattern: `import { ComponentName } from '@tetherto/pearpass-lib-ui-kit'`

### Actions
- `Button` — all CTAs. Takes variants; use instead of `ButtonPrimary`, `ButtonSecondary`, `ButtonRoundIcon`, `ButtonLittle`, `ButtonFilter`, `ButtonFolder`, `ButtonSingleInput`, `ButtonCreate`, `ButtonPlusCreateNew`.
- `Pressable` — low-level pressable wrapper for custom interactive elements.
- `Link` — text links.

### Forms
- `Form` — form wrapper with validation.
- `InputField` — text input. Use instead of legacy `InputPearPass` / `InputField`.
- `PasswordField` — password input with strength indicator. Use instead of legacy `InputPasswordPearPass` / `InputFieldPassword`.
- `SearchField` — search input. Use instead of legacy `InputSearch`.
- `SelectField` — dropdown select. Use instead of legacy `Select`.
- `Dropdown` — low-level dropdown primitive.
- `TextArea` — multiline text input.
- `Checkbox`
- `Radio` — use instead of legacy `RadioOption` / `RadioSelect`.
- `ToggleSwitch` — use instead of legacy `Switch` / `SwitchWithLabel`.
- `Slider`
- `DateField`
- `AttachmentField`
- `UploadField`
- `MultiSlotInput` — split inputs for OTP / recovery codes. Use instead of custom `OtpCodeField`.
- `FieldError` — inline field validation error.

### Typography
- `Title` — headings.
- `Text` — body text.

### Layout / surfaces
- `Dialog` — modals. Use instead of custom `ModalCard` / `ModalHeader` / `PopupCard` wrappers.
- `NativeBottomSheet` — bottom sheets.
- `PageHeader` — top-of-page header.
- `ItemScreenHeader` — item-detail header.
- `Breadcrumb`
- `ListItem`
- `NavbarListItem`
- `ContextMenu`

### Feedback
- `AlertMessage` — inline alerts.
- `Snackbar` — toast-style notifications.
- `PasswordIndicator` — standalone password strength meter.
- `RingSpinner` — loading spinner.

### Type exports
- `ThemeColors`, `Theme`, `ThemeType`, `RawTokens`
- `PasswordIndicatorVariant` — `'vulnerable' | 'decent' | 'strong' | 'match'`

Import types with `import type { ... } from '@tetherto/pearpass-lib-ui-kit'`.

## Component props (15 most-used)

Required props have no `?`. **Always include a test ID on interactive components** — see the "Test IDs" section below for which prop to use per component.

- **Button** — `variant: 'primary' | 'secondary' | 'tertiary' | 'destructive'`, `size: 'small' | 'medium'`, `onClick`, `children`, `type?: 'button' | 'submit'`, `disabled?`, `isLoading?`, `iconBefore?`, `iconAfter?`, `data-testid?`. Icon-only buttons need `aria-label`.
- **Dialog** — `title` (ReactNode), `onClose?`, `open?`, `footer?`, `children?`, `closeOnOutsideClick?`, `hideCloseButton?`, `trapFocus?`, `initialFocusRef?`, `testID?`, `closeButtonTestID?`. Put action buttons in `footer`.
- **InputField** — `label`, `value`, `onChange?: (e) => void`, `placeholder?`, `error?: string`, `inputType?: 'text' | 'password'`, `disabled?`, `readOnly?`, `copyable?`, `onCopy?`, `leftSlot?`, `rightSlot?`, `testID?`.
- **PasswordField** — `label`, `value`, `onChange?`, `placeholder?`, `error?`, `passwordIndicator?: 'vulnerable' | 'decent' | 'strong' | 'match'`, `infoBox?: string`, `copyable?`, `testID?`.
- **SearchField** — `value`, `onChangeText` (yes, this one is still current), `placeholderText?`, `size?: 'small' | 'medium'`, `testID?`.
- **Form** — `children`, `onSubmit?`, `noValidate?`, `testID?`. Wrap fields here; pair with `useForm` from `@tetherto/pear-apps-lib-ui-react-hooks`.
- **Text** — `children`, `as?: 'p' | 'span'`, `variant?: 'label' | 'labelEmphasized' | 'body' | 'bodyEmphasized' | 'caption'`, `color?`, `numberOfLines?`, `data-testid?`.
- **Title** — `children`, `as?: 'h1' | 'h2' | ... | 'h6'`, `data-testid?`.
- **AlertMessage** — `variant: 'info' | 'warning' | 'error'`, `size: 'small' | 'medium' | 'big'`, `title`, `description`, `actionText?`, `onAction?`, `testID?`, `actionTestId?`.
- **ToggleSwitch** — `checked?`, `onChange?: (b: boolean) => void`, `label?`, `description?`, `disabled?`, `data-testid?`.
- **Checkbox** — same shape as `ToggleSwitch` (uses `data-testid`).
- **Radio** — `options: Array<{value, label?, description?, disabled?}>`, `value?`, `onChange?: (v: string) => void`, `testID?`.
- **SelectField** — `label`, `value?`, `placeholder?`, `onClick?` (opens dropdown), `error?`, `disabled?`, `leftSlot?`, `rightSlot?`, `testID?`.
- **TextArea** — `value`, `onChange?`, `label?`, `placeholder?`, `error?`, `disabled?`, `testID?`.
- **Link** — `children`, `href?`, `isExternal?`, `onClick?`, `data-testid?` (and standard `<a>` attributes).

For components not listed, open `node_modules/@tetherto/pearpass-lib-ui-kit/dist/components/<Name>/types.d.ts`.

### Test IDs — `testID` vs `data-testid`

Always include a test ID on anything a user interacts with (buttons, fields, toggles, dialogs). Which prop depends on the component:

- **`testID`** — components that declare it explicitly: `Dialog` (+ `closeButtonTestID`), `Form`, `InputField`, `PasswordField`, `SearchField`, `SelectField`, `TextArea`, `Radio`, `AlertMessage` (+ `actionTestId`).
- **`data-testid`** — components that extend native HTML and don't redeclare it: `Button`, `ToggleSwitch`, `Checkbox`, `Link`, `Pressable`, `Text`, `Title`.

Rule of thumb: try `testID` first; if TypeScript rejects it, use `data-testid`. When editing an existing file, follow the naming pattern already there.

### Prop naming — modern vs. deprecated (important)

The kit recently renamed several field props. **Use the modern names in new code:**

| Use | Not (deprecated) |
| --- | --- |
| `onChange` (receives `ChangeEvent`) | `onChangeText` (receives string) |
| `placeholder` | `placeholderText` |
| `error` (string) | `errorMessage` + `variant` |

The deprecated props still work for now but will be removed.

**Exception:** `SearchField` still uses `onChangeText` + `placeholderText` — those aren't deprecated there. `testID` is current everywhere.

## Styling

New UI is styled with **Tailwind utility classes**. The kit ships `@tetherto/pearpass-lib-ui-kit/tailwind.css` (already imported in [src/index.css](src/index.css)), which registers its color tokens with Tailwind v4's `@theme inline`. Standard utilities like `bg-surface-primary`, `text-text-primary`, `border-border-primary` therefore resolve against the design system and follow `data-theme` switches automatically. Tailwind is enabled in every UI build via the `@tailwindcss/vite` plugin in [vite.config.main.js](vite.config.main.js).

**Prefer Tailwind classes for layout and static styling.** Reach for `useTheme()` / `rawTokens` only when a value has to come from JS (e.g. a kit-component prop that takes a number, or a computed style).

```tsx
<div className="bg-surface-primary border border-border-primary rounded-[8px] p-[24px] gap-[12px]">
  <Text className="text-text-primary">…</Text>
</div>
```

### Kit color classes (from the kit's `tailwind.css`)

Usable with `bg-*`, `text-*`, `border-*` prefixes:

- **Surfaces:** `background`, `surface-primary`, `surface-hover`, `surface-secondary`, `surface-elevated-on-interaction`, `surface-disabled`, `surface-destructive`, `surface-destructive-elevated`, `surface-error`, `surface-warning`, `surface-search-field`
- **Accents:** `primary`, `secondary`, `accent-hover`, `accent-active`, `focus-ring`, `on-primary`
- **Text (use with `text-*`):** `text-primary`, `text-secondary`, `text-tertiary`, `text-disabled`, `text-search-field`, `link-text` — note these are the full token names, so the utility class is e.g. `text-text-primary`, `text-link-text`
- **Borders (use with `border-*`):** `border-primary`, `border-secondary`, `border-search-field` — utility is e.g. `border-border-primary`

### Spacing / radius / font-size aren't auto-generated Tailwind utilities

The kit registers only **color** tokens with `@theme inline`. Spacing (`--spacing2` … `--spacing48`), radius (`--radius8` … `--radius26`), and font-size (`--font-size12` … `--font-size28`) live on `:root` as CSS vars but don't produce Tailwind utility classes. Use them as arbitrary values — `p-[var(--spacing24)]`, `rounded-[var(--radius8)]`, `text-[var(--font-size14)]` — or pull from `rawTokens` in JS when needed.

### `rawTokens` — flat, numeric-suffixed keys (not nested)

- Spacing: `spacing2`, `spacing4`, `spacing6`, `spacing8`, `spacing10`, `spacing12`, `spacing16`, `spacing20`, `spacing24`, `spacing32`, `spacing40`, `spacing48` (all `number`, multiply with `${n}px`)
- Radius: `radius8`, `radius16`, `radius20`, `radius26`
- Font size: `fontSize12`, `fontSize14`, `fontSize16`, `fontSize24`, `fontSize28`
- Font family: `fontPrimary` (`"Inter"`), `fontDisplay` (`"Humble Nostalgia"`)
- Weight: `weightRegular` (`"400"`), `weightMedium` (`"500"`)

### `theme.colors` — common keys

`colorSurfacePrimary`, `colorSurfaceHover`, `colorBorderPrimary`, `colorBorderSecondary`, `colorTextPrimary`, `colorTextSecondary`, `colorTextTertiary`, `colorLinkText`. If you need one you haven't seen, inspect the `ThemeColors` type from `@tetherto/pearpass-lib-ui-kit`.

### When hardcoded values are OK

Tokens cover the design-system primitives. Feature-specific layout values (a card's `maxWidth: '500px'`, a one-off `padding: '55px 0'`) are fine as literals — these aren't design tokens. **Rule of thumb:** if the value corresponds to a semantic design decision (spacing step, brand color, radius), it must come from a token.

## Icons

```tsx
import { Add, Download, Folder, OpenInNew } from '@tetherto/pearpass-lib-ui-kit/icons'
```

133 icons, mostly Material Design, with style variants as suffixes: `Filled`, `Outlined`, `Round`, `Sharp`, `Tone` (e.g. `LockFilled`, `InfoOutlined`, `KeyboardArrowRightRound`). If a name has no suffix, it exists as a single variant.

**Commonly needed** (check these first before browsing):

- **Actions:** `Add`, `Download`, `ContentCopy`, `Share`, `Send`, `Swap`, `UploadFileFilled`
- **Folder / organization:** `Folder`, `FolderOpen`, `FolderCopy`, `CreateNewFolder`, `Layers`
- **Navigation / arrows:** `KeyboardArrowRightFilled`, `KeyboardArrowRightRound`, `KeyboardArrowLeftFilled`, `ExpandMore`
- **Status / feedback:** `InfoOutlined`, `ReportProblemRound`, `ErrorFilled`, `Check`, `DoneAll`, `CheckBox`
- **Security:** `LockFilled`, `Key`, `SecurityFilled`, `Fingerprint`, `TwoFactorAuthenticationFilled`
- **External / misc:** `ImportOutlined`, `OpenInNew`

**Discovering others:** `ls node_modules/@tetherto/pearpass-lib-ui-kit/dist/icons/components/ | grep -i <keyword>` — names are PascalCase, grep is case-insensitive friendly.

Product-specific illustrations (e.g. [src/shared/svgs/authenticatorIllustration/](src/shared/svgs/authenticatorIllustration/), [src/shared/svgs/logoLock/](src/shared/svgs/logoLock/)) are not design-system icons and may stay under `src/`.

## Anti-patterns to avoid

When creating new UI or touching a v2 file, do **not**:

- Add a new file under [src/shared/components/](src/shared/components/) for a Button/Input/Modal variant.
- Import `InputPearPass`, `InputPasswordPearPass`, `InputFieldPassword`, any `Button*` variant, `Switch` / `SwitchWithLabel`, `ModalCard` / `ModalHeader` / `PopupCard`, `OtpCodeField`, `RadioOption` / `RadioSelect`, or `Select` from [src/shared/components/](src/shared/components/) into any new file — swap to the kit equivalents.
- Add a `V2` suffix to a net-new file that has no v1 sibling. Suffix is only for migration coexistence.
- Use native `<button>`, `<input>`, or `<dialog>` in production code (tests are fine).
- Hardcode hex colors, brand radii, or design-system spacing — use `rawTokens` and `theme.colors`. (Feature-specific layout literals like `maxWidth: '500px'` are fine.)
- Add new SVG files under `src/` when the kit's icons subpath covers them.
- Introduce `styled-components`. Style with Tailwind utilities (plus `rawTokens` in JS when needed). `styled-components` is still in `package.json` but not used in `src/` — keep it that way.

When editing a v1 file and you spot these patterns, mention them to the user but **don't do drive-by rewrites** unless asked — v1 migration is scoped work.

## When the kit truly lacks something

1. Confirm by grepping `node_modules/@tetherto/pearpass-lib-ui-kit/dist/components/` for the concept.
2. Check if a composition of existing kit primitives covers it (e.g. `Pressable` + `Text` + tokens).
3. If still missing, surface it to the user: "The kit doesn't export X — options are (a) compose from Y + Z, (b) request X be added upstream, (c) temporary local component. Which?" Do not silently create (c).
