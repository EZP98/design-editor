/**
 * Style Presets
 *
 * Complete design systems inspired by top design tools like Framer, Linear, Stripe.
 * Each preset includes colors, typography, spacing, shadows, and component styles.
 */

// ============================================
// STYLE PRESET TYPES
// ============================================

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  preview: string; // Preview image URL or gradient

  // Color palette
  colors: {
    // Backgrounds
    bgPrimary: string;
    bgSecondary: string;
    bgTertiary: string;
    bgAccent: string;
    bgOverlay: string;

    // Text
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;

    // Brand
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;

    // Semantic
    success: string;
    warning: string;
    error: string;
    info: string;

    // Borders & Lines
    border: string;
    borderHover: string;
    divider: string;
  };

  // Typography
  typography: {
    fontFamily: {
      heading: string;
      body: string;
      mono: string;
    };
    scale: {
      display: { size: number; weight: number; lineHeight: number; letterSpacing: number };
      h1: { size: number; weight: number; lineHeight: number; letterSpacing: number };
      h2: { size: number; weight: number; lineHeight: number; letterSpacing: number };
      h3: { size: number; weight: number; lineHeight: number; letterSpacing: number };
      h4: { size: number; weight: number; lineHeight: number; letterSpacing: number };
      body: { size: number; weight: number; lineHeight: number; letterSpacing: number };
      bodySmall: { size: number; weight: number; lineHeight: number; letterSpacing: number };
      caption: { size: number; weight: number; lineHeight: number; letterSpacing: number };
      label: { size: number; weight: number; lineHeight: number; letterSpacing: number };
    };
  };

  // Spacing scale (px)
  spacing: {
    xs: number;   // 4
    sm: number;   // 8
    md: number;   // 16
    lg: number;   // 24
    xl: number;   // 32
    xxl: number;  // 48
    xxxl: number; // 64
    section: number; // 80-120
  };

  // Border radius
  radius: {
    none: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };

  // Shadows
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    glow: string;
    inner: string;
  };

  // Component-specific styles
  components: {
    button: {
      primary: ComponentStyle;
      secondary: ComponentStyle;
      outline: ComponentStyle;
      ghost: ComponentStyle;
    };
    card: ComponentStyle;
    input: ComponentStyle;
    badge: ComponentStyle;
    navbar: ComponentStyle;
  };

  // Animation & Motion
  motion: {
    duration: { fast: string; normal: string; slow: string };
    easing: { default: string; inOut: string; bounce: string };
  };
}

export interface ComponentStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: string;
  boxShadow?: string;
  backdropFilter?: string;
  fontWeight?: number;
  fontSize?: number;
  transition?: string;
  hover?: Partial<ComponentStyle>;
}

// ============================================
// FRAMER DARK PRESET (Inspired by Framer.com)
// ============================================

export const FRAMER_DARK: StylePreset = {
  id: 'framer-dark',
  name: 'Framer Dark',
  description: 'Elegant dark theme inspired by Framer. Perfect for SaaS and creative tools.',
  preview: 'linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 50%, #0066FF 100%)',

  colors: {
    bgPrimary: '#0D0D0D',
    bgSecondary: '#171717',
    bgTertiary: '#1F1F1F',
    bgAccent: 'rgba(0, 102, 255, 0.1)',
    bgOverlay: 'rgba(0, 0, 0, 0.8)',

    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.5)',
    textInverse: '#0D0D0D',

    primary: '#0066FF',
    primaryHover: '#0052CC',
    secondary: '#6366F1',
    accent: '#00D4FF',

    success: '#00C853',
    warning: '#FFB300',
    error: '#FF3D3D',
    info: '#0066FF',

    border: 'rgba(255, 255, 255, 0.1)',
    borderHover: 'rgba(255, 255, 255, 0.2)',
    divider: 'rgba(255, 255, 255, 0.06)',
  },

  typography: {
    fontFamily: {
      heading: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      body: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      mono: 'JetBrains Mono, Menlo, monospace',
    },
    scale: {
      display: { size: 72, weight: 700, lineHeight: 1.0, letterSpacing: -0.04 },
      h1: { size: 56, weight: 700, lineHeight: 1.1, letterSpacing: -0.03 },
      h2: { size: 40, weight: 600, lineHeight: 1.15, letterSpacing: -0.02 },
      h3: { size: 28, weight: 600, lineHeight: 1.2, letterSpacing: -0.01 },
      h4: { size: 20, weight: 600, lineHeight: 1.3, letterSpacing: 0 },
      body: { size: 16, weight: 400, lineHeight: 1.6, letterSpacing: 0 },
      bodySmall: { size: 14, weight: 400, lineHeight: 1.5, letterSpacing: 0 },
      caption: { size: 12, weight: 400, lineHeight: 1.4, letterSpacing: 0.02 },
      label: { size: 13, weight: 500, lineHeight: 1, letterSpacing: 0.02 },
    },
  },

  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64, section: 100,
  },

  radius: {
    none: 0, sm: 6, md: 10, lg: 14, xl: 20, full: 9999,
  },

  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
    md: '0 4px 12px rgba(0, 0, 0, 0.5)',
    lg: '0 12px 32px rgba(0, 0, 0, 0.6)',
    xl: '0 24px 64px rgba(0, 0, 0, 0.7)',
    glow: '0 0 40px rgba(0, 102, 255, 0.3)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
  },

  components: {
    button: {
      primary: {
        backgroundColor: '#0066FF',
        color: '#FFFFFF',
        borderRadius: 10,
        padding: '12px 24px',
        fontWeight: 500,
        fontSize: 14,
        transition: 'all 0.2s ease',
        hover: { backgroundColor: '#0052CC', boxShadow: '0 0 20px rgba(0, 102, 255, 0.4)' },
      },
      secondary: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#FFFFFF',
        borderRadius: 10,
        padding: '12px 24px',
        fontWeight: 500,
        fontSize: 14,
        backdropFilter: 'blur(10px)',
        hover: { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#FFFFFF',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderRadius: 10,
        padding: '12px 24px',
        fontWeight: 500,
        fontSize: 14,
        hover: { borderColor: 'rgba(255, 255, 255, 0.4)', backgroundColor: 'rgba(255, 255, 255, 0.05)' },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 10,
        padding: '12px 24px',
        fontWeight: 500,
        fontSize: 14,
        hover: { color: '#FFFFFF', backgroundColor: 'rgba(255, 255, 255, 0.05)' },
      },
    },
    card: {
      backgroundColor: '#171717',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderRadius: 16,
      padding: '24px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
    },
    input: {
      backgroundColor: '#1F1F1F',
      color: '#FFFFFF',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderRadius: 10,
      padding: '12px 16px',
      fontSize: 14,
      hover: { borderColor: 'rgba(255, 255, 255, 0.2)' },
    },
    badge: {
      backgroundColor: 'rgba(0, 102, 255, 0.15)',
      color: '#0066FF',
      borderRadius: 6,
      padding: '4px 10px',
      fontWeight: 500,
      fontSize: 12,
    },
    navbar: {
      backgroundColor: 'rgba(13, 13, 13, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.06)',
      borderWidth: 1,
      backdropFilter: 'blur(20px)',
      padding: '16px 24px',
    },
  },

  motion: {
    duration: { fast: '0.15s', normal: '0.3s', slow: '0.5s' },
    easing: { default: 'ease', inOut: 'cubic-bezier(0.4, 0, 0.2, 1)', bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
  },
};

