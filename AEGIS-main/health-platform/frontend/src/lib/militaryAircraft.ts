import { getWorkingProxies } from './proxyManager';


const KNOWN_MILITARY_POSITIONS: any[] = [];



const MILITARY_ICAO_RANGES = [
  
  { start: 0xADF000, end: 0xADFFFF, country: 'US', branch: 'USAF' },
  { start: 0xAE0000, end: 0xAEFFFF, country: 'US', branch: 'USN/USMC' },
  { start: 0xA00000, end: 0xA0FFFF, country: 'US', branch: 'US Military' },
  
  { start: 0x43C000, end: 0x43CFFF, country: 'UK', branch: 'RAF' },
  { start: 0x43E000, end: 0x43EFFF, country: 'UK', branch: 'RN/AAC' },
  
  { start: 0x3B7000, end: 0x3B7FFF, country: 'FR', branch: "Armée de l'Air" },
  
  { start: 0x3C0000, end: 0x3C0FFF, country: 'DE', branch: 'Luftwaffe' },
  
  { start: 0x120000, end: 0x12FFFF, country: 'RU', branch: 'VKS' },
  
  { start: 0x780000, end: 0x7FFFFF, country: 'CN', branch: 'PLAAF' },
  
  { start: 0x7C0000, end: 0x7C0FFF, country: 'AU', branch: 'RAAF' },
  
  { start: 0xC00000, end: 0xC00FFF, country: 'CA', branch: 'RCAF' },
  
  { start: 0x738000, end: 0x738FFF, country: 'IL', branch: 'IAF' },
  
  { start: 0x4B9800, end: 0x4B98FF, country: 'NATO', branch: 'NAEW&CF' },
  
  { start: 0x840000, end: 0x87FFFF, country: 'JP', branch: 'JASDF' },
  
  { start: 0x718000, end: 0x71FFFF, country: 'KR', branch: 'ROKAF' },
  
  { start: 0x800000, end: 0x83FFFF, country: 'IN', branch: 'IAF' },
  
  { start: 0x4B0000, end: 0x4B0FFF, country: 'TR', branch: 'TurAF' },
  
  { start: 0x480000, end: 0x480FFF, country: 'NL', branch: 'KLu' },
  
  { start: 0x44A000, end: 0x44AFFF, country: 'BE', branch: 'BAF' },
  
  { start: 0x478000, end: 0x478FFF, country: 'NO', branch: 'RNoAF' },
  
  { start: 0x458000, end: 0x458FFF, country: 'DK', branch: 'RDAF' },
  
  { start: 0x4A0000, end: 0x4A0FFF, country: 'SE', branch: 'SwAF' },
  
  { start: 0x489000, end: 0x489FFF, country: 'PL', branch: 'PAF' },
  
  { start: 0x340000, end: 0x340FFF, country: 'ES', branch: 'EdA' },
  
  { start: 0x300000, end: 0x300FFF, country: 'IT', branch: 'AM' },
  
  { start: 0x468000, end: 0x468FFF, country: 'GR', branch: 'HAF' },
  
  { start: 0xE40000, end: 0xE40FFF, country: 'BR', branch: 'FAB' },
] as const;

const MILITARY_CALLSIGNS = [
  
  'RCH', 'REACH', 'DUKE', 'JAKE', 'FURY', 'VIPER', 'EAGLE', 'HAWK',
  'BONE', 'GHOST', 'KNIFE', 'SABER', 'ATLAS', 'HERKY', 'TOPGUN',
  'STEEL', 'IRON', 'RANGER', 'PATROL', 'SCOUT', 'USAF', 'EVAC',
  'MAGMA', 'VENUS', 'KING', 'QUEEN', 'ACE', 'STORM', 'THUNDER',
  'SHADOW', 'RAVEN', 'SWORD', 'LANCE', 'SPEAR', 'SHIELD', 'ARROW',
  'POLO', 'BISON', 'BEAR', 'WOLF', 'TIGER', 'COBRA', 'VENOM',
  'DEMON', 'BANDIT', 'BOGEY', 'FIGHTER', 'BOMBER', 'RAPTOR',
  'DARKSTAR', 'NIGHTHAWK', 'BLACKBIRD', 'SPECTRE', 'SPOOKY',
  'COMBAT', 'MISSION', 'ARMY', 'NAVY', 'MARINE', 'AIRFORCE',
  
  'NATO', 'AWACS', 'NAEW', 'OTAN',
  
  'RAF', 'ASCOT', 'TARTAN', 'COMET', 'VORTEX', 'ZODIAC',
  
  'RFF', 'RRR', 'RR', 'BARS', 'BERKUT',
  
  'GAF', 'GAFAIR', 'LFW', 'BMF',
  
  'FAF', 'COTAM', 'FNY',
  
  'RAAF', 'AUSSIE',
  
  'RCAF', 'CANFORCE',
  
  'JASDF', 'JMSDF',
] as const;

