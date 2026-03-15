interface CacheEntry { data: any; timestamp: number; ttl: number; }

const cache = new Map<string, CacheEntry>();

const pending = new Map<string, Promise<any>>();
const MAX_CACHE_SIZE = 200;

function makeRoom(): void {
  if (cache.size < MAX_CACHE_SIZE) return;
  const oldest = cache.keys().next().value;
  if (oldest) cache.delete(oldest);
}

export const cachedFetch = async (url: string, options?: RequestInit, ttlMs = 5 * 60 * 1000): Promise<any> => {
  const now = Date.now();
  const entry = cache.get(url);
  if (entry && now - entry.timestamp < entry.ttl) return entry.data;
  if (pending.has(url)) return pending.get(url)!;

  const request = fetch(url, options)
    .then(async res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      pending.delete(url);
      makeRoom();
      cache.set(url, { data, timestamp: Date.now(), ttl: ttlMs });
      return data;
    })
    .catch(err => { pending.delete(url); throw err; });

  pending.set(url, request);
  return request;
};

export const cachedFetchText = async (url: string, ttlMs = 5 * 60 * 1000): Promise<string> => {
  const key = `text:${url}`;
  const now = Date.now();
  const entry = cache.get(key);
  if (entry && now - entry.timestamp < entry.ttl) return entry.data;
  if (pending.has(key)) return pending.get(key)!;

  const request = fetch(url)
    .then(async res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      pending.delete(key);
      makeRoom();
      cache.set(key, { data: text, timestamp: Date.now(), ttl: ttlMs });
      return text;
    })
    .catch(err => { pending.delete(key); throw err; });

  pending.set(key, request);
  return request;
};

export const clearCache = () => { cache.clear(); pending.clear(); };


setInterval(() => {
  const now = Date.now();
  cache.forEach((entry, key) => { if (now - entry.timestamp > entry.ttl) cache.delete(key); });
}, 10 * 60 * 1000);
