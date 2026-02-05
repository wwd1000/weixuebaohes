/**
 * 错误边界组件
 * 微学宝盒 - 捕获React组件错误
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text } from '@tarojs/components';
import { cn } from '@/lib/utils';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * 错误边界属性
 */
interface ErrorBoundaryProps {
  /** 子组件 */
  children: ReactNode;
  /** 自定义错误UI */
  fallback?: ReactNode;
  /** 错误回调 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * 错误边界状态
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 错误边界组件
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('组件错误:', error, errorInfo);
    
    // 发送错误报告
    this.reportError(error, errorInfo);
    
    // 调用错误回调
    this.props.onError?.(error, errorInfo);
  }

  /**
   * 发送错误报告
   */
  private reportError(error: Error, errorInfo: ErrorInfo): void {
    if (process.env.NODE_ENV === 'production') {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // 使用 sendBeacon 发送错误报告
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/monitoring/errors',
          JSON.stringify(errorReport)
        );
      }
    }
  }

  /**
   * 重试
   */
  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // 自定义错误UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

/**
 * 错误回退UI属性
 */
interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
}

/**
 * 错误回退UI
 */
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry }) => {
  return (
    <View 
      className={cn(
        'error-fallback',
        'flex flex-col items-center justify-center',
        'min-h-[300px] p-8',
        'bg-gray-50 rounded-2xl'
      )}
    >
      {/* 错误图标 */}
      <View className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertTriangle size={32} className="text-red-500" />
      </View>

      {/* 错误标题 */}
      <Text className="text-xl font-bold text-gray-900 mb-2">
        抱歉，出现了错误
      </Text>

      {/* 错误信息 */}
      {error && (
        <Text className="text-sm text-gray-500 text-center mb-6 max-w-md">
          {error.message}
        </Text>
      )}

      {/* 重试按钮 */}
      <View
        className={cn(
          'inline-flex items-center gap-2',
          'px-6 py-3 rounded-xl',
          'bg-blue-500 text-white',
          'font-medium transition-all duration-200',
          'hover:bg-blue-600 active:scale-98',
          'cursor-pointer'
        )}
        onClick={onRetry}
      >
        <RefreshCw size={18} />
        <Text>重试</Text>
      </View>
    </View>
  );
};

/**
 * 页面级错误边界
 */
export class PageErrorBoundary extends ErrorBoundary {
  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View className="min-h-screen flex items-center justify-center p-4">
          <ErrorFallback 
            error={this.state.error} 
            onRetry={this.handleRetry} 
          />
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
