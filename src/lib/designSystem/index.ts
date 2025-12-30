/**
 * Design System
 *
 * Complete design system for AI-powered design generation:
 * - Style Presets: Complete design systems (Framer Dark, Linear, Stripe, etc.)
 * - Component Library: Pre-designed beautiful components
 * - Few-Shot Examples: Concrete examples for AI learning
 *
 * Usage:
 * ```typescript
 * import {
 *   STYLE_PRESETS,
 *   COMPONENT_LIBRARY,
 *   FEW_SHOT_EXAMPLES,
 *   getPresetById,
 *   getComponentsByCategory,
 * } from '@/lib/designSystem';
 * ```
 */

// Style Presets
export {
  STYLE_PRESETS,
  FRAMER_DARK,
  LINEAR_DARK,
  STRIPE_GRADIENT,
  MINIMAL_LIGHT,
  BRUTALIST,
  GLASSMORPHISM,
  getPresetById,
  getPresetsByTheme,
  // Topic-based color palettes
  TOPIC_PALETTES,
  getPalettesByTopic,
  getPalette,
  formatPaletteForPrompt,
  type StylePreset,
  type ComponentStyle,
  type TopicPalette,
} from './stylePresets';

// Component Library
export {
  COMPONENT_LIBRARY,
  HERO_CENTERED_DARK,
  HERO_SPLIT_IMAGE,
  FEATURES_GRID_3COL,
  TESTIMONIAL_CARD,
  PRICING_CARD_HIGHLIGHTED,
  CTA_GRADIENT,
  FOOTER_SIMPLE,
  NAVBAR_TRANSPARENT,
  STATS_ROW,
  getComponentById,
  getComponentsByCategory,
  searchComponents,
  getAllCategories,
  type ComponentBlock,
  type ComponentCategory,
} from './componentLibrary';

// Few-Shot Examples
export {
  FEW_SHOT_EXAMPLES,
  getExamplesByCategory,
  getExamplesByStyle,
  getExampleById,
  formatExamplesForPrompt,
  type FewShotExample,
} from './fewShotExamples';
