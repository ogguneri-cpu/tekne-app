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



export default function ListingCard({ listing }: { listing: Listing }) {
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
    <Link href={`/listings/${listing.slug || listing.id}`} className="listing-card-link block">
      <article className="listing-card">
        <div className="card-image-wrap relative">
          <img 
            className="card-image w-full h-48 object-cover" 
            src={img} 
            alt={displayTitle} 
            loading="lazy" 
          />
          <span className="card-category-badge absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
            {categoryInfo.icon} {t(categoryInfo.label)}
          </span>
          {listing.images && listing.images.length > 1 && (
            <span className="card-img-count absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded text-xs">
              <ImageIcon size={12} />
              {listing.images.length}
            </span>
          )}
          {listing.condition === 'sifir' && (
            <span className="badge badge-new absolute bottom-2 left-2 bg-success text-white px-2 py-0.5 rounded text-xs font-bold">
              {t('Sıfır')}
            </span>
          )}
          {listing.is_swap && (
            <span className="badge badge-swap absolute bottom-2 right-2 bg-warning text-white px-2 py-0.5 rounded text-xs font-bold">
              {t('Takas')}
            </span>
          )}
        </div>
        <div className="card-body p-4">
          <h3 className="card-title text-md font-semibold line-clamp-1 mb-1">
            {displayTitle}
          </h3>
          {locationText && (
            <span className="card-location flex items-center gap-1 text-sm text-text-secondary mb-2">
              <MapPin size={14} />
              {locationText}
            </span>
          )}
          {metaText && (
            <span className="card-meta text-xs text-text-muted block mb-3">
              {metaText}
            </span>
          )}
          <div className="card-price-row flex justify-between items-center mt-auto">
            {listing.type === 'sale' ? (
              <span className="card-price text-lg font-bold text-primary">
                {formatPrice(listing.sale_price, listing.currency)}
              </span>
            ) : (
              <span className="card-price text-lg font-bold text-primary">
                {formatPrice(listing.price_per_day, listing.currency)}
                <small className="text-xs font-normal text-text-secondary"> / {t('gün')}</small>
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
