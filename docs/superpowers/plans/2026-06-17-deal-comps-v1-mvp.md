# Deal Comps V1 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the Public Comps module entirely and add a new, fully-wired "Deal Comps V1 MVP" module (2-step start → live-filtered transactions table with aggregate multiples stats, show/hide columns, and CSV/Excel export), leaving the existing Deal Comps module untouched.

**Architecture:** A new isolated module `src/dealCompsV1/` with a pure, unit-tested `lib/` core (filtering, stats, columns, format, export) and React UI on top. State lives in `DealCompsV1App`; derived rows + stats are recomputed live via `useMemo`. Reuses only `shared/Sidebar` (extended) and `lib/utils`. The existing `src/dealComps/` is not modified.

**Tech Stack:** React 19, TypeScript ~5.8, Vite 6, Tailwind v4, lucide-react, motion, `xlsx`, and Vitest (new).

## Global Constraints

- TypeScript strict patterns already in repo; all code must pass `npm run lint` (`tsc --noEmit`) and `npm run build`.
- Path alias `@/` → `src/` (configured in `tsconfig.json` + `vite.config.ts`). Use it for cross-folder imports.
- Styling: Tailwind utility classes only; reuse the visual language of existing components (indigo-600 primary, gray scale, `rounded-lg`/`rounded-xl`, `border-gray-200`, `shadow-sm`). Use the `cn` helper from `@/lib/utils`.
- All financials are in $M; multiples are unitless (suffix `x`). Nullable numeric fields use `number | null` (never `undefined`, never `0` as "missing").
- Buyer types in V1 are exactly `'Strategic' | 'Financial'` (no Hybrid).
- The existing `src/dealComps/` module and `src/shared/Header.tsx`, `src/shared/AssistantPanel.tsx`, `src/shared/ArtifactView.tsx` must not be edited (except `Sidebar.tsx`).
- Commit after every task with a `feat:`/`chore:`/`test:` message.

---

## Task 1: Remove Public Comps module, backend, and config

**Files:**
- Delete: `src/publicComps/` (all), `src/server/` (all), `api/` (all), `vercel.json`, `Public Comps.md`, `Public Comps V1 Plan.md`
- Modify: `vite.config.ts`, `src/App.tsx`, `src/shared/Sidebar.tsx`, `package.json`

**Interfaces:**
- Produces: `Module` type narrowed to `'deal' | 'dealV1'` in `src/shared/Sidebar.tsx`; `App.tsx` renders only Deal-Comps modules.

- [ ] **Step 1: Confirm no non-public code imports the backend**

Run: `grep -rEn "/api/|@/server|publicComps|yahoo-finance2|@google/genai|better-sqlite3|express" src/dealComps src/shared src/App.tsx src/main.tsx`
Expected: zero matches in `src/dealComps`, `src/shared`, `src/App.tsx`, `src/main.tsx` (only `App.tsx` referencing `PublicCompsApp`, handled below).

- [ ] **Step 2: Delete the Public Comps files**

```bash
rm -rf "src/publicComps" "src/server" "api" "vercel.json" "Public Comps.md" "Public Comps V1 Plan.md"
```

- [ ] **Step 3: Unwire `vite.config.ts`**

Replace the whole file with (removes `peerApiPlugin`; `@google/genai` define dropped — see Step 6):

```ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
```

- [ ] **Step 4: Update `src/shared/Sidebar.tsx`**

Replace the `Module` type and the two `NavItem`s so only Deal modules remain. Full file:

```tsx
import React from 'react';
import { Handshake, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Module = 'deal' | 'dealV1';

interface SidebarProps {
  activeModule: Module;
  onModuleChange: (module: Module) => void;
}

export function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  return (
    <div className="w-16 h-screen bg-white border-r border-gray-200 flex flex-col items-center py-4 z-20 flex-shrink-0">
      <div className="flex-1 flex flex-col gap-4 w-full items-center">
        <NavItem
          icon={<Handshake className="w-5 h-5" />}
          label="Deal Comps"
          active={activeModule === 'deal'}
          onClick={() => onModuleChange('deal')}
        />
        <NavItem
          icon={<Rocket className="w-5 h-5" />}
          label="Deal Comps V1"
          active={activeModule === 'dealV1'}
          onClick={() => onModuleChange('dealV1')}
        />
      </div>
      <div className="mt-auto flex flex-col items-center mb-4">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
          JD
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: {
  icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-2 rounded-lg transition-colors relative group',
        active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      )}
      title={label}
    >
      {icon}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full -ml-4" />
      )}
    </button>
  );
}
```

- [ ] **Step 5: Update `src/App.tsx` (temporary — finalized in Task 15)**

Remove the Public Comps import/branch. Until Task 15 builds `DealCompsV1App`, default to the existing module so the app compiles:

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Sidebar, Module } from '@/shared/Sidebar';
import { DealCompsApp } from '@/dealComps/DealCompsApp';

export default function App() {
  const [module, setModule] = useState<Module>('deal');
  const [assistantCollapsed, setAssistantCollapsed] = useState(true);
  const toggleAssistant = () => setAssistantCollapsed((c) => !c);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Sidebar activeModule={module} onModuleChange={setModule} />
      <DealCompsApp assistantCollapsed={assistantCollapsed} onToggleAssistant={toggleAssistant} />
    </div>
  );
}
```

- [ ] **Step 6: Remove now-unused dependencies from `package.json`**

Run grep to confirm each is unreferenced in `src/`, then remove from `package.json` `dependencies`/`devDependencies`: `yahoo-finance2`, `@vercel/node`, `express`, `@types/express`, `better-sqlite3`, `@google/genai`, `dotenv`.
Run: `grep -rEn "yahoo-finance2|@vercel/node|express|better-sqlite3|@google/genai|dotenv" src/` → expected: no matches. (If any matches, keep that dep.)
Then: `npm install` to refresh the lockfile.

- [ ] **Step 7: Verify build is green**

Run: `npm run lint && npm run build`
Expected: both succeed; no references to `publicComps`/`server`/`api`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: remove Public Comps module, backend, and unused deps"
```

---

## Task 2: Add Vitest tooling

**Files:**
- Create: `vitest.config.ts`, `src/dealCompsV1/lib/sanity.test.ts` (temporary)
- Modify: `package.json` (add `vitest` devDep + `test` script)

**Interfaces:**
- Produces: `npm test` runs Vitest in run mode; tests live as `*.test.ts` beside source.

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest`

- [ ] **Step 2: Add the `test` script to `package.json`**

In `"scripts"`, add: `"test": "vitest run"` and `"test:watch": "vitest"`.

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Write a sanity test** — `src/dealCompsV1/lib/sanity.test.ts`

```ts
import { describe, it, expect } from 'vitest';

