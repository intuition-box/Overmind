# 🎨 C13 - BLOOMCOLORPICKER PATTERNS XSTATE V5

**Date recherche** : 1 octobre 2025
**Session** : C13 - BloomColorPicker Patterns XState v5
**Objectif** : Patterns optimaux React 18 + XState v5 pour color picker component
**Status** : 🔍 **RECHERCHE REQUISE**

---

## 🎯 CONTEXTE GÉNÉRAL (AUTONOME)

**Besoin** : Créer composant React color picker avec XState v5 state machine

**Contraintes** :
- React 18 (concurrent features)
- XState v5 (setup API)
- Performance critique (minimal re-renders)
- Integration Three.js materials (emissive colors)
- UI responsive (< 16ms updates)

**Architecture souhaitée** :
- Pure React UI component (presentational)
- XState v5 machine pour business logic
- Communication event-driven
- Debouncing pour performance

---

## 🔍 QUESTIONS RECHERCHE

### **Q1: COLOR PICKER STATE MACHINE DESIGN**

**Question** : Quelle architecture state machine optimale pour color picker avec application temps réel ?

**Contexte autonome** :
- Input: HTML `<input type="color">`
- Output: Hex color `0xRRGGBB` appliqué à matériaux Three.js
- Performance: Éviter spam events pendant drag color picker
- UX: Application immédiate vs confirmation button

**Patterns à explorer** :
```javascript
// Option A: État unique avec debouncing
states: {
  idle: {
    on: {
      COLOR_CHANGED: { actions: 'applyColor' } // Direct
    }
  }
}

// Option B: États multiples avec confirmation
states: {
  selecting: {
    on: { COLOR_CHANGED: { actions: 'updatePreview' } }
  },
  previewing: {
    on: {
      APPLY: { target: 'applying' },
      CANCEL: { target: 'selecting' }
    }
  },
  applying: { /* invoke service */ }
}

// Option C: Debounced avec états intermédiaires
states: {
  idle: {},
  selecting: {
    on: {
      COLOR_CHANGED: {
        target: 'debouncing',
        actions: 'updatePreview'
      }
    }
  },
  debouncing: {
    after: {
      300: { target: 'applying' }
    },
    on: {
      COLOR_CHANGED: { target: 'debouncing', reenter: true }
    }
  },
  applying: { /* invoke */ }
}
```

**Questions spécifiques** :
1. Quelle approche pour balance UX réactivité vs performance ?
2. Debouncing dans state machine vs React component ?
3. Preview state nécessaire ou application directe ?
4. Gestion annulation (undo) couleur précédente ?

---

### **Q2: REACT 18 + XSTATE V5 INTEGRATION PATTERNS**

**Question** : Patterns optimaux React 18 hooks avec XState v5 pour color picker ?

**Contexte autonome** :
- XState v5 setup API (createMachine avec setup)
- React 18 concurrent features (startTransition, useDeferredValue)
- Performance: Minimal re-renders sur color changes
- TypeScript typing pour events/context

**Patterns à explorer** :
```javascript
// Pattern A: useActorRef + useSelector granular
function ColorPicker() {
  const actorRef = useActorRef(colorPickerMachine);
  const currentColor = useSelector(actorRef, (state) => state.context.color);

  const handleChange = useCallback((e) => {
    actorRef.send({ type: 'COLOR_CHANGED', color: e.target.value });
  }, [actorRef]);
}

// Pattern B: useMachine local state
function ColorPicker() {
  const [state, send] = useMachine(colorPickerMachine);

  const handleChange = (e) => {
    send({ type: 'COLOR_CHANGED', color: e.target.value });
  };
}

// Pattern C: External actor avec provider
function ColorPicker() {
  const colorActor = useContext(ColorPickerContext);
  const color = useSelector(colorActor, (s) => s.context.color);
}

// Pattern D: React 18 concurrent integration
function ColorPicker() {
  const actorRef = useActorRef(colorPickerMachine);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    startTransition(() => {
      actorRef.send({ type: 'COLOR_CHANGED', color: e.target.value });
    });
  };
}
```

**Questions spécifiques** :
1. useActorRef vs useMachine pour component local state ?
2. useSelector granularity pour éviter re-renders ?
3. startTransition pertinent pour color updates ?
4. Provider pattern nécessaire ou local machine suffisant ?

---

### **Q3: THREE.JS MATERIAL COLOR APPLICATION PATTERNS**

**Question** : Comment architecturer application couleur Three.js materials via XState service ?

