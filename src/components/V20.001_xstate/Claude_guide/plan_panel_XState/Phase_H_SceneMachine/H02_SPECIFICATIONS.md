# 📋 PHASE H - SPÉCIFICATIONS : sceneMachine

**Date** : 3 octobre 2025
**Objectif** : Définir EXACTEMENT l'architecture de sceneMachine

---

## 🎯 ARCHITECTURE

### **sceneMachine : Machine pour contrôles scène**

```typescript
interface SceneContext {
  scene: THREE.Scene | null;

  // Background
  backgroundColor: string;

  // Grid Helper
  gridEnabled: boolean;
  gridSize: number;
  gridDivisions: number;
  gridColor1: string;
  gridColor2: string;
  gridHelper: THREE.GridHelper | null;

  // Axes Helper
  axesEnabled: boolean;
  axesSize: number;
  axesHelper: THREE.AxesHelper | null;
}
```

---

## 🔧 CONTEXTE COMPLET

```typescript
export interface SceneContext {
  scene: THREE.Scene | null;

  // Background Color
  backgroundColor: string;

  // Grid Helper
  gridEnabled: boolean;
  gridSize: number;
  gridDivisions: number;
  gridColor1: string;
  gridColor2: string;
  gridHelper: THREE.GridHelper | null;

  // Axes Helper
  axesEnabled: boolean;
  axesSize: number;
  axesHelper: THREE.AxesHelper | null;
}
```

---

## 🔧 VALEURS PAR DÉFAUT

```typescript
context: {
  scene: null,

  // Background (V6 default)
  backgroundColor: '#0a0a0a',

  // Grid Helper (disabled by default)
  gridEnabled: false,
  gridSize: 20,
  gridDivisions: 20,
  gridColor1: '#444444',
  gridColor2: '#222222',
  gridHelper: null,

  // Axes Helper (disabled by default)
  axesEnabled: false,
  axesSize: 5,
  axesHelper: null
}
```

---

## 🔧 ÉVÉNEMENTS

```typescript
export type SceneEvents =
  // Initialisation
  | { type: 'SET_SCENE'; scene: THREE.Scene }

  // Background
  | { type: 'SET_BACKGROUND_COLOR'; color: string }

  // Grid Helper
  | { type: 'TOGGLE_GRID' }
  | { type: 'ENABLE_GRID' }
  | { type: 'DISABLE_GRID' }
  | { type: 'UPDATE_GRID_SIZE'; size: number }
  | { type: 'UPDATE_GRID_DIVISIONS'; divisions: number }
  | { type: 'UPDATE_GRID_COLOR1'; color: string }
  | { type: 'UPDATE_GRID_COLOR2'; color: string }

  // Axes Helper
  | { type: 'TOGGLE_AXES' }
  | { type: 'ENABLE_AXES' }
  | { type: 'DISABLE_AXES' }
  | { type: 'UPDATE_AXES_SIZE'; size: number };
```

---

