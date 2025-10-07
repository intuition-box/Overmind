# 🧪 SESSION E07 - TESTING IMPLEMENTATION PLAN CONSTRUCTION

**Date** : 1 octobre 2025
**Phase** : E - Plan Construction
**Focus** : Unit, Integration, E2E testing strategies (XState + React + Three.js)
**Criticité** : HAUTE

---

## 🎯 OBJECTIF SESSION E07

**Mission** : Documenter stratégies testing complètes pour XState v5 actors + React components + Three.js.

**Scope** :
1. **Unit Testing** : State machines, services, hooks, components
2. **Integration Testing** : Actor communication, Three.js scene lifecycle
3. **E2E Testing** : User flows complets (Playwright)
4. **Visual Regression** : Screenshots components UI
5. **Performance Testing** : Load times, FPS, memory

**Objectif qualité** : 80%+ code coverage, tests automatisés CI/CD

---

## 🧪 TESTING STACK

### **Framework & Tools** :

```json
{
  "devDependencies": {
    // Test runners
    "vitest": "^1.0.0",
    "playwright": "^1.40.0",

    // React testing
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",

    // XState testing
    "@xstate/test": "^1.0.0",

    // Three.js mocking
    "vitest-canvas-mock": "^0.3.0",

    // Coverage
    "@vitest/coverage-v8": "^1.0.0",

    // Visual regression
    "@playwright/test": "^1.40.0",
    "pixelmatch": "^5.3.0"
  }
}
```

### **Test Configuration** :

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  test: {
    // Environment
    environment: 'jsdom',

    // Setup files
    setupFiles: ['./src/__tests__/setup.ts'],

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: [
        'src/__tests__/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    },

    // Globals (for jest-like APIs)
    globals: true,

    // Mock canvas
    environmentOptions: {
      jsdom: {
        resources: 'usable'
      }
    }
  }
});
```

```typescript
// src/__tests__/setup.ts
import '@testing-library/jest-dom';
import 'vitest-canvas-mock';

// Mock WebGL context
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearColor: vi.fn(),
  clear: vi.fn(),
  drawArrays: vi.fn(),
  // ... other WebGL methods
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb: FrameRequestCallback) => {
  return setTimeout(() => cb(Date.now()), 16);
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};
```

---

## 🧪 UNIT TESTING

### **1. State Machine Testing** (XState actors)

**Objectif** : Tester state machines isolément (transitions, actions, guards, services)

#### **1.1 : Basic State Machine Test**

```typescript
// __tests__/machines/bloomColorPickerMachine.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createActor, waitFor } from 'xstate';
import { bloomColorPickerMachine } from '../../machines/bloomColorPickerMachine';

