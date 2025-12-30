/**
 * Design System Tokens
 *
 * Variazioni per: colori, typography, spacing, forme, stili
 * Ispirato a Lovable (vibes) + v0 (semantic colors) + Bolt (art direction)
 */

// ============================================================================
// COLOR PALETTES - 8 palette diverse
// ============================================================================
export const COLOR_PALETTES = {
  // Dark & Moody
  'noir': {
    name: 'Noir',
    vibe: 'dark, sophisticated, mysterious',
    bg: '#0a0a0a',
    surface: '#141414',
    surfaceHover: '#1a1a1a',
    primary: '#ffffff',
    secondary: 'rgba(255,255,255,0.6)',
    muted: 'rgba(255,255,255,0.4)',
    accent: '#c9a962', // gold
    accentAlt: '#a855f7', // purple
    border: 'rgba(255,255,255,0.08)',
    borderStrong: 'rgba(255,255,255,0.15)',
  },

  // Minimal Light
  'paper': {
    name: 'Paper',
    vibe: 'clean, minimal, elegant',
    bg: '#ffffff',
    surface: '#fafafa',
    surfaceHover: '#f5f5f5',
    primary: '#0a0a0a',
    secondary: '#525252',
    muted: '#a3a3a3',
    accent: '#0a0a0a',
    accentAlt: '#3b82f6',
    border: 'rgba(0,0,0,0.06)',
    borderStrong: 'rgba(0,0,0,0.12)',
  },

  // Warm & Playful
  'candy': {
    name: 'Candy',
    vibe: 'playful, fun, colorful',
    bg: '#FFFBF5',
    surface: '#ffffff',
    surfaceHover: '#FFF5E6',
    primary: '#000000',
    secondary: '#525252',
    muted: '#737373',
    accent: '#FFC9F0', // pink
    accentAlt: '#9DDCFF', // blue
    accentYellow: '#FFE68C',
    border: '#000000',
    borderStrong: '#000000',
  },

  // Deep Purple Gradient
  'aurora': {
    name: 'Aurora',
    vibe: 'magical, gradient, vibrant',
    bg: '#0f0f1a',
    surface: 'rgba(255,255,255,0.05)',
    surfaceHover: 'rgba(255,255,255,0.08)',
    primary: '#ffffff',
    secondary: 'rgba(255,255,255,0.7)',
    muted: 'rgba(255,255,255,0.5)',
    accent: '#a855f7',
    accentAlt: '#3b82f6',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    gradientAlt: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    border: 'rgba(255,255,255,0.1)',
    borderStrong: 'rgba(255,255,255,0.2)',
  },

  // Corporate Blue
  'trust': {
    name: 'Trust',
    vibe: 'professional, corporate, reliable',
    bg: '#f8fafc',
    surface: '#ffffff',
    surfaceHover: '#f1f5f9',
    primary: '#0f172a',
    secondary: '#475569',
    muted: '#94a3b8',
    accent: '#2563eb',
    accentAlt: '#0891b2',
    border: '#e2e8f0',
    borderStrong: '#cbd5e1',
  },

  // Warm Earth
  'earth': {
    name: 'Earth',
    vibe: 'natural, warm, organic',
    bg: '#faf7f2',
    surface: '#ffffff',
    surfaceHover: '#f5f0e8',
    primary: '#292524',
    secondary: '#57534e',
    muted: '#a8a29e',
    accent: '#b45309',
    accentAlt: '#065f46',
    border: '#e7e5e4',
    borderStrong: '#d6d3d1',
  },

  // Neon Cyber
  'cyber': {
    name: 'Cyber',
    vibe: 'futuristic, neon, tech',
    bg: '#030712',
    surface: '#0f172a',
    surfaceHover: '#1e293b',
    primary: '#f0f9ff',
    secondary: '#94a3b8',
    muted: '#64748b',
    accent: '#22d3ee', // cyan
    accentAlt: '#a855f7', // purple
    accentPink: '#f472b6',
    border: 'rgba(34, 211, 238, 0.2)',
    borderStrong: 'rgba(34, 211, 238, 0.4)',
  },

  // Luxury Gold
  'luxury': {
    name: 'Luxury',
    vibe: 'premium, elegant, expensive',
    bg: '#0c0c0c',
    surface: '#171717',
    surfaceHover: '#1f1f1f',
    primary: '#fafafa',
    secondary: '#a3a3a3',
    muted: '#737373',
    accent: '#d4af37', // gold
    accentAlt: '#c9a962',
    border: 'rgba(212, 175, 55, 0.2)',
    borderStrong: 'rgba(212, 175, 55, 0.4)',
  },
} as const;

