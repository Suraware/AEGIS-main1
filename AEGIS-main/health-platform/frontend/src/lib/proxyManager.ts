interface Proxy {
  url: string;
  name: string;
  latency?: number;
  working: boolean;
  lastTested: number;
  failCount: number;
}

const PROXY_LIST: Proxy[] = [
  { url: 'https://corsproxy.io/?',                    name: 'corsproxy.io',   working: true, lastTested: 0, failCount: 0 },
  { url: 'https://api.allorigins.win/raw?url=',       name: 'allorigins',     working: true, lastTested: 0, failCount: 0 },
  { url: 'https://api.codetabs.com/v1/proxy?quest=',  name: 'codetabs',       working: true, lastTested: 0, failCount: 0 },
  { url: 'https://thingproxy.freeboard.io/fetch/',    name: 'thingproxy',     working: true, lastTested: 0, failCount: 0 },
  { url: 'https://proxy.cors.sh/',                    name: 'cors.sh',        working: true, lastTested: 0, failCount: 0 },
  { url: 'https://crossorigin.me/',                   name: 'crossorigin',    working: true, lastTested: 0, failCount: 0 },
  { url: 'https://yacdn.org/proxy/',                  name: 'yacdn',          working: true, lastTested: 0, failCount: 0 },
  { url: 'https://cors-anywhere.herokuapp.com/',      name: 'cors-anywhere',  working: true, lastTested: 0, failCount: 0 },
  { url: 'https://api.cors.lol/?url=',                name: 'cors.lol',       working: true, lastTested: 0, failCount: 0 },
  { url: 'https://corsproxy.org/?',                   name: 'corsproxy.org',  working: true, lastTested: 0, failCount: 0 },
  { url: 'https://bypass-cors.vercel.app/?url=',      name: 'bypass-cors',    working: true, lastTested: 0, failCount: 0 },
];


let proxies = [...PROXY_LIST];

const TEST_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/m2.5_day.geojson';

export const testProxy = async (proxy: Proxy): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${proxy.url}${encodeURIComponent(TEST_URL)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      proxy.working = true;
      proxy.failCount = 0;
      proxy.lastTested = Date.now();
      console.log(`✅ Proxy working: ${proxy.name}`);
      return true;
    }
    throw new Error(`HTTP ${res.status}`);
  } catch {
    proxy.working = false;
    proxy.failCount++;
    proxy.lastTested = Date.now();
    console.log(`❌ Proxy failed: ${proxy.name}`);
    return false;
  }
};

export const testAllProxies = async (): Promise<void> => {
  console.log('Testing all proxies...');
  const start = Date.now();

  await Promise.allSettled(proxies.map(testProxy));

  const working = proxies.filter(p => p.working);
  console.log(`Proxy test complete: ${working.length}/${proxies.length} working in ${Date.now() - start}ms`);

  
  proxies.sort((a, b) => {
    if (a.working && !b.working) return -1;
    if (!a.working && b.working) return 1;
    return (a.latency || 9999) - (b.latency || 9999);
  });
};

export const getWorkingProxies = (): Proxy[] => {
  return proxies.filter(p => p.working && p.failCount < 3);
};

export const markProxyFailed = (proxyUrl: string): void => {
  const proxy = proxies.find(p => p.url === proxyUrl);
  if (proxy) {
    proxy.working = false;
    proxy.failCount++;
    console.warn(`Marked proxy as failed: ${proxy.name} (fails: ${proxy.failCount})`);
  }
};

export const proxyFetch = async (
  targetUrl: string,
  options?: RequestInit,
  retries: number = 3,
): Promise<Response> => {
  const workingProxies = getWorkingProxies();

  if (workingProxies.length === 0) {
    console.warn('No working proxies. Retesting all...');
    await testAllProxies();
  }

  const freshProxies = getWorkingProxies();

  for (let i = 0; i < Math.min(retries, freshProxies.length); i++) {
    const proxy = freshProxies[i];

    try {
      const proxyUrl = `${proxy.url}${encodeURIComponent(targetUrl)}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(proxyUrl, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        return res;
      }

      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.warn(`Proxy ${proxy.name} failed for ${targetUrl}:`, err);
      markProxyFailed(proxy.url);
      continue;
    }
  }

  
  console.warn('All proxies failed, trying direct fetch for:', targetUrl);
  return fetch(targetUrl, options);
};

export const proxyFetchJSON = async (url: string, ttlMs: number = 5 * 60 * 1000): Promise<any> => {
  
  const cacheKey = `proxy:${url}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < ttlMs) {
      return data;
    }
  }

  const res = await proxyFetch(url);
  const data = await res.json();

  
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    
    sessionStorage.clear();
  }

  return data;
};

export const proxyFetchText = async (url: string, ttlMs: number = 5 * 60 * 1000): Promise<string> => {
  if (ttlMs > 0) {
    const cacheKey = `proxy_text:${url}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < ttlMs) {
        return data;
      }
    }

    const res = await proxyFetch(url);
    const text = await res.text();

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ data: text, timestamp: Date.now() }));
    } catch {
      sessionStorage.clear();
    }

    return text;
  }

  
  const res = await proxyFetch(url);
  return res.text();
};


let proxyTestInterval: ReturnType<typeof setInterval>;

export const initProxyManager = async (): Promise<void> => {
  await testAllProxies();

  if (proxyTestInterval) clearInterval(proxyTestInterval);
  proxyTestInterval = setInterval(testAllProxies, 30 * 60 * 1000);
};

export const getProxyStatus = () => ({
  total: proxies.length,
  working: proxies.filter(p => p.working).length,
  proxies: proxies.map(p => ({
    name: p.name,
    working: p.working,
    failCount: p.failCount,
    lastTested: p.lastTested,
  })),
});
