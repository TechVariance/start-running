-- =========================================================
-- Módulos 19 (Natação) e 20 (Musculação)
-- Ver especificacaomodulosnatacaomusculacao.md — PC-6: uma
-- carga só. activities/activity_metrics seguem sendo a
-- tabela guarda-chuva; modalidade nova só soma no mesmo
-- daily_load via recomputeDailyLoadForUser (inalterado).
-- =========================================================

-- ACTIVITIES: modalidade + campos específicos de natação
ALTER TABLE public.activities
  ADD COLUMN modality TEXT NOT NULL DEFAULT 'run' CHECK (modality IN ('run', 'swim', 'strength')),
  ADD COLUMN stroke TEXT CHECK (stroke IN ('livre', 'costas', 'peito', 'borboleta', 'medley')),
  ADD COLUMN pool_length_m INT CHECK (pool_length_m IN (25, 50));

CREATE INDEX activities_user_modality_idx ON public.activities(user_id, modality, started_at DESC);

-- ACTIVITY_METRICS: derivadas específicas de natação/força
ALTER TABLE public.activity_metrics
  ADD COLUMN stss NUMERIC(6,1),
  ADD COLUMN avg_pace_s_per_100m NUMERIC(6,1),
  ADD COLUMN tonnage_kg NUMERIC(9,1);

-- PROFILES: CSS (Critical Swim Speed) cacheado, mesmo padrão do threshold_pace_s_per_km
ALTER TABLE public.profiles
  ADD COLUMN css_pace_s_per_100m NUMERIC(5,1),
  ADD COLUMN css_pool_length_m INT CHECK (css_pool_length_m IN (25, 50)),
  ADD COLUMN css_tested_at TIMESTAMPTZ;

-- =========================================================
-- SWIM_TESTS — histórico do teste 400/200 (procedência do CSS, RF-19.6)
-- =========================================================
CREATE TABLE public.swim_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  pool_length_m INT NOT NULL CHECK (pool_length_m IN (25, 50)),
  t200_s NUMERIC(6,1) NOT NULL,
  t400_s NUMERIC(6,1) NOT NULL,
  css_pace_s_per_100m NUMERIC(5,1) NOT NULL,
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0.8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX swim_tests_user_idx ON public.swim_tests(user_id, tested_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.swim_tests TO authenticated;
GRANT ALL ON public.swim_tests TO service_role;
ALTER TABLE public.swim_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own st r" ON public.swim_tests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own st w" ON public.swim_tests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own st u" ON public.swim_tests FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own st d" ON public.swim_tests FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- EXERCISES — biblioteca básica de musculação (RF-20.2), sem vídeo nesta fase
-- Leitura liberada para todo autenticado; escrita reservada ao service_role (curadoria via migração)
-- =========================================================
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  equipment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.exercises TO authenticated;
GRANT ALL ON public.exercises TO service_role;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exercises r" ON public.exercises FOR SELECT TO authenticated USING (true);

INSERT INTO public.exercises (name, muscle_group, equipment) VALUES
  ('Agachamento livre', 'pernas', 'barra'),
  ('Levantamento terra', 'posterior', 'barra'),
  ('Supino reto', 'peito', 'barra'),
  ('Remada curvada', 'costas', 'barra'),
  ('Desenvolvimento militar', 'ombros', 'barra'),
  ('Afundo', 'pernas', 'halteres'),
  ('Stiff', 'posterior', 'halteres'),
  ('Rosca direta', 'bracos', 'halteres'),
  ('Tríceps testa', 'bracos', 'halteres'),
  ('Elevação lateral', 'ombros', 'halteres'),
  ('Leg press', 'pernas', 'maquina'),
  ('Cadeira extensora', 'pernas', 'maquina'),
  ('Mesa flexora', 'posterior', 'maquina'),
  ('Puxada frontal', 'costas', 'maquina'),
  ('Remada baixa', 'costas', 'cabo'),
  ('Tríceps corda', 'bracos', 'cabo'),
  ('Panturrilha em pé', 'panturrilha', 'maquina'),
  ('Elevação pélvica', 'gluteos', 'barra'),
  ('Prancha', 'core', 'peso_corporal'),
  ('Abdominal supra', 'core', 'peso_corporal'),
  ('Flexão de braço', 'peito', 'peso_corporal'),
  ('Barra fixa', 'costas', 'peso_corporal'),
  ('Agachamento búlgaro', 'pernas', 'halteres'),
  ('Kettlebell swing', 'posterior', 'kettlebell');

-- =========================================================
-- STRENGTH_SETS — registro por série (RF-20.1), <10s por série no app
-- =========================================================
CREATE TABLE public.strength_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id),
  set_number INT NOT NULL,
  reps INT NOT NULL,
  weight_kg NUMERIC(6,2) NOT NULL DEFAULT 0,
  rpe NUMERIC(3,1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX strength_sets_activity_idx ON public.strength_sets(activity_id);
CREATE INDEX strength_sets_user_exercise_idx ON public.strength_sets(user_id, exercise_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.strength_sets TO authenticated;
GRANT ALL ON public.strength_sets TO service_role;
ALTER TABLE public.strength_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ss r" ON public.strength_sets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own ss w" ON public.strength_sets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own ss u" ON public.strength_sets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own ss d" ON public.strength_sets FOR DELETE TO authenticated USING (auth.uid() = user_id);
