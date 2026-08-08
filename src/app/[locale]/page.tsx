'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FilterPanel, { FilterState } from '@/components/listings/FilterPanel';
import ListingGrid from '@/components/listings/ListingGrid';
import { createClient } from '@/lib/supabase/client';
import { Listing } from '@/components/listings/ListingCard';
import { CATEGORIES, DEMO_DATA } from '@/lib/utils/constants';
import { BLOG_POSTS } from '@/lib/utils/blogData';

const initialFilters: FilterState = {
  brand: '',
  city: '',
  currency: 'TRY',
  priceMin: '',
  priceMax: '',
  sellerType: '',
  condition: '',
  isSwap: '',
  yearMin: '',
  yearMax: '',
  lengthMin: '',
  lengthMax: '',
  onlyPhotos: false
};

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();

  const [activeType, setActiveType] = useState<'sale' | 'rent'>('sale');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [rawListings, setRawListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [pendingFavoriteListingId, setPendingFavoriteListingId] = useState<string | null>(null);
  const [filterUserId, setFilterUserId] = useState<string | null>(null);

  // 0. Parse URL Query Parameters on Load (e.g. from Blog CTA links)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const typeParam = params.get('type');
      const catParam = params.get('category');
      const userParam = params.get('userId');
      if (typeParam === 'sale' || typeParam === 'rent') {
        setActiveType(typeParam);
      }
      if (catParam) {
        setActiveCategory(catParam);
      }
      if (userParam) {
        setFilterUserId(userParam);
      }
    }
  }, []);

  // 0.1 Check if redirected from email verification callback (Welcome popup)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('welcome') === 'true') {
        const checkUser = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', user.id)
              .maybeSingle();

            setUserName(profile?.full_name || user.user_metadata?.full_name || (locale === 'en' ? 'Valued Member' : 'Değerli Üyemiz'));
            setShowWelcomeModal(true);
          }
        };
        checkUser();
        
        // Remove ?welcome=true query param without reload
        const newUrl = window.location.pathname + window.location.search.replace(/[?&]welcome=true/, '').replace(/^&/, '?');
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [locale]);

  // 1.1 Fetch User's Favorites on Mount
  useEffect(() => {
    async function loadFavorites() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('favorites')
          .select('listing_id')
          .eq('user_id', session.user.id);
        if (data && !error) {
          setFavoriteIds(data.map((fav: any) => fav.listing_id));
        }
      }
    }
    loadFavorites();
  }, []);

  const handleToggleFavorite = async (listingId: string, currentFavorited: boolean, e: React.MouseEvent) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (currentFavorited) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', session.user.id)
        .eq('listing_id', listingId);
      
      if (!error) {
        setFavoriteIds(prev => prev.filter(id => id !== listingId));
      }
    } else {
      setPendingFavoriteListingId(listingId);
      setShowNotifyModal(true);
    }
  };

  const handleConfirmFavorite = async (notifyPriceChange: boolean) => {
    if (!pendingFavoriteListingId) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: session.user.id,
        listing_id: pendingFavoriteListingId,
        notify_price_change: notifyPriceChange
      });

    if (!error) {
      setFavoriteIds(prev => [...prev, pendingFavoriteListingId]);
    }
    
    setShowNotifyModal(false);
    setPendingFavoriteListingId(null);
  };

  // 1. Fetch Listings from Database on Mount
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped = data.map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            status: item.status,
            title: item.title,
            title_en: item.title_en,
            slug: item.slug,
            description: item.description,
            description_en: item.description_en,
            category: item.category,
            brand: item.brand,
            model: item.model,
            type: item.type === 'rent' ? 'rent' : 'sale',
            sale_price: item.sale_price ? Number(item.sale_price) : undefined,
            price_per_day: item.rent_price_daily ? Number(item.rent_price_daily) : undefined,
            currency: item.currency,
            location_il: item.city,
            location_ilce: item.district,
            year: item.year,
            length_meters: item.length_m ? Number(item.length_m) : undefined,
            condition: item.condition,
            seller_type: item.seller_type,
            is_swap: item.is_swap,
            images: item.images || [],
            thumbnail: item.thumbnail,
            is_featured: item.is_featured
          })) as Listing[];
          setRawListings(mapped);
        } else {
          setRawListings(DEMO_DATA);
        }
      } catch (e) {
        console.warn('Error fetching listings, falling back to demo data:', e);
        setRawListings(DEMO_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [supabase]);

  // Fetch blogs from database
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (data) setBlogs(data);
      } catch (err) {
        console.error('Error fetching blogs:', err);
      }
    };
    fetchBlogs();
  }, [supabase]);

  // 2. Perform Filtering logic locally
  useEffect(() => {
    startTransition(() => {
      let result = [...rawListings];

      // User/Store filter
      if (filterUserId) {
        result = result.filter(item => item.user_id === filterUserId);
      }

      // Type filter (Satılık / Kiralık)
      result = result.filter(item => item.type === activeType);

      // Category filter
      if (activeCategory) {
        result = result.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase());
      }

      // Search keyword filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        result = result.filter(item => 
          item.title.toLowerCase().includes(query) ||
          (item.title_en && item.title_en.toLowerCase().includes(query)) ||
          item.brand.toLowerCase().includes(query) ||
          item.location_il.toLowerCase().includes(query) ||
          (item.location_ilce && item.location_ilce.toLowerCase().includes(query))
        );
      }

      // Sidebar filters
      if (filters.brand) {
        result = result.filter(item => item.brand.toLowerCase() === filters.brand.toLowerCase());
      }

      if (filters.city) {
        result = result.filter(item => item.location_il.toLowerCase() === filters.city.toLowerCase());
      }

      if (filters.priceMin) {
        const min = Number(filters.priceMin);
        result = result.filter(item => {
          const price = item.type === 'sale' ? item.sale_price : item.price_per_day;
          return price && price >= min;
        });
      }

      if (filters.priceMax) {
        const max = Number(filters.priceMax);
        result = result.filter(item => {
          const price = item.type === 'sale' ? item.sale_price : item.price_per_day;
          return price && price <= max;
        });
      }

      if (filters.sellerType) {
        const dbSellerType = 
          filters.sellerType === 'sahibinden' ? 'owner' :
          filters.sellerType === 'magazadan' ? 'dealer' :
          filters.sellerType === 'firmadan' ? 'company' : 
          filters.sellerType;
        result = result.filter(item => item.seller_type === dbSellerType);
      }

      if (filters.condition) {
        const dbCondition = 
          filters.condition === 'sifir' ? 'new' :
          filters.condition === 'ikinci_el' ? 'used' : 
          filters.condition;
        result = result.filter(item => item.condition === dbCondition);
      }

      if (filters.isSwap !== undefined && filters.isSwap !== null && filters.isSwap !== '') {
        const wantSwap = String(filters.isSwap) === 'true';
        result = result.filter(item => item.is_swap === wantSwap);
      }

      if (filters.yearMin) {
        const min = Number(filters.yearMin);
        result = result.filter(item => item.year && item.year >= min);
      }

      if (filters.yearMax) {
        const max = Number(filters.yearMax);
        result = result.filter(item => item.year && item.year <= max);
      }

      if (filters.lengthMin) {
        const min = Number(filters.lengthMin);
        result = result.filter(item => item.length_meters && item.length_meters >= min);
      }

      if (filters.lengthMax) {
        const max = Number(filters.lengthMax);
        result = result.filter(item => item.length_meters && item.length_meters <= max);
      }

      if (filters.onlyPhotos) {
        result = result.filter(item => item.images && item.images.length > 0);
      }

      setFilteredListings(result);
    });
  }, [rawListings, activeType, activeCategory, searchQuery, filters, filterUserId]);

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setActiveCategory('');
    setActiveType('sale');
    setSearchQuery('');
    setFilterUserId(null);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  return (
    <>
      <Navbar />

      <main id="app">
        {/* Hero Section */}
        <div className="hero" id="hero-section">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-title">
              {locale === 'tr' ? (
                <>Türkiye'nin<br />Denizci Platformu</>
              ) : (
                <>Turkey's<br />Marine Platform</>
              )}
            </h1>
            <p className="hero-subtitle">
              {t('Aradığın Tekne Burada')}
            </p>
            <p className="hero-cta-text">
              {locale === 'tr' ? (
                <>1 Yıl Boyunca Ücretsiz İlan Ver<br />Hızlıca Sat ve Kirala</>
              ) : (
                <>Free Listings for 1 Year<br />Sell and Rent Quickly</>
              )}
            </p>
            
            <div className="hero-type-toggle" id="hero-type-toggle">
              <button 
                className={`type-btn ${activeType === 'sale' ? 'active' : ''}`}
                onClick={() => setActiveType('sale')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                <span>{t('Satılık')}</span>
              </button>
              <button 
                className={`type-btn ${activeType === 'rent' ? 'active' : ''}`}
                onClick={() => setActiveType('rent')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{t('Kiralık')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="categories-section" id="categories-section">
          <div className="container">
            <div className="categories-scroll" id="categories-scroll">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  className={`category-chip ${activeCategory === cat.value ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.value)}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <span>{t(cat.label)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content: Filters + Listings */}
        <div className="main-content container">
          <FilterPanel 
            filters={filters} 
            onChange={setFilters} 
            onClear={handleClearFilters} 
            isOpen={mobileFilterOpen}
          />

          <div className="listings-area">
            <div className="listings-header">
              <p className="listings-count" id="listings-count">
                {filteredListings.length} {t('ilan bulundu')}
              </p>
              
              <button 
                className="btn-mobile-filter" 
                id="btn-mobile-filter"
                onClick={() => setMobileFilterOpen(true)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="21" x2="4" y2="14" />
                  <line x1="4" y1="10" x2="4" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12" y2="3" />
                  <line x1="20" y1="21" x2="20" y2="16" />
                  <line x1="20" y1="12" x2="20" y2="3" />
                  <line x1="1" y1="14" x2="7" y2="14" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="17" y1="16" x2="23" y2="16" />
                </svg>
                <span>{t('Filtreler')}</span>
              </button>
            </div>

            {filterUserId && (
              <div style={{ 
                background: 'rgba(0, 102, 255, 0.05)', 
                border: '1px solid rgba(0, 102, 255, 0.15)', 
                borderRadius: '12px', 
                padding: '12px 16px', 
                marginBottom: '1.25rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  🏬 {locale === 'en' ? 'Showing listings from a specific dealer.' : 'Bir mağazaya ait ilanları görüntülüyorsunuz.'}
                </span>
                <button 
                  onClick={handleClearFilters}
                  style={{
                    background: 'var(--color-primary)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                >
                  {locale === 'en' ? 'Show All Listings' : 'Tüm İlanları Göster'}
                </button>
              </div>
            )}

            <ListingGrid 
              listings={filteredListings} 
              loading={loading || isPending} 
              onClear={handleClearFilters}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        </div>

        {/* Blog Section */}
        <section className="blog-section" id="blog-section">
          <div className="container">
            <div className="blog-header">
              <h2 className="blog-section-title">{t('Blog & Haberler')}</h2>
              <p className="blog-section-subtitle">
                {locale === 'en' 
                  ? 'Latest news and boat sales guides from the marine world' 
                  : 'Denizcilik dünyasından güncel bilgiler ve tekne satış rehberleri'}
              </p>
            </div>
            <div className="blog-grid">
              {blogs.map((post) => {
                const title = locale === 'en' && post.title_en ? post.title_en : post.title;
                const excerpt = post.content.replace(/<[^>]*>/g, '').substring(0, 180).trim() + '...';
                const displayTag = locale === 'en' ? (post.tag_en || post.tag) : post.tag;
                
                // Format date
                const dateObj = new Date(post.created_at || post.date || new Date());
                const dateFormatted = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
                const dateFormattedEn = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
                const dateStr = locale === 'en' ? dateFormattedEn : dateFormatted;

                return (
                  <Link 
                    key={post.id}
                    href={`/blog/${post.slug}`} 
                    className="blog-card"
                  >
                    <div className="blog-card-image">
                      <img src={post.image} alt={title} loading="lazy" />
                      {displayTag && <span className="blog-tag">{displayTag}</span>}
                    </div>
                    <div className="blog-card-body">
                      <time className="blog-date">{dateStr}</time>
                      <h3 className="blog-title">{title}</h3>
                      <p className="blog-excerpt">{excerpt}</p>
                      <span className="blog-read-more">{t('Devamını Oku →')}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="contact-cta" id="contact-cta">
          <div className="container">
            <div className="cta-box">
              <div className="cta-icon">⚓</div>
              <h2 className="cta-title">
                {t('Tekne Alım-Satım ve Kiralama Danışmanlığı')}
              </h2>
              <p className="cta-desc">
                {locale === 'en'
                  ? 'Our professional team is by your side in boat buying, selling and renting. Contact us for your questions.'
                  : 'Profesyonel ekibimiz tekne alım, satım ve kiralama süreçlerinizde yanınızda. Sorularınız için bizimle iletişime geçin.'}
              </p>
              <div className="cta-actions">
                <a href="mailto:yachting@cmx.com.tr" className="cta-btn-primary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 7l-10 7L2 7" />
                  </svg>
                  yachting@cmx.com.tr
                </a>
                <a href="mailto:yachting@cmx.com.tr?subject=satiliktekne.com%20İletişim" className="cta-btn-secondary">
                  {t('Bize Yazın →')}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Filter Overlay */}
      <div 
        className={`filter-overlay ${mobileFilterOpen ? 'active' : ''}`} 
        onClick={() => setMobileFilterOpen(false)}
      />

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            maxWidth: '460px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            animation: 'scaleIn 0.3s ease-out'
          }}>
            <img 
              src="/assets/favicon.jpg" 
              alt="satiliktekne.com" 
              style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '18px', 
                objectFit: 'cover', 
                marginBottom: '1.5rem', 
                display: 'block', 
                marginLeft: 'auto', 
                marginRight: 'auto' 
              }} 
            />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              {locale === 'en' ? `Welcome Aboard, ${userName}! ⛵` : `Aramıza Hoş Geldiniz, ${userName}! ⛵`}
            </h2>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>
              {locale === 'en'
                ? 'Your email address has been successfully verified. Your account is active and you are now logged in! You can now start using our platform.'
                : 'E-posta adresiniz başarıyla doğrulandı. Hesabınız aktif edildi ve oturumunuz açıldı! Artık platformumuzu kullanmaya başlayabilirsiniz.'}
            </p>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link
                href="/tekne-ilan-ver"
                onClick={() => setShowWelcomeModal(false)}
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0, 102, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                ➕ {locale === 'en' ? 'Post Free Listing' : 'Ücretsiz İlan Ver'}
              </Link>
              <button 
                onClick={() => setShowWelcomeModal(false)}
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  background: 'var(--bg-body)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                🏠 {locale === 'en' ? 'Go to Homepage' : 'Ana Sayfa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Drop Notification Preference Modal */}
      {showNotifyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            maxWidth: '460px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            animation: 'scaleIn 0.3s ease-out'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              {locale === 'en' ? 'Price Drop Notification' : 'Fiyat Değişikliğinde Haber Ver'}
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>
              {locale === 'en'
                ? 'Would you like to receive email notifications when the price of this listing decreases?'
                : 'Bu ilan favorilerinize eklenirken, fiyatı düştüğünde e-posta ile bildirim almak ister misiniz?'}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => handleConfirmFavorite(true)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0, 102, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                ✉️ {locale === 'en' ? 'Yes, Send Email Notifications' : 'Evet, Fiyat Düşünce Haber Ver'}
              </button>
              <button
                onClick={() => handleConfirmFavorite(false)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--bg-body)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                ⭐ {locale === 'en' ? 'Only Add to Favorites' : 'Sadece Favorilere Ekle'}
              </button>
              <button
                onClick={() => {
                  setShowNotifyModal(false);
                  setPendingFavoriteListingId(null);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '6px'
                }}
              >
                {locale === 'en' ? 'Cancel' : 'Vazgeç'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

