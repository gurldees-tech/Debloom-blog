import React from 'react';
import { Sprout, Send, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';
import { SiteSettings } from '../types';

interface FooterProps {
  onNavigate: (view: string) => void;
  settings: SiteSettings;
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, settings, onOpenAdminLogin }) => {
  return (
    <footer className="bg-[#12281B] text-[#FCFBF7] border-t border-[#27523D] pt-14 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-10 pb-12 border-b border-[#27523D]/60">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#8FA89B] text-[#12281B] flex items-center justify-center font-bold">
                <Sprout className="w-4 h-4 text-[#12281B]" />
              </div>
              <span className="font-editorial text-2xl font-bold tracking-tight text-white">
                DEBLOOM 🌱
              </span>
            </div>

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
                  href={settings.telegramUrl} 
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
          <div>
            © {new Date().getFullYear()} Debloom. All rights reserved.
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
            <span>·</span>
            <button 
              onClick={onOpenAdminLogin} 
              className="text-[#B9CAC0] hover:text-[#C49B4B] transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Admin & Writer CMS</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
