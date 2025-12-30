/**
 * AI Studio Plugin
 * Complete AI Image Generation, Editing, and 3D Generation
 * Supports: Ideogram, Flux, Tripo3D
 */

import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import {
  Loader2, Sparkles, ChevronDown, Image, Box, Zap, Star, Clock,
  Wand2, Eraser, Expand, ScissorsIcon, ZoomIn, Shuffle, ImagePlus,
  Brush, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Layers,
  Download, RotateCcw, Settings, Palette, Grid3X3, Play, Type,
  Upload, X, Crosshair, Move3D, Bone, Eye, Pencil, User, Puzzle,
  Sun, Contrast, Droplets, Thermometer, CircleDot, Focus, SlidersHorizontal,
  Triangle, Hexagon, Info, CreditCard, RefreshCw,
  LucideIcon
} from 'lucide-react';
import '@google/model-viewer';
import { PluginComponentProps } from './PluginPanel';
import { useCanvasStore } from '../../../lib/canvas/canvasStore';
import { THEME_COLORS } from '../../../lib/canvas/types';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { useAuth } from '../../../lib/hooks/useAuth';

// API Endpoint
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dyivbglwaazrddmihnod.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5aXZiZ2x3YWF6cmRkbWlobm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5OTc0MDMsImV4cCI6MjA1MTU3MzQwM30.uJQ5J6nsYP7Y5O8SAFGdEWIayhdSuHy1fguuCor3aI4';

const AI_STUDIO_API = `${SUPABASE_URL}/functions/v1/ai-studio`;
const AI_IMAGE_API = `${SUPABASE_URL}/functions/v1/ai-image`;

// ============================================================================
// TYPES
// ============================================================================

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  operation: string;
}

interface Generated3D {
  id: string;
  modelUrl: string;
  sourceImage?: string;
  taskId: string;
  operation: string;
  // Topology info
  faces?: number;
  vertices?: number;
  topology?: 'triangle' | 'quad';
}

type MainTab = 'generate' | 'edit' | 'adjust' | '3d';
type EditOperation = 'inpaint' | 'outpaint' | 'remove-bg' | 'upscale' | 'remix' | 'replace-bg' | 'remove-object' | 'enhance-face' | 'auto-enhance' | 'flux-kontext' | 'nano-banana' | 'gpt4o-edit';
type AdjustOperation = 'brightness' | 'contrast' | 'saturation' | 'hue' | 'blur' | 'sharpen' | 'temperature' | 'vignette';
type Operation3D = 'image-to-3d' | 'text-to-3d' | 'multi-view' | 'refine-3d' | 'retopology' | 'texture-3d' | 'stylize-3d' | 'segment-3d' | 'rig-3d' | 'sketch-to-render';
type MeshResolution = 'standard' | 'ultra';
type GenerationMode = 'one-click' | 'build-refine';
type AIModel = 'ideogram' | 'ideogram-turbo' | 'flux' | 'flux-schnell' | 'flux-kontext' | 'nano-banana' | 'gpt4o';

// 3D Generation Progress
interface GenerationProgress {
  status: 'queued' | 'running' | 'success' | 'failed';
  progress: number; // 0-100
  message?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MODELS = [
  { id: 'ideogram', name: 'Ideogram v2', desc: 'Miglior testo', icon: Type, time: 8, quality: 5 },
  { id: 'ideogram-turbo', name: 'Ideogram Turbo', desc: 'Veloce', icon: Zap, time: 4, quality: 4 },
  { id: 'flux', name: 'Flux 1.1 Pro', desc: 'Fotorealistico', icon: Star, time: 15, quality: 5 },
  { id: 'flux-schnell', name: 'Flux Schnell', desc: 'Molto veloce', icon: Zap, time: 3, quality: 3 },
  { id: 'flux-kontext', name: 'FLUX Kontext', desc: 'Object consistency', icon: Layers, time: 10, quality: 5, isNew: true },
  { id: 'gpt4o', name: 'GPT-4o', desc: 'Creativo & coerente', icon: Sparkles, time: 12, quality: 5, isNew: true },
];

// Advanced AI Edit Models
const AI_EDIT_MODELS = [
  {
    id: 'flux-kontext' as EditOperation,
    name: 'FLUX Kontext [pro]',
    desc: 'Object consistency, Image editing',
    icon: Layers,
    isNew: true,
    isPro: true,
  },
  {
    id: 'nano-banana' as EditOperation,
    name: 'Nano Banana',
    desc: 'Consistent and powerful',
    icon: Wand2,
    isNew: true,
  },
  {
    id: 'gpt4o-edit' as EditOperation,
    name: 'GPT-4o',
    desc: 'Prompt coherence, Creative',
    icon: Sparkles,
    isNew: true,
  },
];

const STYLES = [
  { id: 'auto', name: 'Auto' },
  { id: 'realistic', name: 'Realistico' },
  { id: 'design', name: 'Design' },
  { id: 'render_3d', name: '3D Render' },
  { id: 'anime', name: 'Anime' },
  { id: 'general', name: 'Generale' },
];

const SIZES = [
  { id: '1:1', name: '1:1', w: 1024, h: 1024 },
  { id: '16:9', name: '16:9', w: 1344, h: 768 },
  { id: '9:16', name: '9:16', w: 768, h: 1344 },
  { id: '4:3', name: '4:3', w: 1152, h: 896 },
  { id: '3:4', name: '3:4', w: 896, h: 1152 },
];

const EDIT_TOOLS = [
  { id: 'inpaint' as EditOperation, name: 'Magic Fill', desc: 'Modifica aree specifiche', icon: Brush },
  { id: 'remove-bg' as EditOperation, name: 'Rimuovi Sfondo', desc: 'Sfondo trasparente', icon: Eraser },
  { id: 'remove-object' as EditOperation, name: 'Rimuovi Oggetto', desc: 'Elimina elementi indesiderati', icon: ScissorsIcon },
  { id: 'outpaint' as EditOperation, name: 'Estendi', desc: 'Espandi oltre i bordi', icon: Expand },
  { id: 'upscale' as EditOperation, name: 'Upscale', desc: 'Aumenta risoluzione 2x/4x', icon: ZoomIn },
  { id: 'enhance-face' as EditOperation, name: 'Migliora Viso', desc: 'Restaura e migliora volti', icon: Star },
  { id: 'auto-enhance' as EditOperation, name: 'Auto Enhance', desc: 'Migliora colori automaticamente', icon: Wand2 },
  { id: 'remix' as EditOperation, name: 'Remix', desc: 'Genera variazioni', icon: Shuffle },
  { id: 'replace-bg' as EditOperation, name: 'Cambia Sfondo', desc: 'Nuovo sfondo AI', icon: ImagePlus },
];

// Adjustment tools (client-side, no API calls needed)
const ADJUST_TOOLS = [
  { id: 'brightness' as AdjustOperation, name: 'Luminosità', icon: Sun, min: -100, max: 100, default: 0 },
  { id: 'contrast' as AdjustOperation, name: 'Contrasto', icon: Contrast, min: -100, max: 100, default: 0 },
  { id: 'saturation' as AdjustOperation, name: 'Saturazione', icon: Droplets, min: -100, max: 100, default: 0 },
  { id: 'temperature' as AdjustOperation, name: 'Temperatura', icon: Thermometer, min: -100, max: 100, default: 0 },
  { id: 'blur' as AdjustOperation, name: 'Sfocatura', icon: CircleDot, min: 0, max: 20, default: 0 },
  { id: 'sharpen' as AdjustOperation, name: 'Nitidezza', icon: Focus, min: 0, max: 100, default: 0 },
];

const TOOLS_3D = [
  { id: 'image-to-3d' as Operation3D, name: 'Immagine → 3D', desc: 'Converti foto in modello', icon: Box },
  { id: 'text-to-3d' as Operation3D, name: 'Testo → 3D', desc: 'Descrivi e genera', icon: Type },
  { id: 'multi-view' as Operation3D, name: 'Multi-Views', desc: 'Genera viste multiple', icon: Eye },
  { id: 'sketch-to-render' as Operation3D, name: 'Sketch → Render', desc: 'Da sketch a immagine', icon: Pencil },
  { id: 'refine-3d' as Operation3D, name: 'Build & Refine', desc: 'Aumenta dettagli', icon: Sparkles },
  { id: 'retopology' as Operation3D, name: 'Retopology', desc: 'Ottimizza mesh', icon: Grid3X3 },
  { id: 'texture-3d' as Operation3D, name: 'Texture AI', desc: 'Genera materiali', icon: Palette },
  { id: 'stylize-3d' as Operation3D, name: 'Stilizza', desc: 'LEGO, Voxel, Clay', icon: Wand2 },
  { id: 'segment-3d' as Operation3D, name: 'Separa Parti', desc: 'Divide componenti', icon: Crosshair },
  { id: 'rig-3d' as Operation3D, name: 'Rig', desc: 'Aggiungi scheletro', icon: Bone },
];

// Mesh Resolution options
const MESH_RESOLUTIONS = [
  { id: 'standard' as MeshResolution, name: 'Standard', desc: 'Bilanciato qualità/velocità' },
  { id: 'ultra' as MeshResolution, name: 'Ultra', desc: 'Massima qualità (più lento)' },
];

// Generation modes
const GENERATION_MODES = [
  { id: 'one-click' as GenerationMode, name: 'One-Click', desc: 'Generazione rapida' },
  { id: 'build-refine' as GenerationMode, name: 'Build & Refine', desc: 'Più controllo' },
];

const STYLES_3D = [
  { id: 'lego', name: 'LEGO' },
  { id: 'voxel', name: 'Voxel' },
  { id: 'clay', name: 'Clay' },
  { id: 'cartoon', name: 'Cartoon' },
  { id: 'voronoi', name: 'Voronoi' },
  { id: 'steampunk', name: 'Steampunk' },
];

// Tripo Image-to-3D style presets
const TRIPO_STYLES = [
  { id: 'none', name: 'Nessuno', desc: 'Conversione fedele' },
  { id: 'person:person2cartoon', name: 'Cartoon', desc: 'Stile cartoon per persone' },
  { id: 'object:clay', name: 'Clay', desc: 'Effetto argilla' },
  { id: 'object:steampunk', name: 'Steampunk', desc: 'Stile steampunk' },
  { id: 'animal:venom', name: 'Venom', desc: 'Stile alieno/venom' },
  { id: 'object:barbie', name: 'Barbie', desc: 'Stile plastica lucida' },
  { id: 'object:christmas', name: 'Christmas', desc: 'Stile natalizio' },
  { id: 'gold', name: 'Oro', desc: 'Materiale dorato' },
  { id: 'ancient_bronze', name: 'Bronzo', desc: 'Bronzo antico' },
];

const FACE_LIMITS = [
  { id: 0, name: 'Auto' },
  { id: 5000, name: '5K' },
  { id: 10000, name: '10K' },
  { id: 30000, name: '30K' },
  { id: 50000, name: '50K' },
];

const EXPORT_FORMATS = [
  { id: 'glb', name: 'GLB' },
  { id: 'fbx', name: 'FBX' },
  { id: 'obj', name: 'OBJ' },
  { id: 'stl', name: 'STL' },
  { id: 'usdz', name: 'USDZ' },
];

// ============================================================================
// COMPONENTS
// ============================================================================

function Section({ title, children, defaultOpen = true, colors }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  colors: typeof THEME_COLORS.dark | typeof THEME_COLORS.light;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

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
        <ChevronDown
          size={12}
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
        />
      </button>
      {isOpen && <div style={{ padding: '0 12px 12px' }}>{children}</div>}
    </div>
  );
}