describe('bloomColorPickerMachine', () => {
  let actor: ReturnType<typeof createActor>;
  let mockSecurityManager: any;

  beforeEach(() => {
    // Mock SecurityIRISManager
    mockSecurityManager = {
      setCustomColor: vi.fn(),
      securityObjects: new Map([
        ['iris1', { material: { emissive: { setHex: vi.fn() } } }],
        ['iris2', { material: { emissive: { setHex: vi.fn() } } }]
      ])
    };

    // Create actor
    actor = createActor(bloomColorPickerMachine, {
      input: {
        securityManager: mockSecurityManager,
        initialColor: 0xffffff
      }
    });
  });

  it('should start in idle state with initial color', () => {
    actor.start();

    const snapshot = actor.getSnapshot();

    expect(snapshot.matches('idle')).toBe(true);
    expect(snapshot.context.selectedColor).toBe(0xffffff);
    expect(snapshot.context.previewColor).toBe(0xffffff);
  });

  it('should transition to debouncing on COLOR_CHANGED', () => {
    actor.start();

    actor.send({ type: 'COLOR_CHANGED', color: 0xff0000 });

    const snapshot = actor.getSnapshot();

    expect(snapshot.matches('debouncing')).toBe(true);
    expect(snapshot.context.previewColor).toBe(0xff0000);
  });

  it('should debounce multiple color changes (200ms)', async () => {
    actor.start();

    // Send multiple rapid changes
    actor.send({ type: 'COLOR_CHANGED', color: 0xff0000 });
    actor.send({ type: 'COLOR_CHANGED', color: 0x00ff00 });
    actor.send({ type: 'COLOR_CHANGED', color: 0x0000ff });

    // Should still be debouncing
    expect(actor.getSnapshot().matches('debouncing')).toBe(true);

    // Wait for debounce to complete (200ms)
    await waitFor(
      actor,
      (state) => state.matches('idle'),
      { timeout: 300 }
    );

    // Should have applied last color only
    expect(mockSecurityManager.setCustomColor).toHaveBeenCalledTimes(1);
    expect(mockSecurityManager.setCustomColor).toHaveBeenCalledWith(0x0000ff);
  });

  it('should cancel color change on CANCEL', () => {
    actor.start();

    actor.send({ type: 'COLOR_CHANGED', color: 0xff0000 });
    actor.send({ type: 'CANCEL' });

    const snapshot = actor.getSnapshot();

    expect(snapshot.matches('idle')).toBe(true);
    expect(snapshot.context.previewColor).toBe(0xffffff); // Reset to original
  });

  it('should handle error from SecurityIRISManager', async () => {
    mockSecurityManager.setCustomColor.mockImplementation(() => {
      throw new Error('Material error');
    });

    actor.start();

    actor.send({ type: 'COLOR_CHANGED', color: 0xff0000 });

    await waitFor(
      actor,
      (state) => state.matches('error'),
      { timeout: 300 }
    );

    const snapshot = actor.getSnapshot();
    expect(snapshot.context.error?.message).toContain('Material error');
  });
});
```

**Caractéristiques** :
- ✅ Test transitions (idle → debouncing → applying)
- ✅ Test debouncing (200ms delay, multiple rapid changes)
- ✅ Test actions (assign context)
- ✅ Test error handling (onError transition)
- ✅ Mock dependencies (SecurityIRISManager)

---

#### **1.2 : GLB Loader Machine Test** (484 bones validation)

```typescript
// __tests__/machines/glbLoaderMachine.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createActor, waitFor } from 'xstate';
import { glbLoaderMachine } from '../../machines/glbLoaderMachine';

describe('glbLoaderMachine', () => {
  it('should load GLB and validate 484 bones', async () => {
    // Mock GLTF with valid data
    const mockGLTF = {
      scene: {
        traverse: vi.fn((callback) => {
          // Simulate 484 bones
          for (let i = 0; i < 484; i++) {
            callback({ type: 'Bone', name: `Bone_${i}` });
          }
        })
      },
      animations: new Array(29).fill({ name: 'Anim' }) // 29 animations
    };

    // Mock GLTFLoader
    vi.mock('three/examples/jsm/loaders/GLTFLoader', () => ({
      GLTFLoader: class {
        load(path, onSuccess) {
          setTimeout(() => onSuccess(mockGLTF), 100);
        }
      }
    }));

    const actor = createActor(glbLoaderMachine, {
      input: { path: '/models/overmind.glb' }
    });

    actor.start();
    actor.send({ type: 'LOAD' });

    // Wait for loading to complete
    await waitFor(
      actor,
      (state) => state.matches('loaded'),
      { timeout: 500 }
    );

    const snapshot = actor.getSnapshot();

    expect(snapshot.context.bones).toHaveLength(484);
    expect(snapshot.context.animations).toHaveLength(29);
  });

  it('should reject GLB with invalid bone count', async () => {
    // Mock GLTF with INVALID data (only 100 bones)
    const mockGLTF = {
      scene: {
        traverse: vi.fn((callback) => {
          for (let i = 0; i < 100; i++) {
            callback({ type: 'Bone', name: `Bone_${i}` });
          }
        })
      },
      animations: new Array(29).fill({ name: 'Anim' })
    };

    const actor = createActor(glbLoaderMachine, {
      input: { path: '/models/invalid.glb' }
    });

    actor.start();
    actor.send({ type: 'LOAD' });

    // Wait for error
    await waitFor(
      actor,
      (state) => state.matches('error'),
      { timeout: 500 }
    );

    const snapshot = actor.getSnapshot();
    expect(snapshot.context.error?.message).toContain('Invalid bone count: 100 (expected 484)');
  });
});
```

---

### **2. Service Testing** (fromPromise actors)

```typescript
// __tests__/services/loadGLBFile.test.ts
import { describe, it, expect, vi } from 'vitest';
import { loadGLBFile } from '../../services/loadGLBFile';

