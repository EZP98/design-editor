/**
 * Context Menu Component
 *
 * Right-click menu for canvas elements with design actions.
 */

import React, { useEffect, useRef } from 'react';
import { useCanvasStore } from '../../lib/canvas/canvasStore';

interface ContextMenuProps {
  x: number;
  y: number;
  elementId: string | null;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void;
  divider?: boolean;
  disabled?: boolean;
}

export function ContextMenu({ x, y, elementId, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    copy,
    paste,
    cut,
    duplicateElement,
    deleteElement,
    wrapInFrame,
    groupElements,
    ungroupElements,
    toggleLock,
    toggleVisibility,
    elements,
    selectedElementIds,
  } = useCanvasStore();

  const element = elementId ? elements[elementId] : null;
  const hasSelection = selectedElementIds.length > 0;
  const multipleSelected = selectedElementIds.length > 1;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Position adjustment to keep menu in viewport
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (rect.right > viewportWidth) {
        menuRef.current.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > viewportHeight) {
        menuRef.current.style.top = `${y - rect.height}px`;
      }
    }
  }, [x, y]);

  const menuItems: MenuItem[] = [
    // Edit actions
    {
      label: 'Cut',
      shortcut: '⌘X',
      action: () => { cut(); onClose(); },
      disabled: !hasSelection,
    },
    {
      label: 'Copy',
      shortcut: '⌘C',
      action: () => { copy(); onClose(); },
      disabled: !hasSelection,
    },
    {
      label: 'Paste',
      shortcut: '⌘V',
      action: () => { paste(); onClose(); },
    },
    {
      label: 'Duplicate',
      shortcut: '⌘D',
      action: () => {
        selectedElementIds.forEach(id => duplicateElement(id));
        onClose();
      },
      disabled: !hasSelection,
      divider: true,
    },

    // Frame/Group actions
    {
      label: 'Wrap in Frame',
      shortcut: '⌘⌥G',
      action: () => { wrapInFrame(); onClose(); },
      disabled: !hasSelection,
    },
    {
      label: 'Group',
      shortcut: '⌘G',
      action: () => { groupElements(); onClose(); },
      disabled: !multipleSelected,
    },
    {
      label: 'Ungroup',
      shortcut: '⇧⌘G',
      action: () => { ungroupElements(); onClose(); },
      disabled: !hasSelection || (element?.type !== 'frame' && element?.type !== 'stack'),
      divider: true,
    },

    // Visibility/Lock
    {
      label: element?.locked ? 'Unlock' : 'Lock',
      shortcut: '⌘L',
      action: () => {
        if (element) {
          toggleLock(element.id);
        }
        onClose();
      },
      disabled: !element,
    },
    {
      label: element?.visible === false ? 'Show' : 'Hide',
      shortcut: '⌘H',
      action: () => {
        if (element) {
          toggleVisibility(element.id);
        }
        onClose();
      },
      disabled: !element,
      divider: true,
    },

    // Delete
    {
      label: 'Delete',
      shortcut: '⌫',
      action: () => {
        selectedElementIds.forEach(id => deleteElement(id));
        onClose();
      },
      disabled: !hasSelection,
    },
  ];

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        minWidth: 200,
        background: 'rgba(20, 20, 20, 0.98)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        padding: 6,
        zIndex: 10000,
        overflow: 'hidden',
      }}
    >
      {menuItems.map((item, index) => (
        <React.Fragment key={item.label}>
          <button
            onClick={item.action}
            disabled={item.disabled}
            style={{
              width: '100%',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              background: 'transparent',
              border: 'none',
              borderRadius: 8,
              color: item.disabled ? '#52525b' : '#e4e4e7',
              fontSize: 13,
              fontWeight: 500,
              cursor: item.disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = '#fff';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = item.disabled ? '#52525b' : '#e4e4e7';
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {item.icon}
              {item.label}
            </span>
            {item.shortcut && (
              <span style={{
                fontSize: 11,
                color: '#52525b',
                fontFamily: 'ui-monospace, monospace',
                letterSpacing: '0.02em',
              }}>
                {item.shortcut}
              </span>
            )}
          </button>
          {item.divider && (
            <div style={{
              height: 1,
              background: 'rgba(255, 255, 255, 0.08)',
              margin: '6px 0',
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default ContextMenu;
