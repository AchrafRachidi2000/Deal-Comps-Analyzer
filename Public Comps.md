The way solutioning will be structured is as follows

- Solutioning
    - 1/ Start by decomposing the different pieces of the puzzle
    - 2/ figure out the play between Deal comps and Trading comps (why they’re meant to be leveraged with each other? added value? how can we proceed with it)
    - 3/ Identify risks, open questions and start involving the squad
    - 4/ Define testing / discovery work required
        - UI/UX: Experience (wireframing) + user interview

---

## 1. PUZZLE DECOMPOSITION: Core Components

### A. Output table: what columns does the analyst need?

Both user interviews ([Youssef](https://www.notion.so/Youssef-Trading-Comps-3435bdbd462180d99bc7fab6b0e9bd42?pvs=21) and [Mayo](https://www.notion.so/Mayo-Trading-Comps-33c5bdbd4621808193c3c74e58a06705?pvs=21)) describe a concrete table structure they build in Excel today. This is what the product needs to produce.

**Mayo's stated column order:**

Ticker → Company Name → Company Description → Country → Reference Date → Financial Data

**Youssef's workflow confirmation:**

Same structure. Tickers are the key unit: once tickers are selected, they plug them into a CapIQ-linked Excel template that auto-populates market cap, EV, financials, and multiples.

The columns below are derived from what both users described as essential, organized by function.

#### Tier 1: Company identity (the peer row itself)

These columns define *which company* is in the comp set. Every row must have these.

| **Column** | **Why it matters (from interviews)** |
| --- | --- |
| **Ticker** | The primary identifier in the analyst's workflow. Youssef: "take all the tickers and plug them into a spreadsheet linked with Capital IQ." Mayo lists ticker as the first column. |
| **Company Name** | Display label. Both users list it as column 2. |
| **Company Description** | The single most important field for peer selection. Youssef: "read through business descriptions to compare business models and identify which peers truly match the target company's business model." This is the most manual, judgment-heavy step in the entire workflow. |
| **Country** | Geography filter. Mayo lists it as column 4. Used to filter peer universe by region (e.g., "European SaaS companies"). |

#### Tier 2: Market data (the EV numerator)

These columns are what makes trading comps different from deal comps. The numerator (Enterprise Value) comes from live market data, not a historical transaction price. 

⇒ **EV = Market Cap + Total Debt - Cash (+ Preferred Stock + Minority Interest when applicable).**

| **Column** | **Why it matters** | **Notes / Open questions** |
| --- | --- | --- |
| **Share Price** | Displayed in the comps table. Together with shares outstanding, derives market cap. Also needed for P/E computation (Price / EPS). | As-of date matters: market prices move daily. Need a clear "reference date" policy…. frequency of update |
| **Market Cap** | Size proxy for filtering the peer universe by size band. Also the equity-value building block for EV. | Derived from Share Price x Shares Outstanding |
| **Enterprise Value (EV)** | The numerator for all EV-based multiples (EV/Revenue, EV/EBITDA). This is the core output. Unlike deal comps where "implied EV" is ambiguous, EV here is computable from market data and is unambiguous. | Prefer CapIQ pre-computed EV if available. Otherwise derive: Market Cap + Total Debt - Cash. |
| **Net Debt** | EV bridge component. | Mentioned in the user interviews but TBD whether to include it or not (I think the idea behind them is to give some sort of reassurance to the validity of the EV, Youssef mentioned that sometimes he runs the numbers himself) |
| **Cash & Equivalents** | EV bridge component. | Same |

#### Tier 3: Financial data (the denominators)

The denominators for the multiples. Both users confirm LTM is the primary financial basis.

**Youssef on LTM vs NTM:** "LTM I would say is more important." NTM is important when the company is distressed, near breakeven, or had a one-off bad year. NTM also serves as a sanity check: "if median NTM is growing 20-30% and the company's business plan says 60%, something is off."

**Mayo on LTM vs NTM:** "LTM is more defensible. It has happened already, not subject to volatility or macroeconomic uncertainty." NTM is kept "at the back of your hands" as a secondary reference.

| **Column** | **Time basis** | **Why it matters** | **Notes / Open questions** |
| --- | --- | --- | --- |
| **Reference Date** | - | Mayo lists this explicitly as a column: the date to which the financial data refers (e.g., "LTM as of Dec 2025" or "FY 2025"). Without it, the analyst cannot interpret the financials. | Different peers may have different fiscal year ends (TBD on how detrimental is that for the peerset) |
| **Revenue** | LTM (primary) | Denominator for EV/Revenue. The most universally available financial metric. Both users pull it. | LTM computation: last 4 quarters, or trailing 12 months from the latest filing date? |
| **EBITDA** | LTM (primary) | Denominator for EV/EBITDA. The most commonly used profitability-based multiple in PE. | Adjusted vs. as-reported? This matters: adjusted EBITDA strips out one-offs. Need to confirm which CapIQ provides and whether the user should choose. |
| **Revenue (NTM)** | NTM (secondary) | Forward EV/Revenue. Used for growth companies, distressed situations, and as a sanity check on target projections (Youssef's use case). | Source: consensus analyst estimates. Coverage will vary: strong for US/EU large/mid-cap, thin for MENA and small-cap. What do we show when NTM is missing? |
| **EBITDA (NTM)** | NTM (secondary) | Forward EV/EBITDA. Same use cases as NTM revenue. | Same coverage question. |
| **Net Income / EPS** | LTM | Needed for P/E multiple. Sector-dependent (more common in financials, consumer, industrials). |  |

#### Tier 4: Computed multiples (the output)

These are computed from Tier 2 (numerator) and Tier 3 (denominator). Youssef confirms these auto-populate from CapIQ once tickers are entered. The product should either pull pre-computed multiples from CapIQ or compute them and label which method was used.

| **Multiple** | **Formula** | **Time basis** | **Notes** |
| --- | --- | --- | --- |
| **EV / Revenue** | Enterprise Value / Revenue | LTM (primary), NTM (secondary) | We need to check how we can land on these (is it through computation or are they readily available in the dataset/s to be used) |
| **EV / EBITDA** | Enterprise Value / EBITDA | LTM (primary), NTM (secondary) | Same |
| **P / E** | Share Price / Earnings Per Share | LTM (primary) | Same comment |

#### Tier 5: Benchmarking metrics (same peer set, different output)

Youssef confirms benchmarking "goes hand in hand" with trading comps: "it's a different spreadsheet but uses the same peer set." These metrics are not used for the multiples computation but for comparing the target company's operational performance against the peer set.

| **Metric** | **Why it matters** | **Notes** |
| --- | --- | --- |
| **Revenue Growth (YoY)** | Is the target growing faster or slower than peers? Key for justifying a premium or discount to the peer median multiple. |  |
| **EBITDA Margin** | Profitability comparison. A target with higher margins than peers may deserve a premium multiple. |  |
| **NTM Growth (Revenue)** | Youssef's sanity check use case: compare peer set NTM median growth against the target's business plan projections. If peers grow 20-30% and target claims 60%, flag the discrepancy. | Depends on NTM estimate availability. |
| **Net Debt / EBITDA** | Leverage comparison. Relevant for PE context (debt capacity). |  |

**Note from Youssef:** Sometimes private (unlisted) companies are added to the benchmarking set from regulatory disclosures. The product should support mixed public + private peer sets for benchmarking, even though the multiples computation is public-only.

#### Tier 6: Aggregation stats (the summary row)

Both users describe this as the bottom of the comps table: summary statistics across all peers.

| **Statistic** | **Applied to** | **Notes** |
| --- | --- | --- |
| **Minimum** | Each multiple (EV/Revenue, EV/EBITDA, P/E) |  |
| **25th percentile** | Each multiple |  |
| **Median** | Each multiple | The primary benchmark. Mayo: analysts typically "go with the lower/more conservative number" when comparing public vs deal comps. |
| **Mean** | Each multiple |  |
| **75th percentile** | Each multiple |  |
| **Maximum** | Each multiple |  |
| **Sample size** | Each multiple | Critical: "EV/EBITDA median: 12.3x (10 of 12 peers)." If EBITDA is missing for some peers, the sample size for EV/EBITDA will differ from EV/Revenue. Surface this explicitly. |

### B. Key differences: Trading Comps vs Deal Comps

Understanding these differences is critical because many deal comps assumptions do not carry over.

| **Dimension** | **Deal Comps (Precedent Transactions)** | **Trading Comps (Public Comps)** |
| --- | --- | --- |
| **Numerator (EV)** | Implied EV from transaction value. Often ambiguous: equity value vs EV, partial stake, assumed debt unclear. | Computable from market data: Market Cap + Net Debt. Unambiguous for listed companies. |
| **Denominator (Financials)** | Target financials at time of deal (historical, often stale or sparse). | Current/recent financials: LTM from latest filings, NTM from consensus estimates. |
| **Control premium** | Embedded in the transaction price (buyer paid a premium for control). | Reflects minority/market pricing. No control premium. Analysts apply adjustments separately. |
| **Ownership / stake complexity** | Major issue: majority vs minority vs unknown stake distorts EV interpretation. | Not applicable. We observe market prices for publicly traded equity. |
| **Data freshness** | Point-in-time: deal happened in the past, financials frozen at deal date. | Current: market data updates daily, financials update quarterly. Supports recurring portfolio monitoring. |
| **Volatility** | Stable: the deal price is fixed once closed. | Volatile: market prices move daily. User must choose an as-of date. Multiples shift with market sentiment. |
| **Weight in IC** | Primary valuation anchor in PE. Mayo: "give more weight to precedent comps." | Secondary / sanity check. Mayo: "presented side by side, typically go with the lower/more conservative number." |
| **Recurring use** | Deal-driven only. | Deal-driven + quarterly portfolio monitoring. Mayo: "every investment is valued quarterly, industry standard practice." |

### C. Workflow decomposition: the step-by-step

Both users describe the same end-to-end process. Here is the decomposition into discrete steps, with the analyst's actions and our product's role at each stage.

**Step 0: Trigger**

- **Deal-driven:** Analyst receives a target company to value. Needs to run public comps as one of two parallel valuation approaches (the other being deal comps). Always presented side by side (Mayo).
- **Portfolio monitoring:** Quarterly refresh of existing peer sets for portfolio companies (Mayo: "industry standard").
- **Product implication:** Need to support both "new comps from scratch" and "refresh existing saved peer set."

**Step 1: Identify the sector**

- Analyst determines what sector the target operates in.
- **Product implication:** Sector classification + sector search ⇒ We already have this from the company search.

**Step 2: Search for public companies in the sector + geography**

- Youssef: "Go to Capital IQ or Bloomberg, input sector + geography, filter by public companies, pull out the list."
- **Product implication:** Our search engine is supposed to filter to public/listed companies only. restricted to companies with an active listing/ticker.

**Step 3: Read business descriptions and select peers**

- Youssef: "Read through business descriptions to compare business models. Identify which peers truly match the target company's business model."
- This is the **most manual step** in the entire workflow. Both users confirm it. Youssef already uses AI (Claude) to accelerate this step.
- **Product implication:** This is where AI sanity checks similarly to the custom attributes (or similarity search) adds the most value. Peer suggestion with similarity scoring + description display. But the analyst must retain full control to add/remove peers. Do not auto-finalize the peer set.

**Step 4: Extract / pull data**

- Youssef: "Take all the tickers, plug them into a spreadsheet linked with Capital IQ. Template auto-exports: market cap, EV, financials, multiples, and all relevant data points." ⇒ This step is **already automated** in the current workflow via CapIQ Excel plugin.
- **Product implication:** We replicate this automation where we generate the tickers and the associated columns in one table

**Step 5: Review, compute multiples, produce summary stats**

- Analyst reviews the populated table, checks for data gaps, computes aggregation stats (min, median, mean, max, quartiles).
- **Product implication:** Auto-compute multiples + aggregation stats.
    - Flag missing data
    - outliers
    - negative EBITDA
    - Show sample sizes per multiple.

**Step 6: Benchmarking (parallel output)**

- Youssef: "Benchmarking is done at the same time. Different spreadsheet, same peer set." ⇒ Compare target company metrics (growth, margins, leverage) against the peer set.
- **Product implication:** Same peer set feeds both the multiples table and the benchmarking table. Two outputs, one data pull.