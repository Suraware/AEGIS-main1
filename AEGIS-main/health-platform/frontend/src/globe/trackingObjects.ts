import * as THREE from 'three';




export const createSatelliteObject = (category: string) => {
  const group = new THREE.Group();

  
  const bodyGeo = new THREE.BoxGeometry(0.8, 0.4, 0.4);
  const bodyMat = new THREE.MeshBasicMaterial({
    color: category === 'military' ? 0xf87171
      : category === 'station' ? 0xffffff
      : category === 'gps' ? 0x60a5fa
      : category === 'starlink' ? 0xa78bfa
      : 0x94a3b8,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  
  const panelGeo = new THREE.BoxGeometry(1.8, 0.05, 0.6);
  const panelMat = new THREE.MeshBasicMaterial({
    color: category === 'military' ? 0x7f1d1d : 0x1e3a5f,
    transparent: true,
    opacity: 0.9,
  });
  const panels = new THREE.Mesh(panelGeo, panelMat);
  group.add(panels);

  
  const antGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4);
  const antMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const antenna = new THREE.Mesh(antGeo, antMat);
  antenna.position.y = 0.5;
  group.add(antenna);

  
  const dishGeo = new THREE.ConeGeometry(0.15, 0.15, 6);
  const dishMat = new THREE.MeshBasicMaterial({ color: 0xd1d5db });
  const dish = new THREE.Mesh(dishGeo, dishMat);
  dish.position.y = 0.85;
  group.add(dish);

  group.scale.setScalar(
    category === 'station' ? 3.0
    : category === 'military' ? 1.2
    : 0.8
  );

  return group;
};




export const createISSObject = () => {
  const group = new THREE.Group();

  
  const trussGeo = new THREE.BoxGeometry(8, 0.2, 0.2);
  const trussMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
  const truss = new THREE.Mesh(trussGeo, trussMat);
  group.add(truss);

  
  const arrayPositions = [-3.5, -1.2, 1.2, 3.5];
  arrayPositions.forEach(xPos => {
    const arrayGeo = new THREE.BoxGeometry(0.15, 0.05, 2.5);
    const arrayMat = new THREE.MeshBasicMaterial({ color: 0x1e40af });
    const topArray = new THREE.Mesh(arrayGeo, arrayMat);
    topArray.position.set(xPos, 0, 1.4);
    const bottomArray = new THREE.Mesh(arrayGeo, arrayMat);
    bottomArray.position.set(xPos, 0, -1.4);
    group.add(topArray);
    group.add(bottomArray);
  });

  
  const modulePositions = [-1.5, -0.5, 0.5, 1.5];
  modulePositions.forEach(xPos => {
    const modGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 8);
    const modMat = new THREE.MeshBasicMaterial({ color: 0xf1f5f9 });
    const mod = new THREE.Mesh(modGeo, modMat);
    mod.rotation.z = Math.PI / 2;
    mod.position.x = xPos;
    group.add(mod);
  });

  group.scale.setScalar(2.5);
  return group;
};




export const createMilitaryAircraftObject = () => {
  const group = new THREE.Group();

  
  const fuselageGeo = new THREE.ConeGeometry(0.12, 1.2, 4);
  const fuselageMat = new THREE.MeshBasicMaterial({ color: 0xf87171 });
  const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
  fuselage.rotation.x = Math.PI / 2;
  group.add(fuselage);

  
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(-0.6, -0.5);
  wingShape.lineTo(0.2, -0.1);
  wingShape.closePath();

  const wingGeo = new THREE.ShapeGeometry(wingShape);
  const wingMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    side: THREE.DoubleSide,
  });

  const leftWing = new THREE.Mesh(wingGeo, wingMat);
  leftWing.rotation.x = Math.PI / 2;
  leftWing.position.set(-0.3, 0, 0);
  group.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeo, wingMat);
  rightWing.rotation.x = Math.PI / 2;
  rightWing.rotation.z = Math.PI;
  rightWing.position.set(0.3, 0, 0);
  group.add(rightWing);

  
  const tailGeo = new THREE.BoxGeometry(0.05, 0.25, 0.2);
  const tail = new THREE.Mesh(tailGeo, fuselageMat);
  tail.position.z = -0.45;
  tail.position.y = 0.1;
  group.add(tail);

  group.scale.setScalar(0.9);
  return group;
};




