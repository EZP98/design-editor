/**
 * Canvas Element Types
 *
 * Defines the structure for visual elements on the canvas.
 * Similar to Plasmic's element model with responsive, variants, and interactions support.
 */

import { Variant, Interaction, Animation, TransitionConfig } from './interactions';
import { ResponsiveStyles } from './responsive';

export type ElementType =
  | 'frame'
  | 'text'
  | 'button'
  | 'image'
  | 'input'
  | 'link'
  | 'icon'
  | 'video'
  | 'stack'
  | 'grid'
  | 'page'
  // Layout elements
  | 'section'
  | 'container'
  | 'row'
  | 'card'
  // 3D elements
  | 'model3d';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ElementStyles {
  // Layout
  display?: 'block' | 'flex' | 'grid' | 'inline' | 'inline-block' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
  alignSelf?: 'auto' | 'flex-start' | 'center' | 'flex-end' | 'stretch';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  flexGrow?: number;
  flexShrink?: number;
  flex?: number | string;
  gap?: number;
  rowGap?: number;
  columnGap?: number;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;

  // Spacing
  padding?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  margin?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;

  // Background
  backgroundColor?: string;
  backgroundImage?: string;
  background?: string; // Shorthand for gradient text effects
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;

  // Border
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  borderWidth?: number;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';

  // Typography
  fontSize?: number;
  fontWeight?: number | string;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textAlignVertical?: 'top' | 'center' | 'bottom';
  lineHeight?: number;
  letterSpacing?: number;
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap';

  // Text Effects (for Kittl-style effects)
  textShadow?: string;
  WebkitTextStroke?: string;
  WebkitTextFillColor?: string;
  WebkitBackgroundClip?: string;
  backgroundClip?: string;

  // Effects
  opacity?: number;
  boxShadow?: string;
  filter?: string;
  backdropFilter?: string;
  mixBlendMode?: string;

  // Transform
  transform?: string;
  transformOrigin?: string;

  // Transition (for smooth state changes)
  transition?: string;

  // Overflow
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';

  // Cursor
  cursor?: string;

  // Z-index
  zIndex?: number;

  // Sizing constraints
  minWidth?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string;

  // Resize mode (like Figma)
  resizeX?: 'fixed' | 'fill' | 'hug';
  resizeY?: 'fixed' | 'fill' | 'hug';

  // Aspect ratio
  aspectRatio?: string;

  // Object fit (for images/videos)
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;

  // Image filters (CSS filter components)
  brightness?: number;  // 0-200, default 100
  contrast?: number;    // 0-200, default 100
  saturation?: number;  // 0-200, default 100
  blur?: number;        // 0-20px, default 0
  grayscale?: number;   // 0-100, default 0
  hueRotate?: number;   // 0-360 degrees
  invert?: number;      // 0-100, default 0
  sepia?: number;       // 0-100, default 0
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  name: string;

  // Position & Size (relative to parent or canvas)
  position: Position;
  size: Size;

  // For absolute positioning within parent
  positionType: 'relative' | 'absolute';

  // Base styles (default/desktop)
  styles: ElementStyles;

  // Responsive style overrides per breakpoint
  responsiveStyles?: ResponsiveStyles;

  // Variants (hover, active, focus, disabled, custom)
  variants?: Variant[];

  // Interactions (click, hover, scroll triggers with actions)
  interactions?: Interaction[];

  // Animations
  animations?: Animation[];

  // Default transition for all state changes
  defaultTransition?: TransitionConfig;

  // Content (for text, button, link)
  content?: string;

  // For images
  src?: string;
  alt?: string;

  // Image crop data (percentages 0-100)
  crop?: {
    x: number;      // Left offset as percentage of original
    y: number;      // Top offset as percentage of original
    width: number;  // Width as percentage of original
    height: number; // Height as percentage of original
  };

  // Original image dimensions (for crop calculations)
  originalWidth?: number;
  originalHeight?: number;

  // For videos
  videoSrc?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;

  // For 3D models
  modelSrc?: string;           // URL to GLB/GLTF file
  modelPoster?: string;        // Poster image while loading
  cameraOrbit?: string;        // e.g., "45deg 55deg 2m"
  cameraTarget?: string;       // e.g., "0m 0m 0m"
  autoRotate?: boolean;        // Auto-rotate model
  autoRotateDelay?: number;    // Delay before auto-rotate starts (ms)
  environmentImage?: string;   // Environment lighting (neutral, legacy, etc.)
  shadowIntensity?: number;    // Shadow intensity 0-1
  exposure?: number;           // Exposure 0-2
  modelScale?: string;         // Scale override

  // 3D Canvas positioning (used in 3D editor mode)
  position3d?: [number, number, number];  // X, Y, Z position in 3D space
  rotation3d?: [number, number, number];  // X, Y, Z rotation in radians
  scale3d?: [number, number, number];     // X, Y, Z scale

  // For icons
  iconName?: string;
  iconSize?: number;

  // For inputs
  placeholder?: string;
  inputType?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  inputName?: string;
  required?: boolean;
  disabled?: boolean;

  // For links
  href?: string;
  target?: '_self' | '_blank';

  // Hierarchy
  parentId: string | null;
  children: string[];

  // State
  locked: boolean;
  visible: boolean;

  // For code generation
  componentName?: string;

  // Data binding (for dynamic content)
  dataBinding?: {
    source: 'state' | 'props' | 'api';
    path: string;
    fallback?: string;
  };

  // Accessibility
  ariaLabel?: string;
  ariaRole?: string;
  tabIndex?: number;
}

