# 🔄 F03 - STATE MANAGEMENT FINAL - VISION CIBLE

**Date** : 2 octobre 2025
**Phase** : F - Vision Cible
**Session** : F03 - Gestion État Finale
**Statut** : ✅ COMPLET

---

## 📋 VUE D'ENSEMBLE

La **gestion d'état finale** combine **XState v5** (business logic, async operations) avec **Zustand** (UI state rapide) et **React Context** (dependency injection). Architecture hybride optimale pour performance et DX.

### **Architecture State Management**

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT COMPONENTS                         │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
         ↓           ↓           ↓
    ┌────────┐  ┌────────┐  ┌──────────┐
    │ XState │  │Zustand │  │  React   │
    │   v5   │  │        │  │ Context  │
    └────────┘  └────────┘  └──────────┘
         │           │           │
         │           │           │
    Business     UI State    Dependency
     Logic       Rapide      Injection
```

---

## 🎯 XSTATE V5 - BUSINESS LOGIC

### **Responsabilité**

- ✅ Business logic complexe (transitions, validations)
- ✅ Async operations (API, Three.js, I/O)
- ✅ State machines (états finis, guards, actions)
- ✅ Actor model (communication inter-actors)
- ✅ Services (fromPromise)

### **Ce qui va dans XState**

```typescript
// ✅ GLB loading avec validation
states: {
  loadingModel: {
    invoke: {
      src: loadGLBFile,
      input: ({ context }) => ({ path: '/Overmind_V8_27.glb' }),
      onDone: {
        target: 'validatingBones',
        guard: ({ event }) => event.output.bones.length === 484
      },
      onError: 'error'
    }
  }
}

// ✅ Animation transitions avec timing
states: {
  transitioning: {
    invoke: {
      src: animateTransition,
      input: ({ context }) => ({
        from: context.currentAnimation,
        to: context.nextAnimation,
        duration: 500,
        easing: easingFunctions.easeInOutQuad
      }),
      onDone: 'playing'
    }
  }
}

// ✅ Color picker avec debouncing
states: {
  selecting: {
    on: {
      COLOR_CHANGED: {
        actions: assign({
          selectedColor: ({ event }) => event.color
        })
      },
      APPLY_COLOR: {
        target: 'applying'
      }
    }
  },
  applying: {
    invoke: {
      src: applyColorToMaterials,
      input: ({ context }) => ({
        hexColor: context.selectedColor,
        debounceDelay: 200
      }),
      onDone: 'applied'
    }
  }
}
```

### **Machines principales**

| Machine | Responsabilité |
|---------|----------------|
| **applicationMachine** | Orchestration globale app |
| **sceneLifecycleMachine** | Cycle de vie scène 3D |
| **modelLoaderMachine** | Chargement GLB + validation |
| **animationMachine** | 29 animations NLA |
| **cameraMachine** | PerspectiveCamera + OrbitControls |
| **renderingMachine** | Boucle rendering + composer |
| **bloomMachine** | UnrealBloomPass + layers |
| **particleMachine** | Systèmes particules |
| **lightingMachine** | Lumières scène |
| **transitionMachine** | Transitions états |
| **debugPanelMachine** | Debug panel UI |
| **bloomColorPickerMachine** | Color picker bloom |

---

## 🏪 ZUSTAND - UI STATE

### **Responsabilité**

- ✅ UI state rapide (toggles, selections, layouts)
- ✅ State synchrone simple
- ✅ Pas de business logic
- ✅ Performance optimale (minimal re-renders)

### **Ce qui va dans Zustand**

```typescript
// ✅ Debug panel UI state
interface DebugPanelStore {
  isVisible: boolean;
  activeTab: 'bloom' | 'lighting' | 'particles' | 'performance';
  toggleVisible: () => void;
  setActiveTab: (tab: string) => void;
}

export const useDebugPanelStore = create<DebugPanelStore>((set) => ({
  isVisible: false,
  activeTab: 'bloom',
  toggleVisible: () => set((state) => ({ isVisible: !state.isVisible })),
  setActiveTab: (tab) => set({ activeTab: tab as any })
}));

