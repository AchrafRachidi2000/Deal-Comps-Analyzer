import type { BuyerType, CompTransaction, DealCompFilters, PresetCompany } from './types';
import { EMPTY_FILTERS } from './types';

export { SECTORS, REGIONS, BUYER_TYPES } from './types';

/* ── Multiples derived from raw financials so they stay internally consistent ── */

type RawTx = Omit<CompTransaction, 'evRevenueMultiple' | 'evEbitdaMultiple' | 'evEbitMultiple' | 'similarityScore'>;

const round1 = (n: number) => Math.round(n * 10) / 10;

// Deterministic, varied similarity score (62–98%) derived from the row id.
function similarityFromId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 62 + (h % 37);
}

function withMultiples(rows: RawTx[]): CompTransaction[] {
  return rows.map((r) => ({
    ...r,
    evRevenueMultiple: r.enterpriseValue !== null && r.revenue ? round1(r.enterpriseValue / r.revenue) : null,
    evEbitdaMultiple: r.enterpriseValue !== null && r.ebitda && r.ebitda > 0 ? round1(r.enterpriseValue / r.ebitda) : null,
    evEbitMultiple: r.enterpriseValue !== null && r.ebit && r.ebit > 0 ? round1(r.enterpriseValue / r.ebit) : null,
    similarityScore: similarityFromId(r.id),
  }));
}

// Positional builder keeps the (large) comp tables readable. Figures are illustrative.
function mk(
  id: string,
  targetCompany: string,
  targetDescription: string,
  sector: string,
  region: string,
  location: string,
  countryCode: string,
  announcementDate: string,
  buyer: string,
  buyerType: BuyerType,
  employees: number | null,
  currency: string,
  revenue: number | null,
  ebitda: number | null,
  enterpriseValue: number | null
): RawTx {
  return {
    id, targetCompany, targetDescription, sector, region, location, countryCode, announcementDate,
    buyer, buyerType, employees, dealSize: enterpriseValue, currency, revenue, ebitda, ebit: null,
    enterpriseValue, status: 'Included',
  };
}

function filters(overrides: Partial<DealCompFilters>): DealCompFilters {
  return { ...EMPTY_FILTERS, ...overrides };
}

const NA_EUROPE = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Switzerland', 'Sweden',
  'Netherlands', 'Italy', 'Spain', 'Ireland', 'Belgium', 'Denmark', 'Norway', 'Finland',
];

/* ── Target 1: Stripe (Fintech) ── */

