import { getWorkingProxies } from './proxyManager';


export const fetchWildfireData = async (): Promise<any[]> => {
  console.log('Fetching wildfire data...');

  const proxies = getWorkingProxies();
  let fires: any[] = [];

  
  const firmsUrls = [
    'https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_24h.csv',
    'https://firms.modaps.eosdis.nasa.gov/data/active_fire/viirs-i-band-375m/csv/VIIRS_I_Band_Global_24h.csv',
    'https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_Global_24h.csv',
    'https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_Global_24h.csv',
  ];

  for (const url of firmsUrls) {
    if (fires.length > 0) break;

    try {
      let text = '';

      
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
        if (res.ok) text = await res.text();
      } catch {  }

      
      if (!text) {
        for (const proxy of proxies.slice(0, 4)) {
          try {
            const res = await fetch(`${proxy.url}${encodeURIComponent(url)}`, {
              signal: AbortSignal.timeout(12000),
            });
            if (res.ok) {
              const t = await res.text();
              if (t.includes(',') && t.length > 200) {
                text = t;
                console.log(`FIRMS via ${proxy.name}: got ${text.split('\n').length} lines`);
                break;
              }
            }
          } catch { continue; }
        }
      }

      if (!text || !text.includes(',')) continue;

      const lines = text.trim().split('\n');
      if (lines.length < 2) continue;

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const latIdx    = headers.findIndex(h => h === 'latitude'  || h === 'lat');
      const lngIdx    = headers.findIndex(h => h === 'longitude' || h === 'lng' || h === 'lon');
      const brightIdx = headers.findIndex(h => h.includes('bright') || h.includes('frp'));
      const confIdx   = headers.findIndex(h => h.includes('conf'));
      const dateIdx   = headers.findIndex(h => h.includes('date') || h.includes('acq'));

      if (latIdx === -1 || lngIdx === -1) continue;

      const parsed = lines.slice(1)
        .filter(l => l.trim().length > 0)
        .slice(0, 3000)
        .map(line => {
          const vals = line.split(',');
          const lat = parseFloat(vals[latIdx]);
          const lng = parseFloat(vals[lngIdx]);
          if (isNaN(lat) || isNaN(lng)) return null;
          return {
            _type: 'wildfire',
            lat,
            lng,
            brightness: brightIdx >= 0 ? parseFloat(vals[brightIdx]) || 300 : 300,
            confidence: confIdx   >= 0 ? (vals[confIdx]?.trim() || 'n') : 'n',
            date:       dateIdx   >= 0 ? (vals[dateIdx]?.trim() || '') : '',
            source: 'NASA FIRMS',
          };
        })
        .filter(Boolean);

      if (parsed.length > 0) {
        fires = parsed;
        console.log(`FIRMS wildfire data: ${fires.length} fires from ${url.split('/').pop()}`);
      }
    } catch (err) {
      console.warn('FIRMS source failed:', err);
    }
  }

  
  if (fires.length < 100) {
    try {
      const nifcUrl = 'https://services3.arcgis.com/T4QMspbfLg3qoC1P/arcgis/rest/services/WFIGS_Interagency_Perimeters_Current/FeatureServer/0/query?where=1%3D1&outFields=*&f=json&resultRecordCount=200';

      let data: any = null;
      try {
        const res = await fetch(nifcUrl, { signal: AbortSignal.timeout(8000) });
        if (res.ok) data = await res.json();
      } catch {  }

      if (!data) {
        for (const proxy of proxies.slice(0, 3)) {
          try {
            const res = await fetch(`${proxy.url}${encodeURIComponent(nifcUrl)}`, {
              signal: AbortSignal.timeout(10000),
            });
            if (res.ok) { data = await res.json(); break; }
          } catch { continue; }
        }
      }

      if (data?.features) {
        const nifcFires = data.features
          .filter((f: any) => f.geometry?.rings || f.geometry?.x)
          .map((f: any) => {
            const attr = f.attributes;
            let lat: number, lng: number;

            if (f.geometry?.rings) {
              const ring = f.geometry.rings[0] as number[][];
              lat = ring.reduce((s, p) => s + p[1], 0) / ring.length;
              lng = ring.reduce((s, p) => s + p[0], 0) / ring.length;
            } else {
              lat = f.geometry.y;
              lng = f.geometry.x;
            }

            return {
              _type: 'wildfire',
              lat, lng,
              brightness: 400,
              confidence: 'h',
              name:   attr?.IncidentName || 'Active Fire',
              area:   attr?.GISAcres     || 0,
              source: 'NIFC',
            };
          })
          .filter((f: any) => f.lat && f.lng && Math.abs(f.lat) < 90);

        fires.push(...nifcFires);
        console.log('NIFC fires:', nifcFires.length);
      }
    } catch (err) {
      console.warn('NIFC fetch failed:', err);
    }
  }

  
  if (fires.length < 100) {
    try {
      const gfwUrl = 'https://data-api.globalforestwatch.org/dataset/nasa_viirs_fire_alerts/latest/query?sql=SELECT+latitude,longitude,confidence,bright_ti4+FROM+nasa_viirs_fire_alerts+WHERE+alert__date+%3E+CURRENT_DATE+-+INTERVAL+1+DAY+LIMIT+1000';

      let data: any = null;
      try {
        const res = await fetch(gfwUrl, { signal: AbortSignal.timeout(8000) });
        if (res.ok) data = await res.json();
      } catch {  }

      if (!data) {
        for (const proxy of proxies.slice(0, 3)) {
          try {
            const res = await fetch(`${proxy.url}${encodeURIComponent(gfwUrl)}`, {
              signal: AbortSignal.timeout(10000),
            });
            if (res.ok) { data = await res.json(); break; }
          } catch { continue; }
        }
      }

      if (data?.data) {
        const gfwFires = (data.data as any[])
          .filter((f: any) => f.latitude && f.longitude)
          .map((f: any) => ({
            _type: 'wildfire',
            lat:        parseFloat(f.latitude),
            lng:        parseFloat(f.longitude),
            brightness: parseFloat(f.bright_ti4 || 350),
            confidence: f.confidence || 'n',
            source:     'GlobalForestWatch',
          }));

        fires.push(...gfwFires);
        console.log('GFW fires:', gfwFires.length);
      }
    } catch (err) {
      console.warn('GFW fetch failed:', err);
    }
  }

  console.log('Total wildfire data points:', fires.length);
  return fires;
};



