/**
 * Print Export Plugin
 *
 * Professional print-ready export with PDF, bleed, crop marks
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Printer, FileText, Download, AlertTriangle,
  Settings, Ruler, Scissors, Eye, Info
} from 'lucide-react';
import { PluginComponentProps } from './PluginPanel';
import { useCanvasStore } from '../../../lib/canvas/canvasStore';

interface PrintSettings {
  format: 'png-300dpi' | 'png-600dpi';
  colorMode: 'rgb' | 'cmyk-sim';
  bleed: number;
  cropMarks: boolean;
  safeArea: boolean;
  resolution: number;
}

const DEFAULT_SETTINGS: PrintSettings = {
  format: 'png-300dpi',
  colorMode: 'cmyk-sim',
  bleed: 3,
  cropMarks: true,
  safeArea: true,
  resolution: 300,
};

export const PrintExportPlugin: React.FC<PluginComponentProps> = ({ onClose }) => {
  const pages = useCanvasStore((state) => state.pages);
  const currentPageId = useCanvasStore((state) => state.currentPageId);
  const canvasSettings = useCanvasStore((state) => state.canvasSettings);

  const theme = canvasSettings?.editorTheme || 'dark';
  const isDark = theme === 'dark';

  const panelBg = isDark ? '#1a1a1a' : '#ffffff';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)';
  const inputBg = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.04)';
  const hoverBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';
  const textSecondary = isDark ? '#a1a1aa' : '#71717a';
  const accentColor = '#10B981';

  const currentPage = pages[currentPageId];

  const [settings, setSettings] = useState<PrintSettings>(DEFAULT_SETTINGS);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsExporting(false);
    alert('Export completato! (Demo - implementa export reale)');
  };

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: panelBg,
          borderRadius: 16,
          width: '100%',
          maxWidth: 600,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${borderColor}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #059669, #10B981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Printer size={20} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, color: textColor }}>
                Esporta per Stampa
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: textSecondary }}>
                Esportazione professionale per tipografie
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 8,
              cursor: 'pointer',
              color: textSecondary,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {/* Settings Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Resolution */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: textColor,
                marginBottom: 8
              }}>
                <Settings size={14} style={{ display: 'inline', marginRight: 6 }} />
                Risoluzione
              </label>
              <select
                value={settings.resolution}
                onChange={(e) => setSettings({ ...settings, resolution: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: inputBg,
                  color: textColor,
                  fontSize: 13,
                }}
              >
                <option value={150}>150 DPI (Bozza)</option>
                <option value={300}>300 DPI (Standard)</option>
                <option value={600}>600 DPI (Alta Qualità)</option>
              </select>
            </div>

            {/* Color Mode */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: textColor,
                marginBottom: 8
              }}>
                Modo Colore
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { id: 'rgb', name: 'RGB' },
                  { id: 'cmyk-sim', name: 'CMYK Sim.' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSettings({ ...settings, colorMode: mode.id as PrintSettings['colorMode'] })}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: settings.colorMode === mode.id
                        ? `2px solid ${accentColor}`
                        : `1px solid ${borderColor}`,
                      backgroundColor: settings.colorMode === mode.id ? hoverBg : 'transparent',
                      cursor: 'pointer',
                      color: textColor,
                      fontSize: 13,
                    }}
                  >
                    {mode.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Bleed */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: textColor,
                marginBottom: 8
              }}>
                <Scissors size={14} style={{ display: 'inline', marginRight: 6 }} />
                Abbondanza (mm)
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[0, 3, 5, 10].map((bleed) => (
                  <button
                    key={bleed}
                    onClick={() => setSettings({ ...settings, bleed })}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 8,
                      border: settings.bleed === bleed
                        ? `2px solid ${accentColor}`
                        : `1px solid ${borderColor}`,
                      backgroundColor: settings.bleed === bleed ? hoverBg : 'transparent',
                      cursor: 'pointer',
                      color: textColor,
                      fontSize: 13,
                    }}
                  >
                    {bleed}mm
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Options */}
          <div style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 10,
            backgroundColor: inputBg,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={settings.cropMarks}
                  onChange={(e) => setSettings({ ...settings, cropMarks: e.target.checked })}
                  style={{ width: 16, height: 16 }}
                />
                <span style={{ fontSize: 13, color: textColor }}>
                  Crocini di taglio
                </span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={settings.safeArea}
                  onChange={(e) => setSettings({ ...settings, safeArea: e.target.checked })}
                  style={{ width: 16, height: 16 }}
                />
                <span style={{ fontSize: 13, color: textColor }}>
                  Mostra area sicura (10mm)
                </span>
              </label>
            </div>
          </div>

          {/* Info */}
          <div style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 8,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
          }}>
            <Info size={16} style={{ color: '#3B82F6', flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 12, color: textColor }}>
              <strong>Consiglio:</strong> Per stampa professionale, usa abbondanza 3-5mm e risoluzione 300 DPI.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 12, color: textSecondary }}>
            Dimensione: {currentPage?.width || 1440} × {currentPage?.height || 900} px
            {settings.bleed > 0 && ` (+${settings.bleed}mm abbondanza)`}
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              border: 'none',
              background: isExporting
                ? borderColor
                : 'linear-gradient(135deg, #059669, #10B981)',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: isExporting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            {isExporting ? (
              'Esportando...'
            ) : (
              <>
                <Download size={18} />
                Esporta per Stampa
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