// ============================================
// LINEAR PRESET (Inspired by Linear.app)
// ============================================

export const LINEAR_DARK: StylePreset = {
  id: 'linear-dark',
  name: 'Linear',
  description: 'Clean, minimal dark theme inspired by Linear. Great for productivity tools.',
  preview: 'linear-gradient(135deg, #0A0A0A 0%, #18181B 50%, #5E6AD2 100%)',

  colors: {
    bgPrimary: '#0A0A0A',
    bgSecondary: '#121212',
    bgTertiary: '#1A1A1A',
    bgAccent: 'rgba(94, 106, 210, 0.1)',
    bgOverlay: 'rgba(0, 0, 0, 0.85)',

    textPrimary: '#F7F8F8',
    textSecondary: '#9BA1A6',
    textTertiary: '#6B7280',
    textInverse: '#0A0A0A',

    primary: '#5E6AD2',
    primaryHover: '#4B55B0',
    secondary: '#818CF8',
    accent: '#06B6D4',

    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#5E6AD2',

    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.15)',
    divider: 'rgba(255, 255, 255, 0.04)',
  },

  typography: {
    fontFamily: {
      heading: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      body: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      mono: 'SF Mono, Menlo, monospace',
    },
    scale: {
      display: { size: 64, weight: 600, lineHeight: 1.05, letterSpacing: -0.035 },
      h1: { size: 48, weight: 600, lineHeight: 1.1, letterSpacing: -0.025 },
      h2: { size: 36, weight: 600, lineHeight: 1.15, letterSpacing: -0.02 },
      h3: { size: 24, weight: 600, lineHeight: 1.25, letterSpacing: -0.01 },
      h4: { size: 18, weight: 600, lineHeight: 1.35, letterSpacing: 0 },
      body: { size: 15, weight: 400, lineHeight: 1.55, letterSpacing: 0 },
      bodySmall: { size: 13, weight: 400, lineHeight: 1.5, letterSpacing: 0 },
      caption: { size: 11, weight: 500, lineHeight: 1.4, letterSpacing: 0.03 },
      label: { size: 12, weight: 500, lineHeight: 1, letterSpacing: 0.01 },
    },
  },

  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64, section: 96,
  },

  radius: {
    none: 0, sm: 4, md: 8, lg: 12, xl: 16, full: 9999,
  },

  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
    md: '0 4px 8px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.6)',
    glow: '0 0 32px rgba(94, 106, 210, 0.25)',
    inner: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
  },

  components: {
    button: {
      primary: {
        backgroundColor: '#5E6AD2',
        color: '#FFFFFF',
        borderRadius: 8,
        padding: '10px 20px',
        fontWeight: 500,
        fontSize: 13,
        hover: { backgroundColor: '#4B55B0' },
      },
      secondary: {
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        color: '#F7F8F8',
        borderRadius: 8,
        padding: '10px 20px',
        fontWeight: 500,
        fontSize: 13,
        hover: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#9BA1A6',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 8,
        padding: '10px 20px',
        fontWeight: 500,
        fontSize: 13,
        hover: { color: '#F7F8F8', borderColor: 'rgba(255, 255, 255, 0.2)' },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#9BA1A6',
        borderRadius: 8,
        padding: '10px 20px',
        fontWeight: 500,
        fontSize: 13,
        hover: { color: '#F7F8F8', backgroundColor: 'rgba(255, 255, 255, 0.04)' },
      },
    },
    card: {
      backgroundColor: '#121212',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1,
      borderRadius: 12,
      padding: '20px',
    },
    input: {
      backgroundColor: '#1A1A1A',
      color: '#F7F8F8',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 13,
    },
    badge: {
      backgroundColor: 'rgba(94, 106, 210, 0.12)',
      color: '#818CF8',
      borderRadius: 4,
      padding: '3px 8px',
      fontWeight: 500,
      fontSize: 11,
    },
    navbar: {
      backgroundColor: 'rgba(10, 10, 10, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.06)',
      borderWidth: 1,
      backdropFilter: 'blur(16px)',
      padding: '12px 20px',
    },
  },

  motion: {
    duration: { fast: '0.1s', normal: '0.2s', slow: '0.4s' },
    easing: { default: 'ease-out', inOut: 'cubic-bezier(0.4, 0, 0.2, 1)', bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
  },
};

// ============================================
// STRIPE GRADIENT (Inspired by Stripe.com)
// ============================================

