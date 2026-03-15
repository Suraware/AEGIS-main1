import { proxyFetchJSON } from '../lib/proxyManager';

export interface MilitaryEvent {
  id: string;
  title: string;
  description: string;
  lat?: number;
  lng?: number;
  country: string;
  countryCode: string;
  category: 'airstrike' | 'naval' | 'ground' | 'cyber' | 'nuclear' | 'missile' | 'exercise' | 'mobilization' | 'intelligence' | 'general';
  severity: 'critical' | 'high' | 'medium' | 'low';
  source: string;
  sourceUrl: string;
  timestamp: string;
  verified: boolean;
  tags: string[];
}

export interface MilitaryAsset {
  type: 'carrier_group' | 'submarine' | 'airbase' | 'missile_site' | 'radar' | 'base' | 'fleet';
  name: string;
  lat: number;
  lng: number;
  country: string;
  countryCode: string;
  status: 'active' | 'deployed' | 'standby' | 'maintenance';
  notes: string;
}

export interface DefenseBudget {
  country: string;
  countryCode: string;
  year: number;
  budgetUSD: number;
  gdpPercent: number;
  perCapita: number;
  rank: number;
  change: number;
}

export interface ArmsTransfer {
  supplier: string;
  recipient: string;
  supplierCode: string;
  recipientCode: string;
  year: number;
  value: number;
  equipment: string;
  status: 'delivered' | 'ordered' | 'licensed';
}


export const fetchACLEDEvents = async (countryCode: string): Promise<MilitaryEvent[]> => {
  try {
    const url = `https://api.acleddata.com/acled/read?key=ACLED_PUBLIC&country_where=%3D${countryCode}&limit=50&fields=event_id_cnty|event_date|event_type|sub_event_type|actor1|actor2|location|latitude|longitude|fatalities|notes|source|source_scale`;

    let data;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      data = await res.json();
    } catch {
      data = await proxyFetchJSON(url);
    }

    if (data?.data?.length > 0) {
      return data.data.map((e: any) => ({
        id: e.event_id_cnty,
        title: `${e.event_type}: ${e.location}`,
        description: e.notes || '',
        lat: parseFloat(e.latitude),
        lng: parseFloat(e.longitude),
        country: e.country,
        countryCode,
        category: mapACLEDCategory(e.event_type),
        severity: e.fatalities > 50 ? 'critical' : e.fatalities > 10 ? 'high' : e.fatalities > 0 ? 'medium' : 'low',
        source: 'ACLED',
        sourceUrl: 'https://acleddata.com',
        timestamp: e.event_date,
        verified: true,
        tags: [e.event_type, e.sub_event_type, e.actor1].filter(Boolean),
      }));
    }
  } catch (e) {
    console.warn('ACLED failed:', e);
  }
  return [];
};

const mapACLEDCategory = (type: string): MilitaryEvent['category'] => {
  const t = type?.toLowerCase() || '';
  if (t.includes('air') || t.includes('drone')) return 'airstrike';
  if (t.includes('naval') || t.includes('sea')) return 'naval';
  if (t.includes('missile') || t.includes('rocket')) return 'missile';
  if (t.includes('cyber')) return 'cyber';
  if (t.includes('nuclear')) return 'nuclear';
  if (t.includes('exercise') || t.includes('drill')) return 'exercise';
  if (t.includes('mobili') || t.includes('deploy')) return 'mobilization';
  if (t.includes('battle') || t.includes('ground') || t.includes('armed')) return 'ground';
  return 'general';
};


