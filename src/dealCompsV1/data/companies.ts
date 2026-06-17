import type { CompTransaction, DealCompFilters, PresetCompany } from './types';
import { EMPTY_FILTERS } from './types';

export { SECTORS, REGIONS, BUYER_TYPES } from './types';

/* ── Multiples are derived from raw financials so they stay internally consistent ── */

type RawTx = Omit<CompTransaction, 'evRevenueMultiple' | 'evEbitdaMultiple' | 'evEbitMultiple'>;

const round1 = (n: number) => Math.round(n * 10) / 10;

function withMultiples(rows: RawTx[]): CompTransaction[] {
  return rows.map((r) => ({
    ...r,
    evRevenueMultiple: r.enterpriseValue !== null && r.revenue ? round1(r.enterpriseValue / r.revenue) : null,
    evEbitdaMultiple: r.enterpriseValue !== null && r.ebitda && r.ebitda > 0 ? round1(r.enterpriseValue / r.ebitda) : null,
    evEbitMultiple: r.enterpriseValue !== null && r.ebit && r.ebit > 0 ? round1(r.enterpriseValue / r.ebit) : null,
  }));
}

function filters(overrides: Partial<DealCompFilters>): DealCompFilters {
  return { ...EMPTY_FILTERS, ...overrides };
}

// North America + Europe country set, for "Western markets" geography presets.
const NA_EUROPE = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Switzerland', 'Sweden',
  'Netherlands', 'Italy', 'Spain', 'Ireland', 'Belgium', 'Denmark', 'Norway', 'Finland',
];

/* ── Company 1: NovaPulse Medical (respiratory monitoring) ── */

