/**
 * Canvas Sidebar
 *
 * Bolt-style sidebar with Pages and Layers tabs.
 */

import React, { useState, useMemo, memo } from 'react';
import { useCanvasStore } from '../../lib/canvas/canvasStore';
import { CanvasElement, CanvasPage, ElementType, THEME_COLORS } from '../../lib/canvas/types';
import { getStylesForBreakpoint } from '../../lib/canvas/responsive';
import AIChatPanel from '../AIChatPanel';

// Element type icons
const TYPE_ICONS: Record<ElementType, React.ReactNode> = {
  page: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  frame: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  stack: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="4" width="16" height="6" rx="1" />
      <rect x="4" y="14" width="16" height="6" rx="1" />
    </svg>
  ),
  grid: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  text: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
  button: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="6" width="18" height="12" rx="4" />
    </svg>
  ),
  image: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  input: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <line x1="7" y1="12" x2="7" y2="12" />
    </svg>
  ),
  link: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  video: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
    </svg>
  ),
  section: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="6" width="20" height="12" rx="2" />
    </svg>
  ),
  container: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 8h16M4 16h16" />
    </svg>
  ),
  row: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="6" width="6" height="12" rx="1" />
      <rect x="11" y="6" width="6" height="12" rx="1" />
    </svg>
  ),
  model3d: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
};

