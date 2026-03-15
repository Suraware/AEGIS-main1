import { useEffect, useMemo, useRef } from 'react';
import { useStore } from '../stores/useStore';
import { COUNTRY_COORDINATES } from '../data/countryCoordinates';

type CountrySelection = {
    name: string;
    code: string;
};

type FeedConfig = {
    url: string;
    source: string;
    countryName: string;
};

type FeedItem = {
    id: string;
    title: string;
    source: string;
    countryName: string;
    publishedAt: string;
    link: string;
};

const GLOBAL_HEALTH_FEEDS: Array<{ source: string; url: string }> = [
    { source: 'WHO', url: 'https://www.who.int/rss-feeds/news-english.xml' },
    { source: 'UN News', url: 'https://news.un.org/feed/subscribe/en/news/topic/health/feed/rss.xml' },
    { source: 'ReliefWeb', url: 'https://reliefweb.int/updates?advanced-search=(S4603)&format=xml' },
    { source: 'ECDC', url: 'https://www.ecdc.europa.eu/en/taxonomy/term/1744/feed' },
];

const COUNTRY_BATCH_SIZE = 12;

const toRssSearchUrl = (query: string) =>
    `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;

const parseRss = (xmlText: string, fallbackSource: string, fallbackCountry: string): FeedItem[] => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'text/xml');
    const parseErrors = xml.getElementsByTagName('parsererror');
    if (parseErrors.length > 0) return [];

    const items = Array.from(xml.querySelectorAll('item')).slice(0, 3);
    return items
        .map((item) => {
            const title = item.querySelector('title')?.textContent?.trim() ?? '';
            const link = item.querySelector('link')?.textContent?.trim() ?? '';
            const pubDate = item.querySelector('pubDate')?.textContent?.trim() ?? new Date().toUTCString();
            const sourceTag = item.querySelector('source')?.textContent?.trim();
            if (!title || !link) return null;

            return {
                id: `${link}|${pubDate}`,
                title,
                link,
                publishedAt: new Date(pubDate).toISOString(),
                source: sourceTag || fallbackSource,
                countryName: fallbackCountry,
            };
        })
        .filter((item): item is FeedItem => Boolean(item));
};

const inferAlertType = (title: string): 'info' | 'warning' | 'critical' => {
    const low = title.toLowerCase();
    if (/(outbreak|pandemic|emergency|fatal|death|cholera|measles|ebola|h5n1|mpox)/.test(low)) return 'critical';
    if (/(spike|surge|alert|cases rise|hospital strain|dengue|malaria|avian flu)/.test(low)) return 'warning';
    return 'info';
};

const fetchRssViaProxy = async (feed: FeedConfig): Promise<FeedItem[]> => {
    const proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent(feed.url)}`;
    const response = await fetch(proxied, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed feed: ${feed.source}`);
    const xml = await response.text();
    return parseRss(xml, feed.source, feed.countryName);
};

export const useRealtimeNewsNotifications = (
    enabled: boolean,
    selectedCountry: CountrySelection | null,
    intervalMs: number = 45_000
) => {
    const addAlert = useStore((state) => state.addAlert);
    const seenIdsRef = useRef<Set<string>>(new Set());
    const countryCursorRef = useRef(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollInFlightRef = useRef(false);

    const countries = useMemo(
        () => COUNTRY_COORDINATES.map((c) => ({ name: c.name, code: c.iso2.toLowerCase() })),
        []
    );

    useEffect(() => {
        if (!enabled) return;

        const poll = async () => {
            if (pollInFlightRef.current) return;
            pollInFlightRef.current = true;

            try {
                const batch = countries.slice(countryCursorRef.current, countryCursorRef.current + COUNTRY_BATCH_SIZE);
                countryCursorRef.current = (countryCursorRef.current + COUNTRY_BATCH_SIZE) % countries.length;

                const rotatingCountryFeeds: FeedConfig[] = batch.map((country) => ({
                    source: 'Google News',
                    countryName: country.name,
                    url: toRssSearchUrl(`health OR outbreak OR hospital ${country.name}`),
                }));

                const selectedCountryFeed: FeedConfig[] = selectedCountry
                    ? [{
                        source: 'Google News',
                        countryName: selectedCountry.name,
                        url: toRssSearchUrl(`health OR disease OR outbreak ${selectedCountry.name}`),
                    }]
                    : [];

                const globalFeeds: FeedConfig[] = GLOBAL_HEALTH_FEEDS.map((f) => ({
                    source: f.source,
                    countryName: 'Global',
                    url: f.url,
                }));

                const feeds = [...globalFeeds, ...selectedCountryFeed, ...rotatingCountryFeeds];
                const settled = await Promise.allSettled(feeds.map(fetchRssViaProxy));

                const allItems = settled
                    .filter((r): r is PromiseFulfilledResult<FeedItem[]> => r.status === 'fulfilled')
                    .flatMap((r) => r.value)
                    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));

                const newItems = allItems.filter((item) => !seenIdsRef.current.has(item.id)).slice(0, 6);
                if (newItems.length === 0) return;

                for (const item of newItems) {
                    seenIdsRef.current.add(item.id);

                    addAlert({
                        id: `news-${item.id}`,
                        country: item.countryName,
                        message: `${item.source}: ${item.title}`,
                        timestamp: item.publishedAt,
                        type: inferAlertType(item.title),
                        source: 'NEWS',
                        link: item.link,
                    });
                }

                
                if (seenIdsRef.current.size > 1200) {
                    seenIdsRef.current = new Set(Array.from(seenIdsRef.current).slice(-800));
                }

                if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                    newItems.slice(0, 2).forEach((item) => {
                        const title = `${item.countryName}: ${item.source}`;
                        const body = item.title.length > 140 ? `${item.title.slice(0, 137)}...` : item.title;
                        new Notification(title, { body, tag: item.id });
                    });
                }
            } catch (error) {
                console.warn('Realtime news polling failed:', error);
            } finally {
                pollInFlightRef.current = false;
            }
        };

        poll();
        intervalRef.current = setInterval(poll, intervalMs);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [addAlert, countries, enabled, intervalMs, selectedCountry?.code, selectedCountry?.name]);
};
