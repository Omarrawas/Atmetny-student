
CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'ل.س'::text,
  period_label text NOT NULL,
  features text[] NOT NULL,
  cta_text text NOT NULL,
  is_featured boolean NOT NULL DEFAULT false,
  tagline text NULL,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT subscription_plans_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_plans:
-- 1. Allow public read access to active plans
CREATE POLICY "Allow public read access to active subscription plans"
ON public.subscription_plans
FOR SELECT
TO public, anon, authenticated
USING (is_active = true);

-- 2. Allow admin full access
CREATE POLICY "Allow admin full access on subscription_plans"
ON public.subscription_plans
FOR ALL
TO service_role
USING (true);

-- Trigger to update 'updated_at' timestamp
CREATE TRIGGER set_subscription_plans_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_subscription_plans_display_order ON public.subscription_plans USING btree (display_order ASC) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active ON public.subscription_plans USING btree (is_active) TABLESPACE pg_default;

-- Seed some initial data (optional, can be done via Supabase Studio)
-- You might want to adjust these or add more via the Supabase Studio
INSERT INTO public.subscription_plans (name, price, currency, period_label, features, cta_text, is_featured, tagline, display_order)
VALUES
  ('الخطة المجانية', 0, 'ل.س', 'للأبد', '{"وصول محدود لبعض الاختبارات", "عدد محدود من الأسئلة يومياً", "تحليل أداء أساسي"}', 'ابدأ مجاناً', false, 'تجربة أساسية', 0),
  ('الخطة الشهرية', 5000, 'ل.س', '/ شهر', '{"وصول كامل لجميع الاختبارات", "عدد غير محدود من الأسئلة", "تحليل أداء متقدم بالذكاء الاصطناعي", "دعم فني عبر المجتمع"}', 'اشترك الآن', false, 'مرونة شهرية', 1),
  ('الخطة الفصلية', 12000, 'ل.س', '/ 3 أشهر', '{"جميع مزايا الخطة الشهرية", "خصم على السعر الإجمالي", "أولوية في الوصول للميزات الجديدة", "شارة ''طالب متميز'' في الملف الشخصي"}', 'اختر الخطة', true, 'الأكثر شيوعاً', 2),
  ('الخطة السنوية', 40000, 'ل.س', '/ سنة', '{"جميع مزايا الخطة الفصلية", "أكبر توفير على السعر", "جلسة استشارية واحدة مع معلم (حسب التوفر)", "محتوى حصري إضافي"}', 'اختر الخطة', false, 'أفضل قيمة', 3);

INSERT INTO public.subscription_plans (name, price, currency, period_label, features, cta_text, is_featured, tagline, display_order, is_active)
VALUES
  ('خطة تجريبية غير نشطة', 100, 'ل.س', '/ أسبوع', '{"ميزة 1", "ميزة 2"}', 'جربها', false, 'للتجربة فقط', 4, false);

