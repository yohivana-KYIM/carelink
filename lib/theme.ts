// Génère une palette de teintes (50 à 950) à partir d'une seule couleur de
// marque, pour surcharger les variables CSS --color-brand-* utilisées par
// toutes les classes Tailwind existantes (bg-brand-600, text-brand-700...).
// Ainsi, chaque cabinet peut personnaliser sa couleur sans toucher au code.

const SHADE_LIGHTNESS: Record<string, number> = {
  "50": 95,
  "100": 90,
  "200": 80,
  "300": 68,
  "400": 55,
  "500": 44,
  "600": 37,
  "700": 30,
  "800": 24,
  "900": 19,
  "950": 12,
};

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const match = /^#?([a-f\d]{6}|[a-f\d]{3})$/i.exec(hex.trim());
  if (!match) return null;
  let normalized = match[1];
  if (normalized.length === 3) {
    normalized = normalized.split("").map((c) => c + c).join("");
  }
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let [r, g, b] = [0, 0, 0];

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function generateBrandPalette(hex: string): Record<string, string> | null {
  const hsl = hexToHsl(hex);
  if (!hsl) return null;

  const palette: Record<string, string> = {};
  for (const [shade, lightness] of Object.entries(SHADE_LIGHTNESS)) {
    palette[shade] = hslToHex(hsl.h, Math.max(hsl.s, 35), lightness);
  }
  return palette;
}

export function applyBrandPalette(hex?: string | null) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  if (!hex) {
    for (const shade of Object.keys(SHADE_LIGHTNESS)) {
      root.style.removeProperty(`--color-brand-${shade}`);
    }
    return;
  }

  const palette = generateBrandPalette(hex);
  if (!palette) return;

  for (const [shade, color] of Object.entries(palette)) {
    root.style.setProperty(`--color-brand-${shade}`, color);
  }
}