// ✅ Animation selector UI
interface AnimationSelectorStore {
  selectedCategory: 'reveal' | 'breath' | 'shake' | 'look' | 'all';
  searchQuery: string;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useAnimationSelectorStore = create<AnimationSelectorStore>((set) => ({
  selectedCategory: 'all',
  searchQuery: '',
  setSelectedCategory: (category) => set({ selectedCategory: category as any }),
  setSearchQuery: (query) => set({ searchQuery: query })
}));

// ✅ Layout preferences
interface LayoutStore {
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'dark',
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'overmind-layout-storage'
    }
  )
);
```

### **Zustand Stores**

| Store | Responsabilité |
|-------|----------------|
| **useDebugPanelStore** | Visibilité + tabs debug panel |
| **useAnimationSelectorStore** | Filtrage animations UI |
| **useLayoutStore** | Layout preferences (persisted) |
| **usePerformanceDisplayStore** | Affichage FPS/memory UI |

---

## ⚛️ REACT CONTEXT - DEPENDENCY INJECTION

### **Responsabilité**

- ✅ Injection dépendances (SecurityIRISManager, Three.js instances)
- ✅ Provider actors XState au top-level
- ✅ Pas de state, juste DI

### **Ce qui va dans Context**

```typescript
// ✅ Overmind App Context (root actor + Three.js instances)
interface OvermindContextValue {
  appActorRef: ActorRefFrom<typeof applicationMachine>;
  scene: THREE.Scene | null;
  renderer: THREE.WebGLRenderer | null;
  camera: THREE.PerspectiveCamera | null;
  securityManager: SecurityIRISManager | null;
}

const OvermindContext = createContext<OvermindContextValue | null>(null);

export function OvermindProvider({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contextValue, setContextValue] = useState<OvermindContextValue | null>(null);

  const appActorRef = useActorRef(applicationMachine, {
    input: {
      canvasElement: canvasRef.current,
      onSceneReady: (scene, renderer, camera) => {
        setContextValue({
          appActorRef,
          scene,
          renderer,
          camera,
          securityManager: new SecurityIRISManager(scene)
        });
      }
    }
  });

  if (!contextValue) {
    return <LoadingScreen />;
  }

  return (
    <OvermindContext.Provider value={contextValue}>
      <canvas ref={canvasRef} />
      {children}
    </OvermindContext.Provider>
  );
}

export function useOvermindContext() {
  const context = useContext(OvermindContext);
  if (!context) {
    throw new Error('useOvermindContext must be used within OvermindProvider');
  }
  return context;
}

// Usage dans composants enfants
function BloomColorPicker() {
  const { securityManager } = useOvermindContext();

  const { color, handleColorChange } = useBloomColorPicker({
    securityManager: securityManager!
  });

  return <input type="color" value={color} onChange={(e) => handleColorChange(e.target.value)} />;
}
```

### **React Contexts**

| Context | Responsabilité |
|---------|----------------|
| **OvermindContext** | Root actor + Three.js instances |
| **SecurityContext** | SecurityIRISManager DI |
| **ThemeContext** | Theme provider (optionnel) |

---

## 🔀 ARCHITECTURE HYBRIDE

### **Règle de décision : XState vs Zustand vs Context**

```
┌─────────────────────────────────────────────────────────────┐
│ Question : Quel state management utiliser ?                 │
└─────────────────────────────────────────────────────────────┘

1. Est-ce une dépendance injectée (Three.js instance, manager) ?
   → ✅ React Context

2. Est-ce du business logic avec async/transitions ?
   → ✅ XState v5

3. Est-ce du UI state synchrone simple ?
   → ✅ Zustand

4. Est-ce local à un composant ?
   → ✅ React useState
```

### **Exemples concrets**

```typescript
// ❌ MAUVAIS : UI state dans XState
const debugPanelMachine = setup({
  context: {
    isVisible: false, // ❌ Pas de business logic, juste toggle
    activeTab: 'bloom'
  }
});

// ✅ BON : UI state dans Zustand
const useDebugPanelStore = create((set) => ({
  isVisible: false,
  activeTab: 'bloom',
  toggleVisible: () => set((state) => ({ isVisible: !state.isVisible }))
}));

