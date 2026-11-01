/**
 * LUNARX Interactive 3D Moon Visualizer
 * Built with Three.js following studio PBR rendering and zero external 404 dependencies.
 * Features:
 * - 100% Procedural high-resolution lunar albedo & bump textures (maria, highlands, crater rays)
 * - Dynamic Sun vector and realistic day/night terminator corresponding to mission timeline
 * - Interactive landing site markers with click-to-focus and hover inspection
 * - Custom coordinate marker for user-defined lat/lon
 * - Lunar coordinate grid overlay (equator, prime meridian, parallels)
 * - Smooth camera transitions and ergonomic collapsible bottom dock
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LunarSite, LunarCoordinates, MissionTimeState } from '../../types/lunar';
import { LUNAR_LANDING_SITES } from '../../data/lunarSites';
import { useTheme } from '../../context/ThemeContext';
import { 
  Compass, 
  Eye, 
  Layers, 
  RotateCcw, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Sun, 
  MapPin, 
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface LunarGlobe3DProps {
  selectedSite: LunarSite | null;
  customCoordinates: LunarCoordinates | null;
  timeState: MissionTimeState;
  onSelectSite: (site: LunarSite) => void;
  onCoordinatesClick?: (coords: LunarCoordinates) => void;
  className?: string;
}

// Convert Lunar lat/lng to 3D Cartesian coordinates on sphere of radius R
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Convert 3D Cartesian coordinates on sphere to Lunar lat/lng
function vector3ToLatLng(vector: THREE.Vector3): LunarCoordinates {
  const norm = vector.clone().normalize();
  const lat = 90 - (Math.acos(norm.y) * 180 / Math.PI);
  let lng = (Math.atan2(norm.z, -norm.x) * 180 / Math.PI) - 180;
  if (lng < -180) lng += 360;
  if (lng > 180) lng -= 360;
  return {
    lat: Number(lat.toFixed(2)),
    lng: Number(lng.toFixed(2))
  };
}

// Category marker colors
const CATEGORY_COLORS: Record<string, string> = {
  'Artemis Candidate': '#00E5FF', // Cyan
  'Apollo Historic': '#F59E0B',   // Amber
  'Volatile / PSR Target': '#10B981', // Emerald
  'Geological Anomaly': '#8B5CF6',    // Violet
  'South Pole-Aitken': '#EC4899',     // Pink
  'Mare Basin': '#3B82F6'             // Blue
};

export const LunarGlobe3D: React.FC<LunarGlobe3DProps> = ({
  selectedSite,
  customCoordinates,
  timeState,
  onSelectSite,
  onCoordinatesClick,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const gridGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const customMarkerRef = useRef<THREE.Group | null>(null);
  const moonMeshRef = useRef<THREE.Mesh | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const pointerDownPosRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const { settings } = useTheme();

  // UI States
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [showTerminator, setShowTerminator] = useState<boolean>(true);
  const [hoveredSite, setHoveredSite] = useState<LunarSite | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);
  const [viewPreset, setViewPreset] = useState<'default' | 'south-pole' | 'equatorial' | 'farside'>('south-pole');

  // Dynamic Theme & Visual Mode synchronization
  useEffect(() => {
    if (!sceneRef.current || !moonMeshRef.current) return;
    const themeBgMap: Record<string, number> = {
      'midnight-space': 0x050811,
      'lunar-aurora': 0x031114,
      'cosmic-violet': 0x0c0717,
      'lunar-light': 0xf4f6fa
    };
    const bgHex = themeBgMap[settings.theme] ?? 0x050811;
    sceneRef.current.background = new THREE.Color(bgHex);

    const mat = moonMeshRef.current.material as THREE.MeshStandardMaterial;
    if (mat) {
      if (settings.moonVisualMode === 'enhanced') {
        mat.bumpScale = 0.08;
        mat.roughness = 0.95;
      } else if (settings.moonVisualMode === 'minimal') {
        mat.bumpScale = 0.01;
        mat.roughness = 0.6;
        mat.metalness = 0.2;
      } else {
        mat.bumpScale = 0.04;
        mat.roughness = 0.88;
        mat.metalness = 0.05;
      }
      mat.needsUpdate = true;
    }
  }, [settings.theme, settings.moonVisualMode]);

  // Procedural Lunar Texture Generation
  const createProceduralLunarTextures = useCallback(() => {
    const width = 2048;
    const height = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Base lunar highland tone: silvery-grey with subtle micro-grain
    ctx.fillStyle = '#6e737c';
    ctx.fillRect(0, 0, width, height);

    // 1. Generate Highlands Variation (cellular mottling)
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        // Pseudo-random noise
        const n1 = Math.sin(x * 0.02) * Math.cos(y * 0.02);
        const n2 = Math.sin(x * 0.05 + 1.2) * Math.cos(y * 0.05 + 0.8);
        const grain = (Math.random() - 0.5) * 14;
        const val = 110 + n1 * 18 + n2 * 12 + grain;
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = val + 2; // subtle cool tint
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // 2. Draw Lunar Maria (Dark Basaltic Plains) on Nearside (-90° to +90° lng)
    // Canvas mapping: x=0 -> -180°, x=512 -> -90°, x=1024 -> 0°, x=1536 -> +90°, x=2048 -> +180°
    // y=0 -> +90° North, y=512 -> 0° Equator, y=1024 -> -90° South
    const drawMare = (cx: number, cy: number, rx: number, ry: number, darkness = 0.55) => {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(32, 35, 42, ${darkness})`;
      ctx.filter = 'blur(16px)';
      ctx.fill();
      ctx.restore();
    };

    // Oceanus Procellarum (huge western plain)
    drawMare(800, 420, 160, 190, 0.62);
    // Mare Imbrium
    drawMare(930, 320, 110, 95, 0.65);
    // Mare Serenitatis
    drawMare(1120, 350, 75, 75, 0.62);
    // Mare Tranquillitatis
    drawMare(1150, 460, 90, 80, 0.68);
    // Mare Crisium
    drawMare(1320, 410, 50, 45, 0.72);
    // Mare Fecunditatis
    drawMare(1280, 530, 70, 75, 0.6);
    // Mare Nectaris
    drawMare(1210, 570, 50, 50, 0.6);
    // Mare Nubium
    drawMare(940, 590, 80, 70, 0.58);
    // Mare Humorum
    drawMare(820, 600, 50, 50, 0.6);
    // South Pole-Aitken Basin (Farside deep dark depression)
    drawMare(1980, 780, 140, 90, 0.45);
    drawMare(100, 780, 120, 85, 0.45);

    // 3. Draw Major Rayed Craters (Tycho, Copernicus, Kepler) with bright ejecta
    const drawCraterWithRays = (cx: number, cy: number, r: number, rayCount = 12, rayLength = 180) => {
      ctx.save();
      // Ejecta rays
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        const ex = cx + Math.cos(angle) * (rayLength + Math.random() * 40);
        const ey = cy + Math.sin(angle) * (rayLength * 0.7 + Math.random() * 30);
        const grad = ctx.createLinearGradient(cx, cy, ex, ey);
        grad.addColorStop(0, 'rgba(235, 240, 250, 0.45)');
        grad.addColorStop(1, 'rgba(235, 240, 250, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = Math.random() * 3 + 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }
      // Crater Rim
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(220, 225, 235, 0.85)';
      ctx.fill();
      // Crater Floor
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(70, 75, 82, 0.7)';
      ctx.fill();
      ctx.restore();
    };

    // Tycho (distinct southern crater with massive rays)
    drawCraterWithRays(970, 750, 10, 20, 260);
    // Copernicus (bright equatorial crater)
    drawCraterWithRays(910, 460, 12, 16, 170);
    // Kepler
    drawCraterWithRays(810, 470, 7, 10, 90);
    // Aristarchus (brightest plateau)
    drawCraterWithRays(780, 380, 8, 8, 80);

    // Create CanvasTexture
    const albedoTexture = new THREE.CanvasTexture(canvas);
    albedoTexture.colorSpace = THREE.SRGBColorSpace;
    albedoTexture.wrapS = THREE.RepeatWrapping;
    albedoTexture.wrapT = THREE.ClampToEdgeWrapping;

    // Create procedural bump map for surface roughness and crater rim shadows
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 1024;
    bumpCanvas.height = 512;
    const bctx = bumpCanvas.getContext('2d')!;
    bctx.fillStyle = '#808080';
    bctx.fillRect(0, 0, 1024, 512);

    // Stamp craters into bump canvas
    for (let i = 0; i < 350; i++) {
      const bx = Math.random() * 1024;
      const by = Math.random() * 512;
      const br = Math.random() * 14 + 2;
      // White rim
      bctx.beginPath();
      bctx.arc(bx, by, br, 0, Math.PI * 2);
      bctx.strokeStyle = '#ffffff';
      bctx.lineWidth = 1.5;
      bctx.stroke();
      // Dark depression
      bctx.beginPath();
      bctx.arc(bx, by, br * 0.7, 0, Math.PI * 2);
      bctx.fillStyle = '#303030';
      bctx.fill();
    }
    const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
    bumpTexture.wrapS = THREE.RepeatWrapping;
    bumpTexture.wrapT = THREE.ClampToEdgeWrapping;

    return { albedoTexture, bumpTexture };
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Detect Software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060913);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    // Initial camera angled towards Lunar South Pole
    camera.position.set(0, -3.2, 3.8);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false
    });
    renderer.setSize(width, height);
    const isMobileDevice = typeof window !== 'undefined' && (window.innerWidth < 768 || 'ontouchstart' in window);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, isMobileDevice ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    containerRef.current.replaceChildren(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.4;
    controls.maxDistance = 8.0;
    controls.rotateSpeed = isMobileDevice ? 0.8 : 1.0;
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Lighting Rig
    // 1. Soft deep space ambient starlight
    const ambientLight = new THREE.AmbientLight(0x1a243b, 0.28);
    scene.add(ambientLight);

    // 2. Sun directional light (matches sub-solar coordinates)
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    sunLight.position.set(10, 0, 0);
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // 3. Earthshine light (faint blue wash on nearside)
    const earthLight = new THREE.DirectionalLight(0x4080ff, 0.15);
    earthLight.position.set(0, 0, 10);
    scene.add(earthLight);

    // Background Stars (Instanced Points)
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      const radius = 60 + Math.random() * 40;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = radius * Math.cos(phi);
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.8,
      transparent: true,
      opacity: 0.75
    });
    const starPoints = new THREE.Points(starGeometry, starMaterial);
    scene.add(starPoints);

    // 3D Lunar Mesh (Radius = 1.737 units representing 1737.4 km)
    const lunarRadius = 1.737;
    const { albedoTexture, bumpTexture } = createProceduralLunarTextures();

    const moonGeometry = new THREE.SphereGeometry(lunarRadius, 64, 64);
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: albedoTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.04,
      roughness: 0.88,
      metalness: 0.05
    });

    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moonMesh);
    moonMeshRef.current = moonMesh;

    // Coordinate Grid Overlay Group
    const gridGroup = new THREE.Group();
    const createCircleLine = (radius: number, y: number, color = 0x2563eb, opacity = 0.35) => {
      const segments = 64;
      const points = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radius, y, Math.sin(theta) * radius));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
      return new THREE.Line(geom, mat);
    };

    // Equator (lat 0°)
    gridGroup.add(createCircleLine(lunarRadius * 1.002, 0, 0x00e5ff, 0.5));
    // Polar Circles (lat ±80°)
    const polarY = lunarRadius * Math.sin(80 * Math.PI / 180);
    const polarR = lunarRadius * Math.cos(80 * Math.PI / 180) * 1.002;
    gridGroup.add(createCircleLine(polarR, polarY, 0x38bdf8, 0.4));
    gridGroup.add(createCircleLine(polarR, -polarY, 0x38bdf8, 0.4));

    // Mid-latitudes (lat ±30°, ±60°)
    [30, 60, -30, -60].forEach(lat => {
      const y = lunarRadius * Math.sin(lat * Math.PI / 180);
      const r = lunarRadius * Math.cos(lat * Math.PI / 180) * 1.002;
      gridGroup.add(createCircleLine(r, y, 0x1e3a8a, 0.25));
    });

    scene.add(gridGroup);
    gridGroupRef.current = gridGroup;

    // Landing Site Markers Group
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Custom Marker Group
    const customMarkerGroup = new THREE.Group();
    scene.add(customMarkerGroup);
    customMarkerRef.current = customMarkerGroup;

    // Animation Loop
    let animId = 0;
    const tick = () => {
      controls.update();
      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      moonGeometry.dispose();
      moonMaterial.dispose();
      albedoTexture.dispose();
      bumpTexture.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, [createProceduralLunarTextures]);

  // Update Sun Directional Light based on Mission Time State
  useEffect(() => {
    if (!sunLightRef.current) return;
    const { subSolarCoordinates } = timeState;
    // Map sub-solar lat/lng to sun directional position
    const sunDistance = 25;
    const sunPos = latLngToVector3(subSolarCoordinates.lat, subSolarCoordinates.lng, sunDistance);
    sunLightRef.current.position.copy(sunPos);
    sunLightRef.current.intensity = showTerminator ? 2.8 : 0.8;
  }, [timeState, showTerminator]);

  // Toggle Grid Visibility
  useEffect(() => {
    if (gridGroupRef.current) {
      gridGroupRef.current.visible = showGrid;
    }
  }, [showGrid]);

  // Render Landing Site 3D Markers
  useEffect(() => {
    if (!markersGroupRef.current) return;
    const group = markersGroupRef.current;
    group.visible = showMarkers;

    // Clear existing children
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if ('geometry' in obj) (obj as any).geometry?.dispose();
      if ('material' in obj) (obj as any).material?.dispose();
    }

    const lunarRadius = 1.737;

    LUNAR_LANDING_SITES.forEach(site => {
      const pos = latLngToVector3(site.coordinates.lat, site.coordinates.lng, lunarRadius);
      const isSelected = selectedSite?.id === site.id;
      const markerColor = CATEGORY_COLORS[site.category] || '#00E5FF';

      const siteGroup = new THREE.Group();
      siteGroup.position.copy(pos);
      siteGroup.lookAt(new THREE.Vector3(0, 0, 0));
      siteGroup.userData = { siteId: site.id, site };

      // Pin base disc
      const discGeom = new THREE.RingGeometry(0.015, isSelected ? 0.05 : 0.035, 24);
      const discMat = new THREE.MeshBasicMaterial({
        color: markerColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isSelected ? 0.95 : 0.75
      });
      const disc = new THREE.Mesh(discGeom, discMat);
      disc.position.z = -0.01;
      siteGroup.add(disc);

      // Pin Stem (cylinder extending outward from surface)
      const stemHeight = isSelected ? 0.16 : 0.09;
      const stemGeom = new THREE.CylinderGeometry(0.005, 0.005, stemHeight, 8);
      const stemMat = new THREE.MeshBasicMaterial({ color: markerColor });
      const stem = new THREE.Mesh(stemGeom, stemMat);
      stem.rotation.x = Math.PI / 2;
      stem.position.z = -(stemHeight / 2);
      siteGroup.add(stem);

      // Top Beacon Sphere
      const beaconGeom = new THREE.SphereGeometry(isSelected ? 0.024 : 0.016, 12, 12);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xffffff : markerColor
      });
      const beacon = new THREE.Mesh(beaconGeom, beaconMat);
      beacon.position.z = -stemHeight;
      siteGroup.add(beacon);

      // Selected site targeting reticle rings
      if (isSelected) {
        const reticleGeom = new THREE.RingGeometry(0.07, 0.08, 32);
        const reticleMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8
        });
        const reticle = new THREE.Mesh(reticleGeom, reticleMat);
        reticle.position.z = -0.02;
        siteGroup.add(reticle);
      }

      group.add(siteGroup);
    });
  }, [selectedSite, showMarkers]);

  // Render Custom Coordinates Pin
  useEffect(() => {
    if (!customMarkerRef.current) return;
    const group = customMarkerRef.current;

    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if ('geometry' in obj) (obj as any).geometry?.dispose();
      if ('material' in obj) (obj as any).material?.dispose();
    }

    if (!customCoordinates) return;

    const lunarRadius = 1.737;
    const pos = latLngToVector3(customCoordinates.lat, customCoordinates.lng, lunarRadius);

    const customPin = new THREE.Group();
    customPin.position.copy(pos);
    customPin.lookAt(new THREE.Vector3(0, 0, 0));

    // Amber-Gold Custom Crosshair
    const ringGeom = new THREE.RingGeometry(0.04, 0.055, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.z = -0.01;
    customPin.add(ring);

    // Crosshair Lines
    const lineMat = new THREE.LineBasicMaterial({ color: 0xf59e0b });
    const linePoints = [
      new THREE.Vector3(-0.08, 0, -0.01),
      new THREE.Vector3(0.08, 0, -0.01)
    ];
    const hLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(linePoints), lineMat);
    customPin.add(hLine);

    const vLinePoints = [
      new THREE.Vector3(0, -0.08, -0.01),
      new THREE.Vector3(0, 0.08, -0.01)
    ];
    const vLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(vLinePoints), lineMat);
    customPin.add(vLine);

    group.add(customPin);
  }, [customCoordinates]);

  // Camera presets
  const applyViewPreset = (preset: 'default' | 'south-pole' | 'equatorial' | 'farside') => {
    if (!cameraRef.current || !controlsRef.current) return;
    setViewPreset(preset);

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    switch (preset) {
      case 'south-pole':
        // View looking up into South Pole from below
        camera.position.set(0, -3.4, 1.8);
        controls.target.set(0, 0, 0);
        break;
      case 'equatorial':
        // Classic Nearside equatorial view
        camera.position.set(0, 0, 3.8);
        controls.target.set(0, 0, 0);
        break;
      case 'farside':
        // Farside view
        camera.position.set(0, 0, -3.8);
        controls.target.set(0, 0, 0);
        break;
      case 'default':
      default:
        camera.position.set(2.4, 1.5, 3.0);
        controls.target.set(0, 0, 0);
        break;
    }
    controls.update();
  };

  // Fly to site when selected
  useEffect(() => {
    if (!selectedSite || !cameraRef.current || !controlsRef.current) return;
    const targetPos = latLngToVector3(selectedSite.coordinates.lat, selectedSite.coordinates.lng, 3.2);
    // Smooth glide to position
    const cam = cameraRef.current;
    const controls = controlsRef.current;

    const startPos = cam.position.clone();
    let progress = 0;
    const duration = 600; // ms
    const startTime = performance.now();

    const animateCam = (now: number) => {
      const elapsed = now - startTime;
      progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      cam.position.lerpVectors(startPos, targetPos, ease);
      controls.update();
      if (progress < 1) {
        requestAnimationFrame(animateCam);
      }
    };
    requestAnimationFrame(animateCam);
  }, [selectedSite]);

  // Mouse Raycasting for Marker Hover & Click
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current || !markersGroupRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(markersGroupRef.current.children, true);

    if (intersects.length > 0) {
      // Find top-level siteGroup
      let topObj: THREE.Object3D | null = intersects[0].object;
      while (topObj && !topObj.userData?.site && topObj.parent) {
        topObj = topObj.parent;
      }
      if (topObj && topObj.userData?.site) {
        setHoveredSite(topObj.userData.site);
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        containerRef.current.style.cursor = 'pointer';
        return;
      }
    }

    setHoveredSite(null);
    setTooltipPos(null);
    containerRef.current.style.cursor = 'default';
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerDownPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerDownPosRef.current) return;
    const { x: startX, y: startY, time: startTime } = pointerDownPosRef.current;
    pointerDownPosRef.current = null;

    const distMoved = Math.hypot(e.clientX - startX, e.clientY - startY);
    const duration = Date.now() - startTime;

    // If user dragged or held for longer than 400ms, treat as orbit/pan, not a tap
    if (distMoved > 8 || duration > 450) {
      return;
    }

    if (!containerRef.current || !cameraRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    
    // Check if tapped on marker
    if (markersGroupRef.current) {
      const markerIntersects = raycasterRef.current.intersectObjects(markersGroupRef.current.children, true);
      if (markerIntersects.length > 0) {
        let topObj: THREE.Object3D | null = markerIntersects[0].object;
        while (topObj && !topObj.userData?.site && topObj.parent) {
          topObj = topObj.parent;
        }
        if (topObj && topObj.userData?.site) {
          onSelectSite(topObj.userData.site);
          return;
        }
      }
    }

    // Otherwise check if tapped on lunar sphere surface for custom coordinates
    if (moonMeshRef.current && onCoordinatesClick) {
      const surfaceIntersects = raycasterRef.current.intersectObject(moonMeshRef.current);
      if (surfaceIntersects.length > 0 && surfaceIntersects[0].point) {
        const clickedCoords = vector3ToLatLng(surfaceIntersects[0].point);
        onCoordinatesClick(clickedCoords);
      }
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const factor = direction === 'in' ? 0.8 : 1.25;
    cameraRef.current.position.multiplyScalar(factor);
    controlsRef.current.update();
  };

  return (
    <div className={`relative w-full h-full min-h-[360px] sm:min-h-[460px] bg-[#060913] select-none overflow-hidden touch-none ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div 
        ref={containerRef} 
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="w-full h-full min-h-[360px] sm:min-h-[460px] touch-none"
      />

      {/* Top HUD Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0f1d]/90 border border-cyan-500/30 rounded text-xs text-cyan-300 font-mono shadow-lg backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>LUNAR RECONNAISSANCE 3D MODEL</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0a0f1d]/80 border border-slate-700/60 rounded text-xs text-slate-300 font-mono">
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span>Sub-Solar: {timeState.subSolarCoordinates.lat}° Lat, {timeState.subSolarCoordinates.lng}° Lng</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0a0f1d]/80 border border-slate-700/60 rounded text-xs text-slate-300 font-mono">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>Libration: {timeState.librationLatDeg}° Lat, {timeState.librationLngDeg}° Lng</span>
        </div>
      </div>

      {/* Top Right Quick Actions */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
        <button
          onClick={() => handleZoom('in')}
          title="Zoom In"
          className="p-2 bg-[#0b1329]/90 hover:bg-[#132247] border border-slate-700/80 hover:border-cyan-500/50 rounded text-slate-200 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          title="Zoom Out"
          className="p-2 bg-[#0b1329]/90 hover:bg-[#132247] border border-slate-700/80 hover:border-cyan-500/50 rounded text-slate-200 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => applyViewPreset('default')}
          title="Reset Camera"
          className="p-2 bg-[#0b1329]/90 hover:bg-[#132247] border border-slate-700/80 hover:border-cyan-500/50 rounded text-slate-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Hover Tooltip */}
      {hoveredSite && tooltipPos && (
        <div 
          style={{ left: `${tooltipPos.x + 12}px`, top: `${tooltipPos.y - 32}px` }}
          className="absolute z-20 pointer-events-none bg-[#090e1d]/95 border border-cyan-400/60 rounded px-3 py-2 text-xs text-slate-100 shadow-xl max-w-xs"
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1 mb-1">
            <span className="font-semibold text-cyan-300">{hoveredSite.name}</span>
            <span className="text-[10px] px-1 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800">
              {hoveredSite.code}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-slate-300 font-mono">
            <span>Lat: {hoveredSite.coordinates.lat}°</span>
            <span>Lng: {hoveredSite.coordinates.lng}°</span>
            <span>Elev: {hoveredSite.elevationM}m</span>
            <span>Illum: {hoveredSite.annualIlluminationPct}%</span>
          </div>
          <p className="mt-1 text-[10px] text-cyan-400/90 font-mono">Click to evaluate landing site</p>
        </div>
      )}

      {/* Ergonomic Collapsible Bottom Control Dock (Three.js architecture standard) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-[94%] max-w-3xl flex flex-col items-center">
        {/* Collapse / Expand Toggle Tab */}
        <button
          onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
          className="flex items-center gap-1.5 px-3 py-1 bg-[#090e1d]/90 hover:bg-[#121c38] border-t border-x border-slate-700 rounded-t text-xs font-mono text-slate-300 hover:text-cyan-300 transition-colors shadow-md"
        >
          {isControlsCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>SHOW 3D CONTROLS</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>HIDE CONTROLS</span>
            </>
          )}
        </button>

        {/* Unified Bottom Dock */}
        {!isControlsCollapsed && (
          <div className="w-full bg-[#090f20]/95 border border-slate-700/80 rounded-b rounded-t-sm p-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Camera View Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mr-1">View:</span>
              <button
                onClick={() => applyViewPreset('south-pole')}
                className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
                  viewPreset === 'south-pole' 
                    ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50' 
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                South Pole (Artemis)
              </button>
              <button
                onClick={() => applyViewPreset('equatorial')}
                className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
                  viewPreset === 'equatorial' 
                    ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50' 
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                Nearside (Apollo)
              </button>
              <button
                onClick={() => applyViewPreset('farside')}
                className={`px-2 py-1 rounded font-mono text-[11px] transition-colors ${
                  viewPreset === 'farside' 
                    ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50' 
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                Farside (SPA)
              </button>
            </div>

            {/* Visual Overlays Toggles */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white font-mono text-[11px]">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Coords Grid</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white font-mono text-[11px]">
                <input
                  type="checkbox"
                  checked={showMarkers}
                  onChange={(e) => setShowMarkers(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Landing Sites</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white font-mono text-[11px]">
                <input
                  type="checkbox"
                  checked={showTerminator}
                  onChange={(e) => setShowTerminator(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <span>Sun Terminator</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Subtle Hint on bottom-left */}
      <div className="hidden lg:block absolute bottom-3 left-4 text-[10px] font-mono text-slate-500 pointer-events-none">
        DRAG TO ROTATE • SCROLL TO ZOOM • CLICK SURFACE FOR COORDINATES
      </div>
    </div>
  );
};
