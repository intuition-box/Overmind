# ⚛️ SESSION E05 - UI LAYER CONSTRUCTION PLAN CONSTRUCTION

**Date** : 1 octobre 2025
**Phase** : E - Plan Construction
**Focus** : React components + XState v5 actors integration (useActorRef + useSelector)
**Criticité** : HAUTE

---

## 🎯 OBJECTIF SESSION E05

**Mission** : Détailler architecture UI React 18 + XState v5 avec patterns optimisés pour performance (minimal re-renders).

**Scope** :
1. **Custom Hooks** : useActorRef + useSelector patterns
2. **React Components** : Pure UI components (zero logic business)
3. **Actor Integration** : Communication components ↔ actors via events
4. **Performance** : Memoization + selective re-renders (92% reduction validated)
5. **BloomColorPicker** : Premier composant XState v5 (référence E13)

**Objectif qualité** : Code production-ready React 18 + TypeScript + XState v5

---

## 📊 ARCHITECTURE UI LAYER

### **Principes Architecture** :

```
┌─────────────────────────────────────────────────────────────┐
│                     REACT UI LAYER                          │
│                                                             │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐ │
│  │  Component   │──────│  Custom Hook │──────│  Actor   │ │
│  │  (Pure UI)   │      │ (useActorRef)│      │ (XState) │ │
│  └──────────────┘      └──────────────┘      └──────────┘ │
│         │                      │                    │      │
│         │ props (read)         │ useSelector        │      │
│         │ callbacks (write)    │ send events        │      │
│         └──────────────────────┴────────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Séparation claire** :
- **Components** : UI pure, JSX, styling, user interactions
- **Custom Hooks** : Bridge React ↔ XState, useActorRef + useSelector
- **Actors** : Business logic, state management, services async

**Avantages** :
- ✅ Zero coupling components ↔ business logic
- ✅ Testabilité maximale (mock actors facilement)
- ✅ Performance optimale (useSelector selective)
- ✅ Réutilisabilité (components + hooks + actors indépendants)

---

## 🎨 COMPONENTS STRUCTURE

### **1. BloomColorPicker Component** (Premier composant XState v5)

**Référence** : E13 Plan Construction

**Fichiers** :
- `components/BloomColorPicker/BloomColorPicker.jsx` (Pure UI)
- `hooks/useBloomColorPicker.ts` (Custom hook)
- `machines/bloomColorPickerMachine.ts` (Actor - déjà détaillé E04)

---

#### **1.1 : BloomColorPicker.jsx** (Pure UI Component)

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import './BloomColorPicker.css';

/**
 * BloomColorPicker - Pure UI component for color selection
 *
 * @param {string} color - Current selected color (hex format #RRGGBB)
 * @param {string} previewColor - Preview color during debounce (hex format)
 * @param {boolean} isApplying - Is color being applied (loading state)
 * @param {Function} onColorChange - Callback when color changes
 * @param {Function} onApply - Callback when user explicitly applies color
 * @param {Function} onCancel - Callback when user cancels color change
 */
export const BloomColorPicker = ({
  color,
  previewColor,
  isApplying,
  onColorChange,
  onApply,
  onCancel
}) => {
  return (
    <div className="bloom-color-picker">
      <div className="bloom-color-picker__header">
        <h3>IRIS Color</h3>
      </div>

      <div className="bloom-color-picker__controls">
        {/* Color input */}
        <input
          type="color"
          value={previewColor || color}
          onChange={(e) => onColorChange(e.target.value)}
          disabled={isApplying}
          className="bloom-color-picker__input"
        />

        {/* Preview indicator */}
        <div
          className="bloom-color-picker__preview"
          style={{ backgroundColor: previewColor || color }}
        />

        {/* Color value display */}
        <span className="bloom-color-picker__value">
          {previewColor || color}
        </span>
      </div>

      {/* Action buttons */}
      <div className="bloom-color-picker__actions">
        <button
          onClick={onApply}
          disabled={isApplying || color === previewColor}
          className="bloom-color-picker__button bloom-color-picker__button--apply"
        >
          {isApplying ? 'Applying...' : 'Apply'}
        </button>

        <button
          onClick={onCancel}
          disabled={isApplying}
          className="bloom-color-picker__button bloom-color-picker__button--cancel"
        >
          Cancel
        </button>
      </div>

      {/* Loading indicator */}
      {isApplying && (
        <div className="bloom-color-picker__loading">
          <div className="bloom-color-picker__spinner" />
        </div>
      )}
    </div>
  );
};

BloomColorPicker.propTypes = {
  color: PropTypes.string.isRequired,
  previewColor: PropTypes.string,
  isApplying: PropTypes.bool.isRequired,
  onColorChange: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

BloomColorPicker.defaultProps = {
  previewColor: null
};
```

