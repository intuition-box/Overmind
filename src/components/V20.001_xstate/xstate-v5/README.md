# XState v5 Implementation - Complete Architecture

## 📁 Structure

```
xstate-v5/
├── actors/
│   ├── applicationMachine.ts          # Root actor system (spawns all machines)
│   ├── bloom/
│   │   └── bloomMachine.ts           # Global bloom controls
│   ├── lighting/
│   │   └── lightingMachine.ts        # Exposure, HDR boost, light positions
│   ├── pbr/
│   │   └── pbrMachine.ts             # PBR per-group + tone mapping
│   ├── performance/
│   │   └── performanceMonitor.ts     # FPS, memory, renderer stats
│   ├── effects/
│   │   └── effectsMachine.ts         # Glow, Ultra Bloom, Motion Trail
│   ├── scene/
│   │   └── sceneMachine.ts           # Background, grid, axes
│   └── material/
│       └── materialMachine.ts        # Per-group emissive materials
├── hooks/
│   ├── useApplication.ts             # Root hook (spawns all actors)
│   ├── useBloom.ts
│   ├── useLighting.ts
│   ├── usePBR.ts
│   ├── usePerformance.ts
│   ├── useEffects.ts
│   ├── useScene.ts
│   └── useMaterial.ts
├── utils/
│   ├── lightPresets.ts               # 6 light position presets
│   ├── pbrPresets.ts                 # 4 PBR presets
│   ├── toneMappingMap.ts             # 5 tone mapping types
│   └── effectPresets.ts              # 4 effect presets
└── index.ts                          # Barrel exports
```

## 🎯 Actor System Architecture

### Root: applicationMachine

```typescript
const {
  bloomActor,
  lightingActor,
  pbrActor,
  performanceActor,
  effectsActor,
  sceneActor,
  materialActor,
  initialize,
  shutdown
} = useApplication();
```

**States**: `idle` → `running`
**Actions**: `INITIALIZE`, `SHUTDOWN`

### Inter-Machine Communication

```typescript
// bloomMachine → materialMachine
enqueue.sendTo('material', {
  type: 'SET_ALL_GROUPS_COLOR',
  color: event.color
});

// effectsMachine → bloomMachine
enqueue.sendTo('bloom', {
  type: 'SET_STRENGTH',
  strength: 3.0
});
```

## 🔧 Machines Overview

### 1. bloomMachine (systemId: 'bloom')

**Context**:
- `bloomPass`: UnrealBloomPass | null
- `threshold`: number (0.15)
- `strength`: number (0.40)
- `radius`: number (0.4)
- `enabled`: boolean (true)
- `bloomColor`: string ('#00ffff')

**Events**:
- `SET_BLOOM_PASS`, `ENABLE`, `DISABLE`, `TOGGLE`
- `SET_THRESHOLD`, `SET_STRENGTH`, `SET_RADIUS`
- `SET_BLOOM_COLOR` → sends to materialMachine
- `RESTORE_DEFAULTS`

**Hook**: `useBloom(bloomActor)`

---

### 2. lightingMachine (systemId: 'lighting')

**Context**:
- `ambientIntensity`: 0.5
- `directionalIntensity`: 0.8
- `pointIntensity`: 1.0
- `exposure`: 1.7
- `hdrBoostEnabled`: true
- `hdrBoostMultiplier`: 2.5
- `directionalPosition`: { x, y, z }
- `currentPreset`: PresetKey

**Events**:
- `SET_RENDERER`, `SET_LIGHTS`
- `UPDATE_*_INTENSITY`
- `UPDATE_EXPOSURE`, `TOGGLE_HDR_BOOST`, `UPDATE_HDR_MULTIPLIER`
- `UPDATE_DIRECTIONAL_POSITION`, `APPLY_LIGHT_PRESET`
- `RESTORE_DEFAULTS`

**Hook**: `useLighting(lightingActor)`

**Presets**: 6 light positions (studio-classic, top-down, side-dramatic, front-soft, back-rim, low-moody)

---

### 3. pbrMachine (systemId: 'pbr')

**Context**:
- `renderer`: WebGLRenderer | null
- `toneMapping`: ToneMappingType ('ACESFilmicToneMapping')
- `groups`: { eyeRings, iris, magicRings, arms }
  - Each group: `materials`, `metalness`, `roughness`

**Events**:
- `SET_RENDERER`, `SET_GROUP_MATERIALS`
- `SET_TONE_MAPPING`
- `UPDATE_GROUP_METALNESS`, `UPDATE_GROUP_ROUGHNESS`
- `APPLY_PRESET_TO_GROUP`
- `RESTORE_DEFAULTS`

**Hook**: `usePBR(pbrActor)`

**Presets**: 4 PBR presets (chrome, glass, matte, plastic)

**Tone Mapping**: NoToneMapping, LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping

---

### 4. performanceMonitor (systemId: 'performance')

