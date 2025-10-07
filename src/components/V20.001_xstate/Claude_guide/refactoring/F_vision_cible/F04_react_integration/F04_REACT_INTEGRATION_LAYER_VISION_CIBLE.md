# ⚛️ F04 - REACT INTEGRATION LAYER - VISION CIBLE

**Date** : 2 octobre 2025
**Phase** : F - Vision Cible
**Session** : F04 - Couche React Integration
**Statut** : ✅ COMPLET

---

## 📋 VUE D'ENSEMBLE

La **React Integration Layer** fait le pont entre **React 18** et **XState v5** via des **custom hooks**. Cette couche utilise `useActorRef` et `useSelector` pour une intégration optimale avec minimal re-renders.

### **Architecture React Integration**

```
┌─────────────────────────────────────────────────────────────┐
│                   UI COMPONENTS LAYER                       │
│            (React 18 - Pure Presentational)                 │
│                                                             │
│  <OvermindScene />  <BloomColorPicker />  <DebugPanel />   │
└────────────────────┬────────────────────────────────────────┘
                     │ utilise hooks
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              REACT INTEGRATION LAYER (Hooks)                │
│                                                             │
│  • useOvermindApp()      • useSceneLifecycle()             │
│  • useBloomColorPicker() • useDebugPanel()                 │
│  • useAnimationControl() • usePerformanceMonitor()         │
└────────────────────┬────────────────────────────────────────┘
                     │ useActorRef + useSelector
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                     ACTORS LAYER                            │
│                  (XState v5 - State Machines)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 CUSTOM HOOKS DÉTAILLÉS

### **1. useOvermindApp**

**Responsabilité** : Hook racine pour orchestration application

**Signature** :
```typescript
interface UseOvermindAppInput {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onError?: (error: Error) => void;
}

interface UseOvermindAppReturn {
  appState: 'initializing' | 'ready' | 'running' | 'error' | 'cleanup';
  error: Error | null;
  isReady: boolean;
  cleanup: () => void;
}

function useOvermindApp(input: UseOvermindAppInput): UseOvermindAppReturn;
```

**Implémentation** :
```typescript
import { useActorRef, useSelector } from '@xstate/react';
import { applicationMachine } from '../machines/applicationMachine';

export function useOvermindApp({
  canvasRef,
  onError
}: UseOvermindAppInput): UseOvermindAppReturn {
  const actorRef = useActorRef(applicationMachine, {
    input: {
      canvasElement: canvasRef.current,
      onError
    }
  });

  const appState = useSelector(actorRef, (state) => state.value as string);
  const error = useSelector(actorRef, (state) => state.context.error);
  const isReady = useSelector(actorRef, (state) =>
    state.matches('ready') || state.matches('running')
  );

  const cleanup = useCallback(() => {
    actorRef.send({ type: 'CLEANUP_REQUESTED' });
  }, [actorRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    appState: appState as any,
    error,
    isReady,
    cleanup
  };
}
```

**Usage dans composant** :
```typescript
function OvermindApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { appState, error, isReady } = useOvermindApp({ canvasRef });

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (!isReady) {
    return <LoadingScreen state={appState} />;
  }

  return (
    <div>
      <canvas ref={canvasRef} />
      <BloomColorPicker />
      <DebugPanel />
    </div>
  );
}
```

---

### **2. useSceneLifecycle**

**Responsabilité** : Hook pour gestion cycle de vie scène Three.js

**Signature** :
```typescript
interface UseSceneLifecycleInput {
  autoLoad?: boolean;
  modelPath?: string;
}

interface UseSceneLifecycleReturn {
  sceneState: 'idle' | 'loadingModel' | 'validatingBones' | 'settingUpScene' | 'ready' | 'error';
  loadingProgress: number;
  scene: THREE.Scene | null;
  model: THREE.Group | null;
  bones: THREE.Bone[];
  loadModel: (path: string) => void;
  error: Error | null;
}

