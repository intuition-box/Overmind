# 📈 F05 - SCALABILITY DESIGN - VISION CIBLE

**Date** : 2 octobre 2025
**Phase** : F - Vision Cible
**Session** : F05 - Design Scalabilité
**Statut** : ✅ COMPLET

---

## 📋 VUE D'ENSEMBLE

Le **Scalability Design** définit comment l'architecture XState v5 peut **évoluer** pour supporter de nouvelles fonctionnalités, plus d'utilisateurs, et des cas d'usage complexes sans refactoring majeur.

---

## 🎯 DIMENSIONS DE SCALABILITÉ

### **1. Feature Scalability (Nouvelles fonctionnalités)**

**Principe** : Ajouter features sans modifier code existant (Open/Closed Principle)

**Architecture Actor Model** :
```typescript
// ✅ Ajouter nouveau actor sans toucher existants
const newFeatureActor = setup({
  /* ... */
}).createMachine({
  /* ... */
});

// Enregistrer dans Receptionist
receptionist.register('newFeature', newFeatureActorRef);

// Découverte automatique
const newFeature = receptionist.find('newFeature');
newFeature?.send({ type: 'TRIGGER' });
```

**Exemples features futures** :

#### **Feature 1 : Multi-Model Support**
```typescript
// Nouveau actor pour gérer plusieurs modèles
const multiModelMachine = setup({
  types: {} as {
    context: {
      models: Map<string, THREE.Group>;
      activeModelId: string;
    };
    events:
      | { type: 'LOAD_MODEL'; id: string; path: string }
      | { type: 'SWITCH_MODEL'; id: string };
  }
}).createMachine({
  initial: 'idle',
  states: {
    idle: {
      on: {
        LOAD_MODEL: { target: 'loading' }
      }
    },
    loading: {
      invoke: {
        src: loadGLBFile,
        input: ({ event }) => ({ path: event.path }),
        onDone: {
          target: 'ready',
          actions: assign({
            models: ({ context, event }) => {
              const newModels = new Map(context.models);
              newModels.set(event.id, event.output.model);
              return newModels;
            }
          })
        }
      }
    }
  }
});

// ✅ Aucun changement dans applicationMachine ou sceneLifecycleMachine
```

#### **Feature 2 : Audio System**
```typescript
// Nouveau actor pour audio (musique + sons)
const audioMachine = setup({
  types: {} as {
    context: {
      audioContext: AudioContext | null;
      sounds: Map<string, AudioBuffer>;
      currentTrack: string | null;
    };
    events:
      | { type: 'PLAY_SOUND'; name: string }
      | { type: 'PLAY_MUSIC'; trackId: string }
      | { type: 'STOP_MUSIC' };
  }
}).createMachine({
  /* ... */
});

// Communication avec AnimationActor via events
animationActor.subscribe((state) => {
  if (state.matches('playing')) {
    audioActor.send({ type: 'PLAY_SOUND', name: 'animation-start' });
  }
});

// ✅ Zero coupling avec actors existants
```

#### **Feature 3 : Multiplayer/Collaborative**
```typescript
// Nouveau actor pour sync multi-utilisateurs
const collaborationMachine = setup({
  types: {} as {
    context: {
      webSocket: WebSocket | null;
      peers: Map<string, PeerState>;
      localChanges: Change[];
    };
    events:
      | { type: 'CONNECT'; roomId: string }
      | { type: 'LOCAL_CHANGE'; change: Change }
      | { type: 'REMOTE_CHANGE'; change: Change };
  }
}).createMachine({
  initial: 'disconnected',
  states: {
    disconnected: {
      on: {
        CONNECT: { target: 'connecting' }
      }
    },
    connecting: {
      invoke: {
        src: connectToWebSocket,
        onDone: 'connected'
      }
    },
    connected: {
      on: {
        LOCAL_CHANGE: {
          actions: ['broadcastChange', 'applyLocalChange']
        },
        REMOTE_CHANGE: {
          actions: ['applyRemoteChange']
        }
      }
    }
  }
});

// ✅ Plug & play sans refactoring
```

---

### **2. Code Scalability (Codebase size)**

**Principe** : Organisation modulaire, lazy loading, code splitting

