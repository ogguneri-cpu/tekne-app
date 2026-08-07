'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { User } from '@supabase/supabase-js';

const STEP_LABELS = ['Tip', 'Kategori', 'Bilgiler', 'Fiyat', 'Konum', 'Fotoğraflar', 'Özellikler', 'Önizleme'];

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

const POPULAR_BRANDS = [
  'Azimut', 'Beneteau', 'Bavaria', 'Yamaha', 'Sea Ray', 'Jeanneau', 
  'Princess', 'Sunseeker', 'Lagoon', 'Fountaine Pajot', 'Zodiac', 
  'Quicksilver', 'Bayliner', 'Mercury', 'Ferretti', 'Grand Soleil', 'Dufour'
];

const FEATURES_SCHEMA = {
  kamara: {
    label: 'Kamara',
    items: ['Banyo & WC', 'Personal Kabini', 'Salon', 'Yatak Odası']
  },
  mutfak: {
    label: 'Mutfak',
    items: ['Aspiratör', 'Bulaşık Makinesi', 'Buzdolabı', 'Buz Yapıcı', 'Çamaşır Makinesi', 'Çay Makinesi', 'Derin Dondurucu', 'Fırın & Mikrodalga', 'Kahve Makinesi', 'Ocak', 'Su Isıtıcı']
  },
  guverte: {
    label: 'Güverte Ekipmanları',
    items: ['Balık Tutma Malzemeleri', 'Bimini', 'Can Salı', 'Can Simidi', 'Can Yeleği', 'Çapa', 'Dalış Ekipmanları', 'Deniz Merdiveni', 'Direk & Yelken', 'Elektrikli Irgat', 'Güneş Yatakları', 'Matafora', 'Otopilot', 'Palamar', 'Pasarella', 'Şişme Bot', 'Yangın Söndürme Tertibatı', 'Zincir']
  },
  tanklar: {
    label: 'Tanklar',
    items: ['Atık Su Tankı', 'Pis Su Tankı', 'Temiz Su Tankı', 'Yakıt Tankı']
  },
  elektronik: {
    label: 'Elektronik',
    items: ['Alarm', 'CD / DVD Çalar', 'Chart Plotter', 'Derinlik Ölçer', 'GPS', 'Hız Göstergesi', 'Müzik Sistemi', 'Projektör', 'Pusula', 'Radar', 'Telsiz', 'TV & Uydu']
  },
  elektrik: {
    label: 'Elektrik Donanımı',
    items: ['AC / DC', 'Akü', 'Güneş Paneli', 'Hidrofor', 'Inverter', 'Jeneratör', 'Klima', 'Sintine Pompası']
  }
};

const SELLER_TYPE_MAP: Record<string, string> = {
  'sahibinden': 'Sahibinden',
  'magazadan': 'Mağazadan',
  'firmadan': 'Firmadan'
};

const SpecRow = ({ label, value }: { label: string; value: any }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <tr>
      <td className="sahib-spec-label" style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{label}</td>
      <td className="sahib-spec-value" style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>{String(value)}</td>
    </tr>
  );
};

