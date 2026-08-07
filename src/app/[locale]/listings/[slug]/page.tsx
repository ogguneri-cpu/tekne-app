import React from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/server';
import { DEMO_DATA } from '@/lib/utils/constants';
import { formatPrice } from '@/lib/utils/format';
import DetailGallery from './DetailGallery';
import BookingForm from './BookingForm';
import DOMPurify from 'isomorphic-dompurify';

interface ListingDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
  'motoryat': { label: 'Motoryat', icon: '🚤' },
  'yelkenli': { label: 'Yelkenli', icon: '⛵' },
  'katamaran': { label: 'Katamaran', icon: '🛥️' },
  'surat_teknesi': { label: 'Sürat Teknesi', icon: '💨' },
  'bot': { label: 'Bot', icon: '🚣' },
  'jet_ski': { label: 'Jet Ski', icon: '🏄' },
  'guverte_teknesi': { label: 'Güverte Teknesi', icon: '🛳️' },
  'gulet': { label: 'Gulet', icon: '⚓' }
};

const FEATURES_SCHEMA: Record<string, string> = {
  kamara: 'Kamara',
  mutfak: 'Mutfak',
  guverte: 'Güverte Ekipmanları',
  tanklar: 'Tanklar',
  elektronik: 'Elektronik',
  elektrik: 'Elektrik Donanımı'
};

const SELLER_TYPE_MAP: Record<string, string> = {
  'owner': 'Sahibinden',
  'dealer': 'Mağazadan',
  'company': 'Firmadan'
};

