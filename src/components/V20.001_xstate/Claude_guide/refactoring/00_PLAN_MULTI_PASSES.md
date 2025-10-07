# 📋 PLAN MULTI-PASSES - CONSTRUCTION XSTATE TOTALE

**Date début** : 26 septembre 2025
**Objectif** : **REFONTE TOTALE** - Nouveau système XState Actor Model from scratch
**Méthodologie** : Pipeline A→F sur analyse requirements + construction neuve
**Ordre validé** : Top-Down hybride (Q01 résolue)

---

## 🎯 PIPELINE COMPLET A→F

### **A: ANALYSE** ✅ **TERMINÉE**
- **Sessions S01-S65** : 65 fichiers individuels analysés
- **Total** : 15,047 lignes code cartographiées
- **Résultat** : Cartographie complète fonctionnalités existantes

### **B: DIAGNOSTIC ARCHITECTURAL**
- **Objectif** : Identifier patterns/anti-patterns par domaine
- **Focus** : Couplages + responsabilités + architectures problématiques
- **Résultat** : Fiche architecturale par dossier/sous-dossier

### **C: RECHERCHE APPROFONDIE**
- **Objectif** : Recherche bonnes pratiques pour chaque problème identifié en B
- **Focus** : Patterns XState + solutions éprouvées + benchmarks + documentation
- **Collaboration** : Outils de recherche utilisateur + outils Claude
- **Résultat** : Base connaissances solide pour diagnostic technique

### **D: DIAGNOSTIC TECHNIQUE**
- **Objectif** : Problèmes + impacts + solutions XState spécifiques
- **Focus** : Performance + maintenance + complexité + construction
- **Base** : Recherches approfondies de la Passe C
- **Résultat** : Solutions techniques détaillées par problème

### **E: PLAN CONSTRUCTION**
- **Objectif** : Stratégie développement nouveau système XState
- **Focus** : Étapes construction + priorités + outils + chronologie
- **Résultat** : Guide développement étape-par-étape par domaine

### **F: VISION CIBLE**
- **Objectif** : Architecture XState finale complète
- **Focus** : Machines + services + communication + exemples
- **Résultat** : Blueprint complet système XState cible

---

## 🏗️ MÉTHODOLOGIE VALIDÉE (Q01)

### **APPROCHE : TOP-DOWN HYBRIDE**
**Source** : Recherche collaborative 25 sources + documentation officielle
**Conclusion** : Vision architecturale globale + Implémentation modulaire progressive

**Étapes validées :**
1. **Architecture globale** → Identifier domaines + flux + états haut niveau
2. **Machines principales** → Squelette architectural par domaine
3. **Construction modulaire** → Actor Model + composition progressive
4. **Orchestration** → Coordination inter-machines
5. **Intégration** → UI + optimisations performance

---

## 📁 STRUCTURE HIÉRARCHIQUE CIBLES

### **DOSSIERS PRINCIPAUX**
```
01_components/     (11 fichiers) → B→F
02_hooks/          (10 fichiers) → B→F
03_stores/         (17 fichiers) → B→F + sous-dossiers
04_systems/        (23 fichiers) → B→F + sous-dossiers
05_utils/          (5 fichiers)  → B→F
```

### **SOUS-DOSSIERS STORES/**
```
03_stores/
├── hooks/         (7 fichiers)  → B→F
├── slices/        (8 fichiers)  → B→F
├── middleware/    (1 fichier)   → B→F
└── index/         (1 fichier)   → B→F
```

### **SOUS-DOSSIERS SYSTEMS/**
```
04_systems/
├── stateController/      → B→F (MACHINE ROOT)
├── particleSystems/      → B→F (DOMAINE CRITIQUE)
├── bloomEffects/         → B→F (DOMAINE CRITIQUE)
├── lightingSystems/      → B→F (DOMAINE CRITIQUE)
├── animationSystemes/    → B→F
├── eyeSystems/           → B→F
├── revelationSystems/    → B→F
├── environmentSystems/   → B→F
└── transitionObjects/    → B→F
```

### **FICHIERS CRITIQUES DÉDIÉS**
```
CRITIQUES GOD OBJECTS:
├── SceneStateController.js      → B→F dédié (827L - Point défaillance)
├── ParticleSystemV2.js          → B→F dédié (2523L - Performance killer)
├── PBRLightingController.js     → B→F dédié (1443L - Monolithic lighting)
├── useTempBloomSync.js          → B→F dédié (663L - God Hook)
└── SimpleBloomSystem.js         → B→F dédié (667L - Complex rendering)
```

### **NOUVELLE ENTITÉ GLOBALE**
```
GLOBAL_ARCHITECTURE             → B→F dédié (Vision holistique système)
```

---

## 🚀 ORDRE DE TRAITEMENT VALIDÉ (TOP-DOWN HYBRIDE)

