# THOTH — Hardening Roadmap

10 milestones from the July 2026 product audit, organized into 5 phases + a
prerequisite. Rule for the whole roadmap: **no new modules** — every sprint
hardens surface that already exists. Each sprint ends with the app running
and verified in **live mode** (not demo).

Audit context: 243 TS files / ~94k lines / ~98 tables / ~100 screens.
Key findings: mock AI in flagship screens, zero pagination, no validation
layer, silent failures, permissions not enforced in UI, documents can't
leave the system, no offline, realtime unused, monolithic pages,
demo/live shape-drift risk.

---

## Phase 0 — SAFETY NET (prerequisite, ~2–3 days)

Everything below touches `src/lib/data-source.ts` — the one file every
screen depends on. The genericization breakage happened without a net;
this phase prevents a repeat.

- Vitest installed; first unit tests on money math (totals, tax).
- Playwright smoke test: login → create quotation → appears in list (live mode).
- GitHub Actions CI: typecheck + tests block merge.
- Sentry wired into the app shell.

**Done when:** CI is red if the smoke test fails.

---

## Phase 1 — TRUST (the adapter layer)

### Sprint H1 — Loud errors (M4) · 2–3 days
- `data-source.ts`: every Supabase call throws a typed `DataError` on failure — no more silent `null` returns.
- One global ErrorBoundary + one toast system (unify the ~24 partial implementations).
- Sentry captures every thrown DataError with context (table, op, workspace).

**Done when:** with network killed in devtools, every save action shows an
error toast; nothing silently no-ops.

### Sprint H2 — Pagination + caching (M2) · 3–5 days
- Add TanStack Query as the fetch layer.
- Adapter `list()` gains `{ page, pageSize, orderBy, filters }` → `.range()` server-side.
- Convert the 5 heaviest screens first: Inventory, Products, FinanceInvoices, SalesOrders, Activity.
- Seed script generating 100k rows to prove it.

**Done when:** Inventory with 100k stock movements loads under 1 second.

### Sprint H3 — Validation (M3) · 3–4 days
- `src/lib/schemas/` — one zod schema per entity; adapter `create/update` parses before writing.
- Money-touching forms first: quotations, invoices, payments, POS, payroll.
- Inline field errors on forms (not just toast).

**Done when:** it is impossible to save a negative quantity, malformed
price, or empty required field on any money form.

---

## Phase 2 — CONTROL

### Sprint H4 — Permission enforcement (M7) · 3–4 days
- `usePermission()` hook reading the UsersAccess role model.
- Wrap sidebar nav + every mutating button (hide or disable per role).
- RLS audit: script that lists all ~98 tables against their policies; SQL/pgTAP test proving workspace A cannot read workspace B on every table.

**Done when:** a viewer-role account sees no edit buttons anywhere, and the
cross-tenant read test passes on all tables.

---

## Phase 3 — REACH

### Sprint H5 — Documents out (M6) · 4–5 days
- Print-quality PDF for Quotation + Invoice (bilingual layout).
- `send-email` edge function (Resend) + WhatsApp deep-link share (`wa.me` + signed doc URL).
- Generated documents stored in Supabase Storage with signed URLs.

**Done when:** a quotation reaches a real phone via WhatsApp and a real
inbox as a PDF attachment.

### Sprint H6 — Arabic completion (M5) · 2–4 days
- **Note:** LanguageContext + `dir=rtl` already exist and 98 pages consume
  it — this is an audit/completion sprint, not a build.
- Script to detect hardcoded English strings in JSX; translate the misses.
- Fix RTL breakages: icon mirroring, table alignment, charts.
- Arabic variant of the H5 PDFs.

**Done when:** a full Arabic session across the 10 core screens has no
English leakage or broken RTL layout; Arabic quotation PDF renders correctly.

---

## Phase 4 — ALIVE

### Sprint H7 — Real AI #1 (M1) · 4–6 days
- ForecastEngine computes from real `sales_orders` (moving average +
  seasonality baseline — simple and real beats complex and fake).
- RiskRadar driven by real signals: overdue invoices, stock-outs, delayed
  production stages.
- `ai-chat` expanded with tool-use over the adapter (answers from live data).
- Remaining mocks in `ai-intelligence.ts` deleted or visibly labeled
  "demo" — **no unlabeled fake numbers on any screen.**

**Done when:** every number on Intelligence/Forecast/Risk screens is
traceable to a database table.

### Sprint H8 — Realtime (M9) · 2–3 days
- Supabase channels on `work_items`, production stage log, POS registers.
- Optimistic updates + conflict toast on concurrent edits.

**Done when:** two browsers open; one moves a production stage; the other
sees it in under 2 seconds.

---

## Phase 5 — RESILIENT

### Sprint H9 — Offline POS (M8) · 4–6 days
- vite-plugin-pwa: manifest + service worker; cache app shell + product catalog.
- IndexedDB outbox for POS transactions; sync on reconnect with conflict policy.
- Scope strictly POS (optionally WorkQueue) — **not** the whole app.

**Done when:** an airplane-mode sale completes and syncs when back online.

### Sprint H10 — Structure + demo parity (M10) · 3–4 days + ongoing rule
- Rule going forward: any page over 800 lines gets split when touched. Start with Inventory.tsx (1,815 lines).
- Demo-parity guarantee: demo seed typed as `Database Row` types so drift
  is a compile error; smoke test runs in both demo and live modes.

**Done when:** a shape change in the schema breaks the build if demo data
wasn't updated; Inventory.tsx under 800 lines.

---

## Cadence

| Phase | Sprints | Est. days |
|---|---|---|
| 0 Safety net | — | 2–3 |
| 1 Trust | H1–H3 | 8–12 |
| 2 Control | H4 | 3–4 |
| 3 Reach | H5–H6 | 6–9 |
| 4 Alive | H7–H8 | 6–9 |
| 5 Resilient | H9–H10 | 7–10 |
| **Total** | | **~32–47 working days** |

Ordering is strict through Phase 1 (each sprint builds on the previous
adapter changes). Phases 2–5 can be reordered under business pressure —
e.g. pull H5 (documents) forward if a customer demo needs it. The one
unbreakable rule: no new modules until this roadmap is done.
