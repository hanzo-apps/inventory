# Stockroom

A dense inventory tracker with low-stock alerts — a real, buildable Hanzo app you
fork on [hanzo.app](https://hanzo.app) and deploy live on Hanzo Cloud.

Track every SKU by quantity and location, watch on-hand counts against reorder
points, and let low stock flag itself in **amber** before it becomes a stockout.

- **UI** — [`@hanzo/gui`](https://www.npmjs.com/package/@hanzo/gui) (the Hanzo
  design system) under Vite + React 19. 100% gui primitives — no Tailwind, no
  second kit.
- **Auth** — [`@hanzo/iam`](https://www.npmjs.com/package/@hanzo/iam), OAuth2
  **PKCE** against [hanzo.id](https://hanzo.id). No local passwords — IAM owns
  every credential interaction.
- **Data** — [`@hanzo/base`](https://www.npmjs.com/package/@hanzo/base), the
  IAM-native, org-scoped data plane. The `items` inventory is a real Base
  collection.

## The app

Four surfaces over one `items` collection:

- **Inventory** — a dense, sortable, searchable data-table of every SKU (SKU,
  item, location, on-hand, reorder point, status). Rows flag themselves: amber
  when on-hand is at/under the reorder point, red at zero.
- **Item detail** — status, on-hand vs reorder point and a suggested order size,
  plus the writers: receive/pick units, change the reorder point, delete.
- **Alerts** — every item at or below its reorder point (out first, then the
  deepest shortfall), each with a suggested order quantity.
- **Manage** — add a SKU with its starting count, reorder point and location.

## Stack (pinned)

| Package | Version |
| --- | --- |
| `react` / `react-dom` | `^19.2.4` |
| `@hanzo/gui` + `@hanzogui/config` | `7.3.0` |
| `@hanzo/iam` | `^0.13.1` |
| `@hanzo/base` | `^0.2.1` |
| `vite` | `^6` (`@vitejs/plugin-react`) |
| `typescript` | `5.9.3` |

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build  ->  dist/
npm run preview    # serve the production build (SPA fallback on)
```

Out of the box it runs against **live** Hanzo (hanzo.id + api.hanzo.ai) — no
config needed to see the sign-in flow. Copy `.env.example` to `.env` to point at
a different environment.

## Environment contract

Only `VITE_`-prefixed vars reach the browser (this is a static SPA — there is no
server). Defaults in parentheses.

| Var | Purpose |
| --- | --- |
| `VITE_HANZO_IAM_URL` (`https://hanzo.id`) | OIDC issuer. |
| `VITE_HANZO_CLIENT_ID` (`hanzo-app`) | IAM application (`<org>-<app>`). Its redirect-URI list must allow this deploy's `/auth/callback` — see **Ambient IAM**. |
| `VITE_HANZO_REDIRECT_URI` (`${origin}/auth/callback`) | PKCE redirect. |
| `VITE_HANZO_BASE_URL` (`https://api.hanzo.ai`) | Browser-reachable Hanzo Base data plane. Deploy injects the provisioned URL. |
| `VITE_HANZO_API_URL` / `VITE_HANZO_API_KEY` | Optional — only if the app calls the Hanzo LLM gateway. Unused by Stockroom; never commit a real key. |

## How auth works — ambient IAM

`login()` starts an OAuth2 **PKCE S256** redirect to hanzo.id; hanzo.id returns
to `/auth/callback`, where `handleCallback()` exchanges the code for tokens
(stored in `localStorage`, refresh-aware via `offline_access`). Every deployed
app is a static site at `<slug>.hanzo.app`; there is **no server token** — the
SPA authenticates the user in the browser and carries the resulting IAM JWT to
Base. "Ambient" means the app just reads the signed-in user via that token.

The one deploy requirement: the IAM client (`VITE_HANZO_CLIENT_ID`) must list
this origin's `/auth/callback` as an allowed redirect URI. Register a
`https://*.hanzo.app/auth/callback` wildcard on the shared client so every
forked app works, or register a dedicated `hanzo-<app>` client per template.

## How data works — Base from `schema.sql`

[`schema.sql`](./schema.sql) is the app's `databaseSchema` (SQL DDL). On publish,
Hanzo Cloud translates the `items` `CREATE TABLE` into a Hanzo Base collection
(`provisionBaseFromDDL`, additive + idempotent). Base manages
`id`/`created`/`updated`/`owner`/`org`, stamps `owner`+`org` from the verified
IAM principal, and scopes every row to the caller's org via the rule
`@request.auth.org_id = org` — a teammate in your org sees the row; other orgs
cannot. At runtime the views read/write that collection through
`@hanzo/base/react` (`useQuery`/`useMutation`) carrying the IAM token. Keep
`schema.sql` in lockstep with `src/lib/stock.ts` and the views.

## Deploy — Hanzo Cloud

[`hanzo.yml`](./hanzo.yml) declares a static build (`npm run build` → `dist/`,
served at `<slug>.hanzo.app`) plus the Base schema to provision and the env to
inject. Do **not** build a container image locally — Hanzo Cloud owns builds and
deploys. CI here only proves the template compiles green.

## Layout

```
src/
  main.tsx          entry
  providers.tsx     GuiProvider -> IamProvider -> BaseProvider(client=IAM-token)
  app.tsx           route (/auth/callback) + auth gate
  gui.config.ts     createGui(defaultConfig from @hanzogui/config/v5)
  iam.config.ts     IAM PKCE config
  env.ts            the VITE_ env contract, one place
  lib/base.ts       BaseClient carrying the IAM bearer token
  lib/stock.ts      Item type, status/severity/reorder math, the warehouse palette
  auth/callback.tsx PKCE return leg
  views/
    signed-out.tsx  landing + illustrative preview table
    home.tsx        shell: brand bar + tabs + KPI strip + detail leg
    inventory.tsx   the dense, sortable stock table
    detail.tsx      item detail + stock adjust / reorder point / delete
    alerts.tsx      low-stock alerts, most urgent first
    manage.tsx      add a SKU
    brand.tsx       the Stockroom mark
schema.sql          databaseSchema -> the `items` Base collection on publish
hanzo.yml           Hanzo Cloud build/deploy manifest
```
