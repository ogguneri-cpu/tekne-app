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

      <main className="min-h-screen bg-bg-body flex items-center justify-center py-12 px-4">
        <div className="login-card max-w-md w-full bg-bg-card border border-border rounded-xl p-6 shadow-md" style={{ display: 'block' }}>
          <div className="login-header text-center mb-6">
            <img src="/assets/logo.png" alt="satiliktekne.com" className="h-12 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-text-primary">
              {activeTab === 'login' ? t('Hoş Geldiniz') : t('Kayıt Ol')}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {t('Tekne alın, satın veya kiralayın')}
            </p>
          </div>

          <div className="login-tabs flex border-b border-border mb-6">
            <button 
              className={`login-tab flex-1 pb-3 text-center text-sm font-semibold transition-all border-b-2 ${activeTab === 'login' ? 'active border-primary text-primary' : 'border-transparent text-text-secondary'}`}
              onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            >
              {t('Giriş Yap')}
            </button>
            <button 
              className={`login-tab flex-1 pb-3 text-center text-sm font-semibold transition-all border-b-2 ${activeTab === 'register' ? 'active border-primary text-primary' : 'border-transparent text-text-secondary'}`}
              onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            >
              {t('Kayıt Ol')}
            </button>
          </div>

          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4 border border-red-200 dark:border-red-900/50">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm mb-4 border border-green-200 dark:border-green-900/50">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form space-y-4">
            {activeTab === 'register' && (
              <>
                <div className="form-group">
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('Ad Soyad')}</label>
                  <input 
                    type="text" 
                    placeholder="Ahmet Yılmaz" 
                    className="w-full border border-border rounded p-2 text-sm"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('Telefon Numarası')}</label>
                  <input 
                    type="tel" 
                    placeholder="0532 000 00 00" 
                    className="w-full border border-border rounded p-2 text-sm"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('E-posta')}</label>
              <input 
                type="email" 
                placeholder="ornek@email.com" 
                className="w-full border border-border rounded p-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('Şifre')}</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full border border-border rounded p-2 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold transition-opacity"
              disabled={loading}
            >
              {loading ? 'Yükleniyor...' : (activeTab === 'login' ? t('Giriş Yap') : t('Kayıt Ol'))}
            </button>
          </form>

          {/* Social Auth Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-bg-card px-2 text-text-muted">VEYA</span>
            </div>
          </div>

          <button 
            type="button" 
            className="w-full border border-border hover:bg-bg-hover py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 text-text-primary transition-colors"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Google ile Giriş Yap</span>
          </button>
        </div>
      </main>

      <Footer />
    </>
  );
}
