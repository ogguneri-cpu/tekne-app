'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { formatPrice } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/client';

interface BookingFormProps {
  listingId: string;
  listingTitle: string;
  pricePerDay: number;
  currency: string;
}

export default function BookingForm({ listingId, listingTitle, pricePerDay, currency }: BookingFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  // Contact Modal State
  const [showModal, setShowModal] = useState(false);
  const [renterName, setRenterName] = useState('');
  const [renterEmail, setRenterEmail] = useState('');
  const [renterPhone, setRenterPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Prefill details from Supabase if logged in
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setRenterName(session.user.user_metadata?.full_name || '');
        setRenterEmail(session.user.email || '');
        setRenterPhone(session.user.phone || session.user.user_metadata?.phone || '');
      }
    });
  }, []);

  // Automatically calculate total days and price when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      
      if (diffTime > 0) {
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDays(diffDays);
        setTotal(diffDays * pricePerDay);
      } else {
        setDays(null);
        setTotal(null);
      }
    } else {
      setDays(null);
      setTotal(null);
    }
  }, [startDate, endDate, pricePerDay]);

  const isInvalidDate = startDate && endDate && new Date(endDate).getTime() <= new Date(startDate).getTime();

  const handleOpenRequest = () => {
    if (days === null || total === null) return;
    setErrorMsg('');
    setSubmitSuccess(false);
    setShowModal(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renterName || !renterEmail || !renterPhone) {
      setErrorMsg(locale === 'tr' ? 'Lütfen tüm alanları doldurun.' : 'Please fill in all fields.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/booking-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          listingTitle,
          startDate,
          endDate,
          days,
          total,
          currency,
          renterName,
          renterEmail,
          renterPhone
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'İstek gönderilemedi.');
      }
      setSubmitSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="sahib-booking bg-bg-card rounded-xl p-6 border border-border shadow-md">
        <div className="sahib-booking-dates grid grid-cols-2 gap-4 mb-3">
          <div className="sahib-date-field">
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('Giriş Tarihi')}</label>
            <input 
              type="date" 
              id="booking-start" 
              className="w-full border border-border rounded p-2 text-sm bg-bg-body text-text-primary"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="sahib-date-field">
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('Çıkış Tarihi')}</label>
            <input 
              type="date" 
              id="booking-end" 
              className="w-full border border-border rounded p-2 text-sm bg-bg-body text-text-primary"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {isInvalidDate && (
          <div style={{ color: '#ff4d4f', fontSize: '0.8rem', marginBottom: '1rem', fontWeight: 600 }}>
            ⚠️ {locale === 'en' ? 'Check-out date must be after check-in date.' : 'Çıkış tarihi giriş tarihinden sonra olmalıdır.'}
          </div>
        )}
        
        {days !== null && total !== null && (
          <div className="sahib-booking-total bg-bg-body rounded-lg p-4 border border-border space-y-2 mb-4" style={{ marginTop: '1rem' }}>
            <div className="flex justify-between text-sm text-text-secondary">
              <span>{days} x {formatPrice(pricePerDay, currency)}</span>
              <span>{formatPrice(total, currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-md text-text-primary pt-2 border-t border-divider">
              <span>{locale === 'en' ? 'Total' : 'Toplam'}</span>
              <span>{formatPrice(total, currency)}</span>
            </div>
          </div>
        )}

        <button 
          className="sahib-reserve-btn w-full text-white py-2.5 rounded-lg text-sm font-semibold transition-opacity" 
          disabled={days === null}
          onClick={handleOpenRequest}
          style={{ 
            background: days === null ? 'var(--text-muted)' : 'var(--color-primary)', 
            cursor: days === null ? 'not-allowed' : 'pointer',
            opacity: days === null ? 0.6 : 1,
            marginTop: '0.5rem'
          }}
        >
          {locale === 'en' ? 'Send Booking Request' : 'Rezervasyon Talebi Gönder'}
        </button>
      </div>

      {/* Booking Form Modal */}
      {showModal && (
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
          zIndex: 10000,
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            
            {/* Close button */}
            <button 
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}
            >
              ×
            </button>

            {!submitSuccess ? (
              <form onSubmit={handleSubmitRequest}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                  {locale === 'en' ? 'Booking Details' : 'Rezervasyon Talebi'}
                </h3>

                {/* Booking Preview Box */}
                <div style={{ 
                  background: 'var(--bg-body)', 
                  border: '1px solid var(--border)', 
                  borderRadius: '12px', 
                  padding: '1rem', 
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem'
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{listingTitle}</div>
                  <div style={{ display: 'flex', justifyContent: 'between', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    <span>{locale === 'en' ? 'Dates:' : 'Tarih:'}</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {new Date(startDate).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')} - {new Date(endDate).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'between', color: 'var(--text-muted)' }}>
                    <span>{locale === 'en' ? 'Total Cost:' : 'Toplam Tutar:'}</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {days} {locale === 'en' ? 'Days' : 'Gün'} / {formatPrice(total || 0, currency)}
                    </span>
                  </div>
                </div>

                {/* Input Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                      {locale === 'en' ? 'Full Name' : 'Adınız Soyadınız'}
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder={locale === 'en' ? 'e.g. John Doe' : 'Örn. Ahmet Yılmaz'}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        background: 'var(--bg-body)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem'
                      }}
                      value={renterName}
                      onChange={(e) => setRenterName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                      {locale === 'en' ? 'Phone Number' : 'Telefon Numaranız'}
                    </label>
                    <input 
                      type="tel" 
                      required
                      placeholder="0555 555 5555"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        background: 'var(--bg-body)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem'
                      }}
                      value={renterPhone}
                      onChange={(e) => setRenterPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                      {locale === 'en' ? 'Email Address' : 'E-posta Adresiniz'}
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder="name@example.com"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        background: 'var(--bg-body)',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem'
                      }}
                      value={renterEmail}
                      onChange={(e) => setRenterEmail(e.target.value)}
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div style={{ color: '#ff4d4f', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                    ⚠️ {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                    transition: 'opacity 0.2s'
                  }}
                >
                  {isSubmitting 
                    ? (locale === 'en' ? 'Sending...' : 'Gönderiliyor...') 
                    : (locale === 'en' ? 'Confirm and Send Request' : 'Talebi Gönder')}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'rgba(46, 204, 113, 0.1)',
                  color: '#2ecc71',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontSize: '2.5rem',
                  fontWeight: 'bold'
                }}>
                  ✓
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  {locale === 'en' ? 'Request Sent!' : 'Talebiniz Gönderildi!'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                  {locale === 'en' 
                    ? 'Your booking request has been successfully received. Our experts will get back to you as soon as possible.' 
                    : 'Rezervasyon talebiniz başarıyla alınmıştır. En kısa sürede uzmanlarımız sizinle iletişime geçecektir.'}
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  {locale === 'en' ? 'Close' : 'Kapat'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
