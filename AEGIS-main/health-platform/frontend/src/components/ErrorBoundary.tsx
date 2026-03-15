import React from 'react';

interface State { hasError: boolean; error: Error | null; info: React.ErrorInfo | null; }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
    constructor(props: React.PropsWithChildren) {
        super(props);
        this.state = { hasError: false, error: null, info: null };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        this.setState({ info });
        console.error('[ErrorBoundary] Caught error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ minHeight: '100vh', background: '#020617', color: '#e2e8f0', fontFamily: 'monospace', padding: '2rem' }}>
                    <h1 style={{ color: '#f87171', fontSize: '1.5rem', marginBottom: '1rem' }}>⚠ Application Error</h1>
                    <p style={{ marginBottom: '0.5rem' }}><strong>Message:</strong> {this.state.error?.message}</p>
                    <pre style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', overflowX: 'auto', fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {this.state.error?.stack}
                    </pre>
                    <pre style={{ marginTop: '1rem', background: '#0f172a', padding: '1rem', borderRadius: '8px', overflowX: 'auto', fontSize: '0.75rem', color: '#64748b', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {this.state.info?.componentStack}
                    </pre>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null, info: null })}
                        style={{ marginTop: '1.5rem', padding: '0.5rem 1.5rem', background: '#3b82f6', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer' }}
                    >
                        Retry
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
