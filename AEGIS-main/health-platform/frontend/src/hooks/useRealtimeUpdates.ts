

import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '../stores/useStore';

export interface RealtimeAlert {
    id: string;
    countryCode: string;
    countryName: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
    type: 'disease' | 'weather' | 'health' | 'news';
    timestamp: number;
    data?: Record<string, any>;
}

export interface RealtimeMetric {
    countryCode: string;
    metric: string;
    value: number;
    timestamp: number;
    change?: number; 
}


const generateRealtimeAlerts = (): RealtimeAlert[] => {
    const countries = ['NG', 'US', 'IN', 'BR', 'JP', 'GB', 'DE', 'FR', 'IT', 'ES', 'MX', 'CA', 'AU', 'ZA', 'KR'];
    const diseases = ['Flu Season Peak', 'Dengue Outbreak', 'Cholera Alert', 'Measles Case', 'COVID-19 Spike', 'RSV Increase', 'Mpox Detection'];
    const severities: ('info' | 'warning' | 'critical')[] = ['info', 'warning', 'critical'];
    
    return Array(Math.floor(Math.random() * 3) + 1)
        .fill(0)
        .map(() => {
            const country = countries[Math.floor(Math.random() * countries.length)];
            const disease = diseases[Math.floor(Math.random() * diseases.length)];
            const severity = severities[Math.floor(Math.random() * severities.length)];
            
            return {
                id: `alert-${Date.now()}-${Math.random()}`,
                countryCode: country,
                countryName: country,
                message: `${disease} detected in ${country}`,
                severity,
                type: 'disease',
                timestamp: Date.now(),
                data: {
                    cases: Math.floor(Math.random() * 1000) + 50,
                    trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
                },
            };
        });
};


const generateRealtimeMetrics = (): RealtimeMetric[] => {
    const countries = ['NG', 'US', 'IN', 'BR', 'JP', 'GB', 'DE', 'FR'];
    const metrics = ['covidCases', 'hospitalization', 'aqi', 'vaccinated'];
    
    return countries.map(country => ({
        countryCode: country,
        metric: metrics[Math.floor(Math.random() * metrics.length)],
        value: Math.floor(Math.random() * 1000) + 100,
        timestamp: Date.now(),
        change: (Math.random() - 0.5) * 20, 
    }));
};


export const useRealtimeUpdates = (enabled: boolean = true) => {
    const { addAlert } = useStore();
        const alertIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!enabled) return;

        
        const initialAlerts = generateRealtimeAlerts();
        initialAlerts.forEach(alert => {
            addAlert({
                id: alert.id,
                country: alert.countryName,
                message: alert.message,
                timestamp: new Date(alert.timestamp).toISOString(),
                    type: alert.severity as 'info' | 'warning' | 'critical',
                source: alert.type,
            });
        });

        
        alertIntervalRef.current = setInterval(() => {
            const newAlerts = generateRealtimeAlerts();
            newAlerts.forEach(alert => {
                
                if (alert.severity === 'critical' || Math.random() > 0.7) {
                    addAlert({
                        id: alert.id,
                        country: alert.countryName,
                        message: alert.message,
                        timestamp: new Date(alert.timestamp).toISOString(),
                            type: alert.severity as 'info' | 'warning' | 'critical',
                        source: alert.type,
                    });
                }
            });
        }, 30000); 

        return () => {
            if (alertIntervalRef.current) {
                clearInterval(alertIntervalRef.current);
            }
        };
    }, [enabled, addAlert]);

    return {
        generateRealtimeAlerts,
        generateRealtimeMetrics,
    };
};


export const fetchGlobalHealthStats = async () => {
    try {
        
        const response = await fetch('https://disease.sh/v3/covid-19/all');
        if (!response.ok) throw new Error('Failed to fetch');
        return await response.json();
    } catch (error) {
        console.error('Error fetching global health stats:', error);
        return null;
    }
};


export const fetchLiveAirQuality = async (lat: number, lon: number) => {
    try {
        const response = await fetch(
            `https://api.waqi.info/feed/geo:${lat};${lon}/?token=demo`
        );
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching air quality:', error);
        return null;
    }
};


export const getHealthAlertsStream = async () => {
    const alerts = [];
    try {
        
        const covidResponse = await fetch('https://disease.sh/v3/covid-19/countries');
        if (covidResponse.ok) {
            const countries = await covidResponse.json();
            const topCountries = countries
                .sort((a: any, b: any) => b.cases - a.cases)
                .slice(0, 5);
            
            alerts.push(
                ...topCountries.map((country: any) => ({
                    id: `covid-${country.countryInfo.iso2}`,
                    countryCode: country.countryInfo.iso2,
                    countryName: country.country,
                    message: `COVID-19: ${country.todayDeaths} new deaths, ${country.todayCases} new cases`,
                    severity: country.todayCases > 10000 ? 'critical' : 'warning',
                    type: 'disease' as const,
                    timestamp: Date.now(),
                    data: {
                        cases: country.cases,
                        deaths: country.deaths,
                        recovered: country.recovered,
                    },
                }))
            );
        }
    } catch (error) {
        console.error('Error fetching health alerts:', error);
    }

    return alerts;
};


export const fetchHealthNews = async () => {
    try {
        
        const response = await fetch(
            'https://newsapi.org/v2/everything?q=health&sortBy=publishedAt&language=en&pageSize=10'
        );
        
        if (!response.ok) return [];
        const data = await response.json();
        return data.articles || [];
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
};


export const connectRealtimeSocket = (
    url: string,
    onMessage: (data: any) => void,
    onError: (error: Error) => void
) => {
    let ws: WebSocket | null = null;

    try {
        ws = new WebSocket(url);

        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.onerror = (event) => {
            console.error('WebSocket error:', event);
            onError(new Error('WebSocket connection failed'));
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };
    } catch (error) {
        onError(error as Error);
    }

    return () => {
        if (ws) {
            ws.close();
        }
    };
};
