'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        setSuccessMsg('Giriş başarılı! Yönlendiriliyorsunuz...');
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone
            }
          }
        });
        if (error) throw error;
        
        // Supabase returns user immediately but might require email confirmation
        if (data.user && data.session === null) {
          setSuccessMsg('Kayıt başarılı! Lütfen e-posta kutunuzu kontrol edin ve üyeliğinizi onaylayın.');
        } else {
          setSuccessMsg('Kayıt başarılı! Giriş yapılıyor...');
          setTimeout(() => {
            router.push('/');
          }, 1500);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Bir hata oluştu, lütfen bilgileri kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Google ile giriş başarısız oldu.');
    }
  };

  return (
    <>
      <Navbar />

      <main className="login-page">
        <div className="login-card">
          <div className="login-header">
            <span className="login-logo">⚓</span>
            <h1>
              {activeTab === 'login' ? t('Hoş Geldiniz') : t('Kayıt Ol')}
            </h1>
            <p>
              {t('Tekne alın, satın veya kiralayın')}
            </p>
          </div>

          <div className="login-tabs">
            <button 
              className={`login-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            >
              {t('Giriş Yap')}
            </button>
            <button 
              className={`login-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            >
              {t('Kayıt Ol')}
            </button>
          </div>

          {errorMsg && (
            <div style={{ color: 'var(--accent)', background: 'rgba(255, 90, 95, 0.1)', padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1.25rem', border: '1px solid rgba(255, 90, 95, 0.2)' }}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ color: '#2ecc71', background: 'rgba(46, 204, 113, 0.1)', padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1.25rem', border: '1px solid rgba(46, 204, 113, 0.2)' }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {activeTab === 'register' && (
              <>
                <div className="form-group">
                  <label>{t('Ad Soyad')}</label>
                  <input 
                    type="text" 
                    placeholder="Ahmet Yılmaz" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('Telefon Numarası')}</label>
                  <input 
                    type="tel" 
                    placeholder="0532 000 00 00" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>{t('E-posta')}</label>
              <input 
                type="email" 
                placeholder="ornek@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('Şifre')}</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Yükleniyor...' : (activeTab === 'login' ? t('Giriş Yap') : t('Kayıt Ol'))}
            </button>
          </form>

          {/* Social Auth Divider */}
          <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, borderTop: '1px solid var(--border)', zIndex: 1 }}></div>
            <span style={{ position: 'relative', zIndex: 2, background: 'var(--bg-card)', padding: '0 10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {t('VEYA')}
            </span>
          </div>

          <button 
            type="button" 
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '12px', 
              border: '1px solid var(--border)', 
              background: 'var(--bg-body)', 
              color: 'var(--text-primary)', 
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem', 
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease'
            }}
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>{t('Google ile Giriş Yap')}</span>
          </button>
        </div>
      </main>

      <Footer />
    </>
  );
}
