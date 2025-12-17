/**
 * SelectionOverlay - Visual editing overlay for iframe preview
 * Uses postMessage to communicate with the visual edit bridge script
 * injected into the WebContainer preview iframe.
 *
 * This approach enables visual editing even for cross-origin iframes
 * like WebContainer previews.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';

export interface SourceLocation {
  fileName: string;
  lineNumber: number;
  columnNumber?: number;
  source: 'attribute' | 'parent' | 'fiber';
}

export interface SelectedElement {
  tagName: string;
  className: string;
  id: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  styles: Record<string, string>;
  xpath: string;
  textContent?: string | null;
  componentName?: string | null;
  componentStack?: string[];
  componentProps?: Record<string, unknown>;
  sourceLocation?: SourceLocation | null;
  attributes?: Record<string, string>;
}

export interface HoveredElement {
  tagName: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface SelectionOverlayProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
  enabled: boolean;
  zoom: number;
  onElementSelect?: (element: SelectedElement | null) => void;
  onElementHover?: (element: HoveredElement | null) => void;
  onStyleChange?: (xpath: string, property: string, value: string) => void;
  onPositionChange?: (deltaX: number, deltaY: number) => void;
  onSizeChange?: (width: number, height: number) => void;
}

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  iframeRef,
  enabled,
  zoom,
  onElementSelect,
  onElementHover,
  onStyleChange,
}) => {
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [hoveredElement, setHoveredElement] = useState<HoveredElement | null>(null);
  const [bridgeReady, setBridgeReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);
  const retryCountRef = useRef(0);

  // Get iframe position for coordinate conversion
  const getIframeOffset = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return { x: 0, y: 0 };
    const rect = iframe.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }, [iframeRef]);

  // Convert iframe-relative coordinates to screen coordinates
  const convertToScreenCoords = useCallback((rect: SelectedElement['rect']) => {
    const offset = getIframeOffset();
    return {
      x: rect.x * zoom + offset.x,
      y: rect.y * zoom + offset.y,
      width: rect.width * zoom,
      height: rect.height * zoom,
    };
  }, [zoom, getIframeOffset]);

  // Send message to iframe
  const sendToIframe = useCallback((message: object) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    try {
      iframe.contentWindow.postMessage(message, '*');
    } catch (e) {
      console.error('[SelectionOverlay] Failed to send message:', e);
    }
  }, [iframeRef]);

  // Enable/disable edit mode in iframe
  useEffect(() => {
    if (enabled && bridgeReady) {
      sendToIframe({ type: 'visual-edit-enable' });
    } else {
      sendToIframe({ type: 'visual-edit-disable' });
      setSelectedElement(null);
      setHoveredElement(null);
    }
  }, [enabled, bridgeReady, sendToIframe]);

  // Ping bridge to check if ready
  useEffect(() => {
    if (!enabled) return;

    console.log('[SelectionOverlay] Edit mode enabled, starting ping...');
    retryCountRef.current = 0; // Reset on enable

    const pingInterval = setInterval(() => {
      if (!bridgeReady && retryCountRef.current < 60) {
        // Only log every 5th ping to reduce noise
        if (retryCountRef.current % 5 === 0) {
          console.log('[SelectionOverlay] Ping #' + (retryCountRef.current + 1) + '/60');
        }
        sendToIframe({ type: 'visual-edit-ping' });
        retryCountRef.current++;
      } else if (retryCountRef.current >= 60 && !bridgeReady) {
        console.warn('[SelectionOverlay] Bridge not responding after 60 pings (30s)');
        console.warn('[SelectionOverlay] The visual edit bridge may not be loaded in the iframe.');
        console.warn('[SelectionOverlay] Check the browser console for errors in the iframe.');
      }
    }, 500);

    return () => clearInterval(pingInterval);
  }, [enabled, bridgeReady, sendToIframe]);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;

      // DEBUG: Log ALL messages to see what's coming through
      if (data && typeof data === 'object') {
        console.log('[SelectionOverlay] Message received:', data.type || 'unknown', data);
      }

      if (!data || !data.type) return;

      // Log all visual-edit messages for debugging
      if (data.type.startsWith('visual-edit')) {
        console.log('[SelectionOverlay] Received:', data.type, data.element ? `(${data.element.tagName})` : '');
      }

      switch (data.type) {
        case 'visual-edit-ready':
        case 'visual-edit-pong':
          console.log('[SelectionOverlay] Bridge ready!');
          setBridgeReady(true);
          retryCountRef.current = 0;
          if (enabled) {
            sendToIframe({ type: 'visual-edit-enable' });
          }
          break;

        case 'visual-edit-hover':
          if (data.element) {
            const screenRect = convertToScreenCoords(data.element.rect);
            setHoveredElement({
              tagName: data.element.tagName,
              rect: screenRect,
            });
            onElementHover?.({
              tagName: data.element.tagName,
              rect: screenRect,
            });
          } else {
            setHoveredElement(null);
            onElementHover?.(null);
          }
          break;

        case 'visual-edit-select':
          if (data.element) {
            const element: SelectedElement = {
              ...data.element,
              rect: convertToScreenCoords(data.element.rect),
            };
            setSelectedElement(element);
            onElementSelect?.(element);
          } else {
            setSelectedElement(null);
            onElementSelect?.(null);
          }
          break;

        case 'visual-edit-updated':
          if (data.element && selectedElement?.xpath === data.element.xpath) {
            setSelectedElement({
              ...data.element,
              rect: convertToScreenCoords(data.element.rect),
            });
          }
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [enabled, selectedElement, convertToScreenCoords, sendToIframe, onElementSelect, onElementHover]);

  // Reset bridge state when iframe changes
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      console.log('[SelectionOverlay] Iframe loaded, resetting bridge state');
      setBridgeReady(false);
      retryCountRef.current = 0;
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [iframeRef]);

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, handle: ResizeHandle) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setActiveHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  // Handle mouse move during drag/resize
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!selectedElement) return;

      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;

      if (isResizing && activeHandle) {
        let newWidth = selectedElement.rect.width / zoom;
        let newHeight = selectedElement.rect.height / zoom;

        if (activeHandle.includes('e')) {
          newWidth += deltaX;
        }
        if (activeHandle.includes('w')) {
          newWidth -= deltaX;
        }
        if (activeHandle.includes('s')) {
          newHeight += deltaY;
        }
        if (activeHandle.includes('n')) {
          newHeight -= deltaY;
        }

        // Minimum size
        newWidth = Math.max(20, newWidth);
        newHeight = Math.max(20, newHeight);

        // Send style change to iframe
        sendToIframe({
          type: 'visual-edit-apply-style',
          xpath: selectedElement.xpath,
          property: 'width',
          value: `${Math.round(newWidth)}px`,
        });
        sendToIframe({
          type: 'visual-edit-apply-style',
          xpath: selectedElement.xpath,
          property: 'height',
          value: `${Math.round(newHeight)}px`,
        });

        onStyleChange?.(selectedElement.xpath, 'width', `${Math.round(newWidth)}px`);

        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setActiveHandle(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, selectedElement, activeHandle, zoom, sendToIframe, onStyleChange]);

  if (!enabled) return null;

  // Show loading state while waiting for bridge
  if (!bridgeReady) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(139, 92, 246, 0.9)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: 8,
          fontSize: 12,
          zIndex: 50,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        Connessione all'editor visuale...
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const renderResizeHandles = () => {
    if (!selectedElement) return null;

    const handles: { position: ResizeHandle; cursor: string; style: React.CSSProperties }[] = [
      { position: 'n', cursor: 'ns-resize', style: { top: -4, left: '50%', transform: 'translateX(-50%)' } },
      { position: 's', cursor: 'ns-resize', style: { bottom: -4, left: '50%', transform: 'translateX(-50%)' } },
      { position: 'e', cursor: 'ew-resize', style: { right: -4, top: '50%', transform: 'translateY(-50%)' } },
      { position: 'w', cursor: 'ew-resize', style: { left: -4, top: '50%', transform: 'translateY(-50%)' } },
      { position: 'ne', cursor: 'nesw-resize', style: { top: -4, right: -4 } },
      { position: 'nw', cursor: 'nwse-resize', style: { top: -4, left: -4 } },
      { position: 'se', cursor: 'nwse-resize', style: { bottom: -4, right: -4 } },
      { position: 'sw', cursor: 'nesw-resize', style: { bottom: -4, left: -4 } },
    ];

    return handles.map(({ position, cursor, style }) => (
      <div
        key={position}
        onMouseDown={(e) => handleResizeStart(e, position)}
        style={{
          position: 'absolute',
          width: 8,
          height: 8,
          background: '#fff',
          border: '1px solid #8b5cf6',
          borderRadius: 2,
          cursor,
          zIndex: 10,
          ...style,
        }}
      />
    ));
  };

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none', // Let clicks pass through to iframe
        zIndex: 50,
      }}
    >
      {/* Edit mode indicator */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)',
          color: '#fff',
          padding: '6px 14px',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 500,
          zIndex: 50,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 2px 10px rgba(139, 92, 246, 0.3)',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        Edit Mode - Clicca per selezionare
      </div>

      {/* Hover highlight */}
      {hoveredElement && !selectedElement && (
        <div
          style={{
            position: 'fixed',
            left: hoveredElement.rect.x,
            top: hoveredElement.rect.y,
            width: hoveredElement.rect.width,
            height: hoveredElement.rect.height,
            border: '2px solid #60a5fa',
            background: 'rgba(96, 165, 250, 0.1)',
            pointerEvents: 'none',
            transition: 'all 0.1s ease',
          }}
        >
          {/* Tag label */}
          <div
            style={{
              position: 'absolute',
              top: -24,
              left: -2,
              background: '#60a5fa',
              color: '#fff',
              fontSize: 11,
              fontWeight: 500,
              padding: '2px 6px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
            }}
          >
            {hoveredElement.tagName}
          </div>
        </div>
      )}

      {/* Selection box */}
      {selectedElement && (
        <div
          style={{
            position: 'fixed',
            left: selectedElement.rect.x,
            top: selectedElement.rect.y,
            width: selectedElement.rect.width,
            height: selectedElement.rect.height,
            border: '2px solid #8b5cf6',
            background: isDragging ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.05)',
            pointerEvents: 'auto',
            cursor: isDragging ? 'grabbing' : 'grab',
            transition: isDragging || isResizing ? 'none' : 'all 0.1s ease',
          }}
        >
          {/* Element info label */}
          <div
            style={{
              position: 'absolute',
              top: -32,
              left: -2,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 500,
              padding: '4px 10px',
              borderRadius: 6,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 12px rgba(139, 92, 246, 0.4)',
            }}
          >
            {/* Component/Tag name */}
            <span style={{ fontWeight: 600 }}>
              {selectedElement.componentName || selectedElement.tagName}
            </span>
            {selectedElement.className && (
              <span style={{ opacity: 0.7, fontSize: 10 }}>
                .{selectedElement.className.split(' ')[0]}
              </span>
            )}
            {selectedElement.id && (
              <span style={{ opacity: 0.7, fontSize: 10 }}>#{selectedElement.id}</span>
            )}
            {/* Source location badge */}
            {selectedElement.sourceLocation && (
              <span
                style={{
                  marginLeft: 4,
                  padding: '1px 6px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: 4,
                  fontSize: 9,
                  fontFamily: 'monospace',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {selectedElement.sourceLocation.fileName.split('/').pop()}:{selectedElement.sourceLocation.lineNumber}
              </span>
            )}
          </div>

          {/* Component stack (if available) */}
          {selectedElement.componentStack && selectedElement.componentStack.length > 1 && (
            <div
              style={{
                position: 'absolute',
                top: -52,
                left: -2,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: 'rgba(0,0,0,0.7)',
                color: 'rgba(255,255,255,0.7)',
                fontSize: 9,
                padding: '2px 8px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
              }}
            >
              {selectedElement.componentStack.slice(0, 4).map((name, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {i > 0 && <span style={{ opacity: 0.5 }}>›</span>}
                  <span>{name}</span>
                </span>
              ))}
            </div>
          )}

          {/* Dimensions label */}
          <div
            style={{
              position: 'absolute',
              bottom: -24,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.85)',
              color: '#fff',
              fontSize: 10,
              padding: '3px 8px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
              fontFamily: 'monospace',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>{Math.round(selectedElement.rect.width / zoom)} × {Math.round(selectedElement.rect.height / zoom)}</span>
            {selectedElement.textContent && (
              <span style={{ opacity: 0.6, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                "{selectedElement.textContent.substring(0, 20)}{selectedElement.textContent.length > 20 ? '...' : ''}"
              </span>
            )}
          </div>

          {/* Resize handles */}
          {renderResizeHandles()}
        </div>
      )}

      {/* Guides (for alignment) */}
      {(isDragging || isResizing) && selectedElement && (
        <>
          {/* Horizontal center guide */}
          <div
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              top: selectedElement.rect.y + selectedElement.rect.height / 2,
              height: 1,
              background: '#f472b6',
              opacity: 0.5,
              pointerEvents: 'none',
            }}
          />
          {/* Vertical center guide */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              left: selectedElement.rect.x + selectedElement.rect.width / 2,
              width: 1,
              background: '#f472b6',
              opacity: 0.5,
              pointerEvents: 'none',
            }}
          />
        </>
      )}
    </div>
  );
};

export default SelectionOverlay;