export interface CanvasPage {
  id: string;
  name: string;
  rootElementId: string;
  backgroundColor?: string;
  width: number;
  height: number;
  // Position on canvas (for dragging artboards like Figma)
  x: number;
  y: number;
  // Page notes/annotations
  notes?: string;
}

// Canvas settings for customization
export type EditorTheme = 'dark' | 'light';

export interface CanvasSettings {
  canvasBackground: string;
  selectionColor: string;
  showGrid: boolean;
  gridSize: number;
  editorTheme: EditorTheme;
}

export const DEFAULT_CANVAS_SETTINGS: CanvasSettings = {
  canvasBackground: '#0a0808',
  selectionColor: '#8B5CF6',
  showGrid: true,
  gridSize: 20,
  editorTheme: 'dark',
};

// Theme color definitions
export const THEME_COLORS = {
  dark: {
    // Editor UI - ReactBits Dark Glassmorphism
    editorBg: '#09090b',
    sidebarBg: 'rgba(255, 255, 255, 0.02)',
    panelBg: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderColorStrong: 'rgba(255, 255, 255, 0.12)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textMuted: 'rgba(255, 255, 255, 0.5)',
    textDimmed: 'rgba(255, 255, 255, 0.3)',
    // Canvas
    canvasBg: '#09090b',
    canvasGrid: 'rgba(255, 255, 255, 0.03)',
    // Accent - Purple (ReactBits style)
    accent: '#8B5CF6',
    accentLight: 'rgba(139, 92, 246, 0.15)',
    accentMedium: 'rgba(139, 92, 246, 0.3)',
    accentHover: '#7C3AED',
    // Interactive - Glassmorphism
    hoverBg: 'rgba(255, 255, 255, 0.05)',
    activeBg: 'rgba(255, 255, 255, 0.08)',
    inputBg: 'rgba(255, 255, 255, 0.05)',
    // Toolbar
    toolbarBg: 'rgba(9, 9, 11, 0.95)',
    toolbarBorder: 'rgba(255, 255, 255, 0.08)',
    // Glass effects
    glassBg: 'rgba(255, 255, 255, 0.05)',
    glassHover: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },
  light: {
    // Editor UI
    editorBg: '#fafafa',
    sidebarBg: '#ffffff',
    panelBg: '#ffffff',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderColorStrong: 'rgba(0, 0, 0, 0.1)',
    textPrimary: '#1a1a1a',
    textSecondary: '#525252',
    textMuted: '#737373',
    textDimmed: '#a3a3a3',
    // Canvas
    canvasBg: '#f5f5f5',
    canvasGrid: 'rgba(0, 0, 0, 0.04)',
    // Accent - Purple
    accent: '#8B5CF6',
    accentLight: 'rgba(139, 92, 246, 0.08)',
    accentMedium: 'rgba(139, 92, 246, 0.15)',
    accentHover: '#7C3AED',
    // Interactive
    hoverBg: 'rgba(0, 0, 0, 0.03)',
    activeBg: 'rgba(0, 0, 0, 0.06)',
    inputBg: 'rgba(0, 0, 0, 0.04)',
    // Toolbar
    toolbarBg: 'rgba(255, 255, 255, 0.98)',
    toolbarBorder: 'rgba(0, 0, 0, 0.08)',
    // Glass effects (subtle for light theme)
    glassBg: 'rgba(0, 0, 0, 0.02)',
    glassHover: 'rgba(0, 0, 0, 0.04)',
    glassBorder: 'rgba(0, 0, 0, 0.08)',
  },
} as const;

