# Hockair — design direction

Hockair is a competitive air-hockey platform (think chess.com for air hockey). The UI must feel like a
serious, polished product: calm, dense with useful information, confident typography. Not a gaming
"neon" template.

## Keep exactly

- **Brand colors** (`src/vars.css`): red `--rouge #e94560` is the single primary accent; blues
  `--bleu #16213e` / `--bleu-bg #121522` are the surfaces; cyan `--cyan` is a rare secondary accent
  (data highlights, "you" in comparisons). Gold `--gold` only for rewards/trophies.
- The **sidebar** (`src/components/Sidebar`), the **3D game** (`src/game`, `src/pages/Match`) and the
  **bot lobby** (`src/pages/Play`). Do not edit them.

## Banned

- Text glows, `text-shadow` neon, `-webkit-text-stroke`, rainbow gradients on text, pulsing borders,
  emoji as icons, ALL-CAPS paragraphs, 3+ accent colors on one screen.
- Hard-coded hex colors or `px` in new CSS: use tokens from `src/styles/tokens.css` and `rem`.
- Native unstyled controls when a kit component exists.

## Foundations

- Tokens: `src/styles/tokens.css` (surfaces `--surface-1..3`, borders, text levels, spacing
  `--space-*`, radius, shadows, motion). Fonts: Inter (body), Space Grotesk (`--font-display`, headings
  and big numbers, always `font-variant-numeric: tabular-nums` for figures).
- UI kit: `import { Button, Card, Badge, TextField, SegmentedControl, Tabs, PageContainer, PageHeader,
  EmptyState, Skeleton, StatTile, Avatar, ProgressBar, Modal } from '../../components/ui'`.
  Read `src/components/ui/*.jsx` for props. Every page starts with `<PageContainer>` + `<PageHeader>`.
- Icons: `@mui/icons-material` only.
- HTTP: `apiRequest(path, { method, body, formData })` from `src/api/apiClient.js` (adds the bearer
  token, throws `ApiError`). Also `isAuthenticated()`, `storeAuthToken()`, `clearAuthToken()`,
  `buildAssetUrl()`.
- i18n: `useLanguage()` from `LanguageContext` gives `translations`. Never write to `fr.json` /
  `en.json`. Put your keys in `src/i18n/locales/fr/<area>.json` and `src/i18n/locales/en/<area>.json`
  (deep-merged automatically; e.g. `{ "page": { "home": { ... } } }`). Placeholders and plurals:
  `formatTranslation` / `formatPluralTranslation` from `src/i18n/formatTranslation.js`.
- Bot roster / mallet skins / avatars can be reused from `src/game/bots.js`, `src/game/theme.js`,
  `src/components/BotAvatar`. Local progress (beaten bots, settings): `src/game/progress.js`.

## Layout & quality bar

- Content max width 75rem, generous but not wasteful spacing, 12-column feel via CSS grid.
- Clear hierarchy: one primary action per view (red button), secondary actions as `secondary`/`ghost`.
- Every data area has loading (Skeleton on the changing zone only), empty (EmptyState) and error
  states. Singular/plural handled for every counter.
- Subtle motion only (150–350ms, `--ease-out`), hover states on everything clickable, visible focus.
- Works from 20rem to wide desktop (stack columns under 64rem).
- Where the backend has no endpoint (leaderboard, stats history, challenges, news…), build a realistic
  local data module (`<area>Data.js`) with clearly named constants, shaped like a future API DTO.

## Code rules (enforced in review)

English identifiers, explicit names, `is/has` only for booleans, no magic literals (enums/consts),
no `!`/forced casts, no nested subscriptions, no logic in JSX beyond reading precomputed fields,
no comments that paraphrase code, Prettier style of the repo (single quotes, JSX single quotes,
2 spaces, trailing commas es5, 80 cols), imports ordered (eslint `import/order`).
