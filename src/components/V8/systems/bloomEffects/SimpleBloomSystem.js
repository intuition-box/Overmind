import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';

/**
 * SimpleBloomSystem - Système de bloom simplifié et efficace
 * Basé sur UnrealBloomPass pour des performances optimales
 */
export class SimpleBloomSystem {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    // ✅ CONFIGURATION SIMPLE
    this.config = {
      threshold: 0.30,
      strength: 0.80,
      radius: 0.40
    };
    
    // ✅ NOUVEAU : Configuration par groupe d'objets
    this.groupConfigs = {
      iris: {
        emissiveColor: 0x00ff88,
        emissiveIntensity: 0.3,
        bloomSettings: { threshold: 0.3, strength: 0.8, radius: 0.4 }
      },
      eyeRings: {
        emissiveColor: 0x4488ff,
        emissiveIntensity: 0.4,
        bloomSettings: { threshold: 0.4, strength: 0.6, radius: 0.3 }
      },
      revealRings: {
        emissiveColor: 0xffaa00,
        emissiveIntensity: 0.5,
        bloomSettings: { threshold: 0.43, strength: 0.80, radius: 0.36 }
      }
    };
    
    // ✅ NOUVEAU : Modes de sécurité
    this.securityModes = {
      SAFE: { color: 0x00ff88, intensity: 0.3 },
      DANGER: { color: 0xff4444, intensity: 0.8 },
      WARNING: { color: 0xffaa00, intensity: 0.5 },
      SCANNING: { color: 0x4488ff, intensity: 0.6 },
      NORMAL: { color: 0xffffff, intensity: 0.2 }
    };
    
    this.currentSecurityMode = 'NORMAL';
    this.isEnabled = true;
    this.composer = null;
    this.bloomPass = null;
    this.luminousObjects = new Set();
    this.objectGroups = {
      iris: new Set(),
      eyeRings: new Set(),
      revealRings: new Set()
    };
    
    // ✅ NOUVEAU V8 : Support exposure
    this.exposure = 1.0;
    
