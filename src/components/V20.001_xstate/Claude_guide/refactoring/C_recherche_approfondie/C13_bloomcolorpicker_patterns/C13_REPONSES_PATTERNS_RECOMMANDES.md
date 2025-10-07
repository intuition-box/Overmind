# 🎨 C13 - RÉPONSES PATTERNS RECOMMANDÉS

**Date** : 1 octobre 2025
**Session** : C13 - BloomColorPicker Patterns XState v5
**Status** : ✅ **RECHERCHE COMPLÉTÉE**

---

## 📊 SYNTHÈSE RECHERCHE GPT

**Sources analysées** :
- ✅ XState v5 documentation officielle (setup, React integration, TypeScript)
- ✅ React 18 concurrent features (startTransition, useDeferredValue)
- ✅ Three.js material management (emissive colors, performance)
- ✅ Debouncing/throttling strategies comparison
- ✅ Component architecture patterns (Container/Presentational, hooks)

**Toutes les sources** : Voir section "📚 Sources Complètes" en fin de document

---

## ✅ Q1: STATE MACHINE DESIGN - RECOMMANDATION

### **Pattern Recommandé : Option C - Debounced avec états intermédiaires**

**Justification** :
- ✅ **Meilleur équilibre UX vs Performance** : Preview immédiate + application débounced
- ✅ **Logique centralisée** : Debounce dans la machine XState (testable)
- ✅ **Gestion annulation** : Stockage `previousColor` pour undo facile
- ✅ **Performance optimale** : Limite updates à ~10/s au lieu de 60+/s

**Code recommandé** :
```javascript
const colorPickerMachine = setup({
  types: {
    context: {} as {
      selectedColor: number,
      previousColor: number | null,
      previewColor: number
    },
    events: {} as
      | { type: 'COLOR_CHANGED', color: string }
      | { type: 'APPLY_COLOR' }
      | { type: 'CANCEL' }
  }
}).createMachine({
  id: 'bloomColorPicker',
  initial: 'idle',
  context: {
    selectedColor: 0xffffff,
    previousColor: null,
    previewColor: 0xffffff
  },
  states: {
    idle: {
      on: {
        COLOR_CHANGED: {
          target: 'debouncing',
          actions: assign({
            previewColor: ({ event }) => parseInt(event.color.replace('#', ''), 16),
            previousColor: ({ context }) => context.selectedColor
          })
        }
      }
    },
    debouncing: {
      on: {
        COLOR_CHANGED: {
          target: 'debouncing',
          reenter: true,
          actions: assign({
            previewColor: ({ event }) => parseInt(event.color.replace('#', ''), 16)
          })
        },
        CANCEL: {
          target: 'idle',
          actions: assign({
            previewColor: ({ context }) => context.selectedColor
          })
        }
      },
      after: {
        200: { target: 'applying' }
      }
    },
    applying: {
      entry: assign({
        selectedColor: ({ context }) => context.previewColor
      }),
      invoke: {
        src: 'applyColorToMaterials',
        input: ({ context }) => ({ color: context.previewColor }),
        onDone: { target: 'idle' },
        onError: { target: 'error' }
      }
    },
    error: {
      on: {
        COLOR_CHANGED: { target: 'idle' }
      }
    }
  }
});
```

**Avantages** :
- ✅ Preview immédiate (previewColor) - UX fluide
- ✅ Application débounced après 200ms inactivité
- ✅ Annulation possible (CANCEL → previousColor)
- ✅ Gestion erreurs (état error)

**Inconvénients** :
- ❌ Légèrement plus complexe que Pattern A
- ❌ 3 propriétés couleur dans contexte (selected/previous/preview)

**Délai optimal** : **200ms** (compromis entre réactivité et performance)