export const isMilitaryAircraft = (
  icao: string,
  callsign: string,
): { military: boolean; country: string; branch: string } => {
  const cs = (callsign || '').trim().toUpperCase();

  
  for (const mil of MILITARY_CALLSIGNS) {
    if (cs.startsWith(mil)) {
      return { military: true, country: 'Unknown', branch: mil };
    }
  }

  
  try {
    const icaoInt = parseInt(icao, 16);
    if (!isNaN(icaoInt)) {
      for (const range of MILITARY_ICAO_RANGES) {
        if (icaoInt >= range.start && icaoInt <= range.end) {
          return { military: true, country: range.country, branch: range.branch };
        }
      }
    }
  } catch {  }

  return { military: false, country: '', branch: '' };
};


const fetchIntelSky = async (): Promise<any> => {
  const urls = [
    'https://www.intelsky.org/stats/map.php',
    'https://www.intelsky.org/api/data',
    'https://www.intelsky.org/api/aircraft',
    'https://www.intelsky.org/data/live',
  ];

  const proxies = getWorkingProxies();

  for (const url of urls) {
    
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: {
          'Accept': 'application/json, text/html',
          'User-Agent': 'Mozilla/5.0',
        },
      });
      if (res.ok) {
        const text = await res.text();
        console.log('IntelSky raw sample:', text.slice(0, 500));

        try {
          const data = JSON.parse(text);
          console.log('IntelSky JSON keys:', Object.keys(data));
          return data;
        } catch {
          const jsonMatch = text.match(/var\s+\w+\s*=\s*(\[.*?\]|\{.*?\})/s);
          if (jsonMatch) {
            try {
              const data = JSON.parse(jsonMatch[1]);
              console.log('IntelSky embedded JSON found:', Array.isArray(data) ? data.length : 'object');
              return data;
            } catch {  }
          }
        }
      }
    } catch {  }

    
    for (const proxy of proxies.slice(0, 5)) {
      try {
        const proxyUrl = `${proxy.url}${encodeURIComponent(url)}`;
        const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            if (data && (Array.isArray(data) || data.aircraft || data.planes || data.data)) {
              console.log(`IntelSky via ${proxy.name} success`);
              return data;
            }
          } catch {
            const jsonMatch = text.match(/var\s+\w+\s*=\s*(\[.*?\]|\{.*?\})/s);
            if (jsonMatch) {
              try { return JSON.parse(jsonMatch[1]); } catch {  }
            }
          }
        }
      } catch { continue; }
    }
  }
  return null;
};


const fetchADSBExchangeMilitary = async (): Promise<any[]> => {
  const urls = [
    'https://globe.adsbexchange.com/globeRates.json',
    'https://api.adsbexchange.com/api/aircraft/v2/lat/0.000/lon/0.000/dist/99999/',
    'https://globe.adsbexchange.com/re-api/?all',
    'https://api.adsbexchange.com/api/aircraft/v2/filter/military/',
    'https://global.adsbexchange.com/VirtualRadar/AircraftList.json?fMilQ=1',
  ];

  const proxies = getWorkingProxies();

  for (const url of urls) {
    
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const aircraft = data.aircraft || data.ac || data.planes || data;
        if (Array.isArray(aircraft) && aircraft.length > 0) {
          console.log('ADSBExchange military direct:', aircraft.length);
          return aircraft;
        }
      }
    } catch {  }

    for (const proxy of proxies.slice(0, 4)) {
      try {
        const res = await fetch(`${proxy.url}${encodeURIComponent(url)}`, {
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          const data = await res.json();
          const aircraft = data.aircraft || data.ac || data.planes || data;
          if (Array.isArray(aircraft) && aircraft.length > 0) {
            console.log(`ADSBExchange via ${proxy.name}:`, aircraft.length);
            return aircraft;
          }
        }
      } catch { continue; }
    }
  }
  return [];
};