export const STRIPE_GRADIENT: StylePreset = {
  id: 'stripe-gradient',
  name: 'Stripe Gradient',
  description: 'Vibrant gradients and bold colors inspired by Stripe. Perfect for fintech.',
  preview: 'linear-gradient(135deg, #0A2540 0%, #635BFF 50%, #00D4FF 100%)',

  colors: {
    bgPrimary: '#0A2540',
    bgSecondary: '#0D2D4F',
    bgTertiary: '#10375E',
    bgAccent: 'rgba(99, 91, 255, 0.15)',
    bgOverlay: 'rgba(10, 37, 64, 0.95)',

    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    textTertiary: 'rgba(255, 255, 255, 0.6)',
    textInverse: '#0A2540',

    primary: '#635BFF',
    primaryHover: '#5046E5',
    secondary: '#00D4FF',
    accent: '#FF6B6B',

    success: '#0ACF83',
    warning: '#FFB800',
    error: '#FF5630',
    info: '#635BFF',

    border: 'rgba(255, 255, 255, 0.12)',
    borderHover: 'rgba(255, 255, 255, 0.25)',
    divider: 'rgba(255, 255, 255, 0.08)',
  },

  typography: {
    fontFamily: {
      heading: 'sohne, -apple-system, BlinkMacSystemFont, sans-serif',
      body: 'sohne, -apple-system, BlinkMacSystemFont, sans-serif',
      mono: 'sohne-mono, Menlo, monospace',
    },
    scale: {
      display: { size: 80, weight: 700, lineHeight: 1.0, letterSpacing: -0.05 },
      h1: { size: 60, weight: 700, lineHeight: 1.08, letterSpacing: -0.04 },
      h2: { size: 44, weight: 600, lineHeight: 1.12, letterSpacing: -0.03 },
      h3: { size: 32, weight: 600, lineHeight: 1.2, letterSpacing: -0.02 },
      h4: { size: 22, weight: 600, lineHeight: 1.3, letterSpacing: -0.01 },
      body: { size: 17, weight: 400, lineHeight: 1.65, letterSpacing: 0 },
      bodySmall: { size: 15, weight: 400, lineHeight: 1.55, letterSpacing: 0 },
      caption: { size: 13, weight: 400, lineHeight: 1.4, letterSpacing: 0.01 },
      label: { size: 14, weight: 600, lineHeight: 1, letterSpacing: 0.02 },
    },
  },

  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 40, xxl: 56, xxxl: 80, section: 120,
  },

  radius: {
    none: 0, sm: 8, md: 12, lg: 16, xl: 24, full: 9999,
  },

  shadows: {
    sm: '0 2px 5px rgba(0, 0, 0, 0.15)',
    md: '0 6px 16px rgba(0, 0, 0, 0.2)',
    lg: '0 15px 35px rgba(0, 0, 0, 0.3)',
    xl: '0 25px 50px rgba(0, 0, 0, 0.4)',
    glow: '0 0 60px rgba(99, 91, 255, 0.4)',
    inner: 'inset 0 2px 6px rgba(0, 0, 0, 0.15)',
  },

  components: {
    button: {
      primary: {
        backgroundImage: 'linear-gradient(135deg, #635BFF 0%, #00D4FF 100%)',
        color: '#FFFFFF',
        borderRadius: 12,
        padding: '14px 28px',
        fontWeight: 600,
        fontSize: 15,
        boxShadow: '0 4px 16px rgba(99, 91, 255, 0.4)',
        hover: { boxShadow: '0 6px 24px rgba(99, 91, 255, 0.5)' },
      },
      secondary: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#FFFFFF',
        borderRadius: 12,
        padding: '14px 28px',
        fontWeight: 600,
        fontSize: 15,
        backdropFilter: 'blur(12px)',
        hover: { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#FFFFFF',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 2,
        borderRadius: 12,
        padding: '12px 26px',
        fontWeight: 600,
        fontSize: 15,
        hover: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 12,
        padding: '14px 28px',
        fontWeight: 600,
        fontSize: 15,
        hover: { color: '#FFFFFF', backgroundColor: 'rgba(255, 255, 255, 0.05)' },
      },
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderRadius: 20,
      padding: '32px',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    },
    input: {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      color: '#FFFFFF',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: 1,
      borderRadius: 10,
      padding: '14px 18px',
      fontSize: 15,
      hover: { borderColor: 'rgba(255, 255, 255, 0.3)' },
    },
    badge: {
      backgroundImage: 'linear-gradient(135deg, rgba(99, 91, 255, 0.2) 0%, rgba(0, 212, 255, 0.2) 100%)',
      color: '#00D4FF',
      borderRadius: 8,
      padding: '6px 12px',
      fontWeight: 600,
      fontSize: 12,
    },
    navbar: {
      backgroundColor: 'rgba(10, 37, 64, 0.85)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1,
      backdropFilter: 'blur(24px)',
      padding: '16px 32px',
    },
  },

  motion: {
    duration: { fast: '0.15s', normal: '0.35s', slow: '0.6s' },
    easing: { default: 'ease', inOut: 'cubic-bezier(0.4, 0, 0.2, 1)', bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  },
};

// ============================================
// MINIMAL LIGHT PRESET
// ============================================

