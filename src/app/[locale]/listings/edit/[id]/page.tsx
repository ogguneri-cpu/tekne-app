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
  { value: 'gulet', label: 'Gulet', icon: '⚓' },
  { value: 'diger', label: 'Diğer', icon: '🛶' }
];

import { POPULAR_BRANDS } from '@/lib/constants/brands';

const BOT_FLOOR_TYPES = [
  'Ahşap Taban',
  'Alüminyum Taban',
  'Fiber Taban',
  'Şişme Taban',
  'Izgara Taban',
  'Diğer'
];

const BOT_CAPACITY_OPTIONS = [
  '1 Kişilik',
  '2 Kişilik',
  '3 Kişilik',
  '4 Kişilik',
  '5 Kişilik',
  '6 Kişilik',
  '7 Kişilik',
  '8 Kişilik',
  '9 Kişilik',
  '10+ Kişilik'
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

  const buttonStyle = (isSelected: boolean) => ({
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border)',
    background: isSelected ? 'rgba(0, 102, 255, 0.06)' : 'var(--bg-body)',
    color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center' as const,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: isSelected ? '0 2px 8px rgba(0, 102, 255, 0.08)' : 'none',
    fontFamily: 'inherit'
  });

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);
  const [initialPrice, setInitialPrice] = useState<number | null>(null);

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
  const [floorType, setFloorType] = useState('');
  const [capacity, setCapacity] = useState('');
  const [hullType, setHullType] = useState('');
  const [bodyMaterial, setBodyMaterial] = useState('');
  const [engineCount, setEngineCount] = useState('');
  const [enginePower, setEnginePower] = useState('');
  const [engineBrand, setEngineBrand] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [engineHours, setEngineHours] = useState('');
  const [flag, setFlag] = useState('Türkiye');
  const [customFlag, setCustomFlag] = useState('');
  const [sellerType, setSellerType] = useState('owner');
  const [condition, setCondition] = useState('used');
  const [isSwap, setIsSwap] = useState(false);

  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('TRY');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [isDraggingOverEdit, setIsDraggingOverEdit] = useState(false);

  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, string[]>>({
    kamara: [],
    mutfak: [],
    guverte: [],
    tanklar: [],
    elektronik: [],
    elektrik: []
  });

  interface GalleryItem {
    id: string;
    type: 'existing' | 'new';
    url: string;
    file?: File;
  }

  // Image Management
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(null);

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
      setFloorType(listing.features?.taban || '');
      setCapacity(listing.features?.kapasite || '');
      setHullType(listing.hull_material || '');
      setBodyMaterial(listing.hull_material || ''); // Map body material or hull material
      setEngineCount(listing.engine_count ? String(listing.engine_count) : '');
      setEnginePower(listing.engine_power_hp ? String(listing.engine_power_hp) : '');
      setEngineBrand(listing.engine_brand || '');
      setFuelType(listing.fuel_type || '');
      setEngineHours(listing.engine_hours ? String(listing.engine_hours) : '');
      const standardFlags = ['Türkiye', 'İngiltere', 'ABD', 'Almanya', 'Fransa', 'İtalya', 'Yunanistan', 'Hollanda', 'Norveç', 'Malta', 'Cayman Adaları', 'Marshall Adaları'];
        if (listing.flag) {
          if (standardFlags.includes(listing.flag)) {
            setFlag(listing.flag);
            setCustomFlag('');
          } else {
            setFlag('Diğer');
            setCustomFlag(listing.flag);
          }
        } else {
          setFlag('Türkiye');
          setCustomFlag('');
        }
      setSellerType(listing.seller_type || 'owner');
      setCondition(listing.condition || 'used');
      setIsSwap(!!listing.is_swap);

      // Price Formatting (Turkey dot style)
      const rawPrice = listing.type === 'rent' ? listing.rent_price_daily : listing.sale_price;
      setPrice(rawPrice ? new Intl.NumberFormat('tr-TR').format(rawPrice) : '');
      setInitialPrice(rawPrice || null);
      setCurrency(listing.currency || 'TRY');
      setCity(listing.city || '');
      setDistrict(listing.district || '');

      // Features
      if (listing.features) {
        let parsedFeatures = listing.features;
        if (typeof parsedFeatures === 'string') {
          try {
            parsedFeatures = JSON.parse(parsedFeatures);
          } catch (e) {
            console.error('Failed to parse features:', e);
          }
        }
        const feat: Record<string, string[]> = {
          kamara: [],
          mutfak: [],
          guverte: [],
          tanklar: [],
          elektronik: [],
          elektrik: []
        };
        if (parsedFeatures && typeof parsedFeatures === 'object') {
          Object.keys(FEATURES_SCHEMA).forEach(cat => {
            if (Array.isArray(parsedFeatures[cat])) {
              feat[cat] = parsedFeatures[cat];
            }
          });
        }
        setSelectedFeatures(feat);
      }

      // Images
      if (Array.isArray(listing.images)) {
        setGalleryItems(listing.images.map((url: string, idx: number) => ({
          id: `existing-${idx}-${url}`,
          type: 'existing',
          url
        })));
      }

      setLoading(false);
    }
    loadData();
  }, [id, supabase, router]);

  // Handle Feature Checkbox Change
  const handleFeatureToggle = (categoryKey: string, value: string) => {
    setSelectedFeatures(prev => {
      const current = prev[categoryKey] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return {
        ...prev,
        [categoryKey]: updated
      };
    });
  };

  // Image inputs handling
  const processEditFiles = (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;
    if (galleryItems.length + imageFiles.length > 30) {
      alert('Toplam en fazla 30 fotoğraf yükleyebilirsiniz.');
      return;
    }
    const newItems: GalleryItem[] = imageFiles.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
      type: 'new',
      url: URL.createObjectURL(file),
      file
    }));
    setGalleryItems(prev => [...prev, ...newItems]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      processEditFiles(filesArr);
      e.target.value = '';
    }
  };

  const handleEditDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverEdit(true);
  };

  const handleEditDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverEdit(false);
  };

  const handleEditDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOverEdit(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processEditFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Drag-and-drop reordering and cover photo
  const handlePhotoDragStart = (e: React.DragEvent, index: number) => {
    setDraggedPhotoIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePhotoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handlePhotoDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedPhotoIndex === null || draggedPhotoIndex === targetIndex) return;

    setGalleryItems(prev => {
      const updated = [...prev];
      const [dragged] = updated.splice(draggedPhotoIndex, 1);
      updated.splice(targetIndex, 0, dragged);
      return updated;
    });
    setDraggedPhotoIndex(null);
  };

  const handlePhotoDragEnd = () => {
    setDraggedPhotoIndex(null);
  };

  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    setGalleryItems(prev => {
      const updated = [...prev];
      const [selected] = updated.splice(index, 1);
      updated.unshift(selected);
      return updated;
    });
  };

  const handleRemovePhoto = (index: number) => {
    setGalleryItems(prev => prev.filter((_, i) => i !== index));
  };

  // Save changes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (brand === 'Diğer' && !customBrand.trim()) {
      alert('Lütfen tekne markasını belirtiniz.');
      return;
    }

    setSaveLoading(true);
    setErrorMsg('');

    try {
      let uploadedUrls: string[] = [];

      if (galleryItems.length > 0) {
        const promises = galleryItems.map(async (item, i) => {
          if (item.type === 'existing') {
            return item.url;
          }
          if (item.file) {
            const path = `imported/${user.id}/${Date.now()}_${i}_${item.file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
            const { error } = await supabase.storage
              .from('boat-images')
              .upload(path, item.file, { cacheControl: '3600', upsert: true });

            if (error) throw error;
            
            const { data: { publicUrl } } = supabase.storage
              .from('boat-images')
              .getPublicUrl(path);
              
            return publicUrl;
          }
          return item.url;
        });
        
        uploadedUrls = await Promise.all(promises);
      }

      const finalImages = uploadedUrls.filter(Boolean);

      // Parse price to integer
      const numericPrice = price ? Number(price.replace(/\./g, '')) : null;

      // 2. Prepare payload
      const payload = {
        title,
        description,
        category,
        brand: brand === 'Diğer' ? (customBrand.trim() || 'Diğer') : brand,
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
        flag: flag === 'Diğer' ? (customFlag.trim() || 'Diğer') : (flag || 'Türkiye'),
        seller_type: sellerType,
        condition: condition,
        is_swap: isSwap,
        features: {
          ...selectedFeatures,
          ...(category === 'bot' && floorType ? { taban: floorType } : {}),
          ...(category === 'bot' && capacity ? { kapasite: capacity } : {})
        },
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

      // Trigger price drop email notification if the price decreased
      if (
        numericPrice !== null &&
        initialPrice !== null &&
        numericPrice < initialPrice
      ) {
        fetch('/api/notify-price-drop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listingId: id,
            oldPrice: initialPrice,
            newPrice: numericPrice,
            currency: currency
          })
        }).catch(err => console.error('Error triggering price drop notification:', err));
      }

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
                      <option value="Diğer">Diğer (Elle Yazın)</option>
                    </select>
                    {brand === 'Diğer' && (
                      <input
                        type="text"
                        placeholder="Tekne markasını yazınız (ör: Safter, Yerliyurt, Özel Yapım...)"
                        value={customBrand}
                        onChange={(e) => setCustomBrand(e.target.value)}
                        required
                        autoFocus
                        style={{ 
                          width: '100%', 
                          padding: '12px 16px', 
                          borderRadius: '12px', 
                          border: '1.5px solid var(--primary, #0ea5e9)', 
                          background: 'var(--bg-body)', 
                          color: 'var(--text-primary)', 
                          outline: 'none', 
                          boxSizing: 'border-box',
                          fontSize: '0.95rem',
                          boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.15)'
                        }}
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

              {/* Hull and Cabin or Bot specs */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label htmlFor="edit-hull" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>Gövde Tipi</label>
                  <select 
                    id="edit-hull"
                    value={hullType}
                    onChange={(e) => setHullType(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  >
                    <option value="">Seçin</option>
                    {['Tek Gövde', 'Çift Gövde (Katamaran)', 'RIB', 'Trimaran'].map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label htmlFor="edit-body" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>Gövde Malzemesi</label>
                  <select 
                    id="edit-body"
                    value={bodyMaterial}
                    onChange={(e) => setBodyMaterial(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  >
                    <option value="">Seçin</option>
                    {['Fiberglas', 'Ahşap', 'Alüminyum', 'Çelik', 'Karbon Fiber', 'PVC / Şişme', 'Polyester'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {category === 'bot' ? (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: '1 1 200px' }}>
                    <label htmlFor="edit-floor" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>Taban *</label>
                    <select 
                      id="edit-floor"
                      value={floorType}
                      onChange={(e) => setFloorType(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                    >
                      <option value="">Seçiniz</option>
                      {BOT_FLOOR_TYPES.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: '1 1 200px' }}>
                    <label htmlFor="edit-capacity" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>Kapasite</label>
                    <select 
                      id="edit-capacity"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                    >
                      <option value="">Seçiniz</option>
                      {BOT_CAPACITY_OPTIONS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: '1 1 200px' }}>
                    <label htmlFor="edit-cabin" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>Kamara Sayısı</label>
                    <select 
                      id="edit-cabin"
                      value={cabinCount}
                      onChange={(e) => setCabinCount(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                    >
                      <option value="">Seçin</option>
                      {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

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
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label htmlFor="edit-flag" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.95rem' }}>Bandıra</label>
                  <select 
                    id="edit-flag"
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                  >
                    {['Türkiye', 'İngiltere', 'ABD', 'Almanya', 'Fransa', 'İtalya', 'Yunanistan', 'Hollanda', 'Norveç', 'Malta', 'Cayman Adaları', 'Marshall Adaları', 'Diğer'].map(fl => (
                      <option key={fl} value={fl}>{fl}</option>
                    ))}
                  </select>
                  {flag === 'Diğer' && (
                    <div style={{ marginTop: '8px' }}>
                      <input
                        type="text"
                        id="edit-custom-flag"
                        placeholder="Hangi Ülke? (Ülke adını yazınız)"
                        value={customFlag}
                        onChange={(e) => setCustomFlag(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid var(--color-primary)',
                          background: 'var(--bg-body)',
                          color: 'var(--text-primary)',
                          fontSize: '0.95rem',
                          outline: 'none'
                        }}
                        autoFocus
                      />
                    </div>
                  )}
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

              {/* Condition, Seller Type & Swap */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                
                {/* Column 1: Kimden */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.95rem' }}>Kimden</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setSellerType('owner')}
                      style={buttonStyle(sellerType === 'owner')}
                    >
                      👤 Sahibinden
                    </button>
                    <button
                      type="button"
                      onClick={() => setSellerType('dealer')}
                      style={buttonStyle(sellerType === 'dealer')}
                    >
                      🏬 Mağazadan
                    </button>
                    <button
                      type="button"
                      onClick={() => setSellerType('company')}
                      style={buttonStyle(sellerType === 'company')}
                    >
                      🏢 Firmadan
                    </button>
                  </div>
                </div>

                {/* Column 2: Durumu */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.95rem' }}>Durumu</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setCondition('new')}
                      style={buttonStyle(condition === 'new')}
                    >
                      ✨ Sıfır
                    </button>
                    <button
                      type="button"
                      onClick={() => setCondition('used')}
                      style={buttonStyle(condition === 'used')}
                    >
                      🔄 İkinci El
                    </button>
                  </div>
                </div>

                {/* Column 3: Takas */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.95rem' }}>Takas</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setIsSwap(true)}
                      style={buttonStyle(isSwap === true)}
                    >
                      🤝 Takas Yapılır
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSwap(false)}
                      style={buttonStyle(isSwap === false)}
                    >
                      ❌ Takas Yapılmaz
                    </button>
                  </div>
                </div>

              </div>

              {/* Images Section */}
              <div className="form-group" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <label style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    İlan Fotoğrafları ({galleryItems.length}/30)
                  </label>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Fotoğrafları sürükleyerek sıralayabilirsiniz. İlk fotoğraf kapak görselidir.
                  </span>
                </div>

                {/* Image Upload Dropzone */}
                <div 
                  onDragOver={handleEditDragOver}
                  onDragEnter={handleEditDragOver}
                  onDragLeave={handleEditDragLeave}
                  onDrop={handleEditDrop}
                  onClick={() => document.getElementById('edit-image-upload')?.click()}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '24px 16px',
                    border: isDraggingOverEdit ? '2px dashed #0052cc' : '2px dashed var(--color-primary)',
                    background: isDraggingOverEdit ? 'rgba(0, 102, 255, 0.08)' : 'var(--color-primary-light)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    marginBottom: '1.25rem'
                  }}
                >
                  <input
                    type="file"
                    id="edit-image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                    <Upload size={18} /> {isDraggingOverEdit ? 'Fotoğrafları Buraya Bırakın' : 'Fotoğraf Ekle veya Buraya Sürükleyin'}
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    JPG, PNG · Toplam en fazla 30 fotoğraf yükleyebilirsiniz.
                  </span>
                </div>

                {/* Unified Draggable Photo Gallery Grid */}
                {galleryItems.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
                    {galleryItems.map((item, i) => (
                      <div 
                        key={item.id} 
                        draggable
                        onDragStart={(e) => handlePhotoDragStart(e, i)}
                        onDragOver={handlePhotoDragOver}
                        onDragEnd={handlePhotoDragEnd}
                        onDrop={(e) => handlePhotoDrop(e, i)}
                        style={{ 
                          position: 'relative', 
                          aspectRatio: '4/3', 
                          borderRadius: '10px', 
                          overflow: 'hidden', 
                          border: i === 0 ? '2.5px solid #0066ff' : '1px solid var(--border)',
                          cursor: 'grab',
                          boxShadow: i === 0 ? '0 2px 8px rgba(0, 102, 255, 0.25)' : 'none',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        <img src={item.url} alt={`Görsel ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        
                        {/* Cover Badge or Make Cover Button */}
                        {i === 0 ? (
                          <span style={{ position: 'absolute', bottom: '6px', left: '6px', background: '#0066ff', color: '#fff', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.35)' }}>
                            ★ Kapak
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMakeCover(i)}
                            style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '10px', padding: '3px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Kapak Yap
                          </button>
                        )}

                        {/* Delete button */}
                        <button 
                          type="button" 
                          style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '11px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                          onClick={() => handleRemovePhoto(i)}
                          title="Fotoğrafı Sil"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Features List */}
              <div className="form-group" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '1.5rem', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Tekne Özellikleri (Seçim Yapın)</label>
                
                <div className="create-features" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {Object.entries(FEATURES_SCHEMA).map(([catKey, schema]) => (
                    <div key={catKey} className="feature-category-group" style={{ background: 'none', padding: 0, border: 'none' }}>
                      <h3 className="feature-category-title" style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>{schema.label}</h3>
                      <div className="create-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                        {schema.items.map(item => {
                          const isChecked = selectedFeatures[catKey]?.includes(item);
                          return (
                            <div 
                              key={item} 
                              className={`create-feat-item ${isChecked ? 'checked' : ''}`}
                              onClick={() => handleFeatureToggle(catKey, item)}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                padding: '10px 14px', 
                                borderRadius: '10px', 
                                cursor: 'pointer',
                                background: isChecked ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-body)',
                                border: isChecked ? '1.5px solid #22c55e' : '1px solid var(--border)',
                                transition: 'all 0.2s ease',
                                userSelect: 'none'
                              }}
                            >
                              <span 
                                className="create-feat-check"
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '5px',
                                  border: isChecked ? '2px solid #22c55e' : '2px solid var(--border)',
                                  background: isChecked ? '#22c55e' : 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  color: '#fff',
                                  flexShrink: 0,
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {isChecked ? '✓' : ''}
                              </span>
                              <span 
                                className="create-feat-label"
                                style={{
                                  fontSize: '0.85rem',
                                  color: isChecked ? 'var(--text-primary)' : 'var(--text-muted)',
                                  fontWeight: isChecked ? 600 : 400
                                }}
                              >
                                {item}
                              </span>
                            </div>
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
