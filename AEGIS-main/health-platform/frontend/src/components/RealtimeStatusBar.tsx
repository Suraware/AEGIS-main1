import React, { useEffect, useState } from 'react';
import { Activity, Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import { fetchGlobalHealthStats } from '../hooks/useRealtimeUpdates';

interface GlobalStats {
    cases?: number;
    deaths?: number;
    recovered?: number;
    todayCases?: number;
    todayDeaths?: number;
}

export const RealtimeStatusBar: React.FC = () => {
    const [stats, setStats] = useState<GlobalStats>({});
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            const data = await fetchGlobalHealthStats();
            if (data) {
                setStats(data);
                setLastUpdate(new Date());
            }
            setLoading(false);
        };

        fetchStats();

        
        const interval = setInterval(fetchStats, 120000);
        return () => clearInterval(interval);
    }, []);

    const formatNumber = (num: number | undefined) => {
        if (!num) return '0';
        if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
        if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-l-4 border-cyan-500/50 px-6 py-3 flex items-center gap-6 text-sm">
            {}
            <div className="flex items-center gap-2 min-w-fit">
                <Activity className="w-4 h-4 text-red-400 animate-pulse" />
                <div>
                    <p className="text-slate-400 text-xs uppercase">Global Cases</p>
                    <p className="text-white font-bold">
                        {formatNumber(stats.cases)}
                        {stats.todayCases && (
                            <span className="text-red-400 text-xs ml-2">
                                +{formatNumber(stats.todayCases)} today
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {}
            <div className="flex items-center gap-2 min-w-fit border-l border-slate-700 pl-6">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <div>
                    <p className="text-slate-400 text-xs uppercase">Deaths</p>
                    <p className="text-white font-bold">
                        {formatNumber(stats.deaths)}
                        {stats.todayDeaths && (
                            <span className="text-yellow-500 text-xs ml-2">
                                +{formatNumber(stats.todayDeaths)} today
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {}
            <div className="flex items-center gap-2 min-w-fit border-l border-slate-700 pl-6">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <div>
                    <p className="text-slate-400 text-xs uppercase">Recovered</p>
                    <p className="text-white font-bold">{formatNumber(stats.recovered)}</p>
                </div>
            </div>

            {}
            <div className="flex items-center gap-2 border-l border-slate-700 pl-6 ml-auto">
                <Zap className="w-3 h-3 text-cyan-400" />
                <div>
                    <p className="text-slate-400 text-xs uppercase">Updated</p>
                    <p className="text-cyan-300 text-xs font-mono">
                        {lastUpdate.toLocaleTimeString()}
                    </p>
                </div>
            </div>

            {loading && (
                <div className="animate-spin">
                    <Zap className="w-4 h-4 text-cyan-400" />
                </div>
            )}
        </div>
    );
};
