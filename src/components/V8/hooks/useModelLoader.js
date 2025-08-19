// 📦 Hook chargement modèle V5 - EFFETS SUBTILS CORRIGES
import { useState, useCallback } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RING_MATERIALS, ARM_MATERIALS_ALL } from '../utils/materials.js';
import { V3_CONFIG } from '../utils/config.js';
import * as THREE from 'three';

export function useModelLoader() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [model, setModel] = useState(null);
  const [error, setError] = useState(null);

  // ✅ DÉTECTION IRIS
  const isIRISMesh = useCallback((meshName) => {
    if (!meshName) return false;
    return meshName.toLowerCase().includes('iris');
  }, []);

  // ✅ DÉTECTION EYE/ANNEAUX ULTRA-SÉLECTIVE
  const isEyeMesh = useCallback((meshName) => {
    if (!meshName) return false;
    const name = meshName.toLowerCase();
    
    // ✅ SEULEMENT les anneaux Eye qui doivent briller
    return (
      name.includes('anneaux_eye_ext') ||
      name.includes('anneaux_eye_int')
    );
  }, []);

  // ✅ NOUVELLE FONCTION : Détection bras SANS dos_eye et eye_int
  const isArmMesh = useCallback((meshName) => {
    if (!meshName) return false;
    const name = meshName.toLowerCase();
    
    // ✅ EXCLURE dos_eye et eye_int (ils doivent garder leurs matériaux originaux)
    if (name.includes('dos_eye') || name.includes('eye_int')) {
      return false;
    }
    
    // ✅ Bras qui peuvent avoir un léger effet
    return (
      name.includes('bras') ||
      name.includes('arm')
    );
  }, []);

  // ✅ DÉTECTION ANNEAUX MAGIQUES
  const isRingMesh = useCallback((meshName, materialName) => {
    if (!meshName && !materialName) return false;
    const name = (meshName || '').toLowerCase();
    const mat = (materialName || '').toLowerCase();
    return RING_MATERIALS.some(ringMat => 
      name.includes(ringMat.toLowerCase()) || mat.includes(ringMat.toLowerCase())
    );
  }, []);

  // ✅ DÉTECTION GROS BRAS
  const isBigArmMesh = useCallback((meshName) => {
    if (!meshName) return false;
    const name = meshName.toLowerCase();
    return ARM_MATERIALS_ALL.some(armMat => 
      name.includes(armMat.toLowerCase()) && name.includes('gros')
    );
  }, []);

  // ✅ DÉTECTION PETITS BRAS
  const isLittleArmMesh = useCallback((meshName) => {
    if (!meshName) return false;
    const name = meshName.toLowerCase();
    return ARM_MATERIALS_ALL.some(armMat => 
      name.includes(armMat.toLowerCase()) && name.includes('petit')
    );
  }, []);
  
  // ✅ MATÉRIAU IRIS MOINS INTENSE
  const createIRISMaterial = useCallback(() => {
    const baseColor = new THREE.Color(0x00ffff);
    return new THREE.MeshStandardMaterial({
      color: baseColor,
      emissive: baseColor,
      emissiveIntensity: 0.3,  // ✅ Réactivé
      metalness: 0.1,
      roughness: 0.4,
      transparent: false,
      opacity: 1
    });
  }, []);

  // ✅ MATÉRIAU EYE ANNEAUX (pour anneaux_eye seulement)
  const createEyeMaterial = useCallback((originalMaterial) => {
    const baseColor = new THREE.Color(0x00ff88);  // ✅ Vert subtil au lieu d'orange
    const newMaterial = originalMaterial ? originalMaterial.clone() : new THREE.MeshStandardMaterial();
    newMaterial.emissive = baseColor;
    newMaterial.emissiveIntensity = 0.2;  // ✅ Réactivé
    return newMaterial;
  }, []);

  // ✅ NOUVEAU : MATÉRIAU BRAS SUBTIL
  const createArmMaterial = useCallback((originalMaterial) => {
    const baseColor = new THREE.Color(0x4488ff);  // ✅ Bleu très léger
    const newMaterial = originalMaterial ? originalMaterial.clone() : new THREE.MeshStandardMaterial();
    
    // ✅ Garder la couleur originale + émissif TRÈS léger
    newMaterial.emissive = baseColor;
    newMaterial.emissiveIntensity = 0.01;  // ✅ TRÈS SUBTIL
    
    return newMaterial;
  }, []);
  
  // ✅ FONCTION CHARGEMENT SÉCURISÉE
  const loadModel = useCallback((scene, onSuccess) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(V3_CONFIG.model.dracoPath);
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      V3_CONFIG.model.path,
      (gltf) => {
        if (!gltf || !gltf.scene) {
          console.error('❌ GLTF ou scene manquant:', gltf);
          setError(new Error('GLTF scene manquant'));
          setIsLoading(false);
          return;
        }
        
        const loadedModel = gltf.scene;
        scene.add(loadedModel);

        const magicRings = [];
        const bigArms = [];
        const littleArms = [];
        const eyeComponents = [];
        const otherMeshes = [];

        loadedModel.traverse((child) => {
          if (child.isMesh) {
            const meshName = child.name || '';
            const materialName = child.material?.name || '';
            
            // ✅ IRIS reste comme avant
            if (isIRISMesh(meshName)) {
              child.material = createIRISMaterial();
              eyeComponents.push(child);
              console.log('�� IRIS MAT: Matériau émissif appliqué à "' + meshName + '"');
            }
            // ✅ SEULEMENT les anneaux Eye (plus dos_eye ni eye_int)
            else if (isEyeMesh(meshName)) {
              child.material = createEyeMaterial(child.material);
              eyeComponents.push(child);
              console.log('��️ EYE MAT: Matériau émissif appliqué à "' + meshName + '"');
            }
            // ✅ NOUVEAU : Bras avec effet très subtil
            else if (isArmMesh(meshName)) {
              child.material = createArmMaterial(child.material);
              console.log('🔧 ARM MAT: Effet subtil appliqué à "' + meshName + '"');
            }
            else if (isRingMesh(meshName, materialName)) {
              magicRings.push(child);
            }
            else if (isBigArmMesh(meshName)) {
              bigArms.push(child);
            }
            else if (isLittleArmMesh(meshName)) {
              littleArms.push(child);
            }
            else {
              otherMeshes.push(child);
            }
          }
        });

        console.log('✅ Traverse et classification des objets terminés');

        let mixer = null;
        let animations = []; // ✅ Animations GLTF

        if (gltf.animations && gltf.animations.length > 0) {
          animations = gltf.animations; // ✅ Stocker les animations GLTF
          mixer = new THREE.AnimationMixer(loadedModel);
          gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            action.play();
          });
        }

        setModel(loadedModel);
        setIsLoaded(true);
        setIsLoading(false);
        setLoadingProgress(100);

        // ✅ LOG CORRECT ET COMPLET
        console.log('✅ Modèle V5 chargé avec succès:', {
          magicRings: magicRings.length,
          bigArms: bigArms.length,
          littleArms: littleArms.length,
          eyeComponents: eyeComponents.length,
          otherMeshes: otherMeshes.length,
          animations: animations.length
        });

        if (onSuccess) {
          // ✅ CORRECTION : Retourner TOUTES les listes pour V3Scene.jsx
          onSuccess({
            magicRings,
            bigArms,
            littleArms,
            eyeComponents,
            otherMeshes,
            animations,    // ✅ RETOURNER animations
            mixer,         // ✅ Garder mixer aussi
            model: loadedModel
          });
        }
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        setLoadingProgress(percent);
      },
      (error) => {
        console.error('❌ Erreur chargement modèle:', error);
        setError(error);
        setIsLoading(false);
      }
    );
  }, [isLoading, isBigArmMesh, isEyeMesh, isIRISMesh, isLittleArmMesh, isRingMesh, isArmMesh, createIRISMaterial, createEyeMaterial, createArmMaterial]);

  return {
    model,
    isLoaded, 
    loadModel,
    loadingProgress,
    isLoading,
    error
  };
}