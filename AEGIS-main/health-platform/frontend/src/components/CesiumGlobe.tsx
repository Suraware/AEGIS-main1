import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { useStore } from '../stores/useStore';
import { generateCountryHealthData } from '../services/healthApi';
import { COUNTRY_COORDINATES } from '../data/countryCoordinates';




const riskColor = (score: number, alpha = 0.55): Cesium.Color => {
    if (score < 25) return new Cesium.Color(0.13, 0.78, 0.37, alpha); 
    if (score < 50) return new Cesium.Color(0.92, 0.70, 0.03, alpha); 
    if (score < 75) return new Cesium.Color(0.98, 0.45, 0.09, alpha); 
    return new Cesium.Color(0.94, 0.27, 0.27, alpha); 
};

const hashRisk = (code: string): number =>
    ([...code].reduce((a, c) => a + c.charCodeAt(0), 0) % 80) + 10;


const CENTROIDS: Record<string, [number, number]> = {};
for (const country of COUNTRY_COORDINATES) {
    CENTROIDS[country.iso2] = [country.longitude, country.latitude];
}

export interface CesiumGlobeHandle {
    flyTo: (lon: number, lat: number, height?: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
    resumeAutoRotate: () => void;
}

const INITIAL_CAMERA = {
    lon: 10,
    lat: 20,
    height: 25_000_000,
};

interface Props {
    onCountryClick: (country: { name: string; code: string }) => void;
    onCountryMapClick?: (country: { name: string; code: string; latitude: number; longitude: number }) => void;
}

const CesiumGlobe = forwardRef<CesiumGlobeHandle, Props>(({ onCountryClick, onCountryMapClick }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<Cesium.Viewer | null>(null);
    const geoSourceRef = useRef<Cesium.GeoJsonDataSource | null>(null);
    const layerSourcesRef = useRef<Record<string, Cesium.CustomDataSource>>({});
    const autoRotRef = useRef(true);
    const handlerRef = useRef<Cesium.ScreenSpaceEventHandler | null>(null);
    const onCountryClickRef = useRef(onCountryClick);
    const onCountryMapClickRef = useRef(onCountryMapClick);
    const [error, setError] = useState<string | null>(null);

    const { layers } = useStore();

    useEffect(() => {
        onCountryClickRef.current = onCountryClick;
        onCountryMapClickRef.current = onCountryMapClick;
    }, [onCountryClick, onCountryMapClick]);

    
    useImperativeHandle(ref, () => ({
        flyTo: (lon, lat, height = 1_500_000) => {
            autoRotRef.current = false;
            viewerRef.current?.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
                duration: 2,
                easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
                orientation: {
                    heading: Cesium.Math.toRadians(0),
                    pitch: Cesium.Math.toRadians(-60),
                    roll: 0,
                },
            });
        },
        zoomIn: () => {
            const viewer = viewerRef.current;
            if (!viewer) return;
            autoRotRef.current = false;
            const cartographic = viewer.camera.positionCartographic;
            const currentHeight = Math.max(cartographic.height, 200_000);
            viewer.camera.zoomIn(currentHeight * 0.35);
        },
        zoomOut: () => {
            const viewer = viewerRef.current;
            if (!viewer) return;
            autoRotRef.current = false;
            const cartographic = viewer.camera.positionCartographic;
            const currentHeight = Math.max(cartographic.height, 200_000);
            viewer.camera.zoomOut(currentHeight * 0.45);
        },
        resetView: () => {
            if (!viewerRef.current) return;
            autoRotRef.current = true;
            viewerRef.current.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(
                    INITIAL_CAMERA.lon,
                    INITIAL_CAMERA.lat,
                    INITIAL_CAMERA.height
                ),
                duration: 1.8,
                easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
            });
        },
        resumeAutoRotate: () => {
            autoRotRef.current = true;
        },
    }));

    
    useEffect(() => {
        if (!containerRef.current) return;

        try {
            const viewer = new Cesium.Viewer(containerRef.current, {
                animation: false,
                baseLayerPicker: false,
                fullscreenButton: false,
                geocoder: false,
                homeButton: false,
                infoBox: false,
                sceneModePicker: false,
                selectionIndicator: false,
                timeline: false,
                navigationHelpButton: false,
                creditContainer: document.createElement('div'), 
                terrainProvider: new Cesium.EllipsoidTerrainProvider(),
                orderIndependentTranslucency: false,
            });
            
            console.log('✓ Cesium Viewer created successfully');
            
            
            setTimeout(() => {
                if (viewer.isDestroyed()) return;
                Cesium.CesiumTerrainProvider.fromUrl(
                    'https://cloud.sdsc.edu/v1/AUTH_ogc/Raster/GEBCO_2020/GEBCO_2020.glb'
                ).then(terrainProvider => {
                    if (!viewer.isDestroyed()) {
                        viewer.terrainProvider = terrainProvider;
                        console.log('✓ 3D terrain loaded');
                    }
                }).catch(() => {
                    console.log('3D terrain unavailable, using basic globe');
                });
            }, 1000);
            console.log('✓ Cesium Viewer initialized successfully');

        viewerRef.current = viewer;

        
        viewer.imageryLayers.removeAll();
        
        
        const osmLayer = viewer.imageryLayers.addImageryProvider(
            new Cesium.OpenStreetMapImageryProvider({
                url: 'https://tile.openstreetmap.org/',
                fileExtension: 'png',
                credit: '© OpenStreetMap contributors',
            })
        );

        
        Cesium.ArcGisMapServerImageryProvider.fromUrl(
            'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
        ).then(esriProvider => {
            if (!viewer.isDestroyed()) {
                
                viewer.imageryLayers.remove(osmLayer, true);
                viewer.imageryLayers.addImageryProvider(esriProvider);
                console.log('✓ ESRI World Imagery loaded');
            }
        }).catch(err => {
            console.log('ESRI imagery failed, keeping OpenStreetMap', err);
        });

        
        viewer.resolutionScale = window.devicePixelRatio; 
        viewer.scene.globe.maximumScreenSpaceError = 2; 
        viewer.scene.fog.enabled = false; 
        viewer.scene.fog.density = 0.00001;
        
        
        if (viewer.scene.skyAtmosphere) {
            viewer.scene.skyAtmosphere.show = true;
            viewer.scene.skyAtmosphere.saturationShift = 0.4;
            viewer.scene.skyAtmosphere.brightnessShift = 0.3;
        }
        if (viewer.scene.sun) {
            viewer.scene.sun.show = true;
        }
        if (viewer.scene.moon) viewer.scene.moon.show = false;
        
        
        (viewer.scene.globe as any).enableLighting = true;
        viewer.scene.globe.depthTestAgainstTerrain = false;
        viewer.scene.highDynamicRange = true;
        
        
        Cesium.RequestScheduler.maximumRequestsPerServer = 18;

        
        const scc = viewer.scene.screenSpaceCameraController;
        scc.enableCollisionDetection = false;
        scc.inertiaSpin = 0.9;
        scc.inertiaTranslate = 0.9;
        scc.inertiaZoom = 0.9;
        scc.minimumZoomDistance = 150_000;
        scc.maximumZoomDistance = 50_000_000;

        
        viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(
                INITIAL_CAMERA.lon,
                INITIAL_CAMERA.lat,
                INITIAL_CAMERA.height
            ), 
        });

        
        viewer.scene.postRender.addEventListener(() => {
            if (autoRotRef.current) {
                viewer.camera.rotateRight(0.0001); 
            }
        });

        
        
        fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
            .then(r => r.json())
            .then(data => {
                
                for (const feature of data.features) {
                    const cleanProps = {
                        ISO_A2: feature.properties.ISO_A2,
                        ADM0_A3: feature.properties.ADM0_A3
                    };
                    feature.properties = cleanProps;
                }
                return Cesium.GeoJsonDataSource.load(data, {
                    stroke: Cesium.Color.fromCssColorString('#00d4ff').withAlpha(0.3), 
                    strokeWidth: 2,
                    fill: Cesium.Color.TRANSPARENT,
                    clampToGround: true,
                });
            })
            .then((ds) => {
                if (viewer.isDestroyed()) return;
                geoSourceRef.current = ds;
                viewer.dataSources.add(ds);

                
                for (const entity of ds.entities.values) {
                    const code: string =
                        (entity.properties?.['ISO_A2']?.getValue(Cesium.JulianDate.now()) as string) ?? '';
                    const score = hashRisk(code);
                    if (entity.polygon) {
                        entity.polygon.material = new Cesium.ColorMaterialProperty(
                            riskColor(score, 0.45)
                        );
                        entity.polygon.outline = new Cesium.ConstantProperty(true);
                        entity.polygon.outlineColor = new Cesium.ConstantProperty(
                            Cesium.Color.fromCssColorString('#00d4ff').withAlpha(0.25)
                        );
                    }
                }
            })
            .catch(e => console.error('GeoJSON load error:', e));

        
        const LAYER_IDS = ['disease', 'hospital', 'airQuality', 'wastewater', 'trials', 'fda'];
        for (const id of LAYER_IDS) {
            const ds = new Cesium.CustomDataSource(id);
            viewer.dataSources.add(ds);
            layerSourcesRef.current[id] = ds;
        }

        
        const diseaseDS = layerSourcesRef.current['disease'];
        const smallIslands = ['AG', 'AW', 'BQ', 'KY', 'CW', 'MS', 'PR', 'BL', 'MF', 'SX', 'TC', 'VG', 'VI', 'AI', 'BB', 'DM', 'GD', 'KN', 'LC', 'VC', 'BS', 'JM', 'DO', 'CU', 'HT'];
        
        for (const country of COUNTRY_COORDINATES) {
            const score = hashRisk(country.iso2);
            
            const isSmallIsland = smallIslands.includes(country.iso2);
            const baseSize = isSmallIsland ? 8 : 4;
            
            const dot = diseaseDS.entities.add({
                position: Cesium.Cartesian3.fromDegrees(country.longitude, country.latitude, 50_000),
                point: {
                    pixelSize: baseSize + score / 10,
                    color: riskColor(score, 0.9),
                    outlineColor: Cesium.Color.BLACK.withAlpha(0.5),
                    outlineWidth: isSmallIsland ? 2 : 1,
                    heightReference: Cesium.HeightReference.NONE,
                },
                label: {
                    text: country.iso2,
                    font: '10px Inter, sans-serif',
                    fillColor: Cesium.Color.WHITE.withAlpha(0.7),
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    pixelOffset: new Cesium.Cartesian2(0, -20),
                    heightReference: Cesium.HeightReference.NONE,
                    show: false,
                },
            });
            (dot as any)._iso2 = country.iso2;
            (dot as any)._countryName = country.name;
        }

        
        const trialsDS = layerSourcesRef.current['trials'];
        for (const country of COUNTRY_COORDINATES) {
            const score = hashRisk(country.iso2);
            const isSmallIsland = smallIslands.includes(country.iso2);
            const baseSize = isSmallIsland ? 8 : 4;
            
            const trialDot = trialsDS.entities.add({
                position: Cesium.Cartesian3.fromDegrees(country.longitude, country.latitude, 100_000),
                point: {
                    pixelSize: baseSize + score / 15, 
                    color: riskColor(score, 0.8),
                    outlineColor: Cesium.Color.BLACK.withAlpha(0.3),
                    outlineWidth: isSmallIsland ? 2 : 1,
                    heightReference: Cesium.HeightReference.NONE,
                },
            });
            (trialDot as any)._iso2 = country.iso2;
            (trialDot as any)._countryName = country.name;
        }

        
        const hospDS = layerSourcesRef.current['hospital'];
        for (const country of COUNTRY_COORDINATES) {
            const cap = hashRisk(country.iso2) * 0.7 + 20;
            const isSmallIsland = smallIslands.includes(country.iso2);
            const baseRadius = isSmallIsland ? 500_000 : 300_000; 
            
            const color = cap < 70
                ? new Cesium.Color(0.13, 0.78, 0.37, 0.35)
                : cap < 85
                    ? new Cesium.Color(0.92, 0.70, 0.03, 0.4)
                    : new Cesium.Color(0.94, 0.27, 0.27, 0.45);
            const hospDot = hospDS.entities.add({
                position: Cesium.Cartesian3.fromDegrees(country.longitude, country.latitude),
                ellipse: {
                    semiMajorAxis: baseRadius,
                    semiMinorAxis: baseRadius * 0.67,
                    material: new Cesium.ColorMaterialProperty(color),
                    outline: true,
                    outlineColor: color.brighten(0.5, new Cesium.Color()),
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                },
            });
            (hospDot as any)._iso2 = country.iso2;
            (hospDot as any)._countryName = country.name;
        }

        
        const selectionRing = viewer.entities.add({
            name: 'Selection Ring',
            position: Cesium.Cartesian3.fromDegrees(0, 0),
            show: false,
            ellipse: {
                semiMajorAxis: new Cesium.CallbackProperty((time) => {
                    
                    
                    const seconds = time ? Cesium.JulianDate.secondsDifference(time, new Cesium.JulianDate()) : 0;
                    return 400000 + Math.sin(seconds * 5) * 50000;
                }, false) as any,
                semiMinorAxis: new Cesium.CallbackProperty((time) => {
                    
                    const seconds = time ? Cesium.JulianDate.secondsDifference(time, new Cesium.JulianDate()) : 0;
                    return 400000 + Math.sin(seconds * 5) * 50000;
                }, false) as any,
                material: new Cesium.ColorMaterialProperty(
                    new Cesium.CallbackProperty((time) => {
                        
                        const seconds = time ? Cesium.JulianDate.secondsDifference(time, new Cesium.JulianDate()) : 0;
                        const opacity = 0.4 + Math.sin(seconds * 5) * 0.2;
                        return Cesium.Color.fromCssColorString('#00d4ff').withAlpha(opacity);
                    }, false)
                ),
                outline: true,
                outlineColor: Cesium.Color.fromCssColorString('#00d4ff'),
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
        });

        
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handlerRef.current = handler;

        handler.setInputAction((evt: Cesium.ScreenSpaceEventHandler.PositionedEvent) => {
            const picked = viewer.scene.pick(evt.position);

            if (!Cesium.defined(picked)) {
                selectionRing.show = false;
                autoRotRef.current = true;
                return;
            }

            const entity = picked?.id as any;
            if (!entity) return;

            
            let iso2Upper: string;
            let countryName: string;

            if (entity._iso2) {
                
                iso2Upper = (entity._iso2 as string).toUpperCase();
                countryName = entity._countryName as string;
            } else {
                
                const now = Cesium.JulianDate.now();
                const code: string =
                    (entity.properties?.['ISO_A2']?.getValue(now) as string) ??
                    (entity.properties?.['ADM0_A3']?.getValue(now) as string) ?? '';
                iso2Upper = code.trim().toUpperCase();
                if (!iso2Upper || iso2Upper === '-1' || iso2Upper === '-99') return;
                const found = COUNTRY_COORDINATES.find(c => c.iso2 === iso2Upper);
                countryName = found?.name ?? '';
            }

            if (!iso2Upper || !countryName) return;

            autoRotRef.current = false;

            
            
            const centroid: [number, number] = CENTROIDS[iso2Upper] ?? pickingPositionToDegrees(viewer, evt.position) ?? [0, 20];

            selectionRing.position = Cesium.Cartesian3.fromDegrees(centroid[0], centroid[1]) as any;
            selectionRing.show = true;

            
            const isSmallIsland = ['AG', 'AW', 'BQ', 'KY', 'CW', 'MS', 'PR', 'BL', 'MF', 'SX', 'TC', 'VG', 'VI', 'AI', 'BB', 'DM', 'GD', 'KN', 'LC', 'VC', 'BS', 'JM'].includes(iso2Upper);
            const zoomHeight = isSmallIsland ? 300_000 : 1_500_000;

            console.log('DOT CLICKED:', countryName, iso2Upper, 'centroid:', centroid, 'zoomHeight:', zoomHeight);

            
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(centroid[0], centroid[1], zoomHeight),
                duration: 2,
                easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
                orientation: {
                    heading: Cesium.Math.toRadians(0),
                    pitch: Cesium.Math.toRadians(-90),
                    roll: 0,
                },
            });
            const countryData = COUNTRY_COORDINATES.find(c => c.iso2 === iso2Upper);
            onCountryClickRef.current({ name: countryName, code: iso2Upper.toLowerCase() });
            if (onCountryMapClickRef.current && countryData) {
                onCountryMapClickRef.current({
                    name: countryName,
                    code: iso2Upper.toLowerCase(),
                    latitude: countryData.latitude,
                    longitude: countryData.longitude,
                });
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        
        function pickingPositionToDegrees(v: Cesium.Viewer, pos: Cesium.Cartesian2): [number, number] | null {
            const ray = v.camera.getPickRay(pos);
            let cartesian: Cesium.Cartesian3 | undefined;

            if (ray) {
                cartesian = v.scene.globe.pick(ray, v.scene) ?? undefined;
            }

            if (!cartesian) {
                cartesian = v.camera.pickEllipsoid(pos) ?? undefined;
            }

            if (cartesian) {
                const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                return [Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude)];
            }
            return null;
        }

            return () => {
                handler.destroy();
                viewer.destroy();
            };
        } catch (err) {
            console.error('✗ Cesium Viewer initialization failed:', err);
            setError(`Cesium initialization error: ${err instanceof Error ? err.message : String(err)}`);
        }
    }, []);

    
    useEffect(() => {
        for (const [id, ds] of Object.entries(layerSourcesRef.current)) {
            ds.show = layers[id as keyof typeof layers] ?? false;
        }
    }, [layers]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 0,
                background: '#000',
            }}
        >
            {error && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: '#1a1a2e',
                    border: '2px solid #e74c3c',
                    borderRadius: '8px',
                    padding: '2rem',
                    maxWidth: '500px',
                    color: '#ecf0f1',
                    fontFamily: 'monospace',
                    textAlign: 'center',
                    zIndex: 100,
                }}>
                    <h2 style={{ color: '#e74c3c', marginBottom: '1rem' }}>Cesium Initialization Error</h2>
                    <p>{error}</p>
                    <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#bdc3c7' }}>
                        Check the browser console for more details
                    </p>
                </div>
            )}
        </div>
    );
});

CesiumGlobe.displayName = 'CesiumGlobe';
export default CesiumGlobe;
