import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface CovidData {
  country: string;
  cases: number;
  todayCases: number;
  deaths: number;
  todayDeaths: number;
  recovered: number;
  active: number;
  critical: number;
  casesPerOneMillion: number;
  deathsPerOneMillion: number;
  tests: number;
  testsPerOneMillion: number;
  population: number;
  continent: string;
  updated: number;
}

export const useCovidData = (countryCode: string) => {
  return useQuery<CovidData>({
    queryKey: ['covid', countryCode],
    queryFn: async () => {
      const response = await axios.get(
        `https://disease.sh/v3/covid-19/countries/${countryCode}`,
        { timeout: 10000 }
      );
      return response.data;
    },
    enabled: !!countryCode,
    staleTime: 5 * 60 * 1000, 
    refetchInterval: 30 * 1000, 
    retry: 2,
  });
};
