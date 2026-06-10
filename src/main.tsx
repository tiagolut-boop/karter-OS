import React, {StrictMode, ErrorInfo, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled exception:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div id="error-page" className="container-fluid pb-4 bg-blue p-8 flex flex-col items-center justify-center min-h-screen text-slate-100 font-sans" style={{ background: '#020617' }}>
          <div id="col-1" className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
            <h1 className="text-xl font-bold text-red-500 mb-2">Desculpe, ocorreu um erro inesperado</h1>
            <p className="text-sm text-slate-400 mb-4 font-normal">
              O sistema KarterOS encontrou um erro excepcional e precisou ser interrompido temporariamente.
            </p>
            <div className="bg-slate-950 p-4 rounded border border-white/5 text-xs font-mono text-slate-300 break-all mb-4 overflow-x-auto max-h-60">
              {this.state.error?.toString() || "Erro sem mensagem detalhada"}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-semibold text-xs transition duration-150 cursor-pointer"
            >
              Recarregar Sistema
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
