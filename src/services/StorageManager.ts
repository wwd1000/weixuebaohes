/**
 * 存储管理器
 * 微学宝盒 - 管理本地数据存储
 */

import { STORAGE_KEYS, DEFAULT_USER_PREFERENCES, DEFAULT_TRUST_PREFERENCES } from '@/types/user';
import type { UserPreferences, TrustPreferences } from '@/types/user';

/**
 * 存储管理器类
 * 统一管理应用的本地存储操作
 */
export class StorageManager {
  private static instance: StorageManager;

  /**
   * 获取单例实例
   */
  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // ==================== 用户偏好 ====================

  /**
   * 获取用户偏好
   * @returns 用户偏好设置
   */
  getUserPreferences(): UserPreferences {
    try {
      const prefs = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return prefs ? { ...DEFAULT_USER_PREFERENCES, ...JSON.parse(prefs) } : DEFAULT_USER_PREFERENCES;
    } catch {
      return DEFAULT_USER_PREFERENCES;
    }
  }

  /**
   * 保存用户偏好
   * @param preferences 用户偏好设置
   */
  setUserPreferences(preferences: Partial<UserPreferences>): void {
    try {
      const current = this.getUserPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
    } catch (error) {
      console.warn('保存用户偏好失败:', error);
    }
  }

  // ==================== 信任偏好 ====================

  /**
   * 获取信任偏好
   * @returns 信任偏好设置
   */
  getTrustPreferences(): TrustPreferences {
    try {
      const prefs = localStorage.getItem(STORAGE_KEYS.TRUST_PREFERENCES);
      return prefs ? { ...DEFAULT_TRUST_PREFERENCES, ...JSON.parse(prefs) } : DEFAULT_TRUST_PREFERENCES;
    } catch {
      return DEFAULT_TRUST_PREFERENCES;
    }
  }

  /**
   * 保存信任偏好
   * @param preferences 信任偏好设置
   */
  setTrustPreferences(preferences: Partial<TrustPreferences>): void {
    try {
      const current = this.getTrustPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(STORAGE_KEYS.TRUST_PREFERENCES, JSON.stringify(updated));
    } catch (error) {
      console.warn('保存信任偏好失败:', error);
    }
  }

  // ==================== 年龄段选择 ====================

  /**
   * 获取年龄段选择
   * @returns 年龄段
   */
  getAgeSelection(): [number, number] {
    try {
      const age = localStorage.getItem(STORAGE_KEYS.AGE_SELECTION);
      return age ? JSON.parse(age) : [6, 9];
    } catch {
      return [6, 9];
    }
  }

  /**
   * 保存年龄段选择
   * @param age 年龄段
   */
  setAgeSelection(age: [number, number]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AGE_SELECTION, JSON.stringify(age));
    } catch (error) {
      console.warn('保存年龄段选择失败:', error);
    }
  }

  // ==================== 收藏列表 ====================

  /**
   * 获取收藏列表
   * @returns 游戏ID数组
   */
  getFavorites(): string[] {
    try {
      const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return favorites ? JSON.parse(favorites) : [];
    } catch {
      return [];
    }
  }

  /**
   * 保存收藏列表
   * @param favorites 游戏ID数组
   */
  setFavorites(favorites: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (error) {
      console.warn('保存收藏列表失败:', error);
    }
  }

  // ==================== 最近游戏 ====================

  /**
   * 获取最近游戏
   * @returns 游戏ID数组
   */
  getRecentGames(): string[] {
    try {
      const games = localStorage.getItem(STORAGE_KEYS.RECENT_GAMES);
      return games ? JSON.parse(games) : [];
    } catch {
      return [];
    }
  }

  /**
   * 添加最近游戏
   * @param gameId 游戏ID
   */
  addRecentGame(gameId: string): void {
    try {
      const games = this.getRecentGames();
      // 去重并添加到开头
      const updated = [gameId, ...games.filter(id => id !== gameId)].slice(0, 20);
      localStorage.setItem(STORAGE_KEYS.RECENT_GAMES, JSON.stringify(updated));
    } catch (error) {
      console.warn('添加最近游戏失败:', error);
    }
  }

  // ==================== 用户认证 ====================

  /**
   * 获取用户Token
   * @returns Token字符串
   */
  getUserToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    } catch {
      return null;
    }
  }

  /**
   * 保存用户Token
   * @param token Token字符串
   */
  setUserToken(token: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
    } catch (error) {
      console.warn('保存用户Token失败:', error);
    }
  }

  /**
   * 清除用户Token
   */
  clearUserToken(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.warn('清除用户Token失败:', error);
    }
  }

  /**
   * 获取用户信息
   * @returns 用户信息
   */
  getUserInfo(): Record<string, unknown> | null {
    try {
      const info = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      return info ? JSON.parse(info) : null;
    } catch {
      return null;
    }
  }

  /**
   * 保存用户信息
   * @param info 用户信息
   */
  setUserInfo(info: Record<string, unknown>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(info));
    } catch (error) {
      console.warn('保存用户信息失败:', error);
    }
  }

  /**
   * 清除用户信息
   */
  clearUserInfo(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    } catch (error) {
      console.warn('清除用户信息失败:', error);
    }
  }

  // ==================== 会话管理 ====================

  /**
   * 获取会话ID
   * @returns 会话ID
   */
  getSessionId(): string {
    try {
      let sessionId = localStorage.getItem(STORAGE_KEYS.SESSION_ID);
      if (!sessionId) {
        sessionId = this.generateSessionId();
        localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
      }
      return sessionId;
    } catch {
      return this.generateSessionId();
    }
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== 通用方法 ====================

  /**
   * 获取存储项
   * @param key 键名
   * @returns 存储值
   */
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  /**
   * 设置存储项
   * @param key 键名
   * @param value 存储值
   */
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`保存存储项失败 [${key}]:`, error);
    }
  }

  /**
   * 移除存储项
   * @param key 键名
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`移除存储项失败 [${key}]:`, error);
    }
  }

  /**
   * 清空所有存储
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('清空存储失败:', error);
    }
  }
}

// 导出单例实例
export const storageManager = StorageManager.getInstance();

export default storageManager;