export const MINIMAL_LIGHT: StylePreset = {
  id: 'minimal-light',
  name: 'Minimal Light',
  description: 'Clean, airy light theme with subtle shadows. Perfect for portfolios.',
  preview: 'linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 50%, #F5F5F5 100%)',

  colors: {
    bgPrimary: '#FFFFFF',
    bgSecondary: '#FAFAFA',
    bgTertiary: '#F5F5F5',
    bgAccent: 'rgba(0, 0, 0, 0.03)',
    bgOverlay: 'rgba(255, 255, 255, 0.95)',

    textPrimary: '#171717',
    textSecondary: '#525252',
    textTertiary: '#A3A3A3',
    textInverse: '#FFFFFF',

    primary: '#171717',
    primaryHover: '#262626',
    secondary: '#525252',
    accent: '#3B82F6',

    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    border: 'rgba(0, 0, 0, 0.08)',
    borderHover: 'rgba(0, 0, 0, 0.15)',
    divider: 'rgba(0, 0, 0, 0.05)',
  },

  typography: {
    fontFamily: {
      heading: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      body: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      mono: 'SF Mono, Menlo, monospace',
    },
    scale: {
      display: { size: 64, weight: 500, lineHeight: 1.05, letterSpacing: -0.04 },
      h1: { size: 48, weight: 500, lineHeight: 1.1, letterSpacing: -0.03 },
      h2: { size: 36, weight: 500, lineHeight: 1.15, letterSpacing: -0.02 },
      h3: { size: 24, weight: 500, lineHeight: 1.25, letterSpacing: -0.01 },
      h4: { size: 18, weight: 500, lineHeight: 1.35, letterSpacing: 0 },
      body: { size: 16, weight: 400, lineHeight: 1.6, letterSpacing: 0 },
      bodySmall: { size: 14, weight: 400, lineHeight: 1.55, letterSpacing: 0 },
      caption: { size: 12, weight: 400, lineHeight: 1.4, letterSpacing: 0.01 },
      label: { size: 13, weight: 500, lineHeight: 1, letterSpacing: 0.02 },
    },
  },

  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64, section: 100,
  },

  radius: {
    none: 0, sm: 4, md: 8, lg: 12, xl: 16, full: 9999,
  },

  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 4px 12px rgba(0, 0, 0, 0.06)',
    lg: '0 12px 32px rgba(0, 0, 0, 0.08)',
    xl: '0 24px 48px rgba(0, 0, 0, 0.1)',
    glow: '0 0 40px rgba(0, 0, 0, 0.05)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)',
  },

  components: {
    button: {
      primary: {
        backgroundColor: '#171717',
        color: '#FFFFFF',
        borderRadius: 8,
        padding: '12px 24px',
        fontWeight: 500,
        fontSize: 14,
        hover: { backgroundColor: '#262626' },
      },
      secondary: {
        backgroundColor: '#F5F5F5',
        color: '#171717',
        borderRadius: 8,
        padding: '12px 24px',
        fontWeight: 500,
        fontSize: 14,
        hover: { backgroundColor: '#E5E5E5' },
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#171717',
        borderColor: 'rgba(0, 0, 0, 0.15)',
        borderWidth: 1,
        borderRadius: 8,
        padding: '12px 24px',
        fontWeight: 500,
        fontSize: 14,
        hover: { backgroundColor: 'rgba(0, 0, 0, 0.03)' },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#525252',
        borderRadius: 8,
        padding: '12px 24px',
        fontWeight: 500,
        fontSize: 14,
        hover: { color: '#171717', backgroundColor: 'rgba(0, 0, 0, 0.03)' },
      },
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderColor: 'rgba(0, 0, 0, 0.06)',
      borderWidth: 1,
      borderRadius: 12,
      padding: '24px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
    },
    input: {
      backgroundColor: '#FAFAFA',
      color: '#171717',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      borderRadius: 8,
      padding: '12px 16px',
      fontSize: 14,
      hover: { borderColor: 'rgba(0, 0, 0, 0.2)' },
    },
    badge: {
      backgroundColor: '#F5F5F5',
      color: '#525252',
      borderRadius: 6,
      padding: '4px 10px',
      fontWeight: 500,
      fontSize: 12,
    },
    navbar: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: 'rgba(0, 0, 0, 0.05)',
      borderWidth: 1,
      backdropFilter: 'blur(20px)',
      padding: '16px 24px',
    },
  },

  motion: {
    duration: { fast: '0.15s', normal: '0.3s', slow: '0.5s' },
    easing: { default: 'ease', inOut: 'cubic-bezier(0.4, 0, 0.2, 1)', bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
  },
};

// ============================================
// BRUTALIST PRESET
// ============================================

