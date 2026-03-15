import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface WHOAlert {
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

export const useWHOAlerts = () => {
  return useQuery<WHOAlert[]>({
    queryKey: ['whoAlerts'],
    queryFn: async () => {
      try {
        
        const response = await axios.get(
          'https://www.who.int/rss-feeds/news-english.xml',
          { 
            timeout: 15000,
            headers: { 'Accept': 'application/xml, text/xml' }
          }
        );
        
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        const alerts: WHOAlert[] = [];
        items.forEach((item, index) => {
          if (index < 10) { 
            alerts.push({
              title: item.querySelector('title')?.textContent || '',
              description: item.querySelector('description')?.textContent?.replace(/<[^>]+>/g, '') || '',
              link: item.querySelector('link')?.textContent || '',
              pubDate: item.querySelector('pubDate')?.textContent || '',
            });
          }
        });
        
        return alerts;
      } catch (error) {
        console.warn('WHO RSS feed failed', error);
        
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, 
    refetchInterval: 60 * 1000, 
    retry: 2,
  });
};
