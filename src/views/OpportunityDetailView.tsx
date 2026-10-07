import React, { useEffect, useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  ShieldCheck, 
  Send, 
  Share2, 
  Check, 
  Flag, 
  Clock, 
  GraduationCap, 
  Coins, 
  AlertCircle,
  Building,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Opportunity, SiteSettings } from '../types';
import { opportunityService, analyticsService } from '../services/storage';

interface OpportunityDetailViewProps {
  opportunity: Opportunity;
  allOpportunities: Opportunity[];
  settings: SiteSettings;
  onBack: () => void;
  onSelectOpportunity: (opp: Opportunity) => void;
  onOpenReportModal: (type: 'opportunity', id: string, title: string) => void;
  onToast: (msg: string) => void;
  onNavigate: (view: string, param?: string) => void;
}

export const OpportunityDetailView: React.FC<OpportunityDetailViewProps> = ({
  opportunity,
  allOpportunities,
  settings,
  onBack,
  onSelectOpportunity,
  onOpenReportModal,
  onToast,
  onNavigate
}) => {
  const [copied, setCopied] = useState(false);
  const [clickCount, setClickCount] = useState(opportunity.clicks || 0);

  const cleanSlug = opportunity.slug || opportunity.id;

  const pageUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/opportunities/${cleanSlug}`;
    }
    return `https://debloom.org/opportunities/${cleanSlug}`;
  }, [cleanSlug]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const pageTitle = `${opportunity.seoTitle || opportunity.title} – Debloom 🌱`;
    document.title = pageTitle;

    const desc = opportunity.metaDescription || 
      (opportunity.description ? opportunity.description.slice(0, 155) : '') || 
      `Verified student opportunity from ${opportunity.organizer} on Debloom.`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute('content', desc);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', pageTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', pageUrl);

    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', pageUrl);

    // Schema.org Structured Data
    const scriptId = 'debloom-opportunity-schema';
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
          '@type': 'EducationalOccupationalProgram',
          '@id': `${pageUrl}#program`,
          'name': opportunity.title,
          'description': opportunity.description,
          'provider': {
            '@type': 'Organization',
            'name': opportunity.organizer,
            ...(opportunity.officialWebsite ? { 'url': opportunity.officialWebsite } : {})
          },
          ...(opportunity.countryRegion ? { 'spatialCoverage': opportunity.countryRegion } : {}),
          'url': pageUrl,
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD',
            'category': opportunity.cost || 'Free to apply'
          }
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${pageUrl}#breadcrumb`,
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': 'https://debloom.org/'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Opportunities',
              'item': 'https://debloom.org/opportunities'
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': opportunity.title,
              'item': pageUrl
            }
          ]
        }
      ]
    };

    scriptTag.textContent = JSON.stringify(schemaData);

    analyticsService.logEvent('opportunity_view', `${opportunity.title} (${opportunity.organizer})`);

    return () => {
      const tag = document.getElementById(scriptId);
      if (tag) tag.remove();
    };
  }, [opportunity, pageUrl, cleanSlug]);

  const handleApplyClick = () => {
    opportunityService.incrementClicks(opportunity.id);
    setClickCount(prev => prev + 1);
    analyticsService.logEvent('opportunity_click', `${opportunity.title} (${opportunity.organizer})`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    onToast('Opportunity link copied to clipboard! 🔗');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(`"${opportunity.title}" on Debloom 🌱\n${pageUrl}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${text}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Verified Opportunity on Debloom 🌱\n\n*${opportunity.title}*\n${pageUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`"${opportunity.title}" — verified student opportunity on Debloom 🌱`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(pageUrl)}`, '_blank');
  };

  // Other verified opportunities
  const relatedOpps = useMemo(() => {
    return allOpportunities
      .filter(o => o.id !== opportunity.id && (o.status === 'Verified/Open' || o.status === 'Closing Soon'))
      .slice(0, 2);
  }, [allOpportunities, opportunity.id]);

  const isClosingSoon = opportunity.status === 'Closing Soon';
  const isVerified = opportunity.status === 'Verified/Open' || opportunity.status === 'Closing Soon';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-150">
      
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#57615C]">
        <button
          onClick={onBack}
          className="hover:text-[#163323] transition-colors cursor-pointer flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Opportunities</span>
        </button>
        <span aria-hidden="true" className="text-[#8FA89B]">/</span>
        <span className="text-[#27523D] font-medium">{opportunity.category}</span>
        <span aria-hidden="true" className="text-[#8FA89B]">/</span>
        <span className="truncate max-w-[200px] sm:max-w-xs text-[#7B8681]">{opportunity.title}</span>
      </nav>

      {/* Main Opportunity Card */}
      <article className="bg-white rounded-2xl border border-[#E5E2D9] p-6 sm:p-10 shadow-xs space-y-8">
        
        {/* Header Block */}
        <header className="space-y-4 border-b border-[#E5E2D9] pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E2ECE5] text-[#163323]">
                {opportunity.category}
              </span>

              {isVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF2DC] text-[#966F28] border border-[#E5E2D9]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B88A3B]" />
                  <span>Verified with official source</span>
                </span>
              )}

              {isClosingSoon && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                  Closing Soon
                </span>
              )}
            </div>

            {/* Verification Timestamp */}
            {opportunity.lastVerifiedDate && (
              <div className="text-xs text-[#7B8681] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#8FA89B]" />
                <span>Last verified: {opportunity.lastVerifiedDate}</span>
              </div>
            )}
          </div>

          <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#163323] tracking-tight leading-[1.18]">
            {opportunity.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#57615C]">
            <div className="flex items-center gap-1.5 font-medium text-[#163323]">
              <Building className="w-3.5 h-3.5 text-[#8FA89B]" />
              <span>Organizer: <strong>{opportunity.organizer}</strong></span>
            </div>

            {opportunity.countryRegion && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8FA89B]" />
                <span>Location: {opportunity.countryRegion}</span>
              </div>
            )}

            {opportunity.cost && (
              <div className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-[#8FA89B]" />
                <span>Cost: {opportunity.cost}</span>
              </div>
            )}

            {opportunity.deadline && (
              <div className="flex items-center gap-1.5 font-semibold text-[#163323]">
                <Calendar className="w-3.5 h-3.5 text-[#C49B4B]" />
                <span>Deadline: {opportunity.deadline}</span>
              </div>
            )}
          </div>
        </header>

        {/* Featured Image if available */}
        {opportunity.featuredImage && (
          <div className="rounded-xl overflow-hidden border border-[#E5E2D9] max-h-80 bg-[#F7F5EE]">
            <img
              src={opportunity.featuredImage}
              alt={opportunity.imageAltText || opportunity.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Description Section */}
        {opportunity.description && (
          <section className="space-y-3">
            <h2 className="font-editorial text-xl font-bold text-[#163323]">
              About This Opportunity
            </h2>
            <div className="text-sm sm:text-base text-[#1F2421] leading-relaxed whitespace-pre-line font-sans">
              {opportunity.description}
            </div>
          </section>
        )}

        {/* Eligibility Details */}
        {opportunity.eligibility && (
          <section className="p-5 sm:p-6 rounded-xl bg-[#F7F5EE] border border-[#E5E2D9] space-y-3">
            <h2 className="font-editorial text-lg font-bold text-[#163323] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#27523D]" />
              <span>Eligibility & Who Can Apply</span>
            </h2>
            <div className="text-xs sm:text-sm text-[#2D3430] leading-relaxed whitespace-pre-line">
              {opportunity.eligibility}
            </div>
            {opportunity.ageRequirement && (
              <p className="text-xs text-[#57615C] pt-1">
                <strong>Age requirement:</strong> {opportunity.ageRequirement}
              </p>
            )}
          </section>
        )}

        {/* Benefits Section */}
        {opportunity.benefits && (
          <section className="space-y-2">
            <h2 className="font-editorial text-lg font-bold text-[#163323] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C49B4B]" />
              <span>Benefits & Funding</span>
            </h2>
            <div className="text-xs sm:text-sm text-[#2D3430] leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-[#E5E2D9]">
              {opportunity.benefits}
            </div>
          </section>
        )}

        {/* Requirements Section */}
        {opportunity.requirements && (
          <section className="space-y-2">
            <h2 className="font-editorial text-lg font-bold text-[#163323]">
              Application Requirements
            </h2>
            <div className="text-xs sm:text-sm text-[#2D3430] leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-[#E5E2D9]">
              {opportunity.requirements}
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* CRITICAL BRAND REQUIREMENT #11: TELEGRAM CTA APPEARS BEFORE     */}
        {/* THE OFFICIAL SCHOLARSHIP / APPLICATION LINK                     */}
        {/* ============================================================== */}
        <section className="pt-6 border-t border-[#E5E2D9] space-y-6">
          
          {/* STEP 1: DEBLOOM TELEGRAM CTA (BEFORE OFFICIAL LINK) */}
          <div className="bg-[#FAF2DC] border border-[#E5E2D9] rounded-2xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#966F28]">
              <span className="text-base">💚</span>
              <span>Want scholarship updates like this sent straight to you?</span>
            </div>

            <p className="text-xs sm:text-sm text-[#57615C] leading-relaxed">
              Join the Debloom Telegram channel for new opportunities, useful resources and updates.
            </p>

            <div>
              <a
                href={settings.telegramUrl || 'https://t.me/DebloomHQ'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#163323] hover:bg-[#27523D] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#8FA89B]" />
                <span>Join Debloom on Telegram →</span>
              </a>
            </div>
          </div>

          {/* STEP 2: OFFICIAL SCHOLARSHIP / APPLICATION LINK */}
          <div className="p-6 sm:p-7 bg-[#F1F6F3] border border-[#DCE7E1] rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#27523D]">
              <span className="text-base">🎓</span>
              <span>Ready to apply?</span>
            </div>

            <p className="text-xs text-[#57615C] leading-relaxed">
              Always apply through the organizer's official website. Debloom does not charge fees, collect application materials, or act as an intermediary.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {opportunity.applicationLink ? (
                <a
                  href={opportunity.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleApplyClick}
                  className="px-6 py-3 bg-[#163323] hover:bg-[#27523D] text-white text-sm font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <span>Official Scholarship Application →</span>
                  <ExternalLink className="w-4 h-4 text-[#8FA89B]" />
                </a>
              ) : (
                <span className="text-xs text-[#7B8681] italic">Official application link not provided.</span>
              )}

              {opportunity.officialWebsite && opportunity.officialWebsite !== opportunity.applicationLink && (
                <a
                  href={opportunity.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-white border border-[#DCE7E1] hover:bg-[#FAF8F2] text-[#163323] text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <span>Official Website ({opportunity.organizer})</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#7B8681]" />
                </a>
              )}
            </div>
          </div>

        </section>

        {/* Share & Report Toolbar */}
        <footer className="pt-6 border-t border-[#E5E2D9] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#7B8681] mr-1">Share:</span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg border border-[#E5E2D9] hover:bg-[#F7F5EE] text-xs text-[#57615C] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#27523D]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy link'}</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-lg border border-[#E5E2D9] hover:bg-[#F7F5EE] text-xs text-[#57615C] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleShareTelegram}
              className="px-3 py-1.5 rounded-lg border border-[#E5E2D9] hover:bg-[#F7F5EE] text-xs text-[#57615C] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Telegram</span>
            </button>
            <button
              onClick={handleShareTwitter}
              className="px-3 py-1.5 rounded-lg border border-[#E5E2D9] hover:bg-[#F7F5EE] text-xs text-[#57615C] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>X (Twitter)</span>
            </button>
          </div>

          <div>
            <button
              onClick={() => onOpenReportModal('opportunity', opportunity.id, opportunity.title)}
              className="text-xs text-[#7B8681] hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Flag className="w-3 h-3" />
              <span>Report an error or expired deadline</span>
            </button>
          </div>
        </footer>

      </article>

      {/* Related Opportunities */}
      {relatedOpps.length > 0 && (
        <section className="space-y-4 pt-4">
          <h3 className="font-editorial text-2xl font-bold text-[#163323]">
            More Verified Opportunities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relatedOpps.map((opp) => (
              <div
                key={opp.id}
                onClick={() => onSelectOpportunity(opp)}
                className="bg-white p-5 rounded-xl border border-[#E5E2D9] hover:border-[#8FA89B] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#57615C] mb-2">
                    <span className="font-medium text-[#27523D]">{opp.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{opp.countryRegion}</span>
                  </div>
                  <h4 className="font-editorial text-lg font-bold text-[#163323] hover:text-[#27523D] transition-colors leading-snug">
                    {opp.title}
                  </h4>
                  <p className="text-xs text-[#57615C] mt-2 line-clamp-2">
                    {opp.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F1F6F3] flex items-center justify-between text-xs text-[#7B8681]">
                  <span>{opp.organizer}</span>
                  <span className="font-medium text-[#163323]">View details →</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
