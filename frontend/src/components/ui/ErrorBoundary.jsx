'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] w-full flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-zinc-900/50 border border-red-500/20 rounded-xl p-8 text-center backdrop-blur-sm">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>

                        <h2 className="text-xl font-bold text-white mb-2">
                            System Malfunction
                        </h2>

                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            A critical error has occurred in this subsystem. The interface functionality has been interrupted.
                        </p>

                        <div className="bg-black/30 rounded p-3 mb-6 text-left overflow-auto max-h-32 border border-white/5">
                            <code className="text-xs text-red-400 font-mono">
                                {this.state.error && this.state.error.toString()}
                            </code>
                        </div>

                        <button
                            onClick={this.handleReset}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium text-sm"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Reload System
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
