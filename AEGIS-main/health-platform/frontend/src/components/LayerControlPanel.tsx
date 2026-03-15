import { useState } from 'react';
import { useGlobeStore, GlobeLayerVisibility } from '../stores/useGlobeStore';
import { ORBITAL_CONFIGS } from '../globe/orbitalRings';


const LAYER_SOURCE_MAP: Partial<Record<keyof GlobeLayerVisibility, string>> = {
  aircraft:         'opensky',
  militaryAircraft: 'opensky',
  conflictZones:    'gdelt',
  satellites:       'celestrak',
  wildfires:        'nasa-firms',
};

interface LayerDef {
  key: keyof GlobeLayerVisibility;
  label: string;
  dot: string;
}

interface LayerGroup {
  label: string;
  layers: LayerDef[];
}

const LAYER_GROUPS: LayerGroup[] = [
  {
    label: 'INTELLIGENCE',
    layers: [
      { key: 'healthRisk',    label: 'Health Risk',    dot: '#22c55e' },
      { key: 'cyberAttacks',  label: 'Cyber Attacks',  dot: '#38bdf8' },
      { key: 'conflictZones', label: 'Conflict Zones', dot: '#f87171' },
      { key: 'sanctions',     label: 'Sanctions',      dot: '#fb923c' },
    ],
  },
  {
    label: 'TRACKING',
    layers: [
      { key: 'aircraft',         label: 'Aircraft',          dot: '#94a3b8' },
      { key: 'militaryAircraft', label: 'Military Aircraft', dot: '#f87171' },
      { key: 'satellites',       label: 'Satellites',        dot: '#f1f5f9' },
      { key: 'naval',            label: 'Naval Vessels',     dot: '#60a5fa' },
    ],
  },
  {
    label: 'ENVIRONMENT',
    layers: [
      { key: 'earthquakes', label: 'Earthquakes', dot: '#facc15' },
      { key: 'wildfires',   label: 'Wildfires',   dot: '#fb923c' },
      { key: 'storms',      label: 'Storms',      dot: '#a78bfa' },
    ],
  },
];

const layerDescriptions: Record<string, string> = {
  aircraft:         '✈ Civil aircraft shown as plane silhouettes',
  militaryAircraft: '🔴 Military jets shown as fighter shapes',
  satellites:       '🛰 Satellites shown with solar panels',
  naval:            '⚓ Naval vessels shown as ship hulls',
  earthquakes:      '🔵 Quakes shown as shockwave rings',
  conflictZones:    '💥 Events shown as explosion markers',
  wildfires:        '🔥 Fires shown as flame icons',
  cyberAttacks:     '💻 Attacks shown as glowing nodes with arcs',
  healthRisk:       '🌍 Countries colored by threat score',
  sanctions:        '🚫 Sanctioned entities by country',
  storms:           '🌪 Active storm systems',
};

