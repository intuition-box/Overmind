# ✅ PHASE A - TESTS : Validation bloomMachine

**Date** : 3 octobre 2025
**Objectif** : Tester que bloomMachine étendu (avec BloomColorPicker) fonctionne correctement

---

## 🎯 STRATÉGIE DE TESTS

### **1. Tests Console (rapide, sans UI)**
### **2. Tests Manuels UI (après Phase E - ControlPanel)**
### **3. Tests Unitaires (optionnel)**

---

## 1️⃣ TESTS CONSOLE (SANS UI)

### **Test 1 : Machine démarre correctement**

```typescript
// Dans console navigateur (DevTools)
import { createActor } from 'xstate';
import { bloomMachine } from './xstate-v5/actors/bloom/bloomMachine';

const actor = createActor(bloomMachine);
actor.start();

console.log('Initial state:', actor.getSnapshot().value);
// Attendu: "idle"

console.log('Initial context:', actor.getSnapshot().context);
// Attendu: { threshold: 0.15, strength: 0.40, radius: 0.4, enabled: true, bloomColor: '#00ff88' }
```

**✅ SUCCÈS SI** :
- State = `idle`
- Context contient `bloomColor` = '#00ff88'
- Pas d'erreurs TypeScript

---

### **Test 2 : UPDATE_THRESHOLD fonctionne**

```typescript
// Envoyer event
actor.send({ type: 'UPDATE_THRESHOLD', threshold: 0.25 });

console.log('New threshold:', actor.getSnapshot().context.threshold);
// Attendu: 0.25
```

**✅ SUCCÈS SI** :
- `context.threshold` = 0.25
- Pas d'erreurs console

---

### **Test 3 : SET_BLOOM_COLOR fonctionne**

```typescript
// Envoyer event
actor.send({ type: 'SET_BLOOM_COLOR', color: '#ff0000' });

console.log('New bloom color:', actor.getSnapshot().context.bloomColor);
// Attendu: '#ff0000'
```

**✅ SUCCÈS SI** :
- `context.bloomColor` = '#ff0000'
- Pas d'erreurs console

---

### **Test 4 : applyBloomColorToAllGroups envoie à materialMachine**

```typescript
// Mock console.log pour voir sendTo
const originalSendTo = console.log;
console.log = (...args) => {
  if (args[0]?.includes('sendTo')) {
    console.info('✅ sendTo détecté:', args);
  }
  originalSendTo(...args);
};

// Envoyer event
actor.send({ type: 'SET_BLOOM_COLOR', color: '#00ff00' });

// Restaurer console
console.log = originalSendTo;
```

