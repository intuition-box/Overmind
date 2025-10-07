# G05 - VALIDATION CHECKLIST

## 📋 Objectif

Ce document définit **comment vérifier que chaque fichier/phase fonctionne correctement**.

Après avoir créé chaque fichier, tu dois suivre ces validations pour être sûr que tout marche avant de continuer.

---

## ✅ PHASE 1 - FOUNDATION (Fichiers 1-10)

### Après Fichier 1-3 (types.ts, colorConversion.ts, easingFunctions.ts)

**Commande :**
```bash
npm run type-check
```

**Résultat attendu :**
- ✅ Aucune erreur TypeScript
- ✅ Tous les types exportés correctement

**Test manuel (console navigateur) :**
```typescript
import { htmlToHex, hexToHtml } from '@xstate-v5/utils/colorConversion';
console.log(htmlToHex('#FF5733')); // 16733011
console.log(hexToHtml(16733011)); // #ff5733
```

---

### Après Fichier 4-5 (applicationMachine.types.ts, applicationMachine.ts)

**Commande :**
```bash
npm run type-check
```

**Résultat attendu :**
- ✅ Aucune erreur TypeScript
- ✅ Machine compile sans erreur

**Test manuel (console navigateur) :**
```typescript
import { createActor } from 'xstate';
import { applicationMachine } from '@actors/application/applicationMachine';

const actor = createActor(applicationMachine);
actor.start();
console.log(actor.getSnapshot().value); // 'initializing'

actor.send({ type: 'START' });
console.log(actor.getSnapshot().value); // 'ready'

actor.send({ type: 'START' });
console.log(actor.getSnapshot().value); // 'running'
```

---

### Après Fichier 6-9 (useApplication.ts → App.tsx)

**Commande :**
```bash
npm run dev
```

**Ouvre navigateur :** `http://localhost:5173`

**Résultat attendu :**

**Dans le navigateur :**
- ✅ Page affiche "Hello XState v5"
- ✅ Console affiche l'état actuel : `{ status: 'initializing' }`
- ✅ Aucune erreur dans console

**Dans DevTools React :**
- ✅ Composant `<OvermindProvider>` visible
- ✅ Composant `<App>` reçoit bien le contexte

---

### Après Fichier 10 (index.ts - barrel exports)

**Test manuel (console navigateur) :**
```typescript
import { useApplication } from '@xstate-v5';
import { applicationMachine } from '@xstate-v5';
import { htmlToHex } from '@xstate-v5';

console.log(useApplication); // ƒ useApplication()
console.log(applicationMachine); // {id: 'application', ...}
console.log(htmlToHex('#FF5733')); // 16733011
```

**Résultat attendu :**
- ✅ Tous les exports accessibles via `@xstate-v5`
- ✅ Aucune erreur d'import

---

## ✅ PHASE 2 - SCENE LIFECYCLE (Fichiers 11-20)

### Après Fichier 11 (loadGLBFile.ts)

**Test manuel (console navigateur) :**
```typescript
import { loadGLBFile } from '@services/scene/loadGLBFile';
import { createActor } from 'xstate';

const actor = createActor(loadGLBFile, {
  input: {
    path: '/models/Overmind.glb',
    onProgress: (p) => console.log(`Loading: ${p}%`)
  }
});

actor.subscribe({
  next: (snapshot) => {
    if (snapshot.status === 'done') {
      console.log('Model loaded:', snapshot.output.model);
      console.log('Bones count:', snapshot.output.bones.length);
      console.log('Animations:', snapshot.output.animations.length);
    }
  }
});

actor.start();
```

**Résultat attendu :**
- ✅ Console affiche progression : `Loading: 0%`, `Loading: 50%`, `Loading: 100%`
- ✅ Console affiche : `Bones count: 484`
- ✅ Console affiche : `Animations: 29`
- ✅ Aucune erreur de chargement

---

### Après Fichier 12 (validateBones.ts)

**Test manuel (console navigateur) :**
```typescript
import { validateBones } from '@services/scene/validateBones';
import { createActor } from 'xstate';

// Après avoir chargé le modèle (voir test précédent)
const actor = createActor(validateBones, {
  input: {
    bones: loadedBones, // du test précédent
    expectedCount: 484,
    strictMode: true
  }
});

actor.subscribe({
  next: (snapshot) => {
    if (snapshot.status === 'done') {
      console.log('Validation:', snapshot.output);
      // { isValid: true, actualCount: 484, expectedCount: 484, errors: [], warnings: [] }
    }
  }
});

actor.start();
```

