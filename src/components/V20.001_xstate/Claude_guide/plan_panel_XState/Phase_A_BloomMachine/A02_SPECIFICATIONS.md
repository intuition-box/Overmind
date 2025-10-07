# 📋 PHASE A - SPÉCIFICATIONS : bloomMachine + materialMachine

**Date** : 3 octobre 2025
**Objectif** : Définir EXACTEMENT l'architecture Actor honnête pour bloom + emissive
**Approche** : Séparation bloomMachine (global) ↔ materialMachine (per-group)

---

## 🎯 ARCHITECTURE GLOBALE

### **Séparation des responsabilités**

```typescript
// applicationMachine (root)
const appMachine = setup().createMachine({
  context: ({ spawn }) => ({
    bloomRef: spawn(bloomMachine, { systemId: 'bloom' }),
    materialRef: spawn(materialMachine, { systemId: 'material' })
  })
});
```

**bloomMachine** :
- ✅ Gère UnrealBloomPass (threshold/strength/radius)
- ✅ Enable/disable bloom global
- ✅ Peut envoyer events à materialMachine via `sendTo`

**materialMachine** :
- ✅ Gère références aux meshes par groupe (iris/eyeRings/revealRings)
- ✅ Gère emissive (color/intensity) per-group
- ✅ Gère visibility toggle (reveal rings)
- ✅ Applique changements sur matériaux Three.js

---

## 📐 PARTIE 1 : bloomMachine (Global Bloom)

### **Context étendu**

```typescript
export interface BloomContext {
  // UnrealBloomPass référence
  bloomPass: UnrealBloomPass | null;

  // Global bloom parameters (s'appliquent à toute la scène)
  threshold: number;  // 0.15 default (V6 value)
  strength: number;   // 0.40 default (V6 value)
  radius: number;     // 0.4 default
  enabled: boolean;   // true default

  // NEW: Current bloom color (pour BloomColorPicker)
  bloomColor: string; // Hex color (ex: '#00ff88')
}
```

### **Événements**

```typescript
export type BloomEvents =
  // Existants
  | { type: 'INITIALIZE'; bloomPass: UnrealBloomPass }
  | { type: 'UPDATE_THRESHOLD'; threshold: number }
  | { type: 'UPDATE_STRENGTH'; strength: number }
  | { type: 'UPDATE_RADIUS'; radius: number }
  | { type: 'TOGGLE_ENABLED' }
  | { type: 'ENABLE' }
  | { type: 'DISABLE' }

  // NOUVEAU: BloomColorPicker
  | { type: 'SET_BLOOM_COLOR'; color: string };  // Hex color
```

### **Actions**

```typescript
actions: {
  // Existant (pas de changement)
  updateBloomPass: ({ context }) => {
    if (context.bloomPass) {
      context.bloomPass.threshold = context.threshold;
      context.bloomPass.strength = context.strength;
      context.bloomPass.radius = context.radius;
      context.bloomPass.enabled = context.enabled;
    }
  },

  // NOUVEAU: Coordonner avec materialMachine pour changer couleur
  applyBloomColorToAllGroups: enqueueActions(({ enqueue, event }) => {
    if (event.type === 'SET_BLOOM_COLOR') {
      // Envoyer à materialMachine pour appliquer aux groupes
      enqueue.sendTo('material', {
        type: 'SET_ALL_GROUPS_COLOR',
        color: event.color
      });
    }
  })
}
```

### **Transitions**

```typescript
states: {
  idle: {
    on: {
      INITIALIZE: {
        target: 'ready',
        actions: assign({ bloomPass: ({ event }) => event.bloomPass })
      }
    }
  },
  ready: {
    on: {
      UPDATE_THRESHOLD: {
        actions: [
          assign({ threshold: ({ event }) => event.threshold }),
          'updateBloomPass'
        ]
      },
      UPDATE_STRENGTH: {
        actions: [
          assign({ strength: ({ event }) => event.strength }),
          'updateBloomPass'
        ]
      },
      UPDATE_RADIUS: {
        actions: [
          assign({ radius: ({ event }) => event.radius }),
          'updateBloomPass'
        ]
      },
      TOGGLE_ENABLED: {
        actions: [
          assign({ enabled: ({ context }) => !context.enabled }),
          'updateBloomPass'
        ]
      },
      SET_BLOOM_COLOR: {
        actions: [
          assign({ bloomColor: ({ event }) => event.color }),
          'applyBloomColorToAllGroups'
        ]
      }
    }
  }
}
```

