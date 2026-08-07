'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import ListingCard, { Listing } from './ListingCard';

interface ListingGridProps {
  listings: Listing[];
  loading: boolean;
  onClear?: () => void;
}

export default function ListingGrid({ listings, loading, onClear }: ListingGridProps) {
  const t = useTranslations();

  if (loading) {
    return (
      <div className="listings-loading">
        <div className="spinner"></div>
        <p>{t('İlanlar yükleniyor')}</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="listings-empty" style={{ display: 'flex' }}>
        <span className="empty-icon">🔍</span>
        <p>{t('Aramanıza uygun ilan bulunamadı')}</p>
        {onClear && (
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onClear}
          >
            {t('Filtreleri Temizle')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="listings-grid" id="listings-grid">
      {listings.map((listing, index) => (
        <div 
          key={listing.id} 
          className="listing-card-wrapper"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <ListingCard listing={listing} />
        </div>
      ))}
    </div>
  );
}

