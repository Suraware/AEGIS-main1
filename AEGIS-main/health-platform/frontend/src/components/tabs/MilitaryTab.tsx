
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchMilitaryIntel,
  NUCLEAR_STATES,
  ACTIVE_EXERCISES,
  type MilitaryEvent,
  type MilitaryAsset,
} from '../../services/militaryIntelService';

const CATEGORY_ICONS: Record<string, string> = {
  airstrike: '✈️', naval: '⚓', ground: '🪖', cyber: '💻',
  nuclear: '☢️', missile: '🚀', exercise: '🎯', mobilization: '🏃',
  intelligence: '🕵️', general: '📋',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#f87171', high: '#fb923c', medium: '#facc15', low: '#4ade80',
};

const ASSET_ICONS: Record<string, string> = {
  carrier_group: '🛳', submarine: '🤿', airbase: '✈️',
  missile_site: '🚀', radar: '📡', base: '🏰', fleet: '⚓',
};

const STATUS_COLORS: Record<string, string> = {
  active: '#4ade80', deployed: '#38bdf8', standby: '#facc15', maintenance: '#f87171',
};

interface Props {
  country: { name: string; code: string; lat?: number; lng?: number };
  countryInfo?: any;
}

export default function MilitaryTab({ country }: Props) {
  const [activeSection, setActiveSection] = useState<'overview' | 'events' | 'assets' | 'nuclear' | 'budget' | 'exercises'>('overview');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['military', country.code],
    queryFn: () => fetchMilitaryIntel(country.code.toUpperCase(), country.name),
    staleTime: 10 * 60 * 1000,
    enabled: !!country.code,
  });

  const nuclear = NUCLEAR_STATES[country.code.toUpperCase()];
  const hasNuclear = !!nuclear;

  const criticalEvents = useMemo(() =>
    (data?.events || []).filter(e => e.severity === 'critical' || e.severity === 'high').slice(0, 5),
    [data?.events]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>

      {}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'rgba(248,113,113,0.06)',
        border: '1px solid rgba(248,113,113,0.2)',
        borderRadius: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🪖</span>
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '14px', fontFamily: 'Space Grotesk, sans-serif' }}>
            Military Intelligence
          </span>
          {hasNuclear && (
            <span style={{
              padding: '2px 8px', borderRadius: '100px',
              background: 'rgba(248,113,113,0.15)',
              border: '1px solid rgba(248,113,113,0.35)',
              color: '#f87171', fontSize: '10px', fontWeight: 700,
            }}>
              ☢️ NUCLEAR STATE
            </span>
          )}
        </div>
        <button onClick={() => refetch()} style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px', padding: '4px 10px', color: '#64748b', fontSize: '11px', cursor: 'pointer',
        }}>↺ Refresh</button>
      </div>

      {}
      <div style={{
        display: 'flex', gap: '4px', overflowX: 'auto', scrollbarWidth: 'none',
        padding: '2px',
      }}>
        {[
          { id: 'overview',   label: '📊 Overview' },
          { id: 'events',     label: `⚡ Events${data?.events?.length ? ` (${data.events.length})` : ''}` },
          { id: 'assets',     label: `🏰 Assets${data?.assets?.length ? ` (${data.assets.length})` : ''}` },
          { id: 'nuclear',    label: '☢️ Nuclear' },
          { id: 'budget',     label: '💰 Budget' },
          { id: 'exercises',  label: '🎯 Exercises' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            style={{
              padding: '6px 12px', borderRadius: '8px', whiteSpace: 'nowrap',
              background: activeSection === tab.id ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.04)',
              border: activeSection === tab.id ? '1px solid rgba(248,113,113,0.4)' : '1px solid rgba(255,255,255,0.06)',
              color: activeSection === tab.id ? '#f87171' : '#64748b',
              fontSize: '11px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >{tab.label}</button>
        ))}
      </div>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              height: '64px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)',
              animation: 'pulse 1.5s infinite',
            }} />
          ))}
        </div>
      )}

      {!isLoading && (
        <>
          {}
          {activeSection === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {data?.wiki && (
                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(15,23,42,0.6)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                }}>
                  <div style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {data.wiki.title}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
                    {data.wiki.summary.slice(0, 400)}
                    {data.wiki.summary.length > 400 && '...'}
                  </p>
                  {data.wiki.url && (
                    <a href={data.wiki.url} target="_blank" rel="noreferrer" style={{
                      display: 'inline-block', marginTop: '8px',
                      color: '#38bdf8', fontSize: '11px',
                    }}>Read full article →</a>
                  )}
                </div>
              )}

              {criticalEvents.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ color: '#f87171', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    🚨 Active Alerts
                  </div>
                  {criticalEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {data?.budget && (
                  <StatCard
                    label="Defense Budget"
                    value={`$${(data.budget.budgetUSD / 1e9).toFixed(1)}B`}
                    sub={`${data.budget.gdpPercent}% of GDP · Rank #${data.budget.rank}`}
                    color="#38bdf8"
                    icon="💰"
                  />
                )}
                {hasNuclear && (
                  <StatCard
                    label="Nuclear Arsenal"
                    value={`${nuclear.warheads.toLocaleString()}`}
                    sub={`${nuclear.deployed} deployed · ${nuclear.status}`}
                    color="#f87171"
                    icon="☢️"
                  />
                )}
                <StatCard
                  label="Known Assets"
                  value={String(data?.assets?.length || 0)}
                  sub="Tracked military installations"
                  color="#a78bfa"
                  icon="🏰"
                />
                <StatCard
                  label="Intel Events"
                  value={String(data?.events?.length || 0)}
                  sub="Last 72 hours"
                  color="#fb923c"
                  icon="⚡"
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {['ACLED', 'GDELT', 'SIPRI', 'Wikipedia', 'FAS', 'IISS', "Jane's", 'NTI'].map(src => (
                  <span key={src} style={{
                    padding: '2px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: 600,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#475569',
                  }}>{src}</span>
                ))}
              </div>
            </div>
          )}

          {}
          {activeSection === 'events' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data?.events?.length === 0 && (
                <div style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '24px' }}>
                  No recent military events found for {country.name}
                </div>
              )}
              {(data?.events || []).map(event => (
                <EventCard key={event.id} event={event} expanded />
              ))}
            </div>
          )}

          {}
          {activeSection === 'assets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data?.assets?.length === 0 && (
                <div style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '24px' }}>
                  No tracked assets for {country.name}
                </div>
              )}
              {(data?.assets || []).map((asset: MilitaryAsset, i: number) => (
                <div key={i} style={{
                  padding: '12px 14px',
                  background: 'rgba(15,23,42,0.6)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                }}>
                  <div style={{ fontSize: '20px', flexShrink: 0 }}>{ASSET_ICONS[asset.type] || '🎯'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '13px', fontFamily: 'DM Sans, sans-serif' }}>
                        {asset.name}
                      </span>
                      <span style={{
                        padding: '1px 7px', borderRadius: '100px', fontSize: '10px', fontWeight: 700,
                        background: `${STATUS_COLORS[asset.status]}18`,
                        border: `1px solid ${STATUS_COLORS[asset.status]}44`,
                        color: STATUS_COLORS[asset.status],
                      }}>{asset.status.toUpperCase()}</span>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>{asset.notes}</div>
                    <div style={{ color: '#334155', fontSize: '10px', marginTop: '3px', fontFamily: 'monospace' }}>
                      {asset.lat.toFixed(3)}°, {asset.lng.toFixed(3)}°
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {}
          {activeSection === 'nuclear' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {!hasNuclear ? (
                <div style={{
                  padding: '20px', textAlign: 'center',
                  background: 'rgba(74,222,128,0.05)',
                  border: '1px solid rgba(74,222,128,0.15)',
                  borderRadius: '10px',
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
                  <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '14px' }}>
                    No Known Nuclear Weapons
                  </div>
                  <div style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>
                    {country.name} is not a recognized nuclear weapons state
                  </div>
                </div>
              ) : (
                <>
                  <div style={{
                    padding: '16px',
                    background: 'rgba(248,113,113,0.05)',
                    border: '1px solid rgba(248,113,113,0.2)',
                    borderRadius: '12px',
                  }}>
                    <div style={{ color: '#f87171', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                      ☢️ Nuclear Status — {nuclear.status.toUpperCase()}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <NuclearStat label="Total Warheads" value={nuclear.warheads.toLocaleString()} />
                      <NuclearStat label="Deployed" value={nuclear.deployed.toLocaleString()} />
                      <NuclearStat label="Treaty Status" value={nuclear.treaty} />
                      <NuclearStat label="Delivery Systems" value={String(nuclear.delivery.length)} />
                    </div>
                  </div>

                  <div style={{
                    padding: '12px 14px',
                    background: 'rgba(15,23,42,0.6)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                  }}>
                    <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                      Delivery Vectors
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {nuclear.delivery.map((d: string) => (
                        <span key={d} style={{
                          padding: '4px 10px', borderRadius: '8px', fontSize: '12px',
                          background: 'rgba(248,113,113,0.1)',
                          border: '1px solid rgba(248,113,113,0.25)',
                          color: '#fca5a5',
                        }}>{d}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    padding: '12px 14px',
                    background: 'rgba(15,23,42,0.6)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                  }}>
                    <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase' }}>
                      Global Nuclear Comparison
                    </div>
                    {Object.entries(NUCLEAR_STATES)
                      .sort((a, b) => (b[1] as any).warheads - (a[1] as any).warheads)
                      .map(([code, ndata]: [string, any]) => (
                        <div key={code} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ width: '28px', color: '#64748b', fontSize: '11px', fontFamily: 'monospace' }}>{code}</div>
                          <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: '3px',
                              width: `${(ndata.warheads / 6257) * 100}%`,
                              background: code === country.code.toUpperCase() ? '#f87171' : 'rgba(248,113,113,0.35)',
                            }} />
                          </div>
                          <div style={{ width: '45px', color: '#475569', fontSize: '11px', textAlign: 'right', fontFamily: 'monospace' }}>
                            {ndata.warheads.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    <div style={{ color: '#334155', fontSize: '10px', marginTop: '8px' }}>
                      Source: FAS Nuclear Notebook 2024 · Estimates only
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {}
          {activeSection === 'budget' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {!data?.budget ? (
                <div style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '24px' }}>
                  No SIPRI budget data available for {country.name}
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <StatCard label="Total Budget" value={`$${(data.budget.budgetUSD / 1e9).toFixed(1)}B`} sub="USD 2024" color="#38bdf8" icon="💰" />
                    <StatCard label="GDP Share" value={`${data.budget.gdpPercent}%`} sub="of national GDP" color="#a78bfa" icon="📊" />
                    <StatCard label="Per Capita" value={`$${data.budget.perCapita.toLocaleString()}`} sub="per citizen" color="#34d399" icon="👤" />
                    <StatCard label="Global Rank" value={`#${data.budget.rank}`} sub={`YoY change: ${data.budget.change > 0 ? '+' : ''}${data.budget.change}%`} color={data.budget.change > 0 ? '#f87171' : '#4ade80'} icon="🏆" />
                  </div>

                  <div style={{
                    padding: '12px 14px',
                    background: 'rgba(15,23,42,0.6)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                  }}>
                    <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
                      Budget vs NATO Target (2% GDP)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: '5px',
                          width: `${Math.min(100, (data.budget.gdpPercent / 5) * 100)}%`,
                          background: data.budget.gdpPercent >= 2 ? '#4ade80' : '#f87171',
                          transition: 'width 1s ease',
                        }} />
                      </div>
                      <span style={{ color: data.budget.gdpPercent >= 2 ? '#4ade80' : '#f87171', fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', width: '40px' }}>
                        {data.budget.gdpPercent}%
                      </span>
                    </div>
                    <div style={{ color: '#334155', fontSize: '10px', marginTop: '6px' }}>
                      Source: SIPRI Military Expenditure Database 2024
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {}
          {activeSection === 'exercises' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data?.exercises?.length === 0 ? (
                <div style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '24px' }}>
                  No tracked exercises for {country.name}
                </div>
              ) : (
                (data?.exercises || []).map((ex: any, i: number) => (
                  <div key={i} style={{
                    padding: '12px 14px',
                    background: 'rgba(15,23,42,0.6)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderLeft: '3px solid rgba(251,146,60,0.6)',
                    borderRadius: '10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '13px', fontFamily: 'DM Sans, sans-serif' }}>
                        🎯 {ex.name}
                      </span>
                      {ex.ongoing && (
                        <span style={{
                          padding: '1px 7px', borderRadius: '100px', fontSize: '10px', fontWeight: 700,
                          background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
                          color: '#4ade80',
                        }}>ONGOING</span>
                      )}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px' }}>{ex.description}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {ex.participants.map((p: string) => (
                        <span key={p} style={{
                          padding: '2px 7px', borderRadius: '6px', fontSize: '11px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#94a3b8',
                        }}>{p}</span>
                      ))}
                    </div>
                    <div style={{ color: '#334155', fontSize: '10px', marginTop: '6px' }}>
                      {ex.region} · {ex.type.toUpperCase()} · {ex.startDate}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}



const EventCard = ({ event, expanded }: { event: MilitaryEvent; expanded?: boolean }) => (
  <div style={{
    padding: '10px 12px',
    background: 'rgba(15,23,42,0.6)',
    border: `1px solid ${SEVERITY_COLORS[event.severity]}22`,
    borderLeft: `3px solid ${SEVERITY_COLORS[event.severity]}`,
    borderRadius: '8px',
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
      <span style={{ fontSize: '14px', flexShrink: 0 }}>{CATEGORY_ICONS[event.category]}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
          <span style={{
            padding: '1px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700,
            background: `${SEVERITY_COLORS[event.severity]}18`,
            color: SEVERITY_COLORS[event.severity],
            textTransform: 'uppercase',
          }}>{event.severity}</span>
          <span style={{ color: '#334155', fontSize: '10px' }}>{event.source}</span>
          {event.verified && <span style={{ color: '#4ade80', fontSize: '10px' }}>✓ verified</span>}
        </div>
        <div style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 500, lineHeight: '1.4' }}>
          {event.title}
        </div>
        {expanded && event.description && (
          <div style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', lineHeight: '1.5' }}>
            {event.description.slice(0, 200)}{event.description.length > 200 ? '...' : ''}
          </div>
        )}
        {expanded && event.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '6px' }}>
            {event.tags.map(tag => (
              <span key={tag} style={{
                padding: '1px 6px', borderRadius: '4px', fontSize: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#475569',
              }}>{tag}</span>
            ))}
          </div>
        )}
        {event.sourceUrl && (
          <a href={event.sourceUrl} target="_blank" rel="noreferrer" style={{
            display: 'inline-block', marginTop: '4px', color: '#38bdf8', fontSize: '10px',
          }}>View source →</a>
        )}
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, sub, color, icon }: {
  label: string; value: string; sub: string; color: string; icon: string;
}) => (
  <div style={{
    padding: '12px', borderRadius: '10px',
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid rgba(255,255,255,0.06)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
      <span style={{ fontSize: '14px' }}>{icon}</span>
      <span style={{ color: '#475569', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
    </div>
    <div style={{ color, fontSize: '20px', fontWeight: 700, fontFamily: 'monospace' }}>{value}</div>
    <div style={{ color: '#334155', fontSize: '10px', marginTop: '2px' }}>{sub}</div>
  </div>
);

const NuclearStat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div style={{ color: '#475569', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    <div style={{ color: '#fca5a5', fontSize: '14px', fontWeight: 700, fontFamily: 'monospace', marginTop: '2px' }}>{value}</div>
  </div>
);
