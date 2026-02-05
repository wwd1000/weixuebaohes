/**
 * 游戏体验容器组件
 * 微学宝盒 - 安全加载第三方游戏内容，提供风险提示和控制功能
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text } from '@tarojs/components';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  X, 
  Maximize2, 
  Minimize2, 
  Flag,
  ChevronLeft,
  AlertTriangle,
  Check,
  Info
} from 'lucide-react';
import type { Feedback } from '@/types/game';

/**
 * 游戏体验组件属性
 */
export interface GameExperienceProps {
  /** 游戏ID */
  gameId: string;
  /** 游戏URL */
  gameUrl: string;
  /** 游戏标题 */
  gameTitle?: string;
  /** 退出回调 */
  onExit?: () => void;
  /** 举报回调 */
  onReport?: (gameId: string, reason: string) => void;
  /** 反馈提交回调 */
  onFeedbackSubmit?: (feedback: Feedback) => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 游戏体验容器组件
 * 
 * @example
 * ```tsx
 * <GameExperience 
 *   gameId="game-123"
 *   gameUrl="https://example.com/game"
 *   gameTitle="数学大冒险"
 *   onExit={() => console.log('退出游戏')}
 * />
 * ```
 */
export const GameExperience: React.FC<GameExperienceProps> = ({
  gameId,
  gameUrl,
  gameTitle,
  onExit,
  onReport,
  onFeedbackSubmit,
  className
}) => {
  // 状态
  const [showRiskAlert, setShowRiskAlert] = useState(false);
  const [hasSeenRisk, setHasSeenRisk] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControlBar, setShowControlBar] = useState(true);
  const [showExitFeedback, setShowExitFeedback] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const controlBarTimerRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /**
   * 检查风险提示历史
   */
  useEffect(() => {
    const checkRiskAlertHistory = () => {
      try {
        const key = `risk_alert_${gameId}`;
        const seen = localStorage.getItem(key);
        const seenTime = seen ? parseInt(seen, 10) : 0;
        const now = Date.now();
        
        // 24小时内不再提示
        if (seenTime && (now - seenTime) < 24 * 60 * 60 * 1000) {
          setHasSeenRisk(true);
        } else {
          setShowRiskAlert(true);
        }
      } catch {
        setShowRiskAlert(true);
      }
    };

    checkRiskAlertHistory();
    setSessionStartTime(Date.now());
  }, [gameId]);

  /**
   * 处理风险提示确认
   */
  const handleRiskConfirm = useCallback((rememberChoice: boolean) => {
    if (rememberChoice) {
      try {
        const key = `risk_alert_${gameId}`;
        localStorage.setItem(key, Date.now().toString());
      } catch (error) {
        console.warn('保存风险提示状态失败:', error);
      }
    }
    
    setShowRiskAlert(false);
    setHasSeenRisk(true);
  }, [gameId]);

  /**
   * 处理退出游戏
   */
  const handleExit = useCallback(() => {
    const duration = Date.now() - sessionStartTime;
    
    // 游戏时长大于30秒才显示反馈
    if (duration > 30000) {
      setShowExitFeedback(true);
    } else {
      onExit?.();
    }
  }, [sessionStartTime, onExit]);

  /**
   * 处理反馈提交
   */
  const handleFeedbackSubmit = useCallback((feedback: Feedback) => {
    onFeedbackSubmit?.(feedback);
    setShowExitFeedback(false);
    onExit?.();
  }, [onFeedbackSubmit, onExit]);

  /**
   * 处理反馈跳过
   */
  const handleFeedbackSkip = useCallback(() => {
    setShowExitFeedback(false);
    onExit?.();
  }, [onExit]);

  /**
   * 处理全屏切换
   */
  const handleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  /**
   * 处理举报
   */
  const handleReport = useCallback(() => {
    onReport?.(gameId, 'user-reported');
  }, [onReport, gameId]);