**Caractéristiques** :
- ✅ Pure UI (zero business logic)
- ✅ PropTypes validation
- ✅ Controlled component (color via props)
- ✅ Callbacks pour toutes actions user
- ✅ Loading state (isApplying)
- ✅ Preview color distinct (pendant debounce)

---

#### **1.2 : useBloomColorPicker.ts** (Custom Hook)

```typescript
import { useActorRef, useSelector } from '@xstate/react';
import { useMemo, useCallback } from 'react';
import { bloomColorPickerMachine } from '../machines/bloomColorPickerMachine';
import type { ActorRefFrom } from 'xstate';

type UseBloomColorPickerInput = {
  securityManager: SecurityIRISManager;
  onApplyColor?: (color: number) => void;
  initialColor?: number;
};

type UseBloomColorPickerReturn = {
  // State
  color: string;
  previewColor: string | null;
  isApplying: boolean;
  isIdle: boolean;
  isDebouncing: boolean;
  error: Error | null;

  // Actions
  handleColorChange: (htmlColor: string) => void;
  handleApply: () => void;
  handleCancel: () => void;

  // Actor ref (for advanced usage)
  actorRef: ActorRefFrom<typeof bloomColorPickerMachine>;
};

/**
 * useBloomColorPicker - Custom hook for BloomColorPicker integration
 *
 * Features:
 * - Automatic debouncing (200ms, 92% CPU reduction)
 * - Selective re-renders via useSelector
 * - Type-safe XState v5 integration
 *
 * @example
 * const {
 *   color,
 *   previewColor,
 *   isApplying,
 *   handleColorChange
 * } = useBloomColorPicker({
 *   securityManager,
 *   onApplyColor: (color) => console.log('Applied:', color)
 * });
 */
export function useBloomColorPicker({
  securityManager,
  onApplyColor,
  initialColor = 0xffffff
}: UseBloomColorPickerInput): UseBloomColorPickerReturn {

  // Create actor ref (persists across renders)
  const actorRef = useActorRef(
    bloomColorPickerMachine,
    {
      input: {
        securityManager,
        onApplyColor,
        initialColor
      }
    }
  );

  // Selective state subscriptions (minimal re-renders)
  const color = useSelector(
    actorRef,
    (state) => {
      const hex = state.context.selectedColor;
      return `#${hex.toString(16).padStart(6, '0')}`;
    }
  );

  const previewColor = useSelector(
    actorRef,
    (state) => {
      const hex = state.context.previewColor;
      if (hex === state.context.selectedColor) return null;
      return `#${hex.toString(16).padStart(6, '0')}`;
    }
  );

  const isApplying = useSelector(
    actorRef,
    (state) => state.matches('applying')
  );

  const isIdle = useSelector(
    actorRef,
    (state) => state.matches('idle')
  );

  const isDebouncing = useSelector(
    actorRef,
    (state) => state.matches('debouncing')
  );

  const error = useSelector(
    actorRef,
    (state) => state.context.error
  );

  // Memoized callbacks (stable references, prevent child re-renders)
  const handleColorChange = useCallback((htmlColor: string) => {
    // Validate hex format
    if (!/^#[0-9A-Fa-f]{6}$/.test(htmlColor)) {
      console.warn('Invalid color format:', htmlColor);
      return;
    }

    // Convert HTML color to hex number
    const hexColor = parseInt(htmlColor.replace('#', ''), 16);

    // Send event to actor
    actorRef.send({
      type: 'COLOR_CHANGED',
      color: hexColor
    });
  }, [actorRef]);

  const handleApply = useCallback(() => {
    actorRef.send({ type: 'APPLY_COLOR' });
  }, [actorRef]);

  const handleCancel = useCallback(() => {
    actorRef.send({ type: 'CANCEL' });
  }, [actorRef]);

  return {
    // State
    color,
    previewColor,
    isApplying,
    isIdle,
    isDebouncing,
    error,

    // Actions
    handleColorChange,
    handleApply,
    handleCancel,

    // Actor ref
    actorRef
  };
}
```

**Caractéristiques** :
- ✅ useActorRef (actor creation + persistence)
- ✅ useSelector (selective re-renders, 92% reduction)
- ✅ useCallback (memoized callbacks, stable refs)
- ✅ TypeScript types complets
- ✅ Color format conversion (HTML ↔ hex number)
- ✅ Validation input (hex format)

---

#### **1.3 : BloomColorPickerContainer.jsx** (Connected Component)

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import { BloomColorPicker } from './BloomColorPicker';
import { useBloomColorPicker } from '../../hooks/useBloomColorPicker';

/**
 * BloomColorPickerContainer - Connected component (hook + UI)
 *
 * This is the component to use in the app (not BloomColorPicker directly)
 */
export const BloomColorPickerContainer = ({
  securityManager,
  onApplyColor
}) => {
  const {
    color,
    previewColor,
    isApplying,
    handleColorChange,
    handleApply,
    handleCancel
  } = useBloomColorPicker({
    securityManager,
    onApplyColor
  });

  return (
    <BloomColorPicker
      color={color}
      previewColor={previewColor}
      isApplying={isApplying}
      onColorChange={handleColorChange}
      onApply={handleApply}
      onCancel={handleCancel}
    />
  );
};

BloomColorPickerContainer.propTypes = {
  securityManager: PropTypes.object.isRequired,
  onApplyColor: PropTypes.func
};
```

