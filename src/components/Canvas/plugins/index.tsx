/**
 * Plugin System Index
 *
 * Exports all plugins and the plugin panel
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';

// Plugin Panel
export { PluginPanel, type Plugin, type PluginComponentProps } from './PluginPanel';

// Individual Plugins
export { UnsplashPlugin } from './UnsplashPlugin';
export { GoogleFontsPlugin } from './GoogleFontsPlugin';
export { GradientsPlugin } from './GradientsPlugin';
export { ExportPlugin } from './ExportPlugin';
export { TemplatesPlugin } from './TemplatesPlugin';
export { TextEffectsPlugin } from './TextEffectsPlugin';
export { AIImagePlugin } from './AIImagePlugin';
export { BrandKitPlugin } from './BrandKitPlugin';
export { MockupsPlugin } from './MockupsPlugin';
export { PrintExportPlugin } from './PrintExportPlugin';

// Import plugins for registry
import { UnsplashPlugin } from './UnsplashPlugin';
import { GoogleFontsPlugin } from './GoogleFontsPlugin';
import { GradientsPlugin } from './GradientsPlugin';
import { ExportPlugin } from './ExportPlugin';
import { TemplatesPlugin } from './TemplatesPlugin';
import { TextEffectsPlugin } from './TextEffectsPlugin';
import { AIImagePlugin } from './AIImagePlugin';
import { BrandKitPlugin } from './BrandKitPlugin';
import { MockupsPlugin } from './MockupsPlugin';
import { PrintExportPlugin } from './PrintExportPlugin';
import { Plugin } from './PluginPanel';

// Plugin Registry
export const availablePlugins: Plugin[] = [
  // Templates (Featured)
  {
    id: 'templates',
    name: 'Templates',
    description: 'Design pronti all\'uso',
    icon: <LucideIcons.Layout size={18} />,
    component: TemplatesPlugin,
    category: 'design',
  },

  // Brand
  {
    id: 'brand-kit',
    name: 'Brand Kit',
    description: 'Colori, font, loghi',
    icon: <LucideIcons.Briefcase size={18} />,
    component: BrandKitPlugin,
    category: 'design',
  },

  // Media
  {
    id: 'unsplash',
    name: 'Unsplash',
    description: 'Foto stock gratuite',
    icon: <LucideIcons.Image size={18} />,
    component: UnsplashPlugin,
    category: 'media',
  },
  {
    id: 'ai-image',
    name: 'AI Image',
    description: 'Genera con AI',
    icon: <LucideIcons.Wand2 size={18} />,
    component: AIImagePlugin,
    category: 'media',
  },

  // Design
  {
    id: 'gradients',
    name: 'Gradienti',
    description: 'Crea sfondi sfumati',
    icon: <LucideIcons.Palette size={18} />,
    component: GradientsPlugin,
    category: 'design',
  },
  {
    id: 'google-fonts',
    name: 'Google Fonts',
    description: 'Esplora tipografie',
    icon: <LucideIcons.Type size={18} />,
    component: GoogleFontsPlugin,
    category: 'design',
  },
  {
    id: 'text-effects',
    name: 'Effetti Testo',
    description: 'Ombre, contorni, 3D',
    icon: <LucideIcons.Sparkles size={18} />,
    component: TextEffectsPlugin,
    category: 'design',
  },

  // Mockups
  {
    id: 'mockups',
    name: 'Mockups',
    description: 'T-shirt, poster, packaging',
    icon: <LucideIcons.ShoppingBag size={18} />,
    component: MockupsPlugin,
    category: 'design',
  },

  // Export
  {
    id: 'export',
    name: 'Esporta',
    description: 'PNG, JPG, SVG',
    icon: <LucideIcons.Download size={18} />,
    component: ExportPlugin,
    category: 'export',
  },
  {
    id: 'print-export',
    name: 'Stampa Pro',
    description: 'PDF, CMYK, abbondanza',
    icon: <LucideIcons.Printer size={18} />,
    component: PrintExportPlugin,
    category: 'export',
  },
];