  /**
   * 显示控制条
   */
  const showControls = useCallback(() => {
    setShowControlBar(true);
    
    if (controlBarTimerRef.current) {
      clearTimeout(controlBarTimerRefRef.current);
    }
    
    controlBarTimerRef.current = setTimeout(() => {
      setShowControlBar(false);
    }, 3000);
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (controlBarTimerRef.current) {
        clearTimeout(controlBarTimerRef.current);
      }
    };
  }, []);

  return (
    <View 
      className={cn(
        'game-experience',
        'relative w-full h-screen bg-black',
        isFullscreen && 'fixed inset-0 z-50',
        className
      )}
    >
      {/* 风险提示弹窗 */}
      {showRiskAlert && (
        <RiskAlert
          gameTitle={gameTitle}
          onConfirm={(remember) => handleRiskConfirm(remember)}
          onCancel={() => onExit?.()}
        />
      )}

      {/* 退出反馈弹窗 */}
      {showExitFeedback && (
        <ExitFeedbackModal
          gameId={gameId}
          playDuration={Date.now() - sessionStartTime}
          onSubmit={handleFeedbackSubmit}
          onSkip={handleFeedbackSkip}
        />
      )}

      {/* 顶部控制条 */}
      {hasSeenRisk && (
        <View
          className={cn(
            'control-bar',
            'absolute top-0 left-0 right-0 z-10',
            'bg-gradient-to-b from-black/70 to-transparent',
            'transition-transform duration-300',
            !showControlBar && '-translate-y-full'
          )}
        >
          <View className="flex items-center justify-between px-4 py-3">
            {/* 左侧：返回按钮和标题 */}
            <View className="flex items-center gap-3">
              <View
                className={cn(
                  'w-9 h-9 rounded-full',
                  'flex items-center justify-center',
                  'bg-white/20 backdrop-blur-sm',
                  'transition-all duration-200',
                  'hover:bg-white/30 active:scale-95'
                )}
                onClick={handleExit}
              >
                <ChevronLeft size={20} className="text-white" />
              </View>
              
              {gameTitle && (
                <Text className="text-white font-medium truncate max-w-[200px]">
                  {gameTitle}
                </Text>
              )}
            </View>

            {/* 右侧：控制按钮 */}
            <View className="flex items-center gap-2">
              {/* 举报按钮 */}
              <View
                className={cn(
                  'w-9 h-9 rounded-full',
                  'flex items-center justify-center',
                  'bg-white/20 backdrop-blur-sm',
                  'transition-all duration-200',
                  'hover:bg-white/30 active:scale-95'
                )}
                onClick={handleReport}
              >
                <Flag size={16} className="text-white" />
              </View>

              {/* 全屏按钮 */}
              <View
                className={cn(
                  'w-9 h-9 rounded-full',
                  'flex items-center justify-center',
                  'bg-white/20 backdrop-blur-sm',
                  'transition-all duration-200',
                  'hover:bg-white/30 active:scale-95'
                )}
                onClick={handleFullscreen}
              >
                {isFullscreen ? (
                  <Minimize2 size={16} className="text-white" />
                ) : (
                  <Maximize2 size={16} className="text-white" />
                )}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 游戏iframe容器 */}
      <View 
        className={cn(
          'game-container',
          'w-full h-full',
          'flex items-center justify-center'
        )}
        onClick={showControls}
      >
        {isLoading && (
          <View className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <View className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </View>
        )}
        
        {hasSeenRisk && (
          <iframe
            ref={iframeRef}
            src={gameUrl}
            sandbox="allow-scripts allow-same-origin allow-popups"
            referrerPolicy="no-referrer"
            loading="lazy"
            className={cn(
              'w-full h-full border-none',
              'transition-opacity duration-300',
              isLoading ? 'opacity-0' : 'opacity-100'
            )}
            style={{
              borderRadius: isFullscreen ? 0 : '12px'
            }}
            onLoad={() => setIsLoading(false)}
          />
        )}
      </View>
    </View>
  );
};

/**
 * 风险提示弹窗组件属性
 */
interface RiskAlertProps {
  gameTitle?: string;
  onConfirm: (rememberChoice: boolean) => void;
  onCancel: () => void;
}

/**
 * 风险提示弹窗组件
 */