// ============================================================================
// TYPOGRAPHY SCALES - 4 scale diverse
// ============================================================================
export const TYPOGRAPHY_SCALES = {
  // Bold & Impactful
  'impact': {
    name: 'Impact',
    vibe: 'bold, powerful, statement',
    hero: { fontSize: 96, fontWeight: 800, letterSpacing: -4, lineHeight: 0.95 },
    h1: { fontSize: 72, fontWeight: 700, letterSpacing: -3, lineHeight: 1.0 },
    h2: { fontSize: 48, fontWeight: 700, letterSpacing: -2, lineHeight: 1.1 },
    h3: { fontSize: 32, fontWeight: 600, letterSpacing: -1, lineHeight: 1.2 },
    body: { fontSize: 18, fontWeight: 400, letterSpacing: 0, lineHeight: 1.6 },
    small: { fontSize: 14, fontWeight: 500, letterSpacing: 0, lineHeight: 1.5 },
    label: { fontSize: 12, fontWeight: 600, letterSpacing: 2, lineHeight: 1.4, textTransform: 'uppercase' },
  },

  // Elegant & Refined
  'elegant': {
    name: 'Elegant',
    vibe: 'sophisticated, refined, luxury',
    hero: { fontSize: 72, fontWeight: 300, letterSpacing: -2, lineHeight: 1.1 },
    h1: { fontSize: 56, fontWeight: 400, letterSpacing: -1, lineHeight: 1.15 },
    h2: { fontSize: 40, fontWeight: 400, letterSpacing: -0.5, lineHeight: 1.2 },
    h3: { fontSize: 28, fontWeight: 500, letterSpacing: 0, lineHeight: 1.3 },
    body: { fontSize: 17, fontWeight: 400, letterSpacing: 0.2, lineHeight: 1.7 },
    small: { fontSize: 14, fontWeight: 400, letterSpacing: 0.3, lineHeight: 1.6 },
    label: { fontSize: 11, fontWeight: 500, letterSpacing: 3, lineHeight: 1.4, textTransform: 'uppercase' },
  },

  // Modern & Clean
  'modern': {
    name: 'Modern',
    vibe: 'clean, contemporary, balanced',
    hero: { fontSize: 64, fontWeight: 600, letterSpacing: -2, lineHeight: 1.1 },
    h1: { fontSize: 48, fontWeight: 600, letterSpacing: -1, lineHeight: 1.15 },
    h2: { fontSize: 36, fontWeight: 600, letterSpacing: -0.5, lineHeight: 1.2 },
    h3: { fontSize: 24, fontWeight: 600, letterSpacing: 0, lineHeight: 1.3 },
    body: { fontSize: 16, fontWeight: 400, letterSpacing: 0, lineHeight: 1.6 },
    small: { fontSize: 14, fontWeight: 400, letterSpacing: 0, lineHeight: 1.5 },
    label: { fontSize: 12, fontWeight: 500, letterSpacing: 1, lineHeight: 1.4, textTransform: 'uppercase' },
  },

  // Playful & Rounded
  'playful': {
    name: 'Playful',
    vibe: 'fun, friendly, approachable',
    hero: { fontSize: 72, fontWeight: 700, letterSpacing: -1, lineHeight: 1.1 },
    h1: { fontSize: 56, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.15 },
    h2: { fontSize: 40, fontWeight: 700, letterSpacing: 0, lineHeight: 1.2 },
    h3: { fontSize: 28, fontWeight: 600, letterSpacing: 0, lineHeight: 1.3 },
    body: { fontSize: 18, fontWeight: 400, letterSpacing: 0, lineHeight: 1.7 },
    small: { fontSize: 14, fontWeight: 500, letterSpacing: 0, lineHeight: 1.5 },
    label: { fontSize: 13, fontWeight: 600, letterSpacing: 0.5, lineHeight: 1.4 },
  },
} as const;

