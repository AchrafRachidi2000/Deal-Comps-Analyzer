# Deal Comps V1 MVP — Design

Date: 2026-06-17

## 1. Goal

Two changes to the app:

1. **Remove Public Comps entirely** — module, backend, deps, config, and docs. The app becomes Deal-Comps-only.
2. **Add a new, fully functional "Deal Comps V1 MVP" module** as a second sidebar item, leaving the existing Deal Comps module 100% intact.

The existing Deal Comps module is a polished but non-functional prototype: its `FilterBar` is display-only (filters not wired to the table) and its stats are partly hardcoded. The V1 MVP delivers the *same surface* but actually wired and data-driven, behind an intentionally minimal 2-step start.

## 2. Locked decisions

| Question | Decision |
| --- | --- |
| Public Comps removal scope | **Full removal** — `src/publicComps/`, `src/server/`, `api/`, `vercel.json`, unused deps, and both planning docs. |
| Planning docs (`Public Comps.md`, `Public Comps V1 Plan.md`) | **Delete them too.** |
| V1 placement | **Second sidebar item** (`'dealV1'`), alongside the existing `'deal'`. |
| Recompute model | **Instant / live** — recompute on every filter change and row toggle; invalid/partial inputs ignored. |
| Seed data shape | **Self-contained per company** — ~3 preset companies, each with its own preset filters + its own comp set. |
| Default module on load | **Deal Comps V1 (new).** |
| Testing | **Add Vitest**; TDD the pure `lib/` functions. |

## 3. Approach

Build V1 as an **isolated module `src/dealCompsV1/`** mirroring the existing folder conventions, with all logic wired and data-driven. The existing `src/dealComps/` is untouched (zero regression risk). Reuse only `shared/Sidebar` (extended) and `lib/utils`. Rejected alternative: extending/refactoring the existing `dealComps` components — it would mutate the module we must keep intact.

## 4. Removing Public Comps

Nothing outside Public Comps depends on the backend — `src/dealComps/` and `shared/` use only mock data and never call `/api`. Verified by grep.

- **Delete:** `src/publicComps/`, `src/server/`, `api/`, `vercel.json`, `Public Comps.md`, `Public Comps V1 Plan.md`.
- **Unwire:**
  - `vite.config.ts` — remove the `peerApiPlugin` import and its entry in the `plugins` array.
  - `App.tsx` — remove the `'public'` branch and the `PublicCompsApp` import.
  - `shared/Sidebar.tsx` — remove the Public Comps `NavItem`; update the `Module` type.
- **Dependencies:** grep each before removing; remove those that become unused. Expected: `yahoo-finance2`, `@vercel/node`. Probable (verify): `express`, `@types/express`, `better-sqlite3`, `@google/genai`. **Keep `xlsx`** (used by export). Drop `process.env.GEMINI_API_KEY` define in `vite.config.ts` if `@google/genai` goes.
- **Verify:** `npm run lint` (tsc --noEmit) and `npm run build` both pass with no dangling references.

## 5. Module structure

```
src/dealCompsV1/
├── DealCompsV1App.tsx     # phase ('setup' | 'dashboard') + central state container
├── components/
│   ├── LandingPage.tsx    # 2-step wizard: Target -> Filters
│   ├── CompanySelect.tsx  # step-1 typeahead/select over preset companies
│   ├── Dashboard.tsx      # stats grid + filter bar + table + export
│   ├── FilterBar.tsx      # wired active-filter chips (edit/remove inline)
│   ├── FilterControls.tsx # MultiSelect / RangeSlider / DateRange (shared by wizard + bar)
│   ├── StatsGrid.tsx      # Min/Median/Max/N per multiple
│   ├── ResultsTable.tsx   # rows + include/exclude toggle + show/hide columns
│   └── ColumnPicker.tsx   # show/hide columns dropdown
├── data/
│   ├── types.ts           # CompTransaction, DealCompFilters, PresetCompany, FilterDef
│   └── companies.ts       # ~3 preset companies (preset filters + comp sets)
└── lib/
    ├── filtering.ts       # filterTransactions + per-filter predicates
    ├── stats.ts           # computeStats (min / median / max / N)
    ├── columns.ts         # COLUMN_DEFS registry + visibility defaults
    ├── format.ts          # formatMoney / formatMultiple / formatNumber / formatDate
    └── export.ts          # buildCsvBlob / buildXlsxWorkbook (current view)
```

`*.test.ts` files live alongside the `lib/` modules they test. V1 has **no AssistantPanel** (minimal flow, no LLM). Sidebar gains a 3rd item "Deal Comps V1"; `App.tsx` routes `'deal' | 'dealV1'`, defaulting to `'dealV1'`.

## 6. Data model

Fresh type, independent of the old `Transaction`. Adds **EBIT / EV-EBIT** (for the EV/EBIT stat) and a precomputed **`region`** (robust geography filtering, no country->region map). All financials in $M; nullable where data may be missing.

```ts
type BuyerType = 'Strategic' | 'Financial';
type Status = 'Included' | 'Excluded';

interface CompTransaction {
  id: string;
  targetCompany: string;
  targetDescription: string;
  sector: string;
  region: string;            // e.g. 'North America', 'Europe', 'Asia Pacific'
  location: string;          // country name
  countryCode: string;       // flag, e.g. 'US'
  announcementDate: string;  // ISO 'YYYY-MM-DD'
  buyer: string;
  buyerType: BuyerType;
  employees: number | null;
  dealSize: number | null;        // $M
  currency: string;
  revenue: number | null;         // LTM revenue, $M
  ebitda: number | null;          // $M
  ebit: number | null;            // $M
  enterpriseValue: number | null; // $M
  evRevenueMultiple: number | null;
  evEbitdaMultiple: number | null;
  evEbitMultiple: number | null;
  status: Status;
}

interface RangeFilter { min: number | null; max: number | null; }
interface DateRange { from: string | null; to: string | null; }

interface DealCompFilters {
  sector: string[];          // multi
  buyerType: BuyerType[];    // multi (Strategic / Financial)
  geography: string[];       // multi (regions)
  employees: RangeFilter;
  revenue: RangeFilter;
  ebitda: RangeFilter;
  evEbitda: RangeFilter;
  evRevenue: RangeFilter;
  announcementDate: DateRange;
}

interface PresetCompany {
  id: string;
  name: string;
  description: string;
  presetFilters: DealCompFilters;
  transactions: CompTransaction[];
}
```

