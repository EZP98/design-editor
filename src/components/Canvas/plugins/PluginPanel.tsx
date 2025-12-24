/**
 * Plugin Panel
 *
 * Main panel showing available plugins like Framer's plugin menu
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCanvasStore } from '../../../lib/canvas/canvasStore';
import { THEME_COLORS } from '../../../lib/canvas/types';
import * as LucideIcons from 'lucide-react';

// Plugin definitions
export interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<PluginComponentProps>;
  category: 'media' | 'design' | 'export' | 'ai';
}

export interface PluginComponentProps {
  onClose: () => void;
  onInsert?: (data: any) => void;
}

interface PluginPanelProps {
  plugins: Plugin[];
  onClose: () => void;
  onPluginSelect: (plugin: Plugin) => void;
}

export const PluginPanel: React.FC<PluginPanelProps> = ({ plugins, onClose, onPluginSelect }) => {
  const [search, setSearch] = useState('');
  const canvasSettings = useCanvasStore((state) => state.canvasSettings);
  const theme = canvasSettings?.editorTheme || 'dark';
  const colors = THEME_COLORS[theme];
  const isDark = theme === 'dark';

  // Theme colors
  const panelBg = isDark ? '#1a1a1a' : '#ffffff';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)';
  const inputBg = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.04)';
  const hoverBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';

  // Filter plugins by search
  const filteredPlugins = plugins.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  // Group by category
  const categories = {
    media: filteredPlugins.filter(p => p.category === 'media'),
    design: filteredPlugins.filter(p => p.category === 'design'),
    export: filteredPlugins.filter(p => p.category === 'export'),
    ai: filteredPlugins.filter(p => p.category === 'ai'),
  };

  const categoryLabels: Record<string, string> = {
    media: 'Media',
    design: 'Design',
    export: 'Export',
    ai: 'AI Tools',
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 400,
          maxWidth: 'calc(100vw - 48px)',
          maxHeight: 'calc(100vh - 100px)',
          background: panelBg,
          borderRadius: 16,
          border: `1px solid ${borderColor}`,
          boxShadow: isDark ? '0 24px 80px rgba(0, 0, 0, 0.5)' : '0 24px 80px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: colors.accentLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <LucideIcons.Puzzle size={16} color={colors.accent} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>Plugins</div>
              <div style={{ fontSize: 11, color: colors.textDimmed }}>{plugins.length} disponibili</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: 'none',
              background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              color: colors.textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LucideIcons.X size={16} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${borderColor}` }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            background: inputBg,
            borderRadius: 8,
          }}>
            <LucideIcons.Search size={16} color={colors.textDimmed} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca plugin..."
              autoFocus
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: colors.textPrimary,
                fontSize: 13,
              }}
            />
          </div>
        </div>

        {/* Plugin List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {Object.entries(categories).map(([category, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={category} style={{ marginBottom: 16 }}>
                <div style={{
                  padding: '0 20px',
                  marginBottom: 8,
                  fontSize: 10,
                  fontWeight: 600,
                  color: colors.textDimmed,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}>
                  {categoryLabels[category]}
                </div>
                {items.map((plugin) => (
                  <button
                    key={plugin.id}
                    onClick={() => onPluginSelect(plugin)}
                    style={{
                      width: '100%',
                      padding: '10px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = hoverBg}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: colors.textSecondary,
                    }}>
                      {plugin.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: colors.textPrimary }}>
                        {plugin.name}
                      </div>
                      <div style={{ fontSize: 11, color: colors.textMuted }}>
                        {plugin.description}
                      </div>
                    </div>
                    <LucideIcons.ChevronRight size={16} color={colors.textDimmed} />
                  </button>
                ))}
              </div>
            );
          })}

          {filteredPlugins.length === 0 && (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: colors.textDimmed,
            }}>
              Nessun plugin trovato
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PluginPanel;
