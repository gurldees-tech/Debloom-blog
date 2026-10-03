import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Send, 
  CheckCircle, 
  ShieldCheck, 
  Compass, 
  Wrench, 
  Target, 
  Lightbulb, 
  MessageSquare, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { SubmissionType } from '../types';
import { submissionService, analyticsService } from '../services/storage';

interface SubmitViewProps {
  initialType?: SubmissionType;
  initialChallengeTitle?: string;
  onToast: (msg: string) => void;
}

export const SubmitView: React.FC<SubmitViewProps> = ({
  initialType = 'Opportunity',
  initialChallengeTitle = '',
  onToast,
}) => {
  const [selectedType, setSelectedType] = useState<SubmissionType>(
    initialChallengeTitle ? 'Bloom Challenge entry' : initialType
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form Fields State
  const [submitterName, setSubmitterName] = useState('');
  const [submitterContact, setSubmitterContact] = useState('');

  // Opportunity Fields
  const [oppName, setOppName] = useState('');
  const [oppOrg, setOppOrg] = useState('');
  const [oppSource, setOppSource] = useState('');
  const [oppDeadline, setOppDeadline] = useState('');
  const [oppEligibility, setOppEligibility] = useState('');
  const [oppLocation, setOppLocation] = useState('Global (including Nigeria)');
  const [oppCost, setOppCost] = useState('Free to apply');
  const [oppBenefits, setOppBenefits] = useState('');
  const [oppWhyHelp, setOppWhyHelp] = useState('');
  const [oppFoundWhere, setOppFoundWhere] = useState('');

  // Resource Fields
  const [resName, setResName] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resCategory, setResCategory] = useState('Online Learning');
  const [resCost, setResCost] = useState('Free');
  const [resAudience, setResAudience] = useState('Secondary & University Students');
  const [resOfficialLink, setResOfficialLink] = useState('');

  // Challenge Entry Fields
  const [chalTitle, setChalTitle] = useState(initialChallengeTitle);
  const [chalLink, setChalLink] = useState('');
  const [chalDescription, setChalDescription] = useState('');

  // Article Idea Fields
  const [artTopic, setArtTopic] = useState('');
  const [artWhyNeeded, setArtWhyNeeded] = useState('');
  const [artAngle, setArtAngle] = useState('');

  // Question Fields
  const [questionText, setQuestionText] = useState('');
  const [questionContext, setQuestionContext] = useState('');

  // Success Story Fields
  const [storyTitle, setStoryTitle] = useState('');
  const [storyText, setStoryText] = useState('');
  const [storyAchievement, setStoryAchievement] = useState('');
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (initialChallengeTitle) {
      setSelectedType('Bloom Challenge entry');
      setChalTitle(initialChallengeTitle);
    }
  }, [initialChallengeTitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let payload: Record<string, any> = {};

    if (selectedType === 'Opportunity') {
      payload = {
        name: oppName,
        organization: oppOrg,
        officialSource: oppSource,
        deadline: oppDeadline,
        eligibility: oppEligibility,
        location: oppLocation,
        cost: oppCost,
        benefits: oppBenefits,
        whyHelp: oppWhyHelp,
        foundWhere: oppFoundWhere,
      };
    } else if (selectedType === 'Resource') {
      payload = {
        name: resName,
        description: resDesc,
        category: resCategory,
        cost: resCost,
        audience: resAudience,
        officialLink: resOfficialLink,
      };
    } else if (selectedType === 'Bloom Challenge entry') {
      payload = {
        challengeTitle: chalTitle,
        submissionLink: chalLink,
        description: chalDescription,
      };
    } else if (selectedType === 'Article idea') {
      payload = {
        topic: artTopic,
        whyNeeded: artWhyNeeded,
        angle: artAngle,
      };
    } else if (selectedType === 'Question') {
      payload = {
        question: questionText,
        context: questionContext,
      };
    } else if (selectedType === 'Success story') {
      payload = {
        title: storyTitle,
        story: storyText,
        achievement: storyAchievement,
        permissionToPublish: hasPermission,
      };
    }

    try {
      submissionService.create({
        type: selectedType,
        submitterName: submitterName || undefined,
        submitterContact: submitterContact || undefined,
        payload,
      });

      analyticsService.logEvent('challenge_submit', `${selectedType} submitted`);
      setSubmitted(true);
      onToast('Thank you! Your submission has entered the private Debloom moderation inbox 🌱');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setOppName('');
    setOppOrg('');
    setOppSource('');
    setOppDeadline('');
    setOppEligibility('');
    setOppBenefits('');
    setOppWhyHelp('');
    setOppFoundWhere('');
    setResName('');
    setResDesc('');
    setChalLink('');
    setChalDescription('');
    setArtTopic('');
    setArtWhyNeeded('');
    setArtAngle('');
    setQuestionText('');
    setQuestionContext('');
    setStoryTitle('');
    setStoryText('');
    setStoryAchievement('');
    setHasPermission(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Page Header */}
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#27523D] font-semibold mb-2">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Contribute & Submit</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#163323] tracking-tight">
          Submit to Debloom 🌱
        </h1>
        <p className="text-sm sm:text-base text-[#57615C] mt-3 leading-relaxed">
          Every submission enters our private moderation dashboard for manual review. 
          Nothing automatically publishes—maintaining absolute trust for every student who visits.
        </p>
      </div>

      {submitted ? (
        <div className="bg-white rounded-2xl border border-[#E5E2D9] p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#E2ECE5] text-[#27523D] flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#163323]">
            Submission Received!
          </h2>

          <p className="text-xs sm:text-sm text-[#57615C] max-w-md mx-auto leading-relaxed">
            Thank you for contributing. Our editorial team checks official links, eligibility rules, and details before publishing anything to the main platform.
          </p>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-[#163323] text-white text-xs font-semibold rounded-lg hover:bg-[#27523D] transition-colors"
            >
              Submit Another Entry
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E2D9] p-6 sm:p-8 space-y-8 shadow-xs">
          
          {/* Submission Type Switcher */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#57615C] mb-2.5">
              Select what you are submitting:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { type: 'Opportunity', icon: Compass, label: 'Opportunity' },
                { type: 'Resource', icon: Wrench, label: 'Resource / Tool' },
                { type: 'Bloom Challenge entry', icon: Target, label: 'Challenge Entry' },
                { type: 'Article idea', icon: Lightbulb, label: 'Article Idea' },
                { type: 'Success story', icon: Sparkles, label: 'Success Story' },
                { type: 'Question', icon: HelpCircle, label: 'Ask a Question' },
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type as SubmissionType)}
                  className={`p-3 rounded-lg border text-left text-xs font-semibold transition-all flex items-center gap-2 ${
                    selectedType === type
                      ? 'bg-[#163323] text-white border-[#163323]'
                      : 'bg-[#FCFBF7] text-[#57615C] border-[#E5E2D9] hover:bg-[#F1F6F3]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* OPPORTUNITY FORM */}
            {selectedType === 'Opportunity' && (
              <div className="space-y-4">
                <div className="p-3 bg-[#FAF2DC] border border-[#C49B4B]/30 rounded-lg text-xs text-[#57615C]">
                  <strong>Opportunity Submission Standards:</strong> Please provide the official website or primary source. We do not publish forwarded messages without direct institutional verification.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Program / Scholarship Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={oppName}
                      onChange={(e) => setOppName(e.target.value)}
                      placeholder="E.g., MTN Foundation Science & Tech Scholarship"
                      className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Organizing Institution / Foundation *
                    </label>
                    <input
                      required
                      type="text"
                      value={oppOrg}
                      onChange={(e) => setOppOrg(e.target.value)}
                      placeholder="E.g., MTN Foundation / British Council"
                      className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Official Source Link *
                    </label>
                    <input
                      required
                      type="url"
                      value={oppSource}
                      onChange={(e) => setOppSource(e.target.value)}
                      placeholder="https://official-org.com/apply"
                      className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Deadline (if known)
                    </label>
                    <input
                      type="text"
                      value={oppDeadline}
                      onChange={(e) => setOppDeadline(e.target.value)}
                      placeholder="E.g., April 30, 2026 or Rolling"
                      className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Eligible Location / Region
                    </label>
                    <input
                      type="text"
                      value={oppLocation}
                      onChange={(e) => setOppLocation(e.target.value)}
                      placeholder="E.g., Nigeria, Africa, or Global"
                      className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Cost / Fees to Applicant
                    </label>
                    <input
                      type="text"
                      value={oppCost}
                      onChange={(e) => setOppCost(e.target.value)}
                      placeholder="E.g., 100% Free / Fully Funded"
                      className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                    Eligibility & Key Criteria
                  </label>
                  <textarea
                    rows={2}
                    value={oppEligibility}
                    onChange={(e) => setOppEligibility(e.target.value)}
                    placeholder="Who qualifies? (e.g. 2nd year undergraduates, secondary school graduates)"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                    Key Benefits (What do selected students get?)
                  </label>
                  <input
                    type="text"
                    value={oppBenefits}
                    onChange={(e) => setOppBenefits(e.target.value)}
                    placeholder="E.g., Tuition coverage, laptop allowance, mentorship"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                    Why will this help students?
                  </label>
                  <textarea
                    rows={2}
                    value={oppWhyHelp}
                    onChange={(e) => setOppWhyHelp(e.target.value)}
                    placeholder="Brief explanation of why this program is worthwhile"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>
              </div>
            )}

            {/* RESOURCE FORM */}
            {selectedType === 'Resource' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Resource / Tool Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={resName}
                      onChange={(e) => setResName(e.target.value)}
                      placeholder="E.g., Obsidian Note Taking"
                      className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Category *
                    </label>
                    <select
                      value={resCategory}
                      onChange={(e) => setResCategory(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                    >
                      <option value="Online Learning">Online Learning</option>
                      <option value="Open Courseware">Open Courseware</option>
                      <option value="Student Tools">Student Tools</option>
                      <option value="Skill Building">Skill Building</option>
                      <option value="Writing & Research">Writing & Research</option>
                      <option value="Financial Literacy">Financial Literacy</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                    Official Website / Link *
                  </label>
                  <input
                    required
                    type="url"
                    value={resOfficialLink}
                    onChange={(e) => setResOfficialLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                    Description & Value for Students *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={resDesc}
                    onChange={(e) => setResDesc(e.target.value)}
                    placeholder="What does it do and why is it genuinely helpful?"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Cost Structure
                    </label>
                    <input
                      type="text"
                      value={resCost}
                      onChange={(e) => setResCost(e.target.value)}
                      placeholder="Free / Freemium / Student Discount"
                      className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                      Intended Audience
                    </label>
                    <input
                      type="text"
                      value={resAudience}
                      onChange={(e) => setResAudience(e.target.value)}
                      placeholder="E.g., Pre-university writers, STEM students"
                      className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* BLOOM CHALLENGE ENTRY */}
            {selectedType === 'Bloom Challenge entry' && (
              <div className="space-y-4">
                <div className="p-3 bg-[#E2ECE5] border border-[#27523D]/20 rounded-lg text-xs text-[#163323]">
                  <strong>Bloom Challenge Submission 🌱:</strong> Submit a link to your completed artifact (Google Doc, Notion page, GitHub repo, or public drive link). Standout submissions are reviewed for Bloom of the Week!
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                    Which Challenge Did You Complete? *
                  </label>
                  <input
                    required
                    type="text"
                    value={chalTitle}
                    onChange={(e) => setChalTitle(e.target.value)}
                    placeholder="E.g., The 7-Day Curiosity Audit or The 1-Page Student Artifact"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                    Public Link to Your Work *
                  </label>
                  <input
                    required
                    type="url"
                    value={chalLink}
                    onChange={(e) => setChalLink(e.target.value)}
                    placeholder="https://docs.google.com/... or https://notion.site/..."
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                  <p className="text-[11px] text-[#7B8681] mt-1">
                    Make sure link permissions are set to "Anyone with the link can view".
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                    Brief Reflection (What did you build or learn?) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={chalDescription}
                    onChange={(e) => setChalDescription(e.target.value)}
                    placeholder="Tell us what you created and the most valuable lesson you took from doing it."
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>
              </div>
            )}

            {/* ARTICLE IDEA */}
            {selectedType === 'Article idea' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                    Proposed Article / Guide Topic *
                  </label>
                  <input
                    required
                    type="text"
                    value={artTopic}
                    onChange={(e) => setArtTopic(e.target.value)}
                    placeholder="E.g., How to prepare for IELTS on a zero-naira budget"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                    Why do students need this guide? *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={artWhyNeeded}
                    onChange={(e) => setArtWhyNeeded(e.target.value)}
                    placeholder="What questions or frustrations are students facing around this?"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                    Suggested Angle or Key Advice
                  </label>
                  <textarea
                    rows={2}
                    value={artAngle}
                    onChange={(e) => setArtAngle(e.target.value)}
                    placeholder="Any specific resources or tips that should be included?"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>
              </div>
            )}

            {/* SUCCESS STORY */}
            {selectedType === 'Success story' && (
              <div className="space-y-4">
                <div className="p-3 bg-[#FAF2DC] border border-[#C49B4B]/30 rounded-lg text-xs text-[#57615C]">
                  <strong>Student Story Privacy Rule:</strong> We never publish student stories without verified explicit permission. Share your journey to encourage other young minds.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                    What milestone did you achieve? *
                  </label>
                  <input
                    required
                    type="text"
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    placeholder="E.g., Selected for Google Summer of Code / Built my first paid client site"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                    Your Story & What You Did *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    placeholder="Describe where you started, what obstacles you overcame, and what practical advice you'd share with other students."
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    required
                    type="checkbox"
                    id="permissionCheck"
                    checked={hasPermission}
                    onChange={(e) => setHasPermission(e.target.checked)}
                    className="rounded border-[#E5E2D9] text-[#163323] focus:ring-[#163323]"
                  />
                  <label htmlFor="permissionCheck" className="text-xs text-[#1F2421] font-medium">
                    I give Debloom permission to review and potentially publish this story with my name.
                  </label>
                </div>
              </div>
            )}

            {/* QUESTION */}
            {selectedType === 'Question' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                    Your Question *
                  </label>
                  <input
                    required
                    type="text"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="E.g., How do I know if a scholarship requires notarized documents?"
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                    Context / Situation
                  </label>
                  <textarea
                    rows={3}
                    value={questionContext}
                    onChange={(e) => setQuestionContext(e.target.value)}
                    placeholder="Tell us a little more about your background (e.g. secondary school senior, pre-university aspirant, undergraduate)."
                    className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                  />
                </div>
              </div>
            )}

            {/* Common Contact Fields */}
            <div className="pt-4 border-t border-[#E5E2D9] grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                  Your Name (optional for suggestions, required for challenge entries)
                </label>
                <input
                  type="text"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  placeholder="Your full or preferred name"
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                  Email or Telegram Handle (optional)
                </label>
                <input
                  type="text"
                  value={submitterContact}
                  onChange={(e) => setSubmitterContact(e.target.value)}
                  placeholder="In case we need to verify details"
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-[#163323] hover:bg-[#27523D] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Send className="w-3.5 h-3.5 text-[#8FA89B]" />
                <span>{isSubmitting ? 'Submitting...' : 'Send to Moderation Inbox'}</span>
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
};
