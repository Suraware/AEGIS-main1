import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useGlobeStore } from '../stores/useGlobeStore';
import { cachedFetch } from '../lib/fetchCache';
import OverviewTab from './tabs/OverviewTab';
import CyberTab from './tabs/CyberTab';
import BreachesTab from './tabs/BreachesTab';
import MilitaryTab from './tabs/MilitaryTab';
import OsintTab from './tabs/OsintTab';
import SatellitesTab from './tabs/SatellitesTab';
import NewsTab from './tabs/NewsTab';
import LinksTab from './tabs/LinksTab';

const TABS = [
  { id: 'overview',   icon: '🌍',  label: 'Overview'  },
  { id: 'cyber',      icon: '💻',  label: 'Cyber'     },
  { id: 'breaches',   icon: '🔓',  label: 'Breaches'  },
  { id: 'military',   icon: '🎯',  label: 'Military'  },
  { id: 'osint',      icon: '🔍',  label: 'OSINT'     },
  { id: 'satellites', icon: '🛰️', label: 'Sats'      },
  { id: 'news',       icon: '📰',  label: 'News'      },
  { id: 'links',      icon: '🔗',  label: 'Links'     },
];

interface Country {
  name: string;
  code: string;
}

interface CountryPanelProps {
  country: Country | null;
  onClose: () => void;
}


function useAnimatedCounter(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    let cancelled = false;
    const startTime = performance.now();
    const tick = (now: number) => {
      if (cancelled) return;
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => { cancelled = true; };
  }, [target]);
  return value;
}


function Sparkline({ data, color = '#00ffcc' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 28;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block', flexShrink: 0 }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5"
        style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
    </svg>
  );
}