**Basé sur recherche Q01** : Approche Top-Down hybride avec modularité progressive
**Source** : 25 sources spécialisées + documentation officielle XState

### **🎯 PRIORITÉ 1 : ARCHITECTURE GLOBALE** (Vision holistique)
1. `GLOBAL_ARCHITECTURE` (B→F) - **NOUVEAU** Vision système complet
2. `04_systems_stateController` (B→F) - Machine Root/Orchestrateur principal

### **🎯 PRIORITÉ 2 : SERVICES DE BASE** (Aucune dépendance)
3. `05_utils` (B→F) - Pure functions, factory patterns
4. `03_stores_slices` (B→F) - Configuration état de base

### **🎯 PRIORITÉ 3 : MACHINES DOMAINES CRITIQUES** (Actor Model)
5. `CRITIQUE_SimpleBloomSystem` (B→F) - Système bloom (667L)
6. `CRITIQUE_ParticleSystemV2` (B→F) - Système particules (2523L)
7. `CRITIQUE_PBRLightingController` (B→F) - Système éclairage (1443L)
8. `04_systems_bloomEffects` (B→F) - Domaine bloom complet
9. `04_systems_particleSystems` (B→F) - Domaine particules complet
10. `04_systems_lightingSystems` (B→F) - Domaine éclairage complet

### **🎯 PRIORITÉ 4 : AUTRES DOMAINES** (Composition progressive)
11. `04_systems_animationSystemes` (B→F) - Contrôleurs animation
12. `04_systems_eyeSystems` (B→F) - Système sécurité IRIS
13. `04_systems_revelationSystems` (B→F) - Système révélation
14. `04_systems_environmentSystems` (B→F) - Environnements HDR
15. `04_systems_transitionObjects` (B→F) - Transitions objets
16. `02_hooks` (B→F) - Logique métier custom
17. `03_stores_hooks` (B→F) - Sélecteurs état
18. `03_stores_middleware` (B→F) - Middleware Zustand
19. `03_stores_index` (B→F) - Configuration globale

### **🎯 PRIORITÉ 5 : INTÉGRATION & UI** (Couche présentation)
20. `01_components` (B→F) - Interface utilisateur React
21. `CRITIQUE_SceneStateController` (B→F) - Construction Machine Root XState
22. `CRITIQUE_useTempBloomSync` (B→F) - Nouveau système services XState

---

## 📊 COMPTEURS & SUIVI

### **TOTAL ENTITÉS À TRAITER**
```
Architecture globale   : 1  (NOUVEAU)
Dossiers principaux    : 5
Sous-dossiers stores   : 4
Sous-dossiers systems  : 9
Fichiers critiques    : 5
-------------------------
TOTAL ENTITÉS         : 24
```

### **TOTAL FICHIERS À CRÉER**
```
24 entités × 5 passes (B→F) = 120 fichiers refactoring
+ 1 synthèse finale = 121 fichiers total
```

### **PROGRESSION PAR PASSE**
```
PASSE B: 10/24 (42%) [████████▓___________] - EN COURS
PASSE C: 0/24  (0%)  [____________________]
PASSE D: 0/24  (0%)  [____________________]
PASSE E: 0/24  (0%)  [____________________]
PASSE F: 0/24  (0%)  [____________________]
FINAL  : 0/1   (0%)  [____________________]
```

---

## 🔄 CONVENTIONS DE NOMMAGE

### **PASSE B: DIAGNOSTIC ARCHITECTURAL**
```
refactoring/
├── B_diagnostic_architectural/
│   ├── GLOBAL_ARCHITECTURE_DIAGNOSTIC_ARCHITECTURAL.md
│   ├── 04_systems_stateController_DIAGNOSTIC_ARCHITECTURAL.md
│   ├── 05_utils_DIAGNOSTIC_ARCHITECTURAL.md
│   ├── CRITIQUE_SimpleBloomSystem_DIAGNOSTIC_ARCHITECTURAL.md
│   └── [...]
```

### **PASSE C: RECHERCHE APPROFONDIE**
```
refactoring/
├── C_recherche_approfondie/
│   ├── GLOBAL_ARCHITECTURE_RECHERCHE_APPROFONDIE.md
│   ├── 04_systems_stateController_RECHERCHE_APPROFONDIE.md
│   ├── CRITIQUE_SimpleBloomSystem_RECHERCHE_APPROFONDIE.md
│   └── [...]
```

### **PASSE D: DIAGNOSTIC TECHNIQUE**
```
refactoring/
├── D_diagnostic_technique/
│   ├── GLOBAL_ARCHITECTURE_DIAGNOSTIC_TECHNIQUE.md
│   ├── CRITIQUE_SimpleBloomSystem_DIAGNOSTIC_TECHNIQUE.md
│   └── [...]
```

