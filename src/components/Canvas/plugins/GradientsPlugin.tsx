/**
 * Gradients Plugin (Grainient-style)
 *
 * Generate and insert beautiful CSS gradients with optional grain/noise texture
 * Inspired by grainient.supply
 */

import React, { useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useCanvasStore } from '../../../lib/canvas/canvasStore';
import { THEME_COLORS } from '../../../lib/canvas/types';
import * as LucideIcons from 'lucide-react';
import { PluginComponentProps } from './PluginPanel';

interface GradientPreset {
  id: string;
  name: string;
  colors: string[];
  angle: number;
  type: 'linear' | 'radial';
  category?: 'warm' | 'cool' | 'dark' | 'vibrant' | 'pastel';
}

// Beautiful gradient presets
const gradientPresets: GradientPreset[] = [
  // Warm
  { id: '1', name: 'Sunrise', colors: ['#FF512F', '#F09819'], angle: 135, type: 'linear' },
  { id: '2', name: 'Sunset', colors: ['#ff6e7f', '#bfe9ff'], angle: 135, type: 'linear' },
  { id: '3', name: 'Peach', colors: ['#ED4264', '#FFEDBC'], angle: 90, type: 'linear' },
  { id: '4', name: 'Mango', colors: ['#ffe259', '#ffa751'], angle: 90, type: 'linear' },

  // Cool
  { id: '5', name: 'Ocean', colors: ['#2193b0', '#6dd5ed'], angle: 135, type: 'linear' },
  { id: '6', name: 'Cool Blues', colors: ['#2193b0', '#6dd5ed'], angle: 45, type: 'linear' },
  { id: '7', name: 'Aqua', colors: ['#00d2ff', '#3a7bd5'], angle: 90, type: 'linear' },
  { id: '8', name: 'Sky', colors: ['#56CCF2', '#2F80ED'], angle: 180, type: 'linear' },

  // Purple/Pink
  { id: '9', name: 'Purple Dream', colors: ['#7F00FF', '#E100FF'], angle: 135, type: 'linear' },
  { id: '10', name: 'Cosmic', colors: ['#8E2DE2', '#4A00E0'], angle: 90, type: 'linear' },
  { id: '11', name: 'Pink Fade', colors: ['#ee9ca7', '#ffdde1'], angle: 135, type: 'linear' },
  { id: '12', name: 'Violet', colors: ['#654ea3', '#eaafc8'], angle: 90, type: 'linear' },

  // Dark/Moody
  { id: '13', name: 'Midnight', colors: ['#232526', '#414345'], angle: 135, type: 'linear' },
  { id: '14', name: 'Deep Space', colors: ['#000000', '#434343'], angle: 180, type: 'linear' },
  { id: '15', name: 'Dark Ocean', colors: ['#1e3c72', '#2a5298'], angle: 135, type: 'linear' },
  { id: '16', name: 'Slate', colors: ['#3a6073', '#16222A'], angle: 180, type: 'linear' },

  // Green
  { id: '17', name: 'Forest', colors: ['#134E5E', '#71B280'], angle: 135, type: 'linear' },
  { id: '18', name: 'Lime', colors: ['#56ab2f', '#a8e063'], angle: 90, type: 'linear' },
  { id: '19', name: 'Mint', colors: ['#00b09b', '#96c93d'], angle: 135, type: 'linear' },
  { id: '20', name: 'Emerald', colors: ['#348F50', '#56B4D3'], angle: 90, type: 'linear' },

  // Multi-color
  { id: '21', name: 'Rainbow', colors: ['#f12711', '#f5af19', '#11998e'], angle: 135, type: 'linear' },
  { id: '22', name: 'Aurora', colors: ['#00c6ff', '#0072ff', '#7209b7'], angle: 135, type: 'linear' },
  { id: '23', name: 'Candy', colors: ['#D585FF', '#00FFEE'], angle: 45, type: 'linear' },
  { id: '24', name: 'Neon', colors: ['#ff00cc', '#333399'], angle: 135, type: 'linear' },

  // Radial
  { id: '25', name: 'Radial Sunset', colors: ['#f5af19', '#f12711'], angle: 0, type: 'radial' },
  { id: '26', name: 'Radial Ocean', colors: ['#6dd5ed', '#2193b0'], angle: 0, type: 'radial' },
  { id: '27', name: 'Radial Purple', colors: ['#E100FF', '#7F00FF'], angle: 0, type: 'radial' },
  { id: '28', name: 'Radial Dark', colors: ['#414345', '#232526'], angle: 0, type: 'radial' },
];

