# 🧪 F08 - TESTING ARCHITECTURE - VISION CIBLE

**Date** : 2 octobre 2025
**Phase** : F - Vision Cible
**Session** : F08 - Architecture Testing
**Statut** : ✅ COMPLET

---

## 📋 VUE D'ENSEMBLE

L'**architecture de testing** définit la stratégie complète pour tester l'application Overmind XState v5 à tous les niveaux : **unit**, **integration**, **E2E**, et **visual regression**.

---

## 🏗️ TEST PYRAMID

```
        ┌──────────────┐
        │     E2E      │  10% - 5 tests (Playwright)
        │   Slow       │  Valide user flows complets
        ├──────────────┤
        │ Integration  │  30% - 15 tests (RTL + Vitest)
        │   Medium     │  Valide interactions composants + hooks + actors
        ├──────────────┤
        │     Unit     │  60% - 30 tests (Vitest)
        │   Fast       │  Valide functions, machines, services isolés
        └──────────────┘
```

**Objectifs** :
- **Unit** : < 500ms total, 100% coverage business logic
- **Integration** : < 2s total, 80% coverage hooks + components
- **E2E** : < 30s total, 100% critical user flows

---

## ✅ UNIT TESTS (Vitest)

### **1. Testing XState Machines**

**Configuration (vitest.config.ts)** :
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*.stories.tsx'],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80
    }
  }
});
```

**Test Machine (bloomColorPickerMachine.test.ts)** :
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createActor, waitFor } from 'xstate';
import { bloomColorPickerMachine } from './bloomColorPickerMachine';

describe('bloomColorPickerMachine', () => {
  let mockSecurityManager: any;

  beforeEach(() => {
    mockSecurityManager = {
      setCustomColor: vi.fn()
    };
  });

  describe('Initial state', () => {
    it('should start in idle state with default color', () => {
      const actor = createActor(bloomColorPickerMachine, {
        input: {
          securityManager: mockSecurityManager,
          initialColor: 0xffffff
        }
      });
      actor.start();

      expect(actor.getSnapshot().value).toBe('idle');
      expect(actor.getSnapshot().context.selectedColor).toBe(0xffffff);
    });
  });

  describe('Color selection', () => {
    it('should transition to selecting when color changes', () => {
      const actor = createActor(bloomColorPickerMachine, {
        input: { securityManager: mockSecurityManager }
      });
      actor.start();

      actor.send({ type: 'COLOR_CHANGED', color: 0xff0000 });

      expect(actor.getSnapshot().value).toBe('selecting');
      expect(actor.getSnapshot().context.selectedColor).toBe(0xff0000);
    });

    it('should update selected color in context', () => {
      const actor = createActor(bloomColorPickerMachine);
      actor.start();

      actor.send({ type: 'COLOR_CHANGED', color: 0x00ff00 });

      expect(actor.getSnapshot().context.selectedColor).toBe(0x00ff00);
    });
  });

  describe('Color application', () => {
    it('should transition to applying on APPLY_COLOR event', () => {
      const actor = createActor(bloomColorPickerMachine, {
        input: { securityManager: mockSecurityManager }
      });
      actor.start();

      actor.send({ type: 'COLOR_CHANGED', color: 0xff0000 });
      actor.send({ type: 'APPLY_COLOR' });

      expect(actor.getSnapshot().value).toBe('applying');
    });

    it('should call securityManager.setCustomColor with debounce', async () => {
      vi.useFakeTimers();

      const actor = createActor(bloomColorPickerMachine, {
        input: { securityManager: mockSecurityManager }
      });
      actor.start();

      actor.send({ type: 'COLOR_CHANGED', color: 0x00ff00 });
      actor.send({ type: 'APPLY_COLOR' });

      expect(mockSecurityManager.setCustomColor).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(200);

      expect(mockSecurityManager.setCustomColor).toHaveBeenCalledWith(0x00ff00);

      vi.useRealTimers();
    });

    it('should transition to applied after successful application', async () => {
      const actor = createActor(bloomColorPickerMachine, {
        input: { securityManager: mockSecurityManager }
      });
      actor.start();

      actor.send({ type: 'COLOR_CHANGED', color: 0xff0000 });
      actor.send({ type: 'APPLY_COLOR' });

      await waitFor(actor, (state) => state.matches('applied'), { timeout: 1000 });

      expect(actor.getSnapshot().value).toBe('applied');
    });
  });

  describe('Error handling', () => {
    it('should transition to error on service failure', async () => {
      mockSecurityManager.setCustomColor = vi.fn(() => {
        throw new Error('Application failed');
      });

      const actor = createActor(bloomColorPickerMachine, {
        input: { securityManager: mockSecurityManager }
      });
      actor.start();

      actor.send({ type: 'COLOR_CHANGED', color: 0xff0000 });
      actor.send({ type: 'APPLY_COLOR' });

      await waitFor(actor, (state) => state.matches('error'), { timeout: 1000 });

      expect(actor.getSnapshot().context.error).toBeDefined();
    });
  });
});
```

