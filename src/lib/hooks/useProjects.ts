/**
 * useProjects Hook
 *
 * Manages design projects with Supabase
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useCanvasStore } from '../canvas/canvasStore';

export interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  updated_at: string;
  is_public: boolean;
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // Get canvas store methods (stable references)
  const elements = useCanvasStore((state) => state.elements);
  const pages = useCanvasStore((state) => state.pages);
  const currentPageId = useCanvasStore((state) => state.currentPageId);
  const canvasSettings = useCanvasStore((state) => state.canvasSettings);
  const loadCanvasState = useCanvasStore((state) => state.loadState);

  // Function to get current canvas state (called when saving)
  const getCanvasState = useCallback(() => ({
    elements,
    pages,
    currentPageId,
    canvasSettings,
  }), [elements, pages, currentPageId, canvasSettings]);

  // Fetch all user projects
  const fetchProjects = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase non configurato. Aggiungi VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY al file .env');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setProjects([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('design_projects')
        .select('id, name, description, thumbnail_url, updated_at, is_public')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (fetchError) {
        // Handle table not found error gracefully
        if (fetchError.code === '42P01') {
          console.warn('design_projects table not found. Please run the migration.');
          setProjects([]);
          setError('Database not configured. Projects feature unavailable.');
          return;
        }
        throw fetchError;
      }

      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new project
  const createProject = useCallback(async (name: string = 'Untitled Project'): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to create a project');
      }

      const canvasState = getCanvasState();

      const { data, error: insertError } = await supabase
        .from('design_projects')
        .insert({
          user_id: user.id,
          name,
          canvas_data: canvasState,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      setCurrentProjectId(data.id);
      await fetchProjects();

      return data.id;
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
      return null;
    } finally {
      setLoading(false);
    }
  }, [getCanvasState, fetchProjects]);

  // Save current project
  const saveProject = useCallback(async (projectId?: string, name?: string): Promise<boolean> => {
    const id = projectId || currentProjectId;

    if (!id) {
      // No current project, create a new one
      const newId = await createProject(name);
      return newId !== null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to save');
      }

      const canvasState = getCanvasState();

      const updates: any = {
        canvas_data: canvasState,
      };

      if (name) {
        updates.name = name;
      }

      const { error: updateError } = await supabase
        .from('design_projects')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await fetchProjects();
      return true;
    } catch (err) {
      console.error('Error saving project:', err);
      setError(err instanceof Error ? err.message : 'Failed to save project');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentProjectId, getCanvasState, createProject, fetchProjects]);

  // Load a project
  const loadProject = useCallback(async (projectId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('design_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (fetchError) throw fetchError;

      if (data?.canvas_data) {
        loadCanvasState(data.canvas_data);
        setCurrentProjectId(projectId);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error loading project:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadCanvasState]);

  // Delete a project
  const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in to delete');
      }

      const { error: deleteError } = await supabase
        .from('design_projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      if (currentProjectId === projectId) {
        setCurrentProjectId(null);
      }

      await fetchProjects();
      return true;
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentProjectId, fetchProjects]);

  // Rename a project
  const renameProject = useCallback(async (projectId: string, newName: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in');
      }

      const { error: updateError } = await supabase
        .from('design_projects')
        .update({ name: newName })
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await fetchProjects();
      return true;
    } catch (err) {
      console.error('Error renaming project:', err);
      setError(err instanceof Error ? err.message : 'Failed to rename project');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProjects]);

  // Duplicate a project
  const duplicateProject = useCallback(async (projectId: string): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('You must be logged in');
      }

      // Fetch original project
      const { data: original, error: fetchError } = await supabase
        .from('design_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (fetchError) throw fetchError;

      // Create duplicate
      const { data: duplicate, error: insertError } = await supabase
        .from('design_projects')
        .insert({
          user_id: user.id,
          name: `${original.name} (Copy)`,
          description: original.description,
          canvas_data: original.canvas_data,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      await fetchProjects();
      return duplicate.id;
    } catch (err) {
      console.error('Error duplicating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to duplicate project');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchProjects]);

  // Load projects on mount (only once)
  useEffect(() => {
    if (!hasFetched.current && isSupabaseConfigured) {
      hasFetched.current = true;
      fetchProjects();
    }
  }, []);

  return {
    projects,
    loading,
    error,
    currentProjectId,
    setCurrentProjectId,
    fetchProjects,
    createProject,
    saveProject,
    loadProject,
    deleteProject,
    renameProject,
    duplicateProject,
  };
}

export default useProjects;