---

## 📐 PARTIE 2 : materialMachine (Per-Group Emissive)

### **Context**

```typescript
export interface MaterialContext {
  // Groupes de matériaux
  groups: {
    iris: {
      materials: THREE.Material[] | null;
      emissiveColor: string;  // Hex color (ex: '#00ff88')
      emissiveIntensity: number;
    };
    eyeRings: {
      materials: THREE.Material[] | null;
      emissiveColor: string;
      emissiveIntensity: number;
    };
    revealRings: {
      materials: THREE.Material[] | null;
      emissiveColor: string;
      emissiveIntensity: number;
      visible: boolean;      // État visibility
      objects: THREE.Object3D[] | null;  // Objets à show/hide
    };
  };
}
```

### **Valeurs par défaut**

```typescript
context: {
  groups: {
    iris: {
      materials: null,
      emissiveColor: '#00ff88',  // Vert V6 default
      emissiveIntensity: 0.5
    },
    eyeRings: {
      materials: null,
      emissiveColor: '#4488ff',  // Bleu V6 default
      emissiveIntensity: 0.5
    },
    revealRings: {
      materials: null,
      emissiveColor: '#ffaa00',  // Orange V6 default
      emissiveIntensity: 0.5,
      visible: false,  // Caché par défaut
      objects: null
    }
  }
}
```

### **Événements**

```typescript
export type MaterialEvents =
  // Initialisation (appelé au chargement du modèle 3D)
  | { type: 'SET_GROUP_MATERIALS'; group: 'iris' | 'eyeRings' | 'revealRings'; materials: THREE.Material[] }
  | { type: 'SET_REVEAL_OBJECTS'; objects: THREE.Object3D[] }

  // Modification per-group
  | { type: 'UPDATE_GROUP_EMISSIVE_COLOR'; group: 'iris' | 'eyeRings' | 'revealRings'; color: string }
  | { type: 'UPDATE_GROUP_EMISSIVE_INTENSITY'; group: 'iris' | 'eyeRings' | 'revealRings'; intensity: number }

  // Modification all-groups (envoyé par bloomMachine via BloomColorPicker)
  | { type: 'SET_ALL_GROUPS_COLOR'; color: string }

  // Reveal toggle
  | { type: 'TOGGLE_REVEAL_VISIBILITY' }
  | { type: 'SHOW_REVEAL' }
  | { type: 'HIDE_REVEAL' };
```

### **Actions**

```typescript
actions: {
  // Appliquer emissive color sur un groupe
  applyGroupEmissiveColor: ({ context, event }) => {
    if (event.type === 'UPDATE_GROUP_EMISSIVE_COLOR') {
      const group = context.groups[event.group];

      if (group.materials) {
        const color = new THREE.Color(event.color);
        group.materials.forEach(material => {
          if ('emissive' in material) {
            (material as THREE.MeshStandardMaterial).emissive.copy(color);
            material.needsUpdate = true;
          }
        });
      }
    }
  },

  // Appliquer emissive intensity sur un groupe
  applyGroupEmissiveIntensity: ({ context, event }) => {
    if (event.type === 'UPDATE_GROUP_EMISSIVE_INTENSITY') {
      const group = context.groups[event.group];

      if (group.materials) {
        group.materials.forEach(material => {
          if ('emissiveIntensity' in material) {
            (material as THREE.MeshStandardMaterial).emissiveIntensity = event.intensity;
            material.needsUpdate = true;
          }
        });
      }
    }
  },

  // Appliquer couleur à TOUS les groupes (BloomColorPicker)
  applyColorToAllGroups: ({ context, event }) => {
    if (event.type === 'SET_ALL_GROUPS_COLOR') {
      const color = new THREE.Color(event.color);

      ['iris', 'eyeRings', 'revealRings'].forEach(groupName => {
        const group = context.groups[groupName as keyof typeof context.groups];

        if (group.materials) {
          group.materials.forEach(material => {
            if ('emissive' in material) {
              (material as THREE.MeshStandardMaterial).emissive.copy(color);
              material.needsUpdate = true;
            }
          });
        }
      });
    }
  },

  // Toggle reveal visibility
  toggleRevealVisibility: ({ context }) => {
    const revealGroup = context.groups.revealRings;

    if (revealGroup.objects) {
      revealGroup.objects.forEach(obj => {
        obj.visible = revealGroup.visible;
        obj.traverse((child) => {
          child.visible = revealGroup.visible;
        });
      });
    }
  }
}
```

