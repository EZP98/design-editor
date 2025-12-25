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
 * Strategy: Fetch premium templates (Hanzo) with variety of types
 * to give the AI rich examples of hero, services, pricing, footer
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
    // Fetch premium templates (Hanzo series) - these are the richest examples
    // Order by name descending to get Hanzo templates first (they start with "Hanzo")
    const { data: allTemplates, error } = await supabase
      .from('design_templates')
      .select('*')
      .order('name', { ascending: true });

    if (error || !allTemplates) {
      console.error('[DesignTemplates] Fetch error:', error);
      return [];
    }

    // Prioritize Hanzo templates (premium/rich) and get variety of types
    const hanzoTemplates = allTemplates.filter(t => t.name.startsWith('Hanzo'));
    const otherTemplates = allTemplates.filter(t => !t.name.startsWith('Hanzo'));

    // Get one of each type from Hanzo, then fill with others
    const selectedTypes = new Set<string>();
    const result: DesignTemplate[] = [];

    // First, add all Hanzo templates (they cover hero, services, pricing, footer)
    for (const t of hanzoTemplates) {
      if (!selectedTypes.has(t.type)) {
        result.push(t);
        selectedTypes.add(t.type);
      }
    }

    // Fill up to 5 templates with variety from others
    for (const t of otherTemplates) {
      if (result.length >= 5) break;
      if (!selectedTypes.has(t.type)) {
        result.push(t);
        selectedTypes.add(t.type);
      }
    }

    console.log(`[DesignTemplates] Selected ${result.length} templates for AI:`,
      result.map(t => `${t.name} (${t.type})`));

    return result;
  } catch (err) {
    console.error('[DesignTemplates] Fetch failed:', err);
    return [];
  }
}
