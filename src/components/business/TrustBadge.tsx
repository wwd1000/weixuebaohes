/**
 * 信任标识组件
 * 微学宝盒 - 为每个游戏内容提供可信任的质量标识
 */

import React, { useState, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import { cn } from '@/lib/utils';
import { trustScoreEngine } from '@/services/TrustScoreEngine';
import { Shield, Star, Crown, Info } from 'lucide-react';
import type { TrustBadge as TrustBadgeType } from '@/types/game';

/**
 * 验证徽章组件属性
 */
export interface VerifiedBadgeProps {
  /** 信任等级 */
  level: TrustBadgeType['level'];
  /** 验证时间 */
  verifiedAt?: number;
  /** 点击回调 */
  onClick?: () => void;
  /** 是否显示详情 */
  showDetails?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 验证徽章组件
 * 显示游戏的信任等级标识
 */
export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  level,
  verifiedAt,
  onClick,
  showDetails = false,
  className
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const config = trustScoreEngine.getTrustLevelConfig(level);

  /**
   * 处理点击事件
   */
  const handleClick = useCallback(() => {
    if (showDetails) {
      setShowTooltip(prev => !prev);
    }
    onClick?.();
  }, [onClick, showDetails]);

  /**
   * 获取图标组件
   */
  const getIcon = () => {
    const iconProps = {
      size: 14,
      className: 'text-white'
    };

    switch (level) {
      case 'hall':
        return <Crown {...iconProps} />;
      case 'featured':
        return <Star {...iconProps} />;
      case 'verified':
      default:
        return <Shield {...iconProps} />;
    }
  };

  return (
    <View className={cn('relative', className)}>
      <View
        className={cn(
          'verified-badge',
          'inline-flex items-center gap-1.5',
          'px-2.5 py-1 rounded-full',
          'cursor-pointer transition-all duration-200',
          'hover:opacity-90 hover:scale-105'
        )}
        style={{ backgroundColor: config.color }}
        onClick={handleClick}
      >
        {/* 图标 */}
        {getIcon()}

        {/* 文字 */}
        <Text className="text-xs font-medium text-white">
          {config.text}
        </Text>

        {/* 详情图标 */}
        {showDetails && (
          <Info size={12} className="text-white/70 ml-0.5" />
        )}
      </View>

      {/* 详情提示 */}
      {showTooltip && showDetails && (
        <View 
          className={cn(
            'trust-tooltip',
            'absolute z-50 top-full left-0 mt-2',
            'w-48 p-3 rounded-lg',
            'bg-white shadow-lg border border-gray-100'
          )}
        >
          <Text className="text-sm font-medium text-gray-900">
            {config.text}
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            {config.description}
          </Text>
          {verifiedAt && (
            <Text className="text-xs text-gray-400 mt-2">
              验证于 {new Date(verifiedAt).toLocaleDateString('zh-CN')}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

/**
 * 家长推荐度组件属性
 */
export interface ParentRatingProps {
  /** 评分 */
  rating: number;
  /** 总评价数 */
  totalRatings: number;
  /** 是否显示详情 */
  showDetails?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 家长推荐度组件
 * 显示家长对游戏的评价分数
 */
export const ParentRating: React.FC<ParentRatingProps> = ({
  rating,
  totalRatings,
  showDetails = true,
  className
}) => {
  /**
   * 获取显示文本
   */
  const getDisplayText = (): string => {
    return trustScoreEngine.getParentRatingDisplay(rating, totalRatings);
  };

  /**
   * 获取星级显示
   */
  const getStarCount = (): number => {
    return Math.round(rating);
  };

  return (
    <View 
      className={cn(
        'parent-rating',
        'inline-flex items-center gap-1.5',
        'px-2.5 py-1 rounded-full',
        'bg-amber-50 border border-amber-100',
        className
      )}
    >
      {/* 星级图标 */}
      <View className="flex items-center">
        {Array.from({ length: 5 }).map((_, index) => (
          <Text 
            key={index}
            className={cn(
              'text-xs',
              index < getStarCount() ? 'text-amber-400' : 'text-gray-300'
            )}
          >
            ★
          </Text>
        ))}
      </View>

      {/* 评分文本 */}
      {showDetails && (
        <Text className="text-xs text-amber-700 font-medium">
          {getDisplayText()}
        </Text>
      )}
    </View>
  );
};

/**
 * 安全状态标识组件属性
 */
export interface SecurityStatusProps {
  /** 是否有广告 */
  hasAds: boolean;
  /** 是否有追踪 */
  hasTracking: boolean;
  /** 是否有外部链接 */
  hasExternalLinks: boolean;
  /** 是否已内容审核 */
  contentModerated: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 安全状态标识组件
 * 显示游戏的安全检查状态
 */
export const SecurityStatusBadge: React.FC<SecurityStatusProps> = ({
  hasAds,
  hasTracking,
  hasExternalLinks,
  contentModerated,
  className
}) => {
  const [expanded, setExpanded] = useState(false);

  /**
   * 计算安全分数
   */
  const getSafetyScore = (): number => {
    let score = 100;
    if (hasAds) score -= 20;
    if (hasTracking) score -= 15;
    if (hasExternalLinks) score -= 10;
    if (!contentModerated) score -= 30;
    return Math.max(score, 0);
  };

  /**
   * 获取安全等级
   */
  const getSafetyLevel = (): { text: string; color: string } => {
    const score = getSafetyScore();
    if (score >= 90) return { text: '非常安全', color: '#10B981' };
    if (score >= 70) return { text: '安全', color: '#3B82F6' };
    if (score >= 50) return { text: '一般', color: '#F59E0B' };
    return { text: '需谨慎', color: '#EF4444' };
  };

  const safetyLevel = getSafetyLevel();

  return (
    <View className={cn('security-status', className)}>
      {/* 安全等级标签 */}
      <View
        className={cn(
          'safety-badge',
          'inline-flex items-center gap-1.5',
          'px-2.5 py-1 rounded-full cursor-pointer',
          'transition-all duration-200'
        )}
        style={{ 
          backgroundColor: `${safetyLevel.color}15`,
          borderColor: `${safetyLevel.color}30`
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Shield 
          size={14} 
          style={{ color: safetyLevel.color }} 
        />
        <Text 
          className="text-xs font-medium"
          style={{ color: safetyLevel.color }}
        >
          {safetyLevel.text}
        </Text>
      </View>

      {/* 详细安全信息 */}
      {expanded && (
        <View 
          className={cn(
            'security-details',
            'mt-2 p-3 rounded-lg',
            'bg-gray-50 border border-gray-100'
          )}
        >
          <Text className="text-sm font-medium text-gray-900 mb-2">
            安全检查详情
          </Text>
          
          <View className="space-y-2">
            <SecurityCheckItem 
              label="内容审核" 
              passed={contentModerated}
              description="已通过专业内容审核"
            />
            <SecurityCheckItem 
              label="广告检测" 
              passed={!hasAds}
              description={hasAds ? '包含广告内容' : '无广告'}
            />
            <SecurityCheckItem 
              label="隐私追踪" 
              passed={!hasTracking}
              description={hasTracking ? '可能收集用户数据' : '无追踪行为'}
            />
            <SecurityCheckItem 
              label="外部链接" 
              passed={!hasExternalLinks}
              description={hasExternalLinks ? '包含外部链接' : '无外部链接'}
            />
          </View>
        </View>
      )}
    </View>
  );
};

/**
 * 安全检查项组件
 */
interface SecurityCheckItemProps {
  label: string;
  passed: boolean;
  description: string;
}

const SecurityCheckItem: React.FC<SecurityCheckItemProps> = ({
  label,
  passed,
  description
}) => (
  <View className="flex items-center justify-between">
    <View className="flex items-center gap-2">
      <Text 
        className={cn(
          'w-5 h-5 rounded-full flex items-center justify-center text-xs',
          passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
        )}
      >
        {passed ? '✓' : '✗'}
      </Text>
      <Text className="text-sm text-gray-700">{label}</Text>
    </View>
    <Text className="text-xs text-gray-500">{description}</Text>
  </View>
);

/**
 * 信任标识组合组件属性
 */
export interface TrustBadgeGroupProps {
  /** 信任徽章数据 */
  trustBadge: TrustBadgeType;
  /** 信任分数 */
  trustScore: number;
  /** 是否显示安全状态 */
  showSecurity?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 信任标识组合组件
 * 组合显示所有信任相关标识
 */
export const TrustBadgeGroup: React.FC<TrustBadgeGroupProps> = ({
  trustBadge,
  trustScore,
  showSecurity = false,
  className
}) => {
  return (
    <View 
      className={cn(
        'trust-badge-group',
        'flex flex-wrap items-center gap-2',
        className
      )}
    >
      {/* 验证徽章 */}
      <VerifiedBadge 
        level={trustBadge.level}
        verifiedAt={trustBadge.verifiedAt}
        showDetails
      />

      {/* 家长推荐度 */}
      <ParentRating 
        rating={trustScore}
        totalRatings={trustBadge.totalRatings}
      />

      {/* 安全状态 */}
      {showSecurity && (
        <SecurityStatusBadge 
          hasAds={trustBadge.securityCheck.hasAds}
          hasTracking={trustBadge.securityCheck.hasTracking}
          hasExternalLinks={trustBadge.securityCheck.hasExternalLinks}
          contentModerated={trustBadge.securityCheck.contentModerated}
        />
      )}
    </View>
  );
};

export default VerifiedBadge;
