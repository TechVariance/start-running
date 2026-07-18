-- =========================================================
-- Natação por estilo (segmentos) + biblioteca de exercícios customizável
-- =========================================================

-- SWIM_SEGMENTS — metragem e tempo por estilo dentro de uma sessão de natação.
-- activities.distance_m/elapsed_s/stroke seguem como o resumo da sessão (soma dos
-- segmentos + estilo predominante), derivado a partir daqui.
CREATE TABLE public.swim_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  segment_number INT NOT NULL,
  stroke TEXT NOT NULL CHECK (stroke IN ('livre', 'costas', 'peito', 'borboleta', 'medley')),
  distance_m INT NOT NULL,
  elapsed_s INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX swim_segments_activity_idx ON public.swim_segments(activity_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.swim_segments TO authenticated;
GRANT ALL ON public.swim_segments TO service_role;
ALTER TABLE public.swim_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sgs r" ON public.swim_segments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own sgs w" ON public.swim_segments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sgs u" ON public.swim_segments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sgs d" ON public.swim_segments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- EXERCISES — permite cadastro do próprio atleta, além da biblioteca global (user_id NULL)
ALTER TABLE public.exercises ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX exercises_user_idx ON public.exercises(user_id);

DROP POLICY "exercises r" ON public.exercises;
CREATE POLICY "exercises r" ON public.exercises FOR SELECT TO authenticated USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "exercises w" ON public.exercises FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "exercises u" ON public.exercises FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "exercises d" ON public.exercises FOR DELETE TO authenticated USING (auth.uid() = user_id);
GRANT INSERT, UPDATE, DELETE ON public.exercises TO authenticated;
