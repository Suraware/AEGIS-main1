export function GlobeLegend() {
  return (
    <div style={{
      background: 'rgba(5,12,24,0.92)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '7px 12px',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      width: 'fit-content',
    }}>
      <span style={{
        color: '#475569', fontSize: '10px',
        fontWeight: 600, textTransform: 'uppercase' as const,
        letterSpacing: '0.08em', flexShrink: 0,
        fontFamily: 'DM Sans, sans-serif',
      }}>
        Risk
      </span>

      {}
      <div style={{
        width: '80px', height: '6px',
        borderRadius: '3px',
        background: 'linear-gradient(to right, #4ade80, #facc15, #fb923c, #f87171)',
        flexShrink: 0,
      }} />

      {}
      <div style={{ display: 'flex', gap: '8px' }}>
        {[
          { label: 'LOW',  color: '#4ade80' },
          { label: 'MOD',  color: '#facc15' },
          { label: 'HIGH', color: '#fb923c' },
          { label: 'CRIT', color: '#f87171' },
        ].map(item => (
          <span key={item.label} style={{
            color: item.color, fontSize: '9px', fontWeight: 700,
            fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em',
          }}>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
