'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { User } from '@supabase/supabase-js';
import { Check, ArrowLeft, ArrowRight, Upload, X, CheckSquare } from 'lucide-react';

const STEPS = [
  'Tür',
  'Kategori',
  'Detaylar',
  'Özellikler',
  'Fiyat & Konum',
  'Fotoğraflar',
  'Önizleme'
];

const CATEGORIES = [
  { value: 'motoryat', label: 'Motoryat', icon: '🚤' },
  { value: 'yelkenli', label: 'Yelkenli', icon: '⛵' },
  { value: 'katamaran', label: 'Katamaran', icon: '🛥️' },
  { value: 'surat_teknesi', label: 'Sürat Teknesi', icon: '💨' },
  { value: 'bot', label: 'Bot', icon: '🚣' },
  { value: 'jet_ski', label: 'Jet Ski', icon: '🏄' },
  { value: 'guverte_teknesi', label: 'Güverte Teknesi', icon: '🛳️' },
  { value: 'gulet', label: 'Gulet', icon: '⚓' }
];

const FEATURES_SCHEMA = {
  kamara: {
    label: 'Kamara',
    items: ['Banyo & WC', 'Personel Kabini', 'Salon', 'Yatak Odası']
  },
  mutfak: {
    label: 'Mutfak',
    items: ['Buzdolabı', 'Buz Yapıcı', 'Derin Dondurucu', 'Fırın & Mikrodalga', 'Ocak', 'Su Isıtıcı']
  },
  guverte: {
    label: 'Güverte Ekipmanları',
    items: ['Can Yeleği', 'Çapa', 'Direk & Yelken', 'Elektrikli Irgat', 'Otopilot', 'Pasarella', 'Zincir']
  },
  tanklar: {
    label: 'Tanklar',
    items: ['Atık Su Tankı', 'Pis Su Tankı', 'Temiz Su Tankı', 'Yakıt Tankı']
  },
  elektronik: {
    label: 'Elektronik',
    items: ['GPS', 'Pusula', 'Radar', 'Telsiz', 'TV & Uydu']
  },
  elektrik: {
    label: 'Elektrik Donanımı',
    items: ['Akü', 'Güneş Paneli', 'Inverter', 'Jeneratör', 'Klima', 'Sintine Pompası']
  }
};

