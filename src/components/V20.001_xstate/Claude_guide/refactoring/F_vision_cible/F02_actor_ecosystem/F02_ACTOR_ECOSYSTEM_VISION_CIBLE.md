# 🎭 F02 - ACTOR ECOSYSTEM - VISION CIBLE

**Date** : 2 octobre 2025
**Phase** : F - Vision Cible
**Session** : F02 - Écosystème des Actors
**Statut** : ✅ COMPLET

---

## 📋 VUE D'ENSEMBLE

L'écosystème d'actors XState v5 de l'application Overmind comprend **12 actors principaux** organisés selon le **Actor Model** avec communication event-driven et découverte via **Receptionist pattern**.

### **Architecture Actors**

```
┌─────────────────────────────────────────────────────────────┐
│                    ApplicationActor                         │
│                  (Root orchestrator)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ├──── SceneLifecycleActor
                         │       │
                         │       ├──── ModelLoaderActor
                         │       ├──── AnimationActor
                         │       └──── CameraActor
                         │
                         ├──── RenderingActor
                         │       │
                         │       ├──── BloomActor
                         │       ├──── ParticleActor
                         │       └──── LightingActor
                         │
                         ├──── InteractionActor
                         │       │
                         │       ├──── TransitionActor
                         │       └──── DebugPanelActor
                         │
                         └──── BloomColorPickerActor (UI feature)
```

---

## 🎯 ACTORS DÉTAILLÉS

### **1. ApplicationActor (Root)**

**Responsabilité** : Orchestration globale, cycle de vie application, gestion erreurs

**États** :
```typescript
type ApplicationState =
  | { value: 'initializing'; context: ApplicationContext }
  | { value: 'ready'; context: ApplicationContext }
  | { value: 'running'; context: ApplicationContext }
  | { value: 'error'; context: ApplicationContext & { error: Error } }
  | { value: 'cleanup'; context: ApplicationContext };
```

**Événements gérés** :
- `APP_INIT` - Démarrage application
- `SCENE_READY` - Scène 3D prête
- `ERROR_OCCURRED` - Erreur système
- `CLEANUP_REQUESTED` - Nettoyage ressources

**Enfants spawn** :
```typescript
context.sceneLifecycle = spawn(sceneLifecycleActor, { id: 'sceneLifecycle' });
context.renderingActor = spawn(renderingActor, { id: 'rendering' });
context.interactionActor = spawn(interactionActor, { id: 'interaction' });
```

**Communication** :
- Broadcast `APP_STATE_CHANGED` → Tous les actors
- Listen `CHILD_ERROR` ← Tous les enfants

---

### **2. SceneLifecycleActor**

**Responsabilité** : Gestion cycle de vie scène Three.js

**États** :
```typescript
type SceneLifecycleState =
  | { value: 'idle'; context: SceneContext }
  | { value: 'loadingModel'; context: SceneContext }
  | { value: 'validatingBones'; context: SceneContext }
  | { value: 'settingUpScene'; context: SceneContext }
  | { value: 'ready'; context: SceneContext }
  | { value: 'error'; context: SceneContext & { error: Error } };

interface SceneContext {
  scene: THREE.Scene | null;
  model: THREE.Group | null;
  bones: THREE.Bone[];
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
}
```

**Événements** :
- `LOAD_MODEL` - Charger GLB
- `MODEL_LOADED` - Modèle chargé (484 bones validés)
- `SETUP_SCENE` - Configurer scène
- `SCENE_READY` - Scène prête

**Services invoqués** :
```typescript
invoke: {
  src: loadGLBFile,
  input: ({ context }) => ({
    path: '/Overmind_V8_27.glb',
    dracoLoader: context.dracoLoader
  }),
  onDone: {
    target: 'validatingBones',
    actions: assign({
      model: ({ event }) => event.output.model,
      bones: ({ event }) => event.output.bones
    })
  },
  onError: {
    target: 'error',
    actions: assign({
      error: ({ event }) => event.error
    })
  }
}
```