const parseFR24Data = (data: any): any[] => {
  if (!data || typeof data !== 'object') return [];

  return Object.entries(data)
    .filter(([key]) => key !== 'full_count' && key !== 'version' && key !== 'stats')
    .map(([icao, values]: [string, any]) => {
      if (!Array.isArray(values) || values.length < 9) return null;
      const [lat, lng, heading, altitude, speed, , , callsign, , , , , , , model] = values;
      if (!lat || !lng) return null;
      const milCheck = isMilitaryAircraft(icao, callsign || '');
      return {
        icao,
        callsign: callsign || '',
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        heading: parseFloat(heading || 0),
        baroAltitude: parseFloat(altitude || 0),
        velocity: parseFloat(speed || 0) * 0.514444,
        military: milCheck.military,
        country: milCheck.country,
        branch: milCheck.branch,
        model: model || '',
        onGround: false,
        originCountry: milCheck.country,
      };
    })
    .filter(Boolean);
};

const fetchFR24Military = async (): Promise<any[]> => {
  const fr24Urls = [
    'https://data-live.flightradar24.com/zones/fcgi/feed.js?faa=1&mlat=1&flarm=1&adsb=1&gnd=0&air=1&vehicles=0&estimated=0&maxage=14400&gliders=0&stats=0&filter=military',
    'https://data-cloud.flightradar24.com/zones/fcgi/feed.js?bounds=90,-90,-180,180&faa=1&mlat=1&flarm=1&adsb=1&gnd=0&air=1&estimated=0&maxage=14400&filter=military',
  ];

  for (const url of fr24Urls) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: {
          'Accept': 'application/json',
          'Origin': 'https://www.flightradar24.com',
          'Referer': 'https://www.flightradar24.com/',
        },
      });
      if (res.ok) {
        const data = await res.json();
        return parseFR24Data(data);
      }
    } catch {  }

    for (const proxy of getWorkingProxies().slice(0, 3)) {
      try {
        const res = await fetch(`${proxy.url}${encodeURIComponent(url)}`, {
          signal: AbortSignal.timeout(10000),
        });
        if (res.ok) {
          const data = await res.json();
          const aircraft = parseFR24Data(data);
          if (aircraft.length > 0) return aircraft;
        }
      } catch { continue; }
    }
  }
  return [];
};


const fetchOpenSkyMilitary = async (): Promise<any[]> => {
  try {
    const res = await fetch(
      'https://opensky-network.org/api/states/all',
      { signal: AbortSignal.timeout(10000) },
    );

    if (!res.ok) throw new Error(`OpenSky HTTP ${res.status}`);

    const data = await res.json();
    if (!data?.states) return [];

    const military = (data.states as any[][])
      .filter((s) => {
        if (!s[0] || s[5] == null || s[6] == null) return false;
        return isMilitaryAircraft(s[0], s[1] || '').military;
      })
      .map((s) => {
        const milCheck = isMilitaryAircraft(s[0], s[1] || '');
        return {
          icao: s[0],
          callsign: (s[1] || '').trim(),
          lat: parseFloat(s[6]),
          lng: parseFloat(s[5]),
          baroAltitude: s[7] ? parseFloat(s[7]) : 0,
          velocity: s[9] ? parseFloat(s[9]) : 0,
          heading: s[10] ? parseFloat(s[10]) : 0,
          onGround: s[8] === true,
          military: true,
          country: milCheck.country,
          branch: milCheck.branch,
          originCountry: s[2] || '',
        };
      })
      .filter((a) => !a.onGround && a.lat && a.lng);

    console.log('OpenSky military aircraft found:', military.length);
    return military;
  } catch (err) {
    console.warn('OpenSky military fetch failed:', err);
    return [];
  }
};


