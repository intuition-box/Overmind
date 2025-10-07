// xstate-v5/tests/unit/colorConversion.test.ts
import { describe, it, expect } from 'vitest';
import { htmlToHex, hexToHtml } from '../../utils/colorConversion';

describe('colorConversion', () => {
  describe('htmlToHex', () => {
    it('converts HTML color to hex number', () => {
      expect(htmlToHex('#FF5733')).toBe(16733011);
      expect(htmlToHex('#000000')).toBe(0);
      expect(htmlToHex('#FFFFFF')).toBe(16777215);
    });
  });

  describe('hexToHtml', () => {
    it('converts hex number to HTML color', () => {
      expect(hexToHtml(16733011)).toBe('#ff5733');
      expect(hexToHtml(0)).toBe('#000000');
      expect(hexToHtml(16777215)).toBe('#ffffff');
    });
  });

  describe('round-trip conversion', () => {
    it('converts back and forth correctly', () => {
      const original = '#ff5733';
      const hex = htmlToHex(original);
      const back = hexToHtml(hex);
      expect(back).toBe(original);
    });
  });
});
