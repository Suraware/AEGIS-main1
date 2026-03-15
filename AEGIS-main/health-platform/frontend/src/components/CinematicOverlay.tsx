import { useEffect, useState } from 'react';

interface CinematicOverlayProps {
  visible: boolean;
  country: { name: string; code: string; region?: string } | null;
  mode: 'intro' | 'outro';
}

export default function CinematicOverlay({ visible, country, mode }: CinematicOverlayProps) {
  const [lettersVisible, setLettersVisible] = useState<boolean[]>([]);
  const [opacity, setOpacity] = useState(0);

  const letters = country?.name.split('') ?? [];

  useEffect(() => {
    if (!visible || !country) {
      setOpacity(0);
      setLettersVisible([]);
      return;
    }

    
    requestAnimationFrame(() => {
      setOpacity(1);
    });

    if (mode === 'intro') {
      
      setLettersVisible(new Array(letters.length).fill(false));
      letters.forEach((_, i) => {
        setTimeout(() => {
          setLettersVisible(prev => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, 200 + i * 60);
      });
    } else {
      
      setLettersVisible(new Array(letters.length).fill(true));
      const timer = setTimeout(() => setOpacity(0), 400);
      return () => clearTimeout(timer);
    }
  }, [visible, country, mode]);

  if (!visible || !country) return null;

  const regionLabel = country.region || 'GLOBAL INTELLIGENCE';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 250,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.82)',
        opacity,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,204,0.015) 2px, rgba(0,255,204,0.015) 4px)',
        pointerEvents: 'none',
      }} />

      {}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(to right, transparent, rgba(0,255,204,0.3), transparent)',
        animation: 'scanBeam 1.2s linear infinite',
        pointerEvents: 'none',
      }} />

      {}
      {['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].map((corner) => (
        <div key={corner} style={{
          position: 'absolute',
          width: '40px',
          height: '40px',
          ...(corner.includes('top') ? { top: '40px' } : { bottom: '40px' }),
          ...(corner.includes('Left') ? { left: '40px' } : { right: '40px' }),
          borderTop: corner.includes('top') ? '2px solid rgba(0,255,204,0.5)' : 'none',
          borderBottom: corner.includes('bottom') ? '2px solid rgba(0,255,204,0.5)' : 'none',
          borderLeft: corner.includes('Left') ? '2px solid rgba(0,255,204,0.5)' : 'none',
          borderRight: corner.includes('Right') ? '2px solid rgba(0,255,204,0.5)' : 'none',
        }} />
      ))}

      {}
      <div style={{ position: 'relative', textAlign: 'center', padding: '0 40px' }}>

        {}
        <div style={{
          fontFamily: 'monospace',
          fontSize: '10px',
          letterSpacing: '0.4em',
          color: 'rgba(0,255,204,0.6)',
          textTransform: 'uppercase',
          marginBottom: '32px',
          animation: 'fadeInUp 0.4s ease forwards',
        }}>
          ◈ TARGET ACQUISITION — INTEL LOCK
        </div>

        {}
        <div style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'center',
          animation: 'fadeInUp 0.5s ease 0.1s both',
        }}>
          <img
            src={`https://flagcdn.com/w160/${country.code.toLowerCase()}.png`}
            alt={country.name}
            style={{
              width: '160px',
              height: 'auto',
              borderRadius: '4px',
              border: '1px solid rgba(0,255,204,0.3)',
              boxShadow: '0 0 30px rgba(0,255,204,0.2), 0 0 60px rgba(0,255,204,0.1)',
              objectFit: 'cover',
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        {}
        <h1 style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: 'clamp(32px, 6vw, 72px)',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '0.08em',
          margin: 0,
          lineHeight: 1,
          textShadow: '0 0 40px rgba(255,255,255,0.3)',
        }}>
          {letters.map((letter, i) => (
            <span key={i} style={{
              display: 'inline-block',
              opacity: lettersVisible[i] ? 1 : 0,
              transform: lettersVisible[i] ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.15s ease, transform 0.15s ease',
              whiteSpace: letter === ' ' ? 'pre' : 'normal',
            }}>
              {letter}
            </span>
          ))}
        </h1>

        {}
        <div style={{
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          animation: 'fadeInUp 0.5s ease 0.3s both',
        }}>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '12px',
            letterSpacing: '0.3em',
            color: '#00ffcc',
            textTransform: 'uppercase',
          }}>
            {country.code.toUpperCase()}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>—</span>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '11px',
            letterSpacing: '0.25em',
            color: 'rgba(0,255,204,0.7)',
            textTransform: 'uppercase',
          }}>
            {regionLabel.toUpperCase()}
          </span>
        </div>

        {}
        <div style={{
          marginTop: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          animation: 'fadeInUp 0.5s ease 0.4s both',
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#00ffcc',
            animation: 'pulse 1s ease infinite',
          }} />
          <span style={{
            fontFamily: 'monospace',
            fontSize: '10px',
            letterSpacing: '0.3em',
            color: 'rgba(0,255,204,0.8)',
            textTransform: 'uppercase',
          }}>
            {mode === 'intro' ? 'LOADING INTELLIGENCE DATA...' : 'CLOSING TARGET FILE...'}
          </span>
        </div>
      </div>
    </div>
  );
}
