import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, AlertTriangle, Eye } from 'lucide-react';

interface LiveMetric {
    name: string;
    value: number;
    change: number;
    icon: React.ReactNode;
    color: string;
}

export const LiveAnalyticsDash: React.FC = () => {
    const [metrics, setMetrics] = useState<LiveMetric[]>([
        {
            name: 'Active Alerts',
            value: 48,
            change: 12,
            icon: <AlertTriangle className="w-5 h-5" />,
            color: 'text-red-400',
        },
        {
            name: 'Monitoring Stations',
            value: 1248,
            change: 8,
            icon: <Activity className="w-5 h-5" />,
            color: 'text-blue-400',
        },
        {
            name: 'Data Points/Hour',
            value: 52400,
            change: -3,
            icon: <Eye className="w-5 h-5" />,
            color: 'text-cyan-400',
        },
        {
            name: 'Network Latency',
            value: 12,
            change: -5,
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'text-emerald-400',
        },
    ]);

    const [chartData, setChartData] = useState<any[]>([
        { time: '00:00', alerts: 12 },
        { time: '04:00', alerts: 15 },
        { time: '08:00', alerts: 28 },
        { time: '12:00', alerts: 34 },
        { time: '16:00', alerts: 48 },
        { time: '20:00', alerts: 42 },
        { time: '24:00', alerts: 38 },
    ]);

    useEffect(() => {
        
        const interval = setInterval(() => {
            setMetrics(prev =>
                prev.map(metric => ({
                    ...metric,
                    value: metric.value + Math.floor((Math.random() - 0.5) * 10),
                    change: Math.floor((Math.random() - 0.5) * 20),
                }))
            );

            
            setChartData(prev => [
                ...prev.slice(1),
                {
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    alerts: Math.floor(Math.random() * 60) + 20,
                },
            ]);
        }, 5000); 

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-4">
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, idx) => (
                    <div
                        key={idx}
                        className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-cyan-500/50 transition"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className={`${metric.color}`}>{metric.icon}</div>
                            <span
                                className={`text-xs font-bold ${
                                    metric.change > 0 ? 'text-red-400' : 'text-green-400'
                                }`}
                            >
                                {metric.change > 0 ? '+' : ''}{metric.change}%
                            </span>
                        </div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider">{metric.name}</p>
                        <p className="text-2xl font-bold text-white mt-1">
                            {metric.value.toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>

            {}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <h3 className="text-cyan-300 font-bold uppercase tracking-wider mb-4">
                    Alert Trends (Last 24h)
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.2)" />
                        <XAxis dataKey="time" stroke="rgba(148,163,184,0.6)" />
                        <YAxis stroke="rgba(148,163,184,0.6)" />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(15,23,42,0.9)',
                                border: '1px solid rgba(0,212,255,0.3)',
                                borderRadius: '8px',
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="alerts"
                            stroke="#00d4ff"
                            dot={{ fill: '#00d4ff', r: 4 }}
                            strokeWidth={2}
                            name="Active Alerts"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
