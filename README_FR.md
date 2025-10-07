# Overmind - Three.js Scene Controller

Application de contrôle et visualisation 3D basée sur Three.js avec gestion d'état XState v5.

## Table des matières

- [À propos](#à-propos)
- [Installation](#installation)
- [Démarrage](#démarrage)
- [Architecture](#architecture)
- [Machines XState](#machines-xstate)
- [Migration Zustand → XState](#migration-zustand--xstate)
- [Documentation](#documentation)
- [Configuration](#configuration)
- [Interface utilisateur](#interface-utilisateur)
- [Développement](#développement)

---

## À propos

**Overmind** est une application de visualisation et contrôle 3D temps réel construite avec :
- **Three.js r178** - Rendu 3D WebGL
- **XState v5** - Gestion d'état par machines à états
- **React 19** - Interface utilisateur
- **Vite** - Build tool et dev server

### Fonctionnalités principales

- Chargement de modèles GLTF/GLB avec compression DRACO
- Post-processing effects (Bloom, tone mapping)
- Système d'animation et révélation d'objets
- Contrôle PBR des matériaux (metalness, roughness, emissive)
- Monitoring de performances temps réel
- Interface de contrôle avec 8 onglets

---

## Installation

### Prérequis

- **Node.js** 18+
- **npm** ou **yarn**

### Installation des dépendances

```bash
npm install
```

### Configuration initiale

1. Copier le fichier `.env.example` vers `.env` :
```bash
cp .env.example .env
```

2. Vérifier les variables d'environnement dans `.env` :
```env
VITE_MODEL_PATH=/models/V3_Eye-3.0.glb
VITE_DRACO_DECODER_URL=https://www.gstatic.com/draco/versioned/decoders/1.5.6/
VITE_DEBUG_MODE=false
VITE_ENABLE_LOGS=false
```

3. Placer le modèle 3D dans `public/models/V3_Eye-3.0.glb` (requis, non versionné)

---

## Démarrage

### Mode développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173` (ou un autre port si 5173 est occupé).

### Mode production

```bash
# Build
npm run build

# Preview du build
npm run preview
```

### Tests

```bash
# Lancer tous les tests
npm test

# Tests spécifiques bloom machine
npm run test:bloom
```

---

## Architecture

### Structure des dossiers

```
src/
├── components/
│   └── V20.001_xstate/              # Version actuelle (XState v5)
│       ├── xstate-v5/               # Système XState
│       │   ├── actors/              # Machines d'état (8 machines)
│       │   │   ├── applicationMachine.ts
│       │   │   ├── bloom/
│       │   │   ├── effects/
│       │   │   ├── lighting/
│       │   │   ├── material/
│       │   │   ├── pbr/
│       │   │   ├── performance/
│       │   │   ├── revelation/
│       │   │   └── scene/
│       │   ├── components/          # Composants React
│       │   │   ├── App.tsx
│       │   │   ├── SceneCanvasWithControls.tsx
│       │   │   └── ControlPanel/
│       │   │       ├── ControlPanel.tsx
│       │   │       └── tabs/        # 8 onglets de contrôle
│       │   ├── context/             # Context React (OvermindProvider)
│       │   └── hooks/               # Hooks personnalisés
│       ├── systems/                 # Systèmes Three.js legacy
│       ├── stores/                  # Zustand stores (en cours de suppression)
│       ├── utils/                   # Utilitaires (materials, presets)
│       └── Claude_guide/            # Documentation technique
│           ├── MEMO_OVERMIND_COMPLET.md
│           ├── H_IMPLEMENTATION_RECAP.md
│           ├── plan_panel_XState/
│           └── archives/
├── AppXState.tsx                    # Point d'entrée XState
└── main.jsx                         # Point d'entrée application
```

### Arborescence actors (machines XState)

```
actors/
├── applicationMachine.ts            # Machine principale (orchestre)
├── application/applicationMachine.ts
├── animation/animationMachine.ts    # Non utilisé (en développement)
├── bloom/bloomMachine.ts            # ✓ Actif
├── camera/cameraMachine.ts          # Non utilisé
├── effects/
│   ├── effectsMachine.ts            # ✓ Actif
│   └── postProcessingMachine.ts     # Non utilisé
├── features/
│   ├── bloomColorPicker/bloomColorPickerMachine.ts
│   └── debugPanel/debugPanelMachine.ts
├── lighting/lightingMachine.ts      # ✓ Actif
├── material/materialMachine.ts      # ✓ Actif
├── materials/materialMachine.ts     # Doublon (legacy)
├── particle/particleMachine.ts      # Non utilisé
├── pbr/pbrMachine.ts                # ✓ Actif
├── performance/performanceMonitor.ts # ✓ Actif
├── render/renderMachine.ts          # Non utilisé
├── rendering/renderingMachine.ts    # Non utilisé
├── revelation/revelationMachine.ts  # ✓ Actif
├── scene/
│   ├── sceneMachine.ts              # ✓ Actif
│   └── sceneLifecycleMachine.ts     # Non utilisé
└── transition/transitionMachine.ts  # Non utilisé
```

### Architecture XState v5

L'application utilise **XState v5** pour la gestion d'état avec une architecture basée sur des **actors** (machines d'état indépendantes).

**Point d'entrée :**
```
src/main.jsx
  → src/AppXState.tsx
    → src/components/V20.001_xstate/xstate-v5/components/App.tsx
```

**Machine principale :**
- `applicationMachine.ts` - Orchestre tous les actors enfants via spawning

---

## Machines XState

### Machines actives (8 au total)

| Machine | Fichier | Description | Onglet UI |
|---------|---------|-------------|-----------|
| **Application** | `actors/applicationMachine.ts` | Machine principale, spawn tous les actors | - |
| **Bloom** | `actors/bloom/bloomMachine.ts` | Gestion effet bloom (UnrealBloomPass) | Bloom |
| **Lighting** | `actors/lighting/lightingMachine.ts` | Contrôle lumières DirectionalLight | Lighting |
| **PBR** | `actors/pbr/pbrMachine.ts` | Tone mapping et exposition HDR | PBR |
| **Materials** | `actors/material/materialMachine.ts` | Gestion matériaux (emissive, metalness, roughness) | Materials |
| **Scene** | `actors/scene/sceneMachine.ts` | Configuration scène (background, fog) | Scene |
| **Effects** | `actors/effects/effectsMachine.ts` | Effets post-processing additionnels | Effects |
| **Performance** | `actors/performance/performanceMonitor.ts` | Monitoring FPS et performances | Performance |
| **Revelation** | `actors/revelation/revelationMachine.ts` | Système d'animation de révélation | Revelation |

### Machines en développement (non actives)

Ces machines existent dans le code mais ne sont pas encore intégrées dans `applicationMachine` :
- `animationMachine` - Système d'animation avancé
- `cameraMachine` - Contrôle caméra
- `particleMachine` - Système de particules
- `renderMachine` / `renderingMachine` - Boucle de rendu custom
- `sceneLifecycleMachine` - Lifecycle scène avancé
- `transitionMachine` - Transitions entre scènes
- `bloomColorPickerMachine` - UI color picker
- `debugPanelMachine` - UI debug panel

### Communication inter-machines

Les machines communiquent via :
- **Events** - Envoi d'événements directs entre actors
- **Context partagé** - Références aux objets Three.js (scene, renderer, camera)
- **Actors spawning** - La machine `applicationMachine` spawn tous les actors enfants

Exemple d'implémentation :
```typescript
// applicationMachine.ts
export const applicationMachine = setup({
  actors: {
    bloom: bloomMachine,
    lighting: lightingMachine,
    pbr: pbrMachine,
    // ...
  }
}).createMachine({
  states: {
    running: {
      entry: [
        assign({
          bloomActor: ({ spawn }) => spawn('bloom', { systemId: 'bloom' }),
          lightingActor: ({ spawn }) => spawn('lighting', { systemId: 'lighting' }),
          // ...
        })
      ]
    }
  }
});
```

---

## Migration Zustand → XState

### Historique des versions

#### V19.8 et antérieures - Zustand + Systèmes Three.js
- Gestion d'état avec Zustand stores
- Systèmes Three.js indépendants (BloomControlCenter, SecurityIRISManager, etc.)
- Couplage fort entre UI et logique métier
- Architecture monolithique

#### V19.9 - Migration partielle XState v5
- Introduction des premières machines XState (bloom, lighting, pbr)
- Coexistence Zustand/XState via bridges
- Refactoring progressif de l'architecture
- Tests et validation de l'approche XState

#### V20.001 - XState v5 (version actuelle)
- Architecture XState v5 finalisée
- 8 machines actives + 10 machines en développement
- Séparation claire UI / logique métier
- Zustand maintenu pour compatibilité legacy (suppression progressive)

### Différences principales

| Aspect | Zustand (V19.8) | XState v5 (V20.001) |
|--------|-----------------|---------------------|
| **État** | Stores globaux mutables | Machines avec état immuable |
| **Logique métier** | Mixée dans hooks et composants | Centralisée dans machines |
| **Debugging** | Console.log manuel | XState Inspector + DevTools |
| **Tests** | Complexe, nécessite mocks | State machine testing natif |
| **Type safety** | TypeScript partiel | TypeScript complet avec inférence |
| **Prédictibilité** | Mutations d'état imprévisibles | Transitions d'état explicites |
| **Documentation** | Code comments | Graphes de machines visuels |

### Système de compatibilité

Un système de **bridges** permet la coexistence temporaire :
- Situé dans `src/components/V20.001_xstate/bridges/`
- Permet aux anciens systèmes d'interagir avec les nouvelles machines
- En cours de suppression progressive

---

## Documentation

### Documentation XState v5

**Officielle :**
- [XState v5 Documentation](https://stately.ai/docs/xstate) - Documentation complète
- [XState v5 Migration Guide](https://stately.ai/docs/migration) - Guide de migration v4→v5
- [Actors Guide](https://stately.ai/docs/actors) - Système d'actors
- [State Machine Testing](https://stately.ai/docs/testing) - Tests unitaires

**Interne (documentation de développement) :**

```
src/components/V20.001_xstate/Claude_guide/
├── MEMO_OVERMIND_COMPLET.md           # Vision globale, historique, statut
├── H_IMPLEMENTATION_RECAP.md          # Récapitulatif implémentation Phase H
├── plan_panel_XState/
│   ├── 00_OVERVIEW_PLAN.md            # Vue d'ensemble du plan
│   ├── Phase_A_BloomMachine/          # Implémentation Bloom
│   ├── Phase_B_LightingMachine/       # Implémentation Lighting
│   ├── Phase_C_PBRMachine/            # Implémentation PBR
│   ├── Phase_D_PerformanceMonitor/    # Implémentation Performance
│   ├── Phase_E_ControlPanel/          # Implémentation UI
│   ├── Phase_G_EffectsMachine/        # Implémentation Effects
│   └── Phase_H_SceneMachine/          # Implémentation Scene
├── archives/                          # Documentation archivée
├── audits/                            # Audits de code
└── refactoring/                       # Plans de refactoring
```

**Fichiers à lire en priorité :**
1. `MEMO_OVERMIND_COMPLET.md` - Comprendre le contexte global du projet
2. `H_IMPLEMENTATION_RECAP.md` - État actuel de l'implémentation (47 fichiers)
3. `plan_panel_XState/00_OVERVIEW_PLAN.md` - Plan général de migration

### Documentation Three.js

**Bibliothèques utilisées :**
- [Three.js r178](https://threejs.org/docs/) - Bibliothèque 3D WebGL
- [UnrealBloomPass](https://threejs.org/docs/#examples/en/postprocessing/UnrealBloomPass) - Effet bloom
- [EffectComposer](https://threejs.org/docs/#examples/en/postprocessing/EffectComposer) - Gestion post-processing
- [GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader) - Chargement GLTF/GLB
- [DRACOLoader](https://threejs.org/docs/#examples/en/loaders/DRACOLoader) - Compression DRACO

**Concepts Three.js utilisés :**
- Scene, Renderer, Camera (OrbitControls)
- DirectionalLight avec ombres
- PBR Materials (MeshStandardMaterial)
- Tone mapping (ACESFilmic, Reinhard, Cineon, etc.)
- Animation system (AnimationMixer, AnimationClip)

---

## Configuration

### Variables d'environnement

| Variable | Description | Défaut | Obligatoire |
|----------|-------------|--------|-------------|
| `VITE_MODEL_PATH` | Chemin vers le modèle 3D principal | `/models/V3_Eye-3.0.glb` | Oui |
| `VITE_DRACO_DECODER_URL` | URL du décodeur DRACO | `https://www.gstatic.com/draco/...` | Non (fallback local) |
| `VITE_DEBUG_MODE` | Active les logs debug | `false` | Non |
| `VITE_ENABLE_LOGS` | Active tous les logs | `false` | Non |

### Modèle 3D

**Fichier requis :**
- `public/models/V3_Eye-3.0.glb` (non versionné Git)

**Format supporté :**
- GLTF 2.0 / GLB (binary)
- Compression DRACO recommandée
- Animations incluses
- Matériaux PBR (roughness/metalness maps)

**Structure attendue du modèle :**

Groupes d'objets nommés (pour système révélation) :
- `revealRings` - Anneaux de révélation (7 objets)
- `eyeRings` - Anneaux d'yeux (2 objets : Anneaux_Eye_Ext, Anneaux_Eye_Int)
- `iris` - Objet IRIS central

Matériaux attendus :
- `BloomArea` - Matériau avec bloom actif
- `Material-metal050-effet-chrome` - Matériau métallique
- Autres matériaux PBR standard

Animations permanentes (auto-play) :
- `Anneaux_Eye_Ext_Action` - Rotation anneau externe
- `Anneaux_Eye_Int_Action` - Rotation anneau interne
- `Little_1_Mouv` à `Little_13_Mouv` - Animations bras
- `Bras_L1_Mouv`, `Bras_L2_Mouv`, `Bras_R1_Mouv`, `Bras_R2_Mouv`

### Configuration DRACO

Décodeur DRACO local (fallback si CDN échoue) :
```
public/draco/
├── draco_decoder.js
├── draco_decoder.wasm
├── draco_encoder.js
├── draco_wasm_wrapper.js
└── gltf/
    ├── draco_decoder.js
    ├── draco_decoder.wasm
    ├── draco_encoder.js
    └── draco_wasm_wrapper.js
```

Configuration dans le code :
```typescript
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/gltf/');
```

---

## Interface utilisateur

### ControlPanel

Interface de contrôle flottante (coin haut gauche) avec 8 onglets :

| Onglet | Machine | Contrôles |
|--------|---------|-----------|
| **Bloom** | bloomMachine | Strength, Radius, Threshold, Visibility |
| **Lighting** | lightingMachine | Intensity, Position (x,y,z), Shadows |
| **PBR** | pbrMachine | Tone Mapping, Exposure |
| **Materials** | materialMachine | Emissive (color, intensity), Metalness, Roughness par groupe |
| **Scene** | sceneMachine | Background color, Fog, Grid helper |
| **Effects** | effectsMachine | Post-processing effects additionnels |
| **Performance** | performanceMonitor | FPS, Memory, Render time |
| **Revelation** | revelationMachine | Animation révélation, Timing, Groups |

### Groupes de matériaux

Le système de materials gère 4 groupes d'objets distincts :

1. **revealRings** - Anneaux magiques de révélation (7 objets)
   - Emissive color par défaut : `#ffaa00`
   - Metalness/Roughness individuels

2. **eyeRings** - Anneaux d'yeux externes/internes (2 objets)
   - Emissive color par défaut : `#4488ff`
   - Rotation permanente via animations

3. **iris** - IRIS central (1 objet)
   - Emissive color par défaut : `#00ff88`
   - Point focal de la scène

4. **magicRings** - Groupe legacy (à vérifier/supprimer)

### Raccourcis clavier

Actuellement non implémentés (roadmap).

---

## Développement

### Ajouter une nouvelle machine

#### 1. Créer la machine

```typescript
// src/components/V20.001_xstate/xstate-v5/actors/myMachine/myMachine.ts
import { setup, assign } from 'xstate';

interface MyContext {
  value: number;
  isActive: boolean;
}

type MyEvents =
  | { type: 'START' }
  | { type: 'STOP' }
  | { type: 'UPDATE'; value: number };

export const myMachine = setup({
  types: {
    context: {} as MyContext,
    events: {} as MyEvents
  }
}).createMachine({
  id: 'myMachine',
  initial: 'idle',
  context: {
    value: 0,
    isActive: false
  },
  states: {
    idle: {
      on: {
        START: {
          target: 'active',
          actions: assign({ isActive: true })
        }
      }
    },
    active: {
      on: {
        STOP: {
          target: 'idle',
          actions: assign({ isActive: false })
        },
        UPDATE: {
          actions: assign({
            value: ({ event }) => event.value
          })
        }
      }
    }
  }
});
```

#### 2. Intégrer dans applicationMachine

```typescript
// applicationMachine.ts
import { myMachine } from './myMachine/myMachine';

export interface ApplicationContext {
  myActor: ActorRefFrom<typeof myMachine> | null;
  // ...
}

export const applicationMachine = setup({
  actors: {
    myMachine: myMachine,
    // ...
  }
}).createMachine({
  states: {
    running: {
      entry: [
        assign({
          myActor: ({ spawn }) => spawn('myMachine', { systemId: 'myMachine' })
        })
      ]
    }
  }
});
```

#### 3. Exposer dans le hook

```typescript
// hooks/useApplication.ts
export const useApplication = () => {
  const myActor = useSelector(actorRef, (state) => state.context.myActor);

  return {
    myActor,
    // ...
  };
};
```

#### 4. Utiliser dans les composants

```typescript
// components/MyComponent.tsx
const { myActor } = useApplication();

// Envoyer un événement
myActor.send({ type: 'START' });

// Lire l'état
const value = useSelector(myActor, (state) => state.context.value);
```

### Debugging XState

#### XState Inspector (recommandé)

```typescript
// App.tsx
import { createBrowserInspector } from '@statelyai/inspect';

const inspector = createBrowserInspector();

const actor = createActor(applicationMachine, {
  inspect: inspector.inspect
});
```

Accès à l'inspector : `http://localhost:5173/__xstate__`

#### Chrome DevTools

- Extension XState (si installée) : vue graphique des états
- Timeline des transitions
- Inspection du context en temps réel

#### Logs console

Structure des logs :
```
[nomMachine] Action effectuée
[nomMachine] ✓ Success message
[nomMachine] ✗ Error message
```

Activer les logs :
```env
VITE_DEBUG_MODE=true      # Logs debug uniquement
VITE_ENABLE_LOGS=true     # Tous les logs
```

Filtrer les logs par machine :
```bash
npm run dev | grep "\[bloomMachine\]"
```

### Tests

#### Tests unitaires (Jest)

```bash
# Lancer tous les tests
npm test

# Tests spécifiques
npm run test:bloom

# Mode watch
npm test -- --watch
```

Structure des tests :
```typescript
// __tests__/bloomMachine.test.ts
import { createActor } from 'xstate';
import { bloomMachine } from '../bloomMachine';

describe('bloomMachine', () => {
  it('should transition to enabled when ENABLE event is sent', () => {
    const actor = createActor(bloomMachine).start();

    actor.send({ type: 'ENABLE' });

    expect(actor.getSnapshot().value).toBe('enabled');
  });
});
```

#### Tests d'intégration

À développer : tests end-to-end avec Playwright ou Cypress.

### Conventions de code

#### Nommage

- Machines : `camelCaseMachine.ts`
- Types : `PascalCase`
- Events : `SCREAMING_SNAKE_CASE`
- Actions/Guards : `camelCase`

#### Structure fichiers machine

```
actors/myMachine/
├── myMachine.ts           # Machine principale
├── types.ts               # Types TypeScript
├── actions.ts             # Actions réutilisables
├── guards.ts              # Guards réutilisables
└── __tests__/
    └── myMachine.test.ts  # Tests
```

#### Logs

Toujours préfixer avec le nom de la machine :
```typescript
console.log('[myMachine] Action effectuée');
console.log('[myMachine] ✓ Success');
console.error('[myMachine] ✗ Error:', error);
```

---

## Dépendances principales

```json
{
  "dependencies": {
    "three": "^0.178.0",           // Rendu 3D WebGL
    "xstate": "^5.22.0",           // State machines
    "@xstate/react": "^4.1.3",     // Hooks React pour XState
    "@xstate/inspect": "0.7.0",    // Inspector XState
    "react": "^19.1.0",            // UI library
    "react-dom": "^19.1.0",
    "zustand": "^5.0.8",           // Legacy store (à supprimer)
    "@react-three/drei": "^10.7.4",
    "@react-three/postprocessing": "^3.0.4",
    "postprocessing": "^6.37.6",
    "draco3dgltf": "^1.5.7"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "vite": "^6.3.5",
    "@types/three": "^0.178.1",
    "jest": "^30.1.3",
    "ts-jest": "^29.4.4"
  }
}
```

---

## Roadmap

### Phase actuelle (V20.001) - Q4 2025
- [x] Architecture XState v5 finalisée
- [x] 8 machines actives opérationnelles
- [x] Interface de contrôle avec 8 onglets
- [x] Système de révélation fonctionnel
- [x] Monitoring de performances
- [ ] Tests unitaires machines (en cours)

### Prochaines phases

#### Phase I - Finalisation intégration (Q1 2026)
- [ ] Activer les machines en développement (animation, camera, particle)
- [ ] Compléter les tests unitaires (coverage > 80%)
- [ ] Supprimer définitivement Zustand
- [ ] Supprimer les bridges de compatibilité
- [ ] Documentation interactive (Storybook)

#### Phase J - Optimisations (Q1 2026)
- [ ] Performance profiling (GPU, CPU)
- [ ] Lazy loading des machines
- [ ] Worker threads pour calculs lourds
- [ ] Memory leak detection et fixes

#### Phase K - Nouvelles fonctionnalités (Q2 2026)
- [ ] Système HDRI environment (RGBELoader, PMREMGenerator)
- [ ] Presets système complet (save/load configurations)
- [ ] Système de particules avancé
- [ ] Animation timeline editor

#### Phase L - Production (Q2 2026)
- [ ] Tests E2E (Playwright)
- [ ] CI/CD pipeline
- [ ] Documentation utilisateur
- [ ] Déploiement production

---

## Support et troubleshooting

### Problèmes fréquents

#### Le modèle ne charge pas

**Symptômes :**
- Console : `Error loading GLB`
- Écran noir
- Loading infini

**Solutions :**
1. Vérifier que `V3_Eye-3.0.glb` existe dans `public/models/`
2. Vérifier la console pour erreurs DRACO decoder
3. Vérifier la variable `VITE_MODEL_PATH` dans `.env`
4. Tester le fallback DRACO local : supprimer `VITE_DRACO_DECODER_URL`

#### Performances faibles (< 30 FPS)

**Solutions :**
1. Réduire bloom strength et radius
2. Désactiver les ombres (Lighting tab)
3. Vérifier l'onglet Performance pour identifier goulot d'étranglement
4. Vérifier GPU utilisé (discrete vs integrated)

#### Machine ne répond pas aux événements

**Solutions :**
1. Activer les logs : `VITE_DEBUG_MODE=true`
2. Vérifier que l'actor est spawned : console `[applicationMachine] ✅ All actors spawned`
3. Vérifier les events envoyés dans la console
4. Utiliser XState Inspector pour voir les transitions

#### Erreurs TypeScript

**Solutions :**
1. Supprimer `node_modules` et `package-lock.json`, puis `npm install`
2. Vérifier les versions de `@types/three` et `three` (doivent matcher)
3. Vérifier les imports : utiliser `import type` pour les types

### Logs utiles

```bash
# Voir tous les logs de bloom
npm run dev 2>&1 | grep "\[bloomMachine\]"

# Voir les erreurs uniquement
npm run dev 2>&1 | grep "✗"

# Mode verbose complet
VITE_DEBUG_MODE=true VITE_ENABLE_LOGS=true npm run dev

# Analyser les performances
npm run dev 2>&1 | grep "\[performanceMonitor\]"
```

### Débugger avec Chrome DevTools

1. Ouvrir DevTools (F12)
2. Onglet **Console** : voir les logs machines
3. Onglet **Performance** : profiler GPU/CPU
4. Onglet **Memory** : détecter memory leaks
5. Onglet **Network** : vérifier chargement assets

---

## Contribuer

### Workflow Git

1. Créer une branche depuis `develop` :
```bash
git checkout develop
git pull origin develop
git checkout -b feature/ma-nouvelle-feature
```

2. Développer avec commits atomiques
3. Tester localement : `npm test && npm run build`
4. Push et créer une Pull Request vers `develop`

### Guidelines

- **Commits** : utiliser conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- **Code** : suivre les conventions TypeScript/React
- **Tests** : coverage minimum 70% pour nouvelles features
- **Documentation** : mettre à jour README si nécessaire

---

## License

MIT

---

## Références

### Documentation officielle
- [XState v5 Documentation](https://stately.ai/docs)
- [Three.js Documentation](https://threejs.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

### Documentation interne
- [MEMO_OVERMIND_COMPLET.md](src/components/V20.001_xstate/Claude_guide/MEMO_OVERMIND_COMPLET.md)
- [H_IMPLEMENTATION_RECAP.md](src/components/V20.001_xstate/Claude_guide/H_IMPLEMENTATION_RECAP.md)
- [Plan XState](src/components/V20.001_xstate/Claude_guide/plan_panel_XState/)

### Ressources externes
- [State Machines: Introduction](https://statecharts.dev/)
- [Three.js Journey](https://threejs-journey.com/)
- [WebGL Fundamentals](https://webglfundamentals.org/)
