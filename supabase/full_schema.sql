-- ==============================================================================
-- ESTANTE — SCHEMA COMPLETO (COLE E EXECUTE NO SQL EDITOR DO SUPABASE)
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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para 'profiles'
DROP POLICY IF EXISTS "Perfis são visíveis publicamente" ON public.profiles;
CREATE POLICY "Perfis são visíveis publicamente"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Usuários podem atualizar apenas o próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem atualizar apenas o próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para 'media_items'
DROP POLICY IF EXISTS "Usuários visualizam seus próprios itens ou itens de resenhas públicas" ON public.media_items;
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

DROP POLICY IF EXISTS "Usuários inserem seus próprios itens" ON public.media_items;
CREATE POLICY "Usuários inserem seus próprios itens"
  ON public.media_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários atualizam seus próprios itens" ON public.media_items;
CREATE POLICY "Usuários atualizam seus próprios itens"
  ON public.media_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários excluem seus próprios itens" ON public.media_items;
CREATE POLICY "Usuários excluem seus próprios itens"
  ON public.media_items FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para 'reviews'
DROP POLICY IF EXISTS "Usuários lêem suas próprias resenhas ou resenhas públicas" ON public.reviews;
CREATE POLICY "Usuários lêem suas próprias resenhas ou resenhas públicas"
  ON public.reviews FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

DROP POLICY IF EXISTS "Usuários inserem suas próprias resenhas" ON public.reviews;
CREATE POLICY "Usuários inserem suas próprias resenhas"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários atualizam suas próprias resenhas" ON public.reviews;
CREATE POLICY "Usuários atualizam suas próprias resenhas"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários excluem suas próprias resenhas" ON public.reviews;
CREATE POLICY "Usuários excluem suas próprias resenhas"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para 'activity_logs'
DROP POLICY IF EXISTS "Usuários lêem seus próprios logs de atividade" ON public.activity_logs;
CREATE POLICY "Usuários lêem seus próprios logs de atividade"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários registram atividade para si mesmos" ON public.activity_logs;
CREATE POLICY "Usuários registram atividade para si mesmos"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários atualizam seus próprios logs" ON public.activity_logs;
CREATE POLICY "Usuários atualizam seus próprios logs"
  ON public.activity_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários excluem seus próprios logs" ON public.activity_logs;
CREATE POLICY "Usuários excluem seus próprios logs"
  ON public.activity_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- FUNÇÃO DE CÁLCULO DE STREAK (FUSO AMERICA/FORTALEZA)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.calculate_streak(
  p_user_id UUID,
  p_category TEXT,
  p_today_date DATE DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'America/Fortaleza')::DATE
)
RETURNS TABLE (
  current_streak INTEGER,
  max_streak INTEGER,
  total_days INTEGER,
  logged_today BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_logged_today BOOLEAN := false;
  v_has_yesterday BOOLEAN := false;
  v_current_streak INTEGER := 0;
  v_max_streak INTEGER := 0;
  v_total_days INTEGER := 0;
  v_curr_run INTEGER := 0;
  v_prev_date DATE := NULL;
  v_rec RECORD;
  v_expected_date DATE;
BEGIN
  -- 1. Verifica se houve registro hoje na categoria
  SELECT EXISTS (
    SELECT 1 FROM public.activity_logs
    WHERE user_id = p_user_id
      AND category = p_category
      AND activity_date = p_today_date
  ) INTO v_logged_today;

  -- 2. Verifica se houve registro ontem
  SELECT EXISTS (
    SELECT 1 FROM public.activity_logs
    WHERE user_id = p_user_id
      AND category = p_category
      AND activity_date = (p_today_date - INTERVAL '1 day')::DATE
  ) INTO v_has_yesterday;

  -- 3. Total absoluto de dias com atividade nesta categoria
  SELECT COUNT(*) INTO v_total_days
  FROM public.activity_logs
  WHERE user_id = p_user_id
    AND category = p_category;

  -- Se nunca houve registros, retorna zerado
  IF v_total_days = 0 THEN
    RETURN QUERY SELECT 0, 0, 0, false;
    RETURN;
  END IF;

  -- 4. Cálculo do Streak Atual:
  IF v_logged_today THEN
    v_expected_date := p_today_date;
  ELSIF v_has_yesterday THEN
    v_expected_date := (p_today_date - INTERVAL '1 day')::DATE;
  ELSE
    v_expected_date := NULL;
  END IF;

  IF v_expected_date IS NOT NULL THEN
    FOR v_rec IN
      SELECT activity_date
      FROM public.activity_logs
      WHERE user_id = p_user_id
        AND category = p_category
        AND activity_date <= v_expected_date
      ORDER BY activity_date DESC
    LOOP
      IF v_rec.activity_date = v_expected_date THEN
        v_current_streak := v_current_streak + 1;
        v_expected_date := (v_expected_date - INTERVAL '1 day')::DATE;
      ELSE
        EXIT;
      END IF;
    END LOOP;
  ELSE
    v_current_streak := 0;
  END IF;

  -- 5. Cálculo do Maior Streak Histórico (max_streak)
  v_prev_date := NULL;
  v_curr_run := 0;
  v_max_streak := 0;

  FOR v_rec IN
    SELECT activity_date
    FROM public.activity_logs
    WHERE user_id = p_user_id
      AND category = p_category
    ORDER BY activity_date ASC
  LOOP
    IF v_prev_date IS NULL THEN
      v_curr_run := 1;
    ELSIF v_rec.activity_date = (v_prev_date + INTERVAL '1 day')::DATE THEN
      v_curr_run := v_curr_run + 1;
    ELSE
      v_curr_run := 1;
    END IF;

    IF v_curr_run > v_max_streak THEN
      v_max_streak := v_curr_run;
    END IF;

    v_prev_date := v_rec.activity_date;
  END LOOP;

  RETURN QUERY SELECT v_current_streak, v_max_streak, v_total_days, v_logged_today;
END;
$$;
