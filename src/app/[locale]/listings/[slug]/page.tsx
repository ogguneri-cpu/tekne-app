import React from 'react';
import { notFound } from 'next/navigation';
import { getMessages, getTranslations } from 'next-intl/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/server';
import { DEMO_DATA } from '@/lib/utils/constants';
import { formatPrice } from '@/lib/utils/format';
import { MapPin, Phone, Mail, Award, Check } from 'lucide-react';
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

  const priceLabel = listing.type === 'sale' ? t('Satış Fiyatı') : t('Günlük Kiralama Fiyatı');

  // Sanitize HTML description using isomorphic-dompurify (prevents XSS - fixes G6)
  const cleanDescription = DOMPurify.sanitize(displayDesc || t('Açıklama eklenmemiş'));

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-bg-body pt-8 pb-16">
        <div className="container">
          {/* Top Section: Title & Location */}
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-text-primary mb-2">
              {displayTitle}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <MapPin size={16} />
                {listing.location_ilce ? `${listing.location_ilce}, ` : ''}{listing.location_il}
              </span>
              <span>•</span>
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase">
                {t(catInfo.label)}
              </span>
              <span className="bg-accent/10 text-accent px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase">
                {listing.type === 'sale' ? t('Satılık') : t('Kiralık')}
              </span>
            </div>
          </div>

          {/* Grid Layout: Gallery + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Gallery & Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Photo Gallery Component */}
              <DetailGallery images={listing.images || []} alt={displayTitle} />

              {/* Technical Specifications */}
              <div className="bg-bg-card rounded-xl p-6 border border-border">
                <h2 className="text-xl font-bold text-text-primary mb-4 pb-2 border-b border-border">
                  {t('Tekne Bilgileri')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  <div className="flex justify-between py-1.5 border-b border-divider text-sm">
                    <span className="text-text-secondary">{t('Marka')}</span>
                    <span className="font-semibold text-text-primary">{listing.brand}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-divider text-sm">
                    <span className="text-text-secondary">{t('Model Yılı')}</span>
                    <span className="font-semibold text-text-primary">{listing.year || t('Belirtilmemiş')}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-divider text-sm">
                    <span className="text-text-secondary">{t('Boy (metre)')}</span>
                    <span className="font-semibold text-text-primary">{listing.length_meters ? `${listing.length_meters} m` : t('Belirtilmemiş')}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-divider text-sm">
                    <span className="text-text-secondary">{t('En (metre)')}</span>
                    <span className="font-semibold text-text-primary">{listing.beam_meters ? `${listing.beam_meters} m` : t('Belirtilmemiş')}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-divider text-sm">
                    <span className="text-text-secondary">{t('Durumu')}</span>
                    <span className="font-semibold text-text-primary">
                      {listing.condition === 'sifir' ? t('Sıfır') : t('İkinci El')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-divider text-sm">
                    <span className="text-text-secondary">{t('Takas')}</span>
                    <span className="font-semibold text-text-primary">
                      {listing.is_swap ? t('Evet') : t('Hayır')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-divider text-sm">
                    <span className="text-text-secondary">{t('Gövde Malzemesi')}</span>
                    <span className="font-semibold text-text-primary">{listing.hull_material || t('Belirtilmemiş')}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-divider text-sm">
                    <span className="text-text-secondary">{t('Kamara Sayısı')}</span>
                    <span className="font-semibold text-text-primary">{listing.cabin_count || t('Belirtilmemiş')}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-divider text-sm">
                    <span className="text-text-secondary">{t('Motor Gücü (HP)')}</span>
                    <span className="font-semibold text-text-primary">{listing.engine_power ? `${listing.engine_power} HP` : t('Belirtilmemiş')}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-divider text-sm">
                    <span className="text-text-secondary">{t('Çalışma Saati')}</span>
                    <span className="font-semibold text-text-primary">{listing.engine_hours ? listing.engine_hours.toLocaleString('tr-TR') : t('Belirtilmemiş')}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-divider text-sm">
                    <span className="text-text-secondary">{t('Bandıra')}</span>
                    <span className="font-semibold text-text-primary">{listing.flag || t('Belirtilmemiş')}</span>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-bg-card rounded-xl p-6 border border-border">
                <h2 className="text-xl font-bold text-text-primary mb-4 pb-2 border-b border-border">
                  {t('İlan Açıklaması')}
                </h2>
                <div 
                  className="prose dark:prose-invert max-w-none text-text-secondary text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: cleanDescription }}
                />
              </div>

              {/* Features Checklist */}
              {listing.features && Object.keys(listing.features).length > 0 && (
                <div className="bg-bg-card rounded-xl p-6 border border-border">
                  <h2 className="text-xl font-bold text-text-primary mb-6 pb-2 border-b border-border">
                    {t('Özellikler')}
                  </h2>
                  <div className="space-y-6">
                    {Object.entries(listing.features).map(([catKey, items]) => {
                      if (!Array.isArray(items) || items.length === 0) return null;
                      return (
                        <div key={catKey}>
                          <h3 className="text-sm font-bold text-text-primary mb-3 uppercase tracking-wider">
                            {t(FEATURES_SCHEMA[catKey] || catKey)}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {items.map((item: string) => (
                              <div key={item} className="flex items-center gap-2 text-sm text-text-secondary">
                                <span className="bg-success/10 text-success p-0.5 rounded-full">
                                  <Check size={12} strokeWidth={3} />
                                </span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sidebar (Price & Contact) */}
            <div className="space-y-6">
              {/* Price Display */}
              <div className="bg-bg-card rounded-xl p-6 border border-border shadow-md">
                <span className="text-xs text-text-muted block uppercase font-bold tracking-wider mb-1">
                  {priceLabel}
                </span>
                <div className="text-3xl font-extrabold text-primary mb-1">
                  {priceText}
                </div>
                {listing.type === 'rent' && (
                  <span className="text-xs text-text-secondary">
                    {t('/ gün kiralama')}
                  </span>
                )}
              </div>

              {/* Booking form for rental */}
              {listing.type === 'rent' && (
                <BookingForm pricePerDay={listing.price_per_day || 0} currency={listing.currency} />
              )}

              {/* Contact Card */}
              <div className="bg-bg-card rounded-xl p-6 border border-border shadow-md">
                <h3 className="text-md font-bold text-text-primary mb-4 pb-2 border-b border-border">
                  {t('İletişim Bilgileri')}
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/10 text-primary p-2.5 rounded-full font-bold text-sm">
                    {userName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-text-primary text-sm">
                      {listing.contact?.person || userName}
                    </div>
                    <div className="text-xs text-text-muted uppercase font-bold">
                      {listing.contact?.store || t(SELLER_TYPE_MAP[listing.seller_type || 'owner'] || 'Sahibinden')}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {(listing.contact?.mobile || listing.user_phone || listing.contact?.phone) && (
                    <a 
                      href={`tel:${String(listing.contact?.mobile || listing.user_phone || listing.contact?.phone).replace(/\s|\(|\)/g, '')}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 border border-border hover:border-primary text-sm font-semibold rounded-lg text-text-primary transition-colors"
                    >
                      <Phone size={16} />
                      <span>{t('Telefon')}: {listing.contact?.mobile || listing.user_phone || listing.contact?.phone}</span>
                    </a>
                  )}

                  {(listing.contact?.mobile || listing.user_phone) && (
                    <a 
                      href={`https://wa.me/${String(listing.contact?.mobile || listing.user_phone).replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      <span>💬 {t('WhatsApp ile Ulaşın')}</span>
                    </a>
                  )}

                  {(listing.user_email) && (
                    <a 
                      href={`mailto:${listing.user_email}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 border border-border hover:border-primary text-sm font-semibold rounded-lg text-text-primary transition-colors"
                    >
                      <Mail size={16} />
                      <span>{t('E-posta Gönder')}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
