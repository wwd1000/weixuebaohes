/**
 * 游戏卡片组件
 * 微学宝盒 - 展示游戏内容的核心卡片组件，支持翻转动画和收藏功能
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Image } from '@tarojs/components';
import { cn } from '@/lib/utils';
import { VerifiedBadge, ParentRating } from './TrustBadge';
import { Star, Clock, Play, Heart } from 'lucide-react';
import type { GameCard as GameCardType } from '@/types/game';
import { ageRecommendationEngine } from '@/services/AgeRecommendationEngine';

/**
 * 游戏卡片组件属性
 */
export interface GameCardProps {
  /** 游戏数据 */
  game: GameCardType;
  /** 翻转回调 */
  onFlip?: (gameId: string) => void;
  /** 收藏回调 */
  onFavorite?: (gameId: string) => void;
  /** 开始游戏回调 */
  onStartGame?: (gameId: string) => void;
  /** 是否已翻转 */
  isFlipped?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 游戏卡片组件
 * 
 * @example
 * ```tsx
 * <GameCard 
 *   game={gameData}
 *   onFlip={(id) => console.log('翻转:', id)}
 *   onFavorite={(id) => console.log('收藏:', id)}
 *   onStartGame={(id) => console.log('开始游戏:', id)}
 * />
 * ```
 */
export const GameCard: React.FC<GameCardProps> = ({
  game,
  onFlip,
  onFavorite,
  onStartGame,
  isFlipped: propIsFlipped,
  className
}) => {
  // 内部翻转状态
  const [isFlipped, setIsFlipped] = useState(propIsFlipped || false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 同步外部翻转状态
  React.useEffect(() => {
    if (propIsFlipped !== undefined) {
      setIsFlipped(propIsFlipped);
    }
  }, [propIsFlipped]);

  /**
   * 处理卡片翻转
   */
  const handleFlip = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    setIsFlipped(prev => !prev);
    onFlip?.(game.id);

    setTimeout(() => setIsAnimating(false), 400);
  }, [isAnimating, onFlip, game.id]);

