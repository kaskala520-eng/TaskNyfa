import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Trophy, 
  Play, 
  Cpu, 
  Info,
  Maximize2
} from 'lucide-react';
import { getAcademicGameIcon, getAcademicGameColor } from './GamesPortal';

interface GameItem {
  id: string;
  nameAr: string;
  nameEn: string;
}

interface ThreeDGameArcadeProps {
  items: GameItem[];
  onSelect: (item: GameItem) => void;
  isAr: boolean;
  getAcademicGameIcon: (id: string) => React.ReactNode;
  getAcademicGameColor: (id: string) => string;
}

// Map IDs to specific emissive colors for the 3D Arcade Cabinets
const getCategoryColor = (id: string): string => {
  switch (id) {
    case 'edu_school': return '#6366f1'; // Indigo
    case 'edu_tutor': return '#3b82f6'; // Blue
    case 'edu_medicine': return '#f43f5e'; // Rose
    case 'edu_engineering': return '#f59e0b'; // Amber
    case 'edu_sciences_pure': return '#06b6d4'; // Cyan
    case 'edu_computer_science': return '#14b8a6'; // Teal
    case 'edu_law_politics': return '#8b5cf6'; // Violet
    case 'edu_business_economy': return '#10b981'; // Emerald
    case 'edu_humanities': return '#f97316'; // Orange
    case 'edu_languages': return '#a855f7'; // Purple
    case 'edu_islamic_studies': return '#0ea5e9'; // Sky
    case 'edu_special_education': return '#d946ef'; // Fuchsia
    case 'edu_sports_physical': return '#22c55e'; // Green
    case 'edu_fine_arts': return '#ec4899'; // Pink
    default: return '#64748b'; // Slate
  }
};

