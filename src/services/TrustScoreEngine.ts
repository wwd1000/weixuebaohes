/**
 * 信任度计算引擎
 * 微学宝盒 - 为每个游戏内容提供可信任的质量标识
 */

import type { GameCard, TrustBadge, SecurityStatus } from '@/types/game';

/**
 * 信任度计算引擎类
 * 基于多维度因素计算游戏内容的信任度分数
 */
export class TrustScoreEngine {
  private static instance: TrustScoreEngine;

  /**
   * 获取单例实例
   */
  static getInstance(): TrustScoreEngine {
    if (!TrustScoreEngine.instance) {
      TrustScoreEngine.instance = new TrustScoreEngine();
    }
    return TrustScoreEngine.instance;
  }

  /**
   * 计算游戏信任度分数
   * @param game 游戏卡片数据
   * @returns 信任度分数 (0-1)
   */
  calculateTrustScore(game: GameCard): number {
    const baseScore = this.getBaseScore(game);
    const ageMatch = this.getAgeMatchScore(game);
    const riskLevel = this.getRiskLevelScore(game);
    const freshness = this.getFreshnessScore(game);

    // 综合评分：基础分 * 年龄匹配 * 风险等级 * 新鲜度
    return baseScore * ageMatch * riskLevel * freshness;
  }

  /**
   * 获取基础分数
   * 基于平均游戏时长、点赞率、举报率计算
   * @param game 游戏卡片数据
   * @returns 基础分数 (0-1)
   */
  private getBaseScore(game: GameCard): number {
    const { stats } = game;
    
    // 平均游戏时长分数（假设60分钟为满分）
    const avgPlayTime = stats.avgPlayTime || 0;
    const playTimeScore = Math.min(avgPlayTime / 60, 1);

    // 点赞率（点赞数/打开数）
    const likeRate = stats.opens > 0 
      ? stats.likes / stats.opens 
      : 0;

    // 举报率（举报数/打开数）
    const reportRate = stats.opens > 0 
      ? stats.reports / stats.opens 
      : 0;

    // 综合计算：游戏时长40% + 点赞率40% + (1-举报率)20%
    return playTimeScore * 0.4 + likeRate * 0.4 + (1 - reportRate) * 0.2;
  }

  /**
   * 获取年龄匹配分数
   * @param game 游戏卡片数据
   * @param userAge 用户年龄（可选）
   * @returns 年龄匹配分数 (0-1)
   */
  getAgeMatchScore(game: GameCard, userAge?: number): number {
    // 如果没有用户年龄，返回满分
    if (userAge === undefined) {
      return 1.0;
    }

    const [minAge, maxAge] = game.ageRange;

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
   * 获取风险等级分数
   * @param game 游戏卡片数据
   * @returns 风险等级分数 (0.5-1)
   */
  private getRiskLevelScore(game: GameCard): number {
    const { securityChecks } = game.trustBadge;
    let score = 1.0;

    // 广告影响
    if (securityChecks.hasAds) {
      score *= 0.7;
    }

    // 追踪影响
    if (securityChecks.hasTracking) {
      score *= 0.8;
    }

    // 外部链接影响
    if (securityChecks.hasExternalLinks) {
      score *= 0.9;
    }

    // 内容审核加分
    if (securityChecks.contentModerated) {
      score *= 1.0;
    }

    // 最低0.5分
    return Math.max(score, 0.5);
  }

  /**
   * 获取新鲜度分数
   * @param game 游戏卡片数据
   * @returns 新鲜度分数 (0.7-1)
   */
  private getFreshnessScore(game: GameCard): number {
    const lastUpdated = game.lastPlayed || Date.now();
    const daysSinceUpdate = (Date.now() - lastUpdated) / (1000 * 60 * 60 * 24);

    // 7天内更新：满分
    if (daysSinceUpdate <= 7) {
      return 1.0;
    }

    // 30天内更新：0.9分
    if (daysSinceUpdate <= 30) {
      return 0.9;
    }

    // 90天内更新：0.8分
    if (daysSinceUpdate <= 90) {
      return 0.8;
    }

    // 超过90天：0.7分
    return 0.7;
  }

  /**
   * 计算家长推荐度显示文本
   * @param rating 评分
   * @param totalRatings 总评价数
   * @returns 显示文本
   */
  getParentRatingDisplay(rating: number, totalRatings: number): string {
    // 评价数 >= 156：显示精确分数和数量
    if (totalRatings >= 156) {
      return `${rating.toFixed(1)}分 (${totalRatings}条家长评价)`;
    }

    // 评价数 >= 20：显示分数范围
    if (totalRatings >= 20) {
      return `${(rating - 0.3).toFixed(1)}-${(rating + 0.3).toFixed(1)}分`;
    }

    // 评价数 < 20：显示新内容
    return '新内容';
  }

  /**
   * 获取信任等级
   * @param trustScore 信任度分数
   * @returns 信任等级
   */
  getTrustLevel(trustScore: number): TrustBadge['level'] {
    if (trustScore >= 0.9) {
      return 'hall'; // 殿堂级
    } else if (trustScore >= 0.75) {
      return 'featured'; // 专家推荐
    } else {
      return 'verified'; // 已验证
    }
  }

  /**
   * 获取信任等级配置
   * @param level 信任等级
   * @returns 等级配置
   */
  getTrustLevelConfig(level: TrustBadge['level']) {
    const configs = {
      verified: { 
        color: '#10B981', 
        icon: 'shield-check', 
        text: '已验证',
        description: '内容已通过基础安全审核'
      },
      featured: { 
        color: '#8B5CF6', 
        icon: 'star', 
        text: '专家推荐',
        description: '经过教育专家认可的内容'
      },
      hall: { 
        color: '#F59E0B', 
        icon: 'crown', 
        text: '殿堂级',
        description: '广受家长好评的优质内容'
      }
    };

    return configs[level];
  }

  /**
   * 计算安全状态
   * @param game 游戏卡片数据
   * @returns 安全状态
   */
  calculateSecurityStatus(game: GameCard): SecurityStatus {
    return {
      hasAds: game.trustBadge.securityChecks.hasAds,
      hasTracking: game.trustBadge.securityChecks.hasTracking,
      hasExternalLinks: game.trustBadge.securityChecks.hasExternalLinks,
      contentModerated: game.trustBadge.securityChecks.contentModerated
    };
  }

  /**
   * 检查游戏是否安全
   * @param game 游戏卡片数据
   * @param strictMode 是否严格模式
   * @returns 是否安全
   */
  isGameSafe(game: GameCard, strictMode: boolean = false): boolean {
    const { securityChecks } = game.trustBadge;

    // 基础安全检查
    if (!securityChecks.contentModerated) {
      return false;
    }

    // 严格模式检查
    if (strictMode) {
      if (securityChecks.hasAds || securityChecks.hasTracking) {
        return false;
      }
    }

    return true;
  }

  /**
   * 获取信任度排行榜
   * @param games 游戏列表
   * @param limit 限制数量
   * @returns 排序后的游戏列表
   */
  getTrustRanking(games: GameCard[], limit: number = 10): GameCard[] {
    return games
      .map(game => ({
        game,
        score: this.calculateTrustScore(game)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.game);
  }
}

// 导出单例实例
export const trustScoreEngine = TrustScoreEngine.getInstance();

export default trustScoreEngine;
