# ✅ PHASE G - TESTS : Validation effectsMachine

**Date** : 3 octobre 2025
**Objectif** : Tester que effectsMachine fonctionne correctement

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
import { effectsMachine } from './xstate-v5/actors/effects/effectsMachine';

const actor = createActor(effectsMachine);
actor.start();

console.log('Initial state:', actor.getSnapshot().value);
// Attendu: "idle"

console.log('Initial context:', actor.getSnapshot().context);
// Attendu: { glowEnabled: false, ultraBloomEnabled: false, ... }
```

**✅ SUCCÈS SI** :
- State = `idle`
- `glowEnabled` = false
- `ultraBloomEnabled` = false
- `motionTrailEnabled` = false
- `currentPreset` = 'none'

---

### **Test 2 : SET_CLOCK passe en ready**

```typescript
import * as THREE from 'three';
const testClock = new THREE.Clock();

actor.send({ type: 'SET_CLOCK', clock: testClock });

console.log('State:', actor.getSnapshot().value);
// Attendu: "ready"

console.log('Clock set:', actor.getSnapshot().context.clock !== null);
// Attendu: true
```

**✅ SUCCÈS SI** :
- State passe de `idle` à `ready`
- `context.clock` contient le clock

---

### **Test 3 : TOGGLE_GLOW change enabled**

```typescript
console.log('Glow before:', actor.getSnapshot().context.glowEnabled);
// Attendu: false

actor.send({ type: 'TOGGLE_GLOW' });

console.log('Glow after:', actor.getSnapshot().context.glowEnabled);
// Attendu: true
```

**✅ SUCCÈS SI** :
- Toggle change `glowEnabled` de false → true
- `currentPreset` change à 'none'

---

### **Test 4 : UPDATE_GLOW calcule intensity**

```typescript
actor.send({ type: 'ENABLE_GLOW' });
actor.send({ type: 'UPDATE_GLOW_SPEED', speed: 1.0 });
actor.send({ type: 'UPDATE_GLOW_MIN', min: 0.5 });
actor.send({ type: 'UPDATE_GLOW_MAX', max: 2.0 });

const elapsed = 0;  // t=0
actor.send({ type: 'UPDATE_GLOW', elapsed });

const intensity1 = actor.getSnapshot().context.currentGlowIntensity;
console.log('Intensity at t=0:', intensity1);
// Attendu: ~1.25 (middle value)

const elapsed2 = Math.PI / 2;  // Peak
actor.send({ type: 'UPDATE_GLOW', elapsed: elapsed2 });

const intensity2 = actor.getSnapshot().context.currentGlowIntensity;
console.log('Intensity at peak:', intensity2);
// Attendu: ~2.0 (max)
```

**✅ SUCCÈS SI** :
- Intensity varie selon sin(elapsed * speed)
- Valeurs entre min et max

---

### **Test 5 : TOGGLE_GLOW_TARGET ajoute/retire target**

```typescript
console.log('Targets before:', actor.getSnapshot().context.glowTargets);
// Attendu: ['iris']

actor.send({ type: 'TOGGLE_GLOW_TARGET', target: 'eyeRings' });

console.log('Targets after add:', actor.getSnapshot().context.glowTargets);
// Attendu: ['iris', 'eyeRings']

actor.send({ type: 'TOGGLE_GLOW_TARGET', target: 'iris' });

console.log('Targets after remove:', actor.getSnapshot().context.glowTargets);
// Attendu: ['eyeRings']
```

**✅ SUCCÈS SI** :
- Toggle ajoute target si absent
- Toggle retire target si présent

---

### **Test 6 : APPLY_VISUAL_PRESET "intense"**

```typescript
actor.send({ type: 'APPLY_VISUAL_PRESET', preset: 'intense' });

const ctx = actor.getSnapshot().context;

console.log('Glow enabled:', ctx.glowEnabled);
// Attendu: true

console.log('Glow speed:', ctx.glowSpeed);
// Attendu: 2.0

console.log('Glow targets:', ctx.glowTargets);
// Attendu: ['iris', 'eyeRings', 'magicRings']

console.log('Ultra Bloom enabled:', ctx.ultraBloomEnabled);
// Attendu: true

console.log('Ultra Bloom intensity:', ctx.ultraBloomIntensity);
// Attendu: 10.0

console.log('Current preset:', ctx.currentPreset);
// Attendu: "intense"
```

**✅ SUCCÈS SI** :
- Toutes les valeurs du preset "intense" appliquées
- `currentPreset` = 'intense'
- Console affiche : `[applyUltraBloom] ENABLED - Intensity: 10.0, ...`

---

### **Test 7 : Modification manuelle annule preset**

```typescript
actor.send({ type: 'APPLY_VISUAL_PRESET', preset: 'subtle' });
console.log('Preset:', actor.getSnapshot().context.currentPreset);
// Attendu: "subtle"

