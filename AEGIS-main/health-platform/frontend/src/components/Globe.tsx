
import { useEffect, useRef, useCallback, memo } from 'react';
import GlobeLib from 'globe.gl';
import * as THREE from 'three';
import { useGlobeStore, globeInstanceRef } from '../stores/useGlobeStore';
import { getGlobeThreatScore } from '../services/threatAssessment';
import { fetchAllTLE, computeAllPositions } from '../lib/satelliteUtils';
import {
  ORBITAL_CONFIGS,
  createOrbitalRing,
  createSatelliteMarkers,
  createOrbitPath,
  animateOrbitalRings,
} from '../globe/orbitalRings';
import {
  createSatelliteObject,
  createISSObject,
  animateTrackingObjects,
} from '../globe/trackingObjects';
import { registerGlobe, unregisterGlobe, onLayersChanged, forceRender } from '../globe/globeRenderer';




function getRiskScore(iso2: string): number {
  if (!iso2 || iso2 === '-99') return 20;
  return getGlobeThreatScore(iso2.toUpperCase());
}
function getRiskLevel(iso2: string) {
  const s = getRiskScore(iso2);
  return s > 75 ? 'CRITICAL' : s > 50 ? 'HIGH' : s > 25 ? 'MODERATE' : 'LOW';
}
function getRiskColor(iso2: string) {
  const s = getRiskScore(iso2);
  return s > 75 ? '#f87171' : s > 50 ? '#fb923c' : s > 25 ? '#facc15' : '#4ade80';
}
function getRiskBg(iso2: string) {
  const s = getRiskScore(iso2);
  return s > 75 ? 'rgba(248,113,113,0.1)' : s > 50 ? 'rgba(251,146,60,0.1)' : s > 25 ? 'rgba(250,204,21,0.1)' : 'rgba(74,222,128,0.1)';
}