const STRIPE_TX = withMultiples([
  mk('st-1', 'Plaid', 'Financial data connectivity APIs.', 'Fintech', 'North America', 'United States', 'US', '2025-03-12', 'Visa', 'Strategic', 1300, 'USD', 300, 60, 1800),
  mk('st-2', 'Brex', 'Corporate cards and spend management.', 'Fintech', 'North America', 'United States', 'US', '2024-11-20', 'Greenoaks', 'Financial', 1200, 'USD', 320, null, 4800),
  mk('st-3', 'Ramp', 'Corporate cards and finance automation.', 'Fintech', 'North America', 'United States', 'US', '2025-06-04', 'Founders Fund', 'Financial', 1000, 'USD', 650, null, 7800),
  mk('st-4', 'Revolut', 'Consumer and business neobank.', 'Fintech', 'Europe', 'United Kingdom', 'GB', '2025-01-30', 'Tiger Global', 'Financial', 10000, 'GBP', 2200, 660, 8800),
  mk('st-5', 'Monzo', 'UK consumer challenger bank.', 'Fintech', 'Europe', 'United Kingdom', 'GB', '2024-09-18', 'CapitalG', 'Financial', 3600, 'GBP', 1000, 250, 5000),
  mk('st-6', 'N26', 'Mobile-first European bank.', 'Fintech', 'Europe', 'Germany', 'DE', '2025-02-25', 'Coatue', 'Financial', 1500, 'EUR', 450, null, 2700),
  mk('st-7', 'Mercury', 'Banking for startups.', 'Fintech', 'North America', 'United States', 'US', '2025-05-09', 'Sequoia', 'Financial', 900, 'USD', 500, 125, 3500),
  mk('st-8', 'Airwallex', 'Cross-border payments platform.', 'Fintech', 'Asia Pacific', 'Singapore', 'SG', '2025-04-15', 'Lone Pine', 'Financial', 1700, 'USD', 600, null, 6000),
  mk('st-9', 'Checkout.com', 'Enterprise payment processing.', 'Fintech', 'Europe', 'United Kingdom', 'GB', '2024-10-22', 'Insight Partners', 'Financial', 1800, 'GBP', 350, 70, 1750),
  mk('st-10', 'Deel', 'Global payroll and contractor platform.', 'Software', 'North America', 'United States', 'US', '2025-07-01', 'Andreessen Horowitz', 'Financial', 4000, 'USD', 800, null, 6400),
  mk('st-11', 'Rippling', 'Workforce management platform.', 'Software', 'North America', 'United States', 'US', '2025-03-28', 'Founders Fund', 'Financial', 3500, 'USD', 700, null, 8400),
  mk('st-12', 'Gusto', 'SMB payroll and benefits.', 'Software', 'North America', 'United States', 'US', '2024-12-12', 'General Catalyst', 'Financial', 2500, 'USD', 500, null, 4000),
  mk('st-13', 'Razorpay', 'Payments and banking for Indian businesses.', 'Fintech', 'Asia Pacific', 'India', 'IN', '2025-02-08', 'Lone Pine', 'Financial', 3000, 'USD', 350, null, 2800),
  mk('st-14', 'GoCardless', 'Bank-to-bank recurring payments.', 'Fintech', 'Europe', 'United Kingdom', 'GB', '2024-08-29', 'Permira', 'Financial', 900, 'GBP', 200, null, 1800),
  mk('st-15', 'Chargebee', 'Subscription billing software.', 'Software', 'North America', 'United States', 'US', '2025-06-19', 'Tiger Global', 'Financial', 1200, 'USD', 180, null, 1440),
  mk('st-16', 'Mollie', 'European SMB payments.', 'Fintech', 'Europe', 'Netherlands', 'NL', '2025-01-14', 'Blackstone', 'Financial', 800, 'EUR', 250, 50, 1500),
]);

/* ── Target 2: Databricks (AI / ML) ── */

