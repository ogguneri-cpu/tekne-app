import React from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { BLOG_POSTS } from '@/lib/utils/blogData';
import { Link } from '@/i18n/routing';
import DOMPurify from 'isomorphic-dompurify';

interface BlogDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations();

  // Find post by ID or slug mapping
  const post = BLOG_POSTS[slug] || Object.values(BLOG_POSTS).find(p => p.id === slug);

  if (!post) {
    notFound();
  }

  const title = (locale === 'en' && post.title_en) ? post.title_en : post.title;
  const body = (locale === 'en' && post.content_en) ? post.content_en : post.content;
  const dateStr = locale === 'en' ? post.dateFormattedEn : post.dateFormatted;

  const cleanBody = DOMPurify.sanitize(body);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-bg-body py-12">
        <div className="container max-w-3xl">
          <article className="blog-detail bg-bg-card border border-border rounded-xl p-6 shadow-sm">
            <Link href="/" className="detail-back-btn inline-flex items-center gap-2 mb-6 text-sm font-semibold text-primary">
              ← {t('Ana Sayfa')}
            </Link>

            <div className="blog-detail-hero relative rounded-xl overflow-hidden mb-6 aspect-video">
              <img src={post.image} alt={post.alt} className="w-full h-full object-cover" />
              <span className="blog-tag absolute top-4 left-4 bg-primary text-white text-xs px-2.5 py-1 rounded font-semibold">
                {t(post.tag)}
              </span>
            </div>

            <div className="blog-detail-meta text-xs text-text-muted flex gap-2 mb-4 font-semibold uppercase tracking-wider">
              <time>{dateStr}</time>
              <span>•</span>
              <span>{t('5 dk okuma')}</span>
            </div>

            <h1 className="blog-detail-title text-2xl lg:text-3xl font-extrabold text-text-primary mb-6">
              {title}
            </h1>

            <div 
              className="blog-detail-content prose dark:prose-invert max-w-none text-text-secondary text-sm leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: cleanBody }}
            />
          </article>
        </div>
      </main>

      <Footer />
    </>
  );
}
