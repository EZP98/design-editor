/**
 * Canvas Floating Toolbar
 *
 * Framer-style floating toolbar with semantic blocks.
 */

import React, { useState, useRef, useEffect } from 'react';
import { IconPicker } from './IconPicker';
import { PluginPanel, availablePlugins, Plugin } from './plugins';
import { useCanvasStore } from '../../lib/canvas/canvasStore';

interface CanvasToolbarProps {
  activeTool: 'select' | 'hand' | 'frame' | 'text';
  onToolChange: (tool: 'select' | 'hand' | 'frame' | 'text') => void;
  onAddElement: (type: string) => void;
  onAddBlock?: (blockId: string) => void;
  onAddIcon?: (iconName: string) => void;
  onPluginInsert?: (data: any) => void;
  onGenerateVariations?: () => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  theme?: 'dark' | 'light';
  onThemeToggle?: () => void;
}

// ============================================================================
// Element & Block Definitions
// ============================================================================

const PRIMITIVES = [
  { id: 'frame', label: 'Frame', shortcut: 'F', icon: 'frame' },
  { id: 'text', label: 'Text', shortcut: 'T', icon: 'text' },
  { id: 'button', label: 'Button', shortcut: 'B', icon: 'button' },
  { id: 'image', label: 'Image', shortcut: 'I', icon: 'image' },
  { id: 'link', label: 'Link', icon: 'link' },
  { id: 'input', label: 'Input', icon: 'input' },
];

const LAYOUT = [
  { id: 'section', label: 'Section', icon: 'section', description: 'Full-width container' },
  { id: 'container', label: 'Container', icon: 'container', description: 'Centered max-width' },
  { id: 'stack', label: 'Stack', icon: 'stack', description: 'Vertical flex' },
  { id: 'row', label: 'Row', icon: 'row', description: 'Horizontal flex' },
  { id: 'grid', label: 'Grid', icon: 'grid', description: '2-column grid' },
  { id: 'columns-3', label: '3 Columns', icon: 'columns', description: '3-column layout' },
];

const BLOCKS = [
  { id: 'navbar', label: 'Navbar', icon: 'navbar', description: 'Navigation header' },
  { id: 'hero', label: 'Hero', icon: 'hero', description: 'Hero section with CTA' },
  { id: 'features', label: 'Features', icon: 'features', description: 'Feature cards grid' },
  { id: 'pricing', label: 'Pricing', icon: 'pricing', description: 'Pricing table' },
  { id: 'testimonials', label: 'Testimonials', icon: 'testimonials', description: 'Customer reviews' },
  { id: 'cta', label: 'CTA', icon: 'cta', description: 'Call-to-action banner' },
  { id: 'faq', label: 'FAQ', icon: 'faq', description: 'FAQ accordion' },
  { id: 'footer', label: 'Footer', icon: 'footer', description: 'Page footer' },
  { id: 'contact', label: 'Contact', icon: 'contact', description: 'Contact form' },
];

// ============================================================================
// Canvas Format Presets
// ============================================================================

export interface CanvasFormat {
  id: string;
  label: string;
  width: number;
  height: number;
  category: 'social' | 'print' | 'web' | 'custom';
}

export const CANVAS_FORMATS: CanvasFormat[] = [
  // Social Media
  { id: 'instagram-post', label: 'Instagram Post', width: 1080, height: 1080, category: 'social' },
  { id: 'instagram-story', label: 'Instagram Story', width: 1080, height: 1920, category: 'social' },
  { id: 'facebook-post', label: 'Facebook Post', width: 1200, height: 630, category: 'social' },
  { id: 'twitter-post', label: 'Twitter/X Post', width: 1200, height: 675, category: 'social' },
  { id: 'linkedin-post', label: 'LinkedIn Post', width: 1200, height: 627, category: 'social' },
  { id: 'tiktok', label: 'TikTok Video', width: 1080, height: 1920, category: 'social' },
  { id: 'youtube-thumbnail', label: 'YouTube Thumbnail', width: 1280, height: 720, category: 'social' },

  // Web
  { id: 'desktop', label: 'Desktop (1440)', width: 1440, height: 900, category: 'web' },
  { id: 'laptop', label: 'Laptop (1280)', width: 1280, height: 800, category: 'web' },
  { id: 'tablet', label: 'Tablet', width: 768, height: 1024, category: 'web' },
  { id: 'mobile', label: 'Mobile', width: 375, height: 812, category: 'web' },
  { id: 'landing-page', label: 'Landing Page', width: 1440, height: 2560, category: 'web' },

  // Print
  { id: 'a4', label: 'A4', width: 2480, height: 3508, category: 'print' },
  { id: 'a3', label: 'A3', width: 3508, height: 4961, category: 'print' },
  { id: 'letter', label: 'Letter', width: 2550, height: 3300, category: 'print' },
  { id: 'business-card', label: 'Business Card', width: 1050, height: 600, category: 'print' },
  { id: 'poster-a2', label: 'Poster A2', width: 4961, height: 7016, category: 'print' },
];

