import React, { useState } from 'react';
import {
  ChevronRight,
  Save,
  Plus,
  ListPlus,
  Bookmark,
  Building2,
  MapPin,
  Globe,
  Linkedin,
  DollarSign,
  Users,
  ArrowLeftRight,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DealCompsSection } from './DealCompsSection';

const COMPANY = {
  name: 'Sanara MedTech',
  location: 'Fort Worth, United States',
  founded: 2007,
  website: 'sanaramedtech.com',
  tags: ['Private', 'Medtech'],
};

const OVERVIEW = [
  { label: 'Revenue', value: '$50M – $100M', icon: <DollarSign className="w-4 h-4" /> },
  { label: 'Employees', value: '101 – 250', icon: <Users className="w-4 h-4" /> },
  { label: 'Financed in', value: '11 transactions', icon: <ArrowLeftRight className="w-4 h-4" /> },
  { label: 'Seller in', value: '2 transactions', icon: <ArrowLeftRight className="w-4 h-4" /> },
  { label: 'Investor in', value: '11 transactions', icon: <ArrowLeftRight className="w-4 h-4" /> },
];

const BUSINESS = [
  {
    title: 'Offerings & business units',
    body: 'Surgical and wound-care technologies, including a hydrolyzed type-I bovine collagen powder used in soft-tissue repair, antimicrobial skin substitutes, and bioactive tissue products distributed into North American surgical and advanced wound-care markets.',
  },
  {
    title: 'Target customers',
    body: 'Hospitals and surgical centers are the core buyers, with purchasing centered on products used by physicians and clinicians in hospital settings and outpatient surgical wound care.',
  },
  {
    title: 'Business model',
    body: 'Develops, markets, and distributes surgical, wound, and skincare products sold primarily into the North American surgical market. Roughly 80% of revenue comes from direct sales, with the balance through 400+ distributor partners.',
  },
  {
    title: 'Geographical presence',
    body: 'Headquartered in Fort Worth, United States, which also serves as its primary manufacturing base. Physical presence is concentrated in North America with a limited direct sales force operating across US states.',
  },
  {
    title: 'Company strategy',
    body: 'Pursuing a clinician-oriented portfolio of surgical technologies while lowering healthcare costs, targeting a $10B-plus surgical solutions market and building a stronger surgical-focused platform.',
  },
];

const SUBSIDIARIES = [
  { name: 'United Wound and Skin Solutions', loc: 'Fort Worth' },
  { name: 'Cellerate', loc: 'Austin' },
  { name: 'Portalos', loc: 'San Jose' },
  { name: 'Resorbable Orthopedic Products', loc: 'Fort Worth' },
  { name: 'Rochal Technologies', loc: 'San Antonio' },
  { name: 'Sanara Biologics', loc: 'Fort Worth' },
];

const PEOPLE = [
  { name: 'Seth D. Yon', title: 'President & Chief Executive Officer', tags: ['CEO', 'President', 'Board Director'] },
  { name: 'Elizabeth Taylor', title: 'Chief Financial Officer', tags: ['CFO', 'Finance'] },
  { name: 'Michael McNeil', title: 'Chief Accounting Officer & Chief Administrative Officer', tags: ['CAO', 'CAdO'] },
  { name: 'Ron Nixon', title: 'Executive Chairman', tags: ['Executive Chairman', 'Former CEO'] },
];

const DEALS = [
  { date: 'Jan 24, 2025', subject: 'Biomimetic Innovations', investor: 'Sanara MedTech', seller: '—', size: '—' },
  { date: 'Sep 10, 2024', subject: 'Chemo Acquisition', investor: 'Sanara MedTech', seller: '—', size: '—' },
  { date: 'Jul 5, 2022', subject: 'Sanara CMP', investor: 'Sanara MedTech', seller: '—', size: '$18M' },
  { date: 'Oct 15, 2019', subject: 'Cellerate', investor: 'Sanara MedTech', seller: 'The Catalyst Group', size: '$16M' },
  { date: 'Jul 31, 2015', subject: 'Sanara MedTech', investor: '—', seller: '—', size: '$0' },
  { date: 'Dec 8, 2013', subject: 'Sanara MedTech', investor: 'Undiscovered Equities', seller: '—', size: '$2M' },
];

