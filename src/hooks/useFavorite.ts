/**
 * 收藏Hook
 * 微学宝盒 - 提供收藏功能的React Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { favoriteManager } from '@/services/FavoriteManager';

/**
 * 收藏Hook返回值
 */
export interface UseFavoriteReturn {
  /** 收藏列表 */
  favorites: string[];
  /** 收藏数量 */
  count: number;
  /** 是否已收藏 */
  isFavorited: (gameId: string) => boolean;
  /** 添加收藏 */
  addFavorite: (gameId: string) => Promise<void>;
  /** 移除收藏 */
  removeFavorite: (gameId: string) => Promise<void>;
  /** 切换收藏状态 */
  toggleFavorite: (gameId: string) => Promise<boolean>;
  /** 清空收藏 */
  clearFavorites: () => Promise<void>;
  /** 是否加载中 */
  loading: boolean;
}

/**
 * 收藏Hook
 * 
 * @example
 * ```tsx
 * const { favorites, isFavorited, toggleFavorite } = useFavorite();
 * 
 * return (
 *   <button onClick={() => toggleFavorite('game-123')}>
 *     {isFavorited('game-123') ? '已收藏' : '收藏'}
 *   </button>
 * );
 * ```
 */
export function useFavorite(): UseFavoriteReturn {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 订阅收藏变化
  useEffect(() => {
    const unsubscribe = favoriteManager.subscribe((newFavorites) => {
      setFavorites(newFavorites);
    });

    return unsubscribe;
  }, []);

  /**
   * 检查是否已收藏
   */
  const isFavorited = useCallback((gameId: string): boolean => {
    return favorites.includes(gameId);
  }, [favorites]);

  /**
   * 添加收藏
   */
  const addFavorite = useCallback(async (gameId: string): Promise<void> => {
    setLoading(true);
    try {
      await favoriteManager.addToFavorites(gameId);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 移除收藏
   */
  const removeFavorite = useCallback(async (gameId: string): Promise<void> => {
    setLoading(true);
    try {
      await favoriteManager.removeFromFavorites(gameId);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 切换收藏状态
   */
  const toggleFavorite = useCallback(async (gameId: string): Promise<boolean> => {
    setLoading(true);
    try {
      return await favoriteManager.toggleFavorite(gameId);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 清空收藏
   */
  const clearFavorites = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await favoriteManager.clearFavorites();
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    favorites,
    count: favorites.length,
    isFavorited,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    loading
  };
}

/**
 * 单个游戏收藏状态Hook
 * 
 * @param gameId 游戏ID
 * @returns 收藏状态和操作
 */
export function useGameFavorite(gameId: string) {
  const { isFavorited, toggleFavorite, loading } = useFavorite();
  const [isAnimating, setIsAnimating] = useState(false);

  const favorited = isFavorited(gameId);

  /**
   * 处理收藏切换
   */
  const handleToggle = useCallback(async () => {
    if (isAnimating || loading) return;

    setIsAnimating(true);
    
    const newState = await toggleFavorite(gameId);
    
    // 触发飞行动画
    if (newState) {
      triggerFlyAnimation(gameId);
    }

    setTimeout(() => setIsAnimating(false), 300);

    return newState;
  }, [gameId, toggleFavorite, loading, isAnimating]);

  return {
    isFavorited: favorited,
    toggleFavorite: handleToggle,
    loading: loading || isAnimating
  };
}

/**
 * 触发收藏飞行动画
 */
function triggerFlyAnimation(gameId: string): void {
  if (typeof window === 'undefined') return;

  // 触发自定义事件
  const event = new CustomEvent('favorite:fly', {
    detail: { gameId }
  });
  window.dispatchEvent(event);
}

export default useFavorite;
