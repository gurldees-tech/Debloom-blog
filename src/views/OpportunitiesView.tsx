import React, { useState, useMemo, useEffect } from 'react';
import { 
  Compass, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  DollarSign,
  AlertCircle,
  Clock,
  ShieldAlert,
  Share2,
  Copy,
  Check,
  X
} from 'lucide-react';
import { Opportunity } from '../types';
import { opportunityService, analyticsService } from '../services/storage';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  onOpenReportModal: (type: 'opportunity' | 'resource' | 'article', id: string, title: string) => void;
  onOpenSubmit: () => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  opportunities,
  onOpenReportModal,
  onOpenSubmit,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Automatically open opportunity if direct link with ?id= is used
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const targetId = params.get('id');
      if (targetId) {
        const found = opportunities.find(o => o.id === targetId);
        if (found) setSelectedOpp(found);
      }
    }
  }, [opportunities]);

  const handleSelectOpp = (opp: Opportunity | null) => {
    setSelectedOpp(opp);
    if (typeof window !== 'undefined' && window.history) {
      if (opp) {
        window.history.pushState(null, '', `/opportunities?id=${encodeURIComponent(opp.id)}`);
      } else {
        window.history.pushState(null, '', '/opportunities');
      }
    }
  };

  const handleCopyLink = (opp: Opportunity, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/opportunities?id=${encodeURIComponent(opp.id)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(opp.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter public view: Only Verified/Open or Closing Soon
  const publicList = useMemo(() => {
    return opportunities.filter(o => o.status === 'Verified/Open' || o.status === 'Closing Soon');
  }, [opportunities]);

  const categories = [
    { id: 'all', label: 'All Opportunities' },
    { id: 'Scholarship', label: 'Scholarships' },
    { id: 'Internship', label: 'Internships' },
    { id: 'Fellowship', label: 'Fellowships' },
    { id: 'Competition', label: 'Competitions' },
    { id: 'Youth Program', label: 'Youth Programs' },
  ];

  const filtered = useMemo(() => {
    return publicList.filter(o => {
      const matchCategory = selectedCategory === 'all' || o.category === selectedCategory;
      const matchRegion = selectedRegion === 'all' || 
        (selectedRegion === 'global' && o.countryRegion.toLowerCase().includes('global')) ||
        (selectedRegion === 'nigeria' && (o.countryRegion.toLowerCase().includes('nigeria') || o.countryRegion.toLowerCase().includes('africa')));
      const query = search.trim().toLowerCase();
      const matchSearch = !query || 
        o.title.toLowerCase().includes(query) || 
        o.organizer.toLowerCase().includes(query) ||
        o.description.toLowerCase().includes(query);
      return matchCategory && matchRegion && matchSearch;
    });
  }, [publicList, selectedCategory, selectedRegion, search]);

  const handleExternalClick = (opp: Opportunity) => {
    opportunityService.incrementClicks(opp.id);
    analyticsService.logEvent('opportunity_click', `${opp.title} (${opp.organizer})`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#27523D] font-semibold mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Verified Student Opportunities</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#163323] tracking-tight">
          Find Legitimate Opportunities
        </h1>
        <p className="text-sm sm:text-base text-[#57615C] mt-3 leading-relaxed">
          Directly verified scholarships, fellowships, and student programs. 
          We prioritize opportunities accessible to Nigerian students and global applicants with zero application scams.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3 border-y border-[#E5E2D9] py-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  selectedCategory === c.id
                    ? 'bg-[#163323] text-white shadow-xs'
                    : 'text-[#57615C] hover:text-[#163323] hover:bg-[#EFECE1]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-[#E5E2D9] rounded-lg text-xs text-[#1F2421] focus:outline-none focus:ring-1 focus:ring-[#163323]"
            >
              <option value="all">All Regions</option>
              <option value="global">Global</option>
              <option value="nigeria">Nigeria & Africa</option>
            </select>

            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#57615C]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search opportunities..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E5E2D9] rounded-lg text-[#1F2421] placeholder-[#7B8681] focus:outline-none focus:ring-1 focus:ring-[#163323]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Opportunities */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-white border border-[#E5E2D9] rounded-xl max-w-lg mx-auto p-8 space-y-2">
          <p className="font-editorial text-xl text-[#163323] font-semibold">
            🌱 We’re still growing this section.
          </p>
          <p className="text-xs text-[#57615C] max-w-sm mx-auto leading-relaxed">
            Check back soon for useful, verified resources and articles.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenSubmit}
              className="text-xs text-[#27523D] hover:underline font-semibold cursor-pointer"
            >
              Know a verified opportunity? Submit it here →
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(opp => (
            <div
              key={opp.id}
              className="bg-white rounded-xl border border-[#E5E2D9] p-6 hover:border-[#8FA89B] hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                {/* Quiet unboxed metadata */}
                <div className="flex items-center justify-between text-xs text-[#57615C] mb-2">
                  <span className="font-semibold text-[#27523D]">{opp.category}</span>
                  <span className="flex items-center gap-1 text-[#7B8681]">
                    <MapPin className="w-3 h-3" />
                    <span>{opp.countryRegion}</span>
                  </span>
                </div>

                <h3 className="font-editorial text-xl font-bold text-[#163323] leading-snug">
                  {opp.title}
                </h3>

                <p className="text-xs font-medium text-[#7B8681] mt-1">
                  Organizer: {opp.organizer}
                </p>

                <p className="text-xs text-[#57615C] mt-3 line-clamp-3 leading-relaxed">
                  {opp.description}
                </p>

                {/* Practical Snapshot info box */}
                <div className="mt-4 p-3 bg-[#F7F5EE] rounded-lg text-xs space-y-1.5 text-[#57615C]">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#7B8681]">Deadline:</span>
                    <span className="font-semibold text-[#1F2421] text-right">{opp.deadline}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[#7B8681]">Cost:</span>
                    <span className="font-semibold text-[#27523D] text-right">{opp.cost}</span>
                  </div>
                  {opp.ageRequirement && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-[#7B8681]">Age:</span>
                      <span className="text-[#1F2421] text-right">{opp.ageRequirement}</span>
                    </div>
                  )}
                </div>

                {/* Trust info bar */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-[#7B8681]">
                  <span className="flex items-center gap-1 text-[#27523D]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Source</span>
                  </span>
                  <span>Checked: {opp.lastVerifiedDate}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-[#F1F6F3] flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSelectOpp(opp)}
                    className="text-xs font-semibold text-[#163323] hover:text-[#27523D] cursor-pointer"
                  >
                    View Details & Guide →
                  </button>
                  <button
                    onClick={(e) => handleCopyLink(opp, e)}
                    className="text-[11px] text-[#57615C] hover:text-[#163323] flex items-center gap-1 cursor-pointer"
                    title="Copy direct share link"
                  >
                    {copiedId === opp.id ? (
                      <span className="text-[#27523D] flex items-center gap-0.5"><Check className="w-3 h-3" /> Copied</span>
                    ) : (
                      <span className="flex items-center gap-0.5"><Share2 className="w-3 h-3" /> Direct Link</span>
                    )}
                  </button>
                </div>

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
      )}

      {/* DETAIL MODAL / DRAWER FOR SELECTED OPPORTUNITY */}
      {selectedOpp && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12281B]/40 backdrop-blur-xs"
          onClick={() => handleSelectOpp(null)}
        >
          <div 
            className="w-full max-w-2xl bg-[#FCFBF7] rounded-xl shadow-2xl border border-[#E5E2D9] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-[#E5E2D9] bg-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#57615C] mb-1">
                  <span className="font-semibold text-[#27523D]">{selectedOpp.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedOpp.countryRegion}</span>
                </div>
                <h2 className="font-editorial text-2xl font-bold text-[#163323]">
                  {selectedOpp.title}
                </h2>
                <p className="text-xs text-[#7B8681] mt-0.5">
                  Organized by: <strong className="text-[#1F2421]">{selectedOpp.organizer}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyLink(selectedOpp)}
                  className="p-1.5 rounded-lg text-[#57615C] hover:text-[#163323] hover:bg-[#EFECE1] text-xs flex items-center gap-1 cursor-pointer"
                  title="Copy permanent shareable link"
                >
                  {copiedId === selectedOpp.id ? (
                    <span className="text-[#27523D] flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied!</span>
                  ) : (
                    <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> Share Link</span>
                  )}
                </button>
                <button
                  onClick={() => handleSelectOpp(null)}
                  className="p-1 rounded-md text-[#7B8681] hover:text-[#1F2421] hover:bg-[#EFECE1]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#57615C] mb-1">
                  Overview
                </h4>
                <p className="text-xs sm:text-sm text-[#1F2421] leading-relaxed">
                  {selectedOpp.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#F7F5EE] p-3.5 rounded-lg border border-[#E5E2D9] space-y-1 text-xs">
                  <div className="text-[#7B8681] font-medium">Application Deadline:</div>
                  <div className="font-semibold text-[#1F2421]">{selectedOpp.deadline}</div>
                </div>

                <div className="bg-[#F7F5EE] p-3.5 rounded-lg border border-[#E5E2D9] space-y-1 text-xs">
                  <div className="text-[#7B8681] font-medium">Cost / Fees:</div>
                  <div className="font-semibold text-[#27523D]">{selectedOpp.cost}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#57615C] mb-1">
                  Eligibility Criteria
                </h4>
                <div className="p-3 bg-white border border-[#E5E2D9] rounded-lg text-xs text-[#2D3430] leading-relaxed">
                  {selectedOpp.eligibility}
                </div>
              </div>

              {selectedOpp.benefits && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#57615C] mb-1">
                    Benefits & Support
                  </h4>
                  <div className="p-3 bg-white border border-[#E5E2D9] rounded-lg text-xs text-[#2D3430] leading-relaxed">
                    {selectedOpp.benefits}
                  </div>
                </div>
              )}

              {selectedOpp.requirements && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#57615C] mb-1">
                    Requirements & Preparation
                  </h4>
                  <div className="p-3 bg-white border border-[#E5E2D9] rounded-lg text-xs text-[#2D3430] leading-relaxed">
                    {selectedOpp.requirements}
                  </div>
                </div>
              )}

              {/* Trust verification banner */}
              <div className="p-3.5 bg-[#FAF2DC] border border-[#C49B4B]/30 rounded-lg text-xs text-[#57615C] space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#163323]">
                  <ShieldCheck className="w-4 h-4 text-[#27523D]" />
                  <span>Verified Opportunity Promise</span>
                </div>
                <p>
                  Last checked by Debloom on <strong>{selectedOpp.lastVerifiedDate}</strong>. Always apply directly via the organizer's official website below. Never pay an unauthorized third party.
                </p>
              </div>

            </div>

            {/* Footer action */}
            <div className="p-6 border-t border-[#E5E2D9] bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => onOpenReportModal('opportunity', selectedOpp.id, selectedOpp.title)}
                className="text-xs text-[#7B8681] hover:text-[#1F2421] hover:underline"
              >
                Report an error or outdated information
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => handleSelectOpp(null)}
                  className="px-4 py-2 text-xs font-medium text-[#57615C] hover:bg-[#EFECE1] rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>

                <a
                  href={selectedOpp.applicationLink || selectedOpp.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleExternalClick(selectedOpp)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#163323] hover:bg-[#27523D] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Apply on Official Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