**Enfants** :
- `ModelLoaderActor` - Chargement GLB + validation bones
- `AnimationActor` - Gestion 29 animations NLA
- `CameraActor` - Contrôles caméra OrbitControls

---

### **3. ModelLoaderActor**

**Responsabilité** : Chargement GLB, validation 484 bones, matériaux

**États** :
```typescript
type ModelLoaderState =
  | { value: 'idle'; context: LoaderContext }
  | { value: 'loading'; context: LoaderContext }
  | { value: 'validating'; context: LoaderContext }
  | { value: 'processingMaterials'; context: LoaderContext }
  | { value: 'success'; context: LoaderContext }
  | { value: 'error'; context: LoaderContext & { error: Error } };

interface LoaderContext {
  model: THREE.Group | null;
  bones: THREE.Bone[];
  materials: Map<string, THREE.Material>;
  validationResult: {
    bonesValid: boolean;
    expectedCount: 484;
    actualCount: number;
  };
}
```

**Événements** :
- `START_LOAD` - Démarrer chargement
- `VALIDATE_BONES` - Valider squelette
- `PROCESS_MATERIALS` - Traiter matériaux

**Service** :
```typescript
const loadGLBFile = fromPromise<GLBLoadOutput, GLBLoadInput>(
  async ({ input }) => {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    loader.setDRACOLoader(dracoLoader);

    return new Promise((resolve, reject) => {
      loader.load(input.path, (gltf) => {
        const model = gltf.scene;
        const bones: THREE.Bone[] = [];

        model.traverse((child) => {
          if (child instanceof THREE.Bone) {
            bones.push(child);
          }
        });

        if (bones.length !== 484) {
          reject(new Error(`Invalid bone count: ${bones.length} (expected 484)`));
          return;
        }

        resolve({
          model,
          bones,
          animations: gltf.animations,
          materials: extractMaterials(model)
        });
      }, undefined, reject);
    });
  }
);
```

**Communication** :
- Emit `MODEL_LOADED` → SceneLifecycleActor
- Emit `BONES_VALIDATED` → AnimationActor

---

### **4. AnimationActor**

**Responsabilité** : Gestion 29 animations NLA, mixer, clips

**États** :
```typescript
type AnimationState =
  | { value: 'idle'; context: AnimContext }
  | { value: 'settingUpMixer'; context: AnimContext }
  | { value: 'ready'; context: AnimContext }
  | { value: 'playing'; context: AnimContext }
  | { value: 'paused'; context: AnimContext }
  | { value: 'transitioning'; context: AnimContext };

interface AnimContext {
  mixer: THREE.AnimationMixer | null;
  clips: THREE.AnimationClip[];
  currentClip: THREE.AnimationAction | null;
  availableAnimations: string[]; // 29 animations
  isPlaying: boolean;
}
```

**Événements** :
- `SETUP_MIXER` - Créer AnimationMixer
- `PLAY_ANIMATION` - Jouer animation par nom
- `PAUSE_ANIMATION` - Pause
- `TRANSITION_TO` - Transition entre animations

**29 Animations disponibles** :
```typescript
const AVAILABLE_ANIMATIONS = [
  'IDLE_SHAKE',
  'REVEAL_1', 'REVEAL_2', 'REVEAL_3', 'REVEAL_4', 'REVEAL_5', 'REVEAL_6',
  'CLOSE_REVEAL',
  'BREATH_EYE_BIG', 'BREATH_EYE_LITTLE',
  'SHAKE_EYE_X', 'SHAKE_EYE_Y',
  'SLOW_SHAKE',
  'VERIF_GAUCHE', 'VERIF_DROITE',
  'REGARDE_UP', 'REGARDE_DOWN', 'REGARDE_GAUCHE', 'REGARDE_DROITE',
  'VERIF_START', 'VERIF_START_R', 'VERIF_END',
  'LOOK_START', 'LOOK_END',
  'SLOW_START', 'SLOW_END',
  'ONA_START', 'ONA_END',
  'BREATH_START'
];
```