const DATABRICKS_TX = withMultiples([
  mk('db-1', 'OpenAI', 'Frontier AI models and ChatGPT.', 'AI / ML', 'North America', 'United States', 'US', '2025-05-02', 'Microsoft', 'Strategic', 3000, 'USD', 2000, null, 9000),
  mk('db-2', 'Anthropic', 'Frontier AI models (Claude).', 'AI / ML', 'North America', 'United States', 'US', '2025-04-18', 'Amazon', 'Strategic', 1000, 'USD', 900, null, 8500),
  mk('db-3', 'Scale AI', 'Data labeling for AI training.', 'AI / ML', 'North America', 'United States', 'US', '2025-06-11', 'Meta', 'Strategic', 900, 'USD', 870, null, 8000),
  mk('db-4', 'Cohere', 'Enterprise LLMs.', 'AI / ML', 'North America', 'Canada', 'CA', '2025-02-20', 'Inovia Capital', 'Financial', 400, 'USD', 100, null, 2200),
  mk('db-5', 'Mistral AI', 'Open-weight European LLMs.', 'AI / ML', 'Europe', 'France', 'FR', '2025-03-05', 'General Catalyst', 'Financial', 300, 'EUR', 90, null, 1800),
  mk('db-6', 'Hugging Face', 'Open-source AI model hub.', 'AI / ML', 'North America', 'United States', 'US', '2024-12-03', 'Salesforce Ventures', 'Financial', 250, 'USD', 70, null, 1400),
  mk('db-7', 'Perplexity', 'AI answer engine.', 'AI / ML', 'North America', 'United States', 'US', '2025-07-22', 'IVP', 'Financial', 200, 'USD', 80, null, 1600),
  mk('db-8', 'Together AI', 'AI cloud and inference.', 'AI / ML', 'North America', 'United States', 'US', '2025-04-09', 'General Catalyst', 'Financial', 150, 'USD', 60, null, 1200),
  mk('db-9', 'Glean', 'Enterprise AI search.', 'Software', 'North America', 'United States', 'US', '2025-05-27', 'Kleiner Perkins', 'Financial', 500, 'USD', 100, null, 2400),
  mk('db-10', 'Cerebras', 'Wafer-scale AI accelerators.', 'Hardware', 'North America', 'United States', 'US', '2025-01-21', 'Altimeter', 'Financial', 600, 'USD', 250, 130, 3000),
  mk('db-11', 'Groq', 'AI inference chips.', 'Hardware', 'North America', 'United States', 'US', '2025-03-17', 'BlackRock', 'Financial', 500, 'USD', 120, null, 2800),
  mk('db-12', 'Runway', 'Generative video models.', 'AI / ML', 'North America', 'United States', 'US', '2025-06-30', 'General Atlantic', 'Financial', 200, 'USD', 60, null, 1200),
  mk('db-13', 'ElevenLabs', 'AI voice synthesis.', 'AI / ML', 'Europe', 'United Kingdom', 'GB', '2025-02-12', 'Andreessen Horowitz', 'Financial', 200, 'GBP', 90, 80, 2000),
  mk('db-14', 'Character.AI', 'Consumer AI companions.', 'AI / ML', 'North America', 'United States', 'US', '2024-08-08', 'Google', 'Strategic', 150, 'USD', 50, null, 1000),
  mk('db-15', 'Harvey', 'AI for legal workflows.', 'AI / ML', 'North America', 'United States', 'US', '2025-05-14', 'Sequoia', 'Financial', 300, 'USD', 70, null, 1750),
  mk('db-16', 'Synthesia', 'AI avatar video platform.', 'AI / ML', 'Europe', 'United Kingdom', 'GB', '2025-03-26', 'NEA', 'Financial', 400, 'GBP', 90, 80, 1800),
]);

/* ── Target 3: Canva (Software) ── */

const CANVA_TX = withMultiples([
  mk('cv-1', 'Figma', 'Collaborative interface design.', 'Software', 'North America', 'United States', 'US', '2025-04-03', 'Adobe', 'Strategic', 1500, 'USD', 900, 180, 4500),
  mk('cv-2', 'Miro', 'Online collaborative whiteboard.', 'Software', 'North America', 'United States', 'US', '2024-11-15', 'ICONIQ Growth', 'Financial', 1800, 'USD', 300, null, 3500),
  mk('cv-3', 'Notion', 'All-in-one workspace.', 'Software', 'North America', 'United States', 'US', '2025-06-21', 'Sequoia', 'Financial', 800, 'USD', 250, null, 3000),
  mk('cv-4', 'Airtable', 'No-code database platform.', 'Software', 'North America', 'United States', 'US', '2025-02-18', 'Thrive Capital', 'Financial', 1000, 'USD', 200, null, 2200),
  mk('cv-5', 'Grammarly', 'AI writing assistant.', 'Software', 'North America', 'United States', 'US', '2025-05-30', 'General Catalyst', 'Financial', 1000, 'USD', 280, null, 2800),
  mk('cv-6', 'Linear', 'Issue tracking for software teams.', 'Software', 'North America', 'United States', 'US', '2025-07-09', 'Accel', 'Financial', 100, 'USD', 40, null, 800),
  mk('cv-7', 'Retool', 'Internal tools builder.', 'Software', 'North America', 'United States', 'US', '2025-03-22', 'Sequoia', 'Financial', 400, 'USD', 90, null, 1800),
  mk('cv-8', 'Webflow', 'Visual web development.', 'Software', 'North America', 'United States', 'US', '2024-10-11', 'Accel', 'Financial', 700, 'USD', 150, null, 1800),
  mk('cv-9', 'Zapier', 'Workflow automation.', 'Software', 'North America', 'United States', 'US', '2025-01-27', 'Sequoia', 'Financial', 800, 'USD', 310, 100, 3100),
  mk('cv-10', 'Calendly', 'Scheduling automation.', 'Software', 'North America', 'United States', 'US', '2025-04-25', 'OpenView', 'Financial', 350, 'USD', 100, null, 2000),
  mk('cv-11', 'ClickUp', 'Project and work management.', 'Software', 'North America', 'United States', 'US', '2025-06-13', 'Andreessen Horowitz', 'Financial', 1000, 'USD', 150, null, 2400),
  mk('cv-12', 'Vercel', 'Frontend cloud platform.', 'Software', 'North America', 'United States', 'US', '2025-02-05', 'Accel', 'Financial', 500, 'USD', 100, null, 1800),
  mk('cv-13', 'Replit', 'Browser-based coding platform.', 'Software', 'North America', 'United States', 'US', '2025-05-19', 'Andreessen Horowitz', 'Financial', 200, 'USD', 50, null, 1000),
  mk('cv-14', 'Postman', 'API development platform.', 'Software', 'North America', 'United States', 'US', '2024-09-12', 'Insight Partners', 'Financial', 700, 'USD', 130, null, 2600),
  mk('cv-15', '1Password', 'Enterprise password management.', 'Software', 'North America', 'Canada', 'CA', '2025-03-08', 'ICONIQ Growth', 'Financial', 900, 'USD', 250, 80, 2500),
  mk('cv-16', 'Automattic', 'WordPress.com and web publishing.', 'Software', 'North America', 'United States', 'US', '2025-07-15', 'Insight Partners', 'Financial', 1900, 'USD', 600, 120, 3000),
]);

