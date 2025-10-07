# ✅ PHASE C - TESTS : Validation pbrMachine

**Date** : 3 octobre 2025
**Objectif** : Tester que pbrMachine fonctionne correctement

---

## 🎯 STRATÉGIE DE TESTS

### **1. Tests Console (rapide, sans UI)**
### **2. Tests Manuels UI (après Phase E)**
### **3. Tests Unitaires (optionnel)**

---

## 1️⃣ TESTS CONSOLE (SANS UI)

### **Test 1 : Machine démarre correctement**

```typescript
// Dans console navigateur (DevTools)
import { createActor } from 'xstate';
import { pbrMachine } from './xstate-v5/actors/pbr/pbrMachine';

const actor = createActor(pbrMachine);
actor.start();

console.log('Initial state:', actor.getSnapshot().value);
// Attendu: "idle"

console.log('Initial context:', actor.getSnapshot().context);
// Attendu: { toneMapping: 'ACESFilmic', eyeRings: { metalness: 0.5, ... }, ... }
```

**✅ SUCCÈS SI** :
- State = `idle`
- Context contient 4 object types (eyeRings, iris, magicRings, arms)
- `toneMapping` = 'ACESFilmic'
- `currentPreset` = 'custom'

---

### **Test 2 : UPDATE_EYE_RINGS_METALNESS fonctionne**

```typescript
actor.send({ type: 'UPDATE_EYE_RINGS_METALNESS', metalness: 0.8 });

console.log('New metalness:', actor.getSnapshot().context.eyeRings.metalness);
// Attendu: 0.8

console.log('Preset changed to:', actor.getSnapshot().context.currentPreset);
// Attendu: "custom" (preset annulé car modification manuelle)
```

**✅ SUCCÈS SI** :
- `context.eyeRings.metalness` = 0.8
- `currentPreset` = 'custom'
- Pas d'erreurs console

---

### **Test 3 : SET_TONE_MAPPING fonctionne**

```typescript
import * as THREE from 'three';
const testRenderer = new THREE.WebGLRenderer();

actor.send({ type: 'SET_RENDERER', renderer: testRenderer });
actor.send({ type: 'SET_TONE_MAPPING', toneMapping: 'Cinematic' });

console.log('Renderer toneMapping:', testRenderer.toneMapping);
// Attendu: THREE.CinematicToneMapping (value = 4)

console.log('Context toneMapping:', actor.getSnapshot().context.toneMapping);
// Attendu: "Cinematic"
```

**✅ SUCCÈS SI** :
- `testRenderer.toneMapping` = THREE.CinematicToneMapping
- `context.toneMapping` = 'Cinematic'
- Console affiche : `[applyToneMapping] Set to Cinematic`

---

### **Test 4 : APPLY_PBR_PRESET Chrome**

```typescript
actor.send({ type: 'APPLY_PBR_PRESET', preset: 'chrome' });

const ctx = actor.getSnapshot().context;

console.log('Eye Rings:', ctx.eyeRings);
// Attendu: { metalness: 1.0, roughness: 0.1, envMapIntensity: 2.0 }

console.log('IRIS:', ctx.iris);
// Attendu: { metalness: 0.9, roughness: 0.2, envMapIntensity: 1.8 }

console.log('Current preset:', ctx.currentPreset);
// Attendu: "chrome"
```

**✅ SUCCÈS SI** :
- Tous les object types ont valeurs du preset Chrome
- `currentPreset` = 'chrome'
- Console affiche : `[applyAllPBR] Applied preset chrome to all objects`

---

### **Test 5 : Collect Materials**

```typescript
// Créer une scène de test avec objets nommés
import * as THREE from 'three';

const testScene = new THREE.Scene();

// Eye Ring mesh
const eyeRingMesh = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshStandardMaterial()
);
eyeRingMesh.name = 'EYE_RING_LEFT';
testScene.add(eyeRingMesh);

// IRIS mesh
const irisMesh = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshStandardMaterial()
);
irisMesh.name = 'IRIS_MAIN';
testScene.add(irisMesh);

actor.send({ type: 'SET_SCENE', scene: testScene });
actor.send({ type: 'COLLECT_MATERIALS' });

console.log('State:', actor.getSnapshot().value);
// Attendu: "ready"

const ctx = actor.getSnapshot().context;
console.log('Eye Rings materials found:', ctx.eyeRings.materials?.length);
// Attendu: 1

console.log('IRIS materials found:', ctx.iris.materials?.length);
// Attendu: 1
```

**✅ SUCCÈS SI** :
- State passe de `idle` à `ready`
- `eyeRings.materials` contient 1 material
- `iris.materials` contient 1 material
- Console affiche : `[collectMaterials] Found 1 eyeRing, 1 iris, 0 magicRing, 0 arm materials`

---

### **Test 6 : Apply PBR modifie matériaux**