describe('loadGLBFile service', () => {
  it('should load GLB and extract bones/animations', async () => {
    const mockOnProgress = vi.fn();

    const result = await loadGLBFile({
      input: {
        path: '/models/overmind.glb',
        onProgress: mockOnProgress
      }
    });

    expect(result.metadata.boneCount).toBe(484);
    expect(result.metadata.animationCount).toBe(29);
    expect(mockOnProgress).toHaveBeenCalled();
  });

  it('should reject on invalid path', async () => {
    await expect(
      loadGLBFile({
        input: { path: '/invalid/path.glb' }
      })
    ).rejects.toThrow('GLB loading failed');
  });
});
```

---

### **3. React Component Testing**

**Objectif** : Tester pure UI components (props, events, rendering)

#### **3.1 : BloomColorPicker Component Test**

```typescript
// __tests__/components/BloomColorPicker.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BloomColorPicker } from '../../components/BloomColorPicker/BloomColorPicker';

describe('BloomColorPicker', () => {
  const defaultProps = {
    color: '#ffffff',
    previewColor: null,
    isApplying: false,
    onColorChange: vi.fn(),
    onApply: vi.fn(),
    onCancel: vi.fn()
  };

  it('should render with current color', () => {
    render(<BloomColorPicker {...defaultProps} />);

    const input = screen.getByRole('textbox', { type: 'color' }) as HTMLInputElement;
    expect(input.value).toBe('#ffffff');
  });

  it('should call onColorChange when color input changes', () => {
    const onColorChange = vi.fn();

    render(
      <BloomColorPicker
        {...defaultProps}
        onColorChange={onColorChange}
      />
    );

    const input = screen.getByRole('textbox', { type: 'color' });
    fireEvent.change(input, { target: { value: '#ff0000' } });

    expect(onColorChange).toHaveBeenCalledWith('#ff0000');
  });

  it('should disable input when applying', () => {
    render(
      <BloomColorPicker
        {...defaultProps}
        isApplying={true}
      />
    );

    const input = screen.getByRole('textbox', { type: 'color' });
    expect(input).toBeDisabled();
  });

  it('should show preview color when different from selected', () => {
    render(
      <BloomColorPicker
        {...defaultProps}
        color="#ffffff"
        previewColor="#ff0000"
      />
    );

    const preview = screen.getByClassName('bloom-color-picker__preview');
    expect(preview).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('should disable Apply button when colors are same', () => {
    render(
      <BloomColorPicker
        {...defaultProps}
        color="#ff0000"
        previewColor="#ff0000"
      />
    );

    const applyButton = screen.getByText('Apply');
    expect(applyButton).toBeDisabled();
  });

  it('should show loading state when applying', () => {
    render(
      <BloomColorPicker
        {...defaultProps}
        isApplying={true}
      />
    );

    expect(screen.getByText('Applying...')).toBeInTheDocument();
    expect(screen.getByClassName('bloom-color-picker__spinner')).toBeInTheDocument();
  });
});
```

---

### **4. Custom Hook Testing**

```typescript
// __tests__/hooks/useBloomColorPicker.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBloomColorPicker } from '../../hooks/useBloomColorPicker';

describe('useBloomColorPicker', () => {
  let mockSecurityManager: any;

  beforeEach(() => {
    mockSecurityManager = {
      setCustomColor: vi.fn(),
      securityObjects: new Map()
    };
  });

  it('should initialize with default color', () => {
    const { result } = renderHook(() =>
      useBloomColorPicker({
        securityManager: mockSecurityManager,
        initialColor: 0xffffff
      })
    );

    expect(result.current.color).toBe('#ffffff');
    expect(result.current.isIdle).toBe(true);
  });

  it('should debounce color changes (200ms)', async () => {
    const { result } = renderHook(() =>
      useBloomColorPicker({
        securityManager: mockSecurityManager
      })
    );

    // Trigger rapid color changes
    act(() => {
      result.current.handleColorChange('#ff0000');
      result.current.handleColorChange('#00ff00');
      result.current.handleColorChange('#0000ff');
    });

    expect(result.current.isDebouncing).toBe(true);

    // Wait for debounce (200ms)
    await waitFor(
      () => expect(result.current.isIdle).toBe(true),
      { timeout: 300 }
    );

    // Should apply last color only
    expect(mockSecurityManager.setCustomColor).toHaveBeenCalledTimes(1);
    expect(mockSecurityManager.setCustomColor).toHaveBeenCalledWith(0x0000ff);
  });

  it('should validate hex color format', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() =>
      useBloomColorPicker({
        securityManager: mockSecurityManager
      })
    );

    act(() => {
      result.current.handleColorChange('invalid');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Invalid color format:', 'invalid');

    consoleSpy.mockRestore();
  });

  it('should call onApplyColor callback', async () => {
    const onApplyColor = vi.fn();

    const { result } = renderHook(() =>
      useBloomColorPicker({
        securityManager: mockSecurityManager,
        onApplyColor
      })
    );

    act(() => {
      result.current.handleColorChange('#ff0000');
    });

    await waitFor(
      () => expect(result.current.isIdle).toBe(true),
      { timeout: 300 }
    );

    expect(onApplyColor).toHaveBeenCalledWith(0xff0000);
  });
});
```

---

## 🔗 INTEGRATION TESTING

### **5. Actor Communication Testing**

**Objectif** : Tester communication entre actors (Receptionist pattern)

```typescript
// __tests__/integration/actorCommunication.test.ts
import { describe, it, expect } from 'vitest';
import { createActor, waitFor } from 'xstate';
import { rootSystemMachine } from '../../machines/rootSystemMachine';

describe('Actor Communication', () => {
  it('should spawn and register child actors', async () => {
    const actor = createActor(rootSystemMachine);
    actor.start();

    // Initialize system
    actor.send({ type: 'INITIALIZE' });

    // Wait for initialization
    await waitFor(
      actor,
      (state) => state.matches('ready'),
      { timeout: 1000 }
    );

    const snapshot = actor.getSnapshot();

    // Check actors registered
    expect(snapshot.context.actors.has('scene')).toBe(true);
    expect(snapshot.context.actors.has('animation')).toBe(true);
    expect(snapshot.context.actors.has('bloom')).toBe(true);
  });

  it('should communicate between actors via events', async () => {
    const actor = createActor(rootSystemMachine);
    actor.start();

    actor.send({ type: 'INITIALIZE' });
    await waitFor(actor, (state) => state.matches('ready'));

    const sceneActor = actor.getSnapshot().context.actors.get('scene');
    const animationActor = actor.getSnapshot().context.actors.get('animation');

    // Scene actor sends MODEL_LOADED event
    sceneActor?.send({ type: 'MODEL_LOADED', model: {} });

    // Animation actor should receive notification
    await waitFor(
      animationActor!,
      (state) => state.context.model !== null,
      { timeout: 500 }
    );

    expect(animationActor?.getSnapshot().context.model).toBeDefined();
  });
});
```

---

### **6. Three.js Scene Lifecycle Testing**

```typescript
// __tests__/integration/sceneLifecycle.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createActor, waitFor } from 'xstate';
import { sceneActorMachine } from '../../machines/sceneActorMachine';
import * as THREE from 'three';

describe('Scene Lifecycle', () => {
  it('should create scene with fog', async () => {
    const actor = createActor(sceneActorMachine, {
      input: {
        backgroundColor: 0x000000,
        fogConfig: {
          color: 0x000000,
          near: 1,
          far: 1000
        }
      }
    });

    actor.start();
    actor.send({ type: 'CREATE_SCENE' });

    await waitFor(
      actor,
      (state) => state.matches('ready'),
      { timeout: 500 }
    );

    const scene = actor.getSnapshot().context.scene;

    expect(scene).toBeInstanceOf(THREE.Scene);
    expect(scene?.fog).toBeInstanceOf(THREE.Fog);
  });

  it('should dispose scene resources', async () => {
    const actor = createActor(sceneActorMachine);

    actor.start();
    actor.send({ type: 'CREATE_SCENE' });

    await waitFor(actor, (state) => state.matches('ready'));

    // Add objects to scene
    const scene = actor.getSnapshot().context.scene!;
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Spy on dispose methods
    const geometryDisposeSpy = vi.spyOn(geometry, 'dispose');
    const materialDisposeSpy = vi.spyOn(material, 'dispose');

    // Dispose scene
    actor.send({ type: 'DISPOSE' });

    await waitFor(
      actor,
      (state) => state.matches('disposed'),
      { timeout: 500 }
    );

    expect(geometryDisposeSpy).toHaveBeenCalled();
    expect(materialDisposeSpy).toHaveBeenCalled();
  });
});
```

---

## 🎭 E2E TESTING

### **7. User Flow Testing** (Playwright)

**Objectif** : Tester flows complets utilisateur

```typescript
// e2e/colorPicker.spec.ts
import { test, expect } from '@playwright/test';

test.describe('BloomColorPicker User Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Wait for app to load
    await page.waitForSelector('canvas');
  });

  test('should change IRIS color via color picker', async ({ page }) => {
    // Open color picker
    await page.click('[data-testid="bloom-color-picker-toggle"]');

    // Wait for color picker to appear
    const colorInput = page.locator('input[type="color"]');
    await expect(colorInput).toBeVisible();

    // Change color
    await colorInput.fill('#ff0000');

    // Wait for debounce (200ms) + apply
    await page.waitForTimeout(300);

    // Check color was applied (via screenshot or canvas inspection)
    const preview = page.locator('.bloom-color-picker__preview');
    await expect(preview).toHaveCSS('background-color', 'rgb(255, 0, 0)');
  });

  test('should cancel color change', async ({ page }) => {
    const colorInput = page.locator('input[type="color"]');

    // Get initial color
    const initialColor = await colorInput.inputValue();

    // Change color
    await colorInput.fill('#00ff00');

    // Click cancel
    await page.click('button:has-text("Cancel")');

    // Color should revert
    const currentColor = await colorInput.inputValue();
    expect(currentColor).toBe(initialColor);
  });

  test('should show loading state when applying', async ({ page }) => {
    const colorInput = page.locator('input[type="color"]');

    await colorInput.fill('#0000ff');

    // Check loading state appears
    const loadingSpinner = page.locator('.bloom-color-picker__spinner');
    await expect(loadingSpinner).toBeVisible();

    // Wait for completion
    await expect(loadingSpinner).not.toBeVisible({ timeout: 500 });
  });
});
```

---

### **8. Animation Controls E2E Test**

```typescript
// e2e/animationControls.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Animation Controls', () => {
  test('should play animation with crossfade', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('canvas');

    // Open animation panel
    await page.click('[data-testid="animation-panel-toggle"]');

    // Click first animation
    await page.click('button:has-text("Idle")');

    // Wait for animation to start
    await page.waitForTimeout(100);

    // Check current animation indicator
    const currentAnim = page.locator('.animation-controls-panel__current');
    await expect(currentAnim).toContainText('Idle');

    // Click second animation (should crossfade)
    await page.click('button:has-text("Walk")');

    // Check crossfading indicator
    const crossfading = page.locator('.animation-controls-panel__crossfading');
    await expect(crossfading).toBeVisible();

    // Wait for crossfade to complete (300ms)
    await expect(crossfading).not.toBeVisible({ timeout: 500 });

    // Check new current animation
    await expect(currentAnim).toContainText('Walk');
  });
});
```

---

## 📸 VISUAL REGRESSION TESTING

### **9. Screenshot Comparison**

```typescript
// e2e/visualRegression.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('should match BloomColorPicker screenshot', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const colorPicker = page.locator('.bloom-color-picker');
    await expect(colorPicker).toBeVisible();

    // Take screenshot
    await expect(colorPicker).toHaveScreenshot('bloom-color-picker.png', {
      maxDiffPixels: 100 // Allow 100 pixels difference
    });
  });

  test('should match animation panel screenshot', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const animPanel = page.locator('.animation-controls-panel');

    await expect(animPanel).toHaveScreenshot('animation-panel.png');
  });

  test('should match full scene screenshot', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Wait for scene to load
    await page.waitForSelector('canvas');
    await page.waitForTimeout(2000); // Wait for GLB load

    // Full page screenshot
    await expect(page).toHaveScreenshot('full-scene.png', {
      fullPage: true
    });
  });
});
```

---

## ⚡ PERFORMANCE TESTING

### **10. Load Time Testing**

```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:5173');

    // Wait for interactive
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000); // 3s budget
  });

  test('should load GLB within 5 seconds', async ({ page }) => {
    await page.goto('http://localhost:5173');

    const glbLoadStart = Date.now();

    // Wait for model loaded indicator
    await page.waitForSelector('[data-testid="model-loaded"]', {
      timeout: 5000
    });

    const glbLoadTime = Date.now() - glbLoadStart;

    expect(glbLoadTime).toBeLessThan(5000);
  });

  test('should maintain 60 FPS during animation', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Measure FPS via Performance API
    const fps = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();

        const measureFPS = () => {
          frameCount++;

          const elapsed = performance.now() - startTime;

          if (elapsed >= 1000) {
            resolve(frameCount);
          } else {
            requestAnimationFrame(measureFPS);
          }
        };

        requestAnimationFrame(measureFPS);
      });
    });

    expect(fps).toBeGreaterThanOrEqual(55); // Allow 5 FPS margin
  });
});
```

---

## 🎯 CI/CD INTEGRATION

### **11. GitHub Actions Workflow**

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  integration-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run integration tests
        run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Build app
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  visual-regression:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run visual regression tests
        run: npm run test:visual

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: visual-regression-diffs
          path: test-results/
```

