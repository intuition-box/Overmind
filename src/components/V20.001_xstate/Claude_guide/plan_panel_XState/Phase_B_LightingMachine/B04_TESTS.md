# ✅ PHASE B - TESTS : Validation lightingMachine

**Date** : 3 octobre 2025
**Objectif** : Tester que lightingMachine étendu fonctionne correctement

---

## 🎯 STRATÉGIE DE TESTS

### **1. Tests Console (rapide, sans UI)**
### **2. Tests Manuels UI (après Phase C)**
### **3. Tests Unitaires (optionnel)**

---

## 1️⃣ TESTS CONSOLE (SANS UI)

### **Test 1 : Machine démarre correctement**

```typescript
// Dans console navigateur (DevTools)
import { createActor } from 'xstate';
import { lightingMachine } from './xstate-v5/actors/lighting/lightingMachine';

const actor = createActor(lightingMachine);
actor.start();

console.log('Initial state:', actor.getSnapshot().value);
// Attendu: "idle"

console.log('Initial context:', actor.getSnapshot().context);
// Attendu: { exposure: 1.7, hdrBoostEnabled: true, hdrBoostMultiplier: 2.5, ... }
```

**✅ SUCCÈS SI** :
- State = `idle`
- Context contient `exposure`, `hdrBoostEnabled`, `hdrBoostMultiplier`, `directionalPosition`
- `currentPreset` = 'studio-classic'

---

### **Test 2 : UPDATE_EXPOSURE fonctionne**

```typescript
actor.send({ type: 'UPDATE_EXPOSURE', exposure: 2.0 });

console.log('New exposure:', actor.getSnapshot().context.exposure);
// Attendu: 2.0
```

**✅ SUCCÈS SI** :
- `context.exposure` = 2.0
- Pas d'erreurs console

---

### **Test 3 : TOGGLE_HDR_BOOST fonctionne**

```typescript
console.log('HDR Boost before:', actor.getSnapshot().context.hdrBoostEnabled);
// Attendu: true

actor.send({ type: 'TOGGLE_HDR_BOOST' });

console.log('HDR Boost after:', actor.getSnapshot().context.hdrBoostEnabled);
// Attendu: false

actor.send({ type: 'TOGGLE_HDR_BOOST' });

console.log('HDR Boost after 2nd toggle:', actor.getSnapshot().context.hdrBoostEnabled);
// Attendu: true
```

**✅ SUCCÈS SI** :
- Toggle change `hdrBoostEnabled` de true → false → true

---

### **Test 4 : UPDATE_HDR_MULTIPLIER fonctionne**

```typescript
actor.send({ type: 'UPDATE_HDR_MULTIPLIER', multiplier: 3.0 });

console.log('New HDR multiplier:', actor.getSnapshot().context.hdrBoostMultiplier);
// Attendu: 3.0
```

**✅ SUCCÈS SI** :
- `context.hdrBoostMultiplier` = 3.0

---

### **Test 5 : APPLY_LIGHT_PRESET fonctionne**

```typescript
actor.send({ type: 'APPLY_LIGHT_PRESET', preset: 'top-down' });

console.log('Current preset:', actor.getSnapshot().context.currentPreset);
// Attendu: "top-down"

console.log('Position:', actor.getSnapshot().context.directionalPosition);
// Attendu: { x: 0, y: 5, z: 0 }
```

**✅ SUCCÈS SI** :
- `currentPreset` = 'top-down'
- `directionalPosition` = { x: 0, y: 5, z: 0 }

---

### **Test 6 : Action updateExposure applique au renderer**

```typescript
// Créer un renderer de test
import * as THREE from 'three';
const testRenderer = new THREE.WebGLRenderer();

actor.send({ type: 'SET_RENDERER', renderer: testRenderer });
actor.send({ type: 'UPDATE_EXPOSURE', exposure: 2.5 });

console.log('Renderer toneMappingExposure:', testRenderer.toneMappingExposure);
// Attendu: 2.5 * 2.5 = 6.25 (car HDR boost enabled)
```

**✅ SUCCÈS SI** :
- `testRenderer.toneMappingExposure` = 6.25 (exposure * multiplier car HDR boost ON)
- Console affiche : `[updateExposure] Set exposure to 6.25 (base: 2.5, HDR: ON)`

---

### **Test 7 : HDR Boost désactivé n'applique pas multiplier**

