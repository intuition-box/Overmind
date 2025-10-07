# 🎨 SESSION E13 - BLOOMCOLORPICKER PLAN CONSTRUCTION

**Date** : 1 octobre 2025
**Phase** : E - Plan Construction
**Focus** : Plan construction détaillé BloomColorPicker XState v5 (Phase 4.1 Features)
**Criticité** : HAUTE

---

## 🎯 OBJECTIF SESSION E13

**Mission** : Élaborer le **plan de construction complet** du composant BloomColorPicker pour Phase 4.1 Features, avec timeline, dépendances, étapes détaillées et critères de succès.

**Rappel contexte** :
- ✅ Phase 3 recherche complétée (C13 patterns + D13 validation)
- ✅ Patterns XState v5 validés (93% confiance)
- ✅ Performance confirmée (92% CPU reduction)
- ✅ Architecture approuvée (custom hook + useSelector)
- ⏳ Implémentation Phase 4.1 (semaines 17-18)

---

## 📋 PLACEMENT DANS PHASE E01

### **INTÉGRATION PHASE 4.1 - DEBUG PANEL ACTOR-DRIVEN**

**Référence E01** : Ligne 594-624 - Phase 4.1 Features

```javascript
// E01_PHASE_PLANNING ligne 594-624
const phase4_1 = {
  target: "Debug Panel unified Actor-driven",

  features: [
    "Animation controls (29 animations)",
    "Bloom effects configuration",  // ← BLOOMCOLORPICKER ICI
    "Lighting PBR controls",
    "Performance metrics display",
    "LOD level visualization"
  ],

  priority: "HAUTE",

  uiPatterns: {
    architecture: "Pure React UI + Actor state",
    hooks: "useActorRef selective subscriptions",
    updates: "Event-driven state changes",
    performance: "Minimal re-renders optimized"
  }
};
```

**BloomColorPicker = sous-feature "Bloom effects configuration"**

**Timeline Phase 4.1** : Semaines 17-18 (après Phases 1-3 complétées)

---

## 🗓️ TIMELINE CONSTRUCTION DÉTAILLÉE

### **PHASE 4.1a - FONDATIONS (2 jours)**

**Semaine 17, jours 1-2**

**Objectif** : Créer fondations (utils conversion + types TypeScript)

**Livrables** :

1. **utils/colorConversion.js** (~20 lignes)
```javascript
/**
 * Conversion couleurs HTML ↔ Three.js hex
 */
export function htmlToHex(htmlColor) {
  if (!/^#[0-9A-Fa-f]{6}$/.test(htmlColor)) {
    console.warn('Invalid HTML color:', htmlColor);
    return 0xffffff;
  }
  return parseInt(htmlColor.replace('#', ''), 16);
}

export function hexToHtml(hex) {
  if (typeof hex !== 'number' || isNaN(hex) || hex < 0 || hex > 0xffffff) {
    console.warn('Invalid hex color:', hex);
    return '#ffffff';
  }
  return '#' + hex.toString(16).padStart(6, '0');
}
```

2. **machines/bloomColorPickerMachine.types.ts** (~30 lignes)
```typescript
import type { Mesh } from 'three';

export type BloomColorPickerContext = {
  selectedColor: number;
  previousColor: number | null;
  previewColor: number;
  onApplyColor: (color: number) => void;
};

export type BloomColorPickerEvent =
  | { type: 'COLOR_CHANGED'; color: string }
  | { type: 'APPLY_COLOR' }
  | { type: 'CANCEL' }
  | { type: 'RESET' };

export type ApplyColorInput = {
  color: number;
  onApply: (color: number) => void;
};
```

3. **Tests** : utils/colorConversion.test.js (~50 lignes)
```javascript
describe('colorConversion', () => {
  test('htmlToHex converts valid colors', () => {
    expect(htmlToHex('#ff0000')).toBe(0xff0000);
    expect(htmlToHex('#00ff00')).toBe(0x00ff00);
  });

  test('htmlToHex handles invalid input', () => {
    expect(htmlToHex('invalid')).toBe(0xffffff);
  });

  test('round-trip conversion', () => {
    const original = '#ff8800';
    expect(hexToHtml(htmlToHex(original))).toBe(original);
  });
});
```

