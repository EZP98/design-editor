/**
 * Responsive Breakpoints System
 *
 * Manages responsive design with breakpoints and per-breakpoint style overrides.
 * Similar to Plasmic's responsive variants and Figma's responsive components.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ElementStyles } from './types';

// ==========================================
// BREAKPOINT TYPES
// ==========================================

export interface Breakpoint {
  id: string;
  name: string;
  width: number;
  height: number;
  icon: 'desktop' | 'tablet' | 'mobile';
  minWidth?: number; // For CSS media query
  maxWidth?: number;
  isDefault?: boolean; // The base breakpoint (usually desktop)
}

export interface ResponsiveStyles {
  // Map of breakpoint ID to style overrides
  [breakpointId: string]: Partial<ElementStyles> & {
    // Position overrides
    position?: { x: number; y: number };
    // Size overrides
    size?: { width: number | 'auto' | 'fill'; height: number | 'auto' | 'fill' };
    // Visibility
    visible?: boolean;
  };
}

// ==========================================
// DEFAULT BREAKPOINTS
// ==========================================

export const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  {
    id: 'desktop',
    name: 'Desktop',
    width: 1440,
    height: 900,
    icon: 'desktop',
    minWidth: 1024,
    isDefault: true,
  },
  {
    id: 'tablet',
    name: 'Tablet',
    width: 768,
    height: 1024,
    icon: 'tablet',
    minWidth: 768,
    maxWidth: 1023,
  },
  {
    id: 'mobile',
    name: 'Mobile',
    width: 375,
    height: 812,
    icon: 'mobile',
    maxWidth: 767,
  },
];

// Device presets for quick selection
export const DEVICE_PRESETS = {
  desktop: [
    { id: 'desktop-lg', name: 'Desktop Large', width: 1920, height: 1080 },
    { id: 'desktop-md', name: 'Desktop', width: 1440, height: 900 },
    { id: 'desktop-sm', name: 'Desktop Small', width: 1280, height: 800 },
    { id: 'macbook-pro', name: 'MacBook Pro 14"', width: 1512, height: 982 },
    { id: 'macbook-air', name: 'MacBook Air', width: 1470, height: 956 },
  ],
  tablet: [
    { id: 'ipad-pro-13', name: 'iPad Pro 13"', width: 1032, height: 1376 },
    { id: 'ipad-pro-11', name: 'iPad Pro 11"', width: 834, height: 1194 },
    { id: 'ipad-air', name: 'iPad Air', width: 820, height: 1180 },
    { id: 'ipad', name: 'iPad', width: 810, height: 1080 },
    { id: 'ipad-mini', name: 'iPad Mini', width: 744, height: 1133 },
  ],
  mobile: [
    { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', width: 430, height: 932 },
    { id: 'iphone-15-pro', name: 'iPhone 15 Pro', width: 393, height: 852 },
    { id: 'iphone-15', name: 'iPhone 15', width: 393, height: 852 },
    { id: 'iphone-se', name: 'iPhone SE', width: 375, height: 667 },
    { id: 'pixel-8', name: 'Pixel 8', width: 412, height: 915 },
    { id: 'galaxy-s24', name: 'Galaxy S24', width: 360, height: 780 },
  ],
};

// ==========================================
// RESPONSIVE STORE
// ==========================================

interface ResponsiveStore {
  breakpoints: Breakpoint[];
  activeBreakpointId: string;
  previewMode: boolean; // When true, show responsive preview
  multiBreakpointView: boolean; // When true, show all breakpoints side by side (like Figma Sites)

  // Breakpoint actions
  setActiveBreakpoint: (id: string) => void;
  addBreakpoint: (breakpoint: Omit<Breakpoint, 'id'>) => string;
  updateBreakpoint: (id: string, updates: Partial<Breakpoint>) => void;
  deleteBreakpoint: (id: string) => void;
  reorderBreakpoints: (breakpointIds: string[]) => void;

  // Preview mode
  setPreviewMode: (enabled: boolean) => void;
  togglePreviewMode: () => void;

  // Multi-breakpoint view (Figma Sites style)
  setMultiBreakpointView: (enabled: boolean) => void;
  toggleMultiBreakpointView: () => void;

  // Helpers
  getActiveBreakpoint: () => Breakpoint;
  getBreakpointById: (id: string) => Breakpoint | undefined;
  getDefaultBreakpoint: () => Breakpoint;

  // Reset
  resetToDefaults: () => void;
}

const generateId = () => `bp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useResponsiveStore = create<ResponsiveStore>()(
  persist(
    (set, get) => ({
      breakpoints: DEFAULT_BREAKPOINTS,
      activeBreakpointId: 'desktop',
      previewMode: false,
      multiBreakpointView: false,

      setActiveBreakpoint: (id) => {
        set({ activeBreakpointId: id });
      },

      addBreakpoint: (breakpoint) => {
        const id = generateId();
        set((state) => ({
          breakpoints: [...state.breakpoints, { ...breakpoint, id }],
        }));
        return id;
      },

      updateBreakpoint: (id, updates) => {
        set((state) => ({
          breakpoints: state.breakpoints.map((bp) =>
            bp.id === id ? { ...bp, ...updates } : bp
          ),
        }));
      },

      deleteBreakpoint: (id) => {
        const state = get();
        // Can't delete the default breakpoint
        const bp = state.breakpoints.find((b) => b.id === id);
        if (bp?.isDefault) return;

        set((state) => ({
          breakpoints: state.breakpoints.filter((bp) => bp.id !== id),
          // If we deleted the active breakpoint, switch to default
          activeBreakpointId:
            state.activeBreakpointId === id
              ? state.breakpoints.find((b) => b.isDefault)?.id || 'desktop'
              : state.activeBreakpointId,
        }));
      },

      reorderBreakpoints: (breakpointIds) => {
        set((state) => ({
          breakpoints: breakpointIds
            .map((id) => state.breakpoints.find((bp) => bp.id === id))
            .filter(Boolean) as Breakpoint[],
        }));
      },

      setPreviewMode: (enabled) => {
        set({ previewMode: enabled });
      },

      togglePreviewMode: () => {
        set((state) => ({ previewMode: !state.previewMode }));
      },

      setMultiBreakpointView: (enabled) => {
        set({ multiBreakpointView: enabled });
      },

      toggleMultiBreakpointView: () => {
        set((state) => ({ multiBreakpointView: !state.multiBreakpointView }));
      },

      getActiveBreakpoint: () => {
        const state = get();
        return (
          state.breakpoints.find((bp) => bp.id === state.activeBreakpointId) ||
          state.breakpoints[0]
        );
      },

      getBreakpointById: (id) => {
        return get().breakpoints.find((bp) => bp.id === id);
      },

      getDefaultBreakpoint: () => {
        const state = get();
        return state.breakpoints.find((bp) => bp.isDefault) || state.breakpoints[0];
      },

      resetToDefaults: () => {
        set({
          breakpoints: DEFAULT_BREAKPOINTS,
          activeBreakpointId: 'desktop',
          previewMode: false,
          multiBreakpointView: false,
        });
      },
    }),
    {
      name: 'objects-responsive-settings',
    }
  )
);

// ==========================================
// RESPONSIVE STYLE UTILITIES
// ==========================================

/**
 * Merge base styles with responsive overrides for a specific breakpoint
 */
