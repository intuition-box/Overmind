# 🔍 PHASE H - ANALYSE ACTUEL : sceneMachine

**Date** : 3 octobre 2025
**Objectif** : Analyser l'état actuel des contrôles scène (Background/Grid/Axes)

---

## 📊 ÉTAT ACTUEL

### **Fichier existant : sceneMachine.ts ?**

**Statut** : ❌ **PAS DE MACHINE SCENE EXISTANTE**

Actuellement, il n'existe PAS de `sceneMachine.ts` dans le système XState v5.

---

## 🔍 CE QUE V6 ZUSTAND AVAIT

D'après la recherche GPT approfondie et la décision utilisateur, V6 avait **3 contrôles scène** :

---

## 1️⃣ BACKGROUND COLOR

### **Description**
Couleur de fond de la scène (scene.background)

### **Paramètres V6**
```typescript
{
  backgroundColor: string;  // Hex color (ex: '#000000')
}
```

### **Valeur par défaut V6**
```typescript
{
  backgroundColor: '#0a0a0a'  // Noir quasi pur
}
```

### **Implémentation**
```typescript
scene.background = new THREE.Color(backgroundColor);
```

---

## 2️⃣ GRID HELPER

### **Description**
Grille au sol pour repérage spatial (Three.js GridHelper)

### **Paramètres V6**
```typescript
{
  gridEnabled: boolean;
  gridSize: number;       // 10 - 100 (taille totale)
  gridDivisions: number;  // 10 - 100 (nombre de divisions)
  gridColor1: string;     // Couleur lignes centrales
  gridColor2: string;     // Couleur lignes secondaires
}
```

### **Valeurs par défaut V6**
```typescript
{
  gridEnabled: false,      // Désactivé par défaut
  gridSize: 20,
  gridDivisions: 20,
  gridColor1: '#444444',   // Gris foncé
  gridColor2: '#222222'    // Gris très foncé
}
```

### **Implémentation**
```typescript
const gridHelper = new THREE.GridHelper(
  gridSize,
  gridDivisions,
  new THREE.Color(gridColor1),
  new THREE.Color(gridColor2)
);

if (gridEnabled) {
  scene.add(gridHelper);
} else {
  scene.remove(gridHelper);
}
```

---

## 3️⃣ AXES HELPER

### **Description**
Axes X/Y/Z pour orientation (Three.js AxesHelper)

### **Paramètres V6**
```typescript
{
  axesEnabled: boolean;
  axesSize: number;  // 1 - 10 (longueur des axes)
}
```

### **Valeurs par défaut V6**
```typescript
{
  axesEnabled: false,  // Désactivé par défaut
  axesSize: 5
}
```

### **Implémentation**
```typescript
const axesHelper = new THREE.AxesHelper(axesSize);

if (axesEnabled) {
  scene.add(axesHelper);
} else {
  scene.remove(axesHelper);
}
```

**Couleurs fixes** :
- X axis = Rouge
- Y axis = Vert
- Z axis = Bleu

---

## ⚠️ CONTRAINTES TECHNIQUES

### **1. Helpers doivent être stockés**

```typescript
// ❌ MAUVAIS : Recréer à chaque fois
const gridHelper = new THREE.GridHelper(20, 20);
scene.add(gridHelper);

// ✅ BON : Stocker la référence
const gridHelper = new THREE.GridHelper(20, 20);
context.gridHelper = gridHelper;
scene.add(gridHelper);

// Plus tard : toggle
if (enabled) {
  scene.add(context.gridHelper);
} else {
  scene.remove(context.gridHelper);
}
```

---

### **2. Update helpers nécessite recréation**

```typescript
// Impossible de modifier gridSize directement
gridHelper.size = 30;  // ❌ Pas de propriété

// ✅ Solution : Recréer
scene.remove(oldGridHelper);
oldGridHelper.dispose();

const newGridHelper = new THREE.GridHelper(30, 20);
scene.add(newGridHelper);
```

---

### **3. Dispose helpers pour éviter memory leak**

```typescript
// ⚠️ IMPORTANT : Dispose avant de recréer
if (context.gridHelper) {
  scene.remove(context.gridHelper);
  context.gridHelper.geometry.dispose();
  context.gridHelper.material.dispose();
}
```

---

## 🎨 UI ATTENDUE (ControlPanel Tab Scene)

