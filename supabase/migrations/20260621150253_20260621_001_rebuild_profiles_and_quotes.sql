
-- ============================================================
-- PROFILES TABLE
-- ============================================================
DROP TABLE IF EXISTS public.quotes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text,
  company_name    text NOT NULL DEFAULT '',
  owner_name      text NOT NULL DEFAULT '',
  phone           text,
  website         text,
  license_number  text,
  payment_terms   text,
  logo_url        text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "insert_own_profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "delete_own_profile" ON public.profiles
  FOR DELETE TO authenticated USING (auth.uid() = id);

-- ============================================================
-- QUOTES TABLE
-- ============================================================
CREATE TABLE public.quotes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_name      text NOT NULL,
  customer_address   text NOT NULL,
  customer_phone     text NOT NULL,
  customer_email     text,
  services           jsonb NOT NULL DEFAULT '[]'::jsonb,
  property_size      text NOT NULL,
  stories            text NOT NULL,
  surface_condition  text NOT NULL,
  access_difficulty  text NOT NULL,
  special_notes      text,
  generated_content  text,
  total_amount       numeric NOT NULL DEFAULT 0,
  line_items         jsonb,
  status             text NOT NULL DEFAULT 'draft',
  valid_until        date NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_quotes" ON public.quotes
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_quotes" ON public.quotes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_quotes" ON public.quotes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_quotes" ON public.quotes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- BACKFILL: create profiles for existing auth users
-- ============================================================
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
