'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { formatPrice } from '@/lib/utils/format';
import { Edit, Trash2, User, Key, AlertTriangle } from 'lucide-react';

export default function ProfileDashboardPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({ full_name: '', phone: '' });
  const [listings, setListings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'settings' | 'favorites'>('listings');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Tab from Query Param
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'settings') {
      setActiveTab('settings');
    } else if (tabParam === 'favorites') {
      setActiveTab('favorites');
    } else {
      setActiveTab('listings');
    }
  }, [searchParams]);

  useEffect(() => {
    async function init() {
      // 1. Get User Session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }
      setUser(session.user);

      // 2. Fetch Profile details
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          phone: profileData.phone || ''
        });
      }

      // 3. Fetch user listings
      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (listingsData) {
        setListings(listingsData);
      }

      // 4. Fetch user favorites
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select(`
          id,
          notify_price_change,
          listings (*)
        `)
        .eq('user_id', session.user.id);

      if (favoritesData) {
        setFavorites(favoritesData.filter((fav: any) => fav.listings !== null));
      }

      setLoading(false);
    }
    init();
  }, [supabase, router]);

  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setActionLoading(true);
    setErrorMsg('');
    setSaveSuccess(false);

    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          phone: profile.phone
        }
      });
      if (authError) throw authError;

      setSaveSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Profil güncellenirken hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Listing
  const handleDeleteListing = async (listingId: string, title: string) => {
    const confirmDelete = window.confirm(`"${title}" ilanını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`);
    if (!confirmDelete) return;

    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;

      setListings(prev => prev.filter(item => item.id !== listingId));
      alert('İlan başarıyla silindi.');
    } catch (err: any) {
      alert(err.message || 'İlan silinirken bir hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Favorite Price Drop Notification
  const handleToggleNotification = async (favoriteId: string, currentVal: boolean) => {
    const { error } = await supabase
      .from('favorites')
      .update({ notify_price_change: !currentVal })
      .eq('id', favoriteId);
    
    if (!error) {
      setFavorites(prev => prev.map(fav => fav.id === favoriteId ? { ...fav, notify_price_change: !currentVal } : fav));
    } else {
      alert('Bildirim tercihi güncellenirken hata oluştu.');
    }
  };

  // Remove Listing from Favorites
  const handleRemoveFavorite = async (favoriteId: string) => {
    const confirmRemove = window.confirm('Bu ilanı favorilerinizden kaldırmak istediğinize emin misiniz?');
    if (!confirmRemove) return;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favoriteId);
    
    if (!error) {
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
    } else {
      alert('İlan favorilerden kaldırılırken hata oluştu.');
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'HESABINIZI KALICI OLARAK SİLMEK İSTEDİĞİNİZDEN EMİN MİSİNİZ?\n\nBu işlem sonucunda:\n- Profil bilgileriniz silinecektir.\n- Eklediğiniz tüm ilanlar ve resimler kaldırılacaktır.\n- Bu işlem kesinlikle GERİ ALINAMAZ.'
    );
    if (!confirmDelete) return;

    const lastCheck = window.prompt('Lütfen onaylamak için "SİL" yazın:');
    if (lastCheck !== 'SİL' && lastCheck !== 'sil') {
      alert('İşlem iptal edildi.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Hesap silinirken hata oluştu.');
      }

      alert('Hesabınız ve tüm verileriniz başarıyla silinmiştir.');
      router.push('/');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Hesabınız silinirken bir hata oluştu.');
    } finally {
      setActionLoading(false);
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

  return (
    <>
      <Navbar />

      <main id="app" className="profile-dashboard-container" style={{ padding: '2rem 0', minHeight: '80vh', background: 'var(--bg-body)' }}>
        <div className="container" style={{ maxWidth: '1000px' }}>
          
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            
            {/* Sidebar Navigation */}
            <aside style={{ flex: '1 1 250px', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', height: 'fit-content' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem', fontWeight: 600 }}>
                  {profile.full_name ? profile.full_name[0].toUpperCase() : 'U'}
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{profile.full_name || 'Kullanıcı'}</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>{user?.email}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => setActiveTab('listings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: activeTab === 'listings' ? 600 : 500,
                    background: activeTab === 'listings' ? 'var(--color-primary)' : 'transparent',
                    color: activeTab === 'listings' ? '#fff' : 'var(--text-primary)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>📋</span> {t('İlanlarım')}
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: activeTab === 'favorites' ? 600 : 500,
                    background: activeTab === 'favorites' ? 'var(--color-primary)' : 'transparent',
                    color: activeTab === 'favorites' ? '#fff' : 'var(--text-primary)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>⭐</span> {t('Favorilerim')}
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: activeTab === 'settings' ? 600 : 500,
                    background: activeTab === 'settings' ? 'var(--color-primary)' : 'transparent',
                    color: activeTab === 'settings' ? '#fff' : 'var(--text-primary)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span>⚙️</span> {t('Profil Ayarları')}
                </button>
              </div>
            </aside>

            {/* Dashboard Content */}
            <section style={{ flex: '3 1 600px', background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)', minHeight: '400px' }}>
              
              {/* TAB 1: İLANLARIM */}
              {activeTab === 'listings' && (
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
                    {t('İlanlarım')} ({listings.length})
                  </h2>

                  {listings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Henüz eklenmiş bir ilanınız bulunmamaktadır.</p>
                      <Link href="/tekne-ilan-ver" className="btn-create-listing" style={{ display: 'inline-flex', padding: '12px 24px' }}>
                        + İlk İlanını Ver
                      </Link>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {listings.map(item => {
                        const img = (item.images && item.images.length > 0)
                          ? item.images[0]
                          : 'https://picsum.photos/seed/placeholder/300/200';

                        return (
                          <div 
                            key={item.id} 
                            style={{
                              display: 'flex',
                              gap: '1rem',
                              alignItems: 'center',
                              padding: '1rem',
                              borderRadius: '12px',
                              border: '1px solid var(--border)',
                              background: 'var(--bg-body)',
                              flexWrap: 'wrap'
                            }}
                          >
                            <img 
                              src={img} 
                              alt={item.title} 
                              style={{ width: '100px', height: '75px', borderRadius: '8px', objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1, minWidth: '200px' }}>
                              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-primary)' }}>{item.title}</h3>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {item.city} / {item.district} · {item.year}
                              </span>
                              <div style={{ marginTop: '4px', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                                {item.type === 'sale' 
                                  ? formatPrice(item.sale_price, item.currency)
                                  : formatPrice(item.rent_price_daily, item.currency) + ' / gün'}
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <Link 
                                href={`/listings/edit/${item.id}`} 
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '8px 14px',
                                  background: 'var(--color-primary-light)',
                                  color: 'var(--color-primary)',
                                  borderRadius: '8px',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  textDecoration: 'none',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                <Edit size={14} /> Düzenle
                              </Link>
                              <button 
                                onClick={() => handleDeleteListing(item.id, item.title)}
                                disabled={actionLoading}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '8px 14px',
                                  background: 'rgba(255, 90, 95, 0.1)',
                                  color: 'rgb(255, 90, 95)',
                                  borderRadius: '8px',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={14} /> Sil
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: FAVORİLERİM */}
              {activeTab === 'favorites' && (
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
                    {t('Favorilerim')} ({favorites.length})
                  </h2>

                  {favorites.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Henüz favorilere eklenmiş bir ilanınız bulunmamaktadır.</p>
                      <Link href="/" className="btn-create-listing" style={{ display: 'inline-flex', padding: '12px 24px' }}>
                        ⛵ İlanları Keşfet
                      </Link>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {favorites.map(item => {
                        const listing = item.listings;
                        if (!listing) return null;
                        const img = (listing.images && listing.images.length > 0)
                          ? listing.images[0]
                          : 'https://picsum.photos/seed/placeholder/300/200';

                        return (
                          <div 
                            key={item.id} 
                            style={{
                              display: 'flex',
                              gap: '1rem',
                              alignItems: 'center',
                              padding: '1rem',
                              borderRadius: '12px',
                              border: '1px solid var(--border)',
                              background: 'var(--bg-body)',
                              flexWrap: 'wrap'
                            }}
                          >
                            <Link href={`/listings/${listing.slug}`} style={{ display: 'block', borderRadius: '8px', overflow: 'hidden' }}>
                              <img 
                                src={img} 
                                alt={listing.title} 
                                style={{ width: '100px', height: '75px', borderRadius: '8px', objectFit: 'cover' }}
                              />
                            </Link>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                              <Link href={`/listings/${listing.slug}`} style={{ textDecoration: 'none' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 4px', color: 'var(--text-primary)' }}>{listing.title}</h3>
                              </Link>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {listing.city} / {listing.district} · {listing.year}
                              </span>
                              <div style={{ marginTop: '4px', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                                {listing.type === 'sale' 
                                  ? formatPrice(listing.sale_price, listing.currency)
                                  : formatPrice(listing.rent_price_daily, listing.currency) + ' / gün'}
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button 
                                onClick={() => handleToggleNotification(item.id, item.notify_price_change)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '8px 14px',
                                  background: item.notify_price_change ? 'rgba(0, 102, 255, 0.08)' : 'var(--bg-card)',
                                  color: item.notify_price_change ? 'var(--color-primary)' : 'var(--text-muted)',
                                  border: item.notify_price_change ? '1px solid var(--color-primary)' : '1px solid var(--border)',
                                  borderRadius: '8px',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                {item.notify_price_change ? '🔔 Fiyat Takibi Açık' : '🔕 Fiyat Takibi Kapalı'}
                              </button>
                              <button 
                                onClick={() => handleRemoveFavorite(item.id)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '8px 14px',
                                  background: 'rgba(255, 90, 95, 0.08)',
                                  color: 'rgb(255, 90, 95)',
                                  border: '1px solid rgba(255, 90, 95, 0.2)',
                                  borderRadius: '8px',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                ❌ Kaldır
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PROFİL AYARLARI */}
              {activeTab === 'settings' && (
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
                    {t('Profil Ayarları')}
                  </h2>

                  {saveSuccess && (
                    <div style={{ background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.2)', color: '#2ecc71', padding: '12px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 500 }}>
                      ✓ Değişiklikleriniz başarıyla kaydedildi.
                    </div>
                  )}

                  {errorMsg && (
                    <div style={{ background: 'rgba(255, 90, 95, 0.1)', border: '1px solid rgba(255, 90, 95, 0.2)', color: 'rgb(255, 90, 95)', padding: '12px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 500 }}>
                      ✕ {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label htmlFor="profile-email" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.9rem' }}>E-posta Adresi</label>
                      <input 
                        type="text" 
                        id="profile-email" 
                        value={user?.email || ''} 
                        disabled 
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-body)', opacity: 0.6, cursor: 'not-allowed' }}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="profile-fullname" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.9rem' }}>Ad Soyad</label>
                      <input 
                        type="text" 
                        id="profile-fullname" 
                        value={profile.full_name} 
                        onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="ör: Ali Berk"
                        required
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="profile-phone" style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '0.9rem' }}>Telefon Numarası</label>
                      <input 
                        type="text" 
                        id="profile-phone" 
                        value={profile.phone} 
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="ör: +90 555 123 4567"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading}
                      style={{
                        padding: '12px 24px',
                        background: 'var(--color-primary)',
                        color: '#fff',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer',
                        alignSelf: 'flex-start',
                        transition: 'all 0.2s',
                        opacity: actionLoading ? 0.7 : 1
                      }}
                    >
                      {actionLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </button>
                  </form>

                  {/* Danger Zone */}
                  <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255, 90, 95, 0.2)', paddingTop: '2rem' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '1rem', color: 'rgb(255, 90, 95)' }}>
                      <AlertTriangle size={20} />
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Tehlikeli Bölge</h3>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                      Hesabınızı silmek tüm ilanlarınızı, resimlerinizi ve profil verilerinizi geri alınamaz şekilde kalıcı olarak silecektir. Lütfen bu işlemi gerçekleştirmeden önce emin olun.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={actionLoading}
                      style={{
                        padding: '12px 24px',
                        background: 'transparent',
                        color: 'rgb(255, 90, 95)',
                        border: '1px solid rgb(255, 90, 95)',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Trash2 size={16} /> Hesabımı Kalıcı Olarak Sil
                    </button>
                  </div>

                </div>
              )}

            </section>
            
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
