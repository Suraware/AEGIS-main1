import * as THREE from 'three';

export interface OrbitalRingConfig {
  category: string;
  color: number;
  glowColor: string;
  altitude: number; 
  tilt: number;     
  speed: number;    
  opacity: number;
  tubeRadius: number;
  label: string;
}

export const ORBITAL_CONFIGS: OrbitalRingConfig[] = [
  {
    category: 'station',
    color: 0xffffff,
    glowColor: '#ffffff',
    altitude: 1.065,
    tilt: 51.6,
    speed: 1.0,
    opacity: 0.7,
    tubeRadius: 0.008,
    label: 'Space Stations',
  },
  {
    category: 'military',
    color: 0xf87171,
    glowColor: '#f87171',
    altitude: 1.12,
    tilt: 98.0,
    speed: 0.85,
    opacity: 0.65,
    tubeRadius: 0.006,
    label: 'Military Recon',
  },
  {
    category: 'starlink',
    color: 0xa78bfa,
    glowColor: '#a78bfa',
    altitude: 1.088,
    tilt: 53.0,
    speed: 0.92,
    opacity: 0.5,
    tubeRadius: 0.004,
    label: 'Starlink',
  },
  {
    category: 'gps',
    color: 0x60a5fa,
    glowColor: '#60a5fa',
    altitude: 1.5,
    tilt: 55.0,
    speed: 0.25,
    opacity: 0.55,
    tubeRadius: 0.007,
    label: 'GPS / GNSS',
  },
  {
    category: 'visual',
    color: 0x34d399,
    glowColor: '#34d399',
    altitude: 1.10,
    tilt: 65.0,
    speed: 0.78,
    opacity: 0.45,
    tubeRadius: 0.004,
    label: 'Observation',
  },
  {
    category: 'general',
    color: 0x94a3b8,
    glowColor: '#94a3b8',
    altitude: 1.13,
    tilt: 28.5,
    speed: 0.6,
    opacity: 0.3,
    tubeRadius: 0.003,
    label: 'General',
  },
];


export const createOrbitalRing = (config: OrbitalRingConfig, globeRadius: number): THREE.Group => {
  const group = new THREE.Group();
  const r = globeRadius * config.altitude;

  
  const torusGeo = new THREE.TorusGeometry(r, globeRadius * config.tubeRadius, 8, 180);
  const torusMat = new THREE.MeshBasicMaterial({
    color: config.color,
    transparent: true,
    opacity: config.opacity,
  });
  group.add(new THREE.Mesh(torusGeo, torusMat));

  
  const glowGeo = new THREE.TorusGeometry(r, globeRadius * config.tubeRadius * 3.5, 8, 180);
  const glowMat = new THREE.MeshBasicMaterial({
    color: config.color,
    transparent: true,
    opacity: config.opacity * 0.18,
    side: THREE.BackSide,
  });
  group.add(new THREE.Mesh(glowGeo, glowMat));

  
  const outerGlowGeo = new THREE.TorusGeometry(r, globeRadius * config.tubeRadius * 7, 6, 180);
  const outerGlowMat = new THREE.MeshBasicMaterial({
    color: config.color,
    transparent: true,
    opacity: config.opacity * 0.06,
    side: THREE.BackSide,
  });
  group.add(new THREE.Mesh(outerGlowGeo, outerGlowMat));

  
  group.rotation.x = (config.tilt * Math.PI) / 180;

  group.userData = {
    isOrbitalRing: true,
    category: config.category,
    speed: config.speed,
    baseOpacity: config.opacity,
  };

  return group;
};


export const createSatelliteMarkers = (
  satellites: any[],
  config: OrbitalRingConfig,
  globeRadius: number,
): THREE.Group => {
  const group = new THREE.Group();
  const r = globeRadius * config.altitude;
  const count = Math.min(satellites.length, 60);

  for (let i = 0; i < count; i++) {
    const sat = satellites[i];
    const angle = (i / count) * Math.PI * 2;
    const isISS = sat.name?.toUpperCase().includes('ISS') || sat.name?.toUpperCase().includes('ZARYA');
    const size = isISS ? globeRadius * 0.012 : globeRadius * 0.005;

    
    const geo = new THREE.SphereGeometry(size, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: config.color });
    const dot = new THREE.Mesh(geo, mat);
    dot.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
    dot.userData = {
      isSatMarker: true,
      angle,
      radius: r,
      name: sat.name,
      category: sat.category,
      alt: sat.alt,
      lat: sat.lat,
      lng: sat.lng,
    };
    group.add(dot);

    
    if (isISS) {
      const panelGeo = new THREE.BoxGeometry(
        globeRadius * 0.04,
        globeRadius * 0.002,
        globeRadius * 0.008,
      );
      const panelMat = new THREE.MeshBasicMaterial({ color: 0x1e3a5f });
      const panels = new THREE.Mesh(panelGeo, panelMat);
      panels.position.copy(dot.position);
      group.add(panels);
    }

    
    const glintGeo = new THREE.SphereGeometry(size * 1.8, 4, 4);
    const glintMat = new THREE.MeshBasicMaterial({
      color: config.color,
      transparent: true,
      opacity: 0.4,
    });
    const glint = new THREE.Mesh(glintGeo, glintMat);
    glint.position.copy(dot.position);
    glint.userData = { isGlint: true, baseOpacity: 0.4, phase: Math.random() * Math.PI * 2 };
    group.add(glint);
  }

  
  group.rotation.x = (config.tilt * Math.PI) / 180;

  return group;
};


export const createOrbitPath = (config: OrbitalRingConfig, globeRadius: number): THREE.LineLoop => {
  const r = globeRadius * config.altitude;
  const segments = 256;
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
  }

  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({
    color: config.color,
    transparent: true,
    opacity: config.opacity * 0.3,
  });

  const line = new THREE.LineLoop(geo, mat);
  line.rotation.x = (config.tilt * Math.PI) / 180;
  line.userData = { isOrbitPath: true, category: config.category, speed: config.speed };

  return line;
};


export const animateOrbitalRings = (scene: THREE.Scene, elapsed: number): void => {
  scene.traverse(obj => {
    if (obj.userData.isOrbitalRing) {
      obj.rotation.y += 0.0002 * (obj.userData.speed as number);
    }

    if (obj.userData.isGlint) {
      const mat = (obj as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = 0.2 + Math.abs(Math.sin(elapsed * 1.5 + (obj.userData.phase as number))) * 0.5;
    }

    if (obj.userData.isOrbitPath) {
      obj.rotation.y += 0.0002 * ((obj.userData.speed as number) * 0.5);
    }
  });
};
