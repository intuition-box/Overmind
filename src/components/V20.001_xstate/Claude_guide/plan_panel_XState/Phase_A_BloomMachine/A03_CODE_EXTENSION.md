# 💻 PHASE A - CODE EXTENSION : bloomMachine

**Date** : 3 octobre 2025
**Objectif** : Code complet TypeScript XState v5 pour étendre bloomMachine
**Note** : materialMachine sera créé en Phase C (PBRMachine)

---

## 📁 FICHIER À MODIFIER

### **bloomMachine.ts** - Extension avec BloomColorPicker

**Chemin** : `/xstate-v5/actors/bloom/bloomMachine.ts`

---

## 💻 CODE COMPLET : bloomMachine.ts étendu

```typescript
// xstate-v5/actors/bloom/bloomMachine.ts
import { setup, assign, enqueueActions } from 'xstate';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export interface BloomContext {
  bloomPass: UnrealBloomPass | null;

  // Global bloom parameters (s'appliquent à toute la scène)
  threshold: number;  // 0.15 default (V6 value)
  strength: number;   // 0.40 default (V6 value)
  radius: number;     // 0.4 default
  enabled: boolean;   // true default

  // NEW: Current bloom color (pour BloomColorPicker)
  bloomColor: string; // Hex color (ex: '#00ff88')
}

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

export const bloomMachine = setup({
  types: {} as {
    context: BloomContext;
    events: BloomEvents;
  },
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
}).createMachine({
  id: 'bloom',
  initial: 'idle',
  context: {
    bloomPass: null,

    // Global parameters (valeurs V6 Zustand)
    threshold: 0.15,
    strength: 0.40,
    radius: 0.4,
    enabled: true,

    // NEW: Bloom color (vert par défaut, comme V6)
    bloomColor: '#00ff88'
  },
  states: {
    idle: {
      on: {
        INITIALIZE: {
          target: 'ready',
          actions: assign({
            bloomPass: ({ event }) => event.bloomPass
          })
        }
      }
    },
    ready: {
      on: {
        // Existants
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
        ENABLE: {
          actions: [
            assign({ enabled: true }),
            'updateBloomPass'
          ]
        },
        DISABLE: {
          actions: [
            assign({ enabled: false }),
            'updateBloomPass'
          ]
        },

        // NOUVEAU: BloomColorPicker
        SET_BLOOM_COLOR: {
          actions: [
            assign({ bloomColor: ({ event }) => event.color }),
            'applyBloomColorToAllGroups'
          ]
        }
      }
    }
  }
});
```

---

## 🔧 HOOK : useBloom.ts

**Chemin** : `/xstate-v5/hooks/useBloom.ts`

```typescript
// xstate-v5/hooks/useBloom.ts
import { useSelector } from '@xstate/react';
import type { ActorRefFrom } from 'xstate';
import type { bloomMachine } from '../actors/bloom/bloomMachine';

export function useBloom(actorRef: ActorRefFrom<typeof bloomMachine>) {
  // Global parameters
  const threshold = useSelector(actorRef, (state) => state.context.threshold);
  const strength = useSelector(actorRef, (state) => state.context.strength);
  const radius = useSelector(actorRef, (state) => state.context.radius);
  const enabled = useSelector(actorRef, (state) => state.context.enabled);
  const bloomColor = useSelector(actorRef, (state) => state.context.bloomColor);

  // Actions
  const updateThreshold = (threshold: number) => {
    actorRef.send({ type: 'UPDATE_THRESHOLD', threshold });
  };

  const updateStrength = (strength: number) => {
    actorRef.send({ type: 'UPDATE_STRENGTH', strength });
  };

  const updateRadius = (radius: number) => {
    actorRef.send({ type: 'UPDATE_RADIUS', radius });
  };

  const toggleEnabled = () => {
    actorRef.send({ type: 'TOGGLE_ENABLED' });
  };

  const setBloomColor = (color: string) => {
    actorRef.send({ type: 'SET_BLOOM_COLOR', color });
  };

  return {
    // State
    threshold,
    strength,
    radius,
    enabled,
    bloomColor,

    // Actions
    updateThreshold,
    updateStrength,
    updateRadius,
    toggleEnabled,
    setBloomColor
  };
}
```

---

## 🎨 EXEMPLE D'UTILISATION : ControlPanel Tab Bloom (Phase E)

