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
import { Check, X, ShieldAlert, Layers, Mail, Lock, Plus, Edit, Trash2, Globe, FileText, Image as ImageIcon } from 'lucide-react';

export default function AdminPage() {
  const t = useTranslations();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Dashboard Tabs: 'listings' | 'blogs'
  const [activePanel, setActivePanel] = useState<'listings' | 'blogs'>('listings');

  // Listings States
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Blogs States
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Blog Form States
  const [blogTitle, setBlogTitle] = useState('');
  const [blogTitleEn, setBlogTitleEn] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogContentEn, setBlogContentEn] = useState('');
  const [blogTag, setBlogTag] = useState('');
  const [blogTagEn, setBlogTagEn] = useState('');
  const [blogAuthor, setBlogAuthor] = useState('satiliktekne.com');
  const [blogSlug, setBlogSlug] = useState('');
  const [blogImageUrl, setBlogImageUrl] = useState('');
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [blogMetaTitle, setBlogMetaTitle] = useState('');
  const [blogMetaDesc, setBlogMetaDesc] = useState('');
  const [blogMetaKeywords, setBlogMetaKeywords] = useState('');

  // Admin Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Check if profile is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile || profile.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Girdiğiniz hesap yönetici yetkilerine sahip değil.');
      }

      setUser(data.user);
      setIsAdmin(true);
      fetchAdminListings();
      fetchAdminBlogs();
    } catch (err: any) {
      setLoginError(err.message || 'Giriş yapılamadı.');
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    // Disable auto-login to always force password prompt on this page
    setCheckingAuth(false);
  }, []);

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

  const fetchAdminBlogs = async () => {
    try {
      setLoadingBlogs(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setBlogs(data);
      }
    } catch (e) {
      console.error('Error fetching admin blogs:', e);
    } finally {
      setLoadingBlogs(false);
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

  // Blog modal helpers
  const openBlogModal = (blogToEdit: any = null) => {
    setModalError('');
    if (blogToEdit) {
      setEditingBlog(blogToEdit);
      setBlogTitle(blogToEdit.title || '');
      setBlogTitleEn(blogToEdit.title_en || '');
      setBlogContent(blogToEdit.content || '');
      setBlogContentEn(blogToEdit.content_en || '');
      setBlogTag(blogToEdit.tag || '');
      setBlogTagEn(blogToEdit.tag_en || '');
      setBlogAuthor(blogToEdit.author || 'satiliktekne.com');
      setBlogSlug(blogToEdit.slug || '');
      setBlogImageUrl(blogToEdit.image || '');
      setBlogImageFile(null);
      setBlogMetaTitle(blogToEdit.meta_title || '');
      setBlogMetaDesc(blogToEdit.meta_description || '');
      setBlogMetaKeywords(blogToEdit.meta_keywords || '');
    } else {
      setEditingBlog(null);
      setBlogTitle('');
      setBlogTitleEn('');
      setBlogContent('');
      setBlogContentEn('');
      setBlogTag('');
      setBlogTagEn('');
      setBlogAuthor('satiliktekne.com');
      setBlogSlug('');
      setBlogImageUrl('');
      setBlogImageFile(null);
      setBlogMetaTitle('');
      setBlogMetaDesc('');
      setBlogMetaKeywords('');
    }
    setShowBlogModal(true);
  };

  // Handle auto slug generation from title
  const handleTitleChange = (val: string) => {
    setBlogTitle(val);
    if (!editingBlog) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9ıışşğğüüöö çÇ]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/ı/g, 'i')
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
      setBlogSlug(generated);
    }
  };

  // Handle Blog Submit
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');

    try {
      let finalImageUrl = blogImageUrl;

      // 1. Upload Cover Image if selected
      if (blogImageFile) {
        const path = `blog/${Date.now()}_${blogImageFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const { error: uploadError } = await supabase.storage
          .from('boat-images')
          .upload(path, blogImageFile, { cacheControl: '3600', upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('boat-images')
          .getPublicUrl(path);

        finalImageUrl = publicUrl;
      }

      const slugToUse = blogSlug.trim().toLowerCase() || blogTitle
        .toLowerCase()
        .replace(/[^a-z0-9ıışşğğüüöö çÇ]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/ı/g, 'i')
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');

      const payload = {
        title: blogTitle,
        title_en: blogTitleEn || null,
        content: blogContent,
        content_en: blogContentEn || null,
        tag: blogTag || 'Haber',
        tag_en: blogTagEn || null,
        author: blogAuthor,
        image: finalImageUrl || null,
        slug: slugToUse,
        meta_title: blogMetaTitle || null,
        meta_description: blogMetaDesc || null,
        meta_keywords: blogMetaKeywords || null,
        updated_at: new Date().toISOString()
      };

      if (editingBlog) {
        // Update database
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update(payload)
          .eq('id', editingBlog.id);

        if (updateError) throw updateError;
      } else {
        // Insert database
        const { error: insertError } = await supabase
          .from('blog_posts')
          .insert(payload);

        if (insertError) throw insertError;
      }

      fetchAdminBlogs();
      setShowBlogModal(false);
      alert('Blog yazısı başarıyla kaydedildi.');
    } catch (err: any) {
      setModalError(err.message || 'Kaydedilirken hata oluştu.');
    } finally {
      setModalLoading(false);
    }
  };

  // Delete Blog
  const handleDeleteBlog = async (blogId: string, title: string) => {
    if (!confirm(`"${title}" blog yazısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', blogId);

      if (error) throw error;

      setBlogs(prev => prev.filter(b => b.id !== blogId));
      alert('Blog yazısı silindi.');
    } catch (e: any) {
      alert(`Hata: ${e.message || 'Silme işlemi başarısız oldu'}`);
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
        <main className="min-h-screen bg-bg-body flex items-center justify-center px-4" style={{
          background: 'radial-gradient(circle at top right, rgba(0, 102, 255, 0.05), transparent), radial-gradient(circle at bottom left, rgba(0, 102, 255, 0.03), transparent)',
          padding: '4rem 0'
        }}>
          <div style={{
            maxWidth: '420px',
            width: '100%',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            padding: '3rem 2.25rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.02)',
            backdropFilter: 'blur(20px)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.1), rgba(0, 102, 255, 0.05))',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                border: '1px solid rgba(0, 102, 255, 0.15)',
                boxShadow: '0 8px 16px rgba(0, 102, 255, 0.05)'
              }}>
                <ShieldAlert size={30} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>
                Yönetici Girişi
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.4' }}>
                Yönetim paneline erişmek için admin yetkisine sahip bilgilerinizi girin.
              </p>
            </div>

            {loginError && (
              <div style={{
                background: 'rgba(255, 90, 95, 0.06)',
                border: '1px solid rgba(255, 90, 95, 0.15)',
                color: 'rgb(255, 90, 95)',
                padding: '12px 16px',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '1.1rem' }}>✕</span>
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="admin-email" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>E-posta</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    id="admin-email"
                    placeholder="admin@satiliktekne.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-body)',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label htmlFor="admin-password" style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Şifre</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    id="admin-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-body)',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                style={{
                  background: 'linear-gradient(135deg, #0066ff, #0044cc)',
                  color: '#fff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  marginTop: '0.75rem',
                  boxShadow: '0 8px 20px rgba(0, 102, 255, 0.2)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: loginLoading ? 0.8 : 1
                }}
              >
                {loginLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
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

      <main className="min-h-screen bg-bg-body py-12" style={{
        background: 'radial-gradient(circle at top right, rgba(0, 102, 255, 0.03), transparent), radial-gradient(circle at bottom left, rgba(0, 102, 255, 0.02), transparent)',
        padding: '3rem 0'
      }}>
        <div className="container max-w-4xl" style={{ maxWidth: '950px', margin: '0 auto', padding: '0 1.5rem' }}>
          
          {/* Main Top Navigation Panel Selector */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <button
              onClick={() => setActivePanel('listings')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.95rem',
                background: activePanel === 'listings' ? 'var(--color-primary)' : 'transparent',
                color: activePanel === 'listings' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              <Layers size={18} /> İlan Onayları
            </button>
            <button
              onClick={() => setActivePanel('blogs')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.95rem',
                background: activePanel === 'blogs' ? 'var(--color-primary)' : 'transparent',
                color: activePanel === 'blogs' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              <FileText size={18} /> Blog Yönetimi
            </button>
          </div>

          {/* PANEL 1: LISTING APPROVALS */}
          {activePanel === 'listings' && (
            <div>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>⚓ İlan Yönetimi</h1>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>Güvenli ilan onay ve listeleme kontrolü</p>
                </div>
                <button 
                  onClick={fetchAdminListings}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🔄 Yenile
                </button>
              </div>

              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
                <div style={{
                  background: 'var(--bg-card)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  borderTop: '4px solid #f59e0b',
                  textAlign: 'center',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.02)'
                }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: 900, color: '#f59e0b', display: 'block', marginBottom: '4px', letterSpacing: '-1px' }}>
                    {listings.filter(i => i.status === 'pending').length}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px' }}>BEKLEYEN İLANLAR</span>
                </div>
                
                <div style={{
                  background: 'var(--bg-card)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  borderTop: '4px solid #10b981',
                  textAlign: 'center',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.02)'
                }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: 900, color: '#10b981', display: 'block', marginBottom: '4px', letterSpacing: '-1px' }}>
                    {listings.filter(i => i.status === 'approved').length}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px' }}>ONAYLI İLANLAR</span>
                </div>

                <div style={{
                  background: 'var(--bg-card)',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  borderTop: '4px solid #ef4444',
                  textAlign: 'center',
                  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.02)'
                }}>
                  <span style={{ fontSize: '2.25rem', fontWeight: 900, color: '#ef4444', display: 'block', marginBottom: '4px', letterSpacing: '-1px' }}>
                    {listings.filter(i => i.status === 'rejected').length}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.5px' }}>REDDEDİLEN İLANLAR</span>
                </div>
              </div>

              {/* Capsule Tabs */}
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                padding: '6px',
                borderRadius: '16px',
                display: 'inline-flex',
                gap: '6px',
                marginBottom: '2rem'
              }}>
                <button 
                  onClick={() => setActiveTab('pending')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: activeTab === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                    color: activeTab === 'pending' ? '#d97706' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  🕐 Bekleyenler
                </button>
                <button 
                  onClick={() => setActiveTab('approved')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: activeTab === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    color: activeTab === 'approved' ? '#059669' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ✅ Onaylananlar
                </button>
                <button 
                  onClick={() => setActiveTab('rejected')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: activeTab === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                    color: activeTab === 'rejected' ? '#dc2626' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ❌ Reddedilenler
                </button>
              </div>

              {/* Listings List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loadingListings ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0', fontSize: '0.95rem', color: 'var(--text-muted)' }}>İlanlar yükleniyor...</div>
                ) : filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 1rem', fontSize: '0.95rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    Bu kategoride onay bekleyen veya kaydedilmiş ilan bulunmuyor.
                  </div>
                ) : (
                  filtered.map(item => {
                    const img = item.images && item.images.length > 0 ? item.images[0] : 'https://picsum.photos/seed/placeholder/200/200';
                    return (
                      <div 
                        key={item.id} 
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          borderRadius: '16px',
                          padding: '1.25rem',
                          display: 'flex',
                          gap: '1.25rem',
                          alignItems: 'center',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)',
                          transition: 'all 0.2s ease',
                          flexWrap: 'wrap'
                        }}
                      >
                        <img 
                          src={img} 
                          alt={item.title} 
                          style={{ width: '90px', height: '68px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border)' }} 
                        />
                        
                        <div style={{ flex: 1, minWidth: '220px' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>{item.title}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{item.brand}</span>
                            <span>•</span>
                            <span>{item.category}</span>
                            <span>•</span>
                            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                              {item.type === 'sale' ? formatPrice(item.sale_price, item.currency) : `${formatPrice(item.price_per_day, item.currency)} / gün`}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                            📍 {item.location_il} / {item.location_ilce || ''}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          {item.status === 'pending' && (
                            <>
                              <button 
                                className="btn-action-approve"
                                onClick={() => handleAction(item.id, 'approved')}
                                style={{
                                  background: 'linear-gradient(135deg, #10b981, #059669)',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '10px 18px',
                                  borderRadius: '10px',
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                                  transition: 'all 0.2s ease',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <Check size={16} strokeWidth={2.5} /> Onayla
                              </button>
                              <button 
                                className="btn-action-reject"
                                onClick={() => handleAction(item.id, 'rejected')}
                                style={{
                                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '10px 18px',
                                  borderRadius: '10px',
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                                  transition: 'all 0.2s ease',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                <X size={16} strokeWidth={2.5} /> Reddet
                              </button>
                            </>
                          )}
                          
                          {item.status === 'approved' && (
                            <button 
                              onClick={() => handleAction(item.id, 'rejected')}
                              style={{
                                border: '1px solid #ef4444',
                                background: 'transparent',
                                color: '#ef4444',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              Geri Al (Reddet)
                            </button>
                          )}
                          
                          {item.status === 'rejected' && (
                            <button 
                              onClick={() => handleAction(item.id, 'approved')}
                              style={{
                                border: '1px solid #10b981',
                                background: 'transparent',
                                color: '#10b981',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
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
          )}

          {/* PANEL 2: BLOG MANAGEMENT */}
          {activePanel === 'blogs' && (
            <div>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.5px' }}>📝 Blog Yönetimi</h1>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>Web sitenizdeki blog içeriklerini ve SEO meta etiketlerini yönetin</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={fetchAdminBlogs}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🔄 Yenile
                  </button>
                  <button
                    onClick={() => openBlogModal()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      border: 'none',
                      background: 'var(--color-primary)',
                      color: '#fff',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0, 102, 255, 0.15)'
                    }}
                  >
                    <Plus size={16} /> Yeni Blog Ekle
                  </button>
                </div>
              </div>

              {/* Blogs List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {loadingBlogs ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0', fontSize: '0.95rem', color: 'var(--text-muted)' }}>İçerikler yükleniyor...</div>
                ) : blogs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 1rem', fontSize: '0.95rem', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    Henüz hiçbir blog yazısı eklenmemiş. "Yeni Blog Ekle" butonuna basarak ilk yazınızı oluşturun.
                  </div>
                ) : (
                  blogs.map(blog => {
                    const img = blog.image || 'https://picsum.photos/seed/placeholder/200/120';
                    const dateFormatted = new Date(blog.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
                    return (
                      <div 
                        key={blog.id}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          borderRadius: '16px',
                          padding: '1.25rem',
                          display: 'flex',
                          gap: '1.25rem',
                          alignItems: 'center',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.01)',
                          flexWrap: 'wrap'
                        }}
                      >
                        <img 
                          src={img} 
                          alt={blog.title} 
                          style={{ width: '100px', height: '64px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border)' }} 
                        />
                        <div style={{ flex: 1, minWidth: '220px' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>{blog.title}</h3>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                            <span style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                              {blog.tag}
                            </span>
                            <span>•</span>
                            <span>{blog.author}</span>
                            <span>•</span>
                            <span>{dateFormatted}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => openBlogModal(blog)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              background: 'var(--color-primary-light)',
                              color: 'var(--color-primary)',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <Edit size={14} /> Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog.id, blog.title)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              background: 'rgba(255, 90, 95, 0.1)',
                              color: 'rgb(255, 90, 95)',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={14} /> Sil
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* BLOG CREATE / EDIT MODAL */}
      {showBlogModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            padding: '2.5rem',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)'
          }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              {editingBlog ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı Ekle'}
            </h2>

            {modalError && (
              <div style={{ background: 'rgba(255, 90, 95, 0.1)', border: '1px solid rgba(255, 90, 95, 0.2)', color: 'rgb(255, 90, 95)', padding: '12px 16px', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                ✕ {modalError}
              </div>
            )}

            <form onSubmit={handleBlogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Title tr/en */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Başlık (Türkçe) *</label>
                  <input
                    type="text"
                    value={blogTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Başlık (İngilizce)</label>
                  <input
                    type="text"
                    value={blogTitleEn}
                    onChange={(e) => setBlogTitleEn(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Slug & Author */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Yazı Linki (Slug) *</label>
                  <input
                    type="text"
                    value={blogSlug}
                    onChange={(e) => setBlogSlug(e.target.value)}
                    required
                    placeholder="ör: tekne-nasil-satilir"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Yazar</label>
                  <input
                    type="text"
                    value={blogAuthor}
                    onChange={(e) => setBlogAuthor(e.target.value)}
                    required
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Tag tr/en */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Kategori Etiketi (Türkçe)</label>
                  <input
                    type="text"
                    placeholder="ör: Rehber, Haber, Teknoloji"
                    value={blogTag}
                    onChange={(e) => setBlogTag(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Kategori Etiketi (İngilizce)</label>
                  <input
                    type="text"
                    placeholder="ör: Guide, News, Tech"
                    value={blogTagEn}
                    onChange={(e) => setBlogTagEn(e.target.value)}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Image Upload / URL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Kapak Görseli</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label 
                    htmlFor="blog-image-file"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      background: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      border: '1px dashed var(--color-primary)'
                    }}
                  >
                    <ImageIcon size={16} /> Görsel Yükle
                  </label>
                  <input
                    type="file"
                    id="blog-image-file"
                    accept="image/*"
                    onChange={(e) => e.target.files && setBlogImageFile(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                  {blogImageFile && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      Selected: {blogImageFile.name}
                    </span>
                  )}
                  {!blogImageFile && blogImageUrl && (
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      Mevcut görsel kayıtlı.
                    </span>
                  )}
                </div>
              </div>

              {/* Content (HTML Textarea) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>İçerik (Türkçe) - HTML Formatında *</label>
                <textarea
                  rows={8}
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                  required
                  placeholder="<p>Blog yazısının içeriği...</p><h2>Başlık</h2><p>İçerik devamı...</p>"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'monospace', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>İçerik (İngilizce) - HTML Formatında</label>
                <textarea
                  rows={6}
                  value={blogContentEn}
                  onChange={(e) => setBlogContentEn(e.target.value)}
                  placeholder="<p>Blog English content...</p>"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none', fontFamily: 'monospace', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              {/* SEO Block */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={16} /> Arama Motoru Optimizasyonu (SEO)
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>SEO Başlığı (Meta Title)</label>
                    <input
                      type="text"
                      placeholder="Google'da görünecek başlık (boş bırakılırsa normal başlık kullanılır)"
                      value={blogMetaTitle}
                      onChange={(e) => setBlogMetaTitle(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>SEO Açıklaması (Meta Description)</label>
                    <input
                      type="text"
                      placeholder="Google aramalarında çıkacak 150-160 karakterlik özet açıklama"
                      value={blogMetaDesc}
                      onChange={(e) => setBlogMetaDesc(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Anahtar Kelimeler (Keywords)</label>
                    <input
                      type="text"
                      placeholder="virgülle ayırarak yazın (ör: tekne satışı, tekne ilan, tekne rehberi)"
                      value={blogMetaKeywords}
                      onChange={(e) => setBlogMetaKeywords(e.target.value)}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-body)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowBlogModal(false)}
                  style={{
                    padding: '11px 22px',
                    borderRadius: '10px',
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
                  disabled={modalLoading}
                  style={{
                    padding: '11px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--color-primary)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: modalLoading ? 0.8 : 1
                  }}
                >
                  {modalLoading ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
