import React from 'react';

const SOURCE_COLORS: Record<string, string> = {
  GDELT:          '#38bdf8',
  'World Bank':   '#4ade80',
  USGS:           '#fb923c',
  WHO:            '#a78bfa',
  'disease.sh':   '#f87171',
  OpenAQ:         '#34d399',
  Wikipedia:      '#fbbf24',
  Reddit:         '#ff6600',
  HIBP:           '#fb923c',
  CISA:           '#f87171',
  NASA:           '#38bdf8',
  RestCountries:  '#34d399',
  ClinicalTrials: '#38bdf8',
  OpenFDA:        '#fb923c',
  OpenSky:        '#94a3b8',
  'Open-Notify':  '#4ade80',
  'Exchange Rates': '#fbbf24',
  'NASA FIRMS':   '#f97316',
};

function timeAgoStr(d: Date): string {
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

interface TabFooterProps {
  loading: boolean;
  lastUpdated: Date | null;
  sources: string[];
  onReload: () => void;
}

export default function TabFooter({ loading, lastUpdated, sources, onReload }: TabFooterProps) {
  return (
    <div style={{
      marginTop: '24px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      paddingTop: '14px',
      fontFamily: 'monospace',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
          {lastUpdated ? `Updated ${timeAgoStr(lastUpdated)}` : loading ? 'Fetching...' : 'Not yet loaded'}
        </span>
        <button
          onClick={onReload}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '5px 10px',
            background: loading ? 'rgba(0,255,204,0.03)' : 'rgba(0,255,204,0.08)',
            border: '1px solid rgba(0,255,204,0.2)',
            borderRadius: '6px',
            color: loading ? 'rgba(0,255,204,0.4)' : '#00ffcc',
            fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'monospace',
            transition: 'all 0.2s',
          }}
        >
          <span style={{
            display: 'inline-block',
            animation: loading ? 'tabSpin 1s linear infinite' : 'none',
            fontSize: '11px', lineHeight: 1,
          }}>⟳</span>
          {loading ? 'REFRESHING...' : 'RELOAD'}
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4px', alignItems: 'center' }}>
        <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.22)', marginRight: '2px' }}>Sources:</span>
        {sources.map(s => (
          <span
            key={s}
            style={{
              fontSize: '8px', padding: '2px 6px', borderRadius: '4px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: SOURCE_COLORS[s] ?? 'rgba(255,255,255,0.4)',
              letterSpacing: '0.04em',
            }}
          >{s}</span>
        ))}
      </div>
    </div>
  );
}
