
import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Activity, Wind, Droplets, Shield, X, Network, Cpu,
  ChevronRight, FlaskConical, AlertTriangle, Search,
  Globe2, Radio, Clock, ShieldAlert, LogOut, User as UserIcon, Star, LocateFixed, Plus, Minus, Crosshair, Zap, Waves
} from 'lucide-react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import GlobeComponent from './components/Globe';
import { useGlobeStore, globeInstanceRef } from './stores/useGlobeStore';
import { GoogleMapsModal } from './components/GoogleMapsModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import AlertTicker from './components/AlertTicker';
import { LayerControlPanel } from './components/LayerControlPanel';
import { GlobeLegend } from './components/GlobeLegend';
import { LiveStatsBar } from './components/LiveStatsBar';
import { useStore } from './stores/useStore';
import { useAuthStore } from './stores/useAuthStore';
import { useUserStore } from './stores/useUserStore';
import { useHealthAlertSocket } from './hooks/useHealthAlertSocket';
import { useRealtimeUpdates } from './hooks/useRealtimeUpdates';
import { useRealtimeNewsNotifications } from './hooks/useRealtimeNewsNotifications';
import { getRiskColor, getRiskLabel } from './services/healthApi';
import AuthPage from './pages/AuthPage';
import { supabase } from './services/supabase';
import { initProxyManager, getProxyStatus } from './lib/proxyManager';
import { initDataManager, destroyDataManager } from './lib/dataManager';


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  
  
  
  return <>{children}</>;
};


const CircularGauge = ({ value }: { value: number }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  const color = value >= 80 ? '#ff2200' : value >= 60 ? '#ffaa00' : '#00d4ff';

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx="48" cy="48" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="transparent" />
        <motion.circle
          cx="48" cy="48" r={radius}
          stroke={color} strokeWidth="6" fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-orbitron font-bold text-white tracking-widest">{value}%</span>
      </div>
    </div>
  );
};

import CountryPanel from './components/CountryPanel';
import NotificationBell from './components/NotificationBell';
import NotificationToast from './components/NotificationToast';
import CinematicOverlay from './components/CinematicOverlay';
import { useNotificationStore } from './stores/useNotificationStore';


const LAYERS = [
  { id: 'disease', label: 'Outbreaks', icon: Activity, color: 'text-red-400' },
  { id: 'hospital', label: 'Hospitals', icon: Shield, color: 'text-rose-400' },
  { id: 'airQuality', label: 'Air Quality', icon: Wind, color: 'text-sky-400' },
  { id: 'wastewater', label: 'Wastewater', icon: Droplets, color: 'text-cyan-400' },
  { id: 'trials', label: 'Trials', icon: FlaskConical, color: 'text-violet-400' },
  { id: 'fda', label: 'FDA Alerts', icon: AlertTriangle, color: 'text-amber-400' },
  { id: 'aircraft', label: 'Aircraft', icon: LocateFixed, color: 'text-slate-400' },
  { id: 'conflicts', label: 'Conflicts', icon: Crosshair, color: 'text-red-500' },
  { id: 'cyberArcs', label: 'Cyber Attacks', icon: Zap, color: 'text-cyan-400' },
  { id: 'cyberHeatmap', label: 'Cyber Heatmap', icon: Network, color: 'text-blue-400' },
  { id: 'earthquakes', label: 'Earthquakes', icon: Waves, color: 'text-amber-500' },
];

const COUNTRY_LIST = [
  { name: 'United States', code: 'US', lon: -98, lat: 39 },
  { name: 'United Kingdom', code: 'GB', lon: -2, lat: 54 },
  { name: 'Germany', code: 'DE', lon: 10, lat: 51 },
  { name: 'France', code: 'FR', lon: 2, lat: 46 },
  { name: 'China', code: 'CN', lon: 105, lat: 35 },
  { name: 'India', code: 'IN', lon: 79, lat: 22 },
  { name: 'Brazil', code: 'BR', lon: -55, lat: -10 },
  { name: 'Japan', code: 'JP', lon: 138, lat: 37 },
];


