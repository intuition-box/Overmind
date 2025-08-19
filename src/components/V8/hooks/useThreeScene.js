// 🎬 Hook Scene Three.js V8 - COORDINATED BLOOM SYSTEM
import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useSimpleBloom } from './useSimpleBloom.js'; // ✅ RESTAURÉ : Coordination avec BloomControlCenter
import { V3_CONFIG } from '../utils/config.js';

const TONE_MAPPING_OPTIONS = {
  None: THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
};

export function useThreeScene(canvasRef) {
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const animationIdRef = useRef(null);
  
  // ✅ RESTAURÉ SIMPLE BLOOM SYSTEM - Coordination avec BloomControlCenter
  const { 
    initBloom, 
    updateBloom, 
    render: renderBloom, 
    handleResize: handleBloomResize, 
    dispose: disposeBloom,
    getExposure: getBloomExposure,   // ✅ Lecture depuis renderer
    bloomSystem  // ✅ NOUVEAU : Exposer référence pour coordination
  } = useSimpleBloom();
  
  const [isInitialized, setIsInitialized] = useState(false);

  const setToneMapping = useCallback((toneMappingName) => {
    const toneMapping = TONE_MAPPING_OPTIONS[toneMappingName];
    if (rendererRef.current && toneMapping !== undefined) {
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      
      // Changer le tone mapping
      renderer.toneMapping = toneMapping;
      
      // Force la recompilation des matériaux
      if (scene) {
        scene.traverse((child) => {
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.needsUpdate = true;
              });
            } else {
              child.material.needsUpdate = true;
            }
          }
        });
      }
      
      console.log(`�� Tone Mapping changé: ${toneMappingName}`);
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;

    // Scene avec background gris clair
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x404040);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      V3_CONFIG.camera.fov,
      width / height,
      V3_CONFIG.camera.near,
      V3_CONFIG.camera.far
    );

    // Renderer simple et optimisé
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvas,
      alpha: false
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Configuration tone mapping
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // ✅ RESTAURÉ : INITIALISER SIMPLE BLOOM SYSTEM
    const bloomSystemInstance = initBloom(scene, camera, renderer);

    if (!bloomSystemInstance) {
      console.warn('⚠️ SimpleBloomSystem non initialisé, utilisation du rendu standard');
    } else {
      // ✅ Initialiser le composer
      const initSuccess = bloomSystemInstance.init();
      if (initSuccess) {
        // ✅ COORDINATION : Exposer le bloomSystem pour BloomControlCenter
        window.bloomSystem = bloomSystemInstance;
        console.log('✅ SimpleBloomSystem initialisé et exposé pour coordination');
      } else {
        console.error('❌ SimpleBloomSystem: Échec de l\'initialisation du composer');
      }
    }

    // ✅ COORDINATION PBR : Lumières avec valeurs par défaut (modifiables par PBRLightingController)
    const ambientLight = new THREE.AmbientLight(
      V3_CONFIG.lights.ambient.color, 
      V3_CONFIG.lights.ambient.intensity // ✅ Valeur de base sans multiplicateur fixe
    );
    // ✅ Marquer pour PBRLightingController
    ambientLight.userData.pbrControllable = true;
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      V3_CONFIG.lights.directional.color, 
      V3_CONFIG.lights.directional.intensity // ✅ Valeur de base sans multiplicateur fixe
    );
    const lightPos = V3_CONFIG.lights.directional.position;
    directionalLight.position.set(lightPos.x, lightPos.y, lightPos.z);
    // ✅ Marquer pour PBRLightingController
    directionalLight.userData.pbrControllable = true;
    scene.add(directionalLight);

    console.log('💡 Lumières créées avec contrôle PBR activé');

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI;

    // Position initiale camera
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Stocker les références
    sceneRef.current = scene;
    rendererRef.current = renderer;
    controlsRef.current = controls;
    cameraRef.current = camera;

    // Gestionnaire de redimensionnement
    const handleResize = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      handleBloomResize();
    };

    window.addEventListener('resize', handleResize);

    setIsInitialized(true);

    return () => {
      window.removeEventListener('resize', handleResize);
      disposeBloom();
      
      if (window.bloomSystem) {
        delete window.bloomSystem;
      }
      
      console.log('✅ useThreeScene: Nettoyage terminé');
    };
  }, [initBloom, handleBloomResize, disposeBloom]);

  // ✅ BOUCLE DE RENDU SIMPLIFIÉE
  const startRenderLoop = useCallback((updateCallback) => {
    if (!rendererRef.current) return () => {};

    const clock = new THREE.Clock();
    let isRunning = true;

    const animate = () => {
      if (!isRunning) return;

      const delta = clock.getDelta();

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (updateCallback) {
        updateCallback(delta);
      }

      // ✅ RESTAURÉ : RENDU AVEC SIMPLE BLOOM SYSTEM
      renderBloom();

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      isRunning = false;
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, [renderBloom]);

  // ✅ RESTAURÉ : FONCTIONS BLOOM POUR RÉTROCOMPATIBILITÉ
  const updateBloomSettings = useCallback((param, value) => {
    updateBloom(param, value);
    return true;
  }, [updateBloom]);

  const getBloomSettings = useCallback(() => {
    // ✅ CORRECTION CONFLIT #2 : Valeurs par défaut, bloom géré par BloomControlCenter  
    return {
      threshold: 0.3,
      strength: 0.8,
      radius: 0.4,
      enabled: true
    };
  }, []);

  // ✅ CORRIGÉ V8 : Contrôle Tone Mapping Exposure
  const setExposure = useCallback((value) => {
    if (!rendererRef.current) {
      console.warn('⚠️ Renderer non disponible pour setExposure');
      return false;
    }
    
    // Valider le range (basé sur exemples Three.js officiels)
    const clampedValue = Math.max(0.1, Math.min(2.0, value));
    
    // ✅ SEULE SOURCE DE VÉRITÉ : Appliquer uniquement au renderer
    rendererRef.current.toneMappingExposure = clampedValue;
    
    // ✅ CORRECTION CONFLIT #1 : NE PAS appeler setBloomExposure pour éviter triple application
    // Le bloom system utilisera directement la valeur du renderer
    
    console.log(`V8 Exposure changé (SOURCE UNIQUE): ${clampedValue.toFixed(2)}`);
    return true;
  }, []); // ✅ Suppression dépendance setBloomExposure
  
  // ✅ CORRIGÉ V8 : Obtenir l'exposure actuelle - SOURCE UNIQUE
  const getExposure = useCallback(() => {
    if (!rendererRef.current) return 1.0;
    
    // ✅ CORRECTION CONFLIT #1 : Lire directement depuis le renderer (source unique)
    return rendererRef.current.toneMappingExposure;
  }, []); // ✅ Suppression dépendance getBloomExposure

  return {
    // Références existantes
    scene: sceneRef.current,
    renderer: rendererRef.current,
    camera: cameraRef.current,
    controls: controlsRef.current,
    
    // État
    isInitialized,
    
    // Fonctions de contrôle
    setToneMapping,
    startRenderLoop,
    
    // ✅ FONCTIONS BLOOM SIMPLIFIÉES
    updateBloomSettings,
    getBloomSettings,
    
    // ✅ NOUVEAU V8 : Contrôle Exposure
    setExposure,
    getExposure,
    
    // ✅ NOUVEAU : Contrôle Background
    setBackground: useCallback((type, value) => {
      if (!sceneRef.current) return false;
      
      const scene = sceneRef.current;
      
      switch (type) {
        case 'color': {
          const color = typeof value === 'string' ? parseInt(value.replace('#', ''), 16) : value;
          scene.background = new THREE.Color(color);
          console.log(`🌌 Background couleur: #${color.toString(16)}`);
          break;
        }
          
        case 'transparent':
          scene.background = null;
          console.log('👻 Background transparent');
          break;
          
        case 'black':
          scene.background = new THREE.Color(0x000000);
          console.log('⚫ Background noir');
          break;
          
        case 'white':
          scene.background = new THREE.Color(0xffffff);
          console.log('⚪ Background blanc');
          break;
          
        case 'dark':
          scene.background = new THREE.Color(0x202020);
          console.log('🌚 Background sombre');
          break;
          
        default:
          console.warn(`⚠️ Type de background inconnu: ${type}`);
          return false;
      }
      
      return true;
    }, []),

    getBackground: useCallback(() => {
      if (!sceneRef.current) return null;
      
      const scene = sceneRef.current;
      if (!scene.background) return { type: 'transparent' };
      if (scene.background.isColor) return { 
        type: 'color', 
        value: `#${scene.background.getHexString()}` 
      };
      
      return { type: 'unknown' };
    }, []),
    
    // ✅ RESTAURÉ : FONCTIONS BLOOM POUR COORDINATION
    updateBloom,
    renderBloom,
    handleBloomResize,
    disposeBloom,
    
    // ✅ NOUVEAU : Exposer référence bloomSystem pour coordination BloomControlCenter
    bloomSystem,
    
    // ✅ COORDINATION PBR : Exposer accès aux lumières pour PBRLightingController
    getLights: useCallback(() => {
      if (!sceneRef.current) return { ambient: null, directional: null };
      
      let ambient = null, directional = null;
      sceneRef.current.traverse((child) => {
        if (child.isAmbientLight && child.userData.pbrControllable && !ambient) {
          ambient = child;
        }
        if (child.isDirectionalLight && child.userData.pbrControllable && !directional) {
          directional = child;
        }
      });
      
      return { ambient, directional };
    }, [])
  };
}