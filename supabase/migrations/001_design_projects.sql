-- Design Projects Table
-- Stores user design projects with canvas state

-- Create design_projects table
CREATE TABLE IF NOT EXISTS design_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Project metadata
  name TEXT NOT NULL DEFAULT 'Untitled Project',
  description TEXT,
  thumbnail_url TEXT,

  -- Canvas data (the actual design)
  canvas_data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Settings
  is_public BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster user queries
CREATE INDEX IF NOT EXISTS idx_design_projects_user_id ON design_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_design_projects_updated_at ON design_projects(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE design_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own projects
DROP POLICY IF EXISTS "Users can view own projects" ON design_projects;
CREATE POLICY "Users can view own projects" ON design_projects
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

DROP POLICY IF EXISTS "Users can create own projects" ON design_projects;
CREATE POLICY "Users can create own projects" ON design_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON design_projects;
CREATE POLICY "Users can update own projects" ON design_projects
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON design_projects;
CREATE POLICY "Users can delete own projects" ON design_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_design_projects_updated_at ON design_projects;
CREATE TRIGGER update_design_projects_updated_at
  BEFORE UPDATE ON design_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Note: design_templates table is created in 003_design_templates.sql with proper structure
