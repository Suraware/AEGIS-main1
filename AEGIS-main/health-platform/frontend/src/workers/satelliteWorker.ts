import * as satellite from 'satellite.js';

interface TLEEntry { name: string; tle1: string; tle2: string; }

self.onmessage = ({ data: { tleData } }: MessageEvent<{ tleData: TLEEntry[] }>) => {
  const date = new Date();
  const positions = tleData.map(({ name, tle1, tle2 }) => {
    try {
      const satrec = satellite.twoline2satrec(tle1, tle2);
      const posVel = satellite.propagate(satrec, date);
      if (!posVel || !posVel.position || typeof posVel.position === 'boolean') return null;
      const gmst = satellite.gstime(date);
      const geodetic = satellite.eciToGeodetic(posVel.position as satellite.EciVec3<number>, gmst);
      return {
        name,
        lat: satellite.degreesLat(geodetic.latitude),
        lng: satellite.degreesLong(geodetic.longitude),
        alt: geodetic.height,
      };
    } catch { return null; }
  }).filter(Boolean);
  self.postMessage({ positions });
};