const RiskAlert: React.FC<RiskAlertProps> = ({
  gameTitle,
  onConfirm,
  onCancel
}) => {
  const [rememberChoice, setRememberChoice] = useState(false);

  return (
    <View 
      className={cn(
        'risk-alert-overlay',
        'fixed inset-0 z-50',
        'flex items-center justify-center',
        'bg-black/60 backdrop-blur-sm'
      )}
      data-testid="risk-alert"
    >
      <View 
        className={cn(
          'risk-alert',
          'w-full max-w-sm mx-4',
          'bg-white rounded-2xl',
          'shadow-2xl overflow-hidden'
        )}
      >
        {/* 头部 */}
        <View className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
          <View className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
            <Shield size={32} className="text-white" />
          </View>
          <Text className="text-xl font-bold text-white text-center">
            安全提醒
          </Text>
        </View>

        {/* 内容 */}
        <View className="p-6">
          <Text className="text-gray-600 text-center leading-relaxed">
            {gameTitle ? (
              <>
                「{gameTitle}」已通过专业审核，建议家长陪同孩子使用。
              </>
            ) : (
              '本游戏已通过专业审核，建议家长陪同孩子使用。'
            )}
          </Text>

          {/* 安全提示 */}
          <View className="mt-4 p-3 bg-amber-50 rounded-lg">
            <View className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <Text className="text-sm text-amber-700">
                第三方内容可能存在不可控因素，请家长注意监督
              </Text>
            </View>
          </View>

          {/* 记住选择 */}
          <View 
            className="mt-4 flex items-center gap-2 cursor-pointer"
            onClick={() => setRememberChoice(!rememberChoice)}
          >
            <View 
              className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                rememberChoice 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'border-gray-300'
              )}
            >
              {rememberChoice && <Check size={12} className="text-white" />}
            </View>
            <Text className="text-sm text-gray-600">24小时内不再提示</Text>
          </View>

          {/* 按钮 */}
          <View className="mt-6 flex gap-3">
            <View
              className={cn(
                'flex-1 py-3 rounded-xl',
                'bg-gray-100 text-gray-700',
                'text-center font-medium',
                'transition-all duration-200',
                'hover:bg-gray-200 active:scale-98'
              )}
              onClick={onCancel}
            >
              返回
            </View>
            <View
              className={cn(
                'flex-1 py-3 rounded-xl',
                'bg-blue-500 text-white',
                'text-center font-medium',
                'transition-all duration-200',
                'hover:bg-blue-600 active:scale-98'
              )}
              onClick={() => onConfirm(rememberChoice)}
              data-testid="confirm-risk"
            >
              已知晓并开始
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

/**
 * 退出反馈弹窗组件属性
 */
interface ExitFeedbackModalProps {
  gameId: string;
  playDuration: number;
  onSubmit: (feedback: Feedback) => void;
  onSkip: () => void;
}

/**
 * 退出反馈弹窗组件
 */
