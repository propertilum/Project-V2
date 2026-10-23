import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[CardHub ErrorBoundary caught an error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center p-6 text-[#F5F5F7] text-center font-sans">
          <div className="max-w-md w-full bg-[#1C1C1E] border border-[#38383A] rounded-[16px] p-8 shadow-2xl space-y-5">
            <div className="w-12 h-12 bg-[#FF453A]/15 border border-[#FF453A]/30 rounded-[12px] flex items-center justify-center mx-auto text-[#FF453A]">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold text-white mb-1.5">Something went wrong</h2>
              <p className="text-[12px] text-[#8E8E93] leading-relaxed">
                An unexpected error occurred while rendering the interface.
              </p>
            </div>
            {this.state.error?.message && (
              <div className="bg-[#2C2C2E] border border-[#38383A] rounded-[8px] p-3 text-[11px] font-mono text-[#FF453A] text-left overflow-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 bg-[#0A84FF] hover:bg-[#0071E3] active:scale-[0.98] text-white font-medium rounded-[8px] transition flex items-center justify-center gap-2 text-[13px]"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