**Structure fichiers scalable** :
```
src/
├── actors/
│   ├── application/
│   │   ├── applicationMachine.ts
│   │   └── applicationMachine.test.ts
│   ├── scene/
│   │   ├── sceneLifecycleMachine.ts
│   │   ├── modelLoaderMachine.ts
│   │   └── index.ts
│   ├── rendering/
│   │   ├── renderingMachine.ts
│   │   ├── bloomMachine.ts
│   │   ├── particleMachine.ts
│   │   └── index.ts
│   ├── features/
│   │   ├── bloomColorPicker/
│   │   │   ├── bloomColorPickerMachine.ts
│   │   │   └── bloomColorPickerMachine.test.ts
│   │   ├── debugPanel/
│   │   └── animationControl/
│   └── index.ts (barrel export)
│
├── services/
│   ├── threeJS/
│   │   ├── loadGLBFile.ts
│   │   ├── setupScene.ts
│   │   └── index.ts
│   ├── animation/
│   ├── rendering/
│   └── index.ts
│
├── hooks/
│   ├── useOvermindApp.ts
│   ├── useSceneLifecycle.ts
│   └── index.ts
│
├── components/
│   ├── OvermindApp/
│   ├── BloomColorPicker/
│   └── DebugPanel/
│
└── utils/
    ├── receptionist.ts
    ├── easingFunctions.ts
    └── index.ts
```

**Lazy loading actors** :
```typescript
// Charger actors on-demand
const featureActors = new Map<string, Promise<any>>();

async function loadFeatureActor(featureName: string) {
  if (!featureActors.has(featureName)) {
    const actorModule = await import(`./actors/features/${featureName}`);
    featureActors.set(featureName, actorModule.default);
  }
  return featureActors.get(featureName);
}

// Usage
const debugPanelMachine = await loadFeatureActor('debugPanel');
const actorRef = spawn(debugPanelMachine);
```

**Bundle splitting** :
```typescript
// webpack.config.js
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      // Three.js séparé
      three: {
        test: /[\\/]node_modules[\\/]three[\\/]/,
        name: 'three',
        priority: 10
      },
      // XState séparé
      xstate: {
        test: /[\\/]node_modules[\\/]xstate[\\/]/,
        name: 'xstate',
        priority: 10
      },
      // Actors features (lazy)
      features: {
        test: /[\\/]src[\\/]actors[\\/]features[\\/]/,
        name: 'features',
        priority: 5
      }
    }
  }
}
```

---

### **3. Team Scalability (Nombre de développeurs)**

**Principe** : Isolation, contracts clairs, pas de conflits merge

**Stratégie 1 : Actor Ownership** :
```
Team 1 (Rendering) :
  - renderingMachine.ts
  - bloomMachine.ts
  - particleMachine.ts
  - lightingMachine.ts

Team 2 (Scene) :
  - sceneLifecycleMachine.ts
  - modelLoaderMachine.ts
  - animationMachine.ts

Team 3 (Features UI) :
  - bloomColorPickerMachine.ts
  - debugPanelMachine.ts
  - animationControlMachine.ts

→ Zero conflits (fichiers séparés)
```

**Stratégie 2 : Event Contracts** :
```typescript
// shared/events.ts (contrat partagé)
export type AppEvents =
  | { type: 'SCENE_READY'; scene: THREE.Scene }
  | { type: 'MODEL_LOADED'; model: THREE.Group }
  | { type: 'ANIMATION_STARTED'; name: string }
  | { type: 'COLOR_APPLIED'; color: number };

// Chaque team implémente son actor avec ce contrat
// Pas besoin de se coordonner sur l'implémentation interne
```

**Stratégie 3 : Feature Flags** :
```typescript
// Activer/désactiver features en dev
const FEATURE_FLAGS = {
  MULTIPLAYER: false, // Team 3 en cours dev
  AUDIO_SYSTEM: false, // Team 2 en cours dev
  ADVANCED_PARTICLES: true // Team 1 released
};

if (FEATURE_FLAGS.MULTIPLAYER) {
  const collabActor = spawn(collaborationMachine);
  receptionist.register('collaboration', collabActor);
}
```

---

### **4. User Scalability (Nombre d'utilisateurs)**

**Principe** : Performance constante quel que soit le nombre d'utilisateurs

**Optimisations** :

#### **Client-side caching**
```typescript
// Service Worker caching (offline-first)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// IndexedDB pour state persistence
const db = await openDB('overmind-db', 1, {
  upgrade(db) {
    db.createObjectStore('state');
  }
});

await db.put('state', snapshot, 'application-state');
```

