import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchOSINTData, fetchCountryFull } from '../../services/globalDataService';
import TabFooter from './TabFooter';
import VirtualList from '../VirtualList';

interface OsintTabProps {
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

export default function OsintTab({ country }: OsintTabProps) {
  const { data, isFetching: loading, dataUpdatedAt, refetch } = useQuery({
    queryKey: ['osint', country.code],
    queryFn: async () => {
      let lat = 0, lng = 0;
      const fullRes = await Promise.allSettled([fetchCountryFull(country.code, country.name)]);
      if (fullRes[0].status === 'fulfilled') {
        const latlng = fullRes[0].value.restCountries?.latlng;
        if (latlng) { lat = latlng[0]; lng = latlng[1]; }
      }
      const osint = await fetchOSINTData(country.code, country.name, lat, lng);
      return { ...osint, countryLat: lat, countryLng: lng };
    },
    enabled: !!country.code,
  });

  const lastUpdated   = dataUpdatedAt > 0 ? new Date(dataUpdatedAt) : null;
  const wikiSummary   = data?.wikiSummary   ?? null;
  const wikiEdits     = data?.wikiEdits     ?? [];
  const wikiSearch    = data?.wikiSearch    ?? [];
  const reddit        = data?.reddit        ?? [];
  const gdeltTimeline = data?.gdeltTimeline ?? [];
  const gdeltNews     = data?.gdeltNews     ?? [];
  const earthquakes   = data?.earthquakes   ?? [];
  const wildfires     = data?.wildfires     ?? [];
  const issPosition   = data?.issPosition   ?? null;
  const issCrew       = data?.issCrew       ?? [];
  const osintLinks: any = data?.osintLinks  ?? {};
  const countryLat    = data?.countryLat    ?? 0;
  const countryLng    = data?.countryLng    ?? 0;

  const accent     = '#00ffcc';
  const cardBg     = 'rgba(255,255,255,0.04)';
  const cardBorder = '1px solid rgba(0,255,204,0.12)';

  
  const chartData = gdeltTimeline.map((pt: any) => ({
    label: pt.date?.slice(5) ?? '',
    value: pt.value ?? 0,
  }));

  
  const issOverhead = issPosition
    ? Math.abs(issPosition.lat - countryLat) < 15 && Math.abs(issPosition.lng - countryLng) < 15
    : false;

  
  const dynLinks: { label: string; url: string; icon: string }[] = [
    { label: 'VirusTotal',   url: osintLinks.virustotal   ?? `https://www.virustotal.com/gui/domain/${country.name.toLowerCase().replace(/\s+/g, '')}.gov`,   icon: '🔍' },
    { label: 'crt.sh',       url: osintLinks.crtSh        ?? `https://crt.sh/?q=.${country.code.toLowerCase()}`,                                               icon: '🔐' },
    { label: 'ipinfo.io',    url: osintLinks.ipinfo       ?? `https://ipinfo.io/${country.code.toUpperCase()}`,                                                 icon: '🌐' },
    { label: 'Wayback',      url: osintLinks.wayback      ?? `https://web.archive.org/web/*/${encodeURIComponent(country.name)}`, icon: '📜' },
  ];

  return (
    <div style={{ padding: '16px 20px 24px', fontFamily: 'monospace' }}>

      {wikiSummary?.extract && (
        <>
          <SH label="INTELLIGENCE OVERVIEW" extra={<span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>WIKIPEDIA</span>} />
          <div style={{ fontSize: '11px', lineHeight: '1.7', color: 'rgba(255,255,255,0.65)', marginBottom: '20px', padding: '12px', background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.12)', borderRadius: '8px' }}>
            {wikiSummary.extract.slice(0, 500)}{wikiSummary.extract.length > 500 ? '...' : ''}
          </div>
        </>
      )}

      {}
      {chartData.length > 0 && (
        <>
          <SH label="MEDIA VOLUME TIMELINE" extra={<span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>GDELT</span>} />
          <div style={{ background: cardBg, border: cardBorder, borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={chartData}>
                <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid rgba(0,255,204,0.2)', borderRadius: '6px', fontFamily: 'monospace', fontSize: '10px', color: '#e2e8f0' }} />
                <Line type="monotone" dataKey="value" stroke={accent} strokeWidth={1.5} dot={false}
                  style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {}
      <SH label="GDELT NEWS ARTICLES" extra={<span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>GDELT</span>} />
      <div style={{ background: 'rgba(0,0,0,0.3)', border: cardBorder, borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
        {gdeltNews.length === 0 && !loading && (
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' as const, padding: '16px 0' }}>No articles found</div>
        )}
        {gdeltNews.length > 0 && (
          <VirtualList
            items={gdeltNews}
            height={200}
            estimateSize={36}
            renderItem={(n: any) => (
              <a href={n.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', padding: '7px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '10px', color: '#e2e8f0', lineHeight: 1.4, marginBottom: '2px' }}>{n.title}</div>
                <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)' }}>{n.domain ?? ''} · {n.seendate ? new Date(n.seendate).toLocaleDateString() : ''}</div>
              </a>
            )}
          />
        )}
      </div>

      {}
      <SH label="WIKIPEDIA EDIT ACTIVITY" extra={<span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>MediaWiki</span>} />
      <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(56,189,248,0.12)', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
        {wikiEdits.length === 0 && !loading && (
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' as const, padding: '14px 0' }}>No recent edits</div>
        )}
        {wikiEdits.length > 0 && (
          <VirtualList
            items={wikiEdits}
            height={180}
            estimateSize={32}
            renderItem={(edit: any) => (
              <div style={{ padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', gap: '8px', fontSize: '9px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#38bdf8', flexShrink: 0 }}>{edit.user ?? 'Anonymous'}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)', flex: 1 }}>{edit.comment || '(no summary)'}</span>
                  <span style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>{edit.timestamp ? new Date(edit.timestamp).toLocaleDateString() : ''}</span>
                </div>
              </div>
            )}
          />
        )}
      </div>

      {}
      {wikiSearch.length > 0 && (
        <>
          <SH label="WIKIPEDIA ARTICLES" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '20px' }}>
            {wikiSearch.slice(0, 6).map((a: any, i: number) => (
              <a key={i} href={`https://en.wikipedia.org/wiki/${encodeURIComponent(a.title ?? '')}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', padding: '8px 10px', background: cardBg, border: cardBorder, borderRadius: '6px', display: 'block', transition: 'border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,204,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,255,204,0.12)'; }}
              >
                <div style={{ fontSize: '10px', color: '#e2e8f0', lineHeight: 1.4, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{a.title}</div>
                {a.snippet && <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }} dangerouslySetInnerHTML={{ __html: a.snippet + '...' }} />}
              </a>
            ))}
          </div>
        </>
      )}

      {}
      <SH label="REDDIT SOCIAL SIGNAL" extra={<span style={{ fontSize: '9px', color: '#ff6600' }}>r/worldnews</span>} />
      <div style={{ marginBottom: '20px' }}>
        {reddit.length === 0 && !loading && (
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' as const, padding: '14px', background: cardBg, border: cardBorder, borderRadius: '8px' }}>No Reddit posts found</div>
        )}
        {reddit.length > 0 && (
          <VirtualList
            items={reddit}
            height={320}
            estimateSize={72}
            renderItem={(post: any) => (
              <div style={{ paddingBottom: '6px' }}>
                <a href={post.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ background: cardBg, border: '1px solid rgba(255,102,0,0.15)', borderRadius: '8px', padding: '9px 12px', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,102,0,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,102,0,0.15)'; }}
                  >
                    <div style={{ fontSize: '10px', color: '#e2e8f0', lineHeight: 1.4, marginBottom: '5px' }}>{post.title}</div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
                      <span style={{ color: '#ff6600' }}>r/{post.subreddit}</span>
                      <span>▲ {post.score?.toLocaleString() ?? 0}</span>
                      <span>💬 {post.comments?.toLocaleString() ?? 0}</span>
                      <span style={{ marginLeft: 'auto' }}>{post.created ? new Date(post.created * 1000).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                </a>
              </div>
            )}
          />
        )}
      </div>

      {}
      {earthquakes.length > 0 && (
        <>
          <SH label="SEISMIC EVENTS" extra={<span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>USGS</span>} />
          <div style={{ marginBottom: '20px' }}>
            {earthquakes.slice(0, 5).map((q: any, i: number) => {
              const mag   = q.magnitude ?? 0;
              const mCol  = mag >= 6.5 ? '#f87171' : mag >= 5 ? '#fbbf24' : '#94a3b8';
              return (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '6px 10px', background: cardBg, borderRadius: '6px', marginBottom: '5px', border: `1px solid ${mCol}20` }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: mCol, flexShrink: 0, minWidth: '30px' }}>M{mag.toFixed(1)}</span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', flex: 1 }}>{q.place ?? '—'}</span>
                  <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{q.time ? new Date(q.time).toLocaleDateString() : ''}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {}
      {wildfires.length > 0 && (
        <>
          <SH label="WILDFIRE DETECTIONS" extra={<span style={{ fontSize: '9px', color: '#fb923c' }}>NASA FIRMS</span>} />
          <div style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: '8px', padding: '14px', marginBottom: '20px', textAlign: 'center' as const }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#fb923c', marginBottom: '4px' }}>{wildfires.length.toLocaleString()}</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em' }}>THERMAL ANOMALIES DETECTED (48H)</div>
          </div>
        </>
      )}

      {}
      {issPosition && (
        <>
          <SH label="ISS POSITION" extra={
            issOverhead
              ? <span style={{ fontSize: '9px', color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '4px', padding: '2px 8px' }}>OVERHEAD</span>
              : <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>Open-Notify</span>
          } />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            {[
              { label: 'Latitude',   value: `${issPosition.lat?.toFixed(2) ?? '—'}°` },
              { label: 'Longitude',  value: `${issPosition.lng?.toFixed(2) ?? '—'}°` },
              { label: 'Overhead',   value: issOverhead ? 'YES' : 'NO' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: cardBg, border: cardBorder, borderRadius: '6px', padding: '10px', textAlign: 'center' as const }}>
                <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: label === 'Overhead' ? (issOverhead ? '#4ade80' : '#94a3b8') : accent }}>{value}</div>
              </div>
            ))}
          </div>
          {issCrew.length > 0 && (
            <div style={{ background: cardBg, border: cardBorder, borderRadius: '8px', padding: '10px 12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', marginBottom: '8px' }}>CURRENT CREW</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '5px' }}>
                {issCrew.map((c: any, i: number) => (
                  <span key={i} style={{ fontSize: '9px', padding: '3px 8px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '4px', color: '#4ade80' }}>👩‍🚀 {c.name ?? c}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {}
      <SH label="OSINT TOOL LINKS" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '20px' }}>
        {dynLinks.map((l, i) => (
          <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: cardBg, border: cardBorder, borderRadius: '6px', transition: 'border-color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,204,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,255,204,0.12)'; }}
          >
            <span style={{ fontSize: '14px' }}>{l.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: accent }}>{l.label}</span>
          </a>
        ))}
      </div>

      <TabFooter loading={loading} lastUpdated={lastUpdated} sources={['Wikipedia','Reddit','GDELT','USGS','NASA FIRMS','Open-Notify','Exchange Rates','OpenAQ']} onReload={refetch} />
    </div>
  );
}
