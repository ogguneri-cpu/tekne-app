'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { MapPin, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { formatPrice } from '@/lib/utils/format';

export interface Listing {
  id: string;
  user_id: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'sold' | 'expired';
  title: string;
  title_en?: string;
  slug: string;
  description?: string;
  description_en?: string;
  category: string;
  brand: string;
  model?: string;
  type: 'sale' | 'rent';
  sale_price?: number;
  price_per_day?: number;
  currency: 'TRY' | 'EUR' | 'USD' | 'GBP' | 'TL';
  location_il: string;
  location_ilce?: string;
  year?: number;
  length_meters?: number;
  condition?: string;
  is_swap?: boolean;
  images?: string[];
  thumbnail?: string;
  is_featured?: boolean;
  seller_type?: string;
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



interface ListingCardProps {
  listing: Listing;
  isFavorited?: boolean;
  onToggleFavorite?: (listingId: string, currentFavorited: boolean, e: React.MouseEvent) => void;
}

export default function ListingCard({ listing, isFavorited, onToggleFavorite }: ListingCardProps) {
  const t = useTranslations();
  const locale = useLocale();

  const img = (listing.images && listing.images.length > 0)
    ? listing.images[0]
    : 'https://picsum.photos/seed/placeholder/800/600';

  const categoryInfo = CATEGORY_MAP[listing.category.toLowerCase()] || { label: listing.category, icon: '🚢' };
  const displayTitle = (locale === 'en' && listing.title_en) ? listing.title_en : listing.title;

  const locParts = [];
  if (listing.location_ilce) locParts.push(listing.location_ilce);
  if (listing.location_il) locParts.push(listing.location_il);
  const locationText = locParts.join(', ');

  const metaParts = [];
  if (listing.brand) metaParts.push(listing.brand);
  if (listing.year) metaParts.push(listing.year);
  if (listing.length_meters) metaParts.push(`${listing.length_meters}m`);
  const metaText = metaParts.join(' · ');

  return (
    <Link href={`/listings/${listing.slug || listing.id}`} className="listing-card-link">
      <article className="listing-card" data-id={listing.id}>
        <div className="card-image-wrap">
          <img 
            className="card-image" 
            src={img} 
            alt={displayTitle} 
            loading="lazy" 
          />
          {/* Favorite button (Thumbs up 👍) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onToggleFavorite) {
                onToggleFavorite(listing.id, !!isFavorited, e);
              }
            }}
            className={`card-favorite-btn ${isFavorited ? 'active' : ''}`}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: isFavorited ? 'var(--color-primary)' : 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              border: isFavorited ? '2px solid #fff' : '1px solid rgba(255, 255, 255, 0.3)',
              color: '#fff',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)'
            }}
          >
            👍
          </button>
          <span className="card-category-badge">
            {categoryInfo.icon} {t(categoryInfo.label)}
          </span>
          {listing.images && listing.images.length > 1 && (
            <span className="card-img-count">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {listing.images.length}
            </span>
          )}
          {listing.condition === 'sifir' && (
            <span className="badge badge-new">{t('Sıfır')}</span>
          )}
          {listing.is_swap && (
            <span className="badge badge-swap">{t('Takas')}</span>
          )}
        </div>
        <div className="card-body">
          <h3 className="card-title">{displayTitle}</h3>
          {locationText && (
            <span className="card-location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {locationText}
            </span>
          )}
          {metaText && (
            <span className="card-meta">
              {metaText}
            </span>
          )}
          <div className="card-price-row">
            {listing.type === 'sale' ? (
              <span className="card-price">
                {formatPrice(listing.sale_price, listing.currency)}
              </span>
            ) : (
              <span className="card-price">
                {formatPrice(listing.price_per_day, listing.currency)}
                <small> / {t('gün')}</small>
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