**Service** :
```typescript
const setupAnimationMixer = fromPromise<MixerOutput, MixerInput>(
  async ({ input }) => {
    const mixer = new THREE.AnimationMixer(input.model);

    const clips = input.animations.map((clip) => {
      return mixer.clipAction(clip);
    });

    return {
      mixer,
      clips,
      availableAnimations: input.animations.map(a => a.name)
    };
  }
);
```

**Communication** :
- Listen `ANIMATION_TRIGGER` ← TransitionActor
- Emit `ANIMATION_STARTED` → ApplicationActor

---

### **5. CameraActor**

**Responsabilité** : Caméra PerspectiveCamera + OrbitControls

**États** :
```typescript
type CameraState =
  | { value: 'idle'; context: CameraContext }
  | { value: 'settingUp'; context: CameraContext }
  | { value: 'ready'; context: CameraContext }
  | { value: 'moving'; context: CameraContext }
  | { value: 'resetting'; context: CameraContext };

interface CameraContext {
  camera: THREE.PerspectiveCamera | null;
  controls: OrbitControls | null;
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
}
```

**Événements** :
- `SETUP_CAMERA` - Créer caméra + controls
- `MOVE_TO` - Déplacer vers position
- `RESET_VIEW` - Vue par défaut
- `UPDATE_FOV` - Changer FOV

**Service** :
```typescript
const setupCamera = fromPromise<CameraOutput, CameraInput>(
  async ({ input }) => {
    const camera = new THREE.PerspectiveCamera(
      75,
      input.width / input.height,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    const controls = new OrbitControls(camera, input.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    return { camera, controls };
  }
);
```

**Communication** :
- Listen `RESIZE` ← ApplicationActor
- Emit `CAMERA_MOVED` → RenderingActor

---

### **6. RenderingActor**

**Responsabilité** : Orchestration rendering (Bloom, Particles, Lighting)

**États** :
```typescript
type RenderingState =
  | { value: 'idle'; context: RenderContext }
  | { value: 'initializing'; context: RenderContext }
  | { value: 'rendering'; context: RenderContext }
  | { value: 'paused'; context: RenderContext };

interface RenderContext {
  renderer: THREE.WebGLRenderer | null;
  composer: EffectComposer | null;
  bloomActor: ActorRefFrom<typeof bloomActor>;
  particleActor: ActorRefFrom<typeof particleActor>;
  lightingActor: ActorRefFrom<typeof lightingActor>;
  fps: number;
  deltaTime: number;
}
```

**Événements** :
- `START_RENDER_LOOP` - Démarrer boucle rendering
- `PAUSE_RENDER` - Pause (window blur)
- `RESUME_RENDER` - Reprendre
- `UPDATE_FPS` - Mettre à jour FPS

**Enfants** :
```typescript
context.bloomActor = spawn(bloomActor, { id: 'bloom' });
context.particleActor = spawn(particleActor, { id: 'particles' });
context.lightingActor = spawn(lightingActor, { id: 'lighting' });
```

**Boucle rendering** :
```typescript
actions: {
  startRenderLoop: ({ context }) => {
    const animate = (time: number) => {
      const delta = time - context.lastFrameTime;
      context.deltaTime = delta;

      // Update children
      context.bloomActor.send({ type: 'UPDATE', delta });
      context.particleActor.send({ type: 'UPDATE', delta });
      context.lightingActor.send({ type: 'UPDATE', delta });

      // Render
      context.composer?.render(delta);

      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
}
```

**Communication** :
- Listen `RENDER_SETTINGS_CHANGED` ← DebugPanelActor
- Emit `FRAME_RENDERED` → ApplicationActor (monitoring)

---

### **7. BloomActor**

**Responsabilité** : Gestion UnrealBloomPass, intensités par groupe