**Temps estimé** : 4-6 heures
**Dépendances** : Aucune
**Success criteria** :
- [ ] Fonctions conversion créées
- [ ] Tests passent (100% coverage)
- [ ] Types TypeScript définis
- [ ] Documentation JSDoc complète

---

### **PHASE 4.1b - MACHINE XSTATE (2 jours)**

**Semaine 17, jours 3-4**

**Objectif** : Créer machine XState v5 avec debounce pattern

**Livrables** :

1. **machines/bloomColorPickerMachine.ts** (~80 lignes)
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
```

2. **Tests** : machines/bloomColorPickerMachine.test.ts (~100 lignes)
```typescript
import { createActor, waitFor } from 'xstate';
import { colorPickerMachine } from './bloomColorPickerMachine';

describe('bloomColorPickerMachine', () => {
  test('debounces color changes', async () => {
    const mockApply = jest.fn();
    const actor = createActor(
      colorPickerMachine.provide({
        context: { onApplyColor: mockApply }
      })
    ).start();

    // Send 3 rapid events
    actor.send({ type: 'COLOR_CHANGED', color: '#ff0000' });
    actor.send({ type: 'COLOR_CHANGED', color: '#00ff00' });
    actor.send({ type: 'COLOR_CHANGED', color: '#0000ff' });

    // Should be in debouncing
    expect(actor.getSnapshot().matches('debouncing')).toBe(true);

    // Wait for apply
    await waitFor(actor, (state) => state.matches('idle'));

    // Only last color applied
    expect(mockApply).toHaveBeenCalledTimes(1);
    expect(mockApply).toHaveBeenCalledWith(0x0000ff);
  });

  test('cancel restores previous color', () => {
    const actor = createActor(colorPickerMachine).start();

    actor.send({ type: 'COLOR_CHANGED', color: '#ff0000' });
    actor.send({ type: 'CANCEL' });

    expect(actor.getSnapshot().context.previewColor).toBe(0xffffff);
  });
});
```

**Temps estimé** : 6-8 heures
**Dépendances** : Phase 4.1a (utils + types)
**Success criteria** :
- [ ] Machine états fonctionnels (idle/debouncing/applying/error)
- [ ] Debounce 200ms validé
- [ ] Tests machine passent
- [ ] Guards validation correcte

---

### **PHASE 4.1c - REACT INTEGRATION (2 jours)**

**Semaine 18, jours 1-2**

**Objectif** : Créer custom hook + composant UI React

**Livrables** :

1. **hooks/useBloomColorPicker.ts** (~50 lignes)
```typescript
import { useActorRef, useSelector } from '@xstate/react';
import { useCallback } from 'react';
import { colorPickerMachine } from '../machines/bloomColorPickerMachine';
import { hexToHtml } from '../utils/colorConversion';

