/**
 * Figma Import Service
 *
 * Fetches designs from Figma API and converts them to canvas elements.
 * Supports images, text, auto-layout, and complex styles.
 */

import { CanvasElement, ElementType, ElementStyles, Size, Position } from '../canvas/types';

// ============================================================================
// Types
// ============================================================================

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  locked?: boolean;
  children?: FigmaNode[];

  // Geometry
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  relativeTransform?: [[number, number, number], [number, number, number]];

  // Layout
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  layoutAlign?: 'INHERIT' | 'STRETCH' | 'MIN' | 'CENTER' | 'MAX';
  layoutGrow?: number;
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  counterAxisSpacing?: number;

  // Styles
  backgroundColor?: FigmaColor;
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  strokeWeight?: number;
  strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
  cornerRadius?: number;
  rectangleCornerRadii?: [number, number, number, number];
  opacity?: number;
  effects?: FigmaEffect[];
  blendMode?: string;
  isMask?: boolean;
  clipsContent?: boolean;

  // Text
  characters?: string;
  style?: FigmaTextStyle;
  characterStyleOverrides?: number[];
  styleOverrideTable?: Record<number, Partial<FigmaTextStyle>>;

  // Constraints
  constraints?: {
    vertical: string;
    horizontal: string;
  };
}

interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface FigmaFill {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE';
  visible?: boolean;
  opacity?: number;
  color?: FigmaColor;
  imageRef?: string;
  scaleMode?: 'FILL' | 'FIT' | 'TILE' | 'STRETCH';
  imageTransform?: [[number, number, number], [number, number, number]];
  gradientHandlePositions?: { x: number; y: number }[];
  gradientStops?: { position: number; color: FigmaColor }[];
}

interface FigmaStroke {
  type: 'SOLID' | 'GRADIENT_LINEAR';
  visible?: boolean;
  color?: FigmaColor;
  opacity?: number;
}

interface FigmaEffect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  visible?: boolean;
  radius?: number;
  color?: FigmaColor;
  offset?: { x: number; y: number };
  spread?: number;
  blendMode?: string;
}

interface FigmaTextStyle {
  fontFamily?: string;
  fontPostScriptName?: string;
  fontWeight?: number;
  fontSize?: number;
  textAutoResize?: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT';
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM';
  lineHeightPx?: number;
  lineHeightPercent?: number;
  lineHeightUnit?: 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%';
  letterSpacing?: number;
  textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
  textCase?: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE';
  fills?: FigmaFill[];
}

interface FigmaImportResult {
  success: boolean;
  elements: Record<string, CanvasElement>;
  rootId: string;
  rootName?: string;
  rootSize?: Size;
  error?: string;
  imageCount?: number;
}

interface ImageMapping {
  nodeId: string;
  imageRef: string;
  elementId: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Parse Figma URL to extract file key and node ID
 */
export function parseFigmaUrl(url: string): { fileKey: string; nodeId?: string } | null {
  try {
    const urlObj = new URL(url);

    // Handle different Figma URL formats:
    // https://www.figma.com/file/FILEKEY/FileName
    // https://www.figma.com/design/FILEKEY/FileName
    // https://www.figma.com/file/FILEKEY/FileName?node-id=123-456
    // https://www.figma.com/design/FILEKEY/FileName?node-id=123-456&t=xxx

    const pathMatch = urlObj.pathname.match(/\/(file|design)\/([a-zA-Z0-9]+)/);
    if (!pathMatch) return null;

    const fileKey = pathMatch[2];
    let nodeId = urlObj.searchParams.get('node-id');

    // Convert node-id format: "5-53" -> "5:53"
    if (nodeId) {
      nodeId = nodeId.replace(/-/g, ':');
    }

    return { fileKey, nodeId: nodeId || undefined };
  } catch {
    return null;
  }
}

/**
 * Fetch Figma file data
 */
export async function fetchFigmaFile(
  fileKey: string,
  token: string,
  nodeId?: string
): Promise<FigmaNode> {
  const baseUrl = `https://api.figma.com/v1/files/${fileKey}`;
  const url = nodeId ? `${baseUrl}/nodes?ids=${encodeURIComponent(nodeId)}` : baseUrl;

  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': token,
    },
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Figma API rate limit exceeded. Please wait 1-2 minutes before trying again.');
    }
    if (response.status === 403) {
      throw new Error('Access denied. Make sure your Figma token has access to this file.');
    }
    if (response.status === 404) {
      throw new Error('Figma file or node not found. Please check the URL.');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Figma API error: ${response.status}`);
  }

  const data = await response.json();

  if (nodeId) {
    // Node-specific response
    const nodes = data.nodes;
    const nodeData = nodes[nodeId];
    if (!nodeData || !nodeData.document) {
      throw new Error('Node not found in Figma file');
    }
    return nodeData.document;
  }

  return data.document;
}

/**
 * Fetch image URLs from Figma API
 */
export async function fetchFigmaImages(
  fileKey: string,
  token: string,
  imageRefs: string[]
): Promise<Record<string, string>> {
  if (imageRefs.length === 0) return {};

  // Figma images API endpoint
  const url = `https://api.figma.com/v1/files/${fileKey}/images`;

  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': token,
    },
  });

  if (!response.ok) {
    console.warn('Failed to fetch Figma images');
    return {};
  }

  const data = await response.json();
  return data.meta?.images || {};
}