export const fetchGDELTMilitary = async (countryName: string): Promise<MilitaryEvent[]> => {
  try {
    const query = encodeURIComponent(`military defense army navy airforce troops ${countryName}`);
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=artlist&format=json&maxrecords=30&timespan=72h&sort=DateDesc`;

    let data;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      data = await res.json();
    } catch {
      data = await proxyFetchJSON(url);
    }

    if (data?.articles?.length > 0) {
      return data.articles.map((a: any, i: number) => ({
        id: `gdelt_mil_${i}`,
        title: a.title,
        description: a.seendescription || '',
        country: countryName,
        countryCode: '',
        category: detectMilitaryCategory(a.title),
        severity: detectSeverity(a.title),
        source: a.domain || 'GDELT',
        sourceUrl: a.url,
        timestamp: a.seendate,
        verified: false,
        tags: extractMilitaryTags(a.title),
      }));
    }
  } catch (e) {
    console.warn('GDELT military failed:', e);
  }
  return [];
};


export const fetchWikiMilitary = async (countryName: string): Promise<any> => {
  try {
    const queries = [
      `${countryName} Armed Forces`,
      `Military of ${countryName}`,
      `${countryName} military`,
    ];

    for (const q of queries) {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`;
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        const data = await res.json();
        if (data.extract && data.extract.length > 100) {
          return {
            title: data.title,
            summary: data.extract,
            image: data.thumbnail?.source,
            url: data.content_urls?.desktop?.page,
          };
        }
      } catch { continue; }
    }
  } catch (e) {
    console.warn('Wiki military failed:', e);
  }
  return null;
};


export const fetchDefenseBudget = async (countryCode: string, _countryName: string): Promise<DefenseBudget | null> => {
  const SIPRI_2024: Record<string, DefenseBudget> = {
    US: { country: 'United States',  countryCode: 'US', year: 2024, budgetUSD: 916000000000, gdpPercent: 3.4,  perCapita: 2778, rank: 1,  change: 4.2  },
    CN: { country: 'China',          countryCode: 'CN', year: 2024, budgetUSD: 296400000000, gdpPercent: 1.6,  perCapita: 209,  rank: 2,  change: 6.0  },
    RU: { country: 'Russia',         countryCode: 'RU', year: 2024, budgetUSD: 149000000000, gdpPercent: 5.9,  perCapita: 1020, rank: 3,  change: 24.0 },
    IN: { country: 'India',          countryCode: 'IN', year: 2024, budgetUSD: 83600000000,  gdpPercent: 2.4,  perCapita: 59,   rank: 4,  change: 4.2  },
    SA: { country: 'Saudi Arabia',   countryCode: 'SA', year: 2024, budgetUSD: 75800000000,  gdpPercent: 7.1,  perCapita: 2181, rank: 5,  change: -2.1 },
    GB: { country: 'United Kingdom', countryCode: 'GB', year: 2024, budgetUSD: 73700000000,  gdpPercent: 2.3,  perCapita: 1087, rank: 6,  change: 7.5  },
    DE: { country: 'Germany',        countryCode: 'DE', year: 2024, budgetUSD: 66800000000,  gdpPercent: 1.7,  perCapita: 798,  rank: 7,  change: 23.2 },
    UA: { country: 'Ukraine',        countryCode: 'UA', year: 2024, budgetUSD: 64800000000,  gdpPercent: 37.0, perCapita: 1567, rank: 8,  change: 51.0 },
    FR: { country: 'France',         countryCode: 'FR', year: 2024, budgetUSD: 61300000000,  gdpPercent: 2.1,  perCapita: 891,  rank: 9,  change: 11.3 },
    JP: { country: 'Japan',          countryCode: 'JP', year: 2024, budgetUSD: 55300000000,  gdpPercent: 1.4,  perCapita: 441,  rank: 10, change: 16.0 },
    KR: { country: 'South Korea',    countryCode: 'KR', year: 2024, budgetUSD: 47900000000,  gdpPercent: 2.8,  perCapita: 929,  rank: 11, change: 4.2  },
    AU: { country: 'Australia',      countryCode: 'AU', year: 2024, budgetUSD: 40300000000,  gdpPercent: 2.0,  perCapita: 1554, rank: 12, change: 10.0 },
    IL: { country: 'Israel',         countryCode: 'IL', year: 2024, budgetUSD: 37100000000,  gdpPercent: 8.7,  perCapita: 3923, rank: 13, change: 65.0 },
    IT: { country: 'Italy',          countryCode: 'IT', year: 2024, budgetUSD: 35500000000,  gdpPercent: 1.6,  perCapita: 600,  rank: 14, change: 8.5  },
    PL: { country: 'Poland',         countryCode: 'PL', year: 2024, budgetUSD: 34600000000,  gdpPercent: 4.0,  perCapita: 909,  rank: 15, change: 13.2 },
    TR: { country: 'Turkey',         countryCode: 'TR', year: 2024, budgetUSD: 40900000000,  gdpPercent: 3.3,  perCapita: 476,  rank: 16, change: 68.0 },
    BR: { country: 'Brazil',         countryCode: 'BR', year: 2024, budgetUSD: 21100000000,  gdpPercent: 1.2,  perCapita: 99,   rank: 17, change: 3.0  },
    PK: { country: 'Pakistan',       countryCode: 'PK', year: 2024, budgetUSD: 10400000000,  gdpPercent: 3.0,  perCapita: 46,   rank: 19, change: 15.0 },
    IR: { country: 'Iran',           countryCode: 'IR', year: 2024, budgetUSD: 10000000000,  gdpPercent: 2.5,  perCapita: 119,  rank: 20, change: 10.0 },
    KP: { country: 'North Korea',    countryCode: 'KP', year: 2024, budgetUSD: 4000000000,   gdpPercent: 26.0, perCapita: 156,  rank: 28, change: 5.0  },
  };
  return SIPRI_2024[countryCode] || null;
};