/* ── Target 4: Anduril (Hardware / Deep Tech) ── */

const ANDURIL_TX = withMultiples([
  mk('sx-1', 'Vannevar Labs', 'AI for national-security intelligence.', 'Hardware', 'North America', 'United States', 'US', '2025-05-06', 'Founders Fund', 'Financial', 600, 'USD', 120, null, 2400),
  mk('sx-2', 'Blue Origin', 'Reusable rockets and space systems.', 'Hardware', 'North America', 'United States', 'US', '2025-02-14', 'Bezos Expeditions', 'Financial', 11000, 'USD', 500, null, 6000),
  mk('sx-3', 'Relativity Space', '3D-printed launch vehicles.', 'Hardware', 'North America', 'United States', 'US', '2025-06-25', 'Fidelity', 'Financial', 1000, 'USD', 80, null, 1600),
  mk('sx-4', 'Firefly Aerospace', 'Small-launch and lunar landers.', 'Hardware', 'North America', 'United States', 'US', '2024-12-09', 'AE Industrial', 'Financial', 700, 'USD', 100, null, 2000),
  mk('sx-5', 'Shield AI', 'Autonomous flight software.', 'Hardware', 'North America', 'United States', 'US', '2025-04-01', 'Riot Ventures', 'Financial', 800, 'USD', 150, 100, 3000),
  mk('sx-6', 'Skydio', 'Autonomous drones.', 'Hardware', 'North America', 'United States', 'US', '2025-03-19', 'Andreessen Horowitz', 'Financial', 600, 'USD', 120, null, 1800),
  mk('sx-7', 'Zipline', 'Autonomous delivery drones.', 'Hardware', 'North America', 'United States', 'US', '2025-05-28', 'Katalyst Ventures', 'Financial', 900, 'USD', 90, null, 1800),
  mk('sx-8', 'Figure AI', 'Humanoid robots.', 'Hardware', 'North America', 'United States', 'US', '2025-07-03', 'Parkway Venture Capital', 'Financial', 300, 'USD', 40, null, 800),
  mk('sx-9', 'Saronic', 'Autonomous naval vessels.', 'Hardware', 'North America', 'United States', 'US', '2025-02-26', 'General Catalyst', 'Financial', 200, 'USD', 50, null, 1000),
  mk('sx-10', 'Hadrian', 'Automated precision factories.', 'Industrial', 'North America', 'United States', 'US', '2025-06-17', 'Lux Capital', 'Financial', 400, 'USD', 90, null, 900),
  mk('sx-11', 'Apptronik', 'Humanoid robotics.', 'Hardware', 'North America', 'United States', 'US', '2025-04-22', 'B Capital', 'Financial', 200, 'USD', 35, null, 700),
  mk('sx-12', 'Epirus', 'High-power microwave defense.', 'Hardware', 'North America', 'United States', 'US', '2025-03-11', '8VC', 'Financial', 300, 'USD', 60, null, 1200),
  mk('sx-13', 'Helsing', 'AI defense software.', 'Hardware', 'Europe', 'Germany', 'DE', '2025-05-20', 'General Catalyst', 'Financial', 400, 'EUR', 120, null, 2400),
  mk('sx-14', 'SambaNova', 'AI dataflow chips and systems.', 'Hardware', 'North America', 'United States', 'US', '2024-10-30', 'SoftBank', 'Financial', 500, 'USD', 150, null, 3000),
  mk('sx-15', 'Commonwealth Fusion', 'Fusion energy systems.', 'Industrial', 'North America', 'United States', 'US', '2025-01-16', 'Breakthrough Energy', 'Financial', 800, 'USD', 40, null, 800),
  mk('sx-16', 'Boom Supersonic', 'Supersonic passenger aircraft.', 'Hardware', 'North America', 'United States', 'US', '2025-06-05', 'NEA', 'Financial', 700, 'USD', 50, null, 1000),
]);