function ToolButton({ tool, selected, onClick, colors }: {
  tool: { id: string; name: string; desc: string; icon: LucideIcon };
  selected: boolean;
  onClick: () => void;
  colors: typeof THEME_COLORS.dark | typeof THEME_COLORS.light;
}) {
  const Icon = tool.icon;
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        width: '100%',
        background: selected ? colors.accentLight : 'transparent',
        border: `1px solid ${selected ? colors.accent : colors.borderColor}`,
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        background: selected ? colors.accent : colors.inputBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={16} color={selected ? '#fff' : colors.textMuted} />
      </div>
      <div style={{ textAlign: 'left', flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: colors.textPrimary }}>{tool.name}</div>
        <div style={{ fontSize: 10, color: colors.textMuted }}>{tool.desc}</div>
      </div>
    </button>
  );
}

// Image Upload Component with Drag & Drop
function ImageUploader({ value, onChange, onFileUpload, colors, placeholder }: {
  value: string;
  onChange: (url: string) => void;
  onFileUpload: (file: File) => void;
  colors: typeof THEME_COLORS.dark | typeof THEME_COLORS.light;
  placeholder?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
  };

  return (
    <div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: value ? 8 : 24,
          background: isDragging ? colors.accentLight : colors.inputBg,
          border: `2px dashed ${isDragging ? colors.accent : colors.borderColor}`,
          borderRadius: 8,
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all 0.15s',
        }}
      >
        {value ? (
          <div style={{ position: 'relative' }}>
            <img src={value} alt="" style={{ width: '100%', maxHeight: 120, objectFit: 'contain', borderRadius: 4 }} />
            <button
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={12} color="#fff" />
            </button>
          </div>
        ) : (
          <>
            <Upload size={24} color={colors.textMuted} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 11, color: colors.textSecondary }}>
              {placeholder || 'Trascina un\'immagine o clicca per caricare'}
            </div>
            <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>
              PNG, JPG, WebP
            </div>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {!value && (
        <div style={{ marginTop: 8 }}>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Oppure incolla URL..."
            style={{
              width: '100%',
              padding: 8,
              fontSize: 11,
              backgroundColor: colors.inputBg,
              border: `1px solid ${colors.borderColor}`,
              borderRadius: 4,
              color: colors.textPrimary,
              outline: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
}

// Mask Drawing Canvas for Inpainting
function MaskCanvas({ imageUrl, onMaskGenerated, colors }: {
  imageUrl: string;
  onMaskGenerated: (maskDataUrl: string) => void;
  colors: typeof THEME_COLORS.dark | typeof THEME_COLORS.light;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxW = 280;
      const scale = maxW / img.width;
      canvas.width = maxW;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    setHasDrawn(true);
  };

  const generateMask = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return;

    // Black background
    maskCtx.fillStyle = '#000';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    // Get image data from main canvas and extract white areas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      // Check for white/bright pixels (painted areas)
      if (imageData.data[i] > 200 && imageData.data[i + 1] > 200 && imageData.data[i + 2] > 200) {
        maskData.data[i] = 255;
        maskData.data[i + 1] = 255;
        maskData.data[i + 2] = 255;
        maskData.data[i + 3] = 255;
      }
    }
    maskCtx.putImageData(maskData, 0, 0);
    onMaskGenerated(maskCanvas.toDataURL('image/png'));
  };

  const clearMask = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    };
    img.src = imageUrl;
  };

  if (!imageUrl) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: colors.textMuted, fontSize: 11 }}>
        Carica prima un'immagine
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: colors.textMuted }}>Pennello:</span>
        <input
          type="range"
          min={5}
          max={80}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          style={{ flex: 1, accentColor: colors.accent }}
        />
        <span style={{ fontSize: 10, color: colors.textSecondary, width: 30 }}>{brushSize}px</span>
      </div>

      <div style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', border: `1px solid ${colors.borderColor}` }}>
        <canvas
          ref={canvasRef}
          onMouseDown={() => setIsDrawing(true)}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
          onMouseMove={draw}
          style={{ display: 'block', width: '100%', cursor: 'crosshair' }}
        />
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          right: 8,
          display: 'flex',
          gap: 4,
        }}>
          <button
            onClick={clearMask}
            style={{
              padding: '6px 10px',
              fontSize: 10,
              color: colors.textSecondary,
              background: 'rgba(0,0,0,0.6)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <RotateCcw size={10} /> Reset
          </button>
          {hasDrawn && (
            <button
              onClick={generateMask}
              style={{
                flex: 1,
                padding: '6px 10px',
                fontSize: 10,
                fontWeight: 500,
                color: '#fff',
                background: colors.accent,
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Usa Maschera
            </button>
          )}
        </div>
      </div>
      <div style={{ fontSize: 9, color: colors.textMuted, marginTop: 6 }}>
        Dipingi sulle aree da modificare (bianco = modifica)
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PLUGIN
// ============================================================================

export const AIImagePlugin: React.FC<PluginComponentProps> = ({ onClose }) => {
  const addElement = useCanvasStore((state) => state.addElement);
  const pages = useCanvasStore((state) => state.pages);
  const currentPageId = useCanvasStore((state) => state.currentPageId);
  const canvasSettings = useCanvasStore((state) => state.canvasSettings);
  const elements = useCanvasStore((state) => state.elements);
  const selectedElementIds = useCanvasStore((state) => state.selectedElementIds);

  // Auth for saving 3D models
  const { user } = useAuth();

  const theme = canvasSettings?.editorTheme || 'dark';
  const colors = THEME_COLORS[theme];
  const currentPage = pages[currentPageId];

  // Get selected image from canvas
  const selectedImageUrl = React.useMemo(() => {
    if (selectedElementIds.length === 1) {
      const el = elements[selectedElementIds[0]];
      if (el?.type === 'image' && el.src) {
        return el.src;
      }
    }
    return null;
  }, [selectedElementIds, elements]);

  // State
  const [mainTab, setMainTab] = useState<MainTab>('generate');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate state
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('ideogram');
  const [style, setStyle] = useState('auto');
  const [size, setSize] = useState('1:1');
  const [showModels, setShowModels] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState(true);

  // Edit state
  const [editTool, setEditTool] = useState<EditOperation>('inpaint');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [maskUrl, setMaskUrl] = useState('');
  const [maskDataUrl, setMaskDataUrl] = useState(''); // For drawn mask
  const [editPrompt, setEditPrompt] = useState('');
  const [outpaintDirection, setOutpaintDirection] = useState<'left' | 'right' | 'up' | 'down' | 'all'>('all');
  const [upscaleScale, setUpscaleScale] = useState(2);
  const [isUploading, setIsUploading] = useState(false);

  // Adjust state (client-side image adjustments)
  const [adjustImageUrl, setAdjustImageUrl] = useState('');
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    temperature: 0,
    blur: 0,
    sharpen: 0,
  });
  const [adjustedImageUrl, setAdjustedImageUrl] = useState('');

  // 3D state
  const [tool3D, setTool3D] = useState<Operation3D>('image-to-3d');
  const [imageUrl3D, setImageUrl3D] = useState('');
  const [textPrompt3D, setTextPrompt3D] = useState('');
  const [imagePrompt3D, setImagePrompt3D] = useState(''); // Optional prompt for image-to-3d
  const [taskId3D, setTaskId3D] = useState('');
  const [style3D, setStyle3D] = useState('lego');
  const [tripoStyle, setTripoStyle] = useState('none'); // Tripo style preset
  const [faceLimit, setFaceLimit] = useState(0); // 0 = auto
  const [enablePBR, setEnablePBR] = useState(true);
  const [autoScale, setAutoScale] = useState(false);
  const [targetPolycount, setTargetPolycount] = useState(5000);
  const [texturePrompt, setTexturePrompt] = useState('');
  const [exportFormat, setExportFormat] = useState('glb');

  // NEW: Advanced 3D options (Tripo-like)
  const [generationMode, setGenerationMode] = useState<GenerationMode>('one-click');
  const [meshResolution, setMeshResolution] = useState<MeshResolution>('standard');
  const [imageOptimization, setImageOptimization] = useState(true);
  const [smartLowPoly, setSmartLowPoly] = useState(false);
  const [generateInParts, setGenerateInParts] = useState(false);
  const [enableTPose, setEnableTPose] = useState(false);
  const [sketchPrompt, setSketchPrompt] = useState('');
  const [selected3DModel, setSelected3DModel] = useState<Generated3D | null>(null);
  const [show3DPreview, setShow3DPreview] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [multiViewImages, setMultiViewImages] = useState<string[]>([]);

  // NEW: Advanced AI Edit state
  const [selectedAIModel, setSelectedAIModel] = useState<string>('flux-kontext');
  const [beforeImage, setBeforeImage] = useState<string>('');
  const [afterImage, setAfterImage] = useState<string>('');
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);
  const [kontextPrompt, setKontextPrompt] = useState('');
  const [nanoBananaStyle, setNanoBananaStyle] = useState<'enhance' | 'render' | 'consistent'>('enhance');

  // NEW: 3D Generation Progress
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Results
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [models3D, setModels3D] = useState<Generated3D[]>([]);

  const selectedModel = MODELS.find(m => m.id === model) || MODELS[0];
  const selectedSize = SIZES.find(s => s.id === size) || SIZES[0];

  // ============================================================================
  // FILE UPLOAD HELPER
  // ============================================================================

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      // Convert file to base64 data URL for direct use
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } finally {
      setIsUploading(false);
    }
  }, []);

  // ============================================================================
  // 3D MODELS PERSISTENCE
  // ============================================================================

  // Save 3D model to database
  const save3DModel = useCallback(async (model: Generated3D, prompt?: string, operation?: string) => {
    if (!isSupabaseConfigured || !supabase || !user) {
      console.log('Cannot save 3D model: not authenticated or Supabase not configured');
      return;
    }

    try {
      const { error } = await supabase.from('generated_models_3d').insert({
        user_id: user.id,
        name: prompt || `Model ${new Date().toLocaleDateString()}`,
        operation: operation || model.operation,
        prompt: prompt,
        source_image_url: model.sourceImage,
        model_url: model.modelUrl,
        tripo_task_id: model.taskId,
        format: exportFormat,
        style_preset: tripoStyle !== 'none' ? tripoStyle : null,
        face_limit: faceLimit > 0 ? faceLimit : null,
        pbr: enablePBR,
      });

      if (error) {
        console.error('Error saving 3D model:', error);
      } else {
        console.log('3D model saved successfully');
      }
    } catch (err) {
      console.error('Error saving 3D model:', err);
    }
  }, [user, exportFormat, tripoStyle, faceLimit, enablePBR]);

  // Load saved 3D models
  const loadSaved3DModels = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user) return;

    try {
      const { data, error } = await supabase
        .from('generated_models_3d')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading 3D models:', error);
        return;
      }

      if (data) {
        const loadedModels: Generated3D[] = data.map((m: any) => ({
          id: m.id,
          modelUrl: m.model_url,
          sourceImage: m.source_image_url,
          taskId: m.tripo_task_id || '',
          operation: m.operation,
        }));
        setModels3D(loadedModels);
      }
    } catch (err) {
      console.error('Error loading 3D models:', err);
    }
  }, [user]);

  // Load models on mount
  useEffect(() => {
    loadSaved3DModels();
  }, [loadSaved3DModels]);

  // ============================================================================
  // API CALLS
  // ============================================================================

  const callAPI = useCallback(async (operation: string, body: Record<string, any>) => {
    setIsLoading(true);
    setError(null);

    const headers = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    };

    try {
      // Try new ai-studio endpoint first
      let res = await fetch(AI_STUDIO_API, {
        method: 'POST',
        headers,
        body: JSON.stringify({ operation, ...body }),
      });

      // Fallback to old endpoint for basic operations
      if (!res.ok && (operation === 'generate' || operation === 'remove-bg' || operation === 'upscale')) {
        const legacyBody: Record<string, any> = { ...body };
        if (operation === 'generate') {
          legacyBody.type = 'image';
        } else if (operation === 'remove-bg') {
          legacyBody.type = 'remove-bg';
        } else if (operation === 'upscale') {
          legacyBody.type = 'upscale';
        }

        res = await fetch(AI_IMAGE_API, {
          method: 'POST',
          headers,
          body: JSON.stringify(legacyBody),
        });
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Operazione fallita');
      }

      return data;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Errore sconosciuto';
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate image
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    const data = await callAPI('generate', {
      prompt,
      model,
      style,
      width: selectedSize.w,
      height: selectedSize.h,
      magicPrompt,
    });

    if (data.imageUrl) {
      setImages(prev => [{
        id: `${Date.now()}`,
        url: data.imageUrl,
        prompt,
        operation: 'generate',
      }, ...prev]);
    }
  }, [prompt, model, style, selectedSize, magicPrompt, callAPI]);

  // Edit image
  const handleEdit = useCallback(async () => {
    if (!editImageUrl.trim()) return;

    const body: Record<string, any> = { imageUrl: editImageUrl };

    switch (editTool) {
      case 'inpaint':
        const actualMask = maskDataUrl || maskUrl;
        if (!actualMask || !editPrompt) {
          setError('Maschera e prompt richiesti per inpainting');
          return;
        }
        body.maskUrl = actualMask;
        body.prompt = editPrompt;
        break;
      case 'outpaint':
        body.direction = outpaintDirection;
        body.prompt = editPrompt || 'extend naturally';
        break;
      case 'upscale':
        body.scale = upscaleScale;
        break;
      case 'remix':
        if (!editPrompt) {
          setError('Prompt richiesto per remix');
          return;
        }
        body.prompt = editPrompt;
        break;
      case 'replace-bg':
        if (!editPrompt) {
          setError('Descrivi il nuovo sfondo');
          return;
        }
        body.prompt = editPrompt;
        break;

      // NEW: Advanced AI Models
      case 'flux-kontext':
        if (!kontextPrompt) {
          setError('Descrivi la modifica da applicare');
          return;
        }
        body.prompt = kontextPrompt;
        body.model = 'flux-kontext';
        body.maintainConsistency = true;
        setBeforeImage(editImageUrl);
        break;

      case 'nano-banana':
        body.model = 'nano-banana';
        body.style = nanoBananaStyle;
        body.enhanceDetails = true;
        setBeforeImage(editImageUrl);
        break;

      case 'gpt4o-edit':
        if (!editPrompt) {
          setError('Descrivi la modifica');
          return;
        }
        body.prompt = editPrompt;
        body.model = 'gpt-4o';
        setBeforeImage(editImageUrl);
        break;
    }

    const data = await callAPI(editTool, body);

    if (data.imageUrl) {
      // Handle Before/After for advanced AI models
      if (['flux-kontext', 'nano-banana', 'gpt4o-edit'].includes(editTool)) {
        setAfterImage(data.imageUrl);
        setShowBeforeAfter(true);
      }

      setImages(prev => [{
        id: `${Date.now()}`,
        url: data.imageUrl,
        prompt: editPrompt || kontextPrompt || editTool,
        operation: editTool,
      }, ...prev]);
    }
  }, [editTool, editImageUrl, maskUrl, maskDataUrl, editPrompt, outpaintDirection, upscaleScale, kontextPrompt, nanoBananaStyle, callAPI]);

  // 3D generation
  const handle3D = useCallback(async () => {
    const body: Record<string, any> = {
      exportFormat, // Include export format for all 3D operations
      // New advanced options
      meshResolution,
      imageOptimization,
      smartLowPoly,
      generateInParts,
      generationMode,
    };

    switch (tool3D) {
      case 'image-to-3d':
        if (!imageUrl3D.trim()) {
          setError('URL immagine richiesto');
          return;
        }
        body.imageUrl = imageUrl3D;
        // Optional prompt to guide 3D generation
        if (imagePrompt3D.trim()) {
          body.prompt = imagePrompt3D;
        }
        // Tripo style preset
        if (tripoStyle !== 'none') {
          body.stylePreset = tripoStyle;
        }
        // Face limit (0 = auto)
        if (faceLimit > 0) {
          body.faceLimit = faceLimit;
        }
        // PBR materials
        body.pbr = enablePBR;
        // Auto-scale to real world dimensions
        body.autoScale = autoScale;
        // T-Pose for characters
        body.tPose = enableTPose;
        break;

      case 'text-to-3d':
        if (!textPrompt3D.trim()) {
          setError('Descrizione richiesta');
          return;
        }
        body.textPrompt = textPrompt3D;
        break;

      case 'multi-view':
        if (!imageUrl3D.trim()) {
          setError('URL immagine richiesto');
          return;
        }
        body.imageUrl = imageUrl3D;
        body.generateMultiView = true;
        break;

      case 'sketch-to-render':
        if (!imageUrl3D.trim()) {
          setError('Carica uno sketch');
          return;
        }
        body.imageUrl = imageUrl3D;
        body.sketchToRender = true;
        if (sketchPrompt.trim()) {
          body.prompt = sketchPrompt;
        }
        break;

      case 'refine-3d':
      case 'retopology':
      case 'segment-3d':
      case 'rig-3d':
        if (!taskId3D) {
          setError('Seleziona prima un modello 3D generato');
          return;
        }
        body.taskId = taskId3D;
        if (tool3D === 'retopology') body.targetPolycount = targetPolycount;
        break;

      case 'texture-3d':
        if (!taskId3D) {
          setError('Seleziona prima un modello 3D');
          return;
        }
        body.taskId = taskId3D;
        body.texturePrompt = texturePrompt;
        break;

      case 'stylize-3d':
        if (!taskId3D) {
          setError('Seleziona prima un modello 3D');
          return;
        }
        body.taskId = taskId3D;
        body.style3d = style3D;
        break;
    }

    const data = await callAPI(tool3D, body);

    // Handle multi-view results (returns images, not 3D model)
    if (tool3D === 'multi-view' && data.images) {
      setMultiViewImages(data.images);
      return;
    }

    // Handle sketch-to-render (returns image)
    if (tool3D === 'sketch-to-render' && data.imageUrl) {
      setImages(prev => [{
        id: `sketch-${Date.now()}`,
        url: data.imageUrl,
        prompt: sketchPrompt || 'Sketch to Render',
        operation: 'sketch-to-render',
      }, ...prev]);
      return;
    }

    if (data.modelUrl || data.taskId) {
      const newModel: Generated3D = {
        id: `${Date.now()}`,
        modelUrl: data.modelUrl,
        sourceImage: imageUrl3D,
        taskId: data.taskId || '',
        operation: tool3D,
        // Include topology info if returned
        faces: data.faces,
        vertices: data.vertices,
        topology: data.topology || 'triangle',
      };

      setModels3D(prev => [newModel, ...prev]);
      setSelected3DModel(newModel);

      // Save to database
      const promptUsed = tool3D === 'text-to-3d' ? textPrompt3D : imagePrompt3D;
      await save3DModel(newModel, promptUsed, tool3D);

      // Update taskId for chaining operations
      if (data.taskId) {
        setTaskId3D(data.taskId);
      }

      // Update credits if returned
      if (data.creditsRemaining !== undefined) {
        setCredits(data.creditsRemaining);
      }
    }
  }, [tool3D, imageUrl3D, imagePrompt3D, textPrompt3D, taskId3D, targetPolycount, texturePrompt, style3D, tripoStyle, faceLimit, enablePBR, autoScale, exportFormat, meshResolution, imageOptimization, smartLowPoly, generateInParts, generationMode, enableTPose, sketchPrompt, callAPI, save3DModel]);

  // Add image to canvas
  const addToCanvas = useCallback((img: GeneratedImage) => {
    if (!currentPage) return;
    const w = Math.min(selectedSize.w, currentPage.width * 0.6);
    const h = (w / selectedSize.w) * selectedSize.h;

    const elementId = addElement('image', undefined, {
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

  // Use generated image for editing
  const useForEdit = useCallback((url: string) => {
    setEditImageUrl(url);
    setMainTab('edit');
  }, []);

  // Use generated image for adjustments
  const useForAdjust = useCallback((url: string) => {
    setAdjustImageUrl(url);
    setAdjustments({ brightness: 0, contrast: 0, saturation: 0, temperature: 0, blur: 0, sharpen: 0 });
    setAdjustedImageUrl('');
    setMainTab('adjust');
  }, []);

  // Apply image adjustments (client-side canvas processing)
  const applyAdjustments = useCallback(async () => {
    if (!adjustImageUrl) return;

    setIsLoading(true);
    try {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = adjustImageUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      // Build CSS filter string
      const filters: string[] = [];
      if (adjustments.brightness !== 0) {
        filters.push(`brightness(${1 + adjustments.brightness / 100})`);
      }
      if (adjustments.contrast !== 0) {
        filters.push(`contrast(${1 + adjustments.contrast / 100})`);
      }
      if (adjustments.saturation !== 0) {
        filters.push(`saturate(${1 + adjustments.saturation / 100})`);
      }
      if (adjustments.blur > 0) {
        filters.push(`blur(${adjustments.blur}px)`);
      }
      // Temperature approximation using sepia + hue-rotate
      if (adjustments.temperature !== 0) {
        const temp = adjustments.temperature;
        if (temp > 0) {
          filters.push(`sepia(${temp / 100 * 0.3})`);
        } else {
          filters.push(`hue-rotate(${temp * 0.5}deg)`);
        }
      }

      ctx.filter = filters.length > 0 ? filters.join(' ') : 'none';
      ctx.drawImage(img, 0, 0);

      // Sharpen using convolution (if needed)
      if (adjustments.sharpen > 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const factor = adjustments.sharpen / 100;
        // Simple unsharp mask approximation
        ctx.filter = 'none';
        ctx.putImageData(imageData, 0, 0);
      }

      const dataUrl = canvas.toDataURL('image/png');
      setAdjustedImageUrl(dataUrl);

      // Add to images array
      setImages(prev => [{
        id: `adj-${Date.now()}`,
        url: dataUrl,
        prompt: 'Adjusted image',
        operation: 'adjust',
      }, ...prev]);

    } catch (err) {
      setError('Errore nell\'applicare le regolazioni');
    } finally {
      setIsLoading(false);
    }
  }, [adjustImageUrl, adjustments]);

  // Use generated image for 3D
  const useFor3D = useCallback((url: string) => {
    setImageUrl3D(url);
    setMainTab('3d');
    setTool3D('image-to-3d');
  }, []);

  // Add 3D model to canvas
  const updateElement = useCanvasStore((state) => state.updateElement);

  const addModel3DToCanvas = useCallback((model: Generated3D) => {
    if (!currentPage) return;

    // Add model3d element to canvas
    const elementId = addElement('model3d', currentPage.rootElementId);

    if (elementId) {
      // Update with 3D-specific properties
      updateElement(elementId, {
        name: `3D Model - ${model.operation}`,
        modelSrc: model.modelUrl,
        position3d: [0, 0, 0] as [number, number, number],
        rotation3d: [0, 0, 0] as [number, number, number],
        scale3d: [1, 1, 1] as [number, number, number],
        // Also set 2D canvas position
        size: { width: 200, height: 200 },
      });
    }

    onClose();
  }, [addElement, updateElement, currentPage, onClose]);

  // ============================================================================
  // RENDER
  // ============================================================================

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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      {/* Main Tab Bar */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${colors.borderColor}` }}>
        {[
          { id: 'generate' as MainTab, label: 'Genera', icon: Sparkles },
          { id: 'edit' as MainTab, label: 'AI Edit', icon: Wand2 },
          { id: 'adjust' as MainTab, label: 'Regola', icon: SlidersHorizontal },
          { id: '3d' as MainTab, label: '3D', icon: Box },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMainTab(tab.id)}
            style={{
              flex: 1,
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              background: mainTab === tab.id ? colors.accentLight : 'transparent',
              border: 'none',
              borderBottom: mainTab === tab.id ? `2px solid ${colors.accent}` : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <tab.icon size={16} color={mainTab === tab.id ? colors.accent : colors.textMuted} />
            <span style={{ fontSize: 10, fontWeight: 500, color: mainTab === tab.id ? colors.accent : colors.textMuted }}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* ================================================================== */}
        {/* GENERATE TAB */}
        {/* ================================================================== */}
        {mainTab === 'generate' && (
          <>
            {/* Prompt */}
            <div style={{ padding: 12, borderBottom: `1px solid ${colors.borderColor}` }}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descrivi l'immagine che vuoi creare..."
                style={{
                  width: '100%',
                  height: 80,
                  padding: 10,
                  fontSize: 12,
                  backgroundColor: colors.inputBg,
                  border: `1px solid ${colors.borderColor}`,
                  borderRadius: 6,
                  color: colors.textPrimary,
                  resize: 'none',
                  outline: 'none',
                }}
                onFocus={(e) => { e.target.style.borderColor = colors.accent; }}
                onBlur={(e) => { e.target.style.borderColor = colors.borderColor; }}
              />

              {/* Magic Prompt Toggle */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={magicPrompt}
                  onChange={(e) => setMagicPrompt(e.target.checked)}
                  style={{ accentColor: colors.accent }}
                />
                <span style={{ fontSize: 11, color: colors.textSecondary }}>Magic Prompt (migliora automaticamente)</span>
              </label>
            </div>

            {/* Model Selection */}
            <Section title="Modello" colors={colors}>
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
                  <ChevronDown size={12} color={colors.textMuted} style={{ transform: showModels ? 'rotate(180deg)' : 'none' }} />
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
            <Section title="Stile" colors={colors}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {STYLES.map(s => (
                  <button key={s.id} onClick={() => setStyle(s.id)} style={buttonStyle(style === s.id)}>
                    {s.name}
                  </button>
                ))}
              </div>
            </Section>

            {/* Size */}
            <Section title="Dimensione" colors={colors}>
              <div style={{ display: 'flex', gap: 4 }}>
                {SIZES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSize(s.id)}
                    style={{ ...buttonStyle(size === s.id), flex: 1, padding: '8px 4px', fontSize: 10 }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </Section>

            {/* Generate Button */}
            <div style={{ padding: 12 }}>
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isLoading}
                style={{
                  width: '100%',
                  padding: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#fff',
                  background: !prompt.trim() || isLoading ? colors.textMuted : colors.accent,
                  border: 'none',
                  borderRadius: 6,
                  cursor: !prompt.trim() || isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {isLoading ? (
                  <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generando...</>
                ) : (
                  <><Sparkles size={14} /> Genera</>
                )}
              </button>
            </div>
          </>
        )}

        {/* ================================================================== */}
        {/* EDIT TAB */}
        {/* ================================================================== */}
        {mainTab === 'edit' && (
          <>
            {/* Image Upload/Selection */}
            <Section title="Immagine Sorgente" colors={colors}>
              {/* Use from canvas button */}
              {selectedImageUrl && (
                <button
                  onClick={() => setEditImageUrl(selectedImageUrl)}
                  style={{
                    width: '100%',
                    padding: 10,
                    marginBottom: 8,
                    fontSize: 11,
                    fontWeight: 500,
                    color: colors.accent,
                    background: colors.accentLight,
                    border: `1px solid ${colors.accent}40`,
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <Image size={14} /> Usa immagine selezionata nel canvas
                </button>
              )}

              <ImageUploader
                value={editImageUrl}
                onChange={setEditImageUrl}
                onFileUpload={async (file) => {
                  const dataUrl = await uploadFile(file);
                  setEditImageUrl(dataUrl);
                }}
                colors={colors}
                placeholder="Trascina l'immagine da modificare"
              />

              {/* Quick select from generated images */}
              {images.length > 0 && !editImageUrl && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>Immagini generate:</div>
                  <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
                    {images.slice(0, 6).map(img => (
                      <img
                        key={img.id}
                        src={img.url}
                        onClick={() => setEditImageUrl(img.url)}
                        style={{
                          width: 40,
                          height: 40,
                          objectFit: 'cover',
                          borderRadius: 4,
                          cursor: 'pointer',
                          border: `1px solid ${colors.borderColor}`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {/* Tools */}
            <Section title="Strumento" colors={colors}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {EDIT_TOOLS.map(tool => (
                  <ToolButton
                    key={tool.id}
                    tool={tool}
                    selected={editTool === tool.id}
                    onClick={() => setEditTool(tool.id)}
                    colors={colors}
                  />
                ))}
              </div>
            </Section>

            {/* Advanced AI Models */}
            <Section title="Modelli AI Avanzati" colors={colors} defaultOpen={false}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {AI_EDIT_MODELS.map(aiModel => (
                  <button
                    key={aiModel.id}
                    onClick={() => setEditTool(aiModel.id)}
                    style={{
                      padding: '10px 12px',
                      background: editTool === aiModel.id ? colors.accentLight : colors.inputBg,
                      border: `1px solid ${editTool === aiModel.id ? colors.accent : colors.borderColor}`,
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      textAlign: 'left',
                    }}
                  >
                    <aiModel.icon size={18} color={editTool === aiModel.id ? colors.accent : colors.textMuted} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 500, color: colors.textPrimary }}>{aiModel.name}</span>
                        {aiModel.isNew && (
                          <span style={{ fontSize: 8, padding: '2px 4px', background: colors.accent, color: '#fff', borderRadius: 3 }}>New</span>
                        )}
                        {aiModel.isPro && (
                          <span style={{ fontSize: 8, padding: '2px 4px', background: '#f59e0b', color: '#fff', borderRadius: 3 }}>Pro</span>
                        )}
                      </div>
                      <div style={{ fontSize: 9, color: colors.textMuted }}>{aiModel.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </Section>

            {/* Tool-specific options */}
            {editTool === 'inpaint' && (
              <>
                <Section title="Maschera" colors={colors} defaultOpen={true}>
                  <MaskCanvas
                    imageUrl={editImageUrl}
                    onMaskGenerated={(dataUrl) => {
                      setMaskDataUrl(dataUrl);
                      setMaskUrl(''); // Clear URL if using drawn mask
                    }}
                    colors={colors}
                  />
                  {maskDataUrl && (
                    <div style={{ marginTop: 8, padding: 8, background: colors.accentLight, borderRadius: 4, fontSize: 10, color: colors.accent, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Brush size={12} /> Maschera pronta
                      <button onClick={() => setMaskDataUrl('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                        <X size={12} color={colors.accent} />
                      </button>
                    </div>
                  )}
                </Section>
                <Section title="Modifica" colors={colors}>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Cosa vuoi aggiungere/cambiare nell'area selezionata?"
                    style={{
                      width: '100%',
                      height: 60,
                      padding: 10,
                      fontSize: 12,
                      backgroundColor: colors.inputBg,
                      border: `1px solid ${colors.borderColor}`,
                      borderRadius: 6,
                      color: colors.textPrimary,
                      resize: 'none',
                    }}
                  />
                  <div style={{ marginTop: 6, fontSize: 9, color: colors.textMuted }}>
                    Esempio: "aggiungi un cappello rosso", "rimuovi la persona", "cambia il cielo in tramonto"
                  </div>
                </Section>
              </>
            )}

            {editTool === 'outpaint' && (
              <Section title="Direzione" colors={colors}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {[
                    { id: 'all', icon: Expand, label: 'Tutte' },
                    { id: 'left', icon: ArrowLeft, label: 'Sinistra' },
                    { id: 'right', icon: ArrowRight, label: 'Destra' },
                    { id: 'up', icon: ArrowUp, label: 'Su' },
                    { id: 'down', icon: ArrowDown, label: 'Giu' },
                  ].map(dir => (
                    <button
                      key={dir.id}
                      onClick={() => setOutpaintDirection(dir.id as any)}
                      style={{
                        ...buttonStyle(outpaintDirection === dir.id),
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <dir.icon size={12} />
                      {dir.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="Descrivi come continuare l'immagine (opzionale)"
                  style={{
                    width: '100%',
                    height: 50,
                    padding: 10,
                    fontSize: 12,
                    backgroundColor: colors.inputBg,
                    border: `1px solid ${colors.borderColor}`,
                    borderRadius: 6,
                    color: colors.textPrimary,
                    resize: 'none',
                    marginTop: 8,
                  }}
                />
              </Section>
            )}

            {editTool === 'upscale' && (
              <Section title="Scala" colors={colors}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[2, 4].map(s => (
                    <button
                      key={s}
                      onClick={() => setUpscaleScale(s)}
                      style={{ ...buttonStyle(upscaleScale === s), flex: 1 }}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {(editTool === 'remix' || editTool === 'replace-bg') && (
              <Section title={editTool === 'remix' ? 'Descrizione Variazione' : 'Nuovo Sfondo'} colors={colors}>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder={editTool === 'remix' ? 'Descrivi la variazione...' : 'Descrivi il nuovo sfondo...'}
                  style={{
                    width: '100%',
                    height: 60,
                    padding: 10,
                    fontSize: 12,
                    backgroundColor: colors.inputBg,
                    border: `1px solid ${colors.borderColor}`,
                    borderRadius: 6,
                    color: colors.textPrimary,
                    resize: 'none',
                  }}
                />
              </Section>
            )}

            {/* FLUX Kontext Options */}
            {editTool === 'flux-kontext' && (
              <Section title="FLUX Kontext [pro]" colors={colors}>
                <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Layers size={12} />
                  Mantiene la consistenza del soggetto durante l'editing
                </div>
                <textarea
                  value={kontextPrompt}
                  onChange={(e) => setKontextPrompt(e.target.value)}
                  placeholder="Descrivi la modifica mantenendo il soggetto..."
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
                  }}
                />
                <div style={{ marginTop: 6, fontSize: 9, color: colors.textMuted }}>
                  Es: "cambia sfondo in spiaggia", "aggiungi occhiali da sole", "metti in un ambiente notturno"
                </div>
              </Section>
            )}

            {/* Nano Banana Options */}
            {editTool === 'nano-banana' && (
              <Section title="Nano Banana" colors={colors}>
                <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 8 }}>
                  Migliora e renderizza mantenendo consistenza
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[
                    { id: 'enhance', label: 'Enhance', desc: 'Migliora dettagli' },
                    { id: 'render', label: 'Render', desc: 'Stile realistico' },
                    { id: 'consistent', label: 'Consistent', desc: 'Mantieni identità' },
                  ].map(style => (
                    <button
                      key={style.id}
                      onClick={() => setNanoBananaStyle(style.id as any)}
                      style={{
                        flex: 1,
                        padding: '8px 4px',
                        fontSize: 10,
                        color: nanoBananaStyle === style.id ? colors.textPrimary : colors.textMuted,
                        background: nanoBananaStyle === style.id ? colors.accentLight : colors.inputBg,
                        border: `1px solid ${nanoBananaStyle === style.id ? colors.accent : colors.borderColor}`,
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontWeight: 500 }}>{style.label}</div>
                      <div style={{ fontSize: 8, opacity: 0.7, marginTop: 2 }}>{style.desc}</div>
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {/* GPT-4o Options */}
            {editTool === 'gpt4o-edit' && (
              <Section title="GPT-4o" colors={colors}>
                <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={12} />
                  Prompt coherence & Creative editing
                </div>
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="Descrivi la modifica in modo creativo..."
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
                  }}
                />
              </Section>
            )}

            {/* Before/After Comparison */}
            {showBeforeAfter && beforeImage && afterImage && (
              <Section title="Before / After" colors={colors}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 9, color: colors.textMuted, marginBottom: 4, textAlign: 'center' }}>Before</div>
                    <img
                      src={beforeImage}
                      alt="Before"
                      style={{
                        width: '100%',
                        borderRadius: 6,
                        border: `1px solid ${colors.borderColor}`,
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 9, color: colors.textMuted, marginBottom: 4, textAlign: 'center' }}>After</div>
                    <img
                      src={afterImage}
                      alt="After"
                      style={{
                        width: '100%',
                        borderRadius: 6,
                        border: `1px solid ${colors.accent}`,
                      }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => { setShowBeforeAfter(false); setBeforeImage(''); setAfterImage(''); }}
                  style={{
                    marginTop: 8,
                    width: '100%',
                    padding: 6,
                    fontSize: 10,
                    color: colors.textMuted,
                    background: 'transparent',
                    border: `1px solid ${colors.borderColor}`,
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  Chiudi confronto
                </button>
              </Section>
            )}

            {/* Apply Button */}
            <div style={{ padding: 12 }}>
              <button
                onClick={handleEdit}
                disabled={!editImageUrl.trim() || isLoading}
                style={{
                  width: '100%',
                  padding: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#fff',
                  background: !editImageUrl.trim() || isLoading ? colors.textMuted : colors.accent,
                  border: 'none',
                  borderRadius: 6,
                  cursor: !editImageUrl.trim() || isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {isLoading ? (
                  <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Elaborando...</>
                ) : (
                  <><Wand2 size={14} /> Applica {EDIT_TOOLS.find(t => t.id === editTool)?.name || AI_EDIT_MODELS.find(m => m.id === editTool)?.name}</>
                )}
              </button>
            </div>
          </>
        )}

        {/* ================================================================== */}
        {/* ADJUST TAB - Client-side image adjustments */}
        {/* ================================================================== */}
        {mainTab === 'adjust' && (
          <>
            {/* Image Upload */}
            <Section title="Immagine" colors={colors}>
              {selectedImageUrl && !adjustImageUrl && (
                <button
                  onClick={() => setAdjustImageUrl(selectedImageUrl)}
                  style={{ ...buttonStyle(false), width: '100%', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Image size={14} /> Usa immagine selezionata
                </button>
              )}
              <ImageUploader
                value={adjustImageUrl}
                onChange={setAdjustImageUrl}
                onFileUpload={async (file) => {
                  const dataUrl = await uploadFile(file);
                  setAdjustImageUrl(dataUrl);
                }}
                colors={colors}
                placeholder="Trascina un'immagine da regolare"
              />
              {images.length > 0 && !adjustImageUrl && (
                <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                  {images.slice(0, 4).map(img => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt=""
                      onClick={() => setAdjustImageUrl(img.url)}
                      style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: `1px solid ${colors.borderColor}` }}
                    />
                  ))}
                </div>
              )}
            </Section>

            {/* Adjustment Sliders */}
            {adjustImageUrl && (
              <Section title="Regolazioni" colors={colors}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {ADJUST_TOOLS.map(tool => (
                    <div key={tool.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <tool.icon size={14} color={colors.textMuted} />
                          <span style={{ fontSize: 11, color: colors.textPrimary }}>{tool.name}</span>
                        </div>
                        <span style={{ fontSize: 10, color: colors.textMuted, minWidth: 32, textAlign: 'right' }}>
                          {adjustments[tool.id]}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={tool.min}
                        max={tool.max}
                        value={adjustments[tool.id]}
                        onChange={(e) => setAdjustments(prev => ({ ...prev, [tool.id]: parseInt(e.target.value) }))}
                        style={{
                          width: '100%',
                          height: 4,
                          appearance: 'none',
                          background: `linear-gradient(to right, ${colors.accent} 0%, ${colors.accent} ${((adjustments[tool.id] - tool.min) / (tool.max - tool.min)) * 100}%, ${colors.inputBg} ${((adjustments[tool.id] - tool.min) / (tool.max - tool.min)) * 100}%, ${colors.inputBg} 100%)`,
                          borderRadius: 2,
                          cursor: 'pointer',
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Reset button */}
                <button
                  onClick={() => setAdjustments({ brightness: 0, contrast: 0, saturation: 0, temperature: 0, blur: 0, sharpen: 0 })}
                  style={{ ...buttonStyle(false), width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </Section>
            )}

            {/* Preview */}
            {adjustImageUrl && (
              <Section title="Anteprima" colors={colors}>
                <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: colors.inputBg }}>
                  <img
                    src={adjustedImageUrl || adjustImageUrl}
                    alt="Preview"
                    style={{
                      width: '100%',
                      maxHeight: 200,
                      objectFit: 'contain',
                      filter: !adjustedImageUrl ? `
                        brightness(${1 + adjustments.brightness / 100})
                        contrast(${1 + adjustments.contrast / 100})
                        saturate(${1 + adjustments.saturation / 100})
                        ${adjustments.blur > 0 ? `blur(${adjustments.blur}px)` : ''}
                        ${adjustments.temperature > 0 ? `sepia(${adjustments.temperature / 100 * 0.3})` : ''}
                        ${adjustments.temperature < 0 ? `hue-rotate(${adjustments.temperature * 0.5}deg)` : ''}
                      ` : 'none',
                    }}
                  />
                </div>
              </Section>
            )}

            {/* Apply Button */}
            {adjustImageUrl && (
              <div style={{ padding: '12px 16px' }}>
                <button
                  onClick={applyAdjustments}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: isLoading ? colors.inputBg : colors.accent,
                    color: isLoading ? colors.textMuted : '#fff',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {isLoading ? (
                    <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Applicando...</>
                  ) : (
                    <><SlidersHorizontal size={14} /> Applica Regolazioni</>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* ================================================================== */}
        {/* 3D TAB */}
        {/* ================================================================== */}
        {mainTab === '3d' && (
          <>
            {/* Credits Display */}
            {credits !== null && (
              <div style={{
                padding: '8px 12px',
                background: colors.accentLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${colors.borderColor}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CreditCard size={14} color={colors.accent} />
                  <span style={{ fontSize: 11, color: colors.textSecondary }}>Crediti</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.accent }}>{credits}</span>
              </div>
            )}

            {/* Generation Mode */}
            <Section title="Modalità Generazione" colors={colors}>
              <div style={{ display: 'flex', gap: 6 }}>
                {GENERATION_MODES.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setGenerationMode(mode.id)}
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      background: generationMode === mode.id ? colors.accentLight : colors.inputBg,
                      border: `1px solid ${generationMode === mode.id ? colors.accent : colors.borderColor}`,
                      borderRadius: 6,
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 500, color: colors.textPrimary }}>{mode.name}</div>
                    <div style={{ fontSize: 9, color: colors.textMuted, marginTop: 2 }}>{mode.desc}</div>
                  </button>
                ))}
              </div>
            </Section>

            {/* Tools */}
            <Section title="Operazione" colors={colors}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                {TOOLS_3D.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setTool3D(tool.id)}
                    style={{
                      padding: '10px 8px',
                      background: tool3D === tool.id ? colors.accentLight : colors.inputBg,
                      border: `1px solid ${tool3D === tool.id ? colors.accent : colors.borderColor}`,
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <tool.icon size={18} color={tool3D === tool.id ? colors.accent : colors.textMuted} />
                    <span style={{ fontSize: 10, fontWeight: 500, color: colors.textPrimary }}>{tool.name}</span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Input based on tool */}
            {tool3D === 'image-to-3d' && (
              <>
                <Section title="Immagine Sorgente" colors={colors}>
                  {/* Use from canvas button */}
                  {selectedImageUrl && (
                    <button
                      onClick={() => setImageUrl3D(selectedImageUrl)}
                      style={{
                        width: '100%',
                        padding: 10,
                        marginBottom: 8,
                        fontSize: 11,
                        fontWeight: 500,
                        color: colors.accent,
                        background: colors.accentLight,
                        border: `1px solid ${colors.accent}40`,
                        borderRadius: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                      }}
                    >
                      <Image size={14} /> Usa immagine selezionata nel canvas
                    </button>
                  )}

                  <ImageUploader
                    value={imageUrl3D}
                    onChange={setImageUrl3D}
                    onFileUpload={async (file) => {
                      const dataUrl = await uploadFile(file);
                      setImageUrl3D(dataUrl);
                    }}
                    colors={colors}
                    placeholder="Trascina l'immagine per il 3D"
                  />

                  {images.length > 0 && !imageUrl3D && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>Immagini generate:</div>
                      <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }}>
                        {images.slice(0, 6).map(img => (
                          <img
                            key={img.id}
                            src={img.url}
                            onClick={() => setImageUrl3D(img.url)}
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: 'cover',
                              borderRadius: 4,
                              cursor: 'pointer',
                              border: `1px solid ${colors.borderColor}`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </Section>

                {/* Prompt opzionale per guidare la generazione */}
                <Section title="Descrizione (Opzionale)" colors={colors} defaultOpen={false}>
                  <textarea
                    value={imagePrompt3D}
                    onChange={(e) => setImagePrompt3D(e.target.value)}
                    placeholder="Descrivi l'oggetto per guidare la generazione 3D..."
                    style={{
                      width: '100%',
                      height: 60,
                      padding: 10,
                      fontSize: 12,
                      backgroundColor: colors.inputBg,
                      border: `1px solid ${colors.borderColor}`,
                      borderRadius: 6,
                      color: colors.textPrimary,
                      resize: 'none',
                    }}
                  />
                  <div style={{ marginTop: 6, fontSize: 9, color: colors.textMuted }}>
                    Es: "un calciatore con maglia rossa", "una sedia moderna in legno"
                  </div>
                </Section>

                {/* Stile preset */}
                <Section title="Stile" colors={colors} defaultOpen={false}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {TRIPO_STYLES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setTripoStyle(s.id)}
                        title={s.desc}
                        style={{
                          padding: '6px 10px',
                          fontSize: 10,
                          fontWeight: 500,
                          color: tripoStyle === s.id ? colors.textPrimary : colors.textMuted,
                          background: tripoStyle === s.id ? colors.accentLight : colors.inputBg,
                          border: `1px solid ${tripoStyle === s.id ? colors.accent : colors.borderColor}`,
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </Section>

                {/* Opzioni avanzate */}
                <Section title="Opzioni Avanzate" colors={colors} defaultOpen={false}>
                  {/* Image Optimization */}
                  <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <RefreshCw size={14} color={colors.textMuted} />
                      <div>
                        <span style={{ fontSize: 11, color: colors.textPrimary }}>Image Optimization</span>
                        <span style={{ fontSize: 9, color: colors.accent, marginLeft: 6, padding: '1px 4px', background: colors.accentLight, borderRadius: 3 }}>New</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={imageOptimization}
                      onChange={(e) => setImageOptimization(e.target.checked)}
                      style={{ accentColor: colors.accent, width: 16, height: 16 }}
                    />
                  </div>

                  {/* Mesh Resolution */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: colors.textSecondary, marginBottom: 6 }}>Mesh Resolution</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {MESH_RESOLUTIONS.map(res => (
                        <button
                          key={res.id}
                          onClick={() => setMeshResolution(res.id)}
                          style={{
                            flex: 1,
                            padding: '8px 4px',
                            fontSize: 10,
                            color: meshResolution === res.id ? colors.textPrimary : colors.textMuted,
                            background: meshResolution === res.id ? colors.accentLight : colors.inputBg,
                            border: `1px solid ${meshResolution === res.id ? colors.accent : colors.borderColor}`,
                            borderRadius: 4,
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ fontWeight: 500 }}>{res.name}</div>
                          <div style={{ fontSize: 8, opacity: 0.7, marginTop: 2 }}>{res.id === 'ultra' ? 'Trial 0/1' : ''}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Face Limit / Polycount */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: colors.textSecondary, marginBottom: 6 }}>Polycount</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {FACE_LIMITS.map(f => (
                        <button
                          key={f.id}
                          onClick={() => setFaceLimit(f.id)}
                          style={{
                            flex: 1,
                            padding: '6px 4px',
                            fontSize: 10,
                            color: faceLimit === f.id ? colors.textPrimary : colors.textMuted,
                            background: faceLimit === f.id ? colors.accentLight : colors.inputBg,
                            border: `1px solid ${faceLimit === f.id ? colors.accent : colors.borderColor}`,
                            borderRadius: 4,
                            cursor: 'pointer',
                          }}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Hexagon size={14} color={colors.textMuted} />
                        <span style={{ fontSize: 11, color: colors.textPrimary }}>Smart Low Poly</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={smartLowPoly}
                        onChange={(e) => setSmartLowPoly(e.target.checked)}
                        style={{ accentColor: colors.accent, width: 16, height: 16 }}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Puzzle size={14} color={colors.textMuted} />
                        <span style={{ fontSize: 11, color: colors.textPrimary }}>Generate in Parts</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={generateInParts}
                        onChange={(e) => setGenerateInParts(e.target.checked)}
                        style={{ accentColor: colors.accent, width: 16, height: 16 }}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <User size={14} color={colors.textMuted} />
                        <span style={{ fontSize: 11, color: colors.textPrimary }}>T-Pose</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enableTPose}
                        onChange={(e) => setEnableTPose(e.target.checked)}
                        style={{ accentColor: colors.accent, width: 16, height: 16 }}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Palette size={14} color={colors.textMuted} />
                        <span style={{ fontSize: 11, color: colors.textPrimary }}>PBR Materials</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={enablePBR}
                        onChange={(e) => setEnablePBR(e.target.checked)}
                        style={{ accentColor: colors.accent, width: 16, height: 16 }}
                      />
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Move3D size={14} color={colors.textMuted} />
                        <span style={{ fontSize: 11, color: colors.textPrimary }}>Auto-Scale</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={autoScale}
                        onChange={(e) => setAutoScale(e.target.checked)}
                        style={{ accentColor: colors.accent, width: 16, height: 16 }}
                      />
                    </label>
                  </div>
                </Section>
              </>
            )}

            {/* Multi-View Tool */}
            {tool3D === 'multi-view' && (
              <>
                <Section title="Immagine Sorgente" colors={colors}>
                  <ImageUploader
                    value={imageUrl3D}
                    onChange={setImageUrl3D}
                    onFileUpload={async (file) => {
                      const dataUrl = await uploadFile(file);
                      setImageUrl3D(dataUrl);
                    }}
                    colors={colors}
                    placeholder="Trascina l'immagine per Multi-Views"
                  />
                </Section>

                <Section title="Info" colors={colors}>
                  <div style={{ fontSize: 11, color: colors.textSecondary, lineHeight: 1.5 }}>
                    <Eye size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    Genera automaticamente viste multiple dell'oggetto (front, back, side) per una migliore ricostruzione 3D.
                  </div>
                  {multiViewImages.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 6 }}>Viste generate:</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
                        {multiViewImages.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`View ${idx + 1}`}
                            style={{ width: '100%', borderRadius: 4, border: `1px solid ${colors.borderColor}` }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </Section>
              </>
            )}

            {/* Sketch to Render Tool */}
            {tool3D === 'sketch-to-render' && (
              <>
                <Section title="Sketch" colors={colors}>
                  <ImageUploader
                    value={imageUrl3D}
                    onChange={setImageUrl3D}
                    onFileUpload={async (file) => {
                      const dataUrl = await uploadFile(file);
                      setImageUrl3D(dataUrl);
                    }}
                    colors={colors}
                    placeholder="Trascina uno sketch o disegno"
                  />
                </Section>

                <Section title="Descrizione (Opzionale)" colors={colors}>
                  <textarea
                    value={sketchPrompt}
                    onChange={(e) => setSketchPrompt(e.target.value)}
                    placeholder="Descrivi cosa vuoi ottenere dallo sketch..."
                    style={{
                      width: '100%',
                      height: 60,
                      padding: 10,
                      fontSize: 12,
                      backgroundColor: colors.inputBg,
                      border: `1px solid ${colors.borderColor}`,
                      borderRadius: 6,
                      color: colors.textPrimary,
                      resize: 'none',
                    }}
                  />
                  <div style={{ marginTop: 6, fontSize: 9, color: colors.textMuted }}>
                    <Pencil size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Usa FLUX.1 Kontext per trasformare sketch in immagini realistiche
                  </div>
                </Section>
              </>
            )}

            {tool3D === 'text-to-3d' && (
              <Section title="Descrizione" colors={colors}>
                <textarea
                  value={textPrompt3D}
                  onChange={(e) => setTextPrompt3D(e.target.value)}
                  placeholder="Descrivi l'oggetto 3D da generare..."
                  style={{
                    width: '100%',
                    height: 80,
                    padding: 10,
                    fontSize: 12,
                    backgroundColor: colors.inputBg,
                    border: `1px solid ${colors.borderColor}`,
                    borderRadius: 6,
                    color: colors.textPrimary,
                    resize: 'none',
                  }}
                />
              </Section>
            )}

            {(tool3D === 'refine-3d' || tool3D === 'retopology' || tool3D === 'texture-3d' || tool3D === 'stylize-3d' || tool3D === 'segment-3d' || tool3D === 'rig-3d') && (
              <Section title="Modello 3D" colors={colors}>
                {models3D.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {models3D.slice(0, 4).map(m => (
                      <button
                        key={m.id}
                        onClick={() => setTaskId3D(m.taskId)}
                        style={{
                          padding: 8,
                          background: taskId3D === m.taskId ? colors.accentLight : colors.inputBg,
                          border: `1px solid ${taskId3D === m.taskId ? colors.accent : colors.borderColor}`,
                          borderRadius: 6,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Box size={16} color={colors.textMuted} />
                        <div style={{ textAlign: 'left', flex: 1 }}>
                          <div style={{ fontSize: 11, color: colors.textPrimary }}>{m.operation}</div>
                          <div style={{ fontSize: 9, color: colors.textMuted }}>ID: {m.taskId.slice(0, 8)}...</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: 20, textAlign: 'center', color: colors.textMuted, fontSize: 11 }}>
                    Prima genera un modello 3D
                  </div>
                )}
              </Section>
            )}

            {tool3D === 'retopology' && (
              <Section title="Target Poligoni" colors={colors}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1000, 5000, 10000, 50000].map(p => (
                    <button
                      key={p}
                      onClick={() => setTargetPolycount(p)}
                      style={{ ...buttonStyle(targetPolycount === p), flex: 1, fontSize: 9 }}
                    >
                      {p >= 1000 ? `${p/1000}K` : p}
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {tool3D === 'texture-3d' && (
              <Section title="Descrizione Texture" colors={colors}>
                <textarea
                  value={texturePrompt}
                  onChange={(e) => setTexturePrompt(e.target.value)}
                  placeholder="Descrivi il materiale/texture..."
                  style={{
                    width: '100%',
                    height: 60,
                    padding: 10,
                    fontSize: 12,
                    backgroundColor: colors.inputBg,
                    border: `1px solid ${colors.borderColor}`,
                    borderRadius: 6,
                    color: colors.textPrimary,
                    resize: 'none',
                  }}
                />
              </Section>
            )}

            {tool3D === 'stylize-3d' && (
              <Section title="Stile" colors={colors}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {STYLES_3D.map(s => (
                    <button key={s.id} onClick={() => setStyle3D(s.id)} style={buttonStyle(style3D === s.id)}>
                      {s.name}
                    </button>
                  ))}
                </div>
              </Section>
            )}

            {/* Segment-3D info */}
            {tool3D === 'segment-3d' && (
              <Section title="Separa Parti" colors={colors}>
                <div style={{ fontSize: 11, color: colors.textSecondary, lineHeight: 1.5 }}>
                  Divide automaticamente il modello 3D in componenti separati (es: testa, braccia, gambe per un personaggio).
                </div>
                <div style={{ marginTop: 8, padding: 8, background: colors.inputBg, borderRadius: 4, fontSize: 10, color: colors.textMuted }}>
                  Utile per: animazione, stampa 3D multi-materiale, editing parti singole
                </div>
              </Section>
            )}

            {/* Rig-3D info */}
            {tool3D === 'rig-3d' && (
              <Section title="Rig per Animazione" colors={colors}>
                <div style={{ fontSize: 11, color: colors.textSecondary, lineHeight: 1.5 }}>
                  Aggiunge uno scheletro (armatura) al modello 3D per permettere l'animazione dei movimenti.
                </div>
                <div style={{ marginTop: 8, padding: 8, background: colors.inputBg, borderRadius: 4, fontSize: 10, color: colors.textMuted }}>
                  Ideale per: personaggi, creature, oggetti articolati
                </div>
              </Section>
            )}

            {/* Export Format */}
            <Section title="Formato Export" colors={colors} defaultOpen={false}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {EXPORT_FORMATS.map(f => (
                  <button key={f.id} onClick={() => setExportFormat(f.id)} style={buttonStyle(exportFormat === f.id)}>
                    {f.name}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 6, fontSize: 9, color: colors.textMuted }}>
                GLB: Web/AR • FBX: Unity/Unreal • OBJ: Generale • STL: Stampa 3D • USDZ: Apple AR
              </div>
            </Section>

            {/* Generation Progress */}
            {generationProgress && (
              <Section title="Progresso Generazione" colors={colors}>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: colors.textPrimary }}>
                      {generationProgress.status === 'queued' && 'In coda...'}
                      {generationProgress.status === 'running' && 'Generando...'}
                      {generationProgress.status === 'success' && 'Completato!'}
                      {generationProgress.status === 'failed' && 'Errore'}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: colors.accent }}>
                      {generationProgress.progress}%
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: 8,
                    background: colors.inputBg,
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${generationProgress.progress}%`,
                      height: '100%',
                      background: generationProgress.status === 'failed' ? '#ef4444' :
                                  generationProgress.status === 'success' ? '#22c55e' : colors.accent,
                      borderRadius: 4,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  {generationProgress.message && (
                    <div style={{ marginTop: 6, fontSize: 9, color: colors.textMuted }}>
                      {generationProgress.message}
                    </div>
                  )}
                </div>
                {/* Point cloud placeholder visualization */}
                {generationProgress.status === 'running' && (
                  <div style={{
                    width: '100%',
                    height: 120,
                    background: '#0a0a0a',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute',
                      width: 60,
                      height: 60,
                      border: `2px solid ${colors.accent}40`,
                      borderTopColor: colors.accent,
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
                    <Box size={24} color={colors.accent} style={{ opacity: 0.5 }} />
                  </div>
                )}
              </Section>
            )}

            {/* Generate 3D Button */}
            <div style={{ padding: 12 }}>
              <button
                onClick={handle3D}
                disabled={isLoading || generationProgress?.status === 'running'}
                style={{
                  width: '100%',
                  padding: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#fff',
                  background: isLoading || generationProgress?.status === 'running' ? colors.textMuted : colors.accent,
                  border: 'none',
                  borderRadius: 6,
                  cursor: isLoading || generationProgress?.status === 'running' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {isLoading || generationProgress?.status === 'running' ? (
                  <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> {generationProgress ? `Generando... ${generationProgress.progress}%` : 'Generando 3D...'}</>
                ) : (
                  <><Box size={14} /> {TOOLS_3D.find(t => t.id === tool3D)?.name}</>
                )}
              </button>
            </div>

            {/* 3D Preview */}
            {selected3DModel && selected3DModel.modelUrl && (
              <Section title="Anteprima 3D" colors={colors}>
                <div style={{
                  width: '100%',
                  height: 200,
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: '#18181b',
                  border: `1px solid ${colors.borderColor}`,
                  position: 'relative',
                }}>
                  <div
                    ref={(el) => {
                      if (el && selected3DModel.modelUrl) {
                        el.innerHTML = '';
                        const mv = document.createElement('model-viewer') as any;
                        mv.src = selected3DModel.modelUrl;
                        mv.setAttribute('camera-controls', '');
                        mv.setAttribute('auto-rotate', '');
                        mv.setAttribute('environment-image', 'neutral');
                        mv.setAttribute('shadow-intensity', '1');
                        mv.style.width = '100%';
                        mv.style.height = '100%';
                        el.appendChild(mv);
                      }
                    }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>

                {/* Topology Info */}
                <div style={{
                  marginTop: 8,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 6,
                }}>
                  <div style={{
                    padding: 8,
                    background: colors.inputBg,
                    borderRadius: 4,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 9, color: colors.textMuted, marginBottom: 2 }}>Topology</div>
                    <div style={{ fontSize: 11, color: colors.textPrimary, fontWeight: 500 }}>
                      {selected3DModel.topology === 'quad' ? 'Quad' : 'Triangle'}
                    </div>
                  </div>
                  <div style={{
                    padding: 8,
                    background: colors.inputBg,
                    borderRadius: 4,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 9, color: colors.textMuted, marginBottom: 2 }}>Faces</div>
                    <div style={{ fontSize: 11, color: colors.textPrimary, fontWeight: 500 }}>
                      {selected3DModel.faces ? selected3DModel.faces.toLocaleString() : '–'}
                    </div>
                  </div>
                  <div style={{
                    padding: 8,
                    background: colors.inputBg,
                    borderRadius: 4,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 9, color: colors.textMuted, marginBottom: 2 }}>Vertices</div>
                    <div style={{ fontSize: 11, color: colors.textPrimary, fontWeight: 500 }}>
                      {selected3DModel.vertices ? selected3DModel.vertices.toLocaleString() : '–'}
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {/* 3D Results */}
            {models3D.length > 0 && (
              <Section title={`Modelli 3D (${models3D.length})`} colors={colors}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {models3D.map(m => (
                    <div
                      key={m.id}
                      onClick={() => setSelected3DModel(m)}
                      style={{
                        padding: 10,
                        background: selected3DModel?.id === m.id ? colors.accentLight : colors.inputBg,
                        borderRadius: 6,
                        border: `1px solid ${selected3DModel?.id === m.id ? colors.accent : colors.borderColor}`,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Box size={20} color={selected3DModel?.id === m.id ? colors.accent : colors.textMuted} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, color: colors.textPrimary, fontWeight: 500 }}>{m.operation}</div>
                          <div style={{ fontSize: 9, color: colors.textMuted }}>Task: {m.taskId.slice(0, 12)}...</div>
                          {/* Mini topology info */}
                          {(m.faces || m.vertices) && (
                            <div style={{ fontSize: 8, color: colors.textMuted, marginTop: 2 }}>
                              <Triangle size={8} style={{ verticalAlign: 'middle', marginRight: 2 }} />
                              {m.faces?.toLocaleString() || '–'} faces • {m.vertices?.toLocaleString() || '–'} vertices
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); addModel3DToCanvas(m); }}
                          style={{
                            flex: 1,
                            padding: 8,
                            fontSize: 11,
                            fontWeight: 500,
                            color: '#fff',
                            background: colors.accent,
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 4,
                          }}
                        >
                          <Layers size={12} /> Aggiungi al Canvas
                        </button>
                        <a
                          href={m.modelUrl}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Download"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            padding: '8px 12px',
                            fontSize: 11,
                            fontWeight: 500,
                            color: colors.accent,
                            background: colors.accentLight,
                            border: `1px solid ${colors.accent}30`,
                            borderRadius: 4,
                            textAlign: 'center',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Download size={12} />
                        </a>
                        <button
                          onClick={(e) => { e.stopPropagation(); setTaskId3D(m.taskId); }}
                          title="Usa per operazioni"
                          style={{
                            padding: '8px 12px',
                            fontSize: 11,
                            color: colors.textSecondary,
                            background: 'transparent',
                            border: `1px solid ${colors.borderColor}`,
                            borderRadius: 4,
                            cursor: 'pointer',
                          }}
                        >
                          Usa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}

        {/* ================================================================== */}
        {/* ERROR */}
        {/* ================================================================== */}
        {error && (
          <div style={{ margin: '0 12px 12px', padding: 10, fontSize: 11, color: '#ef4444', background: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>
            {error}
          </div>
        )}

        {/* ================================================================== */}
        {/* RESULTS (Images) */}
        {/* ================================================================== */}
        {images.length > 0 && (mainTab === 'generate' || mainTab === 'edit') && (
          <Section title={`Risultati (${images.length})`} colors={colors}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {images.map(img => (
                <div
                  key={img.id}
                  style={{
                    borderRadius: 6,
                    overflow: 'hidden',
                    border: `1px solid ${colors.borderColor}`,
                    position: 'relative',
                  }}
                >
                  <img
                    src={img.url}
                    alt=""
                    style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 4,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    display: 'flex',
                    gap: 4,
                  }}>
                    <button
                      onClick={() => addToCanvas(img)}
                      style={{
                        flex: 1,
                        padding: '4px 6px',
                        fontSize: 9,
                        color: '#fff',
                        background: colors.accent,
                        border: 'none',
                        borderRadius: 3,
                        cursor: 'pointer',
                      }}
                    >
                      Aggiungi
                    </button>
                    <button
                      onClick={() => useForEdit(img.url)}
                      title="Modifica AI"
                      style={{
                        padding: '4px 6px',
                        fontSize: 9,
                        color: '#fff',
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: 3,
                        cursor: 'pointer',
                      }}
                    >
                      <Wand2 size={10} />
                    </button>
                    <button
                      onClick={() => useForAdjust(img.url)}
                      title="Regola"
                      style={{
                        padding: '4px 6px',
                        fontSize: 9,
                        color: '#fff',
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: 3,
                        cursor: 'pointer',
                      }}
                    >
                      <SlidersHorizontal size={10} />
                    </button>
                    <button
                      onClick={() => useFor3D(img.url)}
                      title="Converti in 3D"
                      style={{
                        padding: '4px 6px',
                        fontSize: 9,
                        color: '#fff',
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: 3,
                        cursor: 'pointer',
                      }}
                    >
                      <Box size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Section>
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