export const fetchMilitaryAssets = async (countryCode: string): Promise<MilitaryAsset[]> => {
  const ASSETS: Record<string, MilitaryAsset[]> = {
    US: [
      { type: 'carrier_group', name: 'CSG-12 (USS Gerald R. Ford)',   lat: 36.9,  lng: -75.9,  country: 'United States', countryCode: 'US', status: 'active',   notes: 'Norfolk Naval Station' },
      { type: 'carrier_group', name: 'CSG-3 (USS Nimitz)',            lat: 21.3,  lng: -157.9, country: 'United States', countryCode: 'US', status: 'deployed', notes: 'Pacific deployment' },
      { type: 'airbase',       name: 'Ramstein Air Base',             lat: 49.4,  lng: 7.6,    country: 'United States', countryCode: 'US', status: 'active',   notes: 'USAF Europe HQ' },
      { type: 'airbase',       name: 'Kadena Air Base',               lat: 26.3,  lng: 127.7,  country: 'United States', countryCode: 'US', status: 'active',   notes: 'Largest USAF base in Asia' },
      { type: 'base',          name: 'Camp Humphreys',                lat: 36.9,  lng: 127.0,  country: 'United States', countryCode: 'US', status: 'active',   notes: 'Largest US overseas base' },
      { type: 'base',          name: 'Diego Garcia',                  lat: -7.3,  lng: 72.4,   country: 'United States', countryCode: 'US', status: 'active',   notes: 'Indian Ocean strategic base' },
      { type: 'submarine',     name: 'SSBN-Tennessee (Ohio-class)',   lat: 30.4,  lng: -81.4,  country: 'United States', countryCode: 'US', status: 'standby',  notes: 'Kings Bay SSBN Base' },
    ],
    RU: [
      { type: 'fleet',         name: 'Black Sea Fleet',               lat: 44.6,  lng: 33.5,   country: 'Russia', countryCode: 'RU', status: 'active', notes: 'Sevastopol / Novorossiysk' },
      { type: 'fleet',         name: 'Northern Fleet',                lat: 69.0,  lng: 33.0,   country: 'Russia', countryCode: 'RU', status: 'active', notes: 'Severomorsk HQ' },
      { type: 'fleet',         name: 'Pacific Fleet',                 lat: 43.1,  lng: 131.9,  country: 'Russia', countryCode: 'RU', status: 'active', notes: 'Vladivostok base' },
      { type: 'missile_site',  name: 'Kapustin Yar',                  lat: 48.5,  lng: 45.8,   country: 'Russia', countryCode: 'RU', status: 'active', notes: 'ICBM test range' },
      { type: 'missile_site',  name: 'Plesetsk Cosmodrome',           lat: 62.9,  lng: 40.6,   country: 'Russia', countryCode: 'RU', status: 'active', notes: 'Military space & missile' },
      { type: 'airbase',       name: 'Hmeimim Air Base',              lat: 35.4,  lng: 35.9,   country: 'Russia', countryCode: 'RU', status: 'active', notes: 'Syria deployment' },
    ],
    CN: [
      { type: 'base',          name: 'Sanya Naval Base',              lat: 18.2,  lng: 109.5,  country: 'China', countryCode: 'CN', status: 'active', notes: 'South Sea Fleet HQ' },
      { type: 'base',          name: 'Yulin Naval Base',              lat: 18.2,  lng: 109.6,  country: 'China', countryCode: 'CN', status: 'active', notes: 'SSBN submarine base' },
      { type: 'missile_site',  name: 'DF-41 Silo Field - Yumen',     lat: 40.0,  lng: 97.0,   country: 'China', countryCode: 'CN', status: 'active', notes: 'ICBM silo construction' },
      { type: 'missile_site',  name: 'DF-41 Silo Field - Hami',      lat: 42.5,  lng: 93.5,   country: 'China', countryCode: 'CN', status: 'active', notes: 'New ICBM silo field' },
      { type: 'base',          name: 'Djibouti Naval Base',           lat: 11.5,  lng: 43.1,   country: 'China', countryCode: 'CN', status: 'active', notes: 'First overseas military base' },
      { type: 'airbase',       name: 'Woody Island Airbase',          lat: 16.8,  lng: 112.3,  country: 'China', countryCode: 'CN', status: 'active', notes: 'Paracel Islands militarization' },
    ],
    IL: [
      { type: 'airbase',       name: 'Nevatim Air Base',              lat: 31.2,  lng: 35.0,   country: 'Israel', countryCode: 'IL', status: 'active', notes: 'F-35I Adir base' },
      { type: 'airbase',       name: 'Tel Nof Air Base',              lat: 31.8,  lng: 34.8,   country: 'Israel', countryCode: 'IL', status: 'active', notes: 'Primary IAF base' },
      { type: 'missile_site',  name: 'Sdot Micha',                    lat: 31.7,  lng: 34.9,   country: 'Israel', countryCode: 'IL', status: 'active', notes: 'Jericho ICBM assumed site' },
      { type: 'radar',         name: 'X-Band Radar Station',         lat: 30.9,  lng: 34.7,   country: 'Israel', countryCode: 'IL', status: 'active', notes: 'US AN/TPY-2 radar' },
    ],
    KP: [
      { type: 'missile_site',  name: 'Sohae Launch Facility',        lat: 39.6,  lng: 124.7,  country: 'North Korea', countryCode: 'KP', status: 'active', notes: 'ICBM & satellite launches' },
      { type: 'missile_site',  name: 'Tonghae Satellite Base',       lat: 40.8,  lng: 129.6,  country: 'North Korea', countryCode: 'KP', status: 'active', notes: 'Musudan-ri launch facility' },
      { type: 'base',          name: 'Yongbyon Nuclear Complex',     lat: 39.7,  lng: 125.7,  country: 'North Korea', countryCode: 'KP', status: 'active', notes: 'Nuclear weapons production' },
    ],
    IR: [
      { type: 'missile_site',  name: 'Imam Ali Missile Base',        lat: 34.2,  lng: 46.0,   country: 'Iran', countryCode: 'IR', status: 'active', notes: 'Underground missile city' },
      { type: 'base',          name: 'Fordow Nuclear Facility',      lat: 34.8,  lng: 50.5,   country: 'Iran', countryCode: 'IR', status: 'active', notes: 'Underground enrichment' },
      { type: 'fleet',         name: 'Bandar Abbas Naval Base',      lat: 27.1,  lng: 56.2,   country: 'Iran', countryCode: 'IR', status: 'active', notes: 'IRIN main base Strait of Hormuz' },
    ],
    UA: [
      { type: 'base',          name: 'Kharkiv Front Lines',          lat: 50.0,  lng: 36.3,   country: 'Ukraine', countryCode: 'UA', status: 'active', notes: 'Active conflict zone' },
      { type: 'base',          name: 'Zaporizhzhia Front',           lat: 47.8,  lng: 35.2,   country: 'Ukraine', countryCode: 'UA', status: 'active', notes: 'Active conflict zone' },
      { type: 'airbase',       name: 'Myrhorod Air Base',            lat: 49.9,  lng: 33.6,   country: 'Ukraine', countryCode: 'UA', status: 'active', notes: 'Ukrainian Air Force' },
    ],
  };
  return ASSETS[countryCode] || [];
};