**✅ SUCCÈS SI** :
- Action `applyBloomColorToAllGroups` exécutée
- `sendTo('material', { type: 'SET_ALL_GROUPS_COLOR', color: '#00ff00' })` appelé
- (Note : materialMachine n'existe pas encore, donc sendTo échouera silencieusement - normal)

---

### **Test 5 : TOGGLE_ENABLED fonctionne**

```typescript
// État initial
console.log('Enabled before:', actor.getSnapshot().context.enabled);
// Attendu: true

// Toggle
actor.send({ type: 'TOGGLE_ENABLED' });

console.log('Enabled after:', actor.getSnapshot().context.enabled);
// Attendu: false

// Toggle à nouveau
actor.send({ type: 'TOGGLE_ENABLED' });

console.log('Enabled after 2nd toggle:', actor.getSnapshot().context.enabled);
// Attendu: true
```

**✅ SUCCÈS SI** :
- Toggle change `enabled` de true → false → true
- Pas d'erreurs console

---

## 2️⃣ TESTS MANUELS UI (APRÈS PHASE E - ControlPanel)

### **Test UI 1 : BloomColorPicker intégré**

1. Ouvrir ControlPanel → Tab Bloom
2. Utiliser le color picker (HexColorPicker ou react-colorful)
3. Choisir une couleur (ex: rouge #ff0000)
4. **Attendu** :
   - `bloomColor` dans context = '#ff0000'
   - sendTo à materialMachine exécuté
   - Tous les groupes (iris/eyeRings/revealRings) changent de couleur (quand materialMachine existe)

### **Test UI 2 : Slider Threshold**

1. Ouvrir ControlPanel → Tab Bloom → Section "Global Bloom Settings"
2. Bouger slider "Threshold" de 0.15 à 0.50
3. **Attendu** :
   - `context.threshold` = 0.50
   - UnrealBloomPass.threshold = 0.50
   - Bloom threshold change visuellement dans Three.js

### **Test UI 3 : Slider Strength**

1. Ouvrir ControlPanel → Tab Bloom → Section "Global Bloom Settings"
2. Bouger slider "Strength" de 0.40 à 2.00
3. **Attendu** :
   - `context.strength` = 2.00
   - Bloom strength change visuellement (bloom plus fort)

### **Test UI 4 : Slider Radius**

1. Ouvrir ControlPanel → Tab Bloom → Section "Global Bloom Settings"
2. Bouger slider "Radius" de 0.4 à 0.8
3. **Attendu** :
   - `context.radius` = 0.8
   - Bloom radius change visuellement (bloom plus étendu)

### **Test UI 5 : Toggle Enable/Disable**

1. Ouvrir ControlPanel → Tab Bloom
2. Cliquer bouton "✅ Enabled"
3. **Attendu** :
   - Bouton devient "❌ Disabled"
   - Bloom disparaît complètement de la scène
4. Re-cliquer
5. **Attendu** :
   - Bouton redevient "✅ Enabled"
   - Bloom réapparaît

---

## 3️⃣ TESTS UNITAIRES (OPTIONNEL)

**Chemin** : `xstate-v5/tests/bloomMachine.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { bloomMachine } from '../actors/bloom/bloomMachine';

describe('bloomMachine', () => {
  it('devrait démarrer en état idle', () => {
    const actor = createActor(bloomMachine);
    actor.start();

    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('devrait avoir bloomColor par défaut', () => {
    const actor = createActor(bloomMachine);
    actor.start();

    expect(actor.getSnapshot().context.bloomColor).toBe('#00ff88');
  });

  it('devrait mettre à jour threshold', () => {
    const actor = createActor(bloomMachine);
    actor.start();

    actor.send({ type: 'UPDATE_THRESHOLD', threshold: 0.3 });

    expect(actor.getSnapshot().context.threshold).toBe(0.3);
  });

  it('devrait mettre à jour bloomColor', () => {
    const actor = createActor(bloomMachine);
    actor.start();

    actor.send({ type: 'SET_BLOOM_COLOR', color: '#ff0000' });

    expect(actor.getSnapshot().context.bloomColor).toBe('#ff0000');
  });

  it('devrait toggle enabled', () => {
    const actor = createActor(bloomMachine);
    actor.start();

    const initialEnabled = actor.getSnapshot().context.enabled;

    actor.send({ type: 'TOGGLE_ENABLED' });

    expect(actor.getSnapshot().context.enabled).toBe(!initialEnabled);
  });
});
```

**Exécuter** : `npm run test`

---

## 📋 CHECKLIST VALIDATION COMPLÈTE

### **Fonctionnel**
- [ ] Machine démarre en état `idle`
- [ ] Context initial correct (threshold: 0.15, strength: 0.40, bloomColor: '#00ff88')
- [ ] Event `UPDATE_THRESHOLD` modifie context.threshold
- [ ] Event `UPDATE_STRENGTH` modifie context.strength
- [ ] Event `UPDATE_RADIUS` modifie context.radius
- [ ] Event `TOGGLE_ENABLED` toggle context.enabled
- [ ] Event `SET_BLOOM_COLOR` modifie context.bloomColor
- [ ] Action `applyBloomColorToAllGroups` envoie à materialMachine via sendTo

### **Technique**
- [ ] Aucune erreur TypeScript (`npm run type-check`)
- [ ] Aucune erreur console navigateur
- [ ] Action `updateBloomPass` applique correctement sur UnrealBloomPass
- [ ] Pas de mutation directe du context (utilisation de `assign`)
- [ ] `enqueueActions` et `sendTo` utilisés correctement

### **Performance**
- [ ] Changements instantanés (pas de lag)
- [ ] Pas de re-renders inutiles (vérifier avec React DevTools après Phase E)
- [ ] Pas de memory leaks (vérifier avec Chrome Memory Profiler)

---

## 🐛 BUGS POTENTIELS À SURVEILLER

### **Bug 1 : sendTo échoue silencieusement**
**Symptôme** : Pas d'erreur mais materialMachine ne reçoit rien
**Cause** : materialMachine n'existe pas encore (normal en Phase A)
**Solution** : Attendre Phase C (pbrMachine/materialMachine) pour tester communication complète

### **Bug 2 : BloomColorPicker lag**
**Symptôme** : Changement de couleur lag ou freeze l'UI
**Cause** : Trop d'events envoyés (chaque pixel du color picker)
**Solution** : Debounce ou utiliser `onChangeComplete` dans le color picker

### **Bug 3 : Context bloomColor pas immutable**
**Symptôme** : Erreurs XState "context mutation"
**Cause** : Spread operator `...` oublié dans `assign`
**Solution** : Toujours utiliser `assign({ bloomColor: ({ event }) => event.color })`

---

## ✅ CRITÈRES DE SUCCÈS

**Phase A validée SI** :
- ✅ Tous les tests console passent
- ✅ 0 erreurs TypeScript
- ✅ 0 erreurs console navigateur
- ✅ bloomColor stocké correctement
- ✅ sendTo à materialMachine exécuté (même si destination n'existe pas encore)
- ✅ Global bloom params (threshold/strength/radius) fonctionnent

---

## ➡️ PROCHAINE ÉTAPE

**Si Phase A validée** → Passer à [Phase_B_LightingMachine](../Phase_B_LightingMachine/B01_ANALYSE_ACTUEL.md)

---

**FIN TESTS PHASE A**
