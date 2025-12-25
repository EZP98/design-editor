/**
 * Selection Overlay
 *
 * Shows selection box and resize handles for selected elements.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { CanvasElement, Position, Size } from '../../lib/canvas/types';
import { useCanvasStore } from '../../lib/canvas/canvasStore';

// AI Edit API endpoint
const AI_EDIT_API = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-image`
  : 'https://tyskftlhwdstsjvddfld.supabase.co/functions/v1/ai-image';

interface SelectionOverlayProps {
  element: CanvasElement;
  zoom: number;
  /** Offset to add for display positioning (for nested elements) */
  displayOffset?: { x: number; y: number };
}

type ResizeHandle =
  | 'nw'
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w';

const HANDLE_SIZE = 8;

export function SelectionOverlay({ element, zoom, displayOffset = { x: 0, y: 0 } }: SelectionOverlayProps) {
  // Don't show floating toolbar for page elements (they have their own header)
  const isPage = element.type === 'page';
  const isImage = element.type === 'image';
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    mouseX: number;
    mouseY: number;
    position: Position;
    size: Size;
  } | null>(null);

  // AI Edit state
  const [aiProcessing, setAiProcessing] = useState<string | null>(null); // 'remove-bg' | 'upscale' | 'inpaint' | null

  // Crop mode state
  const [cropMode, setCropMode] = useState(false);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const resizeElement = useCanvasStore((state) => state.resizeElement);
  const moveElement = useCanvasStore((state) => state.moveElement);
  const saveToHistory = useCanvasStore((state) => state.saveToHistory);

  // AI: Remove Background
  const handleRemoveBackground = useCallback(async () => {
    if (!element.src || aiProcessing) return;
    setAiProcessing('remove-bg');

    try {
      const res = await fetch(AI_EDIT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'remove-bg',
          imageUrl: element.src,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Errore');

      // Update element with new image
      useCanvasStore.setState((state) => ({
        elements: {
          ...state.elements,
          [element.id]: {
            ...state.elements[element.id],
            src: data.imageUrl,
          },
        },
      }));
      saveToHistory('Remove background');
    } catch (err) {
      console.error('Remove BG error:', err);
      alert('Errore rimozione sfondo: ' + (err instanceof Error ? err.message : 'Errore'));
    } finally {
      setAiProcessing(null);
    }
  }, [element.id, element.src, aiProcessing, saveToHistory]);

  // Handle apply crop
  const handleApplyCrop = useCallback(() => {
    if (!cropBox) return;

    // Convert pixel values to percentages
    const cropX = (cropBox.x / element.size.width) * 100;
    const cropY = (cropBox.y / element.size.height) * 100;
    const cropWidth = (cropBox.width / element.size.width) * 100;
    const cropHeight = (cropBox.height / element.size.height) * 100;

    // Update element with crop data
    useCanvasStore.setState((state) => ({
      elements: {
        ...state.elements,
        [element.id]: {
          ...state.elements[element.id],
          crop: {
            x: cropX,
            y: cropY,
            width: cropWidth,
            height: cropHeight,
          },
          originalWidth: element.originalWidth || element.size.width,
          originalHeight: element.originalHeight || element.size.height,
        },
      },
    }));
    saveToHistory('Crop image');
    setCropMode(false);
    setCropBox(null);
  }, [cropBox, element.id, element.size, element.originalWidth, element.originalHeight, saveToHistory]);

  // Handle reset crop
  const handleResetCrop = useCallback(() => {
    useCanvasStore.setState((state) => ({
      elements: {
        ...state.elements,
        [element.id]: {
          ...state.elements[element.id],
          crop: undefined,
        },
      },
    }));
    saveToHistory('Reset crop');
    setCropMode(false);
    setCropBox(null);
  }, [element.id, saveToHistory]);

  // AI: Inpaint (Photoshop-style edit)
  const handleInpaint = useCallback(async () => {
    if (!element.src || aiProcessing) return;

    const prompt = window.prompt('Descrivi cosa vuoi modificare nell\'immagine (es: "rimuovi la persona", "cambia lo sfondo in un tramonto")');
    if (!prompt) return;

    setAiProcessing('inpaint');

    try {
      const res = await fetch(AI_EDIT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'inpaint',
          imageUrl: element.src,
          prompt: prompt,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Errore');

      // Update element with edited image
      useCanvasStore.setState((state) => ({
        elements: {
          ...state.elements,
          [element.id]: {
            ...state.elements[element.id],
            src: data.imageUrl,
          },
        },
      }));
      saveToHistory('AI edit image');
    } catch (err) {
      console.error('Inpaint error:', err);
      alert('Errore AI edit: ' + (err instanceof Error ? err.message : 'Errore'));
    } finally {
      setAiProcessing(null);
    }
  }, [element.id, element.src, aiProcessing, saveToHistory]);

  // AI: Upscale
  const handleUpscale = useCallback(async () => {
    if (!element.src || aiProcessing) return;
    setAiProcessing('upscale');

    try {
      const res = await fetch(AI_EDIT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'upscale',
          imageUrl: element.src,
          scale: 2,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Errore');

      // Update element with upscaled image and double size
      useCanvasStore.setState((state) => ({
        elements: {
          ...state.elements,
          [element.id]: {
            ...state.elements[element.id],
            src: data.imageUrl,
            size: {
              width: element.size.width * 2,
              height: element.size.height * 2,
            },
          },
        },
      }));
      saveToHistory('Upscale image');
    } catch (err) {
      console.error('Upscale error:', err);
      alert('Errore upscale: ' + (err instanceof Error ? err.message : 'Errore'));
    } finally {
      setAiProcessing(null);
    }
  }, [element.id, element.src, element.size, aiProcessing, saveToHistory]);

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, handle: ResizeHandle) => {
      e.stopPropagation();
      e.preventDefault();

      setActiveHandle(handle);
      setResizeStart({
        mouseX: e.clientX,
        mouseY: e.clientY,
        position: { ...element.position },
        size: { ...element.size },
      });
    },
    [element.position, element.size]
  );

  // Handle resize move
  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!activeHandle || !resizeStart) return;

      const dx = (e.clientX - resizeStart.mouseX) / zoom;
      const dy = (e.clientY - resizeStart.mouseY) / zoom;

      let newX = resizeStart.position.x;
      let newY = resizeStart.position.y;
      let newWidth = resizeStart.size.width;
      let newHeight = resizeStart.size.height;

      // Handle resize based on which handle is being dragged
      switch (activeHandle) {
        case 'nw':
          newX = resizeStart.position.x + dx;
          newY = resizeStart.position.y + dy;
          newWidth = resizeStart.size.width - dx;
          newHeight = resizeStart.size.height - dy;
          break;
        case 'n':
          newY = resizeStart.position.y + dy;
          newHeight = resizeStart.size.height - dy;
          break;
        case 'ne':
          newY = resizeStart.position.y + dy;
          newWidth = resizeStart.size.width + dx;
          newHeight = resizeStart.size.height - dy;
          break;
        case 'e':
          newWidth = resizeStart.size.width + dx;
          break;
        case 'se':
          newWidth = resizeStart.size.width + dx;
          newHeight = resizeStart.size.height + dy;
          break;
        case 's':
          newHeight = resizeStart.size.height + dy;
          break;
        case 'sw':
          newX = resizeStart.position.x + dx;
          newWidth = resizeStart.size.width - dx;
          newHeight = resizeStart.size.height + dy;
          break;
        case 'w':
          newX = resizeStart.position.x + dx;
          newWidth = resizeStart.size.width - dx;
          break;
      }

      // Ensure minimum size
      if (newWidth < 20) {
        if (activeHandle.includes('w')) {
          newX = resizeStart.position.x + resizeStart.size.width - 20;
        }
        newWidth = 20;
      }
      if (newHeight < 20) {
        if (activeHandle.includes('n')) {
          newY = resizeStart.position.y + resizeStart.size.height - 20;
        }
        newHeight = 20;
      }

      moveElement(element.id, { x: newX, y: newY });
      resizeElement(element.id, { width: newWidth, height: newHeight });
    },
    [activeHandle, resizeStart, zoom, element.id, moveElement, resizeElement]
  );

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    if (activeHandle) {
      saveToHistory('Resize element');
    }
    setActiveHandle(null);
    setResizeStart(null);
  }, [activeHandle, saveToHistory]);

  // Add/remove global listeners
  useEffect(() => {
    if (activeHandle) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [activeHandle, handleResizeMove, handleResizeEnd]);

  // Cursor for each handle
  const getCursor = (handle: ResizeHandle): string => {
    switch (handle) {
      case 'nw':
      case 'se':
        return 'nwse-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
    }
  };

  // Render handle
  const renderHandle = (handle: ResizeHandle, style: React.CSSProperties) => (
    <div
      key={handle}
      style={{
        position: 'absolute',
        width: HANDLE_SIZE,
        height: HANDLE_SIZE,
        backgroundColor: '#ffffff',
        border: '1px solid #8B1E2B',
        borderRadius: 2,
        cursor: getCursor(handle),
        zIndex: 10,
        ...style,
      }}
      onMouseDown={(e) => handleResizeStart(e, handle)}
    />
  );

  const halfHandle = HANDLE_SIZE / 2;

  // Display position includes offset for nested elements
  const displayX = element.position.x + displayOffset.x;
  const displayY = element.position.y + displayOffset.y;

  // Parse spacing values
  const paddingTop = parseFloat(element.styles.paddingTop?.toString() || element.styles.padding?.toString() || '0') || 0;
  const paddingRight = parseFloat(element.styles.paddingRight?.toString() || element.styles.padding?.toString() || '0') || 0;
  const paddingBottom = parseFloat(element.styles.paddingBottom?.toString() || element.styles.padding?.toString() || '0') || 0;
  const paddingLeft = parseFloat(element.styles.paddingLeft?.toString() || element.styles.padding?.toString() || '0') || 0;
  const hasPadding = paddingTop > 0 || paddingRight > 0 || paddingBottom > 0 || paddingLeft > 0;

  const marginTop = parseFloat(element.styles.marginTop?.toString() || element.styles.margin?.toString() || '0') || 0;
  const marginRight = parseFloat(element.styles.marginRight?.toString() || element.styles.margin?.toString() || '0') || 0;
  const marginBottom = parseFloat(element.styles.marginBottom?.toString() || element.styles.margin?.toString() || '0') || 0;
  const marginLeft = parseFloat(element.styles.marginLeft?.toString() || element.styles.margin?.toString() || '0') || 0;
  const hasMargin = marginTop > 0 || marginRight > 0 || marginBottom > 0 || marginLeft > 0;

  const gap = parseFloat(element.styles.gap?.toString() || '0') || 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: displayX,
        top: displayY,
        width: element.size.width,
        height: element.size.height,
        pointerEvents: 'none',
        overflow: 'visible',
        // Selection outline - using outline instead of border so it's never clipped
        outline: '2px solid #8B1E2B',
        outlineOffset: -1,
      }}
    >
      {/* Margin guides - outside the element (pink/magenta) */}
      {hasMargin && (
        <>
          {/* Top margin */}
          {marginTop > 0 && (
            <div
              style={{
                position: 'absolute',
                top: -marginTop,
                left: 0,
                right: 0,
                height: marginTop,
                background: 'rgba(236, 72, 153, 0.25)',
                borderTop: '1px dashed rgba(236, 72, 153, 0.6)',
              }}
            >
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 9,
                fontWeight: 600,
                color: 'rgba(236, 72, 153, 0.9)',
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '1px 4px',
                borderRadius: 2,
              }}>
                {marginTop}
              </span>
            </div>
          )}
          {/* Bottom margin */}
          {marginBottom > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: -marginBottom,
                left: 0,
                right: 0,
                height: marginBottom,
                background: 'rgba(236, 72, 153, 0.25)',
                borderBottom: '1px dashed rgba(236, 72, 153, 0.6)',
              }}
            >
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 9,
                fontWeight: 600,
                color: 'rgba(236, 72, 153, 0.9)',
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '1px 4px',
                borderRadius: 2,
              }}>
                {marginBottom}
              </span>
            </div>
          )}
          {/* Left margin */}
          {marginLeft > 0 && (
            <div
              style={{
                position: 'absolute',
                left: -marginLeft,
                top: 0,
                bottom: 0,
                width: marginLeft,
                background: 'rgba(236, 72, 153, 0.25)',
                borderLeft: '1px dashed rgba(236, 72, 153, 0.6)',
              }}
            >
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-90deg)',
                fontSize: 9,
                fontWeight: 600,
                color: 'rgba(236, 72, 153, 0.9)',
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '1px 4px',
                borderRadius: 2,
                whiteSpace: 'nowrap',
              }}>
                {marginLeft}
              </span>
            </div>
          )}
          {/* Right margin */}
          {marginRight > 0 && (
            <div
              style={{
                position: 'absolute',
                right: -marginRight,
                top: 0,
                bottom: 0,
                width: marginRight,
                background: 'rgba(236, 72, 153, 0.25)',
                borderRight: '1px dashed rgba(236, 72, 153, 0.6)',
              }}
            >
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(90deg)',
                fontSize: 9,
                fontWeight: 600,
                color: 'rgba(236, 72, 153, 0.9)',
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '1px 4px',
                borderRadius: 2,
                whiteSpace: 'nowrap',
              }}>
                {marginRight}
              </span>
            </div>
          )}
        </>
      )}

      {/* Padding guides - inside the element (cyan/blue) */}
      {hasPadding && (
        <>
          {/* Top padding */}
          {paddingTop > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: paddingLeft,
                right: paddingRight,
                height: paddingTop,
                background: 'rgba(34, 211, 238, 0.2)',
                borderBottom: '1px dashed rgba(34, 211, 238, 0.5)',
              }}
            >
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 9,
                fontWeight: 600,
                color: 'rgba(34, 211, 238, 0.9)',
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '1px 4px',
                borderRadius: 2,
              }}>
                {paddingTop}
              </span>
            </div>
          )}
          {/* Bottom padding */}
          {paddingBottom > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: paddingLeft,
                right: paddingRight,
                height: paddingBottom,
                background: 'rgba(34, 211, 238, 0.2)',
                borderTop: '1px dashed rgba(34, 211, 238, 0.5)',
              }}
            >
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 9,
                fontWeight: 600,
                color: 'rgba(34, 211, 238, 0.9)',
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '1px 4px',
                borderRadius: 2,
              }}>
                {paddingBottom}
              </span>
            </div>
          )}
          {/* Left padding */}
          {paddingLeft > 0 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: paddingTop,
                bottom: paddingBottom,
                width: paddingLeft,
                background: 'rgba(34, 211, 238, 0.2)',
                borderRight: '1px dashed rgba(34, 211, 238, 0.5)',
              }}
            >
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-90deg)',
                fontSize: 9,
                fontWeight: 600,
                color: 'rgba(34, 211, 238, 0.9)',
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '1px 4px',
                borderRadius: 2,
                whiteSpace: 'nowrap',
              }}>
                {paddingLeft}
              </span>
            </div>
          )}
          {/* Right padding */}
          {paddingRight > 0 && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: paddingTop,
                bottom: paddingBottom,
                width: paddingRight,
                background: 'rgba(34, 211, 238, 0.2)',
                borderLeft: '1px dashed rgba(34, 211, 238, 0.5)',
              }}
            >
              <span style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(90deg)',
                fontSize: 9,
                fontWeight: 600,
                color: 'rgba(34, 211, 238, 0.9)',
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '1px 4px',
                borderRadius: 2,
                whiteSpace: 'nowrap',
              }}>
                {paddingRight}
              </span>
            </div>
          )}
        </>
      )}

      {/* Gap indicator (for flex/grid containers) - hidden for pages */}
      {!isPage && gap > 0 && (element.styles.display === 'flex' || element.styles.display === 'grid') && (
        <div
          style={{
            position: 'absolute',
            top: -28,
            right: 0,
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: 4,
            padding: '2px 6px',
            fontSize: 9,
            fontWeight: 600,
            color: 'rgba(168, 85, 247, 0.9)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v18M16 3v18" />
          </svg>
          gap: {gap}
        </div>
      )}

      {/* Selection border is now handled by outline on the container */}

      {/* Resize handles */}
      {!element.locked && (
        <>
          {/* Corner handles */}
          {renderHandle('nw', {
            left: -halfHandle,
            top: -halfHandle,
            pointerEvents: 'auto',
          })}
          {renderHandle('ne', {
            right: -halfHandle,
            top: -halfHandle,
            pointerEvents: 'auto',
          })}
          {renderHandle('se', {
            right: -halfHandle,
            bottom: -halfHandle,
            pointerEvents: 'auto',
          })}
          {renderHandle('sw', {
            left: -halfHandle,
            bottom: -halfHandle,
            pointerEvents: 'auto',
          })}

          {/* Edge handles */}
          {renderHandle('n', {
            left: '50%',
            transform: 'translateX(-50%)',
            top: -halfHandle,
            pointerEvents: 'auto',
          })}
          {renderHandle('e', {
            right: -halfHandle,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'auto',
          })}
          {renderHandle('s', {
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: -halfHandle,
            pointerEvents: 'auto',
          })}
          {renderHandle('w', {
            left: -halfHandle,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'auto',
          })}
        </>
      )}

      {/* Floating Quick Actions Toolbar - hidden for pages (they have their own header) */}
      {!isPage && (
      <div
        style={{
          position: 'absolute',
          top: -40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: 4,
          background: 'rgba(20, 20, 20, 0.98)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 10,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          pointerEvents: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Element name */}
        <div
          style={{
            padding: '4px 8px',
            fontSize: 11,
            fontWeight: 600,
            color: '#a1a1aa',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            marginRight: 2,
          }}
        >
          {element.name}
        </div>

        {/* Duplicate */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            useCanvasStore.getState().duplicateElement(element.id);
          }}
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: 6,
            color: '#71717a',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#71717a';
          }}
          title="Duplicate (⌘D)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        </button>

        {/* Lock/Unlock */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            useCanvasStore.getState().toggleLock(element.id);
          }}
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: element.locked ? 'rgba(139, 30, 43, 0.2)' : 'transparent',
            border: 'none',
            borderRadius: 6,
            color: element.locked ? '#A83248' : '#71717a',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            if (!element.locked) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#fff';
            }
          }}
          onMouseLeave={(e) => {
            if (!element.locked) {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#71717a';
            }
          }}
          title={element.locked ? 'Unlock (⌘L)' : 'Lock (⌘L)'}
        >
          {element.locked ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 019.9-1" />
            </svg>
          )}
        </button>

        {/* Hide/Show */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            useCanvasStore.getState().toggleVisibility(element.id);
          }}
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: 6,
            color: '#71717a',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#71717a';
          }}
          title="Hide (⌘H)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.08)', margin: '0 4px' }} />

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            useCanvasStore.getState().deleteElement(element.id);
          }}
          style={{
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: 6,
            color: '#71717a',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#71717a';
          }}
          title="Delete (⌫)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          </svg>
        </button>

        {/* AI Edit Tools - Only for images */}
        {isImage && element.src && (
          <>
            {/* Divider */}
            <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.08)', margin: '0 4px' }} />

            {/* AI Label */}
            <div
              style={{
                padding: '2px 6px',
                fontSize: 9,
                fontWeight: 700,
                color: '#a855f7',
                background: 'rgba(168, 85, 247, 0.15)',
                borderRadius: 4,
                marginRight: 4,
              }}
            >
              AI
            </div>

            {/* Remove Background */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveBackground();
              }}
              disabled={aiProcessing !== null}
              style={{
                height: 28,
                padding: '0 8px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: aiProcessing === 'remove-bg' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                border: 'none',
                borderRadius: 6,
                color: aiProcessing === 'remove-bg' ? '#a855f7' : '#71717a',
                cursor: aiProcessing ? 'wait' : 'pointer',
                transition: 'all 0.15s',
                fontSize: 11,
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                if (!aiProcessing) {
                  e.currentTarget.style.background = 'rgba(168, 85, 247, 0.15)';
                  e.currentTarget.style.color = '#a855f7';
                }
              }}
              onMouseLeave={(e) => {
                if (aiProcessing !== 'remove-bg') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#71717a';
                }
              }}
              title="Rimuovi sfondo"
            >
              {aiProcessing === 'remove-bg' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h8" />
                  <path d="M12 2a10 10 0 0 0 0 20" fill="currentColor" opacity="0.3" />
                </svg>
              )}
              {aiProcessing === 'remove-bg' ? '...' : 'Sfondo'}
            </button>

            {/* Upscale */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpscale();
              }}
              disabled={aiProcessing !== null}
              style={{
                height: 28,
                padding: '0 8px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: aiProcessing === 'upscale' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                border: 'none',
                borderRadius: 6,
                color: aiProcessing === 'upscale' ? '#06b6d4' : '#71717a',
                cursor: aiProcessing ? 'wait' : 'pointer',
                transition: 'all 0.15s',
                fontSize: 11,
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                if (!aiProcessing) {
                  e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)';
                  e.currentTarget.style.color = '#06b6d4';
                }
              }}
              onMouseLeave={(e) => {
                if (aiProcessing !== 'upscale') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#71717a';
                }
              }}
              title="Upscale 2x"
            >
              {aiProcessing === 'upscale' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                  <path d="M11 8v6M8 11h6" />
                </svg>
              )}
              {aiProcessing === 'upscale' ? '...' : '2x'}
            </button>

            {/* Crop */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCropMode(!cropMode);
                if (!cropMode) {
                  // Initialize crop box to full image
                  setCropBox({ x: 0, y: 0, width: element.size.width, height: element.size.height });
                } else {
                  setCropBox(null);
                }
              }}
              style={{
                height: 28,
                padding: '0 8px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: cropMode ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                border: 'none',
                borderRadius: 6,
                color: cropMode ? '#22c55e' : '#71717a',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontSize: 11,
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                if (!cropMode) {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.15)';
                  e.currentTarget.style.color = '#22c55e';
                }
              }}
              onMouseLeave={(e) => {
                if (!cropMode) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#71717a';
                }
              }}
              title="Crop immagine"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2v4h12v12h4" />
                <path d="M6 18H2" />
                <path d="M18 6V2" />
                <rect x="6" y="6" width="12" height="12" />
              </svg>
              Crop
            </button>

            {/* Divider */}
            <div style={{ width: 1, height: 20, background: 'rgba(255, 255, 255, 0.08)', margin: '0 4px' }} />

            {/* AI Edit / Photoshop */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleInpaint();
              }}
              disabled={aiProcessing !== null}
              style={{
                height: 28,
                padding: '0 8px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                background: aiProcessing === 'inpaint' ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
                border: 'none',
                borderRadius: 6,
                color: aiProcessing === 'inpaint' ? '#f97316' : '#71717a',
                cursor: aiProcessing ? 'wait' : 'pointer',
                transition: 'all 0.15s',
                fontSize: 11,
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                if (!aiProcessing) {
                  e.currentTarget.style.background = 'rgba(249, 115, 22, 0.15)';
                  e.currentTarget.style.color = '#f97316';
                }
              }}
              onMouseLeave={(e) => {
                if (aiProcessing !== 'inpaint') {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#71717a';
                }
              }}
              title="AI Edit (Photoshop)"
            >
              {aiProcessing === 'inpaint' ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 19l7-7 3 3-7 7-3-3z" />
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  <path d="M2 2l7.586 7.586" />
                  <circle cx="11" cy="11" r="2" />
                </svg>
              )}
              {aiProcessing === 'inpaint' ? '...' : 'Edit'}
            </button>
          </>
        )}
      </div>
      )}

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Crop overlay */}
      {cropMode && cropBox && isImage && (
        <>
          {/* Darkened area outside crop */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
            }}
          >
            {/* Top dark area */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: cropBox.y,
              background: 'rgba(0, 0, 0, 0.6)',
            }} />
            {/* Bottom dark area */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: element.size.height - cropBox.y - cropBox.height,
              background: 'rgba(0, 0, 0, 0.6)',
            }} />
            {/* Left dark area */}
            <div style={{
              position: 'absolute',
              top: cropBox.y,
              left: 0,
              width: cropBox.x,
              height: cropBox.height,
              background: 'rgba(0, 0, 0, 0.6)',
            }} />
            {/* Right dark area */}
            <div style={{
              position: 'absolute',
              top: cropBox.y,
              right: 0,
              width: element.size.width - cropBox.x - cropBox.width,
              height: cropBox.height,
              background: 'rgba(0, 0, 0, 0.6)',
            }} />
          </div>

          {/* Crop box border and handles */}
          <div
            style={{
              position: 'absolute',
              left: cropBox.x,
              top: cropBox.y,
              width: cropBox.width,
              height: cropBox.height,
              border: '2px solid #22c55e',
              boxSizing: 'border-box',
              pointerEvents: 'auto',
              cursor: 'move',
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              const startX = e.clientX;
              const startY = e.clientY;
              const startCropX = cropBox.x;
              const startCropY = cropBox.y;

              const handleMove = (moveE: MouseEvent) => {
                const dx = (moveE.clientX - startX) / zoom;
                const dy = (moveE.clientY - startY) / zoom;
                let newX = startCropX + dx;
                let newY = startCropY + dy;
                // Constrain to element bounds
                newX = Math.max(0, Math.min(newX, element.size.width - cropBox.width));
                newY = Math.max(0, Math.min(newY, element.size.height - cropBox.height));
                setCropBox({ ...cropBox, x: newX, y: newY });
              };

              const handleUp = () => {
                window.removeEventListener('mousemove', handleMove);
                window.removeEventListener('mouseup', handleUp);
              };

              window.addEventListener('mousemove', handleMove);
              window.addEventListener('mouseup', handleUp);
            }}
          >
            {/* Corner handles for resizing crop */}
            {['nw', 'ne', 'sw', 'se'].map((corner) => (
              <div
                key={corner}
                style={{
                  position: 'absolute',
                  width: 10,
                  height: 10,
                  background: '#22c55e',
                  border: '2px solid white',
                  borderRadius: 2,
                  cursor: `${corner}-resize`,
                  ...(corner.includes('n') ? { top: -5 } : { bottom: -5 }),
                  ...(corner.includes('w') ? { left: -5 } : { right: -5 }),
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const startBox = { ...cropBox };

                  const handleMove = (moveE: MouseEvent) => {
                    const dx = (moveE.clientX - startX) / zoom;
                    const dy = (moveE.clientY - startY) / zoom;
                    let newBox = { ...startBox };

                    if (corner.includes('w')) {
                      newBox.x = Math.max(0, Math.min(startBox.x + dx, startBox.x + startBox.width - 20));
                      newBox.width = startBox.width - (newBox.x - startBox.x);
                    }
                    if (corner.includes('e')) {
                      newBox.width = Math.max(20, Math.min(startBox.width + dx, element.size.width - startBox.x));
                    }
                    if (corner.includes('n')) {
                      newBox.y = Math.max(0, Math.min(startBox.y + dy, startBox.y + startBox.height - 20));
                      newBox.height = startBox.height - (newBox.y - startBox.y);
                    }
                    if (corner.includes('s')) {
                      newBox.height = Math.max(20, Math.min(startBox.height + dy, element.size.height - startBox.y));
                    }

                    setCropBox(newBox);
                  };

                  const handleUp = () => {
                    window.removeEventListener('mousemove', handleMove);
                    window.removeEventListener('mouseup', handleUp);
                  };

                  window.addEventListener('mousemove', handleMove);
                  window.addEventListener('mouseup', handleUp);
                }}
              />
            ))}

            {/* Grid lines (rule of thirds) */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.3)' }} />
              <div style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.3)' }} />
              <div style={{ position: 'absolute', top: '33.33%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.3)' }} />
              <div style={{ position: 'absolute', top: '66.66%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.3)' }} />
            </div>
          </div>

          {/* Crop action buttons */}
          <div
            style={{
              position: 'absolute',
              bottom: -40,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 8,
              pointerEvents: 'auto',
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleApplyCrop();
              }}
              style={{
                padding: '6px 12px',
                background: '#22c55e',
                border: 'none',
                borderRadius: 6,
                color: 'white',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Applica Crop
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCropMode(false);
                setCropBox(null);
              }}
              style={{
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Annulla
            </button>
            {element.crop && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetCrop();
                }}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: 'none',
                  borderRadius: 6,
                  color: '#ef4444',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Reset
              </button>
            )}
          </div>
        </>
      )}

      {/* Size indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: -20,
          right: 0,
          backgroundColor: '#1a1a1a',
          color: '#9ca3af',
          fontSize: 10,
          padding: '2px 6px',
          borderRadius: 2,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {Math.round(element.size.width)} x {Math.round(element.size.height)}
      </div>
    </div>
  );
}
