/**
 * API错误处理工具
 * 微学宝盒 - 统一的API错误处理
 */

import { storageManager } from '@/services/StorageManager';

/**
 * API错误处理类
 */
export class ApiErrorHandler {
  /**
   * 处理API错误
   * @param error 错误对象
   * @param context 错误上下文
   */
  static handleApiError(error: unknown, context: string): void {
    console.error(`API错误 [${context}]:`, error);

    // 解析错误
    const apiError = this.parseError(error);

    // 根据错误类型处理
    switch (apiError.statusCode) {
      case 401:
        this.handleUnauthorized();
        break;
      case 403:
        this.handleForbidden();
        break;
      case 404:
        this.handleNotFound(context);
        break;
      case 422:
        this.handleValidationError(apiError);
        break;
      case 429:
        this.handleRateLimit();
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        this.handleServerError();
        break;
      default:
        this.showErrorMessage(apiError.message || '操作失败，请重试');
    }
  }

  /**
   * 解析错误
   */
  private static parseError(error: unknown): {
    statusCode?: number;
    message: string;
    details?: Record<string, string[]>;
  } {
    if (error instanceof Response) {
      return {
        statusCode: error.status,
        message: error.statusText
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message
      };
    }

    if (typeof error === 'object' && error !== null) {
      const err = error as Record<string, unknown>;
      return {
        statusCode: err.statusCode as number,
        message: (err.message as string) || '未知错误',
        details: err.details as Record<string, string[]>
      };
    }

    return {
      message: '未知错误'
    };
  }

  /**
   * 处理未授权错误
   */
  private static handleUnauthorized(): void {
    // 清除用户数据
    storageManager.clearUserToken();
    storageManager.clearUserInfo();

    // 显示提示
    this.showErrorMessage('登录已过期，请重新登录');

    // 跳转到登录页（需要路由支持）
    setTimeout(() => {
      window.location.href = '/login';
    }, 1500);
  }

  /**
   * 处理禁止访问错误
   */
  private static handleForbidden(): void {
    this.showErrorMessage('您没有权限执行此操作');
  }

  /**
   * 处理资源不存在错误
   */
  private static handleNotFound(context: string): void {
    this.showErrorMessage(`请求的资源不存在: ${context}`);
  }

  /**
   * 处理验证错误
   */
  private static handleValidationError(error: {
    message: string;
    details?: Record<string, string[]>;
  }): void {
    if (error.details) {
      const messages = Object.values(error.details).flat();
      this.showErrorMessage(messages.join('，'));
    } else {
      this.showErrorMessage(error.message || '数据验证失败');
    }
  }

  /**
   * 处理频率限制错误
   */
  private static handleRateLimit(): void {
    this.showErrorMessage('操作太频繁，请稍后再试');
  }

  /**
   * 处理服务器错误
   */
  private static handleServerError(): void {
    this.showModal({
      title: '服务异常',
      content: '服务器暂时不可用，请稍后重试',
      confirmText: '知道了'
    });
  }

  /**
   * 显示错误消息
   */
  private static showErrorMessage(message: string): void {
    // 使用toast显示错误
    if (typeof window !== 'undefined') {
      // 触发自定义toast事件
      const event = new CustomEvent('app:toast', {
        detail: {
          type: 'error',
          message,
          duration: 3000
        }
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * 显示模态框
   */
  private static showModal(options: {
    title: string;
    content: string;
    confirmText: string;
  }): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('app:modal', {
        detail: options
      });
      window.dispatchEvent(event);
    }
  }
}

/**
 * 包装API请求
 * @param requestFn 请求函数
 * @param context 错误上下文
 * @returns 请求结果
 */
export async function apiRequest<T>(
  requestFn: () => Promise<T>,
  context: string
): Promise<T | null> {
  try {
    return await requestFn();
  } catch (error) {
    ApiErrorHandler.handleApiError(error, context);
    return null;
  }
}

export default ApiErrorHandler;