**États** :
```typescript
type BloomState =
  | { value: 'idle'; context: BloomContext }
  | { value: 'ready'; context: BloomContext }
  | { value: 'updating'; context: BloomContext };

interface BloomContext {
  bloomPass: UnrealBloomPass | null;
  bloomGroups: {
    iris: { threshold: number; strength: number; radius: number };
    eyeRings: { threshold: number; strength: number; radius: number };
    revealRings: { threshold: number; strength: number; radius: number };
    arms: { threshold: number; strength: number; radius: number };
  };
  currentGroup: keyof BloomContext['bloomGroups'];
}
```

**Événements** :
- `SETUP_BLOOM` - Créer UnrealBloomPass
- `UPDATE_GROUP` - Changer paramètres groupe
- `SWITCH_GROUP` - Changer groupe actif

**Service** :
```typescript
const setupBloomPass = fromPromise<BloomOutput, BloomInput>(
  async ({ input }) => {
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(input.width, input.height),
      1.5,  // strength
      0.4,  // radius
      0.85  // threshold
    );

    return { bloomPass };
  }
);
```

**Communication** :
- Listen `BLOOM_SETTINGS_CHANGED` ← DebugPanelActor
- Listen `COLOR_APPLIED` ← BloomColorPickerActor
- Emit `BLOOM_UPDATED` → RenderingActor

---

### **8. ParticleActor**

**Responsabilité** : Systèmes particules (Firefly, Sparkle, etc.)

**États** :
```typescript
type ParticleState =
  | { value: 'idle'; context: ParticleContext }
  | { value: 'active'; context: ParticleContext }
  | { value: 'updating'; context: ParticleContext };

interface ParticleContext {
  systems: Map<string, THREE.Points>;
  activeSystem: string | null;
  particleCount: number;
}
```

**Événements** :
- `CREATE_SYSTEM` - Créer système particules
- `ACTIVATE_SYSTEM` - Activer système
- `UPDATE` - Update boucle rendering

**Service** :
```typescript
const createParticleSystem = fromPromise<ParticleOutput, ParticleInput>(
  async ({ input }) => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(input.count * 3);

    for (let i = 0; i < input.count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: input.color,
      size: input.size,
      transparent: true,
      opacity: input.opacity
    });

    const points = new THREE.Points(geometry, material);

    return { system: points };
  }
);
```

**Communication** :
- Listen `PARTICLE_TRIGGER` ← TransitionActor
- Emit `PARTICLE_SPAWNED` → RenderingActor

---

### **9. LightingActor**

**Responsabilité** : Gestion lumières (Directional, Ambient, Spot)

**États** :
```typescript
type LightingState =
  | { value: 'idle'; context: LightContext }
  | { value: 'ready'; context: LightContext }
  | { value: 'updating'; context: LightContext };

interface LightContext {
  lights: Map<string, THREE.Light>;
  ambientIntensity: number;
  directionalIntensity: number;
}
```

**Événements** :
- `SETUP_LIGHTS` - Créer lumières
- `UPDATE_INTENSITY` - Changer intensité
- `UPDATE` - Update boucle rendering

**Service** :
```typescript
const setupLights = fromPromise<LightOutput, LightInput>(
  async ({ input }) => {
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    const directional = new THREE.DirectionalLight(0xffffff, 1.0);
    directional.position.set(5, 10, 7.5);

    return {
      lights: new Map([
        ['ambient', ambient],
        ['directional', directional]
      ])
    };
  }
);
```

**Communication** :
- Listen `LIGHTING_SETTINGS_CHANGED` ← DebugPanelActor
- Emit `LIGHTS_UPDATED` → RenderingActor

---

### **10. InteractionActor**

**Responsabilité** : Orchestration interactions utilisateur

**États** :
```typescript
type InteractionState =
  | { value: 'idle'; context: InteractionContext }
  | { value: 'listening'; context: InteractionContext }
  | { value: 'processing'; context: InteractionContext };

interface InteractionContext {
  transitionActor: ActorRefFrom<typeof transitionActor>;
  debugPanelActor: ActorRefFrom<typeof debugPanelActor>;
  lastInteraction: string | null;
}
```

