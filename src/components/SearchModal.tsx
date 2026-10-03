import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, Compass, Wrench, Target, ArrowRight } from 'lucide-react';
import { Article, Opportunity, Resource, BloomChallenge } from '../types';
import { analyticsService } from '../services/storage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  opportunities: Opportunity[];
  resources: Resource[];
  challenges: BloomChallenge[];
  onSelectResult: (type: 'article' | 'opportunity' | 'resource' | 'challenge', item: any) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  articles,
  opportunities,
  resources,
  challenges,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const filteredArticles = trimmed ? articles.filter(a => 
    a.title.toLowerCase().includes(trimmed) || 
    a.excerpt.toLowerCase().includes(trimmed) ||
    a.tags.some(t => t.toLowerCase().includes(trimmed)) ||
    a.category.toLowerCase().includes(trimmed)
  ) : [];

  const filteredOpportunities = trimmed ? opportunities.filter(o =>
    o.title.toLowerCase().includes(trimmed) ||
    o.organizer.toLowerCase().includes(trimmed) ||
    o.description.toLowerCase().includes(trimmed) ||
    o.category.toLowerCase().includes(trimmed) ||
    o.countryRegion.toLowerCase().includes(trimmed)
  ) : [];

  const filteredResources = trimmed ? resources.filter(r =>
    r.name.toLowerCase().includes(trimmed) ||
    r.description.toLowerCase().includes(trimmed) ||
    r.category.toLowerCase().includes(trimmed)
  ) : [];

  const filteredChallenges = trimmed ? challenges.filter(c =>
    c.title.toLowerCase().includes(trimmed) ||
    c.whatYoullDo.toLowerCase().includes(trimmed) ||
    c.whatYouCanLearn.toLowerCase().includes(trimmed)
  ) : [];

  const totalResults = 
    filteredArticles.length + 
    filteredOpportunities.length + 
    filteredResources.length + 
    filteredChallenges.length;

  const handleSelect = (type: 'article' | 'opportunity' | 'resource' | 'challenge', item: any) => {
    if (trimmed) {
      analyticsService.logEvent('search_query', `${type}:${item.title || item.name} (query: ${trimmed})`);
    }
    onSelectResult(type, item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#12281B]/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-[#FCFBF7] rounded-xl shadow-2xl border border-[#E5E2D9] overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#E5E2D9] bg-white gap-3">
          <Search className="w-5 h-5 text-[#57615C] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, skills, opportunities, resources, challenges..."
            className="w-full bg-transparent text-sm sm:text-base text-[#1F2421] placeholder-[#7B8681] focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-xs text-[#7B8681] hover:text-[#1F2421] px-1"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#7B8681] hover:text-[#1F2421] hover:bg-[#EFECE1] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-6 flex-1">
          {!trimmed ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[#57615C]">
                Type keywords like <span className="font-semibold text-[#163323]">"Python"</span>, <span className="font-semibold text-[#163323]">"Scholarship"</span>, <span className="font-semibold text-[#163323]">"Portfolio"</span>, or <span className="font-semibold text-[#163323]">"Challenge"</span>.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-[#57615C]">
                <button onClick={() => setQuery('Skills')} className="px-2.5 py-1 bg-white border border-[#E5E2D9] rounded-md hover:bg-[#F1F6F3]">
                  Skills
                </button>
                <button onClick={() => setQuery('Scholarship')} className="px-2.5 py-1 bg-white border border-[#E5E2D9] rounded-md hover:bg-[#F1F6F3]">
                  Scholarships
                </button>
                <button onClick={() => setQuery('Portfolio')} className="px-2.5 py-1 bg-white border border-[#E5E2D9] rounded-md hover:bg-[#F1F6F3]">
                  Portfolio
                </button>
                <button onClick={() => setQuery('Free')} className="px-2.5 py-1 bg-white border border-[#E5E2D9] rounded-md hover:bg-[#F1F6F3]">
                  Free Resources
                </button>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center">
              <p className="font-editorial text-lg text-[#163323] font-medium">
                No results found for "{query}". 🌱
              </p>
              <p className="text-xs text-[#57615C] mt-1 max-w-sm mx-auto">
                We'd rather publish fewer useful things than show irrelevant matches. Try a different keyword or check our categories.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Articles & Guides */}
              {filteredArticles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#57615C]">
                    <BookOpen className="w-3.5 h-3.5 text-[#27523D]" />
                    <span>Articles & Guides ({filteredArticles.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredArticles.map(article => (
                      <button
                        key={article.id}
                        onClick={() => handleSelect('article', article)}
                        className="w-full text-left p-3 rounded-lg bg-white border border-[#E5E2D9] hover:border-[#8FA89B] hover:bg-[#F1F6F3] transition-all group block"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="text-sm font-semibold text-[#163323] group-hover:text-[#27523D]">
                            {article.title}
                          </h4>
                          <span className="text-[11px] text-[#7B8681] shrink-0">{article.readingTimeMinutes}m read</span>
                        </div>
                        <p className="text-xs text-[#57615C] line-clamp-1 mt-0.5">
                          {article.excerpt}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Opportunities */}
              {filteredOpportunities.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#57615C]">
                    <Compass className="w-3.5 h-3.5 text-[#27523D]" />
                    <span>Opportunities ({filteredOpportunities.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredOpportunities.map(opp => (
                      <button
                        key={opp.id}
                        onClick={() => handleSelect('opportunity', opp)}
                        className="w-full text-left p-3 rounded-lg bg-white border border-[#E5E2D9] hover:border-[#8FA89B] hover:bg-[#F1F6F3] transition-all group block"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="text-sm font-semibold text-[#163323] group-hover:text-[#27523D]">
                            {opp.title}
                          </h4>
                          <span className="text-[11px] text-[#27523D] font-medium shrink-0">{opp.category}</span>
                        </div>
                        <p className="text-xs text-[#57615C] mt-0.5">
                          By {opp.organizer} · {opp.cost} · Region: {opp.countryRegion}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {filteredResources.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#57615C]">
                    <Wrench className="w-3.5 h-3.5 text-[#27523D]" />
                    <span>Curated Resources ({filteredResources.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredResources.map(res => (
                      <button
                        key={res.id}
                        onClick={() => handleSelect('resource', res)}
                        className="w-full text-left p-3 rounded-lg bg-white border border-[#E5E2D9] hover:border-[#8FA89B] hover:bg-[#F1F6F3] transition-all group block"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="text-sm font-semibold text-[#163323] group-hover:text-[#27523D]">
                            {res.name}
                          </h4>
                          <span className="text-[11px] text-[#7B8681] shrink-0">{res.cost}</span>
                        </div>
                        <p className="text-xs text-[#57615C] line-clamp-1 mt-0.5">
                          {res.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Challenges */}
              {filteredChallenges.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#57615C]">
                    <Target className="w-3.5 h-3.5 text-[#27523D]" />
                    <span>Bloom Challenges 🌱 ({filteredChallenges.length})</span>
                  </div>
                  <div className="space-y-1">
                    {filteredChallenges.map(chal => (
                      <button
                        key={chal.id}
                        onClick={() => handleSelect('challenge', chal)}
                        className="w-full text-left p-3 rounded-lg bg-white border border-[#E5E2D9] hover:border-[#8FA89B] hover:bg-[#F1F6F3] transition-all group block"
                      >
                        <h4 className="text-sm font-semibold text-[#163323] group-hover:text-[#27523D]">
                          {chal.title}
                        </h4>
                        <p className="text-xs text-[#57615C] line-clamp-1 mt-0.5">
                          {chal.whatYoullDo}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[#F7F5EE] border-t border-[#E5E2D9] flex items-center justify-between text-[11px] text-[#7B8681]">
          <span>Press ESC or click anywhere outside to close</span>
          <span>Verified Debloom Database</span>
        </div>
      </div>
    </div>
  );
};
