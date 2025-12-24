/**
 * AI Image Generation Plugin
 * Integrated into sidebar layout like PropertiesPanel
 */

import React, { useState, useCallback } from 'react';
import { Loader2, Sparkles, ChevronDown, Image, Box, Zap, Star, Clock } from 'lucide-react';
import { PluginComponentProps } from './PluginPanel';
import { useCanvasStore } from '../../../lib/canvas/canvasStore';
import { THEME_COLORS } from '../../../lib/canvas/types';

const AI_IMAGE_API = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-image`
  : 'https://tyskftlhwdstsjvddfld.supabase.co/functions/v1/ai-image';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

interface Generated3D {
  id: string;
  modelUrl: string;
  sourceImage: string;
}

// Models
const MODELS = [
  { id: 'flux-schnell', name: 'Flux Schnell', desc: 'Fast, good quality', icon: Zap, time: 4, quality: 3 },
  { id: 'flux', name: 'Flux 1.1 Pro', desc: 'Best quality', icon: Star, time: 15, quality: 5 },
  { id: 'sdxl', name: 'Stable Diffusion XL', desc: 'High quality, versatile', icon: Image, time: 20, quality: 4 },
  { id: 'sd3.5', name: 'Stable Diffusion 3.5', desc: 'Latest SD model', icon: Sparkles, time: 25, quality: 4 },
];

// Style categories
const STYLE_CATEGORIES = {
  general: [
    { id: 'realistic', name: 'Photorealistic' },
    { id: 'illustration', name: 'Illustration' },
    { id: '3d', name: '3D Render' },
    { id: 'anime', name: 'Anime' },
    { id: 'watercolor', name: 'Watercolor' },
    { id: 'pixel', name: 'Pixel Art' },
  ],
  branding: [
    { id: 'logo', name: 'Logo' },
    { id: 'pattern', name: 'Pattern' },
  ],
  text3d: [
    { id: 'balloon', name: '3D Balloon' },
    { id: 'chrome', name: 'Chrome Metal' },
    { id: 'neon', name: 'Neon Glow' },
    { id: 'gold', name: 'Gold Luxury' },
  ],
};

const SIZES = [
  { id: '1:1', name: '1:1', w: 1024, h: 1024 },
  { id: '16:9', name: '16:9', w: 1024, h: 576 },
  { id: '9:16', name: '9:16', w: 576, h: 1024 },
  { id: '4:3', name: '4:3', w: 1024, h: 768 },
  { id: '3:4', name: '3:4', w: 768, h: 1024 },
];

// Section component matching PropertiesPanel style exactly
function Section({ title, children, defaultOpen = true }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const canvasSettings = useCanvasStore(state => state.canvasSettings);
  const theme = canvasSettings?.editorTheme || 'dark';
  const colors = THEME_COLORS[theme];

  return (
    <div style={{ borderBottom: `1px solid ${colors.borderColor}` }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          color: colors.textSecondary,
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          cursor: 'pointer',
        }}
      >
        <span>{title}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && <div style={{ padding: '0 12px 12px' }}>{children}</div>}
    </div>
  );
}

export const AIImagePlugin: React.FC<PluginComponentProps> = ({ onClose }) => {
  const addElement = useCanvasStore((state) => state.addElement);
  const pages = useCanvasStore((state) => state.pages);
  const currentPageId = useCanvasStore((state) => state.currentPageId);
  const canvasSettings = useCanvasStore((state) => state.canvasSettings);

  const theme = canvasSettings?.editorTheme || 'dark';
  const colors = THEME_COLORS[theme];
  const currentPage = pages[currentPageId];

  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('flux-schnell');
  const [style, setStyle] = useState('realistic');
  const [size, setSize] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showModels, setShowModels] = useState(false);
  const [tab, setTab] = useState<'image' | '3d'>('image');

  // 3D state
  const [imageUrl3D, setImageUrl3D] = useState('');
  const [selected3DImage, setSelected3DImage] = useState<string | null>(null);
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [models3D, setModels3D] = useState<Generated3D[]>([]);
  const [error3D, setError3D] = useState<string | null>(null);

  const selectedModel = MODELS.find(m => m.id === model) || MODELS[0];
  const selectedSize = SIZES.find(s => s.id === size) || SIZES[0];

  const generate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch(AI_IMAGE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style,
          width: selectedSize.w,
          height: selectedSize.h,
          model,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Error generating image');

      setImages(prev => [{ id: `${Date.now()}`, url: data.imageUrl, prompt }, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, style, selectedSize, model, isGenerating]);

  const generate3D = useCallback(async () => {
    const sourceUrl = selected3DImage || imageUrl3D.trim();
    if (!sourceUrl || isGenerating3D) return;

    setIsGenerating3D(true);
    setError3D(null);

    try {
      const res = await fetch(AI_IMAGE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: '3d', imageUrl: sourceUrl }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Error generating 3D');

      setModels3D(prev => [
        { id: `${Date.now()}`, modelUrl: data.modelUrl, sourceImage: sourceUrl },
        ...prev,
      ]);
    } catch (e) {
      setError3D(e instanceof Error ? e.message : 'Error');
    } finally {
      setIsGenerating3D(false);
    }
  }, [imageUrl3D, selected3DImage, isGenerating3D]);

  const addToCanvas = useCallback((img: GeneratedImage) => {
    if (!currentPage) return;
    const w = Math.min(selectedSize.w, currentPage.width * 0.6);
    const h = (w / selectedSize.w) * selectedSize.h;

    const elementId = addElement('image', currentPage.rootElementId, {
      x: (currentPage.width - w) / 2,
      y: (currentPage.height - h) / 2,
    });

    if (elementId) {
      useCanvasStore.setState((state) => ({
        elements: {
          ...state.elements,
          [elementId]: {
            ...state.elements[elementId],
            src: img.url,
            size: { width: w, height: h },
          },
        },
      }));
    }
    onClose();
  }, [addElement, currentPage, selectedSize, onClose]);

  // Button style helper
  const buttonStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 10px',
    fontSize: 11,
    fontWeight: 500,
    color: active ? colors.textPrimary : colors.textMuted,
    background: active ? colors.accentLight : colors.inputBg,
    border: `1px solid ${active ? colors.accent : colors.borderColor}`,
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Tabs - matching PropertiesPanel section header style */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${colors.borderColor}` }}>
        {[
          { id: 'image', label: 'Image', icon: Image },
          { id: '3d', label: '3D', icon: Box },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as 'image' | '3d')}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: tab === t.id ? colors.textPrimary : colors.textMuted,
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${tab === t.id ? colors.accent : 'transparent'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <t.icon size={12} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'image' ? (
          <>
            {/* Prompt */}
            <div style={{ padding: 12, borderBottom: `1px solid ${colors.borderColor}` }}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to create..."
                style={{
                  width: '100%',
                  height: 70,
                  padding: 10,
                  fontSize: 12,
                  backgroundColor: colors.inputBg,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: 6,
                  color: colors.textPrimary,
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
                onBlur={(e) => { e.target.style.borderColor = colors.borderColor; }}
              />
            </div>

            {/* Model Selection */}
            <Section title="Model">
              <button
                onClick={() => setShowModels(!showModels)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: colors.inputBg,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <selectedModel.icon size={16} color={colors.accent} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: colors.textPrimary }}>{selectedModel.name}</div>
                    <div style={{ fontSize: 10, color: colors.textMuted }}>{selectedModel.desc}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={10} color={colors.textMuted} />
                  <span style={{ fontSize: 10, color: colors.textMuted }}>~{selectedModel.time}s</span>
                  <ChevronDown size={12} color={colors.textMuted} style={{ transform: showModels ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                </div>
              </button>

              {showModels && (
                <div style={{ marginTop: 4, background: colors.panelBg, border: `1px solid ${colors.borderColor}`, borderRadius: 6, overflow: 'hidden' }}>
                  {MODELS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setModel(m.id); setShowModels(false); }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: model === m.id ? colors.accentLight : 'transparent',
                        border: 'none',
                        borderBottom: `1px solid ${colors.borderColor}`,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <m.icon size={14} color={model === m.id ? colors.accent : colors.textMuted} />
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: 11, fontWeight: 500, color: colors.textPrimary }}>{m.name}</div>
                          <div style={{ fontSize: 10, color: colors.textMuted }}>{m.desc}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 10, color: colors.textMuted }}>~{m.time}s</span>
                    </button>
                  ))}
                </div>
              )}
            </Section>

            {/* Style */}
            <Section title="Style">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 2 }}>General</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {STYLE_CATEGORIES.general.map(s => (
                    <button key={s.id} onClick={() => setStyle(s.id)} style={buttonStyle(style === s.id)}>
                      {s.name}
                    </button>
                  ))}
                </div>

                <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 6, marginBottom: 2 }}>Branding</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {STYLE_CATEGORIES.branding.map(s => (
                    <button key={s.id} onClick={() => setStyle(s.id)} style={buttonStyle(style === s.id)}>
                      {s.name}
                    </button>
                  ))}
                </div>

                <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 6, marginBottom: 2 }}>3D Text</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {STYLE_CATEGORIES.text3d.map(s => (
                    <button key={s.id} onClick={() => setStyle(s.id)} style={buttonStyle(style === s.id)}>
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </Section>

            {/* Size */}
            <Section title="Size">
              <div style={{ display: 'flex', gap: 4 }}>
                {SIZES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSize(s.id)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      fontSize: 10,
                      fontWeight: 500,
                      color: size === s.id ? colors.textPrimary : colors.textMuted,
                      background: size === s.id ? colors.accentLight : colors.inputBg,
                      border: `1px solid ${size === s.id ? colors.accent : colors.borderColor}`,
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </Section>

            {/* Error */}
            {error && (
              <div style={{ margin: '0 12px 12px', padding: 10, fontSize: 11, color: '#ef4444', background: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>
                {error}
              </div>
            )}

            {/* Generate Button */}
            <div style={{ padding: '12px' }}>
              <button
                onClick={generate}
                disabled={!prompt.trim() || isGenerating}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#fff',
                  background: !prompt.trim() || isGenerating ? colors.textMuted : colors.accent,
                  border: 'none',
                  borderRadius: 6,
                  cursor: !prompt.trim() || isGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.15s',
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Generate
                  </>
                )}
              </button>
            </div>

            {/* Results */}
            {images.length > 0 && (
              <Section title={`Results (${images.length})`}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                  {images.map(img => (
                    <div
                      key={img.id}
                      onClick={() => addToCanvas(img)}
                      style={{
                        borderRadius: 6,
                        overflow: 'hidden',
                        border: `1px solid ${colors.borderColor}`,
                        cursor: 'pointer',
                        aspectRatio: '1',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.accent; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.borderColor; }}
                    >
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </>
        ) : (
          /* 3D Tab */
          <>
            <div style={{ padding: 12 }}>
              <div style={{ padding: 10, background: colors.accentLight, borderRadius: 6, border: `1px solid ${colors.accent}30` }}>
                <div style={{ fontSize: 11, color: colors.textPrimary, fontWeight: 500 }}>Image to 3D with TripoSR</div>
                <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>
                  Convert an image to a 3D GLB model. Use a generated image or paste a URL.
                </div>
              </div>
            </div>

            {images.length > 0 && (
              <Section title="Use Generated Image">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                  {images.slice(0, 8).map(img => (
                    <div
                      key={img.id}
                      onClick={() => {
                        setSelected3DImage(selected3DImage === img.url ? null : img.url);
                        if (selected3DImage !== img.url) setImageUrl3D('');
                      }}
                      style={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: `2px solid ${selected3DImage === img.url ? colors.accent : colors.borderColor}`,
                        cursor: 'pointer',
                        aspectRatio: '1',
                        opacity: selected3DImage && selected3DImage !== img.url ? 0.5 : 1,
                      }}
                    >
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Or Paste URL">
              <input
                type="text"
                value={imageUrl3D}
                onChange={(e) => {
                  setImageUrl3D(e.target.value);
                  if (e.target.value) setSelected3DImage(null);
                }}
                placeholder="https://example.com/image.png"
                style={{
                  width: '100%',
                  padding: 10,
                  fontSize: 11,
                  backgroundColor: colors.inputBg,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: 6,
                  color: colors.textPrimary,
                  outline: 'none',
                }}
              />
            </Section>

            {error3D && (
              <div style={{ margin: '0 12px 12px', padding: 10, fontSize: 11, color: '#ef4444', background: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>
                {error3D}
              </div>
            )}

            <div style={{ padding: '12px' }}>
              <button
                onClick={generate3D}
                disabled={(!imageUrl3D.trim() && !selected3DImage) || isGenerating3D}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#fff',
                  background: (!imageUrl3D.trim() && !selected3DImage) || isGenerating3D ? colors.textMuted : colors.accent,
                  border: 'none',
                  borderRadius: 6,
                  cursor: (!imageUrl3D.trim() && !selected3DImage) || isGenerating3D ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {isGenerating3D ? (
                  <>
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    Generating 3D... (~30s)
                  </>
                ) : (
                  <>
                    <Box size={14} />
                    Generate 3D
                  </>
                )}
              </button>
            </div>

            {models3D.length > 0 && (
              <Section title="3D Models">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {models3D.map(m => (
                    <div key={m.id} style={{ padding: 10, background: colors.inputBg, borderRadius: 6, border: `1px solid ${colors.borderColor}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <img src={m.sourceImage} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4 }} />
                        <div>
                          <div style={{ fontSize: 11, color: colors.textPrimary, fontWeight: 500 }}>3D Model</div>
                          <div style={{ fontSize: 10, color: colors.textMuted }}>GLB format</div>
                        </div>
                      </div>
                      <a
                        href={m.modelUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'block',
                          padding: '8px',
                          fontSize: 11,
                          fontWeight: 500,
                          color: colors.accent,
                          background: colors.accentLight,
                          border: `1px solid ${colors.accent}30`,
                          borderRadius: 4,
                          textAlign: 'center',
                          textDecoration: 'none',
                        }}
                      >
                        Download GLB
                      </a>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
