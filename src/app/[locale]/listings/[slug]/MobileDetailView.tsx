'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import DetailGallery from './DetailGallery';
import BookingForm from './BookingForm';
import FavoriteDetailButton from '@/components/listings/FavoriteDetailButton';

interface MobileDetailViewProps {
  listing: any;
  displayTitle: string;
  cleanDescription: string;
  catInfo: { icon: string; label: string };
  priceText: string;
  priceLabel: string;
  userName: string;
  initialIsFavorited: boolean;
  featuresSchema: Record<string, string>;
  sellerTypeMap: Record<string, string>;
}

export default function MobileDetailView({
  listing,
  displayTitle,
  cleanDescription,
  catInfo,
  priceText,
  priceLabel,
  userName,
  initialIsFavorited,
  featuresSchema,
  sellerTypeMap
}: MobileDetailViewProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<'info' | 'desc'>('info');

  const rawPhone = listing.user_phone || '+90 532 158 50 78';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const telHref = `tel:${rawPhone.replace(/\s+/g, '')}`;
  const whatsappMsg = encodeURIComponent(`Merhaba, satiliktekne.com üzerindeki "${displayTitle}" ilanınızla ilgileniyorum.`);
  const whatsappHref = `https://wa.me/${cleanPhone}?text=${whatsappMsg}`;

  const sellerDisplayName = (listing.seller_type === 'dealer' || listing.seller_type === 'company') && listing.company_name
    ? listing.company_name
    : userName;

  const locationText = [listing.location_ilce, listing.location_il].filter(Boolean).join(', ') || t('Belirtilmemiş');

  return (
    <div className="sahib-mobile-view" style={{ paddingBottom: '90px' }}>
      {/* 1. Title at Top */}
      <div style={{ padding: '14px 16px 10px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1.35', margin: 0 }}>
          {displayTitle}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          <span>İlan No: #{String(listing.id).substring(0, 10)}</span>
        </div>
      </div>

      {/* 2. Photo Gallery */}
      <div style={{ background: '#000' }}>
        <DetailGallery images={listing.images || []} alt={displayTitle} />
      </div>

      {/* 3. Store / Seller Banner & Breadcrumb/Location */}
      <div style={{ padding: '12px 16px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {listing.company_logo ? (
              <img 
                src={listing.company_logo} 
                alt={sellerDisplayName} 
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : null}
            <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
              {sellerDisplayName}
            </span>
          </div>

          {(listing.seller_type === 'dealer' || listing.seller_type === 'company') && (
            <Link 
              href={`/?userId=${listing.user_id}`}
              style={{ fontSize: '0.78rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}
            >
              {t('Tüm İlanları')} →
            </Link>
          )}
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          
          <span>{locationText}</span>
          <span style={{ margin: '0 4px', color: 'var(--border)' }}>•</span>
          <span>{t(catInfo.label)}</span>
        </div>
      </div>

      {/* 4. Side-by-Side Tabs: [ İlan Bilgileri ] & [ Açıklama ] */}
      <div style={{ display: 'flex', background: 'var(--bg-card)', borderBottom: '2px solid var(--border)', position: 'sticky', top: 'var(--navbar-height, 64px)', zIndex: 30 }}>
        <button
          type="button"
          onClick={() => setActiveTab('info')}
          style={{
            flex: 1,
            padding: '14px 12px',
            fontSize: '0.95rem',
            fontWeight: 800,
            border: 'none',
            borderBottom: activeTab === 'info' ? '3px solid #f59e0b' : '3px solid transparent',
            background: activeTab === 'info' ? '#fef3c7' : 'transparent',
            color: activeTab === 'info' ? '#92400e' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          {t('İlan Bilgileri')}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('desc')}
          style={{
            flex: 1,
            padding: '14px 12px',
            fontSize: '0.95rem',
            fontWeight: 800,
            border: 'none',
            borderBottom: activeTab === 'desc' ? '3px solid #f59e0b' : '3px solid transparent',
            background: activeTab === 'desc' ? '#fef3c7' : 'transparent',
            color: activeTab === 'desc' ? '#92400e' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          {t('İlan Açıklaması')}
        </button>
      </div>

      {/* TAB CONTENT 1: İLAN BİLGİLERİ */}
      {activeTab === 'info' && (
        <div style={{ background: 'var(--bg-card)' }}>
          {/* Price Row & Full-width Favorilere Ekle Button */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: 'rgba(0, 102, 255, 0.03)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
              {priceLabel}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-primary)', marginTop: '2px' }}>
              {priceText}
            </div>
            <FavoriteDetailButton listingId={listing.id} initialIsFavorited={initialIsFavorited} />
          </div>

          {/* Rental Booking form if rent */}
          {listing.type === 'rent' && (
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
              <BookingForm listingId={listing.id} listingTitle={displayTitle} pricePerDay={listing.price_per_day || 0} currency={listing.currency} />
            </div>
          )}

          {/* Specs Table */}
          <div style={{ padding: '0 16px 16px' }}>
            <table className="sahib-specs-table" style={{ width: '100%', marginTop: '14px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td className="sahib-spec-label" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', width: '40%' }}>{t('İlan No')}</td>
                  <td className="sahib-spec-value" style={{ padding: '10px 12px', fontWeight: 700, color: '#dc2626', fontSize: '0.9rem' }}>{String(listing.id).substring(0, 10)}</td>
                </tr>
                <tr>
                  <td className="sahib-spec-label" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('İlan Tarihi')}</td>
                  <td className="sahib-spec-value" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                    {new Date(listing.created_at || new Date()).toLocaleDateString(locale === 'en' ? 'en-US' : 'tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                </tr>
                <tr>
                  <td className="sahib-spec-label" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('Kategori')}</td>
                  <td className="sahib-spec-value" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{catInfo.icon} {t(catInfo.label)}</td>
                </tr>
                {listing.brand && (
                  <tr>
                    <td className="sahib-spec-label" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('Marka')}</td>
                    <td className="sahib-spec-value" style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{listing.brand}</td>
                  </tr>
                )}
                {listing.model && (
                  <tr>
                    <td className="sahib-spec-label" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('Model')}</td>
                    <td className="sahib-spec-value" style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{listing.model}</td>
                  </tr>
                )}
                {listing.year && (
                  <tr>
                    <td className="sahib-spec-label" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('Model Yılı')}</td>
                    <td className="sahib-spec-value" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{listing.year}</td>
                  </tr>
                )}
                {listing.length_meters && (
                  <tr>
                    <td className="sahib-spec-label" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('Boy')}</td>
                    <td className="sahib-spec-value" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{listing.length_meters} {t('metre')}</td>
                  </tr>
                )}
                {listing.beam_meters && (
                  <tr>
                    <td className="sahib-spec-label" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('En')}</td>
                    <td className="sahib-spec-value" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{listing.beam_meters} {t('metre')}</td>
                  </tr>
                )}
                {listing.hull_material && (
                  <tr>
                    <td className="sahib-spec-label" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('Gövde Malzemesi')}</td>
                    <td className="sahib-spec-value" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{listing.hull_material}</td>
                  </tr>
                )}
                {listing.cabin_count && (
                  <tr>
                    <td className="sahib-spec-label" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('Kamara Sayısı')}</td>
                    <td className="sahib-spec-value" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{listing.cabin_count}</td>
                  </tr>
                )}
                {listing.engine_power && (
                  <tr>
                    <td className="sahib-spec-label" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('Motor Gücü')}</td>
                    <td className="sahib-spec-value" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{listing.engine_power} HP</td>
                  </tr>
                )}
                {listing.engine_brand && (
                  <tr>
                    <td className="sahib-spec-label" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('Motor Markası')}</td>
                    <td className="sahib-spec-value" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{listing.engine_brand}</td>
                  </tr>
                )}
                {listing.engine_hours && (
                  <tr>
                    <td className="sahib-spec-label" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('Çalışma Saati')}</td>
                    <td className="sahib-spec-value" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{listing.engine_hours.toLocaleString('tr-TR')}</td>
                  </tr>
                )}
                {listing.flag && (
                  <tr>
                    <td className="sahib-spec-label" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('Bandıra')}</td>
                    <td className="sahib-spec-value" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{listing.flag}</td>
                  </tr>
                )}
                {listing.condition && (
                  <tr>
                    <td className="sahib-spec-label" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('Durumu')}</td>
                    <td className="sahib-spec-value" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{listing.condition === 'sifir' ? t('Sıfır') : t('İkinci El')}</td>
                  </tr>
                )}
                {listing.seller_type && (
                  <tr>
                    <td className="sahib-spec-label" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('Kimden')}</td>
                    <td className="sahib-spec-value" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{t(sellerTypeMap[listing.seller_type || 'owner'] || 'Sahibinden')}</td>
                  </tr>
                )}
                {listing.is_swap !== undefined && (
                  <tr>
                    <td className="sahib-spec-label" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('Takas')}</td>
                    <td className="sahib-spec-value" style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{listing.is_swap ? t('Evet') : t('Hayır')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: AÇIKLAMA */}
      {activeTab === 'desc' && (
        <div style={{ padding: '20px 16px', background: 'var(--bg-card)', minHeight: '280px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '6px', display: 'inline-block' }}>
            {t('İlan Açıklaması')}
          </h2>
          <div 
            className="sahib-desc-text"
            style={{ fontSize: '0.95rem', lineHeight: '1.7', color: 'var(--text-primary)' }}
            dangerouslySetInnerHTML={{ __html: cleanDescription }}
          />
        </div>
      )}

      {/* 5. Features Checklist (Donanım ve Ekipmanlar) */}
      {listing.features && Object.keys(listing.features).length > 0 && (
        <div style={{ padding: '20px 16px', background: 'var(--bg-card)', marginTop: '12px', borderTop: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--color-primary)', paddingBottom: '6px', display: 'inline-block' }}>
            {t('Donanım ve Ekipmanlar')}
          </h2>
          {Object.entries(listing.features).map(([catKey, items]: any) => {
            if (!Array.isArray(items) || items.length === 0) return null;
            return (
              <div key={catKey} style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
                  {t(featuresSchema[catKey] || catKey)}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {items.map((item: string) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Fixed Sticky Bottom Contact Bar for Mobile */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        padding: '10px 16px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        zIndex: 99,
        boxShadow: '0 -4px 15px rgba(0,0,0,0.08)'
      }}>
        <a
          href={telHref}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            background: 'var(--color-primary)',
            color: '#fff',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '0.95rem',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 102, 255, 0.25)'
          }}
        >
          📞 {t('Ara')}
        </a>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            background: '#25D366',
            color: '#fff',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 800,
            fontSize: '0.95rem',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)'
          }}
        >
          💬 {t('Mesaj Gönder')}
        </a>
      </div>
    </div>
  );
}