// ❌ MAUVAIS : Async dans Zustand
const useModelStore = create((set) => ({
  model: null,
  loadModel: async (path: string) => { // ❌ Pas de gestion erreurs/états
    const model = await loadGLB(path);
    set({ model });
  }
}));

// ✅ BON : Async dans XState
const modelLoaderMachine = setup({
  states: {
    loading: {
      invoke: {
        src: loadGLBFile,
        onDone: 'ready',
        onError: 'error' // ✅ Gestion erreurs native
      }
    }
  }
});

// ❌ MAUVAIS : DI dans props drilling
function BloomColorPicker({ securityManager, scene, renderer, camera }: Props) {
  // ❌ Trop de props
}

// ✅ BON : DI dans Context
function BloomColorPicker() {
  const { securityManager } = useOvermindContext(); // ✅ Clean
}
```

---

## 📊 COMMUNICATION INTER-STATES

### **Pattern 1 : XState → Zustand**

```typescript
// XState actor met à jour Zustand store
const bloomColorPickerMachine = setup({
  actions: {
    updateDebugPanel: ({ context }) => {
      useDebugPanelStore.getState().setActiveTab('bloom');
    }
  }
});
```

### **Pattern 2 : Zustand → XState**

```typescript
// Zustand store envoie événement à XState actor
function DebugPanel() {
  const { appActorRef } = useOvermindContext();
  const { activeTab, setActiveTab } = useDebugPanelStore();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    appActorRef.send({ type: 'DEBUG_TAB_CHANGED', tab });
  };

  return <Tabs activeTab={activeTab} onChange={handleTabChange} />;
}
```

### **Pattern 3 : XState ↔ XState (Actor Model)**

```typescript
// Communication via Receptionist pattern
actions: {
  notifyBloomActor: ({ system, event }) => {
    const receptionist = system.get('receptionist');
    const bloomActor = receptionist.find('bloom');

    bloomActor?.send({
      type: 'COLOR_APPLIED',
      color: event.color
    });
  }
}
```

### **Pattern 4 : Context → XState**

```typescript
// Context fournit dépendances à XState actor
const { securityManager } = useOvermindContext();

const actorRef = useActorRef(bloomColorPickerMachine, {
  input: {
    securityManager // Injection dépendance
  }
});
```

---

## 🎯 ARCHITECTURE FINALE

### **Exemple complet : BloomColorPicker**

```typescript
// 1. XState machine (business logic)
const bloomColorPickerMachine = setup({
  types: {} as {
    context: {
      selectedColor: number;
      securityManager: SecurityIRISManager;
    };
    events: { type: 'COLOR_CHANGED'; color: number } | { type: 'APPLY_COLOR' };
  },
  actions: {
    applyColor: ({ context }) => {
      context.securityManager.setCustomColor(context.selectedColor);
    }
  }
}).createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        COLOR_CHANGED: {
          actions: assign({
            selectedColor: ({ event }) => event.color
          }),
          target: 'selecting'
        }
      }
    },
    selecting: {
      on: {
        APPLY_COLOR: { target: 'applying' }
      }
    },
    applying: {
      invoke: {
        src: applyColorToMaterials,
        input: ({ context }) => ({
          hexColor: context.selectedColor,
          securityManager: context.securityManager,
          debounceDelay: 200
        }),
        onDone: 'applied'
      }
    },
    applied: {
      after: {
        500: 'idle'
      }
    }
  }
});

// 2. Zustand store (UI state)
interface ColorPickerUIStore {
  isPanelOpen: boolean;
  recentColors: number[];
  togglePanel: () => void;
  addRecentColor: (color: number) => void;
}

const useColorPickerUIStore = create<ColorPickerUIStore>((set) => ({
  isPanelOpen: false,
  recentColors: [],
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  addRecentColor: (color) =>
    set((state) => ({
      recentColors: [color, ...state.recentColors.slice(0, 9)]
    }))
}));