const GlobeComponent = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef     = useRef<any>(null);
  const countriesRef = useRef<any[]>([]);

  
  const globeLayers    = useGlobeStore(s => s.globeLayers);
  const panelVisible   = useGlobeStore(s => s.panelVisible);
  const aircraftCount  = useGlobeStore(s => s.aircraftCount);
  const satelliteData  = useGlobeStore(s => s.satelliteData);

  
  const tleDataRef          = useRef<any[]>([]);
  const satelliteFetchedRef = useRef(false);

  
  const orbitalRingsRef   = useRef<Map<string, THREE.Group>>(new Map());
  const orbitalMarkersRef = useRef<Map<string, THREE.Group>>(new Map());
  const orbitalPathsRef   = useRef<Map<string, THREE.LineLoop>>(new Map());
  const orbitalInitRef    = useRef(false);
  const clockRef          = useRef(0);

  
  const SANCTIONED_COUNTRIES = ['IR','KP','CU','SY','RU','BY','MM','VE','ZW','SD','SO','YE','LY','CF','SS','ML','NI','HT','CD','ER','IQ'];

  
  const applyCountryLayer = useCallback((hoveredFeature: any) => {
    const g = globeRef.current;
    if (!g || countriesRef.current.length === 0) return;
    const { openCountry, globeLayers: layers } = useGlobeStore.getState();
    const features = countriesRef.current;

    g
      .polygonsData(features)
      .polygonAltitude((d: any) => d === hoveredFeature ? 0.015 : 0.006)
      .polygonCapColor((d: any) => {
        const code = (d.properties.ISO_A2 || '').toUpperCase();
        
        if (layers.sanctions && SANCTIONED_COUNTRIES.includes(code)) {
          return 'rgba(248,113,113,0.3)';
        }
        if (d === hoveredFeature) return 'rgba(56,189,248,0.25)';
        if (!layers.healthRisk) return 'rgba(255,255,255,0.02)';
        const s = getRiskScore(d.properties.ISO_A2);
        if (s > 75) return 'rgba(248,113,113,0.15)';
        if (s > 50) return 'rgba(251,146,60,0.12)';
        if (s > 25) return 'rgba(250,204,21,0.08)';
        return 'rgba(56,189,248,0.04)';
      })
      .polygonSideColor(() => 'rgba(56,189,248,0.04)')
      .polygonStrokeColor((d: any) => {
        const code = (d.properties.ISO_A2 || '').toUpperCase();
        if (layers.sanctions && SANCTIONED_COUNTRIES.includes(code)) {
          return '#f87171';
        }
        if (d === hoveredFeature) return '#38bdf8';
        if (!layers.healthRisk) return 'rgba(56,189,248,0.18)';
        const s = getRiskScore(d.properties.ISO_A2);
        if (s > 75) return 'rgba(248,113,113,0.85)';
        if (s > 50) return 'rgba(251,146,60,0.75)';
        if (s > 25) return 'rgba(250,204,21,0.65)';
        return 'rgba(56,189,248,0.22)';
      })
      .polygonLabel((d: any) => {
        const iso = (d.properties.ISO_A2 || 'un').toLowerCase();
        return `
          <div style="background:rgba(5,12,24,0.97);border:1px solid rgba(56,189,248,0.25);border-radius:10px;padding:10px 14px;font-family:DM Sans,sans-serif;pointer-events:none;min-width:150px;box-shadow:0 8px 32px rgba(0,0,0,0.5);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <img src="https://flagcdn.com/w40/${iso}.png" style="width:24px;height:16px;object-fit:cover;border-radius:3px;" />
              <span style="color:#f1f5f9;font-size:14px;font-weight:700;">${d.properties.NAME}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="padding:2px 8px;border-radius:100px;font-size:10px;font-weight:700;letter-spacing:0.06em;background:${getRiskBg(d.properties.ISO_A2)};color:${getRiskColor(d.properties.ISO_A2)};border:1px solid ${getRiskColor(d.properties.ISO_A2)}44;">
                ${getRiskLevel(d.properties.ISO_A2)}
              </span>
              <span style="color:#475569;font-size:11px;">Click to open intelligence brief</span>
            </div>
          </div>`;
      })
      .onPolygonHover((hovered: any) => {
        if (g.controls) g.controls().autoRotate = !hovered;
        document.body.style.cursor = hovered ? 'pointer' : 'default';
        applyCountryLayer(hovered);
      })
      .onPolygonClick((d: any, event: MouseEvent) => {
        event.stopPropagation();
        const code = (d.properties.ISO_A2 || '').toLowerCase();
        const name = d.properties.NAME as string;
        const lat  = (d.properties.LABEL_Y || 0) as number;
        const lng  = (d.properties.LABEL_X || 0) as number;
        console.log('Country clicked:', name, code, lat, lng);
        g.controls().autoRotate = false;
        g.pointOfView({ lat, lng, altitude: 1.8 }, 1200);
        flashCountry(lat, lng);
        setTimeout(() => openCountry({ name, code }), 800);
      });
  }, []);

  
  const flashCountry = useCallback((lat: number, lng: number) => {
    const g = globeRef.current;
    if (!g) return;
    g.ringsData([{ lat, lng, _type: 'flash', maxR: 3, propagationSpeed: 3, repeatPeriod: 99999 }]);
    setTimeout(() => forceRender(), 800);
  }, []);

  
  useEffect(() => {
    if (!containerRef.current) return;

    const globe = new GlobeLib(containerRef.current)
      .width(window.innerWidth)
      .height(window.innerHeight)
      .backgroundColor('rgba(0,0,0,0)')
      .showAtmosphere(true)
      .atmosphereColor('rgba(56,189,248,0.12)')
      .atmosphereAltitude(0.12)
      .showGraticules(true);

    globeRef.current         = globe;
    globeInstanceRef.current = globe;

    
    const mat = globe.globeMaterial() as THREE.MeshPhongMaterial;
    mat.color             = new THREE.Color('#1a1a2e');
    mat.emissive          = new THREE.Color('#0a0a1a');
    mat.emissiveIntensity = 0.3;
    mat.shininess         = 5;

    new THREE.TextureLoader().load(
      'https://unpkg.com/three-globe/example/img/earth-dark.jpg',
      (tex) => {
        mat.map = tex;
        mat.needsUpdate = true;
      }
    );

    
    globe.scene().background = new THREE.Color('#020818');

    
    const positions = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 800 + Math.random() * 200;
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    globe.scene().add(new THREE.Points(starGeo, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.7, transparent: true, opacity: 0.7, sizeAttenuation: true,
    })));

    
    globe.scene().add(new THREE.AmbientLight(0x222244, 0.8));
    const dir = new THREE.DirectionalLight(0x4488ff, 0.4);
    dir.position.set(1, 1, 1);
    globe.scene().add(dir);

    
    globe.controls().autoRotate     = true;
    globe.controls().autoRotateSpeed = 0.25;
    globe.controls().enableZoom     = true;
    globe.controls().zoomSpeed      = 0.8;
    globe.controls().minDistance    = 150;
    globe.controls().maxDistance    = 500;
    globe.controls().enableDamping  = true;
    globe.controls().dampingFactor  = 0.08;

    
    
    

    
    
    globe
      .customThreeObject((d: any) => {
        if (d.name?.includes('ISS') || d.name?.includes('ZARYA') || d.name?.includes('STATION')) {
          const obj = createISSObject();
          obj.userData = { rotates: true, rotateSpeed: 0.5, baseScale: 2.5 };
          return obj;
        }
        const obj = createSatelliteObject(d.category ?? '');
        obj.userData = { rotates: true, rotateSpeed: 0.3, baseScale: obj.scale.x };
        return obj;
      })
      .customThreeObjectUpdate((obj: THREE.Object3D, d: any) => {
        const alt = (d.alt ?? 400) / 6371;
        const coords = globe.getCoords(d.lat, d.lng, alt);
        obj.position.set(coords.x, coords.y, coords.z);
      });

    
    const clock = new THREE.Clock();
    const threeRenderer = globe.renderer() as THREE.WebGLRenderer;
    const threeScene    = globe.scene()    as THREE.Scene;
    const originalRender = threeRenderer.render.bind(threeRenderer);
    (threeRenderer as any).render = (s: THREE.Scene, camera: THREE.Camera) => {
      animateTrackingObjects(threeScene, clock.getDelta());
      originalRender(s, camera);
    };

    
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
      .then(r => r.json())
      .then(data => {
        countriesRef.current = data.features;
        applyCountryLayer(null);
      });

    const onResize = () => globe.width(window.innerWidth).height(window.innerHeight);
    window.addEventListener('resize', onResize);

    
    registerGlobe(globe);

    
    const canvasEl = globe.renderer().domElement as HTMLCanvasElement;
    let touchStartTime = 0, touchStartX = 0, touchStartY = 0;
    canvasEl.addEventListener('touchstart', (e: TouchEvent) => {
      touchStartTime = Date.now();
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    canvasEl.addEventListener('touchend', (e: TouchEvent) => {
      const duration = Date.now() - touchStartTime;
      const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
      if (duration < 300 && dx < 10 && dy < 10) {
        document.body.style.cursor = 'pointer';
        setTimeout(() => { document.body.style.cursor = 'default'; }, 200);
      }
    }, { passive: true });

    
    if ((import.meta as any).env.MODE === 'development') {
      (window as any).findClickBlockers = (x: number, y: number) => {
        const elements = document.elementsFromPoint(x, y);
        console.table(elements.map(el => ({
          tag: el.tagName,
          id: el.id,
          class: el.className?.toString().slice(0, 40),
          zIndex: getComputedStyle(el).zIndex,
          pointerEvents: getComputedStyle(el).pointerEvents,
        })));
      };
      console.log('Debug: call window.findClickBlockers(x, y) to find what blocks clicks');
    }

    return () => {
      window.removeEventListener('resize', onResize);
      unregisterGlobe();
      globeInstanceRef.current = null;
    };
  }, [applyCountryLayer]);

  
  useEffect(() => {
    onLayersChanged(globeLayers);
    applyCountryLayer(null);
  }, [globeLayers, applyCountryLayer]);

  
  
  

  
  useEffect(() => {
    if (!panelVisible && globeRef.current) {
      const id = setTimeout(() => {
        const g = globeRef.current;
        if (!g) return;
        g.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1200);
        g.controls().autoRotate = true;
      }, 400);
      return () => clearTimeout(id);
    }
  }, [panelVisible]);

  
  useEffect(() => {
    if (!globeLayers.satellites) return;


    let computeInterval: ReturnType<typeof setInterval>;
    let fetchInterval: ReturnType<typeof setInterval>;

    const computeAndUpdate = () => {
      if (tleDataRef.current.length === 0) return;
      const positions = computeAllPositions(tleDataRef.current);
      useGlobeStore.getState().setSatelliteData(positions);
    };

    const initSatellites = async () => {
      const tleData = await fetchAllTLE();
      tleDataRef.current = tleData;
      satelliteFetchedRef.current = true;

      if (tleData.length > 0) {
        useGlobeStore.getState().clearFailedSource?.('celestrak');
      } else {
        useGlobeStore.getState().addFailedSource?.('celestrak');
      }

      computeAndUpdate();
      computeInterval = setInterval(computeAndUpdate, 10_000);
      fetchInterval   = setInterval(async () => {
        const fresh = await fetchAllTLE();
        tleDataRef.current = fresh;
      }, 6 * 60 * 60 * 1000);
    };

    initSatellites();

    return () => {
      clearInterval(computeInterval);
      clearInterval(fetchInterval);
    };
  }, [globeLayers.satellites]);

  
  useEffect(() => {
    if ((import.meta as any).env.MODE !== 'development') return;
    const iss = satelliteData.find((s: any) =>
      s.name.includes('ISS') || s.name.includes('ZARYA') || s.name.includes('STATION')
    );
    if (iss) console.log('ISS position:', iss.lat.toFixed(2), iss.lng.toFixed(2), 'alt:', Math.round(iss.alt), 'km');
  }, [satelliteData, globeLayers.satellites]);

  
  useEffect(() => {
    if (!globeRef.current || orbitalInitRef.current) return;
    const scene = globeRef.current.scene() as THREE.Scene;
    const GLOBE_RADIUS = 100;

    orbitalInitRef.current = true;

    ORBITAL_CONFIGS.forEach(config => {
      const ring = createOrbitalRing(config, GLOBE_RADIUS);
      ring.visible = false;
      scene.add(ring);
      orbitalRingsRef.current.set(config.category, ring);

      const path = createOrbitPath(config, GLOBE_RADIUS);
      path.visible = false;
      scene.add(path);
      orbitalPathsRef.current.set(config.category, path);
    });

    console.log('[orbitalRings] initialized');
  
  }, [globeRef.current]);

  
  useEffect(() => {
    if (!globeRef.current || !orbitalInitRef.current) return;
    const scene = globeRef.current.scene() as THREE.Scene;
    const GLOBE_RADIUS = 100;

    
    orbitalMarkersRef.current.forEach(group => scene.remove(group));
    orbitalMarkersRef.current.clear();

    
    const byCategory = new Map<string, any[]>();
    satelliteData.forEach((sat: any) => {
      const cat = sat.category || 'general';
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat)!.push(sat);
    });

    
    const showSats = useGlobeStore.getState().globeLayers.satellites;
    ORBITAL_CONFIGS.forEach(config => {
      const sats = byCategory.get(config.category) ?? [];
      if (sats.length === 0) return;
      const markers = createSatelliteMarkers(sats, config, GLOBE_RADIUS);
      markers.visible = showSats;
      scene.add(markers);
      orbitalMarkersRef.current.set(config.category, markers);
    });

    console.log('[orbitalRings] markers updated, categories:', [...byCategory.keys()]);
  }, [satelliteData]);

  
  useEffect(() => {
    const showSats = globeLayers.satellites;

    ORBITAL_CONFIGS.forEach(config => {
      const ring    = orbitalRingsRef.current.get(config.category);
      const markers = orbitalMarkersRef.current.get(config.category);
      const path    = orbitalPathsRef.current.get(config.category);
      if (ring)    ring.visible    = showSats;
      if (markers) markers.visible = showSats;
      if (path)    path.visible    = showSats;
    });
  }, [globeLayers.satellites]);

  
  useEffect(() => {
    if (!globeRef.current) return;
    const renderer = globeRef.current.renderer() as THREE.WebGLRenderer;
    const scene    = globeRef.current.scene()    as THREE.Scene;
    const originalRender = renderer.render.bind(renderer);

    renderer.render = (s: THREE.Scene, cam: THREE.Camera) => {
      clockRef.current += 0.016;
      animateOrbitalRings(scene, clockRef.current);
      originalRender(s, cam);
    };

    return () => {
      renderer.render = originalRender;
    };
  
  }, [globeRef.current]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 0 }}
    />
  );
});

export default GlobeComponent;
