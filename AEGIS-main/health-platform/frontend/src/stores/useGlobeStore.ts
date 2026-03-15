import { create } from 'zustand';


export const globeInstanceRef: { current: any } = { current: null };

export interface GlobeLayerVisibility {
  [key: string]: boolean;
  healthRisk: boolean;
  cyberAttacks: boolean;
  conflictZones: boolean;
  sanctions: boolean;
  aircraft: boolean;
  militaryAircraft: boolean;
  satellites: boolean;
  naval: boolean;
  earthquakes: boolean;
  wildfires: boolean;
  storms: boolean;
}

const DEFAULT_GLOBE_LAYERS: GlobeLayerVisibility = {
  healthRisk: true,
  cyberAttacks: true,
  conflictZones: true,
  sanctions: false,
  aircraft: false,
  militaryAircraft: false,
  satellites: false,
  naval: false,
  earthquakes: true,
  wildfires: false,
  storms: false,
};

interface GlobeState {
  selectedCountry: { name: string; code: string } | null;
  panelVisible: boolean;
  
  showPanel: boolean;
  
  globeLayers: GlobeLayerVisibility;
  toggleGlobeLayer: (key: keyof GlobeLayerVisibility) => void;
  resetGlobeLayers: () => void;
  
  aircraftCount: number;
  militaryAircraftCount: number;
  conflictEventCount: number;
  quakesTodayCount: number;
  cyberArcCount: number;
  setGlobeCounts: (counts: Partial<Pick<GlobeState,
    'aircraftCount' | 'militaryAircraftCount' | 'conflictEventCount' | 'quakesTodayCount' | 'cyberArcCount'
  >>) => void;
  satelliteData: any[];
  setSatelliteData: (data: any[]) => void;
  openCountry: (country: { name: string; code: string }) => void;
  closeCountry: () => void;
  setPanelVisible: (v: boolean) => void;
  setSelectedCountry: (country: { name: string; code: string } | null) => void;
  setShowPanel: (show: boolean) => void;
  closePanel: () => void;
  panelHovered: boolean;
  setPanelHovered: (val: boolean) => void;
  wildfireData: any[];
  stormData: any[];
  setWildfireData: (data: any[]) => void;
  setStormData: (data: any[]) => void;
  failedSources: string[];
  addFailedSource: (source: string) => void;
  clearFailedSource: (source: string) => void;
}

export const useGlobeStore = create<GlobeState>((set) => ({
  selectedCountry: null,
  panelVisible: false,
  showPanel: false,
  globeLayers: { ...DEFAULT_GLOBE_LAYERS },
  toggleGlobeLayer: (key) => set((s) => ({
    globeLayers: { ...s.globeLayers, [key]: !s.globeLayers[key] },
  })),
  resetGlobeLayers: () => set({ globeLayers: { ...DEFAULT_GLOBE_LAYERS } }),
  aircraftCount: 0,
  militaryAircraftCount: 0,
  conflictEventCount: 0,
  quakesTodayCount: 0,
  cyberArcCount: 0,
  setGlobeCounts: (counts) => set(counts),
  satelliteData: [],
  setSatelliteData: (data) => set({ satelliteData: data }),
  openCountry: (country) => set({ selectedCountry: country }),
  closeCountry: () => {
    set({ panelVisible: false });
    setTimeout(() => {
      set({ selectedCountry: null });
      const globe = globeInstanceRef.current;
      if (globe) {
        globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1500);
        globe.controls().autoRotate = true;
      }
    }, 350);
  },
  setPanelVisible: (v) => set({ panelVisible: v }),
  setSelectedCountry: (c) => set({ selectedCountry: c }),
  setShowPanel: (show) => set({ showPanel: show }),
  closePanel: () => set({ showPanel: false, selectedCountry: null }),
  panelHovered: false,
  setPanelHovered: (val) => set({ panelHovered: val }),
  wildfireData: [],
  stormData: [],
  setWildfireData: (data) => set({ wildfireData: data }),
  setStormData: (data) => set({ stormData: data }),
  failedSources: [],
  addFailedSource: (source) => set((state) => ({
    failedSources: [...new Set([...state.failedSources, source])],
  })),
  clearFailedSource: (source) => set((state) => ({
    failedSources: state.failedSources.filter(s => s !== source),
  })),
}));