**Référence** : Stately Blog - Debouncing in XState (https://stately.ai/blog/debounce-in-xstate)

---

## ✅ Q2: REACT 18 + XSTATE V5 INTEGRATION - RECOMMANDATION

### **Pattern Recommandé : Pattern A - useActorRef + useSelector granular**

**Justification** :
- ✅ **Minimal re-renders** : useSelector granulaire (seulement sur changements pertinents)
- ✅ **Performance optimale** : Évite re-render sur TOUT le state
- ✅ **Simplicité** : Pas besoin de Provider global (machine locale suffit)
- ✅ **React 18 compatible** : Pas besoin de startTransition (updates légers)

**Code recommandé** :
```javascript
function BloomColorPicker({ securityManager }) {
  // ✅ Créer actorRef stable
  const actorRef = useActorRef(colorPickerMachine);

  // ✅ Sélections granulaires (re-render seulement si changé)
  const previewColor = useSelector(actorRef, (state) => state.context.previewColor);
  const isApplying = useSelector(actorRef, (state) => state.matches('applying'));
  const isError = useSelector(actorRef, (state) => state.matches('error'));

  // ✅ Callback memoized stable
  const handleColorChange = useCallback((e) => {
    actorRef.send({ type: 'COLOR_CHANGED', color: e.target.value });
  }, [actorRef]);

  const handleCancel = useCallback(() => {
    actorRef.send({ type: 'CANCEL' });
  }, [actorRef]);

  // Conversion hex → HTML pour affichage
  const htmlColor = `#${previewColor.toString(16).padStart(6, '0')}`;

  return (
    <div className="bloom-color-picker">
      <label>Couleur Eye/IRIS Bloom:</label>
      <input
        type="color"
        value={htmlColor}
        onChange={handleColorChange}
        disabled={isApplying}
      />
      {isApplying && <span>Application...</span>}
      {isError && <span className="error">Erreur application couleur</span>}
      <button onClick={handleCancel} disabled={!isApplying}>
        Annuler
      </button>
    </div>
  );
}
```

**Avantages** :
- ✅ Re-renders minimaux (3 useSelector ciblés)
- ✅ Callbacks stables (useCallback)
- ✅ Pas de Provider complexe
- ✅ TypeScript inference automatique

**Inconvénients** :
- ❌ Si besoin partage entre composants → nécessite Provider

**Alternative (si partage global requis)** :
```javascript
// Pattern C : Provider global (si plusieurs composants)
const BloomColorContext = createActorContext(colorPickerMachine);

// App.jsx
<BloomColorContext.Provider>
  <BloomColorPicker />
  <BloomColorDisplay />
</BloomColorContext.Provider>

// BloomColorPicker.jsx
const actorRef = BloomColorContext.useActorRef();
const color = BloomColorContext.useSelector(s => s.context.previewColor);
```

**startTransition non nécessaire** : Color picker updates sont légers (< 16ms)

**Référence** : Stately - React Integration (https://stately.ai/docs/xstate-v5/react)

---

## ✅ Q3: THREE.JS MATERIAL APPLICATION - RECOMMANDATION

### **Pattern Recommandé : Pattern C - Callback vers parent (via SecurityIRISManager)**

**Justification** :
- ✅ **Découplage** : Machine ne manipule pas directement Three.js
- ✅ **Testabilité** : Facile de mocker le callback
- ✅ **Réutilisabilité** : SecurityIRISManager déjà existant
- ✅ **Gestion erreurs** : SecurityIRISManager gère disposed materials

**Code recommandé** :

**Machine XState** :
```javascript
const colorPickerMachine = setup({
  types: {
    context: {} as {
      selectedColor: number,
      onApplyColor: (color: number) => void
    },
    events: {} as { type: 'APPLY_COLOR' }
  },
  actors: {
    applyColor: fromPromise(async ({ input }) => {
      const { color, onApply } = input;
      // Callback vers parent (SecurityIRISManager)
      onApply(color);
      return { success: true };
    })
  }
}).createMachine({
  // ... états
  states: {
    applying: {
      invoke: {
        src: 'applyColor',
        input: ({ context }) => ({
          color: context.selectedColor,
          onApply: context.onApplyColor
        }),
        onDone: { target: 'idle' },
        onError: { target: 'error' }
      }
    }
  }
});
```

**Composant React** :
```javascript
function BloomColorPicker({ securityManager }) {
  // ✅ Créer machine avec callback SecurityIRISManager
  const actorRef = useActorRef(
    colorPickerMachine.provide({
      context: {
        onApplyColor: (color) => {
          // Utilise méthode existante SecurityIRISManager
          securityManager.setCustomColor(color);
        }
      }
    })
  );

  // ... reste du composant
}
```

**Modification SecurityIRISManager** (nouvelle méthode) :
```javascript
// systems/eyeSystems/SecurityIRISManager.js