```typescript
actor.send({ type: 'DISABLE_HDR_BOOST' });
actor.send({ type: 'UPDATE_EXPOSURE', exposure: 2.0 });

console.log('Renderer toneMappingExposure (HDR OFF):', testRenderer.toneMappingExposure);
// Attendu: 2.0 (pas de multiplier)
```

**✅ SUCCÈS SI** :
- `testRenderer.toneMappingExposure` = 2.0 (pas de boost)
- Console affiche : `[updateExposure] Set exposure to 2.0 (base: 2.0, HDR: OFF)`

---

### **Test 8 : Action updateDirectionalPosition applique à la lumière**

```typescript
// Créer lumières de test
const testDirectional = new THREE.DirectionalLight();

actor.send({ type: 'INITIALIZE',
  ambientLight: new THREE.AmbientLight(),
  directionalLight: testDirectional,
  pointLight: new THREE.PointLight()
});

actor.send({ type: 'APPLY_LIGHT_PRESET', preset: 'side-dramatic' });

console.log('DirectionalLight position:', testDirectional.position);
// Attendu: { x: 5, y: 1, z: 1 }
```

**✅ SUCCÈS SI** :
- `testDirectional.position` = (5, 1, 1)
- Console affiche : `[updateDirectionalPosition] Set position to (5, 1, 1)`

---

## 2️⃣ TESTS MANUELS UI (APRÈS PHASE C)

### **Test UI 1 : Slider Exposure**
1. Ouvrir ControlPanel → Tab Lighting
2. Bouger slider "Exposure" de 1.7 à 2.5
3. **Attendu** : Scène devient plus lumineuse

### **Test UI 2 : Toggle HDR Boost**
1. Ouvrir ControlPanel → Tab Lighting
2. Cliquer toggle "HDR Boost"
3. **Attendu** :
   - Toggle OFF : Scène devient moins lumineuse
   - Toggle ON : Scène redevient lumineuse

### **Test UI 3 : Slider HDR Multiplier**
1. Ouvrir ControlPanel → Tab Lighting
2. HDR Boost activé
3. Bouger slider "Multiplier" de 2.5 à 4.0
4. **Attendu** : Scène devient beaucoup plus lumineuse

### **Test UI 4 : Dropdown Presets**
1. Ouvrir ControlPanel → Tab Lighting
2. Changer preset de "studio-classic" à "top-down"
3. **Attendu** : Lumière vient du haut (plongée)
4. Changer à "side-dramatic"
5. **Attendu** : Lumière vient du côté (dramatique)

### **Test UI 5 : Intensités lumières**
1. Ouvrir ControlPanel → Tab Lighting
2. Bouger slider "Ambient" de 0.5 à 1.0
3. **Attendu** : Scène plus claire (lumière ambiante)
4. Bouger slider "Directional" de 0.8 à 0.2
5. **Attendu** : Ombres moins marquées

---

## 3️⃣ TESTS UNITAIRES (OPTIONNEL)

**Chemin** : `xstate-v5/tests/lightingMachine.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { lightingMachine } from '../actors/lighting/lightingMachine';
import * as THREE from 'three';

describe('lightingMachine', () => {
  it('devrait démarrer en état idle', () => {
    const actor = createActor(lightingMachine);
    actor.start();

    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('devrait mettre à jour exposure', () => {
    const actor = createActor(lightingMachine);
    actor.start();

    actor.send({ type: 'UPDATE_EXPOSURE', exposure: 2.0 });

    expect(actor.getSnapshot().context.exposure).toBe(2.0);
  });

  it('devrait toggle HDR boost', () => {
    const actor = createActor(lightingMachine);
    actor.start();

    const initial = actor.getSnapshot().context.hdrBoostEnabled;

    actor.send({ type: 'TOGGLE_HDR_BOOST' });

    expect(actor.getSnapshot().context.hdrBoostEnabled).toBe(!initial);
  });

  it('devrait appliquer preset light position', () => {
    const actor = createActor(lightingMachine);
    actor.start();

    actor.send({ type: 'APPLY_LIGHT_PRESET', preset: 'top-down' });

    expect(actor.getSnapshot().context.currentPreset).toBe('top-down');
    expect(actor.getSnapshot().context.directionalPosition).toEqual({ x: 0, y: 5, z: 0 });
  });

  it('devrait appliquer exposure au renderer', () => {
    const actor = createActor(lightingMachine);
    actor.start();

    const renderer = new THREE.WebGLRenderer();
    actor.send({ type: 'SET_RENDERER', renderer });
    actor.send({ type: 'DISABLE_HDR_BOOST' });
    actor.send({ type: 'UPDATE_EXPOSURE', exposure: 2.0 });

    expect(renderer.toneMappingExposure).toBe(2.0);
  });

  it('devrait appliquer HDR boost avec multiplier', () => {
    const actor = createActor(lightingMachine);
    actor.start();

    const renderer = new THREE.WebGLRenderer();
    actor.send({ type: 'SET_RENDERER', renderer });
    actor.send({ type: 'ENABLE_HDR_BOOST' });
    actor.send({ type: 'UPDATE_HDR_MULTIPLIER', multiplier: 2.0 });
    actor.send({ type: 'UPDATE_EXPOSURE', exposure: 1.5 });

    expect(renderer.toneMappingExposure).toBe(3.0); // 1.5 * 2.0
  });
});
```

