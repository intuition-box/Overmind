# 🏗️ PHASE E - ARCHITECTURE : ControlPanel Components

**Date** : 3 octobre 2025
**Objectif** : Définir l'architecture des composants React du ControlPanel

---

## 🎯 STRUCTURE DE COMPOSANTS

```
ControlPanel/
├── ControlPanel.tsx              # Container principal
├── ControlPanel.css              # Styles globaux
├── components/
│   ├── TabNavigation.tsx         # Navigation entre tabs
│   ├── TabNavigation.css
│   │
│   ├── tabs/
│   │   ├── TabBloom.tsx          # Tab 1
│   │   ├── TabBloom.css
│   │   ├── TabEffects.tsx        # Tab 2
│   │   ├── TabEffects.css
│   │   ├── TabLighting.tsx       # Tab 3
│   │   ├── TabLighting.css
│   │   ├── TabCamera.tsx         # Tab 4 (optionnel)
│   │   ├── TabCamera.css
│   │   ├── TabPBR.tsx            # Tab 5
│   │   ├── TabPBR.css
│   │   ├── TabScene.tsx          # Tab 6
│   │   └── TabScene.css
│   │
│   └── ui/
│       ├── Slider.tsx            # Slider réutilisable
│       ├── Slider.css
│       ├── Toggle.tsx            # Toggle réutilisable
│       ├── Toggle.css
│       ├── ColorPicker.tsx       # Color picker réutilisable
│       ├── ColorPicker.css
│       ├── Dropdown.tsx          # Dropdown réutilisable
│       ├── Dropdown.css
│       ├── Section.tsx           # Section avec titre
│       └── Section.css
```

---

## 📦 COMPOSANT : ControlPanel.tsx

### **Responsabilités**
- Container principal
- Gestion état onglet actif
- Toggle ouvert/fermé
- Position draggable (optionnel)

### **Code**

```typescript
// ControlPanel/ControlPanel.tsx
import React, { useState } from 'react';
import { TabNavigation } from './components/TabNavigation';
import { TabBloom } from './components/tabs/TabBloom';
import { TabEffects } from './components/tabs/TabEffects';
import { TabLighting } from './components/tabs/TabLighting';
import { TabCamera } from './components/tabs/TabCamera';
import { TabPBR } from './components/tabs/TabPBR';
import { TabScene } from './components/tabs/TabScene';
import './ControlPanel.css';

export type TabId = 'bloom' | 'effects' | 'lighting' | 'camera' | 'pbr' | 'scene';

export function ControlPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('bloom');

  if (!isOpen) {
    return (
      <button
        className="control-panel-toggle"
        onClick={() => setIsOpen(true)}
      >
        ⚙️ Controls
      </button>
    );
  }

  return (
    <div className="control-panel">
      <div className="control-panel-header">
        <h2>⚙️ Control Panel</h2>
        <button
          className="close-btn"
          onClick={() => setIsOpen(false)}
        >
          ×
        </button>
      </div>

      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="control-panel-content">
        {activeTab === 'bloom' && <TabBloom />}
        {activeTab === 'effects' && <TabEffects />}
        {activeTab === 'lighting' && <TabLighting />}
        {activeTab === 'camera' && <TabCamera />}
        {activeTab === 'pbr' && <TabPBR />}
        {activeTab === 'scene' && <TabScene />}
      </div>
    </div>
  );
}
```

### **CSS**

```css
/* ControlPanel/ControlPanel.css */

.control-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 400px;
  max-height: 80vh;
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.control-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.control-panel-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
}

.close-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.close-btn:hover {
  opacity: 1;
}

.control-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.control-panel-content::-webkit-scrollbar {
  width: 8px;
}

.control-panel-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.control-panel-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.control-panel-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  background: rgba(10, 10, 10, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  z-index: 1000;
  backdrop-filter: blur(10px);
  transition: all 0.2s;
}

.control-panel-toggle:hover {
  background: rgba(20, 20, 20, 0.95);
  border-color: rgba(255, 255, 255, 0.2);
}
```

---

## 📦 COMPOSANT : TabNavigation.tsx

### **Responsabilités**
- Afficher les 6 onglets
- Gérer l'onglet actif
- Highlight visuel

### **Code**

```typescript
// ControlPanel/components/TabNavigation.tsx
import React from 'react';
import { TabId } from '../ControlPanel';
import './TabNavigation.css';

interface Tab {
  id: TabId;
  icon: string;
  label: string;
}

const TABS: Tab[] = [
  { id: 'bloom', icon: '🌟', label: 'Bloom' },
  { id: 'effects', icon: '✨', label: 'Effects' },
  { id: 'lighting', icon: '💡', label: 'Lighting' },
  { id: 'camera', icon: '📷', label: 'Camera' },
  { id: 'pbr', icon: '⚙️', label: 'PBR' },
  { id: 'scene', icon: '🌍', label: 'Scene' }
];

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="tab-navigation">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
```

### **CSS**

