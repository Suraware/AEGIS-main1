import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCountryFull, fetchEconomicData } from '../../services/globalDataService';
import { queryClient } from '../../lib/queryClient';
import TabFooter from './TabFooter';

interface OverviewTabProps {
  country: { name: string; code: string };
  onTabChange: (tabId: string) => void;
}

export default function OverviewTab({ country, onTabChange }: OverviewTabProps) {
  const { data, isFetching: loading, dataUpdatedAt, refetch } = useQuery({
    queryKey: ['overview', country.code],
    queryFn: async () => {
      const [fullRes, econRes, wikiRes] = await Promise.allSettled([
        fetchCountryFull(country.code, country.name),
        fetchEconomicData(country.code),
        fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(country.name)}`)
          .then(r => r.json()),
      ]);
      return {
        countryData: fullRes.status === 'fulfilled' ? fullRes.value : null,
        econData:    econRes.status === 'fulfilled' ? econRes.value : null,
        wikiExtract: wikiRes.status === 'fulfilled' ? (wikiRes.value?.extract ?? '') : '',
      };
    },
    enabled: !!country.code,
  });

  useEffect(() => {
    const borders = data?.countryData?.restCountries?.borders ?? [];
    borders.slice(0, 3).forEach((neighborCode: string) => {
      queryClient.prefetchQuery({
        queryKey: ['overview', neighborCode],
        queryFn: () => fetchCountryFull(neighborCode, neighborCode),
        staleTime: 10 * 60 * 1000,
      });
    });
  }, [data?.countryData?.restCountries?.borders]);

  const lastUpdated = dataUpdatedAt > 0 ? new Date(dataUpdatedAt) : null;
  const countryData = data?.countryData ?? null;
  const econData    = data?.econData ?? null;
  const wikiExtract = data?.wikiExtract ?? '';

  const rc = countryData?.restCountries;
  const wb = countryData?.worldBank;

  const gdp = (econData?.gdpPerCapita ?? [])[0]?.value as number | undefined;
  const le  = (econData?.lifeExpectancy ?? [])[0]?.value as number | undefined;
  const gdpFmt = gdp ? `$${gdp.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—';
  const leFmt  = le  ? `${le.toFixed(1)} yrs` : '—';

  const capital   = rc?.capital?.[0] ?? wb?.capitalCity ?? '—';
  const population = rc?.population ? rc.population.toLocaleString() : '—';
  const region    = rc ? `${rc.region}${rc.subregion ? ' / ' + rc.subregion : ''}` : wb?.region?.value ?? '—';
  const currObj   = rc?.currencies ? (Object.values(rc.currencies)[0] as any) : null;
  const currency  = currObj ? `${currObj.name}${currObj.symbol ? ' (' + currObj.symbol + ')' : ''}` : '—';
  const language  = rc?.languages ? (Object.values(rc.languages)[0] as string) : '—';
  const timezone  = rc?.timezones?.[0] ?? '—';
  const flagUrl   = rc?.flags?.png ?? `https://flagcdn.com/w160/${country.code.toLowerCase()}.png`;
  const coatUrl   = rc?.coatOfArms?.png ?? '';

  const facts = [
    { icon: '🏛️', label: 'Capital',      value: capital },
    { icon: '👥', label: 'Population',   value: population },
    { icon: '🌍', label: 'Region',       value: region },
    { icon: '💱', label: 'Currency',     value: currency },
    { icon: '🗣️', label: 'Language',     value: language },
    { icon: '📊', label: 'GDP / Capita', value: gdpFmt },
    { icon: '❤️', label: 'Life Exp.',    value: leFmt },
    { icon: '🕐', label: 'Timezone',     value: timezone },
  ];

  const summaryBadges = [
    { label: 'Cyber Incidents', count: 0, color: '#f87171', tab: 'cyber'    },
    { label: 'Data Breaches',   count: 0, color: '#fb923c', tab: 'breaches' },
    { label: 'Clinical Trials', count: 0, color: '#38bdf8', tab: 'health'   },
    { label: 'Seismic Events',  count: 0, color: '#facc15', tab: 'osint'    },
  ];

  const quickLinks = [
    { label: 'Google Maps', url: `https://www.google.com/maps/place/${encodeURIComponent(country.name)}` },
    { label: 'Wikipedia',   url: `https://en.wikipedia.org/wiki/${encodeURIComponent(country.name)}` },
    { label: 'WHO Profile', url: `https://www.who.int/countries/${country.code.toLowerCase()}` },
    { label: 'World Bank',  url: `https://data.worldbank.org/country/${country.code.toUpperCase()}` },
  ];

  const accent     = '#00ffcc';
  const cardBg     = 'rgba(255,255,255,0.04)';
  const cardBorder = '1px solid rgba(0,255,204,0.12)';

  return (
    <div style={{ padding: '16px 20px 24px', fontFamily: 'monospace' }}>

      {}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, background: cardBg, border: cardBorder, borderRadius: '8px', padding: '12px' }}>
          <img src={flagUrl} alt="flag" style={{ height: '32px', borderRadius: '3px', boxShadow: '0 2px 8px rgba(0,0,0,0.4)', flexShrink: 0 }} />
          {coatUrl && <img src={coatUrl} alt="coat of arms" style={{ height: '36px', objectFit: 'contain', flexShrink: 0 }} />}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{country.name}</div>
            {wb?.incomeLevel?.value && (
              <div style={{ fontSize: '8px', color: 'rgba(0,255,204,0.65)', letterSpacing: '0.15em', marginTop: '2px' }}>
                {wb.incomeLevel.value.toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={loading}
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px', background: 'rgba(0,255,204,0.08)', border: '1px solid rgba(0,255,204,0.2)', borderRadius: '6px', color: loading ? 'rgba(0,255,204,0.4)' : accent, fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'monospace', transition: 'all 0.2s' }}
        >
          <span style={{ display: 'inline-block', animation: loading ? 'tabSpin 1s linear infinite' : 'none', fontSize: '11px', lineHeight: 1 }}>⟳</span>
          {loading ? 'LOADING...' : 'RELOAD'}
        </button>
      </div>

      {}
      {wikiExtract && (
        <>
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(0,255,204,0.6)', textTransform: 'uppercase' as const, marginBottom: '8px' }}>─── INTELLIGENCE OVERVIEW</div>
          <div style={{ fontSize: '11px', lineHeight: '1.75', color: 'rgba(255,255,255,0.62)', marginBottom: '20px', padding: '12px 14px', background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.12)', borderRadius: '8px', borderLeft: '3px solid rgba(56,189,248,0.4)' }}>
            {wikiExtract.slice(0, 520)}{wikiExtract.length > 520 ? '…' : ''}
          </div>
        </>
      )}

      {}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(0,255,204,0.6)', textTransform: 'uppercase' as const }}>─── COUNTRY PROFILE</span>
        {loading && <span style={{ fontSize: '9px', color: 'rgba(0,255,204,0.35)', letterSpacing: '0.1em' }}>QUERYING...</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
        {facts.map(({ icon, label, value }) => (
          <div key={label} style={{ background: cardBg, border: cardBorder, borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '18px', marginBottom: '4px' }}>{icon}</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginBottom: '3px' }}>{label}</div>
            <div style={{ fontSize: '12px', color: '#fff', fontWeight: 600, lineHeight: 1.3, wordBreak: 'break-word' as const }}>{value}</div>
          </div>
        ))}
      </div>

      {}
      <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(0,255,204,0.6)', textTransform: 'uppercase' as const, marginBottom: '10px' }}>─── INTELLIGENCE SUMMARY</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
        {summaryBadges.map(({ label, count, color, tab }) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{ background: `${color}10`, border: `1px solid ${color}40`, borderRadius: '8px', padding: '10px 4px', cursor: 'pointer', textAlign: 'center' as const, transition: 'all 0.2s ease', fontFamily: 'monospace' }}
            onMouseEnter={e => { e.currentTarget.style.background = `${color}20`; e.currentTarget.style.borderColor = `${color}80`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${color}10`; e.currentTarget.style.borderColor = `${color}40`; }}
          >
            <div style={{ fontSize: '16px', fontWeight: 700, color, marginBottom: '3px' }}>{count}</div>
            <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em', lineHeight: 1.3 }}>{label.toUpperCase()}</div>
          </button>
        ))}
      </div>

      {}
      <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(0,255,204,0.6)', textTransform: 'uppercase' as const, marginBottom: '10px' }}>─── OPEN SOURCE RESOURCES</div>
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px' }}>
        {quickLinks.map(({ label, url }) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '7px 14px', background: cardBg, border: '1px solid rgba(0,255,204,0.15)', borderRadius: '20px', color: accent, fontSize: '11px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s ease', fontFamily: 'monospace' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,255,204,0.10)'; e.currentTarget.style.borderColor = 'rgba(0,255,204,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = cardBg; e.currentTarget.style.borderColor = 'rgba(0,255,204,0.15)'; }}
          >↗ {label}</a>
        ))}
      </div>

      <TabFooter loading={loading} lastUpdated={lastUpdated} sources={['RestCountries', 'World Bank', 'Wikipedia']} onReload={refetch} />
    </div>
  );
}
