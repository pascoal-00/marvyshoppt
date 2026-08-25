CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color_slug text NOT NULL,
  color_name text NOT NULL,
  color_hex text NOT NULL DEFAULT '#000000',
  images text[] NOT NULL DEFAULT '{}',
  sku text NOT NULL DEFAULT '',
  stock integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, color_slug)
);

GRANT SELECT ON public.product_variants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT ALL ON public.product_variants TO service_role;

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public reads active variants" ON public.product_variants
  FOR SELECT TO anon USING (active);
CREATE POLICY "authenticated reads variants" ON public.product_variants
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage variants" ON public.product_variants
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX product_variants_product_id_idx ON public.product_variants(product_id);