function useSceneLifecycle(input?: UseSceneLifecycleInput): UseSceneLifecycleReturn;
```

**Implémentation** :
```typescript
export function useSceneLifecycle({
  autoLoad = true,
  modelPath = '/Overmind_V8_27.glb'
}: UseSceneLifecycleInput = {}): UseSceneLifecycleReturn {
  const actorRef = useActorRef(sceneLifecycleMachine, {
    input: { modelPath }
  });

  const sceneState = useSelector(actorRef, (state) => state.value);
  const loadingProgress = useSelector(actorRef, (state) => state.context.loadingProgress);
  const scene = useSelector(actorRef, (state) => state.context.scene);
  const model = useSelector(actorRef, (state) => state.context.model);
  const bones = useSelector(actorRef, (state) => state.context.bones);
  const error = useSelector(actorRef, (state) => state.context.error);

  const loadModel = useCallback((path: string) => {
    actorRef.send({ type: 'LOAD_MODEL', path });
  }, [actorRef]);

  // Auto load on mount
  useEffect(() => {
    if (autoLoad) {
      loadModel(modelPath);
    }
  }, [autoLoad, modelPath, loadModel]);

  return {
    sceneState: sceneState as any,
    loadingProgress,
    scene,
    model,
    bones,
    loadModel,
    error
  };
}
```

---

### **3. useBloomColorPicker**

**Responsabilité** : Hook pour color picker bloom (debounced)

**Signature** :
```typescript
interface UseBloomColorPickerInput {
  securityManager: SecurityIRISManager;
  onApplyColor?: (color: number) => void;
  initialColor?: number;
}

interface UseBloomColorPickerReturn {
  color: string; // "#RRGGBB"
  selectedColor: number; // 0xRRGGBB
  handleColorChange: (htmlColor: string) => void;
  applyColor: () => void;
  resetColor: () => void;
  isApplying: boolean;
}

function useBloomColorPicker(input: UseBloomColorPickerInput): UseBloomColorPickerReturn;
```

**Implémentation** :
```typescript
export function useBloomColorPicker({
  securityManager,
  onApplyColor,
  initialColor = 0xffffff
}: UseBloomColorPickerInput): UseBloomColorPickerReturn {
  const actorRef = useActorRef(bloomColorPickerMachine, {
    input: {
      securityManager,
      onApplyColor,
      initialColor
    }
  });

  const selectedColor = useSelector(actorRef, (state) => state.context.selectedColor);
  const isApplying = useSelector(actorRef, (state) => state.matches('applying'));

  const color = useMemo(() => {
    const hex = selectedColor.toString(16).padStart(6, '0');
    return `#${hex}`;
  }, [selectedColor]);

  const handleColorChange = useCallback((htmlColor: string) => {
    const hexColor = parseInt(htmlColor.replace('#', ''), 16);
    actorRef.send({ type: 'COLOR_CHANGED', color: hexColor });
  }, [actorRef]);

  const applyColor = useCallback(() => {
    actorRef.send({ type: 'APPLY_COLOR' });
  }, [actorRef]);

  const resetColor = useCallback(() => {
    actorRef.send({ type: 'RESET_COLOR' });
  }, [actorRef]);

  return {
    color,
    selectedColor,
    handleColorChange,
    applyColor,
    resetColor,
    isApplying
  };
}
```

**Usage dans composant** :
```typescript
function BloomColorPicker({ securityManager }: { securityManager: SecurityIRISManager }) {
  const { color, handleColorChange, applyColor, isApplying } = useBloomColorPicker({
    securityManager,
    onApplyColor: (color) => console.log('Color applied:', color)
  });

  return (
    <div>
      <input
        type="color"
        value={color}
        onChange={(e) => handleColorChange(e.target.value)}
        disabled={isApplying}
      />
      <button onClick={applyColor} disabled={isApplying}>
        {isApplying ? 'Applying...' : 'Apply Color'}
      </button>
    </div>
  );
}
```

---

### **4. useAnimationControl**

**Responsabilité** : Hook pour contrôle animations (29 animations)

**Signature** :
```typescript
interface UseAnimationControlInput {
  model: THREE.Group | null;
  animations: THREE.AnimationClip[];
}

interface UseAnimationControlReturn {
  availableAnimations: string[];
  currentAnimation: string | null;
  isPlaying: boolean;
  playAnimation: (name: string) => void;
  pauseAnimation: () => void;
  stopAnimation: () => void;
  transitionTo: (name: string, duration?: number) => void;
}