const SIMILAR = [
  { name: 'MiMedx Group', loc: 'United States', employees: '501–1K', founded: 2006, industries: 'Pharmaceuticals, Biotechnology' },
  { name: 'Globus Medical', loc: 'United States', employees: '5K–10K', founded: 2003, industries: 'Health Care Equipment' },
  { name: 'Aroa Biosurgery', loc: 'New Zealand', employees: '251–500', founded: 2008, industries: 'Health Care Equipment' },
  { name: 'Guanhao Biotech', loc: 'China', employees: '501–1K', founded: 1999, industries: 'Health Care Equipment' },
  { name: 'Bactrin International', loc: 'United States', employees: '101–250', founded: 2006, industries: 'Pharmaceuticals' },
  { name: 'Bone Biologics', loc: 'United States', employees: '11–50', founded: 2004, industries: 'Pharmaceuticals' },
];

const NEWS = [
  { source: 'meeting.com', date: 'Jun 17, 2026', title: 'Freedom broker initiates Sanara MedTech with buy rating' },
  { source: 'meeting.com', date: 'May 12, 2026', title: 'Earnings call transcript: Sanara MedTech Q1 2026 beats EPS' },
  { source: 'globenewswire.com', date: 'May 11, 2026', title: 'Sanara MedTech reports first-quarter 2026 financial results' },
];

const SWOT: Record<string, string> = {
  Strength:
    'Differentiated product and technology stack — a portfolio of named wound- and tissue-repair capabilities under a single commodity price, including proprietary collagen processing and antimicrobial substrates.',
  Weakness:
    'Concentration in North America and reliance on a limited direct sales force may cap near-term reach relative to larger, better-capitalized medtech peers.',
  Opportunity:
    'Commercial traction in the surgical segment — Q1 2026 revenue grew 26% with momentum tied to expanding distribution, deeper facility penetration, and adoption of differentiated products.',
  Threat:
    'Reimbursement pressure and competition from scaled strategics could compress margins and slow adoption in commoditized wound-care categories.',
};

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'business', label: 'Business' },
  { id: 'subsidiaries', label: 'Subsidiaries' },
  { id: 'people', label: 'Key people' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'deal-comps', label: 'Deal Comps' },
  { id: 'similar', label: 'Similar companies' },
  { id: 'news', label: 'News' },
  { id: 'swot', label: 'SWOT analysis' },
];