---

### **2. Testing Services (fromPromise)**

**Test Service (loadGLBFile.test.ts)** :
```typescript
import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import { loadGLBFile } from './loadGLBFile';

describe('loadGLBFile', () => {
  it('should load GLB file successfully', async () => {
    const mockModel = new THREE.Group();
    const mockBones = Array.from({ length: 484 }, () => new THREE.Bone());

    vi.mock('three/examples/jsm/loaders/GLTFLoader', () => ({
      GLTFLoader: vi.fn(() => ({
        load: vi.fn((path, onSuccess) => {
          onSuccess({
            scene: mockModel,
            animations: []
          });
        }),
        setDRACOLoader: vi.fn()
      }))
    }));

    const result = await loadGLBFile({
      input: { path: '/test.glb' }
    });

    expect(result.model).toBeDefined();
  });

  it('should reject with error if bone count is invalid', async () => {
    const mockModel = new THREE.Group();
    // Only 100 bones instead of 484
    Array.from({ length: 100 }, () => {
      const bone = new THREE.Bone();
      mockModel.add(bone);
    });

    await expect(
      loadGLBFile({ input: { path: '/test.glb' } })
    ).rejects.toThrow('Invalid bone count: 100 (expected 484)');
  });

  it('should call onProgress callback during loading', async () => {
    const onProgress = vi.fn();

    await loadGLBFile({
      input: {
        path: '/test.glb',
        onProgress
      }
    });

    expect(onProgress).toHaveBeenCalled();
  });
});
```

---

### **3. Testing Utilities**

**Test Utilities (easingFunctions.test.ts)** :
```typescript
import { describe, it, expect } from 'vitest';
import { easingFunctions } from './easingFunctions';

describe('easingFunctions', () => {
  describe('linear', () => {
    it('should return input value unchanged', () => {
      expect(easingFunctions.linear(0)).toBe(0);
      expect(easingFunctions.linear(0.5)).toBe(0.5);
      expect(easingFunctions.linear(1)).toBe(1);
    });
  });

  describe('easeInQuad', () => {
    it('should apply quadratic easing', () => {
      expect(easingFunctions.easeInQuad(0)).toBe(0);
      expect(easingFunctions.easeInQuad(0.5)).toBe(0.25);
      expect(easingFunctions.easeInQuad(1)).toBe(1);
    });
  });

  describe('easeOutQuad', () => {
    it('should apply ease-out quadratic', () => {
      expect(easingFunctions.easeOutQuad(0)).toBe(0);
      expect(easingFunctions.easeOutQuad(1)).toBe(1);
    });
  });
});
```

---

## 🔗 INTEGRATION TESTS (React Testing Library)

### **1. Testing Hooks**

**Test Hook (useBloomColorPicker.test.ts)** :
```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBloomColorPicker } from './useBloomColorPicker';

describe('useBloomColorPicker', () => {
  const mockSecurityManager = {
    setCustomColor: vi.fn()
  };

  it('should initialize with default color', () => {
    const { result } = renderHook(() =>
      useBloomColorPicker({
        securityManager: mockSecurityManager,
        initialColor: 0xffffff
      })
    );

    expect(result.current.color).toBe('#ffffff');
    expect(result.current.selectedColor).toBe(0xffffff);
  });

  it('should update color on handleColorChange', () => {
    const { result } = renderHook(() =>
      useBloomColorPicker({ securityManager: mockSecurityManager })
    );

    act(() => {
      result.current.handleColorChange('#ff0000');
    });

    expect(result.current.color).toBe('#ff0000');
    expect(result.current.selectedColor).toBe(0xff0000);
  });

  it('should apply color after debounce', async () => {
    const { result } = renderHook(() =>
      useBloomColorPicker({ securityManager: mockSecurityManager })
    );

    act(() => {
      result.current.handleColorChange('#00ff00');
      result.current.applyColor();
    });

    await waitFor(() => {
      expect(mockSecurityManager.setCustomColor).toHaveBeenCalledWith(0x00ff00);
    });
  });

  it('should reset to previous color', () => {
    const { result } = renderHook(() =>
      useBloomColorPicker({
        securityManager: mockSecurityManager,
        initialColor: 0xffffff
      })
    );

    act(() => {
      result.current.handleColorChange('#ff0000');
    });

    expect(result.current.color).toBe('#ff0000');

    act(() => {
      result.current.resetColor();
    });

    expect(result.current.color).toBe('#ffffff');
  });
});
```

