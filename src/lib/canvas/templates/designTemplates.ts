/**
 * Design Templates
 *
 * Fetches design templates from Supabase.
 * Templates are stored in the database, not hardcoded.
 */

import { supabase, isSupabaseConfigured } from '../../supabase';

export interface DesignTemplate {
  id: string;
  name: string;
  type: string;  // 'hero', 'features', 'pricing', 'testimonials', 'about', 'cta', 'footer', 'services', 'projects'
  style: string; // 'dark', 'light', 'gradient', 'minimal', 'playful', 'glass'
  tags: string[];
  description: string;
  json_structure: Record<string, unknown>;
}

/**
 * Fetch design templates from Supabase
 */
export async function fetchDesignTemplates(
  options?: {
    type?: string;
    style?: string;
    tags?: string[];
    limit?: number;
  }
): Promise<DesignTemplate[]> {
  if (!isSupabaseConfigured) {
    console.warn('[DesignTemplates] Supabase not configured');
    return [];
  }

  try {
    let query = supabase
      .from('design_templates')
      .select('*');

    if (options?.type) {
      query = query.eq('type', options.type);
    }
    if (options?.style) {
      query = query.eq('style', options.style);
    }
    if (options?.tags && options.tags.length > 0) {
      query = query.contains('tags', options.tags);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[DesignTemplates] Fetch error:', error);
      return [];
    }

    return (data || []) as DesignTemplate[];
  } catch (err) {
    console.error('[DesignTemplates] Fetch failed:', err);
    return [];
  }
}

/**
 * Get templates for AI prompt based on context
 *
 * Strategy: Select diverse templates from ALL sources (not just Hanzo)
 * to give the AI varied, high-quality examples across different styles
 */
export async function getTemplatesForAIPrompt(
  context?: {
    pageType?: string; // 'portfolio', 'landing', 'agency', 'saas'
    preferredStyle?: string; // 'dark', 'light', 'playful', 'minimal', 'glass'
  }
): Promise<DesignTemplate[]> {
  if (!isSupabaseConfigured) {
    console.warn('[DesignTemplates] Supabase not configured');
    return [];
  }

  try {
    const { data: allTemplates, error } = await supabase
      .from('design_templates')
      .select('*');

    if (error || !allTemplates || allTemplates.length === 0) {
      console.error('[DesignTemplates] Fetch error:', error);
      return [];
    }

    // Shuffle array for randomness (Fisher-Yates)
    const shuffled = [...allTemplates];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // If preferred style is specified, prioritize matching templates
    let candidates = shuffled;
    if (context?.preferredStyle) {
      const styleMatches = shuffled.filter(t =>
        t.style === context.preferredStyle ||
        t.tags?.includes(context.preferredStyle)
      );
      const others = shuffled.filter(t =>
        t.style !== context.preferredStyle &&
        !t.tags?.includes(context.preferredStyle)
      );
      // Put matching styles first, but still include variety
      candidates = [...styleMatches, ...others];
    }

    // Select templates ensuring variety of types and sources
    const result: DesignTemplate[] = [];
    const selectedTypes = new Set<string>();
    const selectedSources = new Set<string>(); // Track source (Hanzo, Adele, Ezio, etc.)

    // Helper to get source from template name
    const getSource = (name: string): string => {
      if (name.startsWith('Hanzo')) return 'Hanzo';
      if (name.startsWith('Adele') || name.startsWith('ALF')) return 'Adele';
      if (name.includes('Ezio') || name.includes('Portfolio Split')) return 'Ezio';
      if (name.includes('Artemis')) return 'Artemis';
      if (name.includes('Dark Portfolio')) return 'Dark';
      if (name.includes('Cocktail')) return 'Cocktail';
      return 'Other';
    };

    // First pass: get diverse types AND sources
    for (const t of candidates) {
      if (result.length >= 6) break;
      const source = getSource(t.name);

      // Prefer templates that add new type OR new source
      if (!selectedTypes.has(t.type) || !selectedSources.has(source)) {
        // But don't over-represent any single source (max 2 per source)
        const sourceCount = result.filter(r => getSource(r.name) === source).length;
        if (sourceCount < 2) {
          result.push(t);
          selectedTypes.add(t.type);
          selectedSources.add(source);
        }
      }
    }

    // Second pass: fill up to 6 with any remaining variety
    for (const t of candidates) {
      if (result.length >= 6) break;
      if (!result.includes(t) && !selectedTypes.has(t.type)) {
        result.push(t);
        selectedTypes.add(t.type);
      }
    }

    console.log(`[DesignTemplates] Selected ${result.length} templates from ${selectedSources.size} sources:`,
      result.map(t => `${t.name} (${t.type}, ${t.style})`));

    return result;
  } catch (err) {
    console.error('[DesignTemplates] Fetch failed:', err);
    return [];
  }
}