**Contexte autonome** :
- Three.js materials: `material.emissive.setHex(0xRRGGBB)`
- Multiple objects: Array de meshes à colorer simultanément
- Performance: Éviter traversals coûteux
- Error handling: Meshes potentiellement disposés

**Patterns à explorer** :
```javascript
// Pattern A: Invoke service pour application async
const colorPickerMachine = setup({
  actors: {
    applyColor: fromPromise(async ({ input }) => {
      const { color, targetObjects } = input;

      targetObjects.forEach(obj => {
        if (obj.material && !obj.material.disposed) {
          obj.material.emissive.setHex(color);
        }
      });

      return { success: true };
    })
  }
}).createMachine({
  states: {
    applying: {
      invoke: {
        src: 'applyColor',
        input: ({ context }) => ({
          color: context.selectedColor,
          targetObjects: context.targets
        }),
        onDone: { target: 'idle' },
        onError: { target: 'error' }
      }
    }
  }
});

// Pattern B: Action directe synchrone
const colorPickerMachine = createMachine({
  states: {
    idle: {
      on: {
        APPLY_COLOR: {
          actions: assign(({ context }) => {
            context.targets.forEach(obj => {
              obj.material.emissive.setHex(context.color);
            });
            return context;
          })
        }
      }
    }
  }
});

// Pattern C: Callback pattern vers parent
const colorPickerMachine = setup({
  types: {
    context: {} as { onApply: (color: number) => void }
  }
}).createMachine({
  context: ({ input }) => ({ onApply: input.onApply }),
  states: {
    idle: {
      on: {
        APPLY: {
          actions: ({ context }) => {
            context.onApply(context.color);
          }
        }
      }
    }
  }
});
```

**Questions spécifiques** :
1. Invoke async vs action sync pour Three.js updates ?
2. Gestion erreurs materials disposés ?
3. Batching updates multiples objects performance ?
4. Callback pattern vs direct material manipulation ?

---

### **Q4: COLOR FORMAT CONVERSION PATTERNS**

**Question** : Patterns conversion couleurs HTML (`#RRGGBB`) ↔ Three.js (`0xRRGGBB`) ?

**Contexte autonome** :
- Input HTML: `<input type="color">` retourne `"#ff0000"`
- Three.js: `material.emissive.setHex(0xff0000)`
- Bidirectionnel: Display couleur actuelle + set nouvelle couleur
- Validation: Formats invalides possibles

**Patterns à explorer** :
```javascript
// Pattern A: Conversion dans actions XState
const colorPickerMachine = setup({
  actions: {
    convertAndApply: assign(({ event }) => ({
      color: parseInt(event.htmlColor.replace('#', ''), 16)
    }))
  }
}).createMachine({
  on: {
    HTML_COLOR_CHANGED: {
      actions: 'convertAndApply'
    }
  }
});

// Pattern B: Utility functions externes
function htmlToHex(htmlColor: string): number {
  return parseInt(htmlColor.replace('#', ''), 16);
}

function hexToHtml(hex: number): string {
  return `#${hex.toString(16).padStart(6, '0')}`;
}

// Pattern C: Guards pour validation
const colorPickerMachine = createMachine({
  on: {
    SET_COLOR: {
      guard: ({ event }) => /^#[0-9A-Fa-f]{6}$/.test(event.color),
      actions: 'applyColor'
    }
  }
});

// Pattern D: Context dual format
context: {
  colorHtml: '#ffffff',
  colorHex: 0xffffff
}
```

**Questions spécifiques** :
1. Conversion dans machine vs composant React ?
2. Stocker format unique ou dual (html+hex) ?
3. Guards pour validation format nécessaires ?
4. Gestion erreurs conversion invalides ?

---

### **Q5: DEBOUNCING STRATEGIES XSTATE V5**

**Question** : Implémentation debouncing optimal XState v5 pour color picker drag ?

**Contexte autonome** :
- Problème: `<input type="color">` drag émet 60+ events/seconde
- Objectif: Limiter application couleur (e.g., max 10/seconde)
- UX: Preview immédiate vs application débounced
- XState: Utiliser after delays ou invoke debounced service ?

**Patterns à explorer** :
```javascript
// Pattern A: after delay avec reenter
const colorPickerMachine = createMachine({
  states: {
    idle: {},
    previewing: {
      on: {
        COLOR_CHANGED: {
          target: 'previewing',
          reenter: true,
          actions: 'updatePreview'
        }
      },
      after: {
        300: { target: 'applying' }
      }
    },
    applying: {
      entry: 'applyColorToMaterials',
      always: { target: 'idle' }
    }
  }
});

