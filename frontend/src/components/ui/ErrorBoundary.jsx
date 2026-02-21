'use client';
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

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
                    <div className="max-w-md w-full">
                        <Card variant="default" className="text-center">

                            {/* ── Icon badge ── */}
                            <div className="flex justify-center mb-6">
                                <div className="flex items-center justify-center
                                                w-12 h-12 rounded-md
                                                bg-rose-500/10 border border-rose-500/20
                                                text-rose-400">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                            </div>

                            {/* ── Status tag ── */}
                            <div className="flex justify-center mb-4">
                                <span className="inline-flex items-center gap-1.5
                                                 text-[10px] font-mono tracking-[0.18em] uppercase
                                                 text-rose-400/70 border border-rose-500/15
                                                 bg-rose-500/[0.06] px-3 py-1 rounded-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                    System Malfunction
                                </span>
                            </div>

                            {/* ── Heading ── */}
                            <h2 className="text-lg font-semibold text-white tracking-tight mb-2">
                                An unexpected error occurred
                            </h2>
                            <p className="text-sm text-white/30 font-mono leading-relaxed mb-6">
                                A critical error has been detected in this subsystem. Interface functionality has been interrupted.
                            </p>

                            {/* ── Error trace ── */}
                            {this.state.error && (
                                <div className="text-left rounded-md overflow-auto max-h-28
                                                bg-black/40 border border-white/[0.06]
                                                p-3 mb-6">
                                    <code className="text-[11px] text-rose-400/80 font-mono leading-relaxed break-all">
                                        {this.state.error.toString()}
                                    </code>
                                </div>
                            )}

                            {/* ── Action ── */}
                            <Button
                                variant="danger"
                                size="md"
                                onClick={this.handleReset}
                                leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                                className="mx-auto"
                            >
                                Reload System
                            </Button>

                        </Card>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;