/**
 * 反馈Hook
 * 微学宝盒 - 提供反馈功能的React Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { feedbackManager } from '@/services/FeedbackManager';
import type { Feedback, FeedbackStats, FeedbackType } from '@/types/game';

/**
 * 反馈Hook返回值
 */
export interface UseFeedbackReturn {
  /** 提交反馈 */
  submitFeedback: (feedback: Omit<Feedback, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  /** 批量提交反馈 */
  submitBatch: (feedbacks: Omit<Feedback, 'id' | 'timestamp' | 'status'>[]) => Promise<void>;
  /** 获取反馈统计 */
  getStats: (gameId: string) => Promise<FeedbackStats>;
  /** 获取用户反馈历史 */
  getHistory: (userId: string) => Promise<Feedback[]>;
  /** 待同步的反馈数量 */
  pendingCount: number;
  /** 是否加载中 */
  loading: boolean;
  /** 错误信息 */
  error: Error | null;
}

/**
 * 反馈Hook
 * 
 * @example
 * ```tsx
 * const { submitFeedback, getStats } = useFeedback();
 * 
 * const handleSubmit = async () => {
 *   await submitFeedback({
 *     gameId: 'game-123',
 *     type: 'positive'
 *   });
 * };
 * ```
 */
export function useFeedback(): UseFeedbackReturn {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 订阅反馈队列变化
  useEffect(() => {
    const unsubscribe = feedbackManager.subscribe((queue) => {
      setPendingCount(queue.filter(f => f.status === 'pending').length);
    });

    return unsubscribe;
  }, []);

  /**
   * 提交反馈
   */
  const submitFeedback = useCallback(async (
    feedback: Omit<Feedback, 'id' | 'timestamp' | 'status'>
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await feedbackManager.submitFeedback(feedback);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('提交反馈失败');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 批量提交反馈
   */
  const submitBatch = useCallback(async (
    feedbacks: Omit<Feedback, 'id' | 'timestamp' | 'status'>[]
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await feedbackManager.submitFeedbackBatch(feedbacks);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('批量提交反馈失败');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 获取反馈统计
   */
  const getStats = useCallback(async (gameId: string): Promise<FeedbackStats> => {
    setLoading(true);
    setError(null);
    
    try {
      const stats = await feedbackManager.getFeedbackStats(gameId);
      return stats;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('获取反馈统计失败');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 获取用户反馈历史
   */
  const getHistory = useCallback(async (userId: string): Promise<Feedback[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const history = await feedbackManager.getUserFeedbackHistory(userId);
      return history;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('获取反馈历史失败');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    submitFeedback,
    submitBatch,
    getStats,
    getHistory,
    pendingCount,
    loading,
    error
  };
}

/**
 * 游戏反馈Hook
 * 针对单个游戏的反馈管理
 * 
 * @param gameId 游戏ID
 */
export function useGameFeedback(gameId: string) {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(false);
  const { submitFeedback, getStats } = useFeedback();

  /**
   * 加载反馈统计
   */
  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStats(gameId);
      setStats(data);
    } finally {
      setLoading(false);
    }
  }, [gameId, getStats]);

  // 初始加载
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  /**
   * 提交反馈
   */
  const submit = useCallback(async (
    type: FeedbackType,
    reason?: string,
    details?: string
  ): Promise<void> => {
    await submitFeedback({
      gameId,
      type,
      reason,
      details
    });
    
    // 重新加载统计
    await loadStats();
  }, [gameId, submitFeedback, loadStats]);

  return {
    stats,
    loading,
    submit,
    refresh: loadStats
  };
}

export default useFeedback;