// Pattern B: Invoke debounced actor
const debouncedColorActor = fromPromise(async ({ input }) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return input.color;
});

const colorPickerMachine = setup({
  actors: { debouncedColor: debouncedColorActor }
}).createMachine({
  states: {
    debouncing: {
      invoke: {
        src: 'debouncedColor',
        input: ({ event }) => ({ color: event.color }),
        onDone: {
          target: 'applying',
          actions: assign({ color: ({ event }) => event.output })
        }
      }
    }
  }
});

// Pattern C: External debouncing (lodash/React)
function ColorPicker() {
  const actorRef = useActorRef(colorPickerMachine);

  const debouncedSend = useMemo(
    () => debounce((color) => {
      actorRef.send({ type: 'APPLY_COLOR', color });
    }, 300),
    [actorRef]
  );

  const handleChange = (e) => {
    debouncedSend(e.target.value);
  };
}

// Pattern D: Throttling instead of debouncing
const colorPickerMachine = createMachine({
  context: { lastUpdate: 0 },
  on: {
    COLOR_CHANGED: {
      guard: ({ context }) => Date.now() - context.lastUpdate > 100,
      actions: [
        'applyColor',
        assign({ lastUpdate: Date.now() })
      ]
    }
  }
});
```

**Questions spécifiques** :
1. Debouncing dans machine (after) vs React (useMemo) ?
2. Throttling vs debouncing pour UX color picker ?
3. Preview immédiate séparée d'application debounced ?
4. Delay optimal (100ms? 300ms? adaptive?) ?

---

### **Q6: COMPONENT ARCHITECTURE PURE UI + XSTATE**

**Question** : Séparation optimale concerns Pure UI React + XState business logic ?

**Contexte autonome** :
- Principe: React = pure presentational, XState = business logic
- Challenge: Équilibrer simplicité vs over-engineering
- Performance: Minimal re-renders sur state changes
- Testability: Unit test machine séparément de UI

**Patterns à explorer** :
```javascript
// Pattern A: Pure UI wrapper autour machine
// Machine (business logic)
const colorPickerMachine = setup({ /* ... */ }).createMachine({ /* ... */ });

// Component (pure UI)
function ColorPicker({ actorRef }) {
  const color = useSelector(actorRef, (s) => s.context.color);
  const isApplying = useSelector(actorRef, (s) => s.matches('applying'));

  return (
    <input
      type="color"
      value={color}
      onChange={(e) => actorRef.send({ type: 'COLOR_CHANGED', color: e.target.value })}
      disabled={isApplying}
    />
  );
}

// Pattern B: Container/Presentational split
// Presentational (dumb)
function ColorPickerUI({ color, onChange, disabled }) {
  return <input type="color" value={color} onChange={onChange} disabled={disabled} />;
}

// Container (smart)
function ColorPickerContainer() {
  const actorRef = useActorRef(colorPickerMachine);
  const color = useSelector(actorRef, (s) => s.context.color);
  const disabled = useSelector(actorRef, (s) => s.matches('applying'));

  return (
    <ColorPickerUI
      color={color}
      onChange={(e) => actorRef.send({ type: 'COLOR_CHANGED', color: e.target.value })}
      disabled={disabled}
    />
  );
}

// Pattern C: Custom hook abstraction
function useColorPicker(actorRef) {
  const color = useSelector(actorRef, (s) => s.context.color);
  const isApplying = useSelector(actorRef, (s) => s.matches('applying'));

  const handleChange = useCallback((htmlColor) => {
    actorRef.send({ type: 'COLOR_CHANGED', color: htmlColor });
  }, [actorRef]);

  return { color, isApplying, handleChange };
}

function ColorPicker({ actorRef }) {
  const { color, isApplying, handleChange } = useColorPicker(actorRef);

  return (
    <input type="color" value={color} onChange={(e) => handleChange(e.target.value)} disabled={isApplying} />
  );
}

// Pattern D: Render props
function ColorPickerMachine({ children }) {
  const actorRef = useActorRef(colorPickerMachine);
  const state = useSelector(actorRef, (s) => s);

  return children({ state, send: actorRef.send });
}

// Usage
<ColorPickerMachine>
  {({ state, send }) => (
    <input
      type="color"
      value={state.context.color}
      onChange={(e) => send({ type: 'COLOR_CHANGED', color: e.target.value })}
    />
  )}
