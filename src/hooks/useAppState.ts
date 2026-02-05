/**
 * 应用状态管理Hook
 * 微学宝盒 - 全局状态管理
 */

import { useReducer, useCallback, useEffect, useContext, createContext } from 'react';
import { storageManager } from '@/services/StorageManager';
import type { User, UserPreferences, TrustPreferences } from '@/types/user';
import type { AppState, AppAction } from '@/types/user';

// 初始状态
const initialState: AppState = {
  user: null,
  currentAge: storageManager.getAgeSelection(),
  favorites: storageManager.getFavorites(),
  recentGames: storageManager.getRecentGames(),
  trustPreferences: storageManager.getTrustPreferences()
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_AGE':
      storageManager.setAgeSelection(action.payload);
      return { ...state, currentAge: action.payload };
    
    case 'ADD_FAVORITE':
      if (!state.favorites.includes(action.payload)) {
        const newFavorites = [...state.favorites, action.payload];
        storageManager.setFavorites(newFavorites);
        return { ...state, favorites: newFavorites };
      }
      return state;
    
    case 'REMOVE_FAVORITE':
      const filteredFavorites = state.favorites.filter(id => id !== action.payload);
      storageManager.setFavorites(filteredFavorites);
      return { ...state, favorites: filteredFavorites };
    
    case 'SET_RECENT':
      return { ...state, recentGames: action.payload };
    
    case 'UPDATE_TRUST_PREFERENCES':
      const newTrustPrefs = { ...state.trustPreferences, ...action.payload };
      storageManager.setTrustPreferences(newTrustPrefs);
      return { ...state, trustPreferences: newTrustPrefs };
    
    default:
      return state;
  }
}

// Context
const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

/**
 * 应用状态Provider
 */
export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
};

/**
 * 应用状态Hook
 * 
 * @example
 * ```tsx
 * const { state, setUser, setAge } = useAppState();
 * ```
 */
export function useAppState() {
  const context = useContext(AppStateContext);
  
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  const { state, dispatch } = context;

  // Actions
  const setUser = useCallback((user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, [dispatch]);

  const setAge = useCallback((age: [number, number]) => {
    dispatch({ type: 'SET_AGE', payload: age });
  }, [dispatch]);

  const addFavorite = useCallback((gameId: string) => {
    dispatch({ type: 'ADD_FAVORITE', payload: gameId });
  }, [dispatch]);

  const removeFavorite = useCallback((gameId: string) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: gameId });
  }, [dispatch]);

  const setRecent = useCallback((games: string[]) => {
    dispatch({ type: 'SET_RECENT', payload: games });
  }, [dispatch]);

  const updateTrustPreferences = useCallback((prefs: Partial<TrustPreferences>) => {
    dispatch({ type: 'UPDATE_TRUST_PREFERENCES', payload: prefs });
  }, [dispatch]);

  // 添加最近游戏
  const addRecentGame = useCallback((gameId: string) => {
    const updated = [gameId, ...state.recentGames.filter(id => id !== gameId)].slice(0, 20);
    storageManager.addRecentGame(gameId);
    dispatch({ type: 'SET_RECENT', payload: updated });
  }, [state.recentGames, dispatch]);

  return {
    state,
    // 用户
    user: state.user,
    setUser,
    isLoggedIn: !!state.user,
    
    // 年龄段
    currentAge: state.currentAge,
    setAge,
    
    // 收藏
    favorites: state.favorites,
    favoriteCount: state.favorites.length,
    isFavorited: (gameId: string) => state.favorites.includes(gameId),
    addFavorite,
    removeFavorite,
    
    // 最近游戏
    recentGames: state.recentGames,
    addRecentGame,
    setRecent,
    
    // 信任偏好
    trustPreferences: state.trustPreferences,
    updateTrustPreferences
  };
}

export default useAppState;