// ✅ Ajouter après setSecurityState (ligne ~176)
setCustomColor(hexColor) {
  if (typeof hexColor !== 'number' || isNaN(hexColor)) {
    console.warn('SecurityIRISManager: Invalid hex color', hexColor);
    return;
  }

  this.securityObjects.forEach((data) => {
    const { material } = data;

    // ✅ Vérifier material existe et n'est pas disposé
    if (material && material.emissive && !material.isDisposed) {
      try {
        material.emissive.setHex(hexColor);
      } catch (error) {
        console.error('SecurityIRISManager: Error setting color', error);
      }
    }
  });

  // ✅ Stocker état custom
  this.currentState = 'CUSTOM';
  this.customColor = hexColor;
}
```

**Avantages** :
- ✅ Réutilise infrastructure SecurityIRISManager (détection objets)
- ✅ Gestion erreurs centralisée (disposed materials)
- ✅ Machine testable (mock callback)
- ✅ Séparation concerns claire

**Inconvénients** :
- ❌ Dépendance à SecurityIRISManager (mais existe déjà)

**Alternative Pattern B** (si besoin direct) :
```javascript
// Action synchrone directe (plus simple, mais moins découplé)
actions: {
  applyColor: ({ context }) => {
    context.targetMeshes.forEach(mesh => {
      if (mesh.material?.emissive && !mesh.material.isDisposed) {
        mesh.material.emissive.setHex(context.color);
      }
    });
  }
}
```

**Référence** : Three.js Docs - Material.emissive (https://threejs.org/docs/#api/en/materials/Material)

---

## ✅ Q4: COLOR FORMAT CONVERSION - RECOMMANDATION

### **Pattern Recommandé : Pattern B - Utility functions externes + Context unique (hex)**

**Justification** :
- ✅ **Simplicité** : Fonctions pures réutilisables
- ✅ **Performance** : 1 seul format stocké (int hex)
- ✅ **Testabilité** : Fonctions utilitaires testables isolément
- ✅ **Clarté** : Conversion explicite aux frontières (UI ↔ Machine)

**Code recommandé** :

**Utility functions** (nouveau fichier `utils/colorConversion.js`) :
```javascript
/**
 * Convertit couleur HTML (#rrggbb) → Three.js hex (0xrrggbb)
 * @param {string} htmlColor - Format "#ff0000"
 * @returns {number} - Format 0xff0000
 */
export function htmlToHex(htmlColor) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(htmlColor)) {
    console.warn('Invalid HTML color format:', htmlColor);
    return 0xffffff; // Default white
  }
  return parseInt(htmlColor.replace('#', ''), 16);
}

/**
 * Convertit Three.js hex (0xrrggbb) → couleur HTML (#rrggbb)
 * @param {number} hex - Format 0xff0000
 * @returns {string} - Format "#ff0000"
 */
export function hexToHtml(hex) {
  if (typeof hex !== 'number' || isNaN(hex) || hex < 0 || hex > 0xffffff) {
    console.warn('Invalid hex color value:', hex);
    return '#ffffff'; // Default white
  }
  return '#' + hex.toString(16).padStart(6, '0');
}
```

**Machine XState** (stocke seulement hex int) :
```javascript
context: {
  selectedColor: 0xffffff,  // ✅ Format unique: int hex
  previewColor: 0xffffff,
  previousColor: null
},
actions: {
  setPreviewColor: assign({
    previewColor: ({ event }) => htmlToHex(event.color)  // ✅ Conversion à la frontière
  })
}
```

**Composant React** (conversion pour affichage) :
```javascript
import { htmlToHex, hexToHtml } from '../utils/colorConversion';

function BloomColorPicker({ securityManager }) {
  const actorRef = useActorRef(colorPickerMachine);
  const previewColorHex = useSelector(actorRef, s => s.context.previewColor);

  // ✅ Conversion pour <input type="color">
  const htmlColor = hexToHtml(previewColorHex);

  const handleChange = (e) => {
    // ✅ Envoie format HTML, machine convertira
    actorRef.send({ type: 'COLOR_CHANGED', color: e.target.value });
  };

  return <input type="color" value={htmlColor} onChange={handleChange} />;
}
```

**Validation avec Guards** (optionnel, sécurité supplémentaire) :
```javascript
guards: {
  isValidHtmlColor: ({ event }) => {
    return /^#[0-9A-Fa-f]{6}$/.test(event.color);
  }
},
// Usage
on: {
  COLOR_CHANGED: {
    guard: 'isValidHtmlColor',
    target: 'debouncing',
    actions: 'setPreviewColor'
  }
}
```

**Avantages** :
- ✅ 1 seul format stocké (économise mémoire)
- ✅ Fonctions testables unitairement
- ✅ Validation centralisée
- ✅ Conversion explicite (pas de confusion)

**Inconvénients** :
- ❌ Conversion à chaque render (mais très rapide)

**Tests unitaires** :
```javascript
import { htmlToHex, hexToHtml } from './colorConversion';