// ============================================================================
// SPACING SYSTEMS - 3 sistemi diversi
// ============================================================================
export const SPACING_SYSTEMS = {
  // Generous (lots of whitespace)
  'spacious': {
    name: 'Spacious',
    vibe: 'breathable, luxurious, open',
    sectionPadding: 120,
    sectionGap: 64,
    cardPadding: 48,
    cardGap: 32,
    elementGap: 24,
    buttonPadding: { x: 32, y: 18 },
  },

  // Balanced (standard)
  'balanced': {
    name: 'Balanced',
    vibe: 'comfortable, professional, standard',
    sectionPadding: 80,
    sectionGap: 48,
    cardPadding: 32,
    cardGap: 24,
    elementGap: 16,
    buttonPadding: { x: 24, y: 14 },
  },

  // Compact (dense)
  'compact': {
    name: 'Compact',
    vibe: 'efficient, dense, information-rich',
    sectionPadding: 48,
    sectionGap: 32,
    cardPadding: 24,
    cardGap: 16,
    elementGap: 12,
    buttonPadding: { x: 20, y: 12 },
  },
} as const;

// ============================================================================
// BORDER RADIUS STYLES - 4 stili diversi
// ============================================================================
export const RADIUS_STYLES = {
  // Sharp (no radius)
  'sharp': {
    name: 'Sharp',
    vibe: 'geometric, modern, bold',
    none: 0,
    sm: 0,
    md: 0,
    lg: 0,
    xl: 0,
    full: 0,
    button: 0,
    card: 0,
    badge: 0,
  },

  // Subtle (small radius)
  'subtle': {
    name: 'Subtle',
    vibe: 'professional, refined, corporate',
    none: 0,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    full: 9999,
    button: 6,
    card: 8,
    badge: 4,
  },

  // Rounded (medium radius)
  'rounded': {
    name: 'Rounded',
    vibe: 'friendly, approachable, modern',
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
    button: 12,
    card: 16,
    badge: 8,
  },

  // Pill (fully rounded)
  'pill': {
    name: 'Pill',
    vibe: 'playful, soft, organic',
    none: 0,
    sm: 12,
    md: 20,
    lg: 28,
    xl: 9999,
    full: 9999,
    button: 9999,
    card: 24,
    badge: 9999,
  },
} as const;