export const NUCLEAR_STATES: Record<string, any> = {
  US: { warheads: 5550, deployed: 1700, status: 'confirmed',     treaty: 'NPT',            delivery: ['ICBM', 'SLBM', 'Aircraft'] },
  RU: { warheads: 6257, deployed: 1600, status: 'confirmed',     treaty: 'NPT',            delivery: ['ICBM', 'SLBM', 'Aircraft', 'Cruise Missile'] },
  CN: { warheads: 500,  deployed: 350,  status: 'confirmed',     treaty: 'NPT',            delivery: ['ICBM', 'SLBM', 'Aircraft'] },
  FR: { warheads: 290,  deployed: 280,  status: 'confirmed',     treaty: 'NPT',            delivery: ['SLBM', 'Aircraft'] },
  GB: { warheads: 225,  deployed: 120,  status: 'confirmed',     treaty: 'NPT',            delivery: ['SLBM'] },
  PK: { warheads: 170,  deployed: 0,    status: 'confirmed',     treaty: 'Non-NPT',        delivery: ['Missile', 'Aircraft'] },
  IN: { warheads: 164,  deployed: 0,    status: 'confirmed',     treaty: 'Non-NPT',        delivery: ['Missile', 'Aircraft'] },
  IL: { warheads: 90,   deployed: 0,    status: 'assumed',       treaty: 'Non-NPT',        delivery: ['Missile', 'Aircraft', 'Submarine'] },
  KP: { warheads: 50,   deployed: 0,    status: 'confirmed',     treaty: 'Withdrew NPT',   delivery: ['ICBM', 'SLBM', 'Aircraft'] },
};


