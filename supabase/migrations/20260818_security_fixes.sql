-- 1. Privilege escalation: "Users can update own profile" let anyone set role='admin'
--    (and give themselves credits) from the browser. Block changes to protected columns
--    unless the request comes from the service role (server code).
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  -- Only browser users (anon/authenticated) are restricted; server (service_role) and SQL editor are not.
  IF auth.role() IN ('anon', 'authenticated') THEN
    NEW.role := OLD.role;
    NEW.credits_left := OLD.credits_left;
    NEW.id := OLD.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_columns ON public.profiles;
CREATE TRIGGER protect_profile_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();

-- 2. Pricing: the code defaults say web = Rs. 300, this seed said 499. Pick one.
--    (kept at 499 here; change to 300 if that is the real price)
UPDATE public.pricing_settings SET pkr_price = 499 WHERE id = 'web' AND pkr_price = 300;

-- 3. app_settings is read by lib/pricing-store.ts but was never created.
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read app settings" ON public.app_settings;
CREATE POLICY "Public can read app settings" ON public.app_settings FOR SELECT USING (key = 'pricing_config');

-- 4. Customer photos must not be public.
UPDATE storage.buckets SET public = false WHERE id = 'raw-uploads';

-- 5. Indexes for the lookups the dashboard/claim code does on every load.
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS orders_guest_email_idx ON public.orders (guest_email);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status);