/**
 * Fetch rendered images for specific nodes
 */
export async function fetchNodeImages(
  fileKey: string,
  token: string,
  nodeIds: string[],
  format: 'png' | 'jpg' | 'svg' = 'png',
  scale: number = 2
): Promise<Record<string, string>> {
  if (nodeIds.length === 0) return {};

  const idsParam = nodeIds.join(',');
  const url = `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(idsParam)}&format=${format}&scale=${scale}`;

  const response = await fetch(url, {
    headers: {
      'X-Figma-Token': token,
    },
  });

  if (!response.ok) {
    console.warn('Failed to fetch node images');
    return {};
  }

  const data = await response.json();
  return data.images || {};
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Convert Figma color to CSS rgba string
 */
function figmaColorToRgba(color: FigmaColor, opacity: number = 1): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = color.a * opacity;

  if (a >= 0.99) {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
}

/**
 * Convert Figma fills to background color/gradient/image
 */
function convertFills(fills?: FigmaFill[], imageUrls?: Record<string, string>): { backgroundColor?: string; backgroundImage?: string } {
  if (!fills || fills.length === 0) return {};

  const result: { backgroundColor?: string; backgroundImage?: string } = {};

  // Process fills in reverse order (bottom to top in Figma)
  const visibleFills = fills.filter(f => f.visible !== false).reverse();

  for (const fill of visibleFills) {
    if (fill.type === 'SOLID' && fill.color) {
      result.backgroundColor = figmaColorToRgba(fill.color, fill.opacity ?? 1);
    } else if (fill.type === 'GRADIENT_LINEAR' && fill.gradientStops) {
      const angle = calculateGradientAngle(fill.gradientHandlePositions);
      const stops = fill.gradientStops
        .map(s => `${figmaColorToRgba(s.color)} ${Math.round(s.position * 100)}%`)
        .join(', ');
      result.backgroundImage = `linear-gradient(${angle}deg, ${stops})`;
    } else if (fill.type === 'GRADIENT_RADIAL' && fill.gradientStops) {
      const stops = fill.gradientStops
        .map(s => `${figmaColorToRgba(s.color)} ${Math.round(s.position * 100)}%`)
        .join(', ');
      result.backgroundImage = `radial-gradient(circle, ${stops})`;
    } else if (fill.type === 'IMAGE' && fill.imageRef && imageUrls) {
      const imageUrl = imageUrls[fill.imageRef];
      if (imageUrl) {
        result.backgroundImage = `url(${imageUrl})`;
      }
    }
  }

  return result;
}

/**
 * Calculate gradient angle from handle positions
 */
function calculateGradientAngle(handles?: { x: number; y: number }[]): number {
  if (!handles || handles.length < 2) return 180;

  const start = handles[0];
  const end = handles[1];
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI) + 90;
  return Math.round(angle);
}

