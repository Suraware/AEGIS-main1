import React, { useRef } from 'react';
import Globe from './components/Globe';
import { useStore } from './stores/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Activity, X, Shield, Wind, Droplets, Network, Globe2, Bell, ShieldAlert, Cpu } from 'lucide-react';
import AlertTicker from './components/AlertTicker';
import { CountryHealthPanel } from './components/CountryHealthPanel';

export default function GlobalHealthApp() {
    const { selectedCountry, setSelectedCountry, layers, toggleLayer } = useStore();
    const globeRef = useRef<any>(null);

    const layerConfig = [
        { id: 'disease', label: 'Outbreaks', icon: <Activity className="w-4 h-4" /> },
        { id: 'hospital', label: 'Hospitals', icon: <Shield className="w-4 h-4" /> },
        { id: 'airQuality', label: 'Air Quality', icon: <Wind className="w-4 h-4" /> },
        { id: 'wastewater', label: 'Wastewater', icon: <Droplets className="w-4 h-4" /> }
    ];

    return (
        <div className="relative w-full h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden">
            {}
            <div className={`absolute inset-0 z-0 transition-all duration-700 ease-in-out ${selectedCountry ? 'md:right-[420px]' : 'right-0'}`}>
                <Globe />
            </div>

            {}
            <header className="absolute top-0 w-full h-16 glass-panel border-t-0 border-x-0 rounded-none z-20 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/50">
                        <Globe2 className="w-6 h-6 text-blue-400" />
                        <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-md animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300 tracking-tight">
                            Aegis Global
                        </h1>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-blue-200/70 font-semibold -mt-1">
                            Health Intelligence Platform
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative flex items-center glass-panel rounded-full px-4 py-1.5 w-64 border-slate-700/60">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search region or anomaly..."
                            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-slate-500 ml-2"
                        />
                    </div>
                    <button className="relative p-2 rounded-full hover:bg-slate-800/50 transition-colors">
                        <Bell className="w-5 h-5 text-slate-300" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[#020617] animate-ping" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[#020617]" />
                    </button>
                </div>
            </header>

            {}
            <div className="absolute top-24 left-6 z-20 flex flex-col gap-4 w-64">
                <div className="glass-panel p-5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Network className="w-5 h-5 text-blue-400" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-100">Telemetry Layers</h2>
                    </div>

                    <div className="space-y-2">
                        {layerConfig.map((l) => (
                            <button
                                key={l.id}
                                onClick={() => toggleLayer(l.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 border ${layers[l.id as keyof typeof layers]
                                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                        : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800/70 hover:border-slate-600/50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${layers[l.id as keyof typeof layers] ? 'bg-blue-500/30' : 'bg-slate-700/50'}`}>
                                        {l.icon}
                                    </div>
                                    <span className="text-sm font-semibold">{l.label}</span>
                                </div>
                                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${layers[l.id as keyof typeof layers] ? 'bg-blue-500' : 'bg-slate-700'}`}>
                                    <motion.div
                                        layout
                                        className="w-3 h-3 rounded-full bg-white shadow-sm"
                                        animate={{ x: layers[l.id as keyof typeof layers] ? 16 : 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {}
                <div className="glass-panel p-5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <Cpu className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">System Status</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Nodes Active</p>
                            <p className="text-xl font-bold text-emerald-400">1,402</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Threat Lvl</p>
                            <p className="text-xl font-bold text-amber-400">ELEVATED</p>
                        </div>
                    </div>
                </div>
            </div>

            {}
            <AnimatePresence>
                {selectedCountry && (
                    <CountryHealthPanel
                        countryCode={selectedCountry.code}
                        countryName={selectedCountry.name}
                        onClose={() => setSelectedCountry(null)}
                    />
                )}
            </AnimatePresence>

            <AlertTicker />
        </div>
    );
}