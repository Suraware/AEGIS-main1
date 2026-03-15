import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchOSINTData, fetchMilitaryData } from '../../services/globalDataService';
import TabFooter from './TabFooter';

interface LinksTabProps {
  country: { name: string; code: string };
}

function SH({ label }: { label: string }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <span style={{ fontFamily: 'monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(0,255,204,0.6)', textTransform: 'uppercase' as const }}>─── {label}</span>
    </div>
  );
}

type LinkEntry = { label: string; url: string; desc: string; icon: string };

function LinkGrid({ links, borderColor }: { links: LinkEntry[]; borderColor?: string }) {
  const cardBg = 'rgba(255,255,255,0.04)';
  const cardBorder = borderColor ?? '1px solid rgba(255,255,255,0.06)';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px' }}>
      {links.map((l, i) => (
        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', padding: '10px', background: cardBg, border: cardBorder, borderRadius: '8px', display: 'block' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ fontSize: '18px' }}>{l.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#e2e8f0', fontWeight: 700 }}>{l.label}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{l.desc}</div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

export default function LinksTab({ country }: LinksTabProps) {
  const { data, isFetching: loading, dataUpdatedAt, refetch } = useQuery({
    queryKey: ['links', country.code],
    queryFn: async () => {
      const [osintRes, milRes] = await Promise.allSettled([
        fetchOSINTData(country.code, country.name, 0, 0),
        fetchMilitaryData(country.code, country.name, 0, 0, []),
      ]);
      return {
        osintLinks: osintRes.status === 'fulfilled' ? (osintRes.value.osintLinks || {}) : {},
        milLinks:   milRes.status === 'fulfilled'   ? (milRes.value.militaryLinks || {}) : {},
      };
    },
    enabled: !!country.code,
  });

  const lastUpdated = dataUpdatedAt > 0 ? new Date(dataUpdatedAt) : null;
  const osintLinks: any = data?.osintLinks ?? {};
  const milLinks:   any = data?.milLinks   ?? {};

  const n = country.name;
  const c = country.code.toUpperCase();
  const cL = country.code.toLowerCase();

  
  const cyberLinks: LinkEntry[] = [
    { label: 'VirusTotal',  url: osintLinks.virustotal  ?? `https://www.virustotal.com/gui/search/${encodeURIComponent(n)}`, desc: 'Threat analysis platform',  icon: '🦠' },
    { label: 'crt.sh',      url: osintLinks.crtSh       ?? `https://crt.sh/?q=.${cL}`,                                       desc: 'Certificate Transparency',  icon: '🔐' },
    { label: 'ipinfo.io',   url: osintLinks.ipinfo      ?? `https://ipinfo.io/${c}`,                                         desc: 'IP Intelligence',           icon: '🌐' },
    { label: 'Wayback',     url: osintLinks.wayback     ?? `https://web.archive.org/web/*/${encodeURIComponent(n)}`, desc: 'Web Archive', icon: '📜' },
  ];

  const intelLinks: LinkEntry[] = [];
  const govLinks: LinkEntry[] = [];
  const openLinks: LinkEntry[] = [];
  const accent = '#00ffcc';

  return (
    <div style={{ padding: '16px 20px 24px', fontFamily: 'monospace' }}>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button onClick={() => refetch()} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: 'rgba(0,255,204,0.08)', border: '1px solid rgba(0,255,204,0.2)', borderRadius: '6px', color: loading ? 'rgba(0,255,204,0.4)' : accent, fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'monospace' }}>
          <span style={{ display: 'inline-block', animation: loading ? 'tabSpin 1s linear infinite' : 'none', fontSize: '11px', lineHeight: 1 }}>⟳</span>
          {loading ? 'LOADING...' : 'RELOAD'}
        </button>
      </div>

      <SH label="CYBER & NETWORK INTEL" />
      <LinkGrid links={cyberLinks} borderColor="rgba(56,189,248,0.15)" />

      <SH label="INTELLIGENCE & SECURITY" />
      <LinkGrid links={intelLinks} borderColor="rgba(248,113,113,0.15)" />

      <SH label="GOVERNMENT & OFFICIAL" />
      <LinkGrid links={govLinks} borderColor="rgba(74,222,128,0.15)" />

      <SH label="OPEN-SOURCE INTELLIGENCE" />
      <LinkGrid links={openLinks} />

      <TabFooter loading={loading} lastUpdated={lastUpdated} sources={['RestCountries','GDELT','CISA','Wikipedia']} onReload={refetch} />
    </div>
  );
}