**Seed data:** 3 realistic preset companies (medtech / PE flavor; one adapted from the existing NovaPulse set), each ~10–12 transactions with a mix of sectors, regions, buyer types, and some null fields to exercise the "exclude nulls from stats" path.

## 7. Two-step start (LandingPage)

Minimal wizard, progress bar of 2 steps. No upload, no AI-generated badge, no soft/context filters, no mandate.

- **Step 1 — Target:** `CompanySelect` typeahead/dropdown over the preset companies (name + description). On select, load `presetFilters` and `transactions` into state.
- **Step 2 — Filters:** pre-populated from the company's preset; adjustable via real controls (see §9). "Run Analysis" -> Dashboard.

## 8. Dashboard

- **StatsGrid:** rows = EV/EBITDA, EV/Revenue, EV/EBIT; columns = **Min / Median / Max / N**. N = count of included∩filtered rows with a non-null, finite, positive value for that multiple. Empty set -> em-dash.
- **FilterBar:** active filters rendered as editable chips. Click a chip -> popover with the matching control to edit inline. X -> remove (resets that filter). "Clear all" when any active. Visual pattern mirrors the existing `dealComps/FilterBar.tsx`, but wired to live state.
- **ResultsTable:** one row per transaction. All / Included / Excluded tabs (counts within the filtered set). Per-row **Include/Exclude** toggle. Identity (target) + action columns always visible; other columns toggled via `ColumnPicker`.
- **ColumnPicker:** dropdown with grouped checkboxes (Company / Transaction / Multiples). Drives both the table and the export.
- **Export:** CSV and Excel of the *current view* — the filtered rows (respecting the active All/Included/Excluded tab) and the currently visible columns. Excel includes a Summary sheet with the stats. Reuses the `xlsx` `json_to_sheet` / `writeFile` pattern; CSV via a small escaping helper (or `XLSX.utils.sheet_to_csv`).

## 9. Filter controls (`FilterControls.tsx`)

Selection controls per filter type, shared by the wizard (step 2) and the dashboard FilterBar:

| Filter | Control |
| --- | --- |
| Sector, Buyer Type, Geography | Multi-select dropdown (checkbox list) |
| Employees, Revenue, EBITDA, EV/EBITDA, EV/Revenue | Dual-thumb **range slider** ("range bar") + min/max numeric inputs; slider bounds derived from the company's data extents |
| Announcement Date | From/To date pickers + quick presets (Last 1y / 3y / 5y) |

## 10. State & recompute (instant/live)

`DealCompsV1App` (or a `useDealCompsV1` hook) holds: `selectedCompany`, `phase`, `filters`, `transactions` (with per-row status overrides), `visibleColumns`, `statusTab`.

Derived via `useMemo`:
- `filteredRows = filterTransactions(transactions, filters)` — hard filters narrow the displayed candidate set.
- `stats[multiple] = computeStats(filteredRows.filter(Included), multiple)`.

Every filter change and every row toggle triggers recompute. **Validation rule:** a `RangeFilter` with only one bound is open-ended on the other side; `min > max` is treated as no constraint; empty multi-select arrays mean "any". The Include/Exclude toggle controls comp-set membership for stats; hard filters control table visibility.

## 11. Testing (Vitest)

Add `vitest` (devDep), a `test` script, and minimal config (jsdom not required — pure functions). TDD the `lib/` modules:
- `filtering.test.ts` — each filter type; partial bounds; `min>max`; empty multi-select; combined filters; null-field rows.
- `stats.test.ts` — min/median/max with odd & even counts; null/zero/negative exclusion; empty set; N correctness.
- `export.test.ts` — CSV escaping (commas, quotes, newlines); visible-column subsetting; row-set respects status tab.
- `columns.test.ts` — registry defaults; always-on columns cannot be hidden.

UI components are not unit-tested (prototype); correctness is verified via `tsc --noEmit` + `vite build` + manual run.

## 12. Out of scope (YAGNI for V1)

Document upload, LLM-driven filter generation, mandate/context briefs, assistant panel, deal implications / claims & evidence, artifacts / save-as-snapshot, real backend / market data, multi-currency normalization, saved/persisted filter sets.

## 13. Definition of done

- [ ] Public Comps fully removed; `lint` + `build` pass with no dangling refs; unused deps dropped.
- [ ] Sidebar shows Deal Comps and Deal Comps V1; app opens on V1; old Deal Comps unchanged.
- [ ] V1 2-step start: pick a preset company -> its filters pre-fill -> Run.
- [ ] All filter types work as selection controls and filter the table live.
- [ ] FilterBar shows active filters; each is editable inline and removable.
- [ ] StatsGrid shows Min/Median/Max/N for EV/EBITDA, EV/Revenue, EV/EBIT, recomputed live.
- [ ] Row Include/Exclude toggles update table and stats instantly.
- [ ] Show/hide columns works and drives the export.
- [ ] Export to CSV and Excel reflects filtered rows + visible columns.
- [ ] Vitest suite for `lib/` passes.