#### **CDN distribution**
```typescript
// Cloudflare Workers pour edge caching
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request: Request) {
  const cache = caches.default;
  let response = await cache.match(request);

  if (!response) {
    response = await fetch(request);
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=31536000');
    response = new Response(response.body, { headers });
    event.waitUntil(cache.put(request, response.clone()));
  }

  return response;
}
```

#### **Load balancing (si backend)**
```typescript
// Multiple API servers
const API_SERVERS = [
  'https://api1.overmind.app',
  'https://api2.overmind.app',
  'https://api3.overmind.app'
];

function getAPIServer() {
  return API_SERVERS[Math.floor(Math.random() * API_SERVERS.length)];
}

const response = await fetch(`${getAPIServer()}/data`);
```

---

### **5. Data Scalability (Volume de données)**

**Principe** : Gérer grandes quantités de données (animations, models, states)

**Stratégie 1 : Pagination animations**
```typescript
// Charger animations par batch
const animationMachine = setup({
  types: {} as {
    context: {
      loadedAnimations: THREE.AnimationClip[];
      currentPage: number;
      pageSize: number;
    };
  }
}).createMachine({
  states: {
    loadingPage: {
      invoke: {
        src: async ({ input }) => {
          const start = input.currentPage * input.pageSize;
          const end = start + input.pageSize;
          return input.allAnimations.slice(start, end);
        },
        onDone: {
          actions: assign({
            loadedAnimations: ({ context, event }) => [
              ...context.loadedAnimations,
              ...event.output
            ]
          })
        }
      }
    }
  }
});
```

**Stratégie 2 : Virtual scrolling (animations list)**
```typescript
// React Window pour listes longues
import { FixedSizeList } from 'react-window';

function AnimationList({ animations }: { animations: string[] }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={animations.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {animations[index]}
        </div>
      )}
    </FixedSizeList>
  );
}
// Render uniquement éléments visibles (performance constante)
```

**Stratégie 3 : State snapshots (time-travel debugging)**
```typescript
// Limite historique states
const STATE_HISTORY_LIMIT = 100;

const stateHistory: Snapshot<any>[] = [];

actorRef.subscribe((state) => {
  stateHistory.push(state);
  if (stateHistory.length > STATE_HISTORY_LIMIT) {
    stateHistory.shift(); // Remove oldest
  }
});
```

---

## 🔌 PLUGIN ARCHITECTURE

### **Système de plugins extensible**

```typescript
// Plugin interface
interface OvermindPlugin {
  name: string;
  version: string;
  install: (app: OvermindApp) => void;
  uninstall?: () => void;
}

// Plugin example : Stats display
const statsPlugin: OvermindPlugin = {
  name: 'stats-display',
  version: '1.0.0',
  install: (app) => {
    const stats = new Stats();
    document.body.appendChild(stats.dom);

    app.onFrameRender(() => {
      stats.update();
    });
  },
  uninstall: () => {
    stats.dom.remove();
  }
};

// Plugin registry
class PluginRegistry {
  private plugins = new Map<string, OvermindPlugin>();

  register(plugin: OvermindPlugin) {
    this.plugins.set(plugin.name, plugin);
    plugin.install(this.app);
  }

  unregister(pluginName: string) {
    const plugin = this.plugins.get(pluginName);
    if (plugin?.uninstall) {
      plugin.uninstall();
    }
    this.plugins.delete(pluginName);
  }
}

// Usage
const registry = new PluginRegistry();
registry.register(statsPlugin);
registry.register(audioPlugin);
registry.register(multiplayerPlugin);
```

**Plugins futurs** :
- **VR/AR Plugin** : Support WebXR
- **Physics Plugin** : Cannon.js/Ammo.js integration
- **Analytics Plugin** : Google Analytics/Mixpanel
- **A11y Plugin** : Accessibility features
- **Export Plugin** : Screenshot/Video export

---

## 📦 MICROSERVICES (si backend futur)

