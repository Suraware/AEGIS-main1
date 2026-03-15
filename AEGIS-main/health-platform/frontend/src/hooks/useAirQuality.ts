import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface AirQualityMeasurement {
  parameter: string;
  value: number;
  unit: string;
  lastUpdated: string;
}

export interface AirQualityData {
  country: string;
  city: string;
  measurements: AirQualityMeasurement[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export const useAirQuality = (countryCode: string) => {
  return useQuery<AirQualityData[]>({
    queryKey: ['airQuality', countryCode],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `https://api.openaq.org/v2/latest?limit=5&country=${countryCode}`,
          { timeout: 10000 }
        );
        
        if (!response.data.results || response.data.results.length === 0) {
          return [];
        }
        
        return response.data.results.map((result: any) => ({
          country: result.country,
          city: result.city,
          measurements: result.measurements.map((m: any) => ({
            parameter: m.parameter,
            value: m.value,
            unit: m.unit,
            lastUpdated: m.lastUpdated,
          })),
          coordinates: {
            latitude: result.coordinates.latitude,
            longitude: result.coordinates.longitude,
          },
        }));
      } catch (error) {
        console.warn('OpenAQ API failed', error);
        return [];
      }
    },
    enabled: !!countryCode,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
    retry: 2,
  });
};
