




import { useGlobeStore } from '../stores/useGlobeStore';
import { fetchWildfireData, fetchStormData } from './weatherEvents';
import { proxyFetch } from './proxyManager';
import { scheduleRender } from '../globe/globeRenderer';
import {
  FALLBACK_AIRCRAFT,
  FALLBACK_NAVAL,
  FALLBACK_EARTHQUAKES,
  FALLBACK_CONFLICTS,
  FALLBACK_WILDFIRES,
} from '../data/fallbacks';
import { COUNTRY_COORDINATES } from '../data/countryCoordinates';


const CENTROID_MAP: Record<string, { lat: number; lng: number }> = Object.fromEntries(
  COUNTRY_COORDINATES.map(c => [c.name.toLowerCase(), { lat: c.latitude, lng: c.longitude }])
);

function computeSeverity(headline: string): 'critical' | 'high' | 'moderate' {
  const h = headline.toLowerCase();
  if (/airstrike|bombing|missile|explosion|blast|strike/.test(h)) return 'critical';
  if (/conflict|military|casualties|killed|violence|offensive|troops/.test(h)) return 'high';
  return 'moderate';
}


const HIGH_ACTIVITY = [
  { lat: 35.86, lng: 104.19 }, { lat: 61.52, lng: 105.31 },
  { lat: 40.33, lng: 127.51 }, { lat: 32.42, lng:  53.68 },
  { lat: 37.09, lng: -95.71 }, { lat: 48.37, lng:  31.16 },
  { lat: -14.23, lng: -51.92 }, { lat: 20.59, lng:  78.96 },
];
const ALL_CENTROIDS = COUNTRY_COORDINATES.map(c => ({ lat: c.latitude, lng: c.longitude }));

function generateCyberArcs(): any[] {
  const count = 8 + Math.floor(Math.random() * 8);
  return Array.from({ length: count }, () => {
    const o = HIGH_ACTIVITY[Math.floor(Math.random() * HIGH_ACTIVITY.length)];
    const t = ALL_CENTROIDS[Math.floor(Math.random() * ALL_CENTROIDS.length)];
    return {
      _type: 'cyber',
      startLat: o.lat + (Math.random() - 0.5) * 4,
      startLng: o.lng + (Math.random() - 0.5) * 4,
      endLat: t.lat,
      endLng: t.lng,
      color: ['rgba(56,189,248,0.8)', 'rgba(56,189,248,0)'],
      stroke: 0.4,
      altitude: 0.25,
    };
  });
}


const KNOWN_MILITARY_POSITIONS: any[] = [
  { callsign: 'USAF-BASE', lat: 38.81, lng: -104.70, originCountry: 'United States', military: true, baroAltitude: 0, velocity: 0, heading: 0, icao: 'usaf01', _type: 'aircraft' },
  { callsign: 'USAF-BASE', lat: 29.97, lng:  -95.34, originCountry: 'United States', military: true, baroAltitude: 0, velocity: 0, heading: 0, icao: 'usaf02', _type: 'aircraft' },
  { callsign: 'RAF-BASE',  lat: 52.35, lng:   -1.58, originCountry: 'United Kingdom', military: true, baroAltitude: 0, velocity: 0, heading: 0, icao: 'raf01',  _type: 'aircraft' },
  { callsign: 'RAF-BASE',  lat: 51.55, lng:   -1.78, originCountry: 'United Kingdom', military: true, baroAltitude: 0, velocity: 0, heading: 0, icao: 'raf02',  _type: 'aircraft' },
  { callsign: 'USAF-EU',   lat: 49.63, lng:    7.60, originCountry: 'Germany',        military: true, baroAltitude: 0, velocity: 0, heading: 0, icao: 'usaf03', _type: 'aircraft' },
  { callsign: 'JSDF-BASE', lat: 35.76, lng:  140.39, originCountry: 'Japan',          military: true, baroAltitude: 0, velocity: 0, heading: 0, icao: 'jsdf01', _type: 'aircraft' },
  { callsign: 'RuAF-BASE', lat: 45.85, lng:   41.67, originCountry: 'Russia',         military: true, baroAltitude: 0, velocity: 0, heading: 0, icao: 'ruaf01', _type: 'aircraft' },
  { callsign: 'PLAAF-BASE', lat: 30.79, lng: 120.98, originCountry: 'China',          military: true, baroAltitude: 0, velocity: 0, heading: 0, icao: 'plaaf01', _type: 'aircraft' },
];


