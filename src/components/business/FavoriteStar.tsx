/**
 * 收藏星标组件
 * 微学宝盒 - 收藏按钮组件，带飞行动画效果
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import { favoriteManager } from '@/services/FavoriteManager';

/**
 * 收藏星标组件属性
 */
export interface FavoriteStarProps {
  /** 游戏ID */
  gameId: string;
  /** 是否已收藏 */
  isFavorited?: boolean;
  /** 切换回调 */
  onToggle?: (gameId: string, newState: boolean) => void;
  /** 大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 是否显示动画 */
  animated?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 收藏星标组件
 * 
 * @example
 * ```tsx
 * <FavoriteStar 
 *   gameId="game-123"
 *   onToggle={(id, state) => console.log('收藏状态:', id, state)}
 * />
 * ```
 */
export const FavoriteStar: React.FC<FavoriteStarProps> = ({
  gameId,
  isFavorited: propIsFavorited,
  onToggle,
  size = 'md',
  animated = true,
  className
}) => {
  // 内部状态
  const [isFavorited, setIsFavorited] = useState(propIsFavorited ?? false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFlyAnimation, setShowFlyAnimation] = useState(false);

  // 同步外部属性
  useEffect(() => {
    if (propIsFavorited !== undefined) {
      setIsFavorited(propIsFavorited);
    }
  }, [propIsFavorited]);

  // 订阅收藏变化
  useEffect(() => {
    const unsubscribe = favoriteManager.subscribe((favorites) => {
      setIsFavorited(favorites.includes(gameId));
    });

    return unsubscribe;
  }, [gameId]);

  // 监听飞行动画事件
  useEffect(() => {
    const handleFlyAnimation = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.gameId === gameId) {
        setShowFlyAnimation(true);
        setTimeout(() => setShowFlyAnimation(false), 1000);
      }
    };

    window.addEventListener('favorite:fly', handleFlyAnimation);
    return () => window.removeEventListener('favorite:fly', handleFlyAnimation);
  }, [gameId]);

  /**
   * 处理切换
   */
  const handleToggle = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isAnimating) return;

    setIsAnimating(true);

    try {
      const newState = await favoriteManager.toggleFavorite(gameId);
      setIsFavorited(newState);
      
      if (newState && animated) {
        setShowFlyAnimation(true);
        setTimeout(() => setShowFlyAnimation(false), 1000);
      }
      
      onToggle?.(gameId, newState);
    } catch (error) {
      console.error('切换收藏失败:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [gameId, isAnimating, animated, onToggle]);

  /**
   * 获取尺寸配置
   */
  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return { button: 'w-7 h-7', icon: 14 };
      case 'lg':
        return { button: 'w-11 h-11', icon: 22 };
      case 'md':
      default:
        return { button: 'w-9 h-9', icon: 18 };
    }
  };

  const sizeConfig = getSizeConfig();

  return (
    <View className={cn('relative', className)}>
      {/* 飞行动画元素 */}
      {showFlyAnimation && (
        <View 
          className={cn(
            'fly-animation',
            'absolute inset-0 pointer-events-none',
            'flex items-center justify-center'
          )}
        >
          <View 
            className={cn(
              'fly-star',
              'text-amber-400',
              'animate-fly-to-collection'
            )}
          >
            <Star size={sizeConfig.icon} className="fill-amber-400" />
          </View>
        </View>
      )}

      {/* 主按钮 */}
      <View
        className={cn(
          'favorite-star',
          sizeConfig.button,
          'rounded-full flex items-center justify-center',
          'transition-all duration-200',
          'cursor-pointer select-none',
          isFavorited 
            ? 'bg-amber-100 text-amber-500' 
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200',
          isAnimating && 'scale-110',
          'active:scale-95'
        )}
        onClick={handleToggle}
      >
        <Star
          size={sizeConfig.icon}
          className={cn(
            'transition-all duration-300',
            isFavorited && 'fill-amber-400 text-amber-400',
            isAnimating && 'animate-pulse'
          )}
        />
      </View>

      {/* 收藏动画波纹 */}
      {isAnimating && isFavorited && (
        <View 
          className={cn(
            'ripple',
            'absolute inset-0 rounded-full',
            'border-2 border-amber-400',
            'animate-ripple'
          )}
        />
      )}
    </View>
  );
};

/**
 * 收藏按钮组件（文字版）
 */
export interface FavoriteButtonProps {
  /** 游戏ID */
  gameId: string;
  /** 变体样式 */
  variant?: 'default' | 'outline' | 'ghost';
  /** 大小 */
  size?: 'sm' | 'md' | 'lg';
  /** 切换回调 */
  onToggle?: (gameId: string, newState: boolean) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 收藏按钮组件
 */
export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  gameId,
  variant = 'default',
  size = 'md',
  onToggle,
  className
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 订阅收藏变化
  useEffect(() => {
    const unsubscribe = favoriteManager.subscribe((favorites) => {
      setIsFavorited(favorites.includes(gameId));
    });

    return unsubscribe;
  }, [gameId]);

  /**
   * 处理切换
   */
  const handleToggle = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const newState = await favoriteManager.toggleFavorite(gameId);
      setIsFavorited(newState);
      onToggle?.(gameId, newState);
    } finally {
      setIsLoading(false);
    }
  }, [gameId, isLoading, onToggle]);

  /**
   * 获取尺寸配置
   */
  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      case 'md':
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  /**
   * 获取变体样式
   */
  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return isFavorited
          ? 'border-amber-400 text-amber-500 bg-amber-50'
          : 'border-gray-300 text-gray-600 hover:bg-gray-50';
      case 'ghost':
        return isFavorited
          ? 'text-amber-500 hover:bg-amber-50'
          : 'text-gray-600 hover:bg-gray-100';
      case 'default':
      default:
        return isFavorited
          ? 'bg-amber-500 text-white hover:bg-amber-600'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200';
    }
  };

  return (
    <View
      className={cn(
        'favorite-button',
        'inline-flex items-center gap-2 rounded-lg',
        'font-medium transition-all duration-200',
        'cursor-pointer select-none',
        'border-2',
        getSizeConfig(),
        getVariantStyles(),
        isLoading && 'opacity-50 cursor-not-allowed',
        'active:scale-98',
        className
      )}
      onClick={handleToggle}
    >
      <Star
        size={16}
        className={cn(
          'transition-all duration-200',
          isFavorited && 'fill-current'
        )}
      />
      <Text>{isFavorited ? '已收藏' : '收藏'}</Text>
    </View>
  );
};

export default FavoriteStar;
