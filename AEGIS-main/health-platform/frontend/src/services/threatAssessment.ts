





const FREEDOM_SCORES: Record<string, number> = {
  AF: 8,  AL: 67, DZ: 26, AO: 25, AR: 73, AM: 43, AU: 97, AT: 93, AZ: 8,
  BD: 40, BY: 5,  BE: 93, BZ: 81, BJ: 66, BT: 52, BO: 62, BA: 48, BW: 72,
  BR: 73, BN: 19, BG: 76, BF: 31, BI: 15, CV: 91, KH: 24, CM: 21, CA: 98,
  CF: 9,  TD: 13, CL: 93, CN: 9,  CO: 64, KM: 55, CG: 20, CD: 22, CR: 91,
  CI: 54, HR: 79, CU: 10, CY: 94, CZ: 91, DK: 97, DJ: 19, DO: 69, EC: 58,
  EG: 18, SV: 50, ET: 23, FJ: 57, FI: 100,FR: 90, GA: 28, GM: 56, GE: 61,
  DE: 94, GH: 82, GR: 83, GT: 51, GN: 29, GW: 30, GY: 70, HT: 30, HN: 46,
  HU: 66, IN: 66, ID: 59, IR: 14, IQ: 29, IE: 97, IL: 76, IT: 89, JM: 81,
  JP: 96, JO: 30, KZ: 23, KE: 55, KW: 36, KG: 31, LA: 11, LV: 87, LB: 41,
  LS: 70, LR: 55, LY: 10, LT: 90, LU: 97, MG: 56, MW: 61, MY: 48, MV: 41,
  ML: 31, MT: 94, MR: 27, MU: 81, MX: 58, MD: 61, MN: 61, ME: 72, MA: 37,
  MZ: 46, MM: 10, NA: 80, NP: 59, NL: 97, NZ: 99, NI: 15, NE: 32, NG: 43,
  KP: 3,  NO: 100,OM: 22, PK: 37, PA: 83, PG: 64, PY: 64, PE: 68, PH: 53,
  PL: 80, PT: 96, QA: 24, RO: 76, RU: 16, RW: 24, SA: 8,  SN: 71, RS: 58,
  SL: 62, SG: 47, SK: 82, SI: 94, SO: 9,  ZA: 78, SS: 7,  ES: 90, LK: 56,
  SD: 14, SR: 70, SE: 100,CH: 96, SY: 2,  TW: 94, TJ: 6,  TZ: 36, TH: 29,
  TL: 72, TG: 26, TN: 31, TR: 32, TM: 2,  UG: 34, UA: 62, AE: 19, GB: 93,
  US: 83, UY: 97, UZ: 9,  VE: 17, VN: 19, YE: 12, ZM: 55, ZW: 27,
};







const TIER1_SANCTIONS = new Set(['CU', 'IR', 'KP', 'SY']);


const TIER2_SANCTIONS = new Set([
  'RU', 'BY', 'VE', 'ZW', 'SD', 'MM', 'LY', 'SO', 'YE',
  'CF', 'CD', 'LB', 'NI', 'AF', 'HT', 'ML',
]);






export function getSanctionsScore(iso2: string): number {
  const code = iso2.toUpperCase();
  if (TIER1_SANCTIONS.has(code)) return 100;
  if (TIER2_SANCTIONS.has(code)) return 65;
  return 0;
}


export function getPressureScore(iso2: string): number {
  const code = iso2.toUpperCase();
  const fh = FREEDOM_SCORES[code] ?? 55;
  return Math.round(100 - fh);
}


export function getGlobeThreatScore(iso2: string): number {
  return Math.round(getSanctionsScore(iso2) * 0.45 + getPressureScore(iso2) * 0.55);
}





export interface ThreatComponent {
  label: string;
  score: number;    
  source: string;
  weight: number;   
}

export interface ThreatAssessment {
  overall: number;
  level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'MINIMAL';
  color: string;
  components: ThreatComponent[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  lastUpdated: string;
  sources: string[];
}

function toLevel(score: number): ThreatAssessment['level'] {
  if (score >= 75) return 'CRITICAL';
  if (score >= 55) return 'HIGH';
  if (score >= 35) return 'MODERATE';
  if (score >= 15) return 'LOW';
  return 'MINIMAL';
}

function toColor(level: ThreatAssessment['level']): string {
  switch (level) {
    case 'CRITICAL': return '#ef4444';
    case 'HIGH':     return '#f97316';
    case 'MODERATE': return '#eab308';
    case 'LOW':      return '#22c55e';
    default:         return '#3b82f6';
  }
}


export function computeThreatAssessment(
  iso2: string,
  gdeltArticleCount: number,
  aircraftCount: number,
): ThreatAssessment {
  const sanctionsScore = getSanctionsScore(iso2);
  const pressureScore = getPressureScore(iso2);
  
  const conflictScore = Math.min(100, Math.round((gdeltArticleCount / 20) * 100));
  
  const aircraftScore = Math.min(100, Math.round((aircraftCount / 25) * 100));

  const weights = {
    sanctions: 0.35,
    pressure:  0.30,
    conflict:  0.25,
    aircraft:  0.10,
  };

  const overall = Math.round(
    sanctionsScore * weights.sanctions +
    pressureScore  * weights.pressure  +
    conflictScore  * weights.conflict  +
    aircraftScore  * weights.aircraft,
  );

  const level = toLevel(overall);

  const components: ThreatComponent[] = [
    {
      label:  'Sanctions Exposure',
      score:  sanctionsScore,
      source: 'US Treasury OFAC SDN List, 2024',
      weight: weights.sanctions,
    },
    {
      label:  'Political Pressure',
      score:  pressureScore,
      source: 'Freedom House — Freedom in the World 2024',
      weight: weights.pressure,
    },
    {
      label:  'Conflict Activity',
      score:  conflictScore,
      source: 'GDELT Project — 7-day event index',
      weight: weights.conflict,
    },
    {
      label:  'Air Traffic Density',
      score:  aircraftScore,
      source: 'OpenSky Network — live ADS-B feed',
      weight: weights.aircraft,
    },
  ];

  const confidence: ThreatAssessment['confidence'] =
    gdeltArticleCount > 0 && aircraftCount > 0 ? 'HIGH'   :
    gdeltArticleCount > 0 || aircraftCount > 0 ? 'MEDIUM' : 'LOW';

  return {
    overall,
    level,
    color: toColor(level),
    components,
    confidence,
    lastUpdated: new Date().toISOString(),
    sources: [
      'Freedom House — Freedom in the World 2024',
      'US Treasury OFAC Sanctions List',
      'GDELT Project Event Database',
      'OpenSky Network ADS-B',
    ],
  };
}
