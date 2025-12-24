/**
 * Brand Kit Plugin
 *
 * Save and manage brand assets: colors, fonts, logos
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Palette, Type, Image as ImageIcon, Plus, Trash2,
  Check, Copy, Download, Upload, Briefcase, Star
} from 'lucide-react';
import { PluginComponentProps } from './PluginPanel';
import { useCanvasStore } from '../../../lib/canvas/canvasStore';

interface BrandColor {
  id: string;
  name: string;
  hex: string;
}

interface BrandFont {
  id: string;
  name: string;
  family: string;
}

interface BrandLogo {
  id: string;
  name: string;
  url: string;
}

interface BrandKit {
  colors: BrandColor[];
  fonts: BrandFont[];
  logos: BrandLogo[];
}

const DEFAULT_BRAND_KIT: BrandKit = {
  colors: [
    { id: '1', name: 'Primary', hex: '#3B82F6' },
    { id: '2', name: 'Secondary', hex: '#10B981' },
    { id: '3', name: 'Accent', hex: '#F59E0B' },
    { id: '4', name: 'Dark', hex: '#1F2937' },
    { id: '5', name: 'Light', hex: '#F3F4F6' },
  ],
  fonts: [
    { id: '1', name: 'Heading', family: 'Poppins' },
    { id: '2', name: 'Body', family: 'Inter' },
    { id: '3', name: 'Accent', family: 'Playfair Display' },
  ],
  logos: [],
};

const STORAGE_KEY = 'objects-brand-kit';

export const BrandKitPlugin: React.FC<PluginComponentProps> = ({ onClose }) => {
  const canvasSettings = useCanvasStore((state) => state.canvasSettings);
  const theme = canvasSettings?.editorTheme || 'dark';
  const isDark = theme === 'dark';

  // Theme colors
  const panelBg = isDark ? '#1a1a1a' : '#ffffff';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)';
  const inputBg = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.04)';
  const hoverBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';
  const textSecondary = isDark ? '#a1a1aa' : '#71717a';
  const accentColor = '#3B82F6';

  const [brandKit, setBrandKit] = useState<BrandKit>(DEFAULT_BRAND_KIT);
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'logos'>('colors');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#3B82F6');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setBrandKit(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load brand kit:', e);
      }
    }
  }, []);

  const saveBrandKit = useCallback((kit: BrandKit) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kit));
    setBrandKit(kit);
  }, []);

  const addColor = useCallback(() => {
    if (!newColorName.trim()) return;
    const newColor: BrandColor = {
      id: `color-${Date.now()}`,
      name: newColorName,
      hex: newColorHex,
    };
    saveBrandKit({
      ...brandKit,
      colors: [...brandKit.colors, newColor],
    });
    setNewColorName('');
    setNewColorHex('#3B82F6');
  }, [brandKit, newColorName, newColorHex, saveBrandKit]);

  const deleteColor = useCallback((id: string) => {
    saveBrandKit({
      ...brandKit,
      colors: brandKit.colors.filter(c => c.id !== id),
    });
  }, [brandKit, saveBrandKit]);

  const copyColor = useCallback((hex: string, id: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const addFont = useCallback((family: string) => {
    const newFont: BrandFont = {
      id: `font-${Date.now()}`,
      name: family,
      family,
    };
    saveBrandKit({
      ...brandKit,
      fonts: [...brandKit.fonts, newFont],
    });
  }, [brandKit, saveBrandKit]);

  const deleteFont = useCallback((id: string) => {
    saveBrandKit({
      ...brandKit,
      fonts: brandKit.fonts.filter(f => f.id !== id),
    });
  }, [brandKit, saveBrandKit]);

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
          maxWidth: 700,
          maxHeight: '85vh',
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
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Briefcase size={20} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, color: textColor }}>
                Brand Kit
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: textSecondary }}>
                Gestisci colori, font e loghi del tuo brand
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

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${borderColor}` }}>
          {[
            { id: 'colors', label: 'Colori', icon: Palette, count: brandKit.colors.length },
            { id: 'fonts', label: 'Font', icon: Type, count: brandKit.fonts.length },
            { id: 'logos', label: 'Loghi', icon: ImageIcon, count: brandKit.logos.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                borderBottom: activeTab === tab.id ? `2px solid ${accentColor}` : '2px solid transparent',
                backgroundColor: activeTab === tab.id ? hoverBg : 'transparent',
                cursor: 'pointer',
                color: activeTab === tab.id ? textColor : textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: activeTab === tab.id ? 600 : 400,
              }}
            >
              <tab.icon size={16} />
              {tab.label}
              <span style={{
                backgroundColor: inputBg,
                padding: '2px 6px',
                borderRadius: 10,
                fontSize: 11,
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div>
              <div style={{
                display: 'flex',
                gap: 10,
                marginBottom: 20,
                padding: 12,
                backgroundColor: inputBg,
                borderRadius: 10,
              }}>
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  style={{
                    width: 40,
                    height: 40,
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                />
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Nome colore"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: `1px solid ${borderColor}`,
                    backgroundColor: panelBg,
                    color: textColor,
                    fontSize: 13,
                  }}
                />
                <button
                  onClick={addColor}
                  disabled={!newColorName.trim()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: newColorName.trim() ? accentColor : borderColor,
                    color: 'white',
                    cursor: newColorName.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                  }}
                >
                  <Plus size={16} />
                  Aggiungi
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                {brandKit.colors.map((color) => (
                  <div
                    key={color.id}
                    style={{
                      borderRadius: 10,
                      overflow: 'hidden',
                      border: `1px solid ${borderColor}`,
                      backgroundColor: panelBg,
                    }}
                  >
                    <div style={{ height: 80, backgroundColor: color.hex }} />
                    <div style={{ padding: 10 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 4
                      }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: textColor }}>
                          {color.name}
                        </span>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            onClick={() => copyColor(color.hex, color.id)}
                            style={{
                              padding: 4,
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              color: copiedId === color.id ? accentColor : textSecondary,
                            }}
                          >
                            {copiedId === color.id ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                          <button
                            onClick={() => deleteColor(color.id)}
                            style={{
                              padding: 4,
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              color: textSecondary,
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: textSecondary, fontFamily: 'monospace' }}>
                        {color.hex.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fonts Tab */}
          {activeTab === 'fonts' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: 13, color: textSecondary }}>
                  Font popolari
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Inter', 'Poppins', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Playfair Display'].map(font => (
                    <button
                      key={font}
                      onClick={() => addFont(font)}
                      disabled={brandKit.fonts.some(f => f.family === font)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: `1px solid ${borderColor}`,
                        backgroundColor: brandKit.fonts.some(f => f.family === font) ? hoverBg : 'transparent',
                        cursor: brandKit.fonts.some(f => f.family === font) ? 'not-allowed' : 'pointer',
                        color: brandKit.fonts.some(f => f.family === font) ? textSecondary : textColor,
                        fontSize: 12,
                        fontFamily: font,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {brandKit.fonts.some(f => f.family === font) ? <Check size={12} /> : <Plus size={12} />}
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {brandKit.fonts.map((font) => (
                  <div
                    key={font.id}
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      border: `1px solid ${borderColor}`,
                      backgroundColor: panelBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{
                      fontSize: 20,
                      fontFamily: font.family,
                      color: textColor,
                    }}>
                      {font.family}
                    </span>
                    <button
                      onClick={() => deleteFont(font.id)}
                      style={{
                        padding: 6,
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        color: textSecondary,
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logos Tab */}
          {activeTab === 'logos' && (
            <div style={{ padding: 40, textAlign: 'center', color: textSecondary }}>
              <Upload size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p>Carica i loghi del tuo brand</p>
              <p style={{ fontSize: 12 }}>Funzionalità in arrivo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
