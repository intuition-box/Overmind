// xstate-v5/utils/colorConversion.ts

export function htmlToHex(htmlColor: string): number {
  const hex = htmlColor.replace('#', '');
  return parseInt(hex, 16);
}

export function hexToHtml(hexColor: number): string {
  const hex = hexColor.toString(16).padStart(6, '0');
  return `#${hex}`;
}
