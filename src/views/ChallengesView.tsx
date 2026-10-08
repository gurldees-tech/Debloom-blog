import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Award, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  FileCheck2,
  Share2,
  Check
} from 'lucide-react';
import { BloomChallenge, BloomOfTheWeek } from '../types';

interface ChallengesViewProps {
  challenges: BloomChallenge[];
  bloomOfTheWeek: BloomOfTheWeek;
  onOpenSubmit: (challengeTitle?: string) => void;
  onSelectChallenge?: (challenge: BloomChallenge) => void;
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({
  challenges,
  bloomOfTheWeek,
  onOpenSubmit,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(challenges[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      let targetChal: BloomChallenge | undefined;
      if (pathname.startsWith('/challenges/')) {
        const slug = pathname.replace(/^\/challenges\//, '').replace(/\/$/, '').trim().toLowerCase();
        if (slug) {
          targetChal = challenges.find(c => (c.slug || c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).toLowerCase() === slug || c.id === slug);
        }
      }
      if (!targetChal) {
        const params = new URLSearchParams(window.location.search);
        const targetId = params.get('id');
        if (targetId) targetChal = challenges.find(c => c.id === targetId);
      }
      if (targetChal) {
        setExpandedId(targetChal.id);
        setTimeout(() => {
          const el = document.getElementById(`challenge-${targetChal?.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [challenges]);

  const handleCopyLink = (c: BloomChallenge, e: React.MouseEvent) => {
    e.stopPropagation();
    const slug = c.slug || c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const url = `${window.location.origin}/challenges/${slug}/`;
    navigator.clipboard.writeText(url);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeChallenges = challenges.filter(c => c.status === 'Active');

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      
      {/* Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#27523D] font-semibold mb-2">
          <Target className="w-3.5 h-3.5" />
          <span>Practical Learning System</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#163323] tracking-tight">
          Bloom Challenges 🌱
        </h1>
        <p className="text-sm sm:text-base text-[#57615C] mt-3 leading-relaxed">
          The central idea of Debloom is simple: <em>"Don't just read. Do something with what you learn."</em><br />
          Each challenge is a self-contained, low-cost micro-task that turns passive study into tangible proof.
        </p>
      </div>

      {/* BLOOM OF THE WEEK FEATURE SECTION */}
      <section className="bg-white rounded-2xl border border-[#E5E2D9] p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5E2D9]">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#C49B4B]" />
            <h2 className="font-editorial text-xl font-bold text-[#163323]">
              Bloom of the Week 🌱
            </h2>
          </div>
          <span className="text-[11px] uppercase tracking-wider text-[#7B8681] font-medium">
            Student Recognition Spotlight
          </span>
        </div>

        {bloomOfTheWeek.awarded ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <div className="text-xs text-[#27523D] font-semibold">
                Recognised for: {bloomOfTheWeek.challengeTitle}
              </div>
              <h3 className="font-editorial text-2xl font-bold text-[#163323]">
                {bloomOfTheWeek.studentName}
              </h3>
              <p className="text-xs sm:text-sm text-[#57615C] leading-relaxed">
                {bloomOfTheWeek.outputDescription}
              </p>
              {bloomOfTheWeek.reflection && (
                <blockquote className="border-l-2 border-[#C49B4B] pl-4 italic text-xs text-[#7B8681] mt-3">
                  "{bloomOfTheWeek.reflection}"
                </blockquote>
              )}
            </div>

            <div className="bg-[#F7F5EE] p-5 rounded-xl border border-[#E5E2D9] flex flex-col justify-between">
              <div className="space-y-2 text-xs text-[#57615C]">
                <div><strong className="text-[#1F2421]">Award Date:</strong> {bloomOfTheWeek.dateAwarded}</div>
                <div><strong className="text-[#1F2421]">Verification:</strong> Reviewed by Debloom Team</div>
              </div>
              {bloomOfTheWeek.submissionLink && (
                <a
                  href={bloomOfTheWeek.submissionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 px-4 py-2 bg-[#163323] text-white rounded-lg text-xs font-semibold text-center hover:bg-[#27523D] transition-colors"
                >
                  View Student Artifact →
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6 py-8 text-center max-w-lg mx-auto space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#F1F6F3] text-[#27523D] flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-5 h-5 text-[#8FA89B]" />
            </div>
            <h4 className="font-editorial text-lg text-[#163323] font-semibold">
              No Bloom of the Week has been awarded yet. 🌱
            </h4>
            <p className="text-xs text-[#57615C] leading-relaxed">
              When students complete their Bloom Challenges and submit their work for review, 
              the standout verified project will be recognized right here.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onOpenSubmit()}
                className="px-4 py-2 bg-[#163323] text-white text-xs font-semibold rounded-lg hover:bg-[#27523D] transition-colors"
              >
                Submit Your Challenge Work →
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ACTIVE CHALLENGES ACCORDION / LIST */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
          <h2 className="font-editorial text-2xl font-bold text-[#163323]">
            Active Challenges ({activeChallenges.length})
          </h2>
          <span className="text-xs text-[#57615C]">
            Select any challenge to view steps & submit
          </span>
        </div>

        {activeChallenges.length === 0 ? (
          <div className="py-16 text-center bg-white border border-[#E5E2D9] rounded-xl max-w-lg mx-auto p-8 space-y-2">
            <p className="font-editorial text-xl text-[#163323] font-semibold">
              🌱 We’re still growing this section.
            </p>
            <p className="text-xs text-[#57615C] max-w-sm mx-auto leading-relaxed">
              Check back soon for useful, verified resources and challenges.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onOpenSubmit()}
                className="text-xs text-[#27523D] hover:underline font-semibold cursor-pointer"
              >
                Have a practical challenge idea? Submit it here →
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
          {activeChallenges.map((challenge) => {
            const isExpanded = expandedId === challenge.id;
            return (
              <div
                key={challenge.id}
                id={`challenge-${challenge.id}`}
                className="bg-white rounded-xl border border-[#E5E2D9] overflow-hidden transition-all shadow-xs scroll-mt-24"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleExpand(challenge.id)}
                  className="p-5 sm:p-6 cursor-pointer flex items-start justify-between gap-4 hover:bg-[#FDFCF9] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#57615C]">
                      <span className="font-semibold text-[#27523D]">{challenge.difficulty}</span>
                      <span aria-hidden="true">·</span>
                      <span>{challenge.steps.length} practical steps</span>
                    </div>
                    <h3 className="font-editorial text-xl font-bold text-[#163323]">
                      {challenge.title}
                    </h3>
                    <p className="text-xs text-[#57615C] line-clamp-2">
                      {challenge.whatYoullDo}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleCopyLink(challenge, e)}
                      className="p-1.5 rounded-lg text-[#57615C] hover:text-[#163323] hover:bg-[#EFECE1] text-xs flex items-center gap-1 cursor-pointer"
                      title="Copy direct share link to this challenge"
                    >
                      {copiedId === challenge.id ? (
                        <span className="text-[#27523D] flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied</span>
                      ) : (
                        <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> Direct Link</span>
                      )}
                    </button>
                    <button 
                      className="p-1.5 rounded-lg text-[#7B8681] hover:text-[#1F2421] hover:bg-[#EFECE1]"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[#F1F6F3] space-y-6 bg-[#FCFBF7]">
                    
                    {/* What you need */}
                    <div className="p-4 bg-white rounded-xl border border-[#E5E2D9] text-xs">
                      <span className="font-semibold text-[#163323] block mb-1">
                        What you need to get started:
                      </span>
                      <p className="text-[#57615C]">{challenge.whatYouNeed}</p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#27523D]">
                        Step-by-step instructions
                      </h4>
                      <div className="space-y-2.5">
                        {challenge.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#1F2421] p-3 rounded-lg bg-white border border-[#E5E2D9]">
                            <span className="font-bold text-[#27523D] shrink-0 w-6 h-6 rounded-full bg-[#E2ECE5] flex items-center justify-center text-xs">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed mt-0.5">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Output & Learning */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-white border border-[#E5E2D9] space-y-1">
                        <strong className="text-[#163323] block">Expected Output:</strong>
                        <p className="text-[#57615C] leading-relaxed">{challenge.expectedOutput}</p>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-[#E5E2D9] space-y-1">
                        <strong className="text-[#163323] block">What You Learn From It:</strong>
                        <p className="text-[#57615C] leading-relaxed">{challenge.whatYouCanLearn}</p>
                      </div>
                    </div>

                    {/* Optional Extension */}
                    {challenge.optionalExtension && (
                      <div className="p-3 rounded-lg bg-[#FAF2DC] border border-[#C49B4B]/30 text-xs text-[#57615C]">
                        <strong className="text-[#163323]">Bonus Extension: </strong>
                        {challenge.optionalExtension}
                      </div>
                    )}

                    {/* Submission call to action */}
                    <div className="pt-4 border-t border-[#E5E2D9] flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-xs text-[#57615C]">
                        Completed this challenge? Submit your work to our team for verification and feedback.
                      </div>

                      <button
                        onClick={() => onOpenSubmit(challenge.title)}
                        className="w-full sm:w-auto px-6 py-2.5 bg-[#163323] hover:bg-[#27523D] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
                      >
                        <span>Submit your work →</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </section>

    </div>
  );
};