// Mini Page Preview - renders the first section/viewport of the page
// NOTE: Removed memo to ensure preview always reflects current state
function MiniPagePreview({
  page,
  width = 56,
  height = 40,
}: {
  page: CanvasPage;
  width?: number;
  height?: number;
}) {
  const elements = useCanvasStore((state) => state.elements);
  const rootElement = elements[page.rootElementId];

  // Scale to fit width, showing the top portion (first section)
  const scale = width / page.width;
  // Calculate a reasonable minimum height for the scaled content
  // This should be tall enough to show the first section without weird clipping
  const minContentHeight = Math.max(page.height, 800);

  // Render element recursively
  const renderElement = (element: CanvasElement, parentHasAutoLayout = false, parentFlexDirection?: string): React.ReactNode => {
    if (!element || !element.visible) return null;

    const styles = getStylesForBreakpoint(element.styles, element.responsiveStyles, 'desktop');

    // Handle resize modes
    const resizeX = (styles as any).resizeX || 'fixed';
    const resizeY = (styles as any).resizeY || 'fixed';

    let elWidth: number | string = element.size.width;
    let elHeight: number | string = element.size.height;

    // In auto-layout, handle fill/hug based on parent's flex direction
    if (parentHasAutoLayout) {
      const isHorizontal = parentFlexDirection === 'row' || parentFlexDirection === 'row-reverse';

      if (resizeX === 'fill') {
        elWidth = isHorizontal ? undefined : '100%'; // Let flex handle it
      } else if (resizeX === 'hug') {
        elWidth = 'auto';
      }

      if (resizeY === 'fill') {
        elHeight = isHorizontal ? '100%' : undefined; // Let flex handle it
      } else if (resizeY === 'hug') {
        elHeight = 'auto';
      }
    }

    const cssStyles: React.CSSProperties = {
      position: element.positionType === 'absolute' && !parentHasAutoLayout ? 'absolute' : 'relative',
      width: elWidth,
      height: elHeight,
      minWidth: resizeX === 'hug' ? undefined : element.size.width,
      minHeight: resizeY === 'hug' ? 20 : undefined,
      flexShrink: 0,
      flexGrow: (resizeX === 'fill' || resizeY === 'fill') ? 1 : 0,
      flexBasis: parentHasAutoLayout ? (resizeX === 'fill' || resizeY === 'fill' ? 0 : 'auto') : undefined,
      alignSelf: resizeY === 'fill' && parentHasAutoLayout ? 'stretch' : undefined,
    };

    if (element.positionType === 'absolute' && !parentHasAutoLayout) {
      cssStyles.left = element.position.x;
      cssStyles.top = element.position.y;
    }

    // Layout
    if (styles.display) cssStyles.display = styles.display;
    if (styles.flexDirection) cssStyles.flexDirection = styles.flexDirection;
    if (styles.justifyContent) cssStyles.justifyContent = styles.justifyContent;
    if (styles.alignItems) cssStyles.alignItems = styles.alignItems;
    if (styles.gap !== undefined) cssStyles.gap = styles.gap;
    if (styles.gridTemplateColumns) cssStyles.gridTemplateColumns = styles.gridTemplateColumns;

    // Spacing
    if (styles.padding !== undefined) cssStyles.padding = styles.padding;
    if (styles.paddingTop !== undefined) cssStyles.paddingTop = styles.paddingTop;
    if (styles.paddingRight !== undefined) cssStyles.paddingRight = styles.paddingRight;
    if (styles.paddingBottom !== undefined) cssStyles.paddingBottom = styles.paddingBottom;
    if (styles.paddingLeft !== undefined) cssStyles.paddingLeft = styles.paddingLeft;

    // Background
    if (styles.backgroundColor) cssStyles.backgroundColor = styles.backgroundColor;
    if (styles.backgroundImage) cssStyles.backgroundImage = styles.backgroundImage;
    if (styles.background) cssStyles.background = styles.background;

    // Border
    if (styles.borderRadius !== undefined) cssStyles.borderRadius = styles.borderRadius;
    if (styles.borderWidth !== undefined) cssStyles.borderWidth = styles.borderWidth;
    if (styles.borderColor) cssStyles.borderColor = styles.borderColor;
    if (styles.borderStyle) cssStyles.borderStyle = styles.borderStyle;

    // Effects
    if (styles.opacity !== undefined) cssStyles.opacity = styles.opacity;
    if (styles.boxShadow) cssStyles.boxShadow = styles.boxShadow;
    if (styles.overflow) cssStyles.overflow = styles.overflow;

    // Render content based on type
    let content: React.ReactNode = null;

    switch (element.type) {
      case 'text':
        content = (
          <div
            style={{
              fontSize: styles.fontSize ? styles.fontSize * 0.5 : 6,
              fontWeight: styles.fontWeight,
              color: styles.color || '#333',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {element.content || ''}
          </div>
        );
        break;

      case 'button':
        content = (
          <div
            style={{
              ...cssStyles,
              fontSize: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {element.content || ''}
          </div>
        );
        break;

      case 'image':
        content = element.src ? (
          <img
            src={element.src}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: (styles.objectFit as any) || 'cover',
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: '#e5e5e5' }} />
        );
        break;

      default:
        // Container types - render children with auto-layout context
        const hasAutoLayout = styles.display === 'flex' || styles.display === 'grid';
        const flexDir = styles.flexDirection || 'column';
        content = element.children.map((childId) => {
          const child = elements[childId];
          if (!child) return null;
          return <React.Fragment key={childId}>{renderElement(child, hasAutoLayout, flexDir)}</React.Fragment>;
        });
    }

    return <div style={cssStyles}>{content}</div>;
  };

  if (!rootElement) {
    return (
      <div
        style={{
          width,
          height,
          background: page.backgroundColor || '#ffffff',
          borderRadius: 3,
        }}
      />
    );
  }

  // Check if page has auto-layout
  const pageHasAutoLayout = rootElement.styles.display === 'flex' || rootElement.styles.display === 'grid';
  const pageFlexDirection = rootElement.styles.flexDirection || 'column';

  return (
    <div
      style={{
        width,
        height,
        overflow: 'hidden',
        borderRadius: 3,
        background: page.backgroundColor || rootElement.styles.backgroundColor || '#ffffff',
        position: 'relative',
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: page.width,
          minHeight: minContentHeight,
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          // Apply page's auto-layout styles
          display: rootElement.styles.display || 'flex',
          flexDirection: rootElement.styles.flexDirection || 'column',
          justifyContent: rootElement.styles.justifyContent,
          alignItems: rootElement.styles.alignItems || 'stretch',
          gap: rootElement.styles.gap,
          padding: rootElement.styles.padding,
          paddingTop: rootElement.styles.paddingTop,
          paddingRight: rootElement.styles.paddingRight,
          paddingBottom: rootElement.styles.paddingBottom,
          paddingLeft: rootElement.styles.paddingLeft,
          backgroundColor: rootElement.styles.backgroundColor,
        }}
      >
        {rootElement.children.map((childId) => {
          const child = elements[childId];
          if (!child) return null;
          return <React.Fragment key={childId}>{renderElement(child, pageHasAutoLayout, pageFlexDirection)}</React.Fragment>;
        })}
      </div>
    </div>
  );
}

// Drag state for layers - shared across all LayerItem components
interface DragState {
  draggingId: string | null;
  dropTargetId: string | null;
  dropPosition: 'before' | 'after' | 'inside' | null;
}

// Layer drag context - use React context for shared state
const LayerDragContext = React.createContext<{
  dragState: DragState;
  setDragState: (state: DragState) => void;
}>({
  dragState: { draggingId: null, dropTargetId: null, dropPosition: null },
  setDragState: () => {},
});

// Container types that can accept children
const CONTAINER_TYPES = ['page', 'frame', 'section', 'container', 'stack', 'row', 'grid'];

// Layer Item Component - Compact Figma-style with drag & drop
function LayerItem({ element, depth = 0 }: { element: CanvasElement; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const {
    elements,
    selectedElementIds,
    hoveredElementId,
    selectElement,
    setHoveredElement,
    toggleVisibility,
    renameElement,
    reorderElement,
    canvasSettings,
  } = useCanvasStore();

  // Theme
  const theme = canvasSettings?.editorTheme || 'dark';
  const colors = THEME_COLORS[theme];

  // Drag context
  const { dragState, setDragState } = React.useContext(LayerDragContext);

  const isSelected = selectedElementIds.includes(element.id);
  const isHovered = hoveredElementId === element.id;
  const hasChildren = element.children.length > 0;
  const isContainer = CONTAINER_TYPES.includes(element.type);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(element.name);

  const isDragging = dragState.draggingId === element.id;
  const isDropTarget = dragState.dropTargetId === element.id;
  const dropPosition = isDropTarget ? dragState.dropPosition : null;

  // Handle drag start
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', element.id);
    setDragState({ ...dragState, draggingId: element.id });
  };

  // Handle drag end
  const handleDragEnd = () => {
    // Perform the reorder if we have a valid drop target
    if (dragState.draggingId && dragState.dropTargetId && dragState.dropPosition) {
      reorderElement(dragState.draggingId, dragState.dropTargetId, dragState.dropPosition);
    }
    setDragState({ draggingId: null, dropTargetId: null, dropPosition: null });
  };

  // Handle drag over - determine drop position based on mouse position
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dragState.draggingId || dragState.draggingId === element.id) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    let position: 'before' | 'after' | 'inside';

    if (isContainer && y > height * 0.25 && y < height * 0.75) {
      // Middle zone - drop inside container
      position = 'inside';
    } else if (y < height / 2) {
      // Top half - drop before
      position = 'before';
    } else {
      // Bottom half - drop after
      position = 'after';
    }

    setDragState({
      ...dragState,
      dropTargetId: element.id,
      dropPosition: position,
    });
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving this element
    const relatedTarget = e.relatedTarget as Node;
    if (!e.currentTarget.contains(relatedTarget)) {
      if (dragState.dropTargetId === element.id) {
        setDragState({ ...dragState, dropTargetId: null, dropPosition: null });
      }
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isRenaming) return;

    // Move element up/down with Cmd/Ctrl + arrow keys
    if ((e.metaKey || e.ctrlKey) && isSelected) {
      const parent = element.parentId ? elements[element.parentId] : null;
      if (!parent) return;

      const siblingIndex = parent.children.indexOf(element.id);

      if (e.key === 'ArrowUp' || e.key === '[') {
        // Move up (earlier in list = higher in visual order)
        if (siblingIndex > 0) {
          const targetId = parent.children[siblingIndex - 1];
          reorderElement(element.id, targetId, 'before');
          e.preventDefault();
        }
      } else if (e.key === 'ArrowDown' || e.key === ']') {
        // Move down (later in list = lower in visual order)
        if (siblingIndex < parent.children.length - 1) {
          const targetId = parent.children[siblingIndex + 1];
          reorderElement(element.id, targetId, 'after');
          e.preventDefault();
        }
      }
    }
  };

  // Calculate drop indicator styles
  const getDropIndicatorStyle = (): React.CSSProperties | null => {
    if (!isDropTarget || !dropPosition) return null;

    if (dropPosition === 'before') {
      return {
        position: 'absolute',
        top: 0,
        left: depth * 16 + 10,
        right: 10,
        height: 2,
        background: colors.accent,
        borderRadius: 1,
        zIndex: 10,
      };
    } else if (dropPosition === 'after') {
      return {
        position: 'absolute',
        bottom: 0,
        left: depth * 16 + 10,
        right: 10,
        height: 2,
        background: colors.accent,
        borderRadius: 1,
        zIndex: 10,
      };
    }
    return null;
  };

  const dropIndicatorStyle = getDropIndicatorStyle();

  return (
    <div style={{ position: 'relative' }}>
      {/* Drop indicator line for before */}
      {dropIndicatorStyle && dropPosition === 'before' && (
        <div style={dropIndicatorStyle as React.CSSProperties} />
      )}

      <div
        className="group"
        draggable={!isRenaming}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          height: 32,
          paddingLeft: depth * 16 + 10,
          paddingRight: 10,
          marginLeft: 4,
          marginRight: 4,
          borderRadius: 6,
          background: isDragging
            ? 'rgba(168, 50, 72, 0.1)'
            : isDropTarget && dropPosition === 'inside'
            ? 'rgba(168, 50, 72, 0.15)'
            : isSelected
            ? colors.accentLight
            : isHovered
            ? colors.hoverBg
            : 'transparent',
          borderLeft: isSelected ? `2px solid ${colors.accent}` : '2px solid transparent',
          border: isDropTarget && dropPosition === 'inside' ? `2px dashed ${colors.accent}` : undefined,
          cursor: isDragging ? 'grabbing' : 'grab',
          opacity: isDragging ? 0.5 : 1,
          transition: 'background 0.1s, opacity 0.15s',
          outline: 'none',
        }}
        onClick={(e) => selectElement(element.id, e.shiftKey || e.metaKey || e.ctrlKey)}
        onMouseEnter={() => setHoveredElement(element.id)}
        onMouseLeave={() => setHoveredElement(null)}
        onDoubleClick={() => setIsRenaming(true)}
      >
        {/* Expand/collapse arrow */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            style={{
              width: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.textMuted,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s',
              }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ) : (
          <div style={{ width: 16, flexShrink: 0 }} />
        )}

        {/* Type icon */}
        <span style={{ color: isSelected ? colors.accent : colors.textMuted, flexShrink: 0, display: 'flex' }}>
          {TYPE_ICONS[element.type]}
        </span>

        {/* Name */}
        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={() => {
              if (newName.trim()) renameElement(element.id, newName.trim());
              setIsRenaming(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (newName.trim()) renameElement(element.id, newName.trim());
                setIsRenaming(false);
              }
              if (e.key === 'Escape') {
                setNewName(element.name);
                setIsRenaming(false);
              }
            }}
            style={{
              flex: 1,
              minWidth: 0,
              background: colors.inputBg,
              border: `1px solid ${colors.accent}`,
              borderRadius: 4,
              padding: '2px 8px',
              color: colors.textPrimary,
              fontSize: 13,
              outline: 'none',
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 13,
              fontWeight: isSelected ? 500 : 400,
              color: isSelected ? colors.textPrimary : colors.textSecondary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {element.name}
          </span>
        )}

        {/* Visibility toggle - always visible but subtle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleVisibility(element.id);
          }}
          style={{
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            border: 'none',
            background: 'transparent',
            color: element.visible ? colors.textMuted : colors.accent,
            cursor: 'pointer',
            opacity: element.visible ? 0.6 : 1,
            flexShrink: 0,
          }}
        >
          {element.visible ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-4.47" />
              <path d="M1 1l22 22" />
            </svg>
          )}
        </button>
      </div>

      {/* Drop indicator line for after */}
      {dropIndicatorStyle && dropPosition === 'after' && (
        <div style={dropIndicatorStyle as React.CSSProperties} />
      )}

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {element.children.map((childId) => {
            const child = elements[childId];
            if (!child) return null;
            return <LayerItem key={childId} element={child} depth={depth + 1} />;
          })}
        </div>
      )}
    </div>
  );
}