**Événements** :
- `USER_CLICK` - Clic utilisateur
- `USER_HOVER` - Survol
- `KEYBOARD_INPUT` - Input clavier

**Enfants** :
```typescript
context.transitionActor = spawn(transitionActor, { id: 'transitions' });
context.debugPanelActor = spawn(debugPanelActor, { id: 'debugPanel' });
```

**Communication** :
- Listen événements DOM
- Emit `INTERACTION_DETECTED` → ApplicationActor

---

### **11. TransitionActor**

**Responsabilité** : Gestion transitions entre états scène

**États** :
```typescript
type TransitionState =
  | { value: 'idle'; context: TransitionContext }
  | { value: 'transitioning'; context: TransitionContext }
  | { value: 'complete'; context: TransitionContext };

interface TransitionContext {
  from: string;
  to: string;
  duration: number;
  easing: (t: number) => number;
  progress: number;
}
```

**Événements** :
- `START_TRANSITION` - Démarrer transition
- `UPDATE_PROGRESS` - Update progression
- `COMPLETE_TRANSITION` - Fin transition

**Service** :
```typescript
const animateTransition = fromPromise<TransitionOutput, TransitionInput>(
  async ({ input }) => {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / input.duration, 1);
        const easedProgress = input.easing(progress);

        // Envoyer événement progress
        input.sendProgress(easedProgress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve({ completed: true });
        }
      };

      animate();
    });
  }
);
```

**Communication** :
- Listen `TRIGGER_TRANSITION` ← InteractionActor
- Emit `ANIMATION_TRIGGER` → AnimationActor
- Emit `PARTICLE_TRIGGER` → ParticleActor

---

### **12. DebugPanelActor**

**Responsabilité** : Gestion UI Debug Panel (Zustand + XState)

**États** :
```typescript
type DebugPanelState =
  | { value: 'hidden'; context: DebugContext }
  | { value: 'visible'; context: DebugContext }
  | { value: 'updating'; context: DebugContext };

interface DebugContext {
  isVisible: boolean;
  bloomSettings: BloomSettings;
  lightingSettings: LightingSettings;
  particleSettings: ParticleSettings;
}
```

**Événements** :
- `TOGGLE_PANEL` - Afficher/masquer
- `BLOOM_CHANGED` - Paramètres bloom modifiés
- `LIGHTING_CHANGED` - Paramètres lighting modifiés

**Communication** :
- Emit `BLOOM_SETTINGS_CHANGED` → BloomActor
- Emit `LIGHTING_SETTINGS_CHANGED` → LightingActor
- Emit `RENDER_SETTINGS_CHANGED` → RenderingActor

---

### **13. BloomColorPickerActor** (Feature UI)

**Responsabilité** : Sélection couleur bloom Eye/IRIS

**États** :
```typescript
type BloomColorPickerState =
  | { value: 'idle'; context: ColorPickerContext }
  | { value: 'selecting'; context: ColorPickerContext }
  | { value: 'applying'; context: ColorPickerContext }
  | { value: 'applied'; context: ColorPickerContext };

interface ColorPickerContext {
  selectedColor: number; // 0xRRGGBB
  previousColor: number;
  securityManager: SecurityIRISManager | null;
  debounceTimer: number | null;
}
```

**Événements** :
- `COLOR_CHANGED` - Couleur modifiée (debounced 200ms)
- `APPLY_COLOR` - Appliquer couleur
- `RESET_COLOR` - Restaurer couleur précédente

**Service** :
```typescript
const applyColorToMaterials = fromPromise<ColorOutput, ColorInput>(
  async ({ input }) => {
    return new Promise((resolve) => {
      // Debounce 200ms pour éviter 92% CPU usage
      setTimeout(() => {
        input.securityManager?.setCustomColor(input.hexColor);
        resolve({ applied: true });
      }, 200);
    });
  }
);
```

