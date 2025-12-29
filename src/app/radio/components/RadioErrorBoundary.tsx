'use client';

/**
 * Radio Error Boundary
 * Catches component errors and provides graceful recovery
 */

import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export default class RadioErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Radio Error Boundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleRefresh = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
                    <div className="max-w-md w-full">
                        {/* Glass card */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                            {/* Error icon with animation */}
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center animate-pulse">
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur opacity-30 animate-pulse" />
                                </div>
                            </div>

                            {/* Error message */}
                            <h2 className="text-2xl font-bold text-white text-center mb-2">
                                Something went wrong
                            </h2>
                            <p className="text-gray-400 text-center mb-6">
                                The radio player encountered an unexpected error. Don't worry, your listening history is safe.
                            </p>

                            {/* Error details (collapsible) */}
                            {this.state.error && (
                                <details className="mb-6 group">
                                    <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-400 transition-colors">
                                        View error details
                                    </summary>
                                    <div className="mt-2 p-3 bg-black/30 rounded-lg overflow-auto max-h-32">
                                        <code className="text-xs text-red-400 font-mono">
                                            {this.state.error.message}
                                        </code>
                                    </div>
                                </details>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={this.handleRetry}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={this.handleRefresh}
                                    className="py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/10"
                                >
                                    Refresh
                                </button>
                            </div>

                            {/* Help link */}
                            <p className="text-center text-gray-500 text-sm mt-6">
                                If the problem persists,{' '}
                                <a href="/" className="text-blue-400 hover:text-blue-300 underline">
                                    return to home
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