/* ── Target 5: Mars (Consumer) ── */

const MARS_TX = withMultiples([
  mk('ik-1', 'Haribo', 'Gummy candy and confectionery.', 'Consumer', 'Europe', 'Germany', 'DE', '2025-03-10', 'Ferrero', 'Strategic', 7000, 'EUR', 800, 160, 2400),
  mk('ik-2', 'LEGO', 'Construction toys and play.', 'Consumer', 'Europe', 'Denmark', 'DK', '2024-11-26', 'Kirkbi', 'Financial', 28000, 'EUR', 1000, 300, 4000),
  mk('ik-3', 'Rolex', 'Luxury watchmaking.', 'Consumer', 'Europe', 'Switzerland', 'CH', '2025-02-19', 'Wilsdorf Foundation', 'Strategic', 14000, 'CHF', 1100, 330, 5500),
  mk('ik-4', 'Dyson', 'Premium home appliances.', 'Consumer', 'Europe', 'United Kingdom', 'GB', '2025-05-13', 'Weybourne', 'Strategic', 14000, 'GBP', 800, 160, 2400),
  mk('ik-5', 'Patagonia', 'Outdoor apparel and gear.', 'Consumer', 'North America', 'United States', 'US', '2024-09-24', 'Holdfast Collective', 'Financial', 3000, 'USD', 200, 40, 800),
  mk('ik-6', 'Ferrero', 'Chocolate and confectionery.', 'Consumer', 'Europe', 'Italy', 'IT', '2025-04-07', 'Nestlé', 'Strategic', 38000, 'EUR', 2000, 400, 6000),
  mk('ik-7', 'Aldi Süd', 'Discount grocery retail.', 'Consumer', 'Europe', 'Germany', 'DE', '2025-01-22', 'Hofer Family', 'Financial', 60000, 'EUR', 3000, 300, 4500),
  mk('ik-8', 'Schwarz Group', 'Lidl and Kaufland retail.', 'Consumer', 'Europe', 'Germany', 'DE', '2024-12-18', 'Dieter Schwarz Foundation', 'Financial', 90000, 'EUR', 3000, 300, 4500),
  mk('ik-9', 'Bose', 'Premium audio hardware.', 'Hardware', 'North America', 'United States', 'US', '2025-06-02', 'KKR', 'Financial', 7000, 'USD', 400, 80, 1600),
  mk('ik-10', 'Chanel', 'Luxury fashion and beauty.', 'Consumer', 'Europe', 'France', 'FR', '2025-03-28', 'Wertheimer Family', 'Strategic', 32000, 'EUR', 1800, 540, 9000),
  mk('ik-11', 'SHEIN', 'Fast-fashion e-commerce.', 'Consumer', 'Asia Pacific', 'Singapore', 'SG', '2025-05-09', 'General Atlantic', 'Financial', 16000, 'USD', 2500, 400, 6000),
  mk('ik-12', 'Gymshark', 'Fitness apparel brand.', 'Consumer', 'Europe', 'United Kingdom', 'GB', '2025-02-11', 'General Atlantic', 'Financial', 900, 'GBP', 150, 30, 600),
  mk('ik-13', 'Decathlon', 'Sporting goods retail.', 'Consumer', 'Europe', 'France', 'FR', '2024-10-15', 'Mulliez Family', 'Financial', 100000, 'EUR', 3000, 300, 4500),
  mk('ik-14', 'Vitamix', 'High-performance blenders.', 'Consumer', 'North America', 'United States', 'US', '2025-07-18', 'Barnard Family', 'Financial', 1000, 'USD', 100, 20, 400),
  mk('ik-15', 'JCB', 'Construction equipment.', 'Industrial', 'Europe', 'United Kingdom', 'GB', '2025-01-09', 'Bamford Family', 'Strategic', 15000, 'GBP', 1500, 225, 4500),
  mk('ik-16', 'Bosch', 'Industrial and consumer technology.', 'Industrial', 'Europe', 'Germany', 'DE', '2024-08-20', 'Robert Bosch Stiftung', 'Strategic', 100000, 'EUR', 3000, 360, 6000),
]);