const NOVAPULSE_TX = withMultiples([
  { id: 'np-1', targetCompany: 'RespiraTech Solutions', targetDescription: 'Non-invasive respiratory monitoring devices for ICU settings.', sector: 'Medical Devices', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-11-15', buyer: 'Medtronic', buyerType: 'Strategic', employees: 320, dealSize: 450, currency: 'USD', revenue: 85, ebitda: 32, ebit: 26, enterpriseValue: 450, status: 'Included' },
  { id: 'np-2', targetCompany: 'AirFlow Diagnostics', targetDescription: 'Portable spirometry and lung-function testing equipment.', sector: 'Diagnostics', region: 'Europe', location: 'Germany', countryCode: 'DE', announcementDate: '2025-08-22', buyer: 'Philips Healthcare', buyerType: 'Strategic', employees: 210, dealSize: 280, currency: 'EUR', revenue: 72, ebitda: 22, ebit: 18, enterpriseValue: 310, status: 'Included' },
  { id: 'np-3', targetCompany: 'OxySense Labs', targetDescription: 'AI-powered pulse oximetry software and hardware.', sector: 'Health IT / SaaS', region: 'Europe', location: 'United Kingdom', countryCode: 'GB', announcementDate: '2025-05-10', buyer: 'Carlyle Group', buyerType: 'Financial', employees: 85, dealSize: 120, currency: 'GBP', revenue: 28, ebitda: 8, ebit: 6, enterpriseValue: 120, status: 'Included' },
  { id: 'np-4', targetCompany: 'LungGuard Inc.', targetDescription: 'Disposable respiratory filters and accessories.', sector: 'Medical Supplies', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2024-12-01', buyer: '3M', buyerType: 'Strategic', employees: 1200, dealSize: 850, currency: 'USD', revenue: 320, ebitda: 95, ebit: 76, enterpriseValue: 850, status: 'Included' },
  { id: 'np-5', targetCompany: 'PulmoTech AG', targetDescription: 'CPAP/BiPAP therapy devices with connected patient monitoring.', sector: 'Medical Devices', region: 'Europe', location: 'Switzerland', countryCode: 'CH', announcementDate: '2025-03-08', buyer: 'EQT Partners', buyerType: 'Financial', employees: 380, dealSize: 340, currency: 'CHF', revenue: 95, ebitda: 28, ebit: 22, enterpriseValue: 370, status: 'Included' },
  { id: 'np-6', targetCompany: 'NebulaSoft Health', targetDescription: 'Cloud-based respiratory data analytics platform for hospitals.', sector: 'Health IT / SaaS', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-06-14', buyer: 'Warburg Pincus', buyerType: 'Financial', employees: 150, dealSize: 195, currency: 'USD', revenue: 38, ebitda: 12, ebit: 10, enterpriseValue: 195, status: 'Included' },
  { id: 'np-7', targetCompany: 'CapnoStream Medical', targetDescription: 'Capnography monitoring systems for anesthesia and critical care.', sector: 'Medical Devices', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2024-09-20', buyer: 'Danaher Corporation', buyerType: 'Strategic', employees: 520, dealSize: 580, currency: 'USD', revenue: 148, ebitda: 52, ebit: 42, enterpriseValue: 580, status: 'Included' },
  { id: 'np-8', targetCompany: 'TidalSense Ltd', targetDescription: 'Handheld COPD/asthma diagnostic device with AI severity scoring.', sector: 'Diagnostics', region: 'Europe', location: 'United Kingdom', countryCode: 'GB', announcementDate: '2025-09-02', buyer: 'Apax Partners', buyerType: 'Financial', employees: 45, dealSize: 85, currency: 'GBP', revenue: 15, ebitda: 5, ebit: 4, enterpriseValue: 105, status: 'Included' },
  { id: 'np-9', targetCompany: 'Inspiro Systems', targetDescription: 'Neonatal ventilator and respiratory support systems for NICUs.', sector: 'Medical Devices', region: 'Europe', location: 'Sweden', countryCode: 'SE', announcementDate: '2024-07-11', buyer: 'Getinge AB', buyerType: 'Strategic', employees: 240, dealSize: 220, currency: 'EUR', revenue: 62, ebitda: 18, ebit: 14, enterpriseValue: 245, status: 'Included' },
  { id: 'np-10', targetCompany: 'VentilateNow', targetDescription: 'Emergency ventilator manufacturing startup.', sector: 'Medical Devices', region: 'Europe', location: 'France', countryCode: 'FR', announcementDate: '2024-10-15', buyer: 'Hillrom', buyerType: 'Strategic', employees: 60, dealSize: 65, currency: 'EUR', revenue: null, ebitda: -2, ebit: null, enterpriseValue: 65, status: 'Excluded' },
  { id: 'np-11', targetCompany: 'BreatheEasy Systems', targetDescription: 'Home sleep-apnea testing devices.', sector: 'Medical Devices', region: 'Asia Pacific', location: 'Australia', countryCode: 'AU', announcementDate: '2025-01-20', buyer: 'ResMed', buyerType: 'Strategic', employees: 1800, dealSize: 1500, currency: 'USD', revenue: 410, ebitda: null, ebit: null, enterpriseValue: 1500, status: 'Excluded' },
  { id: 'np-12', targetCompany: 'SinoResp Medical', targetDescription: 'Low-cost ventilators and oxygen concentrators.', sector: 'Medical Devices', region: 'Asia Pacific', location: 'China', countryCode: 'CN', announcementDate: '2024-11-30', buyer: 'Mindray Medical', buyerType: 'Strategic', employees: 900, dealSize: 90, currency: 'USD', revenue: 55, ebitda: 11, ebit: 9, enterpriseValue: null, status: 'Excluded' },
]);

/* ── Company 2: VitalEdge Diagnostics (in-vitro diagnostics / lab) ── */

const VITALEDGE_TX = withMultiples([
  { id: 'vd-1', targetCompany: 'GenoSpark Labs', targetDescription: 'Next-generation sequencing reagents and lab automation.', sector: 'Diagnostics', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-02-12', buyer: 'Thermo Fisher', buyerType: 'Strategic', employees: 540, dealSize: 620, currency: 'USD', revenue: 140, ebitda: 70, ebit: 56, enterpriseValue: 620, status: 'Included' },
  { id: 'vd-2', targetCompany: 'ClariPath', targetDescription: 'Digital pathology imaging and workflow software.', sector: 'Diagnostics', region: 'Europe', location: 'United Kingdom', countryCode: 'GB', announcementDate: '2024-10-05', buyer: 'Bridgepoint', buyerType: 'Financial', employees: 230, dealSize: 280, currency: 'GBP', revenue: 60, ebitda: 24, ebit: 19, enterpriseValue: 300, status: 'Included' },
  { id: 'vd-3', targetCompany: 'NanoAssay Systems', targetDescription: 'Point-of-care immunoassay analyzers.', sector: 'Medical Devices', region: 'North America', location: 'Canada', countryCode: 'CA', announcementDate: '2025-06-30', buyer: 'Danaher Corporation', buyerType: 'Strategic', employees: 410, dealSize: 510, currency: 'USD', revenue: 120, ebitda: 48, ebit: 38, enterpriseValue: 510, status: 'Included' },
  { id: 'vd-4', targetCompany: 'LabFlow Software', targetDescription: 'Cloud LIMS for clinical and research laboratories.', sector: 'Health IT / SaaS', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-09-18', buyer: 'Vista Equity', buyerType: 'Financial', employees: 180, dealSize: 240, currency: 'USD', revenue: 45, ebitda: 13, ebit: 10, enterpriseValue: 240, status: 'Included' },
  { id: 'vd-5', targetCompany: 'ImmunoTrace', targetDescription: 'Autoimmune and infectious-disease assay manufacturer.', sector: 'Diagnostics', region: 'Europe', location: 'Germany', countryCode: 'DE', announcementDate: '2024-08-21', buyer: 'Roche', buyerType: 'Strategic', employees: 700, dealSize: 1100, currency: 'EUR', revenue: 260, ebitda: 115, ebit: 92, enterpriseValue: 1150, status: 'Included' },
  { id: 'vd-6', targetCompany: 'PathoSeq', targetDescription: 'Metagenomic pathogen-detection SaaS platform.', sector: 'Health IT / SaaS', region: 'Asia Pacific', location: 'Singapore', countryCode: 'SG', announcementDate: '2025-04-02', buyer: 'Temasek', buyerType: 'Financial', employees: 95, dealSize: 160, currency: 'USD', revenue: 30, ebitda: 7, ebit: 5, enterpriseValue: 160, status: 'Included' },
  { id: 'vd-7', targetCompany: 'ClinChem Devices', targetDescription: 'Clinical chemistry analyzers and consumables.', sector: 'Medical Devices', region: 'Europe', location: 'France', countryCode: 'FR', announcementDate: '2024-11-29', buyer: 'bioMérieux', buyerType: 'Strategic', employees: 320, dealSize: 360, currency: 'EUR', revenue: 95, ebitda: 40, ebit: 32, enterpriseValue: 360, status: 'Included' },
  { id: 'vd-8', targetCompany: 'RapidTest Now', targetDescription: 'Rapid antigen and home-testing kit producer.', sector: 'Diagnostics', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-07-15', buyer: 'KKR', buyerType: 'Financial', employees: 260, dealSize: 330, currency: 'USD', revenue: 78, ebitda: 30, ebit: 24, enterpriseValue: 330, status: 'Included' },
  { id: 'vd-9', targetCompany: 'EarlyDx', targetDescription: 'Early-cancer liquid-biopsy startup, pre-profitability.', sector: 'Diagnostics', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-03-10', buyer: 'Sofina', buyerType: 'Financial', employees: 40, dealSize: 55, currency: 'USD', revenue: 6, ebitda: -3, ebit: -5, enterpriseValue: 55, status: 'Excluded' },
  { id: 'vd-10', targetCompany: 'OmniPanel', targetDescription: 'Molecular multiplex panels; EV undisclosed.', sector: 'Medical Devices', region: 'Asia Pacific', location: 'Japan', countryCode: 'JP', announcementDate: '2024-09-01', buyer: 'Sysmex', buyerType: 'Strategic', employees: 600, dealSize: 410, currency: 'USD', revenue: 130, ebitda: 35, ebit: 28, enterpriseValue: null, status: 'Excluded' },
  { id: 'vd-11', targetCompany: 'BioSignal AI', targetDescription: 'AI triage software; EBITDA not disclosed.', sector: 'Health IT / SaaS', region: 'Europe', location: 'Sweden', countryCode: 'SE', announcementDate: '2025-05-22', buyer: 'EQT Partners', buyerType: 'Financial', employees: 70, dealSize: 90, currency: 'EUR', revenue: 12, ebitda: null, ebit: null, enterpriseValue: 90, status: 'Excluded' },
]);

/* ── Company 3: Helios Surgical (surgical devices / supplies) ── */

const HELIOS_TX = withMultiples([
  { id: 'hs-1', targetCompany: 'OrthoNova', targetDescription: 'Orthopedic implants and surgical navigation systems.', sector: 'Medical Devices', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-01-28', buyer: 'Stryker', buyerType: 'Strategic', employees: 900, dealSize: 1400, currency: 'USD', revenue: 320, ebitda: 140, ebit: 112, enterpriseValue: 1400, status: 'Included' },
  { id: 'hs-2', targetCompany: 'SutureTech', targetDescription: 'Advanced wound-closure and suturing supplies.', sector: 'Medical Supplies', region: 'Europe', location: 'Italy', countryCode: 'IT', announcementDate: '2024-12-09', buyer: 'Investindustrial', buyerType: 'Financial', employees: 480, dealSize: 380, currency: 'EUR', revenue: 150, ebitda: 42, ebit: 34, enterpriseValue: 380, status: 'Included' },
  { id: 'hs-3', targetCompany: 'NeuroBlade Surgical', targetDescription: 'Robotic-assisted neurosurgery instruments.', sector: 'Medical Devices', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-05-14', buyer: 'Medtronic', buyerType: 'Strategic', employees: 350, dealSize: 720, currency: 'USD', revenue: 130, ebitda: 58, ebit: 46, enterpriseValue: 720, status: 'Included' },
  { id: 'hs-4', targetCompany: 'FlexDevice Wearables', targetDescription: 'Post-surgical recovery wearables and remote monitoring.', sector: 'Wearables', region: 'Asia Pacific', location: 'South Korea', countryCode: 'KR', announcementDate: '2025-08-03', buyer: 'MBK Partners', buyerType: 'Financial', employees: 210, dealSize: 260, currency: 'USD', revenue: 55, ebitda: 16, ebit: 12, enterpriseValue: 260, status: 'Included' },
  { id: 'hs-5', targetCompany: 'CardioStent AG', targetDescription: 'Drug-eluting coronary stents and delivery systems.', sector: 'Medical Devices', region: 'Europe', location: 'Switzerland', countryCode: 'CH', announcementDate: '2024-07-19', buyer: 'Abbott', buyerType: 'Strategic', employees: 620, dealSize: 980, currency: 'CHF', revenue: 210, ebitda: 92, ebit: 74, enterpriseValue: 980, status: 'Included' },
  { id: 'hs-6', targetCompany: 'PharmaCoat', targetDescription: 'Specialty drug-coating and combination-device pharma.', sector: 'Pharmaceuticals', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-03-22', buyer: 'Blackstone', buyerType: 'Financial', employees: 740, dealSize: 1250, currency: 'USD', revenue: 280, ebitda: 98, ebit: 78, enterpriseValue: 1250, status: 'Included' },
  { id: 'hs-7', targetCompany: 'EndoVision', targetDescription: 'Single-use endoscopes and visualization platforms.', sector: 'Medical Devices', region: 'Europe', location: 'Netherlands', countryCode: 'NL', announcementDate: '2024-10-30', buyer: 'Olympus', buyerType: 'Strategic', employees: 430, dealSize: 540, currency: 'EUR', revenue: 125, ebitda: 50, ebit: 40, enterpriseValue: 540, status: 'Included' },
  { id: 'hs-8', targetCompany: 'SteriPack Supplies', targetDescription: 'Sterile single-use procedure packs and drapes.', sector: 'Medical Supplies', region: 'Latin America', location: 'Mexico', countryCode: 'MX', announcementDate: '2025-06-11', buyer: 'Advent International', buyerType: 'Financial', employees: 1100, dealSize: 300, currency: 'USD', revenue: 140, ebitda: 30, ebit: 24, enterpriseValue: 300, status: 'Included' },
  { id: 'hs-9', targetCompany: 'RoboSuture', targetDescription: 'Pre-revenue surgical-robotics startup; negative EBITDA.', sector: 'Medical Devices', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-02-18', buyer: 'Sofina', buyerType: 'Financial', employees: 60, dealSize: 70, currency: 'USD', revenue: 8, ebitda: -1, ebit: -3, enterpriseValue: 70, status: 'Excluded' },
  { id: 'hs-10', targetCompany: 'GraftLine', targetDescription: 'Biologic graft pharma; enterprise value undisclosed.', sector: 'Pharmaceuticals', region: 'Europe', location: 'United Kingdom', countryCode: 'GB', announcementDate: '2024-09-26', buyer: 'Smith+Nephew', buyerType: 'Strategic', employees: 540, dealSize: 900, currency: 'GBP', revenue: 190, ebitda: 60, ebit: 48, enterpriseValue: null, status: 'Excluded' },
  { id: 'hs-11', targetCompany: 'PulseWear', targetDescription: 'Early-stage cardiac wearable; EBITDA not disclosed.', sector: 'Wearables', region: 'Middle East & Africa', location: 'Israel', countryCode: 'IL', announcementDate: '2025-04-19', buyer: 'Pitango', buyerType: 'Financial', employees: 35, dealSize: 45, currency: 'USD', revenue: 5, ebitda: null, ebit: null, enterpriseValue: 45, status: 'Excluded' },
]);

/* ── Company 4: OrthoSphere Surgical (orthopedics / implants) ── */

const ORTHOSPHERE_TX = withMultiples([
  { id: 'os-1', targetCompany: 'SpineForge', targetDescription: 'Spinal fusion implants and surgical navigation.', sector: 'Medical Devices', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-04-09', buyer: 'Stryker', buyerType: 'Strategic', employees: 700, dealSize: 1100, currency: 'USD', revenue: 250, ebitda: 110, ebit: 88, enterpriseValue: 1100, status: 'Included' },
  { id: 'os-2', targetCompany: 'JointWorks', targetDescription: 'Knee and hip replacement systems.', sector: 'Medical Devices', region: 'Europe', location: 'Germany', countryCode: 'DE', announcementDate: '2024-11-12', buyer: 'EQT Partners', buyerType: 'Financial', employees: 420, dealSize: 520, currency: 'EUR', revenue: 130, ebitda: 52, ebit: 42, enterpriseValue: 520, status: 'Included' },
  { id: 'os-3', targetCompany: 'BoneBio Supplies', targetDescription: 'Bone-graft substitutes and orthobiologics.', sector: 'Medical Supplies', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-07-28', buyer: 'Zimmer Biomet', buyerType: 'Strategic', employees: 950, dealSize: 640, currency: 'USD', revenue: 280, ebitda: 64, ebit: 51, enterpriseValue: 640, status: 'Included' },
  { id: 'os-4', targetCompany: 'CartilageTx', targetDescription: 'Injectable cartilage-regeneration therapeutics.', sector: 'Pharmaceuticals', region: 'Europe', location: 'Switzerland', countryCode: 'CH', announcementDate: '2025-01-16', buyer: 'Partners Group', buyerType: 'Financial', employees: 300, dealSize: 880, currency: 'CHF', revenue: 160, ebitda: 55, ebit: 44, enterpriseValue: 880, status: 'Included' },
  { id: 'os-5', targetCompany: 'FlexJoint Wearables', targetDescription: 'Rehabilitation wearables for joint recovery.', sector: 'Wearables', region: 'Asia Pacific', location: 'South Korea', countryCode: 'KR', announcementDate: '2025-09-05', buyer: 'MBK Partners', buyerType: 'Financial', employees: 180, dealSize: 230, currency: 'USD', revenue: 48, ebitda: 14, ebit: 10, enterpriseValue: 230, status: 'Included' },
  { id: 'os-6', targetCompany: 'TraumaFix', targetDescription: 'Trauma plates, screws and fixation systems.', sector: 'Medical Devices', region: 'Europe', location: 'United Kingdom', countryCode: 'GB', announcementDate: '2024-08-30', buyer: 'Smith+Nephew', buyerType: 'Strategic', employees: 560, dealSize: 700, currency: 'GBP', revenue: 175, ebitda: 70, ebit: 56, enterpriseValue: 700, status: 'Included' },
  { id: 'os-7', targetCompany: 'OsteoSense', targetDescription: 'Bone-density diagnostic imaging systems.', sector: 'Diagnostics', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-05-21', buyer: 'Bain Capital', buyerType: 'Financial', employees: 240, dealSize: 320, currency: 'USD', revenue: 70, ebitda: 26, ebit: 21, enterpriseValue: 320, status: 'Included' },
  { id: 'os-8', targetCompany: 'ReconMed', targetDescription: 'Joint reconstruction and revision systems.', sector: 'Medical Devices', region: 'Europe', location: 'France', countryCode: 'FR', announcementDate: '2024-10-02', buyer: 'Medtronic', buyerType: 'Strategic', employees: 480, dealSize: 600, currency: 'EUR', revenue: 150, ebitda: 60, ebit: 48, enterpriseValue: 600, status: 'Included' },
  { id: 'os-9', targetCompany: 'ProstheTech', targetDescription: 'Smart prosthetics startup; pre-profitability.', sector: 'Medical Devices', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-03-19', buyer: 'Sofina', buyerType: 'Financial', employees: 60, dealSize: 80, currency: 'USD', revenue: 9, ebitda: -2, ebit: -4, enterpriseValue: 80, status: 'Excluded' },
  { id: 'os-10', targetCompany: 'KneeWorks', targetDescription: 'Custom knee implants; enterprise value undisclosed.', sector: 'Medical Devices', region: 'Asia Pacific', location: 'Japan', countryCode: 'JP', announcementDate: '2024-09-14', buyer: 'Olympus', buyerType: 'Strategic', employees: 520, dealSize: 540, currency: 'USD', revenue: 140, ebitda: 38, ebit: 30, enterpriseValue: null, status: 'Excluded' },
  { id: 'os-11', targetCompany: 'SpinalGraft', targetDescription: 'Spinal biologics; EBITDA not disclosed.', sector: 'Pharmaceuticals', region: 'Latin America', location: 'Brazil', countryCode: 'BR', announcementDate: '2025-02-07', buyer: 'Advent International', buyerType: 'Financial', employees: 90, dealSize: 120, currency: 'USD', revenue: 18, ebitda: null, ebit: null, enterpriseValue: 120, status: 'Excluded' },
]);

/* ── Company 5: CardioWave Systems (cardiac monitoring / devices) ── */

const CARDIOWAVE_TX = withMultiples([
  { id: 'cw-1', targetCompany: 'RhythmGuard', targetDescription: 'Implantable cardiac monitors and defibrillators.', sector: 'Medical Devices', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-06-03', buyer: 'Abbott', buyerType: 'Strategic', employees: 600, dealSize: 950, currency: 'USD', revenue: 210, ebitda: 88, ebit: 70, enterpriseValue: 950, status: 'Included' },
  { id: 'cw-2', targetCompany: 'PulseStream', targetDescription: 'Remote cardiac telemetry SaaS platform.', sector: 'Health IT / SaaS', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-08-12', buyer: 'Vista Equity', buyerType: 'Financial', employees: 160, dealSize: 240, currency: 'USD', revenue: 42, ebitda: 12, ebit: 9, enterpriseValue: 240, status: 'Included' },
  { id: 'cw-3', targetCompany: 'CardioWear', targetDescription: 'Consumer ECG smartwatch and patch sensors.', sector: 'Wearables', region: 'Europe', location: 'Switzerland', countryCode: 'CH', announcementDate: '2025-02-25', buyer: 'EQT Partners', buyerType: 'Financial', employees: 220, dealSize: 300, currency: 'CHF', revenue: 60, ebitda: 18, ebit: 13, enterpriseValue: 300, status: 'Included' },
  { id: 'cw-4', targetCompany: 'EKGenius', targetDescription: 'AI ECG interpretation and diagnostic carts.', sector: 'Diagnostics', region: 'Europe', location: 'United Kingdom', countryCode: 'GB', announcementDate: '2024-11-08', buyer: 'GE HealthCare', buyerType: 'Strategic', employees: 380, dealSize: 460, currency: 'GBP', revenue: 115, ebitda: 46, ebit: 37, enterpriseValue: 460, status: 'Included' },
  { id: 'cw-5', targetCompany: 'HeartSignal', targetDescription: 'Cardiac mapping and electrophysiology systems.', sector: 'Medical Devices', region: 'Europe', location: 'Germany', countryCode: 'DE', announcementDate: '2024-07-30', buyer: 'Siemens Healthineers', buyerType: 'Strategic', employees: 540, dealSize: 720, currency: 'EUR', revenue: 180, ebitda: 72, ebit: 58, enterpriseValue: 720, status: 'Included' },
  { id: 'cw-6', targetCompany: 'ArrhythmiaAI', targetDescription: 'Machine-learning arrhythmia detection software.', sector: 'Health IT / SaaS', region: 'North America', location: 'Canada', countryCode: 'CA', announcementDate: '2025-05-19', buyer: 'Warburg Pincus', buyerType: 'Financial', employees: 95, dealSize: 175, currency: 'USD', revenue: 30, ebitda: 8, ebit: 6, enterpriseValue: 175, status: 'Included' },
  { id: 'cw-7', targetCompany: 'ValveTech', targetDescription: 'Transcatheter heart-valve replacement systems.', sector: 'Medical Devices', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2024-12-15', buyer: 'Edwards Lifesciences', buyerType: 'Strategic', employees: 700, dealSize: 1300, currency: 'USD', revenue: 290, ebitda: 120, ebit: 96, enterpriseValue: 1300, status: 'Included' },
  { id: 'cw-8', targetCompany: 'BeatBox Monitors', targetDescription: 'Holter and event monitoring wearables.', sector: 'Wearables', region: 'Asia Pacific', location: 'Australia', countryCode: 'AU', announcementDate: '2025-07-07', buyer: 'Pacific Equity Partners', buyerType: 'Financial', employees: 140, dealSize: 190, currency: 'USD', revenue: 40, ebitda: 11, ebit: 8, enterpriseValue: 190, status: 'Included' },
  { id: 'cw-9', targetCompany: 'NanoPace', targetDescription: 'Leadless pacemaker startup; pre-profitability.', sector: 'Medical Devices', region: 'Middle East & Africa', location: 'Israel', countryCode: 'IL', announcementDate: '2025-03-28', buyer: 'Pitango', buyerType: 'Financial', employees: 50, dealSize: 90, currency: 'USD', revenue: 7, ebitda: -3, ebit: -5, enterpriseValue: 90, status: 'Excluded' },
  { id: 'cw-10', targetCompany: 'CardioSilico', targetDescription: 'Cardiac digital-twin simulation; EV undisclosed.', sector: 'Health IT / SaaS', region: 'Asia Pacific', location: 'India', countryCode: 'IN', announcementDate: '2024-09-30', buyer: 'Tata Capital', buyerType: 'Strategic', employees: 300, dealSize: 260, currency: 'USD', revenue: 55, ebitda: 14, ebit: 10, enterpriseValue: null, status: 'Excluded' },
  { id: 'cw-11', targetCompany: 'HoltPlus', targetDescription: 'Ambulatory ECG diagnostics; EBITDA not disclosed.', sector: 'Diagnostics', region: 'Europe', location: 'Spain', countryCode: 'ES', announcementDate: '2025-04-22', buyer: 'Cinven', buyerType: 'Financial', employees: 160, dealSize: 140, currency: 'EUR', revenue: 28, ebitda: null, ebit: null, enterpriseValue: 140, status: 'Excluded' },
]);

/* ── Company 6: GenomaLeap Diagnostics (genomics / molecular diagnostics) ── */

const GENOMALEAP_TX = withMultiples([
  { id: 'gl-1', targetCompany: 'SeqCore', targetDescription: 'High-throughput sequencing instruments and reagents.', sector: 'Diagnostics', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-05-06', buyer: 'Illumina', buyerType: 'Strategic', employees: 620, dealSize: 1400, currency: 'USD', revenue: 300, ebitda: 120, ebit: 96, enterpriseValue: 1400, status: 'Included' },
  { id: 'gl-2', targetCompany: 'VariantIQ', targetDescription: 'Clinical variant interpretation software.', sector: 'Health IT / SaaS', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-09-11', buyer: 'Thoma Bravo', buyerType: 'Financial', employees: 180, dealSize: 320, currency: 'USD', revenue: 55, ebitda: 15, ebit: 11, enterpriseValue: 320, status: 'Included' },
  { id: 'gl-3', targetCompany: 'OncoPanel', targetDescription: 'Comprehensive genomic profiling for oncology.', sector: 'Diagnostics', region: 'Europe', location: 'Germany', countryCode: 'DE', announcementDate: '2024-10-18', buyer: 'Roche', buyerType: 'Strategic', employees: 450, dealSize: 760, currency: 'EUR', revenue: 165, ebitda: 66, ebit: 53, enterpriseValue: 760, status: 'Included' },
  { id: 'gl-4', targetCompany: 'GeneTx Bio', targetDescription: 'Gene-therapy CDMO and manufacturing.', sector: 'Pharmaceuticals', region: 'Europe', location: 'Switzerland', countryCode: 'CH', announcementDate: '2025-01-23', buyer: 'Partners Group', buyerType: 'Financial', employees: 520, dealSize: 980, currency: 'CHF', revenue: 175, ebitda: 62, ebit: 50, enterpriseValue: 980, status: 'Included' },
  { id: 'gl-5', targetCompany: 'RapidSeq', targetDescription: 'Rapid pathogen sequencing for clinical labs.', sector: 'Diagnostics', region: 'Europe', location: 'United Kingdom', countryCode: 'GB', announcementDate: '2024-12-04', buyer: 'Cinven', buyerType: 'Financial', employees: 260, dealSize: 380, currency: 'GBP', revenue: 82, ebitda: 30, ebit: 24, enterpriseValue: 380, status: 'Included' },
  { id: 'gl-6', targetCompany: 'BioInformatix', targetDescription: 'Genomic data platform and pipelines.', sector: 'Health IT / SaaS', region: 'North America', location: 'Canada', countryCode: 'CA', announcementDate: '2025-06-27', buyer: 'Hg', buyerType: 'Financial', employees: 120, dealSize: 210, currency: 'USD', revenue: 36, ebitda: 9, ebit: 7, enterpriseValue: 210, status: 'Included' },
  { id: 'gl-7', targetCompany: 'MicroArray Devices', targetDescription: 'Microarray scanners and consumables.', sector: 'Medical Devices', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2024-08-13', buyer: 'Danaher Corporation', buyerType: 'Strategic', employees: 540, dealSize: 700, currency: 'USD', revenue: 160, ebitda: 64, ebit: 51, enterpriseValue: 700, status: 'Included' },
  { id: 'gl-8', targetCompany: 'PharmaGenix', targetDescription: 'Companion-diagnostic and pharmacogenomics.', sector: 'Pharmaceuticals', region: 'Europe', location: 'France', countryCode: 'FR', announcementDate: '2025-03-30', buyer: 'Sanofi', buyerType: 'Strategic', employees: 680, dealSize: 1500, currency: 'EUR', revenue: 320, ebitda: 110, ebit: 88, enterpriseValue: 1500, status: 'Included' },
  { id: 'gl-9', targetCompany: 'CellScan', targetDescription: 'Single-cell sequencing startup; pre-profitability.', sector: 'Diagnostics', region: 'Asia Pacific', location: 'Singapore', countryCode: 'SG', announcementDate: '2025-02-14', buyer: 'Temasek', buyerType: 'Financial', employees: 70, dealSize: 110, currency: 'USD', revenue: 12, ebitda: -1, ebit: -3, enterpriseValue: 110, status: 'Excluded' },
  { id: 'gl-10', targetCompany: 'GenoCloud', targetDescription: 'Cloud genomics platform; EV undisclosed.', sector: 'Health IT / SaaS', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2024-09-08', buyer: 'Insight Partners', buyerType: 'Financial', employees: 200, dealSize: 300, currency: 'USD', revenue: 50, ebitda: 13, ebit: 10, enterpriseValue: null, status: 'Excluded' },
  { id: 'gl-11', targetCompany: 'SinoGene', targetDescription: 'Domestic Chinese sequencing; EBITDA not disclosed.', sector: 'Diagnostics', region: 'Asia Pacific', location: 'China', countryCode: 'CN', announcementDate: '2025-04-29', buyer: 'BGI Group', buyerType: 'Strategic', employees: 800, dealSize: 180, currency: 'USD', revenue: 60, ebitda: null, ebit: null, enterpriseValue: 180, status: 'Excluded' },
]);

export const PRESET_COMPANIES: PresetCompany[] = [
  {
    id: 'novapulse',
    name: 'NovaPulse Medical',
    description: 'Non-invasive respiratory monitoring hardware & software for ICU and home-care.',
    presetFilters: filters({
      transactionAge: { min: null, max: 5 },
      buyerType: ['Strategic', 'Financial'],
      geography: NA_EUROPE,
      revenue: { min: null, max: 500 },
      ebitda: { min: null, max: 150 },
      evEbitda: { min: 8, max: 18 },
      evRevenue: { min: 2, max: 8 },
    }),
    transactions: NOVAPULSE_TX,
  },
  {
    id: 'vitaledge',
    name: 'VitalEdge Diagnostics',
    description: 'In-vitro diagnostics, lab automation, and clinical decision software.',
    presetFilters: filters({
      transactionAge: { min: null, max: 6 },
      buyerType: ['Strategic', 'Financial'],
      geography: NA_EUROPE,
      revenue: { min: 20, max: 300 },
      ebitda: { min: null, max: 130 },
      evEbitda: { min: 8, max: 20 },
      evRevenue: { min: 2, max: 8 },
    }),
    transactions: VITALEDGE_TX,
  },
  {
    id: 'helios',
    name: 'Helios Surgical',
    description: 'Surgical devices, implants, and single-use procedure supplies.',
    presetFilters: filters({
      transactionAge: { min: null, max: 5 },
      buyerType: ['Strategic', 'Financial'],
      geography: NA_EUROPE,
      employees: { min: 100, max: 2000 },
      ebitda: { min: 20, max: 150 },
      evEbitda: { min: 8, max: 16 },
      evRevenue: { min: 2, max: 6 },
    }),
    transactions: HELIOS_TX,
  },
  {
    id: 'orthosphere',
    name: 'OrthoSphere Surgical',
    description: 'Orthopedic implants, trauma fixation, and joint reconstruction.',
    presetFilters: filters({
      transactionAge: { min: null, max: 6 },
      buyerType: ['Strategic', 'Financial'],
      geography: NA_EUROPE,
      employees: { min: 100, max: 1500 },
      revenue: { min: 50, max: 400 },
      evEbitda: { min: 8, max: 18 },
      evRevenue: { min: 2, max: 7 },
    }),
    transactions: ORTHOSPHERE_TX,
  },
  {
    id: 'cardiowave',
    name: 'CardioWave Systems',
    description: 'Cardiac monitoring devices, electrophysiology, and connected wearables.',
    presetFilters: filters({
      transactionAge: { min: null, max: 5 },
      buyerType: ['Strategic', 'Financial'],
      geography: NA_EUROPE,
      employees: { min: 80, max: 800 },
      revenue: { min: null, max: 350 },
      evEbitda: { min: 8, max: 18 },
      evRevenue: { min: 2, max: 8 },
    }),
    transactions: CARDIOWAVE_TX,
  },
  {
    id: 'genomaleap',
    name: 'GenomaLeap Diagnostics',
    description: 'Genomics instruments, molecular diagnostics, and bioinformatics.',
    presetFilters: filters({
      transactionAge: { min: null, max: 7 },
      buyerType: ['Strategic', 'Financial'],
      geography: NA_EUROPE,
      revenue: { min: 30, max: 350 },
      ebitda: { min: null, max: 130 },
      evEbitda: { min: 8, max: 20 },
      evRevenue: { min: 2, max: 9 },
    }),
    transactions: GENOMALEAP_TX,
  },
];
