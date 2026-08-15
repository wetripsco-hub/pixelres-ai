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
