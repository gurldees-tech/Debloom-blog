import React, { useEffect, useMemo } from 'react';
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
  BookOpen
} from 'lucide-react';
import { Article, BloomChallenge } from '../types';
import { articleService, analyticsService } from '../services/storage';

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
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    articleService.incrementViews(article.id);
    analyticsService.logEvent('article_view', article.title);
  }, [article.id]);

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
    onToast('Article link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(`"${article.title}" on Debloom 🌱\n${articleUrl}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`"${article.title}" — practical guide on @debloom 🌱`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(articleUrl)}`, '_blank');
  };

  // Convert markdown-style headers, images, quotes, and paragraphs into styled editorial blocks cleanly
  const renderFormattedBody = (body: string) => {
    const sections = body.split('\n\n');
    return sections.map((sec, idx) => {
      const trimmed = sec.trim();
      if (!trimmed) return null;

      // Markdown image: ![Alt or Caption](url)
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        const alt = imgMatch[1];
        const url = imgMatch[2];
        return (
          <figure key={idx} className="my-8 space-y-2.5">
            <div className="rounded-2xl overflow-hidden border border-[#E5E2D9] shadow-xs bg-[#F7F5EE]">
              <img
                src={url}
                alt={alt || article.title}
                className="w-full max-h-[520px] object-cover hover:scale-[1.01] transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  // Fallback handling if image fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            {alt && (
              <figcaption className="text-center text-xs text-[#7B8681] italic font-sans">
                {alt}
              </figcaption>
            )}
          </figure>
        );
      }

      // Blockquotes: > quote
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote 
            key={idx} 
            className="my-6 pl-5 border-l-4 border-[#27523D] bg-[#F7F5EE]/80 py-3.5 px-4 rounded-r-xl text-base sm:text-lg italic text-[#163323] font-editorial leading-relaxed"
          >
            {trimmed.replace(/^>\s*/, '')}
          </blockquote>
        );
      }

      // Heading 2: ## 
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={idx} className="font-editorial text-2xl sm:text-3xl font-bold text-[#163323] mt-10 mb-4 tracking-tight">
            {trimmed.replace('## ', '')}
          </h2>
        );
      }

      // Heading 3: ### 
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="font-editorial text-xl sm:text-2xl font-bold text-[#163323] mt-8 mb-3">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      // Divider: ---
      if (trimmed === '---') {
        return <hr key={idx} className="my-8 border-[#E5E2D9]" />;
      }

      // Lists: 1. or -
      if (trimmed.startsWith('1. ') || trimmed.startsWith('- ')) {
        const items = trimmed.split('\n');
        return (
          <ul key={idx} className="my-4 space-y-2 text-sm sm:text-base text-[#2D3430] pl-5 list-disc">
            {items.map((it, i) => (
              <li key={i} className="leading-relaxed">
                {it.replace(/^[0-9]+\.\s+/, '').replace(/^-\s+/, '')}
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p key={idx} className="my-4 text-sm sm:text-base text-[#2D3430] leading-relaxed">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#57615C] hover:text-[#163323] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to articles</span>
      </button>

      {/* Header Container */}
      <div className="space-y-4 border-b border-[#E5E2D9] pb-8">
        
        {/* Anti-pill unboxed metadata */}
        <div className="flex items-center gap-2 text-xs text-[#57615C]">
          <span className="font-semibold text-[#27523D]">{article.category}</span>
          <span aria-hidden="true">·</span>
          <span>{article.readingTimeMinutes} min read</span>
          <span aria-hidden="true">·</span>
          <span>Published {article.publishDate}</span>
          {article.updatedDate && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#7B8681]">Updated {article.updatedDate}</span>
            </>
          )}
        </div>

        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#163323] tracking-tight leading-[1.18]">
          {article.title}
        </h1>

        <p className="text-base sm:text-lg text-[#57615C] leading-relaxed italic font-editorial">
          "{article.excerpt}"
        </p>

        {/* Author byline & sharing controls */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[#57615C]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#163323] text-white flex items-center justify-center font-bold text-xs">
              {article.author.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-[#163323]">{article.author}</div>
              <div className="text-[11px] text-[#7B8681]">{article.authorRole || 'Debloom Editorial'}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg border border-[#E5E2D9] bg-white hover:bg-[#F1F6F3] text-[#57615C] transition-colors flex items-center gap-1.5"
              title="Copy link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#27523D]" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline text-xs">Copy link</span>
            </button>

            <button
              onClick={handleShareTelegram}
              className="p-2 rounded-lg border border-[#E5E2D9] bg-white hover:bg-[#F1F6F3] text-[#57615C] transition-colors flex items-center gap-1.5"
              title="Share on Telegram"
            >
              <Send className="w-3.5 h-3.5 text-[#27523D]" />
              <span className="hidden sm:inline text-xs">Telegram</span>
            </button>

            <button
              onClick={handleShareTwitter}
              className="p-2 rounded-lg border border-[#E5E2D9] bg-white hover:bg-[#F1F6F3] text-[#57615C] transition-colors flex items-center gap-1.5"
              title="Share on X"
            >
              <Share2 className="w-3.5 h-3.5 text-[#27523D]" />
              <span className="hidden sm:inline text-xs">Share</span>
            </button>
          </div>
        </div>

      </div>

      {/* Featured Hero Image (if present) */}
      {article.featuredImage && (
        <div className="rounded-2xl overflow-hidden border border-[#E5E2D9] shadow-xs bg-[#F7F5EE] max-h-[480px]">
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-full object-cover max-h-[480px]"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Main Content Body */}
      <div className="prose prose-stone max-w-none text-[#1F2421]">
        {renderFormattedBody(article.body)}
      </div>

      {/* EMBEDDED BLOOM CHALLENGE (If linked to this educational article) */}
      {linkedChallenge && (
        <div className="my-10 bg-[#163323] text-[#FCFBF7] rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#27523D] pb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#8FA89B]" />
              <h2 className="font-editorial text-2xl font-bold text-white">
                Bloom Challenge 🌱
              </h2>
            </div>
            <span className="text-xs uppercase tracking-wider text-[#C49B4B] font-semibold">
              Practical Task · {linkedChallenge.difficulty}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">
              {linkedChallenge.title}
            </h3>
            <p className="text-sm text-[#DCE7E1] leading-relaxed">
              <strong>What you'll do:</strong> {linkedChallenge.whatYoullDo}
            </p>
          </div>

          <div className="bg-[#12281B] p-4 rounded-xl border border-[#27523D] space-y-2 text-xs">
            <div className="text-[#8FA89B] font-semibold uppercase tracking-wider">
              What you need:
            </div>
            <p className="text-[#DCE7E1]">{linkedChallenge.whatYouNeed}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8FA89B]">
              Action Steps:
            </h4>
            <ol className="space-y-2 pl-4 list-decimal text-xs sm:text-sm text-[#DCE7E1]">
              {linkedChallenge.steps.map((st, i) => (
                <li key={i} className="leading-relaxed pl-1">{st}</li>
              ))}
            </ol>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-[#DCE7E1]">
            <div className="bg-[#12281B] p-3 rounded-lg border border-[#27523D]">
              <div className="font-semibold text-white mb-1">Expected Output:</div>
              <p>{linkedChallenge.expectedOutput}</p>
            </div>
            <div className="bg-[#12281B] p-3 rounded-lg border border-[#27523D]">
              <div className="font-semibold text-white mb-1">What You Learn:</div>
              <p>{linkedChallenge.whatYouCanLearn}</p>
            </div>
          </div>

          {linkedChallenge.optionalExtension && (
            <div className="text-xs text-[#8FA89B] italic border-l-2 border-[#C49B4B] pl-3 py-1">
              <strong>Optional Extension:</strong> {linkedChallenge.optionalExtension}
            </div>
          )}

          {/* Submission CTAs */}
          <div className="pt-4 border-t border-[#27523D] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#8FA89B]">
              Ready to turn this reading into real proof?
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => onOpenSubmit(linkedChallenge.title)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white text-[#163323] text-xs font-bold hover:bg-[#F1F6F3] transition-colors shadow-xs"
              >
                Submit your work →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tags & Report Button */}
      <div className="pt-8 border-t border-[#E5E2D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#57615C]">
          <span className="font-semibold text-[#163323]">Topics:</span>
          {article.tags.map((tag, idx) => (
            <span key={tag} className="text-[#57615C]">
              {tag}{idx < article.tags.length - 1 ? ' ·' : ''}
            </span>
          ))}
        </div>

        <button
          onClick={() => onOpenReportModal('article', article.id, article.title)}
          className="inline-flex items-center gap-1.5 text-xs text-[#7B8681] hover:text-[#163323] transition-colors"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#C49B4B]" />
          <span>Report error or suggestion</span>
        </button>
      </div>

      {/* Related Reading */}
      {relatedArticles.length > 0 && (
        <div className="pt-10 border-t border-[#E5E2D9] space-y-4">
          <h3 className="font-editorial text-2xl font-bold text-[#163323]">
            More from Debloom
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedArticles.map(rel => (
              <div
                key={rel.id}
                onClick={() => onSelectArticle(rel)}
                className="bg-white p-5 rounded-xl border border-[#E5E2D9] hover:border-[#8FA89B] cursor-pointer transition-all group"
              >
                <div className="text-xs text-[#27523D] font-medium mb-1">{rel.category}</div>
                <h4 className="font-editorial text-base font-bold text-[#163323] group-hover:text-[#27523D]">
                  {rel.title}
                </h4>
                <p className="text-xs text-[#57615C] mt-1 line-clamp-2">{rel.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