**Caractéristiques** :
- ✅ Container pattern (hook + presentational component)
- ✅ Component à utiliser dans l'app
- ✅ Séparation logique/UI claire

---

### **2. AnimationControlsPanel Component**

**Objectif** : Panel contrôle animations (29 NLA animations + crossfade)

#### **2.1 : AnimationControlsPanel.jsx** (Pure UI)

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import './AnimationControlsPanel.css';

/**
 * AnimationControlsPanel - Pure UI component for animation controls
 *
 * @param {string[]} animations - List of available animation names
 * @param {string} currentAnimation - Currently playing animation
 * @param {boolean} isPlaying - Is animation playing
 * @param {boolean} isCrossfading - Is crossfade in progress
 * @param {number} crossfadeDuration - Crossfade duration (seconds)
 * @param {Function} onPlayAnimation - Callback to play animation
 * @param {Function} onPause - Callback to pause
 * @param {Function} onResume - Callback to resume
 * @param {Function} onStop - Callback to stop
 * @param {Function} onCrossfadeDurationChange - Callback when duration changes
 */
export const AnimationControlsPanel = ({
  animations,
  currentAnimation,
  isPlaying,
  isCrossfading,
  crossfadeDuration,
  onPlayAnimation,
  onPause,
  onResume,
  onStop,
  onCrossfadeDurationChange
}) => {
  return (
    <div className="animation-controls-panel">
      <div className="animation-controls-panel__header">
        <h3>Animations</h3>
        <span className="animation-controls-panel__count">
          {animations.length} clips
        </span>
      </div>

      {/* Current animation display */}
      <div className="animation-controls-panel__current">
        <strong>Current:</strong> {currentAnimation || 'None'}
        {isCrossfading && (
          <span className="animation-controls-panel__crossfading">
            Crossfading...
          </span>
        )}
      </div>

      {/* Animation list */}
      <div className="animation-controls-panel__list">
        {animations.map((animName) => (
          <button
            key={animName}
            onClick={() => onPlayAnimation(animName)}
            disabled={isCrossfading}
            className={`
              animation-controls-panel__animation-button
              ${currentAnimation === animName ? 'active' : ''}
            `}
          >
            {animName}
          </button>
        ))}
      </div>

      {/* Playback controls */}
      <div className="animation-controls-panel__playback">
        <button
          onClick={isPlaying ? onPause : onResume}
          disabled={!currentAnimation || isCrossfading}
          className="animation-controls-panel__button"
        >
          {isPlaying ? 'Pause' : 'Resume'}
        </button>

        <button
          onClick={onStop}
          disabled={!currentAnimation || isCrossfading}
          className="animation-controls-panel__button"
        >
          Stop
        </button>
      </div>

      {/* Crossfade duration control */}
      <div className="animation-controls-panel__crossfade">
        <label>
          Crossfade Duration: {crossfadeDuration.toFixed(1)}s
        </label>
        <input
          type="range"
          min="0.1"
          max="2.0"
          step="0.1"
          value={crossfadeDuration}
          onChange={(e) => onCrossfadeDurationChange(parseFloat(e.target.value))}
          className="animation-controls-panel__slider"
        />
      </div>
    </div>
  );
};

AnimationControlsPanel.propTypes = {
  animations: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentAnimation: PropTypes.string,
  isPlaying: PropTypes.bool.isRequired,
  isCrossfading: PropTypes.bool.isRequired,
  crossfadeDuration: PropTypes.number.isRequired,
  onPlayAnimation: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onResume: PropTypes.func.isRequired,
  onStop: PropTypes.func.isRequired,
  onCrossfadeDurationChange: PropTypes.func.isRequired
};

AnimationControlsPanel.defaultProps = {
  currentAnimation: null
};
```

---

#### **2.2 : useAnimationControls.ts** (Custom Hook)

```typescript
import { useActorRef, useSelector } from '@xstate/react';
import { useCallback, useMemo } from 'react';
import { animationControllerMachine } from '../machines/animationControllerMachine';
import type { ActorRefFrom } from 'xstate';

type UseAnimationControlsInput = {
  mixer: THREE.AnimationMixer;
  animations: THREE.AnimationClip[];
};

type UseAnimationControlsReturn = {
  // State
  animations: string[];
  currentAnimation: string | null;
  isPlaying: boolean;
  isPaused: boolean;
  isCrossfading: boolean;
  crossfadeDuration: number;
  error: Error | null;

  // Actions
  handlePlayAnimation: (name: string) => void;
  handlePause: () => void;
  handleResume: () => void;
  handleStop: () => void;
  handleSetCrossfadeDuration: (duration: number) => void;

  // Actor ref
  actorRef: ActorRefFrom<typeof animationControllerMachine>;
};

