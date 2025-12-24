/**
 * Google Fonts Plugin
 *
 * Browse and insert Google Fonts
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useCanvasStore } from '../../../lib/canvas/canvasStore';
import { THEME_COLORS } from '../../../lib/canvas/types';
import * as LucideIcons from 'lucide-react';
import { PluginComponentProps } from './PluginPanel';

interface GoogleFont {
  family: string;
  category: string;
  variants: string[];
  subsets: string[];
}

// Popular Google Fonts - Expanded curated list for professional design
const popularFonts: GoogleFont[] = [
  // === SANS-SERIF (Modern, Clean) ===
  { family: 'Inter', category: 'sans-serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Roboto', category: 'sans-serif', variants: ['400', '500', '700', '900'], subsets: ['latin'] },
  { family: 'Open Sans', category: 'sans-serif', variants: ['400', '600', '700', '800'], subsets: ['latin'] },
  { family: 'Montserrat', category: 'sans-serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Poppins', category: 'sans-serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Lato', category: 'sans-serif', variants: ['400', '700', '900'], subsets: ['latin'] },
  { family: 'Oswald', category: 'sans-serif', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
  { family: 'Raleway', category: 'sans-serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Nunito', category: 'sans-serif', variants: ['400', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Ubuntu', category: 'sans-serif', variants: ['400', '500', '700'], subsets: ['latin'] },
  { family: 'Space Grotesk', category: 'sans-serif', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
  { family: 'DM Sans', category: 'sans-serif', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
  { family: 'Plus Jakarta Sans', category: 'sans-serif', variants: ['400', '500', '600', '700', '800'], subsets: ['latin'] },
  { family: 'Sora', category: 'sans-serif', variants: ['400', '500', '600', '700', '800'], subsets: ['latin'] },
  { family: 'Manrope', category: 'sans-serif', variants: ['400', '500', '600', '700', '800'], subsets: ['latin'] },
  { family: 'Outfit', category: 'sans-serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Bricolage Grotesque', category: 'sans-serif', variants: ['400', '500', '600', '700', '800'], subsets: ['latin'] },
  { family: 'Figtree', category: 'sans-serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Lexend', category: 'sans-serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Instrument Sans', category: 'sans-serif', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
  { family: 'Geist', category: 'sans-serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Work Sans', category: 'sans-serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Archivo', category: 'sans-serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Red Hat Display', category: 'sans-serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },

  // === SERIF (Elegant, Editorial) ===
  { family: 'Playfair Display', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Merriweather', category: 'serif', variants: ['400', '700', '900'], subsets: ['latin'] },
  { family: 'Lora', category: 'serif', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
  { family: 'PT Serif', category: 'serif', variants: ['400', '700'], subsets: ['latin'] },
  { family: 'Libre Baskerville', category: 'serif', variants: ['400', '700'], subsets: ['latin'] },
  { family: 'Cormorant Garamond', category: 'serif', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
  { family: 'Fraunces', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Crimson Pro', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Source Serif 4', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Bitter', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'DM Serif Display', category: 'serif', variants: ['400'], subsets: ['latin'] },
  { family: 'Noto Serif', category: 'serif', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },

  // === DISPLAY (Bold, Headlines, Posters) ===
  { family: 'Bebas Neue', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Anton', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Alfa Slab One', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Black Ops One', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Righteous', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Russo One', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Bungee', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Bangers', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Press Start 2P', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Orbitron', category: 'display', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'Audiowide', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Staatliches', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Monoton', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Rubik Mono One', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Fredoka', category: 'display', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
  { family: 'Titan One', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Bungee Shade', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Climate Crisis', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Nabla', category: 'display', variants: ['400'], subsets: ['latin'] },
  { family: 'Rubik Glitch', category: 'display', variants: ['400'], subsets: ['latin'] },

  // === HANDWRITING (Script, Calligraphy) ===
  { family: 'Pacifico', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
  { family: 'Dancing Script', category: 'handwriting', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
  { family: 'Caveat', category: 'handwriting', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
  { family: 'Satisfy', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
  { family: 'Great Vibes', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
  { family: 'Lobster', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
  { family: 'Sacramento', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
  { family: 'Permanent Marker', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
  { family: 'Indie Flower', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
  { family: 'Shadows Into Light', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
  { family: 'Amatic SC', category: 'handwriting', variants: ['400', '700'], subsets: ['latin'] },
  { family: 'Kalam', category: 'handwriting', variants: ['400', '700'], subsets: ['latin'] },
  { family: 'Architects Daughter', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
  { family: 'Cookie', category: 'handwriting', variants: ['400'], subsets: ['latin'] },
  { family: 'Yellowtail', category: 'handwriting', variants: ['400'], subsets: ['latin'] },

  // === MONOSPACE (Code, Technical) ===
  { family: 'Fira Code', category: 'monospace', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
  { family: 'JetBrains Mono', category: 'monospace', variants: ['400', '500', '600', '700', '800'], subsets: ['latin'] },
  { family: 'Source Code Pro', category: 'monospace', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
  { family: 'IBM Plex Mono', category: 'monospace', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
  { family: 'Space Mono', category: 'monospace', variants: ['400', '700'], subsets: ['latin'] },
  { family: 'Roboto Mono', category: 'monospace', variants: ['400', '500', '600', '700'], subsets: ['latin'] },
  { family: 'Ubuntu Mono', category: 'monospace', variants: ['400', '700'], subsets: ['latin'] },
  { family: 'Inconsolata', category: 'monospace', variants: ['400', '500', '600', '700', '800', '900'], subsets: ['latin'] },
];

export const GoogleFontsPlugin: React.FC<PluginComponentProps> = ({ onClose, onInsert }) => {
  const [search, setSearch] = useState('');
  const [selectedFont, setSelectedFont] = useState<GoogleFont | null>(null);
  const [selectedWeight, setSelectedWeight] = useState('400');
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog');
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const canvasSettings = useCanvasStore((state) => state.canvasSettings);
  const theme = canvasSettings?.editorTheme || 'dark';
  const colors = THEME_COLORS[theme];
  const isDark = theme === 'dark';

  // Theme colors
  const panelBg = isDark ? '#1a1a1a' : '#ffffff';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)';
  const inputBg = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.04)';
  const hoverBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';

  // Load font dynamically
  const loadFont = useCallback((fontFamily: string) => {
    if (loadedFonts.has(fontFamily)) return;

    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    setLoadedFonts(prev => new Set([...prev, fontFamily]));
  }, [loadedFonts]);

  // Load fonts for visible items
  useEffect(() => {
    popularFonts.slice(0, 15).forEach(font => loadFont(font.family));
  }, [loadFont]);

  // Categories
  const categories = [
    { id: 'all', label: 'Tutti' },
    { id: 'sans-serif', label: 'Sans Serif' },
    { id: 'serif', label: 'Serif' },
    { id: 'display', label: 'Display' },
    { id: 'handwriting', label: 'Script' },
    { id: 'monospace', label: 'Mono' },
  ];

  // Filter fonts
  const filteredFonts = popularFonts.filter(font => {
    const matchesSearch = font.family.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || font.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle font selection
  const handleFontSelect = (font: GoogleFont) => {
    loadFont(font.family);
    setSelectedFont(font);
    setSelectedWeight(font.variants.includes('400') ? '400' : font.variants[0]);
  };

  // Handle insert
  const handleInsert = () => {
    if (selectedFont && onInsert) {
      onInsert({
        type: 'font',
        fontFamily: selectedFont.family,
        fontWeight: selectedWeight,
        category: selectedFont.category,
      });
    }
    onClose();
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
          width: 560,
          maxWidth: 'calc(100vw - 48px)',
          height: 'min(650px, calc(100vh - 48px))',
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
              background: '#4285F4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <LucideIcons.Type size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>Google Fonts</div>
              <div style={{ fontSize: 11, color: colors.textDimmed }}>{popularFonts.length} font disponibili</div>
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

        {/* Search & Categories */}
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${borderColor}` }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            background: inputBg,
            borderRadius: 8,
            marginBottom: 12,
          }}>
            <LucideIcons.Search size={16} color={colors.textDimmed} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca font..."
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

          {/* Category filters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: activeCategory === cat.id
                    ? `1px solid ${colors.accent}`
                    : `1px solid ${borderColor}`,
                  background: activeCategory === cat.id ? colors.accentLight : 'transparent',
                  color: activeCategory === cat.id ? colors.accent : colors.textMuted,
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {filteredFonts.map((font) => (
            <button
              key={font.family}
              onClick={() => handleFontSelect(font)}
              onMouseEnter={() => loadFont(font.family)}
              style={{
                width: '100%',
                padding: '12px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 4,
                background: selectedFont?.family === font.family ? hoverBg : 'transparent',
                border: 'none',
                borderLeft: selectedFont?.family === font.family
                  ? `2px solid ${colors.accent}`
                  : '2px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{
                fontSize: 11,
                color: colors.textDimmed,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {font.family}
              </div>
              <div style={{
                fontSize: 22,
                fontFamily: `'${font.family}', ${font.category}`,
                color: colors.textPrimary,
                lineHeight: 1.3,
              }}>
                {previewText.substring(0, 40)}
              </div>
            </button>
          ))}

          {filteredFonts.length === 0 && (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: colors.textDimmed,
            }}>
              <LucideIcons.Type size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
              <div>Nessun font trovato</div>
            </div>
          )}
        </div>

        {/* Selected Font Preview */}
        {selectedFont && (
          <div style={{
            padding: '16px 20px',
            borderTop: `1px solid ${borderColor}`,
            background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: colors.textPrimary }}>
                {selectedFont.family}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {selectedFont.variants.map((weight) => (
                  <button
                    key={weight}
                    onClick={() => setSelectedWeight(weight)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: selectedWeight === weight
                        ? `1px solid ${colors.accent}`
                        : `1px solid ${borderColor}`,
                      background: selectedWeight === weight ? colors.accentLight : 'transparent',
                      color: selectedWeight === weight ? colors.accent : colors.textMuted,
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {weight}
                  </button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                background: inputBg,
                color: colors.textPrimary,
                fontSize: 18,
                fontFamily: `'${selectedFont.family}', ${selectedFont.category}`,
                fontWeight: parseInt(selectedWeight),
              }}
            />
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <a
            href="https://fonts.google.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 11,
              color: colors.textDimmed,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Powered by Google Fonts <LucideIcons.ExternalLink size={10} />
          </a>
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
              onClick={handleInsert}
              disabled={!selectedFont}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: selectedFont ? colors.accent : colors.textDimmed,
                color: '#fff',
                fontSize: 12,
                fontWeight: 500,
                cursor: selectedFont ? 'pointer' : 'default',
                opacity: selectedFont ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <LucideIcons.Check size={14} /> Applica Font
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GoogleFontsPlugin;