export function LayerControlPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    globeLayers, toggleGlobeLayer, resetGlobeLayers,
    aircraftCount, militaryAircraftCount, conflictEventCount, quakesTodayCount, cyberArcCount,
    failedSources,
  } = useGlobeStore();

  const countFor: Record<string, number> = {
    healthRisk: 195,
    cyberAttacks: cyberArcCount,
    conflictZones: conflictEventCount,
    sanctions: 0,
    aircraft: aircraftCount,
    militaryAircraft: militaryAircraftCount,
    satellites: 0,
    naval: 0,
    earthquakes: quakesTodayCount,
    wildfires: 0,
    storms: 0,
  };

  return (
    <div style={{
      background: 'rgba(5,12,24,0.92)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '14px',
      backdropFilter: 'blur(20px)',
      width: '200px',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      fontFamily: 'DM Sans, sans-serif',
      userSelect: 'none',
    }}>

      {}
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          cursor: 'pointer',
          borderBottom: collapsed ? 'none' : '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px' }}>🗂</span>
          <span style={{
            color: '#38bdf8', fontSize: '11px', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase' as const,
          }}>
            Data Layers
          </span>
        </div>
        <span style={{
          color: '#475569', fontSize: '10px',
          display: 'inline-block',
          transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease',
        }}>▼</span>
      </div>

      {}
      {!collapsed && (
        <div style={{
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          maxHeight: '400px',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
        }}>
          {LAYER_GROUPS.map((group, gi) => (
            <div key={group.label} style={{ marginBottom: gi < LAYER_GROUPS.length - 1 ? '8px' : '0' }}>
              {}
              <div style={{
                fontSize: '8px',
                fontWeight: 700,
                letterSpacing: '0.18em',
                color: '#334155',
                textTransform: 'uppercase' as const,
                padding: '4px 8px 2px',
              }}>
                {group.label}
              </div>

              {}
              {group.layers.map(layer => {
                const isOn = globeLayers[layer.key];
                const count = countFor[layer.key] ?? 0;
                return (
                  <div key={layer.key}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '5px 8px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                        background: isOn ? 'rgba(56,189,248,0.06)' : 'transparent',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.background = isOn
                          ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.04)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.background = isOn
                          ? 'rgba(56,189,248,0.06)' : 'transparent';
                      }}
                      onClick={() => toggleGlobeLayer(layer.key)}
                    >
                      {}
                      <div style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: isOn ? layer.dot : '#334155',
                        boxShadow: isOn ? `0 0 6px ${layer.dot}` : 'none',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                      }} />

                      {}
                      <span style={{
                        color: isOn ? '#e2e8f0' : '#475569',
                        fontSize: '12px',
                        flex: 1,
                        transition: 'color 0.2s ease',
                      }}>
                        {layer.label}
                      </span>

                      {}
                      {(() => {
                        const src = LAYER_SOURCE_MAP[layer.key];
                        const failed = src ? failedSources.includes(src) : false;
                        return failed ? (
                          <span
                            title="Data source unavailable \u2014 retrying"
                            style={{ fontSize: '10px', cursor: 'help', lineHeight: 1 }}
                          >
                            ⚠️
                          </span>
                        ) : null;
                      })()}

                      {}
                      <span style={{
                        color: isOn ? layer.dot : '#334155',
                        fontSize: '10px',
                        fontWeight: 700,
                        minWidth: '20px',
                        textAlign: 'right' as const,
                      }}>
                        {count > 0 ? count : ''}
                      </span>

                      {}
                      <div style={{
                        width: '26px', height: '14px',
                        background: isOn ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.08)',
                        borderRadius: '7px',
                        position: 'relative',
                        flexShrink: 0,
                        transition: 'background 0.2s ease',
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '2px',
                          left: isOn ? '14px' : '2px',
                          width: '10px', height: '10px',
                          borderRadius: '50%',
                          background: isOn ? '#38bdf8' : '#475569',
                          transition: 'left 0.2s ease',
                        }} />
                      </div>
                    </div>
                    {}
                    {layerDescriptions[layer.key] && (
                      <div style={{
                        fontSize: '9px',
                        fontStyle: 'italic',
                        color: '#1e293b',
                        paddingLeft: '23px',
                        marginTop: '-1px',
                        marginBottom: '1px',
                        lineHeight: 1.3,
                      }}>
                        {layerDescriptions[layer.key]}
                      </div>
                    )}
                    {}
                    {layer.key === 'satellites' && isOn && (
                      <div style={{
                        marginTop: '4px',
                        marginLeft: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3px',
                        padding: '6px 8px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '8px',
                        borderLeft: '2px solid rgba(167,139,250,0.3)',
                      }}>
                        {ORBITAL_CONFIGS.map(config => (
                          <div key={config.category} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                              width: '20px',
                              height: '2px',
                              background: config.glowColor,
                              borderRadius: '1px',
                              boxShadow: `0 0 4px ${config.glowColor}`,
                              flexShrink: 0,
                            }} />
                            <span style={{
                              color: '#475569',
                              fontSize: '10px',
                              fontFamily: 'DM Sans, sans-serif',
                            }}>
                              {config.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {}
          <button
            onClick={resetGlobeLayers}
            style={{
              marginTop: '6px',
              width: '100%',
              padding: '6px',
              background: 'rgba(56,189,248,0.06)',
              border: '1px solid rgba(56,189,248,0.15)',
              borderRadius: '8px',
              color: '#38bdf8',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(56,189,248,0.12)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(56,189,248,0.06)';
            }}
          >
            ↺ Reset
          </button>
        </div>
      )}
    </div>
  );
}
