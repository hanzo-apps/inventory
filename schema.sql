-- Hanzo Base schema for Stockroom — the `databaseSchema` DDL.
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- id/created/updated/owner/org itself, so they are never re-declared here.
-- Every row is stamped with the verified IAM owner+org and is org-scoped: Base
-- applies the list/view/create/update/delete rule `@request.auth.org_id = org`,
-- so a member of your org reads/writes the row and other orgs cannot see it.
--
-- Keep this in lockstep with what the app reads/writes
-- (src/lib/stock.ts + src/views/inventory.tsx · detail.tsx · alerts.tsx · manage.tsx).

-- Stock items — one row per SKU. `qty` is units on hand; when it falls to or
-- below `reorder_at` the item flags Low (amber) on the grid and in Alerts, and
-- at zero it flags Out. `reorder_at` is the reorder point / par level.
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku        TEXT    NOT NULL,               -- stock-keeping unit (e.g. WIDGET-001)
  name       TEXT    NOT NULL,               -- human-readable item name
  qty        INTEGER NOT NULL DEFAULT 0,     -- units on hand
  reorder_at INTEGER NOT NULL DEFAULT 0,     -- low-stock threshold (reorder point)
  location   TEXT    NOT NULL DEFAULT ''     -- bin / shelf / warehouse zone
);
