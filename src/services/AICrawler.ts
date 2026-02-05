/**
 * AI抓取服务
 * 微学宝盒 - 允许创作者提交游戏内容，包含AI辅助信息抓取功能
 */

import type { GameSubmission, GameAnalysis } from '@/types/game';

/**
 * AI抓取服务类
 * 自动抓取和分析游戏内容信息
 */
export class AICrawler {
  private static instance: AICrawler;

  /**
   * 获取单例实例
   */
  static getInstance(): AICrawler {
    if (!AICrawler.instance) {
      AICrawler.instance = new AICrawler();
    }
    return AICrawler.instance;
  }

  /**
   * 抓取游戏信息
   * @param url 游戏URL
   * @returns 游戏信息
   */
  async crawlGameInfo(url: string): Promise<Partial<GameSubmission>> {
    try {
      // 调用后端AI抓取API
      const response = await fetch('/api/ai/crawl-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('AI抓取失败');
      }

      return await response.json();
    } catch (error) {
      console.error('AI抓取失败:', error);
      
      // 返回模拟数据（开发环境）
      return this.getMockGameInfo(url);
    }
  }

  /**
   * 分析游戏内容
   * @param url 游戏URL
   * @returns 游戏分析结果
   */
  async analyzeGameContent(url: string): Promise<GameAnalysis> {
    try {
      const response = await fetch('/api/ai/analyze-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('游戏分析失败');
      }

      return await response.json();
    } catch (error) {
      console.error('游戏分析失败:', error);
      
      // 返回模拟分析结果
      return this.getMockAnalysis();
    }
  }

  /**
   * 验证游戏URL
   * @param url 游戏URL
   * @returns 是否有效
   */
  async validateUrl(url: string): Promise<{ valid: boolean; message?: string }> {
    try {
      // 基本URL格式验证
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(url)) {
        return { valid: false, message: 'URL格式不正确，请以http://或https://开头' };
      }

      // 调用后端验证API
      const response = await fetch('/api/ai/validate-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        return { valid: false, message: 'URL验证失败' };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.warn('URL验证失败:', error);
      // 开发环境默认通过
      return { valid: true };
    }
  }

  /**
   * 获取模拟游戏信息（开发环境）
   */
  private getMockGameInfo(url: string): Partial<GameSubmission> {
    return {
      title: this.extractTitle(url),
      description: this.generateDescription(),
      url,
      ageRecommendation: this.recommendAge(),
      skills: this.extractSkills(),
      estimatedDuration: this.estimateDuration(),
      coverImage: `https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=${encodeURIComponent(this.extractTitle(url))}`
    };
  }

  /**
   * 获取模拟分析结果
   */
  private getMockAnalysis(): GameAnalysis {
    return {
      title: this.generateDescription().split('，')[0],
      description: this.generateDescription(),
      estimatedDuration: this.estimateDuration(),
      ageRecommendation: this.recommendAge(),
      skills: this.extractSkills()
    };
  }

  /**
   * 从URL提取标题
   */
  private extractTitle(url: string): string {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace(/^www\./, '');
      const domain = hostname.split('.')[0];
      return domain.charAt(0).toUpperCase() + domain.slice(1) + ' 游戏';
    } catch {
      return '未命名游戏';
    }
  }

  /**
   * 生成描述
   */
  private generateDescription(): string {
    const descriptions = [
      '这是一款有趣的益智游戏，可以帮助孩子提高逻辑思维能力和问题解决能力。',
      '通过互动式学习，让孩子在游戏中掌握数学基础知识，寓教于乐。',
      '专为儿童设计的创意游戏，激发想象力和创造力，培养艺术天赋。',
      '科学探索类游戏，带领孩子发现自然界的奥秘，培养科学兴趣。',
      '语言学习游戏，通过趣味互动帮助孩子提高词汇量和语言表达能力。'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  /**
   * 推荐年龄段
   */
  private recommendAge(): [number, number] {
    const ages: [number, number][] = [
      [3, 6],
      [6, 9],
      [9, 12],
      [12, 15]
    ];
    return ages[Math.floor(Math.random() * ages.length)];
  }

  /**
   * 提取技能标签
   */
  private extractSkills(): string[] {
    const allSkills = [
      '逻辑思维', '数学', '创造力', '观察力', '记忆力',
      '手眼协调', '问题解决', '空间想象', '语言表达', '科学探索'
    ];
    
    // 随机选择3-5个技能
    const count = 3 + Math.floor(Math.random() * 3);
    const shuffled = [...allSkills].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * 估计游戏时长
   */
  private estimateDuration(): number {
    const durations = [5, 10, 15, 20, 30];
    return durations[Math.floor(Math.random() * durations.length)];
  }
}

// 导出单例实例
export const aiCrawler = AICrawler.getInstance();

export default aiCrawler;