// SVG Noise filter for grain effect
const NoiseFilter: React.FC<{ id: string }> = ({ id }) => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <defs>
      <filter id={id}>
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" result="noise" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope="0.5" />
          <feFuncG type="linear" slope="0.5" />
          <feFuncB type="linear" slope="0.5" />
          <feFuncA type="linear" slope="1" />
        </feComponentTransfer>
        <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
      </filter>
    </defs>
  </svg>
);

export const GradientsPlugin: React.FC<PluginComponentProps> = ({ onClose, onInsert }) => {
  const [selectedPreset, setSelectedPreset] = useState<GradientPreset | null>(null);
  const [customColors, setCustomColors] = useState<string[]>(['#667eea', '#764ba2']);
  const [angle, setAngle] = useState(135);
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'grainient'>('presets');

  // Grainient-style grain effect
  const [grainEnabled, setGrainEnabled] = useState(false);
  const [grainIntensity, setGrainIntensity] = useState(30); // 0-100
  const [grainSize, setGrainSize] = useState<'fine' | 'medium' | 'coarse'>('medium');

  const canvasSettings = useCanvasStore((state) => state.canvasSettings);
  const theme = canvasSettings?.editorTheme || 'dark';
  const colors = THEME_COLORS[theme];
  const isDark = theme === 'dark';

  // Theme colors
  const panelBg = isDark ? '#1a1a1a' : '#ffffff';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)';
  const inputBg = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.04)';
  const hoverBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';

  // Grain size to base frequency mapping
  const grainSizeMap = { fine: 1.2, medium: 0.8, coarse: 0.4 };

  // Generate CSS gradient string
  const generateGradientCSS = useCallback((
    type: 'linear' | 'radial',
    gradientColors: string[],
    gradientAngle: number
  ): string => {
    if (type === 'radial') {
      return `radial-gradient(circle, ${gradientColors.join(', ')})`;
    }
    return `linear-gradient(${gradientAngle}deg, ${gradientColors.join(', ')})`;
  }, []);

  // Get current gradient
  const currentGradient = selectedPreset
    ? generateGradientCSS(selectedPreset.type, selectedPreset.colors, selectedPreset.angle)
    : generateGradientCSS(gradientType, customColors, angle);

  // Handle preset selection
  const handlePresetSelect = (preset: GradientPreset) => {
    setSelectedPreset(preset);
    setCustomColors(preset.colors);
    setAngle(preset.angle);
    setGradientType(preset.type);
  };

  // Generate grain CSS filter
  const grainFilter = useMemo(() => {
    if (!grainEnabled) return '';
    const baseFreq = grainSizeMap[grainSize];
    // Use CSS filter with contrast and brightness to simulate grain
    return `contrast(${100 + grainIntensity * 0.3}%) brightness(${100 - grainIntensity * 0.1}%)`;
  }, [grainEnabled, grainIntensity, grainSize]);

  // Handle insert
  const handleInsert = () => {
    if (onInsert) {
      onInsert({
        type: 'gradient',
        gradient: currentGradient,
        colors: selectedPreset?.colors || customColors,
        angle: selectedPreset?.angle || angle,
        gradientType: selectedPreset?.type || gradientType,
        grain: grainEnabled ? {
          enabled: true,
          intensity: grainIntensity,
          size: grainSize,
        } : undefined,
      });
    }
    onClose();
  };

  // Add color stop
  const addColorStop = () => {
    if (customColors.length < 5) {
      setCustomColors([...customColors, '#ffffff']);
      setSelectedPreset(null);
    }
  };

  // Remove color stop
  const removeColorStop = (index: number) => {
    if (customColors.length > 2) {
      setCustomColors(customColors.filter((_, i) => i !== index));
      setSelectedPreset(null);
    }
  };

  // Update color
  const updateColor = (index: number, color: string) => {
    const newColors = [...customColors];
    newColors[index] = color;
    setCustomColors(newColors);
    setSelectedPreset(null);
  };

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
          width: 520,
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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <LucideIcons.Palette size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>Gradienti</div>
              <div style={{ fontSize: 11, color: colors.textDimmed }}>Crea sfondi sfumati</div>
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

        {/* Preview with Grain */}
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${borderColor}`,
        }}>
          <div style={{
            height: 120,
            borderRadius: 12,
            background: currentGradient,
            border: `1px solid ${borderColor}`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Grain overlay using pseudo-element simulation */}
            {grainEnabled && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${grainSizeMap[grainSize]}' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  opacity: grainIntensity / 100,
                  mixBlendMode: 'overlay',
                  pointerEvents: 'none',
                }}
              />
            )}
          </div>
          <div style={{
            marginTop: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <div style={{
              flex: 1,
              padding: '8px 10px',
              background: inputBg,
              borderRadius: 6,
              fontSize: 11,
              fontFamily: 'monospace',
              color: colors.textMuted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {currentGradient}
            </div>
            {/* Grain toggle */}
            <button
              onClick={() => setGrainEnabled(!grainEnabled)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: grainEnabled ? `1px solid ${colors.accent}` : `1px solid ${borderColor}`,
                background: grainEnabled ? colors.accentLight : 'transparent',
                color: grainEnabled ? colors.accent : colors.textMuted,
                fontSize: 11,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Aggiungi texture grain"
            >
              <LucideIcons.Sparkles size={12} />
              Grain
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          padding: '0 20px',
          borderBottom: `1px solid ${borderColor}`,
        }}>
          {[
            { id: 'presets', label: 'Preset' },
            { id: 'custom', label: 'Personalizza' },
            { id: 'grainient', label: '✨ Grainient' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'presets' | 'custom' | 'grainient')}
              style={{
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? `2px solid ${colors.accent}` : '2px solid transparent',
                color: activeTab === tab.id ? colors.textPrimary : colors.textMuted,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {activeTab === 'presets' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
            }}>
              {gradientPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 8,
                    border: selectedPreset?.id === preset.id
                      ? `2px solid ${colors.accent}`
                      : `1px solid ${borderColor}`,
                    background: generateGradientCSS(preset.type, preset.colors, preset.angle),
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  title={preset.name}
                >
                  {selectedPreset?.id === preset.id && (
                    <div style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      background: colors.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <LucideIcons.Check size={10} color="#fff" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Gradient Type */}
              <div>
                <label style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6, display: 'block' }}>
                  Tipo
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['linear', 'radial'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => { setGradientType(type); setSelectedPreset(null); }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: gradientType === type
                          ? `1px solid ${colors.accent}`
                          : `1px solid ${borderColor}`,
                        background: gradientType === type ? colors.accentLight : 'transparent',
                        color: gradientType === type ? colors.accent : colors.textMuted,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      {type === 'linear' ? 'Lineare' : 'Radiale'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Angle (only for linear) */}
              {gradientType === 'linear' && (
                <div>
                  <label style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6, display: 'block' }}>
                    Angolo: {angle}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={angle}
                    onChange={(e) => { setAngle(Number(e.target.value)); setSelectedPreset(null); }}
                    style={{
                      width: '100%',
                      height: 4,
                      borderRadius: 2,
                      appearance: 'none',
                      background: `linear-gradient(to right, ${colors.accent}, ${colors.accent})`,
                      cursor: 'pointer',
                    }}
                  />
                </div>
              )}

              {/* Colors */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}>
                  <label style={{ fontSize: 11, color: colors.textMuted }}>
                    Colori ({customColors.length})
                  </label>
                  <button
                    onClick={addColorStop}
                    disabled={customColors.length >= 5}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: 'none',
                      background: customColors.length >= 5 ? 'transparent' : colors.accentLight,
                      color: customColors.length >= 5 ? colors.textDimmed : colors.accent,
                      fontSize: 11,
                      cursor: customColors.length >= 5 ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <LucideIcons.Plus size={12} /> Aggiungi
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {customColors.map((color, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: color,
                        border: `1px solid ${borderColor}`,
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => updateColor(index, e.target.value)}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '200%',
                            height: '200%',
                            opacity: 0,
                            cursor: 'pointer',
                          }}
                        />
                      </div>
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => updateColor(index, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: 6,
                          border: `1px solid ${borderColor}`,
                          background: inputBg,
                          color: colors.textPrimary,
                          fontSize: 12,
                          fontFamily: 'monospace',
                        }}
                      />
                      {customColors.length > 2 && (
                        <button
                          onClick={() => removeColorStop(index)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            border: 'none',
                            background: hoverBg,
                            color: colors.textMuted,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <LucideIcons.Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Grainient Tab - Premium gradients with grain */}
          {activeTab === 'grainient' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Grain Controls */}
              <div style={{
                padding: 16,
                background: inputBg,
                borderRadius: 12,
                border: `1px solid ${borderColor}`,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <LucideIcons.Sparkles size={16} color={colors.accent} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
                      Texture Grain
                    </span>
                  </div>
                  <button
                    onClick={() => setGrainEnabled(!grainEnabled)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 12,
                      border: 'none',
                      background: grainEnabled ? colors.accent : borderColor,
                      color: '#fff',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {grainEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {grainEnabled && (
                  <>
                    {/* Intensity */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={{
                        fontSize: 11,
                        color: colors.textMuted,
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 6,
                      }}>
                        <span>Intensità</span>
                        <span>{grainIntensity}%</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={grainIntensity}
                        onChange={(e) => setGrainIntensity(Number(e.target.value))}
                        style={{
                          width: '100%',
                          height: 4,
                          borderRadius: 2,
                          appearance: 'none',
                          background: `linear-gradient(to right, ${colors.accent} ${grainIntensity}%, ${borderColor} ${grainIntensity}%)`,
                          cursor: 'pointer',
                        }}
                      />
                    </div>

                    {/* Size */}
                    <div>
                      <label style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6, display: 'block' }}>
                        Dimensione grana
                      </label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {(['fine', 'medium', 'coarse'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => setGrainSize(size)}
                            style={{
                              flex: 1,
                              padding: '6px 10px',
                              borderRadius: 6,
                              border: grainSize === size ? `1px solid ${colors.accent}` : `1px solid ${borderColor}`,
                              background: grainSize === size ? colors.accentLight : 'transparent',
                              color: grainSize === size ? colors.accent : colors.textMuted,
                              fontSize: 11,
                              cursor: 'pointer',
                            }}
                          >
                            {size === 'fine' ? 'Fine' : size === 'medium' ? 'Media' : 'Grossa'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Premium Grainient Presets */}
              <div>
                <label style={{ fontSize: 11, color: colors.textMuted, marginBottom: 8, display: 'block' }}>
                  Preset Grainient (click per applicare con grain)
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 10,
                }}>
                  {[
                    { name: 'Aurora Boreale', colors: ['#0f0c29', '#302b63', '#24243e'], angle: 135 },
                    { name: 'Tramonto Tropicale', colors: ['#ff6b6b', '#feca57', '#ff9ff3'], angle: 135 },
                    { name: 'Oceano Profondo', colors: ['#0f2027', '#203a43', '#2c5364'], angle: 180 },
                    { name: 'Nebula', colors: ['#654ea3', '#eaafc8', '#654ea3'], angle: 45 },
                    { name: 'Foresta Mistica', colors: ['#134e5e', '#71b280', '#134e5e'], angle: 135 },
                    { name: 'Cyber Punk', colors: ['#ff00ff', '#00ffff', '#ff00ff'], angle: 90 },
                    { name: 'Notte Stellata', colors: ['#0f0f23', '#1a1a3e', '#2d2d5a'], angle: 180 },
                    { name: 'Rosa Antico', colors: ['#ffecd2', '#fcb69f', '#ffecd2'], angle: 135 },
                    { name: 'Ghiaccio', colors: ['#e0eafc', '#cfdef3', '#e0eafc'], angle: 45 },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCustomColors(preset.colors);
                        setAngle(preset.angle);
                        setGradientType('linear');
                        setSelectedPreset(null);
                        setGrainEnabled(true);
                        setGrainIntensity(35);
                      }}
                      style={{
                        height: 80,
                        borderRadius: 10,
                        border: `1px solid ${borderColor}`,
                        background: `linear-gradient(${preset.angle}deg, ${preset.colors.join(', ')})`,
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      title={preset.name}
                    >
                      {/* Grain preview overlay */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                          opacity: 0.3,
                          mixBlendMode: 'overlay',
                          pointerEvents: 'none',
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        bottom: 6,
                        left: 6,
                        right: 6,
                        fontSize: 9,
                        color: '#fff',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                        textAlign: 'center',
                      }}>
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 8,
        }}>
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
            onClick={handleInsert}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: colors.accent,
              color: '#fff',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <LucideIcons.Plus size={14} /> Inserisci
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GradientsPlugin;
