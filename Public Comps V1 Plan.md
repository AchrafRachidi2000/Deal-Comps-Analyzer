# Public Comps Analyzer — Version 1 Plan

This document describes the first version of the Public Comps (Trading Comps) Analyzer that will be built as a sibling module to the existing Deal Comps (Precedent Transactions) Analyzer.

It is the agreed-upon spec after the first planning pass on `Public Comps.md`. Anything marked **v2+** is explicitly deferred.

---

## 1. What v1 is (and isn't)

**v1 is:** a self-contained workflow that lets an analyst, starting from a target company, produce a curated public peer set, a multiples table, and a benchmarking table, with summary stats — matching the structure Mayo and Youssef described in their interviews.

**v1 is not:** a side-by-side deal-comps-plus-trading-comps IC view, a daily market-data refresher, or a multi-user / monitoring platform. Those are noted in the v2+ roadmap below.

### Locked decisions

| Open question (from planning pass) | v1 decision |
| --- | --- |
| Adjusted vs as-reported EBITDA | **LTM EBITDA only, as-reported.** No toggle in v1. |
| Pre-computed vs derived multiples | **Pre-computed only.** No derivation fallback. |
| NTM coverage gaps | **LTM columns always visible by default. NTM cells shown only when data exists — no fallback to LTM.** |
| Reference date granularity | **Closest quarter-end** (not arbitrary daily date). |
| Mixed fiscal year-ends | **Display reference date per row; analyst judges comparability.** No automated warning. |
| Coexistence with Deal Comps | **No side-by-side view.** Public Comps is a separate section, reached from the sidebar. Clicking it takes the user to its own landing page and workflow. |

---

## 2. How v1 will work (end-to-end user flow)

### Entry point

A new navigation item in the existing left sidebar labelled **Public Comps**. Selecting it swaps the main content area to the Public Comps app shell. The Deal Comps analyzer is still accessible via its own sidebar item — the two do not share screen real estate, they share the app shell.

### Workflow (4 steps, wizard-style)

The deal-comps wizard has 3 steps (Target → Filters → Validate). Public comps has 4, because peer review is the most judgment-heavy step and deserves its own stage.

1. **Target & Reference Date**
   - Pick target company (same search UX as deal comps).
   - Pick **trigger mode**: `Deal-driven` (one-shot analysis) or `Portfolio monitoring` (flagged for quarterly refresh; monitoring logic itself is v2+, but the flag is captured so the UI affordance exists).
   - Pick **reference date** from a dropdown of the last 8 quarter-ends. Defaults to the most recent closed quarter.

2. **Filters**
   - Same filter-chip pattern as Deal Comps `FilterBar.tsx`, but with a public-comps filter set:
     - Sector (multi)
     - Geography (multi)
     - Market Cap band (range, $M)
     - Listing Status — hard-coded to `Listed` in v1 (the spec requires listed-only for the multiples universe).
     - Revenue band (range, $M)
   - Filters removed from deal-comps set: Buyer Type, Deal Size, Advisor, Announcement Date.

3. **Peer Review** (new — specific to public comps)
   - AI-suggested peers appear as cards: ticker + company name + description + similarity score + Include/Exclude toggle.
   - Analyst reads business descriptions, includes/excludes manually. Nothing auto-finalizes (explicit requirement from the spec, Step 3 in `Public Comps.md`).
   - Private-company row can be added here — flagged `benchmarking-only`. Excluded from the multiples computation but included in the benchmarking table.

4. **Validate & Run**
   - Summary of target, reference date, filter set, and final peer list.
   - "Run Analysis" button → enters the Dashboard.

### Dashboard

The dashboard has three stacked sections, in this order:

1. **Header strip** — target name, reference date pill (non-editable in v1; the analyst must rewind to Step 1 to change it), peer count.
2. **Summary Stats Grid** — one row per multiple (`EV / Revenue LTM`, `EV / EBITDA LTM`, `P / E LTM`, `EV / Revenue NTM`, `EV / EBITDA NTM`). Columns: min, 25th, median, mean, 75th, max, sample size (e.g. `10 of 12`). Sample size is surfaced explicitly — if a multiple has gaps, the N drops and the user sees it.
3. **Multiples Table** (public-only peers) — Tier 1 identity + Tier 2 market data + Tier 3 LTM financials + Tier 3 NTM financials (only cells that have values) + Tier 4 multiples + Include/Exclude toggle. Columns mirror the Mayo/Youssef spec exactly.
4. **Benchmarking Table** (public + private peers) — Revenue Growth YoY, EBITDA Margin, NTM Revenue Growth, Net Debt / EBITDA. Shares the same peer set but includes benchmarking-only rows.