```typescript
// (Suite du test 5)
actor.send({ type: 'UPDATE_EYE_RINGS_METALNESS', metalness: 0.9 });

const mat = ctx.eyeRings.materials[0];
if (mat instanceof THREE.MeshStandardMaterial) {
  console.log('Material metalness:', mat.metalness);
  // Attendu: 0.9
}
```

**✅ SUCCÈS SI** :
- Material.metalness = 0.9
- Console affiche : `[applyEyeRingsPBR] metalness=0.90, roughness=0.50, envMap=1.00`

---

### **Test 7 : Preset Glass**

```typescript
actor.send({ type: 'APPLY_PBR_PRESET', preset: 'glass' });

const ctx = actor.getSnapshot().context;

console.log('Eye Rings metalness:', ctx.eyeRings.metalness);
// Attendu: 0.0 (glass = no metal)

console.log('Eye Rings roughness:', ctx.eyeRings.roughness);
// Attendu: 0.0 (glass = smooth)

console.log('Eye Rings envMap:', ctx.eyeRings.envMapIntensity);
// Attendu: 1.5
```

**✅ SUCCÈS SI** :
- Valeurs correspondent au preset Glass
- `currentPreset` = 'glass'

---

### **Test 8 : Modifications manuelles annulent preset**

```typescript
actor.send({ type: 'APPLY_PBR_PRESET', preset: 'chrome' });
console.log('Preset:', actor.getSnapshot().context.currentPreset);
// Attendu: "chrome"

actor.send({ type: 'UPDATE_IRIS_ROUGHNESS', roughness: 0.7 });
console.log('Preset after manual change:', actor.getSnapshot().context.currentPreset);
// Attendu: "custom"
```

**✅ SUCCÈS SI** :
- Après preset : `currentPreset` = 'chrome'
- Après modification manuelle : `currentPreset` = 'custom'

---

## 2️⃣ TESTS MANUELS UI (APRÈS PHASE E)

### **Test UI 1 : Slider Metalness Eye Rings**
1. Ouvrir ControlPanel → Tab PBR
2. Section "Eye Rings"
3. Bouger slider "Metalness" de 0.5 à 1.0
4. **Attendu** : Eye Rings deviennent très brillants (metal)

### **Test UI 2 : Slider Roughness IRIS**
1. Ouvrir ControlPanel → Tab PBR
2. Section "IRIS"
3. Bouger slider "Roughness" de 0.6 à 0.0
4. **Attendu** : IRIS devient très lisse (miroir)

### **Test UI 3 : Dropdown Tone Mapping**
1. Ouvrir ControlPanel → Tab PBR
2. Changer Tone Mapping de "ACESFilmic" à "Linear"
3. **Attendu** : Couleurs de la scène changent (moins contrastées)

### **Test UI 4 : Preset Chrome**
1. Ouvrir ControlPanel → Tab PBR
2. Dropdown "PBR Presets" → Choisir "Chrome"
3. **Attendu** :
   - Tous les objets deviennent très métalliques
   - Reflets environnement très visibles
   - Dropdown affiche "Chrome"

### **Test UI 5 : Preset Matte**
1. Ouvrir ControlPanel → Tab PBR
2. Dropdown "PBR Presets" → Choisir "Matte"
3. **Attendu** :
   - Tous les objets deviennent mats (pas de reflets)
   - Surfaces diffuses
   - Dropdown affiche "Matte"

### **Test UI 6 : Modification manuelle annule preset**
1. Appliquer preset "Glass"
2. Dropdown affiche "Glass"
3. Bouger un slider manuellement (ex: Eye Rings metalness)
4. **Attendu** : Dropdown passe à "Custom"

---

## 3️⃣ TESTS UNITAIRES (OPTIONNEL)