**Résultat attendu :**
- ✅ `isValid: true`
- ✅ `actualCount: 484`
- ✅ `errors: []`

---

### Après Fichier 13 (setupScene.ts)

**Test manuel (console navigateur) :**
```typescript
import { setupScene } from '@services/scene/setupScene';
import { createActor } from 'xstate';

const actor = createActor(setupScene, {
  input: {
    containerElement: document.getElementById('threejs-container')!,
    canvasWidth: 800,
    canvasHeight: 600
  }
});

actor.subscribe({
  next: (snapshot) => {
    if (snapshot.status === 'done') {
      console.log('Scene setup:', snapshot.output);
      // { scene, camera, renderer, mixer }
    }
  }
});

actor.start();
```

**Résultat attendu :**
- ✅ Canvas Three.js visible dans le DOM
- ✅ Console affiche : `{ scene: Scene, camera: PerspectiveCamera, renderer: WebGLRenderer, mixer: AnimationMixer }`
- ✅ Aucune erreur Three.js

---

### Après Fichier 14-15 (sceneLifecycleMachine)

**Commande :**
```bash
npm run dev
```

**Ouvre navigateur :** `http://localhost:5173`

**Test dans App.tsx (modifie temporairement) :**
```typescript
function App() {
  const { actorRef } = useApplication();
  const sceneState = useSelector(actorRef, (state) => state.context.sceneActor);

  useEffect(() => {
    actorRef.send({ type: 'LOAD_SCENE' });
  }, []);

  return (
    <div>
      <h1>Scene State: {sceneState?.getSnapshot().value}</h1>
      <div id="threejs-container" style={{ width: '800px', height: '600px' }} />
    </div>
  );
}
```

**Résultat attendu :**

**Dans le navigateur :**
- ✅ Affiche : `Scene State: loading`
- ✅ Puis : `Scene State: loaded`
- ✅ Canvas Three.js affiche scène 3D
- ✅ Console affiche : `[SceneLifecycle] Model loaded: 484 bones, 29 animations`

**Console DevTools :**
- ✅ Aucune erreur
- ✅ Snapshot machine affiche `{ value: 'loaded', context: { model, bones, animations } }`

---

## ✅ PHASE 3 - ANIMATION & CAMERA (Fichiers 21-28)

### Après Fichier 21-22 (playAnimation.ts, transitionAnimation.ts)

**Test manuel (console navigateur) :**
```typescript
import { playAnimation } from '@services/animation/playAnimation';
import { createActor } from 'xstate';

const actor = createActor(playAnimation, {
  input: {
    mixer: mixer, // du test précédent
    clip: animations[0], // première animation
    loop: true
  }
});

actor.subscribe({
  next: (snapshot) => {
    if (snapshot.status === 'done') {
      console.log('Animation playing:', snapshot.output.action);
      // AnimationAction { _clip: AnimationClip, ... }
    }
  }
});

actor.start();
```

**Résultat attendu :**
- ✅ Animation visible sur le modèle 3D
- ✅ Console affiche : `AnimationAction`
- ✅ Aucune erreur Three.js

---

### Après Fichier 25-26 (animationMachine)

**Test dans App.tsx :**
```typescript
function App() {
  const { actorRef } = useApplication();

  useEffect(() => {
    actorRef.send({ type: 'LOAD_SCENE' });

    // Après 2 secondes, jouer animation
    setTimeout(() => {
      actorRef.send({
        type: 'PLAY_ANIMATION',
        clipName: 'Idle',
        loop: true
      });
    }, 2000);

    // Après 5 secondes, transition vers autre animation
    setTimeout(() => {
      actorRef.send({
        type: 'TRANSITION_ANIMATION',
        clipName: 'Walk',
        duration: 1000
      });
    }, 5000);
  }, []);

  return <div id="threejs-container" />;
}
```