export const createCivilianAircraftObject = () => {
  const group = new THREE.Group();

  
  const fuselageGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.0, 6);
  const fuselageMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
  const fuselage = new THREE.Mesh(fuselageGeo, fuselageMat);
  fuselage.rotation.x = Math.PI / 2;
  group.add(fuselage);

  
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0.1);
  wingShape.lineTo(-0.7, 0);
  wingShape.lineTo(-0.65, -0.05);
  wingShape.lineTo(0.1, 0.08);
  wingShape.closePath();

  const wingGeo = new THREE.ShapeGeometry(wingShape);
  const wingMat = new THREE.MeshBasicMaterial({
    color: 0xd1d5db,
    side: THREE.DoubleSide,
  });

  const leftWing = new THREE.Mesh(wingGeo, wingMat);
  leftWing.rotation.x = Math.PI / 2;
  group.add(leftWing);

  const rightWingShape = new THREE.Shape();
  rightWingShape.moveTo(0, -0.1);
  rightWingShape.lineTo(0.7, 0);
  rightWingShape.lineTo(0.65, 0.05);
  rightWingShape.lineTo(-0.1, -0.08);
  rightWingShape.closePath();

  const rightWingGeo = new THREE.ShapeGeometry(rightWingShape);
  const rightWing = new THREE.Mesh(rightWingGeo, wingMat);
  rightWing.rotation.x = Math.PI / 2;
  group.add(rightWing);

  
  const tailFinGeo = new THREE.BoxGeometry(0.04, 0.2, 0.15);
  const tailFin = new THREE.Mesh(tailFinGeo, fuselageMat);
  tailFin.position.set(0, 0.1, -0.4);
  group.add(tailFin);

  group.scale.setScalar(0.7);
  return group;
};




export const createNavalVesselObject = (isNaval: boolean) => {
  const group = new THREE.Group();

  
  const hullGeo = new THREE.BoxGeometry(1.2, 0.2, 0.35);
  const hullMat = new THREE.MeshBasicMaterial({
    color: isNaval ? 0x1e3a5f : 0x475569,
  });
  const hull = new THREE.Mesh(hullGeo, hullMat);
  group.add(hull);

  
  const superGeo = new THREE.BoxGeometry(0.5, 0.2, 0.25);
  const superMat = new THREE.MeshBasicMaterial({
    color: isNaval ? 0x1d4ed8 : 0x64748b,
  });
  const superstructure = new THREE.Mesh(superGeo, superMat);
  superstructure.position.set(0.1, 0.2, 0);
  group.add(superstructure);

  if (isNaval) {
    
    const mastGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4);
    const mastMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(0.1, 0.5, 0);
    group.add(mast);

    
    const radarGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.04, 8);
    const radarMat = new THREE.MeshBasicMaterial({ color: 0xbfdbfe });
    const radar = new THREE.Mesh(radarGeo, radarMat);
    radar.position.set(0.1, 0.72, 0);
    group.add(radar);

    
    const turretGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 6);
    const turretMat = new THREE.MeshBasicMaterial({ color: 0x1e40af });
    const turret = new THREE.Mesh(turretGeo, turretMat);
    turret.position.set(0.3, 0.22, 0);
    group.add(turret);
  }

  group.scale.setScalar(isNaval ? 1.2 : 0.9);
  return group;
};




export const createEarthquakeObject = (magnitude: number) => {
  const group = new THREE.Group();

  const rings = Math.min(3, Math.floor(magnitude));
  for (let i = 0; i < rings; i++) {
    const ringGeo = new THREE.TorusGeometry(
      0.3 + i * 0.2,
      0.04,
      4,
      16
    );
    const color = magnitude >= 6 ? 0xf87171
      : magnitude >= 4 ? 0xfb923c
      : 0xfacc15;
    const ringMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.8 - i * 0.2,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    group.add(ring);
  }

  
  const centerGeo = new THREE.SphereGeometry(0.15, 6, 6);
  const centerMat = new THREE.MeshBasicMaterial({
    color: magnitude >= 6 ? 0xf87171 : 0xfb923c,
  });
  group.add(new THREE.Mesh(centerGeo, centerMat));

  group.scale.setScalar(Math.max(0.5, magnitude * 0.3));
  return group;
};




export const createConflictObject = (severity: string) => {
  const group = new THREE.Group();

  const color = severity === 'critical' ? 0xf87171 : 0xfb923c;

  
  for (let i = 0; i < 8; i++) {
    const spikeGeo = new THREE.BoxGeometry(0.06, 0.5, 0.06);
    const spikeMat = new THREE.MeshBasicMaterial({ color });
    const spike = new THREE.Mesh(spikeGeo, spikeMat);
    spike.rotation.z = (i / 8) * Math.PI * 2;
    spike.position.y = 0.25;
    group.add(spike);
  }

  
  const coreGeo = new THREE.SphereGeometry(0.18, 6, 6);
  const coreMat = new THREE.MeshBasicMaterial({ color });
  group.add(new THREE.Mesh(coreGeo, coreMat));

  group.scale.setScalar(severity === 'critical' ? 1.2 : 0.8);
  return group;
};