### **Transitions**

```typescript
states: {
  idle: {
    on: {
      SET_GROUP_MATERIALS: {
        target: 'ready',
        actions: assign({
          groups: ({ context, event }) => ({
            ...context.groups,
            [event.group]: {
              ...context.groups[event.group],
              materials: event.materials
            }
          })
        })
      }
    }
  },
  ready: {
    on: {
      SET_GROUP_MATERIALS: {
        actions: assign({
          groups: ({ context, event }) => ({
            ...context.groups,
            [event.group]: {
              ...context.groups[event.group],
              materials: event.materials
            }
          })
        })
      },

      SET_REVEAL_OBJECTS: {
        actions: assign({
          groups: ({ context, event }) => ({
            ...context.groups,
            revealRings: {
              ...context.groups.revealRings,
              objects: event.objects
            }
          })
        })
      },

      UPDATE_GROUP_EMISSIVE_COLOR: {
        actions: [
          assign({
            groups: ({ context, event }) => ({
              ...context.groups,
              [event.group]: {
                ...context.groups[event.group],
                emissiveColor: event.color
              }
            })
          }),
          'applyGroupEmissiveColor'
        ]
      },

      UPDATE_GROUP_EMISSIVE_INTENSITY: {
        actions: [
          assign({
            groups: ({ context, event }) => ({
              ...context.groups,
              [event.group]: {
                ...context.groups[event.group],
                emissiveIntensity: event.intensity
              }
            })
          }),
          'applyGroupEmissiveIntensity'
        ]
      },

      SET_ALL_GROUPS_COLOR: {
        actions: [
          assign({
            groups: ({ context, event }) => ({
              iris: { ...context.groups.iris, emissiveColor: event.color },
              eyeRings: { ...context.groups.eyeRings, emissiveColor: event.color },
              revealRings: { ...context.groups.revealRings, emissiveColor: event.color }
            })
          }),
          'applyColorToAllGroups'
        ]
      },

      TOGGLE_REVEAL_VISIBILITY: {
        actions: [
          assign({
            groups: ({ context }) => ({
              ...context.groups,
              revealRings: {
                ...context.groups.revealRings,
                visible: !context.groups.revealRings.visible
              }
            })
          }),
          'toggleRevealVisibility'
        ]
      },

      SHOW_REVEAL: {
        actions: [
          assign({
            groups: ({ context }) => ({
              ...context.groups,
              revealRings: {
                ...context.groups.revealRings,
                visible: true
              }
            })
          }),
          'toggleRevealVisibility'
        ]
      },

      HIDE_REVEAL: {
        actions: [
          assign({
            groups: ({ context }) => ({
              ...context.groups,
              revealRings: {
                ...context.groups.revealRings,
                visible: false
              }
            })
          }),
          'toggleRevealVisibility'
        ]
      }
    }
  }
}
```

---

## 🔄 FLUX D'UTILISATION

### **Scénario 1 : BloomColorPicker change couleur globale**