actor.send({ type: 'UPDATE_GLOW_SPEED', speed: 3.0 });

console.log('Preset after manual change:', actor.getSnapshot().context.currentPreset);
// Attendu: "none"
```

**✅ SUCCÈS SI** :
- Modification manuelle change preset à 'none'

---

### **Test 8 : TOGGLE_ULTRA_BLOOM**

```typescript
actor.send({ type: 'ENABLE_ULTRA_BLOOM' });

console.log('Ultra Bloom enabled:', actor.getSnapshot().context.ultraBloomEnabled);
// Attendu: true

// Vérifier que action applyUltraBloom est appelée
// → Regarder console.log : [applyUltraBloom] ENABLED
```

**✅ SUCCÈS SI** :
- `ultraBloomEnabled` = true
- Console affiche : `[applyUltraBloom] ENABLED - Intensity: 10.0, Threshold: 0.1`

---

## 2️⃣ TESTS MANUELS UI

### **Test UI 1 : Glow pulse visible**
1. Ouvrir ControlPanel → Tab Effects
2. Activer "Glow Effect"
3. Mettre Speed à 2.0
4. **Attendu** : IRIS pulse rapidement (2 cycles par seconde)

### **Test UI 2 : Glow targets**
1. Activer Glow
2. Cocher "Eye Rings" et "Magic Rings"
3. **Attendu** : IRIS + Eye Rings + Magic Rings pulsent ensemble

### **Test UI 3 : Ultra Bloom actif**
1. Activer "Ultra Bloom"
2. **Attendu** :
   - Bloom devient TRÈS intense
   - Scène très lumineuse
   - Threshold bas → presque tout bloom

### **Test UI 4 : Motion Trail actif**
1. Activer "Motion Trail"
2. Bouger la caméra ou animer un objet
3. **Attendu** : Traînée visible (afterimage)

### **Test UI 5 : Preset Cinematic**
1. Dropdown "Visual Presets" → Choisir "Cinematic"
2. **Attendu** :
   - Glow lent (speed 0.3)
   - Ultra Bloom modéré (intensity 8.0)
   - Motion Trail activé (length 0.7)
   - Dropdown affiche "Cinematic"

### **Test UI 6 : Preset Subtle**
1. Choisir preset "Subtle"
2. **Attendu** :
   - Glow doux (min: 0.8, max: 1.2)
   - Ultra Bloom désactivé
   - Motion Trail désactivé

---

## 3️⃣ TESTS UNITAIRES (OPTIONNEL)

**Chemin** : `xstate-v5/tests/effectsMachine.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { effectsMachine } from '../actors/effects/effectsMachine';
import * as THREE from 'three';