### Export & save

- Excel export produces a workbook with four sheets: `Summary Stats`, `Peer Set`, `Multiples`, `Benchmarking`. Reuses the `xlsx` path from `Dashboard.tsx`.
- "Save as Artifact" snapshots the entire peer set + reference date + stats into the same artifact system already in place.

---

## 3. How we'll establish this (implementation approach)

### Folder structure

Sibling module under `src/`, with the existing Deal Comps code reorganised to make the shell-sharing obvious:

```
src/
├── App.tsx                        # routes between 'deal' | 'public'
├── shared/                        # NEW — pulled out of components/
│   ├── Sidebar.tsx                # extended with two module items
│   ├── Header.tsx                 # unchanged, reused
│   ├── ArtifactView.tsx           # unchanged, reused
│   └── AssistantPanel.tsx         # shell reused; copy + suggestions swapped per module
├── dealComps/                     # existing code moved here verbatim
│   ├── DealCompsApp.tsx
│   ├── components/ (Dashboard, ResultsTable, FilterBar, LandingPage, …)
│   └── data/mockData.ts
└── publicComps/                   # NEW
    ├── PublicCompsApp.tsx
    ├── components/
    │   ├── LandingPage.tsx            # 4-step wizard
    │   ├── Dashboard.tsx              # header + stats + two tables
    │   ├── FilterBar.tsx              # public-comps filter set
    │   ├── PeerReview.tsx             # Step 3 of wizard
    │   ├── SummaryStatsGrid.tsx       # one row per multiple, w/ sample size
    │   ├── MultiplesTable.tsx         # Tiers 1–4
    │   ├── BenchmarkingTable.tsx      # Tier 5
    │   └── ReferenceDatePill.tsx
    └── data/mockData.ts               # Peer + PeerSet + mock peers
```

The existing `lib/utils.ts`, Tailwind config, and Vite setup are shared as-is.

### Data model

Single canonical `Peer` type, no overlap with `Transaction`:

```ts
interface Peer {
  // Tier 1 — identity
  ticker: string;
  companyName: string;
  description: string;
  country: string;
  countryCode: string;
  isPublic: boolean;                // false → benchmarking-only row

  // Tier 2 — market data (numerator, as of referenceDate)
  sharePrice: number | null;
  marketCap: number | null;
  enterpriseValue: number | null;
  netDebt: number | null;
  cash: number | null;

  // Tier 3 — financial data (denominators)
  referenceDate: string;            // per-row, e.g. "LTM Q4 2025"
  fiscalYearEnd: string;            // informational only in v1
  revenueLTM: number | null;
  ebitdaLTM: number | null;         // as-reported, no adjustments in v1
  netIncomeLTM: number | null;
  epsLTM: number | null;
  revenueNTM: number | null;        // null when not covered
  ebitdaNTM: number | null;

  // Tier 4 — multiples (pre-computed only in v1)
  evRevenueLTM: number | null;
  evEbitdaLTM: number | null;
  peLTM: number | null;
  evRevenueNTM: number | null;
  evEbitdaNTM: number | null;

  // Tier 5 — benchmarking
  revenueGrowthYoY: number | null;
  ebitdaMargin: number | null;
  ntmRevenueGrowth: number | null;
  netDebtToEbitda: number | null;

  // Curation
  status: 'Included' | 'Excluded';
  exclusionReason: string | null;
  similarityScore: number;
  reasoning: string;
}

interface PeerSet {
  id: string;
  targetCompany: string;
  sector: string;
  geography: string[];
  referenceDate: string;            // quarter-end, applies to the whole set
  triggerMode: 'deal' | 'monitoring';
  peers: Peer[];
}

interface MultipleStats {
  multiple: 'evRevenueLTM' | 'evEbitdaLTM' | 'peLTM' | 'evRevenueNTM' | 'evEbitdaNTM';
  label: string;
  min: number; p25: number; median: number; mean: number; p75: number; max: number;
  sampleSize: number;               // peers with a non-null value
  totalPeers: number;               // included peers overall
}
```

