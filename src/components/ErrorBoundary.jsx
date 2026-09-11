import { Component } from 'react';

// Global React error boundary — catches render-time errors anywhere below it
// so a single broken page/component never blanks the whole app.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught UI error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-luxe-gradient px-6">
          <div className="card max-w-md w-full text-center p-10">
            <h1 className="page-title mb-3">Something went wrong</h1>
            <p className="text-charcoal-500 mb-6">
              An unexpected error occurred. Please refresh the page or try again shortly.
            </p>
            <button className="btn-primary" onClick={() => window.location.reload()}>
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
