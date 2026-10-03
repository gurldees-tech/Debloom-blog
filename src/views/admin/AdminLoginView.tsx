import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { AuthUser } from '../../types';
import { authService } from '../../services/storage';

interface AdminLoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
  onBackToHome: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onLoginSuccess,
  onBackToHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Invalid credentials. Please verify your password and try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E5E2D9] overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-[#E5E2D9] text-center bg-[#FCFBF7] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#163323] text-white flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-6 h-6 text-[#8FA89B]" />
          </div>
          <div>
            <h1 className="font-editorial text-2xl font-bold text-[#163323]">
              DEBLOOM Admin Portal
            </h1>
            <p className="text-xs text-[#57615C] mt-1">
              Private content management & moderation
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                htmlFor="page-admin-email" 
                className="block text-xs font-semibold text-[#1F2421] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-[#7B8681]" />
                <input
                  id="page-admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@debloom.org"
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-[#E5E2D9] bg-white text-[#1F2421] placeholder-[#7B8681] focus:outline-none focus:ring-1 focus:ring-[#163323] transition-all"
                />
              </div>
            </div>

            <div>
              <label 
                htmlFor="page-admin-password" 
                className="block text-xs font-semibold text-[#1F2421] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-[#7B8681]" />
                <input
                  id="page-admin-password"
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#163323] hover:bg-[#27523D] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Log In to Dashboard</span>
                )}
              </button>
            </div>
          </form>

          <div className="pt-4 border-t border-[#E5E2D9] flex items-center justify-between text-xs text-[#7B8681]">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-[#57615C] hover:text-[#163323] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Site</span>
            </button>
            <span>DEBLOOM 🌱</span>
          </div>
        </div>

      </div>
    </div>
  );
};