export const ACTIVE_EXERCISES: any[] = [
  { name: 'Operation Atlantic Resolve',  participants: ['US', 'NATO'], region: 'Eastern Europe',  type: 'land',   startDate: '2024-01-01', ongoing: true,  description: 'NATO deterrence mission in Eastern Europe' },
  { name: 'Exercise Talisman Sabre',     participants: ['US', 'AU'],   region: 'Pacific',          type: 'joint',  startDate: '2025-07-01', ongoing: false, description: 'Largest US-Australia bilateral exercise' },
  { name: 'Exercise Cobra Gold',         participants: ['US', 'TH', 'SG', 'JP', 'KR'], region: 'Southeast Asia', type: 'joint', startDate: '2025-02-24', ongoing: false, description: 'Annual multilateral exercise' },
  { name: 'Exercise RIMPAC',             participants: ['US', 'AU', 'JP', 'KR', 'CA', 'GB'], region: 'Pacific', type: 'naval',  startDate: '2026-06-26', ongoing: false, description: 'World largest international maritime exercise' },
  { name: 'Zapad-2025',                  participants: ['RU', 'BY'],   region: 'Eastern Europe',  type: 'land',   startDate: '2025-09-01', ongoing: false, description: 'Russian-Belarusian joint exercise' },
  { name: 'Exercise Iron Spear',         participants: ['US', 'IL'],   region: 'Middle East',     type: 'air',    startDate: '2025-01-01', ongoing: true,  description: 'Air defense cooperation' },
  { name: 'Exercise Pitch Black',        participants: ['AU', 'US', 'FR', 'DE'], region: 'Pacific', type: 'air',   startDate: '2026-07-26', ongoing: false, description: 'Air combat exercise Darwin' },
];


