/**
 * 反馈管理器
 * 微学宝盒 - 收集用户对游戏内容的反馈，用于质量改进和内容筛选
 */

import { STORAGE_KEYS } from '@/types/user';
import type { Feedback, FeedbackStats, FeedbackType } from '@/types/game';

/**
 * 反馈管理器类
 * 管理用户反馈的提交和同步
 */
export class FeedbackManager {
  private static instance: FeedbackManager;
  private readonly QUEUE_KEY = STORAGE_KEYS.FEEDBACK_QUEUE;
  private listeners: Set<(queue: Feedback[]) => void> = new Set();

  /**
   * 获取单例实例
   */
  static getInstance(): FeedbackManager {
    if (!FeedbackManager.instance) {
      FeedbackManager.instance = new FeedbackManager();
    }
    return FeedbackManager.instance;
  }

  /**
   * 提交反馈
   * @param feedback 反馈数据
   */
  async submitFeedback(feedback: Omit<Feedback, 'id' | 'timestamp' | 'status'>): Promise<void> {
    // 添加到本地队列
    const queue = this.getFeedbackQueue();
    const newFeedback: Feedback = {
      ...feedback,
      id: this.generateId(),
      timestamp: Date.now(),
      status: 'pending'
    };
    
    queue.push(newFeedback);

    // 保存到本地存储
    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.warn('保存反馈到本地存储失败:', error);
    }

    // 通知监听器
    this.notifyListeners(queue);

    // 尝试立即同步到服务器
    await this.syncToServer();
  }

  /**
   * 批量提交反馈
   * @param feedbacks 反馈数据数组
   */
  async submitFeedbackBatch(feedbacks: Omit<Feedback, 'id' | 'timestamp' | 'status'>[]): Promise<void> {
    const queue = this.getFeedbackQueue();
    
    const newFeedbacks: Feedback[] = feedbacks.map(feedback => ({
      ...feedback,
      id: this.generateId(),
      timestamp: Date.now(),
      status: 'pending'
    }));

    queue.push(...newFeedbacks);

    // 保存到本地存储
    try {
      localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.warn('保存反馈到本地存储失败:', error);
    }

    // 通知监听器
    this.notifyListeners(queue);

    // 尝试立即同步到服务器
    await this.syncToServer();
  }

  /**
   * 获取反馈队列
   * @returns 反馈数组
   */
  getFeedbackQueue(): Feedback[] {
    try {
      const queue = localStorage.getItem(this.QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch {
      return [];
    }
  }

  /**
   * 获取待同步的反馈
   * @returns 待同步的反馈数组
   */
  getPendingFeedback(): Feedback[] {
    const queue = this.getFeedbackQueue();
    return queue.filter(f => f.status === 'pending');
  }

  /**
   * 获取已同步的反馈
   * @returns 已同步的反馈数组
   */
  getSyncedFeedback(): Feedback[] {
    const queue = this.getFeedbackQueue();
    return queue.filter(f => f.status === 'synced');
  }

  /**
   * 清空反馈队列
   */
  clearQueue(): void {
    try {
      localStorage.removeItem(this.QUEUE_KEY);
    } catch (error) {
      console.warn('清空反馈队列失败:', error);
    }
    this.notifyListeners([]);
  }

  /**
   * 获取反馈统计
   * @param gameId 游戏ID
   * @returns 反馈统计
   */
  async getFeedbackStats(gameId: string): Promise<FeedbackStats> {
    try {
      const response = await fetch(`/api/games/${gameId}/feedback/stats`);
      
      if (!response.ok) {
        throw new Error('获取反馈统计失败');
      }

      return await response.json();
    } catch (error) {
      console.warn('获取反馈统计失败:', error);
      
      // 返回默认统计
      return {
        total: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        avgRating: 0,
        topReasons: []
      };
    }
  }

  /**
   * 获取用户反馈历史
   * @param userId 用户ID
   * @returns 反馈数组
   */
  async getUserFeedbackHistory(userId: string): Promise<Feedback[]> {
    try {
      const response = await fetch(`/api/users/${userId}/feedback`);
      
      if (!response.ok) {
        throw new Error('获取用户反馈历史失败');
      }

      return await response.json();
    } catch (error) {
      console.warn('获取用户反馈历史失败:', error);
      return [];
    }
  }

  /**
   * 订阅反馈队列变化
   * @param callback 回调函数
   * @returns 取消订阅函数
   */
  subscribe(callback: (queue: Feedback[]) => void): () => void {
    this.listeners.add(callback);
    
    // 立即通知当前状态
    callback(this.getFeedbackQueue());
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(queue: Feedback[]): void {
    this.listeners.forEach(callback => {
      try {
        callback(queue);
      } catch (error) {
        console.warn('通知反馈监听器失败:', error);
      }
    });
  }

  /**
   * 同步到服务器
   */
  async syncToServer(): Promise<void> {
    const queue = this.getFeedbackQueue();
    const pendingFeedback = queue.filter(f => f.status === 'pending');

    if (pendingFeedback.length === 0) return;

    try {
      const response = await fetch('/api/feedback/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feedbacks: pendingFeedback })
      });

      if (!response.ok) {
        throw new Error('同步反馈到服务器失败');
      }

      // 更新本地队列状态
      const updatedQueue = queue.map(f => {
        if (f.status === 'pending') {
          return { ...f, status: 'synced' as const, syncedAt: Date.now() };
        }
        return f;
      });

      try {
        localStorage.setItem(this.QUEUE_KEY, JSON.stringify(updatedQueue));
      } catch (error) {
        console.warn('更新反馈队列状态失败:', error);
      }

      // 通知监听器
      this.notifyListeners(updatedQueue);

    } catch (error) {
      console.warn('同步反馈到服务器失败:', error);
      // 失败时不抛出错误，因为本地已保存
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出单例实例
export const feedbackManager = FeedbackManager.getInstance();

export default feedbackManager;