function getThreatLevel(active: number, aqiAvg: number) {
  const score = (active > 500000 ? 5 : active > 100000 ? 4 : active > 50000 ? 3 : active > 10000 ? 2 : 1)
    + (aqiAvg > 150 ? 3 : aqiAvg > 100 ? 2 : aqiAvg > 50 ? 1 : 0);
  if (score >= 7) return { label: 'CRITICAL', color: '#f87171', bg: 'rgba(248,113,113,0.12)' };
  if (score >= 5) return { label: 'HIGH', color: '#fb923c', bg: 'rgba(251,146,60,0.12)' };
  if (score >= 3) return { label: 'MODERATE', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
  if (score >= 2) return { label: 'LOW', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' };
  return { label: 'MINIMAL', color: '#22d3ee', bg: 'rgba(34,211,238,0.12)' };
}


function generateSitRep(countryName: string, covid: any, aqiAvg: number, countryInfo: any): string {
  const parts: string[] = [];
  if (covid && !covid.message) {
    const active = covid.active || 0;
    const deathRate = covid.deaths && covid.cases ? ((covid.deaths / covid.cases) * 100).toFixed(2) : null;
    if (active > 100000) {
      parts.push(`${countryName} is experiencing an elevated public health burden with ${active.toLocaleString()} active COVID-19 cases currently under monitoring.`);
    } else if (active > 0) {
      parts.push(`Active COVID-19 surveillance in ${countryName} records ${active.toLocaleString()} ongoing cases with containment protocols in effect.`);
    }
    if (deathRate) parts.push(`Cumulative case fatality rate stands at ${deathRate}%, with ${(covid.deaths || 0).toLocaleString()} total reported fatalities.`);
    if (covid.todayCases > 500) parts.push(`FLASH: ${covid.todayCases.toLocaleString()} new cases reported in the last 24-hour reporting period.`);
  }
  if (aqiAvg > 100) {
    parts.push(`Atmospheric analysis indicates degraded AQI of ${Math.round(aqiAvg)} μg/m³, posing compounding respiratory risk to vulnerable populations.`);
  } else if (aqiAvg > 0) {
    parts.push(`Ambient air quality index at ${Math.round(aqiAvg)} μg/m³ — within acceptable operational parameters.`);
  }
  if (countryInfo?.population) {
    parts.push(`Total monitored population: ${countryInfo.population.toLocaleString()} across ${countryInfo.region || 'assigned region'}.`);
  }
  if (parts.length === 0) parts.push(`No critical health events flagged for ${countryName} at this time. Routine surveillance active across all monitoring channels.`);
  return parts.join(' ');
}

const FEED_EVENTS = [
  'WHO surveillance feed nominal',
  'ECDC data sync complete',
  'Air quality sensor array online',
  'COVID stats refreshed from disease.sh',
  'RestCountries API query success',
  'OpenAQ monitoring active',
  'Clinical trials registry updated',
  'Satellite telemetry nominal',
  'Intelligence brief auto-refresh scheduled',
  'Border crossing data packets received',
  'Health ministry comm-link established',
  'Biometric surveillance feeds active',
  'Fetching Osint APIs',
  'Querying news sources',
  'Updating breach databases',
];

function SectionHeader({ label, extra }: { label: string; extra?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
      <span style={{ fontFamily: 'monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.25em', color: 'rgba(0,255,204,0.6)', textTransform: 'uppercase' as const }}>
        ─── {label}
      </span>
      {extra && <span style={{ marginLeft: 'auto' }}>{extra}</span>}
    </div>
  );
}


export default function CountryPanel({ country, onClose }: CountryPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [covidData, setCovidData] = useState<any>(null);
  const [countryInfo, setCountryInfo] = useState<any>(null);
  const [airQuality, setAirQuality] = useState<any[]>([]);
  const [clinicalTrials, setClinicalTrials] = useState<number>(0);
  const [liveFeed, setLiveFeed] = useState<{ time: string; msg: string }[]>([]);
  const [utcTime, setUtcTime] = useState('');
  const [progressActive, setProgressActive] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const population = useAnimatedCounter(countryInfo?.population ?? 0);
  const activeCovidCount = useAnimatedCounter(covidData?.active ?? 0);
  const deathsPerMillion = useAnimatedCounter(covidData?.deathsPerOneMillion ?? 0);
  const trialsCount = useAnimatedCounter(clinicalTrials);

  const aqiAvg = useMemo(() =>
    airQuality.length > 0
      ? airQuality.flatMap((s: any) => s.measurements || [])
          .filter((m: any) => m.parameter === 'pm25')
          .reduce((sum: number, m: any, _: any, arr: any[]) => sum + m.value / arr.length, 0)
      : 0,
    [airQuality]
  );
  const aqiDisplay = useAnimatedCounter(Math.round(aqiAvg));

  const threat = getThreatLevel(covidData?.active ?? 0, aqiAvg);
  const sitRep = generateSitRep(country?.name ?? '', covidData, aqiAvg, countryInfo);

  const activeSparkline = useMemo(
    () => Array.from({ length: 10 }, (_, i) =>
      Math.max(0, (covidData?.active ?? 0) * (0.8 + Math.sin(i) * 0.2 + Math.random() * 0.1))),
    [covidData?.active]  
  );
  const aqiSparkline = useMemo(
    () => Array.from({ length: 10 }, (_, i) =>
      Math.max(0, aqiAvg * (0.7 + Math.cos(i * 0.8) * 0.3 + Math.random() * 0.1))),
    [aqiAvg]  
  );

  
  useEffect(() => {
    const tick = () => setUtcTime(new Date().toUTCString().slice(17, 25) + ' UTC');
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  
  useEffect(() => {
    if (!country) return;
    setProgressActive(false);
    const id = requestAnimationFrame(() => setProgressActive(true));
    return () => cancelAnimationFrame(id);
  }, [country?.code]);

  
  useEffect(() => {
    if (!country) return;
    setCovidData(null);
    setCountryInfo(null);
    setAirQuality([]);
    setClinicalTrials(0);

    cachedFetch(`https://restcountries.com/v3.1/alpha/${country.code}`, {}, 24 * 60 * 60 * 1000)
      .then((d: any[]) => setCountryInfo(d[0])).catch(() => {});

    cachedFetch(`https://disease.sh/v3/covid-19/countries/${country.code}`, {}, 5 * 60 * 1000)
      .then((d: any) => {
        setCovidData(d);
        if (d?.active > 10000) {
          useNotificationStore.getState().addNotification({
            type: 'warning',
            title: 'High Active Cases',
            message: `${country.name} has ${(d.active as number).toLocaleString()} active COVID cases`,
            country: country.name,
            countryCode: country.code,
          });
        }
      }).catch(() => {});

    cachedFetch(`https://api.openaq.org/v2/latest?country=${country.code.toUpperCase()}&limit=5`, {}, 5 * 60 * 1000)
      .then((d: any) => setAirQuality(d.results || [])).catch(() => {});

    cachedFetch(
      `https://clinicaltrials.gov/api/query/full_studies?expr=${encodeURIComponent(country.name)}&max_rnk=1&fmt=json`,
      {},
      60 * 60 * 1000
    ).then((d: any) => setClinicalTrials(d?.FullStudiesResponse?.NStudiesFound ?? 0)).catch(() => {});
  }, [country?.code]);

  
  useEffect(() => {
    if (!country) return;
    const initialFeed = Array.from({ length: 4 }, (_, i) => ({
      time: new Date(Date.now() - (3 - i) * 8000).toISOString().slice(11, 19),
      msg: FEED_EVENTS[i % FEED_EVENTS.length],
    }));
    setLiveFeed(initialFeed);
    let idx = 4;
    const id = setInterval(() => {
      const entry = { time: new Date().toISOString().slice(11, 19), msg: FEED_EVENTS[idx % FEED_EVENTS.length] };
      idx++;
      setLiveFeed(prev => [...prev.slice(-12), entry]);
    }, 4000);
    return () => clearInterval(id);
  }, [country?.code]);

  
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [liveFeed]);

  if (!country) return null;

  const lat = countryInfo?.latlng?.[0] ?? 0;
  const lng = countryInfo?.latlng?.[1] ?? 0;
  const countrySlug = country.name.toLowerCase().replace(/\s+/g, '-');
  const countryEncoded = encodeURIComponent(country.name);
  const borderCount = countryInfo?.borders?.length ?? 0;
  const hasCoastline = countryInfo?.landlocked === false;

  const INTEL_LINKS = [
    { label: 'Google Earth', url: `https://earth.google.com/web/search/${countryEncoded}`, icon: '🌍' },
    { label: 'WHO Profile', url: `https://www.who.int/countries/${country.code.toLowerCase()}`, icon: '🏥' },
    { label: 'UN Data Portal', url: `https://data.un.org/en/iso/${country.code.toUpperCase()}`, icon: '🌐' },
    { label: 'World Bank', url: `https://data.worldbank.org/country/${country.code.toUpperCase()}`, icon: '🏦' },
    { label: 'CIA Factbook', url: `https://www.cia.gov/the-world-factbook/countries/${countrySlug}`, icon: '📋' },
    { label: 'Clinical Trials', url: `https://clinicaltrials.gov/search?cond=&country=${country.code.toUpperCase()}`, icon: '🔬' },
    { label: 'Air Quality Map', url: `https://www.iqair.com/${countrySlug}`, icon: '💨' },
    { label: 'Health News', url: `https://news.google.com/search?q=${countryEncoded}+health`, icon: '📰' },
  ];

  const accent = '#00ffcc';
  const border = 'rgba(0,255,204,0.12)';
  const borderHover = 'rgba(0,255,204,0.35)';
  const dimAccent = 'rgba(0,255,204,0.15)';
  const { setPanelHovered } = useGlobeStore();

  return (
    <div
      onMouseEnter={() => setPanelHovered(true)}
      onMouseLeave={() => setPanelHovered(false)}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '440px',
        maxWidth: '440px',
        height: '100vh',
        overflowX: 'hidden' as const,
        background: '#050d1a',
        borderLeft: `1px solid ${border}`,
        backdropFilter: 'blur(32px)',
        zIndex: 300,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,204,0.012) 2px, rgba(0,255,204,0.012) 4px)`,
      }}
    >
      {}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: 'Space Grotesk, sans-serif', fontSize: '96px', fontWeight: 800,
        color: 'rgba(0,255,204,0.025)', letterSpacing: '0.1em',
        pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap', zIndex: 0,
      }}>AEGIS</div>

      {}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px', cursor: 'grab', flexShrink: 0, position: 'relative', zIndex: 2 }}>
        <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }} />
      </div>

      {}
      <div style={{ height: '3px', background: 'rgba(0,255,204,0.1)', flexShrink: 0, position: 'relative', zIndex: 2 }}>
        <div style={{
          height: '100%', width: progressActive ? '100%' : '0%',
          background: `linear-gradient(to right, ${accent}, #38bdf8)`,
          boxShadow: `0 0 8px ${accent}`, transition: 'width 3s linear',
        }} />
      </div>

      {}
      <div style={{ position: 'relative', zIndex: 1, padding: '12px 20px 12px', flexShrink: 0 }}>

        {}
        <button
          onClick={onClose}
          aria-label="Close panel"
          style={{
            position: 'absolute', top: '12px', right: '12px',
            zIndex: 10,
            width: '44px', height: '44px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(15,23,42,0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '18px',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)';
            e.currentTarget.style.color = '#f87171';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >✕</button>

        {}
        <section style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171', animation: 'pulse 1.2s ease infinite' }} />
            <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, letterSpacing: '0.25em', color: '#f87171', textTransform: 'uppercase' as const }}>
              ▌ CLASSIFIED INTELLIGENCE BRIEF
            </span>
            <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: '10px', color: 'rgba(0,255,204,0.5)' }}>{utcTime}</span>
          </div>
          <div style={{ height: '1px', background: 'linear-gradient(to right, rgba(248,113,113,0.5), transparent)', marginBottom: '12px' }} />
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em' }}>SUBJECT   </span>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 700, color: '#fff' }}>{country.name}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: accent, marginLeft: '8px' }}>[{country.code.toUpperCase()}]</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em' }}>THREAT    </span>
            <span style={{
              fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em',
              color: threat.color, background: threat.bg, border: `1px solid ${threat.color}44`,
              borderRadius: '4px', padding: '2px 10px', textTransform: 'uppercase' as const,
            }}>◉ {threat.label}</span>
          </div>
          {countryInfo && (
            <div>
              <span style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em' }}>REGION    </span>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(0,255,204,0.7)', letterSpacing: '0.1em' }}>
                {(countryInfo.region || '').toUpperCase()} / {(countryInfo.subregion || '').toUpperCase()}
              </span>
            </div>
          )}
        </section>

        {}
        <img
          src={`https://flagcdn.com/w640/${country.code.toLowerCase()}.jpg`}
          alt={country.name}
          style={{ width: '100%', height: '72px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${border}`, opacity: 0.85, marginBottom: '0' }}
          onError={(e: any) => { e.target.style.display = 'none'; }}
        />
      </div>

      {}
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 16px',
        gap: '4px',
        flexShrink: 0,
        position: 'relative',
        zIndex: 2,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 12px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #38bdf8' : '2px solid transparent',
              color: activeTab === tab.id ? '#38bdf8' : '#475569',
              cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 600,
              fontSize: '11px',
              whiteSpace: 'nowrap' as const,
              transition: 'all 0.2s ease',
              flexShrink: 0,
              marginBottom: '-1px',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        {activeTab === 'overview'   && <OverviewTab   country={country} onTabChange={setActiveTab} />}
        {activeTab === 'cyber'      && <CyberTab      country={country} onTabChange={setActiveTab} />}
        {activeTab === 'breaches'   && <BreachesTab   country={country} />}
        {activeTab === 'military'   && <MilitaryTab   country={country} countryInfo={countryInfo} />}
        {activeTab === 'osint'      && <OsintTab      country={country} />}
        {activeTab === 'satellites' && <SatellitesTab country={country} countryInfo={countryInfo} />}
        {activeTab === 'news'       && <NewsTab       country={country} />}
        {activeTab === 'links'      && <LinksTab      country={country} />}
      </div>
    </div>
  );
}


function _LegacyContent_unused({ country, countryInfo, covidData, airQuality, clinicalTrials, aqiAvg, threat, sitRep, activeSparkline, aqiSparkline, liveFeed, utcTime, lat, lng, accent, border, borderHover, dimAccent, feedRef, INTEL_LINKS, borderCount, hasCoastline, countrySlug, countryEncoded, trialsCount, aqiDisplay, activeCovidCount, deathsPerMillion, population, progressActive }: any) {
  return null;
  void country; void countryInfo; void covidData; void airQuality; void clinicalTrials;
  void aqiAvg; void threat; void sitRep; void activeSparkline; void aqiSparkline;
  void liveFeed; void utcTime; void lat; void lng; void accent; void border;
  void borderHover; void dimAccent; void feedRef; void INTEL_LINKS; void borderCount;
  void hasCoastline; void countrySlug; void countryEncoded; void trialsCount;
  void aqiDisplay; void activeCovidCount; void deathsPerMillion; void population; void progressActive;
}


