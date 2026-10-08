/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Article, 
  Opportunity, 
  Resource, 
  BloomChallenge, 
  BloomOfTheWeek, 
  SiteSettings, 
  UserSubmission, 
  ContentReport, 
  Writer, 
  AuthUser,
  SubmissionType
} from './types';
import { 
  initializeStorage, 
  articleService, 
  opportunityService, 
  resourceService, 
  challengeService, 
  bloomOfWeekService, 
  submissionService, 
  reportService, 
  writerService, 
  settingsService, 
  authService,
  analyticsService
} from './services/storage';

// Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { ReportModal } from './components/ReportModal';
import { NotificationToast } from './components/NotificationToast';

// Views
import { HomeView } from './views/HomeView';
import { ExploreView } from './views/ExploreView';
import { BlogView } from './views/BlogView';
import { ArticleDetailView } from './views/ArticleDetailView';
import { OpportunitiesView } from './views/OpportunitiesView';
import { OpportunityDetailView } from './views/OpportunityDetailView';
import { ResourcesView } from './views/ResourcesView';
import { ChallengesView } from './views/ChallengesView';
import { SubmitView } from './views/SubmitView';
import { AboutView } from './views/AboutView';
import { ContactView } from './views/ContactView';

// Admin CMS
import { AdminDashboard } from './views/admin/AdminDashboard';
import { AdminLoginModal } from './views/admin/AdminLoginModal';
import { AdminLoginView } from './views/admin/AdminLoginView';

