/**
 * 游戏相关类型定义
 * 微学宝盒 - 游戏数据模型
 */

// 信任标识等级
export type TrustLevel = 'verified' | 'featured' | 'hall';

// 安全状态
export interface SecurityStatus {
  hasAds: boolean;
  hasTracking: boolean;
  hasExternalLinks: boolean;
  contentModerated: boolean;
}

// 信任标识
export interface TrustBadge {
  level: TrustLevel;
  verifiedAt?: number;
  parentRating: number;
  totalRatings: number;
  securityCheck: SecurityStatus;
}

// 信任标识显示文本
export const TRUST_BADGE_TEXT: Record<TrustLevel, string> = {
  verified: '已验证',
  featured: '专家推荐',
  hall: '殿堂级'
};

// 游戏统计
export interface GameStats {
  likes: number;
  opens: number;
  reports: number;
  avgPlayTime: number;
}

// 创作者信息
export interface Creator {
  id: string;
  name: string;
  avatar?: string;
}

// 游戏卡片
export interface GameCard {
  id: string;
  title: string;
  coverUrl: string;
  description: string;
  ageRange: [number, number];
  skills: string[];
  trustScore: number;
  trustBadge: TrustBadge;
  estimatedDuration: number;
  creator: Creator;
  stats: GameStats;
  gameUrl: string;
  isFavorited: boolean;
  lastPlayed?: number;
}

// 年龄段配置
export interface AgeGroupConfig {
  label: string;
  color: string;
  default: boolean;
}

// 年龄段配置映射
export const AGE_GROUPS: Record<string, AgeGroupConfig> = {
  '3-6': { label: '3-6岁', color: '#10B981', default: false },
  '6-9': { label: '6-9岁', color: '#3B82F6', default: true },
  '9-12': { label: '9-12岁', color: '#8B5CF6', default: false },
  '12+': { label: '12岁+', color: '#F59E0B', default: false }
};

// 用户历史
export interface UserHistory {
  recentGames: Array<{
    gameId: string;
    ageRange: [number, number];
    playedAt: number;
  }>;
  preferredAge?: [number, number];
}

// 游戏会话
export interface GameSession {
  id: string;
  gameId: string;
  userId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

// 反馈类型
export type FeedbackType = 'positive' | 'neutral' | 'negative';

// 反馈数据
export interface Feedback {
  id?: string;
  gameId: string;
  type: FeedbackType;
  rating?: number;
  reason?: string;
  details?: string;
  timestamp?: number;
  status?: 'pending' | 'synced';
  syncedAt?: number;
}

// 反馈统计
export interface FeedbackStats {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  avgRating: number;
  topReasons: { reason: string; count: number }[];
}

// 分组
export interface Group {
  id: string;
  name: string;
  gameIds: string[];
  createdAt: number;
  icon?: string;
  color?: string;
}

// 默认分组
export const DEFAULT_GROUPS: Group[] = [
  {
    id: 'favorites',
    name: '我的收藏',
    gameIds: [],
    createdAt: Date.now(),
    icon: '⭐',
    color: '#F59E0B'
  },
  {
    id: 'recent',
    name: '最近玩过',
    gameIds: [],
    createdAt: Date.now(),
    icon: '🕒',
    color: '#3B82F6'
  },
  {
    id: 'liked',
    name: '点亮过',
    gameIds: [],
    createdAt: Date.now(),
    icon: '❤️',
    color: '#EF4444'
  }
];

// 游戏提交
export interface GameSubmission {
  id?: string;
  title: string;
  description: string;
  url: string;
  coverImage?: string;
  ageRecommendation: [number, number];
  skills: string[];
  estimatedDuration: number;
  uploadMethod: 'link' | 'file';
  isOriginal: boolean;
  creatorId: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdAt?: number;
}

// 游戏状态
export interface GameStatus {
  id: string;
  status: GameSubmission['status'];
  reviewProgress?: {
    current: number;
    total: number;
  };
  estimatedCompletion?: number;
  rejectionReason?: string;
  previewUrl?: string;
}

// 游戏分析
export interface GameAnalysis {
  title: string;
  description: string;
  estimatedDuration: number;
  ageRecommendation: [number, number];
  skills: string[];
}

// 问题分类
export interface ProblemCategory {
  id: string;
  label: string;
  icon: string;
}

// 问题分类列表
export const PROBLEM_CATEGORIES: ProblemCategory[] = [
  { id: 'inappropriate', label: '内容不当', icon: '🚫' },
  { id: 'not-working', label: '无法运行', icon: '⚠️' },
  { id: 'too-hard', label: '难度太高', icon: '📈' },
  { id: 'too-easy', label: '难度太低', icon: '📉' },
  { id: 'boring', label: '不够有趣', icon: '😴' },
  { id: 'other', label: '其他问题', icon: '❓' }
];
