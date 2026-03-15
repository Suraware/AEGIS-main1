import { useState, useEffect } from 'react';
import { useGlobeStore } from '../stores/useGlobeStore';
import { getProxyStatus } from '../lib/proxyManager';

export function LiveStatsBar() {
  const { aircraftCount, conflictEventCount, quakesTodayCount, satelliteData } = useGlobeStore();
  const [proxyStatus, setProxyStatus] = useState({ working: 0, total: 0 });

  useEffect(() => {
    const update = () => setProxyStatus(getProxyStatus());
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Aircraft',   value: aircraftCount,       color: '#94a3b8' },
    { label: 'Conflicts',  value: conflictEventCount,  color: '#f87171' },
    { label: 'Quakes',     value: quakesTodayCount,    color: '#facc15' },
    { label: 'Satellites', value: satelliteData.length, color: '#a78bfa' },
  ];

  const proxyOk = proxyStatus.working > 3;

  return (
    <div style={{
      background: 'rgba(5,12,24,0.92)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '7px 12px',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      gap: '0',
      width: 'fit-content',
    }}>
      {stats.map((stat, i) => (
        <div key={stat.label} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          paddingLeft: i > 0 ? '12px' : 0,
          paddingRight: '12px',
          borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}>
          <span style={{ color: stat.color, fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', lineHeight: 1 }}>
            {stat.value.toLocaleString()}
          </span>
          <span style={{ color: '#334155', fontSize: '9px', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginTop: '2px' }}>
            {stat.label}
          </span>
        </div>
      ))}

      {}
      <div style={{ paddingLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '2px 8px',
          background: proxyOk ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
          border: `1px solid ${proxyOk ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
          borderRadius: '6px',
        }}>
          <div style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: proxyOk ? '#4ade80' : '#f87171',
          }} />
          <span style={{
            color: proxyOk ? '#4ade80' : '#f87171',
            fontSize: '10px', fontFamily: 'monospace', fontWeight: 600,
          }}>
            {proxyStatus.working}/{proxyStatus.total} PROXY
          </span>
        </div>
      </div>
    </div>
  );
}
