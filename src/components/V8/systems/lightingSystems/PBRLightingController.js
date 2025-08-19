import * as THREE from 'three';

/**
 * PBRLightingController - Solution Hybride Option 3
 * Système de presets d'éclairage avec contrôles temps réel
 * Optimisé pour matériaux PBR importés de Blender
 */
export class PBRLightingController {
  constructor(scene, renderer, existingLights = null) {
    this.scene = scene;
    this.renderer = renderer;
    this.isInitialized = false;
    
    // ✅ COORDINATION : Utiliser lumières existantes de useThreeScene
    this.lights = existingLights || {
      ambient: null,
      directional: null
    };
    
    // ✅ PRESETS D'ÉCLAIRAGE - Option 3
    this.presets = {
      sombre: {
        name: 'Sombre (V6 Actuel)',
        ambient: { intensity: 0.8, color: 0x404040 },
        directional: { intensity: 0.8, color: 0xffffff },
        exposure: 1.0,
        toneMapping: THREE.LinearToneMapping,
        description: 'Éclairage faible actuel V6'
      },
      normal: {
        name: 'Normal (Équilibré)',
        ambient: { intensity: 1.5, color: 0x404040 },
        directional: { intensity: 2.0, color: 0xffffff },
        exposure: 1.0,
        toneMapping: THREE.LinearToneMapping,
        description: 'Éclairage équilibré (+87%)'
      },
      lumineux: {
        name: 'Lumineux (Élevé)',
        ambient: { intensity: 2.5, color: 0x404040 },
        directional: { intensity: 3.5, color: 0xffffff },
        exposure: 1.1,
        toneMapping: THREE.ACESFilmicToneMapping,
        description: 'Éclairage lumineux (+337%)'
      },
      pbr: {
        name: 'PBR Optimisé (Blender-like)',
        ambient: { intensity: 3.0, color: 0x404040 },
        directional: { intensity: 4.5, color: 0xffffff },
        exposure: 1.2,
        toneMapping: THREE.ACESFilmicToneMapping,
        description: 'Éclairage PBR optimisé (+462%)'
      }
    };
    
    // ✅ ÉTAT ACTUEL
    this.currentPreset = 'sombre';
    this.customMultipliers = {
      ambient: 1.0,
      directional: 1.0
    };
    
    // ✅ POSITIONS LUMIÈRES OPTIMALES
    this.lightPositions = {
      directional: new THREE.Vector3(2, 4, 5)
    };
  }
  
  /**
   * Initialise le système d'éclairage PBR
   */
  init() {
    try {
      this.createLights();
      this.applyPreset('sombre'); // Démarrer avec l'éclairage actuel
      this.isInitialized = true;
      console.log('✅ PBRLightingController initialisé avec presets:', Object.keys(this.presets));
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation PBRLightingController:', error);
      return false;
    }
  }
  
  /**
   * Configure les lumières (existantes ou nouvelles)
   */
  createLights() {
    // ✅ COORDINATION : Si lumières déjà fournies, les utiliser
    if (this.lights.ambient && this.lights.directional) {
      console.log('💡 Lumières coordonnées de useThreeScene réutilisées');
      return;
    }
    
    // ✅ FALLBACK : CHERCHER LES LUMIÈRES EXISTANTES si pas fournies
    this.scene.traverse((child) => {
      if (child.isAmbientLight && !this.lights.ambient) {
        this.lights.ambient = child;
        console.log('🔍 Lumière ambiante existante trouvée et réutilisée');
      }
      if (child.isDirectionalLight && !this.lights.directional) {
        this.lights.directional = child;
        console.log('🔍 Lumière directionnelle existante trouvée et réutilisée');
      }
    });
    
    // ✅ CRÉER SEULEMENT SI ELLES N'EXISTENT PAS
    if (!this.lights.ambient) {
      this.lights.ambient = new THREE.AmbientLight(0x404040, 0.8);
      this.lights.ambient.name = 'PBR_AmbientLight';
      this.scene.add(this.lights.ambient);
      console.log('💡 Nouvelle lumière ambiante créée');
    }
    
    if (!this.lights.directional) {
      this.lights.directional = new THREE.DirectionalLight(0xffffff, 0.8);
      this.lights.directional.name = 'PBR_DirectionalLight';
      this.lights.directional.position.copy(this.lightPositions.directional);
      this.lights.directional.castShadow = false; // Performance
      this.scene.add(this.lights.directional);
      console.log('💡 Nouvelle lumière directionnelle créée');
    }
    
    console.log('✅ Lumières PBR configurées:', {
      ambient: this.lights.ambient ? 'OK' : 'MANQUANTE',
      directional: this.lights.directional ? 'OK' : 'MANQUANTE'
    });
  }
  
