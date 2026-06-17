export interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2, for flag CDN
}

export interface RegionGroup {
  region: string;
  countries: Country[];
}

// Regions with their countries. North America first. Country names must match
// CompTransaction.location exactly for the ones present in the seed data.
export const REGION_COUNTRIES: RegionGroup[] = [
  {
    region: 'North America',
    countries: [
      { name: 'United States', code: 'US' },
      { name: 'Canada', code: 'CA' },
    ],
  },
  {
    region: 'Europe',
    countries: [
      { name: 'United Kingdom', code: 'GB' },
      { name: 'Germany', code: 'DE' },
      { name: 'France', code: 'FR' },
      { name: 'Switzerland', code: 'CH' },
      { name: 'Netherlands', code: 'NL' },
      { name: 'Sweden', code: 'SE' },
      { name: 'Italy', code: 'IT' },
      { name: 'Spain', code: 'ES' },
      { name: 'Ireland', code: 'IE' },
      { name: 'Belgium', code: 'BE' },
      { name: 'Denmark', code: 'DK' },
      { name: 'Norway', code: 'NO' },
      { name: 'Finland', code: 'FI' },
      { name: 'Austria', code: 'AT' },
      { name: 'Poland', code: 'PL' },
      { name: 'Portugal', code: 'PT' },
      { name: 'Greece', code: 'GR' },
      { name: 'Czech Republic', code: 'CZ' },
      { name: 'Hungary', code: 'HU' },
      { name: 'Luxembourg', code: 'LU' },
    ],
  },
  {
    region: 'Asia Pacific',
    countries: [
      { name: 'China', code: 'CN' },
      { name: 'Japan', code: 'JP' },
      { name: 'Australia', code: 'AU' },
      { name: 'South Korea', code: 'KR' },
      { name: 'Singapore', code: 'SG' },
      { name: 'India', code: 'IN' },
      { name: 'New Zealand', code: 'NZ' },
      { name: 'Hong Kong', code: 'HK' },
      { name: 'Taiwan', code: 'TW' },
      { name: 'Indonesia', code: 'ID' },
      { name: 'Malaysia', code: 'MY' },
      { name: 'Thailand', code: 'TH' },
      { name: 'Vietnam', code: 'VN' },
      { name: 'Philippines', code: 'PH' },
    ],
  },
  {
    region: 'Latin America',
    countries: [
      { name: 'Mexico', code: 'MX' },
      { name: 'Brazil', code: 'BR' },
      { name: 'Argentina', code: 'AR' },
      { name: 'Chile', code: 'CL' },
      { name: 'Colombia', code: 'CO' },
      { name: 'Peru', code: 'PE' },
      { name: 'Uruguay', code: 'UY' },
      { name: 'Costa Rica', code: 'CR' },
      { name: 'Panama', code: 'PA' },
    ],
  },
  {
    region: 'Middle East & Africa',
    countries: [
      { name: 'Israel', code: 'IL' },
      { name: 'United Arab Emirates', code: 'AE' },
      { name: 'Saudi Arabia', code: 'SA' },
      { name: 'Qatar', code: 'QA' },
      { name: 'Turkey', code: 'TR' },
      { name: 'South Africa', code: 'ZA' },
      { name: 'Egypt', code: 'EG' },
      { name: 'Nigeria', code: 'NG' },
      { name: 'Kenya', code: 'KE' },
      { name: 'Morocco', code: 'MA' },
    ],
  },
];
