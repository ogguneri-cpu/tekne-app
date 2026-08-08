'use client';

import React, { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { User } from '@supabase/supabase-js';
import { Trash2, Upload, ArrowLeft } from 'lucide-react';
import RichTextEditor from '@/components/common/RichTextEditor';

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

interface EditListingPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default function EditListingPage({ params }: EditListingPageProps) {
  const { id } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);

  // Form Fields State
  const [type, setType] = useState<'sale' | 'rent'>('sale');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [length, setLength] = useState('');
  const [beam, setBeam] = useState('');
  const [cabinCount, setCabinCount] = useState('');
  const [hullType, setHullType] = useState('');
  const [bodyMaterial, setBodyMaterial] = useState('');
  const [engineCount, setEngineCount] = useState('');
  const [enginePower, setEnginePower] = useState('');
  const [engineBrand, setEngineBrand] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [engineHours, setEngineHours] = useState('');
  const [flag, setFlag] = useState('Türkiye');
  const [sellerType, setSellerType] = useState('owner');
  const [condition, setCondition] = useState('used');
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

  // Image Management
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);

  // Fetch listing data
  useEffect(() => {
    async function loadData() {
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }
      setUser(session.user);

      // Get Listing
      const { data: listing, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !listing) {
        setErrorMsg('İlan bulunamadı.');
        setLoading(false);
        return;
      }

      // Authorization Check: Must be owner or admin
      const isOwner = listing.user_id === session.user.id;
      const isAdmin = session.user.user_metadata?.role === 'admin';

      if (!isOwner && !isAdmin) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      // Populate State
      setType(listing.type === 'rent' ? 'rent' : 'sale');
      setCategory(listing.category || '');
      setTitle(listing.title || '');
      setDescription(listing.description || '');
      const listingBrand = listing.brand || '';
      const isPopular = POPULAR_BRANDS.includes(listingBrand);
      if (listingBrand && !isPopular) {
        setBrand('Diğer');
        setCustomBrand(listingBrand);
      } else {
        setBrand(listingBrand);
        setCustomBrand('');
      }
      setModel(listing.model || '');
      setYear(listing.year ? String(listing.year) : '');
      setLength(listing.length_m ? String(listing.length_m) : '');
      setBeam(listing.beam_m ? String(listing.beam_m) : '');
      setCabinCount(listing.cabin_count ? String(listing.cabin_count) : '');
      setHullType(listing.hull_material || '');
      setBodyMaterial(listing.hull_material || ''); // Map body material or hull material
      setEngineCount(listing.engine_count ? String(listing.engine_count) : '');
      setEnginePower(listing.engine_power_hp ? String(listing.engine_power_hp) : '');
      setEngineBrand(listing.engine_brand || '');
      setFuelType(listing.fuel_type || '');
      setEngineHours(listing.engine_hours ? String(listing.engine_hours) : '');
      setFlag(listing.flag || 'Türkiye');
      setSellerType(listing.seller_type || 'owner');
      setCondition(listing.condition || 'used');
      setIsSwap(!!listing.is_swap);

      // Price Formatting (Turkey dot style)
      const rawPrice = listing.type === 'rent' ? listing.rent_price_daily : listing.sale_price;
      setPrice(rawPrice ? new Intl.NumberFormat('tr-TR').format(rawPrice) : '');
      setCurrency(listing.currency || 'TRY');
      setCity(listing.city || '');
      setDistrict(listing.district || '');

      // Features
      if (listing.features) {
        const feat = { ...selectedFeatures };
        Object.keys(FEATURES_SCHEMA).forEach(cat => {
          if (Array.isArray(listing.features[cat])) {
            feat[cat] = listing.features[cat];
          }
        });
        setSelectedFeatures(feat);
      }

      // Images
      setCurrentImages(listing.images || []);

      setLoading(false);
    }
    loadData();
  }, [id, supabase, router]);

  // Handle Feature Checkbox Change
  const handleFeatureToggle = (categoryKey: string, value: string) => {
    const current = selectedFeatures[categoryKey] || [];
    let updated;
    if (current.includes(value)) {
      updated = current.filter(item => item !== value);
    } else {
      updated = [...current, value];
    }
    setSelectedFeatures(prev => ({
      ...prev,
      [categoryKey]: updated
    }));
  };

  // Image inputs handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setNewFiles(prev => [...prev, ...filesArr]);
      
      const newPreviews = filesArr.map(file => URL.createObjectURL(file));
      setNewFilePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // Remove selected new file
  const removeNewFile = (index: number) => {
    setNewFiles(newFiles.filter((_, i) => i !== index));
    setNewFilePreviews(newFilePreviews.filter((_, i) => i !== index));
  };

  // Remove existing image
  const removeCurrentImage = (index: number) => {
    setCurrentImages(currentImages.filter((_, i) => i !== index));
  };

  // Save changes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaveLoading(true);
    setErrorMsg('');

    try {
      let uploadedUrls: string[] = [];

      // 1. Upload new files if any
      if (newFiles.length > 0) {
        const promises = newFiles.map(async (file, i) => {
          const path = `imported/${user.id}/${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
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
      }

      // Combine current images and new images
      const finalImages = [...currentImages, ...uploadedUrls];

      // Parse price to integer
      const numericPrice = price ? Number(price.replace(/\./g, '')) : null;

      // 2. Prepare payload
      const payload = {
        title,
        description,
        category,
        brand: brand === 'Diğer' ? customBrand : brand,
        model: model || null,
        type,
        sale_price: type === 'sale' ? numericPrice : null,
        rent_price_daily: type === 'rent' ? numericPrice : null,
        currency,
        city,
        district: district || null,
        year: year ? Number(year) : null,
        length_m: length ? Number(length) : null,
        beam_m: beam ? Number(beam) : null,
        hull_material: bodyMaterial || hullType || null,
        cabin_count: cabinCount ? Number(cabinCount) : null,
        engine_count: engineCount ? Number(engineCount) : null,
        engine_power_hp: enginePower ? Number(enginePower) : null,
        engine_brand: engineBrand || null,
        fuel_type: fuelType || null,
        engine_hours: engineHours ? Number(engineHours) : null,
        flag: flag || 'Türkiye',
        seller_type: sellerType,
        condition: condition,
        is_swap: isSwap,
        features: selectedFeatures,
        images: finalImages,
        thumbnail: finalImages[0] || null,
        updated_at: new Date().toISOString()
      };

      // 3. Update Database record
      const { error: updateError } = await supabase
        .from('listings')
        .update(payload)
        .eq('id', id);

      if (updateError) throw updateError;

      alert('İlan başarıyla güncellendi.');
      router.push('/profile');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'İlan kaydedilirken hata oluştu.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--text-primary)' }}>
          <p>{t('İlanlar yükleniyor')}...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (unauthorized) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-primary)' }}>
          <h2>Yetkisiz Erişim</h2>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>Bu ilanı düzenleme yetkiniz bulunmamaktadır.</p>
          <Link href="/profile" className="btn-create-listing" style={{ display: 'inline-flex', padding: '10px 20px' }}>
            Panele Dön
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main id="app" style={{ padding: '2rem 0', background: 'var(--bg-body)' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          
          {/* Back button */}
          <Link href="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, marginBottom: '1.5rem' }}>
            <ArrowLeft size={16} /> Geri Dön
          </Link>

          <section style={{ background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>İlanı Düzenle</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              İlan bilgilerini güncelleyin ve değişiklikleri kaydedin.
            </p>

            {errorMsg && (
              <div style={{ background: 'rgba(255, 90, 95, 0.1)', border: '1px solid rgba(255, 90, 95, 0.2)', color: 'rgb(255, 90, 95)', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                ✕ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Type Selection */}
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.95rem' }}>İlan Türü</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setType('sale')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      background: type === 'sale' ? 'var(--color-primary)' : 'var(--bg-body)',
                      color: type === 'sale' ? '#fff' : 'var(--text-primary)',
                      transition: 'all 0.2s'
                    }}
                  >
                    Satılık
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('rent')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      background: type === 'rent' ? 'var(--color-primary)' : 'var(--bg-body)',
                      color: type === 'rent' ? '#fff' : 'var(--text-primary)',
                      transition: 'all 0.2s'
                    }}
                  >
                    Kiralık
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <div className="form-group">
                <label htmlFor="edit-title" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>İlan Başlığı *</label>
                <input
                  type="text"
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-desc" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>Açıklama</label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Teknenizin özelliklerini detaylı anlatın..."
                />
              </div>

              {/* Category & Brand dropdowns */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label htmlFor="edit-category" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>Kategori</label>
                  <select
                    id="edit-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  >
                    <option value="">Seçin</option>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label htmlFor="edit-brand" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>Marka</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                    <select
                      id="edit-brand"
                      value={brand}
                      onChange={(e) => {
                        setBrand(e.target.value);
                        if (e.target.value !== 'Diğer') {
                          setCustomBrand('');
                        }
                      }}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                    >
                      <option value="">Seçin</option>
                      {POPULAR_BRANDS.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                      <option value="Diğer">Diğer</option>
                    </select>
                    {brand === 'Diğer' && (
                      <input
                        type="text"
                        placeholder="Tekne markasını yazınız"
                        value={customBrand}
                        onChange={(e) => setCustomBrand(e.target.value)}
                        required
                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box' }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Model & Year */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label htmlFor="edit-model" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>Model</label>
                  <input
                    type="text"
                    id="edit-model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label htmlFor="edit-year" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>Model Yılı</label>
                  <input
                    type="number"
                    id="edit-year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Length & Beam */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label htmlFor="edit-length" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>Boy (metre)</label>
                  <input
                    type="number"
                    step="0.1"
                    id="edit-length"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label htmlFor="edit-beam" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>En (metre)</label>
                  <input
                    type="number"
                    step="0.1"
                    id="edit-beam"
                    value={beam}
                    onChange={(e) => setBeam(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Engine Details */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label htmlFor="edit-engine-brand" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>Motor Markası</label>
                  <input
                    type="text"
                    id="edit-engine-brand"
                    value={engineBrand}
                    onChange={(e) => setEngineBrand(e.target.value)}
                    placeholder="ör: Yanmar, Volvo"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label htmlFor="edit-engine-power" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>Motor Gücü (HP)</label>
                  <input
                    type="number"
                    id="edit-engine-power"
                    value={enginePower}
                    onChange={(e) => setEnginePower(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label htmlFor="edit-engine-hours" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>Motor Saati</label>
                  <input
                    type="number"
                    id="edit-engine-hours"
                    value={engineHours}
                    onChange={(e) => setEngineHours(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label htmlFor="edit-engine-count" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>Motor Adedi</label>
                  <input
                    type="number"
                    id="edit-engine-count"
                    value={engineCount}
                    onChange={(e) => setEngineCount(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Price Row (Turkey separator dot style) */}
              <div className="form-group">
                <label htmlFor="edit-price" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>Fiyat *</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input
                    type="text"
                    id="edit-price"
                    value={price}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPrice(val ? new Intl.NumberFormat('tr-TR').format(parseInt(val, 10)) : '');
                    }}
                    required
                    style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                  <select
                    id="edit-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={{ width: '100px', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  >
                    <option value="TRY">TL</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label htmlFor="edit-city" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>İl *</label>
                  <input
                    type="text"
                    id="edit-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label htmlFor="edit-district" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>İlçe</label>
                  <input
                    type="text"
                    id="edit-district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Condition & Swap */}
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', margin: '0.5rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  <input
                    type="checkbox"
                    checked={isSwap}
                    onChange={(e) => setIsSwap(e.target.checked)}
                  />
                  Takas Yapılır
                </label>
              </div>

              {/* Images Section */}
              <div className="form-group" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>İlan Fotoğrafları</label>
                
                {/* Existing Images */}
                {currentImages.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Mevcut Yüklü Resimler (Görseli silmek için çöp kutusuna tıklayın):</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                      {currentImages.map((url, i) => (
                        <div key={url + i} style={{ position: 'relative', width: '100px', height: '75px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                          <img src={url} alt={`Mevcut görsel ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => removeCurrentImage(i)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(255, 90, 95, 0.9)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Image Previews */}
                {newFilePreviews.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Yeni Eklenecek Resimler:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                      {newFilePreviews.map((url, i) => (
                        <div key={url + i} style={{ position: 'relative', width: '100px', height: '75px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                          <img src={url} alt={`Yeni görsel ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => removeNewFile(i)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(255, 90, 95, 0.9)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image Upload Input */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label 
                    htmlFor="edit-image-upload" 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      background: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      border: '1px dashed var(--color-primary)'
                    }}
                  >
                    <Upload size={16} /> Fotoğraf Ekle
                  </label>
                  <input
                    type="file"
                    id="edit-image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Toplam en fazla 20 fotoğraf yükleyebilirsiniz.</span>
                </div>
              </div>

              {/* Features List */}
              <div className="form-group" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '1.5rem', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Tekne Özellikleri (Seçim Yapın)</label>
                
                <div className="create-features" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {Object.entries(FEATURES_SCHEMA).map(([catKey, schema]) => (
                    <div key={catKey} className="feature-category-group" style={{ background: 'none', padding: 0, border: 'none' }}>
                      <h3 className="feature-category-title" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>{schema.label}</h3>
                      <div className="feature-items-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                        {schema.items.map(item => {
                          const isChecked = selectedFeatures[catKey]?.includes(item);
                          return (
                            <label key={item} className={`feature-item-checkbox ${isChecked ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
                              <input 
                                type="checkbox" 
                                checked={isChecked}
                                onChange={() => handleFeatureToggle(catKey, item)}
                                style={{ display: 'none' }}
                              />
                              <span className="create-feat-check">{isChecked ? '✓' : ''}</span>
                              <span className="create-feat-label">{item}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-body)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: saveLoading ? 0.7 : 1
                  }}
                >
                  {saveLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>

            </form>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
