# 👥 SESSION E11 - TEAM COORDINATION PLAN CONSTRUCTION

**Date** : 1 octobre 2025
**Phase** : E - Plan Construction
**Focus** : Coordination équipe, communication, knowledge sharing
**Criticité** : MOYENNE

---

## 🎯 OBJECTIF SESSION E11

**Mission** : Définir stratégies coordination équipe pour projet construction XState v5 (29 semaines).

**Context** : Projet long (7 mois), nouveau framework (XState v5), learning curve importante.

**Scope** :
1. **Communication** : Meetings, updates, channels
2. **Knowledge Sharing** : Documentation, code reviews, pair programming
3. **Decision Making** : Process décisions techniques
4. **Collaboration Tools** : Git, GitHub, Slack, etc.
5. **Onboarding** : Nouveau membre équipe

**Objectif qualité** : Communication claire, pas de bloqueurs >1 jour, knowledge partagé

---

## 👥 TEAM STRUCTURE

### **Rôles Projet** :

**1 Développeur Full-Time** (configuration minimale recommandée) :
- Dev Frontend (React + XState)
- Dev Three.js (3D/animations)
- Testing (unit + integration + E2E)
- Documentation

**OU 2 Développeurs** (configuration optimale) :
- **Dev 1** : XState actors + State machines (expert)
- **Dev 2** : React UI + Three.js integration
- Collaboration : Code reviews mutuelles

**Rôles Supports** :
- **Tech Lead** : Décisions architecture, reviews critiques
- **QA** : Testing validation, E2E tests
- **Product Owner** : Requirements, priorités features

---

## 📅 COMMUNICATION STRUCTURE

### **Daily Standup** (10 minutes, chaque matin)

**Format** :
- Hier : Qu'est-ce qui a été fait ?
- Aujourd'hui : Quoi faire ?
- Bloqueurs : Problèmes rencontrés ?

**Example** :
```
Dev 1:
- Hier: GLB Loader Actor complété (484 bones validation ✅)
- Aujourd'hui: Animation Controller Actor (crossfade)
- Bloqueurs: Question sur pattern fromPromise (need review)

Dev 2:
- Hier: Scene Actor tests (coverage 90% ✅)
- Aujourd'hui: Renderer Actor (WebGL context)
- Bloqueurs: Aucun
```

**Channel** : Slack #overmind-daily ou Meeting 9h

---

### **Weekly Sync** (1 heure, chaque vendredi)

**Agenda** :
1. **Review semaine** (30min)
   - Milestone atteint ? ✅/❌
   - Metrics (coverage, performance, bugs)
   - Démos features complétées

2. **Planning semaine suivante** (20min)
   - Objectifs semaine prochaine
   - Tâches prioritaires
   - Risques anticipés

3. **Décisions techniques** (10min)
   - Patterns validés/rejetés
   - Architecture decisions
   - Blockers resolution

**Participants** : Dev(s) + Tech Lead + PO (optional)

---

### **Bi-Weekly Architecture Review** (2 heures, toutes les 2 semaines)

**Objectif** : Valider architecture XState, patterns, state machines design

**Agenda** :
1. **Code review** state machines créées (1h)
2. **Architecture decisions** (patterns, communication actors) (30min)
3. **Refactoring needs** (dette technique) (30min)

**Participants** : Dev(s) + Tech Lead (obligatoire)

**Deliverable** : Document décisions (ADR - Architecture Decision Record)

---

### **Phase Reviews** (Fin de chaque phase)

**Phases** :
- Phase 1 : Foundation (Semaine 4)
- Phase 2 : Core Actors (Semaine 10)
- Phase 3 : Features (Semaine 18)
- Phase 4 : Testing (Semaine 22)
- Phase 5 : Optimization (Semaine 24)

**Format** :
- Rétrospective : Qu'est-ce qui a bien/mal fonctionné ?
- Metrics review : Coverage, performance, bugs
- Démo phase complétée
- Planning phase suivante

**Duration** : 2-3 heures

---

## 📚 KNOWLEDGE SHARING

### **1. Documentation Standards**

**Documentation obligatoire** :

#### **State Machines** :
```typescript
/**
 * GLB Loader Actor
 *
 * Responsibility: Load Overmind GLB model and validate 484 bones + 29 animations
 *
 * States:
 * - idle: Waiting for LOAD event
 * - loading: Loading GLB file (fromPromise)
 * - validating: Validating bones count (484) and animations count (29)
 * - loaded: GLB loaded and validated successfully
 * - error: Loading or validation failed
 *
 * Services:
 * - loadGLBFile: fromPromise actor (load + validate GLB)
 *
 * Guards:
 * - has484Bones: Check bones.length === 484
 * - has29Animations: Check animations.length === 29
 *
 * Events:
 * - LOAD: Trigger loading
 * - RETRY: Retry after error
 *
 * Context:
 * - path: GLB file path
 * - gltf: Loaded GLTF object
 * - model: THREE.Group
 * - bones: THREE.Bone[] (484)
 * - animations: THREE.AnimationClip[] (29)
 * - error: Error | null
 */
export const glbLoaderMachine = setup({ ... });
```

