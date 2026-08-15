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
