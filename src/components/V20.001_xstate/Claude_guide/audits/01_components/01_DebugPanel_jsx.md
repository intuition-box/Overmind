# 📋 RAPPORT AUDIT : DebugPanel.jsx

**Date** : 25/11/2024 - SESSION 1
**Fichier** : `components/DebugPanel.jsx`
**Taille** : 2883 lignes ⚠️ TRÈS GROS FICHIER
**Type** : UI Debug Panel Principal (V6 + Hybride)

---

## 📦 IMPORTS ET DÉPENDANCES

### **Imports externes**
```javascript
- React, { useState, useEffect, useRef }
```

### **Imports internes**
```javascript
- MSAAControlsPanel from './MSAAControlsPanel.jsx'
- PerformanceMonitor from './PerformanceMonitor.jsx'
- usePerformanceMonitor from '../hooks/usePerformanceMonitor.js'
- PRESET_REGISTRY, applyPreset from '../utils/presets.js'
- V3_CONFIG from '../utils/config.js'
```

---

## 🎛️ FEATURES IDENTIFIÉES

### **1. BLOOM CONTROLS**
#### **Global Bloom Settings**
- **Threshold** : slider 0-1, default 0.15
- **Strength** : slider 0-3, default 0.40
- **Radius** : slider 0-1, default 0.4

#### **Color Bloom Groups** (3 groupes)
- **iris** : emissiveIntensity 0-10
- **eyeRings** : emissiveIntensity 0-10
- **revealRings** : emissiveIntensity 0-10

#### **Composant ColorBloomControls**
- Strength par groupe (0-3)
- Radius par groupe (0-1)
- EmissiveIntensity par groupe (0-10)

### **2. EXPOSURE**
- **Range** : 0-5
- **Default** : 1.7
- **Handler** : `handleExposureChange()`

### **3. PBR SETTINGS**
États identifiés :
```javascript
pbrSettings: {
  roughness: 0.5,
  metalness: 0,
  clearcoat: 0,
  clearcoatRoughness: 0,
  reflectivity: 0.5,
  envMapIntensity: 1.0,
  ambientIntensity: 1.0,
  directionalIntensity: 1.0
}
```

### **4. MATERIAL SETTINGS**
```javascript
materialSettings: {
  flatShading: false,
  wireframe: false
}
```

### **5. HDR BOOST SETTINGS**
```javascript
hdrBoostSettings: {
  exposure: 1.0,
  contrast: 1.0
}
```

### **6. LIGHT POSITION**
#### **Presets disponibles**
- studio-classic (x:1, y:2, z:3)
- top-down (x:0, y:5, z:0)
- side-dramatic (x:5, y:1, z:1)
- front-soft (x:0, y:1, z:5)
- back-rim (x:-2, y:3, z:-2)
- low-moody (x:2, y:0.5, z:2)

#### **Custom Position**
- X, Y, Z : sliders -10 à 10
- Mode avancé toggle

### **7. BACKGROUND SETTINGS**
```javascript
backgroundSettings: {
  type: 'color', // 'color' | 'environment'
  color: '#000033',
  intensity: 0.5
}
```