```
┌─────────────────────────────────────────┐
│ 🌍 Scene Controls                       │
├─────────────────────────────────────────┤
│                                         │
│ 🎨 Background Color                    │
│ [Color Picker] #0a0a0a                 │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ 📐 Grid Helper                         │
│ [  ] Enabled                            │
│ Size:       [==========] 20            │
│ Divisions:  [==========] 20            │
│ Color 1:    [Color Picker] #444444     │
│ Color 2:    [Color Picker] #222222     │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ 📍 Axes Helper                         │
│ [  ] Enabled                            │
│ Size:       [=====□────] 5             │
│                                         │
│ Preview:                                │
│ 🔴 X (Red) | 🟢 Y (Green) | 🔵 Z (Blue) │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📋 VALEURS PAR DÉFAUT

```typescript
context: {
  scene: null,

  // Background
  backgroundColor: '#0a0a0a',

  // Grid Helper
  gridEnabled: false,
  gridSize: 20,
  gridDivisions: 20,
  gridColor1: '#444444',
  gridColor2: '#222222',
  gridHelper: null,

  // Axes Helper
  axesEnabled: false,
  axesSize: 5,
  axesHelper: null
}
```

---

## 🔧 ACTIONS NÉCESSAIRES

### **Action : updateBackground**
```typescript
actions: {
  updateBackground: ({ context }) => {
    if (context.scene) {
      context.scene.background = new THREE.Color(context.backgroundColor);
      console.log(`[updateBackground] Set to ${context.backgroundColor}`);
    }
  }
}
```

---

### **Action : toggleGrid**
```typescript
actions: {
  toggleGrid: ({ context }) => {
    if (!context.scene) return;

    if (context.gridEnabled) {
      // Create and add
      if (!context.gridHelper) {
        const grid = new THREE.GridHelper(
          context.gridSize,
          context.gridDivisions,
          new THREE.Color(context.gridColor1),
          new THREE.Color(context.gridColor2)
        );
        context.gridHelper = grid;
      }
      context.scene.add(context.gridHelper);
    } else {
      // Remove
      if (context.gridHelper) {
        context.scene.remove(context.gridHelper);
      }
    }
  }
}
```

---

### **Action : recreateGrid**
```typescript
actions: {
  recreateGrid: ({ context }) => {
    if (!context.scene || !context.gridEnabled) return;

    // Remove old
    if (context.gridHelper) {
      context.scene.remove(context.gridHelper);
      context.gridHelper.geometry.dispose();
      context.gridHelper.material.dispose();
    }

    // Create new
    const grid = new THREE.GridHelper(
      context.gridSize,
      context.gridDivisions,
      new THREE.Color(context.gridColor1),
      new THREE.Color(context.gridColor2)
    );
    context.gridHelper = grid;
    context.scene.add(grid);
  }
}
```

---

### **Action : toggleAxes**
```typescript
actions: {
  toggleAxes: ({ context }) => {
    if (!context.scene) return;

    if (context.axesEnabled) {
      if (!context.axesHelper) {
        const axes = new THREE.AxesHelper(context.axesSize);
        context.axesHelper = axes;
      }
      context.scene.add(context.axesHelper);
    } else {
      if (context.axesHelper) {
        context.scene.remove(context.axesHelper);
      }
    }
  }
}
```

---

### **Action : recreateAxes**
```typescript
actions: {
  recreateAxes: ({ context }) => {
    if (!context.scene || !context.axesEnabled) return;

    // Remove old
    if (context.axesHelper) {
      context.scene.remove(context.axesHelper);
      context.axesHelper.geometry.dispose();
      context.axesHelper.material.dispose();
    }

    // Create new
    const axes = new THREE.AxesHelper(context.axesSize);
    context.axesHelper = axes;
    context.scene.add(axes);
  }
}
```

---

## ✅ RÉCAPITULATIF

### **Ce qui existe**
❌ Rien (pas de sceneMachine)

### **Ce qu'il faut créer**
1. ✅ `sceneMachine.ts` avec context complet
2. ✅ Actions pour background color
3. ✅ Actions pour grid helper (toggle + recreate)
4. ✅ Actions pour axes helper (toggle + recreate)
5. ✅ Hook `useScene.ts`
6. ✅ Gestion dispose pour éviter memory leaks

---

## ➡️ PROCHAINE ÉTAPE

**Voir [H02_SPECIFICATIONS.md](H02_SPECIFICATIONS.md)** pour l'architecture complète.

---

**FIN ANALYSE PHASE H**
