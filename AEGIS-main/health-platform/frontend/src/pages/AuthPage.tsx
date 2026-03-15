import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/useAuthStore';
import { supabase } from '../services/supabase';


const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,179,237,${p.alpha})`;
        ctx.fill();
      });

      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,179,237,${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};


const GlobeSVG: React.FC = () => (
  <div style={{
    position: 'absolute',
    right: '-120px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '520px',
    height: '520px',
    opacity: 0.07,
    animation: 'spinGlobe 40s linear infinite',
    pointerEvents: 'none',
  }}>
    <svg viewBox="0 0 400 400" fill="none" stroke="#63b3ed" strokeWidth="0.8" style={{ width: '100%', height: '100%' }}>
      <circle cx="200" cy="200" r="180" />
      <ellipse cx="200" cy="200" rx="180" ry="60" />
      <ellipse cx="200" cy="200" rx="180" ry="110" />
      <ellipse cx="200" cy="200" rx="60" ry="180" />
      <ellipse cx="200" cy="200" rx="110" ry="180" />
      <ellipse cx="200" cy="140" rx="156" ry="28" />
      <ellipse cx="200" cy="260" rx="156" ry="28" />
      <ellipse cx="200" cy="92" rx="96" ry="16" />
      <ellipse cx="200" cy="308" rx="96" ry="16" />
      <line x1="200" y1="20" x2="200" y2="380" />
      <line x1="20" y1="200" x2="380" y2="200" />
    </svg>
  </div>
);


const StatItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div>
    <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', lineHeight: 1, fontFamily: "'DM Sans', sans-serif" }}>{value}</div>
    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', letterSpacing: '0.05em', fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
  </div>
);


const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = '#38bdf8' }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(56,189,248,0.08)',
    border: '1px solid rgba(56,189,248,0.18)',
    borderRadius: '100px',
    padding: '5px 12px',
    fontSize: '12px',
    color,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: '0.02em',
  }}>
    {children}
  </span>
);


const InputField: React.FC<{
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  rightEl?: React.ReactNode;
  inputProps?: any;
}> = ({ label, type = 'text', placeholder, error, rightEl, inputProps }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.02em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...inputProps}
          style={{
            width: '100%',
            background: focused ? 'rgba(15,23,42,0.8)' : 'rgba(15,23,42,0.5)',
            border: focused ? '1px solid rgba(56,189,248,0.6)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            padding: rightEl ? '12px 44px 12px 14px' : '12px 14px',
            color: '#f1f5f9',
            fontSize: '14px',
            fontFamily: "'DM Sans', sans-serif",
            outline: 'none',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box',
            boxShadow: focused ? '0 0 0 3px rgba(56,189,248,0.1)' : 'none',
          }}
        />
        {rightEl && (
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>
            {rightEl}
          </div>
        )}
      </div>
      {error && <p style={{ fontSize: '12px', color: '#f87171', fontFamily: "'DM Sans', sans-serif" }}>{error}</p>}
    </div>
  );
};


export default function AuthPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit: rhfSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<{ displayName: string; email: string; password: string }>();

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  useEffect(() => {
    setServerError('');
    setSuccessMsg('');
    reset();
  }, [isLogin, reset]);

  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { id, email, user_metadata } = session.user;
        const user = {
          id,
          email: email ?? '',
          displayName: user_metadata?.full_name ?? user_metadata?.name ?? email ?? '',
        };
        setAuth(user, session.access_token, session.refresh_token);
        navigate('/');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, setAuth]);

  const handleGoogleLogin = async () => {
    setServerError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/login' },
    });
    if (error) setServerError(error.message);
  };

  const onSubmit = async (data: { displayName: string; email: string; password: string }) => {
    setServerError('');
    setSuccessMsg('');
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        
        setSuccessMsg('Access granted — redirecting you now.');
      } else {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: { data: { full_name: data.displayName } },
        });
        if (error) throw error;
        setSuccessMsg('Account created! Check your email to confirm, then sign in.');
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setServerError(e.message || 'Authentication failed. Please try again.');
    }
  };

  const eyeIcon = (
    <button
      type="button"
      onClick={() => setShowPassword(v => !v)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, display: 'flex' }}
    >
      {showPassword ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );

  return (
    <>
      {}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        @keyframes spinGlobe { from { transform: translateY(-50%) rotate(0deg); } to { transform: translateY(-50%) rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes shimmer { from { background-position: -200% center; } to { background-position: 200% center; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #334155; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.2); border-radius: 2px; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        width: '100%',
        background: 'linear-gradient(135deg, #060d1a 0%, #0a1628 50%, #060d1a 100%)',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <ParticleCanvas />

        {}
        <div style={{ position: 'fixed', top: '-10%', right: '20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', bottom: '-10%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        {}
        <div style={{
          flex: '0 0 55%',
          display: 'none',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          ...(typeof window !== 'undefined' && window.innerWidth >= 1024 ? { display: 'flex' } : {}),
        }} className="hero-col">
          <GlobeSVG />

          {}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '20px', color: '#f1f5f9', letterSpacing: '-0.02em' }}>AEGIS</span>
          </div>

          {}
          <div style={{
            animation: mounted ? 'fadeUp 0.8s ease forwards' : 'none',
            opacity: mounted ? 1 : 0,
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)',
              borderRadius: '100px', padding: '6px 14px', marginBottom: '24px',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '12px', color: '#38bdf8', fontFamily: "'DM Sans', sans-serif", fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Live Intelligence Feed</span>
            </div>

            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(32px, 3.5vw, 52px)',
              fontWeight: 700,
              color: '#f1f5f9',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              marginBottom: '20px',
            }}>
              Global Health<br />
              <span style={{
                background: 'linear-gradient(90deg, #38bdf8, #818cf8, #38bdf8)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'shimmer 4s linear infinite',
              }}>Intelligence</span><br />
              in real time.
            </h1>

            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '16px',
              color: '#64748b',
              lineHeight: 1.7,
              maxWidth: '420px',
              marginBottom: '32px',
            }}>
              Monitor disease outbreaks, hospital capacity, and health alerts across 195 countries — powered by live government data.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Badge>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s infinite' }} />
                Live CDC Data
              </Badge>
              <Badge>🌍 195 Countries</Badge>
              <Badge>🛡 WHO Verified</Badge>
            </div>
          </div>

          {}
          <div style={{
            display: 'flex', gap: '40px',
            padding: '24px', borderRadius: '16px',
            background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(12px)',
            maxWidth: '420px',
          }}>
            <StatItem value="1,402" label="Active Data Nodes" />
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <StatItem value="195" label="Countries" />
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <StatItem value="< 2s" label="Update Frequency" />
          </div>
        </div>

        {}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(16px, 4vw, 48px)',
          zIndex: 1,
          overflowY: 'auto',
          minHeight: '100vh',
        }}>
          <div style={{
            width: '100%',
            maxWidth: '420px',
            animation: mounted ? 'fadeUp 0.5s ease forwards' : 'none',
            opacity: mounted ? 1 : 0,
          }}>
            {}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', justifyContent: 'center' }} className="mobile-logo">
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5"/>
                </svg>
              </div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '22px', color: '#f1f5f9' }}>AEGIS</span>
            </div>

            {}
            <div style={{
              background: 'rgba(10, 18, 36, 0.85)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: 'clamp(24px, 5vw, 40px)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>
              {}
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(20px, 3vw, 26px)',
                  color: '#f1f5f9',
                  letterSpacing: '-0.02em',
                  marginBottom: '6px',
                }}>
                  {isLogin ? 'Welcome back' : 'Create account'}
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', fontFamily: "'DM Sans', sans-serif" }}>
                  {isLogin ? 'Sign in to your AEGIS account' : 'Join AEGIS Health Intelligence'}
                </p>
              </div>

              {}
              <div style={{
                display: 'flex',
                background: 'rgba(15,23,42,0.6)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
                padding: '4px',
                marginBottom: '28px',
                gap: '4px',
              }}>
                {['Sign In', 'Register'].map((tab, i) => {
                  const active = i === 0 ? isLogin : !isLogin;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setIsLogin(i === 0)}
                      style={{
                        flex: 1,
                        padding: '9px',
                        borderRadius: '7px',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                        fontSize: '13px',
                        transition: 'all 0.2s ease',
                        background: active ? 'rgba(56,189,248,0.12)' : 'transparent',
                        color: active ? '#38bdf8' : '#475569',
                        boxShadow: active ? 'inset 0 0 0 1px rgba(56,189,248,0.25)' : 'none',
                      }}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={rhfSubmit(onSubmit)} noValidate>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {}
                  {serverError && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
                      borderRadius: '10px', padding: '12px 14px',
                    }}>
                      <span style={{ fontSize: '14px' }}>⚠️</span>
                      <p style={{ fontSize: '13px', color: '#f87171', fontFamily: "'DM Sans', sans-serif" }}>{serverError}</p>
                    </div>
                  )}
                  {successMsg && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
                      borderRadius: '10px', padding: '12px 14px',
                    }}>
                      <span style={{ fontSize: '14px' }}>✓</span>
                      <p style={{ fontSize: '13px', color: '#4ade80', fontFamily: "'DM Sans', sans-serif" }}>{successMsg}</p>
                    </div>
                  )}

                  {}
                  {!isLogin && (
                    <InputField
                      label="Full name"
                      placeholder="Jane Smith"
                      inputProps={register('displayName', { required: 'Name is required' })}
                      error={errors.displayName?.message}
                    />
                  )}

                  {}
                  <InputField
                    label="Email address"
                    type="email"
                    placeholder="you@example.com"
                    inputProps={register('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                    })}
                    error={errors.email?.message}
                  />

                  {}
                  <InputField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    rightEl={eyeIcon}
                    inputProps={register('password', {
                      required: 'Password is required',
                      minLength: isLogin ? undefined : { value: 8, message: 'Minimum 8 characters' },
                    })}
                    error={errors.password?.message}
                  />

                  {}
                  {isLogin && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ accentColor: '#38bdf8', width: '14px', height: '14px' }} />
                        <span style={{ fontSize: '13px', color: '#64748b', fontFamily: "'DM Sans', sans-serif" }}>Remember me</span>
                      </label>
                      <button type="button" style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '13px', color: '#38bdf8', fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                      }}>
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      height: '46px',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      background: isSubmitting
                        ? 'rgba(56,189,248,0.3)'
                        : 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                      color: '#fff',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                      fontSize: '15px',
                      letterSpacing: '-0.01em',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: isSubmitting ? 'none' : '0 8px 24px rgba(56,189,248,0.25)',
                      marginTop: '4px',
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div style={{
                          width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#fff', borderRadius: '50%',
                          animation: 'spinGlobe 0.8s linear infinite',
                        }} />
                        Authenticating...
                      </>
                    ) : (
                      isLogin ? 'Sign In' : 'Create Account'
                    )}
                  </button>

                  {}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                    <span style={{ fontSize: '12px', color: '#334155', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>OR</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                  </div>

                  {}
                  <button
                    type="button"
                    style={{
                      width: '100%', height: '44px', borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(15,23,42,0.4)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '10px',
                      fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                      fontSize: '14px', color: '#94a3b8',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={handleGoogleLogin}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#f1f5f9'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 18 18">
                      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>

                  {}
                  <p style={{ textAlign: 'center', fontSize: '13px', color: '#475569', fontFamily: "'DM Sans', sans-serif" }}>
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#38bdf8', fontWeight: 600, fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {isLogin ? 'Create one' : 'Sign in'}
                    </button>
                  </p>
                </div>
              </form>
            </div>

            {}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#1e293b', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                Protected by TLS 1.3 · AES-256
              </p>
              <p style={{ fontSize: '11px', color: '#1e293b', fontFamily: "'DM Sans', sans-serif", marginTop: '4px' }}>
                © {new Date().getFullYear()} AEGIS Health Intelligence
              </p>
            </div>
          </div>
        </div>

        {}
        <style>{`
          @media (min-width: 1024px) {
            .hero-col { display: flex !important; }
            .mobile-logo { display: none !important; }
          }
          @media (max-width: 1023px) {
            .hero-col { display: none !important; }
            .mobile-logo { display: flex !important; }
          }
        `}</style>
      </div>
    </>
  );
}