function useAnimationControl(input: UseAnimationControlInput): UseAnimationControlReturn;
```

**Implémentation** :
```typescript
export function useAnimationControl({
  model,
  animations
}: UseAnimationControlInput): UseAnimationControlReturn {
  const actorRef = useActorRef(animationMachine, {
    input: { model, animations }
  });

  const availableAnimations = useSelector(actorRef, (state) =>
    state.context.availableAnimations
  );
  const currentAnimation = useSelector(actorRef, (state) =>
    state.context.currentClip?.getClip().name ?? null
  );
  const isPlaying = useSelector(actorRef, (state) =>
    state.matches('playing')
  );

  const playAnimation = useCallback((name: string) => {
    actorRef.send({ type: 'PLAY_ANIMATION', name });
  }, [actorRef]);

  const pauseAnimation = useCallback(() => {
    actorRef.send({ type: 'PAUSE_ANIMATION' });
  }, [actorRef]);

  const stopAnimation = useCallback(() => {
    actorRef.send({ type: 'STOP_ANIMATION' });
  }, [actorRef]);

  const transitionTo = useCallback((name: string, duration = 500) => {
    actorRef.send({ type: 'TRANSITION_TO', name, duration });
  }, [actorRef]);

  return {
    availableAnimations,
    currentAnimation,
    isPlaying,
    playAnimation,
    pauseAnimation,
    stopAnimation,
    transitionTo
  };
}
```

---

### **5. useDebugPanel**

**Responsabilité** : Hook pour debug panel (Zustand + XState)

**Signature** :
```typescript
interface UseDebugPanelInput {
  initialVisible?: boolean;
}

interface UseDebugPanelReturn {
  isVisible: boolean;
  togglePanel: () => void;
  bloomSettings: BloomSettings;
  updateBloomSettings: (settings: Partial<BloomSettings>) => void;
  lightingSettings: LightingSettings;
  updateLightingSettings: (settings: Partial<LightingSettings>) => void;
  particleSettings: ParticleSettings;
  updateParticleSettings: (settings: Partial<ParticleSettings>) => void;
}

function useDebugPanel(input?: UseDebugPanelInput): UseDebugPanelReturn;
```

**Implémentation** :
```typescript
export function useDebugPanel({
  initialVisible = false
}: UseDebugPanelInput = {}): UseDebugPanelReturn {
  const actorRef = useActorRef(debugPanelMachine, {
    input: { initialVisible }
  });

  const isVisible = useSelector(actorRef, (state) => state.context.isVisible);
  const bloomSettings = useSelector(actorRef, (state) => state.context.bloomSettings);
  const lightingSettings = useSelector(actorRef, (state) => state.context.lightingSettings);
  const particleSettings = useSelector(actorRef, (state) => state.context.particleSettings);

  const togglePanel = useCallback(() => {
    actorRef.send({ type: 'TOGGLE_PANEL' });
  }, [actorRef]);

  const updateBloomSettings = useCallback((settings: Partial<BloomSettings>) => {
    actorRef.send({ type: 'BLOOM_CHANGED', settings });
  }, [actorRef]);

  const updateLightingSettings = useCallback((settings: Partial<LightingSettings>) => {
    actorRef.send({ type: 'LIGHTING_CHANGED', settings });
  }, [actorRef]);

  const updateParticleSettings = useCallback((settings: Partial<ParticleSettings>) => {
    actorRef.send({ type: 'PARTICLE_CHANGED', settings });
  }, [actorRef]);

  return {
    isVisible,
    togglePanel,
    bloomSettings,
    updateBloomSettings,
    lightingSettings,
    updateLightingSettings,
    particleSettings,
    updateParticleSettings
  };
}
```

---

### **6. usePerformanceMonitor**

**Responsabilité** : Hook pour monitoring FPS/memory

**Signature** :
```typescript
interface UsePerformanceMonitorInput {
  enabled?: boolean;
  interval?: number; // ms
}

interface UsePerformanceMonitorReturn {
  fps: number;
  frameTime: number;
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
  } | null;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

