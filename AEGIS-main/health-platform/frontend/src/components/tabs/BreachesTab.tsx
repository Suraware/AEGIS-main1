

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchSecurityData } from '../../services/globalDataService';
import TabFooter from './TabFooter';
import VirtualList from '../VirtualList';

interface BreachesTabProps {
  country: { name: string; code: string };
}

function SH({ label, extra }: { label: string; extra?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
      <span style={{ fontFamily: 'monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(0,255,204,0.6)', textTransform: 'uppercase' as const }}>─── {label}</span>
      {extra && <span style={{ marginLeft: 'auto' }}>{extra}</span>}
    </div>
  );
}

export default function BreachesTab({ country }: BreachesTabProps) {
  const { data, isFetching: loading, dataUpdatedAt, refetch } = useQuery({
    queryKey: ['security', country.code],
    queryFn: () => fetchSecurityData(country.code, country.name),
    enabled: !!country.code,
  });

  const lastUpdated = dataUpdatedAt > 0 ? new Date(dataUpdatedAt) : null;
  const breaches   = data?.breaches   ?? [];
  const recentCVEs = data?.recentCVEs ?? [];

  
  const catMap: Record<string, number> = {};
  breaches.forEach((b: any) => {
    (b.DataClasses || []).forEach((cls: string) => {
      catMap[cls] = (catMap[cls] || 0) + 1;
    });
  });
  const pieData = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  const PIE_COLORS = ['#f87171','#fb923c','#fbbf24','#4ade80','#38bdf8','#a78bfa'];

  const totalRecords = breaches.reduce((s: number, b: any) => s + (b.PwnCount ?? 0), 0);

  const accent     = '#00ffcc';
  const cardBg     = 'rgba(255,255,255,0.04)';
  const cardBorder = '1px solid rgba(0,255,204,0.12)';

  const SEVERITY_COLOR: Record<string, string> = {
    Critical: '#f87171', High: '#fb923c', Medium: '#fbbf24', Low: '#4ade80',
  };
  const SEVERITY_ORDER = ['Critical','High','Medium','Low'];
  const sortedCVEs = [...recentCVEs].sort((a, b) =>
    SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

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
      <SH label="BREACH SUMMARY" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
        <div style={{ background: cardBg, border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', marginBottom: '4px' }}>BREACHED SITES</div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#f87171' }}>{breaches.length}</div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>TLD: .{country.code.toLowerCase()}</div>
        </div>
        <div style={{ background: cardBg, border: '1px solid rgba(251,146,60,0.2)', borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', marginBottom: '4px' }}>RECORDS EXPOSED</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#fb923c' }}>{totalRecords >= 1000000 ? `${(totalRecords / 1000000).toFixed(1)}M` : totalRecords.toLocaleString()}</div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>estimated total</div>
        </div>
      </div>

      {}
      {pieData.length > 0 && (
        <>
          <SH label="EXPOSED DATA CATEGORIES" />
          <div style={{ background: cardBg, border: cardBorder, borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={68}
                  dataKey="value" stroke="none">
                  {pieData.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(0,255,204,0.2)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11px', color: '#e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '5px', justifyContent: 'center' as const }}>
              {pieData.map((d: any, i: number) => (
                <span key={i} style={{ fontSize: '8px', padding: '2px 7px', borderRadius: '4px', background: `${PIE_COLORS[i % PIE_COLORS.length]}18`, border: `1px solid ${PIE_COLORS[i % PIE_COLORS.length]}40`, color: PIE_COLORS[i % PIE_COLORS.length] }}>{d.name}</span>
              ))}
            </div>
          </div>
        </>
      )}

      {}
      <SH label="BREACH RECORDS" extra={<span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>HIBP</span>} />
      <div style={{ marginBottom: '20px' }}>
        {breaches.length === 0 && !loading && (
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' as const, padding: '20px 0', background: cardBg, border: cardBorder, borderRadius: '8px' }}>No breaches found for .{country.code.toLowerCase()} TLD</div>
        )}
        {breaches.length > 0 && (
          <VirtualList
            items={breaches}
            height={320}
            estimateSize={90}
            renderItem={(b: any) => (
              <div style={{ paddingBottom: '6px' }}>
                <a href={`https://haveibeenpwned.com/PwnedWebsites#${b.Name}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ background: cardBg, border: '1px solid rgba(248,113,113,0.15)', borderRadius: '8px', padding: '10px 12px', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(248,113,113,0.15)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0' }}>{b.Name}</span>
                      <span style={{ fontSize: '9px', color: '#fb923c', marginLeft: '8px', flexShrink: 0 }}>
                        {b.PwnCount >= 1000000 ? `${(b.PwnCount / 1000000).toFixed(1)}M` : b.PwnCount?.toLocaleString() ?? '—'} records
                      </span>
                    </div>
                    {b.DataClasses?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px' }}>
                        {b.DataClasses.slice(0, 5).map((cls: string, j: number) => (
                          <span key={j} style={{ fontSize: '8px', padding: '1px 5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', color: 'rgba(255,255,255,0.45)' }}>{cls}</span>
                        ))}
                        {b.DataClasses.length > 5 && <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)' }}>+{b.DataClasses.length - 5}</span>}
                      </div>
                    )}
                    {b.BreachDate && (
                      <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>Breach date: {b.BreachDate}</div>
                    )}
                  </div>
                </a>
              </div>
            )}
          />
        )}
      </div>

      {}
      <SH label="KNOWN EXPLOITED VULNERABILITIES" extra={<span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>CISA KEV</span>} />
      <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,255,204,0.1)', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
        {sortedCVEs.length === 0 && !loading && (
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' as const, padding: '16px 0' }}>No CVEs loaded</div>
        )}
        {sortedCVEs.length > 0 && (
          <VirtualList
            items={sortedCVEs}
            height={280}
            estimateSize={42}
            renderItem={(cve: any) => {
              const sevColor = SEVERITY_COLOR[cve.severity] ?? '#94a3b8';
              return (
                <a href={`https://www.cve.org/CVERecord?id=${cve.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'flex-start', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: '10px' }}>
                  <span style={{ flexShrink: 0, fontSize: '8px', color: sevColor, padding: '2px 6px', background: `${sevColor}15`, border: `1px solid ${sevColor}40`, borderRadius: '4px', marginTop: '1px' }}>{cve.severity ?? '?'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '9px', color: accent, letterSpacing: '0.1em', marginBottom: '2px' }}>{cve.id}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{cve.description}</div>
                  </div>
                </a>
              );
            }}
          />
        )}
      </div>

      <TabFooter loading={loading} lastUpdated={lastUpdated} sources={['HIBP','CISA']} onReload={refetch} />
    </div>
  );
}
