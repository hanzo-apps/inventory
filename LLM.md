# Stockroom (inventory-stockroom) — agent notes

A dense inventory tracker with low-stock alerts, forked from the canonical Hanzo
starter. Vite + React 19 + `@hanzo/gui` (UI) + `@hanzo/iam` (auth) + `@hanzo/base`
(data). Keep it REAL — every surface must build and run, no fabricated UI.

## The app

One org-scoped Base collection, `items(sku, name, qty, reorder_at, location)`,
behind four surfaces:

- **Inventory** (`src/views/inventory.tsx`) — a dense, sortable, searchable
  data-table; the only reader. Rows flag themselves via `statusOf`: amber when
  on-hand ≤ `reorder_at` (Low), red at zero (Out). Click a row → detail.
- **Item detail** (`src/views/detail.tsx`) — status, on-hand vs reorder point,
  suggested order size; the per-item writer: adjust qty (receive/pick), change
  the reorder point, delete (`useMutation('items','update'|'delete')`).
- **Alerts** (`src/views/alerts.tsx`) — `lowStock(items)`: Low/Out only, Out
  first then deepest deficit, each with `reorderQty`. Click → detail.
- **Manage** (`src/views/manage.tsx`) — the create writer: add a SKU, then jump
  back to Inventory.
- **Landing** (`src/views/signed-out.tsx`) — the honest public view; an
  illustrative preview table (same row styling as the real grid, not live data)
  plus the PKCE sign-in. This is the catalog thumbnail.
- `src/lib/stock.ts` — the `Item` type, the warehouse palette (`AMBER`/`RED`/
  `GREEN`/`PANEL`/`LINE`), `num`, `statusOf`/`statusRank`/`deficit`/`severity`,
  `reorderQty`, `lowStock`, `totalUnits`, `tint`. One place for stock logic.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order every Hanzo
  surface ships: `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider`
  gets a `BaseClient` carrying the IAM access token; rebuilt when the token
  changes (`src/lib/base.ts` `baseAs`). That single seam scopes every
  `useQuery`/`useMutation` to the signed-in user's org.
- **One query** — `Home` owns `useQuery<Item>('items')` and passes `items` +
  `refetch` down; writers `refetch()` after each mutation (realtime off — one
  simple path). `Detail` is keyed by `item.id` so it remounts per item.
- **Env is one place** (`src/env.ts`), read from `import.meta.env.VITE_*`. The
  IAM client id is `VITE_HANZO_CLIENT_ID` (fallback `hanzo-app`).
- **UI is one system** — `@hanzo/gui` primitives only (no second kit, no
  Tailwind).

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line; the in-browser builder runtime can't do this, which is the whole
  reason this ships as a real repo): (1) alias `react-native` →
  `react-native-web`, (2) `define` `process.env.TAMAGUI_TARGET` / `NODE_ENV` /
  `__DEV__`, (3) `dedupe` react/react-dom/react-native-web. No Tamagui compiler,
  no `one`, no Expo — the optimizer is a perf pass, not a correctness one.
- **`@hanzo/gui` props are Tamagui LONGHAND** with this v5 config:
  `alignItems`/`justifyContent`/`backgroundColor`/`padding`/`paddingHorizontal`/
  `paddingVertical`/`alignSelf`/`borderRadius`/`borderLeftWidth`/`textAlign` —
  NOT the `items`/`justify`/`bg`/`p`/`px`/`py`/`self`/`rounded`/`text`
  shorthands. Shorthands pass at runtime but FAIL `tsc`. `Button` and pressable
  stacks use `onPress`; `Input` uses `value`/`onChangeText`/`onSubmitEditing`.
  Table rows / alert cards are pressable `XStack`s (`onPress` + `hoverStyle` +
  `pressStyle` + `cursor`). Status hues are raw hex (`#f59e0b`, hex8 tints like
  `#f59e0b26`) — Tamagui accepts them.
- **PKCE storage is `localStorage`** (not sessionStorage) so the verifier/state
  survive the round-trip to hanzo.id.
- **`schema.sql` is the data contract.** It is the `databaseSchema` DDL the
  deploy translates into the `items` Base collection (`provisionBaseFromDDL`).
  Numeric fields (`qty`, `reorder_at`) can arrive as strings — always read them
  through `num()`. Keep the DDL in lockstep with `src/lib/stock.ts` + the views.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app` from
  object storage. No server process.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the `items`
  collection (org-scoped via `@request.auth.org_id = org`, IAM-native). Runtime
  read/write is browser → `VITE_HANZO_BASE_URL` with the IAM token.
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_HANZO_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback`. The deploy provisions a per-app `hanzo-<app>` client.

## Proven

`npm run typecheck` (tsc --noEmit) clean · `npm run build` (tsc + vite) →
`dist/` · the landing renders under headless Chrome at 1280×800 with zero
console errors, showing the branded hero + the amber/red preview stock table.
`login()` performs a real PKCE S256 redirect to hanzo.id.

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally).