```css
/* ControlPanel/components/TabNavigation.css */

.tab-navigation {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 4px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
}

.tab-button.active {
  background: rgba(0, 255, 255, 0.15);
  color: #00ffff;
}

.tab-icon {
  font-size: 20px;
}

.tab-label {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
```

---

## 📦 COMPOSANTS UI RÉUTILISABLES

### **1. Slider.tsx**

```typescript
// ControlPanel/components/ui/Slider.tsx
import React from 'react';
import './Slider.css';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  unit = ''
}: SliderProps) {
  return (
    <div className="slider-control">
      <div className="slider-header">
        <label>{label}</label>
        <span className="slider-value">{value.toFixed(2)}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="slider-input"
      />
      <div className="slider-range">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
```

### **CSS Slider**

```css
/* ControlPanel/components/ui/Slider.css */

.slider-control {
  margin-bottom: 16px;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.slider-header label {
  font-size: 13px;
  color: #aaaaaa;
  font-weight: 500;
}

.slider-value {
  font-size: 13px;
  color: #00ffff;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.slider-input {
  width: 100%;
  height: 4px;
  background: #333333;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #00ffff;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.slider-input::-webkit-slider-thumb:hover {
  width: 18px;
  height: 18px;
  box-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}

.slider-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #00ffff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.slider-range {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 11px;
  color: #666666;
}
```

---

### **2. Toggle.tsx**

```typescript
// ControlPanel/components/ui/Toggle.tsx
import React from 'react';
import './Toggle.css';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <div className="toggle-control">
      <label className="toggle-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="toggle-input"
        />
        <span className="toggle-slider"></span>
        <span className="toggle-text">{label}</span>
      </label>
    </div>
  );
}
```

### **CSS Toggle**

```css
/* ControlPanel/components/ui/Toggle.css */

.toggle-control {
  margin-bottom: 16px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 44px;
  height: 24px;
  background: #333333;
  border-radius: 12px;
  transition: background 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: #ffffff;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-input:checked + .toggle-slider {
  background: #00ffff;
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.toggle-text {
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
}
```

---

### **3. Section.tsx**

```typescript
// ControlPanel/components/ui/Section.tsx
import React from 'react';
import './Section.css';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <div className="section">
      <h3 className="section-title">{title}</h3>
      <div className="section-content">
        {children}
      </div>
    </div>
  );
}
```

### **CSS Section**

```css
/* ControlPanel/components/ui/Section.css */

.section {
  margin-bottom: 24px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.section-content {
  /* Content spacing handled by child components */
}
```

---

## 📦 EXEMPLE : TabBloom.tsx (Structure)

```typescript
// ControlPanel/components/tabs/TabBloom.tsx
import React from 'react';
import { useBloom } from '../../../xstate-v5/hooks/useBloom';
import { Section } from '../ui/Section';
import { Toggle } from '../ui/Toggle';
import { Slider } from '../ui/Slider';
import { ColorPicker } from '../ui/ColorPicker';
import './TabBloom.css';

export function TabBloom() {
  const {
    enabled,
    threshold,
    strength,
    radius,
    bloomColor,
    toggleBloom,
    updateThreshold,
    updateStrength,
    updateRadius,
    setBloomColor
  } = useBloom();

  return (
    <div className="tab-bloom">
      <Section title="✨ Global Bloom Settings">
        <Toggle
          label="Enabled"
          checked={enabled}
          onChange={toggleBloom}
        />

        <Slider
          label="Threshold"
          value={threshold}
          min={0}
          max={1}
          step={0.01}
          onChange={updateThreshold}
        />

        <Slider
          label="Strength"
          value={strength}
          min={0}
          max={3}
          step={0.01}
          onChange={updateStrength}
        />

        <Slider
          label="Radius"
          value={radius}
          min={0}
          max={1}
          step={0.01}
          onChange={updateRadius}
        />
      </Section>

      <Section title="🎨 Bloom Color Picker">
        <ColorPicker
          color={bloomColor}
          onChange={setBloomColor}
        />
      </Section>
    </div>
  );
}
```

---

## ✅ RÉCAPITULATIF ARCHITECTURE

### **Composants Principaux**
1. ✅ `ControlPanel.tsx` - Container principal
2. ✅ `TabNavigation.tsx` - Navigation 6 tabs

### **Composants UI Réutilisables**
3. ✅ `Slider.tsx` - Slider avec label + valeur
4. ✅ `Toggle.tsx` - Toggle checkbox stylisé
5. ✅ `Section.tsx` - Section avec titre
6. ✅ `ColorPicker.tsx` - Color picker (react-colorful)
7. ✅ `Dropdown.tsx` - Dropdown select

### **6 Tab Components**
8. ✅ `TabBloom.tsx`
9. ✅ `TabEffects.tsx`
10. ✅ `TabLighting.tsx`
11. ✅ `TabCamera.tsx`
12. ✅ `TabPBR.tsx`
13. ✅ `TabScene.tsx`

---

## ➡️ PROCHAINE ÉTAPE

**Voir E03-E08** pour l'implémentation détaillée de chaque tab.

---

**FIN ARCHITECTURE**