test('htmlToHex converts correctly', () => {
  expect(htmlToHex('#ff0000')).toBe(0xff0000);
  expect(htmlToHex('#00ff00')).toBe(0x00ff00);
  expect(htmlToHex('#ffffff')).toBe(0xffffff);
});

test('htmlToHex handles invalid input', () => {
  expect(htmlToHex('invalid')).toBe(0xffffff); // Default
  expect(htmlToHex('#gg0000')).toBe(0xffffff);
});

test('hexToHtml converts correctly', () => {
  expect(hexToHtml(0xff0000)).toBe('#ff0000');
  expect(hexToHtml(0x00ff00)).toBe('#00ff00');
  expect(hexToHtml(0xffffff)).toBe('#ffffff');
});
```

**Référence** : Three.js Color conversion (https://threejs.org/docs/#api/en/math/Color)

---

## ✅ Q5: DEBOUNCING STRATEGIES - RECOMMANDATION

### **Pattern Recommandé : Pattern A - after delay avec reenter (dans XState)**

**Justification** :
- ✅ **Logique centralisée** : Debounce dans machine (testable)
- ✅ **Pattern natif XState** : after + reenter
- ✅ **Pas de dépendance** : Pas besoin lodash.debounce
- ✅ **UX optimale** : Preview immédiate + application débounced

**Code recommandé** (déjà intégré dans Q1) :
```javascript
states: {
  debouncing: {
    on: {
      COLOR_CHANGED: {
        target: 'debouncing',
        reenter: true,  // ✅ Reset timer à chaque événement
        actions: 'setPreviewColor'
      }
    },
    after: {
      200: { target: 'applying' }  // ✅ Délai optimal 200ms
    }
  },
  applying: {
    entry: 'applyColor',
    always: 'idle'
  }
}
```

**Délai recommandé** :
- **200ms** : Compromis idéal entre réactivité (perçu immédiat) et performance
- **100ms** : Trop rapide (encore ~10 events/s sur drag lent)
- **300ms** : Perceptible par utilisateur (légère latence)

**Comparaison Throttle vs Debounce** :

| Stratégie | Comportement | Use case |
|-----------|-------------|----------|
| **Debounce** | Attend fin d'activité (200ms silence) | ✅ **Color picker** (capturer couleur finale) |
| **Throttle** | Limite fréquence max (ex. 10/s) | Scrolling, window resize |

**Debounce recommandé** pour color picker car on veut la **couleur finale** choisie, pas les valeurs intermédiaires.

**Preview séparée** :
```javascript
// ✅ Preview immédiate (pas de délai)
actions: {
  setPreviewColor: assign({
    previewColor: ({ event }) => htmlToHex(event.color)
  })
}

// ✅ Application débounced (after 200ms)
states: {
  debouncing: {
    entry: sendTo('previewActor', { type: 'UPDATE_PREVIEW' }),  // Immédiat
    after: { 200: 'applying' }  // Débounced
  }
}
```

**Tests XState** :
```javascript
import { createActor, waitFor } from 'xstate';

