// 🎛️ BloomControlCenter V6 - SYSTÈME UNIFIÉ RESTAURÉ DE V5
import * as THREE from 'three';

export class BloomControlCenter {
  constructor(renderingEngine = null) {
    // ✅ COORDINATION : Injection moteur de rendu SimpleBloomSystem
    this.renderingEngine = renderingEngine;
    
    // 📊 COLLECTIONS D'OBJETS PAR TYPE
    this.objectsByType = {
      eyeRings: new Map(),     // 👁️ Anneaux_Eye_Ext/Int
      iris: new Map(),         // 🎯 IRIS
      magicRings: new Map(),   // 💍 Ring_SG1, Ring_SG2, etc.
      arms: new Map()          // 🤖 BigArm, LittleArm, etc.
    };

    // 🎨 CONFIGURATIONS PAR TYPE D'OBJET
    this.materialConfigs = {
      eyeRings: {
        emissive: 0x00ff88,      // Vert eye par défaut
        emissiveIntensity: 1.0,
        metalness: 0.8,
        roughness: 0.2
      },
      iris: {
        emissive: 0x00ff88,      // Même vert que eye rings
        emissiveIntensity: 1.0,
        metalness: 0.8,
        roughness: 0.2
      },
      magicRings: {
        emissive: 0x4488ff,      // Bleu magique
        emissiveIntensity: 1.0,
        metalness: 0.8,
        roughness: 0.2
      },
      arms: {
        emissive: 0x6666ff,      // Bleu métallique
        emissiveIntensity: 1.0,
        metalness: 0.8,
        roughness: 0.2
      }
    };

    // 🌟 CONFIGURATION POST-PROCESSING BLOOM
    this.postProcessConfig = {
      threshold: 0.3,    // Seuil luminance
      strength: 1.5,     // Intensité bloom  
      radius: 1.0,       // Rayon diffusion
      exposure: 1.2      // Exposition globale
    };

    // 🔒 PRESETS SÉCURITÉ COMPLETS
    this.securityPresets = {
      SAFE: {
        eyeRings: { emissive: 0x00ff88, emissiveIntensity: 0.3 },
        iris: { emissive: 0x00ff88, emissiveIntensity: 0.4 },
        magicRings: { emissive: 0x88ff88, emissiveIntensity: 0.15 },
        arms: { emissive: 0x44ff44, emissiveIntensity: 0.03 }
      },
      DANGER: {
        eyeRings: { emissive: 0xff4444, emissiveIntensity: 0.8 },
        iris: { emissive: 0xff2222, emissiveIntensity: 1.0 },
        magicRings: { emissive: 0xff6666, emissiveIntensity: 0.4 },
        arms: { emissive: 0xff8888, emissiveIntensity: 0.1 }
      },
      WARNING: {
        eyeRings: { emissive: 0xffaa00, emissiveIntensity: 0.5 },
        iris: { emissive: 0xff8800, emissiveIntensity: 0.6 },
        magicRings: { emissive: 0xffcc44, emissiveIntensity: 0.25 },
        arms: { emissive: 0xffdd66, emissiveIntensity: 0.05 }
      },
      SCANNING: {
        eyeRings: { emissive: 0x4488ff, emissiveIntensity: 0.6 },
        iris: { emissive: 0x2266ff, emissiveIntensity: 0.7 },
        magicRings: { emissive: 0x66aaff, emissiveIntensity: 0.3 },
        arms: { emissive: 0x88ccff, emissiveIntensity: 0.06 }
      },
      NORMAL: {
        eyeRings: { emissive: 0xffffff, emissiveIntensity: 0.2 },
        iris: { emissive: 0xdddddd, emissiveIntensity: 0.25 },
        magicRings: { emissive: 0xaaaaaa, emissiveIntensity: 0.1 },
        arms: { emissive: 0x888888, emissiveIntensity: 0.02 }
      }
    };

    // 🔄 ANIMATION ET STATE
    this.currentSecurityState = 'NORMAL';
    this.animationTime = 0;
    this.transitionSpeed = 2.0;
    this.pulseEnabled = false;
    
    console.log("🎛️ BloomControlCenter V6 restauré - Système unifié complet");
  }