// Helper to parse initial route from URL
function parseInitialPath(): { view: string; slug: string | null } {
  if (typeof window === 'undefined') return { view: 'home', slug: null };
  const pathname = window.location.pathname;

  if (pathname.startsWith('/blog/')) {
    const slug = pathname.replace(/^\/blog\//, '').split('/')[0].trim();
    if (slug) {
      return { view: 'article-detail', slug };
    }
    return { view: 'blog', slug: null };
  }

  if (pathname.startsWith('/opportunities/')) {
    const slug = pathname.replace(/^\/opportunities\//, '').split('/')[0].trim();
    if (slug) {
      return { view: 'opportunity-detail', slug };
    }
    return { view: 'opportunities', slug: null };
  }

  if (pathname.startsWith('/resources/')) {
    const slug = pathname.replace(/^\/resources\//, '').split('/')[0].trim();
    if (slug) {
      return { view: 'resources', slug };
    }
    return { view: 'resources', slug: null };
  }

  if (pathname.startsWith('/challenges/')) {
    const slug = pathname.replace(/^\/challenges\//, '').split('/')[0].trim();
    if (slug) {
      return { view: 'challenges', slug };
    }
    return { view: 'challenges', slug: null };
  }

  const p = pathname.replace(/^\//, '').toLowerCase().trim();
  if (p === 'admin') return { view: 'admin', slug: null };
  if (p === 'explore') return { view: 'explore', slug: null };
  if (p === 'blog' || p === 'skills') return { view: 'blog', slug: null };
  if (p === 'opportunities') return { view: 'opportunities', slug: null };
  if (p === 'resources') return { view: 'resources', slug: null };
  if (p === 'challenges') return { view: 'challenges', slug: null };
  if (p === 'about') return { view: 'about', slug: null };
  if (p === 'contact') return { view: 'contact', slug: null };
  if (p === 'submit') return { view: 'submit', slug: null };
  return { view: 'home', slug: null };
}

export default function App() {
  const initialRoute = parseInitialPath();

  // Application State initialized from URL pathname if applicable
  const [currentView, setCurrentView] = useState<string>(initialRoute.view);
  const [requestedSlug, setRequestedSlug] = useState<string | null>(initialRoute.slug);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(() => {
    if (initialRoute.view === 'article-detail' && initialRoute.slug) {
      return articleService.getBySlug(initialRoute.slug) || null;
    }
    return null;
  });
  const [isArticleLoading, setIsArticleLoading] = useState<boolean>(() => {
    return initialRoute.view === 'article-detail' && !!initialRoute.slug && !articleService.getBySlug(initialRoute.slug);
  });
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(() => {
    if (initialRoute.view === 'opportunity-detail' && initialRoute.slug) {
      return opportunityService.getBySlug(initialRoute.slug) || null;
    }
    return null;
  });
  const [isOpportunityLoading, setIsOpportunityLoading] = useState<boolean>(() => {
    return initialRoute.view === 'opportunity-detail' && !!initialRoute.slug && !opportunityService.getBySlug(initialRoute.slug);
  });
  const [submitChallengeTitle, setSubmitChallengeTitle] = useState<string>('');
  
  // Data State
  const [articles, setArticles] = useState<Article[]>(() => articleService.getAll(true));
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => opportunityService.getAll(true));
  const [resources, setResources] = useState<Resource[]>(() => resourceService.getAll(true));
  const [challenges, setChallenges] = useState<BloomChallenge[]>(() => challengeService.getAll(true));
  const [bloomOfTheWeek, setBloomOfTheWeek] = useState<BloomOfTheWeek>(() => bloomOfWeekService.get());
  const [settings, setSettings] = useState<SiteSettings>(() => settingsService.get());
  const [submissions, setSubmissions] = useState<UserSubmission[]>(() => submissionService.getAll());
  const [reports, setReports] = useState<ContentReport[]>(() => reportService.getAll());
  const [writers, setWriters] = useState<Writer[]>(() => writerService.getAll());
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  // UI Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Report Modal Data
  const [reportModalData, setReportModalData] = useState<{
    isOpen: boolean;
    type: 'opportunity' | 'resource' | 'article';
    id: string;
    title: string;
  }>({
    isOpen: false,
    type: 'opportunity',
    id: '',
    title: ''
  });

  // Reload data from storage
  const refreshData = useCallback(() => {
    setArticles(articleService.getAll(true));
    setOpportunities(opportunityService.getAll(true));
    setResources(resourceService.getAll(true));
    setChallenges(challengeService.getAll(true));
    setBloomOfTheWeek(bloomOfWeekService.get());
    setSettings(settingsService.get());
    setSubmissions(submissionService.getAll());
    setReports(reportService.getAll());
    setWriters(writerService.getAll());
    setCurrentUser(authService.getCurrentUser());
  }, []);

  // Initialize storage and check session with backend
  useEffect(() => {
    initializeStorage();
    authService.checkSession().then(user => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      refreshData();
    });

    const handleSync = () => {
      refreshData();
    };
    window.addEventListener('debloom-data-synced', handleSync);
    return () => window.removeEventListener('debloom-data-synced', handleSync);
  }, [refreshData]);

  // Load article by slug directly from server if not found in initial memory
  useEffect(() => {
    if (currentView === 'article-detail' && requestedSlug && !selectedArticle) {
      setIsArticleLoading(true);
      articleService.fetchBySlug(requestedSlug).then((art) => {
        setSelectedArticle(art);
        setIsArticleLoading(false);
      });
    }
  }, [currentView, requestedSlug, selectedArticle]);

  // Load opportunity by slug directly from server if not found in initial memory
  useEffect(() => {
    if (currentView === 'opportunity-detail' && requestedSlug && !selectedOpportunity) {
      setIsOpportunityLoading(true);
      opportunityService.fetchBySlug(requestedSlug).then((opp) => {
        setSelectedOpportunity(opp);
        setIsOpportunityLoading(false);
      });
    }
  }, [currentView, requestedSlug, selectedOpportunity]);

  // Ensure browser address bar updates to canonical slug if legacy numeric or ID URL was visited
  useEffect(() => {
    if (currentView === 'article-detail' && selectedArticle && selectedArticle.slug) {
      const canonicalPath = `/blog/${selectedArticle.slug}`;
      if (typeof window !== 'undefined' && window.location.pathname !== canonicalPath) {
        window.history.replaceState(null, '', canonicalPath);
      }
    }
  }, [currentView, selectedArticle]);

  useEffect(() => {
    if (currentView === 'opportunity-detail' && selectedOpportunity) {
      const canonicalSlug = selectedOpportunity.slug || selectedOpportunity.id;
      const canonicalPath = `/opportunities/${canonicalSlug}`;
      if (typeof window !== 'undefined' && window.location.pathname !== canonicalPath) {
        window.history.replaceState(null, '', canonicalPath);
      }
    }
  }, [currentView, selectedOpportunity]);

  // Browser Back/Forward navigation listener
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseInitialPath();
      if (parsed.view === 'article-detail' && parsed.slug) {
        setRequestedSlug(parsed.slug);
        setSelectedOpportunity(null);
        const art = articleService.getBySlug(parsed.slug);
        setSelectedArticle(art || null);
        if (!art) {
          setIsArticleLoading(true);
          articleService.fetchBySlug(parsed.slug).then((fetched) => {
            setSelectedArticle(fetched);
            setIsArticleLoading(false);
          });
        }
      } else if (parsed.view === 'opportunity-detail' && parsed.slug) {
        setRequestedSlug(parsed.slug);
        setSelectedArticle(null);
        const opp = opportunityService.getBySlug(parsed.slug);
        setSelectedOpportunity(opp || null);
        if (!opp) {
          setIsOpportunityLoading(true);
          opportunityService.fetchBySlug(parsed.slug).then((fetched) => {
            setSelectedOpportunity(fetched);
            setIsOpportunityLoading(false);
          });
        }
      } else {
        setSelectedArticle(null);
        setSelectedOpportunity(null);
        setRequestedSlug(null);
      }
      setCurrentView(parsed.view);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronize document title and canonical meta for SEO
  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://debloom.org';
    let title = 'Debloom | Skills, Opportunities & Resources for Students';
    let desc = 'Discover useful skills, opportunities, resources, practical guides and challenges for students. Start where you are. Bloom from there. 🌱';
    let canonical = `${origin}/`;

    if (currentView === 'article-detail' && selectedArticle) {
      title = `${selectedArticle.seoTitle || selectedArticle.title} – Debloom 🌱`;
      desc = selectedArticle.metaDescription || selectedArticle.excerpt || desc;
      canonical = `${origin}/blog/${selectedArticle.slug}`;
    } else if (currentView === 'opportunity-detail' && selectedOpportunity) {
      title = `${selectedOpportunity.seoTitle || selectedOpportunity.title} – Debloom 🌱`;
      desc = selectedOpportunity.metaDescription || selectedOpportunity.description?.slice(0, 155) || desc;
      canonical = `${origin}/opportunities/${selectedOpportunity.slug || selectedOpportunity.id}`;
    } else if (currentView === 'explore') {
      title = 'Explore Verified Opportunities & Guides – Debloom 🌱';
      canonical = `${origin}/explore`;
    } else if (currentView === 'opportunities') {
      title = 'Verified Student Opportunities & Scholarships – Debloom 🌱';
      canonical = `${origin}/opportunities`;
    } else if (currentView === 'resources') {
      title = 'Curated Student Tools & Free Learning Resources – Debloom 🌱';
      canonical = `${origin}/resources`;
    } else if (currentView === 'challenges') {
      title = 'Bloom Challenges: Practical Student Tasks – Debloom 🌱';
      canonical = `${origin}/challenges`;
    } else if (currentView === 'blog' || currentView === 'skills') {
      title = 'Debloom Guides & Practical Skills – Debloom 🌱';
      canonical = `${origin}/blog`;
    } else if (currentView === 'submit') {
      title = 'Submit to Debloom: Opportunities, Tools & Challenge Entries 🌱';
      canonical = `${origin}/submit`;
    } else if (currentView === 'about') {
      title = 'About Debloom – Student Platform by Debbie 🌱';
      desc = 'Debloom is a student-focused platform created by Debbie to help young people discover useful knowledge, practical skills, and opportunities beyond the classroom.';
      canonical = `${origin}/about`;
    } else if (currentView === 'admin') {
      title = 'Debloom CMS Admin Center';
    }

    document.title = title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', desc);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', desc);
    }
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', title);
    }
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) {
      twitterDesc.setAttribute('content', desc);
    }
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonical);
  }, [currentView, selectedArticle, selectedOpportunity]);

  // Global keyboard shortcuts (Cmd+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation router
  const handleNavigate = (view: string, param?: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view === 'skills') {
      setCurrentView('blog');
      setSelectedArticle(null);
      setRequestedSlug(null);
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState(null, '', '/blog');
      }
      return;
    }
    if (view === 'article-detail' && param) {
      const art = articles.find(a => a.slug === param || a.id === param);
      setRequestedSlug(param);
      setSelectedOpportunity(null);
      setSelectedArticle(art || null);
      setCurrentView('article-detail');
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState(null, '', `/blog/${art ? art.slug : param}`);
      }
      return;
    }
    if (view === 'opportunity-detail' && param) {
      const opp = opportunities.find(o => (o.slug || '').toLowerCase() === param.toLowerCase() || o.id === param);
      setRequestedSlug(param);
      setSelectedArticle(null);
      setSelectedOpportunity(opp || null);
      setCurrentView('opportunity-detail');
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState(null, '', `/opportunities/${opp ? (opp.slug || opp.id) : param}`);
      }
      return;
    }

    setSelectedArticle(null);
    setSelectedOpportunity(null);
    setRequestedSlug(null);
    setCurrentView(view);
    if (typeof window !== 'undefined' && window.history) {
      const targetPath = view === 'home' ? '/' : `/${view}`;
      window.history.pushState(null, '', targetPath);
    }
  };

  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    setRequestedSlug(article.slug);
    setCurrentView('article-detail');
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState(null, '', `/blog/${article.slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToBlog = () => {
    setSelectedArticle(null);
    setRequestedSlug(null);
    setCurrentView('blog');
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState(null, '', '/blog');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOpportunity = (opportunity: Opportunity) => {
    setSelectedOpportunity(opportunity);
    const targetSlug = opportunity.slug || opportunity.id;
    setRequestedSlug(targetSlug);
    setCurrentView('opportunity-detail');
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState(null, '', `/opportunities/${targetSlug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToOpportunities = () => {
    setSelectedOpportunity(null);
    setRequestedSlug(null);
    setCurrentView('opportunities');
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState(null, '', '/opportunities');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectChallenge = (challenge: BloomChallenge) => {
    setCurrentView('challenges');
  };

  const handleOpenSubmit = (challengeTitle?: string) => {
    setSubmitChallengeTitle(challengeTitle || '');
    setCurrentView('submit');
  };

  const handleOpenReportModal = (
    type: 'opportunity' | 'resource' | 'article',
    id: string,
    title: string
  ) => {
    setReportModalData({
      isOpen: true,
      type,
      id,
      title
    });
  };

  const handleSearchResult = (type: string, item: any) => {
    if (type === 'article') {
      handleSelectArticle(item);
    } else if (type === 'opportunity') {
      handleSelectOpportunity(item);
    } else if (type === 'resource') {
      setCurrentView('resources');
    } else if (type === 'challenge') {
      setCurrentView('challenges');
    }
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    refreshData();
    setCurrentView('admin');
    setToastMessage(`Welcome to Debloom CMS, ${user.name}! 🌱`);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    refreshData();
    setCurrentView('home');
    setToastMessage('Signed out of Debloom CMS.');
  };

  // If in admin view and user is authenticated
  if (currentView === 'admin' && currentUser) {
    return (
      <div className="min-h-screen bg-[#F7F5EE] flex flex-col font-sans">
        <AdminDashboard
          currentUser={currentUser}
          articles={articles}
          opportunities={opportunities}
          resources={resources}
          challenges={challenges}
          bloomOfTheWeek={bloomOfTheWeek}
          settings={settings}
          submissions={submissions}
          reports={reports}
          writers={writers}
          onRefreshData={refreshData}
          onLogout={handleLogout}
          onToast={(msg) => setToastMessage(msg)}
        />
        <NotificationToast 
          message={toastMessage} 
          onClose={() => setToastMessage(null)} 
        />
      </div>
    );
  }

  // Public Layout
  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF7] text-[#1F2421] selection:bg-[#E2ECE5] selection:text-[#163323]">
      
      {/* Site Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        settings={settings}
        currentUser={currentUser}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onLogoutAdmin={handleLogout}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            articles={articles}
            opportunities={opportunities}
            resources={resources}
            challenges={challenges}
            settings={settings}
            onNavigate={handleNavigate}
            onSelectArticle={handleSelectArticle}
            onSelectChallenge={handleSelectChallenge}
            onSelectOpportunity={handleSelectOpportunity}
          />
        )}

        {currentView === 'explore' && (
          <ExploreView
            articles={articles}
            opportunities={opportunities}
            resources={resources}
            challenges={challenges}
            onSelectArticle={handleSelectArticle}
            onSelectOpportunity={handleSelectOpportunity}
            onSelectResource={() => setCurrentView('resources')}
            onSelectChallenge={handleSelectChallenge}
            onOpenReportModal={handleOpenReportModal}
          />
        )}

        {currentView === 'blog' && (
          <BlogView
            articles={articles}
            onSelectArticle={handleSelectArticle}
          />
        )}

        {currentView === 'article-detail' && (
          selectedArticle ? (
            <ArticleDetailView
              article={selectedArticle}
              allArticles={articles}
              linkedChallenge={challenges.find(c => c.id === selectedArticle.bloomChallengeId)}
              onBack={handleBackToBlog}
              onSelectArticle={handleSelectArticle}
              onSelectChallenge={handleSelectChallenge}
              onOpenReportModal={handleOpenReportModal}
              onOpenSubmit={handleOpenSubmit}
              onToast={(msg) => setToastMessage(msg)}
              onNavigate={handleNavigate}
            />
          ) : isArticleLoading ? (
            <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
              <div className="w-8 h-8 border-2 border-[#163323] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#57615C] font-mono">Loading article from Debloom archive...</p>
            </div>
          ) : (
            <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#EFECE1] text-[#163323] flex items-center justify-center mx-auto text-xl shadow-xs">
                🌱
              </div>
              <h1 className="font-editorial text-3xl font-bold text-[#163323]">Article Not Found</h1>
              <p className="text-sm text-[#57615C] leading-relaxed">
                We couldn’t find an article at this address. It may have been moved, updated, or unpublished.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleBackToBlog}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#163323] text-white text-xs font-semibold hover:bg-[#27523D] transition-colors"
                >
                  ← Return to Reading Room
                </button>
              </div>
            </div>
          )
        )}

        {currentView === 'opportunity-detail' && (
          selectedOpportunity ? (
            <OpportunityDetailView
              opportunity={selectedOpportunity}
              allOpportunities={opportunities}
              settings={settings}
              onBack={handleBackToOpportunities}
              onSelectOpportunity={handleSelectOpportunity}
              onOpenReportModal={handleOpenReportModal}
              onToast={(msg) => setToastMessage(msg)}
              onNavigate={handleNavigate}
            />
          ) : isOpportunityLoading ? (
            <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
              <div className="w-8 h-8 border-2 border-[#163323] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#57615C] font-mono">Loading opportunity from Debloom archive...</p>
            </div>
          ) : (
            <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#EFECE1] text-[#163323] flex items-center justify-center mx-auto text-xl shadow-xs">
                🎓
              </div>
              <h1 className="font-editorial text-3xl font-bold text-[#163323]">Opportunity Not Found</h1>
              <p className="text-sm text-[#57615C] leading-relaxed">
                We couldn’t find an opportunity at this address. The deadline may have passed or the program was moved.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleBackToOpportunities}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#163323] text-white text-xs font-semibold hover:bg-[#27523D] transition-colors"
                >
                  ← Return to Opportunities
                </button>
              </div>
            </div>
          )
        )}

        {currentView === 'opportunities' && (
          <OpportunitiesView
            opportunities={opportunities}
            onOpenReportModal={handleOpenReportModal}
            onOpenSubmit={() => handleOpenSubmit()}
            onSelectOpportunity={handleSelectOpportunity}
          />
        )}

        {currentView === 'resources' && (
          <ResourcesView
            resources={resources}
            onOpenReportModal={handleOpenReportModal}
            onOpenSubmit={() => handleOpenSubmit()}
          />
        )}

        {currentView === 'challenges' && (
          <ChallengesView
            challenges={challenges}
            bloomOfTheWeek={bloomOfTheWeek}
            onOpenSubmit={handleOpenSubmit}
            onSelectChallenge={handleSelectChallenge}
          />
        )}

        {currentView === 'submit' && (
          <SubmitView
            initialChallengeTitle={submitChallengeTitle}
            onToast={(msg) => setToastMessage(msg)}
          />
        )}

        {currentView === 'about' && (
          <AboutView
            settings={settings}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'contact' && (
          <ContactView
            settings={settings}
            onToast={(msg) => setToastMessage(msg)}
          />
        )}

        {currentView === 'admin' && !currentUser && (
          <AdminLoginView
            onLoginSuccess={handleLoginSuccess}
            onBackToHome={() => handleNavigate('home')}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        settings={settings}
        onOpenAdminLogin={() => {
          if (currentUser) {
            setCurrentView('admin');
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
      />

      {/* Modals & Overlays */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        articles={articles.filter(a => a.status === 'Published')}
        opportunities={opportunities.filter(o => o.status === 'Verified/Open' || o.status === 'Closing Soon')}
        resources={resources.filter(r => r.status === 'Published')}
        challenges={challenges.filter(c => c.status === 'Active')}
        onSelectResult={handleSearchResult}
      />

      <ReportModal
        isOpen={reportModalData.isOpen}
        onClose={() => setReportModalData(prev => ({ ...prev, isOpen: false }))}
        targetType={reportModalData.type}
        targetId={reportModalData.id}
        targetTitle={reportModalData.title}
        onSuccessToast={(msg) => setToastMessage(msg)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <NotificationToast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

    </div>
  );
}
