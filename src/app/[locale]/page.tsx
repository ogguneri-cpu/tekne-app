'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
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
  isSwap: false,
  yearMin: '',
  yearMax: '',
  lengthMin: '',
  lengthMax: '',
  onlyPhotos: false
};

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
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

  // 2. Perform Filtering logic locally
  useEffect(() => {
    startTransition(() => {
      let result = [...rawListings];

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
  }, [rawListings, activeType, activeCategory, searchQuery, filters]);

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setActiveCategory('');
    setActiveType('sale');
    setSearchQuery('');
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

            <ListingGrid 
              listings={filteredListings} 
              loading={loading || isPending} 
              onClear={handleClearFilters}
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
              {Object.values(BLOG_POSTS).map((post) => {
                const title = locale === 'en' && post.title_en ? post.title_en : post.title;
                const excerpt = post.content.replace(/<[^>]*>/g, '').substring(0, 180).trim() + '...';
                return (
                  <Link 
                    key={post.id}
                    href={`/blog/${post.id}`} 
                    className="blog-card"
                  >
                    <div className="blog-card-image">
                      <img src={post.image} alt={post.alt} loading="lazy" />
                      <span className="blog-tag">{t(post.tag)}</span>
                    </div>
                    <div className="blog-card-body">
                      <time className="blog-date">{locale === 'en' ? post.dateFormattedEn : post.dateFormatted}</time>
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

      <Footer />
    </>
  );
}

