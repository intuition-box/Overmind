// 🌟 RevealationSystem V5 - SYSTÈME RÉVÉLATION ANNEAUX NETTOYÉ
import * as THREE from 'three';
import { V3_CONFIG } from '../../utils/config.js';
import { RING_MATERIALS, getMaterialType } from '../../utils/materials.js';

export class RevealationSystem {
  constructor(magicRings) {
    this.magicRings = magicRings;
    this.triggerZone = {
      position: new THREE.Vector3(
        V3_CONFIG.revelation.centerX,
        V3_CONFIG.revelation.centerY,
        V3_CONFIG.revelation.centerZ
      ),
      radius: V3_CONFIG.revelation.radius,
      height: V3_CONFIG.revelation.height
    };
    
    this.forceShowAll = false;
    this.isAnimating = false;
    this.tempVec = new THREE.Vector3();
    
    console.log(`🌟 RevealationSystem V5: ${magicRings.length} anneaux`);
  }

  // Logique révélation inversée (silencieuse)
  updateRevelation() {
    const revealedRings = this.magicRings.map(ring => {
      ring.getWorldPosition(this.tempVec);
      const distance = this.tempVec.distanceTo(this.triggerZone.position);
      const isInZone = distance <= this.triggerZone.radius && 
                      Math.abs(this.tempVec.y - this.triggerZone.position.y) <= this.triggerZone.height;
      
      // Logique inversée : visible HORS zone, invisible DANS zone
      const shouldShow = this.forceShowAll || !isInZone;
      
      // Si forceShowAll est actif, ne pas changer la visibilité
      if (!this.forceShowAll) {
        ring.visible = shouldShow;
      }
      
      // Application matériau bloom si révélé
      if (shouldShow && ring.material) {
        this.applyBloomMaterial(ring);
      }
      
      return {
        name: ring.name,
        position: { 
          x: parseFloat(this.tempVec.x.toFixed(2)), 
          y: parseFloat(this.tempVec.y.toFixed(2)), 
          z: parseFloat(this.tempVec.z.toFixed(2)) 
        },
        visible: shouldShow,
        distance: parseFloat(distance.toFixed(2)),
        type: getMaterialType(ring.material?.name || ""),
        isInZone: isInZone,
        material: ring.material?.name || "No Material"
      };
    });
    
    return revealedRings;
  }

  // Application matériau bloom (préserver textures ET contrôles utilisateur)
  applyBloomMaterial(ring) {
    if (!ring.material) return;
    
    const materialName = ring.material.name;
    if (RING_MATERIALS.includes(materialName)) {
      ring.material.transparent = true;
      ring.material.depthWrite = true;
      
      // ✅ CORRIGÉ: Ne pas override les valeurs émissives si elles ont déjà été définies par l'utilisateur
      // Seulement initialiser si la valeur est à 0 (non définie)
      if (materialName === 'BloomArea' && ring.material.emissiveIntensity === 0) {
        ring.material.emissive = new THREE.Color(0x001133);
        ring.material.emissiveIntensity = 0.1;
      } else if (materialName === 'alien-panels' && ring.material.emissiveIntensity === 0) {
        ring.material.emissive = new THREE.Color(0x001100);
        ring.material.emissiveIntensity = 0.05;
      } else if (materialName === 'Material-metal050-effet-chrome' && ring.material.emissiveIntensity === 0) {
        ring.material.emissive = new THREE.Color(0x111111);
        ring.material.emissiveIntensity = 0.03;
      }
      
      console.log(`🎨 applyBloomMaterial: ${ring.name} (${materialName}) - emissiveIntensity préservé: ${ring.material.emissiveIntensity}`);
    }
  }

  // Reset matériaux
  resetRingMaterials() {
    this.magicRings.forEach(ring => {
      if (ring.material) {
        ring.material.emissive = new THREE.Color(0x000000);
        ring.material.emissiveIntensity = 0;
      }
    });
  }

  // Démarrer animation anneaux
  startRingAnimation(animationController) {
    if (this.isAnimating) {
      return false;
    }
    
    this.isAnimating = true;
    
    if (animationController && typeof animationController.startRingAnimations === 'function') {
      const success = animationController.startRingAnimations();
      
      if (success) {
        setTimeout(() => {
          this.isAnimating = false;
        }, 4000);
        
        return true;
      } else {
        this.isAnimating = false;
        return false;
      }
    } else {
      return this.startRingAnimationLegacy(animationController);
    }
  }

  // Fallback legacy
  startRingAnimationLegacy(animationController) {
    V3_CONFIG.animations.rings.forEach(animName => {
      if (animationController.actions && animationController.actions.has(animName)) {
        const action = animationController.actions.get(animName);
        action.reset();
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.play();
      }
    });
    
    setTimeout(() => {
      this.isAnimating = false;
    }, 4000);
    
    return true;
  }

  // Mise à jour zone trigger
  updateTriggerZone(position, radius, height) {
    this.triggerZone.position.copy(position);
    this.triggerZone.radius = radius;
    this.triggerZone.height = height;
  }

  // Forçage affichage
  setForceShowAll(force, withEffects = true) {
    console.log(`🔧 RevealationSystem.setForceShowAll(${force}) - ${this.magicRings.length} anneaux`);
    this.forceShowAll = force;
    
    if (force) {
      this.magicRings.forEach((ring, index) => {
        ring.visible = true;
        console.log(`  ✅ Anneau ${index + 1}: ${ring.name} → visible = true`);
        if (withEffects) {
          this.applyBloomMaterial(ring);
        }
      });
    } else {
      console.log(`🔧 Force show désactivé - application logique normale`);
      // ✅ CORRIGÉ: Appliquer immédiatement la logique normale de révélation
      this.updateRevelation();
    }
  }

  // Getters
  getTriggerZone() {
    return { 
      position: this.triggerZone.position.clone(),
      radius: this.triggerZone.radius,
      height: this.triggerZone.height
    };
  }

  isCurrentlyAnimating() {
    return this.isAnimating;
  }

  getRingStats() {
    const visible = this.magicRings.filter(ring => ring.visible).length;
    const total = this.magicRings.length;
    
    return {
      visible,
      hidden: total - visible,
      total,
      forceShow: this.forceShowAll,
      animating: this.isAnimating
    };
  }

  // Méthodes utilitaires
  resetAllRings() {
    this.magicRings.forEach(ring => {
      ring.visible = false;
      if (ring.material) {
        ring.material.emissive = new THREE.Color(0x000000);
        ring.material.emissiveIntensity = 0;
      }
    });
  }

  forceShowRing(ringName, show = true) {
    const ring = this.magicRings.find(r => r.name === ringName);
    if (ring) {
      ring.visible = show;
      if (show) this.applyBloomMaterial(ring);
    }
  }

  // Nettoyage
  dispose() {
    this.resetAllRings();
    this.magicRings = null;
  }
}