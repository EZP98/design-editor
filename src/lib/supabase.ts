/**
 * Supabase Client Configuration
 *
 * Project: Objects (Design Editor)
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration - Objects (Design Editor) project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Create Supabase client only if configured
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any; // Will be null if not configured - hooks should check isSupabaseConfigured

// Types for our database
export interface DesignProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  canvas_data: Record<string, any>;
  is_public: boolean;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface DesignTemplate {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  canvas_data: Record<string, any>;
  category: string;
  created_at: string;
}

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      design_projects: {
        Row: DesignProject;
        Insert: Omit<DesignProject, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DesignProject, 'id' | 'created_at'>>;
      };
      design_templates: {
        Row: DesignTemplate;
        Insert: Omit<DesignTemplate, 'id' | 'created_at'>;
        Update: Partial<Omit<DesignTemplate, 'id' | 'created_at'>>;
      };
    };
  };
};
