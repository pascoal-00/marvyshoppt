CREATE TABLE public.site_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot text NOT NULL UNIQUE,
  image_url text,
  alt text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_images TO authenticated;
GRANT ALL ON public.site_images TO service_role;

ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public reads active site images" ON public.site_images FOR SELECT TO anon USING (active);
CREATE POLICY "authenticated reads site images" ON public.site_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage site images" ON public.site_images FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_images_updated_at BEFORE UPDATE ON public.site_images
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.ads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  image_url text,
  link_url text,
  cta_label text NOT NULL DEFAULT '',
  placement text NOT NULL DEFAULT 'home_mid',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ads TO authenticated;
GRANT ALL ON public.ads TO service_role;

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public reads active ads" ON public.ads FOR SELECT TO anon USING (active);
CREATE POLICY "authenticated reads ads" ON public.ads FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage ads" ON public.ads FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER ads_updated_at BEFORE UPDATE ON public.ads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_images (slot, alt, sort_order) VALUES
  ('hero', 'Editorial M-Shop: streetwear e sneakers', 0),
  ('campaign', 'Campanha M-Shop', 1),
  ('edit_1', 'Editorial M-Shop', 2),
  ('edit_2', 'Editorial M-Shop', 3),
  ('social_1', 'M-Shop no Instagram', 4),
  ('social_2', 'M-Shop no Instagram', 5),
  ('social_3', 'M-Shop no Instagram', 6),
  ('social_4', 'M-Shop no Instagram', 7),
  ('social_5', 'M-Shop no Instagram', 8),
  ('social_6', 'M-Shop no Instagram', 9);