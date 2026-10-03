import React, { useState } from 'react';
import { ShieldCheck, X, Lock, Mail, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { AuthUser } from '../../types';
import { authService } from '../../services/storage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your administrator password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authService.login(email, password);
      setIsLoading(false);
      setPassword('');
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Invalid credentials. Please verify your password and try again.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12281B]/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#FCFBF7] rounded-2xl shadow-2xl border border-[#E5E2D9] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E5E2D9] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#163323] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#8FA89B]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#163323] font-editorial">
                Debloom CMS Portal
              </h3>
              <p className="text-xs text-[#7B8681]">
                Administrator authentication
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close login dialog"
            className="p-1.5 rounded-lg text-[#7B8681] hover:text-[#1F2421] hover:bg-[#F1F6F3] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-[#57615C] leading-relaxed">
            Please enter your administrator credentials to manage published guides, verified opportunities, and student submissions.
          </p>

          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label 
                htmlFor="admin-email" 
                className="block text-xs font-semibold text-[#1F2421] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#7B8681]" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@debloom.org"
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-[#E5E2D9] bg-white text-[#1F2421] placeholder-[#7B8681] focus:outline-none focus:ring-1 focus:ring-[#163323] transition-all"
                />
              </div>
            </div>

            {/* Password Field with Mask and Toggle */}
            <div>
              <label 
                htmlFor="admin-password" 
                className="block text-xs font-semibold text-[#1F2421] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#7B8681]" />
                <input
                  id="admin-password"
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-[#E5E2D9] bg-white text-[#1F2421] placeholder-[#7B8681] focus:outline-none focus:ring-1 focus:ring-[#163323] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-2.5 p-1 text-[#7B8681] hover:text-[#1F2421] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#163323] hover:bg-[#27523D] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying credentials...</span>
                  </>
                ) : (
                  <span>Sign In to Admin Dashboard</span>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="px-6 py-3 bg-[#F7F5EE] border-t border-[#E5E2D9] text-center">
          <p className="text-[11px] text-[#7B8681]">
            Protected CMS area · Sessions expire after period of inactivity
          </p>
        </div>
      </div>
    </div>
  );
};