export const createWildfireObject = (brightness: number) => {
  const group = new THREE.Group();

  const intensity = Math.min(1, (brightness - 300) / 200);
  const color = intensity > 0.7 ? 0xff4500 : intensity > 0.4 ? 0xff6a00 : 0xffa500;

  
  const flameGeo = new THREE.ConeGeometry(0.15, 0.5, 5);
  const flameMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.9,
  });
  const flame = new THREE.Mesh(flameGeo, flameMat);
  flame.position.y = 0.25;
  group.add(flame);

  
  const innerGeo = new THREE.ConeGeometry(0.08, 0.3, 5);
  const innerMat = new THREE.MeshBasicMaterial({ color: 0xfde68a });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  inner.position.y = 0.25;
  group.add(inner);

  
  const baseGeo = new THREE.CircleGeometry(0.2, 8);
  const baseMat = new THREE.MeshBasicMaterial({
    color: 0xff4500,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
  });
  group.add(new THREE.Mesh(baseGeo, baseMat));

  group.scale.setScalar(0.6 + intensity * 0.6);
  return group;
};




export const createCyberNodeObject = () => {
  const group = new THREE.Group();

  
  const ringGeo = new THREE.TorusGeometry(0.3, 0.04, 4, 16);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.8,
  });
  group.add(new THREE.Mesh(ringGeo, ringMat));

  
  const innerRingGeo = new THREE.TorusGeometry(0.18, 0.03, 4, 12);
  const innerRingMat = new THREE.MeshBasicMaterial({
    color: 0x7dd3fc,
    transparent: true,
    opacity: 0.9,
  });
  group.add(new THREE.Mesh(innerRingGeo, innerRingMat));

  
  const coreGeo = new THREE.SphereGeometry(0.1, 8, 8);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  group.add(new THREE.Mesh(coreGeo, coreMat));

  
  for (let i = 0; i < 4; i++) {
    const spikeGeo = new THREE.ConeGeometry(0.03, 0.15, 4);
    const spikeMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
    const spike = new THREE.Mesh(spikeGeo, spikeMat);
    spike.rotation.z = (i / 4) * Math.PI * 2;
    spike.position.set(
      Math.cos((i / 4) * Math.PI * 2) * 0.45,
      Math.sin((i / 4) * Math.PI * 2) * 0.45,
      0
    );
    group.add(spike);
  }

  return group;
};




export const createDroneObject = () => {
  const group = new THREE.Group();

  
  const bodyGeo = new THREE.BoxGeometry(0.25, 0.1, 0.25);
  const bodyMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
  group.add(new THREE.Mesh(bodyGeo, bodyMat));

  
  const armPositions: [number, number, number][] = [
    [0.25, 0, 0.25], [-0.25, 0, 0.25],
    [0.25, 0, -0.25], [-0.25, 0, -0.25],
  ];

  armPositions.forEach(([x, y, z]) => {
    
    const armGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35, 4);
    armGeo.rotateX(Math.PI / 2);
    armGeo.rotateY(Math.atan2(x, z));
    const armMat = new THREE.MeshBasicMaterial({ color: 0x374151 });
    const arm = new THREE.Mesh(armGeo, armMat);
    arm.position.set(x * 0.5, y, z * 0.5);
    group.add(arm);

    
    const motorGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 6);
    const motorMat = new THREE.MeshBasicMaterial({ color: 0xf87171 });
    const motor = new THREE.Mesh(motorGeo, motorMat);
    motor.position.set(x, y, z);
    group.add(motor);

    
    const rotorGeo = new THREE.CircleGeometry(0.12, 8);
    const rotorMat = new THREE.MeshBasicMaterial({
      color: 0x9ca3af,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    });
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    rotor.position.set(x, y + 0.07, z);
    group.add(rotor);
  });

  group.scale.setScalar(0.8);
  return group;
};




export const animateTrackingObjects = (scene: THREE.Scene, delta: number) => {
  scene.traverse(obj => {
    if ((obj as any).userData?.rotates) {
      obj.rotation.y += delta * (obj as any).userData.rotateSpeed;
    }
    if ((obj as any).userData?.pulses) {
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.15;
      obj.scale.setScalar(scale * (obj as any).userData.baseScale);
    }
  });
};
