import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    X, Activity, Wind, FlaskConical, Newspaper, ShieldAlert, ExternalLink, 
    AlertCircle, TrendingUp, Clock, Info
} from 'lucide-react';
import { useCovidData } from '../hooks/useCovidData';
import { useHealthNews } from '../hooks/useHealthNews';
import { useWHOAlerts } from '../hooks/useWHOAlerts';
import { useAirQuality } from '../hooks/useAirQuality';
import { useClinicalTrials } from '../hooks/useClinicalTrials';

interface Props {
    countryCode: string;
    countryName: string;
    onClose: () => void;
}

const SectionSkeleton = () => (
    <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-cyan-500/20 p-4 rounded-lg animate-pulse space-y-3">
        <div className="h-4 w-1/3 bg-slate-700/50 rounded" />
        <div className="h-20 w-full bg-slate-700/30 rounded" />
    </div>
);

const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-red-400" />
        <p className="text-xs text-red-300">{message}</p>
    </div>
);

export const CountryHealthPanel: React.FC<Props> = ({ countryCode, countryName, onClose }) => {
    
    const covidQuery = useCovidData(countryCode);
    const newsQuery = useHealthNews(countryName);
    const whoQuery = useWHOAlerts();
    const airQualityQuery = useAirQuality(countryCode);
    const trialsQuery = useClinicalTrials(countryName);

    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 768);
        handler();
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    const containerVariants = {
        hidden: isMobile ? { y: '100%', opacity: 0 } : { x: '100%', opacity: 0 },
        visible: {
            x: 0,
            y: 0,
            opacity: 1,
            transition: { type: 'spring' as const, damping: 25, stiffness: 200, staggerChildren: 0.08 }
        },
        exit: isMobile 
            ? { y: '100%', opacity: 0, transition: { ease: 'easeInOut' as const, duration: 0.3 } }
            : { x: '100%', opacity: 0, transition: { ease: 'easeInOut' as const, duration: 0.3 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const formatNumber = (num: number) => {
        if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
        if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
        return num.toString();
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <motion.aside
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            drag={isMobile ? 'y' : false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_: any, info: any) => {
                if (isMobile && (info.offset.y > 100 || info.velocity.y > 500)) onClose();
            }}
            className={`
                fixed ${isMobile ? 'bottom-0 left-0 right-0 h-[80vh]' : 'right-0 top-0 h-full w-[400px]'}
                bg-[rgba(10,18,36,0.95)] backdrop-blur-2xl 
                ${isMobile ? 'border-t rounded-t-3xl' : 'border-l'} border-cyan-500/20 
                z-[60] flex flex-col shadow-2xl overflow-hidden
            `}
        >
            {}
            {isMobile && (
                <div className="w-16 h-1.5 bg-slate-600/50 rounded-full mx-auto mt-3 mb-2 shrink-0" />
            )}

            {}
            <motion.div variants={itemVariants} className="p-6 border-b border-cyan-500/20 bg-gradient-to-br from-slate-900/50 to-transparent shrink-0">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <img 
                            src={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`}
                            alt={countryName}
                            className="w-10 h-7 object-cover rounded border border-cyan-500/30 shadow-lg"
                        />
                        <div>
                            <h2 className="text-xl font-orbitron font-bold text-white tracking-tight">{countryName}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700">{countryCode}</span>
                                <div className="flex items-center gap-1.5">
                                    <motion.div 
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                                    />
                                    <span className="text-[9px] text-green-400 font-medium uppercase tracking-wider">Live</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors border border-transparent hover:border-cyan-500/30"
                    >
                        <X className="w-5 h-5 text-slate-400 hover:text-white" />
                    </button>
                </div>
            </motion.div>

            {}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

                {}
                <motion.section variants={itemVariants} className="space-y-3">
                    <h3 className="text-xs text-cyan-400 uppercase font-bold tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4" /> COVID-19 Statistics
                    </h3>
                    {covidQuery.isLoading && <SectionSkeleton />}
                    {covidQuery.error && <ErrorDisplay message="Unable to load COVID-19 data" />}
                    {covidQuery.data && (
                        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-cyan-500/20 p-4 rounded-lg space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-900/50 p-3 rounded border border-slate-700/50">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Total Cases</p>
                                    <p className="text-xl font-orbitron font-bold text-white">{formatNumber(covidQuery.data.cases)}</p>
                                    <p className="text-[9px] text-cyan-400 mt-1">+{formatNumber(covidQuery.data.todayCases)} today</p>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded border border-slate-700/50">
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Active</p>
                                    <p className="text-xl font-orbitron font-bold text-orange-400">{formatNumber(covidQuery.data.active)}</p>
                                    <p className="text-[9px] text-slate-500 mt-1">{formatNumber(covidQuery.data.critical)} critical</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-green-900/20 p-2 rounded border border-green-500/30">
                                    <p className="text-[8px] text-green-400 font-bold uppercase">Recovered</p>
                                    <p className="text-sm font-bold text-green-300">{formatNumber(covidQuery.data.recovered)}</p>
                                </div>
                                <div className="bg-red-900/20 p-2 rounded border border-red-500/30">
                                    <p className="text-[8px] text-red-400 font-bold uppercase">Deaths</p>
                                    <p className="text-sm font-bold text-red-300">{formatNumber(covidQuery.data.deaths)}</p>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-slate-700/50 text-[9px] text-slate-500">
                                <p>Tests: {formatNumber(covidQuery.data.tests)} | Population: {formatNumber(covidQuery.data.population)}</p>
                            </div>
                        </div>
                    )}
                </motion.section>

                {}
                <motion.section variants={itemVariants} className="space-y-3">
                    <h3 className="text-xs text-sky-400 uppercase font-bold tracking-widest flex items-center gap-2">
                        <Wind className="w-4 h-4" /> Air Quality
                    </h3>
                    {airQualityQuery.isLoading && <SectionSkeleton />}
                    {airQualityQuery.error && <ErrorDisplay message="Unable to load air quality data" />}
                    {airQualityQuery.data && airQualityQuery.data.length > 0 ? (
                        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-cyan-500/20 p-4 rounded-lg space-y-3">
                            {airQualityQuery.data.slice(0, 3).map((location, idx) => (
                                <div key={idx} className="bg-slate-900/50 p-3 rounded border border-slate-700/50">
                                    <p className="text-[10px] font-bold text-white mb-2">{location.city}</p>
                                    <div className="grid grid-cols-2 gap-2 text-[9px]">
                                        {location.measurements.slice(0, 4).map((m, i) => (
                                            <div key={i} className="flex justify-between">
                                                <span className="text-slate-400 uppercase">{m.parameter}</span>
                                                <span className="text-sky-300 font-bold">{m.value.toFixed(1)} {m.unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-900/30 border border-slate-700/50 p-4 rounded-lg text-center">
                            <p className="text-xs text-slate-500">No air quality data available</p>
                        </div>
                    )}
                </motion.section>

                {}
                <motion.section variants={itemVariants} className="space-y-3">
                    <h3 className="text-xs text-violet-400 uppercase font-bold tracking-widest flex items-center gap-2">
                        <FlaskConical className="w-4 h-4" /> Clinical Trials
                    </h3>
                    {trialsQuery.isLoading && <SectionSkeleton />}
                    {trialsQuery.error && <ErrorDisplay message="Unable to load clinical trials" />}
                    {trialsQuery.data && trialsQuery.data.length > 0 ? (
                        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-cyan-500/20 p-4 rounded-lg space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-3xl font-orbitron font-black text-white">{trialsQuery.data.length}</span>
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Active Trials</span>
                            </div>
                            {trialsQuery.data.slice(0, 3).map((trial, idx) => (
                                <div key={idx} className="bg-slate-900/50 p-3 rounded border border-slate-700/50 space-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-[10px] font-bold text-violet-300 line-clamp-2 flex-1">{trial.title}</p>
                                        <span className="text-[8px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded border border-violet-500/30 font-bold shrink-0">{trial.phase}</span>
                                    </div>
                                    {trial.conditions[0] && (
                                        <p className="text-[9px] text-slate-500">{trial.conditions[0]}</p>
                                    )}
                                    <div className="flex items-center justify-between text-[8px] text-slate-600 pt-1">
                                        <span>{trial.status}</span>
                                        <span>{trial.nctId}</span>
                                    </div>
                                </div>
                            ))}
                            <a
                                href={`https://clinicaltrials.gov/search?cond=&country=${countryName}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors rounded"
                            >
                                View All Trials <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    ) : (
                        <div className="bg-slate-900/30 border border-slate-700/50 p-4 rounded-lg text-center">
                            <p className="text-xs text-slate-500">No clinical trials found</p>
                        </div>
                    )}
                </motion.section>

                {}
                <motion.section variants={itemVariants} className="space-y-3">
                    <h3 className="text-xs text-emerald-400 uppercase font-bold tracking-widest flex items-center gap-2">
                        <Newspaper className="w-4 h-4" /> Health News
                    </h3>
                    {newsQuery.isLoading && <SectionSkeleton />}
                    {newsQuery.error && <ErrorDisplay message="Unable to load news" />}
                    {newsQuery.data && newsQuery.data.articles.length > 0 && (
                        <div className="space-y-3">
                            {newsQuery.data.articles.slice(0, 3).map((article, idx) => (
                                <div key={idx} className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-cyan-500/20 p-3 rounded-lg hover:border-cyan-500/40 transition-colors group">
                                    <div className="flex justify-between items-start mb-1.5">
                                        <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">{article.source.name}</span>
                                        <span className="text-[8px] text-slate-500">{formatDate(article.publishedAt)}</span>
                                    </div>
                                    <h4 className="text-[11px] font-bold text-white leading-tight line-clamp-2 group-hover:text-cyan-300 transition-colors">
                                        {article.title}
                                    </h4>
                                    <p className="text-[9px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                        {article.description}
                                    </p>
                                    <a
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[9px] font-bold text-cyan-400 uppercase tracking-wider mt-2 hover:text-cyan-300 transition-colors"
                                    >
                                        Read More <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.section>

                {}
                <motion.section variants={itemVariants} className="space-y-3">
                    <h3 className="text-xs text-amber-400 uppercase font-bold tracking-widest flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" /> WHO Global Alerts
                    </h3>
                    {whoQuery.isLoading && <SectionSkeleton />}
                    {whoQuery.error && <ErrorDisplay message="Unable to load WHO alerts" />}
                    {whoQuery.data && whoQuery.data.length > 0 && (
                        <div className="space-y-2">
                            {whoQuery.data.slice(0, 3).map((alert, idx) => (
                                <div key={idx} className="bg-amber-900/10 border border-amber-500/30 p-3 rounded-lg">
                                    <h4 className="text-[10px] font-bold text-amber-300 leading-tight line-clamp-2 mb-1">
                                        {alert.title}
                                    </h4>
                                    <p className="text-[9px] text-amber-100/70 line-clamp-2 mb-2">{alert.description}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[8px] text-amber-600">{formatDate(alert.pubDate)}</span>
                                        <a
                                            href={alert.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[8px] text-amber-400 hover:text-amber-300 font-bold uppercase flex items-center gap-1"
                                        >
                                            Details <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.section>

                {}
                <motion.section variants={itemVariants} className="pt-6 border-t border-slate-700/50 space-y-3 pb-8">
                    <h4 className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Info className="w-3 h-3" /> Data Sources
                    </h4>
                    <div className="grid grid-cols-1 gap-2 text-[9px]">
                        {[
                            { name: 'disease.sh', url: 'https://disease.sh' },
                            { name: 'OpenAQ Air Quality', url: 'https://openaq.org' },
                            { name: 'ClinicalTrials.gov', url: 'https://clinicaltrials.gov' },
                            { name: 'GNews Health', url: 'https://gnews.io' },
                            { name: 'WHO News', url: 'https://www.who.int' },
                        ].map((source, idx) => (
                            <a
                                key={idx}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-500 hover:text-cyan-400 font-mono transition-colors flex items-center justify-between group"
                            >
                                <span>{source.name}</span>
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        ))}
                    </div>
                    <p className="text-[8px] text-slate-600 leading-relaxed">
                        All data refreshed every 30 seconds from free public APIs. No API keys required.
                    </p>
                </motion.section>

            </div>
        </motion.aside>
    );
};