export interface CanvasState {
  projectName: string;
  pages: Record<string, CanvasPage>;
  elements: Record<string, CanvasElement>;
  currentPageId: string;
  selectedElementIds: string[];
  hoveredElementId: string | null;

  // Canvas settings
  canvasSettings: CanvasSettings;

  // Clipboard
  clipboard: CanvasElement[] | null;

  // History for undo/redo
  history: CanvasHistoryEntry[];
  historyIndex: number;

  // Right panel state
  activeRightPanel: 'properties' | 'ai-image' | null;

  // Page settings panel visibility
  showPageSettings: boolean;
}

export interface CanvasHistoryEntry {
  elements: Record<string, CanvasElement>;
  pages: Record<string, CanvasPage>;
  timestamp: number;
  action: string;
}

// Default element configurations
export const DEFAULT_ELEMENT_CONFIGS: Record<ElementType, Partial<CanvasElement>> = {
  page: {
    size: { width: 1440, height: 900 },
    styles: {
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      resizeY: 'hug', // Default to hug so page height auto-expands with content
    },
  },
  frame: {
    size: { width: 200, height: 200 },
    styles: {
      backgroundColor: '#f3f4f6',
      borderRadius: 0,
      padding: 0,
    },
  },
  stack: {
    size: { width: 200, height: 150 },
    styles: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: 16,
      backgroundColor: '#f9fafb',
      borderRadius: 8,
    },
  },
  grid: {
    size: { width: 300, height: 200 },
    styles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 0,
      padding: 0,
    },
  },
  text: {
    size: { width: 200, height: 40 },
    content: 'Add your text here',
    styles: {
      fontSize: 16,
      color: '#1f2937',
      lineHeight: 1.5,
      resizeX: 'hug',  // Auto-size width like Figma
      resizeY: 'hug',  // Auto-size height like Figma
    },
  },
  button: {
    size: { width: 120, height: 44 },
    content: 'Button',
    styles: {
      backgroundColor: '#8B5CF6',
      color: '#ffffff',
      fontSize: 14,
      fontWeight: 500,
      borderRadius: 8,
      padding: 12,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
  image: {
    size: { width: 200, height: 150 },
    src: 'https://picsum.photos/400/300',
    alt: 'Random image',
    styles: {
      borderRadius: 8,
      overflow: 'hidden',
    },
  },
  input: {
    size: { width: 250, height: 44 },
    placeholder: 'Enter text...',
    inputType: 'text',
    styles: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderStyle: 'solid',
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
    },
  },
  link: {
    size: { width: 100, height: 24 },
    content: 'Link text',
    href: '#',
    target: '_self',
    styles: {
      color: '#8B5CF6',
      fontSize: 14,
      textDecoration: 'underline',
      cursor: 'pointer',
      resizeX: 'hug',  // Auto-size like Figma text
      resizeY: 'hug',
    },
  },
  icon: {
    size: { width: 24, height: 24 },
    iconName: 'star',
    iconSize: 24,
    styles: {
      color: '#8B5CF6',
    },
  },
  video: {
    size: { width: 400, height: 225 },
    videoSrc: '',
    autoplay: false,
    loop: false,
    muted: true,
    controls: true,
    styles: {
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: '#18181b',
    },
  },
  // Layout elements
  section: {
    size: { width: 1200, height: 400 },
    styles: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 64,
      gap: 24,
      backgroundColor: '#ffffff',
    },
  },
  container: {
    size: { width: 1140, height: 200 },
    styles: {
      display: 'flex',
      flexDirection: 'column',
      padding: 24,
      gap: 16,
      backgroundColor: 'transparent',
    },
  },
  row: {
    size: { width: 1000, height: 100 },
    styles: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      padding: 16,
    },
  },
  card: {
    size: { width: 300, height: 200 },
    styles: {
      display: 'flex',
      flexDirection: 'column',
      padding: 16,
      gap: 12,
      backgroundColor: '#ffffff',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      borderStyle: 'solid',
    },
  },
  // 3D Model element
  model3d: {
    size: { width: 400, height: 300 },
    modelSrc: '',
    autoRotate: true,
    autoRotateDelay: 3000,
    environmentImage: 'neutral',
    shadowIntensity: 1,
    exposure: 1,
    cameraOrbit: '0deg 75deg 105%',
    styles: {
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: '#18181b',
    },
  },
};
