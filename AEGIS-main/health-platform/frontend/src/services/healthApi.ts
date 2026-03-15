

import axios from 'axios';
import { CountryHealthData } from '../stores/useStore';


const REGION_BASE_RISK: Record<string, number> = {
    'US': 42, 'GB': 38, 'DE': 22, 'FR': 30, 'IT': 35, 'JP': 18, 'CN': 55,
    'IN': 60, 'BR': 65, 'RU': 48, 'AU': 20, 'CA': 28, 'MX': 58, 'ZA': 70,
    'NG': 75, 'EG': 62, 'KE': 68, 'PK': 72, 'BD': 74, 'PH': 55,
};

const COUNTRY_NAMES: Record<string, string> = {
    'US': 'United States', 'GB': 'United Kingdom', 'DE': 'Germany', 'FR': 'France',
    'IT': 'Italy', 'JP': 'Japan', 'CN': 'China', 'IN': 'India', 'BR': 'Brazil',
    'RU': 'Russia', 'AU': 'Australia', 'CA': 'Canada', 'MX': 'Mexico', 'ZA': 'South Africa',
    'NG': 'Nigeria', 'EG': 'Egypt', 'KE': 'Kenya', 'PK': 'Pakistan', 'BD': 'Bangladesh',
    'PH': 'Philippines', 'ID': 'Indonesia', 'AR': 'Argentina', 'CO': 'Colombia',
    'ET': 'Ethiopia', 'TZ': 'Tanzania', 'SD': 'Sudan', 'DZ': 'Algeria', 'MA': 'Morocco',
    'SA': 'Saudi Arabia', 'IQ': 'Iraq', 'VN': 'Vietnam', 'TR': 'Turkey',
    'ES': 'Spain', 'PL': 'Poland', 'UA': 'Ukraine', 'SV': 'El Salvador',
};

const FLU_LEVELS = ['Minimal', 'Low', 'Moderate', 'High', 'Very High'];
const WASTEWATER_SIGNALS = ['None Detected', 'Minimal', 'Low', 'Moderate', 'Elevated', 'High'];

export const fetchCDCCovidData = async (): Promise<Record<string, number>> => {
    try {
        const res = await axios.get(
            'https://data.cdc.gov/resource/9mfq-cb36.json?$limit=10&$order=end_date DESC',
            { timeout: 8000 }
        );
        
        const latest = res.data[0];
        return { US: parseInt(latest?.tot_cases || '0', 10) };
    } catch {
        return { US: 1240000 };
    }
};

export const fetchOpenAQData = async (countryCode: string): Promise<{ average: number, cities: { city: string, aqi: number }[] }> => {
    try {
        const res = await axios.get(
            `https://api.openaq.org/v3/locations?limit=5&country_id=${countryCode}&order_by=lastUpdated&sort_order=desc`,
            { timeout: 8000 }
        );
        const locations = res.data?.results || [];
        if (!locations.length) {
            const avg = Math.floor(Math.random() * 80 + 20);
            return { average: avg, cities: [{ city: 'Capital', aqi: avg - 5 }, { city: 'North Hub', aqi: avg + 10 }, { city: 'Port', aqi: avg }] };
        }

        const cities: { city: string, aqi: number }[] = [];
        let total = 0;

        locations.forEach((loc: any) => {
            const pm25 = loc.parameters?.find((p: any) => p.parameter === 'pm25');
            const aqiVal = pm25?.lastValue || 40;
            total += aqiVal;
            if (loc.name && cities.length < 3) {
                cities.push({ city: loc.name.split(',')[0].trim(), aqi: Math.floor(aqiVal) });
            }
        });

        
        if (cities.length < 3) {
            const avg = Math.floor(total / locations.length);
            cities.push({ city: 'Metro 1', aqi: avg }, { city: 'District 2', aqi: avg + 10 }, { city: 'Area 3', aqi: avg - 10 });
        }

        return {
            average: Math.min(300, Math.floor(total / locations.length)),
            cities: cities.slice(0, 3)
        };
    } catch {
        const avg = Math.floor(Math.random() * 80 + 20);
        return { average: avg, cities: [{ city: 'Capital', aqi: avg - 5 }, { city: 'North', aqi: avg + 10 }, { city: 'Port', aqi: avg }] };
    }
};

export const fetchClinicalTrials = async (countryCode: string): Promise<number> => {
    try {
        const res = await axios.get(
            `https://clinicaltrials.gov/api/v2/studies?query.locn=${countryCode}&filter.overallStatus=RECRUITING&pageSize=1`,
            { timeout: 8000 }
        );
        return res.data?.totalCount || Math.floor(Math.random() * 500 + 50);
    } catch {
        return Math.floor(Math.random() * 500 + 50);
    }
};

export const generateCountryHealthData = async (
    countryCode: string
): Promise<CountryHealthData> => {
    const baseRisk = REGION_BASE_RISK[countryCode] ?? 40;
    const riskScore = Math.min(100, baseRisk);

    
    const sparklineData = Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        cases: Math.floor(Math.random() * 50000 + 10000 + i * 500),
    }));

    const aqiData = await fetchOpenAQData(countryCode);
    const trials = await fetchClinicalTrials(countryCode);

    return {
        code: countryCode,
        name: COUNTRY_NAMES[countryCode] ?? countryCode,
        riskScore,
        covidCases: Math.floor(Math.random() * 200000 + 5000),
        covidDeaths: Math.floor(Math.random() * 5000 + 100),
        fluLevel: FLU_LEVELS[Math.floor(riskScore / 25)],
        hospitalCapacity: Math.min(99, Math.floor(riskScore * 0.7 + Math.random() * 20)),
        aqi: aqiData.average,
        topCitiesAQI: aqiData.cities,
        wastewaterSignal: WASTEWATER_SIGNALS[Math.floor(riskScore / 20)],
        activeTrials: trials,
        population: Math.floor(Math.random() * 800000000 + 1000000),
        sparklineData,
    };
};

export const getRiskColor = (score: number): string => {
    if (score < 25) return '#22c55e';
    if (score < 50) return '#eab308';
    if (score < 75) return '#f97316';
    return '#ef4444';
};

export const getRiskLabel = (score: number): string => {
    if (score < 25) return 'Low';
    if (score < 50) return 'Moderate';
    if (score < 75) return 'High';
    return 'Critical';
};

export const fetchSnowflakeTrends = async (countryCode: string): Promise<any[]> => {
    try {
        const res = await axios.get(`http://localhost:8084/api/analytics/trends/${countryCode}`);
        return res.data;
    } catch (error) {
        console.error('Error fetching Snowflake trends:', error);
        
        return Array.from({ length: 12 }, (_, i) => ({
            date: `2024-${String(12 - i).padStart(2, '0')}-01`,
            risk_score: 30 + Math.floor(Math.random() * 40),
            covid_cases: 5000 + Math.floor(Math.random() * 10000),
            aqi: 20 + Math.floor(Math.random() * 80)
        }));
    }
};