const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.75
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function CreateListingPage() {
  const t = useTranslations();
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };
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
  const [cabinCount, setCabinCount] = useState('');
  const [hullType, setHullType] = useState('');
  const [bodyMaterial, setBodyMaterial] = useState('');
  const [engineCount, setEngineCount] = useState('');
  const [enginePower, setEnginePower] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [engineHours, setEngineHours] = useState('');
  const [flag, setFlag] = useState('Türkiye');
  const [sellerType, setSellerType] = useState('sahibinden');
  const [condition, setCondition] = useState('ikinci_el');
  const [isSwap, setIsSwap] = useState(false);
  
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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updatedImages = [...images];
    const draggedImage = updatedImages[draggedIndex];
    updatedImages.splice(draggedIndex, 1);
    updatedImages.splice(targetIndex, 0, draggedImage);
    setImages(updatedImages);

    const updatedPreviews = [...imagePreviews];
    const draggedPreview = updatedPreviews[draggedIndex];
    updatedPreviews.splice(draggedIndex, 1);
    updatedPreviews.splice(targetIndex, 0, draggedPreview);
    setImagePreviews(updatedPreviews);

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        alert('İlan oluşturmak için giriş yapmalısınız') + '.';
        router.push('/auth/login');
      } else {
        setUser(session.user);
      }
    });
  }, [supabase, router]);

  const handleNext = () => {
    if (currentStep === 1 && !type) return;
    if (currentStep === 2 && !category) {
      alert(t('Lütfen bir kategori seçin') + '.');
      return;
    }
    if (currentStep === 3 && (!title.trim() || title.length < 5)) {
      alert(t('Lütfen geçerli bir başlık girin (en az 5 karakter)') + '.');
      return;
    }
    if (currentStep === 4 && !price) {
      alert(t('Lütfen fiyat girin') + '.');
      return;
    }
    if (currentStep === 5 && !city) {
      alert(t('Lütfen bir il seçin') + '.');
      return;
    }
    
    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 20) {
      alert(t('En fazla 20 fotoğraf yükleyebilirsiniz') + '.');
      return;
    }

    setLoading(true);
    try {
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          try {
            const compressedBlob = await compressImage(file);
            const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            return new File([compressedBlob], newName, { type: 'image/jpeg' });
          } catch (err) {
            console.error('Compression failed for', file.name, err);
            return file;
          }
        })
      );

      setImages([...images, ...compressedFiles]);
      
      const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    } catch (err) {
      console.error('Error in file upload processing:', err);
    } finally {
      setLoading(false);
    }
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

      if (images.length > 0) {
        setUploadingImages(true);
        const promises = images.map(async (file, i) => {
          const path = `${user.id}/${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
          const { error } = await supabase.storage
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
        uploadedUrls = ['/assets/listings/grand-soleil-40/gs40-01.jpg'];
      }

      const slugBase = title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
      const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

      const record = {
        user_id: user.id,
        status: 'pending',
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
        hull_material: bodyMaterial || null,
        cabin_count: cabinCount ? Number(cabinCount) : null,
        engine_count: engineCount ? Number(engineCount) : null,
        engine_power_hp: enginePower ? Number(enginePower) : null,
        fuel_type: fuelType || null,
        engine_hours: engineHours ? Number(engineHours) : null,
        flag: flag || 'Türkiye',
        seller_type: sellerType === 'sahibinden' ? 'owner' : sellerType === 'magazadan' ? 'dealer' : 'company',
        condition: condition === 'sifir' ? 'new' : 'used',
        is_swap: isSwap,
        features: selectedFeatures,
        images: uploadedUrls,
        thumbnail: uploadedUrls[0] || null,
        user_name: user.user_metadata?.full_name || 'Kullanıcı',
        user_phone: user.user_metadata?.phone || '',
        user_email: user.email || ''
      };

      const { error } = await supabase
        .from('listings')
        .insert(record);

      if (error) throw error;

      alert('İlanınız başarıyla değerlendirmeye alındı Onaylandıktan sonra yayına alınacaktır') + '.';
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

      <main id="app">
        <div className="create-page container">
          <div className="create-header">
            <h1>{t('Yeni İlan Oluştur')}</h1>
            
            {/* Step Indicator */}
            <div className="step-indicator" id="step-indicator">
              {Array.from({ length: 8 }).map((_, i) => {
                const stepNum = i + 1;
                let cls = '';
                if (stepNum < currentStep) cls = 'completed';
                else if (stepNum === currentStep) cls = 'active';

                return (
                  <React.Fragment key={stepNum}>
                    <div className={`step-item ${cls}`}>
                      <div className="step-circle">
                        {stepNum < currentStep ? '✓' : stepNum}
                      </div>
                      <span className="step-label">{t(STEP_LABELS[i])}</span>
                    </div>
                    {stepNum < 8 && (
                      <div className={`step-line ${stepNum < currentStep ? 'completed' : ''}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <div className="auth-error" style={{ marginBottom: '1.5rem', textAlign: 'center', background: 'rgba(255, 90, 95, 0.1)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255, 90, 95, 0.2)' }}>
              {errorMsg}
            </div>
          )}

          <div className="create-form" id="create-form">
            <div className="step-content">
              {/* Step 1: Tip */}
              {currentStep === 1 && (
                <>
                  <h2 className="step-title">{t('Ne yapmak istiyorsunuz?')}</h2>
                  <p className="step-subtitle">{t('Teknenizi satışa çıkarın veya kiraya verin')}</p>
                  <div className="type-cards">
                    <button 
                      type="button"
                      className={`type-card ${type === 'sale' ? 'selected' : ''}`}
                      onClick={() => setType('sale')}
                    >
                      <span className="type-card-icon">🏷️</span>
                      <div className="type-card-title">{t('Satılık')}</div>
                      <div className="type-card-desc">{t('Teknenizi satışa çıkarın')}</div>
                    </button>
                    <button 
                      type="button"
                      className={`type-card ${type === 'rent' ? 'selected' : ''}`}
                      onClick={() => setType('rent')}
                    >
                      <span className="type-card-icon">📅</span>
                      <div className="type-card-title">{t('Kiralık')}</div>
                      <div className="type-card-desc">{t('Teknenizi kiraya verin')}</div>
                    </button>
                  </div>
                </>
              )}

              {/* Step 2: Kategori */}
              {currentStep === 2 && (
                <>
                  <h2 className="step-title">{t('Kategori seçin')}</h2>
                  <p className="step-subtitle">{t('Teknenizin türünü belirleyin')}</p>
                  <div className="category-cards">
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat.value}
                        type="button"
                        className={`category-card ${category === cat.value ? 'selected' : ''}`}
                        onClick={() => setCategory(cat.value)}
                      >
                        <span className="category-card-icon">{cat.icon}</span>
                        <span className="category-card-label">{t(cat.label)}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Step 3: Bilgiler */}
              {currentStep === 3 && (
                <>
                  <h2 className="step-title">{t('Tekne Bilgileri')}</h2>
                  <p className="step-subtitle">{t('Tekneniz hakkında detayları girin')}</p>
                  <div className="form-fields">
                    <div className="form-group">
                      <label htmlFor="create-title">{t('İlan Başlığı *')}</label>
                      <input 
                        type="text" 
                        id="create-title" 
                        placeholder={t('ör: Azimut 50 Fly — Tam Donanımlı')} 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>{t('Açıklama')}</label>
                      <textarea 
                        id="create-desc" 
                        rows={6}
                        placeholder={t('Teknenizin özelliklerini detaylı anlatın') + '...'} 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="create-brand">{t('Marka')}</label>
                      <select 
                        id="create-brand"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                      >
                        <option value="">{t('Marka seçin')}</option>
                        {POPULAR_BRANDS.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="create-model">{t('Model')}</label>
                        <input 
                          type="text" 
                          id="create-model" 
                          placeholder="ör: Grande 36M" 
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="create-year">{t('Model Yılı')}</label>
                        <input 
                          type="number" 
                          id="create-year" 
                          placeholder="2024" 
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="create-length">{t('Boy (metre)')}</label>
                        <input 
                          type="number" 
                          id="create-length" 
                          step="0.1" 
                          placeholder="12.5" 
                          value={length}
                          onChange={(e) => setLength(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="create-beam">{t('En (metre)')}</label>
                        <input 
                          type="number" 
                          id="create-beam" 
                          step="0.1" 
                          placeholder="4.2" 
                          value={beam}
                          onChange={(e) => setBeam(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="create-cabin">{t('Kamara Sayısı')}</label>
                        <select 
                          id="create-cabin"
                          value={cabinCount}
                          onChange={(e) => setCabinCount(e.target.value)}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                        >
                          <option value="">{t('Seçin')}</option>
                          {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="create-hull">{t('Gövde Tipi')}</label>
                        <select 
                          id="create-hull"
                          value={hullType}
                          onChange={(e) => setHullType(e.target.value)}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                        >
                          <option value="">{t('Seçin')}</option>
                          {['Tek Gövde', 'Çift Gövde (Katamaran)', 'RIB', 'Trimaran'].map(h => (
                            <option key={h} value={h}>{t(h)}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="create-body">{t('Gövde Malzemesi')}</label>
                        <select 
                          id="create-body"
                          value={bodyMaterial}
                          onChange={(e) => setBodyMaterial(e.target.value)}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                        >
                          <option value="">{t('Seçin')}</option>
                          {['Fiberglas', 'Ahşap', 'Alüminyum', 'Çelik', 'Karbon Fiber', 'PVC / Şişme', 'Polyester'].map(m => (
                            <option key={m} value={m}>{t(m)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="create-engine-count">{t('Motor Adedi')}</label>
                        <select 
                          id="create-engine-count"
                          value={engineCount}
                          onChange={(e) => setEngineCount(e.target.value)}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                        >
                          <option value="">{t('Seçin')}</option>
                          {['1', '2', '3', '4'].map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="create-engine-power">{t('Motor Gücü (HP)')}</label>
                        <input 
                          type="number" 
                          id="create-engine-power" 
                          placeholder="ör: 300" 
                          value={enginePower}
                          onChange={(e) => setEnginePower(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="create-fuel">{t('Yakıt Tipi')}</label>
                        <select 
                          id="create-fuel"
                          value={fuelType}
                          onChange={(e) => setFuelType(e.target.value)}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                        >
                          <option value="">{t('Seçin')}</option>
                          {['Dizel', 'Benzin', 'Elektrik', 'Hibrit', 'Rüzgar (Yelken)'].map(f => (
                            <option key={f} value={f}>{t(f)}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="create-hours">{t('Çalışma Saati')}</label>
                        <input 
                          type="number" 
                          id="create-hours" 
                          placeholder="ör: 500" 
                          value={engineHours}
                          onChange={(e) => setEngineHours(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="create-flag">{t('Bandıra')}</label>
                        <select 
                          id="create-flag"
                          value={flag}
                          onChange={(e) => setFlag(e.target.value)}
                          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                        >
                          {['Türkiye', 'İngiltere', 'ABD', 'Almanya', 'Fransa', 'İtalya', 'Yunanistan', 'Hollanda', 'Norveç', 'Malta', 'Cayman Adaları', 'Marshall Adaları', 'Diğer'].map(fl => (
                            <option key={fl} value={fl}>{fl}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>{t('Kimden')}</label>
                      <div className="radio-group">
                        <label className="radio-option">
                          <input 
                            type="radio" 
                            name="create-seller" 
                            value="sahibinden" 
                            checked={sellerType === 'sahibinden'}
                            onChange={() => setSellerType('sahibinden')}
                          />
                          <span>{t('Sahibinden')}</span>
                        </label>
                        <label className="radio-option">
                          <input 
                            type="radio" 
                            name="create-seller" 
                            value="magazadan" 
                            checked={sellerType === 'magazadan'}
                            onChange={() => setSellerType('magazadan')}
                          />
                          <span>{t('Mağazadan')}</span>
                        </label>
                        <label className="radio-option">
                          <input 
                            type="radio" 
                            name="create-seller" 
                            value="firmadan" 
                            checked={sellerType === 'firmadan'}
                            onChange={() => setSellerType('firmadan')}
                          />
                          <span>{t('Firmadan')}</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>{t('Durumu')}</label>
                      <div className="radio-group">
                        <label className="radio-option">
                          <input 
                            type="radio" 
                            name="create-condition" 
                            value="sifir" 
                            checked={condition === 'sifir'}
                            onChange={() => setCondition('sifir')}
                          />
                          <span>{t('Sıfır')}</span>
                        </label>
                        <label className="radio-option">
                          <input 
                            type="radio" 
                            name="create-condition" 
                            value="ikinci_el" 
                            checked={condition === 'ikinci_el'}
                            onChange={() => setCondition('ikinci_el')}
                          />
                          <span>{t('İkinci El')}</span>
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="checkbox-option">
                        <input 
                          type="checkbox" 
                          id="create-swap" 
                          checked={isSwap}
                          onChange={(e) => setIsSwap(e.target.checked)}
                        />
                        <span>{t('Takas yapılır')}</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Step 4: Fiyat */}
              {currentStep === 4 && (
                <>
                  <h2 className="step-title">{t('Fiyat Belirleyin')}</h2>
                  <p className="step-subtitle">{t('Tekneniz için uygun bir fiyat yazın')}</p>
                  <div className="price-input-group">
                    <div className="price-input-row" style={{ display: 'flex', gap: '1rem' }}>
                      <input 
                        type="number" 
                        id="create-price" 
                        placeholder={t('Fiyat')} 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }}
                      />
                      <select 
                        id="create-currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        style={{ width: '100px', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                      >
                        <option value="TRY">TL</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Step 5: Konum */}
              {currentStep === 5 && (
                <>
                  <h2 className="step-title">{t('Konum Seçin')}</h2>
                  <p className="step-subtitle">{t('Teknenizin bulunduğu yeri belirtin')}</p>
                  <div className="location-fields">
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label htmlFor="create-city">{t('İl *')}</label>
                      <select 
                        id="create-city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                      >
                        <option value="">{t('İl seçin')}</option>
                        {['İstanbul', 'İzmir', 'Muğla', 'Antalya', 'Balıkesir', 'Çanakkale', 'Mersin', 'Aydın', 'Trabzon', 'Bursa'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="create-district">{t('İlçe')}</label>
                      <input 
                        type="text" 
                        id="create-district" 
                        placeholder="ör: Bodrum" 
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 6: Fotoğraflar */}
              {currentStep === 6 && (
                <>
                  <h2 className="step-title">{t('Fotoğraflar')}</h2>
                  <p className="step-subtitle">
                    {t('Teknenizin fotoğraflarını yükleyin (en fazla 20 adet) — Sürükleyerek sıralayın, ilk fotoğraf kapak görseli olur')}
                  </p>
                  
                  <div className="upload-area" style={{ border: '2px dashed #0066ff' }} onClick={handleUploadAreaClick}>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      multiple 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="#1a1a1a" style={{ margin: '0 auto 1.5rem', display: 'block' }}>
                      <path d="M4 4h3l2-3h6l2 3h3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" />
                      <circle cx="12" cy="13" r="4" fill="#fff" />
                      <circle cx="12" cy="13" r="2.5" fill="#1a1a1a" />
                      <rect x="7" y="5" width="2" height="1" fill="#ffcc00" />
                    </svg>
                    <div className="upload-area-text">{t('Fotoğraf yüklemek için tıklayın veya sürükleyin')}</div>
                    <div className="upload-area-sub">{t('JPG, PNG — Maks 5MB/adet · Otomatik optimize edilir')}</div>
                  </div>
                  
                  {imagePreviews.length > 0 && (
                    <div className="photo-previews" id="photo-previews" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '1.5rem' }}>
                      {imagePreviews.map((preview, i) => (
                        <div 
                          key={i} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, i)}
                          onDragOver={(e) => handleDragOver(e, i)}
                          onDragEnd={handleDragEnd}
                          onDrop={(e) => handleDrop(e, i)}
                          style={{ 
                            position: 'relative', 
                            aspectRatio: '4/3', 
                            borderRadius: '8px', 
                            overflow: 'hidden', 
                            border: i === 0 ? '2px solid #0066ff' : '1px solid var(--border)',
                            cursor: 'grab'
                          }}
                        >
                          <img src={preview} alt="Önizleme" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          
                          {/* Cover Badge or Make Cover Button */}
                          {i === 0 ? (
                            <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: '#0066ff', color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                              {t('Kapak')}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const updatedImages = [...images];
                                const [selectedImage] = updatedImages.splice(i, 1);
                                updatedImages.unshift(selectedImage);
                                setImages(updatedImages);

                                const updatedPreviews = [...imagePreviews];
                                const [selectedPreview] = updatedPreviews.splice(i, 1);
                                updatedPreviews.unshift(selectedPreview);
                                setImagePreviews(updatedPreviews);
                              }}
                              style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                            >
                              {t('Kapak Yap')}
                            </button>
                          )}

                          {/* Delete button */}
                          <button 
                            type="button" 
                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}
                            onClick={() => handleRemoveImage(i)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Step 7: Özellikler */}
              {currentStep === 7 && (
                <>
                  <h2 className="step-title">{t('Özellikler')}</h2>
                  <p className="step-subtitle">{t('Teknenizin donanım ve özelliklerini seçin')}</p>
                  
                  <div className="create-features">
                    {Object.entries(FEATURES_SCHEMA).map(([catKey, schema]) => (
                      <div key={catKey} className="create-feat-category">
                        <h3 className="create-feat-cat-title">{t(schema.label)}</h3>
                        <div className="create-feat-grid">
                          {schema.items.map(item => {
                            const isChecked = selectedFeatures[catKey]?.includes(item);
                            return (
                              <label className={`create-feat-item ${isChecked ? 'checked' : ''}`} key={item}>
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  onChange={() => handleFeatureToggle(catKey, item)}
                                />
                                <span className="create-feat-check">{isChecked ? '✓' : ''}</span>
                                <span className="create-feat-label">{t(item)}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Step 8: Önizleme */}
              {currentStep === 8 && (
                <>
                  <h2 className="step-title">{t('Önizleme')}</h2>
                  <p className="step-subtitle">{t('İlanınızı kontrol edin ve yayınlayın')}</p>
                  
                  <div className="preview-container" style={{ padding: '1.5rem', background: 'var(--bg-body)', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
                    {imagePreviews.length > 0 && (
                      <div style={{ width: '100%', height: '280px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
                        <img 
                          src={imagePreviews[0]} 
                          alt="Kapak Görseli" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                    )}
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        {type === 'sale' ? t('Satılık') : t('Kiralık')} · {t(category)}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 0' }}>{title || t('Başlıksız')}</h3>
                      <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', margin: '8px 0 0' }}>
                        {price ? `${Number(price).toLocaleString('tr-TR')} ${currency === 'TRY' ? 'TL' : currency}` : t('Fiyat Belirtilmemiş')}
                      </p>
                    </div>

                    <table className="sahib-specs-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <tbody>
                        <SpecRow label={t('Marka')} value={brand} />
                        <SpecRow label={t('Model')} value={model} />
                        <SpecRow label={t('Model Yılı')} value={year} />
                        <SpecRow label={t('Boy')} value={length ? `${length} m` : null} />
                        <SpecRow label={t('En')} value={beam ? `${beam} m` : null} />
                        <SpecRow label={t('Kamara')} value={cabinCount} />
                        <SpecRow label={t('Gövde Tipi')} value={hullType} />
                        <SpecRow label={t('Gövde Malzemesi')} value={bodyMaterial} />
                        <SpecRow label={t('Motor Adedi')} value={engineCount} />
                        <SpecRow label={t('Motor Gücü')} value={enginePower ? `${enginePower} HP` : null} />
                        <SpecRow label={t('Çalışma Saati')} value={engineHours} />
                        <SpecRow label={t('Bandıra')} value={flag} />
                        <SpecRow label={t('Kimden')} value={t(SELLER_TYPE_MAP[sellerType] || 'Sahibinden')} />
                        <SpecRow label={t('Durumu')} value={condition === 'sifir' ? t('Sıfır') : t('İkinci El')} />
                        <SpecRow label={t('Takas')} value={isSwap ? t('Evet') : t('Hayır')} />
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Navigation buttons */}
              <div className="step-nav">
                {currentStep > 1 ? (
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    id="btn-prev-step"
                    onClick={handlePrev}
                    disabled={loading}
                  >
                    {t('Geri')}
                  </button>
                ) : <div />}

                {currentStep < 8 ? (
                  <button 
                    type="button" 
                    className="btn-primary" 
                    id="btn-next-step"
                    onClick={handleNext}
                    disabled={loading}
                  >
                    {t('İleri →')}
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="btn-primary" 
                    id="btn-publish-listing"
                    onClick={handlePublish}
                    disabled={loading || uploadingImages}
                  >
                    {loading ? t('Yayınlanıyor') + '...' : t('🚀 Yayınla')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