/* ── Target 6: Bloomberg (Media & Data) ── */

const BLOOMBERG_TX = withMultiples([
  mk('bb-1', 'Hearst', 'Diversified media and information.', 'Media & Data', 'North America', 'United States', 'US', '2025-03-04', 'Hearst Family Trust', 'Strategic', 20000, 'USD', 2000, 400, 6000),
  mk('bb-2', 'Cox Enterprises', 'Media, broadband, and automotive.', 'Media & Data', 'North America', 'United States', 'US', '2024-11-19', 'Cox Family', 'Strategic', 50000, 'USD', 3000, 600, 7500),
  mk('bb-3', 'Advance Publications', 'Condé Nast and media holdings.', 'Media & Data', 'North America', 'United States', 'US', '2025-05-22', 'Newhouse Family', 'Strategic', 15000, 'USD', 1500, 225, 4500),
  mk('bb-4', 'Bertelsmann', 'Global media and services.', 'Media & Data', 'Europe', 'Germany', 'DE', '2025-02-27', 'Mohn Family', 'Strategic', 80000, 'EUR', 3000, 450, 6000),
  mk('bb-5', 'Forbes', 'Business media and brand licensing.', 'Media & Data', 'North America', 'United States', 'US', '2025-04-30', 'Integrated Whale Media', 'Financial', 500, 'USD', 200, 40, 800),
  mk('bb-6', 'Politico', 'Political news and intelligence.', 'Media & Data', 'North America', 'United States', 'US', '2024-10-08', 'Axel Springer', 'Strategic', 700, 'USD', 200, 50, 1000),
  mk('bb-7', 'Axios', 'Digital news media.', 'Media & Data', 'North America', 'United States', 'US', '2025-06-16', 'Cox Enterprises', 'Strategic', 600, 'USD', 100, null, 500),
  mk('bb-8', 'Vox Media', 'Digital media networks.', 'Media & Data', 'North America', 'United States', 'US', '2025-01-28', 'Penske Media', 'Strategic', 1800, 'USD', 250, null, 750),
  mk('bb-9', 'Substack', 'Subscription publishing platform.', 'Software', 'North America', 'United States', 'US', '2025-03-13', 'Andreessen Horowitz', 'Financial', 100, 'USD', 45, null, 650),
  mk('bb-10', 'Patreon', 'Creator membership platform.', 'Software', 'North America', 'United States', 'US', '2025-05-07', 'Tiger Global', 'Financial', 400, 'USD', 120, null, 1200),
  mk('bb-11', 'Dataminr', 'Real-time event detection from data.', 'Software', 'North America', 'United States', 'US', '2025-02-04', 'Eldridge', 'Financial', 800, 'USD', 200, null, 4000),
  mk('bb-12', 'Chainalysis', 'Blockchain data and analytics.', 'Software', 'North America', 'United States', 'US', '2024-12-02', 'GIC', 'Financial', 900, 'USD', 190, null, 3800),
  mk('bb-13', 'Bauer Media', 'Magazines and radio.', 'Media & Data', 'Europe', 'Germany', 'DE', '2025-04-14', 'Bauer Family', 'Strategic', 12000, 'EUR', 2000, 200, 2000),
  mk('bb-14', 'IDEO', 'Design and innovation consultancy.', 'Media & Data', 'North America', 'United States', 'US', '2025-06-09', 'kyu Collective', 'Strategic', 700, 'USD', 150, 30, 600),
  mk('bb-15', 'Edelman', 'Global communications and PR.', 'Media & Data', 'North America', 'United States', 'US', '2024-09-17', 'Daniel Edelman Holdings', 'Strategic', 6000, 'USD', 1000, 150, 3000),
  mk('bb-16', 'Mansueto Ventures', 'Inc. and Fast Company media.', 'Media & Data', 'North America', 'United States', 'US', '2025-07-21', 'Joe Mansueto', 'Financial', 300, 'USD', 60, 12, 240),
]);