describe('vitest setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run it**

Run: `npm test`
Expected: 1 passing test.

- [ ] **Step 6: Delete the sanity test and commit**

```bash
rm src/dealCompsV1/lib/sanity.test.ts
git add -A
git commit -m "chore: add Vitest test runner"
```

---

## Task 3: Data model + seed companies

**Files:**
- Create: `src/dealCompsV1/data/types.ts`, `src/dealCompsV1/data/companies.ts`, `src/dealCompsV1/data/companies.test.ts`

**Interfaces:**
- Produces:
  - `type BuyerType = 'Strategic' | 'Financial'`
  - `type Status = 'Included' | 'Excluded'`
  - `interface CompTransaction { id; targetCompany; targetDescription; sector; region; location; countryCode; announcementDate; buyer; buyerType: BuyerType; employees: number|null; dealSize: number|null; currency: string; revenue: number|null; ebitda: number|null; ebit: number|null; enterpriseValue: number|null; evRevenueMultiple: number|null; evEbitdaMultiple: number|null; evEbitMultiple: number|null; status: Status }`
  - `interface RangeFilter { min: number|null; max: number|null }`
  - `interface DateRange { from: string|null; to: string|null }`
  - `interface DealCompFilters { sector: string[]; buyerType: BuyerType[]; geography: string[]; employees: RangeFilter; revenue: RangeFilter; ebitda: RangeFilter; evEbitda: RangeFilter; evRevenue: RangeFilter; announcementDate: DateRange }`
  - `interface PresetCompany { id; name; description; presetFilters: DealCompFilters; transactions: CompTransaction[] }`
  - `const EMPTY_FILTERS: DealCompFilters`
  - `const SECTORS: string[]`, `const REGIONS: string[]`, `const BUYER_TYPES: BuyerType[]`
  - `const PRESET_COMPANIES: PresetCompany[]`

- [ ] **Step 1: Write `src/dealCompsV1/data/types.ts`**

```ts
export type BuyerType = 'Strategic' | 'Financial';
export type Status = 'Included' | 'Excluded';

export interface CompTransaction {
  id: string;
  targetCompany: string;
  targetDescription: string;
  sector: string;
  region: string;
  location: string;
  countryCode: string;
  announcementDate: string; // ISO YYYY-MM-DD
  buyer: string;
  buyerType: BuyerType;
  employees: number | null;
  dealSize: number | null;
  currency: string;
  revenue: number | null;
  ebitda: number | null;
  ebit: number | null;
  enterpriseValue: number | null;
  evRevenueMultiple: number | null;
  evEbitdaMultiple: number | null;
  evEbitMultiple: number | null;
  status: Status;
}

export interface RangeFilter { min: number | null; max: number | null; }
export interface DateRange { from: string | null; to: string | null; }

export interface DealCompFilters {
  sector: string[];
  buyerType: BuyerType[];
  geography: string[];
  employees: RangeFilter;
  revenue: RangeFilter;
  ebitda: RangeFilter;
  evEbitda: RangeFilter;
  evRevenue: RangeFilter;
  announcementDate: DateRange;
}

export interface PresetCompany {
  id: string;
  name: string;
  description: string;
  presetFilters: DealCompFilters;
  transactions: CompTransaction[];
}

export const SECTORS = ['Medical Devices', 'Diagnostics', 'Health IT / SaaS', 'Medical Supplies', 'Pharmaceuticals', 'Wearables'];
export const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'];
export const BUYER_TYPES: BuyerType[] = ['Strategic', 'Financial'];

export const EMPTY_FILTERS: DealCompFilters = {
  sector: [],
  buyerType: [],
  geography: [],
  employees: { min: null, max: null },
  revenue: { min: null, max: null },
  ebitda: { min: null, max: null },
  evEbitda: { min: null, max: null },
  evRevenue: { min: null, max: null },
  announcementDate: { from: null, to: null },
};
```

- [ ] **Step 2: Write `src/dealCompsV1/data/companies.ts`**

Author **3 `PresetCompany` objects** named `PRESET_COMPANIES`. Requirements for each company:
- 10–12 `CompTransaction` rows with unique `id`s (prefix per company, e.g. `np-1`, `cd-1`, `sg-1`).
- Mix of `sector` values from `SECTORS`, `region` values from `REGIONS`, and both `buyerType` values.
- At least 2 rows per company with some null financials (e.g. `ebitda: null` or `enterpriseValue: null`) and correspondingly null multiples and `status: 'Excluded'` — to exercise the null-exclusion path in stats.
- For non-null rows, multiples must be internally consistent: `evEbitdaMultiple ≈ enterpriseValue / ebitda`, `evRevenueMultiple ≈ enterpriseValue / revenue`, `evEbitMultiple ≈ enterpriseValue / ebit` (1-decimal rounding OK).
- `presetFilters`: start from `EMPTY_FILTERS` and set a realistic subset, e.g. company 1: `{ ...EMPTY_FILTERS, sector: ['Medical Devices','Diagnostics'], buyerType: ['Strategic','Financial'], geography: ['North America','Europe'], evEbitda: { min: 8, max: 20 } }`.

Company 1 = **NovaPulse Medical** (medtech / respiratory), adapt the 15 existing rows from `src/dealComps/data/mockData.ts` down to ~12, mapping each old field: `dealDate`→`announcementDate`, keep `sector`, add `region` (US/Canada → North America; Germany/UK/Switzerland/Sweden/France → Europe; China → Asia Pacific; Australia → Asia Pacific; Israel → Middle East & Africa), add `ebit` (≈ `ebitda` × 0.8 where ebitda present, else null) and `evEbitMultiple` (= EV/ebit). Drop fields not in `CompTransaction` (advisor, reasoning, multipleComment, similarityScore, newsLink, newsTitle, exclusionReason). Companies 2 & 3 are new (e.g. a fintech-software target "CoreDelta Payments" and an industrial-automation target "SigmaForge Robotics") following the same shape with sector/region/buyerType variety.

Example of one fully-formed row (use as the exact shape template):

```ts
{
  id: 'np-1',
  targetCompany: 'RespiraTech Solutions',
  targetDescription: 'Non-invasive respiratory monitoring devices for ICU settings.',
  sector: 'Medical Devices',
  region: 'North America',
  location: 'United States',
  countryCode: 'US',
  announcementDate: '2025-11-15',
  buyer: 'Medtronic',
  buyerType: 'Strategic',
  employees: 320,
  dealSize: 450,
  currency: 'USD',
  revenue: 85,
  ebitda: 32,
  ebit: 26,
  enterpriseValue: 450,
  evRevenueMultiple: 5.3,
  evEbitdaMultiple: 14.1,
  evEbitMultiple: 17.3,
  status: 'Included',
},
```

- [ ] **Step 3: Write the failing test** — `src/dealCompsV1/data/companies.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { PRESET_COMPANIES, SECTORS, REGIONS, BUYER_TYPES } from './companies';

describe('PRESET_COMPANIES', () => {
  it('has exactly 3 companies', () => {
    expect(PRESET_COMPANIES).toHaveLength(3);
  });

  it('each company has 10-12 transactions with unique ids', () => {
    for (const c of PRESET_COMPANIES) {
      expect(c.transactions.length).toBeGreaterThanOrEqual(10);
      expect(c.transactions.length).toBeLessThanOrEqual(12);
      const ids = c.transactions.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('uses only known sectors, regions, and buyer types', () => {
    for (const c of PRESET_COMPANIES) {
      for (const t of c.transactions) {
        expect(SECTORS).toContain(t.sector);
        expect(REGIONS).toContain(t.region);
        expect(BUYER_TYPES).toContain(t.buyerType);
      }
    }
  });

  it('each company has at least one row with a null multiple', () => {
    for (const c of PRESET_COMPANIES) {
      const hasNull = c.transactions.some((t) => t.evEbitdaMultiple === null);
      expect(hasNull).toBe(true);
    }
  });

  it('non-null EV/EBITDA multiples are roughly EV/EBITDA', () => {
    for (const c of PRESET_COMPANIES) {
      for (const t of c.transactions) {
        if (t.evEbitdaMultiple !== null && t.enterpriseValue !== null && t.ebitda && t.ebitda > 0) {
          const expected = t.enterpriseValue / t.ebitda;
          expect(Math.abs(t.evEbitdaMultiple - expected)).toBeLessThan(1.0);
        }
      }
    }
  });
});
```

`SECTORS`, `REGIONS`, `BUYER_TYPES` should be re-exported from `companies.ts` (or import from `./types` in the test). Re-export in `companies.ts`: `export { SECTORS, REGIONS, BUYER_TYPES } from './types';`

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: all `companies.test.ts` assertions pass. Fix data until green.

- [ ] **Step 5: Commit**

```bash
git add src/dealCompsV1/data
git commit -m "feat: add Deal Comps V1 data model and 3 preset companies"
```

---

## Task 4: `lib/format.ts`

**Files:**
- Create: `src/dealCompsV1/lib/format.ts`, `src/dealCompsV1/lib/format.test.ts`

**Interfaces:**
- Produces: `formatMoney(v: number|null): string`, `formatMultiple(v: number|null): string`, `formatNumber(v: number|null, digits?: number): string`, `formatDate(iso: string|null): string`

- [ ] **Step 1: Write the failing test** — `src/dealCompsV1/lib/format.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { formatMoney, formatMultiple, formatNumber, formatDate } from './format';

describe('format', () => {
  it('formatMoney', () => {
    expect(formatMoney(450)).toBe('$450M');
    expect(formatMoney(1500)).toBe('$1,500M');
    expect(formatMoney(null)).toBe('—');
  });
  it('formatMultiple', () => {
    expect(formatMultiple(14.1)).toBe('14.1x');
    expect(formatMultiple(8)).toBe('8.0x');
    expect(formatMultiple(null)).toBe('—');
  });
  it('formatNumber', () => {
    expect(formatNumber(320)).toBe('320');
    expect(formatNumber(12.34, 1)).toBe('12.3');
    expect(formatNumber(null)).toBe('—');
  });
  it('formatDate', () => {
    expect(formatDate('2025-11-15')).toBe('Nov 15, 2025');
    expect(formatDate(null)).toBe('—');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- format`
Expected: FAIL (module not found / functions undefined).

- [ ] **Step 3: Write `src/dealCompsV1/lib/format.ts`**

```ts
const DASH = '—';

export function formatMoney(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return DASH;
  return `$${v.toLocaleString('en-US')}M`;
}

export function formatMultiple(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return DASH;
  return `${v.toFixed(1)}x`;
}

export function formatNumber(v: number | null, digits = 0): string {
  if (v === null || !Number.isFinite(v)) return DASH;
  return v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatDate(iso: string | null): string {
  if (!iso) return DASH;
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return DASH;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- format`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/dealCompsV1/lib/format.ts src/dealCompsV1/lib/format.test.ts
git commit -m "feat: add V1 formatting helpers"
```

---

## Task 5: `lib/stats.ts`

**Files:**
- Create: `src/dealCompsV1/lib/stats.ts`, `src/dealCompsV1/lib/stats.test.ts`

**Interfaces:**
- Consumes: `CompTransaction` from `@/dealCompsV1/data/types`.
- Produces:
  - `type MultipleKey = 'evEbitdaMultiple' | 'evRevenueMultiple' | 'evEbitMultiple'`
  - `interface MultipleStat { key: MultipleKey; label: string; min: number|null; median: number|null; max: number|null; n: number }`
  - `const MULTIPLE_DEFS: { key: MultipleKey; label: string }[]` (EV/EBITDA, EV/Revenue, EV/EBIT)
  - `function median(values: number[]): number` (assumes non-empty, sorted or unsorted)
  - `function computeStat(rows: CompTransaction[], key: MultipleKey, label: string): MultipleStat`
  - `function computeAllStats(rows: CompTransaction[]): MultipleStat[]`

`computeStat` considers only values that are non-null, finite, and `> 0`; `n` = count of such values; `min/median/max` are `null` when `n === 0`.

- [ ] **Step 1: Write the failing test** — `src/dealCompsV1/lib/stats.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { median, computeStat, computeAllStats, MULTIPLE_DEFS } from './stats';
import type { CompTransaction } from '@/dealCompsV1/data/types';

function tx(partial: Partial<CompTransaction>): CompTransaction {
  return {
    id: 'x', targetCompany: 'X', targetDescription: '', sector: 'Medical Devices',
    region: 'North America', location: 'US', countryCode: 'US', announcementDate: '2025-01-01',
    buyer: 'B', buyerType: 'Strategic', employees: null, dealSize: null, currency: 'USD',
    revenue: null, ebitda: null, ebit: null, enterpriseValue: null,
    evRevenueMultiple: null, evEbitdaMultiple: null, evEbitMultiple: null, status: 'Included',
    ...partial,
  };
}

describe('median', () => {
  it('odd count', () => { expect(median([3, 1, 2])).toBe(2); });
  it('even count averages the middle two', () => { expect(median([1, 2, 3, 4])).toBe(2.5); });
  it('single', () => { expect(median([7])).toBe(7); });
});

describe('computeStat', () => {
  it('computes min/median/max/n over valid values', () => {
    const rows = [
      tx({ evEbitdaMultiple: 10 }),
      tx({ evEbitdaMultiple: 14 }),
      tx({ evEbitdaMultiple: 12 }),
    ];
    const s = computeStat(rows, 'evEbitdaMultiple', 'EV / EBITDA');
    expect(s).toEqual({ key: 'evEbitdaMultiple', label: 'EV / EBITDA', min: 10, median: 12, max: 14, n: 3 });
  });

  it('excludes null, zero, negative, and non-finite values', () => {
    const rows = [
      tx({ evEbitdaMultiple: 10 }),
      tx({ evEbitdaMultiple: null }),
      tx({ evEbitdaMultiple: 0 }),
      tx({ evEbitdaMultiple: -5 }),
    ];
    const s = computeStat(rows, 'evEbitdaMultiple', 'EV / EBITDA');
    expect(s.n).toBe(1);
    expect(s.min).toBe(10);
    expect(s.max).toBe(10);
  });

  it('returns nulls and n=0 for empty', () => {
    const s = computeStat([], 'evEbitdaMultiple', 'EV / EBITDA');
    expect(s).toEqual({ key: 'evEbitdaMultiple', label: 'EV / EBITDA', min: null, median: null, max: null, n: 0 });
  });
});

describe('computeAllStats', () => {
  it('returns one stat per multiple definition', () => {
    const stats = computeAllStats([tx({ evEbitdaMultiple: 10, evRevenueMultiple: 5, evEbitMultiple: 12 })]);
    expect(stats.map((s) => s.key)).toEqual(MULTIPLE_DEFS.map((d) => d.key));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- stats`
Expected: FAIL.

- [ ] **Step 3: Write `src/dealCompsV1/lib/stats.ts`**

```ts
import type { CompTransaction } from '@/dealCompsV1/data/types';

export type MultipleKey = 'evEbitdaMultiple' | 'evRevenueMultiple' | 'evEbitMultiple';

export interface MultipleStat {
  key: MultipleKey;
  label: string;
  min: number | null;
  median: number | null;
  max: number | null;
  n: number;
}

export const MULTIPLE_DEFS: { key: MultipleKey; label: string }[] = [
  { key: 'evEbitdaMultiple', label: 'EV / EBITDA' },
  { key: 'evRevenueMultiple', label: 'EV / Revenue' },
  { key: 'evEbitMultiple', label: 'EV / EBIT' },
];

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  return n % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function computeStat(rows: CompTransaction[], key: MultipleKey, label: string): MultipleStat {
  const values = rows
    .map((r) => r[key])
    .filter((v): v is number => v !== null && Number.isFinite(v) && v > 0);

  if (values.length === 0) {
    return { key, label, min: null, median: null, max: null, n: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  return {
    key,
    label,
    min: sorted[0],
    median: median(sorted),
    max: sorted[sorted.length - 1],
    n: values.length,
  };
}

export function computeAllStats(rows: CompTransaction[]): MultipleStat[] {
  return MULTIPLE_DEFS.map((d) => computeStat(rows, d.key, d.label));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- stats`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/dealCompsV1/lib/stats.ts src/dealCompsV1/lib/stats.test.ts
git commit -m "feat: add V1 multiples stats (min/median/max/N)"
```

---

## Task 6: `lib/filtering.ts`

**Files:**
- Create: `src/dealCompsV1/lib/filtering.ts`, `src/dealCompsV1/lib/filtering.test.ts`

**Interfaces:**
- Consumes: `CompTransaction`, `DealCompFilters`, `RangeFilter`, `DateRange` from `@/dealCompsV1/data/types`.
- Produces:
  - `function inRange(value: number|null, r: RangeFilter): boolean`
  - `function inDateRange(date: string, r: DateRange): boolean`
  - `function matchesMulti(value: string, selected: string[]): boolean`
  - `function filterTransactions(rows: CompTransaction[], filters: DealCompFilters): CompTransaction[]`
  - `function extentOf(rows: CompTransaction[], key: keyof CompTransaction): { min: number; max: number }` (numeric fields; ignores null; returns `{min:0,max:0}` if none)

**Validation rules:**
- `inRange`: no effective bound (both null, or `min>max`) → `true` for any value including null. If an effective bound exists and `value === null` → `false`. Otherwise standard inclusive comparison.
- `matchesMulti`: empty `selected` → `true`; else membership.
- `inDateRange`: empty bounds → `true`; compares ISO date strings lexicographically (valid for `YYYY-MM-DD`).

- [ ] **Step 1: Write the failing test** — `src/dealCompsV1/lib/filtering.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { inRange, inDateRange, matchesMulti, filterTransactions, extentOf } from './filtering';
import type { CompTransaction, DealCompFilters } from '@/dealCompsV1/data/types';
import { EMPTY_FILTERS } from '@/dealCompsV1/data/types';

function tx(p: Partial<CompTransaction>): CompTransaction {
  return {
    id: 'x', targetCompany: 'X', targetDescription: '', sector: 'Medical Devices',
    region: 'North America', location: 'US', countryCode: 'US', announcementDate: '2025-01-01',
    buyer: 'B', buyerType: 'Strategic', employees: 100, dealSize: 100, currency: 'USD',
    revenue: 50, ebitda: 10, ebit: 8, enterpriseValue: 120,
    evRevenueMultiple: 2.4, evEbitdaMultiple: 12, evEbitMultiple: 15, status: 'Included', ...p,
  };
}

describe('inRange', () => {
  it('no bounds → always true (incl null)', () => {
    expect(inRange(5, { min: null, max: null })).toBe(true);
    expect(inRange(null, { min: null, max: null })).toBe(true);
  });
  it('min>max treated as no constraint', () => {
    expect(inRange(5, { min: 100, max: 1 })).toBe(true);
  });
  it('null value fails when a bound exists', () => {
    expect(inRange(null, { min: 1, max: null })).toBe(false);
  });
  it('inclusive comparison', () => {
    expect(inRange(5, { min: 5, max: 10 })).toBe(true);
    expect(inRange(10, { min: 5, max: 10 })).toBe(true);
    expect(inRange(4, { min: 5, max: 10 })).toBe(false);
    expect(inRange(11, { min: 5, max: 10 })).toBe(false);
    expect(inRange(20, { min: 5, max: null })).toBe(true);
    expect(inRange(2, { min: null, max: 5 })).toBe(true);
  });
});

describe('matchesMulti', () => {
  it('empty selection matches anything', () => { expect(matchesMulti('A', [])).toBe(true); });
  it('membership', () => {
    expect(matchesMulti('A', ['A', 'B'])).toBe(true);
    expect(matchesMulti('C', ['A', 'B'])).toBe(false);
  });
});

describe('inDateRange', () => {
  it('empty → true', () => { expect(inDateRange('2025-01-01', { from: null, to: null })).toBe(true); });
  it('within', () => {
    expect(inDateRange('2025-06-01', { from: '2025-01-01', to: '2025-12-31' })).toBe(true);
    expect(inDateRange('2024-06-01', { from: '2025-01-01', to: null })).toBe(false);
    expect(inDateRange('2026-06-01', { from: null, to: '2025-12-31' })).toBe(false);
  });
});

describe('filterTransactions', () => {
  const rows = [
    tx({ id: '1', sector: 'Medical Devices', buyerType: 'Strategic', region: 'North America', evEbitdaMultiple: 10 }),
    tx({ id: '2', sector: 'Diagnostics', buyerType: 'Financial', region: 'Europe', evEbitdaMultiple: 18 }),
    tx({ id: '3', sector: 'Wearables', buyerType: 'Financial', region: 'Asia Pacific', evEbitdaMultiple: null }),
  ];
  it('empty filters returns all', () => {
    expect(filterTransactions(rows, EMPTY_FILTERS).map((r) => r.id)).toEqual(['1', '2', '3']);
  });
  it('multi filter on sector', () => {
    const f: DealCompFilters = { ...EMPTY_FILTERS, sector: ['Diagnostics'] };
    expect(filterTransactions(rows, f).map((r) => r.id)).toEqual(['2']);
  });
  it('range filter excludes null-valued rows', () => {
    const f: DealCompFilters = { ...EMPTY_FILTERS, evEbitda: { min: 5, max: 15 } };
    expect(filterTransactions(rows, f).map((r) => r.id)).toEqual(['1']);
  });
  it('combined filters AND together', () => {
    const f: DealCompFilters = { ...EMPTY_FILTERS, buyerType: ['Financial'], geography: ['Europe'] };
    expect(filterTransactions(rows, f).map((r) => r.id)).toEqual(['2']);
  });
});

describe('extentOf', () => {
  it('min/max ignoring nulls', () => {
    const rows = [tx({ employees: 50 }), tx({ employees: 300 }), tx({ employees: null })];
    expect(extentOf(rows, 'employees')).toEqual({ min: 50, max: 300 });
  });
  it('no numeric values → {0,0}', () => {
    expect(extentOf([tx({ employees: null })], 'employees')).toEqual({ min: 0, max: 0 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- filtering`
Expected: FAIL.

- [ ] **Step 3: Write `src/dealCompsV1/lib/filtering.ts`**

```ts
import type { CompTransaction, DealCompFilters, RangeFilter, DateRange } from '@/dealCompsV1/data/types';

function hasBound(r: RangeFilter): boolean {
  if (r.min === null && r.max === null) return false;
  if (r.min !== null && r.max !== null && r.min > r.max) return false; // invalid → no constraint
  return true;
}

export function inRange(value: number | null, r: RangeFilter): boolean {
  if (!hasBound(r)) return true;
  if (value === null || !Number.isFinite(value)) return false;
  if (r.min !== null && value < r.min) return false;
  if (r.max !== null && value > r.max) return false;
  return true;
}

export function matchesMulti(value: string, selected: string[]): boolean {
  return selected.length === 0 || selected.includes(value);
}

export function inDateRange(date: string, r: DateRange): boolean {
  if (r.from && date < r.from) return false;
  if (r.to && date > r.to) return false;
  return true;
}

export function filterTransactions(rows: CompTransaction[], f: DealCompFilters): CompTransaction[] {
  return rows.filter((t) =>
    matchesMulti(t.sector, f.sector) &&
    matchesMulti(t.buyerType, f.buyerType) &&
    matchesMulti(t.region, f.geography) &&
    inRange(t.employees, f.employees) &&
    inRange(t.revenue, f.revenue) &&
    inRange(t.ebitda, f.ebitda) &&
    inRange(t.evEbitdaMultiple, f.evEbitda) &&
    inRange(t.evRevenueMultiple, f.evRevenue) &&
    inDateRange(t.announcementDate, f.announcementDate)
  );
}

export function extentOf(rows: CompTransaction[], key: keyof CompTransaction): { min: number; max: number } {
  const values = rows
    .map((r) => r[key])
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (values.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...values), max: Math.max(...values) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- filtering`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/dealCompsV1/lib/filtering.ts src/dealCompsV1/lib/filtering.test.ts
git commit -m "feat: add V1 transaction filtering"
```

---

## Task 7: `lib/columns.ts`

**Files:**
- Create: `src/dealCompsV1/lib/columns.ts`, `src/dealCompsV1/lib/columns.test.ts`

**Interfaces:**
- Consumes: `CompTransaction` from types; `formatMoney/formatMultiple/formatNumber/formatDate` from `./format`.
- Produces:
  - `type ColumnGroup = 'Company' | 'Transaction' | 'Multiples'`
  - `interface ColumnDef { key: string; label: string; group: ColumnGroup; align: 'left' | 'right'; alwaysOn?: boolean; defaultVisible: boolean; value: (t: CompTransaction) => string | number | null; display: (t: CompTransaction) => string }`
  - `const COLUMN_DEFS: ColumnDef[]`
  - `function defaultVisibleColumns(): Set<string>`
  - `function toggleColumn(visible: Set<string>, key: string): Set<string>` (never removes an `alwaysOn` column)

Column set (key → label, group, align, defaultVisible, alwaysOn):
- `target` → Target, Company, left, default on, **alwaysOn** (value = `targetCompany`)
- `sector` → Sector, Company, left, on
- `geography` → Geography, Company, left, on (value = `region`)
- `employees` → Employees, Company, right, off
- `announcementDate` → Announced, Transaction, left, on
- `buyer` → Buyer, Transaction, left, on
- `buyerType` → Buyer Type, Transaction, left, on
- `dealSize` → Deal Size, Transaction, right, on
- `enterpriseValue` → EV, Transaction, right, on
- `revenue` → Revenue, Transaction, right, on
- `ebitda` → EBITDA, Transaction, right, on
- `ebit` → EBIT, Transaction, right, off
- `evEbitdaMultiple` → EV/EBITDA, Multiples, right, on
- `evRevenueMultiple` → EV/Revenue, Multiples, right, on
- `evEbitMultiple` → EV/EBIT, Multiples, right, on

- [ ] **Step 1: Write the failing test** — `src/dealCompsV1/lib/columns.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { COLUMN_DEFS, defaultVisibleColumns, toggleColumn } from './columns';

describe('columns', () => {
  it('target column is alwaysOn', () => {
    const target = COLUMN_DEFS.find((c) => c.key === 'target')!;
    expect(target.alwaysOn).toBe(true);
  });
  it('defaultVisibleColumns includes default-on keys and excludes default-off', () => {
    const v = defaultVisibleColumns();
    expect(v.has('target')).toBe(true);
    expect(v.has('evEbitMultiple')).toBe(true);
    expect(v.has('employees')).toBe(false);
    expect(v.has('ebit')).toBe(false);
  });
  it('toggleColumn adds and removes a normal column', () => {
    const base = defaultVisibleColumns();
    const added = toggleColumn(base, 'employees');
    expect(added.has('employees')).toBe(true);
    const removed = toggleColumn(added, 'employees');
    expect(removed.has('employees')).toBe(false);
  });
  it('toggleColumn refuses to remove an alwaysOn column', () => {
    const v = toggleColumn(defaultVisibleColumns(), 'target');
    expect(v.has('target')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- columns`
Expected: FAIL.

- [ ] **Step 3: Write `src/dealCompsV1/lib/columns.ts`**

```ts
import type { CompTransaction } from '@/dealCompsV1/data/types';
import { formatMoney, formatMultiple, formatNumber, formatDate } from './format';

export type ColumnGroup = 'Company' | 'Transaction' | 'Multiples';

export interface ColumnDef {
  key: string;
  label: string;
  group: ColumnGroup;
  align: 'left' | 'right';
  alwaysOn?: boolean;
  defaultVisible: boolean;
  value: (t: CompTransaction) => string | number | null;
  display: (t: CompTransaction) => string;
}

export const COLUMN_DEFS: ColumnDef[] = [
  { key: 'target', label: 'Target', group: 'Company', align: 'left', alwaysOn: true, defaultVisible: true,
    value: (t) => t.targetCompany, display: (t) => t.targetCompany },
  { key: 'sector', label: 'Sector', group: 'Company', align: 'left', defaultVisible: true,
    value: (t) => t.sector, display: (t) => t.sector },
  { key: 'geography', label: 'Geography', group: 'Company', align: 'left', defaultVisible: true,
    value: (t) => t.region, display: (t) => t.region },
  { key: 'employees', label: 'Employees', group: 'Company', align: 'right', defaultVisible: false,
    value: (t) => t.employees, display: (t) => formatNumber(t.employees) },
  { key: 'announcementDate', label: 'Announced', group: 'Transaction', align: 'left', defaultVisible: true,
    value: (t) => t.announcementDate, display: (t) => formatDate(t.announcementDate) },
  { key: 'buyer', label: 'Buyer', group: 'Transaction', align: 'left', defaultVisible: true,
    value: (t) => t.buyer, display: (t) => t.buyer },
  { key: 'buyerType', label: 'Buyer Type', group: 'Transaction', align: 'left', defaultVisible: true,
    value: (t) => t.buyerType, display: (t) => t.buyerType },
  { key: 'dealSize', label: 'Deal Size', group: 'Transaction', align: 'right', defaultVisible: true,
    value: (t) => t.dealSize, display: (t) => formatMoney(t.dealSize) },
  { key: 'enterpriseValue', label: 'EV', group: 'Transaction', align: 'right', defaultVisible: true,
    value: (t) => t.enterpriseValue, display: (t) => formatMoney(t.enterpriseValue) },
  { key: 'revenue', label: 'Revenue', group: 'Transaction', align: 'right', defaultVisible: true,
    value: (t) => t.revenue, display: (t) => formatMoney(t.revenue) },
  { key: 'ebitda', label: 'EBITDA', group: 'Transaction', align: 'right', defaultVisible: true,
    value: (t) => t.ebitda, display: (t) => formatMoney(t.ebitda) },
  { key: 'ebit', label: 'EBIT', group: 'Transaction', align: 'right', defaultVisible: false,
    value: (t) => t.ebit, display: (t) => formatMoney(t.ebit) },
  { key: 'evEbitdaMultiple', label: 'EV/EBITDA', group: 'Multiples', align: 'right', defaultVisible: true,
    value: (t) => t.evEbitdaMultiple, display: (t) => formatMultiple(t.evEbitdaMultiple) },
  { key: 'evRevenueMultiple', label: 'EV/Revenue', group: 'Multiples', align: 'right', defaultVisible: true,
    value: (t) => t.evRevenueMultiple, display: (t) => formatMultiple(t.evRevenueMultiple) },
  { key: 'evEbitMultiple', label: 'EV/EBIT', group: 'Multiples', align: 'right', defaultVisible: true,
    value: (t) => t.evEbitMultiple, display: (t) => formatMultiple(t.evEbitMultiple) },
];

export function defaultVisibleColumns(): Set<string> {
  return new Set(COLUMN_DEFS.filter((c) => c.defaultVisible).map((c) => c.key));
}

export function toggleColumn(visible: Set<string>, key: string): Set<string> {
  const def = COLUMN_DEFS.find((c) => c.key === key);
  const next = new Set(visible);
  if (def?.alwaysOn) return next; // cannot hide
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- columns`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/dealCompsV1/lib/columns.ts src/dealCompsV1/lib/columns.test.ts
git commit -m "feat: add V1 column registry and visibility helpers"
```

---

## Task 8: `lib/export.ts`

**Files:**
- Create: `src/dealCompsV1/lib/export.ts`, `src/dealCompsV1/lib/export.test.ts`

**Interfaces:**
- Consumes: `CompTransaction` from types; `ColumnDef` from `./columns`; `MultipleStat` from `./stats`; `XLSX` from `xlsx`.
- Produces:
  - `function toExportObjects(rows: CompTransaction[], columns: ColumnDef[]): Record<string, string | number | null>[]` (uses `column.value`, keyed by `column.label`)
  - `function buildCsv(rows: CompTransaction[], columns: ColumnDef[]): string` (RFC-4180 escaping: wrap in quotes if value contains `,`, `"`, or newline; double internal quotes; `null` → empty)
  - `function buildWorkbook(rows: CompTransaction[], columns: ColumnDef[], stats: MultipleStat[]): XLSX.WorkBook` (Summary sheet + Transactions sheet)
  - `function downloadCsv(filename: string, csv: string): void` (browser Blob download — not unit tested)
  - `function downloadWorkbook(filename: string, wb: XLSX.WorkBook): void` (`XLSX.writeFile` — not unit tested)

- [ ] **Step 1: Write the failing test** — `src/dealCompsV1/lib/export.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { toExportObjects, buildCsv } from './export';
import { COLUMN_DEFS } from './columns';
import type { CompTransaction } from '@/dealCompsV1/data/types';

function tx(p: Partial<CompTransaction>): CompTransaction {
  return {
    id: 'x', targetCompany: 'X', targetDescription: '', sector: 'Medical Devices',
    region: 'North America', location: 'US', countryCode: 'US', announcementDate: '2025-11-15',
    buyer: 'B', buyerType: 'Strategic', employees: 100, dealSize: 450, currency: 'USD',
    revenue: 85, ebitda: 32, ebit: 26, enterpriseValue: 450,
    evRevenueMultiple: 5.3, evEbitdaMultiple: 14.1, evEbitMultiple: 17.3, status: 'Included', ...p,
  };
}

const cols = (keys: string[]) => COLUMN_DEFS.filter((c) => keys.includes(c.key));

describe('toExportObjects', () => {
  it('keys by label and uses raw values for visible columns only', () => {
    const out = toExportObjects([tx({})], cols(['target', 'enterpriseValue', 'evEbitdaMultiple']));
    expect(out).toEqual([{ Target: 'X', EV: 450, 'EV/EBITDA': 14.1 }]);
  });
});

describe('buildCsv', () => {
  it('renders header + rows, empty for null', () => {
    const csv = buildCsv([tx({ enterpriseValue: null })], cols(['target', 'enterpriseValue']));
    expect(csv).toBe('Target,EV\nX,');
  });
  it('escapes commas, quotes, and newlines', () => {
    const csv = buildCsv([tx({ targetCompany: 'A, "B"\nC' })], cols(['target']));
    expect(csv).toBe('Target\n"A, ""B""\nC"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- export`
Expected: FAIL.

- [ ] **Step 3: Write `src/dealCompsV1/lib/export.ts`**

```ts
import * as XLSX from 'xlsx';
import type { CompTransaction } from '@/dealCompsV1/data/types';
import type { ColumnDef } from './columns';
import type { MultipleStat } from './stats';

export function toExportObjects(
  rows: CompTransaction[],
  columns: ColumnDef[]
): Record<string, string | number | null>[] {
  return rows.map((t) => {
    const obj: Record<string, string | number | null> = {};
    for (const c of columns) obj[c.label] = c.value(t);
    return obj;
  });
}

function csvCell(value: string | number | null): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function buildCsv(rows: CompTransaction[], columns: ColumnDef[]): string {
  const header = columns.map((c) => csvCell(c.label)).join(',');
  const body = rows.map((t) => columns.map((c) => csvCell(c.value(t))).join(',')).join('\n');
  return body ? `${header}\n${body}` : header;
}

export function buildWorkbook(
  rows: CompTransaction[],
  columns: ColumnDef[],
  stats: MultipleStat[]
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const summary = stats.map((s) => ({
    Multiple: s.label,
    Min: s.min, Median: s.median, Max: s.max, N: s.n,
  }));
  const wsSummary = XLSX.utils.json_to_sheet(summary);
  wsSummary['!cols'] = [{ wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 6 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  const objects = toExportObjects(rows, columns);
  const wsRows = XLSX.utils.json_to_sheet(objects.length ? objects : [Object.fromEntries(columns.map((c) => [c.label, '']))]);
  wsRows['!cols'] = columns.map((c) => ({ wch: Math.min(Math.max(c.label.length + 2, 12), 40) }));
  XLSX.utils.book_append_sheet(wb, wsRows, 'Transactions');

  return wb;
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadWorkbook(filename: string, wb: XLSX.WorkBook): void {
  XLSX.writeFile(wb, filename);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- export`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/dealCompsV1/lib/export.ts src/dealCompsV1/lib/export.test.ts
git commit -m "feat: add V1 CSV/Excel export"
```

---

## Task 9: Filter definitions + `FilterControls.tsx`

**Files:**
- Create: `src/dealCompsV1/data/filterDefs.tsx`, `src/dealCompsV1/components/FilterControls.tsx`

**Interfaces:**
- Consumes: types; `extentOf` from `@/dealCompsV1/lib/filtering`; `cn` from `@/lib/utils`; `SECTORS/REGIONS/BUYER_TYPES`.
- Produces (filterDefs.tsx):
  - `type FilterKind = 'multi' | 'range' | 'date'`
  - `interface FilterDef { key: keyof DealCompFilters; label: string; shortLabel: string; icon: React.ReactNode; kind: FilterKind; options?: string[]; unit?: string; suffix?: string; step?: number }`
  - `const FILTER_DEFS: FilterDef[]` — sector(multi, options SECTORS), buyerType(multi, options BUYER_TYPES), geography(multi, options REGIONS), employees(range), revenue(range, unit `$`, suffix `M`), ebitda(range, unit `$`, suffix `M`), evEbitda(range, suffix `x`, step 0.1), evRevenue(range, suffix `x`, step 0.1), announcementDate(date)
- Produces (FilterControls.tsx):
  - `function MultiSelect({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (next: string[]) => void })`
  - `function RangeControl({ value, onChange, min, max, step, unit, suffix }: { value: RangeFilter; onChange: (r: RangeFilter) => void; min: number; max: number; step?: number; unit?: string; suffix?: string })` — dual-thumb `<input type="range">` pair + two numeric inputs; empty input → `null`.
  - `function DateRangeControl({ value, onChange }: { value: DateRange; onChange: (d: DateRange) => void })` — two `<input type="date">` + quick-preset buttons (Last 1y/3y/5y) computed from the latest `announcementDate` in scope; pass a `latestDate?: string` prop for presets.

- [ ] **Step 1: Write `src/dealCompsV1/data/filterDefs.tsx`**

Use lucide icons (`Building2, Briefcase, Globe, Users, BarChart3, TrendingUp, Calendar`). Mirror the structure of the existing `src/dealComps/components/FilterBar.tsx` `ALL_FILTERS` array (read it for the visual/icon pattern), but typed to `keyof DealCompFilters` and the V1 filter set only. Provide `options` for the three multi filters from `SECTORS/REGIONS/BUYER_TYPES`.

- [ ] **Step 2: Write `src/dealCompsV1/components/FilterControls.tsx`**

`MultiSelect`: reuse the checkbox-list pattern from the existing `FilterBar.tsx` `MultiSelect`. `RangeControl`: render two `type="range"` sliders (min thumb, max thumb) bound to `value.min ?? min` / `value.max ?? max`, plus two `type="number"` inputs whose empty string maps to `null`; clamp slider values into `[min,max]`. `DateRangeControl`: two date inputs writing `from`/`to` (empty → null) and three preset buttons.

- [ ] **Step 3: Verify it compiles**

Run: `npm run lint`
Expected: PASS (no usages yet is fine; ensure no unused-import errors by exporting all three controls and `FILTER_DEFS`).

- [ ] **Step 4: Commit**

```bash
git add src/dealCompsV1/data/filterDefs.tsx src/dealCompsV1/components/FilterControls.tsx
git commit -m "feat: add V1 filter definitions and selection controls"
```

---

## Task 10: `CompanySelect.tsx` + `LandingPage.tsx` (2-step start)

**Files:**
- Create: `src/dealCompsV1/components/CompanySelect.tsx`, `src/dealCompsV1/components/LandingPage.tsx`

**Interfaces:**
- Consumes: `PRESET_COMPANIES`; `PresetCompany`, `DealCompFilters`; `FILTER_DEFS`; `MultiSelect/RangeControl/DateRangeControl`; `extentOf`; `motion` from `motion/react`.
- Produces:
  - `function CompanySelect({ companies, value, onSelect }: { companies: PresetCompany[]; value: PresetCompany | null; onSelect: (c: PresetCompany) => void })` — searchable dropdown (text input filters by name; click selects).
  - `function LandingPage({ companies, onRun }: { companies: PresetCompany[]; onRun: (company: PresetCompany, filters: DealCompFilters) => void })`

**Behavior:** 2-step wizard, progress bar `step/2`. Step 1: heading "1. Select Target Company", `CompanySelect`. On select, store company and seed `draftFilters = company.presetFilters`; enable Next. Step 2: heading "2. Filters", render each `FILTER_DEFS` entry with its control bound to `draftFilters[key]`; range bounds via `extentOf(company.transactions, mapKeyToField(key))`. Footer: Back / "Run Analysis" → `onRun(company, draftFilters)`. No upload, no AI badge, no soft filters.

`mapKeyToField`: `employees→employees`, `revenue→revenue`, `ebitda→ebitda`, `evEbitda→evEbitdaMultiple`, `evRevenue→evRevenueMultiple`.

- [ ] **Step 1: Write `CompanySelect.tsx`** (text input + filtered dropdown list of `companies`, showing name + description; outside-click closes — reuse the `useEffect` outside-click pattern from existing `FilterBar.tsx`).

- [ ] **Step 2: Write `LandingPage.tsx`** following the 2-step structure above; reuse the card/progress/footer visual pattern from `src/dealComps/components/LandingPage.tsx` (read it), but only 2 steps and only the V1 controls.

- [ ] **Step 3: Verify it compiles**

Run: `npm run lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/dealCompsV1/components/CompanySelect.tsx src/dealCompsV1/components/LandingPage.tsx
git commit -m "feat: add V1 2-step landing (company select + filters)"
```

---

## Task 11: `StatsGrid.tsx`

**Files:**
- Create: `src/dealCompsV1/components/StatsGrid.tsx`

**Interfaces:**
- Consumes: `MultipleStat` from `@/dealCompsV1/lib/stats`; `formatMultiple` from `@/dealCompsV1/lib/format`.
- Produces: `function StatsGrid({ stats }: { stats: MultipleStat[] })`

**Behavior:** Render a card with one row per stat: label, then Min / Median / Max (via `formatMultiple`) and `N = {n}`. `null` values render as `—`. Use a 3-column-per-row compact layout (mirror `StatCard` styling from `src/dealComps/components/Dashboard.tsx`).

- [ ] **Step 1: Write `StatsGrid.tsx`.**
- [ ] **Step 2: Verify** — `npm run lint` → PASS.
- [ ] **Step 3: Commit** — `git add ... && git commit -m "feat: add V1 stats grid"`

---

## Task 12: `FilterBar.tsx` (wired active filters)

**Files:**
- Create: `src/dealCompsV1/components/FilterBar.tsx`

**Interfaces:**
- Consumes: `DealCompFilters`, `CompTransaction`; `FILTER_DEFS`; `MultiSelect/RangeControl/DateRangeControl`; `extentOf`; `EMPTY_FILTERS`; `cn`.
- Produces: `function FilterBar({ filters, onChange, transactions }: { filters: DealCompFilters; onChange: (next: DealCompFilters) => void; transactions: CompTransaction[] })`

**Behavior:** Reproduce the chip+popover UX of `src/dealComps/components/FilterBar.tsx` (read it — reuse `FilterChip`, `Popover`, outside-click handling) but **wired**: render one chip per `FILTER_DEFS` entry, chip label = `${shortLabel}: ${displayValue(filters[key])}`, click opens a popover with the matching control bound to `filters[key]` calling `onChange({ ...filters, [key]: next })`. X on a chip resets that key to its `EMPTY_FILTERS` value. "Clear all" → `onChange(EMPTY_FILTERS)`. Provide a local `chipDisplayValue(def, filters)` like the existing one (multi → joined/`+N`; range → `min – max` / `>=`/`<=`; date → range text; else `Any`). Drop the "Soft Filters"/"Keywords" sections (not in V1).

- [ ] **Step 1: Write `FilterBar.tsx`.**
- [ ] **Step 2: Verify** — `npm run lint` → PASS.
- [ ] **Step 3: Commit** — `git commit -m "feat: add V1 wired filter bar"`

---

## Task 13: `ColumnPicker.tsx` + `ResultsTable.tsx`

**Files:**
- Create: `src/dealCompsV1/components/ColumnPicker.tsx`, `src/dealCompsV1/components/ResultsTable.tsx`

**Interfaces:**
- Consumes: `COLUMN_DEFS`, `toggleColumn`, `ColumnDef`; `CompTransaction`, `Status`; `cn`.
- Produces:
  - `function ColumnPicker({ visible, onChange }: { visible: Set<string>; onChange: (next: Set<string>) => void })` — button + dropdown of grouped checkboxes (Company / Transaction / Multiples); `alwaysOn` columns shown checked + disabled; each toggle calls `onChange(toggleColumn(visible, key))`.
  - `type StatusTab = 'all' | 'included' | 'excluded'`
  - `function ResultsTable({ transactions, visibleColumns, statusTab, onStatusTabChange, onToggleStatus }: { transactions: CompTransaction[]; visibleColumns: Set<string>; statusTab: StatusTab; onStatusTabChange: (t: StatusTab) => void; onToggleStatus: (id: string) => void })`

**Behavior (ResultsTable):** Filter `transactions` by `statusTab` (all / Included / Excluded) for display. Tabs row with counts (mirror existing `ResultsTable.tsx` `FilterTab`). Render a `<table>`: first column = include/exclude toggle button (calls `onToggleStatus(tx.id)`; Included → red "Exclude", Excluded → green "Include", per existing pattern); then one `<td>` per `COLUMN_DEFS` entry whose key ∈ `visibleColumns`, using `def.display(tx)`, right/left aligned per `def.align`. Excluded rows get reduced opacity. The `geography` cell may show the flag (`https://flagcdn.com/w20/${tx.countryCode.toLowerCase()}.png`) + region, matching the existing table.

- [ ] **Step 1: Write `ColumnPicker.tsx`.**
- [ ] **Step 2: Write `ResultsTable.tsx`.**
- [ ] **Step 3: Verify** — `npm run lint` → PASS.
- [ ] **Step 4: Commit** — `git commit -m "feat: add V1 column picker and results table"`

---

## Task 14: `Dashboard.tsx`

**Files:**
- Create: `src/dealCompsV1/components/Dashboard.tsx`

**Interfaces:**
- Consumes: `StatsGrid`, `FilterBar`, `ColumnPicker`, `ResultsTable` (+ `StatusTab`); `filterTransactions`, `computeAllStats`, `COLUMN_DEFS`, `buildCsv`, `buildWorkbook`, `downloadCsv`, `downloadWorkbook`; types.
- Produces:
  - `function Dashboard({ company, transactions, filters, onFiltersChange, onToggleStatus, visibleColumns, onVisibleColumnsChange }: { company: PresetCompany; transactions: CompTransaction[]; filters: DealCompFilters; onFiltersChange: (f: DealCompFilters) => void; onToggleStatus: (id: string) => void; visibleColumns: Set<string>; onVisibleColumnsChange: (v: Set<string>) => void })`

**Behavior:**
- `const filteredRows = useMemo(() => filterTransactions(transactions, filters), [transactions, filters])`.
- `const includedFiltered = useMemo(() => filteredRows.filter((t) => t.status === 'Included'), [filteredRows])`.
- `const stats = useMemo(() => computeAllStats(includedFiltered), [includedFiltered])`.
- Local `statusTab` state.
- `const visibleCols = COLUMN_DEFS.filter((c) => visibleColumns.has(c.key))`.
- Export uses the currently-displayed rows: `const exportRows = filteredRows.filter(byStatusTab(statusTab))`. CSV → `downloadCsv('Deal_Comps_V1.csv', buildCsv(exportRows, visibleCols))`. Excel → `downloadWorkbook('Deal_Comps_V1.xlsx', buildWorkbook(exportRows, visibleCols, stats))`.
- Layout: header (`company.name` + `{filteredRows.length} results`), `StatsGrid`, `FilterBar`, a toolbar row with `ColumnPicker` + Export menu (CSV / Excel — mirror the export-menu pattern in existing `Dashboard.tsx`), then `ResultsTable`. Scrollable container like existing Dashboard.

- [ ] **Step 1: Write `Dashboard.tsx`.**
- [ ] **Step 2: Verify** — `npm run lint` → PASS.
- [ ] **Step 3: Commit** — `git commit -m "feat: add V1 dashboard with live stats and export"`

---

## Task 15: `DealCompsV1App.tsx` + wire into `App.tsx`

**Files:**
- Create: `src/dealCompsV1/DealCompsV1App.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `LandingPage`, `Dashboard`; `PRESET_COMPANIES`; `defaultVisibleColumns`; types.
- Produces: `function DealCompsV1App()` (no props); `App.tsx` renders it for `module === 'dealV1'`, defaulting to `'dealV1'`.

**Behavior (DealCompsV1App):** State: `phase: 'setup' | 'dashboard'` (init `'setup'`), `company: PresetCompany | null`, `transactions: CompTransaction[]`, `filters: DealCompFilters`, `visibleColumns: Set<string>` (init `defaultVisibleColumns()`).
- `handleRun(company, filters)`: set company, `setTransactions(company.transactions.map((t) => ({ ...t })))`, `setFilters(filters)`, `setPhase('dashboard')`.
- `toggleStatus(id)`: map transactions toggling `status`.
- Render: `phase === 'setup'` → `LandingPage` (full width, wrapped in a `flex-1 flex flex-col` container like `DealCompsApp`); else `Dashboard` with all props. No `Header`/`AssistantPanel`.

- [ ] **Step 1: Write `DealCompsV1App.tsx`.**

- [ ] **Step 2: Finalize `src/App.tsx`**

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { Sidebar, Module } from '@/shared/Sidebar';
import { DealCompsApp } from '@/dealComps/DealCompsApp';
import { DealCompsV1App } from '@/dealCompsV1/DealCompsV1App';

export default function App() {
  const [module, setModule] = useState<Module>('dealV1');
  const [assistantCollapsed, setAssistantCollapsed] = useState(true);
  const toggleAssistant = () => setAssistantCollapsed((c) => !c);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Sidebar activeModule={module} onModuleChange={setModule} />
      {module === 'deal' ? (
        <DealCompsApp assistantCollapsed={assistantCollapsed} onToggleAssistant={toggleAssistant} />
      ) : (
        <DealCompsV1App />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Full verification**

Run: `npm test && npm run lint && npm run build`
Expected: all tests pass; tsc clean; build succeeds.

- [ ] **Step 4: Manual smoke test**

Run: `npm run dev`, open the app. Verify: opens on Deal Comps V1; pick a company → filters pre-fill → Run; table + stats render; changing a filter and toggling a row update stats live; show/hide columns works; CSV and Excel download reflect filtered rows + visible columns; the existing Deal Comps tab still works unchanged.

- [ ] **Step 5: Commit**

```bash
git add src/dealCompsV1/DealCompsV1App.tsx src/App.tsx
git commit -m "feat: wire Deal Comps V1 module into app shell"
```

---

## Self-Review Notes

- **Spec coverage:** Public Comps removal (T1) · Vitest (T2) · data model + EBIT/region + 3 self-contained companies (T3) · format (T4) · Min/Median/Max/N stats incl. EV/EBIT (T5) · live filtering w/ validation rules (T6) · show/hide columns (T7) · CSV+Excel of current view (T8) · selection controls / range bar / dropdown / date (T9) · 2-step start w/ preset prefill (T10) · stats grid (T11) · inline-editable/removable filter bar (T12) · table + include/exclude toggle + column picker (T13) · live recompute dashboard + export (T14) · second sidebar item, default V1, old module intact (T1+T15). All §13 done-criteria mapped.
- **Type consistency:** `MultipleStat` fields (`min/median/max/n`) consistent across T5/T8/T11; `ColumnDef.value/display` consistent across T7/T8/T13/T14; `DealCompFilters` keys consistent across T3/T6/T9/T10/T12; `filterTransactions`/`computeAllStats` signatures consistent T5/T6/T14.
- **Placeholders:** none — pure-logic tasks carry full test+impl code; UI tasks carry exact interfaces + behavior + named existing files to mirror.
