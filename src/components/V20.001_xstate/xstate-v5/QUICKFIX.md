# QUICKFIX - Machines deviennent "stopped"

## Problème
Les machines avec un seul state `ready` sont considérées comme "finales" par XState.

## Solution
Supprimer `initial` et `states`, garder juste `context` + `on`.

## Exemple pour bloomMachine :

**AVANT (bugué):**
```ts
}).createMachine({
  id: 'bloom',
  initial: 'ready',  // ❌ Problème
  context: { ... },
  states: {
    ready: {
      on: { ... }
    }
  }
});
```

**APRÈS (correct):**
```ts
}).createMachine({
  id: 'bloom',
  context: { ... },
  on: {  // ✅ Événements au niveau root
    SET_BLOOM_PASS: { actions: [...] },
    ENABLE: { actions: [...] }
  }
});
```

## Machines à corriger
1. bloomMachine ✅
2. lightingMachine
3. pbrMachine
4. effectsMachine
5. sceneMachine
6. materialMachine
7. performanceMonitor (garde ses states stopped/monitoring)