test('debounce delays color application', async () => {
  const actor = createActor(colorPickerMachine).start();

  // Envoyer 3 événements rapides
  actor.send({ type: 'COLOR_CHANGED', color: '#ff0000' });
  actor.send({ type: 'COLOR_CHANGED', color: '#00ff00' });
  actor.send({ type: 'COLOR_CHANGED', color: '#0000ff' });

  // ✅ Devrait rester en debouncing
  expect(actor.getSnapshot().matches('debouncing')).toBe(true);

  // ✅ Attendre 200ms → passe à applying
  await waitFor(actor, state => state.matches('applying'));

  // ✅ Couleur finale appliquée (dernière reçue)
  expect(actor.getSnapshot().context.selectedColor).toBe(0x0000ff);
});
```

**Avantages** :
- ✅ Logique testable (XState)
- ✅ Pas de dépendance externe
- ✅ Pattern documenté officiellement

**Inconvénients** :
- ❌ Légèrement plus complexe que debounce React

**Référence** : Stately Blog - Debouncing (https://stately.ai/blog/debounce-in-xstate)

---

## ✅ Q6: COMPONENT ARCHITECTURE - RECOMMANDATION

### **Pattern Recommandé : Pattern C - Custom hook abstraction**

**Justification** :
- ✅ **Meilleur équilibre** : Séparation UI/logic sans verbosité excessive
- ✅ **Réutilisabilité** : Hook partageable entre composants
- ✅ **Testabilité** : Hook + UI testables séparément
- ✅ **Simplicité** : Plus simple que Container/Presentational split

**Code recommandé** :

**Custom Hook** (`hooks/useBloomColorPicker.js`) :
```javascript
import { useActorRef, useSelector } from '@xstate/react';
import { useCallback } from 'react';
import { colorPickerMachine } from '../machines/bloomColorPickerMachine';
import { hexToHtml } from '../utils/colorConversion';

/**
 * Hook custom pour gérer BloomColorPicker
 * @param {Object} securityManager - Instance SecurityIRISManager
 * @returns {Object} { color, isApplying, isError, handleChange, handleCancel }
 */
export function useBloomColorPicker(securityManager) {
  // ✅ Créer actorRef avec callback SecurityIRISManager
  const actorRef = useActorRef(
    colorPickerMachine.provide({
      context: {
        onApplyColor: (color) => securityManager.setCustomColor(color)
      }
    })
  );

  // ✅ Sélections granulaires
  const previewColorHex = useSelector(actorRef, s => s.context.previewColor);
  const isApplying = useSelector(actorRef, s => s.matches('applying'));
  const isError = useSelector(actorRef, s => s.matches('error'));

  // ✅ Conversion pour UI
  const htmlColor = hexToHtml(previewColorHex);

  // ✅ Callbacks stables
  const handleChange = useCallback((e) => {
    actorRef.send({ type: 'COLOR_CHANGED', color: e.target.value });
  }, [actorRef]);

  const handleCancel = useCallback(() => {
    actorRef.send({ type: 'CANCEL' });
  }, [actorRef]);

  return {
    color: htmlColor,
    isApplying,
    isError,
    handleChange,
    handleCancel
  };
}
```

**Composant UI** (`components/BloomColorPicker.jsx`) :
```javascript
import React from 'react';
import { useBloomColorPicker } from '../hooks/useBloomColorPicker';
import './BloomColorPicker.css';

/**
 * Composant BloomColorPicker - Pure UI
 * @param {Object} securityManager - Instance SecurityIRISManager
 */
