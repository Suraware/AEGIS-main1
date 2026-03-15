import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSecurityData } from '../../services/globalDataService';
import TabFooter from './TabFooter';
import VirtualList from '../VirtualList';

interface CyberTabProps {
  country: { name: string; code: string };
  onTabChange?: (tabId: string) => void;
}

function SH({ label, extra }: { label: string; extra?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
      <span style={{ fontFamily: 'monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(0,255,204,0.6)', textTransform: 'uppercase' as const }}>─── {label}</span>
      {extra && <span style={{ marginLeft: 'auto' }}>{extra}</span>}
    </div>
  );
}

export default function CyberTab({ country, onTabChange }: CyberTabProps) {
  const { data, isFetching: loading, dataUpdatedAt, refetch } = useQuery({
    queryKey: ['security', country.code],
    queryFn: () => fetchSecurityData(country.code, country.name),
    enabled: !!country.code,
  });

  const lastUpdated = dataUpdatedAt > 0 ? new Date(dataUpdatedAt) : null;
  const cyberNews  = data?.cyberNews  ?? [];
  const recentCVEs = data?.recentCVEs ?? [];
  const breaches   = data?.breaches   ?? [];
  const sanctioned = data?.sanctioned ?? false;

  const accent     = '#00ffcc';
  const cardBg     = 'rgba(255,255,255,0.04)';
  const cardBorder = '1px solid rgba(0,255,204,0.12)';

  const SEVERITY_COLOR: Record<string, string> = {
    Critical: '#f87171', High: '#fb923c', Medium: '#fbbf24', Low: '#4ade80',
  };
  const SEVERITY_ORDER = ['Critical', 'High', 'Medium', 'Low'];
  const sortedCVEs = [...recentCVEs].sort((a, b) =>
    SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

  return (
    <div style={{ padding: '16px 20px 24px', fontFamily: 'monospace' }}>

      {}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {sanctioned && (
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', padding: '4px 10px', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.4)', borderRadius: '6px', color: '#f87171' }}>
              ⚠ SANCTIONED ENTITY
            </span>
          )}
        </div>
        <button onClick={() => refetch()} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'rgba(0,255,204,0.08)', border: '1px solid rgba(0,255,204,0.2)', borderRadius: '6px', color: loading ? 'rgba(0,255,204,0.4)' : accent, fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}>
          <span style={{ display: 'inline-block', animation: loading ? 'tabSpin 1s linear infinite' : 'none', fontSize: '11px', lineHeight: 1 }}>⟳</span>
          {loading ? 'LOADING...' : 'RELOAD'}
        </button>
      </div>

      {}
      <SH label="THREAT SUMMARY" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
        {[
          { label: 'CVEs',       value: recentCVEs.length,  color: '#f87171' },
          { label: 'BREACHES',   value: breaches.length,    color: '#fb923c' },
          { label: 'INCIDENTS',  value: cyberNews.length,   color: '#38bdf8' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: cardBg, border: `1px solid ${color}25`, borderRadius: '8px', padding: '12px', textAlign: 'center' as const }}>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color, marginBottom: '2px' }}>{value}</div>
          </div>
        ))}
      </div>

      {}
      {breaches.length > 0 && (
        <div style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>
            <span style={{ color: '#fb923c', fontWeight: 700 }}>{breaches.length}</span> data breach{breaches.length !== 1 ? 'es' : ''} detected for TLD <span style={{ color: accent }}>.{country.code.toLowerCase()}</span>
          </span>
          {onTabChange && (
            <button onClick={() => onTabChange('breaches')} style={{ fontSize: '9px', padding: '4px 10px', background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: '6px', color: '#fb923c', cursor: 'pointer', fontFamily: 'monospace' }}>
              VIEW ALL →
            </button>
          )}
        </div>
      )}

      {}
      <SH label="CVE INTELLIGENCE" extra={<span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>CISA KEV</span>} />
      <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,204,0.1)', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
        {sortedCVEs.length === 0 && !loading && (
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' as const, padding: '16px 0' }}>No CVEs found</div>
        )}
        {sortedCVEs.length > 0 && (
          <VirtualList
            items={sortedCVEs}
            height={280}
            estimateSize={55}
            renderItem={(cve: any, i: number) => {
              const sevColor = SEVERITY_COLOR[cve.severity] ?? '#94a3b8';
              return (
                <a href={`https://www.cve.org/CVERecord?id=${cve.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'flex-start', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: '10px' }}>
                  <div style={{ flexShrink: 0, minWidth: '16px', height: '16px', marginTop: '1px', borderRadius: '3px', background: `${sevColor}25`, border: `1px solid ${sevColor}60`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '7px', color: sevColor, fontWeight: 700 }}>{(cve.severity ?? 'N')[0]}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '9px', color: accent, letterSpacing: '0.1em', marginBottom: '2px' }}>{cve.id}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{cve.description}</div>
                    {cve.vendorProject && <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{cve.vendorProject}</div>}
                  </div>
                  <span style={{ flexShrink: 0, fontSize: '8px', color: sevColor, padding: '2px 6px', background: `${sevColor}15`, border: `1px solid ${sevColor}40`, borderRadius: '4px', alignSelf: 'flex-start' }}>{cve.severity ?? '—'}</span>
                </a>
              );
            }}
          />
        )}
      </div>

      {}
      <SH label="CYBER INCIDENT FEED" extra={<span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>GDELT FILTERED</span>} />
      <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(56,189,248,0.15)', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
        {cyberNews.length === 0 && !loading && (
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' as const, padding: '20px 0' }}>No cyber incidents found</div>
        )}
        {cyberNews.length > 0 && (
          <VirtualList
            items={cyberNews}
            height={260}
            estimateSize={38}
            renderItem={(n: any) => (
              <a href={n.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', padding: '7px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '4px' }}>
                  <div style={{ fontSize: '9px', color: '#38bdf8', letterSpacing: '0.08em' }}>{n.title ?? n.headline ?? n.summary ?? 'Untitled'}</div>
                  {n.domain && <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', marginTop: '1px' }}>↳ {n.domain}</div>}
                </div>
              </a>
            )}
          />
        )}
      </div>

      <TabFooter loading={loading} lastUpdated={lastUpdated} sources={['GDELT','CISA','HIBP']} onReload={refetch} />
    </div>
  );
}
