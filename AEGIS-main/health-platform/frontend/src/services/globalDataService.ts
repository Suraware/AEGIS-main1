import { cachedFetch, cachedFetchText } from '../lib/fetchCache';





export const fetchCountryFull = async (code: string, name: string) => {
  const [restCountries, nominatim, worldBank] = await Promise.allSettled([
    cachedFetch(`https://restcountries.com/v3.1/alpha/${code}`, undefined, 24*60*60*1000),
    cachedFetch(`https://nominatim.openstreetmap.org/search?country=${encodeURIComponent(name)}&format=json&limit=1&addressdetails=1`, { headers: { 'User-Agent': 'AEGIS/1.0' } }, 24*60*60*1000),
    cachedFetch(`https://api.worldbank.org/v2/country/${code}?format=json`, undefined, 24*60*60*1000),
  ]);

  return {
    restCountries: restCountries.status === 'fulfilled' ? restCountries.value[0] : null,
    nominatim: nominatim.status === 'fulfilled' ? nominatim.value[0] : null,
    worldBank: worldBank.status === 'fulfilled' ? worldBank.value[1]?.[0] : null,
  };
};





export const fetchEconomicData = async (code: string) => {
  const indicators = {
    gdpPerCapita: 'NY.GDP.PCAP.CD',
    gdpGrowth: 'NY.GDP.MKTP.KD.ZG',
    gdpTotal: 'NY.GDP.MKTP.CD',
    inflation: 'FP.CPI.TOTL.ZG',
    unemployment: 'SL.UEM.TOTL.ZS',
    tradeBalance: 'BN.CAB.XOKA.CD',
    fdi: 'BX.KLT.DINV.CD.WD',
    debtToGdp: 'GC.DOD.TOTL.GD.ZS',
    gini: 'SI.POV.GINI',
    povertyRate: 'SI.POV.DDAY',
    exports: 'NE.EXP.GNFS.CD',
    imports: 'NE.IMP.GNFS.CD',
    militarySpend: 'MS.MIL.XPND.GD.ZS',
    healthSpend: 'SH.XPD.CHEX.GD.ZS',
    educationSpend: 'SE.XPD.TOTL.GD.ZS',
    co2: 'EN.ATM.CO2E.PC',
    electricityAccess: 'EG.ELC.ACCS.ZS',
    internetUsers: 'IT.NET.USER.ZS',
    mobileSubscriptions: 'IT.CEL.SETS.P2',
    urbanPopulation: 'SP.URB.TOTL.IN.ZS',
    lifeExpectancy: 'SP.DYN.LE00.IN',
    infantMortality: 'SP.DYN.IMRT.IN',
    fertilityRate: 'SP.DYN.TFRT.IN',
    populationGrowth: 'SP.POP.GROW',
    refugeesHosted: 'SM.POP.REFG',
    remittances: 'BX.TRF.PWKR.CD.DT',
  };

  const results: Record<string, any> = {};
  const entries = Object.entries(indicators);
  for (let i = 0; i < entries.length; i += 5) {
    const batch = entries.slice(i, i + 5);
    await Promise.allSettled(batch.map(async ([key, ind]) => {
      try {
        const data = await cachedFetch(
          `https://api.worldbank.org/v2/country/${code}/indicator/${ind}?format=json&mrv=10&per_page=10`,
          undefined,
          24*60*60*1000
        );
        results[key] = (data[1] || []).filter((r: any) => r.value !== null).map((r: any) => ({ year: r.date, value: r.value }));
      } catch { results[key] = []; }
    }));
    if (i + 5 < entries.length) await new Promise(r => setTimeout(r, 200));
  }
  return results;
};