// ============================================================================
// Icons
// ============================================================================

const Icons: Record<string, React.ReactNode> = {
  cursor: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 4L10.5 20.5L13 13L20.5 10.5L4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  hand: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 11V6a2 2 0 0 0-4 0"/>
      <path d="M14 10V4a2 2 0 0 0-4 0v2"/>
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8"/>
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
    </svg>
  ),
  frame: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
    </svg>
  ),
  text: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 7V4h16v3"/>
      <path d="M9 20h6"/>
      <path d="M12 4v16"/>
    </svg>
  ),
  button: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="6" width="20" height="12" rx="6"/>
      <path d="M8 12h8"/>
    </svg>
  ),
  image: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="M21 15l-5-5L5 21"/>
    </svg>
  ),
  input: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="6" width="20" height="12" rx="3"/>
      <path d="M6 12h.01"/>
    </svg>
  ),
  link: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  stack: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="4" width="16" height="6" rx="2"/>
      <rect x="4" y="14" width="16" height="6" rx="2"/>
    </svg>
  ),
  row: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="6" width="7" height="12" rx="2"/>
      <rect x="14" y="6" width="7" height="12" rx="2"/>
    </svg>
  ),
  grid: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  columns: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="5" height="16" rx="1"/>
      <rect x="10" y="4" width="5" height="16" rx="1"/>
      <rect x="17" y="4" width="4" height="16" rx="1"/>
    </svg>
  ),
  section: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="6" width="20" height="12" rx="2"/>
    </svg>
  ),
  container: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="4" width="16" height="16" rx="2"/>
      <path d="M4 8h16M4 16h16"/>
    </svg>
  ),
  // Block icons
  navbar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="4" width="20" height="5" rx="1"/>
      <circle cx="5" cy="6.5" r="1"/>
      <path d="M9 6.5h10"/>
    </svg>
  ),
  hero: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="20" height="18" rx="2"/>
      <path d="M6 9h12"/>
      <path d="M8 13h8"/>
      <rect x="9" y="16" width="6" height="2" rx="1"/>
    </svg>
  ),
  features: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="6" height="8" rx="1"/>
      <rect x="9" y="3" width="6" height="8" rx="1"/>
      <rect x="16" y="3" width="6" height="8" rx="1"/>
      <path d="M2 14h20"/>
    </svg>
  ),
  pricing: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="7" height="16" rx="1"/>
      <rect x="14" y="2" width="7" height="18" rx="1"/>
      <path d="M5 8h3M16 6h3"/>
    </svg>
  ),
  testimonials: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/>
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v4z"/>
    </svg>
  ),
  cta: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <path d="M7 12h6"/>
      <rect x="15" y="10" width="4" height="4" rx="1"/>
    </svg>
  ),
  faq: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <path d="M12 17h.01"/>
    </svg>
  ),
  footer: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="15" width="20" height="6" rx="1"/>
      <path d="M6 18h4M14 18h4"/>
    </svg>
  ),
  contact: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="18" height="14" rx="2"/>
      <path d="M7 9h10M7 13h6"/>
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  plugin: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  puzzle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.878-.29c-.493.074-.84.504-1.017.968a2.5 2.5 0 1 1-3.237-3.237c.464-.177.894-.524.967-1.017a1.026 1.026 0 0 0-.289-.878l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704l1.611-1.611a.98.98 0 0 1 .837-.276c.47.07.802.48.968.925a2.501 2.501 0 1 0 3.214-3.214c-.446-.166-.855-.497-.925-.968a.979.979 0 0 1 .276-.837l1.61-1.61a2.404 2.404 0 0 1 1.705-.707c.618 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.878.29.493-.074.84-.504 1.017-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.177-.894.524-.967 1.017Z"/>
    </svg>
  ),
  sun: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2"/>
      <path d="M12 20v2"/>
      <path d="M4.93 4.93l1.41 1.41"/>
      <path d="M17.66 17.66l1.41 1.41"/>
      <path d="M2 12h2"/>
      <path d="M20 12h2"/>
      <path d="M6.34 17.66l-1.41 1.41"/>
      <path d="M19.07 4.93l-1.41 1.41"/>
    </svg>
  ),
  moon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  multiDevice: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Desktop */}
      <rect x="1" y="2" width="10" height="7" rx="1" />
      <line x1="4" y1="11" x2="8" y2="11" />
      <line x1="6" y1="9" x2="6" y2="11" />
      {/* Tablet */}
      <rect x="13" y="2" width="5" height="7" rx="1" />
      <line x1="14.5" y1="7.5" x2="16.5" y2="7.5" />
      {/* Mobile */}
      <rect x="20" y="2" width="3" height="6" rx="0.5" />
      {/* Bottom connector line */}
      <path d="M6 14h12" strokeWidth="1" opacity="0.5" />
    </svg>
  ),
  artboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18"/>
      <path d="M9 21V9"/>
    </svg>
  ),
  wand: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M15 4V2"/>
      <path d="M15 16v-2"/>
      <path d="M8 9h2"/>
      <path d="M20 9h2"/>
      <path d="M17.8 11.8L19 13"/>
      <path d="M15 9h.01"/>
      <path d="M17.8 6.2L19 5"/>
      <path d="M3 21l9-9"/>
      <path d="M12.2 6.2L11 5"/>
    </svg>
  ),
  variations: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="6" height="6" rx="1"/>
      <rect x="9" y="2" width="6" height="6" rx="1"/>
      <rect x="16" y="2" width="6" height="6" rx="1"/>
      <rect x="5.5" y="11" width="6" height="6" rx="1"/>
      <rect x="12.5" y="11" width="6" height="6" rx="1"/>
      <path d="M8.5 20v2M15.5 20v2" strokeLinecap="round"/>
    </svg>
  ),
};

