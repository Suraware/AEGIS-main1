import { Activity, AlertTriangle, ShieldAlert, Info, Radio } from 'lucide-react';
import { useStore } from '../stores/useStore';

const AlertTicker = () => {
    const alerts = useStore((state) => state.alerts);

    return (
        <div className="flex-1 w-full h-8 flex items-center overflow-hidden bg-transparent">
            {}
            <div className="flex-1 overflow-hidden relative w-full">
                <div className="flex items-center gap-16 animate-ticker whitespace-nowrap px-4 font-rajdhani">
                    {[...alerts, ...alerts].map((alert, i) => (
                        <div key={i < alerts.length ? `a-${alert.id}` : `b-${alert.id}`} className="flex items-center gap-2">
                            {alert.type === 'critical' ? (
                                <ShieldAlert className="w-3.5 h-3.5 text-aegis-alert-red shrink-0 animate-hud-pulse" />
                            ) : alert.type === 'warning' ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-aegis-alert-orange shrink-0" />
                            ) : (
                                <Info className="w-3.5 h-3.5 text-aegis-accent shrink-0" />
                            )}
                            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border text-slate-300 uppercase tracking-wider shrink-0"
                                style={{ borderColor: alert.type === 'critical' ? 'rgba(255,34,0,0.5)' : alert.type === 'warning' ? 'rgba(255,102,0,0.5)' : 'rgba(0,212,255,0.5)', background: 'rgba(10,22,40,0.8)' }}>
                                {alert.source}
                            </span>
                            <span className={`text-[9px] sm:text-[10px] ${
                                alert.type === 'critical' ? 'text-aegis-alert-red drop-shadow-[0_0_5px_rgba(255,34,0,0.8)] font-semibold' :
                                    alert.type === 'warning' ? 'text-aegis-alert-orange drop-shadow-[0_0_5px_rgba(255,102,0,0.8)]' : 'text-slate-200'
                            }`}>
                                {alert.message}
                            </span>
                        </div>
                    ))}

                    {!alerts.length && (
                        <div className="flex items-center gap-3 italic text-aegis-accent/60 text-sm tracking-widest font-semibold">
                            <Activity className="w-4 h-4 animate-radar-sweep" />
                            ESTABLISHING GLOBAL SURVEILLANCE SATELLITE UPLINK — ALL SECTORS NOMINAL
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertTicker;