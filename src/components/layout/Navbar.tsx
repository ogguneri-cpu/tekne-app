'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Sun, Moon, User as UserIcon, Plus, Search, Globe, LogOut, FileText } from 'lucide-react';

export default function Navbar() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Theme initialization
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const toggleLanguage = () => {
    const nextLocale = locale === 'tr' ? 'en' : 'tr';
    router.replace(pathname, { locale: nextLocale });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/listings?search=${encodeURIComponent(searchVal)}`);
    } else {
      router.push('/listings');
    }
  };

  return (
    <nav id="navbar" className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo" title={t('Ana Sayfa')}>
          <img 
            src={theme === 'dark' ? '/assets/logo-white.png' : '/assets/logo.png'} 
            alt="satiliktekne.com" 
            className="logo-img" 
          />
        </Link>

        <form onSubmit={handleSearch} className="navbar-search" id="nav-search">
          <input 
            type="text" 
            id="global-search-input" 
            placeholder={t('Tekne, marka veya konum ara')} 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            autoComplete="off" 
          />
          <button type="submit" className="search-btn" id="global-search-btn">
            <Search size={18} strokeWidth={2.5} />
          </button>
        </form>
        <div className="navbar-actions">
          <Link href={user ? '/listings/create' : '/auth/login'} className="btn-create-listing">
            <Plus size={16} strokeWidth={2.5} />
            <span>{t('Ücretsiz İlan Ver')}</span>
          </Link>

          <button 
            className="btn-lang-toggle" 
            onClick={toggleLanguage} 
            title={locale === 'tr' ? 'Switch to English' : 'Türkçe\'ye Geç'}
          >
            {locale === 'tr' ? 'EN' : 'TR'}
          </button>

          <button 
            className="btn-theme-toggle" 
            onClick={toggleTheme} 
            title={t('Tema Değiştir')}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <div className="nav-user-dropdown" style={{ position: 'relative' }}>
            <button 
              className="btn-auth" 
              onClick={() => user ? setDropdownOpen(!dropdownOpen) : router.push('/auth/login')}
            >
              <UserIcon size={20} />
              <span>{user ? (user.user_metadata?.full_name || user.email?.split('@')[0]) : t('Giriş Yap')}</span>
            </button>

            {user && dropdownOpen && (
              <>
                <div 
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="user-menu-dropdown show">
                  <Link 
                    href="/profile" 
                    className="user-menu-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span>📋</span>
                    <span>{t('İlanlarım')}</span>
                  </Link>
                  <Link 
                    href="/listings/create" 
                    className="user-menu-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <span>➕</span>
                    <span>{t('İlan Ver')}</span>
                  </Link>
                  <div className="user-menu-divider" />
                  <button 
                    onClick={handleLogout} 
                    className="user-menu-item danger"
                    style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
                  >
                    <span>🚪</span>
                    <span>{t('Çıkış Yap')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
