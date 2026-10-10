import React, { useState, useRef } from 'react';
import { 
  Sprout, 
  Search, 
  Send, 
  Menu, 
  X, 
  ShieldCheck, 
  PlusCircle,
  Compass,
  BookOpen,
  Award,
  BookmarkCheck,
  Target,
  Sparkles,
  Lock
} from 'lucide-react';
import { SiteSettings, AuthUser } from '../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  settings: SiteSettings;
  currentUser: AuthUser | null;
  isStealthUnlocked?: boolean;
  onToggleStealth?: () => void;
  onOpenSearch: () => void;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  settings,
  currentUser,
  isStealthUnlocked = false,
  onToggleStealth,
  onOpenSearch,
  onOpenAdminLogin,
  onLogoutAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Stealth mode tap tracker for phone users (5 rapid taps or 2-sec hold on logo)
  const tapCountRef = useRef(0);
  const lastTapTimeRef = useRef(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([40, 60, 40]); } catch (_) {}
      }
      if (onToggleStealth) {
        onToggleStealth();
      } else {
        onOpenAdminLogin();
      }
    }, 1800);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTapTimeRef.current < 700) {
      tapCountRef.current += 1;
    } else {
      tapCountRef.current = 1;
    }
    lastTapTimeRef.current = now;

    if (tapCountRef.current >= 3) {
      e.preventDefault();
      tapCountRef.current = 0;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([40, 60, 40]); } catch (_) {}
      }
      if (onToggleStealth) {
        onToggleStealth();
      } else {
        onOpenAdminLogin();
      }
      return;
    }

    handleNav('home');
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore' },
    { id: 'skills', label: 'Skills' },
    { id: 'opportunities', label: 'Opportunities' },
    { id: 'resources', label: 'Resources' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'blog', label: 'Blog' },
    { id: 'about', label: 'About' },
  ];

  const handleNav = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FCFBF7]/95 backdrop-blur-md border-b border-[#E5E2D9] transition-all">
      {/* Top micro-banner if announcement is present */}
      {settings?.announcementNotice && (
        <div className="bg-[#163323] text-[#FCFBF7] text-xs py-1.5 px-4 text-center font-normal tracking-wide flex items-center justify-center gap-2">
          <span>{settings.announcementNotice}</span>
          <a 
            href={settings?.telegramUrl || 'https://t.me/DebloomHQ'} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline underline-offset-2 hover:text-[#C49B4B] transition-colors ml-1 font-medium"
          >
            Join Telegram →
          </a>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button 
              onClick={handleLogoClick}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="group flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#163323] rounded-md py-1"
              aria-label="DEBLOOM — Start where you are. Bloom from there."
            >
              <img 
                src="/images/debloom-logo.png" 
                alt="DEBLOOM — Start where you are. Bloom from there." 
                className="h-10 sm:h-12 md:h-13 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                width={1264}
                height={848}
                loading="eager"
              />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navItems.map((item) => {
                const isActive = currentView === item.id || 
                  (item.id === 'skills' && currentView === 'blog' && false);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors relative ${
                      isActive 
                        ? 'text-[#163323] font-semibold' 
                        : 'text-[#57615C] hover:text-[#163323]'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#163323] rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 sm:px-3 sm:py-1.5 text-[#57615C] hover:text-[#163323] hover:bg-[#EFECE1]/60 rounded-lg text-sm flex items-center gap-2 transition-colors border border-transparent hover:border-[#E5E2D9]"
              title="Search Debloom (Cmd + K)"
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline text-xs text-[#7B8681]">Search</span>
              <kbd className="hidden md:inline text-[10px] bg-[#EFECE1] text-[#57615C] px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </button>

            {/* Submit to Debloom CTA */}
            <button
              onClick={() => handleNav('submit')}
              className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                currentView === 'submit'
                  ? 'bg-[#163323] text-white border-[#163323]'
                  : 'bg-white text-[#163323] border-[#DCE7E1] hover:bg-[#F1F6F3]'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#27523d]" />
              <span>Submit</span>
            </button>

            {/* Telegram Channel CTA */}
            <a
              href={settings.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#163323] text-[#FCFBF7] hover:bg-[#27523d] transition-colors shadow-xs"
              title="Join Debloom Telegram"
            >
              <Send className="w-3.5 h-3.5 text-[#8FA89B]" />
              <span className="hidden sm:inline">Telegram</span>
            </a>

            {/* Logged in Admin or Writer indicator */}
            {currentUser && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleNav('admin')}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-[#E2ECE5] text-[#163323] hover:bg-[#d4e4db] transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#27523d]" />
                  <span className="capitalize">{currentUser.role}</span>
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className="text-xs text-[#7B8681] hover:text-[#163323] px-1.5 py-1"
                  title="Sign out of CMS"
                >
                  Exit
                </button>
              </div>
            )}

            {/* When stealth mode is toggled visible by admin and unauthenticated */}
            {!currentUser && isStealthUnlocked && (
              <button
                onClick={onOpenAdminLogin}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#163323] text-white hover:bg-[#27523d] transition-colors shadow-xs animate-in fade-in"
                title="Admin Login"
              >
                <Lock className="w-3.5 h-3.5 text-[#8FA89B]" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#1F2421] hover:bg-[#EFECE1] rounded-lg transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E5E2D9] bg-[#FCFBF7] px-4 pt-3 pb-6 space-y-2 animate-in fade-in duration-150">
          <div className="grid grid-cols-2 gap-1 mb-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'bg-[#163323] text-white'
                    : 'text-[#1F2421] hover:bg-[#EFECE1]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E5E2D9] flex flex-col gap-2">
            <button
              onClick={() => handleNav('submit')}
              className="w-full text-center px-4 py-2.5 text-sm font-medium text-[#163323] bg-white border border-[#DCE7E1] rounded-lg hover:bg-[#F1F6F3]"
            >
              + Submit an Opportunity or Resource
            </button>
            <a
              href={settings.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-[#163323] rounded-lg hover:bg-[#27523d] flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4 text-[#8FA89B]" />
              Join Debloom on Telegram
            </a>
            {!currentUser && isStealthUnlocked && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminLogin();
                }}
                className="w-full text-center px-4 py-2.5 text-sm font-semibold text-white bg-[#27523D] rounded-lg hover:bg-[#163323] flex items-center justify-center gap-2 animate-in fade-in"
              >
                <Lock className="w-4 h-4 text-[#8FA89B]" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
