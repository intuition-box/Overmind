// 👁️ EyeRingRotationManager V5 - Rotation des anneaux Eye SEULEMENT
import * as THREE from 'three';

export class EyeRingRotationManager {
  constructor(animationController) {
    this.controller = animationController;
    this.rotationSpeed = 0.01;
    this.isRotationEnabled = false;
    
    console.log("👁️ EyeRingRotationManager V5 initialisé (rotation SEULEMENT)");
  }

  // ✅ Initialiser (pas besoin du modèle)
  initialize() {
    console.log('👁️ EyeRingRotationManager: Sécurité gérée par BloomControlCenter');
    
    // Activer rotation si pas de drivers
    if (this.controller.eyeDriverActions.size === 0) {
      this.forceEyeRotation();
    }
  }

  // ✅ Démarrer les drivers d'œil
  startEyeDrivers() {
    this.controller.eyeDriverActions.forEach((action) => {
      action.reset();
      action.play();
      action.setEffectiveWeight(0);
      this.controller.transitionManager.fadeInAction(action, this.controller.fadeDuration * 0.3);
    });

    if (this.controller.eyeDriverActions.size === 0) {
      this.forceEyeRotation();
    }
  }

  // ✅ Rotation manuelle des anneaux œil
  forceEyeRotation() {
    this.isRotationEnabled = true;
    this.rotationSpeed = 0.01;
    console.log("👁️ Rotation manuelle Eye activée");
  }

  // ✅ Rotation correcte sur AXE Z pour les deux anneaux
  updateEyeRotation(deltaTime) {
    if (!this.controller.model || !this.isRotationEnabled) return;
    
    this.controller.model.traverse((child) => {
      if (child.name === 'Anneaux_Eye_Ext') {
        child.rotation.z += this.rotationSpeed * deltaTime * 60;
        this.updateChromeMaterial(child);
        
      } else if (child.name === 'Anneaux_Eye_Int') {
        child.rotation.z -= this.rotationSpeed * deltaTime * 80;
        this.updateChromeMaterial(child);
      }
    });
  }

  // ✅ MATÉRIAU CHROME DYNAMIQUE
  updateChromeMaterial(child) {
    if (child.material && child.material.name === 'Material-metal050-effet-chrome') {
      child.material.metalness = 1.0;
      child.material.roughness = 0.05;
    }
  }

  // 🔄 Update principal (rotation seulement)
  update(deltaTime) {
    this.updateEyeRotation(deltaTime);
  }

  // 🎨 API publique pour sécurité (redirections vers BloomControlCenter)
  setSecurityState(state) {
    console.log(`👁️ EyeRingRotationManager: État sécurité ${state} transféré à BloomControlCenter`);
    return true;
  }

  getCurrentSecurityState() {
    console.log('👁️ EyeRingRotationManager: État sécurité géré par BloomControlCenter');
    return { state: 'MANAGED_BY_BLOOM_CONTROL_CENTER', objectCount: 0 };
  }

  // 🔍 Classification animation Eye
  isEyeDriverAnimation(name) {
    const eyeKeywords = ['Eye', 'Anneaux_Eye', 'Driver'];
    return eyeKeywords.some(keyword => name.includes(keyword));
  }

  // 🔧 Debug spécifique drivers œil
  debugEyeDriversSearch() {
    const allAnimations = Array.from(this.controller.actions.keys());
    
    console.log("\n👁️ DEBUG EYE - RECHERCHE EXHAUSTIVE V5:");
    allAnimations.forEach(name => {
      if (name.toLowerCase().includes('eye') || 
          name.toLowerCase().includes('anneaux') ||
          name.toLowerCase().includes('driver') ||
          name.toLowerCase().includes('rotation')) {
        console.log(`   🔍 CANDIDAT: "${name}"`);
      }
    });
    
    console.log("\n👁️ DEBUG EYE - OBJETS 3D:");
    this.controller.model.traverse((child) => {
      if (child.name && (
          child.name.includes('Eye') || 
          child.name.includes('Anneaux_Eye') ||
          child.name.includes('eye')
        )) {
        console.log(`   👁️ OBJET: "${child.name}" - Material: "${child.material?.name || 'aucun'}"`);
      }
    });

    console.log('👁️ Debug bloom géré par BloomControlCenter');
  }

  // ⚙️ Contrôles rotation
  setRotationSpeed(speed) {
    this.rotationSpeed = Math.max(0.001, Math.min(0.1, speed));
  }

  enableRotation() {
    this.isRotationEnabled = true;
  }

  disableRotation() {
    this.isRotationEnabled = false;
  }

  toggleRotation() {
    this.isRotationEnabled = !this.isRotationEnabled;
    return this.isRotationEnabled;
  }

  // ⚙️ Contrôles bloom (redirections vers BloomControlCenter)
  enableSecurityBloom() {
    console.log('👁️ Bloom sécurité géré par BloomControlCenter');
  }

  disableSecurityBloom() {
    console.log('👁️ Bloom sécurité géré par BloomControlCenter');
  }
}