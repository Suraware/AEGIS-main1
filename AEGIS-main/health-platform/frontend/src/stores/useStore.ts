import { create } from 'zustand';

export interface Alert {
    id: string;
    country: string;
    message: string;
    timestamp: string;
    type: 'info' | 'warning' | 'critical';
    source: string;
    link?: string;
}

export interface CountryHealthData {
    code: string;
    name: string;
    riskScore: number; 
    covidCases: number;
    covidDeaths: number;
    fluLevel: string;
    hospitalCapacity: number; 
    aqi: number;
    wastewaterSignal: string;
    activeTrials: number;
    population: number;
    sparklineData: { day: number; cases: number }[];
    topCitiesAQI: { city: string; aqi: number }[];
}

interface AppState {
    selectedCountry: CountryHealthData | null;
    comparisonCountry: CountryHealthData | null;
    layers: {
        disease: boolean;
        hospital: boolean;
        airQuality: boolean;
        wastewater: boolean;
        trials: boolean;
        fda: boolean;
        aircraft: boolean;
        conflicts: boolean;
        cyberArcs: boolean;
        cyberHeatmap: boolean;
        earthquakes: boolean;
    };
    alerts: Alert[];
    globeAutoRotate: boolean;
    setSelectedCountry: (data: CountryHealthData | null) => void;
    setComparisonCountry: (data: CountryHealthData | null) => void;
    toggleLayer: (layer: string) => void;
    addAlert: (alert: Alert) => void;
    setGlobeAutoRotate: (val: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
    selectedCountry: null,
    comparisonCountry: null,
    layers: {
        disease: true,
        hospital: true,
        airQuality: true,
        wastewater: true,
        trials: false,
        fda: false,
        aircraft: true,
        conflicts: true,
        cyberArcs: true,
        cyberHeatmap: false,
        earthquakes: true,
    },
    alerts: [],
    globeAutoRotate: true,
    setSelectedCountry: (data) => set({ selectedCountry: data }),
    setComparisonCountry: (data) => set({ comparisonCountry: data }),
    toggleLayer: (layer) =>
        set((state) => ({
            layers: {
                ...state.layers,
                [layer]: !state.layers[layer as keyof typeof state.layers],
            },
        })),
    addAlert: (alert) =>
        set((state) => ({
            alerts: [alert, ...state.alerts].slice(0, 100),
        })),
    setGlobeAutoRotate: (val) => set({ globeAutoRotate: val }),
}));