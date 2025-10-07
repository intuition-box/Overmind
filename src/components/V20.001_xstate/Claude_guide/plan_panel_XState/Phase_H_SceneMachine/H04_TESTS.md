# ✅ PHASE H - TESTS : Validation sceneMachine

**Date** : 3 octobre 2025
**Objectif** : Tester que sceneMachine fonctionne correctement

---

## 🎯 STRATÉGIE DE TESTS

### **1. Tests Console (rapide, sans UI)**
### **2. Tests Manuels UI**
### **3. Tests Unitaires (optionnel)**

---

## 1️⃣ TESTS CONSOLE (SANS UI)

### **Test 1 : Machine démarre correctement**

```typescript
// Dans console navigateur (DevTools)
import { createActor } from 'xstate';
import { sceneMachine } from './xstate-v5/actors/scene/sceneMachine';

const actor = createActor(sceneMachine);
actor.start();

console.log('Initial state:', actor.getSnapshot().value);
// Attendu: "idle"

console.log('Initial context:', actor.getSnapshot().context);
// Attendu: { backgroundColor: '#0a0a0a', gridEnabled: false, ... }
```

**✅ SUCCÈS SI** :
- State = `idle`
- `backgroundColor` = '#0a0a0a'
- `gridEnabled` = false
- `axesEnabled` = false

---

### **Test 2 : SET_SCENE passe en ready**

```typescript
import * as THREE from 'three';
const testScene = new THREE.Scene();

actor.send({ type: 'SET_SCENE', scene: testScene });

console.log('State:', actor.getSnapshot().value);
// Attendu: "ready"

console.log('Scene set:', actor.getSnapshot().context.scene !== null);
// Attendu: true

console.log('Background applied:', testScene.background);
// Attendu: THREE.Color('#0a0a0a')
```

**✅ SUCCÈS SI** :
- State passe de `idle` à `ready`
- `context.scene` contient la scène
- `scene.background` = Color('#0a0a0a')
- Console affiche : `[updateBackground] Set to #0a0a0a`

---

### **Test 3 : SET_BACKGROUND_COLOR change couleur**

```typescript
actor.send({ type: 'SET_BACKGROUND_COLOR', color: '#ff0000' });

console.log('New color:', actor.getSnapshot().context.backgroundColor);
// Attendu: '#ff0000'

console.log('Scene background:', testScene.background);
// Attendu: THREE.Color('#ff0000')
```

**✅ SUCCÈS SI** :
- `context.backgroundColor` = '#ff0000'
- `scene.background` = Color('#ff0000')
- Console affiche : `[updateBackground] Set to #ff0000`

---

### **Test 4 : TOGGLE_GRID active grille**

```typescript
console.log('Grid before:', actor.getSnapshot().context.gridEnabled);
// Attendu: false

actor.send({ type: 'TOGGLE_GRID' });

console.log('Grid after:', actor.getSnapshot().context.gridEnabled);
// Attendu: true

console.log('Grid helper created:', actor.getSnapshot().context.gridHelper !== null);
// Attendu: true

console.log('Grid in scene:', testScene.children.some(c => c instanceof THREE.GridHelper));
// Attendu: true
```

**✅ SUCCÈS SI** :
- `gridEnabled` = true
- `gridHelper` créé
- GridHelper ajouté à la scène
- Console affiche : `[toggleGrid] ENABLED (size: 20, divisions: 20)`

---

### **Test 5 : UPDATE_GRID_SIZE recrée grille**

```typescript
actor.send({ type: 'ENABLE_GRID' });
const oldGrid = actor.getSnapshot().context.gridHelper;

actor.send({ type: 'UPDATE_GRID_SIZE', size: 50 });

const newGrid = actor.getSnapshot().context.gridHelper;

console.log('Grid size changed:', actor.getSnapshot().context.gridSize);
// Attendu: 50

console.log('Grid recreated:', oldGrid !== newGrid);
// Attendu: true
```

**✅ SUCCÈS SI** :
- `gridSize` = 50
- Nouvelle instance de GridHelper créée
- Ancienne instance disposée
- Console affiche : `[recreateGrid] Recreated with size 50, divisions 20`

---

### **Test 6 : TOGGLE_AXES active axes**

```typescript
console.log('Axes before:', actor.getSnapshot().context.axesEnabled);
// Attendu: false

actor.send({ type: 'TOGGLE_AXES' });

console.log('Axes after:', actor.getSnapshot().context.axesEnabled);
// Attendu: true

console.log('Axes helper created:', actor.getSnapshot().context.axesHelper !== null);
// Attendu: true

console.log('Axes in scene:', testScene.children.some(c => c instanceof THREE.AxesHelper));
// Attendu: true
```

