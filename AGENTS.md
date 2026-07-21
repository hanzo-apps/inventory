# Agent guide

Canonical instructions for this repo live in [`LLM.md`](./LLM.md) (and its
`CLAUDE.md` symlink). Read it before changing anything.

TL;DR: Stockroom — a dense inventory tracker with low-stock alerts. Vite + React
19 + `@hanzo/gui` + `@hanzo/iam` + `@hanzo/base`. Keep it minimal and real.
`@hanzo/gui` needs the react-native-web alias + Tamagui defines in
`vite.config.ts` and uses Tamagui LONGHAND props (tsc enforces this). One Base
collection, `items` — `schema.sql` is the data contract; keep it in lockstep with
`src/lib/stock.ts` + the views. Prove changes with `npm run build` (tsc + vite).
Never build a container image locally — Hanzo Cloud owns deploys.