export function AssessApp() {
  const [swotTab, setSwotTab] = useState<keyof typeof SWOT>('Strength');

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/60">
      {/* Top bar */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Medtech</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span>Assess · Company Radar</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">{COMPANY.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md">
            <ListPlus className="w-4 h-4" /> Add to screening list
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md">
            <Bookmark className="w-4 h-4" /> Save as artifact
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100">
            <Save className="w-4 h-4" /> Save
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm">
            <Plus className="w-4 h-4" /> New workflow
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 flex gap-8">
          {/* Section nav */}
          <nav className="hidden lg:block w-40 flex-shrink-0">
            <div className="sticky top-6 space-y-0.5">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={cn(
                    'block px-3 py-1.5 rounded-md text-sm text-gray-500 hover:bg-white hover:text-gray-900 transition-colors',
                    s.id === 'deal-comps' && 'text-indigo-600 font-medium'
                  )}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Main */}
          <main className="flex-1 min-w-0 space-y-10">
            {/* Company header */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gray-900 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                {COMPANY.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{COMPANY.name}</h1>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {COMPANY.location}
                  </span>
                  <span>· Founded {COMPANY.founded}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {COMPANY.tags.map((t) => (
                    <span key={t} className="text-[11px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {t}
                    </span>
                  ))}
                  <a href="#" onClick={(e) => e.preventDefault()} className="p-1 text-blue-600 bg-blue-50 rounded hover:bg-blue-100">
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                  <a href="#" onClick={(e) => e.preventDefault()} className="p-1 text-gray-600 bg-gray-100 rounded hover:bg-gray-200">
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Overview */}
            <Section id="overview" title="Overview">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {OVERVIEW.map((o) => (
                  <div key={o.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1.5">
                      {o.icon}
                      <span className="text-[11px] uppercase tracking-wide font-medium">{o.label}</span>
                    </div>
                    <div className="text-sm font-bold text-gray-900">{o.value}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mt-4">
                {COMPANY.name} provides surgical and wound-care technologies that enable healthcare professionals to improve
                clinical outcomes and reduce costs, differentiated by proprietary tissue-repair and wound-care products
                distributed globally through direct and distributor partnerships.
              </p>
            </Section>

            {/* Business */}
            <Section id="business" title="Business">
              <div className="space-y-5">
                {BUSINESS.map((b) => (
                  <div key={b.title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1.5">{b.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{b.body}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs">
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" /> Claims & Evidence
                      </span>
                      <button className="text-indigo-600 hover:text-indigo-700 font-medium">Show more</button>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Subsidiaries */}
            <Section id="subsidiaries" title={`Subsidiaries · ${SUBSIDIARIES.length}`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SUBSIDIARIES.map((s) => (
                  <div key={s.name} className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.loc}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">Private · Subsidiary</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Key people */}
            <Section id="people" title={`Key people · ${PEOPLE.length}`}>
              <div className="space-y-2">
                {PEOPLE.map((p) => (
                  <div key={p.name} className="bg-white rounded-xl border border-gray-200 shadow-sm p-3.5">
                    <div className="flex items-center gap-2 mb-0.5">
                      {p.tags.map((t) => (
                        <span key={t} className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase tracking-wide">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                    <div className="text-sm text-gray-500">{p.title}</div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Transactions */}
            <Section id="transactions" title="Transactions">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Date</th>
                        <th className="px-4 py-2.5 font-semibold">Subject</th>
                        <th className="px-4 py-2.5 font-semibold">Investor</th>
                        <th className="px-4 py-2.5 font-semibold">Seller</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Size</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {DEALS.map((d, i) => (
                        <tr key={i} className="hover:bg-gray-50/70">
                          <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{d.date}</td>
                          <td className="px-4 py-2.5 font-medium text-gray-900">{d.subject}</td>
                          <td className="px-4 py-2.5 text-gray-600">{d.investor}</td>
                          <td className="px-4 py-2.5 text-gray-600">{d.seller}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-gray-700">{d.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Section>

            {/* Deal Comps — right below Transactions */}
            <DealCompsSection companyName={COMPANY.name} />

            {/* Similar companies */}
            <Section id="similar" title={`Similar companies · ${SIMILAR.length}`}>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold">Company name</th>
                        <th className="px-4 py-2.5 font-semibold">Location</th>
                        <th className="px-4 py-2.5 font-semibold">Employees</th>
                        <th className="px-4 py-2.5 font-semibold">Founded</th>
                        <th className="px-4 py-2.5 font-semibold">Industries</th>
                        <th className="px-4 py-2.5 font-semibold text-right">Links</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {SIMILAR.map((s) => (
                        <tr key={s.name} className="hover:bg-gray-50/70">
                          <td className="px-4 py-2.5 font-medium text-gray-900 whitespace-nowrap">{s.name}</td>
                          <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{s.loc}</td>
                          <td className="px-4 py-2.5 text-gray-600 tabular-nums">{s.employees}</td>
                          <td className="px-4 py-2.5 text-gray-600 tabular-nums">{s.founded}</td>
                          <td className="px-4 py-2.5 text-gray-500 text-xs">{s.industries}</td>
                          <td className="px-4 py-2.5 text-right">
                            <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex text-blue-600 hover:text-blue-800">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Section>

            {/* News */}
            <Section id="news" title="News">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {NEWS.map((n, i) => (
                  <a
                    key={i}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-3.5 hover:border-indigo-200 transition-colors block"
                  >
                    <div className="text-[11px] text-gray-400 mb-1">{n.date}</div>
                    <div className="text-sm font-medium text-gray-900 leading-snug line-clamp-3">{n.title}</div>
                    <div className="text-xs text-indigo-600 mt-2">{n.source}</div>
                  </a>
                ))}
              </div>
            </Section>

            {/* SWOT */}
            <Section id="swot" title="SWOT analysis">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center gap-1 mb-3">
                  {(Object.keys(SWOT) as (keyof typeof SWOT)[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSwotTab(t)}
                      className={cn(
                        'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                        swotTab === t ? 'bg-indigo-100 text-indigo-800' : 'text-gray-500 hover:bg-gray-50'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{SWOT[swotTab]}</p>
              </div>
            </Section>

            <div className="text-center text-xs text-gray-400 pt-4">© 2026 ALPHA10X. All rights reserved.</div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-sm font-semibold text-gray-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}