export default function ThreeDGameArcade({
  items,
  onSelect,
  isAr,
}: ThreeDGameArcadeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [highQuality, setHighQuality] = useState(true);
  const [showControlsHint, setShowControlsHint] = useState(true);

  // Keep references for animation loop
  const stateRef = useRef({
    selectedIndex: 0,
    targetRotation: 0,
    currentRotation: 0,
    isDragging: false,
    startX: 0,
    startRotation: 0,
    hoveredIndex: -1,
  });

  // Track selectedIndex in ref so animation loop can access latest state
  useEffect(() => {
    stateRef.current.selectedIndex = selectedIndex;
    stateRef.current.targetRotation = -selectedIndex * ((Math.PI * 2) / Math.max(1, items.length));
  }, [selectedIndex, items.length]);

  const activeItem = items[selectedIndex] || null;

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % items.length);
    setShowControlsHint(false);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
    setShowControlsHint(false);
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || items.length === 0) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    
    // Ambient fog
    const isDark = document.documentElement.classList.contains('dark');
    scene.background = null; // Transparent background to blend with our web design
    scene.fog = new THREE.FogExp2(isDark ? '#090d16' : '#f8fafc', 0.08);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 2.5, 9);
    camera.lookAt(0, 0.8, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: highQuality,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = highQuality;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Carousel Group
    const carouselGroup = new THREE.Group();
    carouselGroup.position.set(0, 0.2, 0);
    scene.add(carouselGroup);

    // Create 3D Game Cabinets
    const cabinets: THREE.Group[] = [];
    const radius = 3.5; // Radius of carousel ring
    const count = items.length;

    // Common Geometries for performance
    const bodyGeom = new THREE.BoxGeometry(0.9, 1.4, 0.35);
    const screenGeom = new THREE.BoxGeometry(0.75, 0.55, 0.1);
    const baseGeom = new THREE.BoxGeometry(1.0, 0.15, 0.5);
    const topLightGeom = new THREE.BoxGeometry(0.6, 0.08, 0.25);

    items.forEach((item, index) => {
      const cabinetColorHex = getCategoryColor(item.id);
      const themeColor = new THREE.Color(cabinetColorHex);

      // Unique group for this cabinet
      const cabinet = new THREE.Group();

      // Materials
      const bodyMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x1e293b : 0xe2e8f0,
        roughness: 0.2,
        metalness: 0.8,
      });

      const screenMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: themeColor,
        emissiveIntensity: 0.6,
        roughness: 0.1,
      });

      const accentMat = new THREE.MeshStandardMaterial({
        color: themeColor,
        emissive: themeColor,
        emissiveIntensity: 1.5,
      });

      // 1. Cabinet Base Body
      const body = new THREE.Mesh(bodyGeom, bodyMat);
      body.position.y = 0.7;
      body.castShadow = highQuality;
      body.receiveShadow = highQuality;
      cabinet.add(body);

      // 2. Bevelled Bottom Pedestal
      const pedestal = new THREE.Mesh(baseGeom, bodyMat);
      pedestal.position.y = 0.075;
      pedestal.castShadow = highQuality;
      cabinet.add(pedestal);

      // 3. Glowing Arcade Screen
      const screen = new THREE.Mesh(screenGeom, screenMat);
      screen.position.set(0, 0.9, 0.15);
      cabinet.add(screen);

      // 4. Top glowing marquee / bar
      const topLight = new THREE.Mesh(topLightGeom, accentMat);
      topLight.position.set(0, 1.42, 0.08);
      cabinet.add(topLight);

      // Positioning in ring
      const angle = (index / count) * Math.PI * 2;
      cabinet.position.x = Math.sin(angle) * radius;
      cabinet.position.z = Math.cos(angle) * radius;
      
      // Face outward from center
      cabinet.rotation.y = angle;

      // Store index and id on object for raycasting
      cabinet.userData = { index, id: item.id };

      carouselGroup.add(cabinet);
      cabinets.push(cabinet);
    });

    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(isDark ? 0x111827 : 0xf1f5f9, isDark ? 1.5 : 2.5);
    scene.add(ambientLight);

    // Directional Spotlights for glorious shadows
    const dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.8 : 1.2);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = highQuality;
    if (highQuality) {
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 25;
      dirLight.shadow.bias = -0.001;
    }
    scene.add(dirLight);

    // Subtle colored rim light from bottom
    const rimLight = new THREE.PointLight(0x6366f1, 2.0, 10);
    rimLight.position.set(0, -1, 0);
    scene.add(rimLight);

    // Dynamic Floating Starfield Particles
    const particleCount = highQuality ? 120 : 50;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Circle distribution
      const pAngle = Math.random() * Math.PI * 2;
      const pRadius = 2 + Math.random() * 6;
      positions[i] = Math.sin(pAngle) * pRadius;
      positions[i + 1] = (Math.random() - 0.2) * 4; // float around ground
      positions[i + 2] = Math.cos(pAngle) * pRadius;

      // Golden or blue glow
      const isGold = Math.random() > 0.5;
      colors[i] = isGold ? 1.0 : 0.38;     // R
      colors[i + 1] = isGold ? 0.84 : 0.4;  // G
      colors[i + 2] = isGold ? 0.0 : 0.98;  // B
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const starParticles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(starParticles);

    // Beautiful Grid Floor reflecting arcade neon
    const gridHelper = new THREE.GridHelper(24, 24, isDark ? 0x312e81 : 0xcbd5e1, isDark ? 0x1e1b4b : 0xf1f5f9);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Interactive Dragging / Swiping Mechanism
    const handlePointerDown = (e: PointerEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.startX = e.clientX;
      stateRef.current.startRotation = stateRef.current.currentRotation;
      setIsRotating(false);
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Raycasting for interactive hover effect
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      // Only check body mesh parts of the cabinet groups
      const intersects = raycaster.intersectObjects(carouselGroup.children, true);
      
      if (intersects.length > 0) {
        // Find top-level cabinet group in intersections
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && obj.parent !== carouselGroup) {
          obj = obj.parent;
        }
        if (obj && obj.userData) {
          stateRef.current.hoveredIndex = obj.userData.index;
        }
      } else {
        stateRef.current.hoveredIndex = -1;
      }

      // Drag physics
      if (!stateRef.current.isDragging) return;
      const deltaX = e.clientX - stateRef.current.startX;
      // Map pixel movement to rotation radians
      const speedMultiplier = 0.005;
      stateRef.current.targetRotation = stateRef.current.startRotation + (deltaX * speedMultiplier);
    };

    const handlePointerUp = () => {
      if (!stateRef.current.isDragging) return;
      stateRef.current.isDragging = false;
      
      // Snap carousel to the closest cabinet item
      const angleStep = (Math.PI * 2) / count;
      let rawIndex = -stateRef.current.targetRotation / angleStep;
      
      // Handle modular wrapping correctly
      let normalizedIndex = Math.round(rawIndex) % count;
      if (normalizedIndex < 0) normalizedIndex += count;
      
      setSelectedIndex(normalizedIndex);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Click handler to select cabinet instantly
    const handleCanvasClick = (e: MouseEvent) => {
      if (stateRef.current.isDragging) return;
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(carouselGroup.children, true);

      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && obj.parent !== carouselGroup) {
          obj = obj.parent;
        }
        if (obj && obj.userData && typeof obj.userData.index === 'number') {
          setSelectedIndex(obj.userData.index);
          setShowControlsHint(false);
          // Play classic coin beep feedback
          try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
              const ctx = new AudioContextClass();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(520, ctx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
              gain.gain.setValueAtTime(0.08, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start();
              osc.stop(ctx.currentTime + 0.15);
            }
          } catch {}
        }
      }
    };

    canvas.addEventListener('click', handleCanvasClick);

    // Watch resizing via robust ResizeObserver as per Guidelines
    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smoothly rotate star particles
      starParticles.rotation.y = elapsedTime * 0.02;

      // Soft vertical float for particles
      const positionsAttr = starParticles.geometry.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        const yIndex = i * 3 + 1;
        // Apply micro floating waves to particles
        positionsAttr.array[yIndex] += Math.sin(elapsedTime + i) * 0.0015;
      }
      positionsAttr.needsUpdate = true;

      // Handle Carousel rotation physics (lerp towards target rotation)
      const lerpFactor = stateRef.current.isDragging ? 0.35 : 0.1;
      stateRef.current.currentRotation += (stateRef.current.targetRotation - stateRef.current.currentRotation) * lerpFactor;
      carouselGroup.rotation.y = stateRef.current.currentRotation;

      // Auto-rotation idle state
      if (isRotating && !stateRef.current.isDragging) {
        stateRef.current.targetRotation += 0.0008;
      }

      // Live Cabinets dynamic animations (float, pulse, scales)
      cabinets.forEach((cab, index) => {
        const isSelected = index === stateRef.current.selectedIndex;
        const isHovered = index === stateRef.current.hoveredIndex;

        // Base Target Positions
        let targetY = 0;
        let targetScale = 1.0;
        let targetEmissive = 0.5;

        if (isSelected) {
          // Floats selected cabinet dynamically
          targetY = 0.45 + Math.sin(elapsedTime * 3.5) * 0.12;
          targetScale = 1.15;
          targetEmissive = 1.5 + Math.sin(elapsedTime * 5) * 0.3; // bright pulse screen
        } else if (isHovered) {
          targetY = 0.2;
          targetScale = 1.05;
          targetEmissive = 1.0;
        } else {
          targetY = 0;
          targetScale = 0.9;
          targetEmissive = 0.25;
        }

        // Apply smooth interpolations
        cab.position.y += (targetY - cab.position.y) * 0.15;
        
        const currentScale = cab.scale.x;
        const finalScale = currentScale + (targetScale - currentScale) * 0.15;
        cab.scale.set(finalScale, finalScale, finalScale);

        // Find screen child inside group and animate emissive intensity
        cab.children.forEach(child => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            if (child.geometry === screenGeom) {
              child.material.emissiveIntensity = targetEmissive;
            }
          }
        });
      });

      // Render the frame
      renderer.render(scene, camera);
    };

    animate();

    // Clean up connections on unmount
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('click', handleCanvasClick);
      
      // Dispose geometry and materials to free GPU VRAM
      starParticles.geometry.dispose();
      particleMaterial.dispose();
      bodyGeom.dispose();
      screenGeom.dispose();
      baseGeom.dispose();
      topLightGeom.dispose();
      gridHelper.dispose();
      renderer.dispose();
    };
  }, [items, isRotating, highQuality]);

  return (
    <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-3xl border border-slate-100 dark:border-slate-800/60 overflow-hidden">
      
      {/* 3D Arc Space Container */}
      <div 
        ref={containerRef} 
        className="relative lg:col-span-7 h-[340px] sm:h-[420px] rounded-2xl bg-gradient-to-b from-slate-100/40 to-slate-200/20 dark:from-slate-950/40 dark:to-slate-950/10 border border-slate-200/50 dark:border-indigo-950/20 shadow-inner overflow-hidden cursor-grab active:cursor-grabbing"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* 3D Ambient Particles Badge & Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
          <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-xl text-white font-extrabold text-[10px] sm:text-xs flex items-center gap-1.5 shadow-md pointer-events-auto">
            <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>{isAr ? 'بيئة تفاعلية ٣D حقيقية 🎮' : 'Live 3D Arcade Stage 🎮'}</span>
          </div>

          <div className="flex gap-2 pointer-events-auto">
            {/* Rotation toggle */}
            <button
              onClick={() => setIsRotating(!isRotating)}
              className={`p-2 rounded-lg backdrop-blur-md text-xs font-bold shadow-md transition-all ${
                isRotating 
                  ? 'bg-indigo-600/90 text-white' 
                  : 'bg-slate-900/80 text-slate-300 hover:text-white'
              }`}
              title={isAr ? 'دوران تلقائي' : 'Toggle Auto Spin'}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H19M9 17l2 2 2-2" />
              </svg>
            </button>

            {/* Quality setting toggle */}
            <button
              onClick={() => setHighQuality(!highQuality)}
              className={`p-2 rounded-lg backdrop-blur-md text-xs font-bold shadow-md transition-all ${
                highQuality 
                  ? 'bg-emerald-600/90 text-white' 
                  : 'bg-slate-900/80 text-slate-300 hover:text-white'
              }`}
              title={isAr ? 'جودة فائقة' : 'Toggle Ultra Quality'}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Floating Swipe/Drag Hint */}
        <AnimatePresence>
          {showControlsHint && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-full text-white text-[10px] sm:text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span>{isAr ? 'اسحب لتدوير الـ ٣D أو اضغط على جهازك المفضل 👇' : 'Swipe to rotate 3D or click to pick! 👇'}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carousel manual navigation arrows */}
        <div className="absolute inset-y-0 left-2 right-2 flex items-center justify-between pointer-events-none">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full bg-slate-950/60 hover:bg-slate-950/80 backdrop-blur-md text-white border border-slate-800/80 pointer-events-auto shadow-lg hover:scale-110 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-slate-950/60 hover:bg-slate-950/80 backdrop-blur-md text-white border border-slate-800/80 pointer-events-auto shadow-lg hover:scale-110 active:scale-95 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Selected Game Details Panel */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
        <AnimatePresence mode="wait">
          {activeItem && (
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, x: isAr ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isAr ? 15 : -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-4 text-right flex-1 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Visual Category badge */}
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xs rounded-full flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{isAr ? '+١٠٠٠ نقطة كاش' : '+1000 Pts Reward'}</span>
                  </span>

                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {isAr ? 'الترتيب التفاعلي' : 'Active Cabinet'}
                  </span>
                </div>

                {/* Main Heading with colorful outline */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 justify-end">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
                      {isAr ? activeItem.nameAr : activeItem.nameEn}
                    </h3>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 scale-105">
                      {getAcademicGameIcon(activeItem.id)}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-justify">
                    {isAr 
                      ? `مرحبًا بك في جهاز ألعاب ${activeItem.nameAr} ثلاثي الأبعاد! يحتوي هذا الجهاز على مكتبة ضخمة تضم ١٠٠٠ سؤال تفاعلي بمستويات تتدرج من السهل للمحترف لتعزيز مهاراتك الدراسية وتجميع أرباح حقيقية.`
                      : `Welcome to the 3D ${activeItem.nameEn} Arcade Cabinet! This cabinet boasts a massive library of 1000 specialized interactive questions ranging from entry-level up to master grades to expand your skills and claim grand payouts.`}
                  </p>
                </div>

                {/* Dashboard Cabinet Specs */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-100/50 dark:bg-slate-950/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50 space-y-0.5 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block">{isAr ? 'مستويات الصعوبة' : 'AI Match Difficulty'}</span>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{isAr ? 'عادي / محترف' : 'Standard / Pro'}</span>
                  </div>
                  <div className="p-3 bg-slate-100/50 dark:bg-slate-950/40 rounded-xl border border-slate-200/50 dark:border-slate-800/50 space-y-0.5 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block">{isAr ? 'الأسئلة المتوفرة' : 'Question Bank'}</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">1000 {isAr ? 'سؤال تفاعلي' : 'Ques'}</span>
                  </div>
                </div>

                {/* Fun retro tech specs box */}
                <div className="p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2 text-justify leading-relaxed">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>
                    {isAr
                      ? 'لعبة تخصصية متقدمة. كل جولة تحتوي على ١٠ أسئلة مشوقة. النجاح في الجولة يضيف ١٠٠٠ نقطة فورية إلى محفظتك الإلكترونية.'
                      : 'Advanced specialization quiz. Each round challenges you with 10 random trivia items. Clear the stage to add 1000 points instantly.'}
                  </span>
                </div>
              </div>

              {/* Start playing action button */}
              <div className="pt-4">
                <button
                  onClick={() => onSelect(activeItem)}
                  className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-sm rounded-2xl shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.45)] cursor-pointer transform hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{isAr ? 'ابدأ اللعب في الجهاز الأكاديمي 🎮' : 'Insert Coin & Play Cabinet 🎮'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