const SpecRow = ({ label, value }: { label: string; value: any }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <tr>
      <td className="sahib-spec-label">{label}</td>
      <td className="sahib-spec-value">{String(value)}</td>
    </tr>
  );
};

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations();
  const supabase = await createClient();

  // 1. Fetch from Database
  let listing: any = null;
  try {
    const { data } = await supabase
      .from('listings')
      .select('*')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .single();

    if (data) {
      listing = {
        id: data.id,
        user_id: data.user_id,
        status: data.status,
        title: data.title,
        title_en: data.title_en,
        slug: data.slug,
        description: data.description,
        description_en: data.description_en,
        category: data.category,
        brand: data.brand,
        model: data.model,
        type: data.type === 'rent' ? 'rent' : 'sale',
        sale_price: data.sale_price ? Number(data.sale_price) : undefined,
        price_per_day: data.rent_price_daily ? Number(data.rent_price_daily) : undefined,
        currency: data.currency,
        location_il: data.city,
        location_ilce: data.district,
        year: data.year,
        length_meters: data.length_m ? Number(data.length_m) : undefined,
        beam_meters: data.beam_m ? Number(data.beam_m) : undefined,
        hull_material: data.hull_material,
        cabin_count: data.cabin_count,
        engine_count: data.engine_count,
        engine_power: data.engine_power_hp,
        fuel_type: data.fuel_type,
        engine_hours: data.engine_hours,
        flag: data.flag,
        seller_type: data.seller_type,
        condition: data.condition,
        is_swap: data.is_swap,
        features: data.features || {},
        images: data.images || [],
        user_name: data.user_name || 'Kullanıcı',
        user_phone: data.user_phone,
        user_email: data.user_email
      };
    }
  } catch (e) {
    console.warn('Listing not found in DB, checking demo data:', e);
  }

  // 2. Fallback to Demo Data
  if (!listing) {
    listing = DEMO_DATA.find(d => d.slug === slug || d.id === slug);
  }

  if (!listing) {
    notFound();
  }

  const catInfo = CATEGORY_MAP[listing.category.toLowerCase()] || { icon: '🚢', label: listing.category };
  const displayTitle = (locale === 'en' && listing.title_en) ? listing.title_en : listing.title;
  const displayDesc = (locale === 'en' && listing.description_en) ? listing.description_en : listing.description;
  const userName = listing.user_name || 'Kullanıcı';

  const priceText = listing.type === 'sale'
    ? formatPrice(listing.sale_price, listing.currency)
    : formatPrice(listing.price_per_day, listing.currency);

  const priceLabel = listing.type === 'sale' ? t('Satış Fiyatı') : t('/ gün kiralama');

  const cleanDescription = DOMPurify.sanitize(displayDesc || t('Açıklama eklenmemiş'));

  return (
    <>
      <Navbar />

      <main id="app">
        {/* ── Back Button ── */}
        <div className="container">
          <Link href="/" className="sahib-back-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            {t('← Geri')}
          </Link>
        </div>

        {/* ── Top Section: Gallery + Sidebar ── */}
        <div className="sahib-top container">
          {/* Gallery (left) */}
          <div className="sahib-gallery">
            <DetailGallery images={listing.images || []} alt={displayTitle} />
          </div>

          {/* Sidebar (right) */}
          <div className="sahib-sidebar">
            {/* Price card */}
            <div className="sahib-price-card">
              <div className="sahib-price">{priceText}</div>
              <div className="sahib-price-label">{priceLabel}</div>
            </div>

            {/* Booking section for rental */}
            {listing.type === 'rent' && (
              <div className="sahib-booking">
                <BookingForm pricePerDay={listing.price_per_day || 0} currency={listing.currency} />
              </div>
            )}

            {/* Contact & Seller info */}
            <div className="sahib-contact-card">
              <div className="sahib-seller-card">
                <div className="sahib-seller-logo">
                  <img src="/assets/logo.png" alt={userName} />
                </div>
                <div className="sahib-seller-info">
                  <span className="sahib-seller-name">{userName}</span>
                  <span className="sahib-seller-loc">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {[listing.location_ilce, listing.location_il].filter(Boolean).join(', ')}
                  </span>
                </div>
              </div>

              {(listing.user_phone || listing.phone) && (
                <a 
                  href={`tel:${String(listing.user_phone || listing.phone).replace(/\s|\(|\)/g, '')}`} 
                  className="sahib-phone-btn sahib-phone-mobile"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                  Cep: {listing.user_phone || listing.phone}
                </a>
              )}

              {listing.user_email && (
                <a 
                  href={`mailto:${listing.user_email}`} 
                  className="sahib-phone-btn"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 7l-10 7L2 7" />
                  </svg>
                  {t('E-posta Gönder')}
                </a>
              )}
            </div>

            {/* Quick specs */}
            <div className="sahib-quick-specs">
              <div className="sahib-qs-item">
                <span className="sahib-qs-label">{t('İlan No')}</span>
                <span className="sahib-qs-value">{String(listing.id).substring(0, 10)}</span>
              </div>
              <div className="sahib-qs-item">
                <span className="sahib-qs-label">{t('İlan Tarihi')}</span>
                <span className="sahib-qs-value">
                  {listing.created_at ? new Date(listing.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'tr-TR') : ''}
                </span>
              </div>
              <div className="sahib-qs-item">
                <span className="sahib-qs-label">{t('Kategori')}</span>
                <span className="sahib-qs-value">{catInfo.icon} {t(catInfo.label)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── İlan Açıklaması Section ── */}
        <div className="sahib-body container">
          {/* Badges */}
          <div className="sahib-badges">
            <span className="badge badge-category">{catInfo.icon} {t(catInfo.label)}</span>
            <span className="badge badge-type">
              {listing.type === 'sale' ? '🏷️ ' + t('Satılık') : '📅 ' + t('Kiralık')}
            </span>
            {listing.condition && (
              <span className="badge badge-condition">
                {t(listing.condition === 'sifir' ? 'Sıfır' : 'İkinci El')}
              </span>
            )}
            {listing.is_swap && (
              <span className="badge badge-swap">🔄 {t('Takaslı')}</span>
            )}
          </div>

          {/* Title */}
          <h1 className="sahib-title">{displayTitle}</h1>
          <p className="sahib-location">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {[listing.location_ilce, listing.location_il].filter(Boolean).join(', ') || t('Belirtilmemiş')}
          </p>

          {/* Specs Table */}
          <div className="sahib-specs-section">
            <h2>{t('Tekne Özellikleri')}</h2>
            <table className="sahib-specs-table">
              <tbody>
                <SpecRow label={t('Marka')} value={listing.brand} />
                <SpecRow label={t('Model Yılı')} value={listing.year} />
                <SpecRow label={t('Boy')} value={listing.length_meters ? `${listing.length_meters} ${t('metre')}` : null} />
                <SpecRow label={t('En')} value={listing.beam_meters ? `${listing.beam_meters} ${t('metre')}` : null} />
                <SpecRow label={t('Kategori')} value={t(catInfo.label)} />
                <SpecRow label={t('Gövde Malzemesi')} value={listing.hull_material} />
                <SpecRow label={t('Kamara Sayısı')} value={listing.cabin_count} />
                <SpecRow label={t('Motor Gücü')} value={listing.engine_power ? `${listing.engine_power} HP` : null} />
                <SpecRow label={t('Çalışma Saati')} value={listing.engine_hours ? listing.engine_hours.toLocaleString('tr-TR') : null} />
                <SpecRow label={t('Bandıra')} value={listing.flag} />
                <SpecRow label={t('Durumu')} value={listing.condition === 'sifir' ? t('Sıfır') : t('İkinci El')} />
                <SpecRow label={t('Kimden')} value={t(SELLER_TYPE_MAP[listing.seller_type || 'owner'] || 'Sahibinden')} />
                <SpecRow label={t('Takas')} value={listing.is_swap ? t('Evet') : t('Hayır')} />
              </tbody>
            </table>
          </div>

          {/* Description */}
          <div className="sahib-desc-section">
            <h2>{t('İlan Açıklaması')}</h2>
            <div 
              className="sahib-desc-text"
              dangerouslySetInnerHTML={{ __html: cleanDescription }}
            />
          </div>

          {/* Features Checklist */}
          {listing.features && Object.keys(listing.features).length > 0 && (
            <div className="sahib-features-section">
              <h2>{t('Özellikler')}</h2>
              {Object.entries(listing.features).map(([catKey, items]) => {
                if (!Array.isArray(items) || items.length === 0) return null;
                return (
                  <div key={catKey} className="sahib-feat-cat">
                    <h3 className="sahib-feat-cat-title">
                      {t(FEATURES_SCHEMA[catKey] || catKey)}
                    </h3>
                    <div className="sahib-feat-grid">
                      {items.map((item: string) => (
                        <div key={item} className="sahib-feat-item active">
                          <span className="sahib-feat-check">✓</span>
                          <span className="sahib-feat-label">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
