/**
 * Design Tokens System
 *
 * Centralized design system for colors, typography, spacing, and effects.
 * Similar to Figma's design tokens and Plasmic's global variants.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==========================================
// TOKEN TYPES
// ==========================================

export interface ColorToken {
  id: string;
  name: string;
  value: string; // hex color
  description?: string;
  group?: string; // e.g., 'primary', 'neutral', 'semantic'
}

export interface TypographyToken {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  description?: string;
}

export interface SpacingToken {
  id: string;
  name: string;
  value: number; // in pixels
  description?: string;
}

export interface ShadowToken {
  id: string;
  name: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  description?: string;
}

export interface RadiusToken {
  id: string;
  name: string;
  value: number;
  description?: string;
}

export interface DesignTokens {
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  shadows: ShadowToken[];
  radii: RadiusToken[];
}

// ==========================================
// DEFAULT TOKENS
// ==========================================

const DEFAULT_COLORS: ColorToken[] = [
  // Brand
  { id: 'brand-primary', name: 'Primary', value: '#8B5CF6', group: 'brand' },
  { id: 'brand-secondary', name: 'Secondary', value: '#A78BFA', group: 'brand' },
  { id: 'brand-accent', name: 'Accent', value: '#C94C5C', group: 'brand' },

  // Neutral
  { id: 'neutral-900', name: 'Gray 900', value: '#18181b', group: 'neutral' },
  { id: 'neutral-800', name: 'Gray 800', value: '#27272a', group: 'neutral' },
  { id: 'neutral-700', name: 'Gray 700', value: '#3f3f46', group: 'neutral' },
  { id: 'neutral-600', name: 'Gray 600', value: '#52525b', group: 'neutral' },
  { id: 'neutral-500', name: 'Gray 500', value: '#71717a', group: 'neutral' },
  { id: 'neutral-400', name: 'Gray 400', value: '#a1a1aa', group: 'neutral' },
  { id: 'neutral-300', name: 'Gray 300', value: '#d4d4d8', group: 'neutral' },
  { id: 'neutral-200', name: 'Gray 200', value: '#e4e4e7', group: 'neutral' },
  { id: 'neutral-100', name: 'Gray 100', value: '#f4f4f5', group: 'neutral' },
  { id: 'neutral-50', name: 'Gray 50', value: '#fafafa', group: 'neutral' },

  // Semantic
  { id: 'semantic-success', name: 'Success', value: '#22c55e', group: 'semantic' },
  { id: 'semantic-warning', name: 'Warning', value: '#f59e0b', group: 'semantic' },
  { id: 'semantic-error', name: 'Error', value: '#ef4444', group: 'semantic' },
  { id: 'semantic-info', name: 'Info', value: '#3b82f6', group: 'semantic' },

  // Base
  { id: 'base-white', name: 'White', value: '#ffffff', group: 'base' },
  { id: 'base-black', name: 'Black', value: '#000000', group: 'base' },
];

const DEFAULT_TYPOGRAPHY: TypographyToken[] = [
  { id: 'heading-xl', name: 'Heading XL', fontFamily: 'Inter', fontSize: 48, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.02 },
  { id: 'heading-lg', name: 'Heading Large', fontFamily: 'Inter', fontSize: 36, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.02 },
  { id: 'heading-md', name: 'Heading Medium', fontFamily: 'Inter', fontSize: 24, fontWeight: 600, lineHeight: 1.3, letterSpacing: -0.01 },
  { id: 'heading-sm', name: 'Heading Small', fontFamily: 'Inter', fontSize: 20, fontWeight: 600, lineHeight: 1.4, letterSpacing: -0.01 },
  { id: 'body-lg', name: 'Body Large', fontFamily: 'Inter', fontSize: 18, fontWeight: 400, lineHeight: 1.6, letterSpacing: 0 },
  { id: 'body-md', name: 'Body Medium', fontFamily: 'Inter', fontSize: 16, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
  { id: 'body-sm', name: 'Body Small', fontFamily: 'Inter', fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
  { id: 'caption', name: 'Caption', fontFamily: 'Inter', fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.01 },
  { id: 'label', name: 'Label', fontFamily: 'Inter', fontSize: 14, fontWeight: 500, lineHeight: 1.4, letterSpacing: 0.01 },
  { id: 'button', name: 'Button', fontFamily: 'Inter', fontSize: 14, fontWeight: 600, lineHeight: 1, letterSpacing: 0.01 },
];

const DEFAULT_SPACING: SpacingToken[] = [
  { id: 'space-0', name: 'None', value: 0 },
  { id: 'space-1', name: 'XXS', value: 4 },
  { id: 'space-2', name: 'XS', value: 8 },
  { id: 'space-3', name: 'SM', value: 12 },
  { id: 'space-4', name: 'MD', value: 16 },
  { id: 'space-5', name: 'LG', value: 20 },
  { id: 'space-6', name: 'XL', value: 24 },
  { id: 'space-8', name: '2XL', value: 32 },
  { id: 'space-10', name: '3XL', value: 40 },
  { id: 'space-12', name: '4XL', value: 48 },
  { id: 'space-16', name: '5XL', value: 64 },
  { id: 'space-20', name: '6XL', value: 80 },
];

const DEFAULT_SHADOWS: ShadowToken[] = [
  { id: 'shadow-sm', name: 'Small', x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.05)' },
  { id: 'shadow-md', name: 'Medium', x: 0, y: 4, blur: 6, spread: -1, color: 'rgba(0,0,0,0.1)' },
  { id: 'shadow-lg', name: 'Large', x: 0, y: 10, blur: 15, spread: -3, color: 'rgba(0,0,0,0.1)' },
  { id: 'shadow-xl', name: 'XL', x: 0, y: 20, blur: 25, spread: -5, color: 'rgba(0,0,0,0.1)' },
  { id: 'shadow-2xl', name: '2XL', x: 0, y: 25, blur: 50, spread: -12, color: 'rgba(0,0,0,0.25)' },
  { id: 'shadow-inner', name: 'Inner', x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.06)' },
];

const DEFAULT_RADII: RadiusToken[] = [
  { id: 'radius-none', name: 'None', value: 0 },
  { id: 'radius-sm', name: 'Small', value: 4 },
  { id: 'radius-md', name: 'Medium', value: 8 },
  { id: 'radius-lg', name: 'Large', value: 12 },
  { id: 'radius-xl', name: 'XL', value: 16 },
  { id: 'radius-2xl', name: '2XL', value: 24 },
  { id: 'radius-full', name: 'Full', value: 9999 },
];

// ==========================================
// TOKENS STORE
// ==========================================

interface TokensStore {
  tokens: DesignTokens;

  // Color actions
  addColor: (color: Omit<ColorToken, 'id'>) => string;
  updateColor: (id: string, updates: Partial<ColorToken>) => void;
  deleteColor: (id: string) => void;

  // Typography actions
  addTypography: (typography: Omit<TypographyToken, 'id'>) => string;
  updateTypography: (id: string, updates: Partial<TypographyToken>) => void;
  deleteTypography: (id: string) => void;

  // Spacing actions
  addSpacing: (spacing: Omit<SpacingToken, 'id'>) => string;
  updateSpacing: (id: string, updates: Partial<SpacingToken>) => void;
  deleteSpacing: (id: string) => void;

  // Shadow actions
  addShadow: (shadow: Omit<ShadowToken, 'id'>) => string;
  updateShadow: (id: string, updates: Partial<ShadowToken>) => void;
  deleteShadow: (id: string) => void;

  // Radius actions
  addRadius: (radius: Omit<RadiusToken, 'id'>) => string;
  updateRadius: (id: string, updates: Partial<RadiusToken>) => void;
  deleteRadius: (id: string) => void;

  // Reset to defaults
  resetToDefaults: () => void;

  // Helpers
  getColorById: (id: string) => ColorToken | undefined;
  getTypographyById: (id: string) => TypographyToken | undefined;
  getShadowCss: (id: string) => string;
}

const generateId = () => `token-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useTokensStore = create<TokensStore>()(
  persist(
    (set, get) => ({
      tokens: {
        colors: DEFAULT_COLORS,
        typography: DEFAULT_TYPOGRAPHY,
        spacing: DEFAULT_SPACING,
        shadows: DEFAULT_SHADOWS,
        radii: DEFAULT_RADII,
      },

      // Color actions
      addColor: (color) => {
        const id = generateId();
        set((state) => ({
          tokens: {
            ...state.tokens,
            colors: [...state.tokens.colors, { ...color, id }],
          },
        }));
        return id;
      },

      updateColor: (id, updates) => {
        set((state) => ({
          tokens: {
            ...state.tokens,
            colors: state.tokens.colors.map((c) =>
              c.id === id ? { ...c, ...updates } : c
            ),
          },
        }));
      },

      deleteColor: (id) => {
        set((state) => ({
          tokens: {
            ...state.tokens,
            colors: state.tokens.colors.filter((c) => c.id !== id),
          },
        }));
      },

      // Typography actions
      addTypography: (typography) => {
        const id = generateId();
        set((state) => ({
          tokens: {
            ...state.tokens,
            typography: [...state.tokens.typography, { ...typography, id }],
          },
        }));
        return id;
      },

      updateTypography: (id, updates) => {
        set((state) => ({
          tokens: {
            ...state.tokens,
            typography: state.tokens.typography.map((t) =>
              t.id === id ? { ...t, ...updates } : t
            ),
          },
        }));
      },

      deleteTypography: (id) => {
        set((state) => ({
          tokens: {
            ...state.tokens,
            typography: state.tokens.typography.filter((t) => t.id !== id),
          },
        }));
      },

      // Spacing actions
      addSpacing: (spacing) => {
        const id = generateId();
        set((state) => ({
          tokens: {
            ...state.tokens,
            spacing: [...state.tokens.spacing, { ...spacing, id }],
          },
        }));
        return id;
      },

      updateSpacing: (id, updates) => {
        set((state) => ({
          tokens: {
            ...state.tokens,
            spacing: state.tokens.spacing.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
          },
        }));
      },

      deleteSpacing: (id) => {
        set((state) => ({
          tokens: {
            ...state.tokens,
            spacing: state.tokens.spacing.filter((s) => s.id !== id),
          },
        }));
      },

      // Shadow actions
      addShadow: (shadow) => {
        const id = generateId();
        set((state) => ({
          tokens: {
            ...state.tokens,
            shadows: [...state.tokens.shadows, { ...shadow, id }],
          },
        }));
        return id;
      },

      updateShadow: (id, updates) => {
        set((state) => ({
          tokens: {
            ...state.tokens,
            shadows: state.tokens.shadows.map((s) =>
              s.id === id ? { ...s, ...updates } : s
            ),
          },
        }));
      },

      deleteShadow: (id) => {
        set((state) => ({
          tokens: {
            ...state.tokens,
            shadows: state.tokens.shadows.filter((s) => s.id !== id),
          },
        }));
      },

      // Radius actions
      addRadius: (radius) => {
        const id = generateId();
        set((state) => ({
          tokens: {
            ...state.tokens,
            radii: [...state.tokens.radii, { ...radius, id }],
          },
        }));
        return id;
      },

      updateRadius: (id, updates) => {
        set((state) => ({
          tokens: {
            ...state.tokens,
            radii: state.tokens.radii.map((r) =>
              r.id === id ? { ...r, ...updates } : r
            ),
          },
        }));
      },

      deleteRadius: (id) => {
        set((state) => ({
          tokens: {
            ...state.tokens,
            radii: state.tokens.radii.filter((r) => r.id !== id),
          },
        }));
      },

      // Reset
      resetToDefaults: () => {
        set({
          tokens: {
            colors: DEFAULT_COLORS,
            typography: DEFAULT_TYPOGRAPHY,
            spacing: DEFAULT_SPACING,
            shadows: DEFAULT_SHADOWS,
            radii: DEFAULT_RADII,
          },
        });
      },

      // Helpers
      getColorById: (id) => {
        return get().tokens.colors.find((c) => c.id === id);
      },

      getTypographyById: (id) => {
        return get().tokens.typography.find((t) => t.id === id);
      },

      getShadowCss: (id) => {
        const shadow = get().tokens.shadows.find((s) => s.id === id);
        if (!shadow) return 'none';
        return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
      },
    }),
    {
      name: 'objects-design-tokens',
    }
  )
);

// ==========================================
// TOKEN REFERENCE UTILITIES
// ==========================================

// Check if a value is a token reference (e.g., "{{colors.brand-primary}}")
export function isTokenReference(value: string): boolean {
  return /^\{\{[\w.-]+\}\}$/.test(value);
}

// Parse token reference to get category and id
export function parseTokenReference(ref: string): { category: string; id: string } | null {
  const match = ref.match(/^\{\{(\w+)\.(.+)\}\}$/);
  if (!match) return null;
  return { category: match[1], id: match[2] };
}

// Create a token reference string
export function createTokenReference(category: string, id: string): string {
  return `{{${category}.${id}}}`;
}

// Resolve a token reference to its actual value
export function resolveTokenValue(ref: string, tokens: DesignTokens): string | number | null {
  const parsed = parseTokenReference(ref);
  if (!parsed) return null;

  const { category, id } = parsed;

  switch (category) {
    case 'colors': {
      const color = tokens.colors.find((c) => c.id === id);
      return color?.value ?? null;
    }
    case 'spacing': {
      const space = tokens.spacing.find((s) => s.id === id);
      return space?.value ?? null;
    }
    case 'radii': {
      const radius = tokens.radii.find((r) => r.id === id);
      return radius?.value ?? null;
    }
    case 'shadows': {
      const shadow = tokens.shadows.find((s) => s.id === id);
      if (!shadow) return null;
      return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
    }
    default:
      return null;
  }
}
