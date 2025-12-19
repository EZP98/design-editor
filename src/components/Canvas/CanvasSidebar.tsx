/**
 * Canvas Sidebar
 *
 * Bolt-style sidebar with Pages and Layers tabs.
 */

import React, { useState } from 'react';
import { useCanvasStore } from '../../lib/canvas/canvasStore';
import { CanvasElement, ElementType, THEME_COLORS } from '../../lib/canvas/types';

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
};

// Layer Item Component - Compact Figma-style
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
    canvasSettings,
  } = useCanvasStore();

  // Theme
  const theme = canvasSettings?.editorTheme || 'dark';
  const colors = THEME_COLORS[theme];

  const isSelected = selectedElementIds.includes(element.id);
  const isHovered = hoveredElementId === element.id;
  const hasChildren = element.children.length > 0;
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(element.name);

  return (
    <div>
      <div
        className="group"
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
          background: isSelected ? colors.accentLight : isHovered ? colors.hoverBg : 'transparent',
          borderLeft: isSelected ? `2px solid ${colors.accent}` : '2px solid transparent',
          cursor: 'pointer',
          transition: 'background 0.1s',
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

export function CanvasSidebar() {
  const [activeTab, setActiveTab] = useState<'pages' | 'layers'>('pages');
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
  const [editingProjectName, setEditingProjectName] = useState(false);

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
      {/* Project Name */}
      <div style={{
        padding: '12px',
        borderBottom: `1px solid ${colors.borderColor}`,
      }}>
        {editingProjectName ? (
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={() => setEditingProjectName(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Escape') setEditingProjectName(false);
            }}
            style={{
              width: '100%',
              padding: '6px 10px',
              background: colors.inputBg,
              border: `1px solid ${colors.accent}`,
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              color: colors.textPrimary,
              outline: 'none',
            }}
            autoFocus
          />
        ) : (
          <div
            onClick={() => setEditingProjectName(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: '4px 0',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A83248" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>
              {projectName || 'Untitled Project'}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" style={{ marginLeft: 'auto' }}>
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Header with tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${colors.borderColor}`,
        }}
      >
        <button
          onClick={() => setActiveTab('pages')}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 13,
            fontWeight: 500,
            color: activeTab === 'pages' ? colors.textPrimary : colors.textMuted,
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'pages' ? `2px solid ${colors.accent}` : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          Pages
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 13,
            fontWeight: 500,
            color: activeTab === 'layers' ? colors.textPrimary : colors.textMuted,
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'layers' ? `2px solid ${colors.accent}` : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          Layers
        </button>
      </div>

      {/* Search */}
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

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'pages' ? (
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

            {/* Page list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.values(pages).map((page) => (
                <div
                  key={page.id}
                  className="group"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: page.id === currentPageId ? colors.hoverBg : 'transparent',
                    border: page.id === currentPageId ? `1px solid ${colors.borderColor}` : '1px solid transparent',
                  }}
                  onClick={() => setCurrentPage(page.id)}
                  onDoubleClick={() => {
                    setEditingPageId(page.id);
                    setNewPageName(page.name);
                  }}
                >
                  {/* Page icon */}
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 6,
                      background: page.id === currentPageId ? colors.accent : colors.hoverBg,
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={page.id === currentPageId ? '#fff' : colors.textMuted}
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                    </svg>
                  </div>

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
                        flex: 1,
                        background: colors.inputBg,
                        border: `1px solid ${colors.accent}`,
                        borderRadius: 4,
                        padding: '4px 8px',
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

                  {/* Duplicate button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicatePage(page.id);
                    }}
                    className="opacity-0 group-hover:opacity-100"
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
                      transition: 'all 0.15s',
                    }}
                    title="Duplica pagina"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                      className="opacity-0 group-hover:opacity-100"
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
                        transition: 'all 0.15s',
                      }}
                      title="Elimina pagina"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
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

            {/* Layers list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
            {rootElement && rootElement.children.length > 0 ? (
              rootElement.children.map((childId) => {
                const child = elements[childId];
                if (!child) return null;
                return <LayerItem key={childId} element={child} depth={0} />;
              })
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
