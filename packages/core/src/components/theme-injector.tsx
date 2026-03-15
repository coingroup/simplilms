"use client";

import { useTenant } from "../context/tenant-context";

/**
 * Converts a hex color string to an HSL string (without the hsl() wrapper).
 * shadcn/ui CSS variables expect the format "H S% L%" (e.g., "18 89% 54%").
 */
function hexToHSL(hex: string): string {
  // Remove # prefix
  const h = hex.replace("#", "");

  // Parse RGB
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let hue = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        hue = ((b - r) / d + 2) / 6;
        break;
      case b:
        hue = ((r - g) / d + 4) / 6;
        break;
    }
  }

  const hDeg = Math.round(hue * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  return `${hDeg} ${sPct}% ${lPct}%`;
}

/**
 * Injects CSS custom properties based on the tenant's brand colors.
 * This overrides the default shadcn/ui CSS variables so all components
 * (buttons, badges, rings, etc.) automatically use the tenant's colors.
 *
 * Place this component inside the TenantProvider, typically in the root layout.
 */
export function ThemeInjector() {
  const tenant = useTenant();

  const primaryHSL = hexToHSL(tenant.primaryColor);

  // Generate a lighter version of primary for foreground text on primary bg
  const style = `
    :root {
      --primary: ${primaryHSL};
      --ring: ${primaryHSL};
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: style }} />;
}
