/**
 * Text Effects Plugin
 *
 * Apply stunning effects to text: curved, shadows, outlines, 3D, gradients
 */

import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useCanvasStore } from '../../../lib/canvas/canvasStore';
import { THEME_COLORS } from '../../../lib/canvas/types';
import * as LucideIcons from 'lucide-react';
import { PluginComponentProps } from './PluginPanel';

type EffectType = 'shadow' | 'outline' | 'gradient' | '3d' | 'glow' | 'neon';

interface TextEffect {
  id: string;
  name: string;
  type: EffectType;
  description: string;
  preview: string;
  styles: Record<string, string | number>;
}

// Text effect presets
const textEffects: TextEffect[] = [
  // Shadows
  {
    id: 'soft-shadow',
    name: 'Ombra Soft',
    type: 'shadow',
    description: 'Ombra morbida diffusa',
    preview: 'Aa',
    styles: {
      textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    },
  },
  {
    id: 'hard-shadow',
    name: 'Ombra Dura',
    type: 'shadow',
    description: 'Ombra netta offset',
    preview: 'Aa',
    styles: {
      textShadow: '4px 4px 0 rgba(0, 0, 0, 0.8)',
    },
  },
  {
    id: 'long-shadow',
    name: 'Ombra Lunga',
    type: 'shadow',
    description: 'Effetto 3D lungo',
    preview: 'Aa',
    styles: {
      textShadow: '1px 1px 0 #A78BFA, 2px 2px 0 #A78BFA, 3px 3px 0 #A78BFA, 4px 4px 0 #A78BFA, 5px 5px 0 #A78BFA, 6px 6px 0 #A78BFA',
    },
  },
  {
    id: 'multi-shadow',
    name: 'Multi Ombra',
    type: 'shadow',
    description: 'Ombre multiple colorate',
    preview: 'Aa',
    styles: {
      textShadow: '3px 3px 0 #ff6b6b, 6px 6px 0 #4ecdc4',
    },
  },

  // Outlines
  {
    id: 'outline-thin',
    name: 'Contorno Sottile',
    type: 'outline',
    description: 'Bordo sottile',
    preview: 'Aa',
    styles: {
      WebkitTextStroke: '1px #A78BFA',
      color: 'transparent',
    },
  },
  {
    id: 'outline-thick',
    name: 'Contorno Spesso',
    type: 'outline',
    description: 'Bordo spesso',
    preview: 'Aa',
    styles: {
      WebkitTextStroke: '3px #000000',
      color: 'transparent',
    },
  },
  {
    id: 'outline-filled',
    name: 'Contorno Pieno',
    type: 'outline',
    description: 'Testo con bordo',
    preview: 'Aa',
    styles: {
      WebkitTextStroke: '2px #A78BFA',
      color: '#ffffff',
    },
  },
  {
    id: 'double-outline',
    name: 'Doppio Contorno',
    type: 'outline',
    description: 'Due bordi concentrici',
    preview: 'Aa',
    styles: {
      WebkitTextStroke: '4px #000000',
      color: '#ffffff',
      textShadow: '0 0 0 4px #A78BFA',
    },
  },

  // Gradients
  {
    id: 'gradient-sunset',
    name: 'Gradient Sunset',
    type: 'gradient',
    description: 'Sfumatura tramonto',
    preview: 'Aa',
    styles: {
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
  },
  {
    id: 'gradient-ocean',
    name: 'Gradient Ocean',
    type: 'gradient',
    description: 'Sfumatura oceano',
    preview: 'Aa',
    styles: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
  },
  {
    id: 'gradient-gold',
    name: 'Gradient Gold',
    type: 'gradient',
    description: 'Sfumatura oro',
    preview: 'Aa',
    styles: {
      background: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
  },
  {
    id: 'gradient-rainbow',
    name: 'Gradient Rainbow',
    type: 'gradient',
    description: 'Arcobaleno',
    preview: 'Aa',
    styles: {
      background: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
  },

  // 3D Effects
  {
    id: '3d-classic',
    name: '3D Classico',
    type: '3d',
    description: 'Effetto tridimensionale',
    preview: 'Aa',
    styles: {
      textShadow: '1px 1px 0 #8B5CF6, 2px 2px 0 #8B5CF6, 3px 3px 0 #8B5CF6, 4px 4px 0 #8B5CF6, 5px 5px 0 rgba(0,0,0,0.2)',
    },
  },
  {
    id: '3d-retro',
    name: '3D Retro',
    type: '3d',
    description: 'Stile anni 80',
    preview: 'Aa',
    styles: {
      color: '#ff00ff',
      textShadow: '2px 2px 0 #00ffff, 4px 4px 0 #ff00ff, 6px 6px 0 #00ffff',
    },
  },
  {
    id: '3d-emboss',
    name: '3D Rilievo',
    type: '3d',
    description: 'Effetto inciso',
    preview: 'Aa',
    styles: {
      color: '#666666',
      textShadow: '-1px -1px 0 #ffffff, 1px 1px 0 #333333',
    },
  },
  {
    id: '3d-letterpress',
    name: '3D Letterpress',
    type: '3d',
    description: 'Effetto stampa',
    preview: 'Aa',
    styles: {
      color: 'transparent',
      textShadow: '0 1px 1px rgba(255,255,255,0.5)',
      WebkitBackgroundClip: 'text',
      background: 'linear-gradient(180deg, #555 0%, #333 100%)',
    },
  },

  // Glow Effects
  {
    id: 'glow-soft',
    name: 'Bagliore Soft',
    type: 'glow',
    description: 'Alone luminoso',
    preview: 'Aa',
    styles: {
      textShadow: '0 0 10px rgba(168, 50, 72, 0.5), 0 0 20px rgba(168, 50, 72, 0.3), 0 0 30px rgba(168, 50, 72, 0.2)',
    },
  },
  {
    id: 'glow-intense',
    name: 'Bagliore Intenso',
    type: 'glow',
    description: 'Alone forte',
    preview: 'Aa',
    styles: {
      textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #A78BFA, 0 0 20px #A78BFA, 0 0 25px #A78BFA',
    },
  },

  // Neon Effects
  {
    id: 'neon-pink',
    name: 'Neon Rosa',
    type: 'neon',
    description: 'Effetto neon rosa',
    preview: 'Aa',
    styles: {
      color: '#fff',
      textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff00de, 0 0 30px #ff00de, 0 0 40px #ff00de',
    },
  },
  {
    id: 'neon-blue',
    name: 'Neon Blu',
    type: 'neon',
    description: 'Effetto neon blu',
    preview: 'Aa',
    styles: {
      color: '#fff',
      textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 20px #00f3ff, 0 0 30px #00f3ff, 0 0 40px #00f3ff',
    },
  },
  {
    id: 'neon-green',
    name: 'Neon Verde',
    type: 'neon',
    description: 'Effetto neon verde',
    preview: 'Aa',
    styles: {
      color: '#fff',
      textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 20px #39ff14, 0 0 30px #39ff14, 0 0 40px #39ff14',
    },
  },
  {
    id: 'neon-red',
    name: 'Neon Rosso',
    type: 'neon',
    description: 'Effetto neon rosso',
    preview: 'Aa',
    styles: {
      color: '#fff',
      textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 20px #ff0000, 0 0 30px #ff0000, 0 0 40px #ff0000',
    },
  },
];

const effectCategories = [
  { id: 'all', name: 'Tutti', icon: LucideIcons.Sparkles },
  { id: 'shadow', name: 'Ombre', icon: LucideIcons.Sun },
  { id: 'outline', name: 'Contorni', icon: LucideIcons.Square },
  { id: 'gradient', name: 'Gradienti', icon: LucideIcons.Palette },
  { id: '3d', name: '3D', icon: LucideIcons.Box },
  { id: 'glow', name: 'Bagliori', icon: LucideIcons.Lightbulb },
  { id: 'neon', name: 'Neon', icon: LucideIcons.Zap },
];

export const TextEffectsPlugin: React.FC<PluginComponentProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEffect, setSelectedEffect] = useState<TextEffect | null>(null);
  const [previewText, setPreviewText] = useState('OBJECTS');

  const canvasSettings = useCanvasStore((state) => state.canvasSettings);
  const selectedElementIds = useCanvasStore((state) => state.selectedElementIds);
  const elements = useCanvasStore((state) => state.elements);
  const updateElementStyles = useCanvasStore((state) => state.updateElementStyles);

  const theme = canvasSettings?.editorTheme || 'dark';
  const colors = THEME_COLORS[theme];
  const isDark = theme === 'dark';

  const panelBg = isDark ? '#1a1a1a' : '#ffffff';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)';
  const inputBg = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.04)';
  const cardBg = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';

  // Filter effects
  const filteredEffects = selectedCategory === 'all'
    ? textEffects
    : textEffects.filter((e) => e.type === selectedCategory);

  // Check if text element is selected
  const selectedTextElements = selectedElementIds
    .map((id) => elements[id])
    .filter((el) => el && el.type === 'text');

  const hasTextSelected = selectedTextElements.length > 0;

  // Apply effect to selected text
  const handleApplyEffect = useCallback(() => {
    if (!selectedEffect || !hasTextSelected) return;

    selectedTextElements.forEach((element) => {
      updateElementStyles(element.id, selectedEffect.styles);
    });

    onClose();
  }, [selectedEffect, hasTextSelected, selectedTextElements, updateElementStyles, onClose]);

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)',
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
          width: 700,
          maxWidth: 'calc(100vw - 48px)',
          maxHeight: 'calc(100vh - 48px)',
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
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <LucideIcons.Sparkles size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>Effetti Testo</div>
              <div style={{ fontSize: 11, color: colors.textDimmed }}>Ombre, contorni, gradienti, neon</div>
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

        {/* Preview */}
        <div style={{
          padding: '20px',
          borderBottom: `1px solid ${borderColor}`,
          background: isDark ? '#0a0a0a' : '#f5f5f5',
        }}>
          <div style={{
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            background: isDark ? '#1a1a1a' : '#ffffff',
            border: `1px solid ${borderColor}`,
          }}>
            <span
              style={{
                fontSize: 56,
                fontWeight: 900,
                color: colors.textPrimary,
                fontFamily: 'Inter, sans-serif',
                ...(selectedEffect?.styles || {}),
              }}
            >
              {previewText}
            </span>
          </div>
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value || 'OBJECTS')}
            placeholder="Testo di anteprima..."
            style={{
              marginTop: 12,
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              background: inputBg,
              color: colors.textPrimary,
              fontSize: 13,
              textAlign: 'center',
              outline: 'none',
            }}
          />
        </div>

        {/* Categories */}
        <div style={{
          padding: '12px 20px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
        }}>
          {effectCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: selectedCategory === cat.id
                  ? `1px solid ${colors.accent}`
                  : `1px solid ${borderColor}`,
                background: selectedCategory === cat.id ? colors.accentLight : 'transparent',
                color: selectedCategory === cat.id ? colors.accent : colors.textMuted,
                fontSize: 11,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
              }}
            >
              <cat.icon size={12} />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Effects Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
          }}>
            {filteredEffects.map((effect) => (
              <button
                key={effect.id}
                onClick={() => setSelectedEffect(effect)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: selectedEffect?.id === effect.id
                    ? `2px solid ${colors.accent}`
                    : `1px solid ${borderColor}`,
                  background: cardBg,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {/* Effect Preview */}
                <div style={{
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <span
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      color: colors.textPrimary,
                      ...effect.styles,
                    }}
                  >
                    {effect.preview}
                  </span>
                </div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: colors.textPrimary,
                  marginBottom: 2,
                }}>
                  {effect.name}
                </div>
                <div style={{
                  fontSize: 9,
                  color: colors.textDimmed,
                }}>
                  {effect.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 11, color: colors.textDimmed }}>
            {hasTextSelected ? (
              <span style={{ color: colors.accent }}>
                <LucideIcons.Check size={12} style={{ display: 'inline', marginRight: 4 }} />
                {selectedTextElements.length} testo selezionato
              </span>
            ) : (
              <span>
                <LucideIcons.AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                Seleziona un elemento testo nel canvas
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                background: 'transparent',
                color: colors.textMuted,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Annulla
            </button>
            <button
              onClick={handleApplyEffect}
              disabled={!selectedEffect || !hasTextSelected}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: (!selectedEffect || !hasTextSelected) ? colors.textDimmed : colors.accent,
                color: '#fff',
                fontSize: 12,
                fontWeight: 500,
                cursor: (!selectedEffect || !hasTextSelected) ? 'not-allowed' : 'pointer',
                opacity: (!selectedEffect || !hasTextSelected) ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <LucideIcons.Check size={14} /> Applica
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TextEffectsPlugin;
