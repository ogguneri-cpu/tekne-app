import React, { cache } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { Link } from '@/i18n/routing';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/server';
import { DEMO_DATA } from '@/lib/utils/constants';
import { formatPrice } from '@/lib/utils/format';
import DetailGallery from './DetailGallery';
import BookingForm from './BookingForm';
import FavoriteDetailButton from '@/components/listings/FavoriteDetailButton';

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
  'gulet': { label: 'Gulet', icon: '⚓' },
  'diger': { label: 'Diğer', icon: '🛶' }
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


function decodeHtml(html: string): string {
  return html
    .replace(/<[^>]*>?/gm, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SpecRow = ({ label, value }: { label: string; value: any }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <tr>
      <td className="sahib-spec-label">{label}</td>
      <td className="sahib-spec-value">{String(value)}</td>
    </tr>
  );
};

// Cached listing fetcher to prevent duplicate queries between generateMetadata and Page render
const getListing = cache(async (slug: string) => {
  try {
    const supabase = await createClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);
    let query = supabase.from('listings').select('*');
    if (isUuid) {
      query = query.or(`slug.eq.${slug},id.eq.${slug}`);
    } else {
      query = query.eq('slug', slug);
    }
    
    const { data, error } = await query.maybeSingle();
    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.warn('Listing DB fetch error:', err);
  }

  // Fallback to DEMO_DATA
  return DEMO_DATA.find(d => d.slug === slug || d.id === slug) || null;
});