---

## 📋 TEST SCRIPTS

### **12. package.json Scripts**

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --coverage",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:visual": "playwright test --grep @visual",
    "test:watch": "vitest watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

---

## 📊 COVERAGE TARGETS

### **Code Coverage Goals** :

```
Overall:        80%+
-------------------
State Machines: 90%+ (critical business logic)
Services:       85%+ (async operations)
Hooks:          80%+ (React integration)
Components:     75%+ (UI rendering)
Utils:          90%+ (pure functions)
```

### **Coverage Report** :

```typescript
// vitest.config.ts coverage configuration
coverage: {
  thresholds: {
    // Global thresholds
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,

    // Per-file thresholds
    perFile: true,

    // Specific paths
    './src/machines/**/*.ts': {
      lines: 90,
      functions: 90
    },
    './src/services/**/*.ts': {
      lines: 85,
      functions: 85
    }
  }
}
```

---

## 🎯 TESTING CHECKLIST

### **Tous state machines DOIVENT avoir** :
- ✅ Test transitions (tous states)
- ✅ Test actions (assign, callbacks)
- ✅ Test guards (conditions)
- ✅ Test services (fromPromise success/error)
- ✅ Test debouncing (delays)
- ✅ Test error recovery (retry logic)

### **Tous services DOIVENT avoir** :
- ✅ Test success case (valid input → valid output)
- ✅ Test error cases (invalid input → error)
- ✅ Test edge cases (null, undefined, empty)
- ✅ Mock dependencies (Three.js, network)

