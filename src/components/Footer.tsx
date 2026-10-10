import React, { useRef } from 'react';
import { Send, ArrowUpRight, Lock } from 'lucide-react';
import { SiteSettings } from '../types';
import { NewsletterSignup } from './NewsletterSignup';

interface FooterProps {
  onNavigate: (view: string) => void;
  settings: SiteSettings;
  isStealthUnlocked?: boolean;
  onToggleStealth?: () => void;
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigate, 
  settings, 
  isStealthUnlocked = false,
  onToggleStealth,
  onOpenAdminLogin 
}) => {
  // Mobile phone stealth gesture: 3 taps or 1.8-sec hold on copyright text
  const tapCountRef = useRef(0);
  const lastTapTimeRef = useRef(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerStealthAction = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([40, 60, 40]); } catch (_) {}
    }
    if (onToggleStealth) {
      onToggleStealth();
    } else {
      onOpenAdminLogin();
    }
  };

  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      triggerStealthAction();
    }, 1800);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  const handleCopyrightClick = () => {
    const now = Date.now();
    if (now - lastTapTimeRef.current < 700) {
      tapCountRef.current += 1;
    } else {
      tapCountRef.current = 1;
    }
    lastTapTimeRef.current = now;

    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      triggerStealthAction();
    }
  };

  return (
    <footer className="bg-[#12281B] text-[#FCFBF7] border-t border-[#27523D] pt-14 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter Signup Form (stores subscribers in Firestore 'subscribers' collection) */}
        <NewsletterSignup className="mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-10 pb-12 border-b border-[#27523D]/60">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <button
              onClick={() => onNavigate('home')}
              className="inline-block p-2 bg-[#F5F3E6] rounded-xl hover:opacity-95 transition-opacity text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8FA89B] shadow-sm"
              aria-label="DEBLOOM — Start where you are. Bloom from there."
            >
              <img
                src="/images/debloom-logo.png"
                alt="DEBLOOM — Start where you are. Bloom from there."
                className="h-12 sm:h-14 w-auto object-contain rounded-lg"
                width={1264}
                height={848}
              />
            </button>

            <p className="font-editorial italic text-base text-[#DCE7E1]/90 max-w-sm">
              "Start where you are. Bloom from there."
            </p>

            <p className="text-xs text-[#8FA89B] leading-relaxed max-w-md">
              A student-focused platform built to help young minds discover practical skills, 
              verified opportunities, legitimate resources, and life beyond the classroom.
            </p>

            <div className="pt-1 flex items-center gap-2 text-xs text-[#B9CAC0]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#C49B4B]" />
              <span>Nigerian roots. Global usefulness.</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8FA89B]">
              Discover & Learn
            </h4>
            <ul className="space-y-2 text-sm text-[#DCE7E1]">
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-white transition-colors">
                  Explore Hub
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('skills')} className="hover:text-white transition-colors">
                  Practical Skills
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('opportunities')} className="hover:text-white transition-colors">
                  Verified Opportunities
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('resources')} className="hover:text-white transition-colors">
                  Curated Resources
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('challenges')} className="hover:text-white transition-colors">
                  Bloom Challenges 🌱
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('blog')} className="hover:text-white transition-colors">
                  Guides & Articles
                </button>
              </li>
            </ul>
          </div>

          {/* Participate Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8FA89B]">
              Community & Action
            </h4>
            <ul className="space-y-2 text-sm text-[#DCE7E1]">
              <li>
                <button onClick={() => onNavigate('submit')} className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Submit to Debloom</span>
                  <span className="text-[10px] bg-[#27523D] px-1.5 py-0.2 rounded text-[#DCE7E1]">Open</span>
                </button>
              </li>
              <li>
                <a 
                  href={settings?.telegramUrl || 'https://t.me/DebloomHQ'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5 text-[#8FA89B]" />
                  <span>Telegram Alerts</span>
                  <ArrowUpRight className="w-3 h-3 text-[#8FA89B]" />
                </a>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
                  About Debloom & Debbie
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Transparency */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8FA89B]">
              Trust & Standards
            </h4>
            <p className="text-xs text-[#8FA89B] leading-relaxed">
              We never fabricate partnerships, statistics, or opportunities. We would rather publish fewer verified things than fill the site with unvetted claims.
            </p>
            <div className="pt-2">
              <button 
                onClick={() => onNavigate('submit')} 
                className="text-xs text-[#C49B4B] hover:underline block"
              >
                Report an error or suggestion →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8FA89B]">
          <div 
            onClick={handleCopyrightClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="flex items-center gap-2 select-none cursor-default"
          >
            <span>© {new Date().getFullYear()} Debloom. All rights reserved.</span>
            {isStealthUnlocked && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAdminLogin();
                }}
                className="ml-2 inline-flex items-center gap-1 text-[11px] text-[#C49B4B] hover:text-white transition-colors animate-in fade-in cursor-pointer"
                title="Admin Login"
              >
                <Lock className="w-3 h-3" />
                <span>Staff Portal</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
              Privacy Notice
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
              Terms of Use
            </button>
            <span>·</span>
            <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">
              Referral Disclosure
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
