/**
 * Canvas Preview Component
 *
 * A read-only preview of the canvas design for preview mode.
 * Renders elements without selection handles or edit functionality.
 */

import React from 'react';
import { useCanvasStore } from '../../lib/canvas/canvasStore';
import { CanvasElement, ElementStyles } from '../../lib/canvas/types';
import { getStylesForBreakpoint } from '../../lib/canvas/responsive';
import { renderLucideIcon } from './IconPicker';

interface CanvasPreviewProps {
  breakpointId?: string;
  width?: number;
}

// Recursive element renderer for preview
// NOTE: No memo, no useMemo for children - always get fresh data
function PreviewElement({
  element,
  breakpointId,
  elements,
}: {
  element: CanvasElement;
  breakpointId: string;
  elements: Record<string, CanvasElement>;
}) {
  // Get effective styles for breakpoint
  const styles = getStylesForBreakpoint(element.styles, element.responsiveStyles, breakpointId);

  // Get children directly - no caching
  const children = element.children
    .map((id) => elements[id])
    .filter(Boolean);

  // Build CSS styles - no useMemo to ensure fresh data
  const cssStyles: React.CSSProperties = (() => {
    const s: React.CSSProperties = {
      position: element.positionType === 'absolute' ? 'absolute' : 'relative',
      width: element.size.width,
      height: styles.resizeY === 'hug' ? 'auto' : element.size.height,
      minHeight: styles.resizeY === 'hug' ? element.size.height : undefined,
    };

    // Position for absolute elements
    if (element.positionType === 'absolute') {
      s.left = element.position.x;
      s.top = element.position.y;
    }

    // Layout
    if (styles.display) s.display = styles.display;
    if (styles.flexDirection) s.flexDirection = styles.flexDirection;
    if (styles.justifyContent) s.justifyContent = styles.justifyContent;
    if (styles.alignItems) s.alignItems = styles.alignItems;
    if (styles.flexWrap) s.flexWrap = styles.flexWrap;
    if (styles.gap !== undefined) s.gap = styles.gap;
    if (styles.gridTemplateColumns) s.gridTemplateColumns = styles.gridTemplateColumns;
    if (styles.gridTemplateRows) s.gridTemplateRows = styles.gridTemplateRows;

    // Spacing
    if (styles.padding !== undefined) s.padding = styles.padding;
    if (styles.paddingTop !== undefined) s.paddingTop = styles.paddingTop;
    if (styles.paddingRight !== undefined) s.paddingRight = styles.paddingRight;
    if (styles.paddingBottom !== undefined) s.paddingBottom = styles.paddingBottom;
    if (styles.paddingLeft !== undefined) s.paddingLeft = styles.paddingLeft;
    if (styles.margin !== undefined) s.margin = styles.margin;

    // Background
    if (styles.backgroundColor) s.backgroundColor = styles.backgroundColor;
    if (styles.backgroundImage) s.backgroundImage = styles.backgroundImage;
    if (styles.background) s.background = styles.background;
    if (styles.backgroundSize) s.backgroundSize = styles.backgroundSize;
    if (styles.backgroundPosition) s.backgroundPosition = styles.backgroundPosition;

    // Border
    if (styles.borderRadius !== undefined) s.borderRadius = `${styles.borderRadius}px`;
    if (styles.borderTopLeftRadius !== undefined) s.borderTopLeftRadius = `${styles.borderTopLeftRadius}px`;
    if (styles.borderTopRightRadius !== undefined) s.borderTopRightRadius = `${styles.borderTopRightRadius}px`;
    if (styles.borderBottomLeftRadius !== undefined) s.borderBottomLeftRadius = `${styles.borderBottomLeftRadius}px`;
    if (styles.borderBottomRightRadius !== undefined) s.borderBottomRightRadius = `${styles.borderBottomRightRadius}px`;
    if (styles.borderWidth !== undefined) s.borderWidth = `${styles.borderWidth}px`;
    if (styles.borderColor) s.borderColor = styles.borderColor;
    if (styles.borderStyle) s.borderStyle = styles.borderStyle || (styles.borderWidth ? 'solid' : undefined);

    // Typography
    if (styles.fontSize !== undefined) s.fontSize = styles.fontSize;
    if (styles.fontWeight) s.fontWeight = styles.fontWeight;
    if (styles.fontFamily) s.fontFamily = styles.fontFamily;
    if (styles.color) s.color = styles.color;
    if (styles.textAlign) s.textAlign = styles.textAlign;
    if (styles.lineHeight !== undefined) s.lineHeight = styles.lineHeight;
    if (styles.letterSpacing !== undefined) s.letterSpacing = `${styles.letterSpacing}px`;
    if (styles.textDecoration) s.textDecoration = styles.textDecoration;
    if (styles.textTransform) s.textTransform = styles.textTransform;
    if (styles.whiteSpace) s.whiteSpace = styles.whiteSpace;

    // Text effects
    if (styles.textShadow) s.textShadow = styles.textShadow;
    if (styles.WebkitTextStroke) (s as any).WebkitTextStroke = styles.WebkitTextStroke;
    if (styles.WebkitTextFillColor) (s as any).WebkitTextFillColor = styles.WebkitTextFillColor;
    if (styles.WebkitBackgroundClip) (s as any).WebkitBackgroundClip = styles.WebkitBackgroundClip;
    if (styles.backgroundClip) s.backgroundClip = styles.backgroundClip;

    // Effects
    if (styles.opacity !== undefined) s.opacity = styles.opacity;
    if (styles.boxShadow) s.boxShadow = styles.boxShadow;
    if (styles.overflow) s.overflow = styles.overflow;
    if (styles.transform) s.transform = styles.transform;

    // Build filter
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
    if (filterParts.length > 0) {
      s.filter = filterParts.join(' ');
    }

    return s;
  })();

  // Render based on type
  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <span
            style={{
              display: 'block',
              width: '100%',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {element.content || ''}
          </span>
        );

      case 'button':
        return (
          <span
            style={{
              display: 'inline-block',
              width: '100%',
              textAlign: 'center',
            }}
          >
            {element.content || 'Button'}
          </span>
        );

      case 'image':
        return (
          <img
            src={element.src || 'https://via.placeholder.com/200x150'}
            alt={element.alt || 'Image'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: styles.objectFit || 'cover',
              objectPosition: styles.objectPosition,
            }}
          />
        );

      case 'video':
        return (
          <video
            src={element.videoSrc}
            autoPlay={element.autoplay}
            loop={element.loop}
            muted={element.muted}
            controls={element.controls}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        );

      case 'icon':
        return renderLucideIcon(element.iconName || 'star', element.iconSize || 24, styles.color);

      case 'input':
        return (
          <input
            type={element.inputType || 'text'}
            placeholder={element.placeholder}
            disabled={element.disabled}
            style={{
              width: '100%',
              height: '100%',
              padding: styles.padding,
              border: `${styles.borderWidth || 1}px ${styles.borderStyle || 'solid'} ${styles.borderColor || '#d1d5db'}`,
              borderRadius: styles.borderRadius !== undefined ? `${styles.borderRadius}px` : undefined,
              fontSize: styles.fontSize,
              background: 'transparent',
              outline: 'none',
            }}
          />
        );

      case 'link':
        return (
          <a
            href={element.href || '#'}
            target={element.target}
            style={{
              display: 'block',
              width: '100%',
              textDecoration: styles.textDecoration || 'underline',
              color: 'inherit',
            }}
          >
            {element.content || 'Link'}
          </a>
        );

      default:
        // Container types - render children
        return children.map((child) => (
          <PreviewElement
            key={child.id}
            element={child}
            breakpointId={breakpointId}
            elements={elements}
          />
        ));
    }
  };

  // Skip invisible elements
  if (!element.visible) return null;

  // All elements get wrapped in a div with their styles
  return (
    <div style={cssStyles}>
      {renderContent()}
    </div>
  );
}