const dataState = {
  aircraft:    [] as any[],
  naval:       [] as any[],
  earthquakes: [] as any[],
  conflicts:   [] as any[],
  cyberArcs:   [] as any[],
  wildfires:   [] as any[],
  storms:      [] as any[],
};


const intervals: ReturnType<typeof setInterval>[] = [];


function commit(): void {
  const store = useGlobeStore.getState();
  const layers = store.globeLayers;

  store.setGlobeCounts({
    aircraftCount: dataState.aircraft.length,
    militaryAircraftCount: dataState.aircraft.filter((a: any) => a.military).length,
    conflictEventCount: dataState.conflicts.length,
    quakesTodayCount: dataState.earthquakes.length,
    cyberArcCount: dataState.cyberArcs.length,
  });

  scheduleRender({
    aircraft: [...dataState.aircraft, ...KNOWN_MILITARY_POSITIONS],
    navalVessels: dataState.naval,
    earthquakes: dataState.earthquakes,
    conflictEvents: dataState.conflicts,
    cyberArcs: dataState.cyberArcs,
    wildfires: dataState.wildfires,
    storms: dataState.storms,
    layers,
  });
}


const MILITARY_CALLSIGN_PATTERNS = [
  /^DUKE/i, /^REACH/i, /^JAKE/i, /^FURY/i, /^VIPER/i,
  /^EAGLE/i, /^HAWK/i, /^BONE/i, /^GHOST/i, /^KNIFE/i,
  /^SABER/i, /^ATLAS/i, /^HERKY/i, /^MARCO/i, /^TOPGUN/i,
  /^STEEL/i, /^IRON/i, /^RANGER/i, /^PATROL/i, /^SCOUT/i,
  /^USAF/i, /^USN[0-9]/i, /^USMC/i, /^RCH/i, /^EVAC/i,
  /^MAGMA/i, /^VENUS/i, /^KING/i, /^QUEEN/i, /^ACE/i,
  /^STING/i, /^STORM/i, /^THUNDER/i, /^SHADOW/i, /^RAVEN/i,
  /^SWORD/i, /^LANCE/i, /^SPEAR/i, /^SHIELD/i, /^ARROW/i,
  /^NATO/i, /^AWACS/i, /^NAEW/i,
  /^RFF[0-9]/i, /^RRR/i,
  /^RAF/i, /^RRF/i, /^TARTAN/i, /^ASCOT/i,
  /^[A-Z]{2}[0-9]{3}[A-Z]$/,
];

const MILITARY_ICAO_RANGES = [
  { start: 0xADF000, end: 0xADFFFF }, { start: 0xAE0000, end: 0xAEFFFF },
  { start: 0xA00000, end: 0xA0FFFF }, { start: 0x43C000, end: 0x43CFFF },
  { start: 0x43E000, end: 0x43EFFF }, { start: 0x3B7000, end: 0x3B7FFF },
  { start: 0x3C0000, end: 0x3C0FFF }, { start: 0x120000, end: 0x12FFFF },
  { start: 0x780000, end: 0x7FFFFF }, { start: 0x7C0000, end: 0x7C0FFF },
  { start: 0xC00000, end: 0xC00FFF }, { start: 0x738000, end: 0x738FFF },
  { start: 0x4B9800, end: 0x4B98FF },
];

function isMilitary(icao: string, callsign: string, altitude: number, velocity: number): boolean {
  const cs = (callsign || '').trim().toUpperCase();
  if (MILITARY_CALLSIGN_PATTERNS.some(p => p.test(cs))) return true;
  try {
    const n = parseInt(icao, 16);
    if (!isNaN(n) && MILITARY_ICAO_RANGES.some(r => n >= r.start && n <= r.end)) return true;
  } catch {}
  if (altitude > 12000 && velocity > 250) return true;
  return false;
}


