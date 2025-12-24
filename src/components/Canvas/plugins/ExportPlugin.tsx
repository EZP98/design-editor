/**
 * Export Plugin
 *
 * Export canvas to PNG, JPG, SVG, or PDF
 */

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCanvasStore } from '../../../lib/canvas/canvasStore';
import { THEME_COLORS } from '../../../lib/canvas/types';
import * as LucideIcons from 'lucide-react';
import { PluginComponentProps } from './PluginPanel';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { saveAs } from 'file-saver';

type ExportFormat = 'png' | 'jpg' | 'svg';
type ExportScale = 1 | 2 | 3 | 4;

interface ExportOptions {
  format: ExportFormat;
  scale: ExportScale;
  quality: number;
  background: 'transparent' | 'white' | 'black' | 'custom';
  customBg?: string;
}

export const ExportPlugin: React.FC<PluginComponentProps> = ({ onClose }) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'png',
    scale: 2,
    quality: 0.92,
    background: 'transparent',
  });
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasSettings = useCanvasStore((state) => state.canvasSettings);
  const theme = canvasSettings?.editorTheme || 'dark';
  const colors = THEME_COLORS[theme];
  const isDark = theme === 'dark';

  // Theme colors
  const panelBg = isDark ? '#1a1a1a' : '#ffffff';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)';
  const inputBg = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.04)';

  // Format options
  const formats: { id: ExportFormat; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'png', label: 'PNG', icon: <LucideIcons.FileImage size={18} />, desc: 'Lossless, supporta trasparenza' },
    { id: 'jpg', label: 'JPG', icon: <LucideIcons.Image size={18} />, desc: 'Compresso, file leggero' },
    { id: 'svg', label: 'SVG', icon: <LucideIcons.FileCode size={18} />, desc: 'Vettoriale, scalabile' },
  ];

  // Scale options
  const scales: { value: ExportScale; label: string }[] = [
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 3, label: '3x' },
    { value: 4, label: '4x' },
  ];

  // Background options
  const backgrounds: { value: string; label: string; color: string }[] = [
    { value: 'transparent', label: 'Trasparente', color: 'transparent' },
    { value: 'white', label: 'Bianco', color: '#ffffff' },
    { value: 'black', label: 'Nero', color: '#000000' },
    { value: 'custom', label: 'Custom', color: options.customBg || '#667eea' },
  ];

  // Get background color
  const getBackgroundColor = (): string | undefined => {
    switch (options.background) {
      case 'transparent':
        return undefined;
      case 'white':
        return '#ffffff';
      case 'black':
        return '#000000';
      case 'custom':
        return options.customBg || '#667eea';
      default:
        return undefined;
    }
  };

  // Export function
  const handleExport = async () => {
    setExporting(true);
    setError(null);

    try {
      // Find the canvas element
      const canvasElement = document.querySelector('[data-canvas-export]') as HTMLElement;

      if (!canvasElement) {
        throw new Error('Canvas element not found. Make sure the canvas has data-canvas-export attribute.');
      }

      const backgroundColor = getBackgroundColor();
      const pixelRatio = options.scale;

      let dataUrl: string;

      switch (options.format) {
        case 'png':
          dataUrl = await toPng(canvasElement, {
            pixelRatio,
            backgroundColor,
            cacheBust: true,
          });
          break;
        case 'jpg':
          dataUrl = await toJpeg(canvasElement, {
            pixelRatio,
            backgroundColor: backgroundColor || '#ffffff',
            quality: options.quality,
            cacheBust: true,
          });
          break;
        case 'svg':
          dataUrl = await toSvg(canvasElement, {
            backgroundColor,
            cacheBust: true,
          });
          break;
        default:
          throw new Error('Unsupported format');
      }

      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `design-${timestamp}.${options.format}`;

      // Save file
      if (options.format === 'svg') {
        const svgBlob = new Blob([dataUrl], { type: 'image/svg+xml;charset=utf-8' });
        saveAs(svgBlob, filename);
      } else {
        saveAs(dataUrl, filename);
      }

      onClose();
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
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
          width: 440,
          maxWidth: 'calc(100vw - 48px)',
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
              background: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <LucideIcons.Download size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>Esporta</div>
              <div style={{ fontSize: 11, color: colors.textDimmed }}>Salva il tuo design</div>
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

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Format Selection */}
          <div>
            <label style={{
              fontSize: 11,
              fontWeight: 500,
              color: colors.textMuted,
              marginBottom: 8,
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Formato
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {formats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => setOptions(prev => ({ ...prev, format: format.id }))}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    border: options.format === format.id
                      ? `2px solid ${colors.accent}`
                      : `1px solid ${borderColor}`,
                    background: options.format === format.id
                      ? colors.accentLight
                      : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <div style={{ color: options.format === format.id ? colors.accent : colors.textMuted }}>
                    {format.icon}
                  </div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: options.format === format.id ? colors.accent : colors.textPrimary,
                  }}>
                    {format.label}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: colors.textDimmed,
                    textAlign: 'center',
                  }}>
                    {format.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Scale (not for SVG) */}
          {options.format !== 'svg' && (
            <div>
              <label style={{
                fontSize: 11,
                fontWeight: 500,
                color: colors.textMuted,
                marginBottom: 8,
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Risoluzione
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {scales.map((scale) => (
                  <button
                    key={scale.value}
                    onClick={() => setOptions(prev => ({ ...prev, scale: scale.value }))}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 8,
                      border: options.scale === scale.value
                        ? `1px solid ${colors.accent}`
                        : `1px solid ${borderColor}`,
                      background: options.scale === scale.value
                        ? colors.accentLight
                        : 'transparent',
                      color: options.scale === scale.value ? colors.accent : colors.textMuted,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {scale.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quality (only for JPG) */}
          {options.format === 'jpg' && (
            <div>
              <label style={{
                fontSize: 11,
                fontWeight: 500,
                color: colors.textMuted,
                marginBottom: 8,
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Qualita: {Math.round(options.quality * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={options.quality}
                onChange={(e) => setOptions(prev => ({ ...prev, quality: parseFloat(e.target.value) }))}
                style={{
                  width: '100%',
                  height: 6,
                  borderRadius: 3,
                  appearance: 'none',
                  background: inputBg,
                  cursor: 'pointer',
                }}
              />
            </div>
          )}

          {/* Background (for PNG) */}
          {options.format === 'png' && (
            <div>
              <label style={{
                fontSize: 11,
                fontWeight: 500,
                color: colors.textMuted,
                marginBottom: 8,
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Sfondo
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {backgrounds.map((bg) => (
                  <button
                    key={bg.value}
                    onClick={() => setOptions(prev => ({ ...prev, background: bg.value as any }))}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 8,
                      border: options.background === bg.value
                        ? `2px solid ${colors.accent}`
                        : `1px solid ${borderColor}`,
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: bg.value === 'transparent'
                        ? 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 8px 8px'
                        : bg.color,
                      border: `1px solid ${borderColor}`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      {bg.value === 'custom' && (
                        <input
                          type="color"
                          value={options.customBg || '#667eea'}
                          onChange={(e) => setOptions(prev => ({ ...prev, customBg: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
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
                      )}
                    </div>
                    <span style={{
                      fontSize: 10,
                      color: options.background === bg.value ? colors.accent : colors.textMuted,
                    }}>
                      {bg.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={{
              padding: '10px 12px',
              background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderRadius: 8,
              fontSize: 12,
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <LucideIcons.AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 8,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: `1px solid ${borderColor}`,
              background: 'transparent',
              color: colors.textMuted,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Annulla
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              padding: '10px 18px',
              borderRadius: 8,
              border: 'none',
              background: '#10B981',
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
              cursor: exporting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: exporting ? 0.7 : 1,
            }}
          >
            {exporting ? (
              <>
                <LucideIcons.Loader2 size={16} className="animate-spin" />
                Esportando...
              </>
            ) : (
              <>
                <LucideIcons.Download size={16} />
                Esporta {options.format.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ExportPlugin;
