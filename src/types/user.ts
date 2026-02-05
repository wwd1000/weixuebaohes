/**
 * 用户相关类型定义
 * 微学宝盒 - 用户数据模型
 */

// 用户偏好设置
export interface UserPreferences {
  ageRange: [number, number];
  strictMode: boolean;
  autoPlay: boolean;
  notifications: boolean;
  language: string;
}

// 默认用户偏好
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  ageRange: [6, 9],
  strictMode: false,
  autoPlay: false,
  notifications: true,
  language: 'zh-CN'
};

// 信任偏好
export interface TrustPreferences {
  minTrustScore: number;
  requireVerified: boolean;
  blockAds: boolean;
  blockTracking: boolean;
}

// 默认信任偏好
export const DEFAULT_TRUST_PREFERENCES: TrustPreferences = {
  minTrustScore: 3.0,
  requireVerified: false,
  blockAds: true,
  blockTracking: true
};

// 用户信息
export interface User {
  id: string;
  nickname?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  createdAt: number;
  lastLoginAt?: number;
}

// 应用状态
export interface AppState {
  user: User | null;
  currentAge: [number, number] | null;
  favorites: string[];
  recentGames: string[];
  trustPreferences: TrustPreferences;
}

// 应用状态动作类型
export type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_AGE'; payload: [number, number] }
  | { type: 'ADD_FAVORITE'; payload: string }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  | { type: 'SET_RECENT'; payload: string[] }
  | { type: 'UPDATE_TRUST_PREFERENCES'; payload: Partial<TrustPreferences> };

// 存储键名
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  FAVORITES: 'user_favorites',
  RECENT_GAMES: 'recent_games',
  FEEDBACK_QUEUE: 'feedback_queue',
  TRUST_PREFERENCES: 'trust_preferences',
  AGE_SELECTION: 'age_selection',
  SESSION_ID: 'session_id',
  USER_TOKEN: 'user_token',
  USER_INFO: 'user_info'
} as const;