**Context**:
- `fps`: number
- `fpsHistory`: number[] (last 60 frames)
- `memoryUsed`, `memoryLimit`, `memoryUsedPercent`
- `rendererInfo`: { triangles, geometries, textures, programs, calls }
- `isMonitoring`: boolean

**Events**:
- `SET_RENDERER`
- `START_MONITORING`, `STOP_MONITORING`
- `UPDATE_FPS`, `UPDATE_MEMORY`, `UPDATE_RENDERER_INFO`
- `CLEAR_HISTORY`

**Hook**: `usePerformance(performanceActor)`

**States**: `idle` → `stopped` → `monitoring`

---

### 5. effectsMachine (systemId: 'effects')

**Context**:
- `glowEnabled`: boolean
- `ultraBloomEnabled`: boolean
- `motionTrailEnabled`: boolean
- `currentPreset`: EffectPresetKey | null

**Events**:
- `TOGGLE_GLOW`, `TOGGLE_ULTRA_BLOOM`, `TOGGLE_MOTION_TRAIL`
- `ENABLE_*`, `DISABLE_*`
- `APPLY_EFFECT_PRESET` → sends to bloomMachine
- `RESTORE_DEFAULTS`

**Hook**: `useEffects(effectsActor)`

**Presets**: 4 effect presets (all-off, glow-only, ultra-bloom, all-on)

---

### 6. sceneMachine (systemId: 'scene')

**Context**:
- `scene`: Scene | null
- `backgroundColor`: '#1a1a1a'
- `gridHelper`: GridHelper | null
- `gridVisible`, `gridSize`, `gridDivisions`, `gridColor1`, `gridColor2`
- `axesHelper`: AxesHelper | null
- `axesVisible`, `axesSize`

**Events**:
- `SET_SCENE`
- `SET_BACKGROUND_COLOR`
- `INITIALIZE_GRID`, `TOGGLE_GRID`, `SHOW_GRID`, `HIDE_GRID`
- `UPDATE_GRID_SIZE`, `UPDATE_GRID_DIVISIONS`, `UPDATE_GRID_COLORS`
- `INITIALIZE_AXES`, `TOGGLE_AXES`, `SHOW_AXES`, `HIDE_AXES`
- `UPDATE_AXES_SIZE`
- `RESTORE_DEFAULTS`

**Hook**: `useScene(sceneActor)`

---

### 7. materialMachine (systemId: 'material')

**Context**:
- `groups`: { iris, eyeRings, revealRings }
  - Each group: `materials`, `emissiveColor`, `emissiveIntensity`, `visible`, `objects`

**Events**:
- `SET_GROUP_MATERIALS`, `SET_REVEAL_OBJECTS`
- `UPDATE_GROUP_EMISSIVE_COLOR`, `UPDATE_GROUP_EMISSIVE_INTENSITY`
- `SET_ALL_GROUPS_COLOR` ← from bloomMachine
- `TOGGLE_REVEAL_VISIBILITY`, `SHOW_REVEAL`, `HIDE_REVEAL`
- `RESTORE_DEFAULTS`

**Hook**: `useMaterial(materialActor)`

---

## 🚀 Usage Example

```typescript
import { useApplication } from './xstate-v5';
import { useBloom } from './xstate-v5';

function App() {
  const { bloomActor, initialize } = useApplication();

  useEffect(() => {
    initialize(); // Spawn all actors
  }, []);

  if (!bloomActor) return null;

  return <ControlPanel bloomActor={bloomActor} />;
}

function ControlPanel({ bloomActor }) {
  const {
    threshold,
    strength,
    radius,
    enabled,
    updateThreshold,
    toggleBloom
  } = useBloom(bloomActor);

  return (
    <div>
      <button onClick={toggleBloom}>
        Bloom: {enabled ? 'ON' : 'OFF'}
      </button>
      <input
        type="range"
        value={threshold}
        onChange={(e) => updateThreshold(+e.target.value)}
      />
    </div>
  );
}
```

## 📊 XState v5 Patterns Used

1. **setup() API** - Type-safe machine setup
2. **assign()** - Context updates
3. **enqueueActions()** - Batched actions
4. **sendTo('systemId', event)** - Inter-machine communication
5. **spawn()** - Actor spawning with systemId
6. **useActorRef()** - Stable actor reference
7. **useSelector()** - Optimized re-renders
8. **ActorRefFrom<typeof machine>** - Type inference

## ✅ Implementation Status

- [x] 7 Machines implemented
- [x] 8 Hooks implemented
- [x] 4 Utils/Presets implemented
- [x] applicationMachine (root)
- [x] index.ts barrel exports
- [ ] ControlPanel UI React components
- [ ] Three.js integration
- [ ] Testing (console + visual)

## 📝 Next Steps

1. Create ControlPanel UI with 6 tabs
2. Integrate with Three.js viewer
3. Initialize machines with Three.js objects
4. Test inter-machine communication
5. Visual testing in browser