export function useBloomColorPicker(onApplyColor: (color: number) => void) {
  const actorRef = useActorRef(
    colorPickerMachine.provide({
      context: { onApplyColor }
    })
  );

  const previewColorHex = useSelector(actorRef, (s) => s.context.previewColor);
  const isApplying = useSelector(actorRef, (s) => s.matches('applying'));
  const isError = useSelector(actorRef, (s) => s.matches('error'));

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

2. **components/BloomColorPicker.jsx** (~40 lignes)
```jsx
import React from 'react';
import { useBloomColorPicker } from '../hooks/useBloomColorPicker';
import './BloomColorPicker.css';

export function BloomColorPicker({ securityManager }) {
  const {
    color,
    isApplying,
    isError,
    handleChange,
    handleCancel
  } = useBloomColorPicker((color) => {
    securityManager.setCustomColor(color);
  });

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
            ❌ Erreur application
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

3. **Tests** : hooks/useBloomColorPicker.test.ts + components/BloomColorPicker.test.jsx (~100 lignes)

**Temps estimé** : 6-8 heures
**Dépendances** : Phase 4.1b (machine)
**Success criteria** :
- [ ] Hook retourne color/handlers
- [ ] Composant render correct
- [ ] Re-renders minimaux (useSelector)
- [ ] Tests hook + composant passent

---

### **PHASE 4.1d - SECURITYIRISMANAGER MODIFICATION (1 jour)**

**Semaine 18, jour 3**

**Objectif** : Ajouter méthode setCustomColor dans SecurityIRISManager

**Livrables** :

1. **systems/eyeSystems/SecurityIRISManager.js** (modification ligne ~176)
```javascript
/**
 * Applique couleur custom (libre) aux objets Eye/IRIS
 * @param {number} hexColor - Couleur hex (ex: 0xff0000)
 */
setCustomColor(hexColor) {
  // Validation
  if (typeof hexColor !== 'number' || isNaN(hexColor)) {
    console.warn('SecurityIRISManager: Invalid hex color', hexColor);
    return;
  }

  // Application avec gestion erreurs
  this.securityObjects.forEach((data) => {
    const { material } = data;

    if (material && material.emissive) {
      try {
        material.emissive.setHex(hexColor);
      } catch (error) {
        console.error('SecurityIRISManager: Error setting color', error);
      }
    }
  });

  // État custom
  this.currentState = 'CUSTOM';
  this.customColor = hexColor;

  console.log(`SecurityIRISManager: Custom color applied 0x${hexColor.toString(16)}`);
}
```

2. **Tests** : systems/eyeSystems/SecurityIRISManager.test.js
```javascript
describe('SecurityIRISManager.setCustomColor', () => {
  test('applies valid hex color', () => {
    const manager = new SecurityIRISManager();
    const mockMaterial = { emissive: { setHex: jest.fn() } };
    manager.securityObjects.set('test', { material: mockMaterial });

    manager.setCustomColor(0xff0000);

    expect(mockMaterial.emissive.setHex).toHaveBeenCalledWith(0xff0000);
    expect(manager.currentState).toBe('CUSTOM');
  });

  test('handles invalid color', () => {
    const manager = new SecurityIRISManager();
    const consoleSpy = jest.spyOn(console, 'warn');

    manager.setCustomColor(NaN);

    expect(consoleSpy).toHaveBeenCalled();
  });
});
```

**Temps estimé** : 3-4 heures
**Dépendances** : Aucune (modification isolée)
**Success criteria** :
- [ ] Méthode setCustomColor ajoutée
- [ ] Gestion erreurs complète
- [ ] Tests passent
- [ ] Pas de breaking changes

---

### **PHASE 4.1e - INTEGRATION DEBUGPANEL (2 jours)**

**Semaine 18, jours 4-5**

**Objectif** : Intégrer BloomColorPicker dans DebugPanel

**Livrables** :

1. **components/DebugPanel.jsx** (modification section Security/IRIS)
```jsx
import { BloomColorPicker } from './BloomColorPicker';

// Dans DebugPanel render (ligne ~XXX)
<div className="debug-panel__section">
  <h3>🔒 Security / IRIS Colors</h3>

  {/* Presets existants (optionnel garde) */}
  <div className="security-presets">
    {Object.entries(SECURITY_PRESETS).map(([key, preset]) => (
      <button
        key={key}
        onClick={() => handleSecurityPreset(key)}
        className="security-preset-btn"
      >
        {preset.description}
      </button>
    ))}
  </div>

  {/* ✅ NOUVEAU : BloomColorPicker */}
  <BloomColorPicker securityManager={securityManagerRef.current} />
</div>
```

2. **Tests integration** : BloomColorPicker.integration.test.js
```javascript
describe('BloomColorPicker integration', () => {
  test('applies color to SecurityIRISManager', async () => {
    const manager = new SecurityIRISManager();
    const mockMaterial = { emissive: { setHex: jest.fn() } };
    manager.securityObjects.set('test', { material: mockMaterial });

    render(<BloomColorPicker securityManager={manager} />);

    const input = screen.getByLabelText(/Couleur Eye/);
    fireEvent.change(input, { target: { value: '#ff0000' } });

    // Wait debounce 200ms
    await waitFor(() => {
      expect(mockMaterial.emissive.setHex).toHaveBeenCalledWith(0xff0000);
    }, { timeout: 300 });
  });
});
```

3. **Documentation** : components/BloomColorPicker.md
```markdown
# BloomColorPicker Component

## Usage
```jsx
<BloomColorPicker securityManager={securityManagerRef.current} />
```

## Props
- `securityManager` (SecurityIRISManager) - Instance manager Eye/IRIS

## Features
- Color picker libre (HTML5 input color)
- Debounce 200ms (performance optimisée)
- Cancel/undo couleur précédente
- État applying/error
```

**Temps estimé** : 6-8 heures
**Dépendances** : Phases 4.1a-d complètes
**Success criteria** :
- [ ] BloomColorPicker intégré DebugPanel
- [ ] SecurityIRISManager passé en prop
- [ ] Tests integration passent
- [ ] Documentation complète

---

## 📊 DÉPENDANCES ET PRÉREQUIS

### **DÉPENDANCES EXTERNES**

```javascript
const dependencies = {
  xstate: "^5.0.0",           // Machine XState v5
  "@xstate/react": "^4.0.0",  // Hooks React
  "three": "^0.158.0",        // Three.js (déjà présent)
  "react": "^18.0.0",         // React 18 (déjà présent)
  "typescript": "^5.0.0"      // TypeScript (déjà présent)
};

const devDependencies = {
  "@testing-library/react": "^14.0.0",
  "@testing-library/react-hooks": "^8.0.0",
  "jest": "^29.0.0"
};
```

### **DÉPENDANCES INTERNES**

| Fichier | Dépend de | Raison |
|---------|-----------|--------|
| `bloomColorPickerMachine.ts` | `colorConversion.js` | Conversion HTML→hex |
| `useBloomColorPicker.ts` | `bloomColorPickerMachine.ts` | Machine XState |
| `BloomColorPicker.jsx` | `useBloomColorPicker.ts` | Custom hook |
| `DebugPanel.jsx` | `BloomColorPicker.jsx` | Integration UI |
| `DebugPanel.jsx` | `SecurityIRISManager.js` | Ref manager |

### **PRÉREQUIS PHASES CONSTRUCTION**

- ✅ **Phase 1 Foundation** : Actor system operational (semaines 1-6)
- ✅ **Phase 2 God Objects** : SceneStateController décomposé (semaines 7-12)
- ✅ **Phase 3 Performance** : Rendering optimisé (semaines 13-16)
- ⏳ **Phase 4.1** : Debug Panel Actor-driven (semaines 17-18) ← **BLOOMCOLORPICKER ICI**

---

## 🎯 SUCCESS CRITERIA

### **FUNCTIONALITY**

- [ ] Color picker affiche couleur actuelle Eye/IRIS
- [ ] Drag color picker applique couleur temps réel
- [ ] Debounce 200ms limite updates à ~5/s
- [ ] Cancel restaure couleur précédente
- [ ] Gestion erreurs materials disposed
- [ ] États applying/error affichés correctement

### **PERFORMANCE**

- [ ] Re-renders < 10 pendant drag rapide (60 events/s)
- [ ] CPU usage < 10% pendant drag
- [ ] Latency perçue < 200ms (imperceptible)
- [ ] Memory stable (pas de leaks)
- [ ] 92% réduction CPU vs sans debounce

### **QUALITY**

- [ ] Test coverage > 80%
  - [ ] Utils conversion 100%
  - [ ] Machine XState 90%+
  - [ ] Hook 80%+
  - [ ] Composant 80%+
  - [ ] Integration 70%+
- [ ] TypeScript 0 errors
- [ ] ESLint 0 warnings
- [ ] Accessibility score > 90% (WCAG 2.1 AA)

### **INTEGRATION**

- [ ] Intégré DebugPanel section Security/IRIS
- [ ] Compatible avec presets existants (coexistence)
- [ ] Pas de breaking changes features existantes
- [ ] Documentation API complète
- [ ] Storybook stories (optionnel)

---

## ⚠️ RISQUES ET MITIGATION

### **RISQUE 1 : Délai 200ms trop lent utilisateur**

**Probabilité** : Faible (15%)
**Impact** : Moyen (frustration utilisateur)

**Mitigation** :
- Config délai ajustable via context
- Analytics mesure comportement utilisateur
- A/B testing 150ms vs 200ms vs 250ms
- Feedback visuel preview immédiate

**Plan B** :
```typescript
// Context config tunable
context: {
  debounceDelay: input.debounceDelay ?? 200, // Default 200ms
}

// Adaptive debounce
after: {
  [context.debounceDelay]: { target: 'applying' }
}
```

---

### **RISQUE 2 : SecurityIRISManager modification casse existant**

**Probabilité** : Très faible (5%)
**Impact** : Haut (breaking change)

**Mitigation** :
- Tests regression complets presets existants
- Méthode setCustomColor isolée (pas de modification existantes)
- Feature flag `enableCustomColors` pour rollback
- Validation manuelle presets SAFE/DANGER/WARNING

**Plan B** :
```javascript
// Feature flag
if (this.options.enableCustomColors) {
  this.setCustomColor(hexColor);
} else {
  console.warn('Custom colors disabled');
}
```

---

### **RISQUE 3 : Performance Three.js updates dégradée**

**Probabilité** : Très faible (5%)
**Impact** : Moyen (latency visible)

**Mitigation** :
- Profiling Chrome DevTools pendant drag
- Benchmark performance avant/après
- Debounce validé (92% CPU reduction confirmé)
- Fallback throttle si debounce insuffisant

**Validation** :
```javascript
// Performance benchmark
const performanceTest = {
  before: "60+ material.emissive.setHex/s",
  after: "~5 material.emissive.setHex/s",
  cpuReduction: "92%",
  validated: true
};
```

---

### **RISQUE 4 : TypeScript complexité courbe apprentissage**

**Probabilité** : Faible (10%)
**Impact** : Faible (ralentissement dev)

**Mitigation** :
- Documentation types complète (JSDoc)
- Exemples code commentés
- Types externes (réutilisables)
- Support IDE IntelliSense complet

**Ressources** :
- XState v5 TypeScript docs (officiel)
- Code review patterns TypeScript
- Pair programming sessions

---

## 📈 MÉTRIQUES TRACKING

### **DEVELOPMENT METRICS**

```javascript
const developmentMetrics = {
  velocity: {
    planned: "9 jours (phases 4.1a-e)",
    actual: "TBD",
    variance: "TBD"
  },

  codeQuality: {
    linesAdded: "~320 lignes (total)",
    linesModified: "~20 lignes (DebugPanel + SecurityIRISManager)",
    testCoverage: "Target >80%",
    typeScriptErrors: "Target 0"
  },

  performance: {
    cpuReduction: "Target 92%",
    rerenderReduction: "Target 92%",
    latency: "Target <200ms",
    memoryOverhead: "Target <100KB"
  }
};
```

### **QUALITY METRICS**

| Métrique | Target | Mesure | Status |
|----------|--------|--------|--------|
| Test coverage | >80% | TBD | ⏳ |
| TypeScript errors | 0 | TBD | ⏳ |
| ESLint warnings | 0 | TBD | ⏳ |
| Accessibility score | >90% | TBD | ⏳ |
| CPU reduction | 92% | TBD | ⏳ |
| Re-render reduction | 92% | TBD | ⏳ |

---

## 🚀 ROLLOUT STRATEGY

### **STAGED DEPLOYMENT**

**Phase 1 : Development** (Semaines 17-18)
- Feature branch `feature/bloomcolorpicker`
- Development environment testing
- Code review + validation patterns

**Phase 2 : Testing** (Fin semaine 18)
- Staging environment deployment
- Integration tests DebugPanel
- Performance profiling Chrome DevTools
- Accessibility audit WCAG 2.1

**Phase 3 : Production** (Début Phase 5)
- Feature flag `enableBloomColorPicker: false` (default)
- Canary release 5% utilisateurs
- A/B testing vs presets existants
- Monitoring metrics performance

**Phase 4 : Full Rollout** (Phase 5 Polish)
- Feature flag `enableBloomColorPicker: true`
- Deprecation warning presets (si applicable)
- Documentation utilisateur finale
- Training team

### **FEATURE FLAG CONFIGURATION**

```javascript
// config/features.js
export const FEATURES = {
  bloomColorPicker: {
    enabled: process.env.ENABLE_BLOOM_COLOR_PICKER === 'true',
    debounceDelay: parseInt(process.env.BLOOM_DEBOUNCE_DELAY) || 200,
    showPresets: true, // Coexistence presets + custom
  }
};

// Usage DebugPanel
{FEATURES.bloomColorPicker.enabled && (
  <BloomColorPicker securityManager={securityManagerRef.current} />
)}
```

---

## 📚 DOCUMENTATION REQUISE

### **CODE DOCUMENTATION**

- [ ] JSDoc functions utils/colorConversion.js
- [ ] TypeScript types machines/bloomColorPickerMachine.types.ts
- [ ] Machine states/events/actions documentation
- [ ] Hook API useBloomColorPicker
- [ ] Component props BloomColorPicker
- [ ] SecurityIRISManager.setCustomColor method

### **USER DOCUMENTATION**

- [ ] BloomColorPicker usage guide
- [ ] Color picker UX best practices
- [ ] Troubleshooting guide (errors, performance)
- [ ] Migration guide (presets → custom colors)

### **DEVELOPER DOCUMENTATION**

- [ ] Architecture decision record (ADR)
- [ ] XState v5 patterns guide
- [ ] Testing strategy document
- [ ] Performance optimization notes

---

## 🎓 TEAM TRAINING

### **REQUIRED KNOWLEDGE**

**XState v5** :
- Setup API (`setup({ types, actions, actors })`)
- State machine design (states, transitions, guards)
- Actor patterns (invoke, fromPromise)
- React integration (useActorRef, useSelector)

**React 18** :
- Custom hooks patterns
- useCallback/useMemo optimization
- Performance profiling tools
- Concurrent features (awareness)

**TypeScript** :
- Type inference XState v5
- Discriminated unions (events)
- Generic types (machines)
- External type definitions

### **TRAINING RESOURCES**

- [ ] XState v5 documentation officielle (1h lecture)
- [ ] Code walkthrough BloomColorPicker (30min)
- [ ] Pair programming session (2h hands-on)
- [ ] Testing workshop XState (1h)

---

## 📊 RÉSUMÉ PLAN CONSTRUCTION

### **TIMELINE TOTAL : 9 JOURS (Semaines 17-18)**

| Phase | Durée | Dépendances | Criticité |
|-------|-------|-------------|-----------|
| **4.1a Fondations** | 2 jours | Aucune | HAUTE |
| **4.1b Machine XState** | 2 jours | 4.1a | HAUTE |
| **4.1c React Integration** | 2 jours | 4.1b | HAUTE |
| **4.1d SecurityIRISManager** | 1 jour | Aucune | MOYENNE |
| **4.1e Integration DebugPanel** | 2 jours | 4.1a-d | HAUTE |

### **LIVRABLES TOTAUX**

**Code** :
- 6 fichiers créés (~320 lignes)
- 2 fichiers modifiés (~20 lignes)
- 5 test suites (~300 lignes tests)

**Documentation** :
- 4 documents techniques
- 1 guide utilisateur
- 1 ADR (Architecture Decision Record)

**Validation** :
- Test coverage >80%
- Performance 92% CPU reduction
- TypeScript 0 errors
- Accessibility >90%

### **CONFIANCE PLAN : 95%**

**Justification** :
- ✅ Patterns validés techniquement (D13: 93%)
- ✅ Timeline réaliste (9 jours = ~70h)
- ✅ Dépendances claires
- ✅ Risques identifiés + mitigation
- ✅ Success criteria mesurables

---

**SESSION E13 TERMINÉE** ✅

**Plan construction** : BloomColorPicker **COMPLET ET ACTIONABLE**

**Prêt pour** : Implémentation Phase 4.1 (après Phases 1-3)

**Prochaine** : Mise à jour MEMO_OVERMIND avec Phase 3 complétée