export async function generateMetadata({ params }: ListingDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const rawListing = await getListing(slug);

  if (!rawListing) {
    return {
      title: 'İlan Bulunamadı | satiliktekne.com',
      robots: { index: false, follow: false }
    };
  }

  const isEn = locale === 'en';
  const displayTitle = (isEn && rawListing.title_en) ? rawListing.title_en : rawListing.title;
  const rawDescription = (isEn && rawListing.description_en) ? rawListing.description_en : rawListing.description;

  // Price formatting
  const price = rawListing.type === 'rent' ? rawListing.rent_price_daily : (rawListing.sale_price || rawListing.price);
  const currency = rawListing.currency || 'TRY';
  const formattedPrice = price ? formatPrice(Number(price), currency) : '';

  // Specs highlights for social snippet preview
  const specs: string[] = [];
  if (formattedPrice) specs.push(formattedPrice);
  if (rawListing.type === 'rent') specs.push(isEn ? 'For Rent' : 'Kiralık');
  else specs.push(isEn ? 'For Sale' : 'Satılık');
  if (rawListing.year) specs.push(`${rawListing.year} Model`);
  const lengthM = rawListing.length_m || rawListing.length_meters;
  if (lengthM) specs.push(`${lengthM}m`);
  const catInfo = CATEGORY_MAP[rawListing.category?.toLowerCase()];
  if (catInfo?.label) specs.push(catInfo.label);
  const location = [rawListing.district || rawListing.location_ilce, rawListing.city || rawListing.location_il].filter(Boolean).join(', ');
  if (location) specs.push(location);

  // Clean description text
  const cleanDesc = decodeHtml(rawDescription || '');

  const specsPrefix = specs.length > 0 ? specs.join(' • ') + ' — ' : '';
  const metaDescription = (specsPrefix + (cleanDesc || 'Türkiye\'nin en kapsamlı tekne ilan platformu satiliktekne.com\'da inceleyin.')).slice(0, 220).trim();

  const siteUrl = 'https://satiliktekne.com';
  const pagePath = locale === 'tr' ? `/listings/${rawListing.slug || slug}` : `/${locale}/listings/${rawListing.slug || slug}`;
  const canonicalUrl = `${siteUrl}${pagePath}`;

  // Process images for Open Graph
  const rawImages: string[] = Array.isArray(rawListing.images) ? rawListing.images : [];
  const ogImages = rawImages.slice(0, 4).map((img: string) => {
    let url = img;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return {
      url,
      width: 1200,
      height: 630,
      alt: displayTitle,
    };
  });

  if (ogImages.length === 0) {
    ogImages.push({
      url: `${siteUrl}/assets/blog-satiliktekne-nedir.jpg`,
      width: 1200,
      height: 630,
      alt: 'satiliktekne.com'
    });
  }

  const titleWithBrand = displayTitle.includes('satiliktekne.com')
    ? displayTitle
    : `${displayTitle} | satiliktekne.com`;

  return {
    title: displayTitle,
    description: metaDescription,
    keywords: [
      rawListing.brand,
      rawListing.model,
      rawListing.category,
      catInfo?.label,
      'satılık tekne',
      'tekne ilanı',
      rawListing.type === 'rent' ? 'kiralık tekne' : 'satılık tekne',
      location,
      'satiliktekne.com'
    ].filter(Boolean) as string[],
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'tr': `${siteUrl}/listings/${rawListing.slug || slug}`,
        'en': `${siteUrl}/en/listings/${rawListing.slug || slug}`
      }
    },
    openGraph: {
      title: titleWithBrand,
      description: metaDescription,
      url: canonicalUrl,
      siteName: 'satiliktekne.com',
      locale: isEn ? 'en_US' : 'tr_TR',
      type: 'website',
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: titleWithBrand,
      description: metaDescription,
      images: [ogImages[0].url],
    }
  };
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  try {
    const { locale, slug } = await params;
    const t = await getTranslations();
    const supabase = await createClient();

    // 1. Fetch from Database / Demo using deduplicated cache
    const rawListing = await getListing(slug);
    if (!rawListing) {
      notFound();
    }

    let profile = { full_name: '', phone: '', role: 'user', company_name: '', company_logo: '', website: '' };
    if (rawListing.user_id && rawListing.user_id !== 'cmx-user') {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, phone, role, company_name, company_logo, website')
          .eq('id', rawListing.user_id)
          .maybeSingle();
        if (profileData) {
          profile = {
            full_name: profileData.full_name || '',
            phone: profileData.phone || '',
            role: profileData.role || 'user',
            company_name: profileData.company_name || '',
            company_logo: profileData.company_logo || '',
            website: profileData.website || ''
          };
        }
      } catch (profileErr) {
        console.warn('Profile fetch error:', profileErr);
      }
    }

    const listing = {
      id: rawListing.id,
      user_id: rawListing.user_id,
      status: rawListing.status,
      title: rawListing.title,
      title_en: rawListing.title_en,
      slug: rawListing.slug,
      description: rawListing.description,
      description_en: rawListing.description_en,
      category: rawListing.category,
      brand: rawListing.brand,
      model: rawListing.model,
      type: rawListing.type === 'rent' ? 'rent' : 'sale',
      sale_price: rawListing.sale_price ? Number(rawListing.sale_price) : undefined,
      price_per_day: rawListing.rent_price_daily ? Number(rawListing.rent_price_daily) : undefined,
      currency: rawListing.currency,
      location_il: rawListing.city || rawListing.location_il,
      location_ilce: rawListing.district || rawListing.location_ilce,
      year: rawListing.year,
      length_meters: (rawListing.length_m || rawListing.length_meters) ? Number(rawListing.length_m || rawListing.length_meters) : undefined,
      beam_meters: (rawListing.beam_m || rawListing.beam_meters) ? Number(rawListing.beam_m || rawListing.beam_meters) : undefined,
      hull_material: rawListing.hull_material,
      cabin_count: rawListing.cabin_count,
      engine_count: rawListing.engine_count,
      engine_power: rawListing.engine_power_hp || rawListing.engine_power,
      engine_brand: rawListing.engine_brand,
      fuel_type: rawListing.fuel_type,
      engine_hours: rawListing.engine_hours,
      flag: rawListing.flag,
      seller_type: rawListing.seller_type,
      condition: rawListing.condition,
      is_swap: rawListing.is_swap,
      features: rawListing.features || {},
      images: rawListing.images || [],
      user_name: rawListing.user_name || profile.full_name || 'Kullanıcı',
      user_phone: rawListing.user_phone || profile.phone || '',
      user_email: rawListing.user_email || '',
      seller_role: profile.role,
      company_name: profile.company_name,
      company_logo: profile.company_logo,
      seller_website: profile.website,
      created_at: rawListing.created_at
    };

    // 2. Check if favorited
    let initialIsFavorited = false;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && listing) {
        const { data: favData } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('listing_id', listing.id)
          .maybeSingle();
        initialIsFavorited = !!favData;
      }
    } catch (favErr) {
      // Ignored
    }

    const catInfo = CATEGORY_MAP[listing.category?.toLowerCase()] || { icon: '🚢', label: listing.category || 'Tekne' };
    const displayTitle = (locale === 'en' && listing.title_en) ? listing.title_en : listing.title;
    const displayDesc = (locale === 'en' && listing.description_en) ? listing.description_en : listing.description;
    const userName = listing.user_name || 'Kullanıcı';

    const priceText = listing.type === 'sale'
      ? formatPrice(listing.sale_price, listing.currency)
      : formatPrice(listing.price_per_day, listing.currency);

    const priceLabel = listing.type === 'sale' ? t('Satış Fiyatı') : t('/ gün kiralama');
    const cleanDescription = displayDesc || t('Açıklama eklenmemiş');

    // JSON-LD Structured Data for Google Rich Snippets
    const siteUrl = 'https://satiliktekne.com';
    const pagePath = locale === 'tr' ? `/listings/${listing.slug || slug}` : `/${locale}/listings/${listing.slug || slug}`;
    const canonicalUrl = `${siteUrl}${pagePath}`;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: displayTitle,
      image: (listing.images || []).map((img: string) => {
        if (img.startsWith('http://') || img.startsWith('https://')) return img;
        return `${siteUrl}${img.startsWith('/') ? '' : '/'}${img}`;
      }),
      description: (displayDesc || '').replace(/<[^>]*>?/gm, ' ').slice(0, 300).trim(),
      category: catInfo.label,
      brand: listing.brand ? {
        '@type': 'Brand',
        name: listing.brand
      } : undefined,
      offers: {
        '@type': 'Offer',
        priceCurrency: listing.currency || 'TRY',
        price: listing.type === 'rent' ? (listing.price_per_day || 0) : (listing.sale_price || 0),
        availability: listing.status === 'approved' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
        url: canonicalUrl
      }
    };

    return (
      <>
        {/* JSON-LD Rich Snippet for Search Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

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
            {/* Left Column: Gallery + Title directly below + Specs + Description */}
            <div className="sahib-main-content">
              {/* Gallery */}
              <div className="sahib-gallery">
                <DetailGallery images={listing.images || []} alt={displayTitle} />
              </div>

              {/* Title, Badges & Location (Directly below photo) */}
              <div className="sahib-title-block" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="sahib-badges" style={{ marginBottom: '0.75rem' }}>
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

                <h1 className="sahib-title" style={{ margin: '0 0 0.5rem 0', fontSize: '1.65rem', lineHeight: '1.3' }}>{displayTitle}</h1>
                <p className="sahib-location" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {[listing.location_ilce, listing.location_il].filter(Boolean).join(', ') || t('Belirtilmemiş')}
                </p>
              </div>

              {/* Specs Table */}
              <div className="sahib-specs-section">
                <h2>{t('Tekne Özellikleri')}</h2>
                <table className="sahib-specs-table">
                  <tbody>
                    <SpecRow label={t('Marka')} value={listing.brand} />
                    <SpecRow label={t('Model')} value={listing.model} />
                    <SpecRow label={t('Model Yılı')} value={listing.year} />
                    <SpecRow label={t('Boy')} value={listing.length_meters ? `${listing.length_meters} ${t('metre')}` : null} />
                    <SpecRow label={t('En')} value={listing.beam_meters ? `${listing.beam_meters} ${t('metre')}` : null} />
                    <SpecRow label={t('Kategori')} value={t(catInfo.label)} />
                    <SpecRow label={t('Gövde Malzemesi')} value={listing.hull_material} />
                    <SpecRow label={t('Kamara Sayısı')} value={listing.cabin_count} />
                    <SpecRow label={t('Motor Gücü')} value={listing.engine_power ? `${listing.engine_power} HP` : null} />
                    <SpecRow label={t('Motor Markası')} value={listing.engine_brand} />
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
                  <h2>{t('Donanım ve Ekipmanlar')}</h2>
                  {Object.entries(listing.features).map(([catKey, items]: any) => {
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

            {/* Right Column: Sticky Sidebar with Price Card */}
            <div className="sahib-sidebar">
              {/* Price card */}
              <div className="sahib-price-card">
                <div className="sahib-price-label">{priceLabel}</div>
                <div className="sahib-price" style={{ color: 'var(--color-primary)' }}>{priceText}</div>
              </div>

              {/* Favorite Button */}
              <FavoriteDetailButton listingId={listing.id} initialIsFavorited={initialIsFavorited} />

              {/* Booking section for rental */}
              {listing.type === 'rent' && (
                <div className="sahib-booking" style={{ marginTop: '1rem' }}>
                  <BookingForm listingId={listing.id} listingTitle={displayTitle} pricePerDay={listing.price_per_day || 0} currency={listing.currency} />
                </div>
              )}

              {/* Contact & Seller info */}
              <div className="sahib-contact-card" style={{ marginTop: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
                {((listing.seller_type === 'dealer' || listing.seller_type === 'company') && listing.company_name) ? (
                  <div className="sahib-seller-card" style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '1.25rem' }}>
                    {listing.company_logo ? (
                      <img 
                        src={listing.company_logo} 
                        alt={listing.company_name} 
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} 
                      />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 102, 255, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.4rem', border: '1px solid rgba(0, 102, 255, 0.2)' }}>
                        🏬
                      </div>
                    )}
                    <div className="sahib-seller-info" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span className="sahib-seller-name" style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: '1.3' }}>
                        {listing.company_name}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {t('Yetkili')}: {userName}
                      </span>
                      <span className="sahib-seller-loc" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {[listing.location_ilce, listing.location_il].filter(Boolean).join(', ') || t('Belirtilmemiş')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="sahib-seller-card" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1rem' }}>
                    <div className="sahib-seller-logo" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0, 102, 255, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                      👤
                    </div>
                    <div className="sahib-seller-info" style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="sahib-seller-name" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{userName}</span>
                      <span className="sahib-seller-loc" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {[listing.location_ilce, listing.location_il].filter(Boolean).join(', ') || t('Belirtilmemiş')}
                      </span>
                    </div>
                  </div>
                )}

                {listing.seller_website && (
                  <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                    <a 
                      href={listing.seller_website.startsWith('http') ? listing.seller_website : `https://${listing.seller_website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}
                    >
                      🌐 {listing.seller_website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                {listing.user_phone && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                    <a 
                      href={`tel:${listing.user_phone.replace(/\s+/g, '')}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '12px',
                        background: 'var(--color-primary)',
                        color: '#fff',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        boxShadow: '0 4px 12px rgba(0, 102, 255, 0.2)',
                        textAlign: 'center'
                      }}
                    >
                      📞 {listing.user_phone}
                    </a>

                    <a 
                      href={`https://wa.me/${listing.user_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Merhaba, satiliktekne.com üzerindeki "${displayTitle}" ilanınızla ilgileniyorum.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '12px',
                        background: '#25D366',
                        color: '#fff',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)',
                        textAlign: 'center'
                      }}
                    >
                      💬 WhatsApp ile Yazın
                    </a>
                  </div>
                )}

                {listing.user_email && (
                  <a 
                    href={`mailto:${listing.user_email}?subject=${encodeURIComponent(`İlan Hakkında: ${displayTitle}`)}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textAlign: 'center'
                    }}
                  >
                    ✉️ {t('E-posta Gönder')}
                  </a>
                )}

                {(listing.seller_type === 'dealer' || listing.seller_type === 'company') && (
                  <Link 
                    href={`/?userId=${listing.user_id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(0, 102, 255, 0.05)',
                      border: '1px solid var(--color-primary)',
                      color: 'var(--color-primary)',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textAlign: 'center',
                      marginTop: '10px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🏬 {t('Mağazanın Diğer İlanları')}
                  </Link>
                )}
              </div>

              {/* Quick Specs */}
              <div className="sahib-quick-specs" style={{ marginTop: '1rem' }}>
                <div className="sahib-qs-item">
                  <span className="sahib-qs-label">{t('İlan No')}</span>
                  <span className="sahib-qs-value">{String(listing.id).substring(0, 10)}</span>
                </div>
                <div className="sahib-qs-item">
                  <span className="sahib-qs-label">{t('İlan Tarihi')}</span>
                  <span className="sahib-qs-value">
                    {new Date(listing.created_at || new Date()).toLocaleDateString(locale === 'en' ? 'en-US' : 'tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <div className="sahib-qs-item">
                  <span className="sahib-qs-label">{t('Kategori')}</span>
                  <span className="sahib-qs-value">{catInfo.icon} {t(catInfo.label)}</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </>
    );
  } catch (e: any) {
    if (e.message === 'NEXT_NOT_FOUND' || e.digest === 'NEXT_NOT_FOUND') {
      throw e;
    }
    return (
      <div style={{ padding: '3rem 2rem', background: '#fff', color: '#000', fontFamily: 'monospace', maxWidth: '800px', margin: '3rem auto', borderRadius: '12px', border: '1px solid #ccc' }}>
        <h1 style={{ color: 'red', fontSize: '1.5rem', marginBottom: '1rem' }}>Server Rendering Error (500)</h1>
        <p><strong>Message:</strong> {e.message}</p>
        <p><strong>Stack Trace:</strong></p>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', overflowX: 'auto', fontSize: '0.85rem' }}>{e.stack}</pre>
      </div>
    );
  }
}