**Résultat attendu :**
- ✅ 0-2s : Scène charge
- ✅ 2-5s : Animation "Idle" joue
- ✅ 5-6s : Transition douce (1s) vers "Walk"
- ✅ 6s+ : Animation "Walk" joue
- ✅ Console affiche transitions : `[Animation] Playing: Idle` → `[Animation] Transitioning: Idle → Walk` → `[Animation] Playing: Walk`

---

### Après Fichier 27-28 (updateCamera.ts, cameraMachine)

**Test dans App.tsx :**
```typescript
function App() {
  const { actorRef } = useApplication();

  useEffect(() => {
    actorRef.send({ type: 'LOAD_SCENE' });

    // Modifier caméra après 3 secondes
    setTimeout(() => {
      actorRef.send({
        type: 'UPDATE_CAMERA',
        position: { x: 5, y: 3, z: 10 },
        target: { x: 0, y: 1, z: 0 }
      });
    }, 3000);
  }, []);

  return <div id="threejs-container" />;
}
```

**Résultat attendu :**
- ✅ 0-3s : Caméra position initiale
- ✅ 3s+ : Caméra bouge vers nouvelle position (5, 3, 10)
- ✅ Caméra regarde point (0, 1, 0)
- ✅ Console affiche : `[Camera] Updated position: {x: 5, y: 3, z: 10}`

---

## ✅ PHASE 4 - RENDERING & EFFECTS (Fichiers 29-38)

### Après Fichier 29-30 (renderLoop.ts, renderMachine)

**Test manuel (console navigateur) :**
```typescript
import { useSelector } from '@xstate/react';

function App() {
  const { actorRef } = useApplication();
  const fps = useSelector(actorRef, (state) => state.context.renderStats?.fps);

  return (
    <div>
      <p>FPS: {fps?.toFixed(1)}</p>
      <div id="threejs-container" />
    </div>
  );
}
```

**Résultat attendu :**
- ✅ Affiche FPS en temps réel : `FPS: 60.0`
- ✅ Scène s'anime fluidement
- ✅ Console n'affiche pas d'avertissements de performance

---

### Après Fichier 31-32 (applyPostProcessing.ts, postProcessingMachine)

**Test dans App.tsx :**
```typescript
function App() {
  const { actorRef } = useApplication();

  useEffect(() => {
    actorRef.send({ type: 'LOAD_SCENE' });

    // Activer bloom après 2 secondes
    setTimeout(() => {
      actorRef.send({
        type: 'ENABLE_EFFECT',
        effectName: 'bloom',
        strength: 0.8
      });
    }, 2000);
  }, []);

  return <div id="threejs-container" />;
}
```

**Résultat attendu :**
- ✅ 0-2s : Rendu normal
- ✅ 2s+ : Effet bloom visible (lumières brillent)
- ✅ Console affiche : `[PostProcessing] Bloom enabled: 0.8`

---

### Après Fichier 35-36 (applyMaterialEffect.ts, materialMachine)

**Test dans App.tsx :**
```typescript
function App() {
  const { actorRef } = useApplication();

  useEffect(() => {
    actorRef.send({ type: 'LOAD_SCENE' });

    // Changer couleur matériau après 3 secondes
    setTimeout(() => {
      actorRef.send({
        type: 'UPDATE_MATERIAL',
        materialName: 'Body',
        color: '#FF5733',
        metalness: 0.7,
        roughness: 0.3
      });
    }, 3000);
  }, []);

  return <div id="threejs-container" />;
}
```