export function BloomColorPicker({ securityManager }) {
  const {
    color,
    isApplying,
    isError,
    handleChange,
    handleCancel
  } = useBloomColorPicker(securityManager);

  return (
    <div className="bloom-color-picker">
      <label htmlFor="bloom-color">
        🎨 Couleur Eye/IRIS Bloom:
      </label>

      <div className="bloom-color-picker__controls">
        <input
          id="bloom-color"
          type="color"
          value={color}
          onChange={handleChange}
          disabled={isApplying}
          className="bloom-color-picker__input"
        />

        {isApplying && (
          <span className="bloom-color-picker__status">
            ⏳ Application...
          </span>
        )}

        {isError && (
          <span className="bloom-color-picker__error">
            ❌ Erreur application couleur
          </span>
        )}

        <button
          onClick={handleCancel}
          disabled={!isApplying}
          className="bloom-color-picker__cancel"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
```

**Tests** :

**Test Hook** (`hooks/useBloomColorPicker.test.js`) :
```javascript
import { renderHook, act } from '@testing-library/react';
import { useBloomColorPicker } from './useBloomColorPicker';

test('useBloomColorPicker returns color and handlers', () => {
  const mockSecurityManager = {
    setCustomColor: jest.fn()
  };

  const { result } = renderHook(() => useBloomColorPicker(mockSecurityManager));

  expect(result.current.color).toBe('#ffffff'); // Default
  expect(result.current.isApplying).toBe(false);
  expect(typeof result.current.handleChange).toBe('function');
});

test('handleChange updates color', () => {
  const mockSecurityManager = { setCustomColor: jest.fn() };
  const { result } = renderHook(() => useBloomColorPicker(mockSecurityManager));

  act(() => {
    result.current.handleChange({ target: { value: '#ff0000' } });
  });

  // Devrait passer en debouncing
  expect(result.current.isApplying).toBe(false); // Pas encore (debounce 200ms)
});
```

**Test Composant** (`components/BloomColorPicker.test.jsx`) :
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { BloomColorPicker } from './BloomColorPicker';

test('renders color picker input', () => {
  const mockManager = { setCustomColor: jest.fn() };
  render(<BloomColorPicker securityManager={mockManager} />);

  const input = screen.getByLabelText(/Couleur Eye\/IRIS Bloom/i);
  expect(input).toBeInTheDocument();
  expect(input.type).toBe('color');
});

test('calls handleChange on color change', () => {
  const mockManager = { setCustomColor: jest.fn() };
  render(<BloomColorPicker securityManager={mockManager} />);

  const input = screen.getByLabelText(/Couleur Eye\/IRIS Bloom/i);
  fireEvent.change(input, { target: { value: '#ff0000' } });

  // Événement envoyé à la machine
  // (vérifier via mock ou état)
});
```

**Avantages** :
- ✅ Séparation claire UI/logic (hook = logic, component = UI)
- ✅ Hook réutilisable dans plusieurs composants
- ✅ Testabilité excellente (2 niveaux: hook + UI)
- ✅ Pas de verbosité excessive (1 hook + 1 composant)

**Inconvénients** :
- ❌ Légèrement plus de code que Pattern A (direct)

**Alternative Pattern B** (Container/Presentational si besoin extrême séparation) :
```javascript
// Presentational (dumb UI)
function BloomColorPickerUI({ color, onChange, isApplying, onCancel }) {
  return <input type="color" value={color} onChange={onChange} disabled={isApplying} />;
}

// Container (smart logic)
function BloomColorPickerContainer({ securityManager }) {
  const { color, isApplying, handleChange } = useBloomColorPicker(securityManager);
  return <BloomColorPickerUI color={color} onChange={handleChange} isApplying={isApplying} />;
}
```

**Recommandation finale** : **Pattern C (custom hook)** pour équilibre optimal

**Référence** : React Patterns - Custom Hooks (https://react.dev/learn/reusing-logic-with-custom-hooks)

---

## ✅ Q7: TYPESCRIPT TYPING - RECOMMANDATION

### **Pattern Recommandé : Pattern B - External type definitions**

**Justification** :
- ✅ **Clarté** : Types séparés, faciles à documenter
- ✅ **Réutilisabilité** : Types exportables pour autres fichiers
- ✅ **Maintenabilité** : Changements types centralisés
- ✅ **Inference complète** : XState v5 infère tout automatiquement

**Code recommandé** :

**Types** (`machines/bloomColorPickerMachine.types.ts`) :
```typescript
import type { Mesh } from 'three';

/**
 * Contexte BloomColorPicker machine
 */
export type BloomColorPickerContext = {
  /** Couleur sélectionnée (appliquée) - format 0xRRGGBB */
  selectedColor: number;

  /** Couleur précédente (pour annulation) */
  previousColor: number | null;

  /** Couleur preview (pendant drag) - format 0xRRGGBB */
  previewColor: number;

  /** Callback pour appliquer couleur (vers SecurityIRISManager) */
  onApplyColor: (color: number) => void;
};

/**
 * Événements BloomColorPicker machine
 */
export type BloomColorPickerEvent =
  | { type: 'COLOR_CHANGED'; color: string }  // Format HTML "#rrggbb"
  | { type: 'APPLY_COLOR' }
  | { type: 'CANCEL' }
  | { type: 'RESET' };

/**
 * Input pour acteur applyColor
 */
export type ApplyColorInput = {
  color: number;
  onApply: (color: number) => void;
};
```

**Machine XState** (`machines/bloomColorPickerMachine.ts`) :
```typescript
import { setup, assign, fromPromise } from 'xstate';
import type {
  BloomColorPickerContext,
  BloomColorPickerEvent,
  ApplyColorInput
} from './bloomColorPickerMachine.types';
import { htmlToHex } from '../utils/colorConversion';

export const colorPickerMachine = setup({
  types: {
    context: {} as BloomColorPickerContext,
    events: {} as BloomColorPickerEvent
  },

  actors: {
    applyColor: fromPromise<void, ApplyColorInput>(async ({ input }) => {
      const { color, onApply } = input;
      onApply(color);
    })
  },

  actions: {
    setPreviewColor: assign({
      previewColor: ({ event }) => {
        // ✅ Type narrowing automatique (COLOR_CHANGED)
        if (event.type !== 'COLOR_CHANGED') return 0xffffff;
        return htmlToHex(event.color);
      },
      previousColor: ({ context }) => context.selectedColor
    }),

    applySelectedColor: assign({
      selectedColor: ({ context }) => context.previewColor
    }),

    restorePreviousColor: assign({
      previewColor: ({ context }) => context.previousColor ?? context.selectedColor
    })
  },

  guards: {
    isValidHtmlColor: ({ event }) => {
      if (event.type !== 'COLOR_CHANGED') return false;
      return /^#[0-9A-Fa-f]{6}$/.test(event.color);
    }
  }
}).createMachine({
  id: 'bloomColorPicker',
  initial: 'idle',

  context: ({ input }) => ({
    selectedColor: 0xffffff,
    previousColor: null,
    previewColor: 0xffffff,
    onApplyColor: input.onApplyColor ?? (() => {})
  }),

  states: {
    idle: {
      on: {
        COLOR_CHANGED: {
          guard: 'isValidHtmlColor',
          target: 'debouncing',
          actions: 'setPreviewColor'
        }
      }
    },

    debouncing: {
      on: {
        COLOR_CHANGED: {
          guard: 'isValidHtmlColor',
          target: 'debouncing',
          reenter: true,
          actions: 'setPreviewColor'
        },
        CANCEL: {
          target: 'idle',
          actions: 'restorePreviousColor'
        }
      },
      after: {
        200: { target: 'applying' }
      }
    },

    applying: {
      entry: 'applySelectedColor',
      invoke: {
        src: 'applyColor',
        input: ({ context }) => ({
          color: context.previewColor,
          onApply: context.onApplyColor
        }),
        onDone: { target: 'idle' },
        onError: { target: 'error' }
      }
    },

    error: {
      on: {
        COLOR_CHANGED: { target: 'idle' },
        RESET: { target: 'idle' }
      }
    }
  }
});

/**
 * Type utilities pour composants React
 */
export type BloomColorPickerActor = ReturnType<typeof colorPickerMachine.createActor>;
export type BloomColorPickerSnapshot = ReturnType<BloomColorPickerActor['getSnapshot']>;
```

**Usage dans Hook** (`hooks/useBloomColorPicker.ts`) :
```typescript
import { useActorRef, useSelector } from '@xstate/react';
import { useCallback } from 'react';
import { colorPickerMachine } from '../machines/bloomColorPickerMachine';
import type { BloomColorPickerActor } from '../machines/bloomColorPickerMachine';
import { hexToHtml } from '../utils/colorConversion';

export function useBloomColorPicker(onApplyColor: (color: number) => void) {
  // ✅ TypeScript infère actorRef type
  const actorRef: BloomColorPickerActor = useActorRef(
    colorPickerMachine.provide({
      context: { onApplyColor }
    })
  );

  // ✅ useSelector typé automatiquement
  const previewColorHex = useSelector(actorRef, (state) => state.context.previewColor);
  const isApplying = useSelector(actorRef, (state) => state.matches('applying'));
  const isError = useSelector(actorRef, (state) => state.matches('error'));

  const htmlColor = hexToHtml(previewColorHex);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    actorRef.send({ type: 'COLOR_CHANGED', color: e.target.value });
  }, [actorRef]);

  const handleCancel = useCallback(() => {
    actorRef.send({ type: 'CANCEL' });
  }, [actorRef]);

  return {
    color: htmlColor,
    isApplying,
    isError,
    handleChange,
    handleCancel
  };
}
```

**Guards typés (assertEvent)** :
```typescript
import { assertEvent } from 'xstate';

guards: {
  isValidHtmlColor: ({ event }) => {
    // ✅ Type narrowing XState v5
    assertEvent(event, 'COLOR_CHANGED');

    // Maintenant event est typé comme { type: 'COLOR_CHANGED'; color: string }
    return /^#[0-9A-Fa-f]{6}$/.test(event.color);
  }
}
```

**Avantages** :
- ✅ Types documentés et exportables
- ✅ Inference automatique XState v5
- ✅ Facile à maintenir (types centralisés)
- ✅ Auto-complétion VSCode/TypeScript

**Inconvénients** :
- ❌ Fichier supplémentaire (.types.ts)

**Alternative Pattern A** (inline types, plus compact) :
```typescript
const colorPickerMachine = setup({
  types: {
    context: {} as {
      selectedColor: number,
      previousColor: number | null,
      onApplyColor: (color: number) => void
    },
    events: {} as
      | { type: 'COLOR_CHANGED', color: string }
      | { type: 'APPLY_COLOR' }
  }
}).createMachine({ /* ... */ });
```

**Recommandation** : **Pattern B (external types)** pour projets moyens/grands

**Référence** : Stately - TypeScript with XState v5 (https://stately.ai/docs/xstate-v5/typescript)

---

## 📚 SOURCES COMPLÈTES

### **🔵 XState v5**

1. **Stately – Setup API**
   https://stately.ai/docs/xstate-v5/setup
   → Types (context, events, actors)

2. **Stately – React Integration**
   https://stately.ai/docs/xstate-v5/react
   → useMachine, useActorRef, useSelector

3. **Stately – TypeScript**
   https://stately.ai/docs/xstate-v5/typescript
   → Typing patterns, assertEvent

4. **Stately Blog – Debouncing**
   https://stately.ai/blog/debounce-in-xstate
   → after delays, send()

5. **Stately – Actors**
   https://stately.ai/docs/xstate-v5/actors
   → fromPromise, invoke services

### **🟢 React 18**

6. **React – startTransition**
   https://react.dev/reference/react/startTransition
   → Concurrent updates

7. **React – useTransition**
   https://react.dev/reference/react/useTransition
   → Hook concurrent

8. **React – useDeferredValue**
   https://react.dev/reference/react/useDeferredValue
   → Deferred values

### **🟠 Three.js**

9. **Three.js – Color**
   https://threejs.org/docs/#api/en/math/Color
   → setHex, getHex

10. **Three.js – Material**
    https://threejs.org/docs/#api/en/materials/Material
    → emissive property

11. **Three.js Forum – Emissive color**
    https://discourse.threejs.org/t/change-emissive-color/1665
    → Dynamic updates

12. **Three.js Fundamentals – Performance**
    https://threejsfundamentals.org/threejs/lessons/threejs-performance.html
    → Optimization tips

### **🟡 TypeScript + XState**

13. **XState – Type Inference**
    https://stately.ai/docs/xstate-v5/typescript#type-inference
    → ActorRefFrom, EventFromLogic

14. **Stately Blog – Advanced TypeScript**
    https://stately.ai/blog/using-typescript-with-xstate
    → Guards, actions typing

### **🔴 Debouncing/Throttling**

15. **Dev.to – Debounce vs Throttle**
    https://dev.to/namick/debounce-vs-throttle-in-javascript-1j5g
    → Comparison

16. **React-Color GitHub**
    https://github.com/casesandberg/react-color
    → onChangeComplete example

17. **Lodash – debounce**
    https://lodash.com/docs/4.17.15#debounce
    → External debouncing

---

## 🎯 RÉSUMÉ PATTERNS RECOMMANDÉS

| Question | Pattern Recommandé | Justification |
|----------|-------------------|---------------|
| **Q1** | Option C - Debounced états intermédiaires | Équilibre UX/performance, preview immédiate |
| **Q2** | useActorRef + useSelector | Minimal re-renders, simplicité |
| **Q3** | Callback vers SecurityIRISManager | Découplage, réutilise infrastructure |
| **Q4** | Utility functions externes | Fonctions pures, format unique (hex) |
| **Q5** | after delay + reenter (XState) | Logique centralisée, testable |
| **Q6** | Custom hook abstraction | Équilibre séparation/simplicité |
| **Q7** | External type definitions | Clarté, réutilisabilité types |

---

## 🚀 PROCHAINES ÉTAPES

1. ✅ **Recherche complétée**
2. ⏳ **Validation patterns** (discussion user)
3. ⏳ **Création D13 validation**
4. ⏳ **Intégration Plan E** (Phase 4.1)
5. ⏳ **Implémentation code**

**Status** : ✅ Prêt pour validation et intégration
