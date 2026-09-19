'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';

interface ShareListingProps {
  title: string;
  url?: string;
  variant?: 'bar' | 'button' | 'icon';
  className?: string;
  style?: React.CSSProperties;
}

export default function ShareListing({
  title,
  url,
  variant = 'bar',
  className,
  style
}: ShareListingProps) {
  const t = useTranslations();
  const locale = useLocale();

  const [shareUrl, setShareUrl] = useState(url || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = url || window.location.href;
      setShareUrl(currentUrl);
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        setHasNativeShare(true);
      }
    }
  }, [url]);

  const shareText = `${title} — satiliktekne.com`;

  const handleCopyLink = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  const handleNativeShare = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl
        });
        setIsModalOpen(false);
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const shareChannels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      color: '#25D366',
      bgLight: 'rgba(37, 211, 102, 0.12)',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      )
    },
    {
      id: 'facebook',
      name: 'Facebook',
      color: '#1877F2',
      bgLight: 'rgba(24, 119, 242, 0.12)',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      id: 'twitter',
      name: 'X',
      color: '#0f1419',
      bgLight: 'rgba(15, 20, 25, 0.1)',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      color: '#0A66C2',
      bgLight: 'rgba(10, 102, 194, 0.12)',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
        </svg>
      )
    },
    {
      id: 'telegram',
      name: 'Telegram',
      color: '#24A1DE',
      bgLight: 'rgba(36, 161, 222, 0.12)',
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
        </svg>
      )
    },
    {
      id: 'email',
      name: 'E-posta',
      color: '#EA4335',
      bgLight: 'rgba(234, 67, 53, 0.12)',
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
      )
    }
  ];

  return (
    <>
      {/* ── VARIANT: BAR (Under title or compact banner) ── */}
      {variant === 'bar' && (
        <div
          className={className}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            padding: '8px 12px',
            background: 'rgba(0, 102, 255, 0.04)',
            borderRadius: '12px',
            border: '1px solid rgba(0, 102, 255, 0.12)',
            ...style
          }}
        >
          {/* Label + Share trigger */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px 6px',
              margin: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              transition: 'color 0.2s ease'
            }}
            title={t('Tüm Paylaşım Seçenekleri')}
          >
            <span style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
                <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
              </svg>
            </span>
            <span>{t('İlanı Paylaş')}</span>
          </button>

          {/* Quick Channels Strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* WhatsApp Direct */}
            <a
              href={shareChannels[0].href}
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp ile Paylaş"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#25D366',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(37, 211, 102, 0.25)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {shareChannels[0].icon}
            </a>

            {/* X / Twitter */}
            <a
              href={shareChannels[2].href}
              target="_blank"
              rel="noopener noreferrer"
              title="X'te Paylaş"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#0f1419',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(15, 20, 25, 0.2)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {shareChannels[2].icon}
            </a>

            {/* Facebook */}
            <a
              href={shareChannels[1].href}
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook'ta Paylaş"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#1877F2',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(24, 119, 242, 0.25)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {shareChannels[1].icon}
            </a>

            {/* LinkedIn */}
            <a
              href={shareChannels[3].href}
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn'de Paylaş"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#0A66C2',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(10, 102, 194, 0.25)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {shareChannels[3].icon}
            </a>

            {/* Copy Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              title={copied ? t('Bağlantı Kopyalandı!') : t('Bağlantıyı Kopyala')}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: copied ? '#10b981' : 'var(--bg-card)',
                color: copied ? '#ffffff' : 'var(--text-secondary)',
                border: copied ? '1px solid #10b981' : '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
              }}
            >
              {copied ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
              )}
            </button>

            {/* Open Modal (More Options) */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              title={t('Tüm Paylaşım Seçenekleri')}
              style={{
                height: '32px',
                padding: '0 10px',
                borderRadius: '16px',
                background: 'rgba(0, 102, 255, 0.1)',
                color: 'var(--color-primary)',
                border: '1px solid rgba(0, 102, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>+</span>
              <span>{locale === 'en' ? 'More' : 'Diğer'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── VARIANT: BUTTON (For sidebar & price card) ── */}
      {variant === 'button' && (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={className}
          style={{
            width: '100%',
            padding: '13px 18px',
            borderRadius: '12px',
            border: '1.5px solid rgba(0, 102, 255, 0.25)',
            background: 'rgba(0, 102, 255, 0.05)',
            color: 'var(--color-primary)',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0, 102, 255, 0.06)',
            ...style
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 102, 255, 0.1)';
            e.currentTarget.style.borderColor = 'var(--color-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 102, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(0, 102, 255, 0.25)';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
            <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
          </svg>
          <span>{t('İlanı Paylaş')}</span>
        </button>
      )}

      {/* ── VARIANT: ICON ONLY ── */}
      {variant === 'icon' && (
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={className}
          title={t('İlanı Paylaş')}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            ...style
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
            <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
          </svg>
        </button>
      )}

      {/* ── SHARE MODAL / BOTTOM SHEET ── */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              borderRadius: '24px',
              padding: '24px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border)',
              position: 'relative'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {t('İlanı Paylaş')}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                  {title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'rgba(0,0,0,0.05)',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: '1.1rem',
                  fontWeight: 700
                }}
              >
                ✕
              </button>
            </div>

            {/* Social Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '20px'
              }}
            >
              {shareChannels.map((ch) => (
                <a
                  key={ch.id}
                  href={ch.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px 8px',
                    borderRadius: '16px',
                    background: ch.bgLight,
                    textDecoration: 'none',
                    border: '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 6px 16px ${ch.bgLight}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: ch.color,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 10px ${ch.bgLight}`
                    }}
                  >
                    {ch.icon}
                  </div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {ch.name}
                  </span>
                </a>
              ))}
            </div>

            {/* Native Share button for Mobile (AirDrop, Instagram DM, etc.) */}
            {hasNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                style={{
                  width: '100%',
                  marginBottom: '16px',
                  padding: '12px',
                  borderRadius: '14px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-hover)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                <span>📱</span>
                <span>{t('Cihaz ile Paylaş')}</span>
              </button>
            )}

            {/* Copy Link Input Section */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('Bağlantıyı Kopyala')}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-body)',
                  padding: '6px 8px 6px 14px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)'
                }}
              >
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    textOverflow: 'ellipsis'
                  }}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: copied ? '#10b981' : 'var(--color-primary)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {copied ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span>{t('Kopyalandı!')}</span>
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                      </svg>
                      <span>{t('Kopyala')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
