# 🔍 SESSION C01 - RECHERCHE APPROFONDIE
## God Objects Patterns - Décomposition XState Actor Model

**Date** : 26 septembre 2025
**Phase** : C - Recherche Approfondie
**Session** : C01 - God Objects Patterns
**Priorité** : 🚨 **URGENTE** - Blockers critiques identifiés
**Statut** : 🔄 **EN COURS**

---

## 🎯 PROBLÉMATIQUES CRITIQUES À RÉSOUDRE

### **GOD OBJECTS IDENTIFIÉS (PASSE B)**
| God Object | Lignes | Responsabilités | Criticité | Session Source |
|------------|--------|-----------------|-----------|----------------|
| **SceneStateController** | 827L | 27+ orchestration | 🚨 URGENCE ABSOLUE | B21 |
| **useTempBloomSync** | 662L | 15+ systems hook | 🚨 URGENCE ABSOLUE | B22 |
| **ParticleSystemV2** | 2,523L | 8+ engines | 🔥 CATASTROPHIQUE | B06 |
| **DebugPanel** | 2,883L | UI monolithe | 🔥 CRITIQUE | B20 |
| **PBRLightingController** | 1,443L | 12+ systems | ⚠️ CRITIQUE | B07 |

### **FOCUS PRIORITAIRE C01**
1. **SceneStateController** - Single point of failure architectural
2. **useTempBloomSync** - Temporary debt architectural permanent

---

## 🔍 RECHERCHE PATTERNS XSTATE OFFICIELS

### **PATTERN 1 : ACTOR MODEL DECOMPOSITION**

