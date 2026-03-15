import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

export interface HealthNewsData {
  articles: NewsArticle[];
  totalArticles: number;
}

export const useHealthNews = (countryName: string) => {
  return useQuery<HealthNewsData>({
    queryKey: ['healthNews', countryName],
    queryFn: async () => {
      try {
        
        const searchQuery = encodeURIComponent(`health ${countryName}`);
        const response = await axios.get(
          `https://gnews.io/api/v4/search?q=${searchQuery}&lang=en&max=5`,
          { timeout: 10000 }
        );
        return {
          articles: response.data.articles || [],
          totalArticles: response.data.totalArticles || 0,
        };
      } catch (error) {
        
        console.warn('GNews API failed, using fallback', error);
        return {
          articles: [
            {
              title: `Health Update: ${countryName}`,
              description: 'Real-time health news temporarily unavailable. Please check back later.',
              url: '#',
              image: '',
              publishedAt: new Date().toISOString(),
              source: { name: 'AEGIS', url: '#' },
            },
          ],
          totalArticles: 1,
        };
      }
    },
    enabled: !!countryName,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
    retry: 1,
  });
};
