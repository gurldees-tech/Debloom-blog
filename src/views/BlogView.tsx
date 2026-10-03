import React, { useState } from 'react';
import { BookOpen, Search, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { Article } from '../types';

interface BlogViewProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  initialCategory?: string;
}

export const BlogView: React.FC<BlogViewProps> = ({
  articles,
  onSelectArticle,
  initialCategory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [search, setSearch] = useState('');

  const published = articles.filter(a => a.status === 'Published');

  const categories = [
    { id: 'all', label: 'All Articles' },
    { id: 'Skills', label: 'Skills' },
    { id: 'University Prep', label: 'University Prep' },
    { id: 'Student Development', label: 'Student Development' },
    { id: 'Career Exploration', label: 'Career Exploration' },
  ];

  const filtered = published.filter(a => {
    const matchCategory = selectedCategory === 'all' || a.category === selectedCategory;
    const query = search.trim().toLowerCase();
    const matchSearch = !query || 
      a.title.toLowerCase().includes(query) || 
      a.excerpt.toLowerCase().includes(query) ||
      a.tags.some(t => t.toLowerCase().includes(query));
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Editorial Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#27523D] font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Debloom Reading Room</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#163323] tracking-tight">
          Practical Guides & Perspectives
        </h1>
        <p className="text-sm sm:text-base text-[#57615C] mt-3 leading-relaxed">
          Thoughtful, actionable writing on developing skills, preparing for tertiary education, 
          and finding legitimate opportunities beyond classroom boundaries.
        </p>
      </div>

      {/* Category Navigation & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between border-y border-[#E5E2D9] py-3">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-[#163323] text-white shadow-xs'
                  : 'text-[#57615C] hover:text-[#163323] hover:bg-[#EFECE1]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#57615C]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E5E2D9] rounded-lg text-[#1F2421] placeholder-[#7B8681] focus:outline-none focus:ring-1 focus:ring-[#163323]"
          />
        </div>
      </div>

      {/* Article Listing */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-white border border-[#E5E2D9] rounded-xl max-w-md mx-auto p-8 space-y-2">
          <p className="font-editorial text-xl text-[#163323] font-semibold">
            🌱 We’re still growing this section.
          </p>
          <p className="text-xs text-[#57615C] leading-relaxed">
            Check back soon for useful, verified resources and articles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(article => (
            <a
              key={article.id}
              href={`/blog/${article.slug}`}
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
                  e.preventDefault();
                  onSelectArticle(article);
                }
              }}
              className="bg-white rounded-xl border border-[#E5E2D9] hover:border-[#8FA89B] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group overflow-hidden block text-inherit no-underline"
            >
              {article.featuredImage && (
                <div className="w-full h-48 bg-[#F7F5EE] overflow-hidden border-b border-[#E5E2D9]">
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).parentElement!.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Clean unboxed metadata with typographic separators */}
                  <div className="flex items-center gap-2 text-xs text-[#57615C] mb-3">
                    <span className="font-semibold text-[#27523D]">{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readingTimeMinutes} min read</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.publishDate}</span>
                  </div>

                  <h2 className="font-editorial text-xl font-bold text-[#163323] group-hover:text-[#27523D] transition-colors leading-snug">
                    {article.title}
                  </h2>

                  <p className="text-xs text-[#57615C] mt-3 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>

                  {article.bloomChallengeId && (
                    <div className="mt-4 pt-2 flex items-center gap-1.5 text-[11px] text-[#27523D] font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-[#C49B4B]" />
                      <span>Includes Bloom Challenge 🌱</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#F1F6F3] flex items-center justify-between text-xs text-[#7B8681]">
                  <span>By {article.author}</span>
                  <span className="font-semibold text-[#163323] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    Read article →
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

    </div>
  );
};