**Communication** :
- Emit `COLOR_APPLIED` → BloomActor
- Listen `RESET_REQUESTED` ← DebugPanelActor

---

## 🔗 RECEPTIONIST PATTERN

### **Enregistrement Actors**

```typescript
// Dans ApplicationActor setup
actions: {
  registerActors: ({ context, system }) => {
    const receptionist = system.get('receptionist');

    receptionist.register('sceneLifecycle', context.sceneLifecycle);
    receptionist.register('rendering', context.renderingActor);
    receptionist.register('interaction', context.interactionActor);
    receptionist.register('bloom', context.bloomActor);
    receptionist.register('particles', context.particleActor);
    receptionist.register('lighting', context.lightingActor);
    receptionist.register('animation', context.animationActor);
    receptionist.register('camera', context.cameraActor);
    receptionist.register('transition', context.transitionActor);
    receptionist.register('debugPanel', context.debugPanelActor);
    receptionist.register('bloomColorPicker', context.bloomColorPickerActor);
  }
}
```

### **Découverte Actors**

```typescript
// N'importe quel actor peut découvrir un autre actor
actions: {
  findBloomActor: ({ context, system }) => {
    const receptionist = system.get('receptionist');
    const bloomActor = receptionist.find('bloom');

    if (bloomActor) {
      bloomActor.send({ type: 'UPDATE_GROUP', group: 'iris' });
    }
  }
}
```

---

## 📊 COMMUNICATION PATTERNS

### **Pattern 1 : Parent → Enfant (Direct)**

```typescript
// ApplicationActor → SceneLifecycleActor
context.sceneLifecycle.send({ type: 'LOAD_MODEL' });
```

### **Pattern 2 : Enfant → Parent (Callback)**

```typescript
// ModelLoaderActor → SceneLifecycleActor
invoke: {
  src: loadGLBFile,
  onDone: {
    actions: sendTo(
      ({ system }) => system.get('parent'),
      { type: 'MODEL_LOADED' }
    )
  }
}
```

### **Pattern 3 : Sibling → Sibling (Receptionist)**

```typescript
// BloomColorPickerActor → BloomActor
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

### **Pattern 4 : Broadcast (Tous les actors)**

```typescript
// ApplicationActor → Tous
actions: {
  broadcastAppState: ({ system, context }) => {
    const receptionist = system.get('receptionist');
    const allActors = receptionist.findAll();

    allActors.forEach(actor => {
      actor.send({
        type: 'APP_STATE_CHANGED',
        state: context.appState
      });
    });
  }
}
```

---

## 🔄 LIFECYCLE ACTORS

### **Démarrage Application**

```
1. ApplicationActor : initializing
   ↓
2. Spawn SceneLifecycleActor
3. Spawn RenderingActor
4. Spawn InteractionActor
   ↓
5. SceneLifecycleActor : loadingModel
   ↓ invoke loadGLBFile service
6. SceneLifecycleActor : validatingBones (484 bones)
   ↓
7. SceneLifecycleActor : settingUpScene
   ↓ spawn ModelLoaderActor, AnimationActor, CameraActor
8. SceneLifecycleActor : ready
   ↓ emit SCENE_READY
9. ApplicationActor : ready
   ↓
10. RenderingActor : initializing
    ↓ spawn BloomActor, ParticleActor, LightingActor
11. RenderingActor : rendering
    ↓ startRenderLoop
12. ApplicationActor : running
```

### **Interaction Utilisateur (exemple)**

```
1. User clique sur canvas
   ↓
2. InteractionActor : processing
   ↓ emit USER_CLICK
3. TransitionActor : transitioning
   ↓ invoke animateTransition service
4. Emit ANIMATION_TRIGGER → AnimationActor
5. AnimationActor : playing
   ↓
6. Emit PARTICLE_TRIGGER → ParticleActor
7. ParticleActor : active
   ↓