  // 🔍 DÉTECTION ET ENREGISTREMENT D'OBJETS PRÉCISE (CORRIGÉE)
  detectAndRegisterBloomObjects(model) {
    if (!model) {
      console.warn('🎛️ BloomControlCenter: Aucun modèle fourni');
      return 0;
    }

    let detectedCount = 0;

    model.traverse((child) => {
      if (!child.isMesh || !child.material) return;

      const name = child.name.toLowerCase();
      
      // 👁️ EYE RINGS DETECTION - PRÉCISE (anneaux_eye seulement)
      if (name.includes('anneaux_eye')) {
        this.registerObject('eyeRings', child.name, child);
        detectedCount++;
        console.log(`👁️ Eye ring détecté: ${child.name}`);
      }
      // 🎯 IRIS DETECTION  
      else if (name.includes('iris')) {
        this.registerObject('iris', child.name, child);
        detectedCount++;
        console.log(`🎯 Iris détecté: ${child.name}`);
      }
      // 💍 MAGIC RINGS DETECTION (Ring_SG pattern)
      else if (name.includes('ring_sg') || (name.includes('ring') && !name.includes('eye'))) {
        this.registerObject('magicRings', child.name, child);
        detectedCount++;
        console.log(`💍 Magic ring détecté: ${child.name}`);
      }
      // 🤖 ARMS DETECTION
      else if (name.includes('bigarm') || name.includes('littlearm') || name.includes('bras')) {
        this.registerObject('arms', child.name, child);
        detectedCount++;
        console.log(`🤖 Arm détecté: ${child.name}`);
      }
    });

    console.log(`🎛️ BloomControlCenter: ${detectedCount} objets bloom détectés et configurés`);
    console.log(`📊 Groupes: EyeRings=${this.objectsByType.eyeRings.size}, Iris=${this.objectsByType.iris.size}, MagicRings=${this.objectsByType.magicRings.size}, Arms=${this.objectsByType.arms.size}`);
    
    // 🎨 Appliquer configuration initiale
    this.applyInitialMaterials();
    
    return detectedCount;
  }

  // 📝 ENREGISTRER UN OBJET DANS UNE CATÉGORIE
  registerObject(objectType, objectName, meshObject) {
    if (!this.objectsByType[objectType]) {
      console.warn(`🎛️ BloomControlCenter: Type d'objet inconnu: ${objectType}`);
      return;
    }

    // Sauvegarder matériau original si pas déjà fait
    if (!meshObject.userData.originalMaterial) {
      meshObject.userData.originalMaterial = meshObject.material.clone();
    }

    this.objectsByType[objectType].set(objectName, meshObject);
    console.log(`🎛️ Objet enregistré: ${objectType}.${objectName}`);
  }

  // 🎨 APPLIQUER MATÉRIAUX INITIAUX
  applyInitialMaterials() {
    Object.keys(this.objectsByType).forEach(objectType => {
      const config = this.materialConfigs[objectType];
      
      this.objectsByType[objectType].forEach((meshObject) => {
        this.updateObjectMaterial(meshObject, config);
      });
    });

    console.log("🎨 Matériaux initiaux appliqués à tous les objets bloom");
  }

  // 🔧 METTRE À JOUR MATÉRIAU D'UN OBJET
  updateObjectMaterial(meshObject, materialConfig) {
    if (!meshObject.material) return;

    Object.keys(materialConfig).forEach(property => {
      const value = materialConfig[property];
      
      if (property === 'emissive') {
        if (!meshObject.material.emissive) {
          meshObject.material.emissive = new THREE.Color();
        }
        meshObject.material.emissive.setHex(value);
      } else if (meshObject.material[property] !== undefined) {
        meshObject.material[property] = value;
      }
    });

    meshObject.material.needsUpdate = true;
  }

  // 🔧 MODIFIER PROPRIÉTÉ D'UN TYPE D'OBJET
  setObjectTypeProperty(objectType, property, value) {
    if (!this.objectsByType[objectType]) {
      console.warn(`🔧 Type d'objet inconnu: ${objectType}`);
      return;
    }

    this.objectsByType[objectType].forEach((meshObject) => {
      if (property === 'emissive') {
        if (!meshObject.material.emissive) {
          meshObject.material.emissive = new THREE.Color();
        }
        meshObject.material.emissive.setHex(value);
      } else if (meshObject.material && meshObject.material[property] !== undefined) {
        meshObject.material[property] = value;
        meshObject.material.needsUpdate = true;
      }
    });

    console.log(`⚡ ${objectType}.${property}: ${value}`);
  }

  // 🔒 CHANGER ÉTAT DE SÉCURITÉ - MÉTHODE PRINCIPALE
  setSecurityState(newState) {
    if (!this.securityPresets[newState]) {
      console.warn(`🔒 État de sécurité inconnu: ${newState}`);
      return;
    }

    this.currentSecurityState = newState;
    const preset = this.securityPresets[newState];

    // ✅ Appliquer preset à tous les types d'objets
    Object.keys(preset).forEach(objectType => {
      const config = preset[objectType];
      
      this.objectsByType[objectType].forEach((meshObject) => {
        this.updateObjectMaterial(meshObject, {
          ...this.materialConfigs[objectType],
          ...config
        });
      });
    });

    console.log(`🔒 Sécurité IRIS: ${newState} - Groupes mis à jour: ${Object.keys(preset).join(', ')}`);
  }