export function getStylesForBreakpoint(
  baseStyles: ElementStyles,
  responsiveStyles: ResponsiveStyles | undefined,
  breakpointId: string
): ElementStyles {
  if (!responsiveStyles || !responsiveStyles[breakpointId]) {
    return baseStyles;
  }

  const overrides = responsiveStyles[breakpointId];
  // Remove position, size, visible as they're handled separately
  const { position, size, visible, ...styleOverrides } = overrides;

  return {
    ...baseStyles,
    ...styleOverrides,
  };
}

/**
 * Generate CSS media queries for responsive styles
 */
export function generateMediaQueries(
  breakpoints: Breakpoint[],
  responsiveStyles: ResponsiveStyles
): string {
  let css = '';

  // Sort breakpoints by width (descending for mobile-first approach)
  const sortedBreakpoints = [...breakpoints].sort((a, b) => (b.minWidth || 0) - (a.minWidth || 0));

  for (const bp of sortedBreakpoints) {
    const styles = responsiveStyles[bp.id];
    if (!styles || bp.isDefault) continue;

    const conditions: string[] = [];
    if (bp.minWidth) conditions.push(`(min-width: ${bp.minWidth}px)`);
    if (bp.maxWidth) conditions.push(`(max-width: ${bp.maxWidth}px)`);

    if (conditions.length > 0) {
      css += `@media ${conditions.join(' and ')} {\n`;
      css += `  /* ${bp.name} styles */\n`;
      // Add style properties here
      css += `}\n\n`;
    }
  }

  return css;
}

/**
 * Check if current viewport matches a breakpoint
 */
export function matchesBreakpoint(breakpoint: Breakpoint, viewportWidth: number): boolean {
  if (breakpoint.minWidth && viewportWidth < breakpoint.minWidth) return false;
  if (breakpoint.maxWidth && viewportWidth > breakpoint.maxWidth) return false;
  return true;
}

/**
 * Find the best matching breakpoint for a viewport width
 */
export function findMatchingBreakpoint(
  breakpoints: Breakpoint[],
  viewportWidth: number
): Breakpoint {
  // Sort by minWidth descending to find the most specific match
  const sorted = [...breakpoints].sort((a, b) => (b.minWidth || 0) - (a.minWidth || 0));

  for (const bp of sorted) {
    if (matchesBreakpoint(bp, viewportWidth)) {
      return bp;
    }
  }

  // Fallback to default
  return breakpoints.find((bp) => bp.isDefault) || breakpoints[0];
}
