/**
 * 年龄段选择器组件
 * 微学宝盒 - 支持年龄段选择和智能推荐
 */

import React, { useState, useCallback, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import { cn } from '@/lib/utils';
import { ageRecommendationEngine } from '@/services/AgeRecommendationEngine';
import { AGE_GROUPS } from '@/types/game';
import type { UserHistory } from '@/types/game';

/**
 * 年龄段选择器属性
 */
export interface AgeSelectorProps {
  /** 当前选中的年龄段 */
  selectedAge?: [number, number];
  /** 年龄段变化回调 */
  onAgeChange?: (age: [number, number]) => void;
  /** 用户历史记录（用于智能推荐） */
  userHistory?: UserHistory;
  /** 是否显示推荐标签 */
  showRecommendation?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 年龄段选择器组件
 * 
 * @example
 * ```tsx
 * <AgeSelector 
 *   selectedAge={[6, 9]}
 *   onAgeChange={(age) => console.log('选择年龄段:', age)}
 * />
 * ```
 */
export const AgeSelector: React.FC<AgeSelectorProps> = ({
  selectedAge: propSelectedAge,
  onAgeChange,
  userHistory,
  showRecommendation = true,
  className
}) => {
  // 内部状态
  const [selectedAge, setSelectedAge] = useState<[number, number]>(
    propSelectedAge || ageRecommendationEngine.recommendAge(userHistory)
  );

  // 推荐年龄段
  const [recommendedAge, setRecommendedAge] = useState<[number, number] | null>(null);

  // 同步外部属性
  useEffect(() => {
    if (propSelectedAge) {
      setSelectedAge(propSelectedAge);
    }
  }, [propSelectedAge]);

  // 计算推荐年龄段
  useEffect(() => {
    if (showRecommendation && userHistory) {
      const recommended = ageRecommendationEngine.recommendAge(userHistory);
      setRecommendedAge(recommended);
    }
  }, [userHistory, showRecommendation]);

  /**
   * 处理年龄段选择
   */
  const handleAgeSelect = useCallback((ageKey: string) => {
    const ageRange = ageRecommendationEngine.parseAgeRange(ageKey);
    if (ageRange) {
      setSelectedAge(ageRange);
      onAgeChange?.(ageRange);
    }
  }, [onAgeChange]);

  /**
   * 检查是否为推荐年龄段
   */
  const isRecommended = useCallback((ageKey: string): boolean => {
    if (!recommendedAge) return false;
    const key = `${recommendedAge[0]}-${recommendedAge[1]}`;
    return key === ageKey;
  }, [recommendedAge]);

  /**
   * 检查是否选中
   */
  const isSelected = useCallback((ageKey: string): boolean => {
    const key = `${selectedAge[0]}-${selectedAge[1]}`;
    return key === ageKey;
  }, [selectedAge]);

  return (
    <View 
      className={cn(
        'age-selector',
        'flex flex-wrap gap-3',
        className
      )}
    >
      {Object.entries(AGE_GROUPS).map(([key, config]) => {
        const selected = isSelected(key);
        const recommended = isRecommended(key);

        return (
          <View
            key={key}
            className={cn(
              'age-option',
              'relative px-4 py-2 rounded-full cursor-pointer',
              'transition-all duration-200 ease-in-out',
              'border-2',
              selected 
                ? 'border-transparent text-white' 
                : 'border-gray-200 text-gray-700 hover:border-gray-300',
              recommended && !selected && 'ring-2 ring-offset-1'
            )}
            style={{
              backgroundColor: selected ? config.color : 'white',
              borderColor: selected ? config.color : undefined,
              '--ring-color': config.color
            } as React.CSSProperties}
            onClick={() => handleAgeSelect(key)}
          >
            {/* 年龄段标签 */}
            <Text className="text-sm font-medium">
              {config.label}
            </Text>

            {/* 推荐标识 */}
            {recommended && showRecommendation && (
              <View 
                className={cn(
                  'recommend-badge',
                  'absolute -top-1 -right-1',
                  'px-1.5 py-0.5 rounded-full',
                  'text-[10px] font-bold text-white'
                )}
                style={{ backgroundColor: config.color }}
              >
                推荐
              </View>
            )}

            {/* 选中标识 */}
            {selected && (
              <View 
                className={cn(
                  'selected-indicator',
                  'absolute -top-1 -right-1',
                  'w-4 h-4 rounded-full bg-white',
                  'flex items-center justify-center'
                )}
              >
                <Text 
                  className="text-[10px]"
                  style={{ color: config.color }}
                >
                  ✓
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

/**
 * 年龄段 Tab 组件
 * 用于页面顶部的年龄段切换
 */
export interface AgeGroupTabProps {
  /** 当前选中的年龄段 */
  selectedAge?: [number, number];
  /** 年龄段变化回调 */
  onAgeChange?: (age: [number, number]) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 年龄段 Tab 组件
 */
export const AgeGroupTab: React.FC<AgeGroupTabProps> = ({
  selectedAge: propSelectedAge,
  onAgeChange,
  className
}) => {
  const [selectedAge, setSelectedAge] = useState<[number, number]>(
    propSelectedAge || [6, 9]
  );

  useEffect(() => {
    if (propSelectedAge) {
      setSelectedAge(propSelectedAge);
    }
  }, [propSelectedAge]);

  const handleAgeSelect = useCallback((ageKey: string) => {
    const ageRange = ageRecommendationEngine.parseAgeRange(ageKey);
    if (ageRange) {
      setSelectedAge(ageRange);
      onAgeChange?.(ageRange);
    }
  }, [onAgeChange]);

  const isSelected = useCallback((ageKey: string): boolean => {
    const key = `${selectedAge[0]}-${selectedAge[1]}`;
    return key === ageKey;
  }, [selectedAge]);

  return (
    <View 
      className={cn(
        'age-group-tab',
        'flex items-center gap-1 p-1',
        'bg-gray-100 rounded-xl',
        className
      )}
    >
      {Object.entries(AGE_GROUPS).map(([key, config]) => {
        const selected = isSelected(key);

        return (
          <View
            key={key}
            className={cn(
              'tab-item',
              'flex-1 px-3 py-2 rounded-lg cursor-pointer',
              'transition-all duration-200 ease-in-out',
              'text-center',
              selected 
                ? 'bg-white shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            )}
            onClick={() => handleAgeSelect(key)}
          >
            <Text 
              className={cn(
                'text-sm font-medium',
                selected && 'text-gray-900'
              )}
            >
              {config.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default AgeSelector;
