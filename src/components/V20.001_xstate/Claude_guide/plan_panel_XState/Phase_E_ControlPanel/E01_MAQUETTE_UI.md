# 🎨 PHASE E - MAQUETTE UI : ControlPanel 6 Tabs

**Date** : 3 octobre 2025
**Objectif** : Définir les maquettes UI pour chaque onglet du ControlPanel

---

## 🎯 VUE GLOBALE : CONTROL PANEL

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ Control Panel                                    [×]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────┬─────────┬──────────┬────────┬─────┬───────┐       │
│ │ 🌟  │   ✨    │    💡    │   📷   │ ⚙️  │  🌍   │       │
│ │Bloom│ Effects │ Lighting │ Camera │ PBR │ Scene │       │
│ └─────┴─────────┴──────────┴────────┴─────┴───────┘       │
│                                                             │
│ [TAB CONTENT HERE]                                          │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Position** : Coin supérieur droit de l'écran (overlay)
**Taille** : 400px largeur × 600px hauteur (ajustable)
**Style** : Fond semi-transparent, backdrop blur

---

## 🌟 TAB 1 : BLOOM

```
┌─────────────────────────────────────────────────────────────┐
│ 🌟 Bloom Controls                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✨ Global Bloom Settings                                   │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ [✅ Enabled]                                                │
│                                                             │
│ Threshold:   [===□──────────] 0.15                         │
│              Range: 0.0 - 1.0                               │
│                                                             │
│ Strength:    [====□─────────] 0.40                         │
│              Range: 0.0 - 3.0                               │
│                                                             │
│ Radius:      [====□─────────] 0.4                          │
│              Range: 0.0 - 1.0                               │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ 🎨 Bloom Color Picker                                      │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ [Color Palette Picker]                                      │
│ Current: #00ffff (Cyan)                                     │
│                                                             │
│ Applies to all emissive materials                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Composants** :
- Toggle "Enabled"
- 3 sliders (Threshold, Strength, Radius)
- Color picker full palette (HexColorPicker from react-colorful)

---

## ✨ TAB 2 : EFFECTS

```
┌─────────────────────────────────────────────────────────────┐
│ ✨ Effects Controls                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🌟 Visual Presets                                          │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ [None ▼]                                                    │
│   • ✨ Subtle                                               │
│   • 🌟 Normal                                               │
│   • 🔥 Intense                                              │
│   • 🎬 Cinematic                                            │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ 💫 Glow Effect                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ [  ] Enabled                                                │
│                                                             │
│ Speed:         [=====□──────] 1.0                          │
│ Min Intensity: [===□────────] 0.5                          │
│ Max Intensity: [==========□─] 2.0                          │
│                                                             │
│ Targets:                                                    │
│   [✅] IRIS                                                 │
│   [  ] Eye Rings                                            │
│   [  ] Magic Rings                                          │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ 🌈 Ultra Bloom                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ [  ] Enabled                                                │
│                                                             │
│ Intensity:     [==========□─] 10.0                         │
│ Threshold:     [=□──────────] 0.1                          │
│ Radius:        [=====□──────] 1.0                          │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ 🌀 Motion Trail                                            │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ [  ] Enabled                                                │
│                                                             │
│ Length:        [=======□────] 0.7                          │
│ Opacity:       [========□───] 0.8                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Composants** :
- Dropdown Visual Presets
- Section Glow (toggle + 3 sliders + 3 checkboxes)
- Section Ultra Bloom (toggle + 3 sliders)
- Section Motion Trail (toggle + 2 sliders)

---

## 💡 TAB 3 : LIGHTING

```
┌─────────────────────────────────────────────────────────────┐
│ 💡 Lighting Controls                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✨ Exposure                                                │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ Exposure:      [========□───] 1.7                          │
│                Range: 0.5 - 3.0                             │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ 🌟 HDR Boost                                               │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ [✅ Enabled]                                                │
│                                                             │
│ Multiplier:    [=======□────] 2.5                          │
│                Range: 1.0 - 5.0                             │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ 🎬 Light Position Presets                                  │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ Current: [studio-classic ▼]                                │
│                                                             │
│ • 🎬 Studio Classique (1, 2, 3)                            │
│ • ☀️ Plongée (0, 5, 0)                                     │
│ • 🌅 Dramatique (5, 1, 1)                                  │
│ • 💡 Face douce (0, 1, 5)                                  │
│ • ✨ Contre-jour (-2, 3, -2)                               │
│ • 🌙 Ambiance basse (2, 0.5, 2)                            │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ 🔆 Light Intensities                                       │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ Ambient:       [======□─────] 0.5                          │
│ Directional:   [========□───] 0.8                          │
│ Point:         [==========□─] 1.0                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Composants** :
- Slider Exposure
- Toggle HDR Boost + slider Multiplier
- Dropdown Light Position Presets
- 3 sliders Light Intensities

---

## 📷 TAB 4 : CAMERA

```
┌─────────────────────────────────────────────────────────────┐
│ 📷 Camera Controls                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎥 Camera Settings                                         │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ FOV:           [=======□────] 50                           │
│                Range: 20 - 120                              │
│                                                             │
│ Near Plane:    [□───────────] 0.1                          │
│                Range: 0.01 - 10                             │
│                                                             │
│ Far Plane:     [==========□─] 1000                         │
│                Range: 100 - 10000                           │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ 🔄 Controls Settings                                       │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ Auto Rotate:   [✅ Enabled]                                │
│ Speed:         [===□────────] 0.5                          │
│                                                             │
│ Damping:       [✅ Enabled]                                │
│ Factor:        [======□─────] 0.05                         │
│                                                             │
│ Zoom:          [✅ Enabled]                                │
│ Speed:         [====□───────] 1.0                          │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ 📍 Reset Camera                                            │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ [Reset Position] [Reset All]                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Composants** :
- 3 sliders Camera (FOV, Near, Far)
- Section Controls (3 toggles + 3 sliders)
- 2 boutons Reset

