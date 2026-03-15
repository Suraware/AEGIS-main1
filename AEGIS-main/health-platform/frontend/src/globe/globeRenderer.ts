



import { useNotificationStore } from '../stores/useNotificationStore';

export interface GlobeRenderState {
  aircraft: any[];
  navalVessels: any[];
  earthquakes: any[];
  conflictEvents: any[];
  cyberArcs: any[];
  wildfires: any[];
  storms: any[];
  layers: Record<string, boolean>;
}

let globeInstance: any = null;
let lastRenderState: GlobeRenderState | null = null;
let renderScheduled = false;
let renderRAF: number | null = null;

export const registerGlobe = (globe: any): void => {
  globeInstance = globe;
  
  configureGlobeAccessors(globe);
  console.log('[globeRenderer] Globe registered');

  globe
    .onPointClick((point: any, event: MouseEvent) => {
      event.stopPropagation();
      const { addNotification } = useNotificationStore.getState();
      if (point._type === 'aircraft') {
        addNotification({
          type: 'info',
          title: `Aircraft: ${point.callsign || point.icao || 'Unknown'}`,
          message: `${point.military ? '🔴 Military' : '✈ Civilian'} · Alt: ${Math.round((point.baroAltitude || point.altitude || 0) / 1000)}km · ${point.originCountry || ''}`,
        });
      } else if (point._type === 'vessel') {
        addNotification({
          type: 'info',
          title: `Vessel: ${point.name || point.mmsi || 'Unknown Vessel'}`,
          message: `${point.vesselType || 'Unknown'} · ${typeof point.speed === 'number' ? point.speed.toFixed(1) : '?'} kts · ${point.isNaval ? '⚓ Naval' : 'Civilian'}`,
        });
      }
    })
    .onPointHover((point: any) => { document.body.style.cursor = point ? 'pointer' : 'default'; })
    .onArcClick((arc: any, event: MouseEvent) => {
      event.stopPropagation();
      useNotificationStore.getState().addNotification({
        type: 'warning',
        title: 'Cyber Attack Detected',
        message: `${arc.sourceCountry || '?'} → ${arc.targetCountry || '?'}`,
      });
    });

  if (typeof (globe as any).onRingClick === 'function') {
    (globe as any).onRingClick((ring: any, event: MouseEvent) => {
      event.stopPropagation();
      const { addNotification } = useNotificationStore.getState();
      if (ring._type === 'earthquake') {
        addNotification({
          type: ring.magnitude >= 6 ? 'alert' : 'warning',
          title: `M${ring.magnitude?.toFixed(1)} Earthquake`,
          message: ring.place || `${ring.lat?.toFixed(2)}°, ${ring.lng?.toFixed(2)}°`,
        });
      } else if (ring._type === 'conflict') {
        addNotification({ type: 'alert', title: ring.title || 'Conflict Event', message: ring.country || '' });
      }
    });
  }
};

export const unregisterGlobe = (): void => {
  globeInstance = null;
  lastRenderState = null;
  renderScheduled = false;
  if (renderRAF !== null) {
    cancelAnimationFrame(renderRAF);
    renderRAF = null;
  }
};


export const scheduleRender = (state: Partial<GlobeRenderState>): void => {
  if (!lastRenderState) {
    lastRenderState = {
      aircraft: [],
      navalVessels: [],
      earthquakes: [],
      conflictEvents: [],
      cyberArcs: [],
      wildfires: [],
      storms: [],
      layers: {},
    };
  }

  
  lastRenderState = { ...lastRenderState, ...state };

  if (renderScheduled) return;
  renderScheduled = true;

  if (renderRAF !== null) cancelAnimationFrame(renderRAF);
  renderRAF = requestAnimationFrame(() => {
    renderScheduled = false;
    renderRAF = null;
    flushRender();
  });
};


export const forceRender = (): void => {
  if (renderRAF !== null) {
    cancelAnimationFrame(renderRAF);
    renderRAF = null;
  }
  renderScheduled = false;
  flushRender();
};

const flushRender = (): void => {
  if (!globeInstance || !lastRenderState) return;

  const { aircraft, navalVessels, earthquakes, conflictEvents, cyberArcs, wildfires, storms, layers } = lastRenderState;

  try {
    updatePointsLayer(aircraft, navalVessels, layers);
    updateRingsLayer(earthquakes, conflictEvents, wildfires, storms, layers);
    updateArcsLayer(cyberArcs, layers);
  } catch (err) {
    console.error('[globeRenderer] Render error:', err);
  }
};