export const BRUTALIST: StylePreset = {
  id: 'brutalist',
  name: 'Brutalist',
  description: 'Raw, bold aesthetic with stark contrasts. For statements.',
  preview: 'linear-gradient(135deg, #FFFFFF 0%, #F0F0F0 50%, #000000 100%)',

  colors: {
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F0F0F0',
    bgTertiary: '#E0E0E0',
    bgAccent: '#000000',
    bgOverlay: 'rgba(0, 0, 0, 0.95)',

    textPrimary: '#000000',
    textSecondary: '#333333',
    textTertiary: '#666666',
    textInverse: '#FFFFFF',

    primary: '#000000',
    primaryHover: '#222222',
    secondary: '#FF0000',
    accent: '#0000FF',

    success: '#00FF00',
    warning: '#FFFF00',
    error: '#FF0000',
    info: '#0000FF',

    border: '#000000',
    borderHover: '#333333',
    divider: '#000000',
  },

  typography: {
    fontFamily: {
      heading: 'Arial Black, Helvetica, sans-serif',
      body: 'Helvetica, Arial, sans-serif',
      mono: 'Courier New, monospace',
    },
    scale: {
      display: { size: 96, weight: 900, lineHeight: 0.9, letterSpacing: -0.06 },
      h1: { size: 72, weight: 900, lineHeight: 0.95, letterSpacing: -0.04 },
      h2: { size: 48, weight: 700, lineHeight: 1.0, letterSpacing: -0.02 },
      h3: { size: 32, weight: 700, lineHeight: 1.1, letterSpacing: 0 },
      h4: { size: 20, weight: 700, lineHeight: 1.2, letterSpacing: 0 },
      body: { size: 16, weight: 400, lineHeight: 1.5, letterSpacing: 0 },
      bodySmall: { size: 14, weight: 400, lineHeight: 1.45, letterSpacing: 0 },
      caption: { size: 12, weight: 400, lineHeight: 1.3, letterSpacing: 0.05 },
      label: { size: 14, weight: 700, lineHeight: 1, letterSpacing: 0.1 },
    },
  },

  spacing: {
    xs: 4, sm: 8, md: 16, lg: 32, xl: 48, xxl: 64, xxxl: 96, section: 120,
  },

  radius: {
    none: 0, sm: 0, md: 0, lg: 0, xl: 0, full: 0,
  },

  shadows: {
    sm: '4px 4px 0 #000000',
    md: '6px 6px 0 #000000',
    lg: '8px 8px 0 #000000',
    xl: '12px 12px 0 #000000',
    glow: 'none',
    inner: 'inset 4px 4px 0 #000000',
  },

  components: {
    button: {
      primary: {
        backgroundColor: '#000000',
        color: '#FFFFFF',
        borderRadius: 0,
        borderColor: '#000000',
        borderWidth: 3,
        padding: '14px 28px',
        fontWeight: 700,
        fontSize: 14,
        boxShadow: '4px 4px 0 #000000',
        hover: { boxShadow: '6px 6px 0 #000000' },
      },
      secondary: {
        backgroundColor: '#FFFFFF',
        color: '#000000',
        borderRadius: 0,
        borderColor: '#000000',
        borderWidth: 3,
        padding: '14px 28px',
        fontWeight: 700,
        fontSize: 14,
        hover: { backgroundColor: '#F0F0F0' },
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#000000',
        borderColor: '#000000',
        borderWidth: 3,
        borderRadius: 0,
        padding: '14px 28px',
        fontWeight: 700,
        fontSize: 14,
        hover: { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#000000',
        borderRadius: 0,
        padding: '14px 28px',
        fontWeight: 700,
        fontSize: 14,
        hover: { backgroundColor: 'rgba(0, 0, 0, 0.1)' },
      },
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderColor: '#000000',
      borderWidth: 3,
      borderRadius: 0,
      padding: '24px',
      boxShadow: '8px 8px 0 #000000',
    },
    input: {
      backgroundColor: '#FFFFFF',
      color: '#000000',
      borderColor: '#000000',
      borderWidth: 2,
      borderRadius: 0,
      padding: '12px 16px',
      fontSize: 14,
      hover: { borderWidth: 3 },
    },
    badge: {
      backgroundColor: '#000000',
      color: '#FFFFFF',
      borderRadius: 0,
      padding: '6px 12px',
      fontWeight: 700,
      fontSize: 12,
    },
    navbar: {
      backgroundColor: '#FFFFFF',
      borderColor: '#000000',
      borderWidth: 3,
      padding: '16px 24px',
    },
  },

  motion: {
    duration: { fast: '0s', normal: '0s', slow: '0s' },
    easing: { default: 'linear', inOut: 'linear', bounce: 'linear' },
  },
};

// ============================================
// GLASSMORPHISM PRESET
// ============================================

export const GLASSMORPHISM: StylePreset = {
  id: 'glassmorphism',
  name: 'Glassmorphism',
  description: 'Frosted glass effects with vibrant backgrounds. Modern and trendy.',
  preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',

  colors: {
    bgPrimary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    bgSecondary: 'rgba(255, 255, 255, 0.1)',
    bgTertiary: 'rgba(255, 255, 255, 0.05)',
    bgAccent: 'rgba(255, 255, 255, 0.2)',
    bgOverlay: 'rgba(0, 0, 0, 0.4)',

    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.85)',
    textTertiary: 'rgba(255, 255, 255, 0.6)',
    textInverse: '#1A1A2E',

    primary: '#FFFFFF',
    primaryHover: 'rgba(255, 255, 255, 0.9)',
    secondary: 'rgba(255, 255, 255, 0.2)',
    accent: '#F093FB',

    success: '#00E676',
    warning: '#FFAB00',
    error: '#FF5252',
    info: '#40C4FF',

    border: 'rgba(255, 255, 255, 0.2)',
    borderHover: 'rgba(255, 255, 255, 0.4)',
    divider: 'rgba(255, 255, 255, 0.1)',
  },

  typography: {
    fontFamily: {
      heading: 'Poppins, -apple-system, BlinkMacSystemFont, sans-serif',
      body: 'Poppins, -apple-system, BlinkMacSystemFont, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    scale: {
      display: { size: 72, weight: 700, lineHeight: 1.05, letterSpacing: -0.03 },
      h1: { size: 52, weight: 600, lineHeight: 1.1, letterSpacing: -0.02 },
      h2: { size: 40, weight: 600, lineHeight: 1.15, letterSpacing: -0.015 },
      h3: { size: 28, weight: 600, lineHeight: 1.25, letterSpacing: -0.01 },
      h4: { size: 20, weight: 600, lineHeight: 1.35, letterSpacing: 0 },
      body: { size: 16, weight: 400, lineHeight: 1.65, letterSpacing: 0.01 },
      bodySmall: { size: 14, weight: 400, lineHeight: 1.55, letterSpacing: 0.01 },
      caption: { size: 12, weight: 500, lineHeight: 1.4, letterSpacing: 0.03 },
      label: { size: 13, weight: 600, lineHeight: 1, letterSpacing: 0.05 },
    },
  },

  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64, section: 100,
  },

  radius: {
    none: 0, sm: 12, md: 16, lg: 20, xl: 28, full: 9999,
  },

  shadows: {
    sm: '0 4px 16px rgba(0, 0, 0, 0.1)',
    md: '0 8px 32px rgba(0, 0, 0, 0.15)',
    lg: '0 16px 48px rgba(0, 0, 0, 0.2)',
    xl: '0 24px 64px rgba(0, 0, 0, 0.25)',
    glow: '0 0 60px rgba(240, 147, 251, 0.4)',
    inner: 'inset 0 4px 24px rgba(255, 255, 255, 0.1)',
  },

  components: {
    button: {
      primary: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: '#FFFFFF',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        borderRadius: 16,
        padding: '14px 32px',
        fontWeight: 600,
        fontSize: 15,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        hover: { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
      },
      secondary: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#FFFFFF',
        borderRadius: 16,
        padding: '14px 32px',
        fontWeight: 600,
        fontSize: 15,
        backdropFilter: 'blur(16px)',
        hover: { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#FFFFFF',
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderWidth: 2,
        borderRadius: 16,
        padding: '12px 30px',
        fontWeight: 600,
        fontSize: 15,
        hover: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 16,
        padding: '14px 32px',
        fontWeight: 600,
        fontSize: 15,
        hover: { color: '#FFFFFF', backgroundColor: 'rgba(255, 255, 255, 0.1)' },
      },
    },
    card: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      borderRadius: 24,
      padding: '32px',
      backdropFilter: 'blur(24px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 2px 0 rgba(255, 255, 255, 0.15)',
    },
    input: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#FFFFFF',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      borderRadius: 12,
      padding: '14px 18px',
      fontSize: 15,
      backdropFilter: 'blur(12px)',
      hover: { borderColor: 'rgba(255, 255, 255, 0.4)' },
    },
    badge: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      color: '#FFFFFF',
      borderRadius: 10,
      padding: '6px 14px',
      fontWeight: 600,
      fontSize: 12,
      backdropFilter: 'blur(8px)',
    },
    navbar: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      borderWidth: 1,
      backdropFilter: 'blur(30px)',
      padding: '16px 32px',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
    },
  },

  motion: {
    duration: { fast: '0.2s', normal: '0.4s', slow: '0.6s' },
    easing: { default: 'ease-out', inOut: 'cubic-bezier(0.4, 0, 0.2, 1)', bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  },
};

// ============================================
// EXPORT ALL PRESETS
// ============================================

export const STYLE_PRESETS: StylePreset[] = [
  FRAMER_DARK,
  LINEAR_DARK,
  STRIPE_GRADIENT,
  MINIMAL_LIGHT,
  BRUTALIST,
  GLASSMORPHISM,
];

export function getPresetById(id: string): StylePreset | undefined {
  return STYLE_PRESETS.find(p => p.id === id);
}

