import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 my-6 rounded-3xl bg-[#131622] border border-amber-500/40 text-center text-white space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="font-heading font-black text-xl text-white">
            {this.props.fallbackTitle || 'Component Temporarily Paused'}
          </h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            {this.props.fallbackMessage || 'An unexpected issue occurred while rendering this interactive element. The rest of the site is working normally.'}
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-charithra-black bg-gradient-to-r from-amber-400 to-yellow-300 hover:shadow-gold-glow transition inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Component</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