const detectMilitaryCategory = (title: string): MilitaryEvent['category'] => {
  const t = title.toLowerCase();
  if (t.includes('airstrike') || t.includes('air strike') || t.includes('bombing') || t.includes('drone strike')) return 'airstrike';
  if (t.includes('naval') || t.includes('warship') || t.includes('fleet') || t.includes('submarine')) return 'naval';
  if (t.includes('missile') || t.includes('rocket') || t.includes('icbm') || t.includes('ballistic')) return 'missile';
  if (t.includes('cyber') || t.includes('hack') || t.includes('malware') || t.includes('ransomware')) return 'cyber';
  if (t.includes('nuclear') || t.includes('warhead') || t.includes('enrichment')) return 'nuclear';
  if (t.includes('exercise') || t.includes('drill') || t.includes('maneuver') || t.includes('wargame')) return 'exercise';
  if (t.includes('deploy') || t.includes('mobiliz') || t.includes('troops') || t.includes('reinforc')) return 'mobilization';
  if (t.includes('intelligence') || t.includes('spy') || t.includes('surveillance') || t.includes('espionage')) return 'intelligence';
  if (t.includes('ground') || t.includes('battle') || t.includes('offensive') || t.includes('assault')) return 'ground';
  return 'general';
};

const detectSeverity = (title: string): MilitaryEvent['severity'] => {
  const t = title.toLowerCase();
  if (t.includes('nuclear') || t.includes('icbm') || t.includes('mass casualt') || t.includes('war declared')) return 'critical';
  if (t.includes('killed') || t.includes('dead') || t.includes('airstrike') || t.includes('missile attack')) return 'high';
  if (t.includes('troops') || t.includes('deploy') || t.includes('exercise') || t.includes('sanctions')) return 'medium';
  return 'low';
};

const extractMilitaryTags = (title: string): string[] => {
  const tags: string[] = [];
  const keywords = ['NATO', 'IAEA', 'UN', 'CIA', 'FSB', 'Mossad', 'F-35', 'F-22', 'Su-57',
    'carrier', 'submarine', 'missile', 'nuclear', 'drone', 'cyber', 'satellite',
    'hypersonic', 'stealth', 'radar', 'HIMARS', 'Patriot', 'S-400', 'Iron Dome'];
  keywords.forEach(kw => {
    if (title.toLowerCase().includes(kw.toLowerCase())) tags.push(kw);
  });
  return tags.slice(0, 5);
};


export const fetchMilitaryIntel = async (countryCode: string, countryName: string) => {
  const [acled, gdelt, wiki, budget, assets] = await Promise.allSettled([
    fetchACLEDEvents(countryCode),
    fetchGDELTMilitary(countryName),
    fetchWikiMilitary(countryName),
    fetchDefenseBudget(countryCode, countryName),
    fetchMilitaryAssets(countryCode),
  ]);

  return {
    events: [
      ...(acled.status === 'fulfilled' ? acled.value : []),
      ...(gdelt.status === 'fulfilled' ? gdelt.value : []),
    ],
    wiki:      wiki.status    === 'fulfilled' ? wiki.value    : null,
    budget:    budget.status  === 'fulfilled' ? budget.value  : null,
    assets:    assets.status  === 'fulfilled' ? assets.value  : [],
    nuclear:   NUCLEAR_STATES[countryCode] || null,
    exercises: ACTIVE_EXERCISES.filter(e => e.participants.includes(countryCode)),
  };
};