**✅ SUCCÈS SI** :
- `axesEnabled` = true
- `axesHelper` créé
- AxesHelper ajouté à la scène
- Console affiche : `[toggleAxes] ENABLED (size: 5)`

---

### **Test 7 : UPDATE_AXES_SIZE recrée axes**

```typescript
actor.send({ type: 'ENABLE_AXES' });
const oldAxes = actor.getSnapshot().context.axesHelper;

actor.send({ type: 'UPDATE_AXES_SIZE', size: 10 });

const newAxes = actor.getSnapshot().context.axesHelper;

console.log('Axes size changed:', actor.getSnapshot().context.axesSize);
// Attendu: 10

console.log('Axes recreated:', oldAxes !== newAxes);
// Attendu: true
```

**✅ SUCCÈS SI** :
- `axesSize` = 10
- Nouvelle instance de AxesHelper créée
- Ancienne instance disposée
- Console affiche : `[recreateAxes] Recreated with size 10`

---

### **Test 8 : Disable grid retire de scène**

```typescript
actor.send({ type: 'ENABLE_GRID' });
console.log('Grid in scene:', testScene.children.some(c => c instanceof THREE.GridHelper));
// Attendu: true

actor.send({ type: 'DISABLE_GRID' });
console.log('Grid in scene after disable:', testScene.children.some(c => c instanceof THREE.GridHelper));
// Attendu: false

console.log('Grid helper still exists:', actor.getSnapshot().context.gridHelper !== null);
// Attendu: true (pas disposé, juste retiré)
```

**✅ SUCCÈS SI** :
- GridHelper retiré de la scène
- `gridHelper` toujours en mémoire (pas null)
- Console affiche : `[toggleGrid] DISABLED`

---

## 2️⃣ TESTS MANUELS UI

