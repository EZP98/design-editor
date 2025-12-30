-- Tabella per salvare i modelli 3D generati
CREATE TABLE IF NOT EXISTS public.generated_models_3d (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID, -- opzionale, per collegare a un progetto

  -- Info modello
  name TEXT,
  operation TEXT NOT NULL, -- image-to-3d, text-to-3d, refine-3d, etc
  prompt TEXT, -- prompt usato per la generazione

  -- URLs
  source_image_url TEXT, -- immagine sorgente (per image-to-3d)
  model_url TEXT NOT NULL, -- URL del modello 3D (da Tripo o nostro storage)
  thumbnail_url TEXT, -- preview image
  storage_path TEXT, -- path nel nostro storage se salvato localmente

  -- Metadati Tripo
  tripo_task_id TEXT,
  format TEXT DEFAULT 'glb', -- glb, fbx, obj, stl, usdz

  -- Opzioni usate
  style_preset TEXT,
  face_limit INTEGER,
  pbr BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_models_3d_user ON public.generated_models_3d(user_id);
CREATE INDEX IF NOT EXISTS idx_models_3d_project ON public.generated_models_3d(project_id);

-- RLS
ALTER TABLE public.generated_models_3d ENABLE ROW LEVEL SECURITY;

-- Policy: utenti vedono solo i propri modelli
CREATE POLICY "Users can view own 3d models" ON public.generated_models_3d
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: utenti possono inserire
CREATE POLICY "Users can insert own 3d models" ON public.generated_models_3d
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: utenti possono aggiornare i propri
CREATE POLICY "Users can update own 3d models" ON public.generated_models_3d
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: utenti possono eliminare i propri
CREATE POLICY "Users can delete own 3d models" ON public.generated_models_3d
  FOR DELETE USING (auth.uid() = user_id);