/**
 * Convert Figma effects to CSS
 */
function convertEffects(effects?: FigmaEffect[]): { boxShadow?: string; filter?: string; backdropFilter?: string } {
  if (!effects || effects.length === 0) return {};

  const result: { boxShadow?: string; filter?: string; backdropFilter?: string } = {};

  const shadows: string[] = [];
  const filters: string[] = [];

  for (const effect of effects) {
    if (effect.visible === false) continue;

    if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
      const color = effect.color ? figmaColorToRgba(effect.color) : 'rgba(0,0,0,0.25)';
      const x = Math.round(effect.offset?.x || 0);
      const y = Math.round(effect.offset?.y || 0);
      const blur = Math.round(effect.radius || 0);
      const spread = Math.round(effect.spread || 0);
      const inset = effect.type === 'INNER_SHADOW' ? 'inset ' : '';
      shadows.push(`${inset}${x}px ${y}px ${blur}px ${spread}px ${color}`);
    } else if (effect.type === 'LAYER_BLUR') {
      filters.push(`blur(${Math.round(effect.radius || 0)}px)`);
    } else if (effect.type === 'BACKGROUND_BLUR') {
      result.backdropFilter = `blur(${Math.round(effect.radius || 0)}px)`;
    }
  }

  if (shadows.length > 0) result.boxShadow = shadows.join(', ');
  if (filters.length > 0) result.filter = filters.join(' ');

  return result;
}

/**
 * Map Figma node type to our ElementType
 */
function mapNodeType(node: FigmaNode): ElementType {
  // Check for image fills first
  if (node.fills?.some(f => f.type === 'IMAGE' && f.visible !== false)) {
    return 'image';
  }

  const typeMap: Record<string, ElementType> = {
    'FRAME': 'frame',
    'GROUP': 'frame',
    'COMPONENT': 'frame',
    'COMPONENT_SET': 'frame',
    'INSTANCE': 'frame',
    'RECTANGLE': 'frame',
    'ELLIPSE': 'frame',
    'POLYGON': 'frame',
    'STAR': 'frame',
    'VECTOR': 'frame',
    'BOOLEAN_OPERATION': 'frame',
    'TEXT': 'text',
    'LINE': 'frame',
    'SECTION': 'section',
  };

  return typeMap[node.type] || 'frame';
}

/**
 * Convert Figma text alignment to CSS
 */
function convertTextAlign(align?: string): 'left' | 'center' | 'right' | 'justify' | undefined {
  const alignMap: Record<string, 'left' | 'center' | 'right' | 'justify'> = {
    'LEFT': 'left',
    'CENTER': 'center',
    'RIGHT': 'right',
    'JUSTIFIED': 'justify',
  };
  return align ? alignMap[align] : undefined;
}

/**
 * Convert Figma layout to CSS flexbox
 */
function convertLayout(node: FigmaNode): Partial<ElementStyles> {
  if (!node.layoutMode || node.layoutMode === 'NONE') {
    return {};
  }

  const styles: Partial<ElementStyles> = {
    display: 'flex',
    flexDirection: node.layoutMode === 'HORIZONTAL' ? 'row' : 'column',
    gap: node.itemSpacing,
    paddingTop: node.paddingTop,
    paddingRight: node.paddingRight,
    paddingBottom: node.paddingBottom,
    paddingLeft: node.paddingLeft,
  };

  // Primary axis alignment (main axis)
  const primaryAlign = node.primaryAxisAlignItems;
  if (primaryAlign === 'MIN') styles.justifyContent = 'flex-start';
  else if (primaryAlign === 'CENTER') styles.justifyContent = 'center';
  else if (primaryAlign === 'MAX') styles.justifyContent = 'flex-end';
  else if (primaryAlign === 'SPACE_BETWEEN') styles.justifyContent = 'space-between';

  // Counter axis alignment (cross axis)
  const counterAlign = node.counterAxisAlignItems;
  if (counterAlign === 'MIN') styles.alignItems = 'flex-start';
  else if (counterAlign === 'CENTER') styles.alignItems = 'center';
  else if (counterAlign === 'MAX') styles.alignItems = 'flex-end';
  else if (counterAlign === 'BASELINE') styles.alignItems = 'baseline';

  return styles;
}

