'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

export interface FilterState {
  brand: string;
  city: string;
  currency: string;
  priceMin: string;
  priceMax: string;
  sellerType: string;
  condition: string;
  isSwap: boolean | string;
  yearMin: string;
  yearMax: string;
  lengthMin: string;
  lengthMax: string;
  onlyPhotos: boolean;
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onClear: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const POPULAR_BRANDS = [
  'Azimut', 'Beneteau', 'Bavaria', 'Yamaha', 'Sea Ray', 'Jeanneau', 
  'Princess', 'Sunseeker', 'Lagoon', 'Fountaine Pajot', 'Zodiac', 
  'Quicksilver', 'Bayliner', 'Mercury', 'Ferretti', 'Grand Soleil', 'Dufour'
];

export default function FilterPanel({ filters, onChange, onClear, isOpen, onClose }: FilterPanelProps) {
  const t = useTranslations();
  const supabase = createClient();
  const [brands, setBrands] = useState<string[]>(POPULAR_BRANDS);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data } = await supabase
          .from('brands')
          .select('name')
          .eq('is_active', true)
          .order('name');
        
        if (data && data.length > 0) {
          setBrands(data.map(b => b.name));
        }
      } catch (e) {
        console.warn('Could not fetch brands from server, using default list:', e);
      }
    };
    fetchBrands();
  }, [supabase]);

  const handleSelectChange = (key: keyof FilterState, val: any) => {
    onChange({
      ...filters,
      [key]: val
    });
  };

  const handleCheckboxChange = (key: keyof FilterState, checked: boolean) => {
    onChange({
      ...filters,
      [key]: checked
    });
  };

  return (
    <aside className={`filter-panel ${isOpen ? 'open' : ''}`} id="filter-panel">
      <div className="filter-header">
        <h3>{t('Filtreler')}</h3>
        <button 
          className="filter-clear-btn"
          onClick={onClear}
        >
          {t('Temizle')}
        </button>
      </div>

      {/* Marka */}
      <div className="filter-group" id="filter-brand-group">
        <label className="filter-label">{t('Marka')}</label>
        <select 
          className="filter-select" 
          value={filters.brand}
          onChange={(e) => handleSelectChange('brand', e.target.value)}
        >
          <option value="">{t('Tüm Markalar')}</option>
          {brands.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Adres: İl */}
      <div className="filter-group" id="filter-il-group">
        <label className="filter-label">
          <span>{t('Adres')}</span>
          <span className="filter-label-sub">{t('Türkiye')}</span>
        </label>
        <select 
          className="filter-select"
          value={filters.city}
          onChange={(e) => handleSelectChange('city', e.target.value)}
        >
          <option value="">{t('Tüm İller')}</option>
          <option value="İstanbul">İstanbul</option>
          <option value="İzmir">İzmir</option>
          <option value="Muğla">Muğla</option>
          <option value="Antalya">Antalya</option>
          <option value="Balıkesir">Balıkesir</option>
          <option value="Çanakkale">Çanakkale</option>
          <option value="Mersin">Mersin</option>
          <option value="Aydın">Aydın</option>
          <option value="Trabzon">Trabzon</option>
          <option value="Bursa">Bursa</option>
        </select>
      </div>

      {/* Fiyat */}
      <div className="filter-group" id="filter-price-group">
        <label className="filter-label">{t('Fiyat')}</label>
        <div className="currency-toggles">
          {(['TRY', 'USD', 'EUR', 'GBP'] as const).map(c => {
            const isSelected = filters.currency === c || (filters.currency === 'TL' && c === 'TRY');
            return (
              <button 
                key={c}
                type="button"
                className={`currency-btn ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelectChange('currency', c)}
              >
                {c === 'TRY' ? 'TL' : c}
              </button>
            );
          })}
        </div>
        <div className="price-range">
          <input 
            type="number" 
            placeholder="min" 
            className="filter-input"
            value={filters.priceMin}
            onChange={(e) => handleSelectChange('priceMin', e.target.value)}
          />
          <span className="price-separator">—</span>
          <input 
            type="number" 
            placeholder="max" 
            className="filter-input"
            value={filters.priceMax}
            onChange={(e) => handleSelectChange('priceMax', e.target.value)}
          />
        </div>
      </div>

      {/* Kimden */}
      <div className="filter-group" id="filter-seller-group">
        <label className="filter-label">{t('Kimden')}</label>
        <div className="radio-group">
          <label className="radio-option">
            <input 
              type="radio" 
              name="seller" 
              value="" 
              checked={filters.sellerType === ''} 
              onChange={() => handleSelectChange('sellerType', '')} 
            /> 
            <span>{t('Tümü')}</span>
          </label>
          <label className="radio-option">
            <input 
              type="radio" 
              name="seller" 
              value="sahibinden" 
              checked={filters.sellerType === 'sahibinden'} 
              onChange={() => handleSelectChange('sellerType', 'sahibinden')} 
            /> 
            <span>{t('Sahibinden')}</span>
          </label>
          <label className="radio-option">
            <input 
              type="radio" 
              name="seller" 
              value="magazadan" 
              checked={filters.sellerType === 'magazadan'} 
              onChange={() => handleSelectChange('sellerType', 'magazadan')} 
            /> 
            <span>{t('Mağazadan')}</span>
          </label>
          <label className="radio-option">
            <input 
              type="radio" 
              name="seller" 
              value="firmadan" 
              checked={filters.sellerType === 'firmadan'} 
              onChange={() => handleSelectChange('sellerType', 'firmadan')} 
            /> 
            <span>{t('Firmadan')}</span>
          </label>
        </div>
      </div>

      {/* Durumu */}
      <div className="filter-group" id="filter-condition-group">
        <label className="filter-label">{t('Durumu')}</label>
        <div className="radio-group">
          <label className="radio-option">
            <input 
              type="radio" 
              name="condition" 
              value="" 
              checked={filters.condition === ''} 
              onChange={() => handleSelectChange('condition', '')} 
            /> 
            <span>{t('Tümü')}</span>
          </label>
          <label className="radio-option">
            <input 
              type="radio" 
              name="condition" 
              value="sifir" 
              checked={filters.condition === 'sifir'} 
              onChange={() => handleSelectChange('condition', 'sifir')} 
            /> 
            <span>{t('Sıfır')}</span>
          </label>
          <label className="radio-option">
            <input 
              type="radio" 
              name="condition" 
              value="ikinci_el" 
              checked={filters.condition === 'ikinci_el'} 
              onChange={() => handleSelectChange('condition', 'ikinci_el')} 
            /> 
            <span>{t('İkinci El')}</span>
          </label>
        </div>
      </div>

      {/* Takaslı */}
      <div className="filter-group" id="filter-swap-group">
        <label className="filter-label">{t('Takaslı')}</label>
        <div className="radio-group">
          <label className="radio-option">
            <input 
              type="radio" 
              name="swap" 
              value="" 
              checked={filters.isSwap === ''} 
              onChange={() => handleSelectChange('isSwap', '')} 
            /> 
            <span>{t('Tümü')}</span>
          </label>
          <label className="radio-option">
            <input 
              type="radio" 
              name="swap" 
              value="true" 
              checked={filters.isSwap === true} 
              onChange={() => handleSelectChange('isSwap', true)} 
            /> 
            <span>{t('Evet')}</span>
          </label>
          <label className="radio-option">
            <input 
              type="radio" 
              name="swap" 
              value="false" 
              checked={filters.isSwap === false} 
              onChange={() => handleSelectChange('isSwap', false)} 
            /> 
            <span>{t('Hayır')}</span>
          </label>
        </div>
      </div>

      {/* Model Yılı */}
      <div className="filter-group" id="filter-year-group">
        <label className="filter-label">{t('Model Yılı')}</label>
        <input 
          type="number" 
          id="filter-year" 
          placeholder="ör: 2022" 
          className="filter-input filter-input-full"
          value={filters.yearMin}
          onChange={(e) => handleSelectChange('yearMin', e.target.value)}
        />
      </div>

      {/* Boy (metre) */}
      <div className="filter-group" id="filter-length-group">
        <label className="filter-label">{t('Boy (metre)')}</label>
        <input 
          type="number" 
          id="filter-length" 
          placeholder="ör: 12" 
          className="filter-input filter-input-full"
          step="0.1"
          value={filters.lengthMin}
          onChange={(e) => handleSelectChange('lengthMin', e.target.value)}
        />
      </div>

      {/* Fotoğraflı */}
      <div className="filter-group" id="filter-photo-group">
        <label className="checkbox-option">
          <input 
            type="checkbox" 
            id="filter-has-photo"
            checked={filters.onlyPhotos}
            onChange={(e) => handleCheckboxChange('onlyPhotos', e.target.checked)}
          />
          <span>{t('Sadece fotoğraflı ilanlar')}</span>
        </label>
      </div>

      {/* Filtrele Butonu (Mobil) */}
      <button 
        className="btn-apply-filters" 
        id="btn-apply-filters"
        onClick={onClose}
      >
        {t('Filtrele')}
      </button>
    </aside>
  );
}