const updatePointsLayer = (
  aircraft: any[],
  navalVessels: any[],
  layers: Record<string, boolean>,
): void => {
  if (!globeInstance) return;

  const points: any[] = [];

  if (layers.aircraft || layers.militaryAircraft) {
    aircraft
      .filter(a => (layers.aircraft && !a.military) || (layers.militaryAircraft && a.military))
      .slice(0, 500)
      .forEach(a => points.push({ ...a, _type: 'aircraft' }));
  }

  if (layers.naval) {
    navalVessels.slice(0, 120).forEach(v => points.push({ ...v, _type: 'vessel' }));
  }

  globeInstance.pointsData(points);
};


const updateRingsLayer = (
  earthquakes: any[],
  conflicts: any[],
  wildfires: any[],
  storms: any[],
  layers: Record<string, boolean>,
): void => {
  if (!globeInstance) return;

  const rings: any[] = [];

  if (layers.earthquakes) {
    earthquakes.slice(0, 150).forEach(e => rings.push({
      ...e,
      _type: 'earthquake',
      maxR: Math.max(1, (e.magnitude || 3) * 1.5),
      propagationSpeed: 1.5,
      repeatPeriod: 1200,
    }));
  }

  if (layers.conflictZones) {
    conflicts.slice(0, 80).forEach(c => rings.push({
      ...c,
      _type: 'conflict',
      maxR: c.severity === 'critical' ? 2.5 : 1.8,
      propagationSpeed: 0.8,
      repeatPeriod: 2000,
    }));
  }

  if (layers.wildfires) {
    wildfires.slice(0, 100).forEach(w => rings.push({
      ...w,
      _type: 'wildfire',
      maxR: 1.2,
      propagationSpeed: 1.0,
      repeatPeriod: 1800,
    }));
  }

  if (layers.storms) {
    storms.slice(0, 20).forEach(s => rings.push({
      ...s,
      _type: 'storm',
      maxR: Math.max(1, (s.windSpeed || 50) / 40),
      propagationSpeed: 0.9,
      repeatPeriod: 800,
    }));
  }

  globeInstance.ringsData(rings);
};


const updateArcsLayer = (cyberArcs: any[], layers: Record<string, boolean>): void => {
  if (!globeInstance) return;

  if (!layers.cyberAttacks) {
    globeInstance.arcsData([]);
    return;
  }

  globeInstance.arcsData(cyberArcs.slice(0, 25));
};





const configureGlobeAccessors = (globe: any): void => {
  globe
    .pointLat((d: any) => d.lat)
    .pointLng((d: any) => d.lng)
    .pointAltitude((d: any) => {
      if (d._type === 'vessel') return 0.005;
      if (d.military) return 0.025;
      return 0.018;
    })
    .pointRadius((d: any) => {
      if (d._type === 'vessel') {
        if (d.vesselType === 'aircraft_carrier') return 0.55;
        if (d.vesselType === 'submarine') return 0.4;
        return 0.3;
      }
      if (d.military) return 0.4;
      return 0.22;
    })
    .pointColor((d: any) => {
      if (d._type === 'vessel') {
        if (d.vesselType === 'aircraft_carrier') return '#f59e0b';
        if (d.vesselType === 'submarine') return '#8b5cf6';
        if (d.vesselType === 'destroyer' || d.vesselType === 'cruiser') return '#3b82f6';
        if (d.isNaval) return '#60a5fa';
        return '#475569';
      }
      if (d.military) return '#f87171';
      return '#94a3b8';
    })
    .pointLabel((d: any) => buildPointLabel(d))
    .ringLat((d: any) => d.lat)
    .ringLng((d: any) => d.lng)
    .ringMaxRadius((d: any) => d.maxR)
    .ringColor((d: any) => {
      if (d._type === 'earthquake') {
        const mag = d.magnitude || 0;
        if (mag >= 7) return (t: number) => `rgba(248,113,113,${1 - t})`;
        if (mag >= 5) return (t: number) => `rgba(251,146,60,${1 - t})`;
        return (t: number) => `rgba(250,204,21,${1 - t})`;
      }
      if (d._type === 'conflict') {
        if (d.severity === 'critical') return (t: number) => `rgba(248,113,113,${1 - t})`;
        return (t: number) => `rgba(251,146,60,${1 - t})`;
      }
      if (d._type === 'wildfire') return (t: number) => `rgba(255,100,0,${1 - t})`;
      if (d._type === 'storm') {
        const w = d.windSpeed || 50;
        if (w > 111) return (t: number) => `rgba(255,0,0,${1 - t})`;
        if (w > 64)  return (t: number) => `rgba(255,140,0,${1 - t})`;
        return (t: number) => `rgba(255,200,0,${1 - t})`;
      }
      return (t: number) => `rgba(148,163,184,${1 - t})`;
    })
    .ringPropagationSpeed((d: any) => d.propagationSpeed)
    .ringRepeatPeriod((d: any) => d.repeatPeriod)
    .arcStartLat((d: any) => d.startLat)
    .arcStartLng((d: any) => d.startLng)
    .arcEndLat((d: any) => d.endLat)
    .arcEndLng((d: any) => d.endLng)
    .arcColor((d: any) => d.color || ['rgba(56,189,248,0.8)', 'rgba(56,189,248,0)'])
    .arcAltitude((d: any) => d.altitude || 0.3)
    .arcStroke((d: any) => d.stroke || 0.4)
    .arcDashLength(0.4)
    .arcDashGap(0.2)
    .arcDashAnimateTime(2000);
};


