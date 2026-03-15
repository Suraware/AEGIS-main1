import { useState } from 'react';
import { useNotificationStore } from '../stores/useNotificationStore';

const typeStyles = {
  alert: { icon: '🚨', color: '#f87171' },
  warning: { icon: '⚠️', color: '#fbbf24' },
  success: { icon: '✓', color: '#4ade80' },
  info: { icon: 'ℹ️', color: '#38bdf8' },
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const { notifications, unreadCount, markAllRead, clearAll, markRead, dndMode, toggleDnd } = useNotificationStore();

  const filtered = activeFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === activeFilter);

  return (
    <div style={{ position: 'relative' }}>
      {}
      <button
        onClick={() => { setOpen(!open); if (!open && unreadCount > 0) markAllRead(); }}
        style={{
          position: 'relative',
          background: 'rgba(15,23,42,0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          width: '40px', height: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#94a3b8',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)';
          e.currentTarget.style.color = '#38bdf8';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.color = '#94a3b8';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: '#f87171', color: '#fff',
            borderRadius: '50%', width: '18px', height: '18px',
            fontSize: '10px', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #060d1a',
            animation: 'pulse 2s infinite',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {}
      {open && (
        <>
          {}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 490,
              pointerEvents: 'auto',
              cursor: 'default',
            }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute', top: '48px', right: 0,
            width: '360px', maxHeight: '480px',
            background: 'rgba(8,15,30,0.98)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', overflow: 'hidden',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            zIndex: 500,
          }}>
          {}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div>
              <h3 style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: 600, margin: 0, fontFamily: 'Space Grotesk, sans-serif' }}>
                Notifications
              </h3>
              <p style={{ color: '#475569', fontSize: '12px', margin: '2px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
                {notifications.length} total alerts
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={toggleDnd}
                title={dndMode ? 'DND On - Click to disable' : 'Click to enable Do Not Disturb'}
                style={{
                  background: dndMode ? 'rgba(56,189,248,0.15)' : 'none',
                  border: `1px solid ${dndMode ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '8px',
                  padding: '6px 10px',
                  color: dndMode ? '#38bdf8' : '#475569',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                🌙
                <span style={{ fontSize: '11px', fontFamily: 'DM Sans, sans-serif' }}>
                  {dndMode ? 'DND On' : 'DND'}
                </span>
              </button>
              <button
                onClick={clearAll}
                style={{
                  background: 'none', border: 'none', color: '#475569',
                  fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Clear all
              </button>
            </div>
          </div>

          {}
          <div style={{
            display: 'flex',
            gap: '6px',
            padding: '8px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            overflowX: 'auto',
            scrollbarWidth: 'none',
          }}>
            {['all', 'alert', 'warning', 'info', 'success'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                style={{
                  background: activeFilter === filter ? 'rgba(56,189,248,0.15)' : 'none',
                  border: `1px solid ${activeFilter === filter ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '100px',
                  padding: '4px 10px',
                  color: activeFilter === filter ? '#38bdf8' : '#475569',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease',
                }}
              >
                {filter}
              </button>
            ))}
          </div>

          {}
          <div style={{ overflowY: 'auto', maxHeight: '380px' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔔</div>
                <p style={{ color: '#475569', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }}>
                  No notifications yet
                </p>
                <p style={{ color: '#334155', fontSize: '12px', fontFamily: 'DM Sans, sans-serif', marginTop: '4px' }}>
                  Health alerts will appear here in real time
                </p>
              </div>
            ) : (
              filtered.map((n) => {
                const style = typeStyles[n.type];
                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      cursor: 'pointer',
                      background: n.read ? 'transparent' : 'rgba(56,189,248,0.03)',
                      transition: 'background 0.2s ease',
                      display: 'flex', gap: '12px', alignItems: 'flex-start',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.read ? 'transparent' : 'rgba(56,189,248,0.03)'}
                  >
                    <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>{style.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                        <p style={{
                          color: '#f1f5f9', fontSize: '13px', fontWeight: 600,
                          margin: 0, fontFamily: 'DM Sans, sans-serif',
                        }}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', flexShrink: 0 }} />
                        )}
                      </div>
                      <p style={{ color: '#64748b', fontSize: '12px', margin: '3px 0 0', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.4 }}>
                        {n.message}
                      </p>
                      {n.country && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                          {n.countryCode && (
                            <img
                              src={`https://flagcdn.com/w20/${n.countryCode.toLowerCase()}.png`}
                              style={{ width: '14px', height: '10px', objectFit: 'cover', borderRadius: '2px' }}
                              alt=""
                            />
                          )}
                          <span style={{ color: style.color, fontSize: '11px', fontWeight: 500 }}>{n.country}</span>
                        </div>
                      )}
                      <p style={{ color: '#334155', fontSize: '10px', margin: '4px 0 0', fontFamily: 'DM Sans, sans-serif' }}>
                        {n.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
}