export function useAnimationControls({
  mixer,
  animations: clips
}: UseAnimationControlsInput): UseAnimationControlsReturn {

  // Create actor ref
  const actorRef = useActorRef(
    animationControllerMachine,
    {
      input: {
        mixer,
        animations: clips
      }
    }
  );

  // Animation names (memoized)
  const animations = useMemo(
    () => clips.map(clip => clip.name),
    [clips]
  );

  // Selective state subscriptions
  const currentAnimation = useSelector(
    actorRef,
    (state) => state.context.currentAction?.getClip().name || null
  );

  const isPlaying = useSelector(
    actorRef,
    (state) => state.matches('playing')
  );

  const isPaused = useSelector(
    actorRef,
    (state) => state.matches('paused')
  );

  const isCrossfading = useSelector(
    actorRef,
    (state) => state.matches('crossfading')
  );

  const crossfadeDuration = useSelector(
    actorRef,
    (state) => state.context.crossfadeDuration
  );

  const error = useSelector(
    actorRef,
    (state) => state.context.error
  );

  // Memoized callbacks
  const handlePlayAnimation = useCallback((name: string) => {
    actorRef.send({ type: 'PLAY', animationName: name });
  }, [actorRef]);

  const handlePause = useCallback(() => {
    actorRef.send({ type: 'PAUSE' });
  }, [actorRef]);

  const handleResume = useCallback(() => {
    actorRef.send({ type: 'RESUME' });
  }, [actorRef]);

  const handleStop = useCallback(() => {
    actorRef.send({ type: 'STOP' });
  }, [actorRef]);

  const handleSetCrossfadeDuration = useCallback((duration: number) => {
    actorRef.send({
      type: 'SET_CROSSFADE_DURATION',
      duration
    });
  }, [actorRef]);

  return {
    animations,
    currentAnimation,
    isPlaying,
    isPaused,
    isCrossfading,
    crossfadeDuration,
    error,
    handlePlayAnimation,
    handlePause,
    handleResume,
    handleStop,
    handleSetCrossfadeDuration,
    actorRef
  };
}
```

---

### **3. BloomControlsPanel Component**

**Objectif** : Panel contrôle bloom settings (threshold, strength, radius)

#### **3.1 : BloomControlsPanel.jsx** (Pure UI)

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import './BloomControlsPanel.css';

/**
 * BloomControlsPanel - Pure UI component for bloom effect controls
 *
 * @param {number} threshold - Bloom threshold (0-1)
 * @param {number} strength - Bloom strength (0-3)
 * @param {number} radius - Bloom radius (0-1)
 * @param {boolean} isUpdating - Is update in progress
 * @param {Function} onThresholdChange - Callback when threshold changes
 * @param {Function} onStrengthChange - Callback when strength changes
 * @param {Function} onRadiusChange - Callback when radius changes
 */
export const BloomControlsPanel = ({
  threshold,
  strength,
  radius,
  isUpdating,
  onThresholdChange,
  onStrengthChange,
  onRadiusChange
}) => {
  return (
    <div className="bloom-controls-panel">
      <div className="bloom-controls-panel__header">
        <h3>Bloom Effects</h3>
        {isUpdating && (
          <span className="bloom-controls-panel__updating">Updating...</span>
        )}
      </div>

      {/* Threshold control */}
      <div className="bloom-controls-panel__control">
        <label>
          Threshold: {threshold.toFixed(2)}
          <span className="bloom-controls-panel__hint">
            (Brightness cutoff)
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={threshold}
          onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
          disabled={isUpdating}
          className="bloom-controls-panel__slider"
        />
      </div>

      {/* Strength control */}
      <div className="bloom-controls-panel__control">
        <label>
          Strength: {strength.toFixed(2)}
          <span className="bloom-controls-panel__hint">
            (Bloom intensity)
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="3"
          step="0.1"
          value={strength}
          onChange={(e) => onStrengthChange(parseFloat(e.target.value))}
          disabled={isUpdating}
          className="bloom-controls-panel__slider"
        />
      </div>

      {/* Radius control */}
      <div className="bloom-controls-panel__control">
        <label>
          Radius: {radius.toFixed(2)}
          <span className="bloom-controls-panel__hint">
            (Bloom spread)
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={radius}
          onChange={(e) => onRadiusChange(parseFloat(e.target.value))}
          disabled={isUpdating}
          className="bloom-controls-panel__slider"
        />
      </div>
    </div>
  );
};

BloomControlsPanel.propTypes = {
  threshold: PropTypes.number.isRequired,
  strength: PropTypes.number.isRequired,
  radius: PropTypes.number.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  onThresholdChange: PropTypes.func.isRequired,
  onStrengthChange: PropTypes.func.isRequired,
  onRadiusChange: PropTypes.func.isRequired
};
```

