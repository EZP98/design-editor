/**
 * Visual Canvas Component
 *
 * A Figma-style canvas where ALL pages/artboards are visible at once.
 */

import React, { useRef, useState, useCallback, useEffect, useMemo, memo } from 'react';
import { motion, useMotionValue, useDragControls } from 'framer-motion';
import { useCanvasStore } from '../../lib/canvas/canvasStore';

// Draggable Page Component - direct DOM manipulation for smooth 60fps drag
const DraggablePage = memo(function DraggablePage({
  page,
  header,
  content,
  zoom,
  onDragEnd
}: {
  page: { id: string; x?: number; y?: number };
  header: React.ReactNode;
  content: React.ReactNode;
  zoom: number;
  onDragEnd: (pageId: string, offset: { x: number; y: number }) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(zoom);
  const pageRef = useRef(page);
  zoomRef.current = zoom;
  pageRef.current = page;

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: PointerEvent) => {
      // Direct DOM manipulation - no React re-render!
      const dx = (e.clientX - startPosRef.current.x) / zoomRef.current;
      const dy = (e.clientY - startPosRef.current.y) / zoomRef.current;
      offsetRef.current = { x: dx, y: dy };

      if (elementRef.current) {
        elementRef.current.style.left = `${(pageRef.current.x || 0) + dx}px`;
        elementRef.current.style.top = `${(pageRef.current.y || 0) + dy}px`;
      }
    };

    const handleUp = () => {
      onDragEnd(pageRef.current.id, offsetRef.current);
      offsetRef.current = { x: 0, y: 0 };
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [isDragging, onDragEnd]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    startPosRef.current = { x: e.clientX, y: e.clientY };
    offsetRef.current = { x: 0, y: 0 };

    // Set scale immediately via DOM
    if (elementRef.current) {
      elementRef.current.style.transform = 'scale(1.02)';
      elementRef.current.style.zIndex = '9999';
    }
    setIsDragging(true);
  }, []);

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: page.x || 0,
        top: page.y || 0,
        zIndex: 1,
        transformOrigin: 'top left',
        willChange: isDragging ? 'left, top' : 'auto',
      }}
    >
      <div style={{ position: 'relative', overflow: 'visible' }}>
        <div
          onPointerDown={handlePointerDown}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
          }}
        >
          {header}
        </div>
        {content}
      </div>
    </div>
  );
});
import { CanvasElement, CanvasPage, Position, ElementType, THEME_COLORS } from '../../lib/canvas/types';
import { CanvasElementRenderer } from './CanvasElementRenderer';
import { SelectionOverlay } from './SelectionOverlay';
import { CanvasToolbar } from './CanvasToolbar';
import { ContextMenu } from './ContextMenu';
import { useResponsiveStore, DEFAULT_BREAKPOINTS, Breakpoint } from '../../lib/canvas/responsive';

interface CanvasProps {
  zoom: number;
  pan: Position;
  onZoomChange: (zoom: number) => void;
  onPanChange: (pan: Position) => void;
}

