'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import ListingCard, { Listing } from './ListingCard';
import Skeleton from '../ui/Skeleton';

interface ListingGridProps {
  listings: Listing[];
  loading: boolean;
}

export default function ListingGrid({ listings, loading }: ListingGridProps) {
  const t = useTranslations();

  if (loading) {
    return (
      <div className="listings-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-border rounded-lg overflow-hidden p-4 space-y-4">
            <Skeleton className="h-48 w-full rounded" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="listings-empty flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h4 className="text-lg font-bold text-text-primary mb-2">
          {t('Aramanıza uygun ilan bulunamadı')}
        </h4>
        <p className="text-sm text-text-muted">
          {t('Filtreleri Temizle')}
        </p>
      </div>
    );
  }

  return (
    <div className="listings-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