---

#### **3.2 : useBloomControls.ts** (Custom Hook)

```typescript
import { useActorRef, useSelector } from '@xstate/react';
import { useCallback } from 'react';
import { bloomEffectsActorMachine } from '../machines/bloomEffectsActorMachine';
import type { ActorRefFrom } from 'xstate';

type UseBloomControlsInput = {
  bloomPass: UnrealBloomPass;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.Camera;
};

type UseBloomControlsReturn = {
  // State
  threshold: number;
  strength: number;
  radius: number;
  isUpdating: boolean;
  isDebouncing: boolean;
  error: Error | null;

  // Actions
  handleThresholdChange: (value: number) => void;
  handleStrengthChange: (value: number) => void;
  handleRadiusChange: (value: number) => void;

  // Actor ref
  actorRef: ActorRefFrom<typeof bloomEffectsActorMachine>;
};

export function useBloomControls({
  bloomPass,
  renderer,
  scene,
  camera
}: UseBloomControlsInput): UseBloomControlsReturn {

  const actorRef = useActorRef(
    bloomEffectsActorMachine,
    {
      input: {
        bloomPass,
        renderer,
        scene,
        camera
      }
    }
  );

  // Selective state subscriptions
  const threshold = useSelector(
    actorRef,
    (state) => state.context.currentSettings.threshold
  );

  const strength = useSelector(
    actorRef,
    (state) => state.context.currentSettings.strength
  );

  const radius = useSelector(
    actorRef,
    (state) => state.context.currentSettings.radius
  );

  const isUpdating = useSelector(
    actorRef,
    (state) => state.matches('updating')
  );

  const isDebouncing = useSelector(
    actorRef,
    (state) => state.matches('debouncing')
  );

  const error = useSelector(
    actorRef,
    (state) => state.context.error
  );

  // Memoized callbacks
  const handleThresholdChange = useCallback((value: number) => {
    actorRef.send({
      type: 'UPDATE_SETTINGS',
      settings: { threshold: value }
    });
  }, [actorRef]);

  const handleStrengthChange = useCallback((value: number) => {
    actorRef.send({
      type: 'UPDATE_SETTINGS',
      settings: { strength: value }
    });
  }, [actorRef]);

  const handleRadiusChange = useCallback((value: number) => {
    actorRef.send({
      type: 'UPDATE_SETTINGS',
      settings: { radius: value }
    });
  }, [actorRef]);

  return {
    threshold,
    strength,
    radius,
    isUpdating,
    isDebouncing,
    error,
    handleThresholdChange,
    handleStrengthChange,
    handleRadiusChange,
    actorRef
  };
}
```

---

### **4. PerformanceMonitor Component**

**Objectif** : Affichage metrics performance temps réel

#### **4.1 : PerformanceMonitor.jsx** (Pure UI)

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import './PerformanceMonitor.css';

/**
 * PerformanceMonitor - Pure UI component for performance metrics display
 */