**Résultat attendu :**
- ✅ 0-3s : Matériau couleur originale
- ✅ 3s+ : Matériau devient orange (#FF5733)
- ✅ Matériau devient plus métallique et lisse
- ✅ Console affiche : `[Material] Updated Body: color=#ff5733, metalness=0.7, roughness=0.3`

---

## ✅ PHASE 5 - FEATURES UI (Fichiers 39-45)

### Après Fichier 39-40 (AnimationControls.tsx)

**Commande :**
```bash
npm run dev
```

**Résultat attendu :**

**Dans le navigateur :**
- ✅ Panel UI visible avec liste des 29 animations
- ✅ Bouton "Play" pour chaque animation
- ✅ Cliquer sur "Idle" → animation démarre
- ✅ Cliquer sur "Walk" → transition douce vers Walk

**Console :**
- ✅ Affiche : `[UI] Animation selected: Idle`

---

### Après Fichier 41-42 (CameraControls.tsx)

**Résultat attendu :**

**Dans le navigateur :**
- ✅ Sliders pour X, Y, Z position
- ✅ Bouger slider X → caméra bouge horizontalement
- ✅ Bouton "Reset Camera" → caméra revient à position initiale

**Console :**
- ✅ Affiche : `[UI] Camera position updated: {x: 5, y: 3, z: 10}`

---

### Après Fichier 43-44 (MaterialControls.tsx)

**Résultat attendu :**

**Dans le navigateur :**
- ✅ Color picker visible
- ✅ Sliders pour metalness/roughness
- ✅ Changer couleur → matériau change en temps réel
- ✅ Bouger slider metalness → effet métallique augmente

**Console :**
- ✅ Affiche : `[UI] Material updated: color=#ff5733`

---

### Après Fichier 45 (DebugPanel.tsx)

**Résultat attendu :**

**Dans le navigateur :**
- ✅ Panel affiche FPS en temps réel
- ✅ Panel affiche état actuel des machines : `Scene: loaded`, `Animation: playing`, `Render: active`
- ✅ Panel affiche nombre de bones : `484`
- ✅ Panel affiche animation actuelle : `Idle (looping)`

---

## ✅ PHASE 6 - POLISH & TESTS (Fichiers 46-47)

### Après Fichier 46 (Tests unitaires)

**Commande :**
```bash
npm run test
```

**Résultat attendu :**
```
✓ colorConversion.test.ts (3 tests)
  ✓ htmlToHex converts correctly
  ✓ hexToHtml converts correctly
  ✓ round-trip conversion

✓ easingFunctions.test.ts (4 tests)
  ✓ easeInOutCubic at t=0
  ✓ easeInOutCubic at t=1
  ✓ easeInOutCubic at t=0.5
  ✓ easeLinear

✓ applicationMachine.test.ts (5 tests)
  ✓ initializes in 'initializing' state
  ✓ START transitions to 'ready'
  ✓ ERROR_OCCURRED transitions to 'error'
  ✓ error action logs error
  ✓ CLEANUP_REQUESTED transitions to 'cleanup'

Tests: 12 passed (12 total)
```

---

### Après Fichier 47 (Tests E2E)

**Commande :**
```bash
npm run test:e2e
```

**Résultat attendu :**
```
✓ app.spec.ts (3 tests)
  ✓ loads application without errors
  ✓ plays animation on button click
  ✓ updates camera position with slider

Tests: 3 passed (3 total)
```

---

## 🎯 VALIDATION FINALE - TOUTES PHASES

**Commande complète :**
```bash
npm run type-check && npm run test && npm run build && npm run preview
```

**Résultat attendu :**

**1. Type-check :**
```
✓ No TypeScript errors found
```

**2. Tests :**
```
✓ All tests passed (15/15)
```

**3. Build :**
```
✓ Build successful
✓ Bundle size: < 500 KB
✓ No warnings
```

**4. Preview :**
- Ouvre `http://localhost:4173`
- ✅ Application se charge en < 3 secondes
- ✅ Scène 3D visible
- ✅ 60 FPS stable
- ✅ Toutes les UI fonctionnent
- ✅ Aucune erreur console

---

## 📊 CRITÈRES DE SUCCÈS GLOBAUX

### Performance
- ✅ 60 FPS constant (vérifier avec `DebugPanel.tsx`)
- ✅ Time to Interactive < 3s (Chrome DevTools → Performance)
- ✅ Bundle size < 500 KB (vérifier `npm run build`)

### Qualité Code
- ✅ 0 erreurs TypeScript strict mode
- ✅ 0 erreurs ESLint
- ✅ Code formatté (Prettier)
- ✅ Tous les tests passent (unitaires + E2E)

### Fonctionnalités
- ✅ 484 bones chargés et validés
- ✅ 29 animations jouables
- ✅ Transitions fluides entre animations
- ✅ Contrôles caméra fonctionnels
- ✅ Effets post-processing appliqués
- ✅ Matériaux modifiables en temps réel

### Architecture
- ✅ 12 acteurs XState v5 fonctionnent
- ✅ Receptionist pattern implémenté
- ✅ Aucune dépendance cyclique
- ✅ Separation of concerns respectée (5 layers)

---

**FIN G05 - VALIDATION CHECKLIST**