**Note** : Camera controls peuvent être ajoutés ultérieurement si nécessaire

---

## ⚙️ TAB 5 : PBR

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ PBR Controls                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎨 Tone Mapping (Global)                                   │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ [ACESFilmic ▼]                                             │
│   • None                                                    │
│   • Linear                                                  │
│   • Reinhard                                                │
│   • Cinematic                                               │
│   • ACESFilmic                                              │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ 🎭 PBR Presets                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ [Custom ▼]                                                  │
│   • 🔘 Chrome                                               │
│   • 💎 Glass                                                │
│   • 📄 Matte                                                │
│   • 🧴 Plastic                                              │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ 👁️ Eye Rings                                               │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ Metalness:       [=====□────] 0.5                          │
│ Roughness:       [=====□────] 0.5                          │
│ EnvMap Intensity:[=====□────] 1.0                          │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ 👀 IRIS                                                    │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ Metalness:       [□─────────] 0.0                          │
│ Roughness:       [======□───] 0.6                          │
│ EnvMap Intensity:[===□──────] 0.5                          │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ ✨ Magic Rings                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ Metalness:       [========□─] 0.8                          │
│ Roughness:       [==□───────] 0.2                          │
│ EnvMap Intensity:[========□─] 1.5                          │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ 💪 Arms                                                    │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ Metalness:       [===□──────] 0.3                          │
│ Roughness:       [=======□──] 0.7                          │
│ EnvMap Intensity:[====□─────] 0.8                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Composants** :
- Dropdown Tone Mapping
- Dropdown PBR Presets
- 4 sections Object Types (Eye Rings, IRIS, Magic Rings, Arms)
- 3 sliders par section (12 sliders total)

---

## 🌍 TAB 6 : SCENE

```
┌─────────────────────────────────────────────────────────────┐
│ 🌍 Scene Controls                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🎨 Background Color                                        │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ [Color Picker] Current: #0a0a0a                            │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ 📐 Grid Helper                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ [  ] Enabled                                                │
│                                                             │
│ Size:          [==========□─] 20                           │
│                Range: 10 - 100                              │
│                                                             │
│ Divisions:     [==========□─] 20                           │
│                Range: 10 - 100                              │
│                                                             │
│ Color 1:       [████] #444444                              │
│ Color 2:       [████] #222222                              │
│                                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ 📍 Axes Helper                                             │
│ ─────────────────────────────────────────────────────────── │
│                                                             │
│ [  ] Enabled                                                │
│                                                             │
│ Size:          [=====□──────] 5                            │
│                Range: 1 - 10                                │
│                                                             │
│ Preview:                                                    │
│ 🔴 X (Red) | 🟢 Y (Green) | 🔵 Z (Blue)                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Composants** :
- Color picker Background
- Section Grid (toggle + 2 sliders + 2 color pickers)
- Section Axes (toggle + 1 slider)

---

## 🎨 STYLE GUIDE

### **Couleurs**
```css
--panel-bg: rgba(10, 10, 10, 0.9);
--panel-border: rgba(255, 255, 255, 0.1);
--text-primary: #ffffff;
--text-secondary: #aaaaaa;
--accent-blue: #00ffff;
--slider-track: #333333;
--slider-thumb: #00ffff;
```

### **Typographie**
```css
font-family: 'Inter', 'Segoe UI', sans-serif;
font-size-title: 16px;
font-size-label: 13px;
font-size-value: 12px;
```

### **Spacing**
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
```

---

## ✅ RÉCAPITULATIF

**6 Tabs** :
1. 🌟 Bloom (2 sections, 4 controls)
2. ✨ Effects (4 sections, 13 controls)
3. 💡 Lighting (4 sections, 8 controls)
4. 📷 Camera (3 sections, 11 controls) - **optionnel**
5. ⚙️ PBR (3 sections, 14 controls)
6. 🌍 Scene (3 sections, 8 controls)

**Total controls** : ~58 contrôles interactifs

---

## ➡️ PROCHAINE ÉTAPE

**Voir [E02_ARCHITECTURE.md](E02_ARCHITECTURE.md)** pour l'architecture des composants React.

---

**FIN MAQUETTE UI**