### **PASSE E: PLAN REFACTORISATION**
```
refactoring/
├── E_plan_refactorisation/
│   ├── GLOBAL_ARCHITECTURE_PLAN_REFACTORISATION.md
│   ├── CRITIQUE_SimpleBloomSystem_PLAN_REFACTORISATION.md
│   └── [...]
```

### **PASSE F: VISION CIBLE**
```
refactoring/
├── F_vision_cible/
│   ├── GLOBAL_ARCHITECTURE_VISION_CIBLE.md
│   ├── CRITIQUE_SimpleBloomSystem_VISION_CIBLE.md
│   └── [...]
```

---

## 📋 RÈGLE DE PARTITIONNEMENT

### **PARTITIONNEMENT AUTOMATIQUE OBLIGATOIRE**
**Si pendant l'analyse d'une entité :**
- ✅ **Plus de 5 sous-éléments distincts** → Partitionner en B##a, B##b, etc.
- ✅ **Plus de 1000 lignes code total** → Partitionner par blocs logiques
- ✅ **Domaines non liés** dans même entité → Partitionner par domaine
- ✅ **Complexité nécessite focus séparé** → Partitionner par aspect

**Format naming :**
- Session principale : B01, B02, B03...
- Sessions partitionnées : B01a, B01b, B01c...
- Chaque partition = 1 fichier dédié

**Exemples :**
- `GLOBAL_ARCHITECTURE` avec 8 domaines → B01a (domaines 1-4) + B01b (domaines 5-8) + B01c (vision cible)
- `stores/slices/` avec 8 fichiers → B04a (simples) + B04b (complexes) + B04c (intermédiaires)

---

## 📋 SESSIONS TRACKING

```
🔄 PASSE B - DIAGNOSTIC ARCHITECTURAL (10/24 terminées)
✅ SESSION B01a: GLOBAL_ARCHITECTURE_RENDERING_DIAGNOSTIC_ARCHITECTURAL.md
✅ SESSION B01b: GLOBAL_ARCHITECTURE_INTERACTION_STATE_DIAGNOSTIC_ARCHITECTURAL.md
✅ SESSION B01c: GLOBAL_ARCHITECTURE_VISION_CIBLE_DIAGNOSTIC_ARCHITECTURAL.md
✅ SESSION B02: 04_systems_stateController_DIAGNOSTIC_ARCHITECTURAL.md
✅ SESSION B03: 05_utils_DIAGNOSTIC_ARCHITECTURAL.md
✅ SESSION B04a: 03_stores_slices_SIMPLES_DIAGNOSTIC_ARCHITECTURAL.md
✅ SESSION B04b: 03_stores_slices_COMPLEXES_DIAGNOSTIC_ARCHITECTURAL.md
✅ SESSION B04c: 03_stores_slices_CRITIQUES_DIAGNOSTIC_ARCHITECTURAL.md
✅ SESSION B05: CRITIQUE_SimpleBloomSystem_DIAGNOSTIC_ARCHITECTURAL.md
✅ SESSION B06: CRITIQUE_ParticleSystemV2_DIAGNOSTIC_ARCHITECTURAL.md
🔄 SESSION B07: CRITIQUE_PBRLightingController_DIAGNOSTIC_ARCHITECTURAL.md (EN COURS)
□ SESSION B08: 04_systems_bloomEffects_DIAGNOSTIC_ARCHITECTURAL.md
□ SESSION B09: 04_systems_particleSystems_DIAGNOSTIC_ARCHITECTURAL.md
□ [... 13 sessions restantes]

🔄 PASSE C - RECHERCHE APPROFONDIE (0/24)
□ SESSION C01: [à définir après completion B]

🔄 PASSE D - DIAGNOSTIC TECHNIQUE (0/24)
□ SESSION D01: [à définir après completion C]

🔄 PASSE E - PLAN REFACTORISATION (0/24)
□ SESSION E01: [à définir après completion D]

🔄 PASSE F - VISION CIBLE (0/24)
□ SESSION F01: [à définir après completion E]
```

---

## 💡 REPRISE AUTOMATISÉE

**Pour reprendre dans nouvelle discussion :**
1. Lire `/refactoring/00_PLAN_MULTI_PASSES.md` (ce fichier)
2. Vérifier progression dans `/refactoring/00_PROGRESSION_REFACTORING.md`
3. Reprendre à la prochaine session non cochée
4. Suivre ordre de priorité validé Top-Down hybride

**Structure self-contained** pour continuité guaranteed ✅

---

## 🎯 PROCHAINE ACTION

**SESSION B01** : `GLOBAL_ARCHITECTURE_DIAGNOSTIC_ARCHITECTURAL.md`
- **Objectif** : Vision holistique architecture XState cible
- **Focus** : Identifier domaines fonctionnels + flux + états haut niveau
- **Base** : Résultats analyse Phase 1 (65 fichiers) + méthodologie Q01
- **Résultat** : Blueprint architectural global pour toutes les autres passes