import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { subscriberService } from '../services/storage';

interface NewsletterSignupProps {
  onSuccess?: (msg: string) => void;
  className?: string;
}

export const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ onSuccess, className = '' }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setStatus('error');
      setFeedbackMessage('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setStatus('error');
      setFeedbackMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setFeedbackMessage('');

    try {
      const res = await subscriberService.subscribe(cleanEmail, 'footer_newsletter');
      setStatus('success');
      setFeedbackMessage(res.message);
      if (onSuccess) {
        onSuccess(res.message);
      }
    } catch (err: any) {
      setStatus('error');
      setFeedbackMessage(err.message || 'Unable to subscribe right now. Please try again.');
    }
  };

  return (
    <div className={`rounded-2xl bg-[#1A3828] border border-[#27523D] p-6 sm:p-8 text-[#FCFBF7] shadow-sm relative overflow-hidden ${className}`}>
      {/* Subtle background ambient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-[#27523D]/25 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#12281B]/70 border border-[#27523D] text-[11px] font-semibold text-[#8FA89B] uppercase tracking-wider mb-3">
          <Sparkles className="w-3 h-3 text-[#C49B4B]" />
          <span>DEBLOOM Dispatch</span>
        </div>

        <h3 className="font-editorial text-xl sm:text-2xl text-[#FCFBF7] font-medium leading-snug">
          Discover opportunities & skills directly in your inbox.
        </h3>
        
        <p className="mt-2 text-xs sm:text-sm text-[#DCE7E1]/85 leading-relaxed max-w-xl">
          Get weekly handpicked scholarships, student resources, practical guides, and Bloom Challenges. 
          No spam, no fluff. Start where you are. Bloom from there.
        </p>

        {status === 'success' ? (
          <div className="mt-5 p-4 rounded-xl bg-[#27523D]/70 border border-[#8FA89B]/40 flex items-start sm:items-center gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-[#C49B4B] shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{feedbackMessage}</p>
              <p className="text-xs text-[#DCE7E1]/70 mt-0.5">
                Saved to the official DEBLOOM subscribers list. Look out for our upcoming editions!
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8FA89B]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="Enter your email address..."
                  disabled={status === 'loading'}
                  aria-label="Email address for DEBLOOM newsletter"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#12281B] border border-[#27523D] rounded-xl text-sm text-[#FCFBF7] placeholder-[#8FA89B] focus:outline-none focus:ring-2 focus:ring-[#8FA89B] focus:border-transparent transition-all disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading' || !email.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C49B4B] hover:bg-[#d6aa53] text-[#12281B] text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shrink-0"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {status === 'error' && (
              <p className="mt-2 text-xs text-[#E57373] animate-in fade-in" role="alert">
                {feedbackMessage}
              </p>
            )}

            <p className="mt-2.5 text-[11px] text-[#8FA89B]">
              🌱 Free forever. Unsubscribe anytime with a single click.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
