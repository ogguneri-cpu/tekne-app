import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import '@/app/globals.css';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'satiliktekne.com | Buy & Charter Yachts, Boats, Sailboats in Turkey'
    : 'satiliktekne.com | Satılık & Kiralık Yat, Motoryat, Yelkenli ve Tekne İlanları';

  const description = isEn
    ? 'Discover thousands of luxury yachts, motor yachts, sailboats, and catamarans for sale or charter in Turkey on satiliktekne.com.'
    : 'Türkiye\'nin en kapsamlı tekne ilan platformu. Sahibinden ve mağazadan satılık & kiralık motoryat, yelkenli, katamaran, sürat teknesi, gulet ilanları.';

  const siteUrl = 'https://satiliktekne.com';
  const canonicalUrl = locale === 'tr' ? siteUrl : `${siteUrl}/en`;
  const ogImageUrl = `${siteUrl}/assets/blog-satiliktekne-nedir.jpg`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: '%s | satiliktekne.com'
    },
    description,
    keywords: isEn
      ? ['boats for sale', 'yachts for charter', 'motor yacht', 'sailboat', 'catamaran', 'satiliktekne.com', 'turkey yachting']
      : ['satılık tekne', 'kiralık tekne', 'motoryat', 'yelkenli', 'katamaran', 'gulet', 'tekne ilanları', 'yat kiralama', 'satiliktekne.com'],
    authors: [{ name: 'satiliktekne.com' }],
    creator: 'satiliktekne.com',
    publisher: 'satiliktekne.com',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'tr': siteUrl,
        'en': `${siteUrl}/en`
      }
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'satiliktekne.com',
      locale: isEn ? 'en_US' : 'tr_TR',
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'satiliktekne.com'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl]
    },
    icons: {
      icon: '/assets/favicon.jpg',
      apple: '/assets/favicon.jpg',
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming locale is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Provide messages for i18n translation provider
  const messages = await getMessages();

  return (
    <html lang={locale} data-theme="light">
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
