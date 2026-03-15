import { getWorkingProxies } from './proxyManager';



const NAVAL_VESSEL_TYPES = [35, 36, 37];

const NAVAL_MMSI_PATTERNS = [
  /^111/, 
  /^970/, 
  /^00/,  
];

const NAVAL_KEYWORDS = [
  
  'USS', 'HMS', 'HNLMS', 'HMAS', 'INS', 'FS', 'NNS', 'ROKS',
  'JS ', 'RFS', 'CNS', 'BNS', 'MNS', 'TCG', 'SPS', 'ITS',
  
  'FRIGATE', 'DESTROYER', 'CORVETTE', 'SUBMARINE', 'CARRIER',
  'CRUISER', 'MINESWEEPER', 'PATROL BOAT', 'COAST GUARD',
  'NAVY', 'NAVAL', 'WARSHIP', 'AMPHIBIOUS',
] as const;

const classifyAndFilterVessels = (vessels: any[]) => {
  return vessels.map(v => {
    const nameUpper = (v.name || '').toUpperCase();
    const typeInt = parseInt(v.vesselType);

    const isNaval =
      NAVAL_VESSEL_TYPES.includes(typeInt) ||
      NAVAL_MMSI_PATTERNS.some(p => p.test(String(v.mmsi))) ||
      NAVAL_KEYWORDS.some(kw => nameUpper.includes(kw));

    const isTanker    = typeInt >= 80 && typeInt <= 89;
    const isCargo     = typeInt >= 70 && typeInt <= 79;
    const isPassenger = typeInt >= 60 && typeInt <= 69;

    return {
      ...v,
      isNaval,
      vesselCategory: isNaval     ? 'naval'
        : isTanker                ? 'tanker'
        : isCargo                 ? 'cargo'
        : isPassenger             ? 'passenger'
        : 'other',
    };
  });
};


