-- Add role column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Set user to admin (for manual setup, the user can run this or we do it via environment variable check in app)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
