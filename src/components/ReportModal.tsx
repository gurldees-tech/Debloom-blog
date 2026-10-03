import React, { useState } from 'react';
import { AlertCircle, X, CheckCircle, ShieldAlert } from 'lucide-react';
import { reportService } from '../services/storage';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'opportunity' | 'resource' | 'article';
  targetId: string;
  targetTitle: string;
  onSuccessToast?: (msg: string) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
  onSuccessToast
}) => {
  const [whatNeedsCorrection, setWhatNeedsCorrection] = useState('');
  const [whatIsCurrentlyWrong, setWhatIsCurrentlyWrong] = useState('');
  const [suggestedCorrection, setSuggestedCorrection] = useState('');
  const [supportingSource, setSupportingSource] = useState('');
  const [submitterContact, setSubmitterContact] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatNeedsCorrection.trim() || !whatIsCurrentlyWrong.trim()) return;

    setIsSubmitting(true);
    try {
      reportService.create({
        targetType,
        targetId,
        targetTitle,
        whatNeedsCorrection,
        whatIsCurrentlyWrong,
        suggestedCorrection,
        supportingSource,
        submitterContact
      });
      setSubmitted(true);
      if (onSuccessToast) {
        onSuccessToast('Correction report received. Thank you for keeping Debloom verified! 🌱');
      }
      setTimeout(() => {
        setSubmitted(false);
        setWhatNeedsCorrection('');
        setWhatIsCurrentlyWrong('');
        setSuggestedCorrection('');
        setSupportingSource('');
        setSubmitterContact('');
        onClose();
      }, 1800);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12281B]/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-[#FCFBF7] rounded-xl shadow-2xl border border-[#E5E2D9] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E5E2D9] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#C49B4B]" />
            <div>
              <h3 className="text-sm font-bold text-[#163323]">
                Report an Error or Outdated Info
              </h3>
              <p className="text-xs text-[#57615C] truncate max-w-xs">
                Ref: {targetTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#7B8681] hover:text-[#1F2421] hover:bg-[#EFECE1]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-[#27523D] mx-auto" />
            <h4 className="font-editorial text-lg text-[#163323] font-semibold">
              Report Logged for Review
            </h4>
            <p className="text-xs text-[#57615C] max-w-xs mx-auto">
              Our moderation team reviews every report against official sources. We appreciate your vigilance in keeping Debloom trustworthy.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="bg-[#FAF2DC] border border-[#C49B4B]/30 rounded-lg p-3 text-xs text-[#57615C] leading-relaxed">
              <strong>Our pledge:</strong> We take accuracy seriously. If a deadline has passed, a link is broken, or requirements changed, let us know and we will verify it directly with the official source.
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                What element needs correction? *
              </label>
              <select
                required
                value={whatNeedsCorrection}
                onChange={(e) => setWhatNeedsCorrection(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
              >
                <option value="">Select an option...</option>
                <option value="Deadline passed or closing date wrong">Deadline passed or closing date wrong</option>
                <option value="Broken or incorrect official link">Broken or incorrect official link</option>
                <option value="Eligibility or age criteria changed">Eligibility or age criteria changed</option>
                <option value="Program requires unexpected fees or payment">Program requires unexpected fees or payment</option>
                <option value="Outdated description or requirements">Outdated description or requirements</option>
                <option value="Other">Other discrepancy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                What is currently wrong? *
              </label>
              <textarea
                required
                rows={2}
                value={whatIsCurrentlyWrong}
                onChange={(e) => setWhatIsCurrentlyWrong(e.target.value)}
                placeholder="E.g., The official website announced the deadline moved up to March 15, or the portal is reporting registration closed."
                className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                Suggested correction / notes (optional)
              </label>
              <textarea
                rows={2}
                value={suggestedCorrection}
                onChange={(e) => setSuggestedCorrection(e.target.value)}
                placeholder="E.g., Update status to Closed, or update link to new admissions portal."
                className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                  Official source link (optional)
                </label>
                <input
                  type="url"
                  value={supportingSource}
                  onChange={(e) => setSupportingSource(e.target.value)}
                  placeholder="https://..."
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F2421] mb-1">
                  Your email/contact (optional)
                </label>
                <input
                  type="text"
                  value={submitterContact}
                  onChange={(e) => setSubmitterContact(e.target.value)}
                  placeholder="In case we need clarification"
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E5E2D9] bg-white focus:outline-none focus:ring-1 focus:ring-[#163323]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5E2D9]">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-[#57615C] hover:text-[#1F2421] hover:bg-[#EFECE1] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#163323] hover:bg-[#27523D] rounded-lg transition-colors shadow-xs"
              >
                {isSubmitting ? 'Sending...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