```typescript
// Phase E - ControlPanel/BloomTab.tsx (exemple futur)
import { useBloom } from '@/xstate-v5/hooks/useBloom';
import { HexColorPicker } from 'react-colorful';

export function BloomTab({ bloomActorRef }) {
  const {
    threshold,
    strength,
    radius,
    enabled,
    bloomColor,
    updateThreshold,
    updateStrength,
    updateRadius,
    toggleEnabled,
    setBloomColor
  } = useBloom(bloomActorRef);

  return (
    <div className="bloom-tab">
      {/* BloomColorPicker (palette complète) */}
      <section>
        <h3>🎨 Bloom Color Picker</h3>
        <HexColorPicker color={bloomColor} onChange={setBloomColor} />
        <p>Current: {bloomColor}</p>
      </section>

      {/* Global Bloom Settings */}
      <section>
        <h3>✨ Global Bloom Settings</h3>

        <label>
          Threshold: {threshold.toFixed(2)}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={threshold}
            onChange={(e) => updateThreshold(parseFloat(e.target.value))}
          />
        </label>

        <label>
          Strength: {strength.toFixed(2)}
          <input
            type="range"
            min={0}
            max={3}
            step={0.01}
            value={strength}
            onChange={(e) => updateStrength(parseFloat(e.target.value))}
          />
        </label>

        <label>
          Radius: {radius.toFixed(2)}
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={radius}
            onChange={(e) => updateRadius(parseFloat(e.target.value))}
          />
        </label>

        <button onClick={toggleEnabled}>
          {enabled ? '✅ Enabled' : '❌ Disabled'}
        </button>
      </section>

      {/* Per-Group Emissive Intensity sera géré par materialMachine (Phase C) */}
    </div>
  );
}
```

---

## 🔄 FLUX D'EXÉCUTION

### **Scénario : Utilisateur change la couleur avec BloomColorPicker**

```
1. UI (HexColorPicker) → onChange → setBloomColor('#ff0000')
                                              ↓
2. bloomMachine reçoit → SET_BLOOM_COLOR { color: '#ff0000' }
                                              ↓
3. Action assign → context.bloomColor = '#ff0000'
                                              ↓
4. Action applyBloomColorToAllGroups → sendTo('material', { type: 'SET_ALL_GROUPS_COLOR', color: '#ff0000' })
                                              ↓
5. materialMachine (Phase C) reçoit → SET_ALL_GROUPS_COLOR
                                              ↓
6. materialMachine applique → Tous les groupes (iris/eyeRings/revealRings) deviennent rouges
```

---

## ⚠️ POINTS IMPORTANTS

### **1. Séparation des responsabilités**

**bloomMachine** :
- ✅ Gère UnrealBloomPass global (threshold/strength/radius)
- ✅ Stocke bloomColor actuel
- ✅ Envoie events à materialMachine via `sendTo`

**materialMachine** (Phase C) :
- ✅ Gère emissive color/intensity per-group
- ✅ Gère reveal toggle
- ✅ Applique sur matériaux Three.js

### **2. Communication Actor**

```typescript
// ✅ BON : bloomMachine envoie à materialMachine
enqueue.sendTo('material', {
  type: 'SET_ALL_GROUPS_COLOR',
  color: event.color
});

// ❌ MAUVAIS : Mutation directe du context d'une autre machine
context.materialContext.groups.iris.color = event.color; // Ne fais JAMAIS ça !
```

### **3. TypeScript strict**

```typescript
// ✅ Événements bien typés
export type BloomEvents =
  | { type: 'SET_BLOOM_COLOR'; color: string };  // color est string obligatoire

// ❌ Éviter any
const color: any = event.color;  // Pas de type safety
```

---

## ✅ CHECKLIST AVANT COMMIT

- [ ] `bloomMachine.ts` modifié avec `bloomColor` dans context
- [ ] Événement `SET_BLOOM_COLOR` ajouté avec type strict
- [ ] Action `applyBloomColorToAllGroups` créée avec `sendTo('material', ...)`
- [ ] `useBloom.ts` hook créé avec selectors + actions
- [ ] TypeScript compile sans erreurs (`npm run type-check`)
- [ ] Imports corrects (`xstate`, `enqueueActions`)
- [ ] Valeurs par défaut V6 respectées (threshold: 0.15, strength: 0.40, bloomColor: '#00ff88')

---

## 🚀 PROCHAINE ÉTAPE

→ [A04_TESTS.md](./A04_TESTS.md) - Tests console + UI pour valider l'implémentation

---

**FIN CODE EXTENSION**
