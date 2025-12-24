/**
 * Unsplash Plugin
 *
 * Search and insert free stock photos from Unsplash
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useCanvasStore } from '../../../lib/canvas/canvasStore';
import { THEME_COLORS } from '../../../lib/canvas/types';
import * as LucideIcons from 'lucide-react';
import { PluginComponentProps } from './PluginPanel';

// Unsplash API (using demo access key - replace with your own for production)
const UNSPLASH_ACCESS_KEY = 'your-access-key'; // User should add their own

interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
    username: string;
  };
  width: number;
  height: number;
}

export const UnsplashPlugin: React.FC<PluginComponentProps> = ({ onClose, onInsert }) => {
  const [search, setSearch] = useState('');
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasApiKey, setHasApiKey] = useState(false);

  const canvasSettings = useCanvasStore((state) => state.canvasSettings);
  const theme = canvasSettings?.editorTheme || 'dark';
  const colors = THEME_COLORS[theme];
  const isDark = theme === 'dark';

  // Theme colors
  const panelBg = isDark ? '#1a1a1a' : '#ffffff';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)';
  const inputBg = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.04)';

  // Check if API key is configured
  useEffect(() => {
    setHasApiKey(UNSPLASH_ACCESS_KEY !== 'your-access-key' && UNSPLASH_ACCESS_KEY.length > 10);
  }, []);

  // Sample images for demo (when no API key)
  const sampleImages: UnsplashImage[] = [
    {
      id: '1',
      urls: { raw: '', full: '', regular: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', small: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200' },
      alt_description: 'Mountain landscape',
      user: { name: 'Unsplash', username: 'unsplash' },
      width: 1920,
      height: 1280,
    },
    {
      id: '2',
      urls: { raw: '', full: '', regular: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800', small: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400', thumb: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200' },
      alt_description: 'Nature forest',
      user: { name: 'Unsplash', username: 'unsplash' },
      width: 1920,
      height: 1280,
    },
    {
      id: '3',
      urls: { raw: '', full: '', regular: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800', small: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400', thumb: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=200' },
      alt_description: 'Abstract art',
      user: { name: 'Unsplash', username: 'unsplash' },
      width: 1920,
      height: 1080,
    },
    {
      id: '4',
      urls: { raw: '', full: '', regular: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', small: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400', thumb: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=200' },
      alt_description: 'Travel landscape',
      user: { name: 'Unsplash', username: 'unsplash' },
      width: 1920,
      height: 1280,
    },
    {
      id: '5',
      urls: { raw: '', full: '', regular: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800', small: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400', thumb: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200' },
      alt_description: 'Foggy mountains',
      user: { name: 'Unsplash', username: 'unsplash' },
      width: 1920,
      height: 1200,
    },
    {
      id: '6',
      urls: { raw: '', full: '', regular: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', small: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
      alt_description: 'Portrait',
      user: { name: 'Unsplash', username: 'unsplash' },
      width: 1080,
      height: 1350,
    },
    {
      id: '7',
      urls: { raw: '', full: '', regular: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800', small: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400', thumb: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200' },
      alt_description: 'Night sky mountains',
      user: { name: 'Unsplash', username: 'unsplash' },
      width: 1920,
      height: 1280,
    },
    {
      id: '8',
      urls: { raw: '', full: '', regular: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', small: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400', thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200' },
      alt_description: 'Mountain peak',
      user: { name: 'Unsplash', username: 'unsplash' },
      width: 1920,
      height: 1280,
    },
  ];

  // Load sample images on mount
  useEffect(() => {
    if (!hasApiKey) {
      setImages(sampleImages);
    }
  }, [hasApiKey]);

  // Search Unsplash API
  const searchImages = useCallback(async (query: string, pageNum: number = 1) => {
    if (!hasApiKey) {
      // Filter sample images by query
      if (query) {
        const filtered = sampleImages.filter(img =>
          img.alt_description?.toLowerCase().includes(query.toLowerCase())
        );
        setImages(filtered.length > 0 ? filtered : sampleImages);
      } else {
        setImages(sampleImages);
      }
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${pageNum}&per_page=20`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );
      const data = await response.json();
      if (pageNum === 1) {
        setImages(data.results);
      } else {
        setImages(prev => [...prev, ...data.results]);
      }
    } catch (error) {
      console.error('Unsplash API error:', error);
    }
    setLoading(false);
  }, [hasApiKey]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    searchImages(search, 1);
  };

  // Handle image selection
  const handleSelectImage = (image: UnsplashImage) => {
    if (onInsert) {
      onInsert({
        type: 'image',
        src: image.urls.regular,
        alt: image.alt_description || 'Unsplash image',
        width: Math.min(image.width, 800),
        height: Math.min(image.height, 600),
        credit: `Photo by ${image.user.name} on Unsplash`,
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
          width: 700,
          maxWidth: 'calc(100vw - 48px)',
          height: 'min(700px, calc(100vh - 48px))',
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
              background: '#111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <LucideIcons.Image size={16} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>Unsplash</div>
              <div style={{ fontSize: 11, color: colors.textDimmed }}>Foto stock gratuite</div>
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
        <form onSubmit={handleSearch} style={{ padding: '12px 20px', borderBottom: `1px solid ${borderColor}` }}>
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
              placeholder="Cerca immagini..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: colors.textPrimary,
                fontSize: 13,
              }}
            />
            {loading && <LucideIcons.Loader2 size={16} color={colors.textDimmed} className="animate-spin" />}
          </div>
        </form>

        {/* Images Grid */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
        }}>
          {!hasApiKey && (
            <div style={{
              padding: '8px 12px',
              marginBottom: 16,
              background: isDark ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.15)',
              borderRadius: 8,
              fontSize: 11,
              color: isDark ? '#ffc107' : '#856404',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <LucideIcons.Info size={14} />
              Demo mode - Aggiungi la tua API key Unsplash per la ricerca completa
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 12,
          }}>
            {images.map((image) => (
              <button
                key={image.id}
                onClick={() => handleSelectImage(image)}
                style={{
                  aspectRatio: '4/3',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                }}
              >
                <img
                  src={image.urls.small}
                  alt={image.alt_description || 'Unsplash image'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  loading="lazy"
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: 8,
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                >
                  <span style={{ fontSize: 10, color: '#fff' }}>
                    {image.user.name}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {images.length === 0 && !loading && (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: colors.textDimmed,
            }}>
              <LucideIcons.ImageOff size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
              <div>Nessuna immagine trovata</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 11, color: colors.textDimmed }}>
            Powered by Unsplash
          </span>
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 11,
              color: colors.accent,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            Apri Unsplash <LucideIcons.ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UnsplashPlugin;
