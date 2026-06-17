import type { CompTransaction, DealCompFilters, PresetCompany } from './types';
import { EMPTY_FILTERS } from './types';

export { SECTORS, REGIONS, BUYER_TYPES } from './types';

function filters(overrides: Partial<DealCompFilters>): DealCompFilters {
  return { ...EMPTY_FILTERS, ...overrides };
}

/* ── Company 1: NovaPulse Medical (respiratory monitoring) ── */

const NOVAPULSE_TX: CompTransaction[] = [
  { id: 'np-1', targetCompany: 'RespiraTech Solutions', targetDescription: 'Non-invasive respiratory monitoring devices for ICU settings.', sector: 'Medical Devices', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-11-15', buyer: 'Medtronic', buyerType: 'Strategic', employees: 320, dealSize: 450, currency: 'USD', revenue: 85, ebitda: 32, ebit: 26, enterpriseValue: 450, evRevenueMultiple: 5.3, evEbitdaMultiple: 14.1, evEbitMultiple: 17.3, status: 'Included' },
  { id: 'np-2', targetCompany: 'AirFlow Diagnostics', targetDescription: 'Portable spirometry and lung-function testing equipment.', sector: 'Diagnostics', region: 'Europe', location: 'Germany', countryCode: 'DE', announcementDate: '2025-08-22', buyer: 'Philips Healthcare', buyerType: 'Strategic', employees: 210, dealSize: 280, currency: 'EUR', revenue: 72, ebitda: 22, ebit: 18, enterpriseValue: 310, evRevenueMultiple: 4.3, evEbitdaMultiple: 14.1, evEbitMultiple: 17.2, status: 'Included' },
  { id: 'np-3', targetCompany: 'OxySense Labs', targetDescription: 'AI-powered pulse oximetry software and hardware.', sector: 'Health IT / SaaS', region: 'Europe', location: 'United Kingdom', countryCode: 'GB', announcementDate: '2025-05-10', buyer: 'Carlyle Group', buyerType: 'Financial', employees: 85, dealSize: 120, currency: 'GBP', revenue: 28, ebitda: 8, ebit: 6, enterpriseValue: 120, evRevenueMultiple: 4.3, evEbitdaMultiple: 15.0, evEbitMultiple: 20.0, status: 'Included' },
  { id: 'np-4', targetCompany: 'LungGuard Inc.', targetDescription: 'Disposable respiratory filters and accessories.', sector: 'Medical Supplies', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2024-12-01', buyer: '3M', buyerType: 'Strategic', employees: 1200, dealSize: 850, currency: 'USD', revenue: 320, ebitda: 95, ebit: 76, enterpriseValue: 850, evRevenueMultiple: 2.7, evEbitdaMultiple: 8.9, evEbitMultiple: 11.2, status: 'Included' },
  { id: 'np-5', targetCompany: 'PulmoTech AG', targetDescription: 'CPAP/BiPAP therapy devices with connected patient monitoring.', sector: 'Medical Devices', region: 'Europe', location: 'Switzerland', countryCode: 'CH', announcementDate: '2025-03-08', buyer: 'EQT Partners', buyerType: 'Financial', employees: 380, dealSize: 340, currency: 'CHF', revenue: 95, ebitda: 28, ebit: 22, enterpriseValue: 370, evRevenueMultiple: 3.9, evEbitdaMultiple: 13.2, evEbitMultiple: 16.8, status: 'Included' },
  { id: 'np-6', targetCompany: 'NebulaSoft Health', targetDescription: 'Cloud-based respiratory data analytics platform for hospitals.', sector: 'Health IT / SaaS', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-06-14', buyer: 'Warburg Pincus', buyerType: 'Financial', employees: 150, dealSize: 195, currency: 'USD', revenue: 38, ebitda: 12, ebit: 10, enterpriseValue: 195, evRevenueMultiple: 5.1, evEbitdaMultiple: 16.3, evEbitMultiple: 19.5, status: 'Included' },
  { id: 'np-7', targetCompany: 'CapnoStream Medical', targetDescription: 'Capnography monitoring systems for anesthesia and critical care.', sector: 'Medical Devices', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2024-09-20', buyer: 'Danaher Corporation', buyerType: 'Strategic', employees: 520, dealSize: 580, currency: 'USD', revenue: 148, ebitda: 52, ebit: 42, enterpriseValue: 580, evRevenueMultiple: 3.9, evEbitdaMultiple: 11.2, evEbitMultiple: 13.8, status: 'Included' },
  { id: 'np-8', targetCompany: 'TidalSense Ltd', targetDescription: 'Handheld COPD/asthma diagnostic device with AI severity scoring.', sector: 'Diagnostics', region: 'Europe', location: 'United Kingdom', countryCode: 'GB', announcementDate: '2025-09-02', buyer: 'Apax Partners', buyerType: 'Financial', employees: 45, dealSize: 85, currency: 'GBP', revenue: 15, ebitda: 5, ebit: 4, enterpriseValue: 105, evRevenueMultiple: 7.0, evEbitdaMultiple: 21.0, evEbitMultiple: 26.3, status: 'Included' },
  { id: 'np-9', targetCompany: 'Inspiro Systems', targetDescription: 'Neonatal ventilator and respiratory support systems for NICUs.', sector: 'Medical Devices', region: 'Europe', location: 'Sweden', countryCode: 'SE', announcementDate: '2024-07-11', buyer: 'Getinge AB', buyerType: 'Strategic', employees: 240, dealSize: 220, currency: 'EUR', revenue: 62, ebitda: 18, ebit: 14, enterpriseValue: 245, evRevenueMultiple: 4.0, evEbitdaMultiple: 13.6, evEbitMultiple: 17.5, status: 'Included' },
  { id: 'np-10', targetCompany: 'VentilateNow', targetDescription: 'Emergency ventilator manufacturing startup.', sector: 'Medical Devices', region: 'Europe', location: 'France', countryCode: 'FR', announcementDate: '2024-10-15', buyer: 'Hillrom', buyerType: 'Strategic', employees: 60, dealSize: 65, currency: 'EUR', revenue: null, ebitda: -2, ebit: null, enterpriseValue: 65, evRevenueMultiple: null, evEbitdaMultiple: null, evEbitMultiple: null, status: 'Excluded' },
  { id: 'np-11', targetCompany: 'BreatheEasy Systems', targetDescription: 'Home sleep-apnea testing devices.', sector: 'Medical Devices', region: 'Asia Pacific', location: 'Australia', countryCode: 'AU', announcementDate: '2025-01-20', buyer: 'ResMed', buyerType: 'Strategic', employees: 1800, dealSize: 1500, currency: 'USD', revenue: 410, ebitda: null, ebit: null, enterpriseValue: 1500, evRevenueMultiple: 3.7, evEbitdaMultiple: null, evEbitMultiple: null, status: 'Excluded' },
  { id: 'np-12', targetCompany: 'SinoResp Medical', targetDescription: 'Low-cost ventilators and oxygen concentrators.', sector: 'Medical Devices', region: 'Asia Pacific', location: 'China', countryCode: 'CN', announcementDate: '2024-11-30', buyer: 'Mindray Medical', buyerType: 'Strategic', employees: 900, dealSize: 90, currency: 'USD', revenue: 55, ebitda: 11, ebit: 9, enterpriseValue: null, evRevenueMultiple: null, evEbitdaMultiple: null, evEbitMultiple: null, status: 'Excluded' },
];

/* ── Company 2: VitalEdge Diagnostics (diagnostics / lab) ── */

const VITALEDGE_TX: CompTransaction[] = [
  { id: 'vd-1', targetCompany: 'GenoSpark Labs', targetDescription: 'Next-generation sequencing reagents and lab automation.', sector: 'Diagnostics', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-02-12', buyer: 'Thermo Fisher', buyerType: 'Strategic', employees: 540, dealSize: 620, currency: 'USD', revenue: 140, ebitda: 70, ebit: 56, enterpriseValue: 620, evRevenueMultiple: 4.4, evEbitdaMultiple: 8.9, evEbitMultiple: 11.1, status: 'Included' },
  { id: 'vd-2', targetCompany: 'ClariPath', targetDescription: 'Digital pathology imaging and workflow software.', sector: 'Diagnostics', region: 'Europe', location: 'United Kingdom', countryCode: 'GB', announcementDate: '2024-10-05', buyer: 'Bridgepoint', buyerType: 'Financial', employees: 230, dealSize: 280, currency: 'GBP', revenue: 60, ebitda: 24, ebit: 19, enterpriseValue: 300, evRevenueMultiple: 5.0, evEbitdaMultiple: 12.5, evEbitMultiple: 15.8, status: 'Included' },
  { id: 'vd-3', targetCompany: 'NanoAssay Systems', targetDescription: 'Point-of-care immunoassay analyzers.', sector: 'Medical Devices', region: 'North America', location: 'Canada', countryCode: 'CA', announcementDate: '2025-06-30', buyer: 'Danaher Corporation', buyerType: 'Strategic', employees: 410, dealSize: 510, currency: 'USD', revenue: 120, ebitda: 48, ebit: 38, enterpriseValue: 510, evRevenueMultiple: 4.3, evEbitdaMultiple: 10.6, evEbitMultiple: 13.4, status: 'Included' },
  { id: 'vd-4', targetCompany: 'LabFlow Software', targetDescription: 'Cloud LIMS for clinical and research laboratories.', sector: 'Health IT / SaaS', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-09-18', buyer: 'Vista Equity', buyerType: 'Financial', employees: 180, dealSize: 240, currency: 'USD', revenue: 45, ebitda: 13, ebit: 10, enterpriseValue: 240, evRevenueMultiple: 5.3, evEbitdaMultiple: 18.5, evEbitMultiple: 24.0, status: 'Included' },
  { id: 'vd-5', targetCompany: 'ImmunoTrace', targetDescription: 'Autoimmune and infectious-disease assay manufacturer.', sector: 'Diagnostics', region: 'Europe', location: 'Germany', countryCode: 'DE', announcementDate: '2024-08-21', buyer: 'Roche', buyerType: 'Strategic', employees: 700, dealSize: 1100, currency: 'EUR', revenue: 260, ebitda: 115, ebit: 92, enterpriseValue: 1150, evRevenueMultiple: 4.4, evEbitdaMultiple: 10.0, evEbitMultiple: 12.5, status: 'Included' },
  { id: 'vd-6', targetCompany: 'PathoSeq', targetDescription: 'Metagenomic pathogen-detection SaaS platform.', sector: 'Health IT / SaaS', region: 'Asia Pacific', location: 'Singapore', countryCode: 'SG', announcementDate: '2025-04-02', buyer: 'Temasek', buyerType: 'Financial', employees: 95, dealSize: 160, currency: 'USD', revenue: 30, ebitda: 7, ebit: 5, enterpriseValue: 160, evRevenueMultiple: 5.3, evEbitdaMultiple: 22.9, evEbitMultiple: 32.0, status: 'Included' },
  { id: 'vd-7', targetCompany: 'ClinChem Devices', targetDescription: 'Clinical chemistry analyzers and consumables.', sector: 'Medical Devices', region: 'Europe', location: 'France', countryCode: 'FR', announcementDate: '2024-11-29', buyer: 'bioMérieux', buyerType: 'Strategic', employees: 320, dealSize: 360, currency: 'EUR', revenue: 95, ebitda: 40, ebit: 32, enterpriseValue: 360, evRevenueMultiple: 3.8, evEbitdaMultiple: 9.0, evEbitMultiple: 11.3, status: 'Included' },
  { id: 'vd-8', targetCompany: 'RapidTest Now', targetDescription: 'Rapid antigen and home-testing kit producer.', sector: 'Diagnostics', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-07-15', buyer: 'KKR', buyerType: 'Financial', employees: 260, dealSize: 330, currency: 'USD', revenue: 78, ebitda: 30, ebit: 24, enterpriseValue: 330, evRevenueMultiple: 4.2, evEbitdaMultiple: 11.0, evEbitMultiple: 13.8, status: 'Included' },
  { id: 'vd-9', targetCompany: 'EarlyDx', targetDescription: 'Early-cancer liquid-biopsy startup, pre-profitability.', sector: 'Diagnostics', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-03-10', buyer: 'Sofina', buyerType: 'Financial', employees: 40, dealSize: 55, currency: 'USD', revenue: 6, ebitda: -3, ebit: -5, enterpriseValue: 55, evRevenueMultiple: null, evEbitdaMultiple: null, evEbitMultiple: null, status: 'Excluded' },
  { id: 'vd-10', targetCompany: 'OmniPanel', targetDescription: 'Molecular multiplex panels; EV undisclosed.', sector: 'Medical Devices', region: 'Asia Pacific', location: 'Japan', countryCode: 'JP', announcementDate: '2024-09-01', buyer: 'Sysmex', buyerType: 'Strategic', employees: 600, dealSize: 410, currency: 'USD', revenue: 130, ebitda: 35, ebit: 28, enterpriseValue: null, evRevenueMultiple: null, evEbitdaMultiple: null, evEbitMultiple: null, status: 'Excluded' },
  { id: 'vd-11', targetCompany: 'BioSignal AI', targetDescription: 'AI triage software; EBITDA not disclosed.', sector: 'Health IT / SaaS', region: 'Europe', location: 'Sweden', countryCode: 'SE', announcementDate: '2025-05-22', buyer: 'EQT Partners', buyerType: 'Financial', employees: 70, dealSize: 90, currency: 'EUR', revenue: 12, ebitda: null, ebit: null, enterpriseValue: 90, evRevenueMultiple: 7.5, evEbitdaMultiple: null, evEbitMultiple: null, status: 'Excluded' },
];

/* ── Company 3: Helios Surgical (surgical devices / supplies) ── */

const HELIOS_TX: CompTransaction[] = [
  { id: 'hs-1', targetCompany: 'OrthoNova', targetDescription: 'Orthopedic implants and surgical navigation systems.', sector: 'Medical Devices', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-01-28', buyer: 'Stryker', buyerType: 'Strategic', employees: 900, dealSize: 1400, currency: 'USD', revenue: 320, ebitda: 140, ebit: 112, enterpriseValue: 1400, evRevenueMultiple: 4.4, evEbitdaMultiple: 10.0, evEbitMultiple: 12.5, status: 'Included' },
  { id: 'hs-2', targetCompany: 'SutureTech', targetDescription: 'Advanced wound-closure and suturing supplies.', sector: 'Medical Supplies', region: 'Europe', location: 'Italy', countryCode: 'IT', announcementDate: '2024-12-09', buyer: 'Investindustrial', buyerType: 'Financial', employees: 480, dealSize: 380, currency: 'EUR', revenue: 150, ebitda: 42, ebit: 34, enterpriseValue: 380, evRevenueMultiple: 2.5, evEbitdaMultiple: 9.0, evEbitMultiple: 11.2, status: 'Included' },
  { id: 'hs-3', targetCompany: 'NeuroBlade Surgical', targetDescription: 'Robotic-assisted neurosurgery instruments.', sector: 'Medical Devices', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-05-14', buyer: 'Medtronic', buyerType: 'Strategic', employees: 350, dealSize: 720, currency: 'USD', revenue: 130, ebitda: 58, ebit: 46, enterpriseValue: 720, evRevenueMultiple: 5.5, evEbitdaMultiple: 12.4, evEbitMultiple: 15.7, status: 'Included' },
  { id: 'hs-4', targetCompany: 'FlexDevice Wearables', targetDescription: 'Post-surgical recovery wearables and remote monitoring.', sector: 'Wearables', region: 'Asia Pacific', location: 'South Korea', countryCode: 'KR', announcementDate: '2025-08-03', buyer: 'MBK Partners', buyerType: 'Financial', employees: 210, dealSize: 260, currency: 'USD', revenue: 55, ebitda: 16, ebit: 12, enterpriseValue: 260, evRevenueMultiple: 4.7, evEbitdaMultiple: 16.3, evEbitMultiple: 21.7, status: 'Included' },
  { id: 'hs-5', targetCompany: 'CardioStent AG', targetDescription: 'Drug-eluting coronary stents and delivery systems.', sector: 'Medical Devices', region: 'Europe', location: 'Switzerland', countryCode: 'CH', announcementDate: '2024-07-19', buyer: 'Abbott', buyerType: 'Strategic', employees: 620, dealSize: 980, currency: 'CHF', revenue: 210, ebitda: 92, ebit: 74, enterpriseValue: 980, evRevenueMultiple: 4.7, evEbitdaMultiple: 10.7, evEbitMultiple: 13.2, status: 'Included' },
  { id: 'hs-6', targetCompany: 'PharmaCoat', targetDescription: 'Specialty drug-coating and combination-device pharma.', sector: 'Pharmaceuticals', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-03-22', buyer: 'Blackstone', buyerType: 'Financial', employees: 740, dealSize: 1250, currency: 'USD', revenue: 280, ebitda: 98, ebit: 78, enterpriseValue: 1250, evRevenueMultiple: 4.5, evEbitdaMultiple: 12.8, evEbitMultiple: 16.0, status: 'Included' },
  { id: 'hs-7', targetCompany: 'EndoVision', targetDescription: 'Single-use endoscopes and visualization platforms.', sector: 'Medical Devices', region: 'Europe', location: 'Netherlands', countryCode: 'NL', announcementDate: '2024-10-30', buyer: 'Olympus', buyerType: 'Strategic', employees: 430, dealSize: 540, currency: 'EUR', revenue: 125, ebitda: 50, ebit: 40, enterpriseValue: 540, evRevenueMultiple: 4.3, evEbitdaMultiple: 10.8, evEbitMultiple: 13.5, status: 'Included' },
  { id: 'hs-8', targetCompany: 'SteriPack Supplies', targetDescription: 'Sterile single-use procedure packs and drapes.', sector: 'Medical Supplies', region: 'Latin America', location: 'Mexico', countryCode: 'MX', announcementDate: '2025-06-11', buyer: 'Advent International', buyerType: 'Financial', employees: 1100, dealSize: 300, currency: 'USD', revenue: 140, ebitda: 30, ebit: 24, enterpriseValue: 300, evRevenueMultiple: 2.1, evEbitdaMultiple: 10.0, evEbitMultiple: 12.5, status: 'Included' },
  { id: 'hs-9', targetCompany: 'RoboSuture', targetDescription: 'Pre-revenue surgical-robotics startup; negative EBITDA.', sector: 'Medical Devices', region: 'North America', location: 'United States', countryCode: 'US', announcementDate: '2025-02-18', buyer: 'Sofina', buyerType: 'Financial', employees: 60, dealSize: 70, currency: 'USD', revenue: 8, ebitda: -1, ebit: -3, enterpriseValue: 70, evRevenueMultiple: null, evEbitdaMultiple: null, evEbitMultiple: null, status: 'Excluded' },
  { id: 'hs-10', targetCompany: 'GraftLine', targetDescription: 'Biologic graft pharma; enterprise value undisclosed.', sector: 'Pharmaceuticals', region: 'Europe', location: 'United Kingdom', countryCode: 'GB', announcementDate: '2024-09-26', buyer: 'Smith+Nephew', buyerType: 'Strategic', employees: 540, dealSize: 900, currency: 'GBP', revenue: 190, ebitda: 60, ebit: 48, enterpriseValue: null, evRevenueMultiple: null, evEbitdaMultiple: null, evEbitMultiple: null, status: 'Excluded' },
  { id: 'hs-11', targetCompany: 'PulseWear', targetDescription: 'Early-stage cardiac wearable; EBITDA not disclosed.', sector: 'Wearables', region: 'Middle East & Africa', location: 'Israel', countryCode: 'IL', announcementDate: '2025-04-19', buyer: 'Pitango', buyerType: 'Financial', employees: 35, dealSize: 45, currency: 'USD', revenue: 5, ebitda: null, ebit: null, enterpriseValue: 45, evRevenueMultiple: 9.0, evEbitdaMultiple: null, evEbitMultiple: null, status: 'Excluded' },
];

export const PRESET_COMPANIES: PresetCompany[] = [
  {
    id: 'novapulse',
    name: 'NovaPulse Medical',
    description: 'Non-invasive respiratory monitoring hardware & software for ICU and home-care.',
    presetFilters: filters({
      sector: ['Medical Devices', 'Diagnostics', 'Health IT / SaaS'],
      buyerType: ['Strategic', 'Financial'],
      geography: ['North America', 'Europe'],
      evEbitda: { min: 8, max: 20 },
    }),
    transactions: NOVAPULSE_TX,
  },
  {
    id: 'vitaledge',
    name: 'VitalEdge Diagnostics',
    description: 'In-vitro diagnostics, lab automation, and clinical decision software.',
    presetFilters: filters({
      sector: ['Diagnostics', 'Health IT / SaaS'],
      buyerType: ['Strategic', 'Financial'],
      geography: ['North America', 'Europe'],
      revenue: { min: 30, max: 300 },
      evEbitda: { min: 8, max: 25 },
    }),
    transactions: VITALEDGE_TX,
  },
  {
    id: 'helios',
    name: 'Helios Surgical',
    description: 'Surgical devices, implants, and single-use procedure supplies.',
    presetFilters: filters({
      sector: ['Medical Devices', 'Medical Supplies'],
      buyerType: ['Strategic', 'Financial'],
      geography: ['North America', 'Europe'],
      evEbitda: { min: 8, max: 18 },
    }),
    transactions: HELIOS_TX,
  },
];