export const fetchNavalFromAllSources = async (): Promise<any[]> => {
  console.log('Fetching naval vessel data from all sources...');

  const proxies = getWorkingProxies();

  const sources = [
    
    { url: 'https://data.aishub.net/ws.php?username=WS123456&format=1&output=json&compress=0', name: 'AISHub' },
    
    { url: 'https://www.marinetraffic.com/getData/get_data_json_3/z:1/X:0/Y:0/station:0', name: 'MarineTraffic' },
    
    { url: 'https://www.vesselfinder.com/api/pro/live', name: 'VesselFinder' },
    
    { url: 'https://cruisin.me/api/data', name: 'Cruisin' },
    
    { url: 'https://www.fleetmon.com/api/public/vessels/', name: 'FleetMon' },
    
    { url: 'https://www.vtexplorer.com/ws/receive.php?lat1=-90&lat2=90&lon1=-180&lon2=180&show_track=0', name: 'VTExplorer' },
    
    { url: 'https://www.shiptraffic.net/api/v1/vessels/live', name: 'ShipTraffic' },
    
    { url: 'https://www.myshiptracking.com/requests/vesselsonmap.php?type=json', name: 'MyShipTracking' },
    
    { url: 'https://www.openseamap.org/api/getData', name: 'OpenSeaMap' },
    
    { url: 'https://gateway.api.globalfishingwatch.org/v3/vessels?datasets[0]=public-global-fishing-vessels:latest&limit=200', name: 'GlobalFishingWatch' },
  ];

  const allVessels: any[] = [];

  await Promise.allSettled(sources.map(async (source) => {
    let data: any = null;

    
    try {
      const res = await fetch(source.url, {
        signal: AbortSignal.timeout(7000),
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) data = await res.json();
    } catch {  }

    
    if (!data) {
      for (const proxy of proxies.slice(0, 3)) {
        try {
          const res = await fetch(`${proxy.url}${encodeURIComponent(source.url)}`, {
            signal: AbortSignal.timeout(9000),
          });
          if (res.ok) {
            data = await res.json();
            break;
          }
        } catch { continue; }
      }
    }

    if (!data) return;

    const vessels = data.vessels || data.data || data.ships || data.records || data;
    if (!Array.isArray(vessels)) return;

    const mapped = vessels.slice(0, 300).map((v: any) => ({
      mmsi:        String(v.mmsi || v.MMSI || v.id || Math.random()),
      name:        v.name || v.NAME || v.shipname || v.vessel_name || 'Unknown',
      lat:         parseFloat(v.lat || v.LAT || v.latitude || v.y || 0),
      lng:         parseFloat(v.lon || v.LON || v.lng || v.longitude || v.x || 0),
      speed:       parseFloat(v.speed || v.SPEED || v.sog || 0),
      course:      parseFloat(v.course || v.COURSE || v.cog || 0),
      heading:     parseFloat(v.heading || v.HEADING || v.hdg || 0),
      vesselType:  v.type || v.TYPE || v.vessel_type || v.shiptype || 0,
      flag:        v.flag || v.FLAG || v.country || '',
      length:      parseFloat(v.length || v.LENGTH || 0),
      destination: v.destination || v.DESTINATION || '',
      source:      source.name,
    })).filter((v: any) => v.lat && v.lng && v.lat !== 0 && Math.abs(v.lat) <= 90);

    if (mapped.length > 0) {
      console.log(`${source.name}: ${mapped.length} vessels`);
      allVessels.push(...mapped);
    }
  }));

  
  const seen = new Set<string>();
  const unique = allVessels.filter(v => {
    if (seen.has(v.mmsi)) return false;
    seen.add(v.mmsi);
    return true;
  });

  console.log('Total unique vessels:', unique.length);
  return classifyAndFilterVessels(unique);
};


export const KNOWN_WARSHIPS = [
  
  { mmsi: 'USS-CVN68',  name: 'USS Nimitz (CVN-68)',                   lat: 21.3,  lng: -157.9, flag: 'US', isNaval: true, vesselCategory: 'naval', speed: 15, course: 270 },
  { mmsi: 'USS-CVN69',  name: 'USS Dwight D. Eisenhower (CVN-69)',     lat: 36.8,  lng:  -76.3, flag: 'US', isNaval: true, vesselCategory: 'naval', speed:  0, course:   0 },
  { mmsi: 'USS-CVN70',  name: 'USS Carl Vinson (CVN-70)',               lat: 32.7,  lng: -117.2, flag: 'US', isNaval: true, vesselCategory: 'naval', speed: 10, course: 180 },
  { mmsi: 'USS-CVN71',  name: 'USS Theodore Roosevelt (CVN-71)',        lat: 13.5,  lng:  144.8, flag: 'US', isNaval: true, vesselCategory: 'naval', speed: 20, course:  90 },
  { mmsi: 'USS-CVN72',  name: 'USS Abraham Lincoln (CVN-72)',           lat: 25.0,  lng:   55.0, flag: 'US', isNaval: true, vesselCategory: 'naval', speed: 15, course: 315 },
  
  { mmsi: 'HMS-R08',    name: 'HMS Queen Elizabeth (R08)',              lat: 50.8,  lng:   -1.1, flag: 'UK', isNaval: true, vesselCategory: 'naval', speed: 12, course: 200 },
  { mmsi: 'HMS-R09',    name: 'HMS Prince of Wales (R09)',              lat: 56.1,  lng:   -3.9, flag: 'UK', isNaval: true, vesselCategory: 'naval', speed:  0, course:   0 },
  
  { mmsi: 'FS-R91',     name: 'FS Charles de Gaulle (R91)',             lat: 43.3,  lng:    5.4, flag: 'FR', isNaval: true, vesselCategory: 'naval', speed:  0, course:   0 },
  
  { mmsi: 'RFS-063',    name: 'RFS Admiral Kuznetsov',                  lat: 68.9,  lng:   33.1, flag: 'RU', isNaval: true, vesselCategory: 'naval', speed:  0, course:   0 },
  { mmsi: 'RFS-055',    name: 'RFS Moskva (Black Sea Fleet)',           lat: 44.6,  lng:   33.5, flag: 'RU', isNaval: true, vesselCategory: 'naval', speed: 10, course:  90 },
  
  { mmsi: 'CNS-CV16',   name: 'CNS Liaoning (CV-16)',                   lat: 22.3,  lng:  114.2, flag: 'CN', isNaval: true, vesselCategory: 'naval', speed: 20, course:  45 },
  { mmsi: 'CNS-CV17',   name: 'CNS Shandong (CV-17)',                   lat: 18.2,  lng:  109.5, flag: 'CN', isNaval: true, vesselCategory: 'naval', speed: 15, course:  90 },
  { mmsi: 'CNS-CV18',   name: 'CNS Fujian (CV-18)',                     lat: 31.4,  lng:  121.5, flag: 'CN', isNaval: true, vesselCategory: 'naval', speed:  0, course:   0 },
  
  { mmsi: 'JS-DDH183',  name: 'JS Izumo (DDH-183)',                     lat: 35.4,  lng:  139.6, flag: 'JP', isNaval: true, vesselCategory: 'naval', speed:  0, course:   0 },
  { mmsi: 'JS-DDH184',  name: 'JS Kaga (DDH-184)',                      lat: 34.7,  lng:  135.2, flag: 'JP', isNaval: true, vesselCategory: 'naval', speed: 12, course: 180 },
  
  { mmsi: 'INS-R11',    name: 'INS Vikramaditya (R11)',                 lat: 15.5,  lng:   73.8, flag: 'IN', isNaval: true, vesselCategory: 'naval', speed:  0, course:   0 },
  { mmsi: 'INS-R15',    name: 'INS Vikrant (R15)',                      lat: 10.0,  lng:   76.0, flag: 'IN', isNaval: true, vesselCategory: 'naval', speed: 18, course: 270 },
] as const;