### **Architecture découplée**

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│  API Gateway │────▶│   Services   │
│  (XState v5) │     │  (GraphQL)   │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
                              │                    │
                              │            ┌───────┴────────┐
                              │            │                │
                              │      ┌─────▼─────┐  ┌──────▼──────┐
                              │      │  Model    │  │ Animation   │
                              │      │  Service  │  │  Service    │
                              │      └───────────┘  └─────────────┘
                              │            │                │
                              │      ┌─────▼─────┐  ┌──────▼──────┐
                              │      │  Asset    │  │   User      │
                              │      │  Storage  │  │  Service    │
                              │      │  (S3)     │  │  (Auth)     │
                              │      └───────────┘  └─────────────┘
```

**GraphQL Schema** :
```graphql
type Query {
  model(id: ID!): Model
  animations(modelId: ID!): [Animation!]!
  user: User
}

type Mutation {
  uploadModel(file: Upload!): Model!
  saveAnimation(input: AnimationInput!): Animation!
  applyBloomColor(color: String!): Boolean!
}

type Subscription {
  modelLoaded(modelId: ID!): ModelLoadProgress!
  animationPlaying(animationId: ID!): AnimationState!
}

type Model {
  id: ID!
  name: String!
  glbUrl: String!
  boneCount: Int!
  animations: [Animation!]!
}
```

**Frontend integration** :
```typescript
// Apollo Client + XState
const modelLoaderMachine = setup({
  types: {} as {
    context: {
      apolloClient: ApolloClient<any>;
      modelId: string;
    };
  }
}).createMachine({
  states: {
    loading: {
      invoke: {
        src: async ({ input }) => {
          const { data } = await input.apolloClient.query({
            query: GET_MODEL,
            variables: { id: input.modelId }
          });
          return data.model;
        },
        onDone: 'ready'
      }
    }
  }
});
```

---

## 🌍 INTERNATIONALIZATION (i18n)

### **Multi-langue support**

```typescript
// i18n actor
const i18nMachine = setup({
  types: {} as {
    context: {
      locale: 'en' | 'fr' | 'es' | 'de';
      translations: Record<string, string>;
    };
    events:
      | { type: 'CHANGE_LOCALE'; locale: string }
      | { type: 'LOAD_TRANSLATIONS' };
  }
}).createMachine({
  initial: 'loading',
  states: {
    loading: {
      invoke: {
        src: async ({ input }) => {
          const response = await fetch(`/locales/${input.locale}.json`);
          return response.json();
        },
        onDone: {
          target: 'ready',
          actions: assign({
            translations: ({ event }) => event.output
          })
        }
      }
    },
    ready: {
      on: {
        CHANGE_LOCALE: { target: 'loading' }
      }
    }
  }
});

// Usage
function useTranslation() {
  const actorRef = useActorRef(i18nMachine);
  const translations = useSelector(actorRef, (state) => state.context.translations);

  const t = useCallback((key: string) => {
    return translations[key] || key;
  }, [translations]);

  return { t };
}

// Component
function DebugPanel() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('debugPanel.title')}</h1>
      <button>{t('debugPanel.apply')}</button>
    </div>
  );
}
```

---

## 📊 SCALABILITY METRICS

### **Mesures de scalabilité**

| Dimension | Métrique | Objectif |
|-----------|----------|----------|
| **Features** | Temps ajout feature | < 1 jour dev |
| **Code** | Lines of code (LOC) | Linéaire avec features |
| **Team** | Merge conflicts | < 5% PRs |
| **Users** | Response time p95 | < 500ms (quel que soit traffic) |
| **Data** | Animation load time | Constant (pagination) |
| **Bundle** | Size per feature | < 50KB gzipped |

### **Load testing targets**

```bash
# Artillery load test
artillery run load-test.yml

# Résultats attendus :
# - 1000 users concurrents : p95 < 500ms ✅
# - 10000 users concurrents : p95 < 1s ✅
# - 100000 users concurrents : CDN + edge caching
```

---

## ✅ CHECKLIST SCALABILITY

- [ ] Actor Model (découplage total)
- [ ] Receptionist pattern (discovery)
- [ ] Event contracts (types partagés)
- [ ] Code splitting (lazy actors)
- [ ] Feature flags
- [ ] Plugin architecture
- [ ] Service Worker caching
- [ ] CDN distribution
- [ ] Virtual scrolling (grandes listes)
- [ ] Pagination (animations/data)
- [ ] State snapshots (limite historique)
- [ ] i18n support
- [ ] GraphQL API (si backend)
- [ ] Load testing (Artillery)
- [ ] Monitoring scalabilité

---

**Prochaine** : F06 Maintainability Framework