export function Canvas({ zoom, pan, onZoomChange, onPanChange }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position | null>(null);
  const [activeTool, setActiveTool] = useState<'select' | 'hand' | 'frame' | 'text'>('select');

  // Refs for pan/zoom to avoid stale closures in event handlers
  const panRef = useRef(pan);
  const zoomRef = useRef(zoom);
  panRef.current = pan;
  zoomRef.current = zoom;

  // View mode: 'multi' shows all pages, 'single' shows only current page
  const [viewMode, setViewMode] = useState<'multi' | 'single'>('multi');

  // Page dragging state
  const [draggingPageId, setDraggingPageId] = useState<string | null>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elementId: string | null } | null>(null);

  // Marquee selection state
  const [marquee, setMarquee] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);


  const {
    elements,
    pages,
    currentPageId,
    selectedElementIds,
    hoveredElementId,
    canvasSettings,
    selectElement,
    deselectAll,
    setHoveredElement,
    addElement,
    addBlock,
    movePagePosition,
    setCurrentPage,
    saveToHistory,
    toggleEditorTheme,
    setShowPageSettings,
  } = useCanvasStore();

  // Responsive store for multi-breakpoint view
  const {
    breakpoints,
    multiBreakpointView,
    activeBreakpointId,
    setActiveBreakpoint,
  } = useResponsiveStore();

  // Get theme colors
  const editorTheme = canvasSettings?.editorTheme || 'dark';
  const themeColors = THEME_COLORS[editorTheme];

  // Initialize history on mount
  useEffect(() => {
    const { saveInitialState } = useCanvasStore.getState();
    saveInitialState();
  }, []);

  // Initial centering: center on first page when canvas loads
  const hasInitialCentered = useRef(false);
  useEffect(() => {
    const pageList = Object.values(pages);
    if (!hasInitialCentered.current && pageList.length > 0 && canvasRef.current) {
      const firstPage = pageList[0];
      const rootEl = elements[firstPage.rootElementId];
      if (rootEl) {
        hasInitialCentered.current = true;

        const pageX = firstPage.x || 0;
        const pageY = firstPage.y || 0;
        const pageWidth = rootEl.size?.width || 1440;
        const pageHeight = rootEl.size?.height || 900;

        // Center on the first page
        const centerX = pageX + pageWidth / 2;
        const centerY = pageY + pageHeight / 2;

        onPanChange({ x: -centerX, y: -centerY });
        onZoomChange(0.5); // Start at 50% zoom to see the whole page
      }
    }
  }, [pages, elements, onPanChange, onZoomChange]);

  // Handle canvas click (deselect) - only if not marquee selecting
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (marquee) return; // Don't deselect if we just finished marquee
      const target = e.target as HTMLElement;
      // Deselect when clicking on canvas background (outside pages)
      if (target === canvasRef.current ||
          target.dataset.canvasBackground === 'true' ||
          target.classList.contains('canvas-container')) {
        deselectAll();
        setShowPageSettings(false); // Also hide page settings
      }
    },
    [deselectAll, marquee, setShowPageSettings]
  );


  // Track if Space is pressed for temporary hand tool
  const [spacePressed, setSpacePressed] = useState(false);

  // Handle Space key for temporary hand tool
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setSpacePressed(true);
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Pan: Space+drag, middle mouse, or hand tool
  // Marquee: Left click drag on canvas background with select tool
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Middle mouse, hand tool, or Space pressed = pan anywhere
      if (e.button === 1 || activeTool === 'hand' || spacePressed) {
        e.preventDefault();
        e.stopPropagation();
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        return;
      }

      // Left click on canvas background with select tool = start marquee selection
      if (e.button === 0 && activeTool === 'select') {
        const target = e.target as HTMLElement;
        const isCanvasBackground = target === canvasRef.current ||
                                   target.dataset.canvasBackground === 'true' ||
                                   target.dataset.artboardBackground === 'true';
        if (isCanvasBackground) {
          e.preventDefault();
          setMarquee({
            startX: e.clientX,
            startY: e.clientY,
            currentX: e.clientX,
            currentY: e.clientY,
          });
        }
      }
    },
    [pan, activeTool, spacePressed]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning && panStart) {
        e.preventDefault();
        onPanChange({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      }

      // Update marquee
      if (marquee) {
        e.preventDefault();
        setMarquee(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null);
      }
    },
    [isPanning, panStart, onPanChange, marquee]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setPanStart(null);

    // Complete marquee selection
    if (marquee) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        // Calculate marquee bounds in canvas coordinates
        const minX = Math.min(marquee.startX, marquee.currentX);
        const maxX = Math.max(marquee.startX, marquee.currentX);
        const minY = Math.min(marquee.startY, marquee.currentY);
        const maxY = Math.max(marquee.startY, marquee.currentY);

        // Only select if marquee is big enough (not just a click)
        if (maxX - minX > 5 || maxY - minY > 5) {
          // Convert screen coordinates to canvas coordinates
          const canvasCenterX = rect.width / 2;
          const canvasCenterY = rect.height / 2;

          const marqueeCanvasMinX = (minX - rect.left - canvasCenterX - pan.x) / zoom;
          const marqueeCanvasMaxX = (maxX - rect.left - canvasCenterX - pan.x) / zoom;
          const marqueeCanvasMinY = (minY - rect.top - canvasCenterY - pan.y) / zoom;
          const marqueeCanvasMaxY = (maxY - rect.top - canvasCenterY - pan.y) / zoom;

          // Find all elements that intersect with the marquee
          const currentPage = pages[currentPageId];
          if (currentPage) {
            const pageX = currentPage.x || 0;
            const pageY = currentPage.y || 0;
            const rootElement = elements[currentPage.rootElementId];

            const selectedIds: string[] = [];

            // Check each child of the current page
            const checkElement = (elementId: string, offsetX: number, offsetY: number) => {
              const el = elements[elementId];
              if (!el || !el.visible || el.locked) return;

              // Skip the page root element itself
              if (el.type === 'page') {
                el.children.forEach(childId => checkElement(childId, offsetX, offsetY));
                return;
              }

              const elX = offsetX + el.position.x;
              const elY = offsetY + el.position.y;
              const elRight = elX + el.size.width;
              const elBottom = elY + el.size.height;

              // Check if element intersects with marquee
              if (elX < marqueeCanvasMaxX && elRight > marqueeCanvasMinX &&
                  elY < marqueeCanvasMaxY && elBottom > marqueeCanvasMinY) {
                selectedIds.push(elementId);
              }

              // Check children
              el.children.forEach(childId => checkElement(childId, elX, elY));
            };

            if (rootElement) {
              checkElement(currentPage.rootElementId, pageX, pageY);
            }

            // Select all found elements
            if (selectedIds.length > 0) {
              // Use selectElement with add=true for each element after the first
              const { selectElement, deselectAll } = useCanvasStore.getState();
              deselectAll();
              selectedIds.forEach((id, index) => {
                selectElement(id, index > 0);
              });
            }
          }
        }
      }
      setMarquee(null);
    }
  }, [marquee, zoom, pan, elements, pages, currentPageId]);

  // Container types that can have children - must match canvasStore
  const CONTAINER_TYPES = ['page', 'frame', 'section', 'container', 'stack', 'row', 'grid', 'box'];

  // Add element handler - adds to selected container if it can contain children
  const handleAddElement = useCallback(
    (type: string, options?: { iconName?: string }) => {
      // Check if there's a selected element that can be a parent
      let targetParentId: string | undefined;

      if (selectedElementIds.length === 1) {
        const selectedElement = elements[selectedElementIds[0]];
        if (selectedElement && CONTAINER_TYPES.includes(selectedElement.type)) {
          // Add as child of the selected container
          targetParentId = selectedElement.id;
        } else if (selectedElement?.parentId) {
          // If selected element is not a container, add as sibling (to the same parent)
          const parent = elements[selectedElement.parentId];
          if (parent && CONTAINER_TYPES.includes(parent.type)) {
            targetParentId = parent.id;
          }
        }
      }

      const elementId = addElement(type as ElementType, targetParentId);

      // If it's an icon with a specific icon name, update its content
      if (type === 'icon' && options?.iconName && elementId) {
        const { updateElementContent } = useCanvasStore.getState();
        updateElementContent(elementId, options.iconName);
      }
    },
    [addElement, selectedElementIds, elements]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in an input
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (isTyping) return;

      // Tool shortcuts (only when Cmd/Ctrl is NOT pressed)
      if (!e.metaKey && !e.ctrlKey) {
        if (e.key === 'v' || e.key === 'V') {
          e.preventDefault();
          setActiveTool('select');
        }
        if (e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          setActiveTool('hand');
        }
        if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          addElement('frame');
        }
        if (e.key === 't' || e.key === 'T') {
          e.preventDefault();
          addElement('text');
        }
        // Image shortcut
        if (e.key === 'i' || e.key === 'I') {
          e.preventDefault();
          addElement('image');
        }
        // Button shortcut
        if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          addElement('button');
        }
        // Rectangle/Box shortcut
        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          addElement('frame');
        }
      }

      // Delete
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementIds.length > 0) {
        e.preventDefault();
        const { deleteElement, deletePage, elements, pages } = useCanvasStore.getState();
        for (const id of selectedElementIds) {
          const element = elements[id];
          if (!element) continue;

          // Check if this is a page root element
          if (element.type === 'page') {
            // Find the page that has this element as rootElementId
            const pageEntry = Object.entries(pages).find(
              ([_, page]) => page.rootElementId === id
            );
            if (pageEntry) {
              deletePage(pageEntry[0]);
            }
          } else {
            deleteElement(id);
          }
        }
      }

      // Arrow keys for moving selected elements
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedElementIds.length > 0) {
        e.preventDefault();
        const { moveElement } = useCanvasStore.getState();
        const delta = e.shiftKey ? 10 : 1;

        for (const id of selectedElementIds) {
          const element = elements[id];
          if (!element || element.locked) continue;

          let newX = element.position.x;
          let newY = element.position.y;

          switch (e.key) {
            case 'ArrowUp': newY -= delta; break;
            case 'ArrowDown': newY += delta; break;
            case 'ArrowLeft': newX -= delta; break;
            case 'ArrowRight': newX += delta; break;
          }

          moveElement(id, { x: newX, y: newY });
        }
        saveToHistory('Move element');
      }

      // Copy/Paste/Cut/Undo/Redo and Frame/Group operations
      if (e.metaKey || e.ctrlKey) {
        const { copy, paste, cut, undo, redo, selectAll, wrapInFrame, groupElements, ungroupElements, duplicateElement, toggleLock, toggleVisibility } = useCanvasStore.getState();

        // Wrap in Frame: Cmd+Option+G (Mac) / Ctrl+Alt+G (Windows)
        if (e.key === 'g' && e.altKey && !e.shiftKey) {
          e.preventDefault();
          wrapInFrame();
          return;
        }

        // Ungroup: Shift+Cmd+G (Mac) / Shift+Ctrl+G (Windows)
        if (e.key === 'g' && e.shiftKey && !e.altKey) {
          e.preventDefault();
          ungroupElements();
          return;
        }

        // Group: Cmd+G (Mac) / Ctrl+G (Windows)
        if (e.key === 'g' && !e.altKey && !e.shiftKey) {
          e.preventDefault();
          groupElements();
          return;
        }

        // Lock: Cmd+Shift+L (Figma style)
        if ((e.key === 'l' || e.key === 'L') && e.shiftKey) {
          e.preventDefault();
          for (const id of selectedElementIds) {
            toggleLock(id);
          }
          return;
        }

        // Hide: Cmd+Shift+H (Figma style)
        if ((e.key === 'h' || e.key === 'H') && e.shiftKey) {
          e.preventDefault();
          for (const id of selectedElementIds) {
            toggleVisibility(id);
          }
          return;
        }

        if (e.key === 'c') {
          e.preventDefault();
          copy();
        }
        if (e.key === 'v') {
          e.preventDefault();
          paste();
        }
        if (e.key === 'x') {
          e.preventDefault();
          cut();
        }
        if (e.key === 'd') {
          e.preventDefault();
          for (const id of selectedElementIds) {
            duplicateElement(id);
          }
        }
        // Undo: Cmd+Z
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        }
        // Redo: Cmd+Shift+Z or Cmd+Y
        if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          redo();
        }
        if (e.key === 'a') {
          e.preventDefault();
          selectAll();
        }
        // Zoom shortcuts
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          onZoomChange(Math.min(4, zoom + 0.25));
        }
        if (e.key === '-') {
          e.preventDefault();
          onZoomChange(Math.max(0.1, zoom - 0.25));
        }
        if (e.key === '0') {
          e.preventDefault();
          onZoomChange(1);
          onPanChange({ x: 0, y: 0 });
        }
        // Zoom to fit: Cmd+1
        if (e.key === '1') {
          e.preventDefault();
          onZoomChange(1);
        }
      }

      // Escape
      if (e.key === 'Escape') {
        deselectAll();
        setActiveTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElementIds, deselectAll, addElement, zoom, onZoomChange, onPanChange]);

  // Wheel handling - Figma style with smooth pan and zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Momentum state for smooth inertial scrolling
    let velocityX = 0;
    let velocityY = 0;
    let animationFrame: number | null = null;
    let lastWheelTime = 0;

    const applyMomentum = () => {
      const friction = 0.92;
      velocityX *= friction;
      velocityY *= friction;

      if (Math.abs(velocityX) < 0.5 && Math.abs(velocityY) < 0.5) {
        velocityX = 0;
        velocityY = 0;
        animationFrame = null;
        return;
      }

      // Use ref to get current pan value (avoids stale closure)
      onPanChange({
        x: panRef.current.x + velocityX,
        y: panRef.current.y + velocityY,
      });

      animationFrame = requestAnimationFrame(applyMomentum);
    };

    // Get zoom target point - selected element center or cursor
    const getZoomTarget = (e: WheelEvent, rect: DOMRect): { x: number; y: number } => {
      const state = useCanvasStore.getState();
      const { selectedElementIds, elements, pages, currentPageId } = state;

      // If element(s) selected, zoom towards their center
      if (selectedElementIds.length > 0) {
        const currentPage = pages[currentPageId];
        if (!currentPage) return { x: e.clientX - rect.left, y: e.clientY - rect.top };

        // Calculate bounding box of all selected elements
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        for (const id of selectedElementIds) {
          const el = elements[id];
          if (!el) continue;

          // Get element position relative to page
          const elX = el.position.x + (currentPage.x || 0);
          const elY = el.position.y + (currentPage.y || 0);

          minX = Math.min(minX, elX);
          minY = Math.min(minY, elY);
          maxX = Math.max(maxX, elX + el.size.width);
          maxY = Math.max(maxY, elY + el.size.height);
        }

        if (minX !== Infinity) {
          // Center of selected elements in canvas coordinates
          const centerX = (minX + maxX) / 2;
          const centerY = (minY + maxY) / 2;

          // Convert to screen coordinates - use refs for current values
          const currentPan = panRef.current;
          const currentZoom = zoomRef.current;
          const screenCenterX = rect.width / 2 + currentPan.x + centerX * currentZoom;
          const screenCenterY = rect.height / 2 + currentPan.y + centerY * currentZoom;

          return { x: screenCenterX, y: screenCenterY };
        }
      }

      // No selection - use cursor position
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      const timeDelta = now - lastWheelTime;
      lastWheelTime = now;

      // Get current values from refs
      const currentPan = panRef.current;
      const currentZoom = zoomRef.current;

      const isDeltaPixels = e.deltaMode === 0;
      const hasHorizontalScroll = Math.abs(e.deltaX) > 0;
      const isPinchZoom = e.ctrlKey && isDeltaPixels;
      // More reliable trackpad detection - trackpad sends many small deltas
      const isTrackpad = hasHorizontalScroll || (isDeltaPixels && !e.ctrlKey);

      // Pinch zoom (trackpad) or Cmd+scroll
      if (isPinchZoom || e.metaKey) {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
        velocityX = 0;
        velocityY = 0;

        const rect = canvas.getBoundingClientRect();
        const target = getZoomTarget(e, rect);

        const sensitivity = isPinchZoom ? 0.008 : 0.003;
        const zoomDelta = Math.exp(-e.deltaY * sensitivity);
        const newZoom = Math.min(4, Math.max(0.1, currentZoom * zoomDelta));

        if (Math.abs(newZoom - currentZoom) < 0.001) return;

        const zoomRatio = newZoom / currentZoom;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = target.x - centerX - currentPan.x;
        const offsetY = target.y - centerY - currentPan.y;

        const newPanX = currentPan.x - offsetX * (zoomRatio - 1);
        const newPanY = currentPan.y - offsetY * (zoomRatio - 1);

        onZoomChange(newZoom);
        onPanChange({ x: newPanX, y: newPanY });
      } else if (isTrackpad || hasHorizontalScroll) {
        // Trackpad two-finger scroll = pan
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }

        const newPan = {
          x: currentPan.x - e.deltaX,
          y: currentPan.y - e.deltaY,
        };
        onPanChange(newPan);

        if (timeDelta < 50) {
          velocityX = -e.deltaX * 0.3;
          velocityY = -e.deltaY * 0.3;
        }

        setTimeout(() => {
          if (Date.now() - lastWheelTime > 80 && (Math.abs(velocityX) > 1 || Math.abs(velocityY) > 1)) {
            if (!animationFrame) {
              animationFrame = requestAnimationFrame(applyMomentum);
            }
          }
        }, 100);
      } else {
        // Mouse wheel = zoom towards selected element or cursor
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
        velocityX = 0;
        velocityY = 0;

        const rect = canvas.getBoundingClientRect();
        const target = getZoomTarget(e, rect);

        const zoomDelta = Math.exp(-e.deltaY * 0.002);
        const newZoom = Math.min(4, Math.max(0.1, currentZoom * zoomDelta));

        if (Math.abs(newZoom - currentZoom) < 0.001) return;

        const zoomRatio = newZoom / currentZoom;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = target.x - centerX - currentPan.x;
        const offsetY = target.y - centerY - currentPan.y;

        const newPanX = currentPan.x - offsetX * (zoomRatio - 1);
        const newPanY = currentPan.y - offsetY * (zoomRatio - 1);

        onZoomChange(newZoom);
        onPanChange({ x: newPanX, y: newPanY });
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [onZoomChange, onPanChange]); // Removed zoom, pan since we use refs

  // Handle page drag end - update store position
  const handlePageDragEnd = useCallback((pageId: string, offset: { x: number; y: number }) => {
    const page = pages[pageId];
    if (!page) return;

    const newX = Math.round((page.x || 0) + offset.x);
    const newY = Math.round((page.y || 0) + offset.y);
    movePagePosition(pageId, { x: newX, y: newY });
    saveToHistory('Move page');
  }, [pages, movePagePosition, saveToHistory]);

  // Calculate content bounds for hug mode
  const calculateContentBounds = (childIds: string[]) => {
    if (childIds.length === 0) return { minX: 0, minY: 0, maxX: 200, maxY: 200 };

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const childId of childIds) {
      const child = elements[childId];
      if (!child || !child.visible) continue;

      const left = child.position.x;
      const top = child.position.y;
      const right = left + child.size.width;
      const bottom = top + child.size.height;

      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, right);
      maxY = Math.max(maxY, bottom);
    }

    // Add padding
    const padding = 24;
    return {
      minX: Math.max(0, minX - padding),
      minY: Math.max(0, minY - padding),
      maxX: maxX + padding,
      maxY: maxY + padding,
    };
  };

  // Render a single page/artboard
  const renderPage = (page: CanvasPage, forceCenter = false) => {
    const rootElement = elements[page.rootElementId];
    if (!rootElement) return null;

    const isCurrentPage = page.id === currentPageId;

    // Check for hug mode and calculate page size
    // Default to 'hug' for height so pages auto-expand with content
    const resizeX = (rootElement.styles as any).resizeX || 'fixed';
    const resizeY = (rootElement.styles as any).resizeY || 'hug';

    let pageWidth = rootElement.size.width;
    let pageHeight = rootElement.size.height;
    const isHeightHug = resizeY === 'hug';

    if (resizeX === 'hug' || resizeY === 'hug') {
      const bounds = calculateContentBounds(rootElement.children);
      if (resizeX === 'hug') {
        pageWidth = Math.max(200, bounds.maxX);
      }
      if (resizeY === 'hug') {
        // For hug mode, use content bounds as minimum, but keep at least 900px for empty pages
        pageHeight = Math.max(900, bounds.maxY);
      }
    }

    // In single mode, center the page (ignore x,y position)
    const usePosition = forceCenter ? { x: 0, y: 0 } : { x: page.x || 0, y: page.y || 0 };

    // Check if page has auto-layout
    const pageHasAutoLayout = rootElement.styles.display === 'flex' || rootElement.styles.display === 'grid';

    // Page header (drag handle)
    const pageHeader = (
      <div
        onClick={(e) => {
          e.stopPropagation();
          setCurrentPage(page.id);
          deselectAll();
          setShowPageSettings(true); // Explicitly show page settings
        }}
        style={{
          position: 'absolute',
          top: -40,
          left: 0,
          width: pageWidth,
          height: 36,
          background: isCurrentPage ? '#A78BFA' : '#27272a',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          userSelect: 'none',
          zIndex: 1000,
          touchAction: 'none',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
          cursor: 'pointer',
        }}
      >
        <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" opacity={0.6}>
          <circle cx="2.5" cy="2.5" r="2" />
          <circle cx="7.5" cy="2.5" r="2" />
          <circle cx="2.5" cy="7" r="2" />
          <circle cx="7.5" cy="7" r="2" />
          <circle cx="2.5" cy="11.5" r="2" />
          <circle cx="7.5" cy="11.5" r="2" />
        </svg>
        <span>{page.name}</span>
        <span style={{ opacity: 0.6, fontSize: 11 }}>
          {Math.round(pageWidth)} × {isHeightHug ? 'Auto' : Math.round(pageHeight)}
        </span>
      </div>
    );

    // Page content (artboard)
    // pageWidth and pageHeight are already calculated (including hug mode adjustments)
    const pageContent = (
      <>
        {/* Artboard content */}
          <div
            className="relative"
            data-canvas-export={isCurrentPage ? 'true' : undefined}
            style={{
              width: pageWidth,
              // Use minHeight for hug mode so page expands with content
              ...(isHeightHug ? { minHeight: pageHeight } : { height: pageHeight }),
              backgroundColor: rootElement.styles.backgroundColor || '#ffffff',
              borderRadius: 8,
              boxShadow: editorTheme === 'light'
                ? (isCurrentPage ? '0 0 0 2px #A78BFA' : '0 1px 3px rgba(0,0,0,0.08)')
                : (isCurrentPage
                  ? '0 25px 100px rgba(0,0,0,0.5), 0 0 0 2px #A78BFA'
                  : '0 25px 100px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)'),
              cursor: activeTool === 'select' ? 'default' : undefined,
              // Auto Layout styles from page
              display: rootElement.styles.display || 'block',
              flexDirection: rootElement.styles.flexDirection,
              justifyContent: rootElement.styles.justifyContent,
              alignItems: rootElement.styles.alignItems,
              gap: rootElement.styles.gap,
              padding: rootElement.styles.padding,
              paddingTop: rootElement.styles.paddingTop,
              paddingRight: rootElement.styles.paddingRight,
              paddingBottom: rootElement.styles.paddingBottom,
              paddingLeft: rootElement.styles.paddingLeft,
              overflow: rootElement.styles.overflow || 'hidden',
            }}
            onClick={(e) => {
              // Select page when clicking on artboard background
              const target = e.target as HTMLElement;
              const isClickOnArtboard = target === e.currentTarget || target.dataset.artboardBackground === 'true';
              if (isClickOnArtboard && activeTool === 'select') {
                e.stopPropagation();
                setCurrentPage(page.id);
                selectElement(rootElement.id);
              }
            }}
          >
          {/* Invisible click layer for page selection */}
          <div
            data-artboard-background="true"
            onClick={(e) => {
              e.stopPropagation();
              if (activeTool === 'select') {
                setCurrentPage(page.id);
                selectElement(rootElement.id);
              }
            }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              cursor: activeTool === 'select' ? 'default' : undefined,
            }}
          />

          {/* Render elements */}
          {(() => {
            const pageFlexDirection = rootElement.styles.flexDirection || 'column';
            return rootElement.children.map((childId) => {
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
                  onSelect={(id, add) => {
                    setCurrentPage(page.id);
                    selectElement(id, add);
                  }}
                  onHover={setHoveredElement}
                  parentHasAutoLayout={pageHasAutoLayout}
                  parentFlexDirection={pageFlexDirection}
                />
              );
            });
          })()}

          {/* Selection overlays - SOLO per page root element */}
          {/* Tutti gli altri elementi usano outline inline da CanvasElementRenderer */}
          {/* Questo evita problemi di posizionamento quando gli elementi sono in flow layout */}
          {isCurrentPage && selectedElementIds.map((id) => {
            const element = elements[id];
            if (!element) return null;

            // SOLO page root element ottiene SelectionOverlay
            // Tutti gli altri elementi (frame, section, etc.) usano inline outline
            if (element.type === 'page' && element.id === rootElement.id) {
              const pageElement = {
                ...element,
                position: { x: 0, y: 0 },
              };
              return <SelectionOverlay key={`sel-${id}`} element={pageElement} zoom={zoom} />;
            }

            // Tutti gli altri elementi usano outline inline (gestito da CanvasElementRenderer)
            return null;
          })}

          </div>
      </>
    );

    return (
      <DraggablePage
        key={page.id}
        page={{ id: page.id, x: usePosition.x, y: usePosition.y }}
        zoom={zoom}
        onDragEnd={handlePageDragEnd}
        header={pageHeader}
        content={pageContent}
      />
    );
  };

  return (
    <div
      ref={canvasRef}
      className="relative canvas-container"
      data-canvas-background="true"
      style={{
        flex: 1,
        width: '100%',
        height: '100%',
        minHeight: 0, // Important for flex children
        background: themeColors.canvasBg,
        cursor: isPanning ? 'grabbing' : (activeTool === 'hand' || spacePressed) ? 'grab' : 'default',
        overflow: 'hidden',
        // Prevent browser back/forward gestures on horizontal scroll
        overscrollBehavior: 'none',
        touchAction: 'none',
        transition: 'background 0.3s ease',
      }}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={(e) => {
        e.preventDefault();
        // Find clicked element
        const target = e.target as HTMLElement;
        const elementId = target.closest('[data-element-id]')?.getAttribute('data-element-id') || null;
        if (elementId && !selectedElementIds.includes(elementId)) {
          selectElement(elementId);
        }
        setContextMenu({ x: e.clientX, y: e.clientY, elementId });
      }}
    >
      {/* Grid pattern background - uses CSS custom properties for performance */}
      <div
        data-canvas-background="true"
        className="absolute inset-0 canvas-grid"
        style={{
          '--grid-size': `${20 * zoom}px`,
          '--grid-offset-x': `${pan.x % (20 * zoom)}px`,
          '--grid-offset-y': `${pan.y % (20 * zoom)}px`,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: 'var(--grid-size) var(--grid-size)',
          backgroundPosition: 'var(--grid-offset-x) var(--grid-offset-y)',
          pointerEvents: 'none',
          willChange: 'background-position',
        } as React.CSSProperties}
      />

      {/* All pages container - centered and panned */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          transform: `translate3d(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px), 0) scale(${zoom})`,
          transformOrigin: 'center center',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          paddingTop: 50, // Space for drag handles
        }}
      >
        {/* Render pages based on view mode */}
        {multiBreakpointView && pages[currentPageId] ? (
          // Multi-breakpoint view: Desktop, Tablet, Mobile side by side
          <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
            {breakpoints.map((bp, index) => {
              const page = pages[currentPageId];
              const rootElement = elements[page.rootElementId];
              if (!rootElement) return null;

              const isActiveBreakpoint = bp.id === activeBreakpointId;
              const pageHasAutoLayout = rootElement.styles.display === 'flex' || rootElement.styles.display === 'grid';

              // Calculate content bounds for hug mode
              const resizeY = (rootElement.styles as any).resizeY || 'hug';
              let pageHeight = rootElement.size.height;
              const isHeightHug = resizeY === 'hug';

              if (isHeightHug) {
                const bounds = calculateContentBounds(rootElement.children);
                pageHeight = Math.max(900, bounds.maxY);
              }

              return (
                <div
                  key={bp.id}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  {/* Breakpoint header */}
                  <div
                    onClick={() => setActiveBreakpoint(bp.id)}
                    style={{
                      width: bp.width,
                      padding: '10px 16px',
                      background: isActiveBreakpoint ? '#A78BFA' : '#27272a',
                      borderRadius: '10px 10px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Breakpoint icon */}
                      {bp.icon === 'desktop' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      )}
                      {bp.icon === 'tablet' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="4" y="2" width="16" height="20" rx="2" />
                          <line x1="12" y1="18" x2="12" y2="18" />
                        </svg>
                      )}
                      {bp.icon === 'mobile' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="5" y="2" width="14" height="20" rx="2" />
                          <line x1="12" y1="18" x2="12" y2="18" />
                        </svg>
                      )}
                      <span>{bp.name}</span>
                      {bp.isDefault && (
                        <span style={{
                          fontSize: 9,
                          background: 'rgba(255,255,255,0.2)',
                          padding: '2px 6px',
                          borderRadius: 4
                        }}>
                          Primary
                        </span>
                      )}
                    </div>
                    <span style={{ opacity: 0.7 }}>{bp.width}px</span>
                  </div>

                  {/* Page content at this breakpoint width */}
                  <div
                    className="relative"
                    style={{
                      width: bp.width,
                      minHeight: isHeightHug ? pageHeight : rootElement.size.height,
                      backgroundColor: rootElement.styles.backgroundColor || '#ffffff',
                      borderRadius: '0 0 8px 8px',
                      boxShadow: isActiveBreakpoint
                        ? '0 25px 100px rgba(0,0,0,0.5), 0 0 0 2px #A78BFA'
                        : '0 25px 100px rgba(0,0,0,0.3)',
                      display: rootElement.styles.display || 'block',
                      flexDirection: rootElement.styles.flexDirection,
                      justifyContent: rootElement.styles.justifyContent,
                      alignItems: rootElement.styles.alignItems,
                      gap: rootElement.styles.gap,
                      padding: rootElement.styles.padding,
                      overflow: 'hidden',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveBreakpoint(bp.id);
                      selectElement(rootElement.id);
                    }}
                  >
                    {/* Render elements with breakpoint-specific styles */}
                    {rootElement.children.map((childId) => {
                      const child = elements[childId];
                      if (!child || !child.visible) return null;
                      return (
                        <CanvasElementRenderer
                          key={`${childId}-${bp.id}`}
                          element={child}
                          elements={elements}
                          zoom={zoom}
                          isSelected={selectedElementIds.includes(childId) && isActiveBreakpoint}
                          isHovered={hoveredElementId === childId && isActiveBreakpoint}
                          onSelect={(id, add) => {
                            setActiveBreakpoint(bp.id);
                            selectElement(id, add);
                          }}
                          onHover={(id) => isActiveBreakpoint && setHoveredElement(id)}
                          parentHasAutoLayout={pageHasAutoLayout}
                          parentFlexDirection={rootElement.styles.flexDirection || 'column'}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Normal view mode
          viewMode === 'multi'
            ? Object.values(pages).map((page) => renderPage(page, false))
            : pages[currentPageId] && renderPage(pages[currentPageId], false)
        )}
      </div>

      {/* Floating Toolbar */}
      <CanvasToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onAddElement={handleAddElement}
        onAddBlock={addBlock}
        onAddIcon={(iconName) => handleAddElement('icon', { iconName })}
        zoom={zoom}
        onZoomChange={onZoomChange}
        theme={editorTheme}
        onThemeToggle={toggleEditorTheme}
      />


      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          elementId={contextMenu.elementId}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Marquee Selection Rectangle */}
      {marquee && (
        <div
          style={{
            position: 'fixed',
            left: Math.min(marquee.startX, marquee.currentX),
            top: Math.min(marquee.startY, marquee.currentY),
            width: Math.abs(marquee.currentX - marquee.startX),
            height: Math.abs(marquee.currentY - marquee.startY),
            backgroundColor: 'rgba(139, 30, 43, 0.1)',
            border: '1px solid rgba(139, 30, 43, 0.6)',
            pointerEvents: 'none',
            zIndex: 10000,
          }}
        />
      )}
    </div>
  );
}
