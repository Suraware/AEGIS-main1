
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchOSINTData } from '../../services/globalDataService';
import TabFooter from './TabFooter';
import { ORBITAL_CONFIGS } from '../../globe/orbitalRings';
import { useGlobeStore } from '../../stores/useGlobeStore';

interface SatellitesTabProps {
  country:     { name: string; code: string };
  countryInfo?: any;
}

function SH({ label, extra }: { label: string; extra?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
      <span style={{ fontFamily: 'monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(0,255,204,0.6)', textTransform: 'uppercase' as const }}>─── {label}</span>
      {extra && <span style={{ marginLeft: 'auto' }}>{extra}</span>}
    </div>
  );
}

export default function SatellitesTab({ country, countryInfo }: SatellitesTabProps) {
  const lat = countryInfo?.latlng?.[0] ?? 0;
  const lng = countryInfo?.latlng?.[1] ?? 0;

  const satelliteData = useGlobeStore(s => s.satelliteData);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    satelliteData.forEach((s: any) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [satelliteData]);

  const [workerPositions, setWorkerPositions] = useState<any[]>([]);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../../workers/satelliteWorker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current.onmessage = ({ data: { positions } }: MessageEvent) => {
      setWorkerPositions(positions);
    };
    return () => { workerRef.current?.terminate(); };
  }, []);

  useEffect(() => {
    if (!workerRef.current) return;
    fetch('https://celestrak.org/pub/TLE/visual.txt')
      .then(r => r.text())
      .then(text => {
        const lines = text.trim().split('\n');
        const tleData: { name: string; tle1: string; tle2: string }[] = [];
        for (let i = 0; i + 2 < lines.length; i += 3) {
          const name = lines[i].trim();
          const tle1 = lines[i + 1].trim();
          const tle2 = lines[i + 2].trim();
          if (tle1.startsWith('1 ') && tle2.startsWith('2 ')) {
            tleData.push({ name, tle1, tle2 });
          }
        }
        workerRef.current?.postMessage({ tleData });
      })
      .catch(() => {});
  }, [country.code]);

  const { data, isFetching: loading, dataUpdatedAt, refetch } = useQuery({
    queryKey: ['satellites', country.code],
    queryFn: async () => {
      const [osintRes] = await Promise.allSettled([
        fetchOSINTData(country.code, country.name, lat, lng),
      ]);
      return {
        issPosition: osintRes.status === 'fulfilled' ? (osintRes.value.issPosition ?? null) : null,
        issCrew:     osintRes.status === 'fulfilled' ? (osintRes.value.issCrew ?? []) : [],
        satellites:  workerPositions.slice(0, 10),
      };
    },
    enabled: !!country.code,
  });

  const lastUpdated = dataUpdatedAt > 0 ? new Date(dataUpdatedAt) : null;
  const issPosition = data?.issPosition ?? null;
  const issCrew     = data?.issCrew     ?? [];
  const satellites  = data?.satellites  ?? [];

  const issOverhead = issPosition && lat !== 0
    ? Math.abs(issPosition.lat - lat) < 15 && Math.abs(issPosition.lng - lng) < 15
    : false;

  const accent     = '#00ffcc';
  const cardBg     = 'rgba(255,255,255,0.04)';
  const cardBorder = '1px solid rgba(0,255,204,0.12)';

  return (
    <div style={{ padding: '16px 20px 24px', fontFamily: 'monospace' }}>

      {}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <button onClick={() => refetch()} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'rgba(0,255,204,0.08)', border: '1px solid rgba(0,255,204,0.2)', borderRadius: '6px', color: loading ? 'rgba(0,255,204,0.4)' : accent, fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}>
          <span style={{ display: 'inline-block', animation: loading ? 'tabSpin 1s linear infinite' : 'none', fontSize: '11px', lineHeight: 1 }}>⟳</span>
          {loading ? 'LOADING...' : 'RELOAD'}
        </button>
      </div>

      {}
      <SH label="ISS LIVE POSITION" extra={
        issOverhead
          ? <span style={{ fontSize: '9px', color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '4px', padding: '2px 8px' }}>🛸 OVERHEAD NOW</span>
          : <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>Open-Notify</span>
      } />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Latitude',  value: issPosition ? `${issPosition.lat.toFixed(2)}°` : loading ? '...' : '—' },
          { label: 'Longitude', value: issPosition ? `${issPosition.lng.toFixed(2)}°` : loading ? '...' : '—' },
          { label: 'Altitude',  value: '~408 km' },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: cardBg, border: cardBorder, borderRadius: '8px', padding: '12px', textAlign: 'center' as const }}>
            <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: accent }}>{value}</div>
          </div>
        ))}
      </div>

      {}
      {issPosition && lat !== 0 && (
        <div style={{ background: issOverhead ? 'rgba(74,222,128,0.06)' : cardBg, border: issOverhead ? '1px solid rgba(74,222,128,0.25)' : cardBorder, borderRadius: '8px', padding: '12px', marginBottom: '20px', textAlign: 'center' as const }}>
          {issOverhead ? (
            <>
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>🛸</div>
              <div style={{ fontSize: '11px', color: '#4ade80', fontWeight: 600 }}>ISS is currently passing over {country.name}</div>
            </>
          ) : (
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
              ISS is ~{Math.round(Math.sqrt(Math.pow(issPosition.lat - lat, 2) + Math.pow(issPosition.lng - lng, 2)) * 111)}km away from {country.name}
            </div>
          )}
        </div>
      )}

      {}
      <SH label="CURRENT ISS CREW" extra={<span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>Open-Notify</span>} />
      <div style={{ background: cardBg, border: cardBorder, borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
        {issCrew.length === 0 && !loading && (
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' as const, padding: '8px' }}>No crew data available</div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px' }}>
          {issCrew.map((c: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '6px' }}>
              <span style={{ fontSize: '13px' }}>👩‍🚀</span>
              <div>
                <div style={{ fontSize: '10px', color: '#e2e8f0', fontWeight: 600 }}>{c.name ?? c}</div>
                {c.craft && <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)' }}>{c.craft}</div>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginTop: '10px', textAlign: 'center' as const }}>
          {issCrew.length} crew member{issCrew.length !== 1 ? 's' : ''} currently aboard the ISS
        </div>
      </div>

      {}
      <SH label="LIVE TRACKING" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
        <a href="https://www.nasa.gov/multimedia/nasatv/iss_ustream.html" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', padding: '12px', background: 'rgba(0,255,204,0.06)', border: '1px solid rgba(0,255,204,0.2)', borderRadius: '8px', textAlign: 'center' as const, transition: 'background 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,204,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,255,204,0.06)'; }}
        >
          <div style={{ fontSize: '18px', marginBottom: '4px' }}>📺</div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: accent }}>Watch Live Feed</div>
          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>NASA TV ISS stream</div>
        </a>
        <a href="https://celestrak.org/cesium/orbit-viz.php?tle=/SOCRATES/query.php?CODE=ALL&fmt=json" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', padding: '12px', background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', textAlign: 'center' as const, transition: 'background 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.06)'; }}
        >
          <div style={{ fontSize: '18px', marginBottom: '4px' }}>🛰️</div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#38bdf8' }}>Track ISS</div>
          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>CelesTrak 3D orbit</div>
        </a>
      </div>

      {}
      {satelliteData.length > 0 && (
        <>
          <SH
            label="ORBITAL CATEGORIES"
            extra={<span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>{satelliteData.length} tracked</span>}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
            {ORBITAL_CONFIGS.map(config => (
              <div key={config.category} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'rgba(15,23,42,0.6)',
                border: `1px solid ${config.glowColor}22`,
                borderLeft: `3px solid ${config.glowColor}`,
                borderRadius: '8px',
                gap: '10px',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: config.glowColor,
                  boxShadow: `0 0 8px ${config.glowColor}`,
                  flexShrink: 0,
                }} />
                <span style={{ color: '#e2e8f0', fontSize: '13px', flex: 1, fontFamily: 'DM Sans, sans-serif' }}>
                  {config.label}
                </span>
                <span style={{ color: config.glowColor, fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>
                  {categoryCounts[config.category] || 0}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {}
      {satellites.length > 0 && (
        <>
          <SH label="SATELLITE CATALOG" extra={<span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>CelesTrak</span>} />
          <div style={{ background: cardBg, border: cardBorder, borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
            {satellites.map((sat: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', borderBottom: i < satellites.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <span style={{ fontSize: '10px', color: '#e2e8f0' }}>{sat.NAME ?? sat.name ?? `Object #${i + 1}`}</span>
                <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{sat.NORAD_CAT_ID ?? sat.norad ?? ''}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <TabFooter loading={loading} lastUpdated={lastUpdated} sources={['Open-Notify','RestCountries']} onReload={refetch} />
    </div>
  );
}