/**
 * Collect all image references from a node tree
 */
function collectImageRefs(node: FigmaNode, refs: Set<string> = new Set()): Set<string> {
  if (node.fills) {
    for (const fill of node.fills) {
      if (fill.type === 'IMAGE' && fill.imageRef) {
        refs.add(fill.imageRef);
      }
    }
  }

  if (node.children) {
    for (const child of node.children) {
      collectImageRefs(child, refs);
    }
  }

  return refs;
}

/**
 * Collect all node IDs that need to be rendered as images (vectors, complex shapes)
 */
function collectNodesForImageRender(node: FigmaNode, nodeIds: string[] = []): string[] {
  // Render vectors and complex shapes as images
  const renderAsImage = ['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON', 'ELLIPSE', 'LINE'];

  if (renderAsImage.includes(node.type) && node.id) {
    nodeIds.push(node.id);
  }

  if (node.children) {
    for (const child of node.children) {
      collectNodesForImageRender(child, nodeIds);
    }
  }

  return nodeIds;
}

/**
 * Convert a single Figma node to CanvasElement
 */
function convertNode(
  node: FigmaNode,
  parentId: string | null,
  parentBounds?: { x: number; y: number },
  idCounter: { value: number },
  imageUrls?: Record<string, string>,
  nodeImages?: Record<string, string>
): CanvasElement {
  const id = `figma-${idCounter.value++}`;
  const bounds = node.absoluteBoundingBox || { x: 0, y: 0, width: 100, height: 100 };

  // Calculate position relative to parent
  const position: Position = {
    x: parentBounds ? Math.round(bounds.x - parentBounds.x) : Math.round(bounds.x),
    y: parentBounds ? Math.round(bounds.y - parentBounds.y) : Math.round(bounds.y),
  };

  const size: Size = {
    width: Math.round(bounds.width),
    height: Math.round(bounds.height),
  };

  // Get fill conversions
  const fillStyles = convertFills(node.fills, imageUrls);
  const effectStyles = convertEffects(node.effects);

  // Build styles
  const styles: ElementStyles = {
    ...convertLayout(node),
    backgroundColor: fillStyles.backgroundColor,
    backgroundImage: fillStyles.backgroundImage,
    backgroundSize: fillStyles.backgroundImage ? 'cover' : undefined,
    backgroundPosition: fillStyles.backgroundImage ? 'center' : undefined,
    borderRadius: node.cornerRadius,
    borderTopLeftRadius: node.rectangleCornerRadii?.[0],
    borderTopRightRadius: node.rectangleCornerRadii?.[1],
    borderBottomRightRadius: node.rectangleCornerRadii?.[2],
    borderBottomLeftRadius: node.rectangleCornerRadii?.[3],
    opacity: node.opacity !== 1 ? node.opacity : undefined,
    boxShadow: effectStyles.boxShadow,
    filter: effectStyles.filter,
    backdropFilter: effectStyles.backdropFilter,
  };

  // Handle strokes as border
  if (node.strokes && node.strokes.length > 0) {
    const stroke = node.strokes.find(s => s.visible !== false);
    if (stroke && stroke.color) {
      styles.borderWidth = node.strokeWeight || 1;
      styles.borderColor = figmaColorToRgba(stroke.color, stroke.opacity ?? 1);
      styles.borderStyle = 'solid';
    }
  }

  // Handle clipsContent (overflow: hidden) for all frames
  if (node.clipsContent) {
    styles.overflow = 'hidden';
  }

  // Determine element type
  let elementType = mapNodeType(node);
  let content = node.characters;
  let src: string | undefined;

  // Handle text styles
  if (node.type === 'TEXT') {
    const textStyle = node.style || {};
    styles.fontFamily = textStyle.fontFamily || 'Inter';
    styles.fontWeight = textStyle.fontWeight || 400;
    styles.fontSize = textStyle.fontSize || 16;

    // Calculate line height based on Figma's unit type
    if (textStyle.lineHeightUnit === 'PIXELS' && textStyle.lineHeightPx && textStyle.fontSize) {
      // Convert pixel value to unitless ratio
      styles.lineHeight = textStyle.lineHeightPx / textStyle.fontSize;
    } else if (textStyle.lineHeightUnit === 'FONT_SIZE_%' && textStyle.lineHeightPercent) {
      // Percentage of font size - convert to ratio (e.g., 150% -> 1.5)
      styles.lineHeight = textStyle.lineHeightPercent / 100;
    } else if (textStyle.lineHeightPx && textStyle.fontSize) {
      // Fallback: if lineHeightPx is available, use it
      styles.lineHeight = textStyle.lineHeightPx / textStyle.fontSize;
    }
    // For INTRINSIC_% or undefined, let browser use default line height

    // Letter spacing - Figma provides in pixels
    if (textStyle.letterSpacing !== undefined && textStyle.letterSpacing !== 0) {
      styles.letterSpacing = textStyle.letterSpacing;
    }

    styles.textAlign = convertTextAlign(textStyle.textAlignHorizontal);

    // Vertical text alignment
    if (textStyle.textAlignVertical === 'TOP') {
      styles.textAlignVertical = 'top';
    } else if (textStyle.textAlignVertical === 'CENTER') {
      styles.textAlignVertical = 'center';
    } else if (textStyle.textAlignVertical === 'BOTTOM') {
      styles.textAlignVertical = 'bottom';
    }

    if (textStyle.textDecoration === 'UNDERLINE') {
      styles.textDecoration = 'underline';
    } else if (textStyle.textDecoration === 'STRIKETHROUGH') {
      styles.textDecoration = 'line-through';
    }

    if (textStyle.textCase === 'UPPER') {
      styles.textTransform = 'uppercase';
    } else if (textStyle.textCase === 'LOWER') {
      styles.textTransform = 'lowercase';
    } else if (textStyle.textCase === 'TITLE') {
      styles.textTransform = 'capitalize';
    }

    // IMPORTANT: For TEXT nodes, fills represent TEXT COLOR, not background!
    // Remove any backgroundColor that was incorrectly set from fills
    delete styles.backgroundColor;
    delete styles.backgroundImage;

    // Get text color from fills (either node fills or style fills)
    const textFills = node.fills || textStyle.fills;
    if (textFills && textFills.length > 0) {
      const textFill = textFills.find(f => f.visible !== false && f.type === 'SOLID');
      if (textFill?.color) {
        styles.color = figmaColorToRgba(textFill.color, textFill.opacity ?? 1);
      }
    }
  }

  // Handle image fills
  if (elementType === 'image') {
    const imageFill = node.fills?.find(f => f.type === 'IMAGE' && f.visible !== false);
    if (imageFill?.imageRef && imageUrls) {
      src = imageUrls[imageFill.imageRef];
    }
    // Remove background styles for image elements
    delete styles.backgroundColor;
    delete styles.backgroundImage;
  }

  // Handle vector/complex shapes rendered as images
  if (nodeImages && node.id && nodeImages[node.id]) {
    elementType = 'image';
    src = nodeImages[node.id];
    delete styles.backgroundColor;
    delete styles.backgroundImage;
  }

  // Clean up undefined values
  Object.keys(styles).forEach(key => {
    if (styles[key as keyof ElementStyles] === undefined) {
      delete styles[key as keyof ElementStyles];
    }
  });

  const element: CanvasElement = {
    id,
    type: elementType,
    name: node.name || 'Element',
    position,
    size,
    positionType: parentId ? 'relative' : 'absolute',
    styles,
    content,
    src,
    parentId,
    children: [],
    locked: node.locked || false,
    visible: node.visible !== false,
  };

  return element;
}

