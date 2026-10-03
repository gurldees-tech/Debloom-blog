import React, { useState, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  Compass, 
  Wrench, 
  Target, 
  Filter, 
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Article, Opportunity, Resource, BloomChallenge } from '../types';

interface ExploreViewProps {
  articles: Article[];
  opportunities: Opportunity[];
  resources: Resource[];
  challenges: BloomChallenge[];
  onSelectArticle: (article: Article) => void;
  onSelectOpportunity: (opp: Opportunity) => void;
  onSelectResource: (res: Resource) => void;
  onSelectChallenge: (chal: BloomChallenge) => void;
  onOpenReportModal: (type: 'opportunity' | 'resource' | 'article', id: string, title: string) => void;
}

type ContentTypeFilter = 'all' | 'skills' | 'opportunities' | 'resources' | 'challenges' | 'blog';

export const ExploreView: React.FC<ExploreViewProps> = ({
  articles,
  opportunities,
  resources,
  challenges,
  onSelectArticle,
  onSelectOpportunity,
  onSelectResource,
  onSelectChallenge,
  onOpenReportModal
}) => {
  const [activeType, setActiveType] = useState<ContentTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  const publishedArticles = useMemo(() => articles.filter(a => a.status === 'Published'), [articles]);
  const verifiedOpportunities = useMemo(() => opportunities.filter(o => o.status === 'Verified/Open' || o.status === 'Closing Soon'), [opportunities]);
  const activeResources = useMemo(() => resources.filter(r => r.status === 'Published'), [resources]);
  const activeChallenges = useMemo(() => challenges.filter(c => c.status === 'Active'), [challenges]);

  // Combined search and filtering
  const query = searchQuery.trim().toLowerCase();

  const filteredArticles = useMemo(() => {
    return publishedArticles.filter(a => {
      const matchQuery = !query || 
        a.title.toLowerCase().includes(query) || 
        a.excerpt.toLowerCase().includes(query) ||
        a.tags.some(t => t.toLowerCase().includes(query));
      return matchQuery;
    });
  }, [publishedArticles, query]);

  const filteredOpportunities = useMemo(() => {
    return verifiedOpportunities.filter(o => {
      const matchQuery = !query ||
        o.title.toLowerCase().includes(query) ||
        o.organizer.toLowerCase().includes(query) ||
        o.description.toLowerCase().includes(query);
      const matchRegion = selectedRegion === 'all' || 
        (selectedRegion === 'global' && o.countryRegion.toLowerCase().includes('global')) ||
        (selectedRegion === 'nigeria' && (o.countryRegion.toLowerCase().includes('nigeria') || o.countryRegion.toLowerCase().includes('africa') || o.countryRegion.toLowerCase().includes('global')));
      return matchQuery && matchRegion;
    });
  }, [verifiedOpportunities, query, selectedRegion]);

  const filteredResources = useMemo(() => {
    return activeResources.filter(r => {
      const matchQuery = !query ||
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query);
      return matchQuery;
    });
  }, [activeResources, query]);

  const filteredChallenges = useMemo(() => {
    return activeChallenges.filter(c => {
      const matchQuery = !query ||
        c.title.toLowerCase().includes(query) ||
        c.whatYoullDo.toLowerCase().includes(query);
      return matchQuery;
    });
  }, [activeChallenges, query]);

  const shouldShowArticles = activeType === 'all' || activeType === 'blog' || activeType === 'skills';
  const shouldShowOpportunities = activeType === 'all' || activeType === 'opportunities';
  const shouldShowResources = activeType === 'all' || activeType === 'resources';
  const shouldShowChallenges = activeType === 'all' || activeType === 'challenges';

  const totalResults = 
    (shouldShowArticles ? filteredArticles.length : 0) +
    (shouldShowOpportunities ? filteredOpportunities.length : 0) +
    (shouldShowResources ? filteredResources.length : 0) +
    (shouldShowChallenges ? filteredChallenges.length : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Title Header */}
      <div className="max-w-3xl">
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#163323] tracking-tight">
          Explore Debloom
        </h1>
        <p className="text-sm sm:text-base text-[#57615C] mt-2">
          Discover verified opportunities, practical skill guides, student resources, and challenges.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Main search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#57615C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, skill, program, organizer, or tool..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E2D9] rounded-lg text-sm text-[#1F2421] placeholder-[#7B8681] focus:outline-none focus:ring-1 focus:ring-[#163323] transition-all"
            />
          </div>

          {/* Region selector if searching opportunities */}
          <div className="flex items-center gap-2">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2.5 bg-white border border-[#E5E2D9] rounded-lg text-xs font-medium text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#163323]"
            >
              <option value="all">All Regions</option>
              <option value="global">Global Only</option>
              <option value="nigeria">Nigeria & Africa Eligible</option>
            </select>
          </div>

        </div>

        {/* Content Type Filter Bar (Segmented Button Controls) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Content' },
            { id: 'skills', label: 'Skills & Guides' },
            { id: 'opportunities', label: 'Opportunities' },
            { id: 'resources', label: 'Resources' },
            { id: 'challenges', label: 'Bloom Challenges 🌱' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id as ContentTypeFilter)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                activeType === type.id
                  ? 'bg-[#163323] text-white shadow-xs'
                  : 'bg-white text-[#57615C] border border-[#E5E2D9] hover:bg-[#F1F6F3]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-[#57615C] pt-2 border-t border-[#E5E2D9]">
        <span>Showing {totalResults} verified {totalResults === 1 ? 'item' : 'items'}</span>
        {query && (
          <button 
            onClick={() => setSearchQuery('')}
            className="text-xs text-[#27523D] hover:underline"
          >
            Clear search
          </button>
        )}
      </div>

      {/* CONTENT LISTING */}
      {totalResults === 0 ? (
        <div className="py-16 text-center bg-white border border-[#E5E2D9] rounded-xl max-w-lg mx-auto p-8 space-y-2">
          <p className="font-editorial text-xl text-[#163323] font-semibold">
            🌱 We’re still growing this section.
          </p>
          <p className="text-xs text-[#57615C] max-w-sm mx-auto leading-relaxed">
            Check back soon for useful, verified resources and articles.
          </p>
          {(searchQuery || activeType !== 'all' || selectedRegion !== 'all') && (
            <div className="pt-2">
              <button
                onClick={() => { setSearchQuery(''); setActiveType('all'); setSelectedRegion('all'); }}
                className="px-4 py-2 bg-[#163323] text-white text-xs font-semibold rounded-lg hover:bg-[#27523D] transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Opportunities Section */}
          {shouldShowOpportunities && filteredOpportunities.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-2">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#27523D]" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#163323]">
                    Verified Opportunities ({filteredOpportunities.length})
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="bg-white p-5 rounded-xl border border-[#E5E2D9] hover:border-[#8FA89B] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#57615C] mb-2">
                        <span className="font-medium text-[#27523D]">{opp.category}</span>
                        <span>Region: {opp.countryRegion}</span>
                      </div>

                      <h3 
                        onClick={() => onSelectOpportunity(opp)}
                        className="font-editorial text-lg font-bold text-[#163323] hover:text-[#27523D] cursor-pointer"
                      >
                        {opp.title}
                      </h3>

                      <p className="text-xs text-[#7B8681] mt-0.5 font-medium">
                        By {opp.organizer}
                      </p>

                      <p className="text-xs text-[#57615C] mt-2 line-clamp-2 leading-relaxed">
                        {opp.description}
                      </p>

                      <div className="mt-3 py-2 px-3 bg-[#F7F5EE] rounded-lg text-xs space-y-1 text-[#57615C]">
                        <div><strong className="text-[#1F2421]">Deadline:</strong> {opp.deadline}</div>
                        <div><strong className="text-[#1F2421]">Cost:</strong> {opp.cost}</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F1F6F3] flex items-center justify-between text-xs">
                      <button
                        onClick={() => onSelectOpportunity(opp)}
                        className="font-semibold text-[#163323] hover:text-[#27523D]"
                      >
                        View Full Details →
                      </button>

                      <button
                        onClick={() => onOpenReportModal('opportunity', opp.id, opp.title)}
                        className="text-[11px] text-[#7B8681] hover:text-[#1F2421] hover:underline"
                      >
                        Report error
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Articles & Skills Section */}
          {shouldShowArticles && filteredArticles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#27523D]" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#163323]">
                    Guides & Skills ({filteredArticles.length})
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {filteredArticles.map((article) => (
                  <article
                    key={article.id}
                    onClick={() => onSelectArticle(article)}
                    className="bg-white p-5 rounded-xl border border-[#E5E2D9] hover:border-[#8FA89B] transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#57615C] mb-2">
                        <span className="font-medium text-[#27523D]">{article.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{article.readingTimeMinutes}m read</span>
                      </div>

                      <h3 className="font-editorial text-lg font-bold text-[#163323] group-hover:text-[#27523D] leading-snug">
                        {article.title}
                      </h3>

                      <p className="text-xs text-[#57615C] mt-2 line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F1F6F3] flex items-center justify-between text-xs text-[#7B8681]">
                      <span>{article.author}</span>
                      <span className="font-semibold text-[#163323] group-hover:translate-x-0.5 transition-transform">
                        Read →
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Resources Section */}
          {shouldShowResources && filteredResources.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-2">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#27523D]" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#163323]">
                    Curated Resources ({filteredResources.length})
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white p-5 rounded-xl border border-[#E5E2D9] hover:border-[#8FA89B] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#57615C] mb-2">
                        <span className="font-medium text-[#27523D]">{res.category}</span>
                        <span className="text-[#1F2421] font-semibold">{res.cost}</span>
                      </div>

                      <h3 
                        onClick={() => onSelectResource(res)}
                        className="font-editorial text-lg font-bold text-[#163323] hover:text-[#27523D] cursor-pointer"
                      >
                        {res.name}
                      </h3>

                      <p className="text-xs text-[#57615C] mt-2 leading-relaxed">
                        {res.description}
                      </p>

                      {res.limitations && (
                        <p className="text-[11px] text-[#7B8681] mt-2 italic">
                          Note: {res.limitations}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F1F6F3] flex items-center justify-between text-xs">
                      <a
                        href={res.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#163323] hover:text-[#27523D] flex items-center gap-1"
                      >
                        <span>Official Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => onOpenReportModal('resource', res.id, res.name)}
                        className="text-[11px] text-[#7B8681] hover:text-[#1F2421] hover:underline"
                      >
                        Report error
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bloom Challenges Section */}
          {shouldShowChallenges && filteredChallenges.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#27523D]" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#163323]">
                    Active Bloom Challenges 🌱 ({filteredChallenges.length})
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredChallenges.map((chal) => (
                  <div
                    key={chal.id}
                    onClick={() => onSelectChallenge(chal)}
                    className="bg-[#163323] text-[#FCFBF7] p-6 rounded-xl border border-[#27523D] hover:border-[#8FA89B] transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-[#8FA89B] font-semibold mb-1">
                        Bloom Challenge · {chal.difficulty}
                      </div>

                      <h3 className="font-editorial text-xl font-bold text-white group-hover:text-[#DCE7E1]">
                        {chal.title}
                      </h3>

                      <p className="text-xs text-[#DCE7E1] mt-2 line-clamp-2 leading-relaxed">
                        {chal.whatYoullDo}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#27523D] flex items-center justify-between text-xs text-[#8FA89B]">
                      <span>{chal.steps.length} Steps</span>
                      <span className="font-semibold text-white group-hover:underline flex items-center gap-1">
                        Start Challenge →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