export const fetchHealthData = async (code: string, name: string, lat: number, lng: number) => {
  const [covid, airQuality, whoAlerts, trials, recalls] = await Promise.allSettled([
    cachedFetch(`https://disease.sh/v3/covid-19/countries/${code}`, undefined, 5*60*1000),
    cachedFetch(`https://api.openaq.org/v2/latest?country=${code.toUpperCase()}&limit=10&order_by=lastUpdated&sort=desc`, undefined, 5*60*1000),
    cachedFetchText('https://www.who.int/rss-feeds/news-english.xml', 30*60*1000),
    cachedFetch(`https://clinicaltrials.gov/api/query/full_studies?expr=${encodeURIComponent(name)}&min_rnk=1&max_rnk=20&fmt=json`, undefined, 60*60*1000),
    cachedFetch(`https://api.fda.gov/drug/enforcement.json?limit=10&sort=recall_initiation_date:desc`, undefined, 60*60*1000),
  ]);

  const parseWHO = (text: string) => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    return Array.from(xml.querySelectorAll('item')).slice(0, 15).map(item => ({
      title: item.querySelector('title')?.textContent || '',
      link: item.querySelector('link')?.textContent || '',
      description: item.querySelector('description')?.textContent?.replace(/<[^>]+>/g, '').slice(0, 300) || '',
      pubDate: item.querySelector('pubDate')?.textContent || '',
    }));
  };

  return {
    covid: covid.status === 'fulfilled' ? covid.value : null,
    airQuality: airQuality.status === 'fulfilled' ? airQuality.value.results || [] : [],
    whoAlerts: whoAlerts.status === 'fulfilled' ? parseWHO(whoAlerts.value) : [],
    trials: trials.status === 'fulfilled' ? (trials.value.FullStudiesResponse?.FullStudies || []).map((s: any) => ({
      title: s.Study.ProtocolSection?.IdentificationModule?.BriefTitle,
      status: s.Study.ProtocolSection?.StatusModule?.OverallStatus,
      phase: s.Study.ProtocolSection?.DesignModule?.PhaseList?.Phase?.[0],
      condition: s.Study.ProtocolSection?.ConditionsModule?.ConditionList?.Condition?.[0],
      sponsor: s.Study.ProtocolSection?.SponsorCollaboratorsModule?.LeadSponsor?.LeadSponsorName,
      url: `https://clinicaltrials.gov/study/${s.Study.ProtocolSection?.IdentificationModule?.NCTId}`,
    })) : [],
    recalls: recalls.status === 'fulfilled' ? recalls.value.results || [] : [],
  };
};





export const fetchSecurityData = async (code: string, name: string) => {
  const [conflicts, cyberNews, cisa, breaches, sanctions] = await Promise.allSettled([
    cachedFetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(name)}+conflict+attack+military+war+airstrike&mode=artlist&format=json&maxrecords=25&timespan=7d&sort=DateDesc`, undefined, 5*60*1000),
    cachedFetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(name)}+cyberattack+hacking+ransomware+malware+breach&mode=artlist&format=json&maxrecords=25&timespan=7d&sort=DateDesc`, undefined, 5*60*1000),
    cachedFetch('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json', undefined, 60*60*1000),
    cachedFetch('https://haveibeenpwned.com/api/v3/breaches', undefined, 60*60*1000),
    Promise.resolve(['IR','KP','CU','SY','RU','BY','MM','VE','ZW','SD','SO','YE','LY','CF','SS','ML','NI','HT'].includes(code.toUpperCase())),
  ]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return {
    conflictNews: conflicts.status === 'fulfilled' ? conflicts.value.articles || [] : [],
    cyberNews: cyberNews.status === 'fulfilled' ? cyberNews.value.articles || [] : [],
    recentCVEs: cisa.status === 'fulfilled'
      ? cisa.value.vulnerabilities
          .filter((v: any) => new Date(v.dateAdded) > thirtyDaysAgo)
          .slice(0, 15)
      : [],
    breaches: breaches.status === 'fulfilled'
      ? breaches.value.filter((b: any) => {
          const tld = code.toLowerCase();
          return b.Domain?.endsWith(`.${tld}`) || b.Domain?.includes(`.${tld}.`);
        })
      : [],
    sanctioned: sanctions.status === 'fulfilled' ? sanctions.value : false,
  };
};