### **8. SECURITY PRESETS**
- SAFE (vert #00ff88)
- DANGER (rouge #ff4444)
- WARNING (orange #ffaa00)
- SCANNING (bleu #4488ff)
- NORMAL (blanc #ffffff)

### **9. MSAA CONTROLS**
- Intégré via `MSAAControlsPanel`
- `handleMSAASettingsChange()`

### **10. PERFORMANCE MONITOR**
- FPS counter permanent
- Frame time
- GPU memory
- Samples MSAA

### **11. TABS SYSTÈME**
Tabs identifiés :
- 'groups' (Bloom par groupes)
- 'pbr' (PBR settings)
- 'background' (Background controls)
- 'msaa' (MSAA settings)
- 'security' (Security presets)
- 'particles' (Particules)
- 'space' (Floating space)

### **12. ANIMATIONS/TRANSITIONS**
- Force show rings (checkbox)
- Trigger transition button
- Animation state : 'permanent' | autres

### **13. PRESETS SYSTEM**
- Capture current preset
- Apply preset dropdown
- Intégration avec PRESET_REGISTRY

---

## 🔗 PROPS REÇUES

```javascript
{
  showDebug,                    // Visibilité panel
  forceShowRings,              // Force affichage anneaux
  onToggleForceRings,          // Toggle handler
  currentAnimation,            // État animation
  onTriggerTransition,         // Handler transition
  securityState,               // État sécurité
  onSecurityStateChange,       // Handler sécurité
  isTransitioning,             // Flag transition
  onColorBloomChange,          // Handler bloom (legacy)
  setExposure,                 // Setter exposure (V8)
  mouseControlMode,            // Mode souris ('navigation')
  pbrLightingController,       // Controller PBR (V8)
  setBackground,               // Setter background
  getBackground,               // Getter background
  bloomSystem,                 // BloomSystem (V12.2)
  renderer,                    // Renderer Three.js (V12.2)
  particleSystemController,    // Controller particules (V18)
  floatingSpace,               // Système flottant (V19.3)
  stateController             // CCS Central (prioritaire)
}
```

---

## 🎨 HANDLERS PRINCIPAUX

| Handler | Fonction | Paramètres |
|---------|----------|------------|
| `handleSliderChange` | Change valeur bloom groupe | (param, value) |
| `handleExposureChange` | Change exposure globale | (value) |
| `handleGlobalBloomChange` | Change bloom global | (param, value) |
| `handleGlobalThresholdChange` | Change threshold global | (value) |
| `handleBackgroundChange` | Change background | (type, value) |
| `handleMSAASettingsChange` | Change MSAA | (param, value) |
| `handlePbrPresetChange` | Apply preset PBR | (presetName) |
| `handleMaterialProperty` | Change material prop | (property, value) |
| `handlePbrMultipliers` | Change PBR multipliers | (ambient, directional) |
| `handleLightPositionPreset` | Apply light preset | (presetKey) |
| `handleCustomPositionChange` | Change light position | (axis, value) |
| `handleApplyPreset` | Apply global preset | (presetKey) |

---

## 🔄 SYNCHRONISATION

### **CCS (Contrôleur Central de Synchronisation)**
- **Priorité 1** : `stateController` si présent
- **Fallback** : Ancien système via props callbacks
- **Sync automatique** : useEffect pour sync UI depuis stateController

### **Flow de données**
```
UI Slider → Handler → stateController (priorité) → Three.js
                   ↘ Fallback props → Three.js
```

---

## ⚠️ PROBLÈMES IDENTIFIÉS

### **1. FICHIER MONOLITHIQUE**
- 2883 lignes = maintenance difficile
- Mélange UI + Logic + State

### **2. HYBRIDATION COMPLEXE**
- Mix V6 legacy + V8 + V12.2 + V18 + V19.3
- Système de fallback multiple

### **3. PROPS OVERLOAD**
- 16+ props reçues
- Certaines unused (commentées)

### **4. STATE LOCAL MASSIF**
- 12+ useState locaux
- Synchronisation complexe avec stateController

---

## 🎯 FEATURES CRITIQUES POUR XSTATE

### **Must-have**
1. Bloom controls (global + groups)
2. Exposure
3. PBR settings
4. Light position
5. Background
6. Security states

### **Nice-to-have**
7. MSAA controls
8. Performance monitor
9. Particles
10. Floating space

### **À simplifier**
- Presets système
- Tabs navigation
- Animations/transitions

---

## 📊 MÉTRIQUES

- **Complexité** : 🔴 TRÈS ÉLEVÉE
- **Couplage** : Fort avec systems/ et hooks/
- **Testabilité** : Faible (monolithe)
- **Maintenabilité** : Difficile

---

## 🚀 RECOMMANDATIONS POUR XSTATE

### **Architecture suggérée**
```
machines/
├── bloomMachine.js       # Gestion bloom
├── pbrMachine.js         # Gestion PBR
├── lightMachine.js       # Gestion lighting
├── backgroundMachine.js  # Gestion background
├── securityMachine.js    # États sécurité
└── uiMachine.js          # Orchestration UI
```

### **Priorités refonte**
1. **Découper** en composants atomiques
2. **Extraire** la logique en machines XState
3. **Simplifier** le flow de données
4. **Éliminer** les fallbacks multiples

---

## ✅ ANALYSE COMPLÈTE

**Fichier central du système debug, architecture hybride complexe nécessitant refonte totale en XState pour simplification et maintenabilité.**

---

**FIN SESSION 1 - DebugPanel.jsx**
**Durée analyse** : ~45 minutes
**Prochaine session** : DebugPanelV2.jsx