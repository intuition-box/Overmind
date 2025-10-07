// xstate-v5/__tests__/setup.ts
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as THREE from 'three';

// Cleanup après chaque test
afterEach(() => {
  cleanup();
});

// Mock de requestAnimationFrame
beforeAll(() => {
  global.requestAnimationFrame = vi.fn((cb) => {
    setTimeout(cb, 16);
    return 1;
  }) as any;

  global.cancelAnimationFrame = vi.fn();
});

// Mock de Three.js WebGLRenderer
beforeAll(() => {
  vi.spyOn(THREE, 'WebGLRenderer').mockImplementation(() => ({
    render: vi.fn(),
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    dispose: vi.fn(),
    domElement: document.createElement('canvas')
  } as any));
});

// Nettoyage final
afterAll(() => {
  vi.restoreAllMocks();
});
