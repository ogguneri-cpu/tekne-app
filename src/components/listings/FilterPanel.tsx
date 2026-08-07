'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { RefreshCw } from 'lucide-react';

export interface FilterState {
  brand: string;
  city: string;
  currency: 'TRY' | 'EUR' | 'USD' | 'GBP' | 'TL';
  priceMin: string;
  priceMax: string;
  sellerType: string;
  condition: string;
  isSwap: boolean;
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
}

const POPULAR_BRANDS = [
  'Azimut', 'Beneteau', 'Bavaria', 'Yamaha', 'Sea Ray', 'Jeanneau', 
  'Princess', 'Sunseeker', 'Lagoon', 'Fountaine Pajot', 'Zodiac', 
  'Quicksilver', 'Bayliner', 'Mercury', 'Ferretti', 'Grand Soleil', 'Dufour'
];

export default function FilterPanel({ filters, onChange, onClear }: FilterPanelProps) {
  const t = useTranslations();
  const supabase = createClient();
  const [brands, setBrands] = useState<string[]>(POPULAR_BRANDS);

  useEffect(() => {
    // Fetch distinct brands from database
    const fetchBrands = async () => {
      try {
        const { data, error } = await supabase
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
    <aside className="filter-panel" id="filter-panel">
      <div className="filter-header flex justify-between items-center pb-4 border-b border-border mb-4">
        <h3 className="text-lg font-bold text-text-primary">{t('Filtreler')}</h3>
        <button 
          className="filter-clear-btn text-sm text-primary font-semibold flex items-center gap-1"
          onClick={onClear}
        >
          <RefreshCw size={12} />
          {t('Temizle')}
        </button>
      </div>

      {/* Marka */}
      <div className="filter-group mb-4">
        <label className="filter-label block text-sm font-semibold mb-1">{t('Marka')}</label>
        <select 
          className="filter-select w-full border border-border rounded p-2" 
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
      <div className="filter-group mb-4">
        <label className="filter-label block text-sm font-semibold mb-1 flex justify-between">
          <span>{t('Adres')}</span>
          <span className="filter-label-sub text-xs text-text-muted">{t('Türkiye')}</span>
        </label>
        <select 
          className="filter-select w-full border border-border rounded p-2"
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
      <div className="filter-group mb-4">
        <label className="filter-label block text-sm font-semibold mb-1">{t('Fiyat')}</label>
        <div className="currency-toggles flex gap-2 mb-2">
          {(['TRY', 'EUR', 'USD', 'GBP'] as const).map(c => (
            <button 
              key={c}
              className={`currency-btn flex-1 py-1 text-xs border rounded ${filters.currency === c || (filters.currency === 'TL' && c === 'TRY') ? 'active bg-primary text-white border-primary' : 'border-border'}`}
              onClick={() => handleSelectChange('currency', c)}
            >
              {c === 'TRY' ? 'TL' : c}
            </button>
          ))}
        </div>
        <div className="filter-range flex gap-2">
          <input 
            type="number" 
            placeholder="Min" 
            className="w-1/2 border border-border rounded p-2 text-sm"
            value={filters.priceMin}
            onChange={(e) => handleSelectChange('priceMin', e.target.value)}
          />
          <input 
            type="number" 
            placeholder="Max" 
            className="w-1/2 border border-border rounded p-2 text-sm"
            value={filters.priceMax}
            onChange={(e) => handleSelectChange('priceMax', e.target.value)}
          />
        </div>
      </div>

      {/* Kimden (Satıcı Tipi) */}
      <div className="filter-group mb-4">
        <label className="filter-label block text-sm font-semibold mb-1">{t('Kimden')}</label>
        <select
          className="filter-select w-full border border-border rounded p-2"
          value={filters.sellerType}
          onChange={(e) => handleSelectChange('sellerType', e.target.value)}
        >
          <option value="">{t('Tümü')}</option>
          <option value="sahibinden">{t('Sahibinden')}</option>
          <option value="magazadan">{t('Mağazadan')}</option>
          <option value="firmadan">{t('Firmadan')}</option>
        </select>
      </div>

      {/* Durumu */}
      <div className="filter-group mb-4">
        <label className="filter-label block text-sm font-semibold mb-1">{t('Durumu')}</label>
        <select
          className="filter-select w-full border border-border rounded p-2"
          value={filters.condition}
          onChange={(e) => handleSelectChange('condition', e.target.value)}
        >
          <option value="">{t('Tümü')}</option>
          <option value="sifir">{t('Sıfır')}</option>
          <option value="ikinci_el">{t('İkinci El')}</option>
        </select>
      </div>

      {/* Model Yılı */}
      <div className="filter-group mb-4">
        <label className="filter-label block text-sm font-semibold mb-1">{t('Model Yılı')}</label>
        <div className="filter-range flex gap-2">
          <input 
            type="number" 
            placeholder="Min" 
            className="w-1/2 border border-border rounded p-2 text-sm"
            value={filters.yearMin}
            onChange={(e) => handleSelectChange('yearMin', e.target.value)}
          />
          <input 
            type="number" 
            placeholder="Max" 
            className="w-1/2 border border-border rounded p-2 text-sm"
            value={filters.yearMax}
            onChange={(e) => handleSelectChange('yearMax', e.target.value)}
          />
        </div>
      </div>

      {/* Boy (metre) */}
      <div className="filter-group mb-4">
        <label className="filter-label block text-sm font-semibold mb-1">{t('Boy (metre)')}</label>
        <div className="filter-range flex gap-2">
          <input 
            type="number" 
            placeholder="Min" 
            className="w-1/2 border border-border rounded p-2 text-sm"
            value={filters.lengthMin}
            onChange={(e) => handleSelectChange('lengthMin', e.target.value)}
          />
          <input 
            type="number" 
            placeholder="Max" 
            className="w-1/2 border border-border rounded p-2 text-sm"
            value={filters.lengthMax}
            onChange={(e) => handleSelectChange('lengthMax', e.target.value)}
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="filter-checkboxes space-y-2 mt-4 pt-4 border-t border-border">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input 
            type="checkbox" 
            checked={filters.isSwap}
            onChange={(e) => handleCheckboxChange('isSwap', e.target.checked)}
          />
          <span>{t('Takaslı')}</span>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input 
            type="checkbox" 
            checked={filters.onlyPhotos}
            onChange={(e) => handleCheckboxChange('onlyPhotos', e.target.checked)}
          />
          <span>{t('Sadece fotoğraflı ilanlar')}</span>
        </label>
      </div>
    </aside>
  );
}
