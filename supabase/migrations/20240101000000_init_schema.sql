-- ==============================================================================
-- ESTANTE — MIGRAÇÃO INICIAL (TABELAS, ÍNDICES E POLÍTICAS RLS)
-- ==============================================================================

-- 1. TABELA DE PERFIS PÚBLICOS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para criar perfil automaticamente no cadastro de novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Usuário'),
    NEW.raw_user_meta_data->>'avatar_url',
    LOWER(SPLIT_PART(NEW.email, '@', 1)) || '_' || SUBSTRING(NEW.id::TEXT, 1, 4)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. TABELA DE ITENS DA ESTANTE (LIVROS, JOGOS, FILMES E SÉRIES)
CREATE TABLE IF NOT EXISTS public.media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('book', 'game', 'movie', 'series')),
  external_id TEXT,
  external_source TEXT,
  title TEXT NOT NULL,
  cover_url TEXT,
  synopsis TEXT,
  year INTEGER,
  creator TEXT,
  status TEXT NOT NULL DEFAULT 'wishlist' CHECK (status IN ('wishlist', 'in_progress', 'completed')),
  rating NUMERIC(3, 1) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 10)),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_items_user_category ON public.media_items (user_id, category);
CREATE INDEX IF NOT EXISTS idx_media_items_user_status ON public.media_items (user_id, status);
CREATE INDEX IF NOT EXISTS idx_media_items_created_at ON public.media_items (created_at DESC);

-- 3. TABELA DE RESENHAS PESSOAIS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL UNIQUE REFERENCES public.media_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  is_public BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_item_id ON public.reviews (item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_public ON public.reviews (is_public);

-- 4. TABELA DE LOGS DE ATIVIDADE DIÁRIA (STREAKS)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('book', 'game', 'movie', 'series')),
  item_id UUID REFERENCES public.media_items(id) ON DELETE SET NULL,
  activity_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_category_date UNIQUE (user_id, category, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_cat_date ON public.activity_logs (user_id, category, activity_date DESC);

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para 'profiles'
CREATE POLICY "Perfis são visíveis publicamente"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem atualizar apenas o próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para 'media_items'
CREATE POLICY "Usuários visualizam seus próprios itens ou itens de resenhas públicas"
  ON public.media_items FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.reviews
      WHERE reviews.item_id = media_items.id
        AND reviews.is_public = true
    )
  );

CREATE POLICY "Usuários inserem seus próprios itens"
  ON public.media_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários atualizam seus próprios itens"
  ON public.media_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários excluem seus próprios itens"
  ON public.media_items FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para 'reviews'
CREATE POLICY "Usuários lêem suas próprias resenhas ou resenhas públicas"
  ON public.reviews FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Usuários inserem suas próprias resenhas"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários atualizam suas próprias resenhas"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários excluem suas próprias resenhas"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para 'activity_logs'
CREATE POLICY "Usuários lêem seus próprios logs de atividade"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários registram atividade para si mesmos"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários atualizam seus próprios logs"
  ON public.activity_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários excluem seus próprios logs"
  ON public.activity_logs FOR DELETE
  USING (auth.uid() = user_id);