#### **Documentation XState - Actor Model**
Source : [XState Actors Documentation](https://xstate.js.org/docs/guides/actors.html)

**Principe fondamental** :
```javascript
// Au lieu d'un God Object centralisé
class SceneStateController {
  // 827 lignes, 27+ responsabilités
}

// → Décomposition en Actors spécialisés
const sceneSystem = createActorSystem({
  actors: {
    rendering: RenderingActor,
    lighting: LightingActor,
    materials: MaterialActor,
    bloom: BloomActor,
    // ... actors spécialisés
  }
});
```

#### **PATTERN ACTOR SPAWNING**
```javascript
import { createMachine, spawn } from 'xstate';

const SceneOrchestratorMachine = createMachine({
  id: 'sceneOrchestrator',
  initial: 'initializing',
  context: {
    renderingActor: null,
    lightingActor: null,
    bloomActor: null,
    materialActor: null
  },
  states: {
    initializing: {
      entry: [
        assign({
          renderingActor: () => spawn(RenderingMachine, 'rendering'),
          lightingActor: () => spawn(LightingMachine, 'lighting'),
          bloomActor: () => spawn(BloomMachine, 'bloom'),
          materialActor: () => spawn(MaterialMachine, 'material')
        })
      ],
      on: {
        ALL_INITIALIZED: 'ready'
      }
    },
    ready: {
      // Coordination des actors enfants
    }
  }
});
```

### **PATTERN 2 : ACTOR COMMUNICATION**

#### **Event-Driven Communication vs Direct Calls**

**AVANT (God Object) :**
```javascript
// SceneStateController - Couplage direct
setBloomParameter(param, value) {
  this.state.bloom[param] = value;
  this.systems.simpleBloom.updateBloom(param, value);
  this.systems.bloomController.setBloomParameter(param, value);
  this.systems.renderer.needsUpdate = true;
  // Direct coupling to multiple systems
}
```

**APRÈS (Actor Events) :**
```javascript
// BloomActor → Event-driven communication
const BloomMachine = createMachine({
  id: 'bloom',
  context: { threshold: 0.15, strength: 0.4, radius: 0.4 },
  on: {
    UPDATE_THRESHOLD: {
      actions: [
        assign({ threshold: (_, event) => event.value }),
        'notifyRendering',
        'notifyMaterials'
      ]
    }
  }
}, {
  actions: {
    notifyRendering: sendParent({ type: 'BLOOM_CHANGED' }),
    notifyMaterials: send({ type: 'APPLY_BLOOM' }, { to: 'materialActor' })
  }
});
```

### **PATTERN 3 : HIERARCHICAL ACTORS**

#### **Parent-Child Actor Organization**
```javascript
// Scene Orchestrator (Parent)
const SceneOrchestrator = createMachine({
  id: 'scene',
  type: 'parallel',
  states: {
    rendering: {
      invoke: {
        id: 'renderingActor',
        src: RenderingMachine
      }
    },
    lighting: {
      invoke: {
        id: 'lightingActor',
        src: LightingMachine
      }
    },
    effects: {
      type: 'parallel',
      states: {
        bloom: {
          invoke: {
            id: 'bloomActor',
            src: BloomMachine
          }
        },
        particles: {
          invoke: {
            id: 'particleActor',
            src: ParticleMachine
          }
        }
      }
    }
  }
});
```

---

## 🏗️ SOLUTIONS SPÉCIFIQUES PAR GOD OBJECT

### **SOLUTION SCENESTATECONTROLLER (827L → MULTIPLE ACTORS)**

#### **Décomposition Architecturale**
```javascript
// SceneStateController (827L, 27 responsabilités)
// → 8 Actors spécialisés

1. RenderingActor (exposure, toneMapping, background)
2. BloomOrchestratorActor (global + groups coordination)
3. LightingActor (ambient, directional, advanced)
4. MaterialManagerActor (global + groups materials)
5. PBRControllerActor (presets, multipliers, HDR)
6. MSAAActor (anti-aliasing, post-processing)
7. SceneOrchestratorActor (top-level coordination)
```

#### **RenderingActor Implementation**
```javascript
const RenderingMachine = createMachine({
  id: 'rendering',
  initial: 'idle',
  context: {
    exposure: 1.7,
    toneMapping: 'AgXToneMapping',
    background: { type: 'color', color: '#1a1a1a' }
  },
  states: {
    idle: {
      on: {
        UPDATE_EXPOSURE: {
          actions: assign({
            exposure: (_, event) => Math.max(0.1, Math.min(3.0, event.value))
          }),
          target: 'updating'
        },
        SET_TONE_MAPPING: {
          actions: assign({ toneMapping: (_, event) => event.value }),
          target: 'updating'
        },
        CHANGE_BACKGROUND: {
          actions: assign({ background: (_, event) => event.background }),
          target: 'updating'
        }
      }
    },
    updating: {
      entry: 'syncToRenderer',
      after: {
        100: 'idle'
      }
    }
  }
}, {
  actions: {
    syncToRenderer: (context) => {
      // Sync to Three.js renderer
      if (window.renderer) {
        window.renderer.toneMappingExposure = context.exposure;
        window.renderer.toneMapping = THREE[context.toneMapping];
        // Background sync logic
      }
    }
  }
});
```

#### **BloomOrchestratorActor avec Child Actors**
```javascript
const BloomOrchestratorMachine = createMachine({
  id: 'bloomOrchestrator',
  type: 'parallel',
  context: {
    globalSettings: { enabled: true, threshold: 0.15, strength: 0.4, radius: 0.4 },
    groups: {}
  },
  states: {
    global: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            UPDATE_GLOBAL_BLOOM: {
              actions: assign({
                globalSettings: (context, event) => ({
                  ...context.globalSettings,
                  [event.param]: event.value
                })
              }),
              target: 'syncing'
            }
          }
        },
        syncing: {
          entry: 'syncGlobalBloom',
          after: { 50: 'idle' }
        }
      }
    },
    groups: {
      type: 'parallel',
      states: {
        iris: {
          invoke: {
            id: 'irisBloom',
            src: createBloomGroupMachine('iris'),
            data: { threshold: 0.3, strength: 0.8, radius: 0.4 }
          }
        },
        eyeRings: {
          invoke: {
            id: 'eyeRingsBloom',
            src: createBloomGroupMachine('eyeRings'),
            data: { threshold: 0.4, strength: 0.6, radius: 0.3 }
          }
        },
        revealRings: {
          invoke: {
            id: 'revealRingsBloom',
            src: createBloomGroupMachine('revealRings'),
            data: { threshold: 0.43, strength: 0.40, radius: 0.36 }
          }
        }
      }
    }
  }
});

// Factory pour BloomGroup Actors
const createBloomGroupMachine = (groupName) => createMachine({
  id: `bloomGroup_${groupName}`,
  initial: 'idle',
  context: {
    groupName,
    threshold: 0.15,
    strength: 0.4,
    radius: 0.4,
    emissive: '#00ff88',
    emissiveIntensity: 0.3
  },
  states: {
    idle: {
      on: {
        UPDATE_BLOOM_PARAM: {
          actions: assign({
            [event.param]: (_, event) => event.value
          }),
          target: 'updating'
        },
        UPDATE_MATERIAL_PARAM: {
          actions: assign({
            [event.param]: (_, event) => event.value
          }),
          target: 'updating'
        }
      }
    },
    updating: {
      entry: ['syncToBloomSystem', 'syncToMaterialSystem'],
      after: { 100: 'idle' }
    }
  }
});
```

### **SOLUTION USETEMPBLOOMSYNC (662L → ACTOR EVENTS)**

#### **Suppression Complète + Actor Communication**

**AVANT (662L God Hook) :**
```javascript
// useTempBloomSync - 662L business logic dans React hook
export const useTempBloomSync = (systemsInitialized) => {
  useEffect(() => {
    // 662 lignes de synchronisation manuelle
    const unsubscribe = useSceneStore.subscribe((state, prev) => {
      // Manual bloom sync, PBR sync, lighting sync...
    });
  }, [systemsInitialized]);
};
```

**APRÈS (0L + Actor Events) :**
```javascript
// NO MORE useTempBloomSync - Remplacé par Actor communication

// Automatic Actor → Actor communication
const BloomActor = createMachine({
  // ... bloom logic
  on: {
    BLOOM_UPDATED: {
      actions: [
        'updateInternalState',
        'notifyRenderingActor',
        'notifyMaterialActors'
      ]
    }
  }
}, {
  actions: {
    notifyRenderingActor: send(
      { type: 'BLOOM_CHANGED', data: (context) => context.bloomSettings },
      { to: 'renderingActor' }
    ),
    notifyMaterialActors: send(
      { type: 'UPDATE_MATERIALS', data: (context) => context.materials },
      { to: 'materialActor' }
    )
  }
});

// React Integration → Pure Event Handlers
const BloomControls = () => {
  const [bloomState, bloomSend] = useActor(BloomActor);

  return (
    <BloomSlider
      value={bloomState.context.threshold}
      onChange={(value) => bloomSend({ type: 'UPDATE_THRESHOLD', value })}
    />
  );
};
```

---

## 📊 PATTERNS ADVANCED RESEARCH

### **PATTERN 4 : ACTOR LIFECYCLE MANAGEMENT**

#### **Spawn/Stop Dynamic Actors**
```javascript
const DynamicActorManager = createMachine({
  context: {
    activeActors: new Map()
  },
  on: {
    SPAWN_PARTICLE_SYSTEM: {
      actions: assign({
        activeActors: (context, event) => {
          const newActor = spawn(ParticleSystemMachine, event.id);
          return context.activeActors.set(event.id, newActor);
        }
      })
    },
    STOP_PARTICLE_SYSTEM: {
      actions: assign({
        activeActors: (context, event) => {
          const actor = context.activeActors.get(event.id);
          if (actor) {
            stop(actor);
            context.activeActors.delete(event.id);
          }
          return context.activeActors;
        }
      })
    }
  }
});
```

### **PATTERN 5 : ERROR BOUNDARIES & RESILIENCE**

#### **Actor Error Handling**
```javascript
const ResilientActor = createMachine({
  initial: 'operating',
  states: {
    operating: {
      invoke: {
        src: 'riskyOperation',
        onDone: {
          target: 'success',
          actions: 'handleSuccess'
        },
        onError: {
          target: 'error',
          actions: 'logError'
        }
      }
    },
    error: {
      after: {
        RETRY_DELAY: 'operating'
      },
      on: {
        MANUAL_RETRY: 'operating',
        FALLBACK_MODE: 'degraded'
      }
    },
    degraded: {
      // Fonctionnement en mode dégradé
      on: {
        RECOVERY_ATTEMPT: 'operating'
      }
    },
    success: {
      after: {
        OPERATION_COMPLETE: 'operating'
      }
    }
  }
});
```

---

## 🎯 RECOMMANDATIONS IMPLEMENTATION

### **CONSTRUCTION STRATEGY PROGRESSIVE**

#### **Phase 1 : Core Actors Foundation**
1. **RenderingActor** : Exposure + ToneMapping + Background
2. **BloomOrchestratorActor** : Global bloom coordination
3. **Actor Registry** : Central actor discovery + communication

#### **Phase 2 : Specialized Decomposition**
1. **BloomGroupActors** : Individual group management
2. **MaterialManagerActor** : Material coordination
3. **LightingActor** : Lighting system management

#### **Phase 3 : God Object Elimination**
1. **SceneStateController** → SceneOrchestratorActor completely
2. **useTempBloomSync** → Complete suppression
3. **React Integration** → Pure UI + Actor events

### **PERFORMANCE CONSIDERATIONS**

#### **Actor Communication Overhead**
```javascript
// Optimized event batching
const batchEvents = (events) => ({
  type: 'BATCH_UPDATE',
  events
});

// Throttled updates
const throttledActor = createMachine({
  context: { updateQueue: [] },
  on: {
    UPDATE: {
      actions: assign({
        updateQueue: (context, event) => [...context.updateQueue, event]
      })
    }
  },
  after: {
    THROTTLE_DELAY: {
      actions: ['processBatchedUpdates', 'clearQueue']
    }
  }
});
```

---

## 📈 AVANTAGES vs INCONVÉNIENTS

### **✅ AVANTAGES ACTOR MODEL**
- **Separation of Concerns** : Each actor = single responsibility
- **Testability** : Isolated actor testing + mocking
- **Maintainability** : Clear boundaries + communication contracts
- **Scalability** : Easy to add/remove actors
- **Error Resilience** : Actor error boundaries + recovery
- **Performance** : Event-driven efficiency + parallel processing

### **⚠️ CONSIDÉRATIONS**
- **Learning Curve** : Team XState expertise needed
- **Event Overhead** : Communication vs direct calls (minimal)
- **Debugging** : Event flow tracing (XState Inspector helps)
- **Initial Setup** : Architecture setup complexity

---

## 🚀 PROCHAINES ÉTAPES

### **VALIDATION PATTERN C02**
- **Performance benchmarking** : Actor events vs direct calls
- **Memory usage** : Actor lifecycle vs manual management
- **Bundle size** : Code splitting opportunities

### **IMPLEMENTATION POC**
- **SceneStateController** décomposition prototype
- **BloomOrchestratorActor** + BloomGroupActors
- **React integration** pure UI components

### **TEAM PREPARATION**
- **XState training** patterns + best practices
- **Development tooling** XState Inspector setup
- **Testing strategies** Actor testing approaches

---

## 🔍 MOTS-CLÉS RECHERCHE POUR APPROFONDISSEMENT

### **RECHERCHES PRIORITAIRES À EFFECTUER :**

#### **XState Patterns Spécifiques :**
- **"XState actor decomposition large objects"**
- **"XState hierarchical actors best practices"**
- **"XState parallel actors coordination"**
- **"XState actor spawning dynamic patterns"**

#### **Performance & Optimization :**
- **"XState actor communication overhead benchmark"**
- **"XState vs Redux performance comparison"**
- **"XState event batching optimization"**
- **"XState actor lifecycle memory management"**

#### **React Integration :**
- **"XState React hooks pure UI components"**
- **"XState useActor performance optimization"**
- **"React XState actor event handling patterns"**
- **"XState React concurrent mode compatibility"**

#### **Three.js + XState :**
- **"XState Three.js WebGL state management"**
- **"XState game engine actor patterns"**
- **"XState rendering pipeline coordination"**
- **"XState WebGL performance optimization"**

#### **Architecture Enterprise :**
- **"XState microservices actor architecture"**
- **"XState large scale application patterns"**
- **"XState actor system design enterprise"**
- **"XState error boundaries production patterns"**

### **QUESTIONS RECHERCHE SPÉCIFIQUES :**
1. **Comment optimiser les performances** de communication entre 8+ actors ?
2. **Quels patterns** pour gérer 27+ responsabilités en actors hiérarchiques ?
3. **Comment migrer** progressivement sans casser l'existant ?
4. **Quels benchmarks** XState vs approches manuelles ?
5. **Comment tester** efficacement les systèmes multi-actors ?

---

**SESSION C01 TERMINÉE** : God Objects Patterns research COMPLET
**PROCHAINE SESSION** : C02 - Performance Optimization patterns
**PATTERNS IDENTIFIÉS** : Actor decomposition + communication + lifecycle + error handling