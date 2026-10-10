-- ===== 20260815_init_schema.sql =====
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  credits_left INT DEFAULT 0,
  country_code TEXT DEFAULT 'US',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_email TEXT,
  original_image_url TEXT NOT NULL,
  upscaled_image_url TEXT,
  target_resolution TEXT DEFAULT '4000px-4k',
  enhancement_type TEXT DEFAULT 'general',
  currency TEXT DEFAULT 'USD',
  amount_paid NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Users can view own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Orders RLS Policies
CREATE POLICY "Users can view own orders." ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders." ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Guests can also insert orders, handled by application logic bypassing RLS using service role key,
-- or we can allow anonymous inserts and rely on edge function validation.

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('raw-uploads', 'raw-uploads', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('upscaled-outputs', 'upscaled-outputs', true) ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Users can upload raw images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'raw-uploads' AND auth.uid() = owner);
CREATE POLICY "Users can view own raw images" ON storage.objects FOR SELECT USING (bucket_id = 'raw-uploads' AND auth.uid() = owner);

CREATE POLICY "Public can view upscaled outputs" ON storage.objects FOR SELECT USING (bucket_id = 'upscaled-outputs');

-- ===== 20260816_admin_role.sql =====
-- Add role column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Set user to admin (for manual setup, the user can run this or we do it via environment variable check in app)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';

-- ===== 20260817_pricing_tier.sql =====
CREATE TABLE IF NOT EXISTS public.pricing_settings (
  id TEXT PRIMARY KEY, -- 'web', '4k', '8k'
  usd_price NUMERIC NOT NULL,
  pkr_price NUMERIC NOT NULL,
  inr_price NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Default data
INSERT INTO public.pricing_settings (id, usd_price, pkr_price, inr_price) VALUES
('web', 1.99, 499, 149),
('4k', 4.99, 1299, 399),
('8k', 9.99, 2499, 799)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view pricing" ON public.pricing_settings FOR SELECT USING (true);
CREATE POLICY "Admin can update pricing" ON public.pricing_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- ===== 20260818_security_fixes.sql =====
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