export const PRESET_COMPANIES: PresetCompany[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Global payments infrastructure for internet businesses.',
    presetFilters: filters({
      transactionAge: { min: null, max: 6 },
      buyerType: ['Strategic', 'Financial'],
      geography: NA_EUROPE,
      revenue: { min: null, max: 3000 },
      evRevenue: { min: 2, max: 25 },
    }),
    transactions: STRIPE_TX,
  },
  {
    id: 'databricks',
    name: 'Databricks',
    description: 'Data and AI platform (lakehouse) for the enterprise.',
    presetFilters: filters({
      transactionAge: { min: null, max: 6 },
      buyerType: ['Strategic', 'Financial'],
      geography: NA_EUROPE,
      evRevenue: { min: 2, max: 25 },
    }),
    transactions: DATABRICKS_TX,
  },
  {
    id: 'canva',
    name: 'Canva',
    description: 'Visual design and collaboration platform.',
    presetFilters: filters({
      transactionAge: { min: null, max: 6 },
      buyerType: ['Strategic', 'Financial'],
      geography: NA_EUROPE,
      revenue: { min: null, max: 1000 },
      evRevenue: { min: 2, max: 25 },
    }),
    transactions: CANVA_TX,
  },
  {
    id: 'anduril',
    name: 'Anduril',
    description: 'Autonomous defense systems and software (privately held).',
    presetFilters: filters({
      transactionAge: { min: null, max: 6 },
      buyerType: ['Strategic', 'Financial'],
      geography: NA_EUROPE,
      evRevenue: { min: 2, max: 30 },
    }),
    transactions: ANDURIL_TX,
  },
  {
    id: 'mars',
    name: 'Mars',
    description: 'Confectionery, food, and petcare — family-owned and private.',
    presetFilters: filters({
      transactionAge: { min: null, max: 6 },
      buyerType: ['Strategic', 'Financial'],
      geography: NA_EUROPE,
      revenue: { min: 100, max: 3000 },
      evRevenue: { min: 1, max: 10 },
      evEbitda: { min: 8, max: 30 },
    }),
    transactions: MARS_TX,
  },
  {
    id: 'bloomberg',
    name: 'Bloomberg',
    description: 'Financial data, media, and analytics.',
    presetFilters: filters({
      transactionAge: { min: null, max: 6 },
      buyerType: ['Strategic', 'Financial'],
      geography: NA_EUROPE,
      revenue: { min: null, max: 3000 },
      evRevenue: { min: 1, max: 25 },
    }),
    transactions: BLOOMBERG_TX,
  },
];

/* ── Fallback comp set for a target that isn't in our list (a broad market default) ── */

