import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertBanner } from './AlertBanner';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ROUTE_RENDER_FAILED', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="p-6">
          <AlertBanner
            tone="danger"
            title="页面渲染失败"
            message="当前路由组件发生异常，请刷新页面或切换到其他分析视图。"
          />
        </main>
      );
    }

    return this.props.children;
  }
}