function usePerformanceMonitor(input?: UsePerformanceMonitorInput): UsePerformanceMonitorReturn;
```

**Implémentation** :
```typescript
export function usePerformanceMonitor({
  enabled = true,
  interval = 1000
}: UsePerformanceMonitorInput = {}): UsePerformanceMonitorReturn {
  const actorRef = useActorRef(performanceMonitorMachine, {
    input: { interval }
  });

  const fps = useSelector(actorRef, (state) => state.context.fps);
  const frameTime = useSelector(actorRef, (state) => state.context.frameTime);
  const memory = useSelector(actorRef, (state) => state.context.memory);
  const isMonitoring = useSelector(actorRef, (state) => state.matches('monitoring'));

  const startMonitoring = useCallback(() => {
    actorRef.send({ type: 'START_MONITORING' });
  }, [actorRef]);

  const stopMonitoring = useCallback(() => {
    actorRef.send({ type: 'STOP_MONITORING' });
  }, [actorRef]);

  useEffect(() => {
    if (enabled) {
      startMonitoring();
    }
    return () => {
      stopMonitoring();
    };
  }, [enabled, startMonitoring, stopMonitoring]);

  return {
    fps,
    frameTime,
    memory,
    isMonitoring,
    startMonitoring,
    stopMonitoring
  };
}
```

---

## 🎨 COMPONENT PATTERNS

### **Pattern 1 : Container/Presenter**

**Container (Smart Component)** :
```typescript
// BloomColorPickerContainer.tsx
export function BloomColorPickerContainer({ securityManager }: Props) {
  const {
    color,
    handleColorChange,
    applyColor,
    resetColor,
    isApplying
  } = useBloomColorPicker({ securityManager });

  return (
    <BloomColorPickerPresenter
      color={color}
      onColorChange={handleColorChange}
      onApply={applyColor}
      onReset={resetColor}
      isApplying={isApplying}
    />
  );
}
```

**Presenter (Dumb Component)** :
```typescript
// BloomColorPickerPresenter.tsx
interface BloomColorPickerPresenterProps {
  color: string;
  onColorChange: (color: string) => void;
  onApply: () => void;
  onReset: () => void;
  isApplying: boolean;
}

export function BloomColorPickerPresenter({
  color,
  onColorChange,
  onApply,
  onReset,
  isApplying
}: BloomColorPickerPresenterProps) {
  return (
    <div className="bloom-color-picker">
      <input
        type="color"
        value={color}
        onChange={(e) => onColorChange(e.target.value)}
        disabled={isApplying}
      />
      <button onClick={onApply} disabled={isApplying}>
        Apply
      </button>
      <button onClick={onReset} disabled={isApplying}>
        Reset
      </button>
    </div>
  );
}
```

### **Pattern 2 : Compound Components**

```typescript
// DebugPanel component with sub-components
export function DebugPanel() {
  const { isVisible, togglePanel } = useDebugPanel();

  if (!isVisible) {
    return <DebugPanelToggle onClick={togglePanel} />;
  }

  return (
    <div className="debug-panel">
      <DebugPanelHeader onClose={togglePanel} />
      <DebugPanelBloomSection />
      <DebugPanelLightingSection />
      <DebugPanelParticleSection />
      <DebugPanelPerformanceSection />
    </div>
  );
}

function DebugPanelBloomSection() {
  const { bloomSettings, updateBloomSettings } = useDebugPanel();

  return (
    <section>
      <h3>Bloom Settings</h3>
      <label>
        Strength:
        <input
          type="range"
          min="0"
          max="3"
          step="0.1"
          value={bloomSettings.strength}
          onChange={(e) => updateBloomSettings({ strength: parseFloat(e.target.value) })}
        />
      </label>
      {/* ... autres contrôles */}
    </section>
  );
}
```

### **Pattern 3 : Render Props**

```typescript
// AnimationControl with render props
interface AnimationControlRenderProps {
  availableAnimations: string[];
  currentAnimation: string | null;
  isPlaying: boolean;
  playAnimation: (name: string) => void;
  pauseAnimation: () => void;
}

interface AnimationControlProps {
  model: THREE.Group | null;
  animations: THREE.AnimationClip[];
  children: (props: AnimationControlRenderProps) => React.ReactNode;
}

export function AnimationControl({ model, animations, children }: AnimationControlProps) {
  const controlProps = useAnimationControl({ model, animations });
  return <>{children(controlProps)}</>;
}

