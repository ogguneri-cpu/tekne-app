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
  try {
    const { locale, slug } = await params;
    const t = await getTranslations();
    const supabase = await createClient();

    // 1. Fetch from Database
    let listing: any = null;
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slug);
      let query = supabase.from('listings').select('*');
      if (isUuid) {
        query = query.or(`slug.eq.${slug},id.eq.${slug}`);
      } else {
        query = query.eq('slug', slug);
      }
      
      const { data, error } = await query.maybeSingle();
      if (error) {
        console.warn('DB query error:', error.message);
      }

      if (data) {
        let profile = { full_name: '', phone: '', role: 'user', company_name: '', company_logo: '', website: '' };
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, phone, role, company_name, company_logo, website')
            .eq('id', data.user_id)
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
          engine_brand: data.engine_brand,
          fuel_type: data.fuel_type,
          engine_hours: data.engine_hours,
          flag: data.flag,
          seller_type: data.seller_type,
          condition: data.condition,
          is_swap: data.is_swap,
          features: data.features || {},
          images: data.images || [],
          user_name: data.user_name || profile.full_name || 'Kullanıcı',
          user_phone: data.user_phone || profile.phone || '',
          user_email: data.user_email || '',
          seller_role: profile.role,
          company_name: profile.company_name,
          company_logo: profile.company_logo,
          seller_website: profile.website
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

    // 2.1 Check if favorited
    let initialIsFavorited = false;
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

    const catInfo = CATEGORY_MAP[listing.category.toLowerCase()] || { icon: '🚢', label: listing.category };
    const displayTitle = (locale === 'en' && listing.title_en) ? listing.title_en : listing.title;
    const displayDesc = (locale === 'en' && listing.description_en) ? listing.description_en : listing.description;
    const userName = listing.user_name || 'Kullanıcı';

    const priceText = listing.type === 'sale'
      ? formatPrice(listing.sale_price, listing.currency)
      : formatPrice(listing.price_per_day, listing.currency);

    const priceLabel = listing.type === 'sale' ? t('Satış Fiyatı') : t('/ gün kiralama');

    const cleanDescription = displayDesc || t('Açıklama eklenmemiş');

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
                <div className="sahib-price-label">{priceLabel}</div>
                <div className="sahib-price" style={{ color: 'var(--color-primary)' }}>{priceText}</div>
              </div>

              {/* Favorite Button */}
              <FavoriteDetailButton listingId={listing.id} initialIsFavorited={initialIsFavorited} />

              {/* Booking section for rental */}
              {listing.type === 'rent' && (
                <div className="sahib-booking" style={{ marginTop: '1rem' }}>
                  <BookingForm pricePerDay={listing.price_per_day || 0} currency={listing.currency} />
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

                {listing.user_phone && (
                  <a 
                    href={`tel:${String(listing.user_phone).replace(/\s|\(|\)/g, '')}`} 
                    className="sahib-phone-btn"
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
                      fontSize: '0.9rem',
                      marginBottom: '8px',
                      textAlign: 'center'
                    }}
                  >
                    📞 Cep: {listing.user_phone}
                  </a>
                )}

                {listing.user_email && (
                  <a 
                    href={`mailto:${listing.user_email}`} 
                    className="sahib-phone-btn"
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

              {/* Quick Specs (right desktop sidebar) */}
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