export const PerformanceMonitor = ({
  fps,
  frameTime,
  drawCalls,
  triangles,
  geometries,
  textures,
  isMonitoring,
  isOptimizing,
  appliedOptimizations
}) => {
  const fpsClass = fps >= 60 ? 'good' : fps >= 30 ? 'warning' : 'critical';

  return (
    <div className="performance-monitor">
      <div className="performance-monitor__header">
        <h3>Performance</h3>
        {isOptimizing && (
          <span className="performance-monitor__optimizing">Optimizing...</span>
        )}
      </div>

      {/* FPS Display */}
      <div className={`performance-monitor__metric performance-monitor__metric--${fpsClass}`}>
        <span className="performance-monitor__label">FPS</span>
        <span className="performance-monitor__value">{fps.toFixed(0)}</span>
      </div>

      {/* Frame Time */}
      <div className="performance-monitor__metric">
        <span className="performance-monitor__label">Frame Time</span>
        <span className="performance-monitor__value">{frameTime.toFixed(2)}ms</span>
      </div>

      {/* Render Stats */}
      <div className="performance-monitor__section">
        <h4>Render Stats</h4>
        <div className="performance-monitor__stats">
          <div className="performance-monitor__stat">
            <span>Draw Calls:</span>
            <strong>{drawCalls}</strong>
          </div>
          <div className="performance-monitor__stat">
            <span>Triangles:</span>
            <strong>{triangles.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Memory Stats */}
      <div className="performance-monitor__section">
        <h4>Memory</h4>
        <div className="performance-monitor__stats">
          <div className="performance-monitor__stat">
            <span>Geometries:</span>
            <strong>{geometries}</strong>
          </div>
          <div className="performance-monitor__stat">
            <span>Textures:</span>
            <strong>{textures}</strong>
          </div>
        </div>
      </div>

      {/* Applied Optimizations */}
      {appliedOptimizations.length > 0 && (
        <div className="performance-monitor__optimizations">
          <h4>Recent Optimizations</h4>
          <ul>
            {appliedOptimizations.map((opt, idx) => (
              <li key={idx}>{opt}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

PerformanceMonitor.propTypes = {
  fps: PropTypes.number.isRequired,
  frameTime: PropTypes.number.isRequired,
  drawCalls: PropTypes.number.isRequired,
  triangles: PropTypes.number.isRequired,
  geometries: PropTypes.number.isRequired,
  textures: PropTypes.number.isRequired,
  isMonitoring: PropTypes.bool.isRequired,
  isOptimizing: PropTypes.bool.isRequired,
  appliedOptimizations: PropTypes.arrayOf(PropTypes.string).isRequired
};
```

---

#### **4.2 : usePerformanceMonitor.ts** (Custom Hook)

```typescript
import { useActorRef, useSelector } from '@xstate/react';
import { performanceMonitorActorMachine } from '../machines/performanceMonitorActorMachine';
import type { ActorRefFrom } from 'xstate';

type UsePerformanceMonitorInput = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  thresholds?: {
    lowFPS: number;
    highDrawCalls: number;
  };
};

type UsePerformanceMonitorReturn = {
  // State
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  isMonitoring: boolean;
  isOptimizing: boolean;
  appliedOptimizations: string[];

  // Actor ref
  actorRef: ActorRefFrom<typeof performanceMonitorActorMachine>;
};

export function usePerformanceMonitor({
  renderer,
  scene,
  thresholds = { lowFPS: 30, highDrawCalls: 1000 }
}: UsePerformanceMonitorInput): UsePerformanceMonitorReturn {

  const actorRef = useActorRef(
    performanceMonitorActorMachine,
    {
      input: {
        renderer,
        scene,
        thresholds
      }
    }
  );

  // Selective state subscriptions
  const fps = useSelector(
    actorRef,
    (state) => state.context.currentMetrics?.fps || 0
  );

  const frameTime = useSelector(
    actorRef,
    (state) => state.context.currentMetrics?.frameTime || 0
  );

  const drawCalls = useSelector(
    actorRef,
    (state) => state.context.currentMetrics?.drawCalls || 0
  );

  const triangles = useSelector(
    actorRef,
    (state) => state.context.currentMetrics?.triangles || 0
  );

  const geometries = useSelector(
    actorRef,
    (state) => state.context.currentMetrics?.geometries || 0
  );

  const textures = useSelector(
    actorRef,
    (state) => state.context.currentMetrics?.textures || 0
  );

  const isMonitoring = useSelector(
    actorRef,
    (state) => state.matches('monitoring')
  );

  const isOptimizing = useSelector(
    actorRef,
    (state) => state.matches('optimizing')
  );

  const appliedOptimizations = useSelector(
    actorRef,
    (state) => state.context.appliedOptimizations || []
  );

  return {
    fps,
    frameTime,
    drawCalls,
    triangles,
    geometries,
    textures,
    isMonitoring,
    isOptimizing,
    appliedOptimizations,
    actorRef
  };
}
```

---

## 🎨 MAIN APP INTEGRATION

### **5. V3Scene Component Integration** (Root component)

**Objectif** : Intégrer tous les components avec root system actor

```jsx
import React, { useEffect, useRef } from 'react';
import { useActorRef, useSelector } from '@xstate/react';
import { rootSystemMachine } from '../machines/rootSystemMachine';
import { BloomColorPickerContainer } from './BloomColorPicker/BloomColorPickerContainer';
import { AnimationControlsPanelContainer } from './AnimationControlsPanel/AnimationControlsPanelContainer';
import { BloomControlsPanelContainer } from './BloomControlsPanel/BloomControlsPanelContainer';
import { PerformanceMonitorContainer } from './PerformanceMonitor/PerformanceMonitorContainer';
import './V3Scene.css';

export const V3Scene = () => {
  const canvasRef = useRef(null);

  // Root system actor
  const rootActorRef = useActorRef(rootSystemMachine, {
    input: {
      canvas: canvasRef.current
    }
  });

  // System state
  const isInitialized = useSelector(
    rootActorRef,
    (state) => state.matches('ready')
  );

  const isInitializing = useSelector(
    rootActorRef,
    (state) => state.matches('initializing')
  );

  const initializationProgress = useSelector(
    rootActorRef,
    (state) => state.context.initializationProgress
  );

  const error = useSelector(
    rootActorRef,
    (state) => state.context.errors[0] || null
  );

  // Get child actors
  const sceneActor = useSelector(
    rootActorRef,
    (state) => state.context.actors.get('scene')
  );

  const animationActor = useSelector(
    rootActorRef,
    (state) => state.context.actors.get('animation')
  );

  const bloomActor = useSelector(
    rootActorRef,
    (state) => state.context.actors.get('bloom')
  );

  const performanceActor = useSelector(
    rootActorRef,
    (state) => state.context.actors.get('performance')
  );

  // Initialize system
  useEffect(() => {
    if (canvasRef.current && !isInitialized && !isInitializing) {
      rootActorRef.send({ type: 'INITIALIZE' });
    }
  }, [canvasRef.current, isInitialized, isInitializing]);

  // Loading state
  if (isInitializing) {
    return (
      <div className="v3scene__loading">
        <div className="v3scene__loading-spinner" />
        <p>Initializing Overmind ({initializationProgress}%)</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="v3scene__error">
        <h2>Initialization Error</h2>
        <p>{error.message}</p>
        <button onClick={() => rootActorRef.send({ type: 'RETRY' })}>
          Retry
        </button>
      </div>
    );
  }

  // Ready state
  return (
    <div className="v3scene">
      {/* Canvas */}
      <canvas ref={canvasRef} className="v3scene__canvas" />

      {/* UI Panels */}
      {isInitialized && (
        <div className="v3scene__ui">
          {/* Left Panel */}
          <div className="v3scene__panel v3scene__panel--left">
            {animationActor && (
              <AnimationControlsPanelContainer actorRef={animationActor} />
            )}

            {bloomActor && (
              <BloomControlsPanelContainer actorRef={bloomActor} />
            )}

            {bloomActor && (
              <BloomColorPickerContainer actorRef={bloomActor} />
            )}
          </div>

          {/* Right Panel */}
          <div className="v3scene__panel v3scene__panel--right">
            {performanceActor && (
              <PerformanceMonitorContainer actorRef={performanceActor} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

**Caractéristiques** :
- ✅ Root system actor orchestration
- ✅ Child actors distribution (Receptionist pattern)
- ✅ Loading/Error states
- ✅ Progressive initialization (progress %)
- ✅ Panel layout (left + right)

---

## 📊 PERFORMANCE OPTIMIZATIONS

### **Pattern 1 : useSelector Selective Re-renders**

```typescript
// ❌ BAD: Re-render on ANY state change
const state = useSelector(actorRef, (state) => state);

// ✅ GOOD: Re-render only when specific value changes
const fps = useSelector(actorRef, (state) => state.context.metrics.fps);
```

**Impact** : 92% re-renders reduction (validated D13)

---

### **Pattern 2 : useCallback Stable References**

```typescript
// ❌ BAD: New function every render
const handleClick = () => actorRef.send({ type: 'CLICK' });

// ✅ GOOD: Memoized function (stable ref)
const handleClick = useCallback(
  () => actorRef.send({ type: 'CLICK' }),
  [actorRef]
);
```

**Impact** : Prevent child component re-renders

---

### **Pattern 3 : useMemo Expensive Computations**

```typescript
// ❌ BAD: Recalculate every render
const animationNames = animations.map(a => a.name);

// ✅ GOOD: Memoized computation
const animationNames = useMemo(
  () => animations.map(a => a.name),
  [animations]
);
```

**Impact** : Avoid redundant calculations

---

### **Pattern 4 : React.memo Pure Components**

```typescript
// Wrap pure component to prevent re-renders
export const BloomColorPicker = React.memo(({ color, onColorChange }) => {
  return (
    <div>
      <input type="color" value={color} onChange={onColorChange} />
    </div>
  );
});
```

**Impact** : Re-render only when props change

---

## 📋 CHECKLIST QUALITÉ UI LAYER

### **Tous components DOIVENT** :
- ✅ Séparation pure UI / business logic
- ✅ PropTypes validation (ou TypeScript props interface)
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Responsive design (mobile + desktop)
- ✅ Loading states (spinners, disabled buttons)
- ✅ Error states (error messages, retry buttons)

### **Tous custom hooks DOIVENT** :
- ✅ useActorRef pour actor creation
- ✅ useSelector pour selective subscriptions
- ✅ useCallback pour memoized callbacks
- ✅ TypeScript types complets (Input + Return)
- ✅ JSDoc documentation

### **Performance DOIT** :
- ✅ useSelector granular (one value per selector)
- ✅ useCallback stable callbacks
- ✅ React.memo pour pure components
- ✅ useMemo pour expensive computations

---

## 🔬 TESTS UI LAYER

### **Component Testing Strategy** :

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BloomColorPicker } from './BloomColorPicker';

describe('BloomColorPicker', () => {
  it('should render color input with current color', () => {
    render(
      <BloomColorPicker
        color="#ff0000"
        previewColor={null}
        isApplying={false}
        onColorChange={vi.fn()}
        onApply={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox', { type: 'color' });
    expect(input).toHaveValue('#ff0000');
  });

  it('should call onColorChange when color changes', () => {
    const onColorChange = vi.fn();

    render(
      <BloomColorPicker
        color="#ff0000"
        previewColor={null}
        isApplying={false}
        onColorChange={onColorChange}
        onApply={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox', { type: 'color' });
    fireEvent.change(input, { target: { value: '#00ff00' } });

    expect(onColorChange).toHaveBeenCalledWith('#00ff00');
  });

  it('should disable input when applying', () => {
    render(
      <BloomColorPicker
        color="#ff0000"
        previewColor={null}
        isApplying={true}
        onColorChange={vi.fn()}
        onApply={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const input = screen.getByRole('textbox', { type: 'color' });
    expect(input).toBeDisabled();
  });
});
```

---

### **Hook Testing Strategy** :

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useBloomColorPicker } from './useBloomColorPicker';

describe('useBloomColorPicker', () => {
  it('should initialize with default color', () => {
    const securityManager = createMockSecurityManager();

    const { result } = renderHook(() =>
      useBloomColorPicker({
        securityManager,
        initialColor: 0xff0000
      })
    );

    expect(result.current.color).toBe('#ff0000');
    expect(result.current.isIdle).toBe(true);
  });

  it('should debounce color changes (200ms)', async () => {
    const securityManager = createMockSecurityManager();

    const { result } = renderHook(() =>
      useBloomColorPicker({ securityManager })
    );

    // Trigger color change
    act(() => {
      result.current.handleColorChange('#00ff00');
    });

    expect(result.current.isDebouncing).toBe(true);

    // Wait for debounce (200ms)
    await waitFor(
      () => expect(result.current.isIdle).toBe(true),
      { timeout: 250 }
    );

    expect(result.current.color).toBe('#00ff00');
    expect(securityManager.setCustomColor).toHaveBeenCalledWith(0x00ff00);
  });
});
```

---

## 🎯 FICHIERS STRUCTURE

### **Arborescence complète** :

```
src/
├── components/
│   ├── BloomColorPicker/
│   │   ├── BloomColorPicker.jsx (Pure UI)
│   │   ├── BloomColorPickerContainer.jsx (Connected)
│   │   └── BloomColorPicker.css
│   ├── AnimationControlsPanel/
│   │   ├── AnimationControlsPanel.jsx
│   │   ├── AnimationControlsPanelContainer.jsx
│   │   └── AnimationControlsPanel.css
│   ├── BloomControlsPanel/
│   │   ├── BloomControlsPanel.jsx
│   │   ├── BloomControlsPanelContainer.jsx
│   │   └── BloomControlsPanel.css
│   ├── PerformanceMonitor/
│   │   ├── PerformanceMonitor.jsx
│   │   ├── PerformanceMonitorContainer.jsx
│   │   └── PerformanceMonitor.css
│   └── V3Scene.jsx (Root)
│
├── hooks/
│   ├── useBloomColorPicker.ts
│   ├── useAnimationControls.ts
│   ├── useBloomControls.ts
│   └── usePerformanceMonitor.ts
│
├── machines/ (XState v5 actors)
│   ├── rootSystemMachine.ts
│   ├── bloomColorPickerMachine.ts
│   ├── animationControllerMachine.ts
│   ├── bloomEffectsActorMachine.ts
│   └── performanceMonitorActorMachine.ts
│
└── __tests__/
    ├── components/
    │   ├── BloomColorPicker.test.jsx
    │   ├── AnimationControlsPanel.test.jsx
    │   └── ...
    └── hooks/
        ├── useBloomColorPicker.test.ts
        ├── useAnimationControls.test.ts
        └── ...
```

---

## 🎯 PROCHAINES ÉTAPES

✅ **E05 COMPLÉTÉ** - UI Layer Construction détaillée

**Components créés** :
1. ✅ BloomColorPicker (Pure UI + Hook + Container)
2. ✅ AnimationControlsPanel (Pure UI + Hook)
3. ✅ BloomControlsPanel (Pure UI + Hook)
4. ✅ PerformanceMonitor (Pure UI + Hook)
5. ✅ V3Scene (Root integration)

**Patterns documentés** :
- ✅ useSelector selective re-renders (92% reduction)
- ✅ useCallback stable references
- ✅ useMemo expensive computations
- ✅ React.memo pure components
- ✅ Container pattern (hook + presentational)

**Tests** :
- ✅ Component testing strategy (React Testing Library)
- ✅ Hook testing strategy (renderHook + waitFor)

**Performance** :
- ✅ Minimal re-renders validated (92% reduction D13)
- ✅ Debouncing integrated (200ms color, 50ms bloom)
- ✅ Memoization patterns

**Prochaine session** : E06 Performance Optimization (Bundle size, code splitting, lazy loading)

---

**SESSION E05 TERMINÉE** ✅

**Components** : 5/5 détaillés avec React 18 + XState v5
**Qualité** : Production-ready UI + hooks + tests
**Performance** : 92% re-renders reduction validated

**Prochaine** : E06 Performance Optimization