function UtcClock() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  void tick; 
  return <>{new Date().toUTCString().slice(17, 25)}</>;
}


function Dashboard() {
  const { globeAutoRotate, layers, alerts } = useStore();
  const [selectedCountry, setSelectedCountry] = useState<{ name: string; code: string } | null>(null);
  const [googleMapData, setGoogleMapData] = useState<{ name: string; code: string; latitude: number; longitude: number } | null>(null);
  const { user } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  useHealthAlertSocket();
  
  
  useRealtimeUpdates(true);
  useRealtimeNewsNotifications(true, selectedCountry, 45_000);

  const [searchQuery, setSearchQuery] = useState('');
  const prevStoreCountryRef = useRef<string | null>(null);
  const [showHint, setShowHint] = useState(true);
  const storeCountry = useGlobeStore((s) => s.selectedCountry);
  const [results, setResults] = useState<any[]>([]);
  const [timelineYear, setTimelineYear] = useState(2025);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCountryZoomed, setIsCountryZoomed] = useState(false);
  const [cinematic, setCinematic] = useState<{ visible: boolean; mode: 'intro' | 'outro'; country: { name: string; code: string } | null }>({ visible: false, mode: 'intro', country: null });
  const addNotification = useNotificationStore((state) => state.addNotification);

  const { watchlist, toggleWatchlist, fetchUserData } = useUserStore();

  useEffect(() => {
    if (user?.id) fetchUserData(user.id);
  }, [user]);

  
  useEffect(() => {
    addNotification({
      type: 'info',
      title: 'AEGIS Online',
      message: 'Monitoring 195 countries for health intelligence',
    });
  }, []);

  
  useEffect(() => {
    initProxyManager().then(() => {
      const status = getProxyStatus();
      addNotification({
        type: status.working > 5 ? 'info' : 'warning',
        title: `Proxy Network: ${status.working}/${status.total} Active`,
        message: 'Relay nodes initialized for blocked API access',
      });
    });
  }, []);

  
  useEffect(() => {
    initDataManager();
    return () => destroyDataManager();
  }, []);

  
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  
  useEffect(() => {
    if (!storeCountry) return;
    if (storeCountry.code === prevStoreCountryRef.current) return;
    prevStoreCountryRef.current = storeCountry.code;
    useNotificationStore.getState().addNotification({
      type: 'info',
      title: `Viewing ${storeCountry.name}`,
      message: 'Loading live health intelligence data',
      country: storeCountry.name,
      countryCode: storeCountry.code,
    });
    setTimeout(() => setCinematic({ visible: true, mode: 'intro', country: storeCountry }), 500);
    setTimeout(() => setCinematic(prev => ({ ...prev, visible: false })), 1500);
    setTimeout(() => { setSelectedCountry(storeCountry); setIsCountryZoomed(true); }, 1800);
  }, [storeCountry]);

  
  useEffect(() => {
    if (searchQuery.length < 2) { setResults([]); return; }
    const handler = setTimeout(() => {
      const lowerQ = searchQuery.toLowerCase();
      const matches = COUNTRY_LIST.filter((c: any) =>
        c.name.toLowerCase().includes(lowerQ) || c.code.toLowerCase().includes(lowerQ)
      ).slice(0, 5);
      setResults(matches);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  
  useEffect(() => {
    const fetchTrends = async () => {
      if (timelineYear < 2025) {
        const { fetchSnowflakeTrends } = await import('./services/healthApi');
        const code = selectedCountry?.code?.toUpperCase() || 'US';
        const trends = await fetchSnowflakeTrends(code);
        setHistoricalData(trends);
      } else {
        setHistoricalData([]);
      }
    };
    fetchTrends();
  }, [timelineYear, selectedCountry]);

  const handleCountrySelect = (c: any) => {
    setSearchQuery('');
    setResults([]);
    const g = globeInstanceRef.current;
    if (g) {
      g.pointOfView({ lat: c.lat, lng: c.lon, altitude: 0.8 }, 1000);
      g.controls().autoRotate = false;
    }
    prevStoreCountryRef.current = null;
    useGlobeStore.getState().openCountry({ name: c.name, code: c.code.toLowerCase() });
  };

  const closeCountry = useCallback(() => {
    if (selectedCountry) {
      setCinematic({ visible: true, mode: 'outro', country: selectedCountry });
      setTimeout(() => setCinematic(prev => ({ ...prev, visible: false })), 800);
    }
    setSelectedCountry(null);
    setIsCountryZoomed(false);
    prevStoreCountryRef.current = null;
    useGlobeStore.getState().closeCountry();
  }, [selectedCountry]);

  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedCountry) closeCountry();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCountry, closeCountry]);

  
  useEffect(() => {
    let touchStartY = 0;
    let touchStartX = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const isSwipeDown = deltaY > 80 && Math.abs(deltaX) < 60;
      const isSwipeRight = deltaX > 80 && Math.abs(deltaY) < 60;
      if ((isSwipeDown || isSwipeRight) && selectedCountry) closeCountry();
    };
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [selectedCountry, closeCountry]);

  const handleLogout = async () => {
    try { await supabase.auth.signOut(); } catch {  }
    logout();
    navigate('/login');
  };

  const handleZoomOutToWorld = () => {
    if (selectedCountry) {
      setCinematic({ visible: true, mode: 'outro', country: selectedCountry });
      setTimeout(() => setCinematic(prev => ({ ...prev, visible: false })), 800);
    }
    setSelectedCountry(null);
    setIsCountryZoomed(false);
    prevStoreCountryRef.current = null;
    const g = globeInstanceRef.current;
    if (g) {
      g.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1500);
      g.controls().autoRotate = true;
    }
  };

  const handleZoomInStep = () => {
    const g = globeInstanceRef.current;
    if (g) {
      const pov = g.pointOfView();
      g.pointOfView({ ...pov, altitude: Math.max(0.3, pov.altitude - 0.5) }, 400);
    }
    setIsCountryZoomed(true);
  };

  const handleZoomOutStep = () => {
    const g = globeInstanceRef.current;
    if (g) {
      const pov = g.pointOfView();
      g.pointOfView({ ...pov, altitude: Math.min(3, pov.altitude + 0.5) }, 400);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden', background: '#000', fontFamily: 'sans-serif', color: '#cbd5e1' }}>
      {}
      <div className="fixed inset-0 w-screen h-screen z-0">
        <ErrorBoundary>
          <GlobeComponent />
        </ErrorBoundary>
      </div>

      {}
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '56px',
        zIndex: 200,
        background: 'rgba(5,12,24,0.92)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        fontFamily: 'Space Grotesk, sans-serif',
      }}>
        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 900, color: '#000',
          }}>A</div>
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '16px', letterSpacing: '0.05em' }}>
            AEGIS
          </span>
          <span style={{
            color: '#38bdf8', fontSize: '10px', fontWeight: 600,
            background: 'rgba(56,189,248,0.1)',
            border: '1px solid rgba(56,189,248,0.2)',
            borderRadius: '4px', padding: '1px 6px',
            letterSpacing: '0.08em',
          }}>
            INTELLIGENCE
          </span>
        </div>

        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px' }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#4ade80',
            boxShadow: '0 0 6px #4ade80',
          }} />
          <span style={{ color: '#4ade80', fontSize: '11px', fontWeight: 600 }}>LIVE</span>
        </div>

        {}
        <div style={{ color: '#475569', fontSize: '11px', fontFamily: 'monospace' }}>
          <UtcClock />
        </div>

        {}
        <div style={{ flex: 1 }} />

        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <NotificationBell />
        </div>
      </nav>

      {}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        padding: '68px 12px 48px 12px',
        gap: '8px',
        width: 'fit-content',
      }}>
        {selectedCountry && (
          <div style={{ pointerEvents: 'auto' }}>
            <button
              onClick={closeCountry}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(56,189,248,0.12)',
                border: '1px solid rgba(56,189,248,0.35)',
                borderRadius: '10px',
                padding: '8px 14px',
                color: '#38bdf8',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 600,
                fontSize: '12px',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.2s ease',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(56,189,248,0.22)';
                e.currentTarget.style.borderColor = 'rgba(56,189,248,0.6)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(56,189,248,0.12)';
                e.currentTarget.style.borderColor = 'rgba(56,189,248,0.35)';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Globe
            </button>
          </div>
        )}
        <div style={{ pointerEvents: 'auto' }}>
          <LayerControlPanel />
        </div>
      </div>

      {}
      <div style={{
        position: 'fixed',
        bottom: '48px',
        left: '12px',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <GlobeLegend />
        </div>
        <div style={{ pointerEvents: 'auto' }}>
          <LiveStatsBar />
        </div>
      </div>

      {}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: '36px',
        zIndex: 100,
        pointerEvents: 'auto',
        background: 'rgba(5,12,24,0.92)',
        borderTop: '1px solid rgba(248,113,113,0.12)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}>
        <AlertTicker />
      </div>

      {}
      <div style={{
        position: 'fixed',
        bottom: '48px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
          <button
            onClick={handleZoomInStep}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '8px',
              border: '1px solid rgba(56,189,248,0.3)',
              background: 'rgba(5,12,24,0.85)',
              color: '#94a3b8', cursor: 'pointer', fontSize: '11px',
              fontFamily: 'monospace', letterSpacing: '0.05em',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Plus className="w-3.5 h-3.5" /> Zoom In
          </button>
          <button
            onClick={handleZoomOutStep}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '8px',
              border: '1px solid rgba(56,189,248,0.3)',
              background: 'rgba(5,12,24,0.85)',
              color: '#94a3b8', cursor: 'pointer', fontSize: '11px',
              fontFamily: 'monospace', letterSpacing: '0.05em',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Minus className="w-3.5 h-3.5" /> Zoom Out
          </button>
          <button
            onClick={handleZoomOutToWorld}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '8px',
              border: '1px solid rgba(56,189,248,0.3)',
              background: 'rgba(5,12,24,0.85)',
              color: '#94a3b8', cursor: 'pointer', fontSize: '11px',
              fontFamily: 'monospace', letterSpacing: '0.05em',
              backdropFilter: 'blur(12px)',
            }}
          >
            <LocateFixed className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        {}
        <div style={{
          pointerEvents: 'auto',
          background: 'rgba(5,12,24,0.85)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '10px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backdropFilter: 'blur(12px)',
          minWidth: '280px',
        }}>
          <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <input
            type="range" min="2020" max="2025" value={timelineYear}
            onChange={e => setTimelineYear(Number(e.target.value))}
            style={{ flex: 1, accentColor: '#38bdf8', cursor: 'pointer' }}
          />
          <span style={{ color: '#f1f5f9', fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, minWidth: '60px', textAlign: 'right' }}>
            {timelineYear}{timelineYear === 2025 ? ' (LIVE)' : ''}
          </span>
        </div>
      </div>

      {}
      {selectedCountry && (
        <CountryPanel
          country={selectedCountry}
          onClose={closeCountry}
        />
      )}

      {}
      <CinematicOverlay
        visible={cinematic.visible}
        country={cinematic.country}
        mode={cinematic.mode}
      />

      {}
      {googleMapData && (
        <GoogleMapsModal
          countryCode={googleMapData.code}
          countryName={googleMapData.name}
          latitude={googleMapData.latitude}
          longitude={googleMapData.longitude}
          onClose={() => setGoogleMapData(null)}
        />
      )}

      {}
      {showHint && !selectedCountry && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          background: 'rgba(8,15,30,0.9)',
          border: '1px solid rgba(56,189,248,0.2)',
          borderRadius: '100px',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backdropFilter: 'blur(12px)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: '16px' }}>👆</span>
          <span style={{ color: '#94a3b8', fontSize: '13px', fontFamily: 'DM Sans, sans-serif' }}>
            Tap any dot to view country health intelligence
          </span>
          <span style={{ fontSize: '16px' }}>🌍</span>
        </div>
      )}

      {}
      <NotificationToast />
    </div>
  );
}


export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