  /**
   * 处理收藏
   */
  const handleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(game.id);
  }, [onFavorite, game.id]);

  /**
   * 处理开始游戏
   */
  const handleStartGame = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onStartGame?.(game.id);
  }, [onStartGame, game.id]);

  /**
   * 获取年龄段颜色
   */
  const getAgeColor = () => {
    return ageRecommendationEngine.getAgeColor(game.ageRange);
  };

  return (
    <View
      className={cn(
        'game-card',
        'relative w-full max-w-[320px] h-[200px]',
        'cursor-pointer',
        'perspective-1000',
        className
      )}
      onClick={handleFlip}
      data-testid="game-card"
    >
      <View
        className={cn(
          'card-inner',
          'relative w-full h-full',
          'transition-transform duration-400 ease-out',
          'transform-style-preserve-3d',
          isFlipped && 'rotate-y-180'
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* 正面 */}
        <View
          className={cn(
            'card-front',
            'absolute inset-0',
            'bg-white rounded-2xl',
            'shadow-lg overflow-hidden',
            'backface-hidden'
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* 封面图片 */}
          <View className="relative h-[120px] overflow-hidden">
            <Image
              className={cn(
                'w-full h-full object-cover',
                'transition-opacity duration-300',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              src={game.coverUrl}
              mode="aspectFill"
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* 图片加载占位 */}
            {!imageLoaded && (
              <View className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}

            {/* 年龄段标签 */}
            <View 
              className={cn(
                'absolute top-2 left-2',
                'px-2 py-0.5 rounded-full'
              )}
              style={{ backgroundColor: getAgeColor() }}
            >
              <Text className="text-xs font-medium text-white">
                {ageRecommendationEngine.getAgeLabel(game.ageRange)}
              </Text>
            </View>

            {/* 收藏按钮 */}
            <View
              className={cn(
                'absolute top-2 right-2',
                'w-8 h-8 rounded-full',
                'flex items-center justify-center',
                'bg-white/90 shadow-sm',
                'transition-transform duration-200',
                'hover:scale-110 active:scale-95'
              )}
              onClick={handleFavorite}
              data-testid="favorite-button"
            >
              <Heart
                size={16}
                className={cn(
                  'transition-colors duration-200',
                  game.isFavorited 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-400'
                )}
              />
            </View>
          </View>

          {/* 卡片内容 */}
          <View className="p-3">
            {/* 游戏标题 */}
            <Text 
              className="text-base font-semibold text-gray-900 line-clamp-2"
              style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {game.title}
            </Text>

            {/* 信任标识 */}
            <View className="flex flex-wrap items-center gap-2 mt-2">
              <VerifiedBadge 
                level={game.trustBadge.level}
                verifiedAt={game.trustBadge.verifiedAt}
              />
              <ParentRating 
                rating={game.trustScore}
                totalRatings={game.stats.opens}
              />
            </View>
          </View>
        </View>

        {/* 背面 */}
        <View
          className={cn(
            'card-back',
            'absolute inset-0',
            'bg-gray-50 rounded-2xl',
            'shadow-lg p-4',
            'flex flex-col',
            'backface-hidden'
          )}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* 描述 */}
          <View className="flex-1">
            <Text 
              className="text-sm text-gray-600 line-clamp-3"
              style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {game.description}
            </Text>
          </View>

          {/* 元信息 */}
          <View className="mt-3 space-y-2">
            {/* 预计时长 */}
            <View className="flex items-center gap-1.5 text-gray-500">
              <Clock size={14} />
              <Text className="text-xs">
                {game.estimatedDuration}分钟
              </Text>
            </View>

            {/* 技能标签 */}
            <View className="flex flex-wrap gap-1">
              {game.skills.slice(0, 3).map((skill, index) => (
                <View
                  key={index}
                  className={cn(
                    'px-2 py-0.5 rounded-full',
                    'bg-blue-50 text-blue-600'
                  )}
                >
                  <Text className="text-[10px]">{skill}</Text>
                </View>
              ))}
              {game.skills.length > 3 && (
                <View className="px-2 py-0.5 rounded-full bg-gray-100">
                  <Text className="text-[10px] text-gray-500">
                    +{game.skills.length - 3}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* 操作按钮 */}
          <View className="flex items-center gap-2 mt-3">
            {/* 收藏按钮 */}
            <View
              className={cn(
                'w-10 h-10 rounded-xl',
                'flex items-center justify-center',
                'bg-gray-100 transition-all duration-200',
                'hover:bg-gray-200 active:scale-95'
              )}
              onClick={handleFavorite}
            >
              <Star
                size={18}
                className={cn(
                  'transition-colors duration-200',
                  game.isFavorited 
                    ? 'fill-amber-400 text-amber-400' 
                    : 'text-gray-400'
                )}
              />
            </View>

            {/* 开始游戏按钮 */}
            <View
              className={cn(
                'flex-1 h-10 rounded-xl',
                'flex items-center justify-center gap-2',
                'bg-blue-600 text-white',
                'transition-all duration-200',
                'hover:bg-blue-700 active:scale-98'
              )}
              onClick={handleStartGame}
            >
              <Play size={16} className="fill-white" />
              <Text className="text-sm font-medium">开始游戏</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

/**
 * 游戏卡片列表组件属性
 */
export interface GameCardListProps {
  /** 游戏列表 */
  games: GameCardType[];
  /** 翻转回调 */
  onFlip?: (gameId: string) => void;
  /** 收藏回调 */
  onFavorite?: (gameId: string) => void;
  /** 开始游戏回调 */
  onStartGame?: (gameId: string) => void;
  /** 加载更多回调 */
  onLoadMore?: () => void;
  /** 是否加载中 */
  loading?: boolean;
  /** 是否有更多数据 */
  hasMore?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 游戏卡片列表组件
 */
export const GameCardList: React.FC<GameCardListProps> = ({
  games,
  onFlip,
  onFavorite,
  onStartGame,
  onLoadMore,
  loading = false,
  hasMore = false,
  className
}) => {
  return (
    <View className={cn('game-card-list', className)}>
      {/* 卡片网格 */}
      <View className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onFlip={onFlip}
            onFavorite={onFavorite}
            onStartGame={onStartGame}
          />
        ))}
      </View>

      {/* 加载更多 */}
      {hasMore && (
        <View className="mt-6 text-center">
          <View
            className={cn(
              'inline-flex items-center gap-2',
              'px-6 py-2.5 rounded-full',
              'bg-gray-100 text-gray-600',
              'transition-all duration-200',
              'hover:bg-gray-200 active:scale-98',
              loading && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => !loading && onLoadMore?.()}
          >
            {loading ? (
              <>
                <View className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <Text className="text-sm">加载中...</Text>
              </>
            ) : (
              <Text className="text-sm font-medium">加载更多</Text>
            )}
          </View>
        </View>
      )}

      {/* 空状态 */}
      {games.length === 0 && !loading && (
        <View className="py-12 text-center">
          <View className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Star size={24} className="text-gray-400" />
          </View>
          <Text className="text-gray-500">暂无游戏内容</Text>
        </View>
      )}
    </View>
  );
};

export default GameCard;