export function getPresetsByTheme(dark: boolean): StylePreset[] {
  return STYLE_PRESETS.filter(p => {
    // Check if it's a dark theme based on bgPrimary
    const bg = p.colors.bgPrimary;
    const isDark = bg.includes('#0') || bg.includes('#1') || bg.includes('gradient');
    return dark ? isDark : !isDark;
  });
}

// ============================================
// TOPIC-BASED COLOR PALETTES
// ============================================
// These palettes are used by the AI to suggest appropriate colors
// based on the user's topic/industry. Each palette includes:
// - primary: Main brand color
// - secondary: Supporting color
// - accent: Highlight color
// - background: Background color
// - text: Text color

export interface TopicPalette {
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  suggestedImages: string[];
  mood: string[];
}

export const TOPIC_PALETTES: Record<string, TopicPalette[]> = {
  // Wine & Spirits
  wine: [
    {
      name: 'Bordeaux Elegance',
      description: 'Classic wine palette with deep reds and gold accents',
      colors: {
        primary: '#722F37',    // Burgundy/Bordeaux
        secondary: '#C9A227',  // Gold
        accent: '#F5F5DC',     // Cream
        background: '#1A0F10', // Deep wine black
        text: '#F5F0E8',       // Warm white
      },
      suggestedImages: ['vigneti', 'bottiglie vintage', 'cantina', 'calici', 'uva'],
      mood: ['elegante', 'sofisticato', 'tradizionale', 'premium'],
    },
    {
      name: 'Tuscan Sunset',
      description: 'Warm Italian wine country colors',
      colors: {
        primary: '#8B0000',    // Dark red
        secondary: '#D4A574',  // Terracotta
        accent: '#F4E4BC',     // Parchment
        background: '#2C1810', // Espresso
        text: '#FFF8E7',       // Ivory
      },
      suggestedImages: ['colline toscane', 'botti rovere', 'degustazione', 'tramonto vigneto'],
      mood: ['rustico', 'caldo', 'autentico', 'mediterraneo'],
    },
    {
      name: 'Modern Winery',
      description: 'Contemporary take on wine aesthetics',
      colors: {
        primary: '#4A1C2A',    // Deep plum
        secondary: '#B8860B',  // Dark goldenrod
        accent: '#E8DCC4',     // Champagne
        background: '#0D0D0D', // Pure black
        text: '#FFFFFF',       // White
      },
      suggestedImages: ['architettura moderna cantina', 'bottiglia minimalista', 'enoteca design'],
      mood: ['moderno', 'minimalista', 'luxury', 'contemporaneo'],
    },
  ],

  // Restaurant & Food
  restaurant: [
    {
      name: 'Fine Dining',
      description: 'Upscale restaurant with warm, inviting tones',
      colors: {
        primary: '#D4A574',    // Warm gold
        secondary: '#8B4513',  // Saddle brown
        accent: '#FFF8DC',     // Cornsilk
        background: '#1C1410', // Rich brown-black
        text: '#F5F0E8',       // Warm white
      },
      suggestedImages: ['piatto gourmet', 'tavola elegante', 'chef', 'ingredienti freschi'],
      mood: ['raffinato', 'accogliente', 'gourmet', 'intimate'],
    },
    {
      name: 'Italian Trattoria',
      description: 'Classic Italian warmth',
      colors: {
        primary: '#C41E3A',    // Cardinal red
        secondary: '#228B22',  // Forest green
        accent: '#FFF5E1',     // Cream
        background: '#1A1A1A', // Charcoal
        text: '#FFFFFF',       // White
      },
      suggestedImages: ['pasta fresca', 'pizza napoletana', 'mozzarella', 'basilico'],
      mood: ['tradizionale', 'familiare', 'autentico', 'conviviale'],
    },
    {
      name: 'Modern Bistro',
      description: 'Contemporary casual dining',
      colors: {
        primary: '#2F4F4F',    // Dark slate gray
        secondary: '#DAA520',  // Goldenrod
        accent: '#F0F0F0',     // Light gray
        background: '#0A0A0A', // Near black
        text: '#FAFAFA',       // Off-white
      },
      suggestedImages: ['brunch moderno', 'interior design ristorante', 'cocktail bar'],
      mood: ['trendy', 'urbano', 'casual chic', 'instagram-worthy'],
    },
  ],

  // Technology & SaaS
  tech: [
    {
      name: 'Startup Blue',
      description: 'Clean, trustworthy tech aesthetic',
      colors: {
        primary: '#6366F1',    // Indigo
        secondary: '#818CF8',  // Light indigo
        accent: '#22D3EE',     // Cyan
        background: '#0D0D0D', // Black
        text: '#FFFFFF',       // White
      },
      suggestedImages: ['dashboard UI', 'team collaborazione', 'laptop', 'grafici analytics'],
      mood: ['innovativo', 'affidabile', 'professionale', 'moderno'],
    },
    {
      name: 'Developer Dark',
      description: 'Hacker aesthetic for dev tools',
      colors: {
        primary: '#00FF88',    // Matrix green
        secondary: '#00D4FF',  // Cyan
        accent: '#FF6B6B',     // Coral
        background: '#0A0A0A', // Pure black
        text: '#E0E0E0',       // Light gray
      },
      suggestedImages: ['codice', 'terminale', 'server rack', 'circuit board'],
      mood: ['tecnico', 'potente', 'efficiente', 'cutting-edge'],
    },
    {
      name: 'AI Purple',
      description: 'Futuristic AI/ML product colors',
      colors: {
        primary: '#8B5CF6',    // Violet
        secondary: '#EC4899',  // Pink
        accent: '#06B6D4',     // Teal
        background: '#0F0F1A', // Dark purple-black
        text: '#F8FAFC',       // Slate white
      },
      suggestedImages: ['neural network', 'robot', 'dati flusso', 'interfaccia futuristica'],
      mood: ['futuristico', 'intelligente', 'avanzato', 'next-gen'],
    },
  ],

  // Fitness & Wellness
  fitness: [
    {
      name: 'Energy Burst',
      description: 'High-energy fitness brand',
      colors: {
        primary: '#FF6B35',    // Orange
        secondary: '#2EC4B6',  // Teal
        accent: '#FDFFFC',     // White
        background: '#011627', // Dark blue
        text: '#FFFFFF',       // White
      },
      suggestedImages: ['atleta', 'palestra', 'allenamento', 'corsa'],
      mood: ['energico', 'motivante', 'dinamico', 'potente'],
    },
    {
      name: 'Zen Wellness',
      description: 'Calm wellness and yoga',
      colors: {
        primary: '#7C9885',    // Sage green
        secondary: '#D4B896',  // Sand
        accent: '#E8DED1',     // Cream
        background: '#F5F5F0', // Light warm gray
        text: '#2D3436',       // Dark gray
      },
      suggestedImages: ['yoga', 'meditazione', 'natura', 'spa'],
      mood: ['calmo', 'equilibrato', 'naturale', 'mindful'],
    },
  ],

  // Fashion & Luxury
  fashion: [
    {
      name: 'Haute Couture',
      description: 'High fashion luxury',
      colors: {
        primary: '#000000',    // Black
        secondary: '#C9A227',  // Gold
        accent: '#FFFFFF',     // White
        background: '#0A0A0A', // Near black
        text: '#FFFFFF',       // White
      },
      suggestedImages: ['modella', 'passerella', 'abiti eleganti', 'accessori luxury'],
      mood: ['lussuoso', 'esclusivo', 'elegante', 'sofisticato'],
    },
    {
      name: 'Streetwear',
      description: 'Urban fashion aesthetic',
      colors: {
        primary: '#FF3366',    // Hot pink
        secondary: '#00FF88',  // Neon green
        accent: '#FFFF00',     // Yellow
        background: '#1A1A1A', // Dark gray
        text: '#FFFFFF',       // White
      },
      suggestedImages: ['street style', 'sneakers', 'graffiti', 'urban'],
      mood: ['audace', 'giovane', 'ribelle', 'trendy'],
    },
  ],

  // Real Estate & Architecture
  realestate: [
    {
      name: 'Luxury Property',
      description: 'High-end real estate',
      colors: {
        primary: '#1A365D',    // Navy
        secondary: '#C9A227',  // Gold
        accent: '#F7FAFC',     // Light gray
        background: '#FFFFFF', // White
        text: '#1A202C',       // Dark slate
      },
      suggestedImages: ['villa lusso', 'interior design', 'piscina', 'vista panoramica'],
      mood: ['prestigioso', 'esclusivo', 'affidabile', 'professionale'],
    },
    {
      name: 'Modern Architecture',
      description: 'Contemporary architectural firm',
      colors: {
        primary: '#2D3748',    // Slate
        secondary: '#E53E3E',  // Red accent
        accent: '#EDF2F7',     // Light gray
        background: '#FFFFFF', // White
        text: '#1A202C',       // Dark
      },
      suggestedImages: ['edificio moderno', 'rendering 3D', 'interni minimalisti', 'spazi aperti'],
      mood: ['innovativo', 'pulito', 'geometrico', 'visionario'],
    },
  ],

  // Creative & Portfolio
  portfolio: [
    {
      name: 'Creative Dark',
      description: 'Dark portfolio for creatives',
      colors: {
        primary: '#FF6B6B',    // Coral
        secondary: '#4ECDC4',  // Teal
        accent: '#FFE66D',     // Yellow
        background: '#0D0D0D', // Black
        text: '#FFFFFF',       // White
      },
      suggestedImages: ['lavori creativi', 'design projects', 'mockup', 'workspace'],
      mood: ['creativo', 'audace', 'artistico', 'espressivo'],
    },
    {
      name: 'Minimal Portfolio',
      description: 'Clean minimal portfolio',
      colors: {
        primary: '#000000',    // Black
        secondary: '#666666',  // Gray
        accent: '#FFFFFF',     // White
        background: '#FAFAFA', // Off-white
        text: '#1A1A1A',       // Near black
      },
      suggestedImages: ['tipografia', 'layout pulito', 'fotografia artistica', 'white space'],
      mood: ['minimalista', 'elegante', 'professionale', 'raffinato'],
    },
  ],

  // Health & Medical
  medical: [
    {
      name: 'Healthcare Trust',
      description: 'Professional medical/healthcare',
      colors: {
        primary: '#0891B2',    // Cyan
        secondary: '#059669',  // Emerald
        accent: '#F0FDFA',     // Light teal
        background: '#FFFFFF', // White
        text: '#164E63',       // Dark cyan
      },
      suggestedImages: ['medico', 'ospedale moderno', 'tecnologia medica', 'cura paziente'],
      mood: ['affidabile', 'pulito', 'professionale', 'rassicurante'],
    },
  ],

  // Education
  education: [
    {
      name: 'Learning Platform',
      description: 'Modern education/e-learning',
      colors: {
        primary: '#7C3AED',    // Violet
        secondary: '#F59E0B',  // Amber
        accent: '#10B981',     // Emerald
        background: '#F5F3FF', // Light violet
        text: '#1E1B4B',       // Dark indigo
      },
      suggestedImages: ['studenti', 'libri', 'laptop studio', 'aula moderna'],
      mood: ['stimolante', 'accessibile', 'giovane', 'innovativo'],
    },
  ],

  // Finance & Banking
  finance: [
    {
      name: 'Fintech Modern',
      description: 'Modern financial services',
      colors: {
        primary: '#0066FF',    // Blue
        secondary: '#00D4AA',  // Teal
        accent: '#FFB800',     // Gold
        background: '#0A1628', // Dark navy
        text: '#FFFFFF',       // White
      },
      suggestedImages: ['grafici finanziari', 'app mobile banking', 'carte credito', 'investimenti'],
      mood: ['sicuro', 'innovativo', 'affidabile', 'moderno'],
    },
    {
      name: 'Traditional Banking',
      description: 'Classic banking institution',
      colors: {
        primary: '#1E3A5F',    // Navy
        secondary: '#8B7355',  // Bronze
        accent: '#D4AF37',     // Gold
        background: '#FFFFFF', // White
        text: '#1A1A1A',       // Black
      },
      suggestedImages: ['edificio banca', 'consulenza', 'famiglia', 'crescita'],
      mood: ['tradizionale', 'solido', 'prestigioso', 'affidabile'],
    },
  ],

  // Travel & Hospitality
  travel: [
    {
      name: 'Adventure',
      description: 'Travel and adventure',
      colors: {
        primary: '#F97316',    // Orange
        secondary: '#0EA5E9',  // Sky blue
        accent: '#22C55E',     // Green
        background: '#0C1221', // Dark blue
        text: '#F8FAFC',       // White
      },
      suggestedImages: ['paesaggi', 'avventura', 'viaggiatori', 'destinazioni esotiche'],
      mood: ['avventuroso', 'libero', 'esplorativo', 'emozionante'],
    },
    {
      name: 'Luxury Hotel',
      description: 'Premium hospitality',
      colors: {
        primary: '#78350F',    // Amber dark
        secondary: '#D4AF37',  // Gold
        accent: '#FEF3C7',     // Cream
        background: '#1C1917', // Stone dark
        text: '#FAFAF9',       // Stone light
      },
      suggestedImages: ['hotel lusso', 'suite', 'spa', 'concierge'],
      mood: ['lussuoso', 'rilassante', 'esclusivo', 'premium'],
    },
  ],

  // Music & Entertainment
  music: [
    {
      name: 'Concert Vibes',
      description: 'Live music and events',
      colors: {
        primary: '#DC2626',    // Red
        secondary: '#7C3AED',  // Purple
        accent: '#FBBF24',     // Yellow
        background: '#0F0F0F', // Black
        text: '#FFFFFF',       // White
      },
      suggestedImages: ['concerto', 'palco', 'folla', 'luci'],
      mood: ['energico', 'vibrante', 'emozionante', 'dinamico'],
    },
    {
      name: 'DJ/Producer',
      description: 'Electronic music aesthetic',
      colors: {
        primary: '#00FFFF',    // Cyan
        secondary: '#FF00FF',  // Magenta
        accent: '#FFFF00',     // Yellow
        background: '#0A0A0A', // Black
        text: '#FFFFFF',       // White
      },
      suggestedImages: ['DJ', 'sintetizzatore', 'club', 'visualizer'],
      mood: ['elettronico', 'futuristico', 'notturno', 'underground'],
    },
  ],

  // Coffee & Cafe
  coffee: [
    {
      name: 'Artisan Coffee',
      description: 'Specialty coffee shop',
      colors: {
        primary: '#78350F',    // Coffee brown
        secondary: '#D4A574',  // Latte
        accent: '#FEF3C7',     // Cream
        background: '#1C1917', // Espresso
        text: '#FAFAF9',       // Milk white
      },
      suggestedImages: ['tazza caffe', 'barista', 'chicchi', 'latte art'],
      mood: ['artigianale', 'caldo', 'accogliente', 'autentico'],
    },
  ],

  // Nature & Environment
  nature: [
    {
      name: 'Eco Green',
      description: 'Environmental/sustainable brands',
      colors: {
        primary: '#166534',    // Forest green
        secondary: '#84CC16',  // Lime
        accent: '#FEF08A',     // Light yellow
        background: '#F0FDF4', // Light green
        text: '#14532D',       // Dark green
      },
      suggestedImages: ['foresta', 'foglie', 'sostenibilita', 'energia verde'],
      mood: ['naturale', 'sostenibile', 'fresco', 'organico'],
    },
  ],
};

