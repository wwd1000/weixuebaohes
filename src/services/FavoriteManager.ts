/**
 * 收藏管理器
 * 微学宝盒 - 允许用户收藏感兴趣的游戏，提供分组管理功能
 */

import { STORAGE_KEYS } from '@/types/user';
import { DEFAULT_GROUPS, type Group } from '@/types/game';
import type { GameCard } from '@/types/game';

/**
 * 收藏管理器类
 * 管理用户的收藏列表和分组
 */
export class FavoriteManager {
  private static instance: FavoriteManager;
  private readonly STORAGE_KEY = STORAGE_KEYS.FAVORITES;
  private readonly GROUPS_KEY = 'user_groups';
  private listeners: Set<(favorites: string[]) => void> = new Set();

  /**
   * 获取单例实例
   */
  static getInstance(): FavoriteManager {
    if (!FavoriteManager.instance) {
      FavoriteManager.instance = new FavoriteManager();
    }
    return FavoriteManager.instance;
  }

  /**
   * 添加到收藏
   * @param gameId 游戏ID
   */
  async addToFavorites(gameId: string): Promise<void> {
    const favorites = this.getFavorites();

    if (!favorites.includes(gameId)) {
      favorites.push(gameId);
      
      // 保存到本地存储
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.warn('保存收藏到本地存储失败:', error);
      }

      // 触发收藏动画事件
      this.triggerFavoriteAnimation(gameId);

      // 通知监听器
      this.notifyListeners(favorites);

      // 同步到服务器
      await this.syncToServer(favorites);
    }
  }

  /**
   * 从收藏移除
   * @param gameId 游戏ID
   */
  async removeFromFavorites(gameId: string): Promise<void> {
    const favorites = this.getFavorites();
    const updatedFavorites = favorites.filter(id => id !== gameId);

    // 保存到本地存储
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedFavorites));
    } catch (error) {
      console.warn('保存收藏到本地存储失败:', error);
    }

    // 通知监听器
    this.notifyListeners(updatedFavorites);

    // 同步到服务器
    await this.syncToServer(updatedFavorites);
  }

  /**
   * 切换收藏状态
   * @param gameId 游戏ID
   * @returns 新的收藏状态
   */
  async toggleFavorite(gameId: string): Promise<boolean> {
    const isFavorited = this.isFavorited(gameId);
    
    if (isFavorited) {
      await this.removeFromFavorites(gameId);
      return false;
    } else {
      await this.addToFavorites(gameId);
      return true;
    }
  }

  /**
   * 获取收藏列表
   * @returns 游戏ID数组
   */
  getFavorites(): string[] {
    try {
      const favorites = localStorage.getItem(this.STORAGE_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch {
      return [];
    }
  }

  /**
   * 检查是否已收藏
   * @param gameId 游戏ID
   * @returns 是否已收藏
   */
  isFavorited(gameId: string): boolean {
    return this.getFavorites().includes(gameId);
  }

  /**
   * 获取收藏数量
   * @returns 收藏数量
   */
  getFavoriteCount(): number {
    return this.getFavorites().length;
  }

  /**
   * 清空收藏
   */
  async clearFavorites(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('清空收藏失败:', error);
    }

    this.notifyListeners([]);
    await this.syncToServer([]);
  }

  /**
   * 订阅收藏变化
   * @param callback 回调函数
   * @returns 取消订阅函数
   */
  subscribe(callback: (favorites: string[]) => void): () => void {
    this.listeners.add(callback);
    
    // 立即通知当前状态
    callback(this.getFavorites());
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(favorites: string[]): void {
    this.listeners.forEach(callback => {
      try {
        callback(favorites);
      } catch (error) {
        console.warn('通知收藏监听器失败:', error);
      }
    });
  }

  /**
   * 触发收藏动画
   */
  private triggerFavoriteAnimation(gameId: string): void {
    // 触发自定义事件
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('favorite:added', { 
        detail: { gameId } 
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * 同步到服务器
   */
  private async syncToServer(favorites: string[]): Promise<void> {
    try {
      // 模拟API调用
      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ favorites })
      });

      if (!response.ok) {
        throw new Error('同步收藏到服务器失败');
      }
    } catch (error) {
      console.warn('同步收藏到服务器失败:', error);
      // 失败时不抛出错误，因为本地已保存
    }
  }

  // ==================== 分组管理 ====================

  /**
   * 获取用户分组
   * @returns 分组列表
   */
  getGroups(): Group[] {
    try {
      const groups = localStorage.getItem(this.GROUPS_KEY);
      return groups ? JSON.parse(groups) : [...DEFAULT_GROUPS];
    } catch {
      return [...DEFAULT_GROUPS];
    }
  }

  /**
   * 创建分组
   * @param group 分组信息
   * @returns 创建的分组
   */
  async createGroup(group: Omit<Group, 'id' | 'createdAt'>): Promise<Group> {
    const groups = this.getGroups();
    const newGroup: Group = {
      ...group,
      id: `group_${Date.now()}`,
      createdAt: Date.now()
    };

    groups.push(newGroup);

    try {
      localStorage.setItem(this.GROUPS_KEY, JSON.stringify(groups));
    } catch (error) {
      console.warn('保存分组失败:', error);
    }

    return newGroup;
  }

  /**
   * 删除分组
   * @param groupId 分组ID
   */
  async deleteGroup(groupId: string): Promise<void> {
    const groups = this.getGroups();
    const updatedGroups = groups.filter(g => g.id !== groupId);

    try {
      localStorage.setItem(this.GROUPS_KEY, JSON.stringify(updatedGroups));
    } catch (error) {
      console.warn('删除分组失败:', error);
    }
  }

  /**
   * 添加游戏到分组
   * @param groupId 分组ID
   * @param gameId 游戏ID
   */
  async addGameToGroup(groupId: string, gameId: string): Promise<void> {
    const groups = this.getGroups();
    const group = groups.find(g => g.id === groupId);

    if (group && !group.gameIds.includes(gameId)) {
      group.gameIds.push(gameId);

      try {
        localStorage.setItem(this.GROUPS_KEY, JSON.stringify(groups));
      } catch (error) {
        console.warn('添加游戏到分组失败:', error);
      }
    }
  }

  /**
   * 从分组移除游戏
   * @param groupId 分组ID
   * @param gameId 游戏ID
   */
  async removeGameFromGroup(groupId: string, gameId: string): Promise<void> {
    const groups = this.getGroups();
    const group = groups.find(g => g.id === groupId);

    if (group) {
      group.gameIds = group.gameIds.filter(id => id !== gameId);

      try {
        localStorage.setItem(this.GROUPS_KEY, JSON.stringify(groups));
      } catch (error) {
        console.warn('从分组移除游戏失败:', error);
      }
    }
  }

  /**
   * 获取分组中的游戏
   * @param groupId 分组ID
   * @param allGames 所有游戏列表
   * @returns 分组中的游戏列表
   */
  getGamesInGroup(groupId: string, allGames: GameCard[]): GameCard[] {
    const groups = this.getGroups();
    const group = groups.find(g => g.id === groupId);

    if (!group) return [];

    return allGames.filter(game => group.gameIds.includes(game.id));
  }
}

// 导出单例实例
export const favoriteManager = FavoriteManager.getInstance();

export default favoriteManager;