export const fetchStormData = async (): Promise<any[]> => {
  console.log('Fetching storm data...');

  const proxies = getWorkingProxies();
  const storms: any[] = [];

  
  try {
    const nhcUrls = [
      'https://www.nhc.noaa.gov/CurrentStorms.json',
      'https://www.nhc.noaa.gov/nhc_at1.xml',
      'https://www.nhc.noaa.gov/nhc_at2.xml',
      'https://www.nhc.noaa.gov/nhc_ep1.xml',
      'https://www.nhc.noaa.gov/nhc_cp1.xml',
    ];

    for (const url of nhcUrls) {
      let rawData: any = null;

      
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          if (url.endsWith('.json')) {
            rawData = await res.json();
          } else {
            const text = await res.text();
            const latMatch  = text.match(/<geo:lat>([\d.-]+)<\/geo:lat>/);
            const lngMatch  = text.match(/<geo:long>([\d.-]+)<\/geo:long>/);
            const nameMatch = text.match(/<title>([^<]+)<\/title>/);
            const windMatch = text.match(/Maximum Wind Speed[:\s]+([\d]+)/i);

            if (latMatch && lngMatch) {
              storms.push({
                _type: 'storm',
                id:        url,
                name:      nameMatch?.[1]?.replace(/\(.*\)/, '').trim() || 'Tropical Storm',
                lat:       parseFloat(latMatch[1]),
                lng:       parseFloat(lngMatch[1]),
                windSpeed: windMatch ? parseInt(windMatch[1]) : 0,
                category:  'tropical',
                basin:     url.includes('at') ? 'Atlantic' : url.includes('ep') ? 'East Pacific' : 'Central Pacific',
                source:    'NHC',
              });
            }
          }
        }
      } catch {  }

      
      if (!rawData && !storms.find(s => s.source === 'NHC')) {
        for (const proxy of proxies.slice(0, 3)) {
          try {
            const res = await fetch(`${proxy.url}${encodeURIComponent(url)}`, {
              signal: AbortSignal.timeout(8000),
            });
            if (res.ok) {
              if (url.endsWith('.json')) {
                rawData = await res.json();
              } else {
                const text = await res.text();
                const latMatch  = text.match(/<geo:lat>([\d.-]+)<\/geo:lat>/);
                const lngMatch  = text.match(/<geo:long>([\d.-]+)<\/geo:long>/);
                const nameMatch = text.match(/<title>([^<]+)<\/title>/);

                if (latMatch && lngMatch) {
                  storms.push({
                    _type:     'storm',
                    id:        url + proxy.name,
                    name:      nameMatch?.[1]?.trim() || 'Tropical Storm',
                    lat:       parseFloat(latMatch[1]),
                    lng:       parseFloat(lngMatch[1]),
                    windSpeed: 0,
                    category:  'tropical',
                    basin:     'Atlantic',
                    source:    'NHC',
                  });
                }
              }
              break;
            }
          } catch { continue; }
        }
      }

      if (rawData?.activeStorms) {
        storms.push(...(rawData.activeStorms as any[]).map((s: any) => ({
          _type:     'storm',
          id:        s.id || s.name,
          name:      s.name || 'Unknown Storm',
          lat:       parseFloat(s.lat || 0),
          lng:       parseFloat(s.lon || s.lng || 0),
          windSpeed: parseInt(s.maxWindMph || s.wind || 0),
          category:  s.category || 'tropical',
          basin:     s.basin    || 'Atlantic',
          pressure:  s.minPressureMb || s.pressure,
          source:    'NHC',
        })));
      }
    }
  } catch (err) {
    console.warn('NHC fetch failed:', err);
  }

  
  try {
    const jtwcUrl = 'https://www.metoc.navy.mil/jtwc/rss/jtwc.rss';
    let text = '';

    try {
      const res = await fetch(jtwcUrl, { signal: AbortSignal.timeout(8000) });
      if (res.ok) text = await res.text();
    } catch {  }

    if (!text) {
      for (const proxy of proxies.slice(0, 3)) {
        try {
          const res = await fetch(`${proxy.url}${encodeURIComponent(jtwcUrl)}`, {
            signal: AbortSignal.timeout(8000),
          });
          if (res.ok) { text = await res.text(); break; }
        } catch { continue; }
      }
    }

    if (text) {
      const items = text.match(/<item>[\s\S]*?<\/item>/g) || [];
      items.forEach(item => {
        const latMatch  = item.match(/(\d+\.\d+)[NS]/);
        const lngMatch  = item.match(/\d+\.\d+[NS]\s+(\d+\.\d+)[EW]/);
        const latHemi   = item.match(/(\d+\.\d+)([NS])/)?.[2];
        const lngHemi   = item.match(/\d+\.\d+[NS]\s+\d+\.\d+([EW])/)?.[1];
        const titleMatch = item.match(/<title>([^<]+)<\/title>/);

        if (latMatch && lngMatch) {
          const lat = parseFloat(latMatch[1]) * (latHemi === 'S' ? -1 : 1);
          const lng = parseFloat(lngMatch[1]) * (lngHemi === 'W' ? -1 : 1);
          storms.push({
            _type:     'storm',
            id:        titleMatch?.[1] || String(Math.random()),
            name:      titleMatch?.[1] || 'Typhoon',
            lat, lng,
            windSpeed: 0,
            category:  'typhoon',
            basin:     'West Pacific',
            source:    'JTWC',
          });
        }
      });
      console.log('JTWC storms:', storms.filter(s => s.source === 'JTWC').length);
    }
  } catch (err) {
    console.warn('JTWC fetch failed:', err);
  }

  
  try {
    const zoomUrls = [
      'https://zoom.earth/api/cyclones',
      'https://zoom.earth/api/storms',
      'https://weather.com/api/v1/storms/active',
    ];

    for (const url of zoomUrls) {
      let data: any = null;

      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (res.ok) data = await res.json();
      } catch {  }

      if (!data) {
        for (const proxy of proxies.slice(0, 3)) {
          try {
            const res = await fetch(`${proxy.url}${encodeURIComponent(url)}`, {
              signal: AbortSignal.timeout(8000),
            });
            if (res.ok) { data = await res.json(); break; }
          } catch { continue; }
        }
      }

      if (data) {
        const stormList: any[] = data.storms || data.cyclones || data.data || [];
        if (Array.isArray(stormList) && stormList.length > 0) {
          storms.push(...stormList.map((s: any) => ({
            _type:     'storm',
            id:        s.id || s.name,
            name:      s.name || s.title || 'Storm',
            lat:       parseFloat(s.lat || s.latitude || 0),
            lng:       parseFloat(s.lon || s.lng || s.longitude || 0),
            windSpeed: parseInt(s.wind || s.windSpeed || s.max_wind || 0),
            category:  s.category || s.type || 'tropical',
            basin:     s.basin    || s.ocean || '',
            source:    'ZoomEarth',
          })).filter((s: any) => s.lat && s.lng));
          console.log('ZoomEarth storms:', storms.filter(s => s.source === 'ZoomEarth').length);
          break;
        }
      }
    }
  } catch (err) {
    console.warn('Storm tracker fetch failed:', err);
  }

  console.log('Total storms found:', storms.length);
  return storms;
};
