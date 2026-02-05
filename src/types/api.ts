/**
 * API 相关类型定义
 * 微学宝盒 - 接口数据模型
 */

import type { GameCard, TrustBadge, Feedback, FeedbackStats, Group, GameSubmission, GameStatus, GameSession } from './game';
import type { User, UserPreferences } from './user';

// API 响应包装
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// API 错误
export interface ApiError {
  code: number;
  message: string;
  details?: Record<string, string[]>;
}

// 分页请求
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 分页响应
export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 年龄段选择 API
export interface AgeSelectionAPI {
  getRecommendedAge(userId: string): Promise<[number, number]>;
  recordAgeSelection(userId: string, age: [number, number]): Promise<void>;
}

// 信任度相关 API
export interface TrustAPI {
  getGameTrustScore(gameId: string): Promise<TrustBadge>;
  submitParentRating(gameId: string, rating: number, comment?: string): Promise<void>;
  getTrustRanking(ageGroup: string, limit: number): Promise<GameCard[]>;
}

// 游戏体验相关 API
export interface GameExperienceAPI {
  startGameSession(gameId: string): Promise<GameSession>;
  endGameSession(sessionId: string, duration: number, feedback?: Feedback): Promise<void>;
  reportGame(gameId: string, reason: string, details?: string): Promise<void>;
  getRiskAlertHistory(userId: string): Promise<Record<string, boolean>>;
}

// 收藏相关 API
export interface FavoriteAPI {
  getUserFavorites(userId: string): Promise<string[]>;
  addToFavorites(userId: string, gameId: string): Promise<void>;
  removeFromFavorites(userId: string, gameId: string): Promise<void>;
  createGroup(userId: string, group: Omit<Group, 'id' | 'createdAt'>): Promise<Group>;
  getUserGroups(userId: string): Promise<Group[]>;
}

// 反馈相关 API
export interface FeedbackAPI {
  submitFeedback(feedback: Feedback): Promise<void>;
  submitFeedbackBatch(feedbacks: Feedback[]): Promise<void>;
  getFeedbackStats(gameId: string): Promise<FeedbackStats>;
  getUserFeedbackHistory(userId: string): Promise<Feedback[]>;
}

// 发布相关 API
export interface PublishAPI {
  submitGame(gameData: GameSubmission): Promise<GameSubmission>;
  getGameStatus(gameId: string): Promise<GameStatus>;
  getUserGames(userId: string): Promise<GameSubmission[]>;
  crawlGameInfo(url: string): Promise<Partial<GameSubmission>>;
}

// 用户相关 API
export interface UserAPI {
  login(code: string): Promise<{ token: string; user: User }>;
  getUserInfo(userId: string): Promise<User>;
  updateUserInfo(userId: string, data: Partial<User>): Promise<User>;
  getUserPreferences(userId: string): Promise<UserPreferences>;
  updateUserPreferences(userId: string, preferences: UserPreferences): Promise<void>;
}

// 游戏列表 API
export interface GameListAPI {
  getGames(params: {
    ageRange?: [number, number];
    category?: string;
    sortBy?: 'trust' | 'recent' | 'popular';
  } & PaginationParams): Promise<PaginationResponse<GameCard>>;
  
  getGameDetail(gameId: string): Promise<GameCard>;
  
  searchGames(keyword: string, params: PaginationParams): Promise<PaginationResponse<GameCard>>;
  
  getRecommendedGames(userId: string, limit: number): Promise<GameCard[]>;
}

// 监控相关 API
export interface MonitoringAPI {
  reportError(data: {
    message: string;
    stack?: string;
    context?: Record<string, unknown>;
    timestamp: number;
    userAgent: unknown;
    url?: string;
  }): Promise<void>;
  
  reportPerformance(data: {
    metric: string;
    value: number;
    context?: Record<string, unknown>;
    timestamp: number;
  }): Promise<void>;
  
  trackEvent(data: {
    event: string;
    properties?: Record<string, unknown>;
    timestamp: number;
    sessionId: string;
  }): Promise<void>;
}

// API 端点配置
export const API_ENDPOINTS = {
  // 游戏相关
  GAMES: '/api/games',
  GAME_DETAIL: (id: string) => `/api/games/${id}`,
  GAME_TRUST: (id: string) => `/api/games/${id}/trust`,
  GAME_FEEDBACK: (id: string) => `/api/games/${id}/feedback`,
  GAME_SESSION: '/api/sessions',
  
  // 用户相关
  USERS: '/api/users',
  USER_FAVORITES: (id: string) => `/api/users/${id}/favorites`,
  USER_GROUPS: (id: string) => `/api/users/${id}/groups`,
  USER_PREFERENCES: (id: string) => `/api/users/${id}/preferences`,
  USER_HISTORY: (id: string) => `/api/users/${id}/history`,
  
  // 认证相关
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REFRESH: '/api/auth/refresh',
  
  // 发布相关
  PUBLISH: '/api/publish',
  PUBLISH_STATUS: (id: string) => `/api/publish/${id}/status`,
  AI_CRAWL: '/api/ai/crawl-game',
  
  // 监控相关
  MONITORING_ERRORS: '/api/monitoring/errors',
  MONITORING_PERFORMANCE: '/api/monitoring/performance',
  MONITORING_ANALYTICS: '/api/monitoring/analytics'
} as const;