### **Tous components DOIVENT avoir** :
- ✅ Test rendering (initial state)
- ✅ Test user interactions (clicks, inputs)
- ✅ Test props (required, optional, defaults)
- ✅ Test loading states (spinners, disabled)
- ✅ Test error states (error messages)

### **Tous hooks DOIVENT avoir** :
- ✅ Test initialization (default values)
- ✅ Test state updates (actions)
- ✅ Test callbacks (memoization)
- ✅ Test cleanup (unmount)

---

## 🎯 PROCHAINES ÉTAPES

✅ **E07 COMPLÉTÉ** - Testing implementation strategy détaillée

**Tests couverts** :
1. ✅ Unit testing (state machines, services, hooks, components)
2. ✅ Integration testing (actor communication, Three.js lifecycle)
3. ✅ E2E testing (user flows, Playwright)
4. ✅ Visual regression (screenshot comparison)
5. ✅ Performance testing (load times, FPS)

**Tools documentés** :
- ✅ Vitest (unit/integration)
- ✅ React Testing Library (components/hooks)
- ✅ Playwright (E2E/visual)
- ✅ Coverage (80%+ target)

**CI/CD** :
- ✅ GitHub Actions workflow
- ✅ Automated test suite
- ✅ Coverage reports (Codecov)

**Prochaine session** : Plan E COMPLET - Recap + Next steps

---

**SESSION E07 TERMINÉE** ✅

**Tests** : Unit + Integration + E2E + Visual + Performance
**Qualité** : 80%+ coverage target, CI/CD automated
**Tools** : Vitest + React Testing Library + Playwright

**Prochaine** : E08 Recap + Deployment Strategy