describe('effectsMachine', () => {
  it('devrait démarrer en état idle', () => {
    const actor = createActor(effectsMachine);
    actor.start();

    expect(actor.getSnapshot().value).toBe('idle');
    expect(actor.getSnapshot().context.glowEnabled).toBe(false);
  });

  it('devrait passer en ready après SET_CLOCK', () => {
    const actor = createActor(effectsMachine);
    actor.start();

    const clock = new THREE.Clock();
    actor.send({ type: 'SET_CLOCK', clock });

    expect(actor.getSnapshot().value).toBe('ready');
    expect(actor.getSnapshot().context.clock).toBe(clock);
  });

  it('devrait toggle glow enabled', () => {
    const actor = createActor(effectsMachine);
    actor.start();
    actor.send({ type: 'SET_CLOCK', clock: new THREE.Clock() });

    const initial = actor.getSnapshot().context.glowEnabled;

    actor.send({ type: 'TOGGLE_GLOW' });

    expect(actor.getSnapshot().context.glowEnabled).toBe(!initial);
  });

  it('devrait calculer glow intensity', () => {
    const actor = createActor(effectsMachine);
    actor.start();
    actor.send({ type: 'SET_CLOCK', clock: new THREE.Clock() });
    actor.send({ type: 'ENABLE_GLOW' });

    actor.send({ type: 'UPDATE_GLOW', elapsed: 0 });

    const intensity = actor.getSnapshot().context.currentGlowIntensity;
    expect(intensity).toBeGreaterThanOrEqual(0.5);
    expect(intensity).toBeLessThanOrEqual(2.0);
  });

  it('devrait toggle glow target', () => {
    const actor = createActor(effectsMachine);
    actor.start();
    actor.send({ type: 'SET_CLOCK', clock: new THREE.Clock() });

    const initialTargets = actor.getSnapshot().context.glowTargets;
    expect(initialTargets).toEqual(['iris']);

    actor.send({ type: 'TOGGLE_GLOW_TARGET', target: 'eyeRings' });

    const newTargets = actor.getSnapshot().context.glowTargets;
    expect(newTargets).toContain('iris');
    expect(newTargets).toContain('eyeRings');
  });

  it('devrait appliquer preset intense', () => {
    const actor = createActor(effectsMachine);
    actor.start();
    actor.send({ type: 'SET_CLOCK', clock: new THREE.Clock() });

    actor.send({ type: 'APPLY_VISUAL_PRESET', preset: 'intense' });

    const ctx = actor.getSnapshot().context;
    expect(ctx.glowEnabled).toBe(true);
    expect(ctx.glowSpeed).toBe(2.0);
    expect(ctx.ultraBloomEnabled).toBe(true);
    expect(ctx.currentPreset).toBe('intense');
  });

  it('devrait annuler preset après modification manuelle', () => {
    const actor = createActor(effectsMachine);
    actor.start();
    actor.send({ type: 'SET_CLOCK', clock: new THREE.Clock() });

    actor.send({ type: 'APPLY_VISUAL_PRESET', preset: 'subtle' });
    expect(actor.getSnapshot().context.currentPreset).toBe('subtle');

    actor.send({ type: 'UPDATE_GLOW_SPEED', speed: 3.0 });
    expect(actor.getSnapshot().context.currentPreset).toBe('none');
  });
});
```

**Exécuter** : `npm run test`

---

## 📋 CHECKLIST VALIDATION COMPLÈTE

### **Fonctionnel**
- [ ] Machine démarre en état `idle`
- [ ] SET_CLOCK passe en `ready`
- [ ] TOGGLE_GLOW change enabled
- [ ] UPDATE_GLOW calcule intensity correctement
- [ ] TOGGLE_GLOW_TARGET ajoute/retire targets
- [ ] TOGGLE_ULTRA_BLOOM active ultra bloom
- [ ] TOGGLE_MOTION_TRAIL active motion trail
- [ ] Presets appliquent toutes valeurs atomiquement
- [ ] Modifications manuelles changent preset à 'none'

### **Technique**
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur console navigateur
- [ ] UPDATE_GLOW appelé chaque frame
- [ ] sendTo('material', ...) pour glow targets
- [ ] sendTo('bloom', ...) pour ultra bloom
- [ ] Pas de mutation directe du context
- [ ] Console.log présents pour debug

### **Performance**
- [ ] Glow calculation < 0.1ms
- [ ] Pas de memory leaks
- [ ] Pas de re-renders inutiles

---

## 🐛 BUGS POTENTIELS À SURVEILLER

### **Bug 1 : Glow intensity NaN**
**Symptôme** : currentGlowIntensity = NaN
**Cause** : min/max inversés ou speed = 0
**Solution** : Valider min < max, speed > 0

### **Bug 2 : Ultra Bloom ne s'applique pas**
**Symptôme** : Aucun changement visuel
**Cause** : bloomMachine pas spawn ou systemId incorrect
**Solution** : Vérifier que bloomMachine systemId = 'bloom'

### **Bug 3 : Glow targets vide après toggle**
**Symptôme** : Retirer le dernier target vide le array
**Cause** : Aucune vérification de longueur
**Solution** : Empêcher de retirer si `targets.length === 1`

### **Bug 4 : Motion Trail pas visible**
**Symptôme** : AfterimagePass activé mais pas d'effet
**Cause** : Pass pas ajouté au composer
**Solution** : S'assurer que `composer.addPass(afterimagePass)`

### **Bug 5 : Preset ne s'applique pas complètement**
**Symptôme** : Seulement une partie du preset appliquée
**Cause** : Actions pas toutes appelées
**Solution** : Vérifier que actions array contient toutes les actions nécessaires

---

## ✅ CRITÈRES DE SUCCÈS

**Phase G validée SI** :
- ✅ Tous les tests console passent
- ✅ 0 erreurs TypeScript
- ✅ 0 erreurs console navigateur
- ✅ Glow pulse en temps réel
- ✅ Ultra Bloom override bloom parameters
- ✅ Motion Trail fonctionne
- ✅ Presets appliquent toutes valeurs atomiquement
- ✅ Communication avec bloomMachine et materialMachine fonctionne

---

## ➡️ PROCHAINE ÉTAPE

**Si Phase G validée** → Passer à Phase H (sceneMachine)

---

**FIN TESTS PHASE G**