</ColorPickerMachine>
```

**Questions spécifiques** :
1. Quelle granularité séparation UI/logic ?
2. Custom hooks vs Container/Presentational ?
3. Render props vs direct integration ?
4. Performance implications chaque pattern ?

---

### **Q7: TYPESCRIPT TYPING XSTATE V5 COLOR PICKER**

**Question** : Patterns TypeScript typing optimal XState v5 setup API ?

**Contexte autonome** :
- XState v5 setup avec types inference
- Events typés strictement
- Context typing avec constraints
- Actor typing pour invoke services

**Patterns à explorer** :
```javascript
// Pattern A: Inline types avec setup
const colorPickerMachine = setup({
  types: {
    context: {} as {
      selectedColor: number,
      previousColor: number | null,
      targetObjects: THREE.Mesh[]
    },
    events: {} as
      | { type: 'COLOR_CHANGED', color: string }
      | { type: 'APPLY_COLOR' }
      | { type: 'CANCEL' }
      | { type: 'RESET' }
  },
  actions: { /* ... */ },
  actors: { /* ... */ }
}).createMachine({
  // Type inference automatique
});

// Pattern B: External type definitions
type ColorPickerContext = {
  selectedColor: number;
  previousColor: number | null;
  targetObjects: THREE.Mesh[];
};

type ColorPickerEvents =
  | { type: 'COLOR_CHANGED'; color: string }
  | { type: 'APPLY_COLOR' }
  | { type: 'CANCEL' }
  | { type: 'RESET' };

const colorPickerMachine = setup({
  types: {
    context: {} as ColorPickerContext,
    events: {} as ColorPickerEvents
  }
}).createMachine({ /* ... */ });

// Pattern C: Generic machine factory
function createColorPickerMachine<T extends THREE.Mesh>(
  config: { onApply: (color: number, objects: T[]) => void }
) {
  return setup({
    types: {
      context: {} as { targets: T[], color: number },
      events: {} as { type: 'APPLY', color: number }
    }
  }).createMachine({ /* ... */ });
}

// Pattern D: Strict event guards typing
const colorPickerMachine = setup({
  types: {
    events: {} as ColorPickerEvents
  },
  guards: {
    isValidColor: ({ event }) => {
      // Type narrowing automatique
      if (event.type === 'COLOR_CHANGED') {
        return /^#[0-9A-Fa-f]{6}$/.test(event.color);
      }
      return false;
    }
  }
}).createMachine({ /* ... */ });
```

**Questions spécifiques** :
1. Inline types vs external type definitions ?
2. Generic machine factory pertinent ?
3. Type inference limitations XState v5 ?
4. Typing actors/services invoked ?

---

## 🎯 OBJECTIFS RECHERCHE

**Patterns à identifier** :
1. ✅ State machine design optimal color picker temps réel
2. ✅ React 18 + XState v5 integration patterns
3. ✅ Three.js material application architecture
4. ✅ Color format conversion strategies
5. ✅ Debouncing implementation XState vs React
6. ✅ Component architecture pure UI separation
7. ✅ TypeScript typing XState v5 setup API

**Livrables attendus** :
- Patterns recommandés pour chaque question
- Comparaison avantages/inconvénients patterns
- Exemples code concrets implémentation
- Performance considerations
- Best practices XState v5 + React 18

---

## 📊 MÉTHODOLOGIE RECHERCHE

**Sources suggérées** :
1. XState v5 documentation officielle (setup API, patterns)
2. React 18 concurrent features integration
3. Three.js material management best practices
4. Color conversion algorithms standards
5. Debouncing/throttling performance patterns
6. Component architecture React best practices
7. TypeScript XState v5 typing examples

**Format réponses** :
- ✅ Code examples concrets
- ✅ Comparaisons patterns (pros/cons)
- ✅ Performance implications
- ✅ Use cases recommandations
- ✅ Références documentation

---

## 🚀 UTILISATION RÉSULTATS

**Destination** : Construction BloomColorPicker component (Phase 4.1 Features)

**Critères décision** :
- Performance: < 16ms UI updates, minimal re-renders
- Maintenabilité: Séparation claire UI/logic
- Testabilité: Unit tests machine isolés
- Scalabilité: Extension future (undo/redo, presets, etc.)

**Validation** :
- [ ] Patterns identifiés pour 7 questions
- [ ] Code examples fournis
- [ ] Recommandations justifiées
- [ ] Performance analysée