export const FALLBACK_TRANSACTIONS = withMultiples([
  mk('fb-1', 'Epic Games', 'Game engine and interactive entertainment.', 'Media & Data', 'North America', 'United States', 'US', '2025-04-10', 'Tencent', 'Strategic', 4500, 'USD', 600, 120, 3000),
  mk('fb-2', 'Valve', 'Steam platform and game development.', 'Software', 'North America', 'United States', 'US', '2025-02-15', 'Silver Lake', 'Financial', 400, 'USD', 500, 200, 4000),
  mk('fb-3', 'Discord', 'Voice and community chat platform.', 'Software', 'North America', 'United States', 'US', '2024-12-05', 'Sequoia', 'Financial', 900, 'USD', 300, null, 3000),
  mk('fb-4', 'Telegram', 'Messaging and channels platform.', 'Software', 'Middle East & Africa', 'United Arab Emirates', 'AE', '2025-03-20', 'Mubadala', 'Financial', 60, 'USD', 100, null, 1500),
  mk('fb-5', 'ByteDance', 'TikTok and content platforms.', 'Media & Data', 'Asia Pacific', 'China', 'CN', '2025-01-12', 'General Atlantic', 'Financial', 110000, 'USD', 3000, 600, 6000),
  mk('fb-6', 'Klarna', 'Buy-now-pay-later payments.', 'Fintech', 'Europe', 'Sweden', 'SE', '2024-10-28', 'Sequoia', 'Financial', 5000, 'EUR', 1000, 100, 4000),
  mk('fb-7', 'Chime', 'Consumer mobile banking.', 'Fintech', 'North America', 'United States', 'US', '2025-05-16', 'DST Global', 'Financial', 1300, 'USD', 800, null, 5000),
  mk('fb-8', 'Fanatics', 'Licensed sports merchandise.', 'Consumer', 'North America', 'United States', 'US', '2025-06-22', 'SoftBank', 'Financial', 9000, 'USD', 2000, 200, 5000),
  mk('fb-9', 'Niantic', 'Augmented-reality games.', 'Software', 'North America', 'United States', 'US', '2024-09-09', 'Coatue', 'Financial', 800, 'USD', 300, 30, 1500),
  mk('fb-10', 'Plaid', 'Financial data connectivity APIs.', 'Fintech', 'North America', 'United States', 'US', '2025-03-12', 'Visa', 'Strategic', 1300, 'USD', 300, 60, 1800),
  mk('fb-11', 'Brex', 'Corporate cards and spend management.', 'Fintech', 'North America', 'United States', 'US', '2024-11-20', 'Greenoaks', 'Financial', 1200, 'USD', 320, null, 4800),
  mk('fb-12', 'Figma', 'Collaborative interface design.', 'Software', 'North America', 'United States', 'US', '2025-04-03', 'Adobe', 'Strategic', 1500, 'USD', 900, 180, 4500),
  mk('fb-13', 'Anduril', 'Autonomous defense systems.', 'Hardware', 'North America', 'United States', 'US', '2025-05-06', 'Founders Fund', 'Financial', 3000, 'USD', 1000, 320, 8000),
  mk('fb-14', 'Mars', 'Confectionery, food, and petcare.', 'Consumer', 'North America', 'United States', 'US', '2025-03-10', 'Berkshire Hathaway', 'Strategic', 140000, 'USD', 3000, 600, 6000),
  mk('fb-15', 'OpenAI', 'Frontier AI models and ChatGPT.', 'AI / ML', 'North America', 'United States', 'US', '2025-05-02', 'Microsoft', 'Strategic', 3000, 'USD', 2000, null, 9000),
  mk('fb-16', 'Bosch', 'Industrial and consumer technology.', 'Industrial', 'Europe', 'Germany', 'DE', '2024-08-20', 'Robert Bosch Stiftung', 'Strategic', 100000, 'EUR', 3000, 360, 6000),
]);

// Build a one-off "custom" target for a name typed by the analyst that isn't a preset.
// Filters start empty (the analyst fills them); the comp set is the fixed market default.
export function makeCustomCompany(name: string): PresetCompany {
  return {
    id: 'custom',
    name: name.trim() || 'Custom target',
    description: 'Custom target — set your own filters; screened against the default market comp set.',
    presetFilters: { ...EMPTY_FILTERS },
    transactions: FALLBACK_TRANSACTIONS,
  };
}
