/**
 * Canvas Element Renderer
 *
 * Renders individual canvas elements with their styles.
 * Supports dragging like Figma/Framer.
 */

import React, { useRef, useCallback, useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { CanvasElement, ElementStyles } from '../../lib/canvas/types';
import { useCanvasStore } from '../../lib/canvas/canvasStore';
import { useResponsiveStore, getStylesForBreakpoint } from '../../lib/canvas/responsive';
import { renderLucideIcon } from './IconPicker';

// Container element types that can accept children
const CONTAINER_TYPES = ['frame', 'stack', 'grid', 'section', 'container', 'row', 'page', 'box'];

// Memoized Image Renderer for performance
interface ImageRendererProps {
  src?: string;
  alt?: string;
  styles: ElementStyles;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const ImageRenderer = memo(function ImageRenderer({ src, alt, styles, crop }: ImageRendererProps) {
  // Memoize filter string calculation
  const imageFilter = useMemo(() => {
    const filterParts: string[] = [];
    if (styles.brightness !== undefined && styles.brightness !== 100) {
      filterParts.push(`brightness(${styles.brightness}%)`);
    }
    if (styles.contrast !== undefined && styles.contrast !== 100) {
      filterParts.push(`contrast(${styles.contrast}%)`);
    }
    if (styles.saturation !== undefined && styles.saturation !== 100) {
      filterParts.push(`saturate(${styles.saturation}%)`);
    }
    if (styles.blur && styles.blur > 0) {
      filterParts.push(`blur(${styles.blur}px)`);
    }
    if (styles.grayscale && styles.grayscale > 0) {
      filterParts.push(`grayscale(${styles.grayscale}%)`);
    }
    if (styles.hueRotate && styles.hueRotate !== 0) {
      filterParts.push(`hue-rotate(${styles.hueRotate}deg)`);
    }
    if (styles.invert && styles.invert > 0) {
      filterParts.push(`invert(${styles.invert}%)`);
    }
    if (styles.sepia && styles.sepia > 0) {
      filterParts.push(`sepia(${styles.sepia}%)`);
    }
    return filterParts.length > 0 ? filterParts.join(' ') : undefined;
  }, [styles.brightness, styles.contrast, styles.saturation, styles.blur, styles.grayscale, styles.hueRotate, styles.invert, styles.sepia]);

  // Check if crop is applied
  const hasCrop = crop && (
    crop.x !== 0 ||
    crop.y !== 0 ||
    crop.width !== 100 ||
    crop.height !== 100
  );

  if (hasCrop && crop) {
    const scaleX = 100 / crop.width;
    const scaleY = 100 / crop.height;
    const translateX = -crop.x * scaleX;
    const translateY = -crop.y * scaleY;

    return (
      <div style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <img
          src={src || 'https://via.placeholder.com/200x150'}
          alt={alt || 'Image'}
          loading="lazy"
          style={{
            width: `${scaleX * 100}%`,
            height: `${scaleY * 100}%`,
            objectFit: 'cover',
            pointerEvents: 'none',
            transform: `translate(${translateX}%, ${translateY}%)`,
            filter: imageFilter,
          }}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <img
      src={src || 'https://via.placeholder.com/200x150'}
      alt={alt || 'Image'}
      loading="lazy"
      style={{
        width: '100%',
        height: '100%',
        objectFit: styles.objectFit || 'cover',
        objectPosition: styles.objectPosition || 'center',
        pointerEvents: 'none',
        filter: imageFilter,
      }}
      draggable={false}
    />
  );
});

interface CanvasElementRendererProps {
  element: CanvasElement;
  elements: Record<string, CanvasElement>;
  zoom: number;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string, addToSelection?: boolean) => void;
  onHover: (id: string | null) => void;
  /** If true, parent has auto layout - don't use absolute positioning */
  parentHasAutoLayout?: boolean;
  /** Parent's flex direction */
  parentFlexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
}

// Memoized component to prevent unnecessary re-renders with heavy Figma imports
export const CanvasElementRenderer = memo(function CanvasElementRenderer({
  element,
  elements,
  zoom,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  parentHasAutoLayout = false,
  parentFlexDirection = 'column',
}: CanvasElementRendererProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const textEditRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editingContent, setEditingContent] = useState(element.content || '');
  const [altPressed, setAltPressed] = useState(false);
  const dragStartPositionsRef = useRef<Record<string, { x: number; y: number }>>({});
  const hasDraggedRef = useRef(false);
  const lastClickTimeRef = useRef(0);

  const moveElement = useCanvasStore((state) => state.moveElement);
  const saveToHistory = useCanvasStore((state) => state.saveToHistory);
  const updateElementContent = useCanvasStore((state) => state.updateElementContent);
  const resizeElement = useCanvasStore((state) => state.resizeElement);

  // Get selection state reactively (for nested elements)
  const selectedElementIds = useCanvasStore((state) => state.selectedElementIds);
  const hoveredElementId = useCanvasStore((state) => state.hoveredElementId);

  // Get active breakpoint for responsive styles
  const activeBreakpointId = useResponsiveStore((state) => state.activeBreakpointId);

  // Merge base styles with responsive overrides for current breakpoint
  const effectiveStyles = useMemo(() => {
    return getStylesForBreakpoint(element.styles, element.responsiveStyles, activeBreakpointId);
  }, [element.styles, element.responsiveStyles, activeBreakpointId]);

  // Listen for Alt key for inspect mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) setAltPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey) setAltPressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Check if this is a text-editable element (supports double-click to edit)
  const isTextElement = element.type === 'text' || element.type === 'heading' || element.type === 'paragraph' || element.type === 'button' || element.type === 'link';

  // Sync editing content with element content when not editing
  useEffect(() => {
    if (!isEditingText) {
      setEditingContent(element.content || '');
    }
  }, [element.content, isEditingText]);

  // Focus text editor when entering edit mode
  useEffect(() => {
    if (isEditingText && textEditRef.current) {
      // Set the content first
      textEditRef.current.textContent = editingContent;
      textEditRef.current.focus();
      // Place cursor at end
      const range = document.createRange();
      const sel = window.getSelection();
      if (textEditRef.current.childNodes.length > 0) {
        range.selectNodeContents(textEditRef.current);
        range.collapse(false);
      } else {
        range.setStart(textEditRef.current, 0);
        range.collapse(true);
      }
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditingText]);

  // Exit edit mode when element is deselected
  useEffect(() => {
    if (!isSelected && isEditingText) {
      // Save before exiting
      if (textEditRef.current) {
        const newContent = textEditRef.current.textContent || '';
        updateElementContent(element.id, newContent);
      }
      setIsEditingText(false);
    }
  }, [isSelected, isEditingText, element.id, updateElementContent]);

  // Handle element click - Figma-style selection
  // Note: Shift+Click is handled by onPointerDown for reliability
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (element.locked) return;
      if (isEditingText) return;

      // Shift+Click is handled by onPointerDown
      if (e.shiftKey) return;

      // Double-click detection for text editing
      const now = Date.now();
      const timeSinceLastClick = now - lastClickTimeRef.current;
      lastClickTimeRef.current = now;

      if (timeSinceLastClick < 400 && isTextElement && !hasDraggedRef.current) {
        setIsEditingText(true);
        return;
      }

      // Skip selection if we just finished dragging
      if (hasDraggedRef.current) {
        hasDraggedRef.current = false;
        return;
      }

      // Cmd/Ctrl+Click: Deep select - select this element directly
      const cmdKey = e.metaKey || e.ctrlKey;
      if (cmdKey) {
        onSelect(element.id, false);
        return;
      }

      // NORMAL CLICK: Figma parent-first behavior
      const { selectedElementIds } = useCanvasStore.getState();
      const thisElementIsSelected = selectedElementIds.includes(element.id);

      // If already selected, do nothing (prevents toggle)
      if (thisElementIsSelected) {
        return;
      }

      // Check if parent container needs to be selected first
      const parent = element.parentId ? elements[element.parentId] : null;
      const parentIsContainer = parent && CONTAINER_TYPES.includes(parent.type);
      const parentIsPage = parent?.type === 'page';
      const parentIsSelected = parent && selectedElementIds.includes(parent.id);

      if (parentIsContainer && !parentIsPage && !parentIsSelected) {
        // Select parent first
        onSelect(parent.id, false);
      } else {
        // Select this element
        onSelect(element.id, false);
      }
    },
    [element.id, element.parentId, element.locked, elements, onSelect, isEditingText, isTextElement]
  );

  // Keep native double-click as backup
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (element.locked) return;
      if (isTextElement && !isEditingText) {
        setIsEditingText(true);
      }
    },
    [element.locked, isTextElement, isEditingText]
  );

  // Handle text input changes - only auto-resize, don't save to store yet
  const handleTextInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      // Auto-resize if in "hug" mode
      const resizeX = (element.styles as any).resizeX || 'fixed';
      const resizeY = (element.styles as any).resizeY || 'fixed';

      if (textEditRef.current && (resizeX === 'hug' || resizeY === 'hug')) {
        const rect = textEditRef.current.getBoundingClientRect();
        const newWidth = resizeX === 'hug' ? Math.max(20, rect.width / zoom + 4) : element.size.width;
        const newHeight = resizeY === 'hug' ? Math.max(20, rect.height / zoom + 4) : element.size.height;
        resizeElement(element.id, { width: newWidth, height: newHeight });
      }
    },
    [element.id, element.styles, element.size, resizeElement, zoom]
  );

  // Handle text edit keyboard events
  const handleTextKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        // Save content before exiting
        if (textEditRef.current) {
          const newContent = textEditRef.current.textContent || '';
          updateElementContent(element.id, newContent);
        }
        setIsEditingText(false);
        saveToHistory('Edit text');
      }
      // Don't propagate other keys to prevent canvas shortcuts
      e.stopPropagation();
    },
    [element.id, updateElementContent, saveToHistory]
  );

  // Handle blur to exit edit mode and save content
  const handleTextBlur = useCallback(() => {
    if (textEditRef.current) {
      const newContent = textEditRef.current.textContent || '';
      updateElementContent(element.id, newContent);
    }
    setIsEditingText(false);
    saveToHistory('Edit text');
  }, [element.id, updateElementContent, saveToHistory]);

  // Get reorderElement from store
  const reorderElement = useCanvasStore((state) => state.reorderElement);

  // For auto-layout reorder tracking
  const dragReorderTargetRef = useRef<{ id: string; position: 'before' | 'after' } | null>(null);

  // Handle drag start
  const handleDragStart = useCallback(() => {
    if (element.locked) return;
    // Allow drag in auto-layout for reordering
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragReorderTargetRef.current = null;

    if (!parentHasAutoLayout) {
      // Store start positions of ALL selected elements (or just this one if not selected)
      const state = useCanvasStore.getState();
      const selectedIds = isSelected ? state.selectedElementIds : [element.id];
      const startPositions: Record<string, { x: number; y: number }> = {};

      for (const id of selectedIds) {
        const el = state.elements[id];
        if (el && !el.locked) {
          startPositions[id] = { x: el.position.x, y: el.position.y };
        }
      }
      dragStartPositionsRef.current = startPositions;
    }

    // Select if not already selected
    if (!isSelected) {
      onSelect(element.id, false);
    }
  }, [element.id, element.locked, isSelected, onSelect, parentHasAutoLayout]);

  // Handle drag - update ALL selected elements in real-time
  const handleDrag = useCallback((event: any, info: { offset: { x: number; y: number }; point: { x: number; y: number } }) => {
    if (element.locked) return;
    hasDraggedRef.current = true;

    if (parentHasAutoLayout) {
      // For auto-layout: detect which sibling we're over for reordering
      const parent = element.parentId ? elements[element.parentId] : null;
      if (!parent) return;

      const siblings = parent.children.filter(id => id !== element.id);
      const isVertical = (parent.styles.flexDirection || 'column') === 'column' || parent.styles.flexDirection === 'column-reverse';

      // Find which sibling we're closest to
      let closestSibling: { id: string; position: 'before' | 'after' } | null = null;
      let minDistance = Infinity;

      for (const sibId of siblings) {
        const sibEl = document.querySelector(`[data-element-id="${sibId}"]`);
        if (!sibEl) continue;

        const rect = sibEl.getBoundingClientRect();
        const sibCenter = isVertical
          ? rect.top + rect.height / 2
          : rect.left + rect.width / 2;
        const dragPos = isVertical ? info.point.y : info.point.x;
        const distance = Math.abs(dragPos - sibCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestSibling = {
            id: sibId,
            position: dragPos < sibCenter ? 'before' : 'after'
          };
        }
      }

      dragReorderTargetRef.current = closestSibling;
    } else {
      // Normal drag: move by position
      if (Object.keys(dragStartPositionsRef.current).length === 0) return;

      const offsetX = info.offset.x / zoom;
      const offsetY = info.offset.y / zoom;

      // Move ALL selected elements together
      for (const [id, startPos] of Object.entries(dragStartPositionsRef.current)) {
        moveElement(id, {
          x: Math.round(startPos.x + offsetX),
          y: Math.round(startPos.y + offsetY),
        });
      }
    }
  }, [element.locked, element.parentId, elements, zoom, moveElement, parentHasAutoLayout]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (hasDraggedRef.current) {
      if (parentHasAutoLayout && dragReorderTargetRef.current) {
        // Reorder in auto-layout
        reorderElement(element.id, dragReorderTargetRef.current.id, dragReorderTargetRef.current.position);
      } else if (!parentHasAutoLayout) {
        saveToHistory('Move element');
      }
    }
    setIsDragging(false);
    dragStartPositionsRef.current = {};
    dragReorderTargetRef.current = null;
  }, [saveToHistory, parentHasAutoLayout, element.id, reorderElement]);

  // Convert styles to CSS - memoized to prevent recalculations
  const computedStyles = useMemo((): React.CSSProperties => {
    // Use effectiveStyles which includes responsive overrides for current breakpoint
    const styles = effectiveStyles;

    // When parent has auto-layout, children MUST use relative positioning to follow flex/grid flow
    // When parent doesn't have auto-layout, use absolute positioning for free movement
    const useAbsolute = !parentHasAutoLayout;

    // For auto-layout containers, text should fill width by default for proper alignment
    const isTextType = element.type === 'text' || element.type === 'heading' || element.type === 'paragraph';
    const autoFillText = isTextType && parentHasAutoLayout;

    // Determine selection/hover visual state
    // Use outline instead of box-shadow - outline is NOT clipped by parent overflow:hidden
    const isPageElement = element.type === 'page';

    // Selection outline will be applied via CSS outline property (not box-shadow)
    // This ensures selection is always visible regardless of parent overflow settings
    let selectionOutline: string | undefined;
    let selectionOutlineOffset: number | undefined;
    if (isSelected && !isPageElement) {
      selectionOutline = '2px solid #8B1E2B';
      selectionOutlineOffset = -1;
    } else if (isHovered && !isSelected) {
      selectionOutline = '1px solid rgba(139, 30, 43, 0.5)';
      selectionOutlineOffset = 0;
    }

    // Handle Fill/Hug resizing modes
    const resizeX = (styles as any).resizeX || 'fixed';
    const resizeY = (styles as any).resizeY || 'fixed';

    // Check parent flex direction for responsive sizing
    const isParentColumn = parentFlexDirection === 'column' || parentFlexDirection === 'column-reverse' || !parentFlexDirection;

    // Flex child properties when in auto layout
    const isRow = parentFlexDirection === 'row' || parentFlexDirection === 'row-reverse';
    const mainAxisFill = isRow ? resizeX === 'fill' : resizeY === 'fill';
    const crossAxisFill = isRow ? resizeY === 'fill' : resizeX === 'fill';

    // Determine width based on resize mode
    let width: number | string = element.size.width;
    if (parentHasAutoLayout && resizeX === 'fill') {
      // In ROW layout, let flex handle the width distribution (don't set explicit width)
      // In COLUMN layout, fill means 100% width
      width = isRow ? 'auto' : '100%';
    } else if (resizeX === 'hug') {
      width = 'auto';
    } else if (autoFillText && resizeX === 'fixed' && isParentColumn) {
      // Text in COLUMN auto-layout should fill width for proper text alignment
      // In ROW layout, text keeps its fixed width to allow multiple items side by side
      width = '100%';
    }

    // Determine height based on resize mode
    let height: number | string = element.size.height;
    if (parentHasAutoLayout && resizeY === 'fill') {
      // In COLUMN layout, let flex handle the height distribution
      // In ROW layout, fill means 100% height (stretch)
      height = isRow ? '100%' : 'auto';
    } else if (resizeY === 'hug') {
      // Use fit-content for proper content hugging (like Figma)
      height = 'fit-content';
    } else if (autoFillText) {
      // Text height should be auto for natural text flow
      height = 'fit-content';
    }

    // Layout based on element type
    const isTextElement = element.type === 'text' || element.type === 'heading' || element.type === 'paragraph';
    const hasVerticalAlign = styles.textAlignVertical && styles.textAlignVertical !== 'top';

    // Padding resolution
    const basePadding = typeof styles.padding === 'number' ? styles.padding : (parseInt(String(styles.padding)) || 0);
    const pt = styles.paddingTop ?? basePadding;
    const pr = styles.paddingRight ?? basePadding;
    const pb = styles.paddingBottom ?? basePadding;
    const pl = styles.paddingLeft ?? basePadding;

    // Element's own boxShadow (selection is now handled via outline)
    const elementBoxShadow = styles.boxShadow;

    const css: React.CSSProperties = {
      position: useAbsolute ? 'absolute' : 'relative',
      ...(useAbsolute ? {
        left: element.position.x,
        top: element.position.y,
      } : {}),
      width,
      height,
      cursor: element.locked ? 'not-allowed' : (parentHasAutoLayout ? 'grab' : 'move'),
      opacity: element.visible ? (styles.opacity ?? 1) : 0.3,
      userSelect: 'none',
      boxSizing: 'border-box',
      zIndex: 1, // Ensure elements are above the artboard background click layer
      // Flex child properties when in auto layout
      ...(parentHasAutoLayout ? {
        flexShrink: mainAxisFill ? 1 : 0,
        flexGrow: mainAxisFill ? 1 : 0,
        flexBasis: mainAxisFill ? 0 : 'auto',
        alignSelf: crossAxisFill ? 'stretch' : undefined,
      } : {}),
      // Layout - for text with vertical alignment, use flex to align content
      ...(isTextElement && hasVerticalAlign ? {
        display: 'flex' as const,
        flexDirection: 'column' as const,
        justifyContent: styles.textAlignVertical === 'center' ? 'center' : styles.textAlignVertical === 'bottom' ? 'flex-end' : 'flex-start',
      } : {
        display: styles.display || 'block',
        flexDirection: styles.flexDirection,
        justifyContent: styles.justifyContent,
        alignItems: styles.alignItems,
      }),
      gap: styles.gap,
      gridTemplateColumns: styles.gridTemplateColumns,
      // Padding
      paddingTop: pt,
      paddingRight: pr,
      paddingBottom: pb,
      paddingLeft: pl,
      // Background - order matters: background shorthand first, then specific properties override
      ...(styles.background ? { background: styles.background } : {}),
      backgroundColor: styles.backgroundColor,
      backgroundImage: styles.backgroundImage,
      // Border
      borderRadius: styles.borderRadius !== undefined ? `${styles.borderRadius}px` : undefined,
      borderWidth: styles.borderWidth !== undefined ? `${styles.borderWidth}px` : undefined,
      borderColor: styles.borderColor,
      borderStyle: styles.borderStyle || (styles.borderWidth ? 'solid' : undefined),
      // Typography
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      fontFamily: styles.fontFamily,
      color: styles.color,
      textAlign: styles.textAlign,
      lineHeight: styles.lineHeight,
      letterSpacing: styles.letterSpacing !== undefined ? `${styles.letterSpacing}px` : undefined,
      textDecoration: styles.textDecoration,
      textTransform: styles.textTransform,
      whiteSpace: styles.whiteSpace,
      // Border - individual radius
      borderTopLeftRadius: styles.borderTopLeftRadius !== undefined ? `${styles.borderTopLeftRadius}px` : undefined,
      borderTopRightRadius: styles.borderTopRightRadius !== undefined ? `${styles.borderTopRightRadius}px` : undefined,
      borderBottomLeftRadius: styles.borderBottomLeftRadius !== undefined ? `${styles.borderBottomLeftRadius}px` : undefined,
      borderBottomRightRadius: styles.borderBottomRightRadius !== undefined ? `${styles.borderBottomRightRadius}px` : undefined,
      // Background
      backgroundSize: styles.backgroundSize,
      backgroundPosition: styles.backgroundPosition,
      backgroundRepeat: styles.backgroundRepeat,
      // Effects - element's own shadow
      boxShadow: elementBoxShadow,
      // Selection outline - uses CSS outline which is NOT clipped by overflow:hidden
      outline: selectionOutline,
      outlineOffset: selectionOutlineOffset,
      filter: styles.filter,
      backdropFilter: styles.backdropFilter,
      overflow: styles.overflow || (element.type === 'frame' || element.type === 'image' ? 'hidden' : undefined),
      // Text Effects (Kittl-style: neon, shadow, outline, gradient)
      textShadow: styles.textShadow,
      WebkitTextStroke: styles.WebkitTextStroke,
      WebkitTextFillColor: styles.WebkitTextFillColor,
      WebkitBackgroundClip: styles.WebkitBackgroundClip as any,
      backgroundClip: styles.backgroundClip as any,
    };

    return css;
  }, [element, effectiveStyles, isSelected, isHovered, parentHasAutoLayout, parentFlexDirection, selectedElementIds, hoveredElementId]);

  // Parse padding values for visualization - memoized
  const paddingValues = useMemo(() => {
    const styles = effectiveStyles;
    const parsePx = (val: string | number | undefined): number => {
      if (val === undefined || val === null) return NaN;
      if (typeof val === 'number') return val;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? NaN : parsed;
    };

    const basePadding = typeof styles.padding === 'number' ? styles.padding : (parseInt(String(styles.padding)) || 0);
    const top = parsePx(styles.paddingTop);
    const right = parsePx(styles.paddingRight);
    const bottom = parsePx(styles.paddingBottom);
    const left = parsePx(styles.paddingLeft);

    return {
      top: isNaN(top) ? basePadding : top,
      right: isNaN(right) ? basePadding : right,
      bottom: isNaN(bottom) ? basePadding : bottom,
      left: isNaN(left) ? basePadding : left,
    };
  }, [effectiveStyles]);
  const hasPadding = paddingValues.top > 0 || paddingValues.right > 0 ||
                     paddingValues.bottom > 0 || paddingValues.left > 0;

  // Show padding visualization on selection (like Figma)
  const showPaddingOverlay = isSelected && hasPadding;

  // Render based on element type
  const renderContent = () => {
    switch (element.type) {
      case 'text':
      case 'heading':
      case 'paragraph':
        // Text content - editable on double-click (Figma-style)
        if (isEditingText) {
          return (
            <div
              ref={textEditRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleTextInput}
              onKeyDown={handleTextKeyDown}
              onBlur={handleTextBlur}
              style={{
                outline: 'none',
                display: 'block',
                width: '100%',
                minHeight: '1em',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                cursor: 'text',
                caretColor: '#8B1E2B',
                background: 'rgba(139, 30, 43, 0.05)',
                borderRadius: 2,
                // Typography styles are on the container div via computedStyles
              }}
            />
          );
        }
        return (
          <span
            style={{
              pointerEvents: 'none',
              display: 'block',
              width: '100%',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              // Typography styles are on the container div via computedStyles
            }}
          >
            {element.content || ''}
          </span>
        );

      case 'button':
        // Button content - editable on double-click (like text elements)
        if (isEditingText) {
          return (
            <div
              ref={textEditRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleTextInput}
              onKeyDown={handleTextKeyDown}
              onBlur={handleTextBlur}
              style={{
                outline: 'none',
                minWidth: '2em',
                whiteSpace: 'nowrap',
                cursor: 'text',
                caretColor: '#8B1E2B',
              }}
            />
          );
        }
        return (
          <span style={{ pointerEvents: 'none' }}>
            {element.content || 'Button'}
          </span>
        );

      case 'image':
        return (
          <ImageRenderer
            src={element.src}
            alt={element.alt}
            styles={element.styles}
            crop={element.crop}
          />
        );

      case 'input':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 12,
              color: '#9ca3af',
              pointerEvents: 'none',
            }}
          >
            {element.placeholder || 'Enter text...'}
          </div>
        );

      case 'link':
        // Link content - editable on double-click (like text elements)
        if (isEditingText) {
          return (
            <div
              ref={textEditRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleTextInput}
              onKeyDown={handleTextKeyDown}
              onBlur={handleTextBlur}
              style={{
                outline: 'none',
                minWidth: '2em',
                textDecoration: 'underline',
                cursor: 'text',
                caretColor: '#8B1E2B',
              }}
            />
          );
        }
        return (
          <span
            style={{
              textDecoration: 'underline',
              pointerEvents: 'none',
            }}
          >
            {element.content || 'Link text'}
          </span>
        );

      case 'icon':
        // Render Lucide icon by name, image, or placeholder
        if (element.iconName) {
          // Use Lucide icon
          return (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: element.styles.color || '#666',
                pointerEvents: 'none',
              }}
            >
              {renderLucideIcon(element.iconName, element.iconSize || Math.min(element.size.width, element.size.height) * 0.7, element.styles.color)}
            </div>
          );
        }
        return element.src ? (
          <img
            src={element.src}
            alt={element.alt || 'Icon'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
            draggable={false}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: element.styles.color || '#666',
              pointerEvents: 'none',
            }}
          >
            <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        );

      case 'video':
        return element.src ? (
          <video
            src={element.src}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none',
            }}
            muted
            playsInline
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#666">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        );

      case 'frame':
      case 'stack':
      case 'grid':
      case 'section':
      case 'box':
      case 'container':
      case 'row':
      case 'page':
        // Check if this element has auto layout enabled
        // Pages always have auto-layout by default (column direction, stretch)
        const isPage = element.type === 'page';
        const hasAutoLayout = isPage || element.styles.display === 'flex' || element.styles.display === 'grid';
        const flexDirection = element.styles.flexDirection || 'column';
        // Render children - use reactive selection state from store hook
        return element.children.map((childId) => {
          const child = elements[childId];
          if (!child || !child.visible) return null;
          return (
            <CanvasElementRenderer
              key={childId}
              element={child}
              elements={elements}
              zoom={zoom}
              isSelected={selectedElementIds.includes(childId)}
              isHovered={hoveredElementId === childId}
              onSelect={onSelect}
              onHover={onHover}
              parentHasAutoLayout={hasAutoLayout}
              parentFlexDirection={flexDirection}
            />
          );
        });

      default:
        // For any other element type with children, still render them
        if (element.children && element.children.length > 0) {
          const defaultHasAutoLayout = element.styles.display === 'flex' || element.styles.display === 'grid';
          const defaultFlexDirection = element.styles.flexDirection || 'column';
          return element.children.map((childId) => {
            const child = elements[childId];
            if (!child || !child.visible) return null;
            return (
              <CanvasElementRenderer
                key={childId}
                element={child}
                elements={elements}
                zoom={zoom}
                isSelected={selectedElementIds.includes(childId)}
                isHovered={hoveredElementId === childId}
                onSelect={onSelect}
                onHover={onHover}
                parentHasAutoLayout={defaultHasAutoLayout}
                parentFlexDirection={defaultFlexDirection}
              />
            );
          });
        }
        return null;
    }
  };

  // Can this element be dragged?
  // Elements can be dragged for movement (normal) or reordering (auto-layout)
  const canDrag = !element.locked && !isEditingText;

  // Handle pointer down for multi-selection (Shift+Click)
  // Using onPointerDown because it's more reliable than onClick with framer-motion
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only handle left click
      if (e.button !== 0) return;
      if (element.locked) return;
      if (isEditingText) return;

      const shiftKey = e.shiftKey;

      // SHIFT+CLICK: Always add/remove from selection immediately
      if (shiftKey) {
        e.stopPropagation();
        e.preventDefault();
        onSelect(element.id, true);
      }
    },
    [element.id, element.locked, isEditingText, onSelect]
  );

  return (
    <motion.div
      ref={elementRef}
      data-element-id={element.id}
      drag={canDrag}
      dragMomentum={false}
      dragElastic={0}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{
        ...computedStyles,
        zIndex: isDragging ? 9999 : computedStyles.zIndex,
      }}
      whileDrag={{ cursor: 'grabbing' }}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => onHover(element.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Alt+Hover Inspect Mode - Shows element properties */}
      {altPressed && isHovered && !isSelected && (
        <div
          style={{
            position: 'absolute',
            top: -8,
            left: '50%',
            transform: 'translate(-50%, -100%)',
            background: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(139, 30, 43, 0.4)',
            borderRadius: 8,
            padding: '8px 12px',
            zIndex: 10000,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Element name/type */}
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#8B1E2B',
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {element.name || element.type}
          </div>

          {/* Dimensions */}
          <div style={{
            display: 'flex',
            gap: 12,
            fontSize: 11,
            color: '#e4e4e7',
            marginBottom: 4,
          }}>
            <span>
              <span style={{ color: '#71717a' }}>W</span> {Math.round(element.size.width)}
            </span>
            <span>
              <span style={{ color: '#71717a' }}>H</span> {Math.round(element.size.height)}
            </span>
          </div>

          {/* Padding if exists */}
          {hasPadding && (
            <div style={{
              display: 'flex',
              gap: 8,
              fontSize: 10,
              color: '#a1a1aa',
              marginTop: 4,
              paddingTop: 4,
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}>
              <span title="Padding">
                <span style={{ color: '#52525b' }}>P</span> {paddingValues.top}/{paddingValues.right}/{paddingValues.bottom}/{paddingValues.left}
              </span>
            </div>
          )}

          {/* Gap if auto-layout */}
          {element.styles.gap !== undefined && element.styles.gap > 0 && (
            <div style={{
              fontSize: 10,
              color: '#a1a1aa',
              marginTop: 2,
            }}>
              <span style={{ color: '#52525b' }}>Gap</span> {element.styles.gap}
            </div>
          )}

          {/* Border radius if exists */}
          {element.styles.borderRadius !== undefined && element.styles.borderRadius > 0 && (
            <div style={{
              fontSize: 10,
              color: '#a1a1aa',
              marginTop: 2,
            }}>
              <span style={{ color: '#52525b' }}>Radius</span> {element.styles.borderRadius}
            </div>
          )}
        </div>
      )}

      {/* Padding visualization overlay - Figma style */}
      {showPaddingOverlay && (
        <>
          {/* Top padding */}
          {paddingValues.top > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: paddingValues.left,
                right: paddingValues.right,
                height: paddingValues.top,
                background: 'rgba(139, 30, 43, 0.15)',
                borderBottom: '1px dashed rgba(139, 30, 43, 0.4)',
                pointerEvents: 'none',
                zIndex: 1000,
              }}
            >
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 9,
                fontWeight: 600,
                color: '#fff',
                background: '#8B1E2B',
                padding: '2px 6px',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}>
                {paddingValues.top}
              </span>
            </div>
          )}
          {/* Bottom padding */}
          {paddingValues.bottom > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: paddingValues.left,
                right: paddingValues.right,
                height: paddingValues.bottom,
                background: 'rgba(139, 30, 43, 0.15)',
                borderTop: '1px dashed rgba(139, 30, 43, 0.4)',
                pointerEvents: 'none',
                zIndex: 1000,
              }}
            >
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 9,
                fontWeight: 600,
                color: '#fff',
                background: '#8B1E2B',
                padding: '2px 6px',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}>
                {paddingValues.bottom}
              </span>
            </div>
          )}
          {/* Left padding */}
          {paddingValues.left > 0 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: paddingValues.top,
                bottom: paddingValues.bottom,
                width: paddingValues.left,
                background: 'rgba(139, 30, 43, 0.15)',
                borderRight: '1px dashed rgba(139, 30, 43, 0.4)',
                pointerEvents: 'none',
                zIndex: 1000,
              }}
            >
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-90deg)',
                fontSize: 9,
                fontWeight: 600,
                color: '#fff',
                background: '#8B1E2B',
                padding: '2px 6px',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                whiteSpace: 'nowrap',
              }}>
                {paddingValues.left}
              </span>
            </div>
          )}
          {/* Right padding */}
          {paddingValues.right > 0 && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: paddingValues.top,
                bottom: paddingValues.bottom,
                width: paddingValues.right,
                background: 'rgba(139, 30, 43, 0.15)',
                borderLeft: '1px dashed rgba(139, 30, 43, 0.4)',
                pointerEvents: 'none',
                zIndex: 1000,
              }}
            >
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(90deg)',
                fontSize: 9,
                fontWeight: 600,
                color: '#fff',
                background: '#8B1E2B',
                padding: '2px 6px',
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                whiteSpace: 'nowrap',
              }}>
                {paddingValues.right}
              </span>
            </div>
          )}
        </>
      )}
      {renderContent()}
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo - return true if props are equal (skip re-render)
  // We need to compare the element object deeply since it may have changed
  if (prevProps.isSelected !== nextProps.isSelected) return false;
  if (prevProps.isHovered !== nextProps.isHovered) return false;
  if (prevProps.zoom !== nextProps.zoom) return false;
  if (prevProps.parentHasAutoLayout !== nextProps.parentHasAutoLayout) return false;
  if (prevProps.parentFlexDirection !== nextProps.parentFlexDirection) return false;

  // Deep compare element - check key properties
  const prevEl = prevProps.element;
  const nextEl = nextProps.element;
  if (prevEl.id !== nextEl.id) return false;
  if (prevEl.position.x !== nextEl.position.x || prevEl.position.y !== nextEl.position.y) return false;
  if (prevEl.size.width !== nextEl.size.width || prevEl.size.height !== nextEl.size.height) return false;
  if (prevEl.content !== nextEl.content) return false;
  if (prevEl.visible !== nextEl.visible) return false;
  if (prevEl.locked !== nextEl.locked) return false;
  if (prevEl.src !== nextEl.src) return false;
  if (prevEl.children.length !== nextEl.children.length) return false;

  // Compare styles - use JSON for deep comparison (safe for simple objects)
  if (JSON.stringify(prevEl.styles) !== JSON.stringify(nextEl.styles)) return false;
  if (JSON.stringify(prevEl.crop) !== JSON.stringify(nextEl.crop)) return false;
  if (JSON.stringify(prevEl.responsiveStyles) !== JSON.stringify(nextEl.responsiveStyles)) return false;

  // Compare elements record - check if any children changed
  for (const childId of nextEl.children) {
    if (prevProps.elements[childId] !== nextProps.elements[childId]) return false;
  }

  return true;
});