const fetchAirTrafficMilitary = async (): Promise<any[]> => {
  const sources = [
    { url: 'https://api.theairtraffic.com/api/v1/aircraft?filter=military',    name: 'TheAirTraffic' },
    { url: 'https://planefinder.net/data/aircraft',                             name: 'PlaneFinder' },
    { url: 'https://www.radarbox.com/api/flights?filter=military',              name: 'RadarBox' },
    { url: 'https://flightaware.com/ajax/vicinity_aircraft.rvt?&type=militar',  name: 'FlightAware' },
    { url: 'https://www.military-airspace.com/api/live',                        name: 'MilAirspace' },
    { url: 'https://adsb.fi/api/v1/aircraft?filter=military',                   name: 'ADSB.fi' },
    { url: 'https://api.adsb.one/v2/point/0/0/99999?filter=military',           name: 'ADSB.one' },
    { url: 'https://opendata.adsb.fi/api/v2/aircraft?filter=military',          name: 'OpenData ADSB.fi' },
  ];

  const proxies = getWorkingProxies();
  const results: any[] = [];

  for (const source of sources) {
    try {
      let data: any = null;

      
      try {
        const res = await fetch(source.url, { signal: AbortSignal.timeout(6000) });
        if (res.ok) data = await res.json();
      } catch {  }

      
      if (!data) {
        for (const proxy of proxies.slice(0, 3)) {
          try {
            const res = await fetch(`${proxy.url}${encodeURIComponent(source.url)}`, {
              signal: AbortSignal.timeout(8000),
            });
            if (res.ok) {
              data = await res.json();
              break;
            }
          } catch { continue; }
        }
      }

      if (data) {
        const aircraft = data.aircraft || data.ac || data.planes || data.data || data;
        if (Array.isArray(aircraft)) {
          const mapped = aircraft.slice(0, 200).map((a: any) => ({
            icao:         a.icao || a.hex || a.id || '',
            callsign:     a.callsign || a.flight || a.cs || '',
            lat:          parseFloat(a.lat || a.latitude || 0),
            lng:          parseFloat(a.lon || a.lng || a.longitude || 0),
            baroAltitude: parseFloat(a.alt || a.altitude || a.baro_altitude || 0),
            velocity:     parseFloat(a.speed || a.velocity || a.gs || 0),
            heading:      parseFloat(a.track || a.heading || a.dir || 0),
            military:     true,
            onGround:     false,
            source:       source.name,
          })).filter((a: any) => a.lat && a.lng && a.lat !== 0);

          if (mapped.length > 0) {
            console.log(`${source.name}: ${mapped.length} military aircraft`);
            results.push(...mapped);
          }
        }
      }
    } catch (err) {
      console.warn(`${source.name} failed:`, err);
    }
  }

  return results;
};


export const fetchAllMilitaryAircraft = async (): Promise<any[]> => {
  console.log('Fetching military aircraft from all sources...');

  const [openSkyMil, adsbExMil, fr24Mil, airTrafficMil, intelSkyData] = await Promise.allSettled([
    fetchOpenSkyMilitary(),
    fetchADSBExchangeMilitary(),
    fetchFR24Military(),
    fetchAirTrafficMilitary(),
    fetchIntelSky(),
  ]);

  const allAircraft = [
    ...(openSkyMil.status    === 'fulfilled' ? openSkyMil.value    : []),
    ...(adsbExMil.status     === 'fulfilled' ? adsbExMil.value     : []),
    ...(fr24Mil.status       === 'fulfilled' ? fr24Mil.value       : []),
    ...(airTrafficMil.status === 'fulfilled' ? airTrafficMil.value : []),
    ...(intelSkyData.status  === 'fulfilled' && Array.isArray(intelSkyData.value)
      ? intelSkyData.value : []),
  ];

  
  const seen = new Set<string>();
  const deduplicated = allAircraft.filter(a => {
    if (!a.icao || seen.has(a.icao)) return false;
    seen.add(a.icao);
    return true;
  });

  const combined = [...deduplicated, ...KNOWN_MILITARY_POSITIONS];

  console.log(`Total military aircraft combined: ${combined.length} (deduped from ${allAircraft.length})`);
  return combined;
};
