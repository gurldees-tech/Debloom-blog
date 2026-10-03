import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  ShieldAlert, 
  Layers, 
  Info,
  DollarSign,
  Share2,
  Check
} from 'lucide-react';
import { Resource } from '../types';
import { resourceService, analyticsService } from '../services/storage';

interface ResourcesViewProps {
  resources: Resource[];
  onOpenReportModal: (type: 'opportunity' | 'resource' | 'article', id: string, title: string) => void;
  onOpenSubmit: () => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  onOpenReportModal,
  onOpenSubmit,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const targetId = params.get('id');
      if (targetId) {
        setTimeout(() => {
          const el = document.getElementById(`resource-${targetId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-[#163323]');
          }
        }, 100);
      }
    }
  }, [resources]);

  const handleCopyLink = (res: Resource) => {
    const url = `${window.location.origin}/resources?id=${encodeURIComponent(res.id)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(res.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const publicResources = resources.filter(r => r.status === 'Published');

  const categories = [
    { id: 'all', label: 'All Resources' },
    { id: 'Open Courseware', label: 'Open Courseware' },
    { id: 'Online Learning', label: 'Online Learning' },
    { id: 'Skill Building', label: 'Skill Building' },
    { id: 'Writing & Research', label: 'Writing & Research' },
    { id: 'Student Tools', label: 'Student Tools' },
  ];

  const filtered = publicResources.filter(r => {
    const matchCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const query = search.trim().toLowerCase();
    const matchSearch = !query || 
      r.name.toLowerCase().includes(query) || 
      r.description.toLowerCase().includes(query) ||
      r.category.toLowerCase().includes(query);
    return matchCategory && matchSearch;
  });

  const handleClick = (res: Resource) => {
    resourceService.incrementClicks(res.id);
    analyticsService.logEvent('resource_click', res.name);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#27523D] font-semibold mb-2">
          <Wrench className="w-3.5 h-3.5" />
          <span>Curated Student Resources</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#163323] tracking-tight">
          Tools, Courses & Free Foundations
        </h1>
        <p className="text-sm sm:text-base text-[#57615C] mt-3 leading-relaxed">
          Carefully vetted learning platforms, open university courseware, and student-friendly utilities. 
          We verify each resource for actual student usability, hidden costs, and platform legitimacy.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between border-y border-[#E5E2D9] py-4">
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

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#57615C]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E5E2D9] rounded-lg text-[#1F2421] placeholder-[#7B8681] focus:outline-none focus:ring-1 focus:ring-[#163323]"
          />
        </div>
      </div>

      {/* Listing */}
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
              Suggest a verified resource →
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(res => (
            <div
              key={res.id}
              id={`resource-${res.id}`}
              className="bg-white rounded-xl border border-[#E5E2D9] p-6 hover:border-[#8FA89B] hover:shadow-xs transition-all flex flex-col justify-between scroll-mt-24"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#57615C]">
                  <span className="font-semibold text-[#27523D]">{res.category}</span>
                  <span className="text-[#163323] font-bold">{res.cost}</span>
                </div>

                <h3 className="font-editorial text-xl font-bold text-[#163323] leading-snug">
                  {res.name}
                </h3>

                <p className="text-xs text-[#57615C] leading-relaxed">
                  {res.description}
                </p>

                {/* Practical details box */}
                <div className="p-3 bg-[#F7F5EE] rounded-lg text-xs space-y-1.5 text-[#57615C]">
                  <div>
                    <span className="text-[#7B8681] font-medium">Audience: </span>
                    <span className="text-[#1F2421]">{res.intendedAudience}</span>
                  </div>
                  <div>
                    <span className="text-[#7B8681] font-medium">Availability: </span>
                    <span className="text-[#1F2421]">{res.countryAvailability}</span>
                  </div>
                  {res.limitations && (
                    <div className="pt-1 border-t border-[#E5E2D9]/60 text-[11px] text-[#7B8681] italic">
                      Notice: {res.limitations}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#7B8681] pt-1">
                  <span className="flex items-center gap-1 text-[#27523D]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Official Resource</span>
                  </span>
                  <span>Verified: {res.lastVerifiedDate}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F1F6F3] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <a
                    href={res.officialWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleClick(res)}
                    className="text-xs font-semibold text-[#163323] hover:text-[#27523D] flex items-center gap-1"
                  >
                    <span>Visit Resource</span>
                    <ExternalLink className="w-3 h-3 text-[#27523D]" />
                  </a>
                  <button
                    onClick={() => handleCopyLink(res)}
                    className="text-[11px] text-[#57615C] hover:text-[#163323] flex items-center gap-1 cursor-pointer pl-1"
                    title="Copy direct share link"
                  >
                    {copiedId === res.id ? (
                      <span className="text-[#27523D] flex items-center gap-0.5"><Check className="w-3 h-3" /> Copied</span>
                    ) : (
                      <span className="flex items-center gap-0.5"><Share2 className="w-3 h-3" /> Link</span>
                    )}
                  </button>
                </div>

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
      )}

    </div>
  );
};
