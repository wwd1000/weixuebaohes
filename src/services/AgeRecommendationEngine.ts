/**
 * 年龄段智能推荐引擎
 * 微学宝盒 - 根据用户行为智能推荐最合适的内容
 */

import type { UserHistory } from '@/types/game';
import { AGE_GROUPS } from '@/types/game';

/**
 * 年龄段推荐引擎类
 * 基于用户历史行为分析，智能推荐最适合的年龄段
 */
export class AgeRecommendationEngine {
  private static instance: AgeRecommendationEngine;

  /**
   * 获取单例实例
   */
  static getInstance(): AgeRecommendationEngine {
    if (!AgeRecommendationEngine.instance) {
      AgeRecommendationEngine.instance = new AgeRecommendationEngine();
    }
    return AgeRecommendationEngine.instance;
  }

  /**
   * 推荐年龄段
   * @param userHistory 用户历史记录
   * @returns 推荐的年龄段 [最小年龄, 最大年龄]
   */
  recommendAge(userHistory?: UserHistory): [number, number] {
    // 无历史记录时返回默认推荐
    if (!userHistory || !userHistory.recentGames || userHistory.recentGames.length === 0) {
      return this.getDefaultAge();
    }

    // 如果用户有首选年龄段，直接返回
    if (userHistory.preferredAge) {
      return userHistory.preferredAge;
    }

    // 分析最近游戏记录，找出最常使用的年龄段
    const recentAges = userHistory.recentGames.map(g => g.ageRange);
    const mostCommon = this.getMostCommonAgeRange(recentAges);

    return mostCommon || this.getDefaultAge();
  }

  /**
   * 获取默认年龄段
   * @returns 默认年龄段 [6, 9]
   */
  getDefaultAge(): [number, number] {
    return [6, 9];
  }

  /**
   * 获取所有年龄段配置
   * @returns 年龄段配置对象
   */
  getAgeGroups(): typeof AGE_GROUPS {
    return AGE_GROUPS;
  }

  /**
   * 获取年龄段标签
   * @param ageRange 年龄段
   * @returns 标签字符串，如 "6-9岁"
   */
  getAgeLabel(ageRange: [number, number]): string {
    const key = `${ageRange[0]}-${ageRange[1]}`;
    return AGE_GROUPS[key]?.label || `${ageRange[0]}-${ageRange[1]}岁`;
  }

  /**
   * 获取年龄段颜色
   * @param ageRange 年龄段
   * @returns 颜色代码
   */
  getAgeColor(ageRange: [number, number]): string {
    const key = `${ageRange[0]}-${ageRange[1]}`;
    return AGE_GROUPS[key]?.color || '#3B82F6';
  }

  /**
   * 解析年龄段字符串
   * @param ageStr 年龄段字符串，如 "6-9"
   * @returns 年龄段数组
   */
  parseAgeRange(ageStr: string): [number, number] | null {
    const match = ageStr.match(/^(\d+)-(\d+)$/);
    if (match) {
      return [parseInt(match[1], 10), parseInt(match[2], 10)];
    }
    
    // 处理 "12+" 格式
    const plusMatch = ageStr.match(/^(\d+)\+$/);
    if (plusMatch) {
      return [parseInt(plusMatch[1], 10), 99];
    }
    
    return null;
  }

  /**
   * 检查年龄段是否匹配
   * @param userAge 用户年龄
   * @param gameAgeRange 游戏年龄段
   * @returns 匹配程度 (0-1)
   */
  getAgeMatchScore(userAge: number, gameAgeRange: [number, number]): number {
    const [minAge, maxAge] = gameAgeRange;
    
    // 完全匹配
    if (userAge >= minAge && userAge <= maxAge) {
      return 1.0;
    }
    
    // 接近匹配（相差1岁）
    if (Math.abs(userAge - minAge) <= 1 || Math.abs(userAge - maxAge) <= 1) {
      return 0.8;
    }
    
    // 相差2岁
    if (Math.abs(userAge - minAge) <= 2 || Math.abs(userAge - maxAge) <= 2) {
      return 0.6;
    }
    
    // 不匹配
    return 0.3;
  }

  /**
   * 获取最常用的年龄段
   * @param ageRanges 年龄段数组
   * @returns 最常见的年龄段
   */
  private getMostCommonAgeRange(ageRanges: [number, number][]): [number, number] | null {
    if (ageRanges.length === 0) {
      return null;
    }

    // 统计各年龄段出现次数
    const counts = new Map<string, { count: number; ageRange: [number, number] }>();

    ageRanges.forEach(ageRange => {
      const key = `${ageRange[0]}-${ageRange[1]}`;
      const existing = counts.get(key);
      
      if (existing) {
        existing.count++;
      } else {
        counts.set(key, { count: 1, ageRange });
      }
    });

    // 找出出现次数最多的年龄段
    const sorted = Array.from(counts.values()).sort((a, b) => b.count - a.count);
    
    return sorted[0]?.ageRange || null;
  }

  /**
   * 记录年龄段选择
   * @param userHistory 用户历史
   * @param ageRange 选择的年龄段
   * @returns 更新后的用户历史
   */
  recordAgeSelection(
    userHistory: UserHistory | undefined,
    ageRange: [number, number]
  ): UserHistory {
    const history: UserHistory = userHistory || { recentGames: [] };
    
    return {
      ...history,
      preferredAge: ageRange,
      recentGames: [
        {
          gameId: 'age-selection',
          ageRange,
          playedAt: Date.now()
        },
        ...history.recentGames.slice(0, 49) // 保留最近50条记录
      ]
    };
  }

  /**
   * 根据孩子年龄推荐游戏
   * @param childAge 孩子实际年龄
   * @returns 推荐的游戏年龄段
   */
  recommendByChildAge(childAge: number): [number, number] {
    if (childAge >= 3 && childAge <= 6) {
      return [3, 6];
    } else if (childAge >= 6 && childAge <= 9) {
      return [6, 9];
    } else if (childAge >= 9 && childAge <= 12) {
      return [9, 12];
    } else if (childAge >= 12) {
      return [12, 99];
    }
    
    // 默认返回3-6岁
    return [3, 6];
  }
}

// 导出单例实例
export const ageRecommendationEngine = AgeRecommendationEngine.getInstance();

export default ageRecommendationEngine;