### Build order (proposed)

Each step is a small, reviewable commit:

1. **Refactor** — move existing Deal Comps into `src/dealComps/` and extract `shared/`. No behaviour changes, pure reorganisation.
2. **Sidebar navigation** — add a `Public Comps` item and wire module switching in `App.tsx`.
3. **Data layer** — `publicComps/data/mockData.ts` with `Peer` / `PeerSet` types and ~12 realistic mock peers (same sector as the existing mock target so the two analyzers feel connected).
4. **Landing page** — 4-step wizard. Start with Steps 1, 2, 4 (mirroring deal-comps patterns), then Step 3 (new).
5. **Dashboard shell + Summary Stats Grid** — compute stats from the peer set.
6. **Multiples Table** — Tiers 1–4, LTM always visible, NTM conditional.
7. **Benchmarking Table** — Tier 5, includes private rows.
8. **Excel export + Save as Artifact** — reuse existing patterns.
9. **Assistant panel copy swap** — suggested prompts tailored to public comps (e.g. "Remove peers with market cap < $500M").

### What we reuse vs rebuild

| Component | v1 plan |
| --- | --- |
| `Sidebar`, `Header`, `ArtifactView` | Reused from shared/ |
| `AssistantPanel` shell | Reused; copy and suggested prompts swapped |
| `ClaimsEvidence` pattern | Not in v1 (no Deal Implications equivalent yet) |
| Wizard step animations, `cn` utility, `xlsx` export flow | Reused |
| `DealImplications`, `FilterBar`, `ResultsTable` | **Not reused.** Public comps has its own filter set, table structure (5 multiples instead of 2), and no IC narrative section in v1 |

---

## 4. v2+ roadmap (explicitly deferred)

Grouped by theme so we can prioritise after v1 is shipped.

**Data depth**
- Adjusted vs as-reported EBITDA toggle (flagged in spec; deferred).
- Derived multiples as a fallback when pre-computed values are missing, with a `source: 'computed' | 'capiq'` label on each cell.
- NTM → LTM fallback rule for multiples where NTM is missing (currently just hidden).
- Automatic warning when peers in the set have materially different fiscal year-ends.

**Reference date & monitoring**
- Arbitrary daily reference date (v1 is quarter-end only).
- Actual recurring quarterly refresh for peer sets flagged `monitoring` — background job, diff view quarter-over-quarter. v1 only captures the flag.
- Reference-date edit from the Dashboard without re-entering the wizard.

**IC workflow**
- Side-by-side view with Deal Comps for the same target (Mayo's IC framing — "presented side by side, typically go with the lower number").
- Deal Implications / Claims & Evidence equivalent for public comps (sanity-check narrative — Youssef's NTM-vs-business-plan use case).

**Peer selection quality**
- Richer AI similarity: score breakdown by dimension (products, tech, geography, size) visible on each suggested peer.
- Bulk import peers from a ticker list (paste-in).
- Save and reuse peer sets across targets.

**Table & export polish**
- Configurable visible columns per user.
- Outlier highlighting (> 2σ from median) and negative-EBITDA flags in the multiples table.
- Currency normalisation across peers (v1 assumes USD display).

---

## 5. What "done" looks like for v1

- [ ] Analyst can reach Public Comps from the sidebar, independently of Deal Comps.
- [ ] 4-step wizard runs end-to-end on mock data and produces a peer set.
- [ ] Dashboard shows summary stats for all five multiples with explicit sample sizes.
- [ ] Multiples table shows LTM columns by default; NTM cells appear only where data exists.
- [ ] Benchmarking table shows the same peer set plus any benchmarking-only private rows.
- [ ] Reference date is shown per row; changing it requires re-entering the wizard.
- [ ] Excel export and Save as Artifact both work on the public-comps view.
- [ ] No regressions in the existing Deal Comps flow after the shared/ refactor.
