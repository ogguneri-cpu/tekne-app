'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/utils/format';

interface BookingFormProps {
  pricePerDay: number;
  currency: string;
}

export default function BookingForm({ pricePerDay, currency }: BookingFormProps) {
  const t = useTranslations();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  const handleCalculate = () => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    
    if (diffTime <= 0) {
      alert('Çıkış tarihi giriş tarihinden sonra olmalıdır.');
      return;
    }

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDays(diffDays);
    setTotal(diffDays * pricePerDay);
  };

  return (
    <div className="sahib-booking bg-bg-card rounded-xl p-6 border border-border shadow-md">
      <div className="sahib-booking-dates grid grid-cols-2 gap-4 mb-4">
        <div className="sahib-date-field">
          <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('Giriş Tarihi')}</label>
          <input 
            type="date" 
            id="booking-start" 
            className="w-full border border-border rounded p-2 text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="sahib-date-field">
          <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('Çıkış Tarihi')}</label>
          <input 
            type="date" 
            id="booking-end" 
            className="w-full border border-border rounded p-2 text-sm"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      
      <button 
        className="sahib-calc-btn w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold transition-opacity mb-4" 
        onClick={handleCalculate}
        disabled={!startDate || !endDate}
      >
        {t('Hesapla')}
      </button>

      {days !== null && total !== null && (
        <div className="sahib-booking-total bg-bg-body rounded-lg p-4 border border-border space-y-2 mb-4">
          <div className="flex justify-between text-sm text-text-secondary">
            <span>{days} x {formatPrice(pricePerDay, currency)}</span>
            <span>{formatPrice(total, currency)}</span>
          </div>
          <div className="flex justify-between font-bold text-md text-text-primary pt-2 border-t border-divider">
            <span>Toplam</span>
            <span>{formatPrice(total, currency)}</span>
          </div>
        </div>
      )}

      <button 
        className="sahib-reserve-btn w-full bg-accent text-white py-2.5 rounded-lg text-sm font-semibold transition-opacity" 
        disabled={days === null}
        onClick={() => alert('Rezervasyon talebi gönderildi!')}
      >
        {t('Rezerve Et')}
      </button>
    </div>
  );
}
