import { useEffect } from 'react';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useGlobeStore } from '../stores/useGlobeStore';

const typeStyles = {
  alert: { border: 'rgba(248,113,113,0.4)', icon: '🚨', color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
  warning: { border: 'rgba(251,191,36,0.4)', icon: '⚠️', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
  success: { border: 'rgba(74,222,128,0.4)', icon: '✓', color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
  info: { border: 'rgba(56,189,248,0.4)', icon: 'ℹ️', color: '#38bdf8', bg: 'rgba(56,189,248,0.08)' },
};

export default function NotificationToast() {
  const { notifications, removeNotification, markRead, dndMode } = useNotificationStore();
  const { panelVisible, panelHovered } = useGlobeStore();
  const recent = notifications.filter(n => !n.read).slice(0, 2);

  useEffect(() => {
    if (panelHovered) return;
    recent.forEach(n => {
      const duration = n.type === 'alert' ? 6000 : n.type === 'warning' ? 5000 : 3500;
      const timer = setTimeout(() => markRead(n.id), duration);
      return () => clearTimeout(timer);
    });
  }, [notifications, panelHovered]);

  if (dndMode) return null;

  const isMobile = window.innerWidth < 768;

  return (
    <div style={{
      position: 'fixed',
      top: '68px',
      right: panelVisible ? '452px' : '12px',
      zIndex: 400,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxWidth: '300px',
      width: '100%',
      pointerEvents: 'none',
      transition: 'right 0.35s cubic-bezier(0.4,0,0.2,1)',
    }}>
      {recent.map((n) => {
        const style = typeStyles[n.type];
        return (
          <div
            key={n.id}
            style={{
              background: style.bg,
              border: `1px solid ${style.border}`,
              borderLeft: `3px solid ${style.color}`,
              borderRadius: '12px',
              padding: '14px 16px',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              pointerEvents: 'auto',
              animation: 'slideInRight 0.3s ease forwards',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '18px', flexShrink: 0 }}>{style.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <p style={{
                  color: '#f1f5f9',
                  fontSize: '13px',
                  fontWeight: 600,
                  margin: 0,
                  fontFamily: 'DM Sans, sans-serif',
                }}>
                  {n.title}
                </p>
                <button
                  onClick={() => removeNotification(n.id)}
                  style={{
                    background: 'none', border: 'none', color: '#475569',
                    cursor: 'pointer', fontSize: '14px', padding: 0, flexShrink: 0,
                    lineHeight: 1,
                  }}
                >✕</button>
              </div>
              <p style={{
                color: '#64748b', fontSize: '12px', margin: '4px 0 0',
                fontFamily: 'DM Sans, sans-serif', lineHeight: 1.4,
              }}>
                {n.message}
              </p>
              {n.country && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  background: 'rgba(56,189,248,0.1)', borderRadius: '4px',
                  padding: '2px 6px', marginTop: '6px',
                }}>
                  {n.countryCode && (
                    <img
                      src={`https://flagcdn.com/w20/${n.countryCode.toLowerCase()}.png`}
                      style={{ width: '14px', height: '10px', objectFit: 'cover', borderRadius: '2px' }}
                      alt=""
                    />
                  )}
                  <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 500 }}>{n.country}</span>
                </div>
              )}
              <p style={{ color: '#334155', fontSize: '10px', margin: '6px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
                {n.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