**Chemin** : `xstate-v5/tests/pbrMachine.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { pbrMachine } from '../actors/pbr/pbrMachine';
import * as THREE from 'three';

describe('pbrMachine', () => {
  it('devrait démarrer en état idle', () => {
    const actor = createActor(pbrMachine);
    actor.start();

    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('devrait mettre à jour metalness Eye Rings', () => {
    const actor = createActor(pbrMachine);
    actor.start();

    actor.send({ type: 'UPDATE_EYE_RINGS_METALNESS', metalness: 0.8 });

    expect(actor.getSnapshot().context.eyeRings.metalness).toBe(0.8);
    expect(actor.getSnapshot().context.currentPreset).toBe('custom');
  });

  it('devrait appliquer tone mapping', () => {
    const actor = createActor(pbrMachine);
    actor.start();

    const renderer = new THREE.WebGLRenderer();
    actor.send({ type: 'SET_RENDERER', renderer });
    actor.send({ type: 'SET_TONE_MAPPING', toneMapping: 'Cinematic' });

    expect(renderer.toneMapping).toBe(THREE.CinematicToneMapping);
  });

  it('devrait appliquer preset Chrome', () => {
    const actor = createActor(pbrMachine);
    actor.start();

    actor.send({ type: 'APPLY_PBR_PRESET', preset: 'chrome' });

    const ctx = actor.getSnapshot().context;
    expect(ctx.eyeRings.metalness).toBe(1.0);
    expect(ctx.iris.metalness).toBe(0.9);
    expect(ctx.currentPreset).toBe('chrome');
  });

  it('devrait collecter materials', () => {
    const actor = createActor(pbrMachine);
    actor.start();

    const scene = new THREE.Scene();
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(),
      new THREE.MeshStandardMaterial()
    );
    mesh.name = 'EYE_RING_TEST';
    scene.add(mesh);

    actor.send({ type: 'SET_SCENE', scene });
    actor.send({ type: 'COLLECT_MATERIALS' });

    expect(actor.getSnapshot().value).toBe('ready');
    expect(actor.getSnapshot().context.eyeRings.materials).toHaveLength(1);
  });

  it('devrait appliquer PBR aux matériaux', () => {
    const actor = createActor(pbrMachine);
    actor.start();

    const scene = new THREE.Scene();
    const mat = new THREE.MeshStandardMaterial();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), mat);
    mesh.name = 'IRIS_TEST';
    scene.add(mesh);

    actor.send({ type: 'SET_SCENE', scene });
    actor.send({ type: 'COLLECT_MATERIALS' });
    actor.send({ type: 'UPDATE_IRIS_METALNESS', metalness: 0.7 });

    expect(mat.metalness).toBe(0.7);
  });
});
```

**Exécuter** : `npm run test`

---

## 📋 CHECKLIST VALIDATION COMPLÈTE

### **Fonctionnel**
- [ ] Machine démarre en état `idle`
- [ ] Context initial correct (4 object types, toneMapping: ACESFilmic)
- [ ] Event `UPDATE_*_METALNESS` modifie context
- [ ] Event `UPDATE_*_ROUGHNESS` modifie context
- [ ] Event `UPDATE_*_ENVMAP` modifie context
- [ ] Event `SET_TONE_MAPPING` modifie renderer.toneMapping
- [ ] Event `APPLY_PBR_PRESET` applique toutes valeurs atomiquement
- [ ] Event `COLLECT_MATERIALS` collecte matériaux et passe en `ready`
- [ ] Actions appliquent PBR aux matériaux Three.js
- [ ] Modifications manuelles changent preset à 'custom'

### **Technique**
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur console navigateur
- [ ] Materials clonés (pas de shared references)
- [ ] Vérification type MeshStandardMaterial avant appliquer
- [ ] Presets importés correctement depuis `pbrPresets.ts`
- [ ] Tone mapping map importée depuis `toneMappingMap.ts`

### **Performance**
- [ ] Changements instantanés (pas de lag)
- [ ] Pas de re-renders inutiles
- [ ] Pas de memory leaks

---

## 🐛 BUGS POTENTIELS À SURVEILLER

### **Bug 1 : Materials null**
**Symptôme** : Erreur "Cannot forEach of null"
**Cause** : `COLLECT_MATERIALS` pas appelé avant UPDATE
**Solution** : Vérifier que materials exist avant forEach

### **Bug 2 : Preset materials = null**
**Symptôme** : Matériaux perdus après preset
**Cause** : Assign preset écrase materials avec null
**Solution** : Préserver materials reference dans assign preset

### **Bug 3 : Shared material references**
**Symptôme** : Changer un objet change tous les objets
**Cause** : Materials pas clonés
**Solution** : Utiliser `material.clone()` dans collectMaterials

### **Bug 4 : MeshBasicMaterial non supporté**
**Symptôme** : Erreur "property metalness doesn't exist"
**Cause** : Tentative d'appliquer PBR à MeshBasicMaterial
**Solution** : Vérifier `instanceof MeshStandardMaterial` avant appliquer

### **Bug 5 : EnvMap pas chargée**
**Symptôme** : envMapIntensity ne fait rien
**Cause** : Pas d'environment map dans la scène
**Solution** : S'assurer que `scene.environment` est défini

---

## ✅ CRITÈRES DE SUCCÈS

**Phase C validée SI** :
- ✅ Tous les tests console passent
- ✅ 0 erreurs TypeScript
- ✅ 0 erreurs console navigateur
- ✅ Materials PBR modifiés correctement
- ✅ Tone mapping appliqué au renderer
- ✅ Presets appliquent toutes valeurs atomiquement
- ✅ Materials clonés (pas de shared refs)

---

## ➡️ PROCHAINE ÉTAPE

**Si Phase C validée** → Passer à Phase D (PerformanceMonitor) ou Phase G (effectsMachine)

---

**FIN TESTS PHASE C**
