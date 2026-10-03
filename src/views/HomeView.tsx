import React from 'react';
import { 
  Sprout, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Wrench, 
  BookOpen, 
  Target, 
  Send, 
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Article, Opportunity, Resource, BloomChallenge, SiteSettings } from '../types';

interface HomeViewProps {
  articles: Article[];
  opportunities: Opportunity[];
  resources: Resource[];
  challenges: BloomChallenge[];
  settings: SiteSettings;
  onNavigate: (view: string, param?: string) => void;
  onSelectArticle: (article: Article) => void;
  onSelectChallenge: (challenge: BloomChallenge) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  articles,
  opportunities,
  resources,
  challenges,
  settings,
  onNavigate,
  onSelectArticle,
  onSelectChallenge,
}) => {
  const publishedArticles = articles.filter(a => a.status === 'Published');
  const activeChallenges = challenges.filter(c => c.status === 'Active');
  const verifiedOpportunities = opportunities.filter(o => o.status === 'Verified/Open');

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative pt-8 sm:pt-14 pb-4">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
          
          {/* Subtle quiet kicker without pill badge */}
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#27523D] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#27523D]" />
            <span>Debloom Student Resource Platform</span>
            <span aria-hidden="true" className="text-[#8FA89B]">·</span>
            <span className="text-[#57615C] normal-case font-normal">Nigerian roots, global usefulness</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl text-[#163323] font-bold tracking-tight leading-[1.12]">
            Start where you are.<br className="hidden sm:inline" /> Bloom from there. 🌱
          </h1>

          <p className="mt-5 text-base sm:text-lg text-[#57615C] max-w-2xl mx-auto leading-relaxed">
            Discover skills, opportunities, resources and practical ideas to help you prepare for what's next—without fake claims or overwhelming jargon.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('explore')}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#163323] text-white text-sm font-semibold hover:bg-[#27523D] transition-all shadow-xs flex items-center justify-center gap-2 group"
            >
              <span>Explore Debloom</span>
              <ArrowRight className="w-4 h-4 text-[#8FA89B] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('opportunities')}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white border border-[#DCE7E1] text-[#163323] text-sm font-semibold hover:bg-[#F1F6F3] transition-colors flex items-center justify-center gap-2"
            >
              <span>Find Something Useful</span>
            </button>
          </div>

          {/* Core Philosophy Banner */}
          <div className="mt-12 pt-8 border-t border-[#E5E2D9] max-w-2xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-medium text-[#57615C]">
              <span>Discover</span>
              <span className="text-[#8FA89B]">→</span>
              <span>Learn</span>
              <span className="text-[#8FA89B]">→</span>
              <span>Practise</span>
              <span className="text-[#8FA89B]">→</span>
              <span>Submit</span>
              <span className="text-[#8FA89B]">→</span>
              <span>Improve</span>
              <span className="text-[#8FA89B]">→</span>
              <span className="text-[#163323] font-bold">Grow 🌱</span>
            </div>
            <p className="text-[12px] italic text-[#7B8681] mt-2">
              "Don't just read. Do something with what you learn."
            </p>
          </div>

        </div>
      </section>

      {/* DISCOVERY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#163323]">
            What are you looking for?
          </h2>
          <p className="text-xs sm:text-sm text-[#57615C] mt-2">
            Curated pathways designed to give you clarity and practical next steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* 1. Learn a Skill */}
          <div 
            onClick={() => onNavigate('skills')}
            className="group cursor-pointer bg-white p-5 rounded-xl border border-[#E5E2D9] hover:border-[#27523D] hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#F1F6F3] text-[#27523D] flex items-center justify-center mb-4 group-hover:bg-[#163323] group-hover:text-white transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-[#163323] group-hover:text-[#27523D]">
                Learn a Skill
              </h3>
              <p className="text-xs text-[#57615C] mt-2 leading-relaxed">
                Foundational digital capabilities you can start practicing today with zero spend.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1F6F3] flex items-center text-xs font-semibold text-[#27523D] group-hover:underline">
              <span>Explore guides</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* 2. Find an Opportunity */}
          <div 
            onClick={() => onNavigate('opportunities')}
            className="group cursor-pointer bg-white p-5 rounded-xl border border-[#E5E2D9] hover:border-[#27523D] hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#F1F6F3] text-[#27523D] flex items-center justify-center mb-4 group-hover:bg-[#163323] group-hover:text-white transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-[#163323] group-hover:text-[#27523D]">
                Find an Opportunity
              </h3>
              <p className="text-xs text-[#57615C] mt-2 leading-relaxed">
                Vetted scholarships, internships, and student programs with verified official sources.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1F6F3] flex items-center text-xs font-semibold text-[#27523D] group-hover:underline">
              <span>View verified list</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* 3. Explore Resources */}
          <div 
            onClick={() => onNavigate('resources')}
            className="group cursor-pointer bg-white p-5 rounded-xl border border-[#E5E2D9] hover:border-[#27523D] hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#F1F6F3] text-[#27523D] flex items-center justify-center mb-4 group-hover:bg-[#163323] group-hover:text-white transition-colors">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-[#163323] group-hover:text-[#27523D]">
                Explore Resources
              </h3>
              <p className="text-xs text-[#57615C] mt-2 leading-relaxed">
                Legitimate open-courseware, research aids, and student tools without hidden paywalls.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1F6F3] flex items-center text-xs font-semibold text-[#27523D] group-hover:underline">
              <span>Browse tools</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* 4. Try a Challenge */}
          <div 
            onClick={() => onNavigate('challenges')}
            className="group cursor-pointer bg-white p-5 rounded-xl border border-[#E5E2D9] hover:border-[#27523D] hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#F1F6F3] text-[#27523D] flex items-center justify-center mb-4 group-hover:bg-[#163323] group-hover:text-white transition-colors">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-[#163323] group-hover:text-[#27523D]">
                Try a Challenge 🌱
              </h3>
              <p className="text-xs text-[#57615C] mt-2 leading-relaxed">
                Step-by-step Bloom Challenges designed to turn reading into an authentic portfolio artifact.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1F6F3] flex items-center text-xs font-semibold text-[#27523D] group-hover:underline">
              <span>Take action</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* 5. Read the Blog */}
          <div 
            onClick={() => onNavigate('blog')}
            className="group cursor-pointer bg-white p-5 rounded-xl border border-[#E5E2D9] hover:border-[#27523D] hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#F1F6F3] text-[#27523D] flex items-center justify-center mb-4 group-hover:bg-[#163323] group-hover:text-white transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-base text-[#163323] group-hover:text-[#27523D]">
                Read the Blog
              </h3>
              <p className="text-xs text-[#57615C] mt-2 leading-relaxed">
                Honest guides on university preparation, spotting red flags, and student growth.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#F1F6F3] flex items-center text-xs font-semibold text-[#27523D] group-hover:underline">
              <span>Read articles</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

        </div>
      </section>

      {/* FEATURED REAL ARTICLES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#27523D] mb-1">
              Curated Guides
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#163323]">
              Featured Student Guides
            </h2>
          </div>
          <button
            onClick={() => onNavigate('blog')}
            className="text-xs font-semibold text-[#163323] hover:text-[#27523D] flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>All articles & guides</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {publishedArticles.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E5E2D9] p-8 text-center max-w-lg mx-auto space-y-2">
            <p className="font-editorial text-lg text-[#163323] font-semibold">
              🌱 We’re still growing this section.
            </p>
            <p className="text-xs text-[#57615C] leading-relaxed">
              Check back soon for useful, verified resources and articles.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publishedArticles.slice(0, 3).map((article) => (
              <article
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className="bg-white rounded-xl border border-[#E5E2D9] hover:border-[#8FA89B] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between group overflow-hidden"
              >
                {article.featuredImage && (
                  <div className="w-full h-44 bg-[#F7F5EE] overflow-hidden border-b border-[#E5E2D9]">
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
                      <span className="font-medium text-[#27523D]">{article.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{article.readingTimeMinutes} min read</span>
                    </div>

                    <h3 className="font-editorial text-xl font-bold text-[#163323] group-hover:text-[#27523D] transition-colors leading-snug">
                      {article.title}
                    </h3>

                    <p className="text-xs text-[#57615C] mt-3 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#F1F6F3] flex items-center justify-between text-xs text-[#7B8681]">
                    <span>By {article.author}</span>
                    <span className="font-medium text-[#163323] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Read guide →
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* BLOOM CHALLENGE PREVIEW ("Don't just read. Try it.") */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#163323] text-[#FCFBF7] rounded-2xl p-6 sm:p-10 relative overflow-hidden">
          
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#8FA89B] font-semibold">
              <Target className="w-4 h-4 text-[#8FA89B]" />
              <span>Bloom Challenge 🌱</span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-white leading-tight">
              "Don't just read. Try it."
            </h2>

            <p className="text-sm sm:text-base text-[#DCE7E1] leading-relaxed">
              Every curated Debloom track includes an actionable micro-challenge. 
              Instead of hoarding certificates or passively watching tutorials, complete a 
              straightforward step-by-step task and build proof of capability.
            </p>

            {activeChallenges.length > 0 ? (
              <div className="pt-2">
                <div className="bg-[#12281B] rounded-xl p-4 sm:p-5 border border-[#27523D] max-w-xl">
                  <div className="text-[11px] uppercase tracking-wider text-[#C49B4B] font-semibold">
                    Current Active Challenge
                  </div>
                  <h4 className="text-base font-semibold text-white mt-1">
                    {activeChallenges[0].title}
                  </h4>
                  <p className="text-xs text-[#8FA89B] mt-1 line-clamp-2">
                    {activeChallenges[0].whatYoullDo}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      onClick={() => onSelectChallenge(activeChallenges[0])}
                      className="px-4 py-2 bg-white text-[#163323] rounded-lg text-xs font-semibold hover:bg-[#F1F6F3] transition-colors"
                    >
                      View Steps & Submit Work →
                    </button>
                    <button
                      onClick={() => onNavigate('challenges')}
                      className="text-xs text-[#DCE7E1] hover:text-white underline underline-offset-4"
                    >
                      All Challenges
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <div className="bg-[#12281B] rounded-xl p-5 border border-[#27523D] max-w-xl space-y-1.5">
                  <div className="text-[11px] uppercase tracking-wider text-[#C49B4B] font-semibold">
                    Bloom Challenge 🌱
                  </div>
                  <h4 className="text-base font-semibold text-white font-editorial">
                    🌱 We’re still growing this section.
                  </h4>
                  <p className="text-xs text-[#8FA89B] leading-relaxed">
                    Check back soon for useful, verified resources and challenges.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-[#27523D] flex flex-wrap items-center justify-between gap-4 text-xs text-[#8FA89B]">
            <span>Submit your completed challenge to get reviewed and potentially recognized in Bloom of the Week.</span>
            <button 
              onClick={() => onNavigate('submit')}
              className="text-[#C49B4B] hover:underline font-medium"
            >
              Submit an entry directly →
            </button>
          </div>

        </div>
      </section>

      {/* TELEGRAM COMPANION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF2DC] border border-[#E5E2D9] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B88A3B]">
              <Send className="w-3.5 h-3.5 text-[#B88A3B]" />
              <span>Quick-Access Companion</span>
            </div>
            <h3 className="font-editorial text-2xl font-bold text-[#163323]">
              Join the Debloom Telegram
            </h3>
            <p className="text-xs sm:text-sm text-[#57615C] leading-relaxed">
              We use Telegram for fast updates: new article notifications, deadline alerts, quick skill tips, new challenges, and verified resource links directly to your phone.
            </p>
          </div>
          <div className="shrink-0 w-full sm:w-auto">
            <a
              href={settings.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#163323] text-white text-sm font-semibold hover:bg-[#27523D] transition-all shadow-xs"
            >
              <Send className="w-4 h-4 text-[#8FA89B]" />
              <span>Join Channel {settings.telegramChannelName}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#8FA89B]" />
            </a>
          </div>
        </div>
      </section>

      {/* TRUST SECTION (ABSOLUTE CONTENT INTEGRITY) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="p-6 sm:p-8 bg-white border border-[#E5E2D9] rounded-2xl space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#E2ECE5] text-[#27523D] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-5 h-5 text-[#27523D]" />
          </div>
          
          <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#163323]">
            "We'd rather publish fewer useful things than fill the site with information we haven't checked."
          </h3>

          <p className="text-xs sm:text-sm text-[#57615C] max-w-xl mx-auto leading-relaxed">
            Every scholarship link, open-source program, and learning tool on Debloom goes through direct manual verification. We do not invent fake partners, manufactured statistics, or paid sponsored placements.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('about')}
              className="text-xs font-semibold text-[#27523D] hover:underline"
            >
              Learn about our verification standards & philosophy →
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