#### **Services (fromPromise)** :
```typescript
/**
 * Load GLB file and validate structure
 *
 * Input:
 * - path: string (GLB file path)
 * - onProgress?: (progress: number) => void
 *
 * Output:
 * - gltf: GLTF
 * - model: THREE.Group
 * - bones: THREE.Bone[] (exactly 484)
 * - animations: THREE.AnimationClip[] (exactly 29)
 *
 * Errors:
 * - Invalid bone count (≠484)
 * - Invalid animation count (≠29)
 * - Loading failed (network, file not found)
 */
const loadGLBFile = fromPromise<GLBLoadOutput, GLBLoadInput>({ ... });
```

---

### **2. Code Review Process**

**Règles** :
- ✅ **TOUTES** les state machines doivent être reviewées
- ✅ Pas de merge sans approval (1 reviewer minimum)
- ✅ Review dans les 24h (max)

**Pull Request Template** :
```markdown
## Description
[Describe what this PR does]

## Type
- [ ] State Machine
- [ ] Service (fromPromise)
- [ ] React Component
- [ ] Test
- [ ] Documentation

## Checklist
- [ ] Tests added/updated (coverage >80%)
- [ ] Documentation updated
- [ ] No console.log/debugger
- [ ] TypeScript types complete
- [ ] XState v5 patterns followed

## Related
- Milestone: M4 (GLB Loading)
- Issue: #12
- Documentation: E03_STATE_MACHINE_DESIGN.md line 234

## Screenshots (if UI)
[Add screenshots]
```

**Review Checklist** :
- ✅ Code follows XState v5 patterns (setup API, fromPromise, etc.)
- ✅ TypeScript types complets (no `any`)
- ✅ Tests coverage >80%
- ✅ Documentation JSDoc complète
- ✅ No anti-patterns (global state, side effects in guards, etc.)
- ✅ Performance considérations (debouncing, memoization)

---

### **3. Pair Programming**

**Quand utiliser** :
- 🔴 **Bloqueur critique** : Dev stuck >4 heures → pair programming
- 🟡 **Nouveau pattern** : First time implementing pattern XState → pair
- 🟢 **Knowledge sharing** : Expert + Junior sur feature complexe

**Format** :
- Driver : Écrit code
- Navigator : Guide, suggère, review temps réel

**Duration** : 2-4 heures max (fatiguant)

---

### **4. Knowledge Base (Wiki)**

**Structure** :

```
📚 Overmind XState Wiki
├── 🎯 Getting Started
│   ├── Setup Dev Environment
│   ├── XState v5 Crash Course
│   └── Project Structure
│
├── 🏗️ Architecture
│   ├── Actor Model (Receptionist pattern)
│   ├── State Machine Patterns
│   └── Communication Inter-Actors
│
├── 📝 Conventions
│   ├── Naming Conventions
│   ├── File Structure
│   └── TypeScript Standards
│
├── 🧪 Testing
│   ├── Unit Tests (State Machines)
│   ├── Integration Tests
│   └── E2E Tests (Playwright)
│
├── 🐛 Troubleshooting
│   ├── Common Errors XState
│   ├── Three.js Issues
│   └── Performance Problems
│
└── 📊 Resources
    ├── XState v5 Documentation
    ├── Three.js Documentation
    └── ADR (Architecture Decision Records)
```

**Tool** : GitHub Wiki ou Notion

---

## 🛠️ COLLABORATION TOOLS

### **1. Git Workflow**

**Branches** :
```
main          (production-ready code)
  ├── develop (integration branch)
      ├── feature/E03-glb-loader-actor
      ├── feature/E03-animation-controller
      ├── feature/E05-bloom-color-picker
      └── bugfix/E04-crossfade-timing
```

**Naming Convention** :
- `feature/[session]-[description]` : Nouvelle feature
- `bugfix/[session]-[description]` : Bug fix
- `refactor/[session]-[description]` : Refactoring
- `docs/[session]-[description]` : Documentation

**Commit Messages** :
```
[E03] Add GLB Loader Actor with 484 bones validation

- Implement glbLoaderMachine.ts (setup API)
- Add loadGLBFile service (fromPromise)
- Add validation guards (has484Bones, has29Animations)
- Tests coverage: 92%
- Related: Milestone M4
```

**Merge Strategy** :
- Feature branches → `develop` (squash merge)
- `develop` → `main` (merge commit, tagged release)

---

### **2. GitHub Project Board**

**Columns** :
- 📋 **Backlog** : Toutes tâches à faire
- 🎯 **To Do** : Tâches semaine courante
- 🚧 **In Progress** : En cours (max 2 par dev)
- 👀 **In Review** : PR ouverte, attente review
- ✅ **Done** : Complété et mergé

