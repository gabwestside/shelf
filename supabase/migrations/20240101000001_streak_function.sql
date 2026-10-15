-- ==============================================================================
-- ESTANTE — FUNÇÃO DE CÁLCULO DE STREAK (FUSO AMERICA/FORTALEZA)
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
  -- Se registrou hoje: o streak começa a contar a partir de hoje
  -- Se não registrou hoje, mas registrou ontem: o streak continua ativo até ontem (o usuário ainda pode registrar hoje sem perder)
  -- Se não registrou nem hoje nem ontem: o streak expirou e foi zerado
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
        -- Sequência interrompida
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
