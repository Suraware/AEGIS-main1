
import React, { useEffect, useState } from 'react';
import { X, MapPin, Users, Landmark, Globe, Cloud, Wind, Droplets, Info } from 'lucide-react';
import { CountryFacts, CountryWeather, fetchCountryFacts, fetchCountryWikipedia, fetchCountryWeather, formatNumber, formatArea } from '../services/countryDataService';

interface GoogleMapsModalProps {
    countryCode: string;
    countryName: string;
    latitude: number;
    longitude: number;
    onClose: () => void;
}

export const GoogleMapsModal: React.FC<GoogleMapsModalProps> = ({
    countryCode,
    countryName,
    latitude,
    longitude,
    onClose,
}) => {
    const [countryFacts, setCountryFacts] = useState<CountryFacts>({ name: countryName });
    const [weather, setWeather] = useState<CountryWeather>({});
    const [description, setDescription] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'map' | 'street' | 'facts'>('map');

    
    useEffect(() => {
        const loadCountryData = async () => {
            setLoading(true);
            const [facts, wiki, weatherData] = await Promise.all([
                fetchCountryFacts(countryCode.toUpperCase()),
                fetchCountryWikipedia(countryName),
                fetchCountryWeather(latitude, longitude),
            ]);
            
            setCountryFacts(facts);
            setDescription(wiki || '');
            setWeather(weatherData);
            setLoading(false);
        };

        loadCountryData();
    }, [countryCode, countryName, latitude, longitude]);

    
    const zoomLevel = 5; 
    const googleMapsUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d${3000000 / Math.pow(2, zoomLevel)}!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus`;
    
    
    const streetViewUrl = `https://www.google.com/maps/embed?pb=!1m0!3m2!1s${latitude}%2C${longitude}!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sus`;

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 rounded-2xl border border-cyan-500/50 shadow-[0_0_30px_rgba(0,212,255,0.3)] overflow-hidden flex flex-col">
                {}
                <div className="bg-gradient-to-b from-slate-950 to-slate-900/80 p-6 border-b border-slate-700/50">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            {countryFacts.flags?.svg && (
                                <img
                                    src={countryFacts.flags.svg}
                                    alt={countryName}
                                    className="h-12 rounded border border-cyan-500/30"
                                />
                            )}
                            <div>
                                <h2 className="text-2xl font-bold text-white font-orbitron">
                                    {countryFacts.name}
                                </h2>
                                <p className="text-cyan-400 text-sm font-mono flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    {countryFacts.region} {countryFacts.subregion && `• ${countryFacts.subregion}`}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400 hover:text-red-300"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {}
                    <div className="flex gap-2 mt-4">
                        {(['map', 'street', 'facts'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm uppercase tracking-wider transition ${
                                    activeTab === tab
                                        ? 'bg-cyan-600/30 border border-cyan-500 text-cyan-300'
                                        : 'bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {tab === 'map' && '🗺️ Map'}
                                {tab === 'street' && '📸 Street View'}
                                {tab === 'facts' && '📊 Facts'}
                            </button>
                        ))}
                    </div>
                </div>

                {}
                <div className="flex-1 overflow-hidden flex">
                    {}
                    {(activeTab === 'map' || activeTab === 'street') && (
                        <div className="flex-1 bg-slate-950">
                            <iframe
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                                src={activeTab === 'map' ? googleMapsUrl : streetViewUrl}
                                title={`${activeTab === 'map' ? 'Map' : 'Street View'} of ${countryName}`}
                            />
                        </div>
                    )}

                    {}
                    {activeTab === 'facts' && (
                        <div className="flex-1 overflow-y-auto bg-slate-950">
                            <div className="p-6 space-y-6">
                                {}
                                {weather.temperature !== undefined && (
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                                        <h3 className="text-cyan-300 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Cloud className="w-4 h-4" />
                                            Current Weather
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-slate-400 text-xs uppercase">Temperature</p>
                                                <p className="text-xl font-bold text-white">{weather.temperature?.toFixed(1)}°C</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 text-xs uppercase">Condition</p>
                                                <p className="text-lg font-semibold text-cyan-300">{weather.condition}</p>
                                            </div>
                                            {weather.humidity !== undefined && (
                                                <div>
                                                    <p className="text-slate-400 text-xs uppercase flex items-center gap-1">
                                                        <Droplets className="w-3 h-3" /> Humidity
                                                    </p>
                                                    <p className="text-xl font-bold text-white">{weather.humidity}%</p>
                                                </div>
                                            )}
                                            {weather.windSpeed !== undefined && (
                                                <div>
                                                    <p className="text-slate-400 text-xs uppercase flex items-center gap-1">
                                                        <Wind className="w-3 h-3" /> Wind Speed
                                                    </p>
                                                    <p className="text-xl font-bold text-white">{weather.windSpeed?.toFixed(1)} m/s</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {}
                                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                                    <h3 className="text-cyan-300 font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Landmark className="w-4 h-4" />
                                        Country Facts
                                    </h3>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {countryFacts.capital && (
                                            <div className="border-l-2 border-cyan-500/50 pl-3">
                                                <p className="text-slate-400 text-xs uppercase">Capital</p>
                                                <p className="text-white font-semibold">{countryFacts.capital}</p>
                                            </div>
                                        )}
                                        {countryFacts.population && (
                                            <div className="border-l-2 border-cyan-500/50 pl-3">
                                                <p className="text-slate-400 text-xs uppercase flex items-center gap-1">
                                                    <Users className="w-3 h-3" /> Population
                                                </p>
                                                <p className="text-white font-semibold">{formatNumber(countryFacts.population)}</p>
                                            </div>
                                        )}
                                        {countryFacts.area && (
                                            <div className="border-l-2 border-cyan-500/50 pl-3">
                                                <p className="text-slate-400 text-xs uppercase">Area</p>
                                                <p className="text-white font-semibold">{formatArea(countryFacts.area)}</p>
                                            </div>
                                        )}
                                        {countryFacts.region && (
                                            <div className="border-l-2 border-cyan-500/50 pl-3">
                                                <p className="text-slate-400 text-xs uppercase flex items-center gap-1">
                                                    <Globe className="w-3 h-3" /> Region
                                                </p>
                                                <p className="text-white font-semibold">{countryFacts.region}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {}
                                {((countryFacts.languages && countryFacts.languages.length > 0) || (countryFacts.currencies && countryFacts.currencies.length > 0)) && (
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                                        <h3 className="text-cyan-300 font-bold uppercase tracking-wider mb-4">
                                            Languages & Currencies
                                        </h3>
                                        {countryFacts.languages && countryFacts.languages.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-slate-400 text-xs uppercase mb-2">Languages</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {countryFacts.languages.map((lang, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="bg-cyan-600/20 border border-cyan-500/50 px-3 py-1 rounded text-sm text-cyan-300"
                                                        >
                                                            {lang}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {countryFacts.currencies && countryFacts.currencies.length > 0 && (
                                            <div>
                                                <p className="text-slate-400 text-xs uppercase mb-2">Currencies</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {countryFacts.currencies.map((curr, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="bg-emerald-600/20 border border-emerald-500/50 px-3 py-1 rounded text-sm text-emerald-300"
                                                        >
                                                            {curr}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {}
                                {description && (
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                                        <h3 className="text-cyan-300 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Info className="w-4 h-4" />
                                            About
                                        </h3>
                                        <p className="text-slate-300 text-sm leading-relaxed line-clamp-5">
                                            {description}
                                        </p>
                                        <a
                                            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-cyan-400 hover:text-cyan-300 text-xs mt-3 inline-block"
                                        >
                                            Read more on Wikipedia →
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {}
                <div className="bg-slate-800/80 backdrop-blur px-6 py-4 border-t border-slate-700 flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                        <p>
                            Coordinates: {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
                        </p>
                    </div>
                    <a
                        href={`https://www.google.com/maps/search/${countryName}/@${latitude},${longitude},6z`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 rounded-lg text-cyan-300 font-semibold transition-colors"
                    >
                        Open in Google Maps →
                    </a>
                </div>
            </div>
        </div>
    );
};