## 🎬 ACTIONS

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
      // Create if doesn't exist
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
      console.log(`[toggleGrid] ENABLED (size: ${context.gridSize}, divisions: ${context.gridDivisions})`);
    } else {
      // Remove
      if (context.gridHelper) {
        context.scene.remove(context.gridHelper);
        console.log(`[toggleGrid] DISABLED`);
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

    // Remove and dispose old
    if (context.gridHelper) {
      context.scene.remove(context.gridHelper);
      context.gridHelper.geometry.dispose();
      if (Array.isArray(context.gridHelper.material)) {
        context.gridHelper.material.forEach(m => m.dispose());
      } else {
        context.gridHelper.material.dispose();
      }
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

    console.log(`[recreateGrid] Recreated with size ${context.gridSize}, divisions ${context.gridDivisions}`);
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
      // Create if doesn't exist
      if (!context.axesHelper) {
        const axes = new THREE.AxesHelper(context.axesSize);
        context.axesHelper = axes;
      }
      context.scene.add(context.axesHelper);
      console.log(`[toggleAxes] ENABLED (size: ${context.axesSize})`);
    } else {
      // Remove
      if (context.axesHelper) {
        context.scene.remove(context.axesHelper);
        console.log(`[toggleAxes] DISABLED`);
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

    // Remove and dispose old
    if (context.axesHelper) {
      context.scene.remove(context.axesHelper);
      context.axesHelper.geometry.dispose();
      if (Array.isArray(context.axesHelper.material)) {
        context.axesHelper.material.forEach(m => m.dispose());
      } else {
        context.axesHelper.material.dispose();
      }
    }

    // Create new
    const axes = new THREE.AxesHelper(context.axesSize);
    context.axesHelper = axes;
    context.scene.add(axes);

    console.log(`[recreateAxes] Recreated with size ${context.axesSize}`);
  }
}
```

---

## 🔄 FLUX D'UTILISATION

### **Cas 1 : Utilisateur change background color**

```
┌──────────────────┐
│ UI: Color Picker │ → Utilisateur choisit #ff0000
└────────┬─────────┘
         │
         ↓ Event: SET_BACKGROUND_COLOR({ color: '#ff0000' })
┌────────┴─────────┐
│  sceneMachine    │
│   ready state    │
└────────┬─────────┘
         │
         ↓ Action: assign({ backgroundColor: '#ff0000' })
         ↓ Action: updateBackground
┌────────┴─────────┐
│ context.scene    │ → scene.background = new THREE.Color('#ff0000')
└──────────────────┘
         │
         ↓
┌──────────────────┐
│   Three.js       │ → Fond devient rouge
└──────────────────┘
```

---

### **Cas 2 : Utilisateur active Grid**

```
┌──────────────────┐
│ UI: Toggle       │ → Utilisateur coche "Grid Enabled"
│ [✅ Enabled]     │
└────────┬─────────┘
         │
         ↓ Event: ENABLE_GRID
┌────────┴─────────┐
│  sceneMachine    │
│   ready state    │
└────────┬─────────┘
         │
         ↓ Action: assign({ gridEnabled: true })
         ↓ Action: toggleGrid
┌────────┴─────────┐
│ Create Grid      │ → gridHelper = new GridHelper(20, 20, ...)
│ Add to scene     │ → scene.add(gridHelper)
└──────────────────┘
         │
         ↓
┌──────────────────┐
│   Three.js       │ → Grille visible au sol
└──────────────────┘
```

---

### **Cas 3 : Utilisateur change Grid Size**

```
┌──────────────────┐
│ UI: Slider       │ → Utilisateur met size à 50
│ Size: 50         │
└────────┬─────────┘
         │
         ↓ Event: UPDATE_GRID_SIZE({ size: 50 })
┌────────┴─────────┐
│  sceneMachine    │
│   ready state    │
└────────┬─────────┘
         │
         ↓ Action: assign({ gridSize: 50 })
         ↓ Action: recreateGrid (if enabled)
┌────────┴─────────┐
│ Dispose old grid │ → geometry.dispose(), material.dispose()
│ Create new grid  │ → new GridHelper(50, ...)
│ Add to scene     │ → scene.add(newGrid)
└──────────────────┘
         │
         ↓
┌──────────────────┐
│   Three.js       │ → Grille plus grande
└──────────────────┘
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
│ Color 1:    [████] #444444             │
│ Color 2:    [████] #222222             │
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

## ✅ CRITÈRES DE VALIDATION

### **Fonctionnel**
- ✅ Background color change scene.background
- ✅ Grid toggle visible/invisible
- ✅ Grid size/divisions update en temps réel
- ✅ Grid colors changent en temps réel
- ✅ Axes toggle visible/invisible
- ✅ Axes size update en temps réel

### **Technique**
- ✅ Helpers disposés correctement (no memory leaks)
- ✅ Pas de mutation directe du context
- ✅ Events typés correctement
- ✅ Console.log présents pour debug

### **Performance**
- ✅ Recreate helpers instantané (< 1ms)
- ✅ Pas de lag lors du toggle
- ✅ Dispose libère mémoire correctement

---

## ➡️ PROCHAINE ÉTAPE

**Voir [H03_CODE_EXTENSION.md](H03_CODE_EXTENSION.md)** pour le code complet.

---

**FIN SPÉCIFICATIONS PHASE H**
