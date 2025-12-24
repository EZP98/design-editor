/**
 * Mockups Plugin
 *
 * Preview designs on realistic mockup templates
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, ShoppingBag, Monitor, Smartphone, BookOpen,
  Package, Coffee, Shirt, Image as ImageIcon, Download, Eye
} from 'lucide-react';
import { PluginComponentProps } from './PluginPanel';
import { useCanvasStore } from '../../../lib/canvas/canvasStore';

interface MockupCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number }>;
}

interface MockupTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
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
  { id: 'tshirt-white', name: 'T-Shirt Bianca', category: 'apparel', thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop' },
  { id: 'tshirt-black', name: 'T-Shirt Nera', category: 'apparel', thumbnail: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=300&h=300&fit=crop' },
  { id: 'hoodie', name: 'Felpa', category: 'apparel', thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=300&h=300&fit=crop' },
  { id: 'poster', name: 'Poster', category: 'print', thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&h=300&fit=crop' },
  { id: 'business-card', name: 'Biglietto Visita', category: 'print', thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=300&fit=crop' },
  { id: 'book', name: 'Libro', category: 'print', thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop' },
  { id: 'box', name: 'Scatola', category: 'packaging', thumbnail: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=300&h=300&fit=crop' },
  { id: 'bag', name: 'Sacchetto', category: 'packaging', thumbnail: 'https://images.unsplash.com/photo-1575844264771-892081089af5?w=300&h=300&fit=crop' },
  { id: 'macbook', name: 'MacBook', category: 'devices', thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop' },
  { id: 'iphone', name: 'iPhone', category: 'devices', thumbnail: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=300&fit=crop' },
  { id: 'mug', name: 'Tazza', category: 'accessories', thumbnail: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=300&h=300&fit=crop' },
  { id: 'notebook', name: 'Notebook', category: 'accessories', thumbnail: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&h=300&fit=crop' },
];

export const MockupsPlugin: React.FC<PluginComponentProps> = ({ onClose }) => {
  const canvasSettings = useCanvasStore((state) => state.canvasSettings);
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

  const filteredMockups = selectedCategory === 'all'
    ? MOCKUP_TEMPLATES
    : MOCKUP_TEMPLATES.filter(m => m.category === selectedCategory);

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

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
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
                  transition: 'transform 0.2s',
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
                  />
                </div>
                <div style={{
                  padding: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: textColor,
                  }}>
                    {mockup.name}
                  </span>
                  <Eye size={14} style={{ color: textSecondary }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: `1px solid ${borderColor}`,
          backgroundColor: isDark ? '#141414' : '#f5f5f5',
          fontSize: 12,
          color: textSecondary,
          textAlign: 'center',
        }}>
          Seleziona un mockup per visualizzare il tuo design. Funzionalità completa in arrivo.
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