async function loadAircraft(): Promise<void> {
  const { globeLayers } = useGlobeStore.getState();
  if (!globeLayers.aircraft && !globeLayers.militaryAircraft) return;
  const OPENSKY_URL = 'https://opensky-network.org/api/states/all';
  try {
    let data: any = null;

    
    try {
      const res = await fetch(OPENSKY_URL, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) data = await res.json();
    } catch {  }

    
    if (!data?.states?.length) {
      try {
        const res = await proxyFetch(OPENSKY_URL, { headers: { Accept: 'application/json' } });
        data = await res.json();
      } catch {  }
    }

    if (data?.states?.length) {
      const aircraft = (data.states as any[][])
        .filter(s => s[5] != null && s[6] != null && !isNaN(s[5]) && !isNaN(s[6]) && s[8] !== true)
        .map(s => ({
          _type: 'aircraft',
          icao: s[0] || '',
          callsign: (s[1] || '').trim(),
          originCountry: s[2] || '',
          lng: parseFloat(s[5]),
          lat: parseFloat(s[6]),
          baroAltitude: s[7] ? parseFloat(s[7]) : 0,
          velocity:     s[9] ? parseFloat(s[9]) : 0,
          heading:      s[10] ? parseFloat(s[10]) : 0,
          onGround: false,
          military: isMilitary(
            s[0] || '', s[1] || '',
            s[7] ? parseFloat(s[7]) : 0,
            s[9] ? parseFloat(s[9]) : 0,
          ),
        }));
      dataState.aircraft = aircraft;
      useGlobeStore.getState().clearFailedSource?.('opensky');
    } else {
      throw new Error('No aircraft data returned');
    }
  } catch {
    if (dataState.aircraft.length === 0) {
      dataState.aircraft = FALLBACK_AIRCRAFT;
    }
    useGlobeStore.getState().addFailedSource?.('opensky');
  }
  commit();
}


async function loadNaval(): Promise<void> {
  const VESSEL_SOURCES = [
    `https://corsproxy.io/?${encodeURIComponent('https://data.aishub.net/ws.php?username=WS123456&format=1&output=json&compress=0&latmin=-90&latmax=90&lonmin=-180&lonmax=180')}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent('https://data.aishub.net/ws.php?username=WS123456&format=1&output=json&compress=0&latmin=-90&latmax=90&lonmin=-180&lonmax=180')}`,
  ];

  const NAVY_MMSI_RANGES = [
    { start: 338000000, end: 338999999 },
    { start: 232000000, end: 232999999 },
    { start: 273000000, end: 273999999 },
    { start: 412000000, end: 412999999 },
    { start: 226000000, end: 226999999 },
    { start: 211000000, end: 211999999 },
  ];

  const isNavyMMSI = (mmsi: string): boolean => {
    const n = parseInt(mmsi, 10);
    return !isNaN(n) && NAVY_MMSI_RANGES.some(r => n >= r.start && n <= r.end);
  };

  const vesselType = (shiptype: number): string => {
    if (shiptype >= 80 && shiptype <= 89) return 'tanker';
    if (shiptype >= 70 && shiptype <= 79) return 'cargo';
    if (shiptype >= 60 && shiptype <= 69) return 'passenger';
    if (shiptype >= 35 && shiptype <= 39) return 'destroyer';
    return 'other';
  };

  try {
    for (const url of VESSEL_SOURCES) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) continue;
        const raw = await res.json();
        const flat = Array.isArray(raw) ? raw.flat() : [];
        const vessels = flat
          .filter((v: any) => v?.MMSI && v.LATITUDE != null && v.LONGITUDE != null
            && !isNaN(v.LATITUDE) && !isNaN(v.LONGITUDE))
          .map((v: any) => {
            const mmsi = String(v.MMSI);
            return {
              _type: 'vessel',
              mmsi,
              name: v.NAME || v.SHIPNAME || '',
              lat:  parseFloat(v.LATITUDE),
              lng:  parseFloat(v.LONGITUDE),
              speed:      v.SPEED  != null ? parseFloat(v.SPEED)  : 0,
              course:     v.COURSE != null ? parseFloat(v.COURSE) : 0,
              vesselType: vesselType(parseInt(v.SHIPTYPE || '0', 10)),
              isNaval:    isNavyMMSI(mmsi),
              flag:       v.FLAG || '',
            };
          });
        if (vessels.length > 0) {
          dataState.naval = vessels;
          commit();
          return;
        }
      } catch { continue; }
    }
    throw new Error('All vessel sources failed');
  } catch {
    if (dataState.naval.length === 0) {
      dataState.naval = FALLBACK_NAVAL;
    }
    commit();
  }
}


