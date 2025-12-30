-- Crea tabella user_profiles (necessaria per il trigger on_auth_user_created)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Abilita RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy per leggere il proprio profilo
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy per aggiornare il proprio profilo  
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy per inserire (per il trigger)
DROP POLICY IF EXISTS "Service role can insert" ON public.user_profiles;
CREATE POLICY "Service role can insert" ON public.user_profiles
  FOR INSERT WITH CHECK (true);
