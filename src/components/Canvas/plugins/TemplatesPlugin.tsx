/**
 * Templates Library Plugin
 *
 * Ready-to-use design templates for various use cases
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useCanvasStore } from '../../../lib/canvas/canvasStore';
import { THEME_COLORS, CanvasElement } from '../../../lib/canvas/types';
import * as LucideIcons from 'lucide-react';
import { PluginComponentProps } from './PluginPanel';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  width: number;
  height: number;
  elements: Partial<CanvasElement>[];
}

// Template categories
const categories = [
  { id: 'all', name: 'Tutti', icon: LucideIcons.Grid3X3 },
  { id: 'social', name: 'Social Media', icon: LucideIcons.Share2 },
  { id: 'business', name: 'Business', icon: LucideIcons.Briefcase },
  { id: 'marketing', name: 'Marketing', icon: LucideIcons.Megaphone },
  { id: 'presentation', name: 'Presentazioni', icon: LucideIcons.Presentation },
  { id: 'print', name: 'Stampa', icon: LucideIcons.Printer },
];

// Template library
const templates: Template[] = [
  // Social Media
  {
    id: 'instagram-post',
    name: 'Instagram Post',
    category: 'social',
    description: 'Post quadrato 1080x1080',
    thumbnail: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    width: 1080,
    height: 1080,
    elements: [
      {
        type: 'frame',
        name: 'Background',
        styles: {
          width: 1080,
          height: 1080,
          backgroundColor: '#f5576c',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        },
      },
      {
        type: 'text',
        name: 'Title',
        content: 'Il tuo titolo qui',
        styles: {
          position: 'absolute',
          top: 400,
          left: 100,
          width: 880,
          fontSize: 72,
          fontWeight: 700,
          color: '#ffffff',
          textAlign: 'center',
        },
      },
      {
        type: 'text',
        name: 'Subtitle',
        content: 'Sottotitolo o descrizione',
        styles: {
          position: 'absolute',
          top: 520,
          left: 100,
          width: 880,
          fontSize: 32,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.8)',
          textAlign: 'center',
        },
      },
    ],
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    category: 'social',
    description: 'Story verticale 1080x1920',
    thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    width: 1080,
    height: 1920,
    elements: [
      {
        type: 'frame',
        name: 'Background',
        styles: {
          width: 1080,
          height: 1920,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      },
      {
        type: 'text',
        name: 'Swipe Up',
        content: 'SWIPE UP',
        styles: {
          position: 'absolute',
          bottom: 200,
          left: 0,
          width: 1080,
          fontSize: 24,
          fontWeight: 600,
          color: '#ffffff',
          textAlign: 'center',
          letterSpacing: 4,
        },
      },
    ],
  },
  {
    id: 'facebook-post',
    name: 'Facebook Post',
    category: 'social',
    description: 'Post orizzontale 1200x630',
    thumbnail: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    width: 1200,
    height: 630,
    elements: [
      {
        type: 'frame',
        name: 'Background',
        styles: {
          width: 1200,
          height: 630,
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        },
      },
      {
        type: 'text',
        name: 'Headline',
        content: 'Headline Accattivante',
        styles: {
          position: 'absolute',
          top: 220,
          left: 80,
          width: 1040,
          fontSize: 56,
          fontWeight: 700,
          color: '#ffffff',
        },
      },
      {
        type: 'text',
        name: 'CTA',
        content: 'Scopri di più →',
        styles: {
          position: 'absolute',
          top: 340,
          left: 80,
          fontSize: 28,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.9)',
        },
      },
    ],
  },
  {
    id: 'linkedin-banner',
    name: 'LinkedIn Banner',
    category: 'social',
    description: 'Banner profilo 1584x396',
    thumbnail: 'linear-gradient(135deg, #0077B5 0%, #00A0DC 100%)',
    width: 1584,
    height: 396,
    elements: [
      {
        type: 'frame',
        name: 'Background',
        styles: {
          width: 1584,
          height: 396,
          background: 'linear-gradient(135deg, #0077B5 0%, #00A0DC 100%)',
        },
      },
      {
        type: 'text',
        name: 'Name',
        content: 'Il Tuo Nome',
        styles: {
          position: 'absolute',
          top: 120,
          left: 80,
          fontSize: 48,
          fontWeight: 700,
          color: '#ffffff',
        },
      },
      {
        type: 'text',
        name: 'Title',
        content: 'La tua professione | Competenze',
        styles: {
          position: 'absolute',
          top: 190,
          left: 80,
          fontSize: 24,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.85)',
        },
      },
    ],
  },
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    category: 'social',
    description: 'Miniatura 1280x720',
    thumbnail: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
    width: 1280,
    height: 720,
    elements: [
      {
        type: 'frame',
        name: 'Background',
        styles: {
          width: 1280,
          height: 720,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        },
      },
      {
        type: 'text',
        name: 'Title',
        content: 'TITOLO VIDEO',
        styles: {
          position: 'absolute',
          top: 250,
          left: 60,
          width: 800,
          fontSize: 72,
          fontWeight: 900,
          color: '#ffffff',
          textTransform: 'uppercase',
        },
      },
      {
        type: 'frame',
        name: 'Badge',
        styles: {
          position: 'absolute',
          top: 40,
          right: 40,
          width: 120,
          height: 50,
          backgroundColor: '#ff0000',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
    ],
  },

  // Business
  {
    id: 'business-card',
    name: 'Biglietto da Visita',
    category: 'business',
    description: '90x55mm standard',
    thumbnail: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
    width: 1063,
    height: 649,
    elements: [
      {
        type: 'frame',
        name: 'Background',
        styles: {
          width: 1063,
          height: 649,
          backgroundColor: '#1a1a1a',
        },
      },
      {
        type: 'text',
        name: 'Name',
        content: 'Mario Rossi',
        styles: {
          position: 'absolute',
          top: 200,
          left: 80,
          fontSize: 42,
          fontWeight: 700,
          color: '#ffffff',
        },
      },
      {
        type: 'text',
        name: 'Title',
        content: 'CEO & Founder',
        styles: {
          position: 'absolute',
          top: 260,
          left: 80,
          fontSize: 20,
          fontWeight: 400,
          color: '#A83248',
          textTransform: 'uppercase',
          letterSpacing: 2,
        },
      },
      {
        type: 'text',
        name: 'Contact',
        content: 'mario@azienda.com\n+39 123 456 7890',
        styles: {
          position: 'absolute',
          top: 380,
          left: 80,
          fontSize: 16,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.8,
        },
      },
    ],
  },
  {
    id: 'letterhead',
    name: 'Carta Intestata',
    category: 'business',
    description: 'A4 professionale',
    thumbnail: 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)',
    width: 2480,
    height: 3508,
    elements: [
      {
        type: 'frame',
        name: 'Background',
        styles: {
          width: 2480,
          height: 3508,
          backgroundColor: '#ffffff',
        },
      },
      {
        type: 'frame',
        name: 'Header Line',
        styles: {
          position: 'absolute',
          top: 0,
          left: 0,
          width: 2480,
          height: 20,
          backgroundColor: '#A83248',
        },
      },
      {
        type: 'text',
        name: 'Company',
        content: 'NOME AZIENDA',
        styles: {
          position: 'absolute',
          top: 150,
          left: 200,
          fontSize: 48,
          fontWeight: 700,
          color: '#1a1a1a',
          letterSpacing: 4,
        },
      },
    ],
  },

  // Marketing
  {
    id: 'sale-banner',
    name: 'Banner Saldi',
    category: 'marketing',
    description: 'Promozione accattivante',
    thumbnail: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
    width: 1200,
    height: 600,
    elements: [
      {
        type: 'frame',
        name: 'Background',
        styles: {
          width: 1200,
          height: 600,
          background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
        },
      },
      {
        type: 'text',
        name: 'Discount',
        content: '-50%',
        styles: {
          position: 'absolute',
          top: 120,
          left: 80,
          fontSize: 180,
          fontWeight: 900,
          color: '#ffffff',
        },
      },
      {
        type: 'text',
        name: 'Sale Text',
        content: 'SALDI ESTIVI',
        styles: {
          position: 'absolute',
          top: 350,
          left: 80,
          fontSize: 48,
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: 8,
        },
      },
      {
        type: 'text',
        name: 'CTA',
        content: 'ACQUISTA ORA',
        styles: {
          position: 'absolute',
          top: 450,
          left: 80,
          padding: '16px 32px',
          fontSize: 20,
          fontWeight: 600,
          color: '#ff416c',
          backgroundColor: '#ffffff',
          borderRadius: 8,
        },
      },
    ],
  },
  {
    id: 'product-showcase',
    name: 'Showcase Prodotto',
    category: 'marketing',
    description: 'Presentazione prodotto',
    thumbnail: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    width: 1200,
    height: 800,
    elements: [
      {
        type: 'frame',
        name: 'Background',
        styles: {
          width: 1200,
          height: 800,
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        },
      },
      {
        type: 'frame',
        name: 'Product Box',
        styles: {
          position: 'absolute',
          top: 150,
          right: 100,
          width: 400,
          height: 500,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 20,
          border: '2px solid rgba(255,255,255,0.2)',
        },
      },
      {
        type: 'text',
        name: 'Product Name',
        content: 'Nome Prodotto',
        styles: {
          position: 'absolute',
          top: 200,
          left: 80,
          fontSize: 56,
          fontWeight: 700,
          color: '#ffffff',
        },
      },
      {
        type: 'text',
        name: 'Price',
        content: '€99.00',
        styles: {
          position: 'absolute',
          top: 300,
          left: 80,
          fontSize: 42,
          fontWeight: 600,
          color: '#ffffff',
        },
      },
    ],
  },

  // Presentation
  {
    id: 'slide-title',
    name: 'Slide Titolo',
    category: 'presentation',
    description: 'Prima slide presentazione',
    thumbnail: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
    width: 1920,
    height: 1080,
    elements: [
      {
        type: 'frame',
        name: 'Background',
        styles: {
          width: 1920,
          height: 1080,
          background: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
        },
      },
      {
        type: 'text',
        name: 'Title',
        content: 'Titolo Presentazione',
        styles: {
          position: 'absolute',
          top: 380,
          left: 0,
          width: 1920,
          fontSize: 96,
          fontWeight: 700,
          color: '#ffffff',
          textAlign: 'center',
        },
      },
      {
        type: 'text',
        name: 'Subtitle',
        content: 'Sottotitolo o nome relatore',
        styles: {
          position: 'absolute',
          top: 520,
          left: 0,
          width: 1920,
          fontSize: 36,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.8)',
          textAlign: 'center',
        },
      },
    ],
  },
  {
    id: 'slide-content',
    name: 'Slide Contenuto',
    category: 'presentation',
    description: 'Slide con bullet points',
    thumbnail: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    width: 1920,
    height: 1080,
    elements: [
      {
        type: 'frame',
        name: 'Background',
        styles: {
          width: 1920,
          height: 1080,
          backgroundColor: '#1a1a2e',
        },
      },
      {
        type: 'text',
        name: 'Slide Title',
        content: 'Titolo Sezione',
        styles: {
          position: 'absolute',
          top: 100,
          left: 120,
          fontSize: 56,
          fontWeight: 700,
          color: '#ffffff',
        },
      },
      {
        type: 'text',
        name: 'Bullet Points',
        content: '• Primo punto importante\n• Secondo punto da sviluppare\n• Terzo punto conclusivo',
        styles: {
          position: 'absolute',
          top: 280,
          left: 120,
          width: 1680,
          fontSize: 36,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.9)',
          lineHeight: 2,
        },
      },
    ],
  },

  // Print
  {
    id: 'poster-a3',
    name: 'Poster A3',
    category: 'print',
    description: 'Poster 297x420mm',
    thumbnail: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    width: 3508,
    height: 4961,
    elements: [
      {
        type: 'frame',
        name: 'Background',
        styles: {
          width: 3508,
          height: 4961,
          background: 'linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        },
      },
      {
        type: 'text',
        name: 'Event Title',
        content: 'NOME EVENTO',
        styles: {
          position: 'absolute',
          top: 1800,
          left: 0,
          width: 3508,
          fontSize: 280,
          fontWeight: 900,
          color: '#ffffff',
          textAlign: 'center',
          letterSpacing: 20,
        },
      },
      {
        type: 'text',
        name: 'Date',
        content: '24 DICEMBRE 2024',
        styles: {
          position: 'absolute',
          top: 2200,
          left: 0,
          width: 3508,
          fontSize: 72,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.8)',
          textAlign: 'center',
          letterSpacing: 10,
        },
      },
    ],
  },
  {
    id: 'flyer',
    name: 'Volantino A5',
    category: 'print',
    description: 'Flyer 148x210mm',
    thumbnail: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
    width: 1748,
    height: 2480,
    elements: [
      {
        type: 'frame',
        name: 'Background',
        styles: {
          width: 1748,
          height: 2480,
          background: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
        },
      },
      {
        type: 'text',
        name: 'Headline',
        content: 'OFFERTA\nSPECIALE',
        styles: {
          position: 'absolute',
          top: 600,
          left: 0,
          width: 1748,
          fontSize: 160,
          fontWeight: 900,
          color: '#ffffff',
          textAlign: 'center',
          lineHeight: 1.1,
        },
      },
      {
        type: 'text',
        name: 'Details',
        content: 'Valido fino al 31/12',
        styles: {
          position: 'absolute',
          bottom: 400,
          left: 0,
          width: 1748,
          fontSize: 48,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.9)',
          textAlign: 'center',
        },
      },
    ],
  },
];

export const TemplatesPlugin: React.FC<PluginComponentProps> = ({ onClose, onInsert }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const canvasSettings = useCanvasStore((state) => state.canvasSettings);
  const addElement = useCanvasStore((state) => state.addElement);
  const setCanvasSize = useCanvasStore((state) => state.setCanvasSize);
  const pages = useCanvasStore((state) => state.pages);
  const currentPageId = useCanvasStore((state) => state.currentPageId);

  const theme = canvasSettings?.editorTheme || 'dark';
  const colors = THEME_COLORS[theme];
  const isDark = theme === 'dark';

  const panelBg = isDark ? '#1a1a1a' : '#ffffff';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)';
  const inputBg = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.04)';
  const hoverBg = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)';

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Apply template
  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;

    // Update canvas size
    if (setCanvasSize) {
      setCanvasSize(selectedTemplate.width, selectedTemplate.height);
    }

    // Get current page root
    const currentPage = pages[currentPageId];
    if (!currentPage) return;

    // Add elements from template
    selectedTemplate.elements.forEach((elementData, index) => {
      const newElement: Partial<CanvasElement> = {
        ...elementData,
        name: elementData.name || `Element ${index + 1}`,
        styles: {
          ...elementData.styles,
        },
      };

      addElement(newElement as CanvasElement, currentPage.rootElementId);
    });

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
          width: 900,
          maxWidth: 'calc(100vw - 48px)',
          height: 700,
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
              background: 'linear-gradient(135deg, #A83248 0%, #8B1E2B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <LucideIcons.Layout size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>Templates</div>
              <div style={{ fontSize: 11, color: colors.textDimmed }}>Design pronti all'uso</div>
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
        <div style={{
          padding: '12px 20px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}>
          {/* Search */}
          <div style={{ position: 'relative', width: 200 }}>
            <LucideIcons.Search
              size={14}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.textDimmed,
              }}
            />
            <input
              type="text"
              placeholder="Cerca template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px 8px 32px',
                borderRadius: 6,
                border: `1px solid ${borderColor}`,
                background: inputBg,
                color: colors.textPrimary,
                fontSize: 12,
                outline: 'none',
              }}
            />
          </div>

          {/* Categories */}
          <div style={{ display: 'flex', gap: 4, flex: 1, overflow: 'auto' }}>
            {categories.map((cat) => (
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
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Template Grid */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}>
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  style={{
                    padding: 0,
                    borderRadius: 10,
                    border: selectedTemplate?.id === template.id
                      ? `2px solid ${colors.accent}`
                      : `1px solid ${borderColor}`,
                    background: hoverBg,
                    cursor: 'pointer',
                    overflow: 'hidden',
                    textAlign: 'left',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      aspectRatio: `${template.width}/${template.height}`,
                      maxHeight: 140,
                      background: template.thumbnail,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.3)',
                    }}>
                      {template.width}x{template.height}
                    </span>
                  </div>
                  {/* Info */}
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: colors.textPrimary,
                      marginBottom: 2,
                    }}>
                      {template.name}
                    </div>
                    <div style={{
                      fontSize: 10,
                      color: colors.textDimmed,
                    }}>
                      {template.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: 40,
                color: colors.textDimmed,
              }}>
                <LucideIcons.SearchX size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
                <div style={{ fontSize: 13 }}>Nessun template trovato</div>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {selectedTemplate && (
            <div style={{
              width: 280,
              borderLeft: `1px solid ${borderColor}`,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              {/* Preview */}
              <div
                style={{
                  aspectRatio: `${selectedTemplate.width}/${selectedTemplate.height}`,
                  maxHeight: 200,
                  background: selectedTemplate.thumbnail,
                  borderRadius: 8,
                  border: `1px solid ${borderColor}`,
                }}
              />

              {/* Details */}
              <div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: colors.textPrimary,
                  marginBottom: 4,
                }}>
                  {selectedTemplate.name}
                </div>
                <div style={{
                  fontSize: 12,
                  color: colors.textMuted,
                  marginBottom: 12,
                }}>
                  {selectedTemplate.description}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                }}>
                  <div style={{
                    padding: '8px 10px',
                    background: inputBg,
                    borderRadius: 6,
                  }}>
                    <div style={{ fontSize: 10, color: colors.textDimmed }}>Larghezza</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
                      {selectedTemplate.width}px
                    </div>
                  </div>
                  <div style={{
                    padding: '8px 10px',
                    background: inputBg,
                    borderRadius: 6,
                  }}>
                    <div style={{ fontSize: 10, color: colors.textDimmed }}>Altezza</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
                      {selectedTemplate.height}px
                    </div>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={handleApplyTemplate}
                style={{
                  marginTop: 'auto',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: colors.accent,
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <LucideIcons.Check size={16} />
                Usa Template
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TemplatesPlugin;
