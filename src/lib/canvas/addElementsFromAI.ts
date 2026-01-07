/**
 * Add Elements From AI
 *
 * Converts AI-generated element definitions to actual canvas elements.
 * This bridges the gap between AI output and the visual canvas.
 *
 * SUPPORTS TWO FORMATS:
 * 1. Legacy format: { styles: { display, flexDirection, ... } }
 * 2. New semantic format: { sizing: {...}, layout: {...}, style: {...}, animation: {...} }
 *
 * INCLUDES POST-PROCESSING to fix common AI mistakes:
 * - Header heights limited to 80px max
 * - Button heights limited to 52px max
 * - Sections get proper padding and auto-layout
 */

import { useCanvasStore, generateId } from './canvasStore';
import { CanvasElementData } from '../artifactParser';
import { ElementType, ElementStyles, CanvasElement } from './types';

/**
 * New semantic format types (AI Design Studio v2 pattern)
 */
interface SemanticSizing {
  width?: 'fill' | 'fit' | 'fixed';
  height?: 'fill' | 'fit' | 'fixed';
  fixedWidth?: number;
  fixedHeight?: number;
}

interface SemanticLayout {
  direction?: 'column' | 'row';
  gap?: number;
  padding?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  align?: 'center' | 'start' | 'end' | 'stretch';
  alignSelf?: 'center' | 'flex-start' | 'flex-end' | 'stretch';
}

interface SemanticAnimation {
  preset?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'bounce' | 'pulse';
  delay?: number;
  duration?: number;
}

interface SemanticElementData extends CanvasElementData {
  sizing?: SemanticSizing;
  layout?: SemanticLayout;
  style?: Record<string, unknown>; // New format uses 'style' (singular)
  animation?: SemanticAnimation;
}

// Default Unsplash images for different contexts
const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', // abstract
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800', // tech
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', // work
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800', // team
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', // office
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800', // meeting
];

let imageIndex = 0;
function getNextDefaultImage(): string {
  const img = DEFAULT_IMAGES[imageIndex % DEFAULT_IMAGES.length];
  imageIndex++;
  return img;
}

/**
 * Convert semantic format (sizing/layout/style) to legacy format (styles)
 * This normalizes both formats to work with the existing canvas system
 */