```
┌──────────────────┐
│ UI: ColorPicker  │ → Utilisateur choisit #ff0000 (rouge)
└────────┬─────────┘
         │
         ↓ Event: SET_BLOOM_COLOR({ color: '#ff0000' })
┌────────┴─────────┐
│  bloomMachine    │
└────────┬─────────┘
         │
         ↓ Action: applyBloomColorToAllGroups
         ↓ sendTo('material', { type: 'SET_ALL_GROUPS_COLOR', color: '#ff0000' })
┌────────┴─────────┐
│ materialMachine  │
└────────┬─────────┘
         │
         ↓ Action: applyColorToAllGroups
┌────────┴─────────┐
│   Three.js       │ → TOUS les groupes (iris/eyeRings/revealRings) deviennent rouges
└──────────────────┘
```

### **Scénario 2 : Slider Emissive Intensity (per-group)**

```
┌──────────────────┐
│ UI: Slider Iris  │ → Utilisateur met emissive à 0.8
│ Emissive: 0.8    │
└────────┬─────────┘
         │
         ↓ Event: UPDATE_GROUP_EMISSIVE_INTENSITY({ group: 'iris', intensity: 0.8 })
┌────────┴─────────┐
│ materialMachine  │
└────────┬─────────┘
         │
         ↓ Action: applyGroupEmissiveIntensity
┌────────┴─────────┐
│   Three.js       │ → SEULEMENT matériaux iris brillent à 0.8
└──────────────────┘
```

### **Scénario 3 : Reveal Toggle**

```
┌──────────────────┐
│ UI: Bouton       │ → Utilisateur clique "👁️ SHOW REVEAL"
│ [REVEAL HIDDEN]  │
└────────┬─────────┘
         │
         ↓ Event: TOGGLE_REVEAL_VISIBILITY
┌────────┴─────────┐
│ materialMachine  │
└────────┬─────────┘
         │
         ↓ Action: assign({ revealRings.visible: true })
         ↓ Action: toggleRevealVisibility
┌────────┴─────────┐
│   Three.js       │ → Objets revealRings.objects deviennent visible
└──────────────────┘
```

---

## ⚠️ POINTS CRITIQUES (Éviter erreurs V6)

### **1. Clonage des matériaux**

**Problème V6** : Plusieurs meshes partageaient le même matériau → changer un mesh affectait tous.

**Solution XState v5** :
```typescript
// Dans le service de détection d'objets
scene.traverse((child) => {
  if (child.name.includes('IRIS')) {
    // ✅ CLONER le matériau pour chaque mesh
    if (child.material) {
      child.material = child.material.clone();
    }
    irisMaterials.push(child.material);
  }
});
```

### **2. Honnêteté UI**

**V6 avait** : Des sliders "iris.threshold", "eyeRings.threshold" qui ne fonctionnaient pas vraiment.

**XState v5** : UI claire qui montre ce qui est global vs per-group.

```
✅ Global Bloom Settings (threshold/strength/radius)
✅ Per-Group Emissive (color/intensity)
❌ PAS de faux sliders "per-group threshold"
```

### **3. Communication Actor**

**Pattern correct** :
```typescript
// bloomMachine envoie à materialMachine
sendTo('material', { type: 'SET_ALL_GROUPS_COLOR', color: '#ff0000' })

// Pas de mutation directe du context d'une autre machine !
```

---

## ✅ CRITÈRES DE SUCCÈS

### **Fonctionnel**
- ✅ BloomColorPicker change couleur de TOUS les groupes simultanément
- ✅ Slider emissive intensity per-group fonctionne indépendamment
- ✅ Reveal Toggle montre/cache objets reveal
- ✅ Sliders global bloom (threshold/strength/radius) s'appliquent à toute la scène

### **Technique**
- ✅ Séparation claire bloomMachine (global) ↔ materialMachine (per-group)
- ✅ Communication via `sendTo` (pas de mutation cross-machine)
- ✅ Matériaux clonés (pas de partage entre meshes)
- ✅ TypeScript strict (0 erreurs)

### **UX**
- ✅ Changements emissive visibles en temps réel
- ✅ Reveal toggle instantané
- ✅ Pas de flash/flicker
- ✅ UI honnête (pas de fausses promesses)

---

## 🚀 PROCHAINE ÉTAPE

→ [A03_CODE_EXTENSION.md](./A03_CODE_EXTENSION.md) - Code complet TypeScript XState v5

---

**FIN SPÉCIFICATIONS**
