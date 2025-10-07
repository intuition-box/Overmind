// xstate-v5/tests/unit/easingFunctions.test.ts
import { describe, it, expect } from 'vitest';
import { easeLinear, easeInOutCubic, easeInQuad, easeOutQuad } from '../../utils/easingFunctions';

describe('easingFunctions', () => {
  describe('easeLinear', () => {
    it('returns linear values', () => {
      expect(easeLinear(0)).toBe(0);
      expect(easeLinear(0.5)).toBe(0.5);
      expect(easeLinear(1)).toBe(1);
    });
  });

  describe('easeInOutCubic', () => {
    it('returns correct easing values', () => {
      expect(easeInOutCubic(0)).toBe(0);
      expect(easeInOutCubic(1)).toBe(1);
      expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 1);
    });
  });

  describe('easeInQuad', () => {
    it('returns quadratic easing', () => {
      expect(easeInQuad(0)).toBe(0);
      expect(easeInQuad(0.5)).toBe(0.25);
      expect(easeInQuad(1)).toBe(1);
    });
  });

  describe('easeOutQuad', () => {
    it('returns quadratic easing out', () => {
      expect(easeOutQuad(0)).toBe(0);
      expect(easeOutQuad(1)).toBe(1);
    });
  });
});
