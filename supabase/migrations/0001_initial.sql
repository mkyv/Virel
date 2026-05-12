-- ─────────────────────────────────────────────────────────────────────────────
-- 0001_initial — esquema base del boilerplate
-- ─────────────────────────────────────────────────────────────────────────────
-- Aplicar con `supabase db push` (CLI) o copiar/pegar en el SQL Editor.
-- Pensado para correr una sola vez al inicializar el proyecto.
-- ─────────────────────────────────────────────────────────────────────────────


-- ─── profiles ────────────────────────────────────────────────────────────────
-- Info del usuario más allá de auth.users. La fila se crea automáticamente
-- por el trigger on_auth_user_created (más abajo).
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  email text,
  customer_id text,
  variant_id text,
  has_access boolean DEFAULT false,
  subscription_status text,
  subscription_renews_at timestamp with time zone,
  locale text NOT NULL DEFAULT 'en',
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Trigger: al crear un user en auth.users, insertar fila en public.profiles.
-- Lo usa /api/auth/callback para sincronizar la cookie APP_LOCALE con profiles.locale.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── leads ───────────────────────────────────────────────────────────────────
-- Emails capturados desde la landing (waitlist / newsletter).
-- /api/lead inserta acá con onConflict: do-nothing por unique(email).
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);
