/**
 * 性能优化工具
 * 微学宝盒 - 性能监控和优化
 */

import { storageManager } from '@/services/StorageManager';

/**
 * 性能监控服务
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  /**
   * 获取单例实例
   */
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 记录性能指标
   * @param metric 指标名称
   * @param value 指标值
   */
  record(metric: string, value: number): void {
    if (!this.metrics.has(metric)) {
      this.metrics.set(metric, []);
    }
    
    const values = this.metrics.get(metric)!;
    values.push(value);
    
    // 只保留最近100条记录
    if (values.length > 100) {
      values.shift();
    }

    // 发送到监控服务
    this.sendToMonitoring(metric, value);
  }

  /**
   * 获取性能指标平均值
   * @param metric 指标名称
   * @returns 平均值
   */
  getAverage(metric: string): number {
    const values = this.metrics.get(metric);
    if (!values || values.length === 0) return 0;
    
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * 获取性能指标统计
   * @param metric 指标名称
   * @returns 统计信息
   */
  getStats(metric: string): {
    count: number;
    average: number;
    min: number;
    max: number;
  } {
    const values = this.metrics.get(metric) || [];
    
    if (values.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0 };
    }

    return {
      count: values.length,
      average: this.getAverage(metric),
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }

  /**
   * 测量函数执行时间
   * @param fn 要测量的函数
   * @param metric 指标名称
   * @returns 函数结果
   */
  async measure<T>(fn: () => Promise<T>, metric: string): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      this.record(metric, duration);
    }
  }

  /**
   * 测量同步函数执行时间
   * @param fn 要测量的函数
   * @param metric 指标名称
   * @returns 函数结果
   */
  measureSync<T>(fn: () => T, metric: string): T {
    const start = performance.now();
    try {
      return fn();
    } finally {
      const duration = performance.now() - start;
      this.record(metric, duration);
    }
  }

  /**
   * 发送到监控服务
   */
  private sendToMonitoring(metric: string, value: number): void {
    // 只在生产环境发送
    if (process.env.NODE_ENV === 'production') {
      const sessionId = storageManager.getSessionId();
      
      // 使用 sendBeacon 发送（页面卸载时也能发送）
      if (navigator.sendBeacon) {
        const data = JSON.stringify({
          metric,
          value,
          timestamp: Date.now(),
          sessionId
        });
        navigator.sendBeacon('/api/monitoring/performance', data);
      }
    }
  }

  /**
   * 清除所有指标
   */
  clear(): void {
    this.metrics.clear();
  }
}

// 导出单例实例
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * 防抖函数
 * @param fn 原函数
 * @param delay 延迟时间
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }
    
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * 节流函数
 * @param fn 原函数
 * @param limit 限制时间
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * 图片懒加载Hook
 * @returns 懒加载配置
 */
export function useLazyImage() {
  const observe = (element: HTMLImageElement, src: string): void => {
    if (!('IntersectionObserver' in window)) {
      // 不支持 IntersectionObserver，直接加载
      element.src = src;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.src = src;
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    observer.observe(element);
  };

  return { observe };
}

/**
 * 虚拟列表配置
 * @param itemHeight 每项高度
 * @param containerHeight 容器高度
 * @param totalItems 总项数
 * @param scrollTop 滚动位置
 * @returns 可见范围配置
 */
export function getVirtualListConfig(
  itemHeight: number,
  containerHeight: number,
  totalItems: number,
  scrollTop: number
): {
  startIndex: number;
  endIndex: number;
  offsetY: number;
  totalHeight: number;
} {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 2);
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 4;
  const endIndex = Math.min(totalItems, startIndex + visibleCount);
  const offsetY = startIndex * itemHeight;
  const totalHeight = totalItems * itemHeight;

  return {
    startIndex,
    endIndex,
    offsetY,
    totalHeight
  };
}

export default performanceMonitor;
