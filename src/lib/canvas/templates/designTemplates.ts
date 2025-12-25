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
 */
export async function getTemplatesForAIPrompt(
  context?: {
    pageType?: string; // 'portfolio', 'landing', 'agency', 'saas'
    preferredStyle?: string; // 'dark', 'light', 'playful', 'minimal', 'glass'
  }
): Promise<DesignTemplate[]> {
  // Fetch relevant templates based on context
  const templates = await fetchDesignTemplates({
    style: context?.preferredStyle,
    tags: context?.pageType ? [context.pageType] : undefined,
    limit: 4
  });

  // If no specific matches, get a general variety
  if (templates.length < 2) {
    return fetchDesignTemplates({ limit: 4 });
  }

  return templates;
}