// 3. Custom hook (React integration)
function useBloomColorPicker() {
  const { securityManager } = useOvermindContext(); // Context DI

  const actorRef = useActorRef(bloomColorPickerMachine, {
    input: { securityManager: securityManager! }
  });

  const selectedColor = useSelector(actorRef, (state) => state.context.selectedColor);
  const isApplying = useSelector(actorRef, (state) => state.matches('applying'));

  const { isPanelOpen, togglePanel, recentColors, addRecentColor } = useColorPickerUIStore();

  const handleColorChange = useCallback((htmlColor: string) => {
    const hexColor = parseInt(htmlColor.replace('#', ''), 16);
    actorRef.send({ type: 'COLOR_CHANGED', color: hexColor });
  }, [actorRef]);

  const applyColor = useCallback(() => {
    actorRef.send({ type: 'APPLY_COLOR' });
    addRecentColor(selectedColor);
  }, [actorRef, selectedColor, addRecentColor]);

  return {
    color: `#${selectedColor.toString(16).padStart(6, '0')}`,
    handleColorChange,
    applyColor,
    isApplying,
    isPanelOpen,
    togglePanel,
    recentColors
  };
}

// 4. Component (UI presentation)
function BloomColorPicker() {
  const {
    color,
    handleColorChange,
    applyColor,
    isApplying,
    isPanelOpen,
    togglePanel,
    recentColors
  } = useBloomColorPicker();

  return (
    <div>
      <button onClick={togglePanel}>Color Picker</button>
      {isPanelOpen && (
        <div>
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            disabled={isApplying}
          />
          <button onClick={applyColor} disabled={isApplying}>
            {isApplying ? 'Applying...' : 'Apply'}
          </button>
          <div>
            <h4>Recent Colors</h4>
            {recentColors.map((recentColor) => (
              <div
                key={recentColor}
                style={{
                  backgroundColor: `#${recentColor.toString(16)}`,
                  width: 24,
                  height: 24
                }}
                onClick={() => handleColorChange(`#${recentColor.toString(16)}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Résumé architecture** :
- ✅ **XState** : Business logic (color selection, async apply, debouncing)
- ✅ **Zustand** : UI state (panel open/close, recent colors)
- ✅ **Context** : DI (SecurityIRISManager)
- ✅ **Hook** : Intégration propre
- ✅ **Component** : Pure presentation

---

## 📈 AVANTAGES ARCHITECTURE HYBRIDE

### **1. Performance**

```typescript
// ✅ Zustand : Minimal re-renders
const isVisible = useDebugPanelStore((state) => state.isVisible);
// Re-render uniquement si isVisible change

// ✅ XState : useSelector granulaire
const color = useSelector(actorRef, (state) => state.context.selectedColor);
// Re-render uniquement si selectedColor change
```

### **2. Developer Experience**

```typescript
// ✅ XState : Type-safe events
actorRef.send({ type: 'APPLY_COLOR' }); // ✅ Autocomplete
actorRef.send({ type: 'INVALID_EVENT' }); // ❌ Type error

// ✅ Zustand : Simple API
const { togglePanel } = useDebugPanelStore();
togglePanel(); // ✅ No boilerplate
```

### **3. Testabilité**

```typescript
// ✅ XState : Test machines isolément
const actor = createActor(bloomColorPickerMachine);
actor.start();
actor.send({ type: 'COLOR_CHANGED', color: 0xff0000 });
expect(actor.getSnapshot().context.selectedColor).toBe(0xff0000);

// ✅ Zustand : Test stores isolément
const { result } = renderHook(() => useDebugPanelStore());
act(() => result.current.togglePanel());
expect(result.current.isVisible).toBe(true);
```

### **4. Séparation des préoccupations**

- **XState** : Business rules, async, state transitions
- **Zustand** : UI preferences, toggles, filters
- **Context** : Dependency injection
- **Component** : Presentation uniquement

---

## ✅ CHECKLIST IMPLÉMENTATION

- [ ] XState v5 machines (12 machines)
- [ ] Zustand stores (4 stores)
- [ ] React Contexts (3 contexts)
- [ ] Custom hooks integration (10 hooks)
- [ ] Receptionist pattern (actor communication)
- [ ] Persist Zustand stores (localStorage)
- [ ] Type-safe events XState
- [ ] Tests machines XState (12 suites)
- [ ] Tests stores Zustand (4 suites)
- [ ] Architecture documentation

---

**Prochaine** : F04 Performance Targets

