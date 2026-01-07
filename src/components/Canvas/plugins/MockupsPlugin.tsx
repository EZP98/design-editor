/**
 * Mockups Plugin
 *
 * Preview designs on realistic mockup templates
 * Renders user's design onto mockup with perspective transforms
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, ShoppingBag, Monitor, Smartphone, BookOpen,
  Package, Coffee, Shirt, Image as ImageIcon, Download, Eye, Loader2, RefreshCw
} from 'lucide-react';
import { PluginComponentProps } from './PluginPanel';
import { useCanvasStore } from '../../../lib/canvas/canvasStore';
import html2canvas from 'html2canvas';

interface MockupCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number }>;
}

// Placement area defines where the design goes on the mockup
interface PlacementArea {
  // Position as percentage of mockup dimensions
  x: number;
  y: number;
  width: number;
  height: number;
  // CSS transform for perspective
  transform?: string;
  // Blend mode for realistic integration
  blendMode?: string;
  // Opacity
  opacity?: number;
}

interface MockupTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  // High-res image for rendering
  image: string;
  // Where to place the design
  placement: PlacementArea;
}

const MOCKUP_CATEGORIES: MockupCategory[] = [
  { id: 'all', name: 'Tutti', icon: ImageIcon },
  { id: 'apparel', name: 'Abbigliamento', icon: Shirt },
  { id: 'print', name: 'Stampa', icon: BookOpen },
  { id: 'packaging', name: 'Packaging', icon: Package },
  { id: 'devices', name: 'Dispositivi', icon: Monitor },
  { id: 'accessories', name: 'Accessori', icon: Coffee },
];

const MOCKUP_TEMPLATES: MockupTemplate[] = [
  // Apparel
  {
    id: 'tshirt-white',
    name: 'T-Shirt Bianca',
    category: 'apparel',
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
    placement: { x: 30, y: 25, width: 40, height: 35, blendMode: 'multiply', opacity: 0.9 }
  },
  {
    id: 'tshirt-black',
    name: 'T-Shirt Nera',
    category: 'apparel',
    thumbnail: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=300&h=300&fit=crop',
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop',
    placement: { x: 30, y: 30, width: 40, height: 35, blendMode: 'screen', opacity: 0.85 }
  },
  {
    id: 'hoodie',
    name: 'Felpa',
    category: 'apparel',
    thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
    placement: { x: 28, y: 30, width: 44, height: 35, blendMode: 'multiply', opacity: 0.85 }
  },
  // Print
  {
    id: 'poster',
    name: 'Poster',
    category: 'print',
    thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&h=300&fit=crop',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&h=800&fit=crop',
    placement: { x: 20, y: 10, width: 60, height: 75, transform: 'perspective(800px) rotateY(-5deg)', opacity: 1 }
  },
  {
    id: 'business-card',
    name: 'Biglietto Visita',
    category: 'print',
    thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=300&fit=crop',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=800&fit=crop',
    placement: { x: 15, y: 25, width: 70, height: 45, transform: 'perspective(600px) rotateX(10deg)', opacity: 1 }
  },
  {
    id: 'book',
    name: 'Libro',
    category: 'print',
    thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&h=800&fit=crop',
    placement: { x: 18, y: 8, width: 45, height: 65, transform: 'perspective(500px) rotateY(15deg)', opacity: 0.95 }
  },
  // Packaging
  {
    id: 'box',
    name: 'Scatola',
    category: 'packaging',
    thumbnail: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=300&h=300&fit=crop',
    image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=800&h=800&fit=crop',
    placement: { x: 20, y: 15, width: 50, height: 50, transform: 'perspective(600px) rotateY(-10deg) rotateX(5deg)', opacity: 0.9 }
  },
  {
    id: 'bag',
    name: 'Sacchetto',
    category: 'packaging',
    thumbnail: 'https://images.unsplash.com/photo-1575844264771-892081089af5?w=300&h=300&fit=crop',
    image: 'https://images.unsplash.com/photo-1575844264771-892081089af5?w=800&h=800&fit=crop',
    placement: { x: 25, y: 20, width: 50, height: 45, blendMode: 'multiply', opacity: 0.85 }
  },
  // Devices
  {
    id: 'macbook',
    name: 'MacBook',
    category: 'devices',
    thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&h=800&fit=crop',
    placement: { x: 12, y: 8, width: 76, height: 48, transform: 'perspective(1000px) rotateX(5deg)', opacity: 1 }
  },
  {
    id: 'iphone',
    name: 'iPhone',
    category: 'devices',
    thumbnail: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=300&fit=crop',
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop',
    placement: { x: 28, y: 12, width: 44, height: 76, opacity: 1 }
  },
  // Accessories
  {
    id: 'mug',
    name: 'Tazza',
    category: 'accessories',
    thumbnail: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=300&h=300&fit=crop',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=800&fit=crop',
    placement: { x: 20, y: 25, width: 35, height: 40, transform: 'perspective(400px) rotateY(15deg)', blendMode: 'multiply', opacity: 0.8 }
  },
  {
    id: 'notebook',
    name: 'Notebook',
    category: 'accessories',
    thumbnail: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&h=300&fit=crop',
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&h=800&fit=crop',
    placement: { x: 15, y: 20, width: 70, height: 55, transform: 'perspective(600px) rotateX(15deg)', opacity: 0.95 }
  },
];

export const MockupsPlugin: React.FC<PluginComponentProps> = ({ onClose }) => {
  const canvasSettings = useCanvasStore((state) => state.canvasSettings);
  const currentPageId = useCanvasStore((state) => state.currentPageId);
  const pages = useCanvasStore((state) => state.pages);
  const elements = useCanvasStore((state) => state.elements);

  const theme = canvasSettings?.editorTheme || 'dark';
  const isDark = theme === 'dark';

  const panelBg = isDark ? '#1a1a1a' : '#ffffff';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)';
  const hoverBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';
  const textSecondary = isDark ? '#a1a1aa' : '#71717a';
  const accentColor = '#F59E0B';

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMockup, setSelectedMockup] = useState<MockupTemplate | null>(null);
  const [designImage, setDesignImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const filteredMockups = selectedCategory === 'all'
    ? MOCKUP_TEMPLATES
    : MOCKUP_TEMPLATES.filter(m => m.category === selectedCategory);

  // Capture current page as image
  const captureDesign = useCallback(async () => {
    setIsCapturing(true);
    try {
      // Find the canvas element in the DOM
      const canvasContainer = document.querySelector('[data-canvas-content]') as HTMLElement;
      if (!canvasContainer) {
        console.warn('Canvas not found');
        setIsCapturing(false);
        return;
      }

      const canvas = await html2canvas(canvasContainer, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      setDesignImage(dataUrl);
    } catch (err) {
      console.error('Failed to capture design:', err);
    } finally {
      setIsCapturing(false);
    }
  }, []);

  // Auto-capture when opening or changing mockup
  useEffect(() => {
    if (!designImage) {
      captureDesign();
    }
  }, []);

  // Download mockup with design
  const handleDownload = useCallback(async () => {
    if (!selectedMockup || !previewRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `mockup-${selectedMockup.id}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to download mockup:', err);
    } finally {
      setIsDownloading(false);
    }
  }, [selectedMockup]);

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
          maxWidth: 900,
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
                background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingBag size={20} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, color: textColor }}>
                Mockups
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: textSecondary }}>
                Visualizza il tuo design su prodotti reali
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

        {/* Categories */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: 16,
          borderBottom: `1px solid ${borderColor}`,
          overflowX: 'auto',
        }}>
          {MOCKUP_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: selectedCategory === cat.id
                  ? `2px solid ${accentColor}`
                  : `1px solid ${borderColor}`,
                backgroundColor: selectedCategory === cat.id ? hoverBg : 'transparent',
                cursor: 'pointer',
                color: selectedCategory === cat.id ? textColor : textSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: selectedCategory === cat.id ? 600 : 400,
                whiteSpace: 'nowrap',
              }}
            >
              <cat.icon size={14} />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Content - Split View */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {/* Left: Mockup Grid */}
          <div style={{
            width: selectedMockup ? '40%' : '100%',
            overflow: 'auto',
            padding: 16,
            borderRight: selectedMockup ? `1px solid ${borderColor}` : 'none',
            transition: 'width 0.3s',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: selectedMockup ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: 10,
            }}>
              {filteredMockups.map((mockup) => (
                <div
                  key={mockup.id}
                  onClick={() => setSelectedMockup(mockup)}
                  style={{
                    borderRadius: 10,
                    overflow: 'hidden',
                    border: selectedMockup?.id === mockup.id
                      ? `2px solid ${accentColor}`
                      : `1px solid ${borderColor}`,
                    cursor: 'pointer',
                    backgroundColor: panelBg,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: '100%',
                    aspectRatio: '1',
                    overflow: 'hidden',
                  }}>
                    <img
                      src={mockup.thumbnail}
                      alt={mockup.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div style={{
                    padding: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: textColor,
                    }}>
                      {mockup.name}
                    </span>
                    {selectedMockup?.id === mockup.id && (
                      <Eye size={12} style={{ color: accentColor }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Preview Panel */}
          {selectedMockup && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: 16,
              background: isDark ? '#0a0a0a' : '#f0f0f0',
            }}>
              {/* Preview Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: textColor }}>{selectedMockup.name}</div>
                  <div style={{ fontSize: 11, color: textSecondary }}>Preview con il tuo design</div>
                </div>
                <button
                  onClick={captureDesign}
                  disabled={isCapturing}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: `1px solid ${borderColor}`,
                    background: 'transparent',
                    color: textSecondary,
                    fontSize: 11,
                    cursor: isCapturing ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  {isCapturing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  Aggiorna
                </button>
              </div>

              {/* Mockup Preview with Design */}
              <div
                ref={previewRef}
                style={{
                  flex: 1,
                  position: 'relative',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Mockup Image */}
                <img
                  src={selectedMockup.image}
                  alt={selectedMockup.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                  crossOrigin="anonymous"
                />

                {/* Design Overlay */}
                {designImage && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${selectedMockup.placement.x}%`,
                      top: `${selectedMockup.placement.y}%`,
                      width: `${selectedMockup.placement.width}%`,
                      height: `${selectedMockup.placement.height}%`,
                      transform: selectedMockup.placement.transform || 'none',
                      mixBlendMode: (selectedMockup.placement.blendMode as any) || 'normal',
                      opacity: selectedMockup.placement.opacity ?? 1,
                      overflow: 'hidden',
                      pointerEvents: 'none',
                    }}
                  >
                    <img
                      src={designImage}
                      alt="Your design"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                )}

                {/* Loading State */}
                {isCapturing && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 12,
                  }}>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ marginLeft: 8 }}>Catturando design...</span>
                  </div>
                )}

                {/* No Design Placeholder */}
                {!designImage && !isCapturing && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: textSecondary,
                    fontSize: 12,
                    background: 'rgba(0,0,0,0.3)',
                  }}>
                    <ImageIcon size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
                    <span>Nessun design catturato</span>
                    <button
                      onClick={captureDesign}
                      style={{
                        marginTop: 8,
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: accentColor,
                        color: '#fff',
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      Cattura Design
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: `1px solid ${borderColor}`,
          backgroundColor: isDark ? '#141414' : '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 12, color: textSecondary }}>
            {selectedMockup ? (
              <span>Mockup: <strong style={{ color: textColor }}>{selectedMockup.name}</strong></span>
            ) : (
              <span>Seleziona un mockup per visualizzare il tuo design</span>
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
                color: textSecondary,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Chiudi
            </button>
            <button
              onClick={handleDownload}
              disabled={!selectedMockup || !designImage || isDownloading}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: (!selectedMockup || !designImage) ? '#555' : accentColor,
                color: '#fff',
                fontSize: 12,
                fontWeight: 500,
                cursor: (!selectedMockup || !designImage) ? 'not-allowed' : 'pointer',
                opacity: (!selectedMockup || !designImage) ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {isDownloading ? (
                <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Download size={14} />
              )}
              Scarica Mockup
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
