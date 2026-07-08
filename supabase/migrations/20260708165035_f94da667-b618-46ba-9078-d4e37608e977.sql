
-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  sex TEXT CHECK (sex IN ('M','F','X')),
  birth_date DATE,
  weight_kg NUMERIC(5,2),
  hr_rest INT,
  hr_max INT,
  lthr INT,
  threshold_pace_s_per_km INT,
  vo2max NUMERIC(4,1),
  self_level TEXT,
  weekly_volume_km NUMERIC(5,1),
  zone_model INT NOT NULL DEFAULT 5,
  zone_anchor TEXT NOT NULL DEFAULT 'pct_lthr',
  onboarded BOOLEAN NOT NULL DEFAULT false,
  consent_analytics BOOLEAN NOT NULL DEFAULT true,
  consent_marketing BOOLEAN NOT NULL DEFAULT false,
  consent_share_anon BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile r" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own profile w" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own profile u" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own profile d" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- ACTIVITIES
-- =========================================================
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','demo')),
  status TEXT NOT NULL DEFAULT 'concluido',
  distance_m INT,
  elapsed_s INT NOT NULL,
  moving_s INT,
  avg_pace_s_per_km INT,
  avg_hr INT,
  max_hr INT,
  elevation_gain_m INT,
  srpe NUMERIC(3,1),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX activities_user_day_idx ON public.activities(user_id, started_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own act r" ON public.activities FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own act w" ON public.activities FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own act u" ON public.activities FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own act d" ON public.activities FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- ACTIVITY_METRICS
-- =========================================================
CREATE TABLE public.activity_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  methodology_version TEXT NOT NULL,
  confidence NUMERIC(3,2),
  splits JSONB,
  time_in_zone JSONB,
  trimp NUMERIC(6,1),
  hrtss NUMERIC(6,1),
  rtss NUMERIC(6,1),
  srpe_load NUMERIC(6,1),
  session_load NUMERIC(6,1),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(activity_id, methodology_version)
);
CREATE INDEX activity_metrics_user_idx ON public.activity_metrics(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_metrics TO authenticated;
GRANT ALL ON public.activity_metrics TO service_role;
ALTER TABLE public.activity_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own am r" ON public.activity_metrics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own am w" ON public.activity_metrics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own am u" ON public.activity_metrics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own am d" ON public.activity_metrics FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- DAILY_LOAD
-- =========================================================
CREATE TABLE public.daily_load (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  daily_load NUMERIC(6,1) NOT NULL DEFAULT 0,
  ctl NUMERIC(6,2) NOT NULL DEFAULT 0,
  atl NUMERIC(6,2) NOT NULL DEFAULT 0,
  tsb NUMERIC(6,2) NOT NULL DEFAULT 0,
  acwr NUMERIC(4,2),
  acwr_alert BOOLEAN NOT NULL DEFAULT false,
  methodology_version TEXT NOT NULL,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, day)
);
CREATE INDEX daily_load_user_day_idx ON public.daily_load(user_id, day DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_load TO authenticated;
GRANT ALL ON public.daily_load TO service_role;
ALTER TABLE public.daily_load ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own dl r" ON public.daily_load FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own dl w" ON public.daily_load FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own dl u" ON public.daily_load FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own dl d" ON public.daily_load FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- WELLNESS
-- =========================================================
CREATE TABLE public.wellness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  hrv_rmssd NUMERIC(5,1),
  hrv_baseline NUMERIC(5,1),
  sleep_s INT,
  hr_rest_bpm INT,
  readiness INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, day)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wellness TO authenticated;
GRANT ALL ON public.wellness TO service_role;
ALTER TABLE public.wellness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own w r" ON public.wellness FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own w w" ON public.wellness FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own w u" ON public.wellness FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own w d" ON public.wellness FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- PLANS
-- =========================================================
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  race_name TEXT,
  race_distance_m INT,
  race_date DATE,
  target_time_s INT,
  phase TEXT,
  week INT,
  total_weeks INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own p r" ON public.plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own p w" ON public.plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own p u" ON public.plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own p d" ON public.plans FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- PLANNED_WORKOUTS
-- =========================================================
CREATE TABLE public.planned_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  type TEXT,
  title TEXT NOT NULL,
  description TEXT,
  target_zone TEXT,
  distance_m INT,
  duration_s INT,
  status TEXT NOT NULL DEFAULT 'planejado' CHECK (status IN ('planejado','executado','perdido')),
  matched_activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX pw_user_day_idx ON public.planned_workouts(user_id, day);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planned_workouts TO authenticated;
GRANT ALL ON public.planned_workouts TO service_role;
ALTER TABLE public.planned_workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pw r" ON public.planned_workouts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own pw w" ON public.planned_workouts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own pw u" ON public.planned_workouts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own pw d" ON public.planned_workouts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- COACH_MESSAGES
-- =========================================================
CREATE TABLE public.coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','coach')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX cm_user_time_idx ON public.coach_messages(user_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_messages TO authenticated;
GRANT ALL ON public.coach_messages TO service_role;
ALTER TABLE public.coach_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cm r" ON public.coach_messages FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own cm w" ON public.coach_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own cm d" ON public.coach_messages FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =========================================================
-- TRIGGERS
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER t_profiles_upd BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_activities_upd BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_wellness_upd BEFORE UPDATE ON public.wellness FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_plans_upd BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_pw_upd BEFORE UPDATE ON public.planned_workouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
