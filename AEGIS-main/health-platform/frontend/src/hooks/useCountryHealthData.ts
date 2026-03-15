import { useQueries } from '@tanstack/react-query';
import axios from 'axios';

const HEALTH_API = import.meta.env.VITE_HEALTH_SERVICE_URL?.replace(/\/$/, '') || 'http://localhost:8081';
const API_ENDPOINT = `${HEALTH_API}/api/health`;

export const useCountryHealthData = (countryCode: string | null, countryName: string | undefined) => {
    const result = useQueries({
        queries: [
            {
                queryKey: ['health', countryCode, 'disease'],
                queryFn: () => axios.get(`${API_ENDPOINT}/${countryCode}/disease`).then(res => res.data),
                enabled: !!countryCode,
                staleTime: 5 * 60 * 1000,
                retry: 2,
            },
            {
                queryKey: ['health', countryCode, 'hospitals'],
                queryFn: () => axios.get(`${API_ENDPOINT}/${countryCode}/hospitals`).then(res => res.data),
                enabled: !!countryCode,
                staleTime: 5 * 60 * 1000,
                retry: 2,
            },
            {
                queryKey: ['health', countryCode, 'airquality'],
                queryFn: () => axios.get(`${API_ENDPOINT}/${countryCode}/airquality`).then(res => res.data),
                enabled: !!countryCode,
                staleTime: 5 * 60 * 1000,
                retry: 2,
            },
            {
                queryKey: ['health', countryCode, 'wastewater'],
                queryFn: () => axios.get(`${API_ENDPOINT}/${countryCode}/wastewater`).then(res => res.data),
                enabled: !!countryCode,
                staleTime: 5 * 60 * 1000,
                retry: 2,
            },
            {
                queryKey: ['health', countryCode, 'trials'],
                queryFn: () => axios.get(`${API_ENDPOINT}/${countryCode}/trials`).then(res => res.data),
                enabled: !!countryCode,
                staleTime: 5 * 60 * 1000,
                retry: 2,
            },
            {
                queryKey: ['health', countryCode, 'news'],
                queryFn: () => axios.get(`${API_ENDPOINT}/${countryCode}/news?countryName=${encodeURIComponent(countryName || '')}`).then(res => res.data),
                enabled: !!countryCode && !!countryName,
                staleTime: 5 * 60 * 1000,
                retry: 2,
            },
        ],
    });

    return {
        disease: result[0],
        hospitals: result[1],
        airQuality: result[2],
        wastewater: result[3],
        trials: result[4],
        news: result[5],
        isLoading: result.some(r => r.isLoading),
        error: result.find(r => r.error)?.error,
    };
};
