/**
 * Add Elements From AI
 *
 * Converts AI-generated element definitions to actual canvas elements.
 * This bridges the gap between AI output and the visual canvas.
 */

import { useCanvasStore, generateId } from './canvasStore';
import { CanvasElementData } from '../artifactParser';
import { ElementType, ElementStyles, CanvasElement } from './types';

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
    const id = addSingleElement(element, parentId);
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
  const store = useCanvasStore.getState();

  // Map AI type to canvas element type
  const elementType = mapElementType(data.type);

  // Check parent's layout mode to determine smart defaults
  let parentHasAutoLayout = false;
  let parentFlexDirection: 'row' | 'column' = 'column';

  if (parentId) {
    const parent = store.getElement(parentId);
    if (parent) {
      const parentStyles = parent.styles;
      parentHasAutoLayout = parentStyles.display === 'flex' || parentStyles.display === 'grid';
      parentFlexDirection = (parentStyles.flexDirection as 'row' | 'column') || 'column';
    }
  } else {
    // If no parentId, we're adding to page root which has auto-layout
    parentHasAutoLayout = true;
    parentFlexDirection = 'column';
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

  if (data.content) {
    store.updateElementContent(elementId, data.content);
  }

  if (data.styles) {
    const styles = convertStyles(data.styles);

    // Smart resize defaults based on parent layout
    if (parentHasAutoLayout && !styles.resizeX) {
      // In column layout: sections/containers fill width
      // In row layout: they keep fixed width unless specified
      if (parentFlexDirection === 'column') {
        if (['section', 'frame', 'stack', 'container'].includes(elementType)) {
          styles.resizeX = 'fill';
        }
      }
    }

    store.updateElementStyles(elementId, styles);

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
  } else if (parentHasAutoLayout && parentFlexDirection === 'column') {
    // Even without styles, containers in column layout should fill width
    if (['section', 'frame', 'stack', 'container'].includes(elementType)) {
      store.updateElementStyles(elementId, { resizeX: 'fill' } as any);
    }
  }

  // Update special properties using the store's elements directly
  const element = store.getElement(elementId);
  if (element) {
    const updates: Partial<CanvasElement> = {};

    if (data.src) updates.src = data.src;
    if (data.href) updates.href = data.href;
    if (data.iconName) updates.iconName = data.iconName;

    if (Object.keys(updates).length > 0) {
      // Direct element update via store
      useCanvasStore.setState((state) => ({
        elements: {
          ...state.elements,
          [elementId]: { ...state.elements[elementId], ...updates },
        },
      }));
    }
  }

  // Recursively add children
  if (data.children && data.children.length > 0) {
    for (const child of data.children) {
      addSingleElement(child, elementId);
    }
  }

  return elementId;
}

/**
 * Map AI element type to canvas element type
 */
function mapElementType(aiType: string): ElementType {
  const typeMap: Record<string, ElementType> = {
    frame: 'frame',
    section: 'section',
    stack: 'stack',
    grid: 'grid',
    container: 'container',
    row: 'row',
    text: 'text',
    button: 'button',
    link: 'link',
    image: 'image',
    input: 'input',
    icon: 'icon',
    video: 'video',
    // divider maps to frame with special styling
    divider: 'frame',
  };

  return typeMap[aiType] || 'frame';
}

/**
 * Convert AI styles to canvas ElementStyles
 */
function convertStyles(aiStyles: Record<string, unknown>): Partial<ElementStyles> & { resizeX?: string; resizeY?: string } {
  const styles: Partial<ElementStyles> & { resizeX?: string; resizeY?: string } = {};

  // Direct mappings (note: width/height go in element.size, not styles)
  const directProps: (keyof ElementStyles)[] = [
    'display',
    'flexDirection',
    'justifyContent',
    'alignItems',
    'flexWrap',
    'gap',
    'rowGap',
    'columnGap',
    'padding',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'margin',
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft',
    'backgroundColor',
    'backgroundImage',
    'backgroundSize',
    'backgroundPosition',
    'color',
    'fontSize',
    'fontWeight',
    'fontFamily',
    'textAlign',
    'lineHeight',
    'letterSpacing',
    'textDecoration',
    'textTransform',
    'borderRadius',
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderBottomLeftRadius',
    'borderBottomRightRadius',
    'borderWidth',
    'borderColor',
    'borderStyle',
    'boxShadow',
    'opacity',
    'overflow',
    'cursor',
    'gridTemplateColumns',
    'gridTemplateRows',
  ];

  for (const prop of directProps) {
    if (aiStyles[prop] !== undefined) {
      (styles as Record<string, unknown>)[prop] = aiStyles[prop];
    }
  }

  // Handle resizeX/resizeY (auto-layout sizing modes)
  if (aiStyles.resizeX !== undefined) {
    styles.resizeX = aiStyles.resizeX as string;
  }
  if (aiStyles.resizeY !== undefined) {
    styles.resizeY = aiStyles.resizeY as string;
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
 * AI response with optional new page creation
 */
export interface AIDesignResponse {
  createNewPage?: boolean;
  pageName?: string;
  elements: CanvasElementData[];
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

export default addElementsFromAI;