/**
 * Recursively convert Figma node tree to canvas elements
 */
function convertNodeTree(
  node: FigmaNode,
  parentId: string | null,
  elements: Record<string, CanvasElement>,
  parentBounds?: { x: number; y: number },
  idCounter: { value: number } = { value: 1 },
  imageUrls?: Record<string, string>,
  nodeImages?: Record<string, string>
): string {
  const element = convertNode(node, parentId, parentBounds, idCounter, imageUrls, nodeImages);
  elements[element.id] = element;

  // Convert children (skip for image elements that were converted from vectors)
  if (node.children && element.type !== 'image') {
    const bounds = node.absoluteBoundingBox;
    for (const child of node.children) {
      if (child.visible === false) continue;

      const childId = convertNodeTree(
        child,
        element.id,
        elements,
        bounds,
        idCounter,
        imageUrls,
        nodeImages
      );
      element.children.push(childId);
    }
  }

  return element.id;
}

// ============================================================================
// Main Import Function
// ============================================================================

/**
 * Import a Figma design into canvas elements
 */
export async function importFromFigma(
  url: string,
  token: string
): Promise<FigmaImportResult> {
  try {
    // Parse URL
    const parsed = parseFigmaUrl(url);
    if (!parsed) {
      return {
        success: false,
        elements: {},
        rootId: '',
        error: 'Invalid Figma URL. Use a link like: https://www.figma.com/design/XXXXX/FileName?node-id=...',
      };
    }

    console.log('[FigmaImport] Fetching file:', parsed.fileKey, 'node:', parsed.nodeId);

    // Fetch from Figma API
    const figmaNode = await fetchFigmaFile(parsed.fileKey, token, parsed.nodeId);

    // Find the node to import
    let nodeToImport = figmaNode;

    // If it's a document, find the first page and first frame
    if (figmaNode.type === 'DOCUMENT' && figmaNode.children) {
      const firstPage = figmaNode.children[0];
      if (firstPage && firstPage.children && firstPage.children.length > 0) {
        nodeToImport = firstPage.children[0];
      }
    }

    // If it's a page (CANVAS), get first frame
    if (figmaNode.type === 'CANVAS' && figmaNode.children && figmaNode.children.length > 0) {
      nodeToImport = figmaNode.children[0];
    }

    console.log('[FigmaImport] Importing node:', nodeToImport.name, 'type:', nodeToImport.type);

    // Collect all image references
    const imageRefs = collectImageRefs(nodeToImport);
    console.log('[FigmaImport] Found image refs:', imageRefs.size);

    // Fetch image URLs
    let imageUrls: Record<string, string> = {};
    if (imageRefs.size > 0) {
      imageUrls = await fetchFigmaImages(parsed.fileKey, token, Array.from(imageRefs));
      console.log('[FigmaImport] Fetched images:', Object.keys(imageUrls).length);
    }

    // Collect vector nodes that need to be rendered as images
    const vectorNodeIds = collectNodesForImageRender(nodeToImport);
    let nodeImages: Record<string, string> = {};

    if (vectorNodeIds.length > 0 && vectorNodeIds.length <= 50) {
      // Only fetch if not too many (API limit)
      nodeImages = await fetchNodeImages(parsed.fileKey, token, vectorNodeIds);
      console.log('[FigmaImport] Rendered vector nodes:', Object.keys(nodeImages).length);
    }

    // Convert to canvas elements
    const elements: Record<string, CanvasElement> = {};
    const rootId = convertNodeTree(nodeToImport, null, elements, undefined, { value: 1 }, imageUrls, nodeImages);

    console.log('[FigmaImport] Converted elements:', Object.keys(elements).length);

    // Get root element info for page creation
    const importedRoot = elements[rootId];
    const rootName = nodeToImport.name || 'Figma Import';
    const rootSize = importedRoot?.size || { width: 1440, height: 900 };

    return {
      success: true,
      elements,
      rootId,
      rootName,
      rootSize,
      imageCount: Object.keys(imageUrls).length + Object.keys(nodeImages).length,
    };
  } catch (error) {
    console.error('[FigmaImport] Error:', error);
    return {
      success: false,
      elements: {},
      rootId: '',
      error: error instanceof Error ? error.message : 'Failed to import from Figma',
    };
  }
}

/**
 * Save Figma token to localStorage
 */
export function saveFigmaToken(token: string): void {
  localStorage.setItem('figma-access-token', token);
}

/**
 * Get Figma token from localStorage
 */
export function getFigmaToken(): string | null {
  return localStorage.getItem('figma-access-token');
}
