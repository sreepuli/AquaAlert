import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600">
                The application encountered an error and couldn't render
                properly.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-gray-800 mb-2">
                Error Details:
              </h2>
              <p className="text-sm text-red-600 font-mono">
                {this.state.error && this.state.error.toString()}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-gray-800 mb-2">Stack Trace:</h2>
              <pre className="text-xs text-gray-600 overflow-auto max-h-32">
                {this.state.errorInfo.componentStack}
              </pre>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