### **Test UI 1 : Background color change visible**
1. Ouvrir ControlPanel → Tab Scene
2. Changer couleur background à rouge (#ff0000)
3. **Attendu** : Fond de la scène devient rouge

### **Test UI 2 : Grid toggle visible**
1. Cocher "Grid Enabled"
2. **Attendu** : Grille 20x20 apparaît au sol
3. Décocher "Grid Enabled"
4. **Attendu** : Grille disparaît

### **Test UI 3 : Grid size change**
1. Activer Grid
2. Mettre Size à 50
3. **Attendu** : Grille devient plus grande (50x50)

### **Test UI 4 : Grid divisions change**
1. Activer Grid
2. Mettre Divisions à 50
3. **Attendu** : Grille devient plus dense (50 divisions)

### **Test UI 5 : Grid colors change**
1. Activer Grid
2. Changer Color 1 à blanc (#ffffff)
3. **Attendu** : Lignes centrales deviennent blanches
4. Changer Color 2 à bleu (#0000ff)
5. **Attendu** : Lignes secondaires deviennent bleues

### **Test UI 6 : Axes toggle visible**
1. Cocher "Axes Enabled"
2. **Attendu** :
   - Axes apparaissent au centre (0,0,0)
   - Rouge = X, Vert = Y, Bleu = Z

### **Test UI 7 : Axes size change**
1. Activer Axes
2. Mettre Size à 10
3. **Attendu** : Axes deviennent plus longs

---

## 3️⃣ TESTS UNITAIRES (OPTIONNEL)

**Chemin** : `xstate-v5/tests/sceneMachine.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { sceneMachine } from '../actors/scene/sceneMachine';
import * as THREE from 'three';

describe('sceneMachine', () => {
  it('devrait démarrer en état idle', () => {
    const actor = createActor(sceneMachine);
    actor.start();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.gridEnabled).toBe(false);
  });

  it('devrait passer en ready après SET_SCENE', () => {
    const actor = createActor(sceneMachine);
    actor.start();

    const scene = new THREE.Scene();
    actor.send({ type: 'SET_SCENE', scene });

    expect(actor.getSnapshot().value).toBe('ready');
    expect(actor.getSnapshot().context.scene).toBe(scene);
  });

  it('devrait changer background color', () => {
    const actor = createActor(sceneMachine);
    actor.start();

    const scene = new THREE.Scene();
    actor.send({ type: 'SET_SCENE', scene });
    actor.send({ type: 'SET_BACKGROUND_COLOR', color: '#ff0000' });

    expect(actor.getSnapshot().context.backgroundColor).toBe('#ff0000');
    expect(scene.background).toBeInstanceOf(THREE.Color);
  });

  it('devrait toggle grid', () => {
    const actor = createActor(sceneMachine);
    actor.start();

    const scene = new THREE.Scene();
    actor.send({ type: 'SET_SCENE', scene });

    const initial = actor.getSnapshot().context.gridEnabled;

    actor.send({ type: 'TOGGLE_GRID' });

    expect(actor.getSnapshot().context.gridEnabled).toBe(!initial);
    expect(actor.getSnapshot().context.gridHelper).not.toBeNull();
  });

  it('devrait recréer grid après update size', () => {
    const actor = createActor(sceneMachine);
    actor.start();

    const scene = new THREE.Scene();
    actor.send({ type: 'SET_SCENE', scene });
    actor.send({ type: 'ENABLE_GRID' });

    const oldGrid = actor.getSnapshot().context.gridHelper;

    actor.send({ type: 'UPDATE_GRID_SIZE', size: 50 });

    const newGrid = actor.getSnapshot().context.gridHelper;

    expect(actor.getSnapshot().context.gridSize).toBe(50);
    expect(oldGrid).not.toBe(newGrid);
  });

  it('devrait toggle axes', () => {
    const actor = createActor(sceneMachine);
    actor.start();

    const scene = new THREE.Scene();
    actor.send({ type: 'SET_SCENE', scene });

    actor.send({ type: 'TOGGLE_AXES' });

    expect(actor.getSnapshot().context.axesEnabled).toBe(true);
    expect(actor.getSnapshot().context.axesHelper).not.toBeNull();
  });

  it('devrait recréer axes après update size', () => {
    const actor = createActor(sceneMachine);
    actor.start();

    const scene = new THREE.Scene();
    actor.send({ type: 'SET_SCENE', scene });
    actor.send({ type: 'ENABLE_AXES' });

    const oldAxes = actor.getSnapshot().context.axesHelper;

    actor.send({ type: 'UPDATE_AXES_SIZE', size: 10 });

    const newAxes = actor.getSnapshot().context.axesHelper;

    expect(actor.getSnapshot().context.axesSize).toBe(10);
    expect(oldAxes).not.toBe(newAxes);
  });
});
```

**Exécuter** : `npm run test`

---

## 📋 CHECKLIST VALIDATION COMPLÈTE

### **Fonctionnel**
- [ ] Machine démarre en état `idle`
- [ ] SET_SCENE passe en `ready` et applique background
- [ ] SET_BACKGROUND_COLOR change scene.background
- [ ] TOGGLE_GRID active/désactive grille
- [ ] UPDATE_GRID_SIZE/DIVISIONS recrée grille
- [ ] UPDATE_GRID_COLOR1/COLOR2 recrée grille avec nouvelles couleurs
- [ ] TOGGLE_AXES active/désactive axes
- [ ] UPDATE_AXES_SIZE recrée axes

### **Technique**
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur console navigateur
- [ ] Helpers disposés correctement (geometry + material)
- [ ] Pas de mutation directe du context
- [ ] Console.log présents pour debug

### **Performance**
- [ ] Recreate helpers instantané (< 1ms)
- [ ] Pas de memory leaks (dispose fonctionne)
- [ ] Pas de lag lors du toggle

---

## 🐛 BUGS POTENTIELS À SURVEILLER

### **Bug 1 : Memory leak helpers**
**Symptôme** : Mémoire augmente lors de recreate
**Cause** : Geometry/Material pas disposés
**Solution** : Toujours appeler dispose() avant de recréer

### **Bug 2 : Helper pas visible après toggle**
**Symptôme** : Toggle activé mais grille invisible
**Cause** : Helper pas ajouté à la scène
**Solution** : Vérifier scene.add() appelé

### **Bug 3 : Background color mal formatée**
**Symptôme** : Erreur THREE.Color
**Cause** : Color string invalide (ex: "red" au lieu de "#ff0000")
**Solution** : Valider format hex avant assign

### **Bug 4 : Grid/Axes multiples**
**Symptôme** : Plusieurs grilles dans la scène
**Cause** : Pas de remove avant add
**Solution** : Toujours remove avant add

### **Bug 5 : Recreate sans enabled**
**Symptôme** : Helper recréé mais invisible
**Cause** : recreate appelé quand disabled
**Solution** : Vérifier `if (!context.gridEnabled) return` dans recreate

---

## ✅ CRITÈRES DE SUCCÈS

**Phase H validée SI** :
- ✅ Tous les tests console passent
- ✅ 0 erreurs TypeScript
- ✅ 0 erreurs console navigateur
- ✅ Background color change instantané
- ✅ Grid/Axes toggle visible/invisible
- ✅ Grid/Axes params changent en temps réel
- ✅ Helpers disposés correctement (no memory leaks)

---

## ➡️ PROCHAINE ÉTAPE

**Si Phase H validée** → Passer à **Phase E (ControlPanel - 6 tabs UI)** pour intégrer toutes les machines !

---

**FIN TESTS PHASE H**