const ExitFeedbackModal: React.FC<ExitFeedbackModalProps> = ({
  gameId,
  playDuration,
  onSubmit,
  onSkip
}) => {
  const [selectedType, setSelectedType] = useState<Feedback['type'] | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const feedbackOptions = [
    { type: 'positive' as const, icon: '😊', text: '孩子喜欢', color: '#10B981' },
    { type: 'neutral' as const, icon: '😐', text: '一般', color: '#6B7280' },
    { type: 'negative' as const, icon: '😞', text: '有问题', color: '#EF4444' }
  ];

  const handleTypeSelect = (type: Feedback['type']) => {
    setSelectedType(type);
    if (type === 'negative') {
      setShowDetails(true);
    } else {
      onSubmit({
        gameId,
        type,
        timestamp: Date.now()
      });
    }
  };

  return (
    <View 
      className={cn(
        'exit-feedback-overlay',
        'fixed inset-0 z-50',
        'flex items-center justify-center',
        'bg-black/60 backdrop-blur-sm'
      )}
    >
      <View 
        className={cn(
          'exit-feedback-modal',
          'w-full max-w-sm mx-4',
          'bg-white rounded-2xl',
          'shadow-2xl overflow-hidden p-6'
        )}
      >
        {!showDetails ? (
          <>
            <Text className="text-xl font-bold text-gray-900 text-center">
              这次体验如何？
            </Text>
            <Text className="text-sm text-gray-500 text-center mt-1">
              游戏时长: {Math.floor(playDuration / 60000)}分钟
            </Text>

            <View className="mt-6 flex gap-3">
              {feedbackOptions.map((option) => (
                <View
                  key={option.type}
                  className={cn(
                    'flex-1 py-4 rounded-xl border-2 cursor-pointer',
                    'flex flex-col items-center gap-2',
                    'transition-all duration-200',
                    selectedType === option.type
                      ? 'border-current bg-gray-50'
                      : 'border-gray-100 hover:border-gray-200'
                  )}
                  style={{ 
                    borderColor: selectedType === option.type ? option.color : undefined 
                  }}
                  onClick={() => handleTypeSelect(option.type)}
                >
                  <Text className="text-3xl">{option.icon}</Text>
                  <Text 
                    className="text-sm font-medium"
                    style={{ color: option.color }}
                  >
                    {option.text}
                  </Text>
                </View>
              ))}
            </View>

            <View
              className="mt-4 py-2 text-center text-gray-400 text-sm cursor-pointer"
              onClick={onSkip}
            >
              跳过
            </View>
          </>
        ) : (
          <ExitFeedbackDetails
            gameId={gameId}
            onSubmit={onSubmit}
            onBack={() => setShowDetails(false)}
          />
        )}
      </View>
    </View>
  );
};

/**
 * 退出反馈详情组件
 */
interface ExitFeedbackDetailsProps {
  gameId: string;
  onSubmit: (feedback: Feedback) => void;
  onBack: () => void;
}

const ExitFeedbackDetails: React.FC<ExitFeedbackDetailsProps> = ({
  gameId,
  onSubmit,
  onBack
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('');

  const problemCategories = [
    { id: 'inappropriate', label: '内容不当', icon: '🚫' },
    { id: 'not-working', label: '无法运行', icon: '⚠️' },
    { id: 'too-hard', label: '难度太高', icon: '📈' },
    { id: 'too-easy', label: '难度太低', icon: '📉' },
    { id: 'boring', label: '不够有趣', icon: '😴' },
    { id: 'other', label: '其他问题', icon: '❓' }
  ];

  const handleSubmit = () => {
    onSubmit({
      gameId,
      type: 'negative',
      reason: selectedReason,
      timestamp: Date.now()
    });
  };

  return (
    <>
      <View className="flex items-center gap-2 mb-4">
        <View 
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer"
          onClick={onBack}
        >
          <ChevronLeft size={16} className="text-gray-600" />
        </View>
        <Text className="text-lg font-bold text-gray-900">
          遇到了什么问题？
        </Text>
      </View>

      <View className="space-y-2">
        {problemCategories.map((category) => (
          <View
            key={category.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl cursor-pointer',
              'border-2 transition-all duration-200',
              selectedReason === category.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-100 hover:border-gray-200'
            )}
            onClick={() => setSelectedReason(category.id)}
          >
            <Text className="text-xl">{category.icon}</Text>
            <Text className="flex-1 text-gray-700">{category.label}</Text>
            <View 
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                selectedReason === category.id
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300'
              )}
            >
              {selectedReason === category.id && (
                <Check size={12} className="text-white" />
              )}
            </View>
          </View>
        ))}
      </View>

      <View className="mt-4 flex gap-3">
        <View
          className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 text-center font-medium"
          onClick={onBack}
        >
          返回
        </View>
        <View
          className={cn(
            'flex-1 py-3 rounded-xl text-white text-center font-medium',
            selectedReason 
              ? 'bg-blue-500 hover:bg-blue-600' 
              : 'bg-gray-300 cursor-not-allowed'
          )}
          onClick={selectedReason ? handleSubmit : undefined}
        >
          提交反馈
        </View>
      </View>
    </>
  );
};

export default GameExperience;