**Exécuter** : `npm run test`

---

## 📋 CHECKLIST VALIDATION COMPLÈTE

### **Fonctionnel**
- [ ] Machine démarre en état `idle`
- [ ] Context initial correct (exposure: 1.7, hdrBoostEnabled: true, etc.)
- [ ] Event `UPDATE_EXPOSURE` modifie context.exposure
- [ ] Event `TOGGLE_HDR_BOOST` toggle context.hdrBoostEnabled
- [ ] Event `UPDATE_HDR_MULTIPLIER` modifie context.hdrBoostMultiplier
- [ ] Event `APPLY_LIGHT_PRESET` change position et currentPreset
- [ ] Event `UPDATE_DIRECTIONAL_POSITION` change position manuellement
- [ ] Action `updateExposure` modifie renderer.toneMappingExposure
- [ ] HDR Boost applique correctement le multiplier
- [ ] HDR Boost désactivé n'applique pas le multiplier
- [ ] Action `updateDirectionalPosition` modifie position lumière

### **Technique**
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur console navigateur
- [ ] Services loggent correctement
- [ ] Pas de mutation directe du context (utilisation de `assign`)
- [ ] Presets importés correctement depuis `lightPresets.ts`

### **Performance**
- [ ] Changements instantanés (pas de lag)
- [ ] Pas de re-renders inutiles
- [ ] Pas de memory leaks

---

## 🐛 BUGS POTENTIELS À SURVEILLER

### **Bug 1 : Renderer null**
**Symptôme** : Erreur "Cannot set property 'toneMappingExposure' of null"
**Cause** : `SET_RENDERER` pas appelé avant `UPDATE_EXPOSURE`
**Solution** : Vérifier que renderer est initialisé avant utilisation

### **Bug 2 : HDR Boost calcul incorrect**
**Symptôme** : Exposition trop forte ou trop faible
**Cause** : Multiplier appliqué plusieurs fois
**Solution** : S'assurer que `updateExposure` calcule correctement : `enabled ? base * multiplier : base`

### **Bug 3 : Preset "custom" non défini**
**Symptôme** : Erreur "preset 'custom' not found"
**Cause** : `UPDATE_DIRECTIONAL_POSITION` assigne 'custom' mais preset n'existe pas dans `LIGHT_POSITION_PRESETS`
**Solution** : Accepter 'custom' comme preset spécial (pas dans la liste)

### **Bug 4 : Position pas appliquée**
**Symptôme** : Lumière ne bouge pas après changement preset
**Cause** : `updateDirectionalPosition` pas appelé après assign
**Solution** : Vérifier que l'action est dans le array d'actions

---

## ✅ CRITÈRES DE SUCCÈS

**Phase B validée SI** :
- ✅ Tous les tests console passent
- ✅ 0 erreurs TypeScript
- ✅ 0 erreurs console navigateur
- ✅ Renderer toneMappingExposure modifié correctement
- ✅ DirectionalLight position change avec presets
- ✅ HDR Boost fonctionne (avec/sans multiplier)

---

## ➡️ PROCHAINE ÉTAPE

**Si Phase B validée** → Passer à [Phase_C_ControlPanel](../Phase_C_ControlPanel/C01_MAQUETTE_UI.md)

---

**FIN TESTS PHASE B**