  /**
   * Applique un preset d'éclairage
   */
  applyPreset(presetName) {
    if (!this.presets[presetName]) {
      console.warn(`❌ Preset "${presetName}" non trouvé`);
      return false;
    }
    
    const preset = this.presets[presetName];
    this.currentPreset = presetName;
    
    // ✅ APPLIQUER INTENSITÉS DE BASE
    if (this.lights.ambient) {
      this.lights.ambient.intensity = preset.ambient.intensity;
      this.lights.ambient.color.setHex(preset.ambient.color);
    }
    
    if (this.lights.directional) {
      this.lights.directional.intensity = preset.directional.intensity;
      this.lights.directional.color.setHex(preset.directional.color);
    }
    
    // ✅ APPLIQUER TONE MAPPING & EXPOSURE
    this.renderer.toneMapping = preset.toneMapping;
    this.renderer.toneMappingExposure = preset.exposure;
    
    console.log(`🎛️ Preset "${preset.name}" appliqué:`, {
      ambient: preset.ambient.intensity,
      directional: preset.directional.intensity,
      exposure: preset.exposure,
      toneMapping: preset.toneMapping === THREE.ACESFilmicToneMapping ? 'ACES' : 'Linear'
    });
    
    return true;
  }
  
  /**
   * Ajuste les multipliers globaux temps réel
   */
  setGlobalMultipliers(ambientMult = 1.0, directionalMult = 1.0) {
    this.customMultipliers.ambient = ambientMult;
    this.customMultipliers.directional = directionalMult;
    
    // ✅ APPLIQUER AVEC MULTIPLIERS
    const preset = this.presets[this.currentPreset];
    
    if (this.lights.ambient) {
      this.lights.ambient.intensity = preset.ambient.intensity * ambientMult;
    }
    
    if (this.lights.directional) {
      this.lights.directional.intensity = preset.directional.intensity * directionalMult;
    }
    
    console.log(`🔧 Multipliers appliqués: Ambient×${ambientMult.toFixed(1)}, Directional×${directionalMult.toFixed(1)}`);
  }
  
  /**
   * Obtient les informations du preset actuel
   */
  getCurrentPresetInfo() {
    return {
      name: this.currentPreset,
      preset: this.presets[this.currentPreset],
      multipliers: this.customMultipliers,
      finalIntensities: {
        ambient: this.lights.ambient?.intensity || 0,
        directional: this.lights.directional?.intensity || 0
      }
    };
  }
  
  /**
   * Liste tous les presets disponibles
   */
  getAvailablePresets() {
    return Object.keys(this.presets).map(key => ({
      key,
      name: this.presets[key].name,
      description: this.presets[key].description
    }));
  }
  
  /**
   * Ajuste l'exposure en temps réel
   */
  setExposure(value) {
    const clampedValue = Math.max(0.1, Math.min(3.0, value));
    this.renderer.toneMappingExposure = clampedValue;
    console.log(`📸 Exposure ajustée: ${clampedValue.toFixed(1)}`);
  }
  
  /**
   * Change le tone mapping
   */
  setToneMapping(mapping) {
    const mappings = {
      'linear': THREE.LinearToneMapping,
      'aces': THREE.ACESFilmicToneMapping,
      'reinhard': THREE.ReinhardToneMapping
    };
    
    if (mappings[mapping]) {
      this.renderer.toneMapping = mappings[mapping];
      console.log(`🎨 Tone mapping changé: ${mapping.toUpperCase()}`);
    }
  }
  
  /**
   * Nettoie les ressources - NE SUPPRIME PAS les lumières existantes
   */
  dispose() {
    // ✅ ON NE SUPPRIME PAS les lumières de la scène car elles peuvent être partagées
    // On se contente de remettre les références à null
    if (this.lights.ambient && this.lights.ambient.name === 'PBR_AmbientLight') {
      // Seulement si c'est une lumière qu'on a créée nous-mêmes
      this.scene.remove(this.lights.ambient);
    }
    this.lights.ambient = null;
    
    if (this.lights.directional && this.lights.directional.name === 'PBR_DirectionalLight') {
      // Seulement si c'est une lumière qu'on a créée nous-mêmes
      this.scene.remove(this.lights.directional);
    }
    this.lights.directional = null;
    
    this.isInitialized = false;
    console.log('🧹 PBRLightingController nettoyé (lumières partagées préservées)');
  }
  
  /**
   * Informations de débogage
   */
  getDebugInfo() {
    return {
      initialized: this.isInitialized,
      currentPreset: this.currentPreset,
      multipliers: this.customMultipliers,
      lightIntensities: {
        ambient: this.lights.ambient?.intensity || 0,
        directional: this.lights.directional?.intensity || 0
      },
      renderer: {
        toneMapping: this.renderer.toneMapping,
        exposure: this.renderer.toneMappingExposure
      }
    };
  }
}