// Usage
<AnimationControl model={model} animations={animations}>
  {({ availableAnimations, playAnimation, isPlaying }) => (
    <div>
      <select onChange={(e) => playAnimation(e.target.value)}>
        {availableAnimations.map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>
      <span>{isPlaying ? '▶️' : '⏸️'}</span>
    </div>
  )}
</AnimationControl>
```

---

## ⚡ OPTIMISATIONS REACT

### **1. useSelector granulaire**

**❌ Mauvais (re-render complet)** :
```typescript
const context = useSelector(actorRef, (state) => state.context);
const color = context.selectedColor;
```

**✅ Bon (re-render uniquement si color change)** :
```typescript
const color = useSelector(actorRef, (state) => state.context.selectedColor);
```

### **2. React.memo + shallow comparison**

```typescript
import { memo } from 'react';

interface BloomControlProps {
  strength: number;
  radius: number;
  threshold: number;
  onUpdate: (settings: BloomSettings) => void;
}

export const BloomControl = memo(function BloomControl({
  strength,
  radius,
  threshold,
  onUpdate
}: BloomControlProps) {
  return (
    <div>
      <input value={strength} onChange={(e) => onUpdate({ strength: parseFloat(e.target.value) })} />
      <input value={radius} onChange={(e) => onUpdate({ radius: parseFloat(e.target.value) })} />
      <input value={threshold} onChange={(e) => onUpdate({ threshold: parseFloat(e.target.value) })} />
    </div>
  );
});
```

### **3. useCallback pour event handlers**

```typescript
export function useBloomColorPicker(input: UseBloomColorPickerInput) {
  const actorRef = useActorRef(bloomColorPickerMachine, { input });

  // ✅ Memoized callback
  const handleColorChange = useCallback((htmlColor: string) => {
    const hexColor = parseInt(htmlColor.replace('#', ''), 16);
    actorRef.send({ type: 'COLOR_CHANGED', color: hexColor });
  }, [actorRef]);

  return { handleColorChange };
}
```

### **4. useMemo pour calculs coûteux**

```typescript
export function useAnimationControl(input: UseAnimationControlInput) {
  const actorRef = useActorRef(animationMachine, { input });

  const animationsByCategory = useMemo(() => {
    return {
      reveal: availableAnimations.filter(name => name.startsWith('REVEAL_')),
      breath: availableAnimations.filter(name => name.includes('BREATH')),
      shake: availableAnimations.filter(name => name.includes('SHAKE')),
      look: availableAnimations.filter(name => name.startsWith('REGARDE_'))
    };
  }, [availableAnimations]);

  return { animationsByCategory };
}
```

### **5. Lazy loading components**

```typescript
import { lazy, Suspense } from 'react';

const DebugPanel = lazy(() => import('./DebugPanel'));
const BloomColorPicker = lazy(() => import('./BloomColorPicker'));

export function OvermindApp() {
  return (
    <div>
      <canvas ref={canvasRef} />
      <Suspense fallback={<Spinner />}>
        <DebugPanel />
      </Suspense>
      <Suspense fallback={<Spinner />}>
        <BloomColorPicker securityManager={securityManager} />
      </Suspense>
    </div>
  );
}
```

---

## 🔗 COMMUNICATION REACT ↔ XSTATE

### **Pattern 1 : React → XState (Event)**

```typescript
// Component envoie événement à actor
function ColorPicker() {
  const actorRef = useActorRef(bloomColorPickerMachine);

  const handleClick = () => {
    actorRef.send({ type: 'COLOR_CHANGED', color: 0xff0000 });
  };

  return <button onClick={handleClick}>Red</button>;
}
```

### **Pattern 2 : XState → React (useSelector)**

```typescript
// Component écoute changement état actor
function ColorDisplay() {
  const actorRef = useActorRef(bloomColorPickerMachine);

  const color = useSelector(actorRef, (state) => state.context.selectedColor);

  return <div style={{ backgroundColor: `#${color.toString(16)}` }} />;
}
```

### **Pattern 3 : XState → React (Callback)**

```typescript
// Actor appelle callback React
const actorRef = useActorRef(bloomColorPickerMachine, {
  input: {
    onApplyColor: (color: number) => {
      console.log('Color applied from actor:', color);
      // Trigger React state update si nécessaire
    }
  }
});
```

### **Pattern 4 : React Context + XState**

```typescript
const OvermindContext = createContext<ActorRefFrom<typeof applicationMachine> | null>(null);

export function OvermindProvider({ children }: { children: React.ReactNode }) {
  const actorRef = useActorRef(applicationMachine);

  return (
    <OvermindContext.Provider value={actorRef}>
      {children}
    </OvermindContext.Provider>
  );
}

export function useOvermindContext() {
  const actorRef = useContext(OvermindContext);
  if (!actorRef) {
    throw new Error('useOvermindContext must be used within OvermindProvider');
  }
  return actorRef;
}

// Usage dans enfants
function DebugPanel() {
  const appActorRef = useOvermindContext();
  const appState = useSelector(appActorRef, (state) => state.value);

  return <div>App state: {appState}</div>;
}
```

---

## 🧪 TESTING HOOKS

### **Test hook isolé**

```typescript
import { renderHook, act } from '@testing-library/react';
import { useBloomColorPicker } from './useBloomColorPicker';

describe('useBloomColorPicker', () => {
  const mockSecurityManager = {
    setCustomColor: vi.fn()
  };

  it('should initialize with default color', () => {
    const { result } = renderHook(() =>
      useBloomColorPicker({
        securityManager: mockSecurityManager,
        initialColor: 0xffffff
      })
    );

    expect(result.current.color).toBe('#ffffff');
    expect(result.current.selectedColor).toBe(0xffffff);
  });

  it('should update color on change', () => {
    const { result } = renderHook(() =>
      useBloomColorPicker({ securityManager: mockSecurityManager })
    );

    act(() => {
      result.current.handleColorChange('#ff0000');
    });

    expect(result.current.color).toBe('#ff0000');
    expect(result.current.selectedColor).toBe(0xff0000);
  });

  it('should debounce color application', async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() =>
      useBloomColorPicker({ securityManager: mockSecurityManager })
    );

    act(() => {
      result.current.handleColorChange('#00ff00');
      result.current.applyColor();
    });

    expect(mockSecurityManager.setCustomColor).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockSecurityManager.setCustomColor).toHaveBeenCalledWith(0x00ff00);

    vi.useRealTimers();
  });
});
```

### **Test component avec hook**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { BloomColorPicker } from './BloomColorPicker';

describe('BloomColorPicker', () => {
  it('should render color input', () => {
    render(<BloomColorPicker securityManager={mockSecurityManager} />);

    const input = screen.getByRole('textbox', { name: /color/i });
    expect(input).toBeInTheDocument();
  });

  it('should apply color on button click', async () => {
    render(<BloomColorPicker securityManager={mockSecurityManager} />);

    const input = screen.getByRole('textbox', { name: /color/i });
    const button = screen.getByRole('button', { name: /apply/i });

    fireEvent.change(input, { target: { value: '#ff0000' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSecurityManager.setCustomColor).toHaveBeenCalledWith(0xff0000);
    });
  });
});
```

