'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { User } from '@supabase/supabase-js';
import { Listing } from '@/components/listings/ListingCard';
import { formatPrice } from '@/lib/utils/format';
import { Check, X, ShieldAlert, Layers } from 'lucide-react';

export default function AdminPage() {
  const t = useTranslations();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    // 1. Verify user profile has 'admin' role
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setCheckingAuth(false);
          return;
        }

        setUser(session.user);

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile && profile.role === 'admin') {
          setIsAdmin(true);
          fetchAdminListings();
        }
      } catch (e) {
        console.error('Admin validation error:', e);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAdmin();
  }, [supabase]);

  const fetchAdminListings = async () => {
    try {
      setLoadingListings(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          status: item.status,
          title: item.title,
          title_en: item.title_en,
          slug: item.slug,
          description: item.description,
          category: item.category,
          brand: item.brand,
          model: item.model,
          type: item.type === 'rent' ? 'rent' : 'sale',
          sale_price: item.sale_price ? Number(item.sale_price) : undefined,
          price_per_day: item.rent_price_daily ? Number(item.rent_price_daily) : undefined,
          currency: item.currency,
          location_il: item.city,
          location_ilce: item.district,
          year: item.year,
          length_meters: item.length_m ? Number(item.length_m) : undefined,
          images: item.images || []
        })) as Listing[];
        setListings(mapped);
      }
    } catch (e) {
      console.error('Error fetching admin listings:', e);
    } finally {
      setLoadingListings(false);
    }
  };

  const handleAction = async (id: string, newStatus: 'approved' | 'rejected') => {
    if (!confirm(`İlanı ${newStatus === 'approved' ? 'onaylamak' : 'reddetmek'} istediğinizden emin misiniz?`)) return;

    try {
      const { error } = await supabase
        .from('listings')
        .update({ 
          status: newStatus,
          approved_at: newStatus === 'approved' ? new Date().toISOString() : null 
        })
        .eq('id', id);

      if (error) throw error;

      // Update listings in local state
      setListings(prev => prev.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      ));

      alert('İşlem başarıyla gerçekleştirildi.');
    } catch (e: any) {
      alert(`Hata: ${e.message || 'İşlem başarısız oldu'}`);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-body">
        <span className="text-text-secondary text-sm">Yönetici yetkileri sorgulanıyor...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-bg-body flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center bg-bg-card border border-border p-6 rounded-xl shadow-md">
            <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
            <h1 className="text-lg font-bold text-text-primary mb-2">Yetkisiz Erişim</h1>
            <p className="text-sm text-text-secondary mb-6">
              Bu sayfayı görüntülemek için yönetici yetkilerine sahip olmanız gerekmektedir.
            </p>
            <button 
              className="btn-primary w-full bg-primary text-white py-2 rounded-lg text-sm font-semibold"
              onClick={() => router.push('/')}
            >
              Anasayfaya Dön
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const filtered = listings.filter(item => item.status === activeTab);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-bg-body py-12">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">⚓ Yönetim Paneli</h1>
              <p className="text-sm text-text-secondary">Güvenli ilan onay ve listeleme kontrolü</p>
            </div>
            <button 
              className="px-4 py-2 border border-border hover:bg-bg-hover text-sm font-semibold rounded-lg text-text-primary transition-colors"
              onClick={fetchAdminListings}
            >
              🔄 Yenile
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-bg-card p-4 rounded-xl border border-border text-center">
              <span className="text-3xl font-extrabold text-amber-500 block mb-1">
                {listings.filter(i => i.status === 'pending').length}
              </span>
              <span className="text-xs text-text-secondary uppercase tracking-wider font-bold">Bekleyen</span>
            </div>
            <div className="bg-bg-card p-4 rounded-xl border border-border text-center">
              <span className="text-3xl font-extrabold text-green-500 block mb-1">
                {listings.filter(i => i.status === 'approved').length}
              </span>
              <span className="text-xs text-text-secondary uppercase tracking-wider font-bold">Onaylı</span>
            </div>
            <div className="bg-bg-card p-4 rounded-xl border border-border text-center">
              <span className="text-3xl font-extrabold text-red-500 block mb-1">
                {listings.filter(i => i.status === 'rejected').length}
              </span>
              <span className="text-xs text-text-secondary uppercase tracking-wider font-bold">Reddedilen</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border mb-6">
            <button 
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'pending' ? 'border-amber-500 text-amber-600' : 'border-transparent text-text-secondary'}`}
              onClick={() => setActiveTab('pending')}
            >
              🕐 Bekleyenler
            </button>
            <button 
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'approved' ? 'border-green-500 text-green-600' : 'border-transparent text-text-secondary'}`}
              onClick={() => setActiveTab('approved')}
            >
              ✅ Onaylananlar
            </button>
            <button 
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'rejected' ? 'border-red-500 text-red-600' : 'border-transparent text-text-secondary'}`}
              onClick={() => setActiveTab('rejected')}
            >
              ❌ Reddedilenler
            </button>
          </div>

          {/* Listings List */}
          <div className="space-y-4">
            {loadingListings ? (
              <div className="text-center py-12 text-sm text-text-secondary">İlanlar yükleniyor...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-sm text-text-muted bg-bg-card rounded-xl border border-border">
                Bu sekmede ilan bulunmuyor.
              </div>
            ) : (
              filtered.map(item => {
                const img = item.images && item.images.length > 0 ? item.images[0] : 'https://picsum.photos/seed/placeholder/200/200';
                return (
                  <div key={item.id} className="bg-bg-card border border-border rounded-xl p-4 flex gap-4 items-center">
                    <img src={img} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-text-primary text-sm truncate">{item.title}</h3>
                      <div className="text-xs text-text-secondary flex gap-2 mt-1">
                        <span>{item.brand}</span>
                        <span>•</span>
                        <span>{item.category}</span>
                        <span>•</span>
                        <span className="font-semibold text-primary">
                          {item.type === 'sale' ? formatPrice(item.sale_price, item.currency) : `${formatPrice(item.price_per_day, item.currency)} / gün`}
                        </span>
                      </div>
                      <span className="text-[10px] text-text-muted block mt-1">📍 {item.location_il}</span>
                    </div>

                    <div className="flex gap-2">
                      {item.status === 'pending' && (
                        <>
                          <button 
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                            onClick={() => handleAction(item.id, 'approved')}
                            title="Onayla"
                          >
                            <Check size={16} strokeWidth={2.5} />
                          </button>
                          <button 
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                            onClick={() => handleAction(item.id, 'rejected')}
                            title="Reddet"
                          >
                            <X size={16} strokeWidth={2.5} />
                          </button>
                        </>
                      )}
                      {item.status === 'approved' && (
                        <button 
                          className="border border-red-500 hover:bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          onClick={() => handleAction(item.id, 'rejected')}
                        >
                          Geri Al (Reddet)
                        </button>
                      )}
                      {item.status === 'rejected' && (
                        <button 
                          className="border border-green-500 hover:bg-green-500/10 text-green-500 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          onClick={() => handleAction(item.id, 'approved')}
                        >
                          Onayla
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