function normalizeToLegacyFormat(data: SemanticElementData): CanvasElementData {
  const normalized: CanvasElementData = {
    type: data.type,
    name: data.name,
    content: data.content || (data as any).text, // AI sometimes uses 'text' instead of 'content'
    src: data.src,
    href: data.href,
    iconName: data.iconName,
    imagePrompt: (data as any).imagePrompt, // AI image generation prompt
    children: data.children,
  };

  // Build styles from semantic properties
  const styles: Record<string, unknown> = {};

  // Process sizing
  if (data.sizing) {
    const sizing = data.sizing;

    // Width sizing
    if (sizing.width === 'fill') {
      styles.resizeX = 'fill';
    } else if (sizing.width === 'fit') {
      styles.resizeX = 'hug';
    } else if (sizing.width === 'fixed' && sizing.fixedWidth) {
      styles.resizeX = 'fixed';
      styles.width = sizing.fixedWidth;
    }

    // Height sizing
    if (sizing.height === 'fill') {
      styles.resizeY = 'fill';
    } else if (sizing.height === 'fit') {
      styles.resizeY = 'hug';
    } else if (sizing.height === 'fixed' && sizing.fixedHeight) {
      styles.resizeY = 'fixed';
      styles.height = sizing.fixedHeight;
    }
  }

  // Process layout (container properties)
  if (data.layout) {
    const layout = data.layout;

    styles.display = 'flex';
    styles.flexDirection = layout.direction || 'column';

    if (layout.gap !== undefined) styles.gap = layout.gap;
    if (layout.padding !== undefined) styles.padding = layout.padding;
    if (layout.paddingTop !== undefined) styles.paddingTop = layout.paddingTop;
    if (layout.paddingRight !== undefined) styles.paddingRight = layout.paddingRight;
    if (layout.paddingBottom !== undefined) styles.paddingBottom = layout.paddingBottom;
    if (layout.paddingLeft !== undefined) styles.paddingLeft = layout.paddingLeft;

    // Align maps to alignItems
    if (layout.align) {
      const alignMap: Record<string, string> = {
        center: 'center',
        start: 'flex-start',
        end: 'flex-end',
        stretch: 'stretch',
      };
      styles.alignItems = alignMap[layout.align] || 'stretch';
    }

    // alignSelf goes directly
    if (layout.alignSelf) {
      styles.alignSelf = layout.alignSelf;
    }
  }

  // Process style (visual properties)
  if (data.style) {
    const style = data.style;

    // Map style properties
    if (style.background) styles.backgroundColor = style.background;
    if (style.color) styles.color = style.color;
    if (style.fontSize) styles.fontSize = style.fontSize;
    if (style.fontWeight) styles.fontWeight = style.fontWeight;
    if (style.borderRadius) styles.borderRadius = style.borderRadius;
    if (style.border) {
      // Parse border: "1px solid #color"
      const borderMatch = (style.border as string).match(/(\d+)px\s+(\w+)\s+(#[\w]+|rgba?\([^)]+\))/);
      if (borderMatch) {
        styles.borderWidth = parseInt(borderMatch[1]);
        styles.borderStyle = borderMatch[2];
        styles.borderColor = borderMatch[3];
      }
    }

    // Direct mappings for other style properties
    const directStyleProps = [
      'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition',
      'boxShadow', 'opacity', 'overflow', 'textAlign', 'lineHeight', 'letterSpacing',
      'paddingX', 'paddingY', 'minHeight', 'maxWidth', 'minWidth',
    ];
    for (const prop of directStyleProps) {
      if (style[prop] !== undefined) {
        // Handle paddingX/paddingY
        if (prop === 'paddingX') {
          styles.paddingLeft = style[prop];
          styles.paddingRight = style[prop];
        } else if (prop === 'paddingY') {
          styles.paddingTop = style[prop];
          styles.paddingBottom = style[prop];
        } else {
          styles[prop] = style[prop];
        }
      }
    }
  }

  // Merge with legacy styles if present
  if (data.styles) {
    Object.assign(styles, data.styles);
  }

  normalized.styles = styles;

  // Store animation data (for future use)
  if (data.animation) {
    // Store in styles for now, could be used by animation system later
    (normalized as any)._animation = data.animation;
  }

  // Recursively normalize children
  if (data.children && data.children.length > 0) {
    normalized.children = data.children.map(child =>
      normalizeToLegacyFormat(child as SemanticElementData)
    );
  }

  return normalized;
}

/**
 * POST-PROCESSING: Fix common AI mistakes before adding to canvas
 * AI often generates nonsensical sizes, this normalizes them
 */
function sanitizeElementData(data: CanvasElementData): CanvasElementData {
  const sanitized = { ...data };
  const styles = { ...(data.styles || {}) };
  const nameLower = (data.name || '').toLowerCase();
  const typeLower = (data.type || '').toLowerCase();

  // IMAGE FIX: Add default src if missing
  if (typeLower === 'image' && !data.src) {
    console.log(`[Sanitize] Added default image for ${data.name || 'image'}`);
    sanitized.src = getNextDefaultImage();
  }

  // HEADER FIX: Max height 80px
  if (nameLower.includes('header') || nameLower.includes('nav') || nameLower.includes('navbar')) {
    if (styles.height && (styles.height as number) > 80) {
      console.log(`[Sanitize] Fixed header height: ${styles.height} -> 80`);
      styles.height = 80;
    }
    if (styles.minHeight && (styles.minHeight as number) > 100) {
      styles.minHeight = 80;
    }
    // Headers should have horizontal layout
    if (!styles.display) styles.display = 'flex';
    if (!styles.flexDirection) styles.flexDirection = 'row';
    if (!styles.alignItems) styles.alignItems = 'center';
    if (!styles.justifyContent) styles.justifyContent = 'space-between';
    if (!styles.padding) styles.padding = 16;
    if (styles.padding && (styles.padding as number) > 32) styles.padding = 24;
  }

  // BUTTON FIX: Max height 52px, reasonable padding
  if (typeLower === 'button') {
    if (styles.height && (styles.height as number) > 52) {
      console.log(`[Sanitize] Fixed button height: ${styles.height} -> 48`);
      styles.height = 48;
    }
    if (styles.padding && (styles.padding as number) > 20) {
      styles.padding = 16;
    }
    if (styles.fontSize && (styles.fontSize as number) > 18) {
      styles.fontSize = 16;
    }
  }

  // SECTION FIX: Reasonable padding and minHeight
  if (typeLower === 'section') {
    if (styles.padding && (styles.padding as number) > 140) {
      console.log(`[Sanitize] Fixed section padding: ${styles.padding} -> 100`);
      styles.padding = 100;
    }
    if (styles.minHeight && (styles.minHeight as number) > 800) {
      styles.minHeight = 700;
    }
    // Ensure flex column layout
    if (!styles.display) styles.display = 'flex';
    if (!styles.flexDirection) styles.flexDirection = 'column';
    if (!styles.alignItems) styles.alignItems = 'center';
    if (!styles.gap) styles.gap = 32;
  }

  // TEXT FIX: Reasonable font sizes
  if (typeLower === 'text') {
    if (styles.fontSize && (styles.fontSize as number) > 96) {
      console.log(`[Sanitize] Fixed title fontSize: ${styles.fontSize} -> 72`);
      styles.fontSize = 72;
    }
  }

  // ROW/FRAME/CARD FIX: Ensure auto-layout
  if (typeLower === 'row' || typeLower === 'frame' || typeLower === 'stack' || typeLower === 'card') {
    if (!styles.display) styles.display = 'flex';
    if (typeLower === 'row' && !styles.flexDirection) styles.flexDirection = 'row';
    if ((typeLower === 'stack' || typeLower === 'card') && !styles.flexDirection) styles.flexDirection = 'column';
    if (!styles.gap) styles.gap = 16;

    // Cards get default styling if not specified
    if (typeLower === 'card') {
      if (!styles.backgroundColor) styles.backgroundColor = '#FFFFFF';
      if (!styles.borderRadius) styles.borderRadius = 12;
      if (!styles.padding) styles.padding = 16;
    }
  }

  sanitized.styles = styles;

  // Recursively sanitize children
  if (data.children && data.children.length > 0) {
    sanitized.children = data.children.map(child => sanitizeElementData(child));
  }

  return sanitized;
}

/**
 * Recursively add AI-generated elements to the canvas
 * @returns The ID of the root element created
 */
export function addElementsFromAI(
  elements: CanvasElementData[],
  parentId?: string
): string[] {
  const store = useCanvasStore.getState();
  const createdIds: string[] = [];

  // If no parentId provided, use current page root
  if (!parentId) {
    const currentPage = store.getCurrentPage();
    if (currentPage) {
      parentId = currentPage.rootElementId;
    } else {
      console.error('[AddElementsFromAI] No current page found!');
      return [];
    }
  }

  if (!store.elements[parentId!]) {
    console.error('[AddElementsFromAI] Parent element not found:', parentId);
    return [];
  }

  for (const element of elements) {
    // 1. Normalize semantic format to legacy format (if needed)
    const normalizedElement = normalizeToLegacyFormat(element as SemanticElementData);

    // 2. POST-PROCESS: Sanitize element data to fix AI mistakes
    const sanitizedElement = sanitizeElementData(normalizedElement);

    // 3. Add to canvas
    const id = addSingleElement(sanitizedElement, parentId);
    if (id) {
      createdIds.push(id);
    }
  }

  // Select the created elements
  if (createdIds.length > 0) {
    store.deselectAll();
    createdIds.forEach((id, index) => {
      store.selectElement(id, index > 0);
    });
  }

  // Save to history
  store.saveToHistory('AI: Added elements');

  return createdIds;
}

/**
 * Add a single element and its children recursively
 */
function addSingleElement(
  data: CanvasElementData,
  parentId?: string
): string | null {
  // IMPORTANT: Always get fresh state for each element to see latest updates
  const store = useCanvasStore.getState();

  // Map AI type to canvas element type
  const elementType = mapElementType(data.type);

  // Check parent's layout mode to determine smart defaults
  // Re-fetch parent to get latest state (important for recursive calls)
  let parentHasAutoLayout = false;
  let parentFlexDirection: 'row' | 'column' = 'column';

  if (parentId) {
    // Get fresh parent state
    const parent = useCanvasStore.getState().getElement(parentId);
    if (parent) {
      const parentStyles = parent.styles;
      parentHasAutoLayout = parentStyles.display === 'flex' || parentStyles.display === 'grid';
      parentFlexDirection = (parentStyles.flexDirection as 'row' | 'column') || 'column';
      console.log(`[AddElementsFromAI] Parent "${parent.name}" (${parent.type}) display=${parentStyles.display}, hasAutoLayout=${parentHasAutoLayout}, dir=${parentFlexDirection}`);
    }
  } else {
    // If no parentId, we're adding to page root which has auto-layout
    parentHasAutoLayout = true;
    parentFlexDirection = 'column';
    console.log('[AddElementsFromAI] No parentId, assuming page root with auto-layout');
  }

  // Calculate position (if no parentId, center in viewport)
  const position = { x: 100, y: 100 };

  // Create the element
  const elementId = store.addElement(elementType, parentId, position);

  if (!elementId) {
    console.warn('[AddElementsFromAI] Failed to create element:', data.type);
    return null;
  }

  // Update element properties
  if (data.name) {
    store.renameElement(elementId, data.name);
  }

  // Handle content - AI sometimes uses 'text' instead of 'content'
  const textContent = data.content || (data as any).text;
  if (textContent) {
    store.updateElementContent(elementId, textContent);
  }

  if (data.styles) {
    const styles = convertStyles(data.styles);

    // Container types that should always fill width
    const containerTypes = ['section', 'frame', 'stack', 'container', 'row', 'card'];
    const isContainer = containerTypes.includes(elementType);

    // RESPONSIVE LAYOUT RULES:
    // 1. All containers fill width
    // 2. In COLUMN layout, text elements fill width for proper alignment
    // 3. In ROW layout, elements get flex properties

    if (isContainer) {
      styles.resizeX = 'fill';
      console.log(`[AddElementsFromAI] Container ${elementType} "${data.name}" -> resizeX:fill`);
    }

    // Text elements in column layout should fill width for proper text alignment
    if (elementType === 'text' && parentFlexDirection === 'column') {
      styles.resizeX = 'fill';
      console.log(`[AddElementsFromAI] Text in column "${data.name}" -> resizeX:fill`);
    }

    // Row elements should always have flex display and fill
    if (elementType === 'row' || data.type === 'row') {
      if (!styles.display) styles.display = 'flex';
      if (!styles.flexDirection) styles.flexDirection = 'row';
      if (!styles.alignItems) styles.alignItems = 'center';
      if (!styles.gap) styles.gap = 16;
      styles.resizeX = 'fill';
    }

    // Sections are full-width flex containers
    if (elementType === 'section') {
      styles.display = 'flex';
      styles.flexDirection = styles.flexDirection || 'column';
      styles.alignItems = styles.alignItems || 'center';
      styles.resizeX = 'fill';
      if (!styles.minHeight) styles.minHeight = 500;
      if (!styles.padding) styles.padding = 80;
    }

    console.log(`[AddElementsFromAI] Updating styles for ${elementId}:`, JSON.stringify(styles));
    store.updateElementStyles(elementId, styles);

    // Verify the update worked
    const updatedElement = store.getElement(elementId);
    console.log(`[AddElementsFromAI] After update, resizeX = ${updatedElement?.styles?.resizeX}`);

    // Handle width/height separately (they go in element.size)
    const width = data.styles.width as number | undefined;
    const height = data.styles.height as number | undefined;
    if (width || height) {
      const element = store.getElement(elementId);
      if (element) {
        const newSize = {
          width: width || element.size.width,
          height: height || element.size.height,
        };
        store.resizeElement(elementId, newSize);
      }
    }
  } else {
    // Even without styles, containers should fill width and have flex
    const containerTypes = ['section', 'frame', 'stack', 'container', 'row', 'card'];
    if (containerTypes.includes(elementType)) {
      const defaultStyles: Record<string, unknown> = { resizeX: 'fill' };

      if (elementType === 'section') {
        defaultStyles.display = 'flex';
        defaultStyles.flexDirection = 'column';
        defaultStyles.minHeight = 400;
      }
      if (elementType === 'row') {
        defaultStyles.display = 'flex';
        defaultStyles.flexDirection = 'row';
      }
      if (elementType === 'card') {
        defaultStyles.display = 'flex';
        defaultStyles.flexDirection = 'column';
        defaultStyles.backgroundColor = '#FFFFFF';
        defaultStyles.borderRadius = 12;
        defaultStyles.padding = 16;
      }

      store.updateElementStyles(elementId, defaultStyles as any);
      console.log(`[AddElementsFromAI] Applied default styles to ${elementType} "${data.name}"`);
    }
  }

  // Update special properties using the store's elements directly
  const element = store.getElement(elementId);
  if (element) {
    const updates: Partial<CanvasElement> = {};

    if (data.src) updates.src = data.src;
    if (data.href) updates.href = data.href;
    if (data.iconName) updates.iconName = data.iconName;

    // CRITICAL: If parent has auto-layout, set positionType to 'relative' so element participates in flex flow
    if (parentHasAutoLayout) {
      updates.positionType = 'relative';
      console.log(`[AddElementsFromAI] Setting positionType=relative for ${data.name} (parent has auto-layout)`);
    }

    // Direct element update via store
    useCanvasStore.setState((state) => ({
      elements: {
        ...state.elements,
        [elementId]: { ...state.elements[elementId], ...updates },
      },
    }));
  }

  // Recursively add children
  // IMPORTANT: Re-fetch state to ensure parent's display:flex is visible
  if (data.children && data.children.length > 0) {
    console.log(`[AddElementsFromAI] Processing ${data.children.length} children for ${data.name || data.type}`);

    // Ensure this element has flex display if it has children (for proper auto-layout)
    const currentElement = useCanvasStore.getState().getElement(elementId);
    if (currentElement && !currentElement.styles.display) {
      // Default to flex column for containers with children
      useCanvasStore.getState().updateElementStyles(elementId, {
        display: 'flex',
        flexDirection: 'column',
      });
    }

    for (const child of data.children) {
      addSingleElement(child, elementId);
    }
  } else {
    console.log(`[AddElementsFromAI] No children for ${data.name || data.type} (type: ${data.type})`);
  }

  // CRITICAL: Ensure element has minimum visible dimensions
  const finalElement = useCanvasStore.getState().getElement(elementId);
  if (finalElement) {
    const MIN_WIDTH = 100;
    const MIN_HEIGHT = 40;
    const needsResize = finalElement.size.width < MIN_WIDTH || finalElement.size.height < MIN_HEIGHT;

    if (needsResize) {
      console.log(`[AddElementsFromAI] Fixing small dimensions for ${data.name}: ${finalElement.size.width}x${finalElement.size.height} -> ${Math.max(finalElement.size.width, MIN_WIDTH)}x${Math.max(finalElement.size.height, MIN_HEIGHT)}`);
      useCanvasStore.getState().resizeElement(elementId, {
        width: Math.max(finalElement.size.width, MIN_WIDTH),
        height: Math.max(finalElement.size.height, MIN_HEIGHT),
      });
    }

    console.log(`[AddElementsFromAI] Created element "${data.name}" (${elementType}): size=${finalElement.size.width}x${finalElement.size.height}, visible=${finalElement.visible}, children=${finalElement.children.length}`);
  }

  return elementId;
}

/**
 * Map AI element type to canvas element type
 */
function mapElementType(aiType: string): ElementType {
  const typeMap: Record<string, ElementType> = {
    // Canvas native types
    frame: 'frame',
    section: 'section',
    stack: 'stack',
    grid: 'grid',
    container: 'container',
    row: 'row',
    card: 'card',
    text: 'text',
    button: 'button',
    link: 'link',
    image: 'image',
    input: 'input',
    icon: 'icon',
    video: 'video',
    divider: 'frame',

    // HTML-style types (AI often generates these)
    h1: 'text',
    h2: 'text',
    h3: 'text',
    h4: 'text',
    h5: 'text',
    h6: 'text',
    p: 'text',
    span: 'text',
    heading: 'text',
    headline: 'text',
    subheading: 'text',
    subheadline: 'text',
    subtitle: 'text',
    paragraph: 'text',
    label: 'text',
    caption: 'text',

    // Layout types
    div: 'frame',
    nav: 'frame',
    header: 'frame',
    footer: 'frame',
    main: 'section',
    article: 'section',
    aside: 'frame',
    navigation: 'frame',
    navbar: 'frame',
    hero: 'section',

    // Interactive
    a: 'link',
    anchor: 'link',
    cta: 'button',

    // Media
    img: 'image',
    figure: 'frame',
    logo: 'image',
    avatar: 'image',
  };

  return typeMap[aiType.toLowerCase()] || 'frame';
}

/**
 * Parse CSS value to number (strips px, rem, em, % units)
 * Handles compound values like "80px 20px" by taking first value
 */
function parseCSSValue(value: unknown): number | string | unknown {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return value;

  // If it's a color (starts with # or rgb), return as-is
  if (value.startsWith('#') || value.startsWith('rgb')) return value;

  // Handle compound values like "80px 20px" - take first value
  const parts = value.trim().split(/\s+/);
  const firstPart = parts[0];

  // Try to extract numeric value with unit
  const match = firstPart.match(/^(-?[\d.]+)(px|rem|em|%|vh|vw)?$/i);
  if (match) {
    const num = parseFloat(match[1]);
    // For %, vh, vw keep as string; for px/rem/em convert to number
    if (match[2] && ['%', 'vh', 'vw'].includes(match[2].toLowerCase())) {
      return value; // Keep percentage/viewport units as string
    }
    return num;
  }

  // Return as-is if not a parseable value
  return value;
}

/**
 * Parse padding/margin shorthand values
 * "80px" -> { all: 80 }
 * "80px 20px" -> { vertical: 80, horizontal: 20 }
 * "10px 20px 30px 40px" -> { top: 10, right: 20, bottom: 30, left: 40 }
 */
function parseSpacingShorthand(value: unknown): {
  all?: number;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
} | null {
  if (typeof value === 'number') return { all: value };
  if (typeof value !== 'string') return null;

  const parts = value.trim().split(/\s+/).map(p => {
    const match = p.match(/^(-?[\d.]+)(px|rem|em)?$/i);
    return match ? parseFloat(match[1]) : null;
  }).filter((v): v is number => v !== null);

  if (parts.length === 0) return null;
  if (parts.length === 1) return { all: parts[0] };
  if (parts.length === 2) return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
  if (parts.length === 4) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };

  return { all: parts[0] };
}

/**
 * Convert rgba() color to hex with alpha
 * Canvas doesn't support rgba(), convert to #rrggbbaa format
 */
function rgbaToHex(rgba: string): string {
  // Check if it's already hex
  if (rgba.startsWith('#')) return rgba;

  // Parse rgba(r, g, b, a) or rgb(r, g, b)
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return rgba; // Return as-is if not rgba

  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  const a = match[4] ? Math.round(parseFloat(match[4]) * 255).toString(16).padStart(2, '0') : 'ff';

  return `#${r}${g}${b}${a}`;
}

/**
 * Convert AI styles to canvas ElementStyles
 * Handles CSS string values like "80px" -> 80
 */
function convertStyles(aiStyles: Record<string, unknown>): Partial<ElementStyles> & { resizeX?: string; resizeY?: string } {
  const styles: Partial<ElementStyles> & { resizeX?: string; resizeY?: string } = {};

  // Properties that should stay as strings (not converted to numbers)
  const stringProps = [
    'display', 'flexDirection', 'justifyContent', 'alignItems', 'flexWrap',
    'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition',
    'color', 'fontFamily', 'textAlign', 'textDecoration', 'textTransform',
    'borderColor', 'borderStyle', 'boxShadow', 'overflow', 'cursor',
    'gridTemplateColumns', 'gridTemplateRows',
  ];

  // Properties that need numeric conversion (px values)
  const numericProps = [
    'gap', 'rowGap', 'columnGap',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
    'borderRadius', 'borderTopLeftRadius', 'borderTopRightRadius',
    'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderWidth',
    'opacity', 'minHeight', 'maxWidth', 'minWidth',
  ];

  // Color properties that need rgba conversion
  const colorProps = ['backgroundColor', 'color', 'borderColor'];

  // Handle padding/margin shorthand (can be "80px 20px")
  const spacingShorthandProps = ['padding', 'margin'];

  // Process string props
  for (const prop of stringProps) {
    if (aiStyles[prop] !== undefined) {
      let value = aiStyles[prop];
      // Convert rgba to hex for color properties
      if (colorProps.includes(prop) && typeof value === 'string') {
        value = rgbaToHex(value);
      }
      (styles as Record<string, unknown>)[prop] = value;
    }
  }

  // Process numeric props (convert "80px" to 80)
  for (const prop of numericProps) {
    if (aiStyles[prop] !== undefined) {
      const parsed = parseCSSValue(aiStyles[prop]);
      if (typeof parsed === 'number' || typeof parsed === 'string') {
        (styles as Record<string, unknown>)[prop] = parsed;
      }
    }
  }

  // Process padding/margin shorthand
  for (const prop of spacingShorthandProps) {
    if (aiStyles[prop] !== undefined) {
      const spacing = parseSpacingShorthand(aiStyles[prop]);
      if (spacing) {
        if (spacing.all !== undefined) {
          (styles as Record<string, unknown>)[prop] = spacing.all;
        } else {
          // Expand shorthand to individual properties
          if (spacing.top !== undefined) (styles as Record<string, unknown>)[`${prop}Top`] = spacing.top;
          if (spacing.right !== undefined) (styles as Record<string, unknown>)[`${prop}Right`] = spacing.right;
          if (spacing.bottom !== undefined) (styles as Record<string, unknown>)[`${prop}Bottom`] = spacing.bottom;
          if (spacing.left !== undefined) (styles as Record<string, unknown>)[`${prop}Left`] = spacing.left;
        }
      }
    }
  }

  // Handle resizeX/resizeY (auto-layout sizing modes)
  if (aiStyles.resizeX !== undefined) {
    const resizeXValue = aiStyles.resizeX as string;
    if (resizeXValue === 'fixed' || resizeXValue === 'fill' || resizeXValue === 'hug') {
      styles.resizeX = resizeXValue;
    }
  }
  if (aiStyles.resizeY !== undefined) {
    const resizeYValue = aiStyles.resizeY as string;
    if (resizeYValue === 'fixed' || resizeYValue === 'fill' || resizeYValue === 'hug') {
      styles.resizeY = resizeYValue;
    }
  }

  return styles;
}

/**
 * Clear canvas and add AI elements (for full page generation)
 */
export function replaceCanvasWithAI(elements: CanvasElementData[]): string[] {
  const store = useCanvasStore.getState();

  // Get current page root
  const currentPage = store.getCurrentPage();
  if (!currentPage) return [];

  const rootElement = store.getRootElement();
  if (!rootElement) return [];

  // Delete all existing children of root
  const existingChildren = [...rootElement.children];
  for (const childId of existingChildren) {
    store.deleteElement(childId);
  }

  // Add new elements
  return addElementsFromAI(elements, rootElement.id);
}

/**
 * AI element modification - for updating existing elements
 */
export interface AIElementModification {
  id: string; // ID of element to modify
  styles?: Record<string, unknown>;
  content?: string;
  name?: string;
  src?: string;
  href?: string;
}

/**
 * AI response with optional new page creation and element modifications
 */
export interface AIDesignResponse {
  createNewPage?: boolean;
  pageName?: string;
  elements?: CanvasElementData[]; // New elements to create
  modifications?: AIElementModification[]; // Modifications to existing elements
}

/**
 * Apply modifications to existing elements
 * Used when AI is modifying selected elements rather than creating new ones
 */
export function updateElementsFromAI(modifications: AIElementModification[]): {
  updatedIds: string[];
  notFound: string[];
} {
  const store = useCanvasStore.getState();
  const updatedIds: string[] = [];
  const notFound: string[] = [];

  for (const mod of modifications) {
    const element = store.getElement(mod.id);

    if (!element) {
      console.warn(`[UpdateElementsFromAI] Element not found: ${mod.id}`);
      notFound.push(mod.id);
      continue;
    }

    console.log(`[UpdateElementsFromAI] Updating element "${element.name}" (${mod.id})`);

    // Update content if provided
    if (mod.content !== undefined) {
      store.updateElementContent(mod.id, mod.content);
    }

    // Update name if provided
    if (mod.name !== undefined) {
      store.renameElement(mod.id, mod.name);
    }

    // Update styles if provided
    if (mod.styles) {
      const styles = convertStyles(mod.styles);
      store.updateElementStyles(mod.id, styles as any);
    }

    // Update src (for images/videos) if provided
    if (mod.src !== undefined) {
      store.updateElement(mod.id, { src: mod.src });
    }

    // Update href (for links/buttons) if provided
    if (mod.href !== undefined) {
      store.updateElement(mod.id, { href: mod.href });
    }

    updatedIds.push(mod.id);
  }

  // Save to history
  if (updatedIds.length > 0) {
    store.saveToHistory(`AI: Modified ${updatedIds.length} elements`);
  }

  return { updatedIds, notFound };
}

/**
 * Process AI design response - creates new page if requested
 * @returns Object with created element IDs and optional new page ID
 */
export function processAIDesignResponse(response: AIDesignResponse): {
  elementIds: string[];
  pageId?: string;
} {
  const store = useCanvasStore.getState();

  let pageId: string | undefined;
  let parentId: string | undefined;

  // Create new page if requested
  if (response.createNewPage) {
    console.log('[AddElementsFromAI] Creating new page:', response.pageName);
    pageId = store.addPage();

    // Rename the page if name provided
    if (response.pageName && pageId) {
      store.renamePage(pageId, response.pageName);

      // Also rename the root element to match
      const page = store.pages[pageId];
      if (page) {
        store.renameElement(page.rootElementId, response.pageName);
        parentId = page.rootElementId;
      }
    }

    // Switch to the new page
    if (pageId) {
      store.setCurrentPage(pageId);
    }
  }

  // Add elements to the page
  const elementIds = addElementsFromAI(response.elements, parentId);

  return { elementIds, pageId };
}

// ============================================================================
// AI IMAGE GENERATION
// ============================================================================

// API endpoint for AI image generation
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dyivbglwaazrddmihnod.supabase.co';
const AI_STUDIO_API = `${SUPABASE_URL}/functions/v1/ai-studio`;

/**
 * Generate an AI image from a prompt
 * @param prompt - Descriptive prompt for image generation
 * @param width - Image width
 * @param height - Image height
 * @returns Generated image URL or fallback Unsplash image
 */
async function generateAIImage(
  prompt: string,
  width: number = 800,
  height: number = 600
): Promise<string> {
  try {
    console.log(`[AI Image] Generating: "${prompt.substring(0, 50)}..."`);

    const response = await fetch(AI_STUDIO_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'generate',
        prompt: prompt,
        model: 'flux-schnell', // Fast model for quick generation
        width: Math.min(width, 1024),
        height: Math.min(height, 1024),
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Studio API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.imageUrl) {
      console.log(`[AI Image] Generated: ${data.imageUrl}`);
      return data.imageUrl;
    }

    throw new Error(data.error || 'Unknown error');
  } catch (error) {
    console.warn('[AI Image] Generation failed, using fallback:', error);
    // Return fallback Unsplash image
    return getNextDefaultImage();
  }
}

/**
 * Find all elements with imagePrompt in a tree structure
 */
function findElementsWithImagePrompt(
  elements: CanvasElementData[],
  parentPath: number[] = []
): Array<{ path: number[]; prompt: string; element: CanvasElementData }> {
  const results: Array<{ path: number[]; prompt: string; element: CanvasElementData }> = [];

  elements.forEach((element, index) => {
    const currentPath = [...parentPath, index];

    if (element.imagePrompt) {
      results.push({
        path: currentPath,
        prompt: element.imagePrompt,
        element,
      });
    }

    if (element.children) {
      const childResults = findElementsWithImagePrompt(element.children, currentPath);
      results.push(...childResults);
    }
  });

  return results;
}

/**
 * Options for addElementsFromAI
 */
export interface AddElementsOptions {
  /** Auto-generate AI images for elements with imagePrompt */
  autoGenerateImages?: boolean;
  /** Callback for progress updates */
  onImageProgress?: (generated: number, total: number) => void;
}

/**
 * Add elements and optionally auto-generate AI images
 * This is the main entry point for adding AI-generated elements with images
 */
export async function addElementsWithAI(
  elements: CanvasElementData[],
  parentId?: string,
  options: AddElementsOptions = {}
): Promise<{ elementIds: string[]; imagesGenerated: number }> {
  const { autoGenerateImages = false, onImageProgress } = options;

  // First, add all elements to canvas (with placeholder images)
  const elementIds = addElementsFromAI(elements, parentId);

  let imagesGenerated = 0;

  // If auto-generate is enabled, find and generate images
  if (autoGenerateImages) {
    const imagesToGenerate = findElementsWithImagePrompt(elements);
    const total = imagesToGenerate.length;

    if (total > 0) {
      console.log(`[AI Image] Found ${total} images to generate`);
      const store = useCanvasStore.getState();

      // Generate images in parallel (up to 3 at a time)
      const batchSize = 3;
      for (let i = 0; i < imagesToGenerate.length; i += batchSize) {
        const batch = imagesToGenerate.slice(i, i + batchSize);

        await Promise.all(batch.map(async ({ prompt, element }) => {
          try {
            // Get dimensions from styles
            const width = (element.styles?.width as number) || 800;
            const height = (element.styles?.height as number) || 600;

            // Generate the image
            const imageUrl = await generateAIImage(prompt, width, height);

            // Find the element in the store and update it
            // We need to find by name since IDs are generated
            const allElements = store.elements;
            const matchingElement = Object.values(allElements).find(
              el => el.name === element.name && el.type === 'image'
            );

            if (matchingElement) {
              store.updateElement(matchingElement.id, { src: imageUrl });
              imagesGenerated++;
              console.log(`[AI Image] Updated element "${element.name}" with generated image`);
            }
          } catch (error) {
            console.warn(`[AI Image] Failed to generate for "${element.name}":`, error);
          }

          // Report progress
          if (onImageProgress) {
            onImageProgress(imagesGenerated, total);
          }
        }));
      }

      // Save to history after all images are generated
      if (imagesGenerated > 0) {
        store.saveToHistory(`AI: Generated ${imagesGenerated} images`);
      }
    }
  }

  return { elementIds, imagesGenerated };
}

export default addElementsFromAI;
