'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';

interface FavoriteDetailButtonProps {
  listingId: string;
  initialIsFavorited: boolean;
}

export default function FavoriteDetailButton({ listingId, initialIsFavorited }: FavoriteDetailButtonProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const supabase = createClient();

  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [showNotifyModal, setShowNotifyModal] = useState(false);

  const handleToggleFavorite = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (isFavorited) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', session.user.id)
        .eq('listing_id', listingId);
      
      if (!error) {
        setIsFavorited(false);
      }
    } else {
      // Open Notify Price Change modal
      setShowNotifyModal(true);
    }
  };

  const handleConfirmFavorite = async (notifyPriceChange: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: session.user.id,
        listing_id: listingId,
        notify_price_change: notifyPriceChange
      });

    if (!error) {
      setIsFavorited(true);
    }
    
    setShowNotifyModal(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleToggleFavorite}
        style={{
          width: '100%',
          marginTop: '12px',
          padding: '14px 20px',
          borderRadius: '12px',
          border: isFavorited ? '2px solid var(--color-primary)' : '1px solid var(--border)',
          background: isFavorited ? 'rgba(0, 102, 255, 0.06)' : 'var(--bg-card)',
          color: isFavorited ? 'var(--color-primary)' : 'var(--text-primary)',
          fontWeight: 700,
          fontSize: '0.95rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: isFavorited ? '0 2px 8px rgba(0, 102, 255, 0.08)' : 'none'
        }}
      >
        👌 {isFavorited ? (locale === 'en' ? 'Favorited' : 'Favorilerimde') : (locale === 'en' ? 'Add to Favorites' : 'Favorilere Ekle')}
      </button>

      {/* Price Drop Notification Preference Modal */}
      {showNotifyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            maxWidth: '460px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            animation: 'scaleIn 0.3s ease-out'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              {locale === 'en' ? 'Price Drop Notification' : 'Fiyat Değişikliğinde Haber Ver'}
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>
              {locale === 'en'
                ? 'Would you like to receive email notifications when the price of this listing decreases?'
                : 'Bu ilan favorilerinize eklenirken, fiyatı düştüğünde e-posta ile bildirim almak ister misiniz?'}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => handleConfirmFavorite(true)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0, 102, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                ✉️ {locale === 'en' ? 'Yes, Send Email Notifications' : 'Evet, Fiyat Düşünce Haber Ver'}
              </button>
              <button
                onClick={() => handleConfirmFavorite(false)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'var(--bg-body)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                👌 {locale === 'en' ? 'Only Add to Favorites' : 'Sadece Favorilere Ekle'}
              </button>
              <button
                onClick={() => {
                  setShowNotifyModal(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '6px'
                }}
              >
                {locale === 'en' ? 'Cancel' : 'Vazgeç'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
