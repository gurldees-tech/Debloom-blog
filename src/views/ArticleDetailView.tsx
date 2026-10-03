import React, { useEffect, useMemo, useState } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Share2, 
  Send, 
  Copy, 
  Check, 
  ShieldAlert, 
  Target, 
  Sparkles,
  ChevronRight,
  BookOpen,
  Eye,
  Sprout
} from 'lucide-react';
import { Article, BloomChallenge } from '../types';
import { articleService, analyticsService } from '../services/storage';
import { ArticleContentRenderer } from '../components/ArticleContentRenderer';

interface ArticleDetailViewProps {
  article: Article;
  allArticles: Article[];
  linkedChallenge?: BloomChallenge;
  onBack: () => void;
  onSelectArticle: (article: Article) => void;
  onSelectChallenge: (challenge: BloomChallenge) => void;
  onOpenReportModal: (type: 'opportunity' | 'resource' | 'article', id: string, title: string) => void;
  onOpenSubmit: (challengeTitle?: string) => void;
  onToast: (msg: string) => void;
  onNavigate?: (view: string, param?: string) => void;
}

export const ArticleDetailView: React.FC<ArticleDetailViewProps> = ({
  article,
  allArticles,
  linkedChallenge,
  onBack,
  onSelectArticle,
  onSelectChallenge,
  onOpenReportModal,
  onOpenSubmit,
  onToast,
  onNavigate,
}) => {
  const [copied, setCopied] = useState(false);
  const [currentViews, setCurrentViews] = useState(article.views || 0);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${article.seoTitle || article.title} – Debloom 🌱`;

    // Session-guarded view count increment to prevent accidental refresh inflation
    const sessionKey = `debloom_viewed_${article.slug || article.id}`;
    if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, '1');
      articleService.incrementViews(article.id);
      setCurrentViews(prev => prev + 1);
    }
    analyticsService.logEvent('article_view', article.title);

    // Schema.org BlogPosting & Breadcrumb Structured Data
    const scriptId = 'debloom-article-schema';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          '@id': `https://debloom.org/blog/${article.slug}#article`,
          'headline': article.title,
          'description': article.excerpt || article.metaDescription,
          'author': {
            '@type': 'Person',
            'name': article.author || 'Debbie',
            'url': 'https://debloom.org/about'
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'Debloom',
            'url': 'https://debloom.org',
            'slogan': 'Start where you are. Bloom from there.'
          },
          'datePublished': article.publishDate,
          'dateModified': article.updatedDate || article.publishDate,
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `https://debloom.org/blog/${article.slug}`
          },
          ...(article.featuredImage ? { 'image': [article.featuredImage] } : {}),
          'articleSection': article.category
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `https://debloom.org/blog/${article.slug}#breadcrumb`,
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Reading Room',
              'item': 'https://debloom.org/blog'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': article.category,
              'item': 'https://debloom.org/blog'
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': article.title,
              'item': `https://debloom.org/blog/${article.slug}`
            }
          ]
        }
      ]
    };

    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      const tag = document.getElementById(scriptId);
      if (tag) tag.remove();
    };
  }, [article.id, article.slug, article.title, article.excerpt, article.metaDescription, article.author, article.publishDate, article.updatedDate, article.featuredImage, article.category]);

  const relatedArticles = useMemo(() => {
    return allArticles
      .filter(a => a.id !== article.id && a.status === 'Published')
      .slice(0, 2);
  }, [allArticles, article.id]);

  const articleUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/blog/${article.slug}`;
    }
    return `https://debloom.org/blog/${article.slug}`;
  }, [article.slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    onToast('Article link copied to clipboard! 🔗');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(`"${article.title}" on Debloom 🌱\n${articleUrl}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`"${article.title}" — practical guide on Debloom 🌱`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-150">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#57615C]">
        <button
          onClick={onBack}
          className="hover:text-[#163323] transition-colors cursor-pointer"
        >
          Reading Room
        </button>
        <span aria-hidden="true" className="text-[#8FA89B]">/</span>
        <span className="text-[#27523D] font-medium">{article.category}</span>
        <span aria-hidden="true" className="text-[#8FA89B]">/</span>
        <span className="truncate max-w-[200px] sm:max-w-xs text-[#7B8681]">{article.title}</span>
      </nav>

      {/* Header Container */}
      <header className="space-y-4 border-b border-[#E5E2D9] pb-8">
        
        {/* Subtle Metadata & Real View Count */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#57615C]">
          <span className="inline-flex items-center gap-1 font-semibold text-[#27523D]">
            <Sprout className="w-3.5 h-3.5 text-[#27523D]" />
            <span>{article.category}</span>
          </span>
          <span aria-hidden="true" className="text-[#8FA89B]">·</span>
          <span>{article.readingTimeMinutes || 4} min read</span>
          <span aria-hidden="true" className="text-[#8FA89B]">·</span>
          <span>Published {article.publishDate || 'Recent'}</span>
          {article.updatedDate && article.updatedDate !== article.publishDate && (
            <>
              <span aria-hidden="true" className="text-[#8FA89B]">·</span>
              <span className="text-[#7B8681]">Updated {article.updatedDate}</span>
            </>
          )}
          <span aria-hidden="true" className="text-[#8FA89B]">·</span>
          <span className="inline-flex items-center gap-1 font-medium text-[#7B8681]">
            <Eye className="w-3.5 h-3.5 text-[#8FA89B]" />
            <span>{currentViews} {currentViews === 1 ? 'view' : 'views'}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#163323] tracking-tight leading-[1.18]">
          {article.title}
        </h1>

        {/* Subtitle (if provided) */}
        {article.subtitle && (
          <p className="font-editorial text-xl sm:text-2xl text-[#27523D] font-medium tracking-tight -mt-1">
            {article.subtitle}
          </p>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-base sm:text-lg text-[#57615C] leading-relaxed italic font-editorial pt-1">
            "{article.excerpt}"
          </p>
        )}

        {/* Author byline & sharing controls */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[#57615C]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#163323] text-white flex items-center justify-center font-bold text-sm font-editorial">
              {article.author ? article.author.charAt(0) : 'D'}
            </div>
            <div>
              <div className="font-semibold text-[#163323] flex items-center gap-1.5">
                <span>{article.author}</span>
                {article.author.toLowerCase() === 'debbie' && (
                  <span className="text-[10px] text-[#27523D] font-normal">🌱 Creator</span>
                )}
              </div>
              <div className="text-[11px] text-[#7B8681] flex items-center gap-1">
                <span>{article.authorRole || 'Debloom Editorial'}</span>
                {onNavigate && (
                  <>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => onNavigate('about')}
                      className="text-[#27523D] underline underline-offset-2 hover:text-[#163323] cursor-pointer"
                    >
                      Read story
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg border border-[#E5E2D9] bg-white hover:bg-[#F1F6F3] text-[#57615C] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Copy shareable link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#27523D]" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline text-xs">Copy link</span>
            </button>

            <button
              onClick={handleShareTelegram}
              className="p-2 rounded-lg border border-[#E5E2D9] bg-white hover:bg-[#F1F6F3] text-[#57615C] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Share on Telegram"
            >
              <Send className="w-3.5 h-3.5 text-[#27523D]" />
              <span className="hidden sm:inline text-xs">Telegram</span>
            </button>

            <button
              onClick={handleShareTwitter}
              className="p-2 rounded-lg border border-[#E5E2D9] bg-white hover:bg-[#F1F6F3] text-[#57615C] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Share on X"
            >
              <Share2 className="w-3.5 h-3.5 text-[#27523D]" />
              <span className="hidden sm:inline text-xs">Share</span>
            </button>
          </div>
        </div>

      </header>

      {/* Featured Hero Banner */}
      {article.featuredImage && (
        <figure className="rounded-2xl overflow-hidden border border-[#E5E2D9] shadow-xs bg-[#F7F5EE] max-h-[480px]">
          <img
            src={article.featuredImage}
            alt={article.imageAltText || article.title}
            className="w-full h-full object-cover max-h-[480px]"
            loading="eager"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          {article.imageAltText && (
            <figcaption className="text-center text-xs text-[#7B8681] italic font-sans py-2 bg-[#FCFBF7] border-t border-[#E5E2D9]">
              {article.imageAltText}
            </figcaption>
          )}
        </figure>
      )}

      {/* Main Content Body rendered with rich editorial styling */}
      <section className="pt-2">
        <ArticleContentRenderer content={article.body} />
      </section>

      {/* Embedded Bloom Challenge (If linked to this educational article) */}
      {linkedChallenge && (
        <section className="my-10 bg-[#163323] text-[#FCFBF7] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#27523D] pb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#8FA89B]" />
              <h2 className="font-editorial text-2xl font-bold text-white">
                Bloom Challenge 🌱
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#27523D] text-[#8FA89B]">
              Proof of Work
            </span>
          </div>

          <div className="space-y-3">
            <h3 className="font-editorial text-xl font-bold text-[#FCFBF7]">
              {linkedChallenge.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#DCE7E1] leading-relaxed">
              {linkedChallenge.whatYoullDo || linkedChallenge.prompt}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#1b3b2b] border border-[#27523D] space-y-2">
            <div className="text-xs font-semibold text-[#8FA89B] uppercase tracking-wider">
              Expected Output
            </div>
            <p className="text-xs sm:text-sm text-[#FCFBF7]">
              {linkedChallenge.expectedOutput}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            <div className="text-xs text-[#8FA89B]">
              {linkedChallenge.estimatedTimeMinutes ? `Takes ~${linkedChallenge.estimatedTimeMinutes} mins · ` : ''}Free to complete
            </div>
            <button
              onClick={() => onOpenSubmit(linkedChallenge.title)}
              className="px-5 py-2.5 rounded-xl bg-[#27523D] hover:bg-[#376d52] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Submit Your Work</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </button>
          </div>
        </section>
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="pt-6 border-t border-[#E5E2D9] flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#7B8681] font-medium mr-1">Topics:</span>
          {article.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg bg-[#FAF8F2] border border-[#E5E2D9] text-[11px] text-[#57615C]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Telegram Channel Community Banner */}
      <section className="bg-[#FAF2DC] rounded-2xl border border-[#E5E2D9] p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#27523D]">
          <Send className="w-3.5 h-3.5 text-[#27523D]" />
          <span>Debloom Community</span>
        </div>
        <h3 className="font-editorial text-xl font-bold text-[#163323]">
          Get quick updates, useful resources and new Debloom posts on Telegram.
        </h3>
        <p className="text-xs text-[#57615C]">
          No spam, no noise. Only verified opportunities, skill guides, and student reflections.
        </p>
        <div className="pt-2">
          <a
            href="https://t.me/DebloomHQ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#163323] text-white text-xs font-semibold rounded-lg hover:bg-[#27523D] transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Join @DebloomHQ</span>
          </a>
        </div>
      </section>

      {/* Related Guides */}
      {relatedArticles.length > 0 && (
        <section className="pt-8 border-t border-[#E5E2D9] space-y-4">
          <h3 className="font-editorial text-xl font-bold text-[#163323]">
            More from Debloom
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedArticles.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectArticle(rel)}
                className="p-5 rounded-xl border border-[#E5E2D9] bg-white hover:bg-[#FCFBF7] transition-colors cursor-pointer space-y-2 group shadow-xs"
              >
                <div className="text-[11px] font-semibold text-[#27523D] uppercase tracking-wider">
                  {rel.category}
                </div>
                <h4 className="font-editorial text-base font-bold text-[#163323] group-hover:text-[#27523D] transition-colors">
                  {rel.title}
                </h4>
                <p className="text-xs text-[#57615C] line-clamp-2">
                  {rel.excerpt}
                </p>
                <div className="text-[11px] text-[#7B8681] pt-1 flex items-center justify-between">
                  <span>{rel.readingTimeMinutes || 4} min read</span>
                  <span className="text-[#27523D] font-medium flex items-center gap-0.5">
                    Read guide <ChevronRight className="w-3 h-3 inline" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Discrepancy reporting link */}
      <div className="pt-6 border-t border-[#E5E2D9] flex justify-between items-center text-xs text-[#7B8681]">
        <button
          onClick={onBack}
          className="hover:text-[#163323] transition-colors cursor-pointer flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Reading Room</span>
        </button>

        <button
          onClick={() => onOpenReportModal('article', article.id, article.title)}
          className="hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Report inaccurate information</span>
        </button>
      </div>

    </article>
  );
};
