import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
          <div className="max-w-md w-full bg-white rounded-default shadow-lg p-8 text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-50 text-danger rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-6">
              An unexpected error occurred in the application. Our team has been notified.
            </p>
            <Button 
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="w-full"
            >
              Refresh Page
            </Button>
            {((import.meta as any).env?.DEV) && this.state.error && (
              <div className="mt-6 p-4 bg-gray-50 rounded text-left overflow-auto text-xs text-danger font-mono">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