8. TransitionActor : complete
9. InteractionActor : listening
```

### **Cleanup Application**

```
1. ApplicationActor : cleanup
   ↓ emit CLEANUP_REQUESTED broadcast
2. RenderingActor : paused
   ↓ stop render loop
3. BloomActor, ParticleActor, LightingActor : cleanup
4. AnimationActor : cleanup (stop mixer)
5. CameraActor : cleanup (dispose controls)
6. SceneLifecycleActor : cleanup
   ↓ ModelLoaderActor dispose materials
7. ApplicationActor : terminate
```

---

## 🎯 AVANTAGES ARCHITECTURE

### **1. Zero Coupling**
- Aucun actor ne connaît directement un autre actor
- Communication via Receptionist pattern
- Facile à tester en isolation

### **2. Testabilité**
```typescript
// Test BloomActor sans RenderingActor
const bloomActor = createActor(bloomActorMachine);
bloomActor.start();

bloomActor.send({ type: 'UPDATE_GROUP', group: 'iris' });
expect(bloomActor.getSnapshot().context.currentGroup).toBe('iris');
```

### **3. Résilience**
- Erreur dans un actor n'affecte pas les autres
- Supervision pattern (parent gère erreurs enfants)
- Retry policies configurables

### **4. Performance**
- Actors parallèles (BloomActor + ParticleActor + LightingActor)
- Debouncing automatique (BloomColorPickerActor)
- Minimal re-renders React (useSelector)

### **5. Évolutivité**
- Ajouter nouveau actor sans modifier existants
- Remplacer actor sans casser système
- Migration progressive possible

---

## 📈 MÉTRIQUES MONITORING

### **ApplicationActor**
- Time to Interactive (TTI) : <3s
- Erreurs système : 0
- Lifecycle state changes : log

### **SceneLifecycleActor**
- GLB load time : <1s
- Bones validation : success/fail
- Scene setup time : <500ms

### **RenderingActor**
- FPS : 60 target
- Frame time : <16.67ms
- Dropped frames : <1%

### **BloomActor**
- Settings changes : count
- Performance impact : measure

### **ParticleActor**
- Particle count : track
- Memory usage : monitor

### **BloomColorPickerActor**
- Color changes : debounced count
- Apply time : <200ms

---

## 🔮 ÉVOLUTIONS FUTURES

### **Phase 1 : Actors supplémentaires**
- **PerformanceMonitorActor** - Monitoring FPS/memory
- **AudioActor** - Gestion sons (futur)
- **NetworkActor** - Fetch données externes (futur)

### **Phase 2 : Communication avancée**
- **Event Bus** - Pub/Sub entre actors
- **State Snapshots** - Persistence état actors
- **Time Travel Debugging** - Replay actions

### **Phase 3 : Optimisations**
- **Actor Pooling** - Réutilisation actors
- **Lazy Loading** - Spawn actors on-demand
- **Worker Threads** - Actors dans Web Workers

---

## ✅ CHECKLIST IMPLÉMENTATION

- [ ] ApplicationActor (root orchestrator)
- [ ] SceneLifecycleActor (scène Three.js)
- [ ] ModelLoaderActor (GLB + validation)
- [ ] AnimationActor (29 animations NLA)
- [ ] CameraActor (OrbitControls)
- [ ] RenderingActor (orchestration rendering)
- [ ] BloomActor (UnrealBloomPass)
- [ ] ParticleActor (systèmes particules)
- [ ] LightingActor (lumières scène)
- [ ] InteractionActor (interactions utilisateur)
- [ ] TransitionActor (transitions états)
- [ ] DebugPanelActor (UI debug)
- [ ] BloomColorPickerActor (color picker UI)
- [ ] Receptionist pattern implémenté
- [ ] Communication patterns testés
- [ ] Lifecycle complet validé
- [ ] Métriques monitoring en place

---

**Prochaine** : F03 Services Layer

