// 🎭 V3Scene V6 - SIMPLE BLOOM SYSTEM CORRIGÉ
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useThreeScene } from '../hooks/useThreeScene.js';
import { useModelLoader } from '../hooks/useModelLoader.js';
import { useRevealManager } from '../hooks/useRevealManager.js';
import { useTriggerControls } from '../hooks/useTriggerControls.js';
import { useCameraFitter } from '../hooks/useCameraFitter.js';

// Systems
import { AnimationController } from '../systems/animationSystemes/index.js';
import { EyeRingRotationManager } from '../systems/eyeSystems/index.js';
import { RevealationSystem } from '../systems/revelationSystems/index.js';
import { ObjectTransitionManager } from '../systems/transitionObjects/index.js';
import { BloomControlCenter } from '../systems/bloomEffects/BloomControlCenter.js';
import { WorldEnvironmentController } from '../systems/environmentSystems/WorldEnvironmentController.js';
import { PBRLightingController } from '../systems/lightingSystems/PBRLightingController.js';

// Components
import DebugPanel from './DebugPanel.jsx';

export default function V3Scene() {
  const canvasRef = useRef();
  
  // ✅ HOOKS PRINCIPAUX
  const { 
    scene, 
    camera, 
    renderer,           // ✅ AJOUTÉ POUR INTERACTIVE LIGHTS
    controls, 
    isInitialized, 
    startRenderLoop,
    setExposure,        // ✅ NOUVEAU V8
    getExposure,        // ✅ NOUVEAU V8
    setBackground,      // ✅ NOUVEAU : Contrôle Background
    getBackground,      // ✅ NOUVEAU : Contrôle Background
    bloomSystem,        // ✅ COORDINATION : Référence SimpleBloomSystem
    getLights          // ✅ COORDINATION PBR : Accès aux lumières pour PBRLightingController
  } = useThreeScene(canvasRef);
  const { model, loadModel } = useModelLoader();
  const { magicRingsInfo } = useRevealManager();
  const { updateZone } = useTriggerControls();
  const { fitCameraToObject } = useCameraFitter();

  // ✅ STATES STABLES
  const [showDebug, setShowDebug] = useState(true);
  const [forceShowRings, setForceShowRings] = useState(true);
  const [currentAnimation, setCurrentAnimation] = useState('permanent');
  
  // DEBUG supprimé - causait spam console
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [securityState, setSecurityState] = useState('NORMAL');
  
  // ✅ FLAGS POUR ÉVITER BOUCLES
  const loadingRef = useRef(false);
  const initRef = useRef(false);

  // ✅ SYSTEMS REFS - TOUS LES SYSTÈMES V8 PHASE 3
  const animationControllerRef = useRef();
  const eyeRotationRef = useRef();
  const revelationSystemRef = useRef();
  const objectTransitionRef = useRef();
  const bloomControlCenterRef = useRef();
  const worldEnvironmentControllerRef = useRef();
  const pbrLightingControllerRef = useRef();
  
  // ✅ DONNÉES MODÈLE PERSISTANTES
  const modelDataRef = useRef({ animations: null, magicRings: [], model: null });

  // ✅ FONCTION STABLE POUR CHARGEMENT
  const handleLoadModel = useCallback((scene) => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    console.log('✅ Chargement modèle V6 - Simple Bloom System...');

    loadModel(scene, (result) => {
      if (!result) {
        loadingRef.current = false;
        return;
      }
      
      const { magicRings, animations, model } = result;
      console.log(`✅ V6 chargé: ${magicRings.length} anneaux | ${animations.length} animations`);
      
      // ✅ Stocker TOUTES les données nécessaires
      modelDataRef.current = { animations, magicRings, model };
      
      // ✅ COORDINATION : Initialiser BloomControlCenter avec SimpleBloomSystem
      if (!bloomControlCenterRef.current) {
        bloomControlCenterRef.current = new BloomControlCenter(bloomSystem);
        console.log('🎛️ BloomControlCenter initialisé avec moteur de rendu coordonné');
      }
      
      // ✅ RESTAURÉ V5 : Détecter et configurer les objets bloom
      const bloomObjectsCount = bloomControlCenterRef.current.detectAndRegisterBloomObjects(model);
      console.log(`🎛️ BloomControlCenter: ${bloomObjectsCount} objets bloom configurés`);
      
      // ✅ COORDINATION : Synchroniser objets avec moteur de rendu
      bloomControlCenterRef.current.syncWithRenderingEngine();
      
      // ✅ CORRIGÉ : Appliquer le mode NORMAL par défaut (pas SCANNING)
      setTimeout(() => {
        if (bloomControlCenterRef.current) {
          bloomControlCenterRef.current.setSecurityState('NORMAL');
          console.log('🎛️ Mode NORMAL appliqué par défaut');
        }
      }, 100);
    });
  }, [loadModel, bloomSystem]); // ✅ COORDINATION : Ajouter bloomSystem comme dépendance


  // ✅ LOAD MODEL - CORRIGÉ ESLINT
  useEffect(() => {
    if (!scene || !isInitialized) return;
    handleLoadModel(scene);
  }, [scene, isInitialized, handleLoadModel]);

  // ✅ FONCTION STABLE POUR AJUSTEMENT CAMÉRA
  const handleCameraFit = useCallback(() => {
    if (camera && controls && fitCameraToObject && model) {
      const cameraInfo = fitCameraToObject(camera, model, controls, 1.8);
      console.log('📊 Caméra ajustée:', { distance: cameraInfo?.cameraDistance });
    }
  }, [camera, controls, fitCameraToObject, model]);

  // ✅ FONCTION STABLE POUR INITIALISATION SYSTÈMES - CORRIGÉE
  const initializeSystems = useCallback(() => {
    if (initRef.current || !scene || !modelDataRef.current.animations || !modelDataRef.current.model) return;
    
    initRef.current = true;
    console.log('✅ Initialisation systèmes V6...');
    console.log(`🔍 DEBUG forceShowRings au début: ${forceShowRings}`);

    // ✅ ANIMATION CONTROLLER - CORRIGÉ (comme V5/V6-backup-claude)
    if (modelDataRef.current.animations && modelDataRef.current.model) {
      animationControllerRef.current = new AnimationController(
        modelDataRef.current.model,
        modelDataRef.current.animations
      );
      
      // ✅ AJOUTER LES CALLBACKS
      animationControllerRef.current.onTransitionComplete = () => {
        setIsTransitioning(false);
        setCurrentAnimation('permanent');
      };
      
      console.log('✅ AnimationController initialisé');
      
      // ✅ CORRIGÉ : Démarrer les animations immédiatement (comme V5/V6-backup-claude)
      animationControllerRef.current.startPermanentAnimations();
      console.log('✅ Animations permanentes démarrées immédiatement');
    }

    // ✅ EYE ROTATION MANAGER
    eyeRotationRef.current = new EyeRingRotationManager(animationControllerRef.current);
    eyeRotationRef.current.initialize();
    eyeRotationRef.current.forceEyeRotation();
    console.log('✅ EyeRingRotationManager initialisé');

    // ✅ SAUTÉ : SecurityIRISManager remplacé par BloomControlCenter
    console.log('✅ SecurityIRISManager remplacé par BloomControlCenter');

    // ✅ REVELATION SYSTEM
    revelationSystemRef.current = new RevealationSystem(modelDataRef.current.magicRings);
    console.log(`🔍 DEBUG avant setForceShowAll: forceShowRings = ${forceShowRings}`);
    // ✅ CORRIGÉ TEMPORAIRE: Forcer true pour tester
    console.log(`🔧 FORCE setForceShowAll(true) pour démarrage automatique`);
    revelationSystemRef.current.setForceShowAll(true);
    console.log('✅ RevealationSystem initialisé');

    // ✅ OBJECT TRANSITION MANAGER
    objectTransitionRef.current = new ObjectTransitionManager(modelDataRef.current.model);
    console.log('✅ ObjectTransitionManager initialisé');

    // ✅ NOUVEAU PHASE 2 : WORLD ENVIRONMENT CONTROLLER
    if (!worldEnvironmentControllerRef.current) {
      worldEnvironmentControllerRef.current = new WorldEnvironmentController(setExposure);
      console.log('✅ WorldEnvironmentController initialisé');
    }


    
    console.log('✅ Tous les systèmes V8 Phase 5 initialisés');
  }, [scene, forceShowRings, camera, renderer]);

  // ✅ COORDINATION PBR PHASE 5 : PBR LIGHTING CONTROLLER avec lumières useThreeScene
  useEffect(() => {
    if (!scene || !renderer || !isInitialized || pbrLightingControllerRef.current) return;
    
    console.log('🔄 Initialisation PBRLightingController avec coordination...');
    
    // ✅ COORDINATION : Récupérer lumières de useThreeScene
    const lights = getLights();
    console.log('💡 Lumières récupérées:', lights);
    
    // ✅ Injecter lumières existantes dans PBRLightingController
    pbrLightingControllerRef.current = new PBRLightingController(scene, renderer, lights);
    const success = pbrLightingControllerRef.current.init();
    
    if (success) {
      console.log('✅ PBRLightingController initialisé avec lumières coordonnées');
      console.log('🔍 Presets disponibles:', pbrLightingControllerRef.current.getAvailablePresets());
    } else {
      console.error('❌ Échec initialisation PBRLightingController');
    }
  }, [scene, renderer, isInitialized, getLights]); // ✅ Ajouter getLights comme dépendance

  // ✅ INITIALISATION SYSTÈMES
  useEffect(() => {
    initializeSystems();
  }, [initializeSystems]);

  // ✅ TRANSITION HANDLER STABLE (comme V6-backup-claude)
  const handleTransition = useCallback(() => {
    if (!animationControllerRef.current || isTransitioning) return;
    
    setIsTransitioning(true);
    
    if (currentAnimation === 'permanent') {
      setCurrentAnimation('pose');
      const success = animationControllerRef.current.startPoseTransition();
      
      if (success) {
        // ✅ DÉLAI 200ms POUR ANNEAUX RESTAURÉ (comme V6-backup-claude)
        setTimeout(() => {
          if (revelationSystemRef.current) {
            revelationSystemRef.current.startRingAnimation?.(animationControllerRef.current);
          }
        }, 200);
      } else {
        setIsTransitioning(false);
        setCurrentAnimation('permanent');
      }
    } else {
      setCurrentAnimation('permanent');
      animationControllerRef.current.startReturnToPermanent();
    }
  }, [currentAnimation, isTransitioning]);

  // ✅ FONCTION STABLE POUR FORCE SHOW
  const handleToggleForceRings = useCallback((show) => {
    setForceShowRings(show);
    if (revelationSystemRef.current) {
      revelationSystemRef.current.setForceShowAll(show);
      console.log(`🔧 RevealationSystem.setForceShowAll(${show}) - ${modelDataRef.current.magicRings.length} anneaux`);
    }
  }, []);

  // ✅ FONCTION STABLE POUR SECURITY STATE - RESTAURÉE V5
  const handleSecurityStateChange = useCallback((newState) => {
    setSecurityState(newState);
    
    // ✅ RESTAURÉ V5 : Utiliser BloomControlCenter unifié
    if (bloomControlCenterRef.current) {
      bloomControlCenterRef.current.setSecurityState(newState);
      console.log(`🔒 BloomControlCenter: État de sécurité changé vers ${newState}`);
    }
  }, []);

  // ✅ CORRIGÉ : Contrôler le bloom via BloomControlCenter
  const handleColorBloomChange = useCallback((colorName, param, value) => {
    console.log(`🎛️ BloomControlCenter - ${colorName}: ${param} = ${value}`);
    
    if (!bloomControlCenterRef.current) return;
    
    // ✅ NOUVEAU : Threshold global
    if (colorName === 'global' && param === 'threshold') {
      console.log(`🎯 Threshold global: ${value}`);
      // ✅ COORDINATION : Utiliser BloomControlCenter au lieu de window.bloomSystem
      if (bloomControlCenterRef.current) {
        bloomControlCenterRef.current.setBloomParameter('threshold', value);
        console.log(`✅ Threshold global appliqué via BloomControlCenter: ${value}`);
      }
      return;
    }
    
    // ✅ CORRIGÉ : Traiter les paramètres bloom réels pour CHAQUE groupe SÉPARÉMENT
    if (colorName === 'iris') {
      // ✅ Appliquer uniquement au groupe iris (SANS threshold)
      if (param === 'strength' || param === 'radius') {
        console.log(`🎨 Iris ${param}: ${value} - Post-processing`);
        
        // ✅ COORDINATION : Appliquer via BloomControlCenter
        if (bloomControlCenterRef.current) {
          bloomControlCenterRef.current.setBloomParameter(param, value);
          console.log(`✅ Bloom système mis à jour pour iris: ${param} = ${value}`);
        }
        
        bloomControlCenterRef.current.setPostProcessParameter(`iris_${param}`, value);
      } else if (param === 'emissiveIntensity') {
        // ✅ Modifier l'intensité émissive SEULEMENT iris
        bloomControlCenterRef.current.setObjectTypeProperty('iris', 'emissiveIntensity', value);
        console.log(`👁️ Iris emissive: ${value}`);
      }
    } else if (colorName === 'eyeRings') {
      // ✅ Appliquer uniquement au groupe eyeRings (SANS threshold)
      if (param === 'strength' || param === 'radius') {
        console.log(`🎨 EyeRings ${param}: ${value} - Post-processing`);
        
        // ✅ COORDINATION : Appliquer via BloomControlCenter
        if (bloomControlCenterRef.current) {
          bloomControlCenterRef.current.setBloomParameter(param, value);
          console.log(`✅ Bloom système mis à jour pour eyeRings: ${param} = ${value}`);
        }
        
        bloomControlCenterRef.current.setPostProcessParameter(`eyeRings_${param}`, value);
      } else if (param === 'emissiveIntensity') {
        // ✅ Modifier l'intensité émissive SEULEMENT eyeRings
        bloomControlCenterRef.current.setObjectTypeProperty('eyeRings', 'emissiveIntensity', value);
        console.log(`💍 EyeRings emissive: ${value}`);
      }
    } else if (colorName === 'revealRings') {  
      // ✅ CORRIGÉ : Reveal rings INDÉPENDANTS (SANS threshold)
      if (param === 'strength' || param === 'radius') {
        console.log(`💍 Reveal rings ${param}: ${value} - Post-processing indépendant`);
        
        // ✅ COORDINATION : Appliquer via BloomControlCenter
        if (bloomControlCenterRef.current) {
          bloomControlCenterRef.current.setBloomParameter(param, value);
          console.log(`✅ Reveal bloom système mis à jour: ${param} = ${value}`);
        }
        
        bloomControlCenterRef.current.setPostProcessParameter(`reveal_${param}`, value);
      } else if (param === 'emissiveIntensity') {
        // ✅ Modifier l'intensité émissive des reveal rings SEULEMENT
        bloomControlCenterRef.current.setObjectTypeProperty('magicRings', 'emissiveIntensity', value);
        console.log(`💍 Reveal rings emissive: ${value}`);
      }
    }
  }, []);

  // ✅ START RENDER LOOP (comme V6-backup-claude)
  useEffect(() => {
    if (!isInitialized || !startRenderLoop) return;

    const stopRenderLoop = startRenderLoop((deltaTime) => {
      // ✅ UPDATE SYSTÈMES (comme V6-backup-claude)
      animationControllerRef.current?.update(deltaTime);
      
      // ✅ AJOUTÉ: Rotation des anneaux Eye ! (comme V6-backup-claude)
      eyeRotationRef.current?.updateEyeRotation(deltaTime);
      
      revelationSystemRef.current?.updateRevelation();
      bloomControlCenterRef.current?.update(deltaTime);
      objectTransitionRef.current?.update(deltaTime);
    });

    return stopRenderLoop;
  }, [isInitialized, startRenderLoop]);

  // ✅ KEYBOARD CONTROLS
  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key.toLowerCase()) {
        case 'p':
          setShowDebug(prev => !prev);
          break;
        case ' ':
          event.preventDefault();
          handleTransition();
          break;
        case 'f':
          if (event.shiftKey) {
            updateZone();
          } else {
            handleCameraFit();
          }
          break;
        case 'r':
          if (event.shiftKey) {
            updateZone();
          } else {
            handleToggleForceRings(!forceShowRings);
          }
          break;
        case 'z':
        case 'q':
        case 's':
        case 'd':
        case 'a':
        case 'e':
          updateZone();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTransition, handleCameraFit, forceShowRings, handleToggleForceRings, updateZone]);

  // ✅ RENDER
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      position: 'relative',
      background: '#202020'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
      
      {showDebug && (
        <DebugPanel
          showDebug={showDebug}
          forceShowRings={forceShowRings}
          onToggleForceRings={handleToggleForceRings}
          magicRingsInfo={magicRingsInfo}
          currentAnimation={currentAnimation}
          onTriggerTransition={handleTransition}
          securityState={securityState}
          onSecurityStateChange={handleSecurityStateChange}
          isTransitioning={isTransitioning}
          onColorBloomChange={handleColorBloomChange}
          setExposure={setExposure}                                    // ✅ NOUVEAU V8
          getExposure={getExposure}                                    // ✅ NOUVEAU V8
          worldEnvironmentController={worldEnvironmentControllerRef.current} // ✅ PHASE 2 V8
          pbrLightingController={pbrLightingControllerRef.current}     // ✅ PHASE 5 V8 - Option 3
          setBackground={setBackground}                                // ✅ NOUVEAU : Background
          getBackground={getBackground}                                // ✅ NOUVEAU : Background
        />
      )}
    </div>
  );
}