    console.log('✅ SimpleBloomSystem initialisé avec succès');
  }
  
  init() {
    if (!this.scene || !this.camera || !this.renderer) {
      console.error('❌ SimpleBloomSystem: Scene, camera ou renderer manquant');
      return false;
    }
    
    try {
      // ✅ COMPOSER PRINCIPAL
      this.composer = new EffectComposer(this.renderer);
      
      // ✅ RENDER PASS
      const renderPass = new RenderPass(this.scene, this.camera);
      this.composer.addPass(renderPass);
      
      // ✅ UNREAL BLOOM PASS
      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        this.config.strength,
        this.config.radius,
        this.config.threshold
      );
      this.composer.addPass(this.bloomPass);
      
      // ✅ NOUVEAU V8 : EXPOSURE PASS PERSONNALISÉ
      this.exposurePass = new ShaderPass({
        uniforms: {
          tDiffuse: { value: null },
          exposure: { value: this.exposure }
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D tDiffuse;
          uniform float exposure;
          varying vec2 vUv;
          
          void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            gl_FragColor = vec4(texel.rgb * exposure, texel.a);
          }
        `
      });
      this.composer.addPass(this.exposurePass);
      
      // ✅ FXAA PASS (anti-aliasing)
      const fxaaPass = new ShaderPass(FXAAShader);
      fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * this.renderer.getPixelRatio());
      fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * this.renderer.getPixelRatio());
      this.composer.addPass(fxaaPass);
      
      // ✅ COPY PASS (final)
      const copyPass = new ShaderPass(CopyShader);
      copyPass.renderToScreen = true;
      this.composer.addPass(copyPass);
      
      console.log('✅ SimpleBloomSystem: Composer initialisé avec succès');
      return true;
    } catch (error) {
      console.error('❌ SimpleBloomSystem: Erreur initialisation composer:', error);
      return false;
    }
  }
  
  setupLuminousObjects() {
    if (!this.scene) return;
    
    this.scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const material = Array.isArray(child.material) ? child.material[0] : child.material;
        
        if (material.emissive && material.emissive.getHex() !== 0x000000) {
          this.luminousObjects.add(child);
          console.log(`✅ Objet lumineux détecté: ${child.name || 'unnamed'}`);
        }
      }
    });
    
    console.log(`✅ ${this.luminousObjects.size} objets lumineux détectés`);
  }
  
  addToGroup(mesh, groupName) {
    if (this.objectGroups[groupName]) {
      this.objectGroups[groupName].add(mesh);
      console.log(`✅ ${mesh.name || 'unnamed'} ajouté au groupe ${groupName}`);
    } else {
      console.warn(`⚠️ Groupe inconnu: ${groupName}`);
    }
  }
  
  updateGroup(groupName, settings) {
    if (!this.objectGroups[groupName]) {
      console.warn(`⚠️ Groupe inconnu: ${groupName}`);
      return;
    }
    
    this.objectGroups[groupName].forEach(mesh => {
      if (mesh.material) {
        const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        
        if (settings.emissiveColor !== undefined) {
          material.emissive.setHex(settings.emissiveColor);
        }
        
        if (settings.emissiveIntensity !== undefined) {
          material.emissiveIntensity = settings.emissiveIntensity;
        }
        
        material.needsUpdate = true;
      }
    });
    
    console.log(`✅ Groupe ${groupName} mis à jour:`, settings);
  }
  
  setSecurityMode(mode) {
    if (!this.securityModes[mode]) {
      console.warn(`⚠️ Mode de sécurité inconnu: ${mode}`);
      return;
    }
    
    this.currentSecurityMode = mode;
    const config = this.securityModes[mode];
    
    // Appliquer aux groupes iris et eyeRings
    ['iris', 'eyeRings'].forEach(groupName => {
      this.updateGroup(groupName, {
        emissiveColor: config.color,
        emissiveIntensity: config.intensity
      });
    });
    
    console.log(`✅ Mode de sécurité changé: ${mode}`);
  }
  
  updateColorBloom(colorName, bloomSettings) {
    if (!this.groupConfigs[colorName]) {
      console.warn(`⚠️ Couleur inconnue: ${colorName}`);
      return;
    }
    
    this.groupConfigs[colorName].bloomSettings = {
      ...this.groupConfigs[colorName].bloomSettings,
      ...bloomSettings
    };
    
    console.log(`✅ Bloom de la couleur ${colorName} mis à jour:`, bloomSettings);
  }
  
  updateGroupBloom(groupName, bloomSettings) {
    if (!this.groupConfigs[groupName]) {
      console.warn(`⚠️ Groupe inconnu: ${groupName}`);
      return;
    }
    
    this.groupConfigs[groupName].bloomSettings = {
      ...this.groupConfigs[groupName].bloomSettings,
      ...bloomSettings
    };
    
    console.log(`✅ Bloom du groupe ${groupName} mis à jour:`, bloomSettings);
  }
  
  // ✅ CORRECTION CONFLIT #1 : Synchroniser exposure depuis le renderer (ne plus le modifier)
  syncExposure() {
    const newExposure = this.renderer ? this.renderer.toneMappingExposure : 1.0;
    
    // ✅ OPTIMISATION : Synchroniser seulement si la valeur a changé
    if (Math.abs(newExposure - this.exposure) > 0.001) {
      this.exposure = newExposure;
      
      // ✅ APPLIQUER seulement aux shaders internes du bloom
      if (this.exposurePass && this.exposurePass.material) {
        this.exposurePass.material.uniforms.exposure.value = this.exposure;
        this.exposurePass.material.needsUpdate = true;
      }
      
      // ✅ Mettre à jour composer si nécessaire
      if (this.composer) {
        this.composer.passes.forEach(pass => {
          if (pass.material && pass.material.uniforms && pass.material.uniforms.exposure) {
            pass.material.uniforms.exposure.value = this.exposure;
            pass.material.needsUpdate = true;
          }
        });
      }
      
      console.log(`SimpleBloomSystem exposure mis à jour: ${this.exposure.toFixed(2)}`);
    }
  }
  
  // ✅ CORRECTION CONFLIT #1 : Obtenir l'exposure depuis le renderer (source unique)
  getExposure() {
    // Lire directement depuis le renderer plutôt que la variable locale
    return this.renderer ? this.renderer.toneMappingExposure : this.exposure;
  }
  
  render() {
    if (!this.isEnabled || !this.composer) {
      // Fallback au rendu normal - pas besoin de modifier exposure
      this.renderer.render(this.scene, this.camera);
      return;
    }
    
    try {
      // ✅ CORRECTION CONFLIT #1 : Synchroniser exposure depuis le renderer
      this.syncExposure();
      
      // ✅ CRUCIAL : Forcer la mise à jour des matériaux
      this.scene.traverse((child) => {
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
      
      this.composer.render();
    } catch (error) {
      console.error('❌ Erreur rendu SimpleBloomSystem:', error);
      // Fallback au rendu normal avec exposure
      this.renderer.toneMappingExposure = this.exposure;
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  updateBloom(param, value) {
    if (!this.bloomPass) return;
    
    // ✅ CORRIGÉ : Mettre à jour le paramètre spécifique
    switch (param) {
      case 'threshold':
        this.config.threshold = value;
        this.bloomPass.threshold = value;
        break;
      case 'strength':
        this.config.strength = value;
        this.bloomPass.strength = value;
        break;
      case 'radius':
        this.config.radius = value;
        this.bloomPass.radius = value;
        break;
      case 'enabled':
        this.setBloomEnabled(value);
        return;
      default:
        console.warn(`⚠️ Paramètre bloom inconnu: ${param}`);
        return;
    }
    
    console.log(`✅ Bloom mis à jour: ${param} = ${value}`);
  }
  
  setBloomEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(`✅ Bloom ${enabled ? 'activé' : 'désactivé'}`);
  }
  
  applyPreset(presetName) {
    const presets = {
      subtle: { threshold: 0.8, strength: 0.3, radius: 0.2 },
      normal: { threshold: 0.4, strength: 0.8, radius: 0.4 },
      intense: { threshold: 0.1, strength: 1.5, radius: 0.6 }
    };
    
    const preset = presets[presetName];
    if (preset) {
      this.updateBloom('threshold', preset.threshold);
      this.updateBloom('strength', preset.strength);
      this.updateBloom('radius', preset.radius);
      console.log(`🎛️ Preset "${presetName}" appliqué`);
    }
  }
  
  handleResize() {
    if (this.composer) {
      this.composer.setSize(window.innerWidth, window.innerHeight);
    }
  }
  
  dispose() {
    if (this.composer) {
      this.composer.dispose();
    }
  }
  
  getStatus() {
    return {
      enabled: this.isEnabled,
      config: this.config,
      composer: !!this.composer,
      bloomPass: !!this.bloomPass,
      luminousObjectsCount: this.luminousObjects.size,
      currentSecurityMode: this.currentSecurityMode,
      exposure: this.exposure,  // ✅ NOUVEAU V8
      groupCounts: {
        iris: this.objectGroups.iris.size,
        eyeRings: this.objectGroups.eyeRings.size,
        revealRings: this.objectGroups.revealRings.size
      }
    };
  }
}