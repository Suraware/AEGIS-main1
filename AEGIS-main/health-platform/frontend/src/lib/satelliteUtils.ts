import * as satellite from 'satellite.js';
import { proxyFetchText } from './proxyManager';

export interface SatellitePosition {
  name: string;
  category: string;
  lat: number;
  lng: number;
  alt: number;
  tle1: string;
  tle2: string;
}

const RAW_TLE_URLS = [
  { url: 'https://celestrak.org/pub/TLE/catalog.txt',               category: 'general'  },
  { url: 'https://celestrak.com/NORAD/elements/stations.txt',       category: 'station'  },
  { url: 'https://celestrak.com/NORAD/elements/military.txt',       category: 'military' },
  { url: 'https://celestrak.com/NORAD/elements/starlink.txt',       category: 'starlink' },
  { url: 'https://celestrak.com/NORAD/elements/gps-ops.txt',        category: 'gps'      },
  { url: 'https://celestrak.com/NORAD/elements/visual.txt',         category: 'visual'   },
];


const ISS_FALLBACK = {
  name: 'ISS (ZARYA)',
  tle1: '1 25544U 98067A   24001.50000000  .00016717  00000-0  10270-3 0  9009',
  tle2: '2 25544  51.6416   0.0000 0006703   0.0000   0.0000 15.50376769000007',
  category: 'station',
};


let tleCache: { name: string; tle1: string; tle2: string; category: string }[] = [];
let tleLoaded = false;

export const parseTLE = (rawText: string, category: string) => {
  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const result: { name: string; tle1: string; tle2: string; category: string }[] = [];

  for (let i = 0; i < lines.length - 2; i++) {
    const line0 = lines[i];
    const line1 = lines[i + 1];
    const line2 = lines[i + 2];

    
    if (line1.startsWith('1 ') && line2.startsWith('2 ')) {
      const name = line0.replace(/[^a-zA-Z0-9\s\-\(\)\.]/g, '').trim() || `SAT-${i}`;
      if (line1.length >= 69 && line2.length >= 69) {
        result.push({ name, tle1: line1, tle2: line2, category });
        i += 2;
      }
    }
    
    else if (line0.startsWith('1 ') && line1.startsWith('2 ')) {
      if (line0.length >= 69 && line1.length >= 69) {
        const catNum = line0.slice(2, 7).trim();
        result.push({ name: `SAT-${catNum}`, tle1: line0, tle2: line1, category });
        i += 1;
      }
    }
  }

  console.log(`[satelliteUtils] parsed ${result.length} from ${category}`);
  return result;
};

export const computePosition = (
  tle: { name: string; tle1: string; tle2: string; category: string }
): SatellitePosition | null => {
  try {
    const satrec = satellite.twoline2satrec(tle.tle1, tle.tle2);
    if (satrec.error !== 0) return null;

    const now = new Date();
    const pv = satellite.propagate(satrec, now);
    if (!pv || !pv.position || typeof pv.position === 'boolean') return null;

    const pos = pv.position as satellite.EciVec3<number>;
    if (!isFinite(pos.x) || !isFinite(pos.y) || !isFinite(pos.z)) return null;
    if (pos.x === 0 && pos.y === 0 && pos.z === 0) return null;

    const gmst     = satellite.gstime(now);
    const geodetic = satellite.eciToGeodetic(pos, gmst);
    const lat      = satellite.degreesLat(geodetic.latitude);
    const lng      = satellite.degreesLong(geodetic.longitude);
    const alt      = geodetic.height;   

    if (!isFinite(lat) || !isFinite(lng) || !isFinite(alt)) return null;
    if (alt < 100 || alt > 60000) return null;

    return { name: tle.name, category: tle.category, lat, lng, alt, tle1: tle.tle1, tle2: tle.tle2 };
  } catch {
    return null;
  }
};

export const fetchAllTLE = async (): Promise<{ name: string; tle1: string; tle2: string; category: string }[]> => {
  if (tleLoaded && tleCache.length > 0) {
    console.log('[satelliteUtils] returning cached TLE:', tleCache.length);
    return tleCache;
  }

  const results = await Promise.allSettled(
    RAW_TLE_URLS.map(async ({ url, category }) => {
      let text = '';
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        text = await res.text();
      } catch {
        try {
          text = await proxyFetchText(url, 6 * 60 * 60 * 1000);
        } catch {
          console.warn('[satelliteUtils] failed to fetch', url);
          return [] as { name: string; tle1: string; tle2: string; category: string }[];
        }
      }
      return parseTLE(text, category);
    })
  );

  const allTLE = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => (r as PromiseFulfilledResult<{ name: string; tle1: string; tle2: string; category: string }[]>).value);

  
  const hasISS = allTLE.some(t =>
    t.name.toUpperCase().includes('ISS') || t.name.toUpperCase().includes('ZARYA')
  );
  if (!hasISS) allTLE.unshift(ISS_FALLBACK);

  console.log('[satelliteUtils] total TLE loaded:', allTLE.length);
  tleCache = allTLE;
  tleLoaded = true;
  return allTLE;
};

export const computeAllPositions = (
  tleData: { name: string; tle1: string; tle2: string; category: string }[]
): SatellitePosition[] => {
  const priority = ['station', 'military', 'gps'];

  const prioritySats = tleData.filter(t =>
    priority.includes(t.category) ||
    t.name.toUpperCase().includes('ISS') ||
    t.name.toUpperCase().includes('ZARYA') ||
    t.name.toUpperCase().includes('HUBBLE')
  );
  const rest = tleData.filter(t => !prioritySats.includes(t)).slice(0, 800);

  const all = [...prioritySats, ...rest];
  const positions = all.map(computePosition).filter(Boolean) as SatellitePosition[];

  console.log(`[satelliteUtils] computed ${positions.length} valid positions from ${all.length} entries`);
  return positions;
};


export const computeSatellitePosition = computePosition;