export function CanvasPreview({ breakpointId = 'desktop', width }: CanvasPreviewProps) {
  const pages = useCanvasStore((state) => state.pages);
  const elements = useCanvasStore((state) => state.elements);
  const currentPageId = useCanvasStore((state) => state.currentPageId);

  // Get current page
  const currentPage = pages[currentPageId];
  if (!currentPage) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#6b6b6b' }}>
        Nessuna pagina da visualizzare
      </div>
    );
  }

  // Get root element (page element)
  const rootElement = elements[currentPage.rootElementId];
  if (!rootElement) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#6b6b6b' }}>
        Pagina vuota
      </div>
    );
  }

  // Get page dimensions
  const pageWidth = width || currentPage.width;
  const resizeY = (rootElement.styles as any).resizeY || 'hug';
  const isHeightHug = resizeY === 'hug';

  return (
    <div
      style={{
        width: pageWidth,
        ...(isHeightHug ? { minHeight: currentPage.height } : { height: currentPage.height }),
        background: currentPage.backgroundColor || rootElement.styles.backgroundColor || '#ffffff',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {rootElement.children.map((childId) => {
        const child = elements[childId];
        if (!child) return null;
        return (
          <PreviewElement
            key={child.id}
            element={child}
            breakpointId={breakpointId}
            elements={elements}
          />
        );
      })}
    </div>
  );
}

export default CanvasPreview;