async function loadConflicts(): Promise<void> {
  const GDELT_URL = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent('conflict attack military war airstrike explosion bomb')}&mode=artlist&format=json&maxrecords=50&timespan=24h&sort=DateDesc`;

  const GEO: Record<string, [number, number]> = {
    'Ukraine': [48.37, 31.16], 'Russia': [61.52, 105.31], 'China': [35.86, 104.19],
    'Israel': [31.04, 34.85], 'Gaza': [31.35, 34.30], 'Syria': [34.80, 38.99],
    'Yemen': [15.55, 48.51], 'Sudan': [12.86, 30.21], 'Myanmar': [21.91, 95.95],
    'Somalia': [5.15, 46.19], 'Afghanistan': [33.93, 67.70], 'Iraq': [33.22, 43.67],
    'Pakistan': [30.37, 69.34], 'Iran': [32.42, 53.68], 'Libya': [26.33, 17.22],
    'Mali': [17.57, -3.99], 'Nigeria': [9.08, 8.67], 'Haiti': [18.97, -72.28],
    'South Sudan': [6.87, 31.30], 'Ethiopia': [9.14, 40.48], 'Lebanon': [33.85, 35.86],
    'Democratic Republic of the Congo': [-4.03, 21.75], 'Niger': [17.60, 8.08],
    'Chad': [15.45, 18.73], 'Burkina Faso': [12.36, -1.56], 'Venezuela': [6.42, -66.58],
    'Colombia': [4.57, -74.29], 'Mexico': [23.63, -102.55], 'Bangladesh': [23.68, 90.35],
    'United States': [37.09, -95.71], 'Germany': [51.16, 10.45],
    'United Kingdom': [55.37, -3.43], 'France': [46.22, 2.21], 'Turkey': [38.96, 35.24],
    'Saudi Arabia': [23.88, 45.07], 'Egypt': [26.82, 30.80], 'Algeria': [28.03, 1.65],
    'Morocco': [31.79, -7.09], 'Tunisia': [33.88, 9.53], 'Central African Republic': [6.61, 20.93],
    'Mozambique': [-18.66, 35.52], 'Cameroon': [3.86, 11.51], 'Kenya': [-0.02, 37.90],
  };

  const lookupCoords = (country: string): [number, number] | null => {
    const direct = GEO[country];
    if (direct) return direct;
    const lower = country.toLowerCase();
    for (const [k, v] of Object.entries(GEO)) {
      if (k.toLowerCase() === lower) return v;
    }
    const ctr = CENTROID_MAP[lower];
    return ctr ? [ctr.lat, ctr.lng] : null;
  };

  try {
    let articles: any[] = [];

    
    try {
      const res = await fetch(GDELT_URL, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        const json = await res.json();
        articles = json.articles ?? [];
      }
    } catch {  }

    
    if (articles.length === 0) {
      try {
        const res = await proxyFetch(GDELT_URL, { headers: { Accept: 'application/json' } });
        const json = await res.json();
        articles = json.articles ?? [];
        useGlobeStore.getState().clearFailedSource?.('gdelt');
      } catch {
        useGlobeStore.getState().addFailedSource?.('gdelt');
      }
    } else {
      useGlobeStore.getState().clearFailedSource?.('gdelt');
    }

    const events: any[] = [];
    for (const art of articles) {
      const country = (art.sourcecountry ?? '') as string;
      if (!country) continue;
      const coords = lookupCoords(country);
      if (!coords) continue;
      events.push({
        _type: 'conflict',
        lat: coords[0] + (Math.random() - 0.5) * 4,
        lng: coords[1] + (Math.random() - 0.5) * 4,
        headline: (art.title ?? 'Conflict Event') as string,
        url: (art.url ?? '#') as string,
        country,
        severity: computeSeverity(art.title ?? ''),
      });
    }

    dataState.conflicts = events.length > 0 ? events : FALLBACK_CONFLICTS;
  } catch {
    if (dataState.conflicts.length === 0) {
      dataState.conflicts = FALLBACK_CONFLICTS;
    }
  }
  commit();
}


async function loadEarthquakes(): Promise<void> {
  try {
    const res = await fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
      { signal: AbortSignal.timeout(10000) },
    );
    const json = await res.json() as { features?: any[] };
    const quakes: any[] = [];
    for (const f of json.features ?? []) {
      const [lng, lat] = f.geometry.coordinates as [number, number];
      const mag = (f.properties.mag ?? 0) as number;
      if (lat == null || lng == null || mag <= 0) continue;
      quakes.push({
        _type: 'earthquake',
        id:        f.id,
        lat, lng,
        magnitude: mag,
        place:     (f.properties.place ?? 'Unknown') as string,
        depth:     (f.geometry.coordinates[2] ?? 0) as number,
        time:      (f.properties.time ?? Date.now()) as number,
      });
    }
    dataState.earthquakes = quakes.length > 0 ? quakes : FALLBACK_EARTHQUAKES;
  } catch {
    if (dataState.earthquakes.length === 0) {
      dataState.earthquakes = FALLBACK_EARTHQUAKES;
    }
  }
  commit();
}


async function loadWildfires(): Promise<void> {
  try {
    const fires = await fetchWildfireData();
    if (fires.length > 0) {
      dataState.wildfires = fires;
      useGlobeStore.getState().setWildfireData(fires);
      useGlobeStore.getState().clearFailedSource?.('nasa-firms');
    } else {
      throw new Error('Empty wildfire response');
    }
  } catch {
    if (dataState.wildfires.length === 0) {
      dataState.wildfires = FALLBACK_WILDFIRES;
    }
    useGlobeStore.getState().addFailedSource?.('nasa-firms');
  }
  commit();
}


async function loadStorms(): Promise<void> {
  try {
    const storms = await fetchStormData();
    if (storms.length > 0) {
      dataState.storms = storms;
      useGlobeStore.getState().setStormData(storms);
    }
  } catch {
    
    dataState.storms = [];
  }
  commit();
}


function generateAndSetCyberArcs(): void {
  if (!useGlobeStore.getState().globeLayers.cyberAttacks) return;
  dataState.cyberArcs = generateCyberArcs();
  commit();
}


let managerRunning = false;

export const initDataManager = (): void => {
  if (managerRunning) {
    console.warn('[dataManager] Already running — skipping reinit');
    return;
  }
  managerRunning = true;
  console.log('[dataManager] Starting — loading all layers...');

  
  dataState.aircraft    = FALLBACK_AIRCRAFT;
  dataState.naval       = FALLBACK_NAVAL;
  dataState.earthquakes = FALLBACK_EARTHQUAKES;
  dataState.conflicts   = FALLBACK_CONFLICTS;
  dataState.wildfires   = FALLBACK_WILDFIRES;
  dataState.cyberArcs   = generateCyberArcs();
  commit();

  
  Promise.allSettled([
    loadAircraft(),
    loadEarthquakes(),
    loadConflicts(),
    loadNaval(),
    loadWildfires(),
    loadStorms(),
  ]).then(() => console.log('[dataManager] Initial live load complete'));

  
  intervals.push(setInterval(loadAircraft,                  10_000));
  intervals.push(setInterval(loadEarthquakes,               60_000));
  intervals.push(setInterval(loadConflicts,          5 * 60_000));
  intervals.push(setInterval(loadNaval,              5 * 60_000));
  intervals.push(setInterval(loadWildfires,         30 * 60_000));
  intervals.push(setInterval(loadStorms,            15 * 60_000));
  intervals.push(setInterval(generateAndSetCyberArcs, 30_000));
};

export const destroyDataManager = (): void => {
  intervals.forEach(id => clearInterval(id));
  intervals.length = 0;
  managerRunning = false;
  console.log('[dataManager] Stopped');
};