---

## 📊 HOOKS SUMMARY

| Hook | Responsabilité | Actors utilisés |
|------|----------------|-----------------|
| **useOvermindApp** | Orchestration application | ApplicationActor |
| **useSceneLifecycle** | Cycle de vie scène 3D | SceneLifecycleActor |
| **useBloomColorPicker** | Color picker bloom | BloomColorPickerActor |
| **useAnimationControl** | Contrôle animations | AnimationActor |
| **useDebugPanel** | Debug panel UI | DebugPanelActor |
| **usePerformanceMonitor** | Monitoring FPS/memory | PerformanceMonitorActor |
| **useRenderingControl** | Contrôle rendering | RenderingActor |
| **useParticleControl** | Contrôle particules | ParticleActor |
| **useLightingControl** | Contrôle lumières | LightingActor |
| **useCameraControl** | Contrôle caméra | CameraActor |

---

## ✅ CHECKLIST IMPLÉMENTATION

- [ ] useOvermindApp (root hook)
- [ ] useSceneLifecycle (scene lifecycle)
- [ ] useBloomColorPicker (color picker)
- [ ] useAnimationControl (29 animations)
- [ ] useDebugPanel (debug UI)
- [ ] usePerformanceMonitor (FPS/memory)
- [ ] useRenderingControl (rendering)
- [ ] useParticleControl (particles)
- [ ] useLightingControl (lights)
- [ ] useCameraControl (camera)
- [ ] Container/Presenter pattern
- [ ] React.memo optimizations
- [ ] useCallback/useMemo optimizations
- [ ] Lazy loading components
- [ ] Tests unitaires hooks (10 suites)
- [ ] Tests intégration components (10 suites)

---

**Prochaine** : F05 Performance Optimization Strategy