const buildPointLabel = (d: any): string => {
  if (d._type === 'vessel') {
    const flag = getFlagEmoji(d.flag || '');
    return `
      <div style="background:rgba(5,12,24,0.97);border:1px solid rgba(96,165,250,0.4);border-radius:8px;padding:10px 14px;font-family:DM Sans,sans-serif;min-width:180px;pointer-events:none;">
        <div style="color:#f1f5f9;font-weight:700;font-size:13px;">${flag} ${d.name || 'Unknown Vessel'}</div>
        <div style="color:#64748b;font-size:11px;margin-top:4px;">Type: <span style="color:#60a5fa;text-transform:capitalize;">${(d.vesselType || 'unknown').replace('_', ' ')}</span></div>
        <div style="color:#64748b;font-size:11px;">Speed: ${(d.speed || 0).toFixed(1)} kts · HDG: ${(d.course || 0).toFixed(0)}°</div>
        ${d.isNaval ? '<div style="color:#60a5fa;font-size:11px;font-weight:600;margin-top:3px;">⚓ NAVAL VESSEL</div>' : ''}
      </div>`;
  }
  if (d.military) {
    return `
      <div style="background:rgba(5,12,24,0.97);border:1px solid rgba(248,113,113,0.4);border-radius:8px;padding:10px 14px;font-family:DM Sans,sans-serif;min-width:160px;pointer-events:none;">
        <div style="color:#f1f5f9;font-weight:700;font-size:13px;">🔴 ${d.callsign || d.icao}</div>
        <div style="color:#64748b;font-size:11px;margin-top:4px;">Military · ${d.originCountry || ''}</div>
        <div style="color:#64748b;font-size:11px;">Alt: ${Math.round((d.baroAltitude || 0) / 1000)}km · ${Math.round(d.velocity || 0)} m/s</div>
        <div style="color:#64748b;font-size:11px;">HDG: ${Math.round(d.heading || 0)}°</div>
      </div>`;
  }
  return `
    <div style="background:rgba(5,12,24,0.97);border:1px solid rgba(148,163,184,0.3);border-radius:8px;padding:10px 14px;font-family:DM Sans,sans-serif;min-width:150px;pointer-events:none;">
      <div style="color:#f1f5f9;font-weight:700;font-size:13px;">✈ ${d.callsign || d.icao || 'Unknown'}</div>
      <div style="color:#64748b;font-size:11px;margin-top:4px;">${d.originCountry || ''}</div>
      <div style="color:#64748b;font-size:11px;">Alt: ${Math.round((d.baroAltitude || 0) / 1000)}km · ${Math.round(d.velocity || 0)} m/s</div>
    </div>`;
};

const getFlagEmoji = (code: string): string => {
  if (!code || code.length !== 2) return '🏳';
  try {
    return String.fromCodePoint(...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0)));
  } catch {
    return '🏳';
  }
};


export const onLayersChanged = (layers: Record<string, boolean>): void => {
  scheduleRender({ layers });
};