/**
 * Get color palettes for a specific topic
 */
export function getPalettesByTopic(topic: string): TopicPalette[] {
  const normalizedTopic = topic.toLowerCase();

  // Direct match
  if (TOPIC_PALETTES[normalizedTopic]) {
    return TOPIC_PALETTES[normalizedTopic];
  }

  // Keyword matching
  const keywordMap: Record<string, string> = {
    // Wine related
    'vino': 'wine',
    'cantina': 'wine',
    'enoteca': 'wine',
    'sommelier': 'wine',
    'spirits': 'wine',
    'cocktail': 'wine',
    'bar': 'wine',

    // Food related
    'ristorante': 'restaurant',
    'food': 'restaurant',
    'cibo': 'restaurant',
    'cucina': 'restaurant',
    'chef': 'restaurant',
    'pizzeria': 'restaurant',
    'trattoria': 'restaurant',

    // Tech related
    'saas': 'tech',
    'software': 'tech',
    'app': 'tech',
    'startup': 'tech',
    'ai': 'tech',
    'tecnologia': 'tech',

    // Fitness
    'gym': 'fitness',
    'palestra': 'fitness',
    'yoga': 'fitness',
    'wellness': 'fitness',
    'sport': 'fitness',

    // Fashion
    'moda': 'fashion',
    'abbigliamento': 'fashion',
    'luxury': 'fashion',

    // Real estate
    'immobiliare': 'realestate',
    'casa': 'realestate',
    'architettura': 'realestate',
    'architecture': 'realestate',

    // Portfolio
    'portfolio': 'portfolio',
    'creative': 'portfolio',
    'designer': 'portfolio',
    'artista': 'portfolio',

    // Medical
    'medico': 'medical',
    'salute': 'medical',
    'healthcare': 'medical',
    'clinica': 'medical',

    // Education
    'scuola': 'education',
    'corso': 'education',
    'learning': 'education',
    'formazione': 'education',

    // Finance
    'banca': 'finance',
    'finanza': 'finance',
    'investimenti': 'finance',
    'crypto': 'finance',

    // Travel
    'viaggio': 'travel',
    'hotel': 'travel',
    'turismo': 'travel',
    'vacanza': 'travel',

    // Music
    'musica': 'music',
    'band': 'music',
    'musicista': 'music',
    'festival': 'music',

    // Coffee
    'caffe': 'coffee',
    'cafe': 'coffee',
    'bakery': 'coffee',

    // Nature
    'natura': 'nature',
    'eco': 'nature',
    'green': 'nature',
    'sostenibile': 'nature',
  };

  for (const [keyword, category] of Object.entries(keywordMap)) {
    if (normalizedTopic.includes(keyword)) {
      return TOPIC_PALETTES[category] || [];
    }
  }

  // Return tech as default (most versatile)
  return TOPIC_PALETTES['tech'];
}

/**
 * Get a specific palette by topic and index
 */
export function getPalette(topic: string, index: number = 0): TopicPalette | undefined {
  const palettes = getPalettesByTopic(topic);
  return palettes[index % palettes.length];
}

/**
 * Format palette for AI prompt injection
 */
export function formatPaletteForPrompt(palette: TopicPalette): string {
  return `
SELECTED COLOR PALETTE: "${palette.name}"
- Primary: ${palette.colors.primary}
- Secondary: ${palette.colors.secondary}
- Accent: ${palette.colors.accent}
- Background: ${palette.colors.background}
- Text: ${palette.colors.text}

MOOD: ${palette.mood.join(', ')}
SUGGESTED IMAGERY: ${palette.suggestedImages.join(', ')}
`;
}