export default function CreateListingPage() {
  const t = useTranslations();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Form State
  const [type, setType] = useState<'sale' | 'rent'>('sale');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [length, setLength] = useState('');
  const [beam, setBeam] = useState('');
  const [hullMaterial, setHullMaterial] = useState('');
  const [cabinCount, setCabinCount] = useState('');
  const [engineCount, setEngineCount] = useState('');
  const [enginePower, setEnginePower] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [engineHours, setEngineHours] = useState('');
  const [flag, setFlag] = useState('Türkiye');
  
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('TRY');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string[]>>({
    kamara: [],
    mutfak: [],
    guverte: [],
    tanklar: [],
    elektronik: [],
    elektrik: []
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        alert('İlan oluşturmak için giriş yapmalısınız.');
        router.push('/auth/login');
      } else {
        setUser(session.user);
      }
    });
  }, [supabase, router]);

  const handleNext = () => {
    // Basic step validation
    if (currentStep === 1 && !type) return;
    if (currentStep === 2 && !category) {
      alert('Lütfen bir kategori seçin.');
      return;
    }
    if (currentStep === 3 && (!title.trim() || title.length < 5)) {
      alert('Lütfen geçerli bir başlık girin (en az 5 karakter).');
      return;
    }
    if (currentStep === 5 && (!price || !city)) {
      alert('Lütfen fiyat ve konum bilgilerini doldurun.');
      return;
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleFeatureToggle = (catKey: string, item: string) => {
    const active = selectedFeatures[catKey] || [];
    const updated = active.includes(item)
      ? active.filter(x => x !== item)
      : [...active, item];
      
    setSelectedFeatures({
      ...selectedFeatures,
      [catKey]: updated
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    // Limits
    if (images.length + files.length > 10) {
      alert('En fazla 10 fotoğraf yükleyebilirsiniz.');
      return;
    }

    setImages([...images, ...files]);
    
    // Read previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg('');

    try {
      let uploadedUrls: string[] = [];

      // 1. Upload images to Supabase Storage if present
      if (images.length > 0) {
        setUploadingImages(true);
        const promises = images.map(async (file, i) => {
          const path = `${user.id}/${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
          const { data, error } = await supabase.storage
            .from('boat-images')
            .upload(path, file, { cacheControl: '3600', upsert: true });

          if (error) throw error;
          
          const { data: { publicUrl } } = supabase.storage
            .from('boat-images')
            .getPublicUrl(path);
            
          return publicUrl;
        });
        
        uploadedUrls = await Promise.all(promises);
        setUploadingImages(false);
      } else {
        // Fallback placeholder images if none uploaded
        uploadedUrls = ['https://picsum.photos/seed/placeholder/800/600'];
      }

      // Generate a slug
      const slugBase = title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
      const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

      // 2. Insert into PostgreSQL Listings Table
      const record = {
        user_id: user.id,
        status: 'pending', // awaits admin approval
        title,
        slug,
        description,
        category,
        brand,
        model: model || null,
        type,
        sale_price: type === 'sale' ? Number(price) : null,
        rent_price_daily: type === 'rent' ? Number(price) : null,
        currency,
        city,
        district: district || null,
        year: year ? Number(year) : null,
        length_m: length ? Number(length) : null,
        beam_m: beam ? Number(beam) : null,
        hull_material: hullMaterial || null,
        cabin_count: cabinCount ? Number(cabinCount) : null,
        engine_count: engineCount ? Number(engineCount) : null,
        engine_power_hp: enginePower ? Number(enginePower) : null,
        fuel_type: fuelType || null,
        engine_hours: engineHours ? Number(engineHours) : null,
        flag: flag || 'Türkiye',
        is_swap: selectedFeatures.isSwap ? true : false,
        features: selectedFeatures,
        images: uploadedUrls,
        thumbnail: uploadedUrls[0] || null
      };

      const { data, error } = await supabase
        .from('listings')
        .insert(record)
        .select()
        .single();

      if (error) throw error;

      alert('İlanınız başarıyla değerlendirmeye alındı! Onaylandıktan sonra yayına alınacaktır.');
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'İlan kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-bg-body py-12">
        <div className="container max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text-primary mb-1">{t('Yeni İlan Oluştur')}</h1>
            <p className="text-sm text-text-secondary">{t('Birkaç basit adımda ilanınızı ekleyin')}</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-between items-center mb-8 bg-bg-card p-4 rounded-xl border border-border overflow-x-auto scrollbar-none">
            {STEPS.map((step, i) => {
              const num = i + 1;
              const isDone = num < currentStep;
              const isActive = num === currentStep;
              return (
                <div key={step} className="flex items-center gap-2 whitespace-nowrap">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isDone ? 'bg-green-500 text-white' : isActive ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-800 text-text-secondary'}`}>
                    {isDone ? <Check size={14} strokeWidth={3} /> : num}
                  </div>
                  <span className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-text-secondary'}`}>{step}</span>
                  {i < STEPS.length - 1 && <span className="text-text-muted px-1">/</span>}
                </div>
              );
            })}
          </div>

          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6 border border-red-200 dark:border-red-900/50">
              {errorMsg}
            </div>
          )}

          {/* Step Contents */}
          <div className="bg-bg-card border border-border rounded-xl p-6 shadow-sm min-h-[350px] flex flex-col">
            
            {/* Step 1: Type Selection */}
            {currentStep === 1 && (
              <div className="space-y-6 flex-1">
                <h2 className="text-lg font-bold text-text-primary">{t('İlan Türü')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    className={`p-6 border-2 rounded-xl text-center flex flex-col items-center justify-center gap-2 transition-all ${type === 'sale' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50 text-text-primary'}`}
                    onClick={() => setType('sale')}
                  >
                    <span className="text-4xl">🏷️</span>
                    <span className="font-bold">{t('Satılık')}</span>
                    <span className="text-xs text-text-muted">{t('Satılık tekne ilanı verin')}</span>
                  </button>
                  <button 
                    className={`p-6 border-2 rounded-xl text-center flex flex-col items-center justify-center gap-2 transition-all ${type === 'rent' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50 text-text-primary'}`}
                    onClick={() => setType('rent')}
                  >
                    <span className="text-4xl">📅</span>
                    <span className="font-bold">{t('Kiralık')}</span>
                    <span className="text-xs text-text-muted">{t('Kiralık tekne ilanı verin')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Category Selection */}
            {currentStep === 2 && (
              <div className="space-y-6 flex-1">
                <h2 className="text-lg font-bold text-text-primary">{t('Tekne Kategorisi')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat.value}
                      className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${category === cat.value ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50 text-text-primary'}`}
                      onClick={() => setCategory(cat.value)}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="text-xs font-semibold">{t(cat.label)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Details Form */}
            {currentStep === 3 && (
              <div className="space-y-4 flex-1">
                <h2 className="text-lg font-bold text-text-primary">{t('Tekne Detayları')}</h2>
                <div className="form-group">
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('İlan Başlığı *')}</label>
                  <input 
                    type="text" 
                    placeholder="Grand Soleil 40 | 12 Metre Yelkenli" 
                    className="w-full border border-border rounded p-2.5 text-sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('Açıklama')}</label>
                  <textarea 
                    rows={4}
                    placeholder="Tekneniz hakkında detaylı bilgi yazın..." 
                    className="w-full border border-border rounded p-2.5 text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('Marka')}</label>
                    <input 
                      type="text" 
                      placeholder="Azimut" 
                      className="w-full border border-border rounded p-2.5 text-sm"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Model</label>
                    <input 
                      type="text" 
                      placeholder="40" 
                      className="w-full border border-border rounded p-2.5 text-sm"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('Model Yılı')}</label>
                    <input 
                      type="number" 
                      placeholder="2020" 
                      className="w-full border border-border rounded p-2.5 text-sm"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('Boy (metre)')}</label>
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="12.5" 
                      className="w-full border border-border rounded p-2.5 text-sm"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">En (metre)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="3.8" 
                      className="w-full border border-border rounded p-2.5 text-sm"
                      value={beam}
                      onChange={(e) => setBeam(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Çalışma Saati</label>
                    <input 
                      type="number" 
                      placeholder="1200" 
                      className="w-full border border-border rounded p-2.5 text-sm"
                      value={engineHours}
                      onChange={(e) => setEngineHours(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Features Selection */}
            {currentStep === 4 && (
              <div className="space-y-6 flex-1">
                <h2 className="text-lg font-bold text-text-primary">{t('Donanım & Özellikler')}</h2>
                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                  {Object.entries(FEATURES_SCHEMA).map(([catKey, schema]) => (
                    <div key={catKey} className="space-y-2">
                      <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">{schema.label}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {schema.items.map(item => {
                          const isSel = selectedFeatures[catKey]?.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              className={`p-2 border rounded-lg text-left text-xs font-medium flex items-center gap-2 transition-all ${isSel ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/50 text-text-primary'}`}
                              onClick={() => handleFeatureToggle(catKey, item)}
                            >
                              <span className={`w-4 h-4 rounded border flex items-center justify-center ${isSel ? 'border-primary bg-primary text-white' : 'border-border'}`}>
                                {isSel && <Check size={10} strokeWidth={4} />}
                              </span>
                              <span>{item}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Price & Location */}
            {currentStep === 5 && (
              <div className="space-y-4 flex-1">
                <h2 className="text-lg font-bold text-text-primary">{t('Fiyat & Konum')}</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 form-group">
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">
                      {type === 'sale' ? t('Satış Fiyatı *') : t('Günlük Kiralama Fiyatı *')}
                    </label>
                    <input 
                      type="number" 
                      placeholder="150000" 
                      className="w-full border border-border rounded p-2.5 text-sm"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Para Birimi</label>
                    <select 
                      className="w-full border border-border rounded p-2.5 text-sm bg-bg-card"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                    >
                      <option value="TRY">TL</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('İl')}</label>
                    <select 
                      className="w-full border border-border rounded p-2.5 text-sm bg-bg-card"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    >
                      <option value="">{t('İl seçin')}</option>
                      <option value="İstanbul">İstanbul</option>
                      <option value="İzmir">İzmir</option>
                      <option value="Muğla">Muğla</option>
                      <option value="Antalya">Antalya</option>
                      <option value="Balıkesir">Balıkesir</option>
                      <option value="Çanakkale">Çanakkale</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('İlçe')}</label>
                    <input 
                      type="text" 
                      placeholder="Bodrum" 
                      className="w-full border border-border rounded p-2.5 text-sm"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Photos Upload */}
            {currentStep === 6 && (
              <div className="space-y-6 flex-1">
                <h2 className="text-lg font-bold text-text-primary">{t('Fotoğraflar')}</h2>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors relative cursor-pointer">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={36} className="text-text-muted mb-2" />
                    <span className="font-bold text-text-primary text-sm">Fotoğrafları buraya sürükleyin veya seçin</span>
                    <span className="text-xs text-text-muted">En fazla 10 görsel yükleyebilirsiniz</span>
                  </div>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-5 gap-3 mt-4">
                    {imagePreviews.map((preview, i) => (
                      <div key={i} className="relative aspect-square border border-border rounded-lg overflow-hidden group">
                        <img src={preview} alt="Önizleme" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(i)}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 7: Preview & Submit */}
            {currentStep === 7 && (
              <div className="space-y-6 flex-1">
                <h2 className="text-lg font-bold text-text-primary">{t('Önizleme')}</h2>
                <div className="space-y-4 text-sm text-text-secondary bg-bg-body p-4 rounded-xl border border-border">
                  <div className="flex justify-between font-bold text-text-primary">
                    <span>{t('İlan Başlığı *')}</span>
                    <span>{title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('İlan Türü')}</span>
                    <span>{type === 'sale' ? t('Satılık') : t('Kiralık')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('Tekne Kategorisi')}</span>
                    <span>{category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('Marka')}</span>
                    <span>{brand} {model}</span>
                  </div>
                  <div className="flex justify-between font-bold text-primary">
                    <span>{t('Fiyat')}</span>
                    <span>{price} {currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('Konum')}</span>
                    <span>{city}{district ? `, ${district}` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('Fotoğraflar')}</span>
                    <span>{images.length} {t('adet')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons at bottom of form card */}
            <div className="flex justify-between mt-auto pt-6 border-t border-border">
              {currentStep > 1 ? (
                <button 
                  type="button"
                  className="px-4 py-2 border border-border rounded-lg text-sm font-semibold text-text-primary hover:bg-bg-hover transition-colors"
                  onClick={handlePrev}
                  disabled={loading}
                >
                  {t('← Geri')}
                </button>
              ) : <div />}

              {currentStep < STEPS.length ? (
                <button 
                  type="button"
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold transition-opacity"
                  onClick={handleNext}
                  disabled={loading}
                >
                  {t('İleri →')}
                </button>
              ) : (
                <button 
                  type="button"
                  className="px-6 py-2 bg-accent text-white rounded-lg text-sm font-semibold transition-opacity"
                  onClick={handlePublish}
                  disabled={loading || uploadingImages}
                >
                  {loading ? 'Yayınlanıyor...' : t('🚀 Yayınla')}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
