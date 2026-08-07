'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FilterPanel, { FilterState } from '@/components/listings/FilterPanel';
import ListingGrid from '@/components/listings/ListingGrid';
import { createClient } from '@/lib/supabase/client';
import { Listing } from '@/components/listings/ListingCard';
import { CATEGORIES, DEMO_DATA } from '@/lib/utils/constants';
import { Search, Compass } from 'lucide-react';

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
  const supabase = createClient();

  const [activeType, setActiveType] = useState<'all' | 'sale' | 'rent'>('all');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [rawListings, setRawListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

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
          // Map snake_case database fields to camelCase props where needed
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
            is_swap: item.is_swap,
            images: item.images || [],
            thumbnail: item.thumbnail,
            is_featured: item.is_featured
          })) as Listing[];
          setRawListings(mapped);
        } else {
          // Fallback to demo data if DB is empty
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
      if (activeType !== 'all') {
        result = result.filter(item => item.type === activeType);
      }

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
        result = result.filter(item => item.condition && item.condition === filters.sellerType);
      }

      if (filters.condition) {
        result = result.filter(item => item.condition === filters.condition);
      }

      if (filters.isSwap) {
        result = result.filter(item => item.is_swap);
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
    setActiveType('all');
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
              {t("Türkiye'nin Denizci Platformu")}
            </h1>
            <p className="hero-subtitle">
              {t('Aradığın Tekne Burada')}
            </p>
            <p className="hero-cta-text">
              {t('1 Yıl Boyunca Ücretsiz İlan Ver Hızlıca Sat ve Kirala')}
            </p>
            
            <div className="hero-type-toggle flex gap-4 mt-6 justify-center">
              <button 
                className={`type-btn flex items-center gap-2 px-4 py-2 border rounded ${activeType === 'all' ? 'active bg-primary text-white border-primary' : 'bg-transparent text-white border-white'}`}
                onClick={() => setActiveType('all')}
              >
                <Compass size={18} />
                <span>{t('Tümü')}</span>
              </button>
              <button 
                className={`type-btn flex items-center gap-2 px-4 py-2 border rounded ${activeType === 'sale' ? 'active bg-primary text-white border-primary' : 'bg-transparent text-white border-white'}`}
                onClick={() => setActiveType('sale')}
              >
                <span>{t('Satılık')}</span>
              </button>
              <button 
                className={`type-btn flex items-center gap-2 px-4 py-2 border rounded ${activeType === 'rent' ? 'active bg-primary text-white border-primary' : 'bg-transparent text-white border-white'}`}
                onClick={() => setActiveType('rent')}
              >
                <span>{t('Kiralık')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="categories-section" id="categories-section">
          <div className="container">
            <div className="categories-scroll flex gap-2 overflow-x-auto py-4 scrollbar-none">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  className={`category-chip flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition-all ${activeCategory === cat.value ? 'active bg-primary text-white border-primary font-semibold' : 'bg-bg-card border-border hover:bg-bg-hover'}`}
                  onClick={() => setActiveCategory(cat.value)}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <span>{t(cat.label)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="main-content container py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar filter */}
            <div className="w-full lg:w-1/4">
              <FilterPanel 
                filters={filters} 
                onChange={setFilters} 
                onClear={handleClearFilters} 
              />
            </div>

            {/* Results display */}
            <div className="w-full lg:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-text-secondary font-medium">
                  {filteredListings.length} {t('ilan bulundu')}
                </span>
                
                {/* Search bar inside content for responsive layout */}
                <div className="relative flex items-center max-w-xs w-full lg:hidden">
                  <input 
                    type="text" 
                    placeholder={t('Tekne, marka veya konum ara')}
                    className="border border-border rounded-full pl-4 pr-10 py-1.5 text-sm w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search size={16} className="absolute right-3 text-text-muted" />
                </div>
              </div>

              <ListingGrid 
                listings={filteredListings} 
                loading={loading || isPending} 
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