// Layer list wrapper with drag context
function LayerList({ rootElement }: { rootElement: CanvasElement }) {
  const elements = useCanvasStore((state) => state.elements);
  const [dragState, setDragState] = useState<DragState>({
    draggingId: null,
    dropTargetId: null,
    dropPosition: null,
  });

  return (
    <LayerDragContext.Provider value={{ dragState, setDragState }}>
      <div>
        {rootElement.children.map((childId) => {
          const child = elements[childId];
          if (!child) return null;
          return <LayerItem key={childId} element={child} depth={0} />;
        })}
      </div>
    </LayerDragContext.Provider>
  );
}

export function CanvasSidebar() {
  const [activeTab, setActiveTab] = useState<'chat' | 'pages' | 'layers'>('pages');
  const {
    pages,
    elements,
    currentPageId,
    selectedElementIds,
    addPage,
    setCurrentPage,
    deletePage,
    duplicatePage,
    renamePage,
    updatePageNotes,
    wrapInFrame,
    ungroupElements,
    deleteElement,
    projectName,
    setProjectName,
    canvasSettings,
  } = useCanvasStore();

  // Theme
  const theme = canvasSettings?.editorTheme || 'dark';
  const colors = THEME_COLORS[theme];

  const currentPage = pages[currentPageId];
  const rootElement = currentPage ? elements[currentPage.rootElementId] : null;
  const hasSelection = selectedElementIds.length > 0;
  const hasMultiSelection = selectedElementIds.length > 1;

  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [newPageName, setNewPageName] = useState('');

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
      }}
    >
      {/* Header with tabs - Chat, Pages, Layers */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${colors.borderColor}`,
        }}
      >
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            flex: 1,
            padding: '12px 8px',
            fontSize: 12,
            fontWeight: 500,
            color: activeTab === 'chat' ? colors.textPrimary : colors.textMuted,
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'chat' ? `2px solid ${colors.accent}` : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Chat
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          style={{
            flex: 1,
            padding: '12px 8px',
            fontSize: 12,
            fontWeight: 500,
            color: activeTab === 'pages' ? colors.textPrimary : colors.textMuted,
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'pages' ? `2px solid ${colors.accent}` : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
          Pages
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          style={{
            flex: 1,
            padding: '12px 8px',
            fontSize: 12,
            fontWeight: 500,
            color: activeTab === 'layers' ? colors.textPrimary : colors.textMuted,
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'layers' ? `2px solid ${colors.accent}` : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          Layers
        </button>
      </div>

      {/* Search - only show for pages/layers */}
      {activeTab !== 'chat' && (
        <div style={{ padding: '8px 12px' }}>
          <div style={{ position: 'relative' }}>
            <svg
              style={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.textDimmed,
                pointerEvents: 'none',
              }}
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              style={{
                width: '100%',
                padding: '6px 8px 6px 28px',
                background: colors.inputBg,
                border: 'none',
                borderRadius: 6,
                fontSize: 12,
                color: colors.textSecondary,
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'chat' ? (
          /* Chat Tab - Full AIChatPanel */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <AIChatPanel projectName={projectName} />
          </div>
        ) : activeTab === 'pages' ? (
          /* Pages Tab */
          <div style={{ padding: '0 12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 4px',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: colors.textDimmed,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Pages
              </span>
              <button
                onClick={() => addPage()}
                style={{
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  border: 'none',
                  background: 'transparent',
                  color: colors.textDimmed,
                  cursor: 'pointer',
                }}
                title="Add page"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>

            {/* Page list - Figma Sites style with URL paths */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {Object.values(pages).map((page, index) => {
                // Generate URL path from page name
                const urlPath = index === 0
                  ? '/'
                  : '/' + page.name.toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9-]/g, '');

                return (
                  <div
                    key={page.id}
                    className="group"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      background: page.id === currentPageId ? colors.accentLight : 'transparent',
                      border: page.id === currentPageId
                        ? `1px solid ${colors.accentMedium}`
                        : `1px solid transparent`,
                    }}
                    onClick={() => setCurrentPage(page.id)}
                    onDoubleClick={() => {
                      setEditingPageId(page.id);
                      setNewPageName(page.name);
                    }}
                  >
                    {/* Page thumbnail preview - real mini render */}
                    <div
                      style={{
                        flexShrink: 0,
                        position: 'relative',
                        border: `1px solid ${colors.borderColor}`,
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <MiniPagePreview page={page} width={56} height={40} />
                      {/* Active indicator */}
                      {page.id === currentPageId && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 3,
                            right: 3,
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: colors.accent,
                            boxShadow: '0 0 0 1px rgba(0,0,0,0.2)',
                          }}
                        />
                      )}
                    </div>

                    {/* Page info */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Page name */}
                      {editingPageId === page.id ? (
                        <input
                          type="text"
                          value={newPageName}
                          onChange={(e) => setNewPageName(e.target.value)}
                          onBlur={() => {
                            if (newPageName.trim()) renamePage(page.id, newPageName.trim());
                            setEditingPageId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (newPageName.trim()) renamePage(page.id, newPageName.trim());
                              setEditingPageId(null);
                            }
                            if (e.key === 'Escape') setEditingPageId(null);
                          }}
                          style={{
                            width: '100%',
                            background: colors.inputBg,
                            border: `1px solid ${colors.accent}`,
                            borderRadius: 4,
                            padding: '2px 6px',
                            color: colors.textPrimary,
                            fontSize: 13,
                            outline: 'none',
                          }}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: page.id === currentPageId ? colors.textPrimary : colors.textSecondary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {page.name}
                        </span>
                      )}

                      {/* URL path - like Figma Sites */}
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: 'SF Mono, Monaco, Consolas, monospace',
                          color: colors.textDimmed,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {urlPath}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div
                      className="opacity-0 group-hover:opacity-100"
                      style={{
                        display: 'flex',
                        gap: 2,
                        transition: 'opacity 0.15s',
                      }}
                    >
                      {/* Duplicate button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicatePage(page.id);
                        }}
                        style={{
                          width: 22,
                          height: 22,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 4,
                          border: 'none',
                          background: 'transparent',
                          color: colors.textDimmed,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        title="Duplica pagina"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                      </button>

                      {/* Delete button */}
                      {Object.keys(pages).length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePage(page.id);
                          }}
                          style={{
                            width: 22,
                            height: 22,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 4,
                            border: 'none',
                            background: 'transparent',
                            color: colors.textDimmed,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                          title="Elimina pagina"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          /* Layers Tab */
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Layers toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px',
              borderBottom: `1px solid ${colors.borderColor}`,
              gap: 4,
            }}>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: colors.textDimmed,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {hasSelection ? `${selectedElementIds.length} selected` : 'Layers'}
              </span>
              <div style={{ display: 'flex', gap: 2 }}>
                {/* Wrap in Frame button */}
                <button
                  onClick={() => wrapInFrame()}
                  disabled={!hasSelection}
                  title="Wrap in Frame (⌘⌥G)"
                  style={{
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4,
                    border: 'none',
                    background: hasSelection ? colors.accentMedium : 'transparent',
                    color: hasSelection ? colors.accent : colors.textDimmed,
                    cursor: hasSelection ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <rect x="7" y="7" width="10" height="10" rx="1" />
                  </svg>
                </button>
                {/* Ungroup button */}
                <button
                  onClick={() => ungroupElements()}
                  disabled={selectedElementIds.length !== 1}
                  title="Ungroup (⇧⌘G)"
                  style={{
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4,
                    border: 'none',
                    background: 'transparent',
                    color: selectedElementIds.length === 1 ? colors.textMuted : colors.textDimmed,
                    cursor: selectedElementIds.length === 1 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="8" height="8" rx="1" />
                    <rect x="13" y="13" width="8" height="8" rx="1" />
                  </svg>
                </button>
                {/* Delete button */}
                <button
                  onClick={() => {
                    selectedElementIds.forEach(id => deleteElement(id));
                  }}
                  disabled={!hasSelection}
                  title="Delete"
                  style={{
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 4,
                    border: 'none',
                    background: 'transparent',
                    color: hasSelection ? colors.textMuted : colors.textDimmed,
                    cursor: hasSelection ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Layers list with drag & drop */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
            {rootElement && rootElement.children.length > 0 ? (
              <LayerList rootElement={rootElement} />
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    margin: '0 auto 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 10,
                    background: colors.hoverBg,
                    border: `1px solid ${colors.borderColor}`,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textDimmed} strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                  </svg>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: colors.textMuted, marginBottom: 6 }}>
                  No layers yet
                </div>
                <div style={{ fontSize: 12, color: colors.textDimmed }}>
                  Press{' '}
                  <kbd style={{ padding: '2px 6px', background: colors.hoverBg, borderRadius: 4, fontSize: 11, color: colors.textSecondary }}>F</kbd>{' '}
                  or{' '}
                  <kbd style={{ padding: '2px 6px', background: colors.hoverBg, borderRadius: 4, fontSize: 11, color: colors.textSecondary }}>T</kbd>{' '}
                  to add
                </div>
              </div>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