export const fetchOSINTData = async (code: string, name: string, lat: number, lng: number) => {
  const tld = code.toLowerCase();

  const [
    wikiSummary,
    wikiEdits,
    wikiSearch,
    reddit,
    gdeltTimeline,
    gdeltGeneral,
    earthquakes,
    wildfires,
    issPosition,
    issCrew,
    exchangeRates,
    airQualityDetailed,
  ] = await Promise.allSettled([
    cachedFetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`, undefined, 30*60*1000),
    cachedFetch(`https://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=${encodeURIComponent(name)}&rvlimit=10&rvprop=timestamp|user|comment|size&format=json&origin=*`, undefined, 30*60*1000),
    cachedFetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&srnamespace=0&srlimit=8&format=json&origin=*`, undefined, 30*60*1000),
    cachedFetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(name)}&sort=new&limit=15&type=link`, { headers: { 'User-Agent': 'AEGIS/1.0' } }, 5*60*1000),
    cachedFetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(name)}&mode=timelinevol&format=json&timespan=90d`, undefined, 5*60*1000),
    cachedFetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(name)}&mode=artlist&format=json&maxrecords=25&timespan=3d&sort=DateDesc`, undefined, 5*60*1000),
    cachedFetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=${lat-8}&maxlatitude=${lat+8}&minlongitude=${lng-8}&maxlongitude=${lng+8}&minmagnitude=1.5&orderby=time&limit=25`, undefined, 60*1000),
    cachedFetchText(`https://firms.modaps.eosdis.nasa.gov/api/area/csv/VIIRS_SNPP_NRT/${lng-10},${lat-10},${lng+10},${lat+10}/3`, 5*60*1000),
    cachedFetch('https://api.open-notify.org/iss-now.json', undefined, 60*1000),
    cachedFetch('https://api.open-notify.org/astros.json', undefined, 5*60*1000),
    cachedFetch(`https://open.er-api.com/v6/latest/USD`, undefined, 60*60*1000),
    cachedFetch(`https://api.openaq.org/v2/measurements?country=${code.toUpperCase()}&parameter=pm25&limit=20&order_by=datetime&sort=desc`, undefined, 5*60*1000),
  ]);

  const parseWildfires = (csv: string) => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',');
    return lines.slice(1).slice(0, 30).map(line => {
      const vals = line.split(',');
      const obj: any = {};
      headers.forEach((h, i) => obj[h.trim()] = vals[i]?.trim());
      return { lat: parseFloat(obj.latitude), lng: parseFloat(obj.longitude), brightness: parseFloat(obj.bright_ti4 || '0'), confidence: obj.confidence, date: obj.acq_date };
    }).filter(f => !isNaN(f.lat));
  };

  const parseWikiEdits = (data: any) => {
    const pages = Object.values(data?.query?.pages || {}) as any[];
    return pages[0]?.revisions?.map((r: any) => ({
      timestamp: r.timestamp,
      user: r.user,
      comment: r.comment || 'No summary',
      size: r.size,
    })) || [];
  };

  return {
    wikiSummary: wikiSummary.status === 'fulfilled' ? wikiSummary.value : null,
    wikiEdits: wikiEdits.status === 'fulfilled' ? parseWikiEdits(wikiEdits.value) : [],
    wikiSearch: wikiSearch.status === 'fulfilled' ? wikiSearch.value.query?.search?.map((r: any) => ({ title: r.title, snippet: r.snippet.replace(/<[^>]+>/g, ''), timestamp: r.timestamp, url: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title)}` })) || [] : [],
    reddit: reddit.status === 'fulfilled' ? reddit.value.data?.children?.map((c: any) => ({ title: c.data.title, subreddit: c.data.subreddit, score: c.data.score, comments: c.data.num_comments, url: `https://reddit.com${c.data.permalink}`, created: c.data.created_utc })) || [] : [],
    gdeltTimeline: gdeltTimeline.status === 'fulfilled' ? gdeltTimeline.value.timeline?.[0]?.data || [] : [],
    gdeltNews: gdeltGeneral.status === 'fulfilled' ? gdeltGeneral.value.articles || [] : [],
    earthquakes: earthquakes.status === 'fulfilled' ? earthquakes.value.features?.map((f: any) => ({ magnitude: f.properties.mag, place: f.properties.place, time: f.properties.time, depth: f.geometry.coordinates[2], lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0], url: f.properties.url })) || [] : [],
    wildfires: wildfires.status === 'fulfilled' ? parseWildfires(wildfires.value) : [],
    issPosition: issPosition.status === 'fulfilled' ? { lat: parseFloat(issPosition.value.iss_position.latitude), lng: parseFloat(issPosition.value.iss_position.longitude) } : null,
    issCrew: issCrew.status === 'fulfilled' ? issCrew.value.people?.filter((p: any) => p.craft === 'ISS') || [] : [],
    exchangeRates: exchangeRates.status === 'fulfilled' ? exchangeRates.value.rates : {},
    airQuality: airQualityDetailed.status === 'fulfilled' ? airQualityDetailed.value.results || [] : [],
    osintLinks: {
      virustotal: `https://www.virustotal.com/gui/domain/${tld}`,
      crtSh: `https://crt.sh/?q=%.${tld}`,
      ipinfo: `https://ipinfo.io/countries/${code.toLowerCase()}`,
      wayback: `https://web.archive.org/web/*/${name}`,
      shodan: `https://www.shodan.io/search?query=country%3A${code.toUpperCase()}`,
      censys: `https://search.censys.io/search?resource=hosts&q=location.country_code%3D${code.toUpperCase()}`,
      greynoise: `https://viz.greynoise.io/table?country=${code.toUpperCase()}`,
      intelx: `https://intelx.io/?s=${encodeURIComponent(name)}`,
      spiderfoot: `https://www.spiderfoot.net`,
      maltego: `https://www.maltego.com`,
    },
  };
};





