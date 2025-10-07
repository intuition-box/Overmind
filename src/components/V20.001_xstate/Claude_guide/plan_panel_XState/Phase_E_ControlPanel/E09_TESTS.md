# ✅ PHASE E - TESTS : Validation ControlPanel

**Date** : 3 octobre 2025
**Objectif** : Tests d'intégration du ControlPanel complet

---

## 🎯 STRATÉGIE DE TESTS

### **1. Tests Manuels UI (principaux)**
### **2. Tests Console (validation machines)**
### **3. Tests Unitaires (optionnel)**

---

## 1️⃣ TESTS MANUELS UI

### **Test 1 : ControlPanel ouvre/ferme**
1. Charger l'application
2. **Attendu** : ControlPanel visible en haut à droite
3. Cliquer sur "×"
4. **Attendu** : Panel se ferme, bouton "⚙️ Controls" apparaît
5. Cliquer sur "⚙️ Controls"
6. **Attendu** : Panel se réouvre

---

### **Test 2 : Navigation entre tabs**
1. Ouvrir ControlPanel
2. Cliquer sur chaque onglet (Bloom → Effects → Lighting → Camera → PBR → Scene)
3. **Attendu** :
   - Contenu change pour chaque tab
   - Tab actif visuellement highlighted (couleur cyan)
   - Pas d'erreurs console

---

