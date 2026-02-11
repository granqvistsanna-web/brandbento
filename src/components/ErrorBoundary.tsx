import { Component, type ReactNode, type ErrorInfo } from 'react';
import { RiRefreshFill as RotateCcw } from 'react-icons/ri';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="h-full w-full rounded-xl flex flex-col items-center justify-center gap-3 border border-dashed"
          style={{
            backgroundColor: 'var(--canvas-surface)',
            borderColor: 'var(--canvas-border)',
            padding: 'clamp(16px, 6%, 32px)',
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: 'var(--sidebar-bg-active)',
              color: 'var(--sidebar-text-muted)',
            }}
          >
            <RotateCcw size={18} />
          </div>
          <span
            className="text-11 font-medium"
            style={{ color: 'var(--sidebar-text-muted)' }}
          >
            Tile error
          </span>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-10 px-3 py-1 rounded-md transition-colors"
            style={{
              backgroundColor: 'var(--sidebar-bg-hover)',
              color: 'var(--sidebar-text)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--sidebar-bg-active)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--sidebar-bg-hover)';
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
