import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllNews } from '../../services/globalDataService';
import TabFooter from './TabFooter';
import VirtualList from '../VirtualList';

interface NewsTabProps {
  country: { name: string; code: string };
}

const TOPIC_META: Record<string, { label: string; color: string; border: string }> = {
  conflict: { label: 'CONFLICT & SECURITY',  color: '#f87171', border: 'rgba(248,113,113,0.25)' },
  cyber:    { label: 'CYBER & TECHNOLOGY',   color: '#38bdf8', border: 'rgba(56,189,248,0.25)'  },
  health:   { label: 'HEALTH & MEDICINE',    color: '#fb923c', border: 'rgba(251,146,60,0.25)'  },
  economy:  { label: 'ECONOMY & FINANCE',    color: '#4ade80', border: 'rgba(74,222,128,0.25)'  },
  politics: { label: 'POLITICS & DIPLOMACY', color: '#3b82f6', border: 'rgba(59,130,246,0.25)'  },
  general:  { label: 'GENERAL NEWS',         color: '#94a3b8', border: 'rgba(148,163,184,0.15)' },
};
const TOPIC_ORDER = ['conflict','cyber','health','economy','politics','general'] as const;

function sentimentScore(title: string): { label: string; color: string } {
  const text = title.toLowerCase();
  const neg   = ['attack','war','kill','death','crisis','terror','bomb','threat','clash','conflict','breach','hack','sanction','sanction','disaster','fire','kill','dead','injur'];
  const pos   = ['peace','deal','agreement','aid','relief','recovery','growth','progress','improve','boost','partner','cooperat'];
  const nHits = neg.filter(w => text.includes(w)).length;
  const pHits = pos.filter(w => text.includes(w)).length;
  if (nHits > pHits) return { label: 'NEG', color: '#f87171' };
  if (pHits > nHits) return { label: 'POS', color: '#4ade80' };
  return { label: 'NEU', color: '#94a3b8' };
}

export default function NewsTab({ country }: NewsTabProps) {
  const { data: articles = [], isFetching: loading, dataUpdatedAt, refetch } = useQuery({
    queryKey: ['news', country.code],
    queryFn: () => fetchAllNews(country.name),
    enabled: !!country.code,
  });

  const lastUpdated = dataUpdatedAt > 0 ? new Date(dataUpdatedAt) : null;

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    TOPIC_ORDER.forEach(t => { map[t] = []; });
    articles.forEach(a => {
      const t = (a.topic ?? 'general') as string;
      const bucket = TOPIC_ORDER.includes(t as any) ? t : 'general';
      map[bucket].push(a);
    });
    return map;
  }, [articles]);

  const accent = '#00ffcc';

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
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' as const, marginBottom: '20px' }}>
        {TOPIC_ORDER.map(t => {
          const meta  = TOPIC_META[t];
          const count = grouped[t]?.length ?? 0;
          if (count === 0) return null;
          return (
            <span key={t} style={{ fontSize: '9px', padding: '3px 9px', borderRadius: '5px', background: `${meta.color}12`, border: `1px solid ${meta.color}40`, color: meta.color }}>
              {meta.label.split(' ')[0]}: <strong>{count}</strong>
            </span>
          );
        })}
      </div>

      {}
      {articles.length === 0 && !loading && (
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textAlign: 'center' as const, padding: '32px 0' }}>No articles found for {country.name}</div>
      )}

      {TOPIC_ORDER.map(topic => {
        const items = grouped[topic];
        if (!items || items.length === 0) return null;
        const meta = TOPIC_META[topic];
        return (
          <div key={topic} style={{ marginBottom: '24px' }}>
            {}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', borderLeft: `3px solid ${meta.color}`, paddingLeft: '10px' }}>
              <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', color: meta.color }}>{meta.label}</span>
              <span style={{ fontSize: '9px', padding: '1px 7px', background: `${meta.color}18`, border: `1px solid ${meta.color}40`, borderRadius: '4px', color: meta.color, marginLeft: 'auto' }}>{items.length}</span>
            </div>
            {}
            <div style={{ display: 'flex', flexDirection: 'column' as const }}>
              <VirtualList
                items={items}
                height={Math.min(items.length * 60, 500)}
                estimateSize={60}
                renderItem={(article: any) => {
                  const sent = sentimentScore(article.title ?? '');
                  return (
                    <div style={{ paddingBottom: '5px' }}>
                      <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                        <div style={{
                          padding: '9px 12px',
                          background: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${meta.border}`,
                          borderLeft: `3px solid ${meta.color}50`,
                          borderRadius: '0 6px 6px 0',
                          transition: 'border-color 0.2s, background 0.2s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = `${meta.color}06`; e.currentTarget.style.borderColor = meta.border.replace('0.25)', '0.5)'); }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = meta.border; }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <div style={{ fontSize: '11px', color: '#e2e8f0', lineHeight: 1.4, flex: 1 }}>{article.title}</div>
                            <span style={{ flexShrink: 0, fontSize: '8px', padding: '2px 6px', borderRadius: '4px', background: `${sent.color}15`, border: `1px solid ${sent.color}40`, color: sent.color }}>{sent.label}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', marginTop: '5px', fontSize: '8px', color: 'rgba(255,255,255,0.3)' }}>
                            {article.domain && <span>{article.domain}</span>}
                            {article.seendate && <span>· {new Date(article.seendate).toLocaleDateString()}</span>}
                          </div>
                        </div>
                      </a>
                    </div>
                  );
                }}
              />
            </div>
          </div>
        );
      })}

      <TabFooter loading={loading} lastUpdated={lastUpdated} sources={['GDELT','WHO']} onReload={refetch} />
    </div>
  );
}