export const fetchAllNews = async (name: string) => {
  const [general, conflict, cyber, health, economy, politics, who] = await Promise.allSettled([
    cachedFetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(name)}&mode=artlist&format=json&maxrecords=20&timespan=1d&sort=DateDesc`, undefined, 5*60*1000),
    cachedFetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(name)}+conflict+military+war+attack&mode=artlist&format=json&maxrecords=15&timespan=3d&sort=DateDesc`, undefined, 5*60*1000),
    cachedFetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(name)}+cyber+hacking+malware+breach&mode=artlist&format=json&maxrecords=10&timespan=7d&sort=DateDesc`, undefined, 5*60*1000),
    cachedFetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(name)}+health+disease+outbreak+hospital&mode=artlist&format=json&maxrecords=10&timespan=7d&sort=DateDesc`, undefined, 5*60*1000),
    cachedFetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(name)}+economy+GDP+inflation+trade+sanctions&mode=artlist&format=json&maxrecords=10&timespan=7d&sort=DateDesc`, undefined, 5*60*1000),
    cachedFetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(name)}+government+politics+election+president+minister&mode=artlist&format=json&maxrecords=10&timespan=7d&sort=DateDesc`, undefined, 5*60*1000),
    cachedFetchText('https://www.who.int/rss-feeds/news-english.xml', 30*60*1000),
  ]);

  const parseWHO = (text: string) => {
    try {
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      return Array.from(xml.querySelectorAll('item')).slice(0, 10).map(item => ({
        title: item.querySelector('title')?.textContent || '',
        url: item.querySelector('link')?.textContent || '',
        source: 'WHO',
        topic: 'health',
        seendate: item.querySelector('pubDate')?.textContent || '',
      }));
    } catch { return []; }
  };

  const tag = (articles: any[], topic: string) =>
    (articles || []).map((a: any) => ({ ...a, topic }));

  const allArticles = [
    ...tag(general.status === 'fulfilled' ? general.value.articles || [] : [], 'general'),
    ...tag(conflict.status === 'fulfilled' ? conflict.value.articles || [] : [], 'conflict'),
    ...tag(cyber.status === 'fulfilled' ? cyber.value.articles || [] : [], 'cyber'),
    ...tag(health.status === 'fulfilled' ? health.value.articles || [] : [], 'health'),
    ...tag(economy.status === 'fulfilled' ? economy.value.articles || [] : [], 'economy'),
    ...tag(politics.status === 'fulfilled' ? politics.value.articles || [] : [], 'politics'),
    ...tag(who.status === 'fulfilled' ? parseWHO(who.value) : [], 'health'),
  ];

  const seen = new Set<string>();
  return allArticles
    .filter(a => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    })
    .sort((a, b) => new Date(b.seendate).getTime() - new Date(a.seendate).getTime());
};





export const fetchMilitaryData = async (code: string, name: string, lat: number, lng: number, aircraftData: any[]) => {
  const [conflicts, gdeltMilitary, usgsQuakes] = await Promise.allSettled([
    cachedFetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(name)}+military+conflict+attack+defense+airstrike+troops&mode=artlist&format=json&maxrecords=25&timespan=7d&sort=DateDesc`, undefined, 5*60*1000),
    cachedFetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(name)}+army+navy+airforce+military+defense&mode=artlist&format=json&maxrecords=15&timespan=30d&sort=DateDesc`, undefined, 5*60*1000),
    cachedFetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=${lat-5}&maxlatitude=${lat+5}&minlongitude=${lng-5}&maxlongitude=${lng+5}&minmagnitude=3&orderby=time&limit=10`, undefined, 60*1000),
  ]);

  const nearbyAircraft = aircraftData.filter(a =>
    Math.abs(a.lat - lat) < 8 && Math.abs(a.lng - lng) < 8
  );

  const sanctionedCountries = ['IR','KP','CU','SY','RU','BY','MM','VE','ZW','SD','SO','YE','LY','CF','SS','ML','NI','HT'];
  const isSanctioned = sanctionedCountries.includes(code.toUpperCase());

  const militaryLinks = {
    cfr: `https://www.cfr.org/global-conflict-tracker`,
    acled: `https://acleddata.com/dashboard`,
    sipri: `https://www.sipri.org/databases`,
    nato: `https://www.nato.int`,
    un: `https://peacekeeping.un.org`,
    janes: `https://www.janes.com`,
    iiss: `https://www.iiss.org`,
    globalFirepower: `https://www.globalfirepower.com/country-military-strength-detail.php?country_id=${name.toLowerCase().replace(/ /g, '-')}`,
    armsTransfers: `https://www.sipri.org/databases/armstransfers`,
    nuclearThreats: `https://www.nti.org/countries/${name.toLowerCase().replace(/ /g, '-')}/`,
  };

  return {
    conflictNews: conflicts.status === 'fulfilled' ? conflicts.value.articles || [] : [],
    militaryNews: gdeltMilitary.status === 'fulfilled' ? gdeltMilitary.value.articles || [] : [],
    nearbyQuakes: usgsQuakes.status === 'fulfilled' ? usgsQuakes.value.features?.map((f: any) => ({ magnitude: f.properties.mag, place: f.properties.place, time: f.properties.time })) || [] : [],
    nearbyAircraft,
    militaryAircraft: nearbyAircraft.filter(a => a.military),
    isSanctioned,
    militaryLinks,
  };
};
