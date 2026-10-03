import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Sprout, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Debloom Error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleHardReload = () => {
    try {
      // Clear potentially corrupt cached local state safely
      sessionStorage.clear();
    } catch (_) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FCFBF7] text-[#1F2421] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-[#E5E2D9] p-8 text-center space-y-6 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-[#E2ECE5] text-[#163323] flex items-center justify-center mx-auto">
              <Sprout className="w-7 h-7 text-[#163323]" />
            </div>

            <div className="space-y-2">
              <h1 className="font-editorial text-2xl font-bold text-[#163323]">
                Start where you are. 🌱
              </h1>
              <p className="text-xs sm:text-sm text-[#57615C] leading-relaxed">
                Something stumbled while loading this page, but your data and learning journey are completely safe.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleHardReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#163323] text-white text-xs font-semibold hover:bg-[#27523D] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-[#DCE7E1] text-[#163323] text-xs font-semibold hover:bg-[#F1F6F3] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return Home</span>
              </button>
            </div>

            <p className="text-[11px] text-[#7B8681] italic">
              "Don't just read. Do something with what you learn."
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
