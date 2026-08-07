import React from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Link } from '@/i18n/routing';
import DOMPurify from 'isomorphic-dompurify';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';

interface BlogDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!post) {
    return {
      title: 'Blog | satiliktekne.com',
    };
  }

  const title = (locale === 'en' && post.title_en) ? post.title_en : post.title;
  const metaTitle = post.meta_title || title;
  const metaDesc = post.meta_description || '';
  const keywords = post.meta_keywords || '';

  return {
    title: `${metaTitle} | satiliktekne.com`,
    description: metaDesc,
    keywords: keywords,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      images: post.image ? [{ url: post.image }] : [],
    }
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations();
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !post) {
    notFound();
  }

  const title = (locale === 'en' && post.title_en) ? post.title_en : post.title;
  const body = (locale === 'en' && post.content_en) ? post.content_en : post.content;
  
  // Format date
  const dateObj = new Date(post.created_at || post.date || new Date());
  const dateFormatted = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const dateFormattedEn = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const dateStr = locale === 'en' ? dateFormattedEn : dateFormatted;

  const cleanBody = DOMPurify.sanitize(body);
  const displayTag = locale === 'en' ? (post.tag_en || post.tag) : post.tag;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-bg-body py-12">
        <div className="container max-w-3xl" style={{ maxWidth: '768px', margin: '0 auto', padding: '0 1.5rem' }}>
          <article className="blog-detail bg-bg-card border border-border rounded-2xl p-8 shadow-sm">
            <Link href="/" className="detail-back-btn inline-flex items-center gap-2 mb-6 text-sm font-bold text-primary" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              ← {t('Ana Sayfa')}
            </Link>

            {post.image && (
              <div className="blog-detail-hero relative rounded-2xl overflow-hidden mb-6 aspect-video" style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem', aspectRatio: '16/9' }}>
                <img src={post.image} alt={title} className="w-full h-full object-cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {displayTag && (
                  <span className="blog-tag absolute top-4 left-4 bg-primary text-white text-xs px-3 py-1.5 rounded-lg font-bold" style={{ position: 'absolute', top: '16px', left: '16px', background: 'var(--color-primary)', color: '#fff', fontSize: '0.75rem', padding: '6px 12px', borderRadius: '8px', fontWeight: 700 }}>
                    {displayTag}
                  </span>
                )}
              </div>
            )}

            <div className="blog-detail-meta text-xs text-text-muted flex gap-2 mb-4 font-semibold uppercase tracking-wider" style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 600 }}>
              <time>{dateStr}</time>
              {post.author && (
                <>
                  <span>•</span>
                  <span>{post.author}</span>
                </>
              )}
            </div>

            <h1 className="blog-detail-title text-2xl lg:text-3xl font-extrabold text-text-primary mb-6" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: '1.3' }}>
              {title}
            </h1>

            <div 
              className="blog-detail-content prose dark:prose-invert max-w-none text-text-secondary text-sm leading-relaxed space-y-4"
              style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{ __html: cleanBody }}
            />
          </article>
        </div>
      </main>

      <Footer />
    </>
  );
}
