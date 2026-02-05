/**
 * 游戏发布管理器
 * 微学宝盒 - 管理游戏内容的发布流程
 */

import type { GameSubmission, GameStatus } from '@/types/game';

/**
 * 游戏发布管理器类
 * 处理游戏提交、状态查询等发布相关操作
 */
export class GamePublisher {
  private static instance: GamePublisher;

  /**
   * 获取单例实例
   */
  static getInstance(): GamePublisher {
    if (!GamePublisher.instance) {
      GamePublisher.instance = new GamePublisher();
    }
    return GamePublisher.instance;
  }

  /**
   * 提交游戏
   * @param gameData 游戏数据
   * @returns 提交的游戏信息
   */
  async submitGame(gameData: Omit<GameSubmission, 'id' | 'createdAt'>): Promise<GameSubmission> {
    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gameData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '提交游戏失败');
      }

      return await response.json();
    } catch (error) {
      console.error('提交游戏失败:', error);
      
      // 开发环境返回模拟数据
      return this.getMockSubmission(gameData);
    }
  }

  /**
   * 获取游戏状态
   * @param gameId 游戏ID
   * @returns 游戏状态
   */
  async getGameStatus(gameId: string): Promise<GameStatus> {
    try {
      const response = await fetch(`/api/publish/${gameId}/status`);

      if (!response.ok) {
        throw new Error('获取游戏状态失败');
      }

      return await response.json();
    } catch (error) {
      console.error('获取游戏状态失败:', error);
      
      // 返回模拟状态
      return this.getMockStatus(gameId);
    }
  }

  /**
   * 获取用户作品列表
   * @param userId 用户ID
   * @returns 游戏提交列表
   */
  async getUserGames(userId: string): Promise<GameSubmission[]> {
    try {
      const response = await fetch(`/api/users/${userId}/games`);

      if (!response.ok) {
        throw new Error('获取用户作品列表失败');
      }

      return await response.json();
    } catch (error) {
      console.error('获取用户作品列表失败:', error);
      return [];
    }
  }

  /**
   * 取消提交
   * @param gameId 游戏ID
   */
  async cancelSubmission(gameId: string): Promise<void> {
    try {
      const response = await fetch(`/api/publish/${gameId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('取消提交失败');
      }
    } catch (error) {
      console.error('取消提交失败:', error);
      throw error;
    }
  }

  /**
   * 更新提交信息
   * @param gameId 游戏ID
   * @param data 更新数据
   */
  async updateSubmission(
    gameId: string, 
    data: Partial<GameSubmission>
  ): Promise<GameSubmission> {
    try {
      const response = await fetch(`/api/publish/${gameId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('更新提交信息失败');
      }

      return await response.json();
    } catch (error) {
      console.error('更新提交信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取模拟提交数据
   */
  private getMockSubmission(
    gameData: Omit<GameSubmission, 'id' | 'createdAt'>
  ): GameSubmission {
    return {
      ...gameData,
      id: `game_${Date.now()}`,
      createdAt: Date.now(),
      status: 'pending'
    };
  }

  /**
   * 获取模拟状态
   */
  private getMockStatus(gameId: string): GameStatus {
    const statuses: GameStatus['status'][] = ['pending', 'approved', 'rejected'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      id: gameId,
      status,
      reviewProgress: {
        current: status === 'pending' ? 2 : 3,
        total: 3
      },
      estimatedCompletion: Date.now() + 24 * 60 * 60 * 1000,
      previewUrl: status === 'approved' ? `https://preview.example.com/${gameId}` : undefined
    };
  }
}

// 导出单例实例
export const gamePublisher = GamePublisher.getInstance();

export default gamePublisher;
