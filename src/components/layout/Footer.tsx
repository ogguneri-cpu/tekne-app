'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const openModal = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveModal(id);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <footer className="site-footer" id="site-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <img src="/assets/logo-white.png" alt="satiliktekne.com" className="footer-logo" />
              <p className="footer-tagline">
                {t("Türkiye'nin Denizci Platformu")}
              </p>
            </div>
            <div className="footer-social">
              <a 
                href="https://www.instagram.com/satilikteknecom?utm_source=qr&igsh=ZWpzZmh5cnllZHNl" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer-social-link animate-pulse-subtle"
                title="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
            <div className="footer-contact">
              <a href="mailto:yachting@cmx.com.tr" className="footer-email">yachting@cmx.com.tr</a>
            </div>
            <div className="footer-links-row">
              <a href="#" className="legal-link" onClick={(e) => openModal('kvkk', e)}>
                {t('KVKK Aydınlatma Metni')}
              </a>
              <span className="footer-dot">•</span>
              <a href="#" className="legal-link" onClick={(e) => openModal('terms', e)}>
                {t('Kullanım Koşulları')}
              </a>
              <span className="footer-dot">•</span>
              <a href="#" className="legal-link" onClick={(e) => openModal('cookies', e)}>
                {t('Çerez Politikası')}
              </a>
              <span className="footer-dot">•</span>
              <a href="#" className="legal-link" onClick={(e) => openModal('privacy', e)}>
                {t('Gizlilik Sözleşmesi')}
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">
              <Link href="/admin" className="footer-admin-link">©</Link>{' '}
              2016 CMX Super Yacht Agency —{' '}
              <span>{t('Tüm hakları saklıdır')}</span>
            </p>
          </div>
        </div>
      </footer>

      {/* 📜 KVKK MODAL */}
      {activeModal === 'kvkk' && (
        <div className="legal-modal-overlay active" onClick={closeModal}>
          <div className="legal-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="legal-modal-header">
              <h2>📜 KVKK Aydınlatma Metni</h2>
              <button className="legal-modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="legal-modal-body">
              <p><strong>satiliktekne.com (CMX Denizcilik Yatçılık) Kişisel Verilerin Korunması ve İşlenmesi Aydınlatma Metni</strong></p>
              <p>6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca, <strong>satiliktekne.com (CMX Denizcilik Yatçılık)</strong> olarak, Veri Sorumlusu sıfatıyla kişisel verilerinizi işliyoruz.</p>
              <h3>1. İşlenen Kişisel Veriler ve İşleme Amaçları</h3>
              <p>Üyelik oluşturma, ilan yayınlama ve alıcı-satıcı iletişim süreçlerinde tarafımıza ilettiğiniz Ad Soyad, E-posta, Telefon Numarası ve işlem güvenliği (IP/Log) verileriniz; ilan hizmetlerinin sunulması, kullanıcı güvenliğinin sağlanması, yasal yükümlülüklerin yerine getirilmesi ve iletişim taleplerinin karşılanması amacıyla işlenmektedir.</p>
              <h3>2. Kişisel Verilerin Aktarılması</h3>
              <p>Kişisel verileriniz, yasal zorunluluklar dışında 3. şahıslara veya şirketlere aktarılmaz. Yalnızca yetkili kamu kurum ve kuruluşları ile adli makamların resmi talepleri halinde paylaşılabilir.</p>
              <h3>3. Haklarınız (KVKK Madde 11)</h3>
              <p>Veri sahibi olarak; kişisel verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini talep etme haklarına sahipsiniz. Taleplerinizi <strong>yachting@cmx.com.tr</strong> adresine iletebilirsiniz.</p>
            </div>
          </div>
        </div>
      )}

      {/* 📑 TERMS OF USE MODAL */}
      {activeModal === 'terms' && (
        <div className="legal-modal-overlay active" onClick={closeModal}>
          <div className="legal-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="legal-modal-header">
              <h2>📑 Kullanım Koşulları</h2>
              <button className="legal-modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="legal-modal-body">
              <p><strong>satiliktekne.com Kullanım Koşulları</strong></p>
              <h3>1. Genel Hükümler</h3>
              <p>satiliktekne.com web sitesini ziyaret eden veya üye olan tüm kullanıcılar bu Kullanım Koşullarını kabul etmiş sayılır.</p>
              <h3>2. İlan Veren Sorumluluğu</h3>
              <p>Yayınlanan ilanların (teknik özellikler, görseller, fiyat, takas durumu ve mülkiyet bilgileri) doğruluğundan ve hukuki sorumluluğundan tamamen ilan veren üye sorumludur. satiliktekne.com ilan içeriklerinin doğruluğunu taahhüt etmez ve alıcı ile satıcı arasındaki ticari anlaşmazlıklarda taraf değildir.</p>
              <h3>3. Hizmet Hakları</h3>
              <p>satiliktekne.com, ilan yayın kurallarına aykırı gördüğü içerikleri onaylamama veya yayından kaldırma hakkını saklı tutar.</p>
            </div>
          </div>
        </div>
      )}

      {/* 🍪 COOKIE POLICY MODAL */}
      {activeModal === 'cookies' && (
        <div className="legal-modal-overlay active" onClick={closeModal}>
          <div className="legal-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="legal-modal-header">
              <h2>🍪 Çerez Politikası</h2>
              <button className="legal-modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="legal-modal-body">
              <p><strong>satiliktekne.com Çerez (Cookie) Politikası</strong></p>
              <h3>1. Çerez Kullanımı</h3>
              <p>Platformumuzda kullanıcı deneyimini iyileştirmek, oturum durumunuzu korumak ve dil tercihlerinizi (TR/EN) hatırlamak amacıyla zorunlu ve işlevsel çerezler kullanılmaktadır.</p>
              <h3>2. Çerez Yönetimi</h3>
              <p>Tarayıcı ayarlarınız üzerinden çerez kullanım tercihlerini değiştirebilir veya çerezleri dilediğiniz zaman silebilirsiniz. Çerezleri devre dışı bırakmanız durumunda sitenin bazı özellikleri kısıtlanabilir.</p>
            </div>
          </div>
        </div>
      )}

      {/* 🔒 PRIVACY POLICY MODAL */}
      {activeModal === 'privacy' && (
        <div className="legal-modal-overlay active" onClick={closeModal}>
          <div className="legal-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="legal-modal-header">
              <h2>🔒 Gizlilik Sözleşmesi</h2>
              <button className="legal-modal-close" onClick={closeModal}>&times;</button>
            </div>
            <div className="legal-modal-body">
              <p><strong>satiliktekne.com Gizlilik Sözleşmesi</strong></p>
              <p>satiliktekne.com, kullanıcılarının bilgi güvenliğine ve gizliliğine azami hassasiyet gösterir.</p>
              <p>Kullanıcı şifreleri güvenli şifreleme altyapısıyla saklanır. İlan detaylarında yer alan telefon ve e-posta bilgileri, alıcıların satıcıya ulaşabilmesi amacıyla ilanlarda gösterilir. Kullanıcı verileri hiçbir şart altında 3. taraf pazarlama şirketlerine satılmaz veya devredilmez.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
