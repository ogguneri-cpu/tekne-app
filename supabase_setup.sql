-- 🚀 satiliktekne.com — Supabase Database Schema & RLS Setup (Idempotent / Error-Free Version)

-- ═══════════════════════════════════════════
--  1. TABLES
-- ═══════════════════════════════════════════

-- Kullanıcı profilleri
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'dealer', 'admin')),
    company_name TEXT,
    company_logo TEXT,
    city TEXT,
    district TEXT,
    bio TEXT,
    website TEXT,
    is_verified BOOLEAN DEFAULT false,
    listing_count INTEGER DEFAULT 0,
    lang TEXT DEFAULT 'tr',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Planlar (SaaS paketleri)
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    max_listings INTEGER DEFAULT 3,
    features JSONB DEFAULT '{}'::jsonb,
    price_monthly_try DECIMAL(12, 2) DEFAULT 0.00,
    price_monthly_eur DECIMAL(12, 2) DEFAULT 0.00,
    price_yearly_try DECIMAL(12, 2) DEFAULT 0.00,
    price_yearly_eur DECIMAL(12, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Abonelikler
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
    status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    payment_provider TEXT NOT NULL CHECK (payment_provider IN ('iyzico', 'stripe')),
    external_subscription_id TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Markalar
CREATE TABLE IF NOT EXISTS public.brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    category TEXT,
    listing_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- İlanlar
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'sold', 'expired')),
    title TEXT NOT NULL,
    title_en TEXT,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    description_en TEXT,
    category TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT,
    type TEXT DEFAULT 'sale' CHECK (type IN ('sale', 'rent')),
    sale_price DECIMAL(15, 2),
    rent_price_daily DECIMAL(15, 2),
    currency TEXT DEFAULT 'TRY' CHECK (currency IN ('TRY', 'EUR', 'USD', 'GBP')),
    city TEXT NOT NULL,
    district TEXT,
    country TEXT DEFAULT 'TR',
    year INTEGER,
    length_m DECIMAL(6, 2),
    beam_m DECIMAL(6, 2),
    hull_material TEXT,
    cabin_count INTEGER,
    engine_count INTEGER,
    engine_power_hp INTEGER,
    engine_brand TEXT,
    fuel_type TEXT,
    engine_hours INTEGER,
    flag TEXT DEFAULT 'Türkiye',
    seller_type TEXT DEFAULT 'owner' CHECK (seller_type IN ('owner', 'dealer', 'company')),
    condition TEXT DEFAULT 'used' CHECK (condition IN ('new', 'used')),
    is_swap BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    features JSONB DEFAULT '{}'::jsonb,
    images TEXT[] DEFAULT '{}'::text[],
    thumbnail TEXT,
    view_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    contact_count INTEGER DEFAULT 0,
    user_name TEXT,
    user_phone TEXT,
    user_email TEXT,
    approved_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Öne çıkarılan ilanlar (SaaS ödemeleri)
CREATE TABLE IF NOT EXISTS public.featured_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL,
    payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Favori ilanlar
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, listing_id)
);

-- Mesajlaşma (İlan içi iletişim)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Blog yazıları
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    title_en TEXT,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    content_en TEXT,
    tag TEXT DEFAULT 'Blog',
    cover_image TEXT,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Admin denetim günlüğü (audit logs)
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ═══════════════════════════════════════════
--  2. ROW LEVEL SECURITY (RLS) & POLICIES
-- ═══════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- ── profiles Policies ──
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- ── listings Policies ──
DROP POLICY IF EXISTS "Approved listings are viewable by everyone" ON public.listings;
CREATE POLICY "Approved listings are viewable by everyone" ON public.listings
    FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

DROP POLICY IF EXISTS "Authenticated users can insert listings" ON public.listings;
CREATE POLICY "Authenticated users can insert listings" ON public.listings
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;
CREATE POLICY "Users can update their own listings" ON public.listings
    FOR UPDATE USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

DROP POLICY IF EXISTS "Users can delete their own listings" ON public.listings;
CREATE POLICY "Users can delete their own listings" ON public.listings
    FOR DELETE USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- ── plans Policies ──
DROP POLICY IF EXISTS "Plans are viewable by everyone" ON public.plans;
CREATE POLICY "Plans are viewable by everyone" ON public.plans
    FOR SELECT USING (true);

-- ── subscriptions Policies ──
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- ── brands Policies ──
DROP POLICY IF EXISTS "Brands are viewable by everyone" ON public.brands;
CREATE POLICY "Brands are viewable by everyone" ON public.brands
    FOR SELECT USING (true);

-- ── favorites Policies ──
DROP POLICY IF EXISTS "Users can manage their own favorites" ON public.favorites;
CREATE POLICY "Users can manage their own favorites" ON public.favorites
    FOR ALL USING (auth.uid() = user_id);

-- ── messages Policies ──
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.messages;
CREATE POLICY "Users can view their own conversations" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- ── blog_posts Policies ──
DROP POLICY IF EXISTS "Published blog posts are viewable by everyone" ON public.blog_posts;
CREATE POLICY "Published blog posts are viewable by everyone" ON public.blog_posts
    FOR SELECT USING (is_published = true OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- ── admin_logs Policies ──
DROP POLICY IF EXISTS "Only admins can view admin logs" ON public.admin_logs;
CREATE POLICY "Only admins can view admin logs" ON public.admin_logs
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

-- ═══════════════════════════════════════════
--  3. TRIGGERS & FUNCTIONS
-- ═══════════════════════════════════════════

-- A. Profil Oluşturma Trigger'ı (auth.users üzerinde)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, avatar_url, role, lang)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
        COALESCE(new.raw_user_meta_data->>'phone', ''),
        COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
        'user',
        'tr'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- B. İlan Güncelleme Zamanı (updated_at) trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_listings_updated_at ON public.listings;
CREATE TRIGGER set_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- C. Full-Text Search (Arama Vektörü) Trigger'ı
CREATE OR REPLACE FUNCTION public.listings_search_vector_trigger()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('turkish', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('turkish', COALESCE(NEW.brand, '')), 'B') ||
        setweight(to_tsvector('turkish', COALESCE(NEW.category, '')), 'C') ||
        setweight(to_tsvector('turkish', COALESCE(NEW.description, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tsvectorupdate ON public.listings;
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
    ON public.listings FOR EACH ROW EXECUTE FUNCTION public.listings_search_vector_trigger();

-- D. Arama İndeksleri
CREATE INDEX IF NOT EXISTS listings_search_idx ON public.listings USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS listings_status_idx ON public.listings (status);
CREATE INDEX IF NOT EXISTS listings_category_idx ON public.listings (category);
CREATE INDEX IF NOT EXISTS listings_brand_idx ON public.listings (brand);

-- ═══════════════════════════════════════════
--  4. INITIAL PLANS DATA
-- ═══════════════════════════════════════════
INSERT INTO public.plans (name, max_listings, price_monthly_try, price_monthly_eur, is_active)
VALUES 
  ('free', 3, 0.00, 0.00, true),
  ('dealer_basic', 10, 499.00, 15.00, true),
  ('dealer_pro', 100, 1499.00, 45.00, true)
ON CONFLICT (name) DO NOTHING;