**Cards** :
```markdown
## [E03] GLB Loader Actor

**Milestone**: M4 - GLB Loading
**Phase**: Phase 1 - Foundation
**Estimate**: 3 jours
**Assignee**: Dev 1

### Tasks:
- [ ] Create glbLoaderMachine.ts
- [ ] Implement loadGLBFile service
- [ ] Add validation guards (484 bones, 29 animations)
- [ ] Write unit tests (target 90%+ coverage)
- [ ] Documentation JSDoc

### Dependencies:
- Scene Actor (M3) must be completed first

### Resources:
- E03_STATE_MACHINE_DESIGN.md (line 234)
- E04_SERVICE_EXTRACTION.md (line 29)
```

---

### **3. Communication Channels**

**Slack Channels** :

- `#overmind-general` : Discussions générales projet
- `#overmind-daily` : Daily standups (async ok)
- `#overmind-reviews` : Code reviews, PR notifications
- `#overmind-bugs` : Bug reports, issues
- `#overmind-xstate` : Questions XState, patterns, help

**GitHub Discussions** :
- Questions techniques approfondies
- Architecture decisions (ADR)
- Feature proposals

**Email** :
- Updates stakeholders (weekly)
- Go-Live communications

---

## 🎓 ONBOARDING NEW TEAM MEMBER

### **Jour 1-2 : Setup + Introduction**

**Tasks** :
- ✅ Setup dev environment (Vite + React + XState)
- ✅ Clone repo, run tests
- ✅ Read MEMO_OVERMIND_COMPLET.md (contexte complet)
- ✅ Read E01-E07 (architecture plan)
- ✅ XState v5 crash course (documentation officielle)

---

### **Jour 3-5 : First Task (Simple)**

**Assignation** : Feature simple (ex: BloomControlsPanel component)

**Support** :
- Pair programming avec dev senior (2h/jour)
- Code review obligatoire
- Questions encouragées (#overmind-xstate)

---

### **Semaine 2+ : Autonome**

**Assignation** : Features normales (state machines, services)

**Support** :
- Code reviews continues
- Weekly sync participation
- Escalation si bloqué >4h

---

## 🎯 DECISION MAKING PROCESS

### **Types Décisions** :

#### **1. Décisions Rapides (Dev autonome)**

**Examples** :
- Naming conventions (variables, functions)
- CSS styling détails
- Test structure

**Process** : Dev décide, documente en code comments

---

#### **2. Décisions Techniques (Review requise)**

**Examples** :
- Nouveau pattern XState
- State machine design
- Service fromPromise structure

**Process** :
1. Dev propose (PR description)
2. Code review + discussion
3. Tech Lead approves/rejects
4. Document decision (ADR si majeur)

---

#### **3. Décisions Architecturales (Meeting requise)**

**Examples** :
- Actor model structure
- Communication inter-actors pattern
- Performance optimizations majeures

**Process** :
1. Dev crée RFC (Request For Comments) document
2. Discussion bi-weekly architecture review
3. Vote équipe (consensus si possible)
4. Tech Lead final decision
5. Document ADR (Architecture Decision Record)

---

### **ADR Template** :

```markdown
# ADR-001: Use Receptionist Pattern for Actor Communication

## Status
ACCEPTED

## Context
We need a way for actors to communicate without tight coupling.

## Decision
Use Receptionist pattern (XState system.get()) for actor discovery and communication.

## Consequences
**Positive:**
- Zero coupling between actors
- Actors can be spawned/stopped dynamically
- Easy to test (mock actors)

**Negative:**
- Slightly more complex than direct actor.send()
- Need to manage actor registry

## Alternatives Considered
1. Direct actor references (rejected: tight coupling)
2. Event bus (rejected: harder to debug)

## References
- E03_STATE_MACHINE_DESIGN.md (Receptionist pattern)
- XState documentation (system.get())
```

---

## 📊 METRICS & TRACKING

### **Weekly Metrics Report** :

**Development** :
- Milestone progress : M4 (80% complete)
- Tasks completed : 12/15
- Code coverage : 85%
- Bugs open : 3 (2 low, 1 medium)

**Performance** :
- FPS average : 58 (target 50+)
- Load time : 2.5s (target <3s)
- Bundle size : 280KB gzipped (target <500KB)

**Risks** :
- 🟡 Animation crossfade pattern needs review (blocage potentiel)
- 🟢 No critical risks

---

## 🎯 PROCHAINES ÉTAPES

✅ **E11 COMPLÉTÉ** - Team Coordination

**Communication** :
- ✅ Daily standup (10min)
- ✅ Weekly sync (1h vendredi)
- ✅ Bi-weekly architecture review (2h)
- ✅ Phase reviews (fin chaque phase)

**Knowledge Sharing** :
- ✅ Documentation standards (JSDoc obligatoire)
- ✅ Code review process (toutes state machines)
- ✅ Pair programming (bloqueurs >4h)
- ✅ Wiki knowledge base (GitHub Wiki)

**Tools** :
- ✅ Git workflow (feature branches)
- ✅ GitHub Project Board (backlog → done)
- ✅ Slack channels (daily, reviews, bugs, xstate)

**Prochaine** : E12 Deployment Planning

---

**SESSION E11 TERMINÉE** ✅