// ============================================================================
// Main Component
// ============================================================================

export function CanvasToolbar({
  activeTool,
  onToolChange,
  onAddElement,
  onAddBlock,
  onAddIcon,
  onPluginInsert,
  onGenerateVariations,
  zoom = 1,
  onZoomChange,
  theme = 'dark',
  onThemeToggle,
}: CanvasToolbarProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showPluginPanel, setShowPluginPanel] = useState(false);
  const [showFormatPicker, setShowFormatPicker] = useState(false);
  const [activePlugin, setActivePlugin] = useState<Plugin | null>(null);

  // Use store for AI panel state and page management
  const activeRightPanel = useCanvasStore((state) => state.activeRightPanel);
  const setActiveRightPanel = useCanvasStore((state) => state.setActiveRightPanel);
  const currentPageId = useCanvasStore((state) => state.currentPageId);
  const pages = useCanvasStore((state) => state.pages);
  const updatePage = useCanvasStore((state) => state.updatePage);

  // Get current page dimensions
  const currentPage = currentPageId ? pages[currentPageId] : null;

  const [activeTab, setActiveTab] = useState<'primitives' | 'layout' | 'blocks'>('primitives');
  const addMenuRef = useRef<HTMLDivElement>(null);
  const iconPickerRef = useRef<HTMLDivElement>(null);
  const formatPickerRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
      if (iconPickerRef.current && !iconPickerRef.current.contains(e.target as Node)) {
        setShowIconPicker(false);
      }
      if (formatPickerRef.current && !formatPickerRef.current.contains(e.target as Node)) {
        setShowFormatPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle format change
  const handleFormatChange = (format: CanvasFormat) => {
    if (currentPageId) {
      updatePage(currentPageId, { width: format.width, height: format.height });
    }
    setShowFormatPicker(false);
  };

  const handleAddItem = (item: typeof PRIMITIVES[0] | typeof LAYOUT[0] | typeof BLOCKS[0]) => {
    // For blocks, use onAddBlock if available, otherwise fallback to onAddElement
    if (activeTab === 'blocks' && onAddBlock) {
      onAddBlock(item.id);
    } else {
      onAddElement(item.id);
    }
    setShowAddMenu(false);
  };

  const currentItems = activeTab === 'primitives' ? PRIMITIVES : activeTab === 'layout' ? LAYOUT : BLOCKS;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        pointerEvents: 'auto',
      }}
    >
      {/* Main Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '8px 10px',
          borderRadius: 16,
          background: theme === 'dark' ? 'rgba(20, 20, 20, 0.98)' : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: theme === 'dark'
            ? `0 0 0 1px rgba(0, 0, 0, 0.5), 0 20px 70px -10px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 0, 0, 0.3)`
            : `0 0 0 1px rgba(0, 0, 0, 0.05), 0 20px 70px -10px rgba(0, 0, 0, 0.15), 0 0 40px rgba(0, 0, 0, 0.1)`,
        }}
      >
        {/* === Tools Section === */}
        <div style={{ display: 'flex', gap: 2 }}>
          <ToolButton
            active={activeTool === 'select'}
            onClick={() => onToolChange('select')}
            tooltip="Select (V)"
            theme={theme}
          >
            {Icons.cursor}
          </ToolButton>
          <ToolButton
            active={activeTool === 'hand'}
            onClick={() => onToolChange('hand')}
            tooltip="Hand (H)"
            theme={theme}
          >
            {Icons.hand}
          </ToolButton>
          <ToolButton
            active={activeRightPanel === 'ai-image'}
            onClick={() => setActiveRightPanel(activeRightPanel === 'ai-image' ? 'properties' : 'ai-image')}
            tooltip="AI Generate"
            accent
            theme={theme}
          >
            {Icons.wand}
          </ToolButton>
          {onGenerateVariations && (
            <ToolButton
              onClick={onGenerateVariations}
              tooltip="AI Variations (genera 3 varianti del design)"
              theme={theme}
            >
              {Icons.variations}
            </ToolButton>
          )}
        </div>

        <Divider />

        {/* === Quick Add (Frame, Text, Button, Image) === */}
        <div style={{ display: 'flex', gap: 2 }}>
          {PRIMITIVES.slice(0, 4).map((el) => (
            <ToolButton
              key={el.id}
              onClick={() => onAddElement(el.id)}
              tooltip={el.shortcut ? `${el.label} (${el.shortcut})` : el.label}
              theme={theme}
            >
              {Icons[el.icon]}
            </ToolButton>
          ))}

          {/* + Button for More Elements & Blocks */}
          <div ref={addMenuRef} style={{ position: 'relative' }}>
            <ToolButton
              active={showAddMenu}
              onClick={() => setShowAddMenu(!showAddMenu)}
              tooltip="Insert element or block"
              accent
              theme={theme}
            >
              {Icons.plus}
            </ToolButton>

            {showAddMenu && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 12px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 280,
                  padding: 8,
                  borderRadius: 16,
                  background: 'rgba(20, 20, 20, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.6)',
                }}
              >
                {/* Tabs */}
                <div
                  style={{
                    display: 'flex',
                    gap: 4,
                    padding: 4,
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: 10,
                    marginBottom: 8,
                  }}
                >
                  {(['primitives', 'layout', 'blocks'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: 'none',
                        background: activeTab === tab ? 'rgba(168, 50, 72, 0.2)' : 'transparent',
                        color: activeTab === tab ? '#fff' : '#888',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {tab === 'primitives' ? 'Primitivi' : tab === 'layout' ? 'Layout' : 'Blocchi'}
                    </button>
                  ))}
                </div>

                {/* Items Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: activeTab === 'blocks' ? '1fr' : 'repeat(2, 1fr)',
                    gap: 4,
                    maxHeight: 320,
                    overflowY: 'auto',
                  }}
                >
                  {currentItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleAddItem(item)}
                      style={{
                        display: 'flex',
                        alignItems: activeTab === 'blocks' ? 'center' : 'flex-start',
                        flexDirection: activeTab === 'blocks' ? 'row' : 'column',
                        gap: activeTab === 'blocks' ? 12 : 6,
                        padding: activeTab === 'blocks' ? '10px 12px' : '12px 10px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.02)',
                        color: '#ccc',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                        e.currentTarget.style.color = '#ccc';
                      }}
                    >
                      <span style={{ color: '#A78BFA' }}>{Icons[item.icon]}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</div>
                        {'description' in item && (
                          <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                            {item.description}
                          </div>
                        )}
                      </div>
                      {'shortcut' in item && item.shortcut && (
                        <span
                          style={{
                            fontSize: 10,
                            color: '#555',
                            background: 'rgba(255, 255, 255, 0.06)',
                            padding: '2px 6px',
                            borderRadius: 4,
                          }}
                        >
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Blocks promo */}
                {activeTab === 'blocks' && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: '10px 12px',
                      background: 'linear-gradient(135deg, rgba(139, 30, 43, 0.15), rgba(168, 50, 72, 0.1))',
                      borderRadius: 10,
                      border: '1px solid rgba(168, 50, 72, 0.2)',
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#A78BFA', fontWeight: 600, marginBottom: 4 }}>
                      Blocchi Semantici
                    </div>
                    <div style={{ fontSize: 11, color: '#888' }}>
                      Strutture complete pronte all'uso. Trascina e personalizza.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Format Picker */}
          <Divider />
          <div ref={formatPickerRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFormatPicker(!showFormatPicker)}
              title="Canvas format"
              style={{
                height: 28,
                padding: '0 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                borderRadius: 6,
                border: 'none',
                background: showFormatPicker ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: showFormatPicker ? '#fff' : '#888',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                if (!showFormatPicker) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.color = '#ccc';
                }
              }}
              onMouseLeave={(e) => {
                if (!showFormatPicker) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#888';
                }
              }}
            >
              {Icons.artboard}
              <span>{currentPage ? `${currentPage.width}×${currentPage.height}` : 'Format'}</span>
            </button>

            {showFormatPicker && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 12px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 240,
                  padding: 8,
                  borderRadius: 12,
                  background: 'rgba(20, 20, 20, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.6)',
                  maxHeight: 400,
                  overflowY: 'auto',
                }}
              >
                {/* Social */}
                <div style={{ fontSize: 10, color: '#666', padding: '8px 8px 4px', fontWeight: 600, textTransform: 'uppercase' }}>
                  Social Media
                </div>
                {CANVAS_FORMATS.filter(f => f.category === 'social').map((format) => (
                  <button
                    key={format.id}
                    onClick={() => handleFormatChange(format)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: 'transparent',
                      color: '#ccc',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#ccc';
                    }}
                  >
                    <span>{format.label}</span>
                    <span style={{ color: '#666', fontSize: 10 }}>{format.width}×{format.height}</span>
                  </button>
                ))}

                {/* Web */}
                <div style={{ fontSize: 10, color: '#666', padding: '12px 8px 4px', fontWeight: 600, textTransform: 'uppercase' }}>
                  Web
                </div>
                {CANVAS_FORMATS.filter(f => f.category === 'web').map((format) => (
                  <button
                    key={format.id}
                    onClick={() => handleFormatChange(format)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: 'transparent',
                      color: '#ccc',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#ccc';
                    }}
                  >
                    <span>{format.label}</span>
                    <span style={{ color: '#666', fontSize: 10 }}>{format.width}×{format.height}</span>
                  </button>
                ))}

                {/* Print */}
                <div style={{ fontSize: 10, color: '#666', padding: '12px 8px 4px', fontWeight: 600, textTransform: 'uppercase' }}>
                  Print
                </div>
                {CANVAS_FORMATS.filter(f => f.category === 'print').map((format) => (
                  <button
                    key={format.id}
                    onClick={() => handleFormatChange(format)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: 'transparent',
                      color: '#ccc',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#ccc';
                    }}
                  >
                    <span>{format.label}</span>
                    <span style={{ color: '#666', fontSize: 10 }}>{format.width}×{format.height}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Zoom Controls */}
          {onZoomChange && (
            <>
              <Divider />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))}
                  title="Zoom out (⌘-)"
                  style={{
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    border: 'none',
                    background: 'transparent',
                    color: '#888',
                    cursor: 'pointer',
                    fontSize: 16,
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#ccc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#888';
                  }}
                >
                  −
                </button>
                <button
                  onClick={() => onZoomChange(1)}
                  title="Reset zoom (⌘0)"
                  style={{
                    minWidth: 48,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    border: 'none',
                    background: 'transparent',
                    color: '#888',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#ccc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#888';
                  }}
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  onClick={() => onZoomChange(Math.min(4, zoom + 0.1))}
                  title="Zoom in (⌘+)"
                  style={{
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 6,
                    border: 'none',
                    background: 'transparent',
                    color: '#888',
                    cursor: 'pointer',
                    fontSize: 16,
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#ccc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#888';
                  }}
                >
                  +
                </button>
              </div>
            </>
          )}

          {/* Icon Picker Button */}
          <Divider />
          <div ref={iconPickerRef} style={{ position: 'relative' }}>
            <ToolButton
              active={showIconPicker}
              onClick={() => setShowIconPicker(!showIconPicker)}
              tooltip="Icone (Lucide)"
              theme={theme}
            >
              {Icons.plugin}
            </ToolButton>

            {showIconPicker && (
              <IconPicker
                onSelect={(iconName) => {
                  if (onAddIcon) {
                    onAddIcon(iconName);
                  }
                  setShowIconPicker(false);
                }}
                onClose={() => setShowIconPicker(false)}
              />
            )}
          </div>

          {/* Plugins Button */}
          <ToolButton
            active={showPluginPanel}
            onClick={() => setShowPluginPanel(!showPluginPanel)}
            tooltip="Altri Plugin"
            theme={theme}
          >
            {Icons.puzzle}
          </ToolButton>

          {/* Plugin Panel */}
          {showPluginPanel && (
            <PluginPanel
              plugins={availablePlugins}
              onClose={() => setShowPluginPanel(false)}
              onPluginSelect={(plugin) => {
                setActivePlugin(plugin);
                setShowPluginPanel(false);
              }}
            />
          )}

          {/* Active Plugin Component */}
          {activePlugin && (
            <activePlugin.component
              onClose={() => setActivePlugin(null)}
              onInsert={onPluginInsert}
            />
          )}

          {/* Theme Toggle */}
          {onThemeToggle && (
            <>
              <Divider theme={theme} />
              <ToolButton
                onClick={onThemeToggle}
                tooltip={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                theme={theme}
              >
                {theme === 'dark' ? Icons.sun : Icons.moon}
              </ToolButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function ToolButton({
  active,
  onClick,
  tooltip,
  accent,
  theme = 'dark',
  children,
}: {
  active?: boolean;
  onClick: () => void;
  tooltip: string;
  accent?: boolean;
  theme?: 'dark' | 'light';
  children: React.ReactNode;
}) {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onClick}
      title={tooltip}
      style={{
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        border: 'none',
        background: active
          ? accent
            ? 'rgba(168, 50, 72, 0.3)'
            : isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'
          : accent
          ? 'rgba(168, 50, 72, 0.15)'
          : 'transparent',
        color: active
          ? (isDark ? '#fff' : '#1a1a1a')
          : accent
          ? '#A78BFA'
          : (isDark ? '#888' : '#666'),
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = accent
            ? 'rgba(168, 50, 72, 0.25)'
            : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)');
          e.currentTarget.style.color = accent ? '#fff' : (isDark ? '#ccc' : '#333');
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = accent ? 'rgba(168, 50, 72, 0.15)' : 'transparent';
          e.currentTarget.style.color = accent ? '#A78BFA' : (isDark ? '#888' : '#666');
        }
      }}
    >
      {children}
    </button>
  );
}

function Divider({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  return (
    <div
      style={{
        width: 1,
        height: 24,
        background: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)',
        margin: '0 6px',
      }}
    />
  );
}