// ============================================================================
// BUTTON STYLES - 6 variazioni
// ============================================================================
export const BUTTON_STYLES = {
  'solid': {
    name: 'Solid',
    base: { backgroundColor: '{accent}', color: '{bg}', border: 'none' },
    hover: { opacity: 0.9 },
  },
  'outline': {
    name: 'Outline',
    base: { backgroundColor: 'transparent', color: '{accent}', borderWidth: 1, borderColor: '{accent}', borderStyle: 'solid' },
    hover: { backgroundColor: '{accent}', color: '{bg}' },
  },
  'ghost': {
    name: 'Ghost',
    base: { backgroundColor: 'transparent', color: '{primary}', border: 'none' },
    hover: { backgroundColor: '{surface}' },
  },
  'soft': {
    name: 'Soft',
    base: { backgroundColor: '{surfaceHover}', color: '{primary}', border: 'none' },
    hover: { backgroundColor: '{surface}' },
  },
  'gradient': {
    name: 'Gradient',
    base: { backgroundImage: '{gradient}', color: '#ffffff', border: 'none' },
    hover: { opacity: 0.9 },
  },
  'glass': {
    name: 'Glass',
    base: { backgroundColor: 'rgba(255,255,255,0.1)', color: '{primary}', backdropFilter: 'blur(8px)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderStyle: 'solid' },
    hover: { backgroundColor: 'rgba(255,255,255,0.15)' },
  },
} as const;

// ============================================================================
// CARD STYLES - 5 variazioni
// ============================================================================
export const CARD_STYLES = {
  'flat': {
    name: 'Flat',
    base: { backgroundColor: '{surface}', border: 'none', boxShadow: 'none' },
  },
  'bordered': {
    name: 'Bordered',
    base: { backgroundColor: '{surface}', borderWidth: 1, borderColor: '{border}', borderStyle: 'solid', boxShadow: 'none' },
  },
  'elevated': {
    name: 'Elevated',
    base: { backgroundColor: '{surface}', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  },
  'glass': {
    name: 'Glass',
    base: { backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'solid' },
  },
  'colorful': {
    name: 'Colorful',
    base: { backgroundColor: '{accent}', borderWidth: 1, borderColor: '{borderStrong}', borderStyle: 'solid' },
  },
} as const;

// ============================================================================
// HEADER/NAV STYLES - 4 variazioni
// ============================================================================
export const HEADER_STYLES = {
  'minimal': {
    name: 'Minimal',
    vibe: 'clean, simple',
    height: 64,
    padding: 24,
    background: 'transparent',
    position: 'relative',
    logoSize: 24,
    linkStyle: 'text',
  },
  'floating': {
    name: 'Floating',
    vibe: 'modern, elevated',
    height: 56,
    padding: 16,
    background: '{surface}',
    position: 'fixed',
    borderRadius: 9999,
    margin: 16,
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
    logoSize: 20,
    linkStyle: 'text',
  },
  'solid': {
    name: 'Solid',
    vibe: 'traditional, corporate',
    height: 72,
    padding: 24,
    background: '{surface}',
    position: 'fixed',
    borderBottom: '1px solid {border}',
    logoSize: 28,
    linkStyle: 'text',
  },
  'transparent': {
    name: 'Transparent',
    vibe: 'overlay, hero-friendly',
    height: 80,
    padding: 32,
    background: 'transparent',
    position: 'absolute',
    logoSize: 32,
    linkStyle: 'text',
  },
} as const;

// ============================================================================
// SHADOW STYLES - 4 intensità
// ============================================================================
export const SHADOW_STYLES = {
  'none': {
    name: 'None',
    sm: 'none',
    md: 'none',
    lg: 'none',
    xl: 'none',
  },
  'subtle': {
    name: 'Subtle',
    sm: '0 1px 2px rgba(0,0,0,0.04)',
    md: '0 2px 8px rgba(0,0,0,0.06)',
    lg: '0 4px 16px rgba(0,0,0,0.08)',
    xl: '0 8px 32px rgba(0,0,0,0.1)',
  },
  'medium': {
    name: 'Medium',
    sm: '0 2px 4px rgba(0,0,0,0.08)',
    md: '0 4px 16px rgba(0,0,0,0.12)',
    lg: '0 8px 32px rgba(0,0,0,0.16)',
    xl: '0 16px 48px rgba(0,0,0,0.2)',
  },
  'dramatic': {
    name: 'Dramatic',
    sm: '0 4px 8px rgba(0,0,0,0.15)',
    md: '0 8px 24px rgba(0,0,0,0.2)',
    lg: '0 16px 48px rgba(0,0,0,0.25)',
    xl: '0 24px 64px rgba(0,0,0,0.3)',
  },
} as const;

// ============================================================================
// PRESET COMBINATIONS - Stili completi pronti all'uso
// ============================================================================
export const DESIGN_PRESETS = {
  'noir-impact': {
    name: 'Noir Impact',
    description: 'Bold dark theme with dramatic typography',
    colors: 'noir',
    typography: 'impact',
    spacing: 'spacious',
    radius: 'subtle',
    shadows: 'medium',
    buttons: 'solid',
    cards: 'bordered',
    header: 'transparent',
  },
  'paper-elegant': {
    name: 'Paper Elegant',
    description: 'Clean minimal with refined typography',
    colors: 'paper',
    typography: 'elegant',
    spacing: 'spacious',
    radius: 'subtle',
    shadows: 'subtle',
    buttons: 'outline',
    cards: 'elevated',
    header: 'minimal',
  },
  'candy-playful': {
    name: 'Candy Playful',
    description: 'Fun colorful with bold shapes',
    colors: 'candy',
    typography: 'playful',
    spacing: 'balanced',
    radius: 'pill',
    shadows: 'none',
    buttons: 'solid',
    cards: 'colorful',
    header: 'floating',
  },
  'aurora-gradient': {
    name: 'Aurora Gradient',
    description: 'Magical gradients with glass effects',
    colors: 'aurora',
    typography: 'modern',
    spacing: 'balanced',
    radius: 'rounded',
    shadows: 'medium',
    buttons: 'gradient',
    cards: 'glass',
    header: 'floating',
  },
  'trust-corporate': {
    name: 'Trust Corporate',
    description: 'Professional and reliable',
    colors: 'trust',
    typography: 'modern',
    spacing: 'balanced',
    radius: 'subtle',
    shadows: 'subtle',
    buttons: 'solid',
    cards: 'bordered',
    header: 'solid',
  },
  'cyber-neon': {
    name: 'Cyber Neon',
    description: 'Futuristic with neon accents',
    colors: 'cyber',
    typography: 'impact',
    spacing: 'compact',
    radius: 'sharp',
    shadows: 'dramatic',
    buttons: 'glass',
    cards: 'glass',
    header: 'transparent',
  },
  'luxury-gold': {
    name: 'Luxury Gold',
    description: 'Premium with gold accents',
    colors: 'luxury',
    typography: 'elegant',
    spacing: 'spacious',
    radius: 'subtle',
    shadows: 'medium',
    buttons: 'outline',
    cards: 'bordered',
    header: 'minimal',
  },
} as const;

// ============================================================================
// HELPER: Get random preset
// ============================================================================
export function getRandomPreset(): keyof typeof DESIGN_PRESETS {
  const presets = Object.keys(DESIGN_PRESETS) as (keyof typeof DESIGN_PRESETS)[];
  return presets[Math.floor(Math.random() * presets.length)];
}

// ============================================================================
// HELPER: Get preset by vibe keywords
// ============================================================================
export function getPresetByVibe(vibe: string): keyof typeof DESIGN_PRESETS {
  const vibeLC = vibe.toLowerCase();

  if (vibeLC.includes('dark') || vibeLC.includes('bold') || vibeLC.includes('dramatic')) {
    return 'noir-impact';
  }
  if (vibeLC.includes('minimal') || vibeLC.includes('clean') || vibeLC.includes('elegant')) {
    return 'paper-elegant';
  }
  if (vibeLC.includes('playful') || vibeLC.includes('fun') || vibeLC.includes('colorful')) {
    return 'candy-playful';
  }
  if (vibeLC.includes('gradient') || vibeLC.includes('magic') || vibeLC.includes('vibrant')) {
    return 'aurora-gradient';
  }
  if (vibeLC.includes('corporate') || vibeLC.includes('professional') || vibeLC.includes('business')) {
    return 'trust-corporate';
  }
  if (vibeLC.includes('cyber') || vibeLC.includes('neon') || vibeLC.includes('tech') || vibeLC.includes('futuristic')) {
    return 'cyber-neon';
  }
  if (vibeLC.includes('luxury') || vibeLC.includes('premium') || vibeLC.includes('gold')) {
    return 'luxury-gold';
  }

  // Default: random
  return getRandomPreset();
}

export type ColorPalette = keyof typeof COLOR_PALETTES;
export type TypographyScale = keyof typeof TYPOGRAPHY_SCALES;
export type SpacingSystem = keyof typeof SPACING_SYSTEMS;
export type RadiusStyle = keyof typeof RADIUS_STYLES;
export type ShadowStyle = keyof typeof SHADOW_STYLES;
export type DesignPreset = keyof typeof DESIGN_PRESETS;