  // 🌟 API POST-PROCESSING (pour connexion future)
  setPostProcessParameter(parameter, value) {
    if (this.postProcessConfig[parameter] !== undefined) {
      this.postProcessConfig[parameter] = value;
      console.log(`🌟 Post-process ${parameter}: ${value}`);
    } else if (parameter.startsWith('reveal_')) {
      // ✅ NOUVEAU : Paramètres spécifiques pour reveal rings
      const realParam = parameter.replace('reveal_', '');
      if (!this.revealPostProcessConfig) {
        this.revealPostProcessConfig = {
          threshold: 0.3,
          strength: 1.5,
          radius: 1.0
        };
      }
      
      if (this.revealPostProcessConfig[realParam] !== undefined) {
        this.revealPostProcessConfig[realParam] = value;
        console.log(`💍 Reveal post-process ${realParam}: ${value}`);
      }
    }
  }

  // 🔄 UPDATE (pour animations futures)
  update(deltaTime) {
    this.animationTime += deltaTime;
    
    if (this.pulseEnabled && this.currentSecurityState === 'SCANNING') {
      this.updatePulseEffect();
    }
  }

  // 💫 EFFET PULSE (préparé pour le futur)
  updatePulseEffect() {
    const pulseIntensity = Math.sin(this.animationTime * 3) * 0.2 + 0.5;
    
    // Appliquer pulsation aux eye rings et iris en mode SCANNING
    if (this.currentSecurityState === 'SCANNING') {
      const baseIntensity = this.securityPresets.SCANNING.eyeRings.emissiveIntensity;
      this.setObjectTypeProperty('eyeRings', 'emissiveIntensity', baseIntensity * pulseIntensity);
      this.setObjectTypeProperty('iris', 'emissiveIntensity', baseIntensity * pulseIntensity);
    }
  }

  // 📊 INFORMATIONS DEBUG
  getObjectsInfo() {
    const info = {};
    Object.keys(this.objectsByType).forEach(type => {
      info[type] = {
        count: this.objectsByType[type].size,
        objects: Array.from(this.objectsByType[type].keys())
      };
    });
    return info;
  }

  // 📊 INFORMATIONS CONFIG DEBUG
  getConfigInfo() {
    return {
      securityState: this.currentSecurityState,
      postProcessConfig: this.postProcessConfig,
      revealPostProcessConfig: this.revealPostProcessConfig || null,
      objectGroups: {
        iris: this.objectsByType.iris.size,
        eyeRings: this.objectsByType.eyeRings.size,
        magicRings: this.objectsByType.magicRings.size,
        arms: this.objectsByType.arms.size
      },
      renderingEngine: this.renderingEngine ? 'Connected' : 'Not Connected'
    };
  }

  // ✅ COORDINATION : Interface unifiée bloom pour V3Scene
  setBloomParameter(param, value) {
    if (this.renderingEngine && this.renderingEngine.updateBloom) {
      this.renderingEngine.updateBloom(param, value);
      console.log(`🎛️ BloomControlCenter → SimpleBloomSystem: ${param}=${value}`);
      return true;
    } else {
      console.warn(`⚠️ BloomControlCenter: Aucun moteur de rendu connecté pour ${param}=${value}`);
      return false;
    }
  }

  // ✅ COORDINATION : Synchroniser objets bloom vers moteur de rendu
  syncWithRenderingEngine() {
    if (this.renderingEngine && this.renderingEngine.setBloomObjects) {
      const allBloomObjects = this.getAllBloomObjects();
      this.renderingEngine.setBloomObjects(allBloomObjects);
      console.log(`🔄 BloomControlCenter: ${Object.keys(allBloomObjects).length} objets synchronisés avec moteur`);
    }
  }

  // ✅ HELPER : Récupérer tous objets bloom pour synchronisation
  getAllBloomObjects() {
    const allObjects = {};
    Object.keys(this.objectsByType).forEach(type => {
      this.objectsByType[type].forEach((object, name) => {
        allObjects[`${type}.${name}`] = object;
      });
    });
    return allObjects;
  }

  // 🔄 RESET VERS MATÉRIAUX ORIGINAUX
  resetToOriginalMaterials() {
    Object.values(this.objectsByType).forEach(objectMap => {
      objectMap.forEach((meshObject) => {
        if (meshObject.userData.originalMaterial) {
          meshObject.material = meshObject.userData.originalMaterial.clone();
        }
      });
    });
    
    console.log("🔄 Matériaux originaux restaurés");
  }

  // 🗑️ NETTOYAGE
  dispose() {
    this.resetToOriginalMaterials();
    
    Object.keys(this.objectsByType).forEach(type => {
      this.objectsByType[type].clear();
    });
    
    console.log("🗑️ BloomControlCenter V6 nettoyé");
  }
}