---

### **2. Testing Components**

**Test Component (BloomColorPicker.test.tsx)** :
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BloomColorPicker } from './BloomColorPicker';

describe('BloomColorPicker', () => {
  const mockSecurityManager = {
    setCustomColor: vi.fn()
  };

  it('should render color input', () => {
    render(<BloomColorPicker securityManager={mockSecurityManager} />);

    const input = screen.getByRole('textbox', { name: /color/i });
    expect(input).toBeInTheDocument();
  });

  it('should render apply button', () => {
    render(<BloomColorPicker securityManager={mockSecurityManager} />);

    const button = screen.getByRole('button', { name: /apply/i });
    expect(button).toBeInTheDocument();
  });

  it('should update color on input change', () => {
    render(<BloomColorPicker securityManager={mockSecurityManager} />);

    const input = screen.getByRole('textbox', { name: /color/i });
    fireEvent.change(input, { target: { value: '#ff0000' } });

    expect(input).toHaveValue('#ff0000');
  });

  it('should apply color on button click', async () => {
    render(<BloomColorPicker securityManager={mockSecurityManager} />);

    const input = screen.getByRole('textbox', { name: /color/i });
    const button = screen.getByRole('button', { name: /apply/i });

    fireEvent.change(input, { target: { value: '#ff0000' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSecurityManager.setCustomColor).toHaveBeenCalledWith(0xff0000);
    });
  });

  it('should disable button while applying', async () => {
    render(<BloomColorPicker securityManager={mockSecurityManager} />);

    const button = screen.getByRole('button', { name: /apply/i });

    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByText(/applying/i)).toBeInTheDocument();
  });

  it('should call onApplyColor callback', async () => {
    const onApplyColor = vi.fn();

    render(
      <BloomColorPicker
        securityManager={mockSecurityManager}
        onApplyColor={onApplyColor}
      />
    );

    const input = screen.getByRole('textbox', { name: /color/i });
    const button = screen.getByRole('button', { name: /apply/i });

    fireEvent.change(input, { target: { value: '#00ff00' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(onApplyColor).toHaveBeenCalledWith(0x00ff00);
    });
  });
});
```

---

### **3. Testing with Context**

**Test with Provider (useOvermindContext.test.tsx)** :
```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { OvermindProvider, useOvermindContext } from './OvermindContext';

describe('useOvermindContext', () => {
  it('should throw error if used outside provider', () => {
    expect(() => {
      renderHook(() => useOvermindContext());
    }).toThrow('useOvermindContext must be used within OvermindProvider');
  });

  it('should return context value when used inside provider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <OvermindProvider>{children}</OvermindProvider>
    );

    const { result } = renderHook(() => useOvermindContext(), { wrapper });

    expect(result.current.appActorRef).toBeDefined();
    expect(result.current.scene).toBeDefined();
  });
});
```

---

## 🌐 E2E TESTS (Playwright)

### **Configuration (playwright.config.ts)** :
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

---

### **E2E Test (bloomColorPicker.spec.ts)** :
```typescript
import { test, expect } from '@playwright/test';

test.describe('Bloom Color Picker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
  });

  test('should load app successfully', async ({ page }) => {
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('should open color picker', async ({ page }) => {
    await page.click('[data-testid="bloom-color-picker-toggle"]');
    await expect(page.locator('[data-testid="color-picker-panel"]')).toBeVisible();
  });

  test('should change color', async ({ page }) => {
    await page.click('[data-testid="bloom-color-picker-toggle"]');
    await page.fill('[data-testid="color-input"]', '#ff0000');

    await expect(page.locator('[data-testid="color-input"]')).toHaveValue('#ff0000');
  });

  test('should apply color', async ({ page }) => {
    await page.click('[data-testid="bloom-color-picker-toggle"]');
    await page.fill('[data-testid="color-input"]', '#ff0000');
    await page.click('[data-testid="apply-color-button"]');

    // Wait for color to be applied
    await page.waitForTimeout(300);

    await expect(page.locator('[data-testid="current-color"]')).toHaveText('#ff0000');
  });

  test('should reset color', async ({ page }) => {
    await page.click('[data-testid="bloom-color-picker-toggle"]');
    await page.fill('[data-testid="color-input"]', '#ff0000');
    await page.click('[data-testid="apply-color-button"]');
    await page.click('[data-testid="reset-color-button"]');

    await expect(page.locator('[data-testid="color-input"]')).toHaveValue('#ffffff');
  });
});
```

---

### **Critical User Flows E2E** :
```typescript
// e2e/critical-flows.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test('Flow 1: Load app → Change color → Apply', async ({ page }) => {
    // 1. Load app
    await page.goto('/');
    await page.waitForSelector('canvas');

    // 2. Open color picker
    await page.click('[data-testid="bloom-color-picker-toggle"]');

    // 3. Change color
    await page.fill('[data-testid="color-input"]', '#ff0000');

    // 4. Apply color
    await page.click('[data-testid="apply-color-button"]');

    // 5. Verify applied
    await expect(page.locator('[data-testid="current-color"]')).toHaveText('#ff0000');
  });

  test('Flow 2: Load app → Play animation → Verify FPS', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');

    // Open debug panel
    await page.click('[data-testid="debug-panel-toggle"]');

    // Select animation
    await page.selectOption('[data-testid="animation-select"]', 'REVEAL_1');

    // Play animation
    await page.click('[data-testid="play-animation-button"]');

    // Wait for animation
    await page.waitForTimeout(1000);

    // Check FPS >= 50
    const fpsText = await page.locator('[data-testid="fps-display"]').textContent();
    const fps = parseInt(fpsText || '0');
    expect(fps).toBeGreaterThanOrEqual(50);
  });
});
```

---

## 📸 VISUAL REGRESSION TESTS

### **Configuration (Playwright + Percy)** :
```typescript
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Visual Regression', () => {
  test('Homepage snapshot', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');
    await percySnapshot(page, 'Homepage');
  });

  test('Color picker open', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="bloom-color-picker-toggle"]');
    await percySnapshot(page, 'Color Picker Open');
  });

  test('Debug panel', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="debug-panel-toggle"]');
    await percySnapshot(page, 'Debug Panel');
  });
});
```

---

## 🎭 MOCK STRATEGIES

### **1. Mock Three.js**

```typescript
// src/test/mocks/three.ts
import { vi } from 'vitest';

export const mockScene = {
  add: vi.fn(),
  remove: vi.fn(),
  traverse: vi.fn()
};

export const mockRenderer = {
  render: vi.fn(),
  setSize: vi.fn(),
  dispose: vi.fn()
};

export const mockCamera = {
  position: { set: vi.fn() },
  updateProjectionMatrix: vi.fn()
};

vi.mock('three', () => ({
  Scene: vi.fn(() => mockScene),
  WebGLRenderer: vi.fn(() => mockRenderer),
  PerspectiveCamera: vi.fn(() => mockCamera)
}));
```

---

### **2. Mock XState Actors**

```typescript
// src/test/mocks/actors.ts
import { vi } from 'vitest';

export const mockActorRef = {
  send: vi.fn(),
  subscribe: vi.fn(),
  getSnapshot: vi.fn(() => ({
    value: 'idle',
    context: {}
  }))
};

export const mockUseActorRef = vi.fn(() => mockActorRef);
```

---

## ✅ CHECKLIST TESTING ARCHITECTURE

- [ ] Vitest configuration (coverage, globals)
- [ ] Unit tests machines XState (30 tests)
- [ ] Unit tests services fromPromise (13 tests)
- [ ] Unit tests utilities
- [ ] Integration tests hooks (10 tests)
- [ ] Integration tests components (10 tests)
- [ ] E2E tests Playwright (5 critical flows)
- [ ] Visual regression tests (Percy)
- [ ] Mock strategies (Three.js, actors)
- [ ] Test coverage ≥ 80%
- [ ] CI/CD integration (GitHub Actions)
- [ ] Test documentation

---

**Prochaine** : F09 Deployment Architecture