### **Test 3 : Tab Bloom - Tous les contrôles fonctionnent**
1. Tab Bloom
2. Toggle "Enabled" ON
3. **Attendu** : Bloom visible dans la scène
4. Slider "Threshold" → 0.5
5. **Attendu** : Moins d'objets blooment
6. Slider "Strength" → 2.0
7. **Attendu** : Bloom plus intense
8. Color Picker → Choisir rouge (#ff0000)
9. **Attendu** : Bloom devient rouge

---

### **Test 4 : Tab Effects - Visual Presets**
1. Tab Effects
2. Dropdown "Visual Presets" → "Intense"
3. **Attendu** :
   - Glow activé automatiquement
   - Ultra Bloom activé
   - Scène très lumineuse
4. Changer à "Subtle"
5. **Attendu** : Effets doux

---

### **Test 5 : Tab Lighting - HDR Boost**
1. Tab Lighting
2. Toggle "HDR Boost" ON
3. **Attendu** : Scène beaucoup plus lumineuse
4. Slider "Multiplier" → 4.0
5. **Attendu** : Scène très lumineuse
6. Dropdown "Light Position" → "Plongée"
7. **Attendu** : Lumière vient du haut

---

### **Test 6 : Tab PBR - Presets**
1. Tab PBR
2. Dropdown "PBR Presets" → "Chrome"
3. **Attendu** : Tous les objets deviennent métalliques
4. Changer à "Matte"
5. **Attendu** : Tous les objets deviennent mats
6. Modifier manuellement "Eye Rings Metalness" → 0.2
7. **Attendu** : Dropdown passe à "Custom"

---

### **Test 7 : Tab Scene - Grid & Axes**
1. Tab Scene
2. Toggle "Grid Enabled" ON
3. **Attendu** : Grille 20×20 apparaît
4. Slider "Grid Size" → 50
5. **Attendu** : Grille devient plus grande
6. Toggle "Axes Enabled" ON
7. **Attendu** : Axes RGB apparaissent

---

### **Test 8 : Responsive - Scroll**
1. Ouvrir ControlPanel
2. Scroller dans le contenu
3. **Attendu** : Scrollbar visible, scroll fluide
4. Tabs restent fixes en haut

---

## 2️⃣ TESTS CONSOLE

### **Test Console 1 : Machines initialisées**
```javascript
// Vérifier que toutes les machines sont spawn
console.log('Machines:', {
  bloom: window.__xstate_bloom,
  lighting: window.__xstate_lighting,
  pbr: window.__xstate_pbr,
  effects: window.__xstate_effects,
  scene: window.__xstate_scene,
  performance: window.__xstate_performance
});
// Attendu: Toutes les machines existent
```

---

### **Test Console 2 : Communication entre machines**
```javascript
// Tester sendTo entre effectsMachine et bloomMachine
// Activer Ultra Bloom
effectsActor.send({ type: 'ENABLE_ULTRA_BLOOM' });

// Vérifier que bloomMachine a reçu les overrides
console.log('Bloom threshold:', bloomActor.getSnapshot().context.threshold);
// Attendu: threshold = 0.1 (ultra bloom override)
```

---

### **Test Console 3 : Pas de memory leaks**
```javascript
// Avant
const memBefore = performance.memory.usedJSHeapSize;

// Ouvrir/fermer panel 100 fois
for (let i = 0; i < 100; i++) {
  setPanelOpen(false);
  setPanelOpen(true);
}

// Après
const memAfter = performance.memory.usedJSHeapSize;
const delta = memAfter - memBefore;

console.log('Memory delta:', delta / 1024 / 1024, 'MB');
// Attendu: < 5 MB (pas de leak significatif)
```

---

## 3️⃣ TESTS UNITAIRES (OPTIONNEL)

**Chemin** : `ControlPanel/__tests__/ControlPanel.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ControlPanel } from '../ControlPanel';

describe('ControlPanel', () => {
  it('devrait render avec tab Bloom par défaut', () => {
    render(<ControlPanel />);

    expect(screen.getByText('✨ Global Bloom Settings')).toBeInTheDocument();
  });

  it('devrait changer de tab au clic', () => {
    render(<ControlPanel />);

    const effectsTab = screen.getByText('Effects');
    fireEvent.click(effectsTab);

    expect(screen.getByText('🌟 Visual Presets')).toBeInTheDocument();
  });

  it('devrait fermer le panel', () => {
    render(<ControlPanel />);

    const closeBtn = screen.getByText('×');
    fireEvent.click(closeBtn);

    expect(screen.getByText('⚙️ Controls')).toBeInTheDocument();
  });

  it('devrait réouvrir le panel', () => {
    render(<ControlPanel />);

    const closeBtn = screen.getByText('×');
    fireEvent.click(closeBtn);

    const openBtn = screen.getByText('⚙️ Controls');
    fireEvent.click(openBtn);

    expect(screen.getByText('Control Panel')).toBeInTheDocument();
  });
});
```

---

## 📋 CHECKLIST VALIDATION COMPLÈTE

### **Fonctionnel**
- [ ] ControlPanel ouvre/ferme correctement
- [ ] 6 tabs affichent le bon contenu
- [ ] Tab Bloom : tous les contrôles fonctionnent
- [ ] Tab Effects : presets + glow + ultra bloom + trail fonctionnent
- [ ] Tab Lighting : exposure + HDR + presets fonctionnent
- [ ] Tab Camera : tous les contrôles fonctionnent (si implémenté)
- [ ] Tab PBR : tone mapping + presets + 4 object types fonctionnent
- [ ] Tab Scene : background + grid + axes fonctionnent

### **Technique**
- [ ] Aucune erreur TypeScript
- [ ] Aucune erreur console navigateur
- [ ] Toutes les machines spawn correctement
- [ ] Communication sendTo fonctionne (effects ↔ bloom, etc.)
- [ ] Hooks retournent les bonnes valeurs
- [ ] Re-renders optimisés (pas de lag)

### **UI/UX**
- [ ] Scroll fluide dans le panel
- [ ] Tabs navigation responsive
- [ ] Sliders responsive et précis
- [ ] Color pickers s'ouvrent/ferment correctement
- [ ] Dropdowns affichent les bonnes options
- [ ] Toggles changent visuellement
- [ ] Design cohérent avec les maquettes

### **Performance**
- [ ] Pas de memory leaks (open/close multiple fois)
- [ ] FPS stable (> 55) pendant utilisation du panel
- [ ] Changements de valeurs instantanés (< 16ms)
- [ ] Panel draggable fluide (si implémenté)

---

## 🐛 BUGS POTENTIELS

### **Bug 1 : Tab content ne change pas**
**Cause** : activeTab state pas mis à jour
**Solution** : Vérifier onTabChange callback

### **Bug 2 : Sliders ne mettent pas à jour**
**Cause** : Hook pas connecté ou onChange incorrect
**Solution** : Vérifier que hook send events correctement

### **Bug 3 : Panel trop large sur mobile**
**Cause** : Width fixe 400px
**Solution** : Ajouter media queries responsive

### **Bug 4 : Color picker reste ouvert**
**Cause** : Backdrop click pas géré
**Solution** : Vérifier backdrop onClick={() => setIsOpen(false)}

### **Bug 5 : Performance degradation**
**Cause** : Re-renders inutiles
**Solution** : Utiliser useSelector avec sélecteurs précis

---

## ✅ CRITÈRES DE SUCCÈS

**Phase E validée SI** :
- ✅ Tous les tests manuels UI passent
- ✅ 0 erreurs TypeScript
- ✅ 0 erreurs console
- ✅ 6 tabs fonctionnent correctement
- ✅ Toutes les machines communiquent
- ✅ Performance stable (FPS > 55)
- ✅ Pas de memory leaks

---

## 🎉 FÉLICITATIONS !

**Si tous les tests passent**, le ControlPanel XState v5 est **COMPLET** et **FONCTIONNEL** ! 🚀

---

**FIN TESTS PHASE E**
