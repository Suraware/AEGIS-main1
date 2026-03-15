

export interface CountryFacts {
    name: string;
    capital?: string;
    region?: string;
    subregion?: string;
    population?: number;
    area?: number;
    languages?: string[];
    currencies?: string[];
    nativeNames?: string[];
    flags?: {
        svg?: string;
        png?: string;
    };
    coatOfArms?: {
        svg?: string;
        png?: string;
    };
    description?: string;
    mapUrl?: string;
}

export interface CountryWeather {
    temperature?: number;
    condition?: string;
    humidity?: number;
    windSpeed?: number;
}


export const fetchCountryFacts = async (countryCode: string): Promise<CountryFacts> => {
    try {
        
        const response = await fetch(
            `https://restcountries.com/v3.1/alpha/${countryCode}`,
            {
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            console.warn(`Failed to fetch country data for ${countryCode}`);
            return { name: countryCode };
        }

        const data = await response.json();
        const country = Array.isArray(data) ? data[0] : data;

        return {
            name: country.name?.common || country.name?.official || countryCode,
            capital: country.capital?.[0],
            region: country.region,
            subregion: country.subregion,
            population: country.population,
            area: country.area,
            languages: country.languages ? Object.values(country.languages) : [],
            currencies: country.currencies
                ? Object.entries(country.currencies).map(([code, curr]: any) => `${curr.name} (${code})`)
                : [],
            nativeNames: country.name?.nativeName
                ? Object.entries(country.name.nativeName).map(([_, n]: any) => n.official || n.common)
                : [],
            flags: {
                svg: country.flags?.svg,
                png: country.flags?.png,
            },
            coatOfArms: {
                svg: country.coatOfArms?.svg,
                png: country.coatOfArms?.png,
            },
        };
    } catch (error) {
        console.error('Error fetching country facts:', error);
        return { name: countryCode };
    }
};


export const fetchCountryWikipedia = async (countryName: string): Promise<string | null> => {
    try {
        const response = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(countryName)}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'AEGIS-HealthPlatform/1.0',
                },
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        return data.extract || null;
    } catch (error) {
        console.error('Error fetching Wikipedia data:', error);
        return null;
    }
};


export const fetchCountryWeather = async (latitude: number, longitude: number): Promise<CountryWeather> => {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`,
            {
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) return {};

        const data = await response.json();
        const current = data.current;

        const weatherConditions: Record<number, string> = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Cloudy',
            45: 'Foggy',
            48: 'Depositing rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            71: 'Slight snow',
            73: 'Moderate snow',
            75: 'Heavy snow',
        };

        return {
            temperature: current?.temperature_2m,
            condition: weatherConditions[current?.weather_code] || 'Unknown',
            humidity: current?.relative_humidity_2m,
            windSpeed: current?.wind_speed_10m,
        };
    } catch (error) {
        console.error('Error fetching weather:', error);
        return {};
    }
};


export const formatNumber = (num: number | undefined): string => {
    if (!num) return 'N/A';
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
    return num.toString();
};


export const formatArea = (areaKm2: number | undefined): string => {
    if (!areaKm2) return 'N/A';
    return `${formatNumber(areaKm2)} km²